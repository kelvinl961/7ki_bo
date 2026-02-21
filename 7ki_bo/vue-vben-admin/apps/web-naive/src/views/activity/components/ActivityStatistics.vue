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
          <div class="flex flex-col ml-4">
            <TimezoneDatePicker
              v-model="dateRange"
              @update:modelValue="handleDateRangeChange"
            />
          </div>
        </n-form-item>
        
        <n-form-item label="活动类型">
          <n-select
            v-model:value="filters.activityType"
            :options="activityTypeOptions"
            placeholder="请选择活动类型"
            clearable
            style="width: 150px"
            @update:value="handleFilterChange"
          />
        </n-form-item>
        
        <n-form-item label="状态">
          <n-select
            v-model:value="filters.status"
            :options="statusOptions"
            placeholder="请选择状态"
            clearable
            style="width: 120px"
            @update:value="handleFilterChange"
          />
        </n-form-item>
        
        <n-form-item label="币种">
          <n-select
            v-model:value="filters.currency"
            :options="currencyOptions"
            placeholder="请选择币种"
            clearable
            style="width: 100px"
            @update:value="handleFilterChange"
          />
        </n-form-item>
        
        <n-form-item>
          <n-button type="primary" @click="loadData">
            <template #icon>
              <i class="i-ion:search-outline" />
            </template>
            搜索
          </n-button>
        </n-form-item>
        
        <n-form-item>
          <n-button @click="handleExport" :loading="exporting">
            <template #icon>
              <i class="i-ion:download-outline" />
            </template>
            导出表格
          </n-button>
        </n-form-item>
      </n-form>
    </n-card>

    <!-- 统计概览卡片 -->
    <div class="overview-cards">
      <n-grid :cols="4" :x-gap="16">
        <n-gi>
          <n-card>
            <n-statistic label="总活动数" :value="overview.totalActivities">
              <template #prefix>
                <i class="i-ion:calendar-outline text-primary" />
              </template>
            </n-statistic>
          </n-card>
        </n-gi>
        <n-gi>
          <n-card>
            <n-statistic label="活跃活动" :value="overview.activeActivities">
              <template #prefix>
                <i class="i-ion:play-circle-outline text-success" />
              </template>
            </n-statistic>
          </n-card>
        </n-gi>
        <n-gi>
          <n-card>
            <n-statistic label="总参与人数" :value="overview.totalParticipants">
              <template #prefix>
                <i class="i-ion:people-outline text-info" />
              </template>
            </n-statistic>
          </n-card>
        </n-gi>
        <n-gi>
          <n-card>
            <n-statistic label="总奖励发放" :value="overview.totalRewardsDistributed" :precision="2">
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
        <div class="flex justify-between items-center">
          <span class="text-lg font-semibold">活动统计明细</span>
          <n-tag :type="loading ? 'info' : 'success'">
            {{ loading ? '加载中...' : `共 ${pagination.total} 条数据` }}
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
import { ref, reactive, onMounted, computed } from 'vue';
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
const TimezoneDatePicker = defineAsyncComponent(() => import('#/components/common/TimezoneDatePicker.vue'));
const QuickDateSelect = defineAsyncComponent(() => import('#/components/common/QuickDateSelect.vue'));
import {
  formatDateTimeInTimezone,
  getNowInTimezone,
  convertTimezoneToUTC,
  getDisplayTimezone
} from '#/utils/timezoneUtils';

// State
const message = useMessage();
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
  { label: '打码', value: 'wagering' },
  { label: '救援金', value: 'rescue' },
  { label: '签到', value: 'checkin' },
  { label: '推广', value: 'promotion' },
  { label: '充值', value: 'recharge' },
  { label: '幸运转盘', value: 'luckyspin' },
  { label: '幸运注单', value: 'luckywager' },
  { label: '红包', value: 'redpacket' },
  { label: '投资', value: 'investment' },
  { label: '代理', value: 'agent' },
  { label: '集字', value: 'collect' },
  { label: '竞猜', value: 'guessing' },
  { label: '新人彩金', value: 'newbie' },
];

const statusOptions: SelectOption[] = [
  { label: '草稿', value: 'draft' },
  { label: '活跃', value: 'active' },
  { label: '暂停', value: 'paused' },
  { label: '已归档', value: 'archived' },
];

const currencyOptions: SelectOption[] = [
  { label: 'BRL', value: 'BRL' },
  { label: 'USD', value: 'USD' },
  { label: 'EUR', value: 'EUR' },
];

// Table columns
const columns: DataTableColumns<ActivityStatistics> = [
  {
    title: '活动ID',
    key: 'activityId',
    width: 80,
    fixed: 'left',
  },
  {
    title: '活动名称',
    key: 'activityName',
    width: 200,
    fixed: 'left',
    ellipsis: {
      tooltip: true,
    },
  },
  {
    title: '会员币种',
    key: 'memberCurrency',
    width: 100,
    align: 'center',
  },
  {
    title: '活动时间',
    key: 'activityTime',
    width: 300,
    ellipsis: {
      tooltip: true,
    },
  },
  {
    title: '活动类型',
    key: 'activityTypeLabel',
    width: 100,
    align: 'center',
    render(row) {
      return h(NTag, { type: 'info', size: 'small' }, { default: () => row.activityTypeLabel });
    },
  },
  {
    title: '已领取人数',
    key: 'claimedUsers',
    width: 120,
    align: 'right',
    render(row) {
      return h('span', { class: 'text-success font-mono' }, row.claimedUsers.toLocaleString());
    },
  },
  {
    title: '领取次数',
    key: 'claimCount',
    width: 100,
    align: 'right',
    render(row) {
      return h('span', { class: 'text-info font-mono' }, row.claimCount.toLocaleString());
    },
  },
  {
    title: '可参与人数',
    key: 'eligibleUsers',
    width: 120,
    align: 'right',
    render(row) {
      return h('span', { class: 'text-primary font-mono' }, row.eligibleUsers.toLocaleString());
    },
  },
  {
    title: '已领取金额',
    key: 'claimedAmount',
    width: 120,
    align: 'right',
    render(row) {
      return h('span', { class: 'text-success font-mono' }, `${row.claimedAmount.toFixed(2)}`);
    },
  },
  {
    title: '活动金额',
    key: 'activityAmount',
    width: 120,
    align: 'right',
    render(row) {
      return h('span', { class: 'text-warning font-mono' }, `${row.activityAmount.toFixed(2)}`);
    },
  },
  {
    title: '状态',
    key: 'status',
    width: 100,
    align: 'center',
    render(row) {
      const statusMap: Record<string, { type: string; text: string }> = {
        draft: { type: 'default', text: '草稿' },
        active: { type: 'success', text: '活跃' },
        paused: { type: 'warning', text: '暂停' },
        archived: { type: 'error', text: '已归档' },
      };
      const statusInfo = statusMap[row.status] || { type: 'default', text: '未知' };
      return h(NTag, { type: statusInfo.type as any, size: 'small' }, { default: () => statusInfo.text });
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
  
  const tz = getDisplayTimezone();
  const tzNow = getNowInTimezone(tz);
  
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
  } else { // 'month'
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
  
  // Convert to UTC timestamps
  const startDateUTC = convertTimezoneToUTC(startYear, startMonth, startDay, 0, 0, 0, tz);
  const endDateUTC = convertTimezoneToUTC(endYear, endMonth, endDay, 23, 59, 59, tz);
  
  dateRange.value = [startDateUTC.getTime(), endDateUTC.getTime()];
};

// Methods
const getQueryParams = () => {
  const params: any = {
    page: pagination.value.page,
    limit: pagination.value.limit,
  };

  // Add date range - convert from display timezone to UTC
  if (dateRange.value && dateRange.value[0] && dateRange.value[1]) {
    const tz = getDisplayTimezone();
    const [start, end] = dateRange.value;
    const startDateObj = new Date(start);
    const endDateObj = new Date(end);
    
    // Get date components in display timezone
    const startTz = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).formatToParts(startDateObj);
    
    const endTz = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).formatToParts(endDateObj);
    
    const startUTC = convertTimezoneToUTC(
      parseInt(startTz.find(p => p.type === 'year')!.value),
      parseInt(startTz.find(p => p.type === 'month')!.value),
      parseInt(startTz.find(p => p.type === 'day')!.value),
      parseInt(startTz.find(p => p.type === 'hour')!.value),
      parseInt(startTz.find(p => p.type === 'minute')!.value),
      parseInt(startTz.find(p => p.type === 'second')!.value),
      tz
    );
    
    const endUTC = convertTimezoneToUTC(
      parseInt(endTz.find(p => p.type === 'year')!.value),
      parseInt(endTz.find(p => p.type === 'month')!.value),
      parseInt(endTz.find(p => p.type === 'day')!.value),
      parseInt(endTz.find(p => p.type === 'hour')!.value),
      parseInt(endTz.find(p => p.type === 'minute')!.value),
      parseInt(endTz.find(p => p.type === 'second')!.value),
      tz
    );
    
    params.startDate = startUTC.toISOString();
    params.endDate = endUTC.toISOString();
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
    const errorMessage = error?.response?.data?.message || error?.message || '加载活动统计数据失败';
    message.error(`加载活动统计数据失败: ${errorMessage}`);
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
    const errorMessage = error?.response?.data?.message || error?.message || '加载概览数据失败';
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
    message.success('导出成功');
  } catch (error) {
    console.error('Export error:', error);
    message.error('导出失败');
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

// Import h function for render functions
import { h } from 'vue';
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