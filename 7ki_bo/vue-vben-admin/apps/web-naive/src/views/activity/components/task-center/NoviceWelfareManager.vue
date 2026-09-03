<template>
  <div class="novice-welfare-manager">
    <!-- SmartDataGrid -->
    <SmartDataGrid
      :data="tableData"
      :columns="columns"
      :loading="loading"
      :pagination="paginationReactive"
      selectable
      :selected-keys="selectedRowKeys"
      row-key="id"
      size="small"
      :scroll-x="1200"
      striped
      :row-class-name="getRowClassName"
      @update:selected-keys="selectedRowKeys = $event"
      @update:page="handlePageChange"
      @update:page-size="handlePageSizeChange"
      @refresh="refreshData"
      @row-click="handleRowClick"
      @update:sorter="handleSorterChange"
    >
      <template #actionBar="{ selectedCount, selectedRows }">
        <n-card :bordered="false" class="rounded-16px shadow-sm">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <!-- 主要操作按钮 -->
              <div class="flex gap-2">
                <n-button type="primary" @click="handleAdd">
                  <template #icon>
                    <AddOutline />
                  </template>{{ $t('activity.noviceWelfareGlobal.k65b0') }}</n-button>
                <n-button @click="refreshData">
                  <template #icon>
                    <RefreshOutline />
                  </template>{{ $t('activity.noviceWelfare.k5237') }}</n-button>
              </div>

              <!-- 选择信息 -->
              <div class="text-sm text-gray-600">
                {{ $t('activity.common.selectedCount', [selectedCount, paginationReactive.total]) }}
              </div>
            </div>

            <div class="flex items-center gap-4">
              <!-- 批量操作 -->
              <div v-if="selectedCount > 0" class="flex gap-2">
                <n-button
                  size="small"
                  type="success"
                  @click="handleBulkActivate(selectedRows)"
                >
                  {{ $t('activity.common.batchEnable') }} ({{ selectedCount }})
                </n-button>
                <n-button
                  size="small"
                  type="warning"
                  @click="handleBulkDeactivate(selectedRows)"
                >
                  {{ $t('activity.common.batchDisable') }} ({{ selectedCount }})
                </n-button>
              </div>

              <!-- 总开关 -->
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium">{{ $t('activity.noviceWelfare.k65b0') }}</span>
                <n-switch
                  v-model:value="globalSettings.noviceWelfareEnabled"
                  @update:value="handleGlobalToggle"
                  :loading="globalLoading"
                >
                  <template #checked>{{ $t('activity.noviceWelfare.k5f00') }}</template>
                  <template #unchecked>{{ $t('activity.formModal.k5173') }}</template>
                </n-switch>

                <!-- Help text -->
                <span class="ml-2 text-xs text-gray-500">{{ $t('activity.noviceWelfare.k53efk5373') }}</span>
              </div>

              <!-- 选择控制 -->
              <div class="flex gap-2">
                <n-button size="small" @click="clearSelection"
                  >{{ $t('activity.activityList.k6e05') }}</n-button
                >
                <n-button size="small" @click="selectAll">{{ $t('activity.formModal.k51683') }}</n-button>
              </div>
            </div>
          </div>
        </n-card>
      </template>

      <template #empty>
        <n-empty :description="$t('activity.rewardReport.k6682')" />
      </template>
    </SmartDataGrid>

    <!-- 底部统计信息 -->
    <div class="mt-4 flex items-center justify-between">
      <div class="text-sm text-gray-500">
        {{ $t('activity.common.totalRecordsLabel', [paginationReactive.total]) }}
      </div>
      <div class="text-sm font-medium">
        {{ $t('activity.common.totalActiveReward', [totalActiveReward.toFixed(2)]) }}
      </div>
    </div>

    <!-- 编辑/新增弹窗 -->
    <TaskFormModal
      v-model:show="showModal"
      :form-data="currentItem"
      :is-edit="isEdit"
      @submit="handleFormSubmit"
    />

    <!-- 详情弹窗 -->
    <TaskDetailModal v-model:show="showDetailModal" :task-data="currentItem" />

    <!-- 新人福利设置弹窗 -->
    <NoviceWelfareSettingsModal
      v-model:show="showSettingsModal"
      :task-data="currentItem"
      @submit="handleSettingsSubmit"
    />

    <!-- 新人福利全局设置弹窗 -->
    <NoviceWelfareGlobalModal
      v-model:show="showGlobalModal"
      @submit="handleGlobalSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { $t } from '@vben/locales';

import { ref, reactive, computed, onMounted, h } from 'vue';
import type { DataTableColumns, DataTableRowKey } from 'naive-ui';
import {
  NButton,
  NCard,
  NEmpty,
  NSwitch,
  NTag,
  NTooltip,
  NPopconfirm,
  useMessage,
  useDialog,
} from 'naive-ui';
import { renderTzDateTime } from '#/components/common/tzDateTimeRender';
// ✅ PERFORMANCE FIX: Lazy load components to avoid blocking page load
import { defineAsyncComponent } from 'vue';
const SmartDataGrid = defineAsyncComponent(
  () => import('../../../../components/smart/SmartDataGrid/index.vue'),
);
import {
  AddOutline,
  CreateOutline,
  EyeOutline,
  TrashOutline,
  ArrowUpOutline,
  RefreshOutline,
} from '@vicons/ionicons5';
import {
  getTaskCenterList,
  updateTaskCenter,
  deleteTaskCenter,
  getGlobalTaskSettings,
  updateGlobalTaskSettings,
  toggleTaskStatus,
  updateTaskSortOrder,
  bulkUpdateTaskCenters,
  type TaskCenter,
  type GlobalSettings,
} from '#/api/taskCenter';

// ✅ PERFORMANCE FIX: Lazy load modal components - they only load when modals are opened
const TaskFormModal = defineAsyncComponent(() => import('./TaskFormModal.vue'));
const TaskDetailModal = defineAsyncComponent(
  () => import('./TaskDetailModal.vue'),
);
const NoviceWelfareSettingsModal = defineAsyncComponent(
  () => import('./NoviceWelfareSettingsModal.vue'),
);
const NoviceWelfareGlobalModal = defineAsyncComponent(
  () => import('./NoviceWelfareGlobalModal.vue'),
);

// 响应式数据
const loading = ref(false);
const globalLoading = ref(false);
const tableData = ref<TaskCenter[]>([]);
const showModal = ref(false);
const showDetailModal = ref(false);
const showSettingsModal = ref(false);
const showGlobalModal = ref(false);
const currentItem = ref<TaskCenter | null>(null);
const isEdit = ref(false);

const message = useMessage();
const dialog = useDialog();

// 全局设置
const globalSettings = ref<GlobalSettings>({
  noviceWelfareEnabled: true,
  dailyTaskEnabled: true,
  weeklyTaskEnabled: true,
  threeDayMysteryEnabled: true,
});

// 分页设置
const paginationReactive = reactive({
  page: 1,
  pageSize: 20,
  total: 0,
});

// 计算已开启任务的总奖励金额
const totalActiveReward = computed(() => {
  return tableData.value
    .filter(
      (item) => item.isActive && globalSettings.value.noviceWelfareEnabled,
    )
    .reduce((sum, item) => sum + Number(item.rewardAmount), 0);
});

// Bulk operations computed
const hasSelectedRows = computed(() => selectedRowKeys.value.length > 0);

// Check if all tasks are inactive
const allTasksInactive = computed(
  () =>
    tableData.value.length > 0 &&
    tableData.value.every((task) => !task.isActive),
);

// 表格列定义
const columns: DataTableColumns<TaskCenter> = [
  {
    type: 'selection',
    width: 50,
  },
  {
    title: $t('activity.detailModal.k6392'),
    key: 'sortOrder',
    width: 80,
    align: 'center',
    render: (row) => {
      return h('div', { class: 'flex items-center gap-1' }, [
        h(
          NButton,
          {
            size: 'tiny',
            type: 'default',
            onClick: () => handleMoveToTop(row),
          },
          { default: () => $t('activity.noviceWelfare.k7f6e2') },
        ),
        h('span', { class: 'text-xs text-gray-500' }, `#${row.sortOrder}`),
      ]);
    },
  },
  {
    title: 'ID',
    key: 'id',
    width: 70,
    align: 'center',
  },
  {
    title: $t('activity.noviceWelfare.k4efb'),
    key: 'title',
    width: 200,
    ellipsis: {
      tooltip: true,
    },
  },
  {
    title: $t('activity.rewardReport.k5956'),
    key: 'rewardType',
    width: 100,
    align: 'center',
    render: (row) => {
      const typeMap: Record<string, string> = {
        CASH: $t('activity.rewardTypesShort.CASH'),
        BONUS: $t('activity.rewardTypesShort.BONUS'),
        POINTS: $t('activity.rewardTypesShort.POINTS'),
        FREE_SPINS: $t('activity.rewardTypesShort.FREE_SPINS'),
        DISCOUNT: $t('activity.rewardTypesShort.DISCOUNT'),
        CUSTOM: $t('activity.rewardTypesShort.CUSTOM'),
      };
      const color = row.rewardType === 'CASH' ? 'success' : 'warning';
      return h(
        NTag,
        { type: color, size: 'small' },
        { default: () => typeMap[row.rewardType] || row.rewardType },
      );
    },
  },
  {
    title: $t('activity.formModal.k5956'),
    key: 'rewardAmount',
    width: 120,
    align: 'center',
    render: (row) => {
      return h(
        'span',
        { class: 'font-medium text-green-600' },
        `${row.rewardAmount} BRL`,
      );
    },
  },
  {
    title: $t('activity.formModal.k671f'),
    key: 'expectedReward',
    width: 120,
    align: 'center',
    render: () => {
      return h('span', { class: 'text-gray-400' }, '--');
    },
  },
  {
    title: $t('activity.noviceWelfare.k663e'),
    key: 'displayAmount',
    width: 120,
    align: 'center',
    render: () => {
      return h('span', { class: 'text-gray-400' }, '--');
    },
  },
  {
    title: $t('activity.rewardReport.k6d3b5'),
    key: 'activityLevel',
    width: 80,
    align: 'center',
    render: () => {
      return h('span', { class: 'text-blue-600' }, '0');
    },
  },
  {
    title: $t('activity.noviceWelfare.k662f'),
    key: 'isActive',
    width: 100,
    align: 'center',
    render: (row) => {
      return h(
        NSwitch,
        {
          value: row.isActive,
          onUpdateValue: (value: boolean) => handleToggleStatus(row, value),
          loading: row.id === currentToggleId.value,
        },
        {
          checked: () => $t('activity.common.onLabel'),
          unchecked: () => $t('activity.common.offLabel'),
        },
      );
    },
  },
  {
    title: $t('activity.noviceWelfare.k63d0'),
    key: 'showTooltip',
    width: 100,
    align: 'center',
    render: (row) => {
      return h(
        NSwitch,
        {
          value: row.showTooltip || false,
          onUpdateValue: (value: boolean) => handleTooltipToggle(row, value),
          size: 'small',
        },
        {
          checked: () => $t('activity.common.onLabel'),
          unchecked: () => $t('activity.common.offLabel'),
        },
      );
    },
  },
  {
    title: $t('activity.rewardReport.k64cd'),
    key: 'actions',
    width: 150,
    align: 'center',
    fixed: 'right',
    render: (row) => {
      return h('div', { class: 'flex items-center gap-2' }, [
        h(
          NButton,
          {
            size: 'small',
            type: 'primary',
            ghost: true,
            onClick: () => handleEdit(row),
          },
          { default: () => $t('activity.luckyWheelEdit.k4fee') },
        ),
        h(
          NButton,
          {
            size: 'small',
            type: 'info',
            ghost: true,
            onClick: () => handleDetail(row),
          },
          { default: () => $t('activity.rewardReport.k8be6') },
        ),
      ]);
    },
  },
  {
    title: $t('activity.activityList.k64cd'),
    key: 'updatedBy',
    width: 100,
    ellipsis: {
      tooltip: true,
    },
  },
  {
    title: $t('activity.noviceWelfare.k64cd'),
    key: 'updatedAt',
    width: 160,
    render: (row) =>
      row.updatedAt ? renderTzDateTime(row.updatedAt) : '--',
  },
];

const currentToggleId = ref<number | null>(null);

// Bulk operations
const selectedRowKeys = ref<number[]>([]);

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

const handleRowClick = (row: TaskCenter) => {
  console.log('Row clicked:', row);
};

const clearSelection = () => {
  selectedRowKeys.value = [];
};

const selectAll = () => {
  selectedRowKeys.value = tableData.value.map((item) => item.id);
};

// 数据加载
const loadData = async () => {
  try {
    console.log('🔄 Loading task center data...');
    loading.value = true;
    const response = await getTaskCenterList({
      page: paginationReactive.page,
      limit: paginationReactive.pageSize,
      category: 'NOVICE_WELFARE',
      sortBy: 'sortOrder',
      sortOrder: 'asc',
    });

    console.log('📊 API Response:', response);

    // Handle both wrapped and unwrapped responses
    if (response && typeof response === 'object') {
      if (response.success === true && response.data) {
        // Wrapped response: {success: true, data: [...], total: number}
        tableData.value = response.data;
        paginationReactive.total = response.total;
        console.log(
          '✅ Data loaded successfully (wrapped):',
          response.data.length,
          'items',
        );
      } else if (Array.isArray(response)) {
        // Direct array response (after interceptor processing)
        tableData.value = response;
        paginationReactive.total = response.length;
        console.log(
          '✅ Data loaded successfully (direct):',
          response.length,
          'items',
        );
      } else if (response.data && Array.isArray(response.data)) {
        // Response with data array
        tableData.value = response.data;
        paginationReactive.total = response.total || response.data.length;
        console.log(
          '✅ Data loaded successfully (data array):',
          response.data.length,
          'items',
        );
      } else {
        console.error('❌ Unexpected response format:', response);
      }

      // Check if all tasks are inactive and auto-turn off global switch
      await checkAndUpdateGlobalSwitch();
    } else {
      console.error('❌ Invalid response format:', response);
    }
  } catch (error) {
    console.error('❌ Failed to load data:', error);
    message.error(
      $t('activity.common.loadDataFailed') +
        (error instanceof Error ? error.message : String(error)),
    );
  } finally {
    loading.value = false;
  }
};

// 加载全局设置
const loadGlobalSettings = async () => {
  try {
    const response = await getGlobalTaskSettings();
    if (response.success) {
      globalSettings.value = response.data;
    }
  } catch (error) {
    console.error('Failed to load global settings:', error);
  }
};

// 事件处理函数
const handleAdd = () => {
  // For novice welfare, "Add" opens global settings modal
  console.log('➕ Opening global novice welfare settings modal');
  showGlobalModal.value = true;
};

const handleEdit = (row: TaskCenter) => {
  // For novice welfare tasks, open settings modal instead of task edit modal
  console.log('🔧 Opening novice welfare settings for task:', row.title);
  currentItem.value = { ...row };
  showSettingsModal.value = true;
};

const handleDetail = (row: TaskCenter) => {
  currentItem.value = { ...row };
  showDetailModal.value = true;
};

const handleGlobalToggle = async (value: boolean) => {
  try {
    console.log('🔄 Global toggle requested:', value);
    console.log(
      '📊 Current task states:',
      tableData.value.map((t) => ({
        id: t.id,
        title: t.title,
        isActive: t.isActive,
      })),
    );

    globalLoading.value = true;
    await updateGlobalTaskSettings({ noviceWelfareEnabled: value });

    // Update local state
    globalSettings.value.noviceWelfareEnabled = value;

    message.success(value ? $t('activity.common.noviceWelfareOn') : $t('activity.common.noviceWelfareOff'));
    console.log('✅ Global toggle completed:', value);
  } catch (error) {
    console.error('Failed to update global settings:', error);
    message.error($t('activity.noviceWelfare.k66f42'));
    // 回滚状态
    globalSettings.value.noviceWelfareEnabled = !value;
  } finally {
    globalLoading.value = false;
  }
};

const handleToggleStatus = async (row: TaskCenter, value: boolean) => {
  try {
    currentToggleId.value = row.id;
    await toggleTaskStatus(row.id, value);

    // 更新本地数据
    const index = tableData.value.findIndex((item) => item.id === row.id);
    if (index > -1) {
      tableData.value[index].isActive = value;
    }

    message.success(value ? $t('activity.common.taskOn') : $t('activity.common.taskOff'));

    // Check if all tasks are now inactive and auto-turn off global switch
    await checkAndUpdateGlobalSwitch();
  } catch (error) {
    console.error('Failed to toggle status:', error);
    message.error($t('activity.noviceWelfare.k66f43'));
  } finally {
    currentToggleId.value = null;
  }
};

const handleTooltipToggle = async (row: TaskCenter, value: boolean) => {
  try {
    console.log(`🔄 Toggling tooltip for task ${row.id}: ${value}`);

    // 更新本地数据
    const index = tableData.value.findIndex((item) => item.id === row.id);
    if (index > -1) {
      tableData.value[index].showTooltip = value;
    }

    message.success(value ? $t('activity.common.bubbleOn') : $t('activity.common.bubbleOff'));

    // TODO: Add API call to save tooltip setting if needed
    // await updateTaskTooltip(row.id, value);
  } catch (error) {
    console.error('Failed to toggle tooltip:', error);
    message.error($t('activity.noviceWelfare.k66f4'));
  }
};

// Bulk operations
const handleCheck = (rowKeys: DataTableRowKey[]) => {
  selectedRowKeys.value = rowKeys.map((key) =>
    typeof key === 'string' ? parseInt(key) : key,
  );
};

const handleBulkActivate = async (selectedRows?: TaskCenter[]) => {
  const rowKeys = selectedRows
    ? selectedRows.map((row) => row.id)
    : selectedRowKeys.value;

  if (rowKeys.length === 0) {
    message.warning($t('activity.noviceWelfare.k8bf7'));
    return;
  }

  try {
    await bulkUpdateTaskCenters(rowKeys, { isActive: true });
    message.success($t('activity.common.batchEnableSuccess', [rowKeys.length]));
    selectedRowKeys.value = [];
    await loadData(); // Refresh data to show updated status
    await checkAndUpdateGlobalSwitch();
  } catch (error) {
    console.error('Failed to bulk activate tasks:', error);
    message.error($t('activity.noviceWelfare.k6279'));
  }
};

const handleBulkDeactivate = async (selectedRows?: TaskCenter[]) => {
  const rowKeys = selectedRows
    ? selectedRows.map((row) => row.id)
    : selectedRowKeys.value;

  if (rowKeys.length === 0) {
    message.warning($t('activity.noviceWelfare.k8bf72'));
    return;
  }

  try {
    await bulkUpdateTaskCenters(rowKeys, { isActive: false });
    message.success($t('activity.common.batchDisableSuccess', [rowKeys.length]));
    selectedRowKeys.value = [];
    await loadData(); // Refresh data to show updated status
    await checkAndUpdateGlobalSwitch();
  } catch (error) {
    console.error('Failed to bulk deactivate tasks:', error);
    message.error($t('activity.noviceWelfare.k62792'));
  }
};

// Check if all tasks are inactive and automatically turn off global switch
const checkAndUpdateGlobalSwitch = async () => {
  try {
    console.log('🔍 Checking global switch status...');
    console.log(
      '📊 Current global setting:',
      globalSettings.value.noviceWelfareEnabled,
    );
    console.log(
      ' Task states:',
      tableData.value.map((t) => ({
        id: t.id,
        title: t.title,
        isActive: t.isActive,
      })),
    );

    // Check if all tasks are inactive
    const allTasksInactive =
      tableData.value.length > 0 &&
      tableData.value.every((task) => !task.isActive);
    console.log('❓ All tasks inactive:', allTasksInactive);

    if (allTasksInactive && globalSettings.value.noviceWelfareEnabled) {
      console.log(
        '⚠️ Auto-turning off global switch because all tasks are inactive',
      );
      // Auto-turn off global switch when all tasks are inactive
      await updateGlobalTaskSettings({ noviceWelfareEnabled: false });
      globalSettings.value.noviceWelfareEnabled = false;
      message.info($t('activity.noviceWelfare.k6240k65b0'));
      console.log('✅ Global switch auto-turned off');
    } else {
      console.log('✅ No auto-turn-off needed');
    }
  } catch (error) {
    console.error('Failed to check and update global switch:', error);
    // Don't show error to user as this is an automatic background operation
  }
};

const handleMoveToTop = async (row: TaskCenter) => {
  try {
    // 将当前任务移到第一位，其他任务排序+1
    if (!tableData.value) {
      message.error($t('activity.noviceWelfare.k6570k65e0'));
      return;
    }

    const updates = tableData.value
      .filter((item) => item.sortOrder <= row.sortOrder)
      .map((item, index) => ({
        id: item.id,
        sortOrder: item.id === row.id ? 1 : item.sortOrder + 1,
      }));

    await updateTaskSortOrder(updates);
    message.success($t('activity.noviceWelfare.k5df2'));
    await loadData();
  } catch (error) {
    console.error('Failed to move to top:', error);
    message.error($t('activity.noviceWelfare.k7f6e'));
  }
};

const handleFormSubmit = async () => {
  showModal.value = false;
  await loadData();
  message.success(isEdit.value ? $t('activity.common.editSuccess') : $t('activity.common.createSuccess'));

  // Check if all tasks are inactive and auto-turn off global switch
  await checkAndUpdateGlobalSwitch();
};

const handleSettingsSubmit = async () => {
  // Refresh data after settings update
  await Promise.all([loadData(), loadGlobalSettings()]);
  console.log('✅ Settings updated, data refreshed');
};

const handleGlobalSubmit = async () => {
  // Refresh data after global settings update
  await Promise.all([loadData(), loadGlobalSettings()]);
  console.log('✅ Global settings updated, data refreshed');
};

const refreshData = async () => {
  await loadData();
  await loadGlobalSettings();

  // Check if all tasks are inactive and auto-turn off global switch
  await checkAndUpdateGlobalSwitch();
};

const handleSorterChange = async () => {
  // 处理表格排序变化
  await loadData();

  // Check if all tasks are inactive and auto-turn off global switch
  await checkAndUpdateGlobalSwitch();
};

const getRowClassName = (row: TaskCenter) => {
  if (!globalSettings.value.noviceWelfareEnabled || !row.isActive) {
    return 'opacity-60';
  }
  return '';
};

// 组件挂载时加载数据
onMounted(() => {
  console.log('🎯 NoviceWelfareManager mounted');
  loadData();
  loadGlobalSettings();
});
</script>

<style scoped>
.novice-welfare-manager {
  height: 100%;
}

:deep(.n-data-table) {
  --n-th-color: #f8fafc;
  --n-td-color: #ffffff;
}

:deep(.n-data-table .n-data-table-th) {
  font-weight: 600;
  color: #374151;
}

:deep(.opacity-60) {
  opacity: 0.6;
}

:deep(.n-data-table-td) {
  border-bottom: 1px solid #f3f4f6;
}

:deep(.n-data-table-tr:hover .n-data-table-td) {
  background-color: #f8fafc;
}
</style>
