<template>
  <div class="payment-statistics">
    <!-- Header -->
    <div class="header-section">
      <n-card :bordered="false" class="rounded-16px shadow-sm">
        <div class="mb-4 flex items-center justify-between">
          <div>
            <h2 class="text-xl font-semibold text-gray-800">{{ $t('finance.paymentStatistics') }}</h2>
            <p class="mt-1 text-sm text-gray-600">{{ $t('finance.viewPayoutStatsDesc') }}</p>
          </div>
          <div class="flex gap-3">
            <n-button type="primary" @click="fetchData" :loading="loading">
              <template #icon>
                <n-icon><ReloadOutline /></n-icon>
              </template>{{ $t('common.refresh') }}</n-button>
            <n-button type="info" @click="exportReport">
              <template #icon>
                <n-icon><DownloadOutline /></n-icon>
              </template>{{ $t('common.exportReport') }}</n-button>
          </div>
        </div>

        <!-- Search Filters -->
        <div
          class="filter-section mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6"
        >
          <!-- Date Range -->
          <div class="filter-item">
            <n-form-item :label="$t('finance.statisticsTime')">
              <n-date-picker
                v-model:value="filters.dateRange"
                type="daterange"
                format="yyyy-MM-dd"
                placeholder:placeholder="$t('finance.selectTimeRange')"
                clearable
                size="small"
                class="w-full"
              />
            </n-form-item>
          </div>

          <!-- Third Party Provider -->
          <div class="filter-item">
            <n-form-item :label="$t('finance.thirdPartyPayout')">
              <n-select
                v-model:value="filters.provider"
                placeholder:placeholder="$t('finance.selectPayoutProvider')"
                clearable
                size="small"
                :options="providerOptions"
              />
            </n-form-item>
          </div>

          <!-- Currency -->
          <div class="filter-item">
            <n-form-item :label="$t('common.currency')">
              <n-select
                v-model:value="filters.currency"
                placeholder:placeholder="$t('finance.selectCurrency')"
                clearable
                size="small"
                :options="currencyOptions"
              />
            </n-form-item>
          </div>

          <!-- Member Account -->
          <div class="filter-item">
            <n-form-item :label="$t('finance.memberAccount2')">
              <n-input
                v-model:value="filters.memberAccount"
                placeholder:placeholder="$t('finance.pleaseEnterMemberAccount')"
                clearable
                size="small"
              />
            </n-form-item>
          </div>

          <!-- Withdrawal Count Filter -->
          <div class="filter-item">
            <n-form-item :label="$t('finance.memberWithdrawalCount')">
              <n-select
                v-model:value="filters.withdrawalTimes"
                placeholder:placeholder="$t('finance.selectWithdrawalCount')"
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
              ></template>{{ $t('common.search') }}</n-button>
            <n-button @click="resetFilters" size="small">{{ $t('common.reset') }}</n-button>
          </div>
        </div>
      </n-card>
    </div>

    <!-- Statistics Overview -->
    <div class="statistics-overview mt-4">
      <n-card :bordered="false" class="rounded-16px shadow-sm">
        <h3 class="mb-4 text-lg font-semibold">{{ $t('finance.k2tvtn') }}</h3>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div class="stat-card">
            <n-card size="small">
              <div class="text-center">
                <div class="text-3xl font-bold text-blue-600">
                  {{ statistics.totalOrders }}
                </div>
                <div class="mt-1 text-sm text-gray-600">{{ $t('finance.totalOrders') }}</div>
              </div>
            </n-card>
          </div>
          <div class="stat-card">
            <n-card size="small">
              <div class="text-center">
                <div class="text-3xl font-bold text-green-600">
                  {{ statistics.successOrders }}
                </div>
                <div class="mt-1 text-sm text-gray-600">{{ $t('finance.successOrders') }}</div>
              </div>
            </n-card>
          </div>
          <div class="stat-card">
            <n-card size="small">
              <div class="text-center">
                <div class="text-3xl font-bold text-orange-600">
                  {{ statistics.successRate }}%
                </div>
                <div class="mt-1 text-sm text-gray-600">{{ $t('finance.successRate') }}</div>
              </div>
            </n-card>
          </div>
          <div class="stat-card">
            <n-card size="small">
              <div class="text-center">
                <div class="text-3xl font-bold text-purple-600">
                  {{ statistics.totalAmount }}
                </div>
                <div class="mt-1 text-sm text-gray-600">{{ $t('finance.totalAmount') }}</div>
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
                  </template>{{ $t('common.refresh') }}</n-button>
                <n-button type="info" @click="exportReport">
                  <template #icon>
                    <n-icon><DownloadOutline /></n-icon>
                  </template>{{ $t('common.exportReport') }}</n-button>
              </div>

              <!-- 标题和统计信息 -->
              <div class="flex items-center gap-4">
                <h3 class="text-lg font-semibold">{{ $t('finance.k5xehw') }}</h3>
                <div class="text-sm text-gray-600">
                  共 {{ paginationReactive.total }} 条统计记录
                  <n-tag type="info" size="small" class="ml-2">{{ $t('finance.paymentStatistics') }}</n-tag>
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
import { $t } from '@vben/locales';

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
  { label: $t('finance.pixPayment'), value: 'pix' },
  { label: $t('finance.pixAuto'), value: 'pix_auto' },
  { label: $t('finance.bankTransfer'), value: 'bank_transfer' },
  { label: $t('finance.manualPayout1'), value: 'manual' },
  { label: $t('finance.thirdPartyPayout1'), value: 'third_party' },
  { label: $t('finance.unknownChannel'), value: 'unknown' },
];

const currencyOptions = [
  { label: 'BRL', value: 'BRL' },
  { label: 'USD', value: 'USD' },
  { label: 'EUR', value: 'EUR' },
];

const withdrawalCountOptions = [
  { label: $t('finance.allMembers'), value: 'all' },
  { label: $t('finance.firstWithdrawal'), value: 'first' },
  { label: $t('finance.multipleWithdrawals'), value: 'multiple' },
];

// Table columns
const columns: DataTableColumns<PaymentStatistic> = [
  {
    title: $t('finance.date'),
    key: 'date',
    width: 120,
    render: (row) => h('div', { class: 'text-center' }, row.date),
  },
  {
    title: $t('finance.thirdPartyPayout'),
    key: 'providerName',
    width: 150,
    render: (row) =>
      h('div', { class: 'text-center font-medium' }, row.providerName),
  },
  {
    title: $t('common.currency'),
    key: 'currency',
    width: 80,
    render: (row) => h('div', { class: 'text-center' }, row.currency),
  },
  {
    title: $t('finance.totalOrders'),
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
    title: $t('finance.successOrders'),
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
    title: $t('finance.failedOrders'),
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
    title: $t('finance.successRate'),
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
    title: $t('finance.totalAmount'),
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
    title: $t('finance.successAmount'),
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
    title: $t('finance.averageProcessingTime'),
    key: 'avgProcessingTime',
    width: 120,
    render: (row) => h('div', { class: 'text-center' }, row.avgProcessingTime),
  },
  {
    title: $t('finance.memberWithdrawalStats'),
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
    message.error($t('finance.failedToFetchData'));
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

      message.success($t('finance.exportSuccessful'));
    } else {
      message.warning($t('finance.exportData'));
    }
  } catch (error) {
    console.error('Export error:', error);
    message.error($t('finance.exportFailed'));
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
