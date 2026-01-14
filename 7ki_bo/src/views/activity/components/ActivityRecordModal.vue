<template>
  <n-modal
    v-model:show="modalShow"
    preset="card"
    title="活动参与记录"
    style="width: 1000px; max-height: 90vh"
    :mask-closable="false"
  >
    <div class="activity-record">
      <!-- 活动信息 -->
      <div v-if="activityInfo" class="mb-4 p-4 bg-gray-50 rounded-lg">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <n-icon size="24" color="#1890ff">
              <Gift />
            </n-icon>
            <div>
              <h3 class="font-semibold text-gray-800">{{ activityInfo.title }}</h3>
              <div class="flex items-center gap-2 mt-1">
                <n-tag type="info" size="small">{{ activityInfo.category }}</n-tag>
                <n-tag :type="getStatusType(activityInfo.status)" size="small">
                  {{ getStatusText(activityInfo.status) }}
                </n-tag>
              </div>
            </div>
          </div>
          <div class="text-right">
            <p class="text-sm text-gray-600">总参与记录</p>
            <p class="text-2xl font-bold text-blue-600">{{ paginationConfig.itemCount }}</p>
          </div>
        </div>
      </div>

      <!-- 筛选条件 -->
      <n-card size="small" class="mb-4">
        <n-form
          ref="filterFormRef"
          inline
          :model="filterForm"
          label-placement="left"
          label-width="auto"
        >
          <n-form-item label="用户ID">
            <n-input
              v-model:value="filterForm.userId"
              placeholder="请输入用户ID"
              clearable
            />
          </n-form-item>
          
          <n-form-item label="参与时间">
            <n-date-picker
              v-model:value="filterForm.dateRange"
              type="daterange"
              placeholder="选择时间范围"
              clearable
            />
          </n-form-item>
          
          <n-form-item>
            <n-space>
              <n-button type="primary" @click="handleSearch">
                <template #icon>
                  <n-icon :component="Search" />
                </template>
                搜索
              </n-button>
              <n-button @click="handleReset">
                <template #icon>
                  <n-icon :component="Refresh" />
                </template>
                重置
              </n-button>
            </n-space>
          </n-form-item>
        </n-form>
      </n-card>

      <!-- 数据表格 -->
      <n-data-table
        ref="tableRef"
        :columns="columns"
        :data="tableData"
        :loading="loading"
        :pagination="paginationConfig"
        :row-key="(row) => row.id"
        @update:page="handlePageChange"
        @update:page-size="handlePageSizeChange"
        @update:sorter="handleSorterChange"
        striped
        flex-height
        style="height: 400px"
      />
    </div>

    <template #footer>
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-4">
          <n-statistic label="总参与人数" :value="paginationConfig.itemCount" />
          <n-statistic 
            label="总奖励金额" 
            :value="totalRewardAmount" 
            :formatter="(value) => `${value} ${activityInfo?.currency || 'BRL'}`"
          />
        </div>
        <n-button @click="handleClose">关闭</n-button>
      </div>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, h } from 'vue';
import type { DataTableColumns, FormInst } from 'naive-ui';
import {
  NModal,
  NCard,
  NForm,
  NFormItem,
  NInput,
  NDatePicker,
  NButton,
  NSpace,
  NIcon,
  NDataTable,
  NTag,
  NStatistic,
  useMessage,
} from 'naive-ui';
import { Search, Refresh, Gift, Person, Calendar, Wallet } from '@vicons/ionicons5';
import { 
  getActivityRecords,
  type ActivityRecord,
  type ActivityRecordQuery,
  type ActivityRecordResponse,
} from '#/api/activity';

// Props & Emits
interface Props {
  show: boolean;
  activityId?: number;
}

interface Emits {
  (e: 'update:show', value: boolean): void;
}

const props = withDefaults(defineProps<Props>(), {
  show: false,
  activityId: 0,
});

const emit = defineEmits<Emits>();

// 响应式数据
const modalShow = computed({
  get: () => props.show,
  set: (val) => emit('update:show', val),
});

const loading = ref(false);
const tableData = ref<ActivityRecord[]>([]);
const tableRef = ref();
const filterFormRef = ref<FormInst>();
const activityInfo = ref<any>(null);
const message = useMessage();

// 筛选表单
const filterForm = reactive<{
  userId: string;
  dateRange: [number, number] | null;
}>({
  userId: '',
  dateRange: null,
});

// 分页配置
const paginationConfig = reactive({
  page: 1,
  pageSize: 20,
  itemCount: 0,
  showSizePicker: true,
  pageSizes: [10, 20, 50, 100],
  showQuickJumper: true,
  prefix: ({ itemCount }: { itemCount: number }) => `共 ${itemCount} 条`,
});

// 计算总奖励金额
const totalRewardAmount = computed(() => {
  return tableData.value.reduce((sum, record) => sum + record.amount, 0);
});

// 表格列配置
const columns = computed<DataTableColumns<ActivityRecord>>(() => [
  {
    title: '记录ID',
    key: 'id',
    width: 80,
  },
  {
    title: '用户信息',
    key: 'userId',
    width: 150,
    render: (row) => h(
      'div',
      { class: 'flex items-center gap-2' },
      [
        h(NIcon, { size: 16, color: '#1890ff' }, { default: () => h(Person) }),
        h(
          'div',
          {},
          [
            h('div', { class: 'text-sm font-medium' }, `ID: ${row.userId}`),
            h('div', { class: 'text-xs text-gray-500' }, row.username),
          ]
        ),
      ]
    ),
  },
  {
    title: '参与时间',
    key: 'participatedAt',
    width: 160,
    render: (row) => h(
      'div',
      { class: 'flex items-center gap-2' },
      [
        h(NIcon, { size: 16, color: '#52c41a' }, { default: () => h(Calendar) }),
        h('span', { class: 'text-sm' }, new Date(row.participatedAt).toLocaleString()),
      ]
    ),
  },
  {
    title: '奖励金额',
    key: 'amount',
    width: 120,
    render: (row) => h(
      'div',
      { class: 'flex items-center gap-2' },
      [
        h(NIcon, { size: 16, color: '#faad14' }, { default: () => h(Wallet) }),
        h('span', { class: 'text-sm font-medium text-green-600' }, `${row.amount.toFixed(2)} ${activityInfo.value?.currency || 'BRL'}`),
      ]
    ),
  },
  {
    title: '状态',
    key: 'status',
    width: 100,
    render: (row) => {
      const statusConfig = {
        COMPLETED: { type: 'success', text: '已完成' },
        PENDING: { type: 'warning', text: '处理中' },
        FAILED: { type: 'error', text: '失败' },
      };
      const config = statusConfig[row.status as keyof typeof statusConfig] || { type: 'default', text: row.status };
      return h(NTag, { type: config.type as any, size: 'small' }, { default: () => config.text });
    },
  },
  {
    title: '备注',
    key: 'note',
    width: 200,
    ellipsis: {
      tooltip: true,
    },
    render: (row) => row.note || '-',
  },
]);

// 获取活动记录
const fetchActivityRecords = async () => {
  if (!props.activityId) return;
  
  loading.value = true;
  try {
    const params: ActivityRecordQuery = {
      page: paginationConfig.page,
      pageSize: paginationConfig.pageSize,
      sortBy: 'participatedAt',
      sortOrder: 'desc',
    };
    
    // 添加筛选条件
    if (filterForm.userId) {
      params.userId = parseInt(filterForm.userId);
    }
    
    if (filterForm.dateRange) {
      params.startDate = new Date(filterForm.dateRange[0]).toISOString();
      const endDate = new Date(filterForm.dateRange[1]);
      endDate.setHours(23, 59, 59, 999);
      params.endDate = endDate.toISOString();
    }
    
    const response = await getActivityRecords(props.activityId, params);
    tableData.value = response.records;
    activityInfo.value = response.activity;
    paginationConfig.itemCount = response.pagination.total;
  } catch (error) {
    message.error('获取活动记录失败');
    console.error('Error fetching activity records:', error);
  } finally {
    loading.value = false;
  }
};

// 事件处理
const handleSearch = () => {
  paginationConfig.page = 1;
  fetchActivityRecords();
};

const handleReset = () => {
  filterFormRef.value?.restoreValidation();
  Object.assign(filterForm, {
    userId: '',
    dateRange: null,
  });
  paginationConfig.page = 1;
  fetchActivityRecords();
};

const handlePageChange = (page: number) => {
  paginationConfig.page = page;
  fetchActivityRecords();
};

const handlePageSizeChange = (pageSize: number) => {
  paginationConfig.pageSize = pageSize;
  paginationConfig.page = 1;
  fetchActivityRecords();
};

const handleSorterChange = (sorter: any) => {
  // 处理排序逻辑
  console.log('Sorter changed:', sorter);
  fetchActivityRecords();
};

const handleClose = () => {
  modalShow.value = false;
};

// 工具函数
const getStatusType = (status: string) => {
  const statusMap = {
    DRAFT: 'warning',
    ACTIVE: 'success',
    CLOSED: 'error',
    ENDED: 'default',
  };
  return statusMap[status as keyof typeof statusMap] || 'default';
};

const getStatusText = (status: string) => {
  const statusMap = {
    DRAFT: '草稿',
    ACTIVE: '进行中',
    CLOSED: '已关闭',
    ENDED: '已结束',
  };
  return statusMap[status as keyof typeof statusMap] || status;
};

// 监听活动ID变化
watch(
  () => props.activityId,
  (newId) => {
    if (newId && props.show) {
      fetchActivityRecords();
    }
  },
  { immediate: true }
);

// 监听弹窗显示状态
watch(
  () => props.show,
  (show) => {
    if (show && props.activityId) {
      fetchActivityRecords();
    }
  }
);
</script>

<style scoped>
.activity-record {
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

:deep(.n-statistic-label) {
  font-size: 12px;
  color: #666;
}

:deep(.n-statistic-value) {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}
</style> 