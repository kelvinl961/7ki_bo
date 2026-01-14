<template>
  <div class="pmd-management">
    <!-- 筛选器区域 -->
    <n-card class="mb-4">
      <div class="flex flex-wrap gap-4 items-end">
        <!-- 语言选择 -->
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium">语言</label>
          <n-select
            v-model:value="filters.language"
            placeholder="选择语言"
            clearable
            style="width: 120px"
            :options="languageOptions"
            @update:value="handleFilter"
          />
        </div>

        <!-- 币种选择 -->
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium">币种</label>
          <n-select
            v-model:value="filters.currency"
            placeholder="选择币种"
            clearable
            style="width: 120px"
            :options="currencyOptions"
            @update:value="handleFilter"
          />
        </div>

        <!-- 收件人类型 -->
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium">收件人类型</label>
          <n-select
            v-model:value="filters.receiverType"
            placeholder="选择收件人类型"
            clearable
            style="width: 140px"
            :options="receiverTypeOptions"
            @update:value="handleFilter"
          />
        </div>

        <!-- 状态筛选 -->
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium">状态</label>
          <n-select
            v-model:value="filters.status"
            placeholder="选择状态"
            clearable
            style="width: 120px"
            :options="statusOptions"
            @update:value="handleFilter"
          />
        </div>

        <!-- 展示状态 -->
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium">展示状态</label>
          <n-select
            v-model:value="filters.displayStatus"
            placeholder="选择展示状态"
            clearable
            style="width: 140px"
            :options="displayStatusOptions"
            @update:value="handleFilter"
          />
        </div>

        <!-- 关键词搜索 -->
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium">关键词</label>
          <n-input
            v-model:value="filters.keyword"
            placeholder="输入内容或ID搜索"
            clearable
            style="width: 200px"
            @keyup.enter="handleFilter"
          />
        </div>

        <!-- 时间范围 -->
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium">时间范围</label>
          <n-date-picker
            v-model:value="filters.timeRange"
            type="daterange"
            clearable
            style="width: 240px"
            @update:value="handleFilter"
          />
        </div>

        <!-- 搜索按钮 -->
        <div class="flex gap-2">
          <n-button type="primary" @click="handleFilter">
            搜索
          </n-button>
          <n-button @click="resetFilter">
            重置
          </n-button>
        </div>
      </div>
    </n-card>

    <!-- 🚀 NEW: SmartDataGrid Component for PMD Messages -->
    <SmartDataGrid
      :data="tableData"
      :columns="columns"
      :loading="loading"
      :pagination="paginationReactive"
      selectable
      :selected-keys="selectedRowKeys"
      row-key="id"
      @update:selected-keys="selectedRowKeys = $event"
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
                  新增跑马灯
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
                type="warning" 
                size="small"
                @click="handleBatchPause(selectedRows)"
              >
                批量暂停 ({{ selectedCount }})
              </n-button>
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

    <!-- 创建/编辑对话框 -->
    <OperationMessagePMDFormModal
      v-model:show="showModal"
      :editing-item="editingItem"
      @success="handleModalSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, h, defineAsyncComponent } from 'vue';
// ✅ PERFORMANCE FIX: Lazy load components to avoid blocking page load
const SmartDataGrid = defineAsyncComponent(() => import('../../../components/smart/SmartDataGrid/index.vue'));
import { 
  NCard, NButton, NSelect, NInput, NDatePicker, 
  NSwitch, NTooltip, NTag, NSpace, useDialog, useNotification,
  type DataTableColumns, type DataTableRowKey
} from 'naive-ui';
import { 
  getPMDList, deletePMD, batchDeletePMD, togglePMDStatus, 
  type PMDMessage, type PMDListParams 
} from '#/api/operationMessagePMD';

// Note: PMDMessage and PMDListParams types are imported from the API module
const OperationMessagePMDFormModal = defineAsyncComponent(() => import('./OperationMessagePMDFormModal.vue'));

// 数据状态
const loading = ref(false);
const tableData = ref<PMDMessage[]>([]);
const selectedRowKeys = ref<DataTableRowKey[]>([]);
const currentPage = ref(1);
const currentPageSize = ref(10);
const totalCount = ref(0);
const showModal = ref(false);
const editingItem = ref<PMDMessage | null>(null);

// 筛选器
const filters = reactive({
  language: null,
  currency: null,
  receiverType: null,
  status: null,
  displayStatus: null,
  keyword: '',
  timeRange: null
});

// 对话框和通知
const dialog = useDialog();
const notification = useNotification();

// 选项配置
const languageOptions = [
  { label: '中文', value: 'zh-CN' },
  { label: '英文', value: 'en-US' },
  { label: '葡语', value: 'pt-BR' },
  { label: '西班牙语', value: 'es-ES' },
  { label: '日语', value: 'ja-JP' }
];

const currencyOptions = [
  { label: 'BRL', value: 'BRL' },
  { label: 'CNY', value: 'CNY' },
  { label: 'USD', value: 'USD' },
  { label: 'EUR', value: 'EUR' },
  { label: 'JPY', value: 'JPY' }
];

const receiverTypeOptions = [
  { label: '全部用户', value: 'all' },
  { label: '会员层级', value: 'vip' },
  { label: '新用户', value: 'new' },
  { label: '活跃用户', value: 'active' }
];

const statusOptions = [
  { label: '已启用', value: 'enabled' },
  { label: '已停用', value: 'disabled' }
];

const displayStatusOptions = [
  { label: '登录前', value: 'before_login' },
  { label: '登录后', value: 'after_login' },
  { label: '登录前后', value: 'both' }
];

// Pagination (simplified for SmartDataGrid)
const paginationReactive = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
});

// 表格列配置
const columns: DataTableColumns<PMDMessage> = [
  {
    type: 'selection',
    width: 50
  },
  {
    title: '排序',
    key: 'sortOrder',
    width: 80,
    sorter: true
  },
  {
    title: 'ID',
    key: 'id',
    width: 80
  },
  {
    title: '语言',
    key: 'language',
    width: 80,
    render: (row) => {
      const lang = languageOptions.find(item => item.value === row.language);
      return lang ? lang.label : row.language;
    }
  },
  {
    title: '币种',
    key: 'currency',
    width: 80
  },
  {
    title: '收件人',
    key: 'receiverType',
    width: 100,
    render: (row) => {
      const receiver = receiverTypeOptions.find(item => item.value === row.receiverType);
      return receiver ? receiver.label : row.receiverType;
    }
  },
  {
    title: '展示状态',
    key: 'displayStatus',
    width: 100,
    render: (row) => {
      const status = displayStatusOptions.find(item => item.value === row.displayStatus);
      return status ? status.label : row.displayStatus;
    }
  },
  {
    title: '开始时间',
    key: 'startTime',
    width: 160,
    render: (row) => formatDate(row.startTime)
  },
  {
    title: '结束时间',
    key: 'endTime',
    width: 160,
    render: (row) => formatDate(row.endTime)
  },
  {
    title: '停留时间(秒)',
    key: 'displayDuration',
    width: 120,
    render: (row) => `${row.displayDuration || 0}秒`
  },
  {
    title: '内容',
    key: 'content',
    width: 200,
    render: (row) => {
      const content = row.content || '';
      const truncated = content.length > 30 ? content.substring(0, 30) + '...' : content;
      return h(
        NTooltip,
        { trigger: 'hover' },
        {
          trigger: () => h('span', { class: 'cursor-pointer' }, truncated),
          default: () => content
        }
      );
    }
  },
  {
    title: '状态',
    key: 'status',
    width: 100,
    render: (row) => {
      const isEnabled = row.status === 'enabled';
      return h(
        NSwitch,
        {
          value: isEnabled,
          onUpdateValue: () => handleToggleStatus(row)
        }
      );
    }
  },
  {
    title: '后台备注',
    key: 'remark',
    width: 150,
    render: (row) => {
      const remark = row.remark || '';
      const truncated = remark.length > 20 ? remark.substring(0, 20) + '...' : remark;
      return h(
        NTooltip,
        { trigger: 'hover' },
        {
          trigger: () => h('span', { class: 'cursor-pointer' }, truncated),
          default: () => remark
        }
      );
    }
  },
  {
    title: '操作时间',
    key: 'updatedAt',
    width: 160,
    render: (row) => formatDate(row.updatedAt)
  },
  {
    title: '操作',
    key: 'actions',
    width: 200,
    fixed: 'right',
    render: (row) => {
      return h(
        NSpace,
        { size: 'small' },
        {
          default: () => [
            h(
              NButton,
              {
                size: 'small',
                type: 'primary',
                ghost: true,
                onClick: () => handleEdit(row)
              },
              { default: () => '编辑' }
            ),
            h(
              NButton,
              {
                size: 'small',
                type: 'info',
                ghost: true,
                onClick: () => handleCopy(row)
              },
              { default: () => '复制' }
            ),
            h(
              NButton,
              {
                size: 'small',
                type: row.status === 'enabled' ? 'warning' : 'success',
                ghost: true,
                onClick: () => handlePauseOrStart(row)
              },
              { default: () => (row.status === 'enabled' ? '暂停' : '启动') }
            ),
            h(
              NButton,
              {
                size: 'small',
                type: 'error',
                ghost: true,
                onClick: () => handleDelete(row)
              },
              { default: () => '删除' }
            )
          ]
        }
      );
    }
  }
];

// 数据加载
const loadData = async () => {
  loading.value = true;
  try {
    const params: PMDListParams = {
      page: paginationReactive.page,
      pageSize: paginationReactive.pageSize,
      ...filters
    };
    
    const response = await getPMDList(params);
    console.log('PMD API Response:', response);
    
    // The response interceptor now handles the format correctly
    if (response && typeof response === 'object' && response.data && typeof response.total === 'number') {
      tableData.value = response.data;
      paginationReactive.total = response.total;
      console.log('✅ PMD data loaded:', { 
        dataLength: response.data.length, 
        total: response.total,
        page: response.page,
        pageSize: response.pageSize
      });
    } else {
      console.warn('❌ Unexpected response format:', response);
      tableData.value = [];
      totalCount.value = 0;
    }
  } catch (error) {
    console.error('Error loading PMD data:', error);
    notification.error({
      content: '加载数据失败',
      duration: 3000
    });
    tableData.value = [];
    totalCount.value = 0;
  } finally {
    loading.value = false;
  }
};

// 事件处理
const handleFilter = () => {
  paginationReactive.page = 1;
  loadData();
};

const resetFilter = () => {
  Object.assign(filters, {
    language: null,
    currency: null,
    receiverType: null,
    status: null,
    displayStatus: null,
    keyword: '',
    timeRange: null
  });
  paginationReactive.page = 1;
  loadData();
};

const handleRefresh = () => {
  loadData();
};

const handleCreate = () => {
  editingItem.value = null;
  showModal.value = true;
};

const handleEdit = (row: PMDMessage) => {
  editingItem.value = { ...row };
  showModal.value = true;
};

const handleCopy = (row: PMDMessage) => {
  const copyData = { ...row };
  delete copyData.id;
  copyData.content = `${copyData.content} (复制)`;
  editingItem.value = copyData;
  showModal.value = true;
};

const handlePauseOrStart = async (row: PMDMessage) => {
  try {
    const willEnable = row.status !== 'enabled';
    await togglePMDStatus(row.id, willEnable);
    notification.success({
      content: willEnable ? '启动成功' : '暂停成功',
      duration: 3000
    });
    loadData();
  } catch (error) {
    console.error('Error toggling PMD:', error);
    notification.error({
      content: '操作失败',
      duration: 3000
    });
  }
};

const handleToggleStatus = async (row: PMDMessage) => {
  try {
    const newStatus = row.status === 'enabled' ? 'disabled' : 'enabled';
    await togglePMDStatus(row.id, newStatus === 'enabled');
    notification.success({
      content: `${newStatus === 'enabled' ? '启用' : '停用'}成功`,
      duration: 3000
    });
    loadData();
  } catch (error) {
    console.error('Error toggling PMD status:', error);
    notification.error({
      content: '状态更新失败',
      duration: 3000
    });
  }
};

const handleDelete = async (row: PMDMessage) => {
  dialog.warning({
    title: '确认删除',
    content: '确定要删除这条跑马灯通知吗？',
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await deletePMD(row.id);
        notification.success({
          content: '删除成功',
          duration: 3000
        });
        loadData();
      } catch (error) {
        console.error('Error deleting PMD:', error);
        notification.error({
          content: '删除失败',
          duration: 3000
        });
      }
    }
  });
};

const handleSelectionChange = (keys: DataTableRowKey[]) => {
  selectedRowKeys.value = keys;
};

const handleBatchDelete = (selectedRows?: PMDMessage[]) => {
  const pmdsToDelete = selectedRows || tableData.value.filter(pmd => 
    selectedRowKeys.value.includes(pmd.id)
  );
  
  if (pmdsToDelete.length === 0) {
    console.log('No PMDs selected for batch delete');
    return;
  }
  
  dialog.warning({
    title: '确认批量删除',
    content: `确定要删除选中的 ${pmdsToDelete.length} 条跑马灯通知吗？`,
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        const ids = pmdsToDelete.map(pmd => Number(pmd.id));
        await batchDeletePMD({ ids });
        notification.success({
          content: `成功删除 ${pmdsToDelete.length} 条跑马灯通知`,
          duration: 3000
        });
        selectedRowKeys.value = [];
        loadData();
      } catch (error) {
        console.error('Error batch deleting PMD:', error);
        notification.error({
          content: '批量删除失败',
          duration: 3000
        });
      }
    }
  });
};

const handleBatchPause = (selectedRows?: PMDMessage[]) => {
  const pmdsToPause = selectedRows || tableData.value.filter(pmd => 
    selectedRowKeys.value.includes(pmd.id)
  );
  
  if (pmdsToPause.length === 0) {
    console.log('No PMDs selected for batch pause');
    return;
  }
  
  dialog.warning({
    title: '确认批量暂停',
    content: `确定要暂停选中的 ${pmdsToPause.length} 条跑马灯通知吗？`,
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        const ids = pmdsToPause.map(pmd => Number(pmd.id));
        // 批量暂停操作
        await Promise.all(ids.map(id => togglePMDStatus(id, false)));
        notification.success({
          content: `成功暂停 ${pmdsToPause.length} 条跑马灯通知`,
          duration: 3000
        });
        selectedRowKeys.value = [];
        loadData();
      } catch (error) {
        console.error('Error batch pausing PMD:', error);
        notification.error({
          content: '批量暂停失败',
          duration: 3000
        });
      }
    }
  });
};

const handleModalSuccess = () => {
  showModal.value = false;
  loadData();
};

const handlePageChange = (page: number) => {
  paginationReactive.page = page;
  loadData();
};

const handlePageSizeChange = (pageSize: number) => {
  paginationReactive.pageSize = pageSize;
  paginationReactive.page = 1;
  loadData();
};

// SmartDataGrid event handlers
const handleRowClick = (pmd: PMDMessage) => {
  console.log('PMD row clicked:', pmd);
  // Optional: Auto-open edit modal on row click
  handleEdit(pmd);
};

const clearSelection = () => {
  selectedRowKeys.value = [];
  console.log('Selection cleared');
};

const selectAll = () => {
  selectedRowKeys.value = tableData.value.map(pmd => pmd.id);
  console.log('All selected');
};

const formatDate = (date: string | Date | null) => {
  if (!date) return '-';
  return new Date(date).toLocaleString('zh-CN');
};

// 初始化
onMounted(() => {
  console.log('PMD Component mounted, loading data...');
  loadData();
});
</script>

<style scoped>
.pmd-management {
  padding: 0;
}

.flex {
  display: flex;
}

.flex-wrap {
  flex-wrap: wrap;
}

.flex-col {
  flex-direction: column;
}

.gap-2 {
  gap: 0.5rem;
}

.gap-4 {
  gap: 1rem;
}

.items-end {
  align-items: flex-end;
}

.items-center {
  align-items: center;
}

.justify-between {
  justify-content: space-between;
}

.text-sm {
  font-size: 0.875rem;
}

.font-medium {
  font-weight: 500;
}

.mb-2 {
  margin-bottom: 0.5rem;
}

.mb-4 {
  margin-bottom: 1rem;
}

.cursor-pointer {
  cursor: pointer;
}
</style> 