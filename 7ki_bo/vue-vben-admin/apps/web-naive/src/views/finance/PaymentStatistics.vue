<template>
  <div class="payment-statistics">
    <!-- Header -->
    <div class="header-section">
      <n-card :bordered="false" class="rounded-16px shadow-sm">
        <div class="mb-4 flex items-center justify-between">
          <div>
            <h2 class="text-xl font-semibold text-gray-800">代付统计</h2>
            <p class="mt-1 text-sm text-gray-600">
              查看对应三方代付出款的成功总数、成功率
            </p>
          </div>
          <div class="flex gap-3">
            <n-button type="primary" @click="fetchData" :loading="loading">
              <template #icon>
                <n-icon><ReloadOutline /></n-icon>
              </template>
              刷新
            </n-button>
            <n-button type="info" @click="exportReport">
              <template #icon>
                <n-icon><DownloadOutline /></n-icon>
              </template>
              导出报表
            </n-button>
          </div>
        </div>

        <!-- Search Filters -->
        <div
          class="filter-section mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6"
        >
          <!-- Date Range -->
          <div class="filter-item">
            <n-form-item label="统计时间">
              <n-date-picker
                v-model:value="filters.dateRange"
                type="daterange"
                format="yyyy-MM-dd"
                placeholder="选择时间范围"
                clearable
                size="small"
                class="w-full"
              />
            </n-form-item>
          </div>

          <!-- Third Party Provider -->
          <div class="filter-item">
            <n-form-item label="三方代付">
              <n-select
                v-model:value="filters.provider"
                placeholder="选择代付商"
                clearable
                size="small"
                :options="providerOptions"
              />
            </n-form-item>
          </div>

          <!-- Currency -->
          <div class="filter-item">
            <n-form-item label="币种">
              <n-select
                v-model:value="filters.currency"
                placeholder="选择币种"
                clearable
                size="small"
                :options="currencyOptions"
              />
            </n-form-item>
          </div>

          <!-- Member Account -->
          <div class="filter-item">
            <n-form-item label="会员账号">
              <n-input
                v-model:value="filters.memberAccount"
                placeholder="请输入会员账号"
                clearable
                size="small"
              />
            </n-form-item>
          </div>

          <!-- Withdrawal Count Filter -->
          <div class="filter-item">
            <n-form-item label="会员提现次数">
              <n-select
                v-model:value="filters.withdrawalTimes"
                placeholder="选择提现次数"
                clearable
                size="small"
                :options="withdrawalCountOptions"
              />
            </n-form-item>
          </div>

          <div class="filter-item flex items-end">
            <n-button
              type="primary"
              @click="fetchData"
              size="small"
              class="mr-2"
            >
              <template #icon
                ><n-icon><SearchOutline /></n-icon
              ></template>
              搜索
            </n-button>
            <n-button @click="resetFilters" size="small">重置</n-button>
          </div>
        </div>
      </n-card>
    </div>

    <!-- Statistics Overview -->
    <div class="statistics-overview mt-4">
      <n-card :bordered="false" class="rounded-16px shadow-sm">
        <h3 class="mb-4 text-lg font-semibold">统计概览</h3>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div class="stat-card">
            <n-card size="small">
              <div class="text-center">
                <div class="text-3xl font-bold text-blue-600">
                  {{ statistics.totalOrders }}
                </div>
                <div class="mt-1 text-sm text-gray-600">总订单数</div>
              </div>
            </n-card>
          </div>
          <div class="stat-card">
            <n-card size="small">
              <div class="text-center">
                <div class="text-3xl font-bold text-green-600">
                  {{ statistics.successOrders }}
                </div>
                <div class="mt-1 text-sm text-gray-600">成功订单数</div>
              </div>
            </n-card>
          </div>
          <div class="stat-card">
            <n-card size="small">
              <div class="text-center">
                <div class="text-3xl font-bold text-orange-600">
                  {{ statistics.successRate }}%
                </div>
                <div class="mt-1 text-sm text-gray-600">成功率</div>
              </div>
            </n-card>
          </div>
          <div class="stat-card">
            <n-card size="small">
              <div class="text-center">
                <div class="text-3xl font-bold text-purple-600">
                  {{ statistics.totalAmount }}
                </div>
                <div class="mt-1 text-sm text-gray-600">总金额</div>
              </div>
            </n-card>
          </div>
        </div>
      </n-card>
    </div>

    <!-- SmartDataGrid -->
    <SmartDataGrid
      :data="tableData"
      :columns="columns"
      :loading="loading"
      :pagination="paginationReactive"
      :scroll-x="1600"
      size="small"
      class="statistics-table"
      @update:page="handlePageChange"
      @update:page-size="handlePageSizeChange"
      @refresh="fetchData"
      @row-click="handleRowClick"
    >
      <template #actionBar>
        <n-card :bordered="false" class="rounded-16px shadow-sm">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <!-- 主要操作按钮 -->
              <div class="flex gap-2">
                <n-button type="primary" @click="fetchData" :loading="loading">
                  <template #icon>
                    <n-icon><ReloadOutline /></n-icon>
                  </template>
                  刷新
                </n-button>
                <n-button type="info" @click="exportReport">
                  <template #icon>
                    <n-icon><DownloadOutline /></n-icon>
                  </template>
                  导出报表
                </n-button>
              </div>

              <!-- 标题和统计信息 -->
              <div class="flex items-center gap-4">
                <h3 class="text-lg font-semibold">详细统计</h3>
                <div class="text-sm text-gray-600">
                  共 {{ paginationReactive.total }} 条统计记录
                  <n-tag type="info" size="small" class="ml-2">
                    代付统计
                  </n-tag>
                </div>
              </div>
            </div>
          </div>
        </n-card>
      </template>
    </SmartDataGrid>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, h } from 'vue';
// ✅ PERFORMANCE FIX: Lazy load components to avoid blocking page load
import { defineAsyncComponent } from 'vue';
const SmartDataGrid = defineAsyncComponent(
  () => import('../../components/smart/SmartDataGrid/index.vue'),
);
import {
  NButton,
  NCard,
  NDataTable,
  NInput,
  NSelect,
  NFormItem,
  NDatePicker,
  NTag,
  NIcon,
  NProgress,
  useMessage,
  type DataTableColumns,
} from 'naive-ui';
import {
  ReloadOutline,
  SearchOutline,
  DownloadOutline,
} from '@vicons/ionicons5';
import {
  getPaymentStatistics,
  exportPaymentStatistics,
} from '#/api/finance/paymentStatistics';

interface PaymentStatistic {
  id: string;
  provider: string;
  providerName: string;
  currency: string;
  totalOrders: number;
  successOrders: number;
  failedOrders: number;
  successRate: number;
  totalAmount: number;
  successAmount: number;
  avgProcessingTime: string;
  date: string;
  memberStats: {
    firstTime: number;
    multiple: number;
    never: number;
  };
  [key: string]: any;
}

const message = useMessage();

// Data and state
const loading = ref(false);
const tableData = ref<PaymentStatistic[]>([]);

// Filters
const filters = reactive({
  dateRange: null,
  provider: null,
  currency: null,
  memberAccount: '',
  withdrawalTimes: null,
});

// Statistics
const statistics = reactive({
  totalOrders: 0,
  successOrders: 0,
  successRate: 0,
  totalAmount: '0.00',
});

// Pagination - SmartDataGrid compatible
const paginationReactive = reactive({
  page: 1,
  pageSize: 20,
  total: 0,
});

// SmartDataGrid event handlers
const handlePageChange = (page: number) => {
  paginationReactive.page = page;
  fetchData();
};

const handlePageSizeChange = (pageSize: number) => {
  paginationReactive.pageSize = pageSize;
  paginationReactive.page = 1;
  fetchData();
};

const handleRowClick = (_row: PaymentStatistic) => {
  // console.log('Row clicked:', row);
};

// Options
const providerOptions = [
  { label: 'PIX支付', value: 'pix' },
  { label: 'PIX自动', value: 'pix_auto' },
  { label: '银行转账', value: 'bank_transfer' },
  { label: '人工代付', value: 'manual' },
  { label: '第三方代付', value: 'third_party' },
  { label: '未知渠道', value: 'unknown' },
];

const currencyOptions = [
  { label: 'BRL', value: 'BRL' },
  { label: 'USD', value: 'USD' },
  { label: 'EUR', value: 'EUR' },
];

const withdrawalCountOptions = [
  { label: '全部会员', value: 'all' },
  { label: '首次提现', value: 'first' },
  { label: '多次提现', value: 'multiple' },
];

// Table columns
const columns: DataTableColumns<PaymentStatistic> = [
  {
    title: '日期',
    key: 'date',
    width: 120,
    render: (row) => h('div', { class: 'text-center' }, row.date),
  },
  {
    title: '三方代付',
    key: 'providerName',
    width: 150,
    render: (row) =>
      h('div', { class: 'text-center font-medium' }, row.providerName),
  },
  {
    title: '币种',
    key: 'currency',
    width: 80,
    render: (row) => h('div', { class: 'text-center' }, row.currency),
  },
  {
    title: '总订单数',
    key: 'totalOrders',
    width: 100,
    render: (row) =>
      h(
        'div',
        { class: 'text-center font-bold' },
        row.totalOrders.toLocaleString(),
      ),
  },
  {
    title: '成功订单数',
    key: 'successOrders',
    width: 120,
    render: (row) =>
      h(
        'div',
        { class: 'text-center text-green-600 font-bold' },
        row.successOrders.toLocaleString(),
      ),
  },
  {
    title: '失败订单数',
    key: 'failedOrders',
    width: 120,
    render: (row) =>
      h(
        'div',
        { class: 'text-center text-red-600 font-bold' },
        row.failedOrders.toLocaleString(),
      ),
  },
  {
    title: '成功率',
    key: 'successRate',
    width: 120,
    render: (row) =>
      h('div', { class: 'text-center' }, [
        h(NProgress, {
          type: 'line',
          percentage: row.successRate,
          color:
            row.successRate >= 80
              ? '#18a058'
              : row.successRate >= 60
                ? '#f0a020'
                : '#d03050',
          size: 'small',
        }),
        h('div', { class: 'text-sm mt-1 font-medium' }, `${row.successRate}%`),
      ]),
  },
  {
    title: '总金额',
    key: 'totalAmount',
    width: 120,
    render: (row) =>
      h(
        'div',
        { class: 'text-center font-mono' },
        `${row.currency} ${row.totalAmount.toLocaleString()}`,
      ),
  },
  {
    title: '成功金额',
    key: 'successAmount',
    width: 120,
    render: (row) =>
      h(
        'div',
        { class: 'text-center font-mono text-green-600' },
        `${row.currency} ${row.successAmount.toLocaleString()}`,
      ),
  },
  {
    title: '平均处理时间',
    key: 'avgProcessingTime',
    width: 120,
    render: (row) => h('div', { class: 'text-center' }, row.avgProcessingTime),
  },
  {
    title: '会员提现统计',
    key: 'memberStats',
    width: 150,
    render: (row) =>
      h('div', { class: 'text-center text-sm' }, [
        h('div', `未提现: ${row.memberStats.never}`),
        h('div', `首次: ${row.memberStats.firstTime}`),
        h('div', `多次: ${row.memberStats.multiple}`),
      ]),
  },
];

// Methods
const fetchData = async () => {
  loading.value = true;
  try {
    console.log('🔄 Fetching payment statistics...');

    // Build API parameters
    const params: any = {
      page: paginationReactive.page,
      limit: paginationReactive.pageSize,
    };

    // Add filters
    if (filters.dateRange && filters.dateRange.length === 2) {
      params.startDate = new Date(filters.dateRange[0])
        .toISOString()
        .split('T')[0];
      const endDate = new Date(filters.dateRange[1]);
      endDate.setHours(23, 59, 59, 999);
      params.endDate = endDate.toISOString().split('T')[0];
    }

    if (filters.provider) params.provider = filters.provider;
    if (filters.currency) params.currency = filters.currency;
    if (filters.memberAccount) params.memberAccount = filters.memberAccount;
    if (filters.withdrawalTimes && filters.withdrawalTimes !== 'all') {
      params.withdrawalTimes = filters.withdrawalTimes;
    }

    console.log('📡 API params:', params);

    const response = await getPaymentStatistics(params);
    console.log('📊 Payment statistics response:', response);

    if (response && response.success && response.data) {
      // Update table data
      tableData.value = response.data.statistics;
      paginationReactive.total = response.data.pagination.total;

      // Update summary statistics
      const summary = response.data.summary;
      statistics.totalOrders = summary.totalOrders;
      statistics.successOrders = summary.successOrders;
      statistics.successRate = summary.successRate;
      statistics.totalAmount = summary.totalAmount;

      console.log('✅ Payment statistics loaded:', {
        records: tableData.value.length,
        total: paginationReactive.total,
        summary: statistics,
      });
    } else {
      console.warn('⚠️ Invalid response format:', response);
      tableData.value = [];
      paginationReactive.total = 0;
      statistics.totalOrders = 0;
      statistics.successOrders = 0;
      statistics.successRate = 0;
      statistics.totalAmount = '0.00';

      if (response && !response.success) {
        message.warning(response.message || '获取数据失败');
      }
    }
  } catch (error) {
    console.error('Fetch data error:', error);
    message.error('获取数据失败');
  } finally {
    loading.value = false;
  }
};

const resetFilters = () => {
  filters.dateRange = null;
  filters.provider = null;
  filters.currency = null;
  filters.memberAccount = '';
  filters.withdrawalTimes = null;
  fetchData();
};

const exportReport = async () => {
  try {
    console.log('📤 Exporting payment statistics...');

    // Build export parameters from current filters
    const params: any = {};

    if (filters.dateRange && filters.dateRange.length === 2) {
      params.startDate = new Date(filters.dateRange[0])
        .toISOString()
        .split('T')[0];
      const endDate = new Date(filters.dateRange[1]);
      endDate.setHours(23, 59, 59, 999);
      params.endDate = endDate.toISOString().split('T')[0];
    }

    if (filters.provider) params.provider = filters.provider;
    if (filters.currency) params.currency = filters.currency;
    if (filters.memberAccount) params.memberAccount = filters.memberAccount;
    if (filters.withdrawalTimes && filters.withdrawalTimes !== 'all') {
      params.withdrawalTimes = filters.withdrawalTimes;
    }

    const response = await exportPaymentStatistics(params);

    if (response) {
      // Create download link for the blob
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `payment-statistics-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      message.success('导出成功');
    } else {
      message.warning('导出数据为空');
    }
  } catch (error) {
    console.error('Export error:', error);
    message.error('导出失败');
  }
};

// Lifecycle
onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.payment-statistics {
  padding: 16px;
}

.statistics-table :deep(.n-data-table-td) {
  white-space: nowrap;
}

.statistics-table :deep(.n-data-table-th) {
  background: #f8f9fa;
  font-weight: 600;
  text-align: center;
}

.statistics-table :deep(.n-data-table-td) {
  text-align: center;
}

.stat-card {
  transition: transform 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}
</style>
