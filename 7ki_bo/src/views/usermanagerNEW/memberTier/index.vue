<template>
  <div class="member-tier-management p-4">
    <!-- Page Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800">会员层级管理</h1>
      <p class="text-gray-600 mt-1">管理会员层级配置和晋级规则</p>
    </div>

    <!-- Tier Type Tabs -->
    <n-card class="mb-4">
      <n-tabs 
        v-model:value="activeTab" 
        type="line" 
        animated
        @update:value="handleTabChange"
      >
        <n-tab name="auto_upgrade" tab="自动晋级">
        </n-tab>
        <n-tab name="fixed_tier" tab="固定等级">
        </n-tab>
      </n-tabs>
    </n-card>

    <!-- Filters and Search -->
    <n-card class="mb-4">
      <div class="flex flex-wrap gap-4 items-center">
        <div class="flex-1 min-w-64">
          <n-input
            v-model:value="searchKeyword"
            placeholder="搜索等级名称、代码或描述..."
            clearable
            @input="handleSearch"
          />
        </div>
        
        <n-select
          v-model:value="statusFilter"
          placeholder="状态筛选"
          clearable
          style="width: 120px"
          :options="statusOptions"
          @update:value="handleFilter"
        />
        
        <n-select
          v-model:value="sortBy"
          placeholder="排序方式"
          style="width: 150px"
          :options="sortOptions"
          @update:value="handleSort"
        />
        
        <n-button @click="handleResetFilters">
          重置筛选
        </n-button>
      </div>
    </n-card>

    <!-- 🚀 NEW: SmartDataGrid Component -->
    <SmartDataGrid
      :data="tableData"
      :columns="columns"
      :loading="loading"
      :pagination="paginationReactive"
      :scroll-x="1400"
      :height="600"
      size="small"
      row-key="id"
      @update:page="handlePageChange"
      @update:page-size="handlePageSizeChange"
      @refresh="handleRefresh"
      @row-click="handleRowClick"
    >
      <template #actionBar>
        <n-card :bordered="false" class="rounded-16px shadow-sm">
          <div class="flex justify-between items-center">
            <div class="flex items-center gap-4">
              <!-- 主要操作按钮 -->
              <div class="flex gap-2">
                <n-button type="primary" @click="handleCreateTier">
                  新增等级
                </n-button>
                <n-button type="info" @click="handleRefreshStatistics">
                  刷新统计
                </n-button>
              </div>
              
              <!-- 当前标签页信息 -->
              <div class="text-sm text-gray-600">
                {{ activeTab === 'auto_upgrade' ? '自动晋级' : '固定等级' }} - 共 {{ paginationReactive.total }} 条记录
              </div>
            </div>
            
            <div class="flex gap-2">
              <!-- 刷新按钮 -->
              <n-button size="small" @click="handleRefresh">刷新数据</n-button>
            </div>
          </div>
        </n-card>
      </template>
    </SmartDataGrid>

    <!-- Create/Edit Modal -->
    <n-modal
      v-model:show="showModal"
      preset="card"
      :title="modalTitle"
      style="width: 900px; max-height: 80vh"
      :mask-closable="false"
    >
      <n-scrollbar style="max-height: 60vh">
        <n-form
          ref="formRef"
          :model="formData"
          :rules="formRules"
          label-placement="left"
          label-width="120px"
          class="pr-4"
        >
          <!-- Basic Information -->
          <n-divider title-placement="left">基本信息</n-divider>
          
          <n-form-item label="等级类型" path="tierType">
            <n-select
              v-model:value="formData.tierType"
              :options="tierTypeOptions"
              :disabled="isEditing"
              placeholder="选择等级类型"
            />
          </n-form-item>
          
          <n-form-item label="等级名称" path="tierName">
            <n-input
              v-model:value="formData.tierName"
              placeholder="输入等级名称"
            />
          </n-form-item>
          
          <n-form-item label="等级代码" path="tierCode">
            <n-input
              v-model:value="formData.tierCode"
              placeholder="输入等级代码（如：VIP1）"
              :disabled="isEditing"
            />
          </n-form-item>
          
          <n-form-item label="描述" path="description">
            <n-input
              v-model:value="formData.description"
              type="textarea"
              placeholder="输入等级描述"
              :rows="2"
            />
          </n-form-item>
          
          <n-form-item label="关键标签" path="keyTags">
            <n-dynamic-tags
              v-model:value="formData.keyTags"
              placeholder="添加标签"
            />
          </n-form-item>
          
          <n-form-item label="排序顺序" path="sortOrder">
            <n-input-number
              v-model:value="formData.sortOrder"
              placeholder="排序顺序"
              :min="0"
              style="width: 150px"
            />
          </n-form-item>

          <!-- Auto Upgrade Criteria (only for auto_upgrade type) -->
          <template v-if="formData.tierType === 'auto_upgrade'">
            <n-divider title-placement="left">晋级条件</n-divider>
            
            <n-form-item label="最低充值金额" path="minDepositAmount">
              <n-input-number
                v-model:value="formData.minDepositAmount"
                placeholder="最低充值金额"
                :min="0"
                :precision="2"
                style="width: 200px"
              >
                <template #suffix>BRL</template>
              </n-input-number>
            </n-form-item>
            
            <n-form-item label="最低投注金额" path="minBetAmount">
              <n-input-number
                v-model:value="formData.minBetAmount"
                placeholder="最低投注金额"
                :min="0"
                :precision="2"
                style="width: 200px"
              >
                <template #suffix>BRL</template>
              </n-input-number>
            </n-form-item>
            
            <n-form-item label="最低有效投注" path="minValidBetAmount">
              <n-input-number
                v-model:value="formData.minValidBetAmount"
                placeholder="最低有效投注"
                :min="0"
                :precision="2"
                style="width: 200px"
              >
                <template #suffix>BRL</template>
              </n-input-number>
            </n-form-item>
            
            <n-form-item label="评估周期" path="evaluationPeriodDays">
              <n-input-number
                v-model:value="formData.evaluationPeriodDays"
                placeholder="评估周期天数"
                :min="1"
                style="width: 150px"
              >
                <template #suffix>天</template>
              </n-input-number>
            </n-form-item>
          </template>

          <!-- Benefits -->
          <n-divider title-placement="left">等级权益</n-divider>
          
          <div class="grid grid-cols-2 gap-4">
            <n-form-item label="充值奖励比例" path="depositBonusRate">
              <n-input-number
                v-model:value="formData.depositBonusRate"
                placeholder="充值奖励比例"
                :min="0"
                :max="1"
                :precision="4"
                :step="0.0001"
                style="width: 150px"
              >
                <template #suffix>%</template>
              </n-input-number>
            </n-form-item>
            
            <n-form-item label="返水比例" path="rebateRate">
              <n-input-number
                v-model:value="formData.rebateRate"
                placeholder="返水比例"
                :min="0"
                :max="1"
                :precision="4"
                :step="0.0001"
                style="width: 150px"
              >
                <template #suffix>%</template>
              </n-input-number>
            </n-form-item>
            
            <n-form-item label="提现限额" path="withdrawLimit">
              <n-input-number
                v-model:value="formData.withdrawLimit"
                placeholder="提现限额"
                :min="0"
                :precision="2"
                style="width: 150px"
              >
                <template #suffix>BRL</template>
              </n-input-number>
            </n-form-item>
            
            <n-form-item label="日提现限额" path="dailyWithdrawLimit">
              <n-input-number
                v-model:value="formData.dailyWithdrawLimit"
                placeholder="日提现限额"
                :min="0"
                :precision="2"
                style="width: 150px"
              >
                <template #suffix>BRL</template>
              </n-input-number>
            </n-form-item>
            
            <n-form-item label="生日奖金" path="birthdayBonus">
              <n-input-number
                v-model:value="formData.birthdayBonus"
                placeholder="生日奖金"
                :min="0"
                :precision="2"
                style="width: 150px"
              >
                <template #suffix>BRL</template>
              </n-input-number>
            </n-form-item>
            
            <n-form-item label="月度奖金" path="monthlyBonus">
              <n-input-number
                v-model:value="formData.monthlyBonus"
                placeholder="月度奖金"
                :min="0"
                :precision="2"
                style="width: 150px"
              >
                <template #suffix>BRL</template>
              </n-input-number>
            </n-form-item>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <n-form-item label="优先客服" path="prioritySupport">
              <n-switch v-model:value="formData.prioritySupport" />
            </n-form-item>
            
            <n-form-item label="专属活动" path="exclusivePromotions">
              <n-switch v-model:value="formData.exclusivePromotions" />
            </n-form-item>
          </div>

          <!-- Status and Appearance -->
          <n-divider title-placement="left">状态设置</n-divider>
          
          <div class="grid grid-cols-2 gap-4">
            <n-form-item label="启用状态" path="isActive">
              <n-switch v-model:value="formData.isActive" />
            </n-form-item>
            
            <n-form-item label="默认等级" path="isDefault">
              <n-switch v-model:value="formData.isDefault" />
            </n-form-item>
            
            <n-form-item label="背景色" path="backgroundColor">
              <n-color-picker v-model:value="formData.backgroundColor" />
            </n-form-item>
            
            <n-form-item label="文字色" path="textColor">
              <n-color-picker v-model:value="formData.textColor" />
            </n-form-item>
          </div>
        </n-form>
      </n-scrollbar>
      
      <template #footer>
        <div class="flex justify-end gap-2">
          <n-button @click="handleCancel">取消</n-button>
          <n-button type="primary" :loading="submitting" @click="handleSubmit">
            {{ isEditing ? '更新' : '创建' }}
          </n-button>
        </div>
      </template>
    </n-modal>

    <!-- Member List Modal -->
    <n-modal
      v-model:show="showMemberModal"
      preset="card"
      title="等级会员列表"
      style="width: 1000px; height: 80vh"
      :mask-closable="false"
    >
      <TierMemberList
        v-if="showMemberModal"
        :tier-id="selectedTierId"
        :tier-name="selectedTierName"
      />
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, h, defineAsyncComponent } from 'vue';
// ✅ PERFORMANCE FIX: Lazy load components to avoid blocking page load
const SmartDataGrid = defineAsyncComponent(() => import('../../../components/smart/SmartDataGrid/index.vue'));
import { 
  NButton, 
  NCard, 
  NTabs, 
  NTab, 
  NInput, 
  NSelect, 
  NModal,
  NForm,
  NFormItem,
  NDivider,
  NInputNumber,
  NDynamicTags,
  NSwitch,
  NColorPicker,
  NScrollbar,
  NTag,
  NSpace,
  NPopconfirm,
  useMessage,
  type DataTableColumns
} from 'naive-ui';

import {
  getMemberTiersApi,
  createMemberTierApi,
  updateMemberTierApi,
  deleteMemberTierApi,
  updateAllTierStatisticsApi,
  type MemberTier,
  type MemberTierListParams,
  type CreateMemberTierParams
} from '#/api/core/memberTier';
const TierMemberList = defineAsyncComponent(() => import('./components/TierMemberList.vue'));

// ===================================
// REACTIVE DATA
// ===================================

const message = useMessage();

// Table and pagination (simplified for SmartDataGrid)
const loading = ref(false);
const tableData = ref<MemberTier[]>([]);
const paginationReactive = reactive({
  page: 1,
  pageSize: 20,
  total: 0,
});

// Filters and search
const activeTab = ref<'auto_upgrade' | 'fixed_tier'>('auto_upgrade');
const searchKeyword = ref('');
const statusFilter = ref<boolean | null>(null);
const sortBy = ref('id');

// Modal states
const showModal = ref(false);
const showMemberModal = ref(false);
const selectedTierId = ref<number>(0);
const selectedTierName = ref('');

// Form
const formRef = ref();
const submitting = ref(false);
const isEditing = ref(false);
const editingId = ref<number | null>(null);

const formData = reactive<CreateMemberTierParams>({
  tierType: 'auto_upgrade',
  tierName: '',
  tierCode: '',
  description: '',
  keyTags: [],
  sortOrder: 0,
  
  // Upgrade criteria
  minDepositAmount: undefined,
  minBetAmount: undefined,
  minValidBetAmount: undefined,
  minCommissionAmount: undefined,
  evaluationPeriodDays: undefined,
  
  // Benefits
  depositBonusRate: 0,
  rebateRate: 0,
  withdrawLimit: 0,
  dailyWithdrawLimit: 0,
  monthlyWithdrawLimit: 0,
  birthdayBonus: 0,
  monthlyBonus: 0,
  prioritySupport: false,
  exclusivePromotions: false,
  
  // Status
  isActive: true,
  isDefault: false,
  backgroundColor: '#f0f0f0',
  textColor: '#333333'
});

// ===================================
// COMPUTED PROPERTIES
// ===================================

const modalTitle = computed(() => isEditing.value ? '编辑会员层级' : '新增会员层级');

// Options
const tierTypeOptions = [
  { label: '自动晋级', value: 'auto_upgrade' },
  { label: '固定等级', value: 'fixed_tier' }
];

const statusOptions = [
  { label: '启用', value: true },
  { label: '禁用', value: false }
] as const;

const sortOptions = [
  { label: '排序顺序', value: 'sortOrder' },
  { label: '等级名称', value: 'tierName' },
  { label: '当前人数', value: 'currentMemberCount' },
  { label: '晋级次数', value: 'totalUpgradeCount' },
  { label: '创建时间', value: 'createdAt' }
];

// Form validation rules
const formRules = {
  tierType: {
    required: true,
    message: '请选择等级类型',
    trigger: 'blur'
  },
  tierName: {
    required: true,
    message: '请输入等级名称',
    trigger: 'blur'
  },
  tierCode: {
    required: true,
    message: '请输入等级代码',
    trigger: 'blur'
  }
};

// Table columns
const columns: DataTableColumns<MemberTier> = [
  {
    title: 'ID',
    key: 'id',
    width: 60,
    align: 'center'
  },
  {
    title: '层级类型',
    key: 'tierType',
    width: 100,
    render: (row) => {
      const isAuto = row.tierType === 'auto_upgrade';
      return h(NTag, {
        type: isAuto ? 'success' : 'info',
        size: 'small'
      }, {
        default: () => isAuto ? '自动晋级' : '固定等级'
      });
    }
  },
  {
    title: '层级名称',
    key: 'tierName',
    width: 120,
    render: (row) => {
      return h('div', {
        style: {
          padding: '4px 8px',
          borderRadius: '4px',
          backgroundColor: row.backgroundColor || '#f0f0f0',
          color: row.textColor || '#333333',
          fontWeight: 'bold',
          textAlign: 'center'
        }
      }, row.tierName);
    }
  },
  {
    title: '描述',
    key: 'description',
    width: 100,
    ellipsis: {
      tooltip: true
    }
  },
  {
    title: '关键标签',
    key: 'keyTags',
    width: 80,
    render: (row) => {
      const tags = row.keyTags || [];
      if (tags.length === 0) {
        return h('span', { class: 'text-gray-400' }, '-');
      }
      return h(NSpace, { size: 'small' }, {
        default: () => tags.map(tag => 
          h(NTag, { size: 'small', type: 'info' }, { default: () => tag })
        )
      });
    }
  },
  {
    title: '晋级次数',
    key: 'totalUpgradeCount',
    width: 100,
    align: 'center',
    render: (row) => {
      const count = row.totalUpgradeCount || 0;
      return h('span', { class: 'font-semibold text-green-600' }, count.toLocaleString());
    }
  },
  {
    title: '最低充值要求',
    key: 'minDepositAmount',
    width: 120,
    align: 'right',
    render: (row) => {
      const amount = row.minDepositAmount || 0;
      return h('span', { class: 'font-mono text-blue-600' }, `R$ ${amount.toFixed(2)}`);
    }
  },
  {
    title: '层级人数',
    key: 'currentMemberCount',
    width: 100,
    align: 'center',
    render: (row) => {
      const count = row.currentMemberCount || 0;
      return h(NButton, {
        text: true,
        type: 'primary',
        size: 'small',
        onClick: () => handleViewMembers(row.id, row.tierName)
      }, {
        default: () => h('span', { class: 'font-semibold' }, `${count.toLocaleString()} 人`)
      });
    }
  },
  {
    title: '状态',
    key: 'isActive',
    width: 80,
    align: 'center',
    render: (row) => {
      return h(NTag, {
        type: row.isActive ? 'success' : 'error',
        size: 'small'
      }, {
        default: () => row.isActive ? '启用' : '禁用'
      });
    }
  },
  {
    title: '操作',
    key: 'actions',
    width: 120,
    align: 'center',
    fixed: 'right',
    render: (row) => {
      return h(NSpace, { size: 'small' }, {
        default: () => [
          h(NButton, {
            size: 'small',
            type: 'primary',
            onClick: () => handleEdit(row)
          }, {
            default: () => '编辑'
          }),
          h(NPopconfirm, {
            onPositiveClick: () => handleDelete(row.id)
          }, {
            trigger: () => h(NButton, {
              size: 'small',
              type: 'error'
            }, {
              default: () => '删除'
            }),
            default: () => '确定删除这个等级吗？删除后无法恢复！'
          })
        ]
      });
    }
  }
];


// ===================================
// METHODS
// ===================================

const loadData = async () => {
  loading.value = true;
  try {
    const params: MemberTierListParams = {
      page: paginationReactive.page,
      pageSize: paginationReactive.pageSize,
      tierType: activeTab.value,
      isActive: statusFilter.value ?? undefined,
      search: searchKeyword.value || undefined,
      sortBy: sortBy.value,
      sortOrder: 'asc'
    };

    const response = await getMemberTiersApi(params);
    
    tableData.value = response.list;
    paginationReactive.total = response.pagination.total;
  } catch (error) {
    message.error('获取数据失败');
    console.error('Error loading data:', error);
  } finally {
    loading.value = false;
  }
};

const handleTabChange = (value: string) => {
  activeTab.value = value as 'auto_upgrade' | 'fixed_tier';
  paginationReactive.page = 1;
  loadData();
};

const handleSearch = () => {
  paginationReactive.page = 1;
  loadData();
};

const handleFilter = () => {
  paginationReactive.page = 1;
  loadData();
};

const handleSort = () => {
  paginationReactive.page = 1;
  loadData();
};

const handleResetFilters = () => {
  searchKeyword.value = '';
  statusFilter.value = null;
  sortBy.value = 'id';
  paginationReactive.page = 1;
  loadData();
};

// SmartDataGrid event handlers
const handlePageChange = (page: number) => {
  paginationReactive.page = page;
  loadData();
};

const handlePageSizeChange = (pageSize: number) => {
  paginationReactive.pageSize = pageSize;
  paginationReactive.page = 1;
  loadData();
};

const handleRefresh = () => {
  loadData();
};

const handleRowClick = (tier: MemberTier) => {
  console.log('Member tier row clicked:', tier);
  // Optional: Auto-open edit modal on row click
  // handleEdit(tier);
};

// Note: handlePageChange and handlePageSizeChange moved to SmartDataGrid handlers above

const handleCreateTier = () => {
  isEditing.value = false;
  editingId.value = null;
  resetForm();
  formData.tierType = activeTab.value;
  showModal.value = true;
};

const handleEdit = (tier: MemberTier) => {
  isEditing.value = true;
  editingId.value = tier.id;
  
  // Fill form with tier data
  Object.assign(formData, {
    tierType: tier.tierType,
    tierName: tier.tierName,
    tierCode: tier.tierCode,
    description: tier.description,
    keyTags: [...tier.keyTags],
    sortOrder: tier.sortOrder,
    
    minDepositAmount: tier.minDepositAmount,
    minBetAmount: tier.minBetAmount,
    minValidBetAmount: tier.minValidBetAmount,
    minCommissionAmount: tier.minCommissionAmount,
    evaluationPeriodDays: tier.evaluationPeriodDays,
    
    depositBonusRate: tier.depositBonusRate,
    rebateRate: tier.rebateRate,
    withdrawLimit: tier.withdrawLimit,
    dailyWithdrawLimit: tier.dailyWithdrawLimit,
    monthlyWithdrawLimit: tier.monthlyWithdrawLimit,
    birthdayBonus: tier.birthdayBonus,
    monthlyBonus: tier.monthlyBonus,
    prioritySupport: tier.prioritySupport,
    exclusivePromotions: tier.exclusivePromotions,
    
    isActive: tier.isActive,
    isDefault: tier.isDefault,
    backgroundColor: tier.backgroundColor,
    textColor: tier.textColor,
    iconUrl: tier.iconUrl
  });
  
  showModal.value = true;
};

const handleDelete = async (id: number) => {
  try {
    await deleteMemberTierApi(id);
    message.success('删除成功');
    loadData();
  } catch (error) {
    message.error('删除失败');
    console.error('Error deleting tier:', error);
  }
};

const handleViewMembers = (tierId: number, tierName: string) => {
  selectedTierId.value = tierId;
  selectedTierName.value = tierName;
  showMemberModal.value = true;
};

const handleRefreshStatistics = async () => {
  try {
    await updateAllTierStatisticsApi();
    message.success('统计数据已刷新');
    loadData();
  } catch (error) {
    message.error('刷新统计失败');
    console.error('Error refreshing statistics:', error);
  }
};

const handleSubmit = async () => {
  try {
    await formRef.value?.validate();
    submitting.value = true;

    if (isEditing.value && editingId.value) {
      await updateMemberTierApi(editingId.value, formData);
      message.success('更新成功');
    } else {
      await createMemberTierApi(formData);
      message.success('创建成功');
    }

    showModal.value = false;
    loadData();
  } catch (error) {
    if (error?.message) {
      message.error(error.message);
    } else {
      message.error(isEditing.value ? '更新失败' : '创建失败');
    }
    console.error('Error submitting form:', error);
  } finally {
    submitting.value = false;
  }
};

const handleCancel = () => {
  showModal.value = false;
  resetForm();
};

const resetForm = () => {
  Object.assign(formData, {
    tierType: 'auto_upgrade',
    tierName: '',
    tierCode: '',
    description: '',
    keyTags: [],
    sortOrder: 0,
    
    minDepositAmount: undefined,
    minBetAmount: undefined,
    minValidBetAmount: undefined,
    minCommissionAmount: undefined,
    evaluationPeriodDays: undefined,
    
    depositBonusRate: 0,
    rebateRate: 0,
    withdrawLimit: 0,
    dailyWithdrawLimit: 0,
    monthlyWithdrawLimit: 0,
    birthdayBonus: 0,
    monthlyBonus: 0,
    prioritySupport: false,
    exclusivePromotions: false,
    
    isActive: true,
    isDefault: false,
    backgroundColor: '#f0f0f0',
    textColor: '#333333',
    iconUrl: undefined
  });
  
  formRef.value?.restoreValidation();
};

// ===================================
// LIFECYCLE
// ===================================

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.member-tier-management {
  background: #f5f5f5;
  min-height: 100vh;
}

:deep(.n-data-table-th) {
  background: #fafafa;
  font-weight: 600;
}

:deep(.n-data-table-td) {
  border-bottom: 1px solid #f0f0f0;
}

:deep(.n-data-table-tr:hover .n-data-table-td) {
  background: #f8f9fa;
}

:deep(.n-tabs .n-tab) {
  padding: 12px 20px;
}

:deep(.n-card) {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

:deep(.n-form-item-label) {
  font-weight: 500;
}

:deep(.n-divider .n-divider__title) {
  font-weight: 600;
  color: #1f2937;
}
</style> 