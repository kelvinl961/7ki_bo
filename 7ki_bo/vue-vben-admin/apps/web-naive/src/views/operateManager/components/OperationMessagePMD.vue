<template>
  <div class="pmd-management">
    <!-- 筛选器区域 -->
    <n-card class="mb-4">
      <div class="flex flex-wrap items-end gap-4">
        <!-- 语言选择 -->
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium">{{ $t('operations.messageSettings.language') }}</label>
          <n-select
            v-model:value="filters.language"
            :placeholder="$t('operations.messageSettings.selectLanguage')"
            clearable
            style="width: 120px"
            :options="languageOptions"
            @update:value="handleFilter"
          />
        </div>

        <!-- 币种选择 -->
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium">{{ $t('common.currency') }}</label>
          <n-select
            v-model:value="filters.currency"
            :placeholder="$t('operations.messageSettings.selectCurrency')"
            clearable
            style="width: 120px"
            :options="currencyOptions"
            @update:value="handleFilter"
          />
        </div>

        <!-- 收件人类型 -->
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium">{{ $t('operations.messageSettings.receiverType') }}</label>
          <n-select
            v-model:value="filters.receiverType"
            :placeholder="$t('operations.messageSettings.selectReceiverType')"
            clearable
            style="width: 140px"
            :options="receiverTypeOptions"
            @update:value="handleFilter"
          />
        </div>

        <!-- 状态筛选 -->
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium">{{ $t('common.status') }}</label>
          <n-select
            v-model:value="filters.status"
            :placeholder="$t('operations.messageSettings.selectStatus')"
            clearable
            style="width: 120px"
            :options="statusOptions"
            @update:value="handleFilter"
          />
        </div>

        <!-- 展示状态 -->
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium">{{ $t('operations.form.displayStatus') }}</label>
          <n-select
            v-model:value="filters.displayStatus"
            :placeholder="$t('operations.form.displayStatus')"
            clearable
            style="width: 140px"
            :options="displayStatusOptions"
            @update:value="handleFilter"
          />
        </div>

        <!-- 关键词搜索 -->
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium">{{ $t('operations.messageSettings.keyword') }}</label>
          <n-input
            v-model:value="filters.keyword"
            :placeholder="$t('operations.messageSettings.contentSearch')"
            clearable
            style="width: 200px"
            @keyup.enter="handleFilter"
          />
        </div>

        <!-- 时间范围 -->
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium">{{ $t('operations.messageSettings.timeRange') }}</label>
          <n-date-picker
            v-model:value="filters.timeRange"
            :time-zone="timezone"
            type="daterange"
            clearable
            style="width: 240px"
            @update:value="handleFilter"
          />
        </div>

        <!-- 搜索按钮 -->
        <div class="flex gap-2">
          <n-button type="primary" @click="handleFilter"> {{ $t('common.search') }} </n-button>
          <n-button @click="resetFilter"> {{ $t('common.reset') }} </n-button>
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
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <!-- 主要操作按钮 -->
              <div class="flex gap-2">
                <n-button type="primary" @click="handleCreate">{{ $t('operations.messageSettings.addPmd') }}</n-button>
              </div>

              <!-- 选择信息 -->
              <div class="text-sm text-gray-600">
                {{ $t('operations.messageSettings.selectedData', [selectedCount, '']) }}
                {{ $t('operations.domain.modal.recordsCount', [paginationReactive.total]) }}
              </div>
            </div>

            <div class="flex gap-2">
              <!-- 批量操作 -->
              <n-button
                v-if="selectedCount > 0"
                type="warning"
                size="small"
                @click="handleBatchPause(selectedRows)"
              >{{ $t('operations.messageSettings.batchPause') }} ({{ selectedCount }})
              </n-button>
              <n-button
                v-if="selectedCount > 0"
                type="error"
                size="small"
                @click="handleBatchDelete(selectedRows)"
              >
                {{ $t('operations.messageSettings.batchDelete', [selectedCount]) }}
              </n-button>

              <!-- 选择控制 -->
              <n-button size="small" @click="clearSelection">{{ $t('operations.messageSettings.clearSelection') }}</n-button>
              <n-button size="small" @click="selectAll">{{ $t('common.selectAll') }}</n-button>
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
import { $t } from '@vben/locales';

import {
  ref,
  reactive,
  onMounted,
  computed,
  h,
  defineAsyncComponent,
} from 'vue';
// ✅ PERFORMANCE FIX: Lazy load components to avoid blocking page load
const SmartDataGrid = defineAsyncComponent(
  () => import('../../../components/smart/SmartDataGrid/index.vue'),
);
import {
  NCard,
  NButton,
  NSelect,
  NInput,
  NDatePicker,
  NSwitch,
  NTooltip,
  NTag,
  NSpace,
  useDialog,
  useNotification,
  type DataTableColumns,
  type DataTableRowKey,
} from 'naive-ui';
import {
  getPMDList,
  deletePMD,
  batchDeletePMD,
  togglePMDStatus,
  type PMDMessage,
  type PMDListParams,
} from '#/api/operationMessagePMD';
import { renderTzDateTime } from '#/components/common/tzDateTimeRender';
import { useDisplayTimezone } from '#/composables/useDisplayTimezone';

const { timezone } = useDisplayTimezone();

// Note: PMDMessage and PMDListParams types are imported from the API module
const OperationMessagePMDFormModal = defineAsyncComponent(
  () => import('./OperationMessagePMDFormModal.vue'),
);

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
  timeRange: null,
});

// 对话框和通知
const dialog = useDialog();
const notification = useNotification();

// 选项配置
const languageOptions = [
  { label: $t('operations.messageSettings.option.langZh'), value: 'zh-CN' },
  { label: $t('operations.messageSettings.option.langEn'), value: 'en-US' },
  { label: $t('operations.messageSettings.option.langPt'), value: 'pt-BR' },
  { label: $t('operations.messageSettings.option.langEs'), value: 'es-ES' },
  { label: $t('operations.messageSettings.option.langJa'), value: 'ja-JP' },
];

const currencyOptions = [
  { label: 'BRL', value: 'BRL' },
  { label: 'CNY', value: 'CNY' },
  { label: 'USD', value: 'USD' },
  { label: 'EUR', value: 'EUR' },
  { label: 'JPY', value: 'JPY' },
];

const receiverTypeOptions = [
  { label: $t('operations.messageSettings.option.receiverAll'), value: 'all' },
  { label: $t('operations.messageSettings.option.receiverVipLevel'), value: 'vip' },
  { label: $t('operations.messageSettings.option.receiverNew'), value: 'new' },
  { label: $t('operations.messageSettings.option.receiverActive'), value: 'active' },
];

const statusOptions = [
  { label: $t('operations.messageSettings.option.statusEnabled'), value: 'enabled' },
  { label: $t('operations.messageSettings.option.statusDisabled'), value: 'disabled' },
];

const displayStatusOptions = [
  { label: $t('operations.form.beforeLogin'), value: 'before_login' },
  { label: $t('operations.form.afterLoginOnly'), value: 'after_login' },
  { label: $t('operations.form.loginBoth'), value: 'both' },
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
    width: 50,
  },
  {
    title: $t('operations.messageSettings.sort'),
    key: 'sortOrder',
    width: 80,
    sorter: true,
  },
  {
    title: 'ID',
    key: 'id',
    width: 80,
  },
  {
    title: $t('operations.messageSettings.language'),
    key: 'language',
    width: 80,
    render: (row) => {
      const lang = languageOptions.find((item) => item.value === row.language);
      return lang ? lang.label : row.language;
    },
  },
  {
    title: $t('common.currency'),
    key: 'currency',
    width: 80,
  },
  {
    title: $t('operations.messageSettings.receiver'),
    key: 'receiverType',
    width: 100,
    render: (row) => {
      const receiver = receiverTypeOptions.find(
        (item) => item.value === row.receiverType,
      );
      return receiver ? receiver.label : row.receiverType;
    },
  },
  {
    title: $t('operations.form.displayStatus'),
    key: 'displayStatus',
    width: 100,
    render: (row) => {
      const status = displayStatusOptions.find(
        (item) => item.value === row.displayStatus,
      );
      return status ? status.label : row.displayStatus;
    },
  },
  {
    title: $t('operations.messageSettings.startTime'),
    key: 'startTime',
    width: 160,
    render: (row) => renderTzDateTime(row.startTime),
  },
  {
    title: $t('operations.messageSettings.endTime'),
    key: 'endTime',
    width: 160,
    render: (row) => renderTzDateTime(row.endTime),
  },
  {
    title: $t('operations.form.displayDurationSec'),
    key: 'displayDuration',
    width: 120,
    render: (row) => `${row.displayDuration || 0}${$t('operations.messageSettings.secondsUnit')}`,
  },
  {
    title: $t('operations.messageSettings.content'),
    key: 'content',
    width: 200,
    render: (row) => {
      const content = row.content || '';
      const truncated =
        content.length > 30 ? content.substring(0, 30) + '...' : content;
      return h(
        NTooltip,
        { trigger: 'hover' },
        {
          trigger: () => h('span', { class: 'cursor-pointer' }, truncated),
          default: () => content,
        },
      );
    },
  },
  {
    title: $t('common.status'),
    key: 'status',
    width: 100,
    render: (row) => {
      const isEnabled = row.status === 'enabled';
      return h(NSwitch, {
        value: isEnabled,
        onUpdateValue: () => handleToggleStatus(row),
      });
    },
  },
  {
    title: $t('operations.messageSettings.backendRemark'),
    key: 'remark',
    width: 150,
    render: (row) => {
      const remark = row.remark || '';
      const truncated =
        remark.length > 20 ? remark.substring(0, 20) + '...' : remark;
      return h(
        NTooltip,
        { trigger: 'hover' },
        {
          trigger: () => h('span', { class: 'cursor-pointer' }, truncated),
          default: () => remark,
        },
      );
    },
  },
  {
    title: $t('common.operationTime'),
    key: 'updatedAt',
    width: 160,
    render: (row) => renderTzDateTime(row.updatedAt),
  },
  {
    title: $t('common.actions'),
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
                onClick: () => handleEdit(row),
              },
              { default: () => $t('common.edit') },
            ),
            h(
              NButton,
              {
                size: 'small',
                type: 'info',
                ghost: true,
                onClick: () => handleCopy(row),
              },
              { default: () => $t('common.copy') },
            ),
            h(
              NButton,
              {
                size: 'small',
                type: row.status === 'enabled' ? 'warning' : 'success',
                ghost: true,
                onClick: () => handlePauseOrStart(row),
              },
              { default: () => (row.status === 'enabled' ? $t('operations.messageSettings.stop') : $t('operations.messageSettings.start')) },
            ),
            h(
              NButton,
              {
                size: 'small',
                type: 'error',
                ghost: true,
                onClick: () => handleDelete(row),
              },
              { default: () => $t('common.delete') },
            ),
          ],
        },
      );
    },
  },
];

// 数据加载
const loadData = async () => {
  loading.value = true;
  try {
    const params: PMDListParams = {
      page: paginationReactive.page,
      pageSize: paginationReactive.pageSize,
      ...filters,
    };

    const response = await getPMDList(params);
    console.log('PMD API Response:', response);

    // The response interceptor now handles the format correctly
    if (
      response &&
      typeof response === 'object' &&
      response.data &&
      typeof response.total === 'number'
    ) {
      tableData.value = response.data;
      paginationReactive.total = response.total;
      console.log('✅ PMD data loaded:', {
        dataLength: response.data.length,
        total: response.total,
        page: response.page,
        pageSize: response.pageSize,
      });
    } else {
      console.warn('❌ Unexpected response format:', response);
      tableData.value = [];
      totalCount.value = 0;
    }
  } catch (error) {
    console.error('Error loading PMD data:', error);
    notification.error({
      content: $t('operations.messageSettings.loadFailed'),
      duration: 3000,
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
    timeRange: null,
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
  copyData.content = `${copyData.content}${$t('operations.messageSettings.copySuffix')}`;
  editingItem.value = copyData;
  showModal.value = true;
};

const handlePauseOrStart = async (row: PMDMessage) => {
  try {
    const willEnable = row.status !== 'enabled';
    await togglePMDStatus(row.id, willEnable);
    notification.success({
      content: willEnable ? $t('operations.messageSettings.startSuccess') : $t('operations.messageSettings.pauseSuccess'),
      duration: 3000,
    });
    loadData();
  } catch (error) {
    console.error('Error toggling PMD:', error);
    notification.error({
      content: $t('common.operationFailed'),
      duration: 3000,
    });
  }
};

const handleToggleStatus = async (row: PMDMessage) => {
  try {
    const newStatus = row.status === 'enabled' ? 'disabled' : 'enabled';
    await togglePMDStatus(row.id, newStatus === 'enabled');
    notification.success({
      content: newStatus === 'enabled' ? $t('operations.messageSettings.toggleSuccess', [$t('common.enable')]) : $t('operations.messageSettings.toggleSuccess', [$t('common.disable')]),
      duration: 3000,
    });
    loadData();
  } catch (error) {
    console.error('Error toggling PMD status:', error);
    notification.error({
      content: $t('operations.messageSettings.statusUpdateFailed'),
      duration: 3000,
    });
  }
};

const handleDelete = async (row: PMDMessage) => {
  dialog.warning({
    title: $t('operations.tracking.confirmDelete'),
    content: $t('operations.messageSettings.confirmDeletePmd'),
    positiveText: $t('common.confirm'),
    negativeText: $t('common.cancel'),
    onPositiveClick: async () => {
      try {
        await deletePMD(row.id);
        notification.success({
          content: $t('common.deleteSuccess'),
          duration: 3000,
        });
        loadData();
      } catch (error) {
        console.error('Error deleting PMD:', error);
        notification.error({
          content: $t('operations.messageSettings.deleteFailed'),
          duration: 3000,
        });
      }
    },
  });
};

const handleSelectionChange = (keys: DataTableRowKey[]) => {
  selectedRowKeys.value = keys;
};

const handleBatchDelete = (selectedRows?: PMDMessage[]) => {
  const pmdsToDelete =
    selectedRows ||
    tableData.value.filter((pmd) => selectedRowKeys.value.includes(pmd.id));

  if (pmdsToDelete.length === 0) {
    console.log('No PMDs selected for batch delete');
    return;
  }

  dialog.warning({
    title: $t('operations.messageSettings.confirmBatchDeleteTitle'),
    content: $t('operations.messageSettings.confirmBatchDeletePmd', [pmdsToDelete.length]),
    positiveText: $t('common.confirm'),
    negativeText: $t('common.cancel'),
    onPositiveClick: async () => {
      try {
        const ids = pmdsToDelete.map((pmd) => Number(pmd.id));
        await batchDeletePMD({ ids });
        notification.success({
          content: $t('operations.messageSettings.batchDeletePmdSuccess', [pmdsToDelete.length]),
          duration: 3000,
        });
        selectedRowKeys.value = [];
        loadData();
      } catch (error) {
        console.error('Error batch deleting PMD:', error);
        notification.error({
          content: $t('operations.messageSettings.batchDeleteFailed'),
          duration: 3000,
        });
      }
    },
  });
};

const handleBatchPause = (selectedRows?: PMDMessage[]) => {
  const pmdsToPause =
    selectedRows ||
    tableData.value.filter((pmd) => selectedRowKeys.value.includes(pmd.id));

  if (pmdsToPause.length === 0) {
    console.log('No PMDs selected for batch pause');
    return;
  }

  dialog.warning({
    title: $t('operations.messageSettings.confirmBatchPauseTitle'),
    content: $t('operations.messageSettings.confirmBatchPausePmd', [pmdsToPause.length]),
    positiveText: $t('common.confirm'),
    negativeText: $t('common.cancel'),
    onPositiveClick: async () => {
      try {
        const ids = pmdsToPause.map((pmd) => Number(pmd.id));
        // 批量暂停操作
        await Promise.all(ids.map((id) => togglePMDStatus(id, false)));
        notification.success({
          content: $t('operations.messageSettings.batchPausePmdSuccess', [pmdsToPause.length]),
          duration: 3000,
        });
        selectedRowKeys.value = [];
        loadData();
      } catch (error) {
        console.error('Error batch pausing PMD:', error);
        notification.error({
          content: $t('operations.messageSettings.batchPauseFailed'),
          duration: 3000,
        });
      }
    },
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
  selectedRowKeys.value = tableData.value.map((pmd) => pmd.id);
  console.log('All selected');
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
