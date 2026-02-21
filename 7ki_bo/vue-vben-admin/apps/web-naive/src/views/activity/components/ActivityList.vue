<template>
  <div class="activity-list">
    <!-- 筛选和操作栏 -->
    <n-card class="mb-4">
      <n-form
        ref="filterFormRef"
        inline
        :model="filterForm"
        label-placement="left"
        label-width="auto"
        class="mb-4"
      >
        <n-form-item label="活动名称">
          <n-input
            v-model:value="filterForm.keyword"
            placeholder="请输入活动名称"
            clearable
            @keyup.enter="handleSearch"
          />
        </n-form-item>
        
        <n-form-item label="活动分类">
          <n-select
            v-model:value="filterForm.category"
            placeholder="请选择活动分类"
            :options="categoryOptions"
            clearable
          />
        </n-form-item>
        
        <n-form-item label="活动状态">
          <n-select
            v-model:value="filterForm.status"
            placeholder="请选择活动状态"
            :options="statusOptions"
            clearable
          />
        </n-form-item>
        
        <n-form-item label="币种">
          <n-select
            v-model:value="filterForm.currencyScope"
            placeholder="请选择币种"
            :options="currencyOptions"
            clearable
          />
        </n-form-item>
        
        <n-form-item label="操作人">
          <n-input
            v-model:value="filterForm.lastModifiedBy"
            placeholder="请输入操作人"
            clearable
          />
        </n-form-item>
        
        <n-form-item>
          <n-space>
            <n-button type="primary" @click="handleSearch">
              搜索
            </n-button>
            <n-button @click="handleReset">
              重置
            </n-button>
          </n-space>
        </n-form-item>
      </n-form>
      
    </n-card>

    <!-- 🚀 NEW: SmartDataGrid Component for Activities -->
    <SmartDataGrid
      :data="tableData"
      :columns="columns"
      :loading="loading"
      :pagination="paginationReactive"
      selectable
      :selected-keys="checkedRowKeys"
      row-key="id"
      @update:selected-keys="checkedRowKeys = $event"
      @update:page="handlePageChange"
      @update:page-size="handlePageSizeChange"
      @refresh="handleRefresh"
      @row-click="handleRowClick"
    >
      <template #actionBar="{ selectedCount, selectedRows }">
        <n-card :bordered="false" class="rounded-16px shadow-sm">
          <div class="flex justify-between items-center">
            <div class="flex items-center gap-4">
              <!-- 主要操作按钮 -->
              <div class="flex gap-2">
                <n-button type="primary" @click="handleCreate">
                  新增活动
                </n-button>
              </div>
              
              <!-- 选择信息 -->
              <div class="text-sm text-gray-600">
                已选择 {{ selectedCount }} 条数据，共 {{ paginationReactive.total }} 条
              </div>
            </div>
            
            <div class="flex gap-2">
              <!-- 批量操作 -->
              <n-button 
                v-if="selectedCount > 0" 
                type="error" 
                size="small"
                @click="handleBatchDelete(selectedRows)"
              >
                批量删除 ({{ selectedCount }})
              </n-button>
              
              <!-- 选择控制 -->
              <n-button size="small" @click="clearSelection">清空选择</n-button>
              <n-button size="small" @click="selectAll">全选</n-button>
            </div>
          </div>
        </n-card>
      </template>
    </SmartDataGrid>

    <!-- 新增/编辑活动弹窗 -->
    <ActivityFormModal
      v-model:show="showFormModal"
      :editing-item="editingItem"
      @success="handleFormSuccess"
    />

    <!-- 活动详情弹窗 -->
    <ActivityDetailModal
      v-model:show="showDetailModal"
      :activity="detailActivity"
    />

    <!-- 活动记录弹窗 -->
    <ActivityRecordModal
      v-model:show="showRecordModal"
      :activity-id="recordActivityId"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, h, defineAsyncComponent } from 'vue';
// ✅ PERFORMANCE FIX: Lazy load components to avoid blocking page load
const SmartDataGrid = defineAsyncComponent(() => import('../../../components/smart/SmartDataGrid/index.vue'));
import type { DataTableColumns, FormInst } from 'naive-ui';
import {
  NCard,
  NForm,
  NFormItem,
  NInput,
  NSelect,
  NButton,
  NSpace,
  NTag,
  NText,
  NTooltip,
  NPopconfirm,
  NProgress,
  NInputNumber,
  useMessage,
  useDialog,
} from 'naive-ui';

import { 
  getActivityList,
  deleteActivity,
  bulkDeleteActivities,
  batchUpdateDisplayOrder,
  updateActivityStatus,
  type Activity,
  type ActivityListParams,
  ACTIVITY_STATUS_OPTIONS,
  ACTIVITY_CATEGORIES,
  ACTIVITY_TYPES,
  CURRENCY_OPTIONS,
} from '#/api/activity';
// ✅ PERFORMANCE FIX: Lazy load modal components - they only load when modals are opened
const ActivityFormModal = defineAsyncComponent(() => import('./ActivityFormModal.vue'));
const ActivityDetailModal = defineAsyncComponent(() => import('./ActivityDetailModal.vue'));
const ActivityRecordModal = defineAsyncComponent(() => import('./ActivityRecordModal.vue'));

const message = useMessage();
const dialog = useDialog();

// 响应式数据
const loading = ref(false);
const showFormModal = ref(false);
const showDetailModal = ref(false);
const showRecordModal = ref(false);
const editingItem = ref<Activity | null>(null);
const detailActivity = ref<Activity | null>(null);
const recordActivityId = ref<number>(0);
const checkedRowKeys = ref<(string | number)[]>([]);
const tableData = ref<Activity[]>([]);
const tableRef = ref();
const filterFormRef = ref<FormInst>();

// 筛选表单
const filterForm = reactive<ActivityListParams>({
  keyword: '',
  category: '',
  status: '',
  currency: '',
  memberScope: '',
  platforms: '',
});

// Pagination (simplified for SmartDataGrid)
const paginationReactive = reactive({
  page: 1,
  pageSize: 20,
  total: 0,
});

// 选项配置
const statusOptions = ACTIVITY_STATUS_OPTIONS.map(item => ({
  label: item.label,
  value: item.value,
}));

const categoryOptions = ACTIVITY_CATEGORIES.map(item => ({
  label: item.label,
  value: item.value,
}));

const currencyOptions = CURRENCY_OPTIONS.map(item => ({
  label: item.label,
  value: item.value,
}));

// 表格列配置
const columns = computed<DataTableColumns<Activity>>(() => [
  {
    type: 'selection',
    width: 50,
  },
  {
    title: '排序',
    key: 'displayOrder',
    width: 120,
    sorter: true,
    render: (row) => {
      return h(NInputNumber, {
        value: row.displayOrder,
        min: 0,
        size: 'small',
        style: { width: '100px' },
        onUpdateValue: (value: number | null) => {
          if (value !== null) {
            handleDisplayOrderChange(row, value);
          }
        },
      });
    },
  },
  {
    title: 'ID',
    key: 'id',
    width: 80,
  },
  {
    title: '活动名称',
    key: 'title',
    width: 200,
    ellipsis: {
      tooltip: true,
    },
  },
  {
    title: '活动分类',
    key: 'category',
    width: 120,
    render: (row) => {
      // Map English values to Chinese labels
      const categoryMap: { [key: string]: string } = {
        'comprehensive': '综合',
        'chess_cards': '棋牌',
        'hunting': '捕鱼',
        'slot': '电子',
        'live': '真人',
        'sports': '体育',
        'cockfight': '斗鸡',
        'lottery': '彩票',
        'video': '视频',
        'esports': '电竞',
        'table': '桌面',
        'arcade': '街机',
        'simulation': '模拟',
        'other': '其他',
        'recharge': '充值',
        'betting': '打码',
        'signin': '签到',
        'invite': '邀请',
        'newuser': '新人礼金',
        'redpacket': '红包',
        'custom': '自定义'
      };
      const chineseLabel = categoryMap[row.category] || row.category || '未分类';
      return h(NTag, { type: 'info', size: 'small' }, { default: () => chineseLabel });
    },
  },
  {
    title: '活动类型',
    key: 'type',
    width: 140,
    render: (row) => {
      // Map English values to Chinese labels
      const typeMap: { [key: string]: string } = {
        'recharge': '充值',
        'wagering': '打码',
        'rescue': '救援金',
        'checkin': '签到',
        'luckyspin': '幸运转盘',
        'luckywager': '幸运注单',
        'redpacket': '红包',
        'investment': '投资',
        'promotion': '推广',
        'agent': '代理',
        'collect': '集字',
        'guessing': '竞猜',
        'newbie': '新人彩金',
        'referral': '推荐奖励',
        'soft': '软一刀',
        'new': '新一刀',
        'ranking': '相行榜',
        'custom': '自定义'
      };
      const chineseLabel = typeMap[row.type] || row.type || '未知类型';
      return h(NTag, { type: 'default', size: 'small' }, { default: () => chineseLabel });
    },
  },
  {
    title: '参与会员',
    key: 'memberScope',
    width: 120,
    render: (row) => {
      // ✅ Map member scope values to Chinese labels
      const memberScopeMap: Record<string, string> = {
        'all': '全部会员',
        'five_yuan': '五元玩家',
        'ten_yuan': '十元玩家',
        'thirty_yuan': '三十元玩家',
        'fifty_yuan': '五十元玩家',
        'hundred_yuan': '一百元玩家',
        'three_hundred': '三百元玩家',
        'three_thousand': '三千元玩家',
        'five_thousand': '五千元玩家',
        'ten_thousand': '十万元玩家',
        'hundred_thousand': '百万土豪',
        'default': '默认等级',
        'user': '备用等级',
        'suspicion': '可疑玩家',
        'high_win': '高胜率',
        'test_user': '测试专用',
        'manual_add': '手动出款',
        '全部会员': '全部会员', // Already in Chinese
        'VIP会员': 'VIP会员',
        '新用户': '新用户',
        '老用户': '老用户',
      };
      
      const memberScope = row.memberScope;
      
      // Handle empty/null/undefined
      if (!memberScope) {
        return '全部会员';
      }
      
      // Handle string values
      if (typeof memberScope === 'string') {
        // Check if it's already in Chinese
        if (memberScopeMap[memberScope]) {
          return memberScopeMap[memberScope];
        }
        
        // Handle comma-separated values (multiple tags)
        if (memberScope.includes(',')) {
          const tags = memberScope.split(',').map(tag => tag.trim());
          const translatedTags = tags.map(tag => memberScopeMap[tag] || tag);
          return translatedTags.join(', ');
        }
        
        // Return as-is if not found in map
        return memberScope;
      }
      
      // Handle arrays
      if (Array.isArray(memberScope)) {
        if (memberScope.length === 0) {
          return '全部会员';
        }
        const translatedTags = memberScope.map(tag => memberScopeMap[tag] || tag);
        return translatedTags.join(', ');
      }
      
      // Fallback
      return '全部会员';
    },
  },

  {
    title: '活动时间',
    key: 'startsAt',
    width: 200,
    render: (row) => {
      try {
        // Handle both Date objects and strings
        const startsAt = row.startsAt instanceof Date ? row.startsAt : (row.startsAt ? new Date(row.startsAt) : null);
        const endsAt = row.endsAt instanceof Date ? row.endsAt : (row.endsAt ? new Date(row.endsAt) : null);
        
        if (!startsAt || !endsAt || isNaN(startsAt.getTime()) || isNaN(endsAt.getTime())) {
          return '未设置时间';
        }
        
        return h(
          'div',
          {},
          [
            h('div', {}, `开始：${startsAt.toLocaleString('zh-CN')}`),
            h('div', {}, `结束：${endsAt.toLocaleString('zh-CN')}`),
          ]
        );
      } catch (error) {
        return '时间格式错误';
      }
    },
  },

  {
    title: '状态',
    key: 'status',
    width: 100,
    render: (row) => {
      const statusConfig = {
        draft: { type: 'warning', text: '草稿' },
        active: { type: 'success', text: '进行中' },
        paused: { type: 'error', text: '已暂停' },
        archived: { type: 'default', text: '已归档' },
      };
      const config = statusConfig[row.status as keyof typeof statusConfig] || { type: 'default', text: '未知状态' };
      return h(NTag, { type: config.type as any, size: 'small' }, { default: () => config.text });
    },
  },

  {
    title: '操作人',
    key: 'createdBy',
    width: 120,
    ellipsis: {
      tooltip: true,
    },
    render: (row) => row.createdBy || '系统',
  },
  {
    title: '更新时间',
    key: 'updatedAt',
    width: 160,
    render: (row) => {
      try {
        if (row.updatedAt && typeof row.updatedAt === 'object' && Object.keys(row.updatedAt).length > 0) {
          const date = new Date(row.updatedAt);
          if (!isNaN(date.getTime())) {
            return date.toLocaleString('zh-CN');
          }
        } else if (row.updatedAt && typeof row.updatedAt === 'string') {
          const date = new Date(row.updatedAt);
          if (!isNaN(date.getTime())) {
            return date.toLocaleString('zh-CN');
          }
        }
        return '未设置';
      } catch (error) {
        return '时间格式错误';
      }
    },
  },
  {
    title: '操作',
    key: 'actions',
    width: 200,
    fixed: 'right',
    render: (row) => h(
      NSpace,
      { size: 'small' },
      {
        default: () => [
          h(
            NTooltip,
            {},
            {
              trigger: () => h(
                NButton,
                {
                  size: 'small',
                  type: 'primary',
                  onClick: () => handleView(row),
                },
                { default: () => '查看' }
              ),
              default: () => '查看详情',
            }
          ),
          h(
            NTooltip,
            {},
            {
              trigger: () => h(
                NButton,
                {
                  size: 'small',
                  type: 'info',
                  onClick: () => handleEdit(row),
                },
                { default: () => '编辑' }
              ),
              default: () => '编辑',
            }
          ),
          h(
            NTooltip,
            {},
            {
              trigger: () => h(
                NButton,
                {
                  size: 'small',
                  type: 'warning',
                  onClick: () => handleViewRecords(row),
                },
                { default: () => '记录' }
              ),
              default: () => '浏览记录',
            }
          ),
          h(
            NPopconfirm,
            {
              onPositiveClick: () => handleStatusToggle(row),
            },
            {
              trigger: () => h(
                NButton,
                {
                  size: 'small',
                  type: row.status === 'active' ? 'error' : 'success',
                  disabled: (row as any)._isUpdating,
                  loading: (row as any)._isUpdating,
                },
                { default: () => row.status === 'active' ? '关闭' : '开启' }
              ),
              default: () => `确定${row.status === 'active' ? '关闭' : '开启'}此活动吗？`,
            }
          ),
          h(
            NPopconfirm,
            {
              onPositiveClick: () => handleDelete(row),
            },
            {
              trigger: () => h(
                NButton,
                {
                  size: 'small',
                  type: 'error',
                },
                { default: () => '删除' }
              ),
              default: () => '确定要删除此活动吗？',
            }
          ),
        ],
      }
    ),
  },
]);

// 获取活动列表
const fetchActivityList = async () => {
  loading.value = true;
  try {
    const params: ActivityListParams = {
      page: paginationReactive.page,
      pageSize: paginationReactive.pageSize,
      ...filterForm,
    };
    
    const response = await getActivityList(params);
    
    // Transform the data to match table expectations
    const transformedData = response.list.map(activity => {
      // Handle empty date objects and convert to proper dates
      let startsAt = null;
      let endsAt = null;
      
      if (activity.startsAt && typeof activity.startsAt === 'object' && Object.keys(activity.startsAt).length > 0) {
        startsAt = new Date(activity.startsAt);
      } else if (activity.startsAt && typeof activity.startsAt === 'string') {
        startsAt = new Date(activity.startsAt);
      }
      
      if (activity.endsAt && typeof activity.endsAt === 'object' && Object.keys(activity.endsAt).length > 0) {
        endsAt = new Date(activity.endsAt);
      } else if (activity.endsAt && typeof activity.endsAt === 'string') {
        endsAt = new Date(activity.endsAt);
      }
      
      return {
        ...activity,
        // Extract fields from config
        title: activity.config?.title || '未设置标题',
        memberScope: activity.config?.memberScope || '全部会员',
        claimLimit: activity.config?.claimLimit || 0,
        platforms: activity.config?.platforms || [],
        startsAt: startsAt,
        endsAt: endsAt,
        description: activity.config?.description || '',
        rules: activity.config?.rules || '',
        imageUrl: activity.config?.imageUrl || '',
        bannerUrl: activity.config?.bannerUrl || '',
        // Display order from database
        displayOrder: activity.displayOrder ?? 0,
      };
    });
    
    tableData.value = transformedData;
    paginationReactive.total = response.pagination.total;
    
    // Sort by display order by default
    tableData.value.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  } catch (error) {
    message.error('获取活动列表失败');
    console.error('❌ Error fetching activity list:', error);
    console.error('❌ Error details:', {
      message: error.message,
      response: error.response,
      status: error.response?.status,
      data: error.response?.data,
    });
  } finally {
    loading.value = false;
  }
};

// 事件处理
const handleSearch = () => {
  paginationReactive.page = 1;
  fetchActivityList();
};

const handleReset = () => {
  filterFormRef.value?.restoreValidation();
  Object.assign(filterForm, {
    keyword: '',
    category: '',
    status: '',
    currency: '',
    memberScope: '',
    platforms: '',
  });
  paginationReactive.page = 1;
  fetchActivityList();
};

const handleRefresh = () => {
  fetchActivityList();
};

const handleCreate = () => {
  editingItem.value = null;
  showFormModal.value = true;
};

const handleEdit = (item: Activity) => {
  // Ensure we create a clean copy to avoid reactivity issues
  editingItem.value = item ? { ...item } : null;
  showFormModal.value = true;
};

const handleView = (item: Activity) => {
  detailActivity.value = item;
  showDetailModal.value = true;
};

const handleViewRecords = (item: Activity) => {
  recordActivityId.value = item.id;
  showRecordModal.value = true;
};

const handleDelete = async (item: Activity) => {
  try {
    await deleteActivity(item.id);
    // Optimistic UI update
    tableData.value = tableData.value.filter(row => row.id !== item.id);
    message.success('活动删除成功');
    // No background refresh needed - optimistic update is sufficient
  } catch (error) {
    message.error('删除活动失败');
    console.error('Error deleting activity:', error);
  }
};

const handleStatusToggle = async (item: Activity) => {
  try {
    const newStatus = item.status === 'active' ? 'paused' : 'active';
    
    // Add loading state to prevent double clicks
    const rowIndex = tableData.value.findIndex(row => row.id === item.id);
    if (rowIndex !== -1) {
      tableData.value[rowIndex] = {
        ...tableData.value[rowIndex],
        _isUpdating: true // Add loading flag
      };
    }
    
    // Optimistic UI update FIRST
    if (rowIndex !== -1) {
      tableData.value[rowIndex] = {
        ...tableData.value[rowIndex],
        status: newStatus,
        _isUpdating: true
      };
    }
    
    // Then make the API call
    await updateActivityStatus(item.id, { status: newStatus });
    
    message.success(`活动状态已更新为${newStatus === 'active' ? '开启' : '暂停'}`);
    
    // Remove loading state
    if (rowIndex !== -1) {
      tableData.value[rowIndex] = {
        ...tableData.value[rowIndex],
        _isUpdating: false
      };
    }
    
    // No background refresh needed - optimistic update is sufficient
    // The cache invalidation will ensure fresh data on next manual refresh
    
  } catch (error) {
    // Revert optimistic update on error
    if (rowIndex !== -1) {
      tableData.value[rowIndex] = {
        ...tableData.value[rowIndex],
        status: item.status, // Revert to original status
        _isUpdating: false // Remove loading state
      };
    }
    
    message.error('更新活动状态失败');
    console.error('Error updating activity status:', error);
  }
};

const handleBatchDelete = (selectedRows?: Activity[]) => {
  const activitiesToDelete = selectedRows || tableData.value.filter(activity => 
    checkedRowKeys.value.includes(activity.id)
  );
  
  if (activitiesToDelete.length === 0) {
    message.warning('请先选择要删除的活动');
    return;
  }
  
  dialog.warning({
    title: '确认删除',
    content: `确定要删除选中的 ${activitiesToDelete.length} 个活动吗？`,
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        const ids = activitiesToDelete.map(activity => activity.id as number);
        await bulkDeleteActivities({ ids });
        // Optimistic UI update
        tableData.value = tableData.value.filter(row => !ids.includes(row.id as number));
        message.success('批量删除成功');
        checkedRowKeys.value = [];
        // No background refresh needed - optimistic update is sufficient
      } catch (error) {
        message.error('批量删除失败');
        console.error('Error batch deleting activities:', error);
      }
    },
  });
};

const handlePageChange = (page: number) => {
  paginationReactive.page = page;
  fetchActivityList();
};

const handlePageSizeChange = (pageSize: number) => {
  paginationReactive.pageSize = pageSize;
  paginationReactive.page = 1;
  fetchActivityList();
};

// Display order management
const savingDisplayOrder = ref(false);

const handleDisplayOrderChange = async (row: Activity, value: number) => {
  if (savingDisplayOrder.value) {
    return;
  }

  try {
    savingDisplayOrder.value = true;
    
    const activityId = typeof row.id === 'string' ? parseInt(row.id) : row.id;
    
    // Update immediately - single activity
    await batchUpdateDisplayOrder([{ id: activityId, displayOrder: value }]);
    
    // Update the local table data for UI responsiveness
    const activity = tableData.value.find(a => a.id === row.id);
    if (activity) {
      activity.displayOrder = value;
    }
    
    // Sort the table data by displayOrder to reflect the changes immediately
    tableData.value.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    
    message.success(`已更新活动 ${activityId} 的排序为 ${value}`);
  } catch (error) {
    message.error('更新排序失败');
    console.error('Error updating display order:', error);
  } finally {
    savingDisplayOrder.value = false;
  }
};

// SmartDataGrid event handlers
const handleRowClick = (activity: Activity) => {
  console.log('Activity row clicked:', activity);
  // Optional: Auto-open detail modal on row click
  handleView(activity);
};

const clearSelection = () => {
  checkedRowKeys.value = [];
  console.log('Selection cleared');
};

const selectAll = () => {
  checkedRowKeys.value = tableData.value.map(activity => activity.id);
  console.log('All selected');
};

const handleSorterChange = (sorter: any) => {
  // 处理排序逻辑
  console.log('Sorter changed:', sorter);
  fetchActivityList();
};

const handleFormSuccess = () => {
  fetchActivityList();
};

// 初始化
onMounted(() => {
  fetchActivityList();
});
</script>

<style scoped>
.activity-list {
  height: 100%;
}

:deep(.n-data-table) {
  height: 100%;
}

:deep(.n-data-table-thead) {
  background-color: #fafafa;
}

:deep(.n-data-table-tbody .n-data-table-tr:hover) {
  background-color: #f5f5f5;
}
</style> 