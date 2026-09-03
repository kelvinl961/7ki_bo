<template>
  <div class="activity-statistics">
    <!-- 筛选器区域 -->
    <n-card class="filter-card" size="small">
      <n-form inline label-placement="left" :show-feedback="false">
        <n-form-item label="">
          <!-- 时间段快捷选择 (日/周/月) -->
          <div class="flex flex-col">
            <QuickDateSelect
              v-model="dateQuickSelect"
              @update:modelValue="handleQuickDateSelect"
            />
          </div>

          <!-- 日期范围选择器 -->
          <div class="ml-4 flex flex-col">
            <TimezoneDatePicker
              v-model="dateRange"
              @update:modelValue="handleDateRangeChange"
            />
          </div>
        </n-form-item>

        <n-form-item :label="$t('activity.activityList.k6d3b2')">
          <n-select
            v-model:value="filters.activityType"
            :options="activityTypeOptions"
            :placeholder="$t('activity.statistics.k8bf7')"
            clearable
            style="width: 150px"
            @update:value="handleFilterChange"
          />
        </n-form-item>

        <n-form-item :label="$t('activity.activityList.k72b6')">
          <n-select
            v-model:value="filters.status"
            :options="statusOptions"
            :placeholder="$t('activity.statistics.k8bf72')"
            clearable
            style="width: 120px"
            @update:value="handleFilterChange"
          />
        </n-form-item>

        <n-form-item :label="$t('activity.luckyWheel.k5e01')">
          <n-select
            v-model:value="filters.currency"
            :options="currencyOptions"
            :placeholder="$t('activity.activityList.k8bf73')"
            clearable
            style="width: 100px"
            @update:value="handleFilterChange"
          />
        </n-form-item>

        <n-form-item>
          <n-button type="primary" @click="loadData">
            <template #icon>
              <i class="i-ion:search-outline" />
            </template>{{ $t('activity.rewardReport.k641c') }}</n-button>
        </n-form-item>

        <n-form-item>
          <n-button @click="handleExport" :loading="exporting">
            <template #icon>
              <i class="i-ion:download-outline" />
            </template>{{ $t('activity.statistics.k5bfc') }}</n-button>
        </n-form-item>
      </n-form>
    </n-card>

    <!-- 统计概览卡片 -->
    <div class="overview-cards">
      <n-grid :cols="4" :x-gap="16">
        <n-gi>
          <n-card>
            <n-statistic :label="$t('activity.statistics.k603b')" :value="overview.totalActivities">
              <template #prefix>
                <i class="i-ion:calendar-outline text-primary" />
              </template>
            </n-statistic>
          </n-card>
        </n-gi>
        <n-gi>
          <n-card>
            <n-statistic :label="$t('activity.statistics.k6d3b')" :value="overview.activeActivities">
              <template #prefix>
                <i class="i-ion:play-circle-outline text-success" />
              </template>
            </n-statistic>
          </n-card>
        </n-gi>
        <n-gi>
          <n-card>
            <n-statistic :label="$t('activity.recordModal.k603b')" :value="overview.totalParticipants">
              <template #prefix>
                <i class="i-ion:people-outline text-info" />
              </template>
            </n-statistic>
          </n-card>
        </n-gi>
        <n-gi>
          <n-card>
            <n-statistic
              :label="$t('activity.statistics.k603b2')"
              :value="overview.totalRewardsDistributed"
              :precision="2"
            >
              <template #prefix>
                <i class="i-ion:diamond-outline text-warning" />
              </template>
              <template #suffix>
                <span class="text-sm text-gray-500">BRL</span>
              </template>
            </n-statistic>
          </n-card>
        </n-gi>
      </n-grid>
    </div>

    <!-- 活动统计表格 -->
    <n-card class="statistics-table">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="text-lg font-semibold">{{ $t('activity.statistics.k6d3b2') }}</span>
          <n-tag :type="loading ? 'info' : 'success'">
            {{ loading ? '加载中...' : $t('activity.common.statisticsDataCount', [pagination.total]) }}
          </n-tag>
        </div>
      </template>

      <n-data-table
        :columns="columns"
        :data="tableData"
        :loading="loading"
        :pagination="paginationConfig"
        :row-key="(row) => row.activityId"
        size="medium"
        striped
        :scroll-x="1400"
      />
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { $t } from '@vben/locales';

import { ref, reactive, onMounted, computed, h, watch } from 'vue';
import {
  NCard,
  NForm,
  NFormItem,
  NSelect,
  NButton,
  NGrid,
  NGi,
  NStatistic,
  NDataTable,
  NTag,
  useMessage,
  type DataTableColumns,
  type SelectOption,
} from 'naive-ui';
import {
  getActivityStatistics,
  getActivityOverview,
  exportActivityStats,
  type ActivityStatistics,
  type ActivityOverview,
} from '#/api/activityStats';
// ✅ PERFORMANCE FIX: Lazy load components to avoid blocking page load
import { defineAsyncComponent } from 'vue';
const TimezoneDatePicker = defineAsyncComponent(
  () => import('#/components/common/TimezoneDatePicker.vue'),
);
const QuickDateSelect = defineAsyncComponent(
  () => import('#/components/common/QuickDateSelect.vue'),
);
import {
  displayCalendarRangeToPicker,
  getNowInTimezone,
  pickerRangeToUtcIso,
} from '#/utils/timezoneUtils';
import { renderTzDateTime } from '#/components/common/tzDateTimeRender';
import { useDisplayTimezone } from '#/composables/useDisplayTimezone';

// State
const message = useMessage();
const { timezone } = useDisplayTimezone();
const loading = ref(false);
const exporting = ref(false);

// Date range - default to "日" (day) - today
const dateQuickSelect = ref<'day' | 'week' | 'month'>('day');
const dateRange = ref<[number, number] | null>(null);

// Filters
const filters = reactive({
  activityType: null as string | null,
  status: null as string | null,
  currency: 'BRL' as string | null,
});

// Data
const tableData = ref<ActivityStatistics[]>([]);
const overview = ref<ActivityOverview>({
  totalActivities: 0,
  activeActivities: 0,
  totalParticipants: 0,
  totalRewardsClaimed: 0,
  totalRewardsDistributed: 0,
  averageParticipationRate: 0,
  topPerformingActivity: null,
});

const pagination = ref({
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
});

// Options
const activityTypeOptions: SelectOption[] = [
  { label: $t('activity.detailModal.k6253'), value: 'wagering' },
  { label: $t('activity.detailModal.k6551'), value: 'rescue' },
  { label: $t('activity.detailModal.k7b7e'), value: 'checkin' },
  { label: $t('activity.rewardReport.k63a8'), value: 'promotion' },
  { label: $t('activity.detailModal.k5145'), value: 'recharge' },
  { label: $t('activity.detailModal.k5e78'), value: 'luckywager' },
  { label: $t('activity.rewardReport.k7ea2'), value: 'redpacket' },
  { label: $t('activity.detailModal.k6295'), value: 'investment' },
  { label: $t('activity.detailModal.k4ee3'), value: 'agent' },
  { label: $t('activity.detailModal.k96c6'), value: 'collect' },
  { label: $t('activity.detailModal.k7ade'), value: 'guessing' },
  { label: $t('activity.rewardReport.k65b02'), value: 'newbie' },
  { label: $t('activity.detailModal.k81ea'), value: 'custom' },
];

const statusOptions: SelectOption[] = [
  { label: $t('activity.detailModal.k8349'), value: 'draft' },
  { label: $t('activity.statistics.k6d3b3'), value: 'active' },
  { label: $t('activity.activityList.k6682'), value: 'paused' },
  { label: $t('activity.detailModal.k5df25'), value: 'archived' },
];

const currencyOptions: SelectOption[] = [
  { label: 'BRL', value: 'BRL' },
  { label: 'USD', value: 'USD' },
  { label: 'EUR', value: 'EUR' },
];

// Table columns
const columns: DataTableColumns<ActivityStatistics> = [
  {
    title: $t('activity.rewardReport.k6d3b2'),
    key: 'activityId',
    width: 80,
    fixed: 'left',
  },
  {
    title: $t('activity.rewardReport.k6d3b'),
    key: 'activityName',
    width: 200,
    fixed: 'left',
    ellipsis: {
      tooltip: true,
    },
  },
  {
    title: $t('activity.rewardReport.k4f1a'),
    key: 'memberCurrency',
    width: 100,
    align: 'center',
  },
  {
    title: $t('activity.activityList.k6d3b3'),
    key: 'activityTime',
    width: 300,
    ellipsis: {
      tooltip: true,
    },
    render(row) {
      if (row.startsAt || row.endsAt) {
        return h('span', [
          renderTzDateTime(row.startsAt),
          ' ~ ',
          renderTzDateTime(row.endsAt),
        ]);
      }
      return row.activityTime || '-';
    },
  },
  {
    title: $t('activity.activityList.k6d3b2'),
    key: 'activityTypeLabel',
    width: 100,
    align: 'center',
    render(row) {
      return h(
        NTag,
        { type: 'info', size: 'small' },
        { default: () => row.activityTypeLabel },
      );
    },
  },
  {
    title: $t('activity.statistics.k5df2'),
    key: 'claimedUsers',
    width: 120,
    align: 'right',
    render(row) {
      return h(
        'span',
        { class: 'text-success font-mono' },
        row.claimedUsers.toLocaleString(),
      );
    },
  },
  {
    title: $t('activity.formModal.k9886'),
    key: 'claimCount',
    width: 100,
    align: 'right',
    render(row) {
      return h(
        'span',
        { class: 'text-info font-mono' },
        row.claimCount.toLocaleString(),
      );
    },
  },
  {
    title: $t('activity.statistics.k53ef'),
    key: 'eligibleUsers',
    width: 120,
    align: 'right',
    render(row) {
      return h(
        'span',
        { class: 'text-primary font-mono' },
        row.eligibleUsers.toLocaleString(),
      );
    },
  },
  {
    title: $t('activity.statistics.k5df22'),
    key: 'claimedAmount',
    width: 120,
    align: 'right',
    render(row) {
      return h(
        'span',
        { class: 'text-success font-mono' },
        `${row.claimedAmount.toFixed(2)}`,
      );
    },
  },
  {
    title: $t('activity.statistics.k6d3b4'),
    key: 'activityAmount',
    width: 120,
    align: 'right',
    render(row) {
      return h(
        'span',
        { class: 'text-warning font-mono' },
        `${row.activityAmount.toFixed(2)}`,
      );
    },
  },
  {
    title: $t('activity.activityList.k72b6'),
    key: 'status',
    width: 100,
    align: 'center',
    render(row) {
      const statusMap: Record<string, { type: string; text: string }> = {
        draft: { type: 'default', text: $t('activity.detailModal.k8349') },
        active: { type: 'success', text: $t('activity.statistics.k6d3b3') },
        paused: { type: 'warning', text: $t('activity.activityList.k6682') },
        archived: { type: 'error', text: $t('activity.detailModal.k5df25') },
      };
      const statusInfo = statusMap[row.status] || {
        type: 'default',
        text: $t('activity.statistics.k672a'),
      };
      return h(
        NTag,
        { type: statusInfo.type as any, size: 'small' },
        { default: () => statusInfo.text },
      );
    },
  },
];

// Pagination config
const paginationConfig = computed(() => ({
  page: pagination.value.page,
  pageSize: pagination.value.limit,
  itemCount: pagination.value.total,
  showSizePicker: true,
  pageSizes: [10, 20, 50, 100],
  onUpdatePage: (page: number) => {
    pagination.value.page = page;
    loadData();
  },
  onUpdatePageSize: (pageSize: number) => {
    pagination.value.limit = pageSize;
    pagination.value.page = 1;
    loadData();
  },
}));

// Date range handlers
const handleQuickDateSelect = (value: 'day' | 'week' | 'month' | null) => {
  if (!value) return;

  const tzNow = getNowInTimezone();

  let startYear: number, startMonth: number, startDay: number;
  let endYear: number, endMonth: number, endDay: number;

  if (value === 'day') {
    // Today
    startYear = tzNow.year;
    startMonth = tzNow.month;
    startDay = tzNow.day;
    endYear = tzNow.year;
    endMonth = tzNow.month;
    endDay = tzNow.day;
  } else if (value === 'week') {
    // Last 7 days
    const weekAgo = new Date(tzNow.year, tzNow.month - 1, tzNow.day);
    weekAgo.setDate(weekAgo.getDate() - 7);
    startYear = weekAgo.getFullYear();
    startMonth = weekAgo.getMonth() + 1;
    startDay = weekAgo.getDate();
    endYear = tzNow.year;
    endMonth = tzNow.month;
    endDay = tzNow.day;
  } else {
    // 'month'
    // Last 30 days
    const monthAgo = new Date(tzNow.year, tzNow.month - 1, tzNow.day);
    monthAgo.setDate(monthAgo.getDate() - 30);
    startYear = monthAgo.getFullYear();
    startMonth = monthAgo.getMonth() + 1;
    startDay = monthAgo.getDate();
    endYear = tzNow.year;
    endMonth = tzNow.month;
    endDay = tzNow.day;
  }

  dateRange.value = displayCalendarRangeToPicker(
    startYear,
    startMonth,
    startDay,
    endYear,
    endMonth,
    endDay,
  );
};

// Methods
const getQueryParams = () => {
  const params: any = {
    page: pagination.value.page,
    limit: pagination.value.limit,
  };

  // Add date range - convert from display timezone to UTC
  if (dateRange.value && dateRange.value[0] && dateRange.value[1]) {
    const { startDate, endDate } = pickerRangeToUtcIso(dateRange.value);
    params.startDate = startDate;
    params.endDate = endDate;
  }

  // Add filters
  if (filters.activityType) params.activityType = filters.activityType;
  if (filters.status) params.status = filters.status;
  if (filters.currency) params.currency = filters.currency;

  return params;
};

const loadData = async () => {
  loading.value = true;
  try {
    const params = getQueryParams();

    // Load main statistics
    const [statsResponse, overviewResponse] = await Promise.all([
      getActivityStatistics(params),
      getActivityOverview({
        startDate: params.startDate,
        endDate: params.endDate,
        currency: params.currency,
      }),
    ]);

    tableData.value = statsResponse.statistics;
    pagination.value = statsResponse.pagination;
    overview.value = overviewResponse;
  } catch (error: any) {
    console.error('Error loading activity statistics:', error);
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      '加载活动统计数据失败';
    message.error($t('activity.common.loadStatisticsFailed') + errorMessage);
  } finally {
    loading.value = false;
  }
};

const loadOverview = async () => {
  try {
    const params = getQueryParams();
    const response = await getActivityOverview({
      startDate: params.startDate,
      endDate: params.endDate,
      currency: params.currency,
    });

    overview.value = response;
  } catch (error: any) {
    console.error('Error loading overview:', error);
    const errorMessage =
      error?.response?.data?.message || error?.message || '加载概览数据失败';
    message.error(`加载概览数据失败: ${errorMessage}`);
  }
};

const handleDateRangeChange = (value: [number, number] | null) => {
  dateRange.value = value;
  dateQuickSelect.value = null as any; // Clear quick select when manually changing date range
  pagination.value.page = 1;
  loadData();
  loadOverview();
};

const handleFilterChange = () => {
  pagination.value.page = 1;
  loadData();
  loadOverview();
};

const handleExport = async () => {
  exporting.value = true;
  try {
    const params = getQueryParams();
    await exportActivityStats(params);
    message.success($t('activity.statistics.k5bfc2'));
  } catch (error) {
    console.error('Export error:', error);
    message.error($t('activity.statistics.k5bfc3'));
  } finally {
    exporting.value = false;
  }
};

// Lifecycle
onMounted(() => {
  // Set default date range to "日" (day)
  handleQuickDateSelect('day');
  loadData();
  loadOverview();
});

watch(timezone, () => {
  if (dateQuickSelect.value) {
    handleQuickDateSelect(dateQuickSelect.value);
  }
});
</script>

<style scoped>
.activity-statistics {
  padding: 16px;
  min-height: 100%;
  background-color: #f5f5f5;
}

.filter-card {
  margin-bottom: 16px;
}

.overview-cards {
  margin-bottom: 16px;
}

.statistics-table {
  margin-bottom: 16px;
}

:deep(.n-statistic) {
  text-align: center;
}

:deep(.n-statistic-value) {
  font-weight: 600;
}

:deep(.n-data-table th) {
  background-color: #fafafa;
  font-weight: 600;
}

:deep(.n-data-table td) {
  border-bottom: 1px solid #f0f0f0;
}

.text-primary {
  color: #1890ff;
}

.text-success {
  color: #52c41a;
}

.text-info {
  color: #13c2c2;
}

.text-warning {
  color: #faad14;
}

.text-error {
  color: #ff4d4f;
}

.font-mono {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}
</style>
