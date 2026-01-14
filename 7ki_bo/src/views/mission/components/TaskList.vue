<template>
  <div class="task-list">
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
        <n-form-item label="任务标题">
          <n-input
            v-model:value="filterForm.keyword"
            placeholder="请输入任务标题或描述"
            clearable
            @keyup.enter="fetchData"
          />
        </n-form-item>
        <n-form-item label="任务类型">
          <n-select
            v-model:value="filterForm.taskType"
            placeholder="请选择任务类型"
            :options="taskTypeOptions"
            clearable
          />
        </n-form-item>
        <n-form-item label="奖励类型">
          <n-select
            v-model:value="filterForm.rewardType"
            placeholder="请选择奖励类型"
            :options="taskRewardTypeOptions"
            clearable
          />
        </n-form-item>
        <n-form-item label="状态">
          <n-select
            v-model:value="filterForm.isActive"
            placeholder="请选择状态"
            :options="statusOptions"
            clearable
          />
        </n-form-item>
        <n-form-item>
          <n-space>
            <n-button type="primary" @click="fetchData">搜索</n-button>
            <n-button @click="resetFilters">重置</n-button>
          </n-space>
        </n-form-item>
      </n-form>
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-2">
          <n-button type="primary" @click="$emit('add')">新增任务</n-button>
          <n-button type="error" :disabled="!checkedRowKeys.length" @click="handleBatchDelete">批量删除</n-button>
          <n-button @click="fetchData">刷新</n-button>
        </div>
        <div class="flex items-center gap-2">
          <n-text depth="3">共 {{ paginationConfig.itemCount }} 条记录</n-text>
        </div>
      </div>
    </n-card>
    <n-card>
      <n-data-table
        ref="tableRef"
        :columns="columns"
        :data="tableData"
        :loading="loading"
        :pagination="paginationConfig"
        :row-key="(row: any) => row.id"
        v-model:checked-row-keys="checkedRowKeys"
        striped
        flex-height
        style="height: 600px"
      />
    </n-card>
    <div class="summary-section">
      <div class="summary-item">
        <span class="label">总任务数：</span>
        <span class="value">{{ summary.totalTasks }}</span>
      </div>
      <div class="summary-item">
        <span class="label">已完成任务：</span>
        <span class="value">{{ summary.completedTasks }}</span>
      </div>
      <div class="summary-item">
        <span class="label">总参与人数：</span>
        <span class="value">{{ summary.totalParticipants }}</span>
      </div>
      <div class="summary-item">
        <span class="label">已用奖励总计：</span>
        <span class="value important">{{ summary.totalRewardAmount.toFixed(2) }} BRL</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, inject, h } from 'vue';
import { useMessage, useDialog, NButton, NTag, NSwitch, NTooltip, NPopconfirm, NText } from 'naive-ui';
import {
  TaskCategory,
  getTaskCenterList,
  updateTaskCenter,
  type TaskCenterItem,
  type TaskCenterQuery,
  taskTypeOptions,
  taskRewardTypeOptions,
  getTaskTypeLabel,
  getRewardTypeLabel
} from '../../../api/taskCenter';

interface Props {
  category: TaskCategory;
}

interface Emits {
  (e: 'refresh'): void;
  (e: 'add'): void;
  (e: 'edit', task: TaskCenterItem): void;
  (e: 'detail', task: TaskCenterItem): void;
  (e: 'delete', id: number): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();
const message = useMessage();
const dialog = useDialog();

// Inject refresh trigger
const refreshTrigger = inject<any>('refreshTrigger');

// Data
const loading = ref(false);
const tableData = ref<TaskCenterItem[]>([]);
const checkedRowKeys = ref<(string | number)[]>([]);
const filterForm = ref({
  keyword: '',
  taskType: null as string | null,
  rewardType: null as string | null,
  isActive: null as boolean | null,
});

// Pagination
const currentPage = ref(1);
const pageSize = ref(10);
const totalCount = ref(0);

// Summary
const summary = ref({
  totalTasks: 0,
  completedTasks: 0,
  totalParticipants: 0,
  totalRewardAmount: 0
});

// Status options
const statusOptions = [
  { label: '启用', value: true },
  { label: '停用', value: false }
];

// Pagination config
const paginationConfig = computed(() => ({
  page: currentPage.value,
  pageSize: pageSize.value,
  itemCount: totalCount.value,
  showSizePicker: true,
  pageSizes: [10, 20, 50, 100],
  onUpdatePage: (page: number) => {
    currentPage.value = page;
    fetchData();
  },
  onUpdatePageSize: (size: number) => {
    pageSize.value = size;
    currentPage.value = 1;
    fetchData();
  }
}));

// Table columns
const columns = [
  {
    type: 'selection',
    width: 40
  },
  {
    title: '排序',
    key: 'sortOrder',
    width: 80,
    render: (row: TaskCenterItem) => row.sortOrder
  },
  {
    title: 'ID',
    key: 'id',
    width: 80,
    render: (row: TaskCenterItem) => row.id
  },
  {
    title: '任务标题',
    key: 'title',
    width: 200,
    ellipsis: { tooltip: true }
  },
  {
    title: '任务类型',
    key: 'taskType',
    width: 120,
    render: (row: TaskCenterItem) => getTaskTypeLabel(row.taskType)
  },
  {
    title: '任务条件',
    key: 'taskConditions',
    width: 150,
    render: (row: TaskCenterItem) => {
      const conditions = row.taskConditions;
      return `${conditions.conditionType}: ${conditions.targetValue}`;
    }
  },
  {
    title: '奖励类型',
    key: 'rewardType',
    width: 100,
    render: (row: TaskCenterItem) => h(NTag, { size: 'small' }, () => getRewardTypeLabel(row.rewardType))
  },
  {
    title: '奖励金额',
    key: 'rewardAmount',
    width: 120,
    render: (row: TaskCenterItem) => `${row.rewardAmount} ${row.rewardCurrency}`
  },
  {
    title: '参与人数',
    key: 'participantCount',
    width: 100,
    render: (row: TaskCenterItem) => row.participantCount
  },
  {
    title: '完成人数',
    key: 'completedCount',
    width: 100,
    render: (row: TaskCenterItem) => row.completedCount
  },
  {
    title: '平台支持',
    key: 'platforms',
    width: 120,
    render: (row: TaskCenterItem) => {
      const platforms = [];
      if (row.platforms.android) platforms.push('Android');
      if (row.platforms.ios) platforms.push('iOS');
      if (row.platforms.h5) platforms.push('H5');
      if (row.platforms.pc) platforms.push('PC');
      return platforms.join(', ');
    }
  },
  {
    title: '状态',
    key: 'isActive',
    width: 100,
    render: (row: TaskCenterItem) => h(NSwitch, {
      value: row.isActive,
      onUpdateValue: (value: boolean) => handleStatusChange(row, value)
    })
  },
  {
    title: '修改时间',
    key: 'updatedAt',
    width: 160,
    render: (row: TaskCenterItem) => new Date(row.updatedAt).toLocaleString()
  },
  {
    title: '操作',
    key: 'actions',
    width: 180,
    fixed: 'right',
    render: (row: TaskCenterItem) => h('div', { class: 'action-buttons' }, [
      h(NButton, {
        size: 'small',
        quaternary: true,
        onClick: () => emit('detail', row)
      }, () => '查看'),
      h(NButton, {
        size: 'small',
        quaternary: true,
        onClick: () => emit('edit', row)
      }, () => '编辑'),
      h(NPopconfirm, {
        onPositiveClick: () => handleDelete(row.id),
        negativeText: '取消',
        positiveText: '确定'
      }, {
        default: () => '确定删除这个任务吗？',
        trigger: () => h(NButton, {
          size: 'small',
          quaternary: true,
          type: 'error'
        }, () => '删除')
      })
    ])
  }
];

const fetchData = async () => {
  loading.value = true;
  try {
    const params: TaskCenterQuery = {
      page: currentPage.value,
      limit: pageSize.value,
      category: props.category,
      search: filterForm.value.keyword || undefined,
      taskType: filterForm.value.taskType as any || undefined,
      rewardType: filterForm.value.rewardType as any || undefined,
      isActive: filterForm.value.isActive || undefined,
      sortBy: 'sortOrder',
      sortOrder: 'asc'
    };
    const response = await getTaskCenterList(params);
    tableData.value = response.tasks;
    totalCount.value = response.pagination.total;
    summary.value = response.statistics;
  } catch (error) {
    message.error('获取任务列表失败');
    console.error('Fetch tasks error:', error);
  } finally {
    loading.value = false;
  }
};

const resetFilters = () => {
  filterForm.value = {
    keyword: '',
    taskType: null,
    rewardType: null,
    isActive: null
  };
  currentPage.value = 1;
  fetchData();
};

const handleStatusChange = async (task: TaskCenterItem, value: boolean) => {
  try {
    await updateTaskCenter(task.id, { isActive: value });
    task.isActive = value;
    message.success(`任务${value ? '启用' : '停用'}成功`);
  } catch (error) {
    message.error('更新任务状态失败');
    console.error('Update task status error:', error);
  }
};

const handleDelete = (id: number) => {
  emit('delete', id);
};

const handleBatchDelete = () => {
  if (!checkedRowKeys.value.length) return;
  dialog.warning({
    title: '批量删除',
    content: `确定要删除选中的 ${checkedRowKeys.value.length} 个任务吗？`,
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      emit('delete', checkedRowKeys.value);
      checkedRowKeys.value = [];
      fetchData();
    }
  });
};

watch(refreshTrigger, () => {
  fetchData();
});

onMounted(() => {
  fetchData();
});
</script>

<style scoped lang="scss">
.task-list {
  .summary-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 16px;
    padding: 16px;
    background: #f8f9fa;
    border-radius: 8px;
    .summary-item {
      display: flex;
      align-items: center;
      gap: 8px;
      .label {
        font-size: 14px;
        color: #666;
      }
      .value {
        font-size: 16px;
        font-weight: 600;
        color: #333;
        &.important {
          color: #e74c3c;
          font-size: 18px;
        }
      }
    }
  }
}
</style> 