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
                  </template>
                  新人福利设置
                </n-button>
                <n-button @click="refreshData">
                  <template #icon>
                    <RefreshOutline />
                  </template>
                  刷新
                </n-button>
              </div>

              <!-- 选择信息 -->
              <div class="text-sm text-gray-600">
                已选择 {{ selectedCount }} 条数据，共
                {{ paginationReactive.total }} 条
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
                  批量启用 ({{ selectedCount }})
                </n-button>
                <n-button
                  size="small"
                  type="warning"
                  @click="handleBulkDeactivate(selectedRows)"
                >
                  批量禁用 ({{ selectedCount }})
                </n-button>
              </div>

              <!-- 总开关 -->
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium">新人福利开关</span>
                <n-switch
                  v-model:value="globalSettings.noviceWelfareEnabled"
                  @update:value="handleGlobalToggle"
                  :loading="globalLoading"
                >
                  <template #checked>开</template>
                  <template #unchecked>关</template>
                </n-switch>

                <!-- Help text -->
                <span class="ml-2 text-xs text-gray-500">
                  (可手动开启，即使所有任务已禁用)
                </span>
              </div>

              <!-- 选择控制 -->
              <div class="flex gap-2">
                <n-button size="small" @click="clearSelection"
                  >清空选择</n-button
                >
                <n-button size="small" @click="selectAll">全选</n-button>
              </div>
            </div>
          </div>
        </n-card>
      </template>

      <template #empty>
        <n-empty description="暂无数据" />
      </template>
    </SmartDataGrid>

    <!-- 底部统计信息 -->
    <div class="mt-4 flex items-center justify-between">
      <div class="text-sm text-gray-500">
        共 {{ paginationReactive.total }} 条记录
      </div>
      <div class="text-sm font-medium">
        已开启奖励合计: {{ totalActiveReward.toFixed(2) }} BRL
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
    title: '排序',
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
          { default: () => '置顶' },
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
    title: '任务条件',
    key: 'title',
    width: 200,
    ellipsis: {
      tooltip: true,
    },
  },
  {
    title: '奖励类型',
    key: 'rewardType',
    width: 100,
    align: 'center',
    render: (row) => {
      const typeMap: Record<string, string> = {
        CASH: '固定',
        BONUS: '浮动',
        POINTS: '积分',
        FREE_SPINS: '免费旋转',
        DISCOUNT: '折扣',
        CUSTOM: '自定义',
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
    title: '奖励金额',
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
    title: '期望奖金',
    key: 'expectedReward',
    width: 120,
    align: 'center',
    render: () => {
      return h('span', { class: 'text-gray-400' }, '--');
    },
  },
  {
    title: '显示金额',
    key: 'displayAmount',
    width: 120,
    align: 'center',
    render: () => {
      return h('span', { class: 'text-gray-400' }, '--');
    },
  },
  {
    title: '活跃度',
    key: 'activityLevel',
    width: 80,
    align: 'center',
    render: () => {
      return h('span', { class: 'text-blue-600' }, '0');
    },
  },
  {
    title: '是否开启',
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
          checked: () => '开',
          unchecked: () => '关',
        },
      );
    },
  },
  {
    title: '提示气泡',
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
          checked: () => '开',
          unchecked: () => '关',
        },
      );
    },
  },
  {
    title: '操作',
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
          { default: () => '修改' },
        ),
        h(
          NButton,
          {
            size: 'small',
            type: 'info',
            ghost: true,
            onClick: () => handleDetail(row),
          },
          { default: () => '详情' },
        ),
      ]);
    },
  },
  {
    title: '操作人',
    key: 'updatedBy',
    width: 100,
    ellipsis: {
      tooltip: true,
    },
  },
  {
    title: '操作时间',
    key: 'updatedAt',
    width: 160,
    render: (row) => {
      return row.updatedAt
        ? new Date(row.updatedAt).toLocaleString('zh-CN')
        : '--';
    },
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
      '加载数据失败: ' +
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

    message.success(value ? '新人福利已开启' : '新人福利已关闭');
    console.log('✅ Global toggle completed:', value);
  } catch (error) {
    console.error('Failed to update global settings:', error);
    message.error('更新设置失败');
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

    message.success(value ? '任务已开启' : '任务已关闭');

    // Check if all tasks are now inactive and auto-turn off global switch
    await checkAndUpdateGlobalSwitch();
  } catch (error) {
    console.error('Failed to toggle status:', error);
    message.error('更新状态失败');
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

    message.success(value ? '提示气泡已开启' : '提示气泡已关闭');

    // TODO: Add API call to save tooltip setting if needed
    // await updateTaskTooltip(row.id, value);
  } catch (error) {
    console.error('Failed to toggle tooltip:', error);
    message.error('更新提示气泡失败');
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
    message.warning('请选择要启用的任务');
    return;
  }

  try {
    await bulkUpdateTaskCenters(rowKeys, { isActive: true });
    message.success(`成功启用 ${rowKeys.length} 个任务`);
    selectedRowKeys.value = [];
    await loadData(); // Refresh data to show updated status
    await checkAndUpdateGlobalSwitch();
  } catch (error) {
    console.error('Failed to bulk activate tasks:', error);
    message.error('批量启用失败');
  }
};

const handleBulkDeactivate = async (selectedRows?: TaskCenter[]) => {
  const rowKeys = selectedRows
    ? selectedRows.map((row) => row.id)
    : selectedRowKeys.value;

  if (rowKeys.length === 0) {
    message.warning('请选择要禁用的任务');
    return;
  }

  try {
    await bulkUpdateTaskCenters(rowKeys, { isActive: false });
    message.success(`成功禁用 ${rowKeys.length} 个任务`);
    selectedRowKeys.value = [];
    await loadData(); // Refresh data to show updated status
    await checkAndUpdateGlobalSwitch();
  } catch (error) {
    console.error('Failed to bulk deactivate tasks:', error);
    message.error('批量禁用失败');
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
      message.info('所有任务已禁用，新人福利开关已自动关闭');
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
      message.error('数据未加载，无法置顶');
      return;
    }

    const updates = tableData.value
      .filter((item) => item.sortOrder <= row.sortOrder)
      .map((item, index) => ({
        id: item.id,
        sortOrder: item.id === row.id ? 1 : item.sortOrder + 1,
      }));

    await updateTaskSortOrder(updates);
    message.success('已置顶');
    await loadData();
  } catch (error) {
    console.error('Failed to move to top:', error);
    message.error('置顶失败');
  }
};

const handleFormSubmit = async () => {
  showModal.value = false;
  await loadData();
  message.success(isEdit.value ? '修改成功' : '新增成功');

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
