<!-- 
  Updated RechargeOrderList.vue using SmartAutoRefresh component
  
  This shows how to replace the old auto-refresh implementation
  with the new reusable SmartAutoRefresh component
-->
<template>
  <div class="recharge-order-list">
    <!-- Page Header -->
    <div class="page-header">
      <n-breadcrumb>
        <n-breadcrumb-item>{{ $t('finance.k2tg5p') }}</n-breadcrumb-item>
        <n-breadcrumb-item>{{ $t('finance.kvqxwj') }}</n-breadcrumb-item>
      </n-breadcrumb>
    </div>

    <!-- Filter Section -->
    <div class="filter-section">
      <n-card>
        <div class="filter-content">
          <!-- Filter Form (existing implementation) -->
          <n-form
            ref="formRef"
            :model="filters"
            label-placement="left"
            label-width="auto"
            class="filter-form"
          >
            <!-- Filter fields remain the same -->
            <div class="filter-row">
              <n-form-item :label="$t('common.orderNo')">
                <n-input
                  v-model:value="filters.orderId"
                  :placeholder="$t('finance.pleaseEnterOrder')"
                  clearable
                />
              </n-form-item>
              <n-form-item :label="$t('common.memberAccount')">
                <n-input
                  v-model:value="filters.memberAccount"
                  :placeholder="$t('finance.pleaseEnterMemberAccount')"
                  clearable
                />
              </n-form-item>
              <!-- ... other filter fields ... -->
            </div>
          </n-form>

          <!-- Action Buttons -->
          <div class="filter-actions">
            <div class="filter-buttons">
              <n-button type="primary" @click="handleSearch">{{ $t('common.search') }}</n-button>
              <n-dropdown :options="advancedSearchOptions" trigger="click">
                <n-button>{{ $t('common.advancedSearch') }}</n-button>
              </n-dropdown>
              <n-button @click="handleReset">{{ $t('common.reset') }}</n-button>
              <n-button type="primary" @click="handleCreateOrder"
                >{{ $t('finance.createOnlineOrder') }}</n-button
              >
              <n-button type="warning" @click="handleCreateSupplementOrder"
                >{{ $t('finance.createSupplementaryOrder') }}</n-button
              >
              <n-dropdown :options="exportOptions" trigger="click">
                <n-button>{{ $t('finance.k4s5pc') }}</n-button>
              </n-dropdown>
              <n-button @click="showColumnConfig = true">
                <template #icon>
                  <n-icon><Settings /></n-icon>
                </template>
                {{ $t('finance.columnConfig') }}
              </n-button>

              <!-- 🚀 NEW: Replace old auto-refresh with SmartAutoRefresh component -->
              <SmartAutoRefresh
                v-model="autoRefreshEnabled"
                :intervals="[15, 30, 60, 120]"
                :default-interval="30"
                :on-refresh="fetchData"
                @interval-change="handleRefreshIntervalChange"
              />
            </div>
          </div>
        </div>
      </n-card>
    </div>

    <!-- Table Section (existing implementation) -->
    <div class="table-section">
      <n-card>
        <n-data-table
          ref="tableRef"
          v-model:checked-row-keys="checkedRowKeys"
          :columns="visibleColumns"
          :data="tableData"
          :loading="loading"
          :pagination="paginationConfig"
          :row-key="(row: RechargeOrder) => row.orderId"
          striped
          remote
          size="small"
          :scroll-x="3000"
          @update:page="handlePageChange"
          @update:page-size="handlePageSizeChange"
        />

        <!-- Totals Summary (existing implementation) -->
        <div class="totals-summary">
          <n-space size="large">
            <n-statistic :label="$t('finance.totalOrders')" :value="totals.totalOrders" />
            <n-statistic :label="$t('finance.totalAmount')" :value="totals.totalAmount" />
            <n-statistic :label="$t('finance.successOrder')" :value="totals.successOrders" />
            <n-statistic :label="$t('finance.successAmount')" :value="totals.successAmount" />
          </n-space>
        </div>
      </n-card>
    </div>

    <!-- Column Configuration Modal (existing implementation) -->
    <n-modal v-model:show="showColumnConfig" :mask-closable="false">
      <!-- ... existing column config modal ... -->
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { $t } from '@vben/locales';

import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import {
  NCard,
  NBreadcrumb,
  NBreadcrumbItem,
  NForm,
  NFormItem,
  NInput,
  NButton,
  NDropdown,
  NIcon,
  NDataTable,
  NSpace,
  NStatistic,
  NModal,
  useMessage,
} from 'naive-ui';
import { Settings } from '@vicons/ionicons5';
// ✅ PERFORMANCE FIX: Lazy load components to avoid blocking page load
import { defineAsyncComponent } from 'vue';
const SmartAutoRefresh = defineAsyncComponent(
  () => import('../../components/smart/SmartAutoRefresh/index.vue'),
);

// Types
interface RechargeOrder {
  orderId: string;
  memberAccount: string;
  amount: number;
  status: string;
  // ... other fields
}

// Reactive state
const message = useMessage();
const loading = ref(false);
const tableData = ref<RechargeOrder[]>([]);
const checkedRowKeys = ref<string[]>([]);
const showColumnConfig = ref(false);

// 🚀 NEW: Simplified auto-refresh state (no more manual timer management)
const autoRefreshEnabled = ref(false);

// Filter state (existing)
const filters = reactive({
  orderId: '',
  memberAccount: '',
  status: '',
  dateRange: null as [number, number] | null,
  // ... other filter fields
});

// Pagination (existing)
const paginationConfig = reactive({
  page: 1,
  pageSize: 20,
  itemCount: 0,
  showSizePicker: true,
  pageSizes: [10, 20, 50, 100],
});

// Totals (existing)
const totals = reactive({
  totalOrders: 0,
  totalAmount: 0,
  successOrders: 0,
  successAmount: 0,
});

// Table columns (existing implementation)
const columns = ref([
  { key: 'orderId', title: $t('common.orderNo'), visible: true },
  { key: 'memberAccount', title: $t('common.memberAccount'), visible: true },
  { key: 'amount', title: $t('common.amount'), visible: true },
  { key: 'status', title: $t('common.status'), visible: true },
  // ... other columns
]);

const visibleColumns = computed(() =>
  columns.value.filter((col) => col.visible),
);

// Dropdown options (existing)
const advancedSearchOptions = [
  { label: $t('finance.text82'), key: 'advanced' },
  { label: $t('finance.save'), key: 'save' },
];

const exportOptions = [
  { label: $t('finance.exportExcel'), key: 'excel' },
  { label: $t('finance.exportCsv'), key: 'csv' },
];

/**
 * 🚀 SIMPLIFIED: Main data fetching function
 * No more timer management - handled by SmartAutoRefresh component
 */
const fetchData = async () => {
  try {
    loading.value = true;

    // Build API parameters
    const params = {
      page: paginationConfig.page,
      pageSize: paginationConfig.pageSize,
      ...filters,
    };

    // API call (existing implementation)
    const response = await fetch('/api/recharge-orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    const data = await response.json();

    if (data.success) {
      tableData.value = data.data.list;
      paginationConfig.itemCount = data.data.total;

      // Update totals
      totals.totalOrders = data.data.totals.totalOrders;
      totals.totalAmount = data.data.totals.totalAmount;
      totals.successOrders = data.data.totals.successOrders;
      totals.successAmount = data.data.totals.successAmount;
    }
  } catch (error) {
    console.error('Failed to fetch data:', error);
    message.error($t('finance.dataLoadingFailed'));
  } finally {
    loading.value = false;
  }
};

/**
 * 🚀 NEW: Handle refresh interval changes
 */
const handleRefreshIntervalChange = (interval: number) => {
  console.log(`Auto-refresh interval changed to ${interval} seconds`);
  // Optional: Save user preference
  localStorage.setItem('recharge-refresh-interval', interval.toString());
};

// Event handlers (existing implementations)
const handleSearch = () => {
  paginationConfig.page = 1;
  fetchData();
};

const handleReset = () => {
  Object.keys(filters).forEach((key) => {
    (filters as any)[key] = '';
  });
  filters.dateRange = null;
  paginationConfig.page = 1;
  fetchData();
};

const handlePageChange = (page: number) => {
  paginationConfig.page = page;
  fetchData();
};

const handlePageSizeChange = (pageSize: number) => {
  paginationConfig.pageSize = pageSize;
  paginationConfig.page = 1;
  fetchData();
};

const handleCreateOrder = () => {
  // Existing implementation
  console.log('Create order');
};

const handleCreateSupplementOrder = () => {
  // Existing implementation
  console.log('Create supplement order');
};

// Lifecycle
onMounted(() => {
  fetchData();

  // 🚀 REMOVED: No more manual timer setup needed!
  // The SmartAutoRefresh component handles all timer logic

  // Load saved refresh interval preference
  const savedInterval = localStorage.getItem('recharge-refresh-interval');
  if (savedInterval) {
    // The SmartAutoRefresh component will use the defaultInterval prop
  }
});

onUnmounted(() => {
  // 🚀 REMOVED: No more manual timer cleanup needed!
  // The SmartAutoRefresh component handles cleanup automatically
});

// 🚀 COMPARISON: What was removed
/*
// ❌ OLD CODE (removed - now handled by SmartAutoRefresh):
const autoRefresh = ref(false);
const refreshInterval = ref(30);
const countdown = ref(0);
let refreshTimer: NodeJS.Timeout | null = null;
let countdownTimer: NodeJS.Timeout | null = null;

const refreshIntervalOptions = [
  { label: $t('finance.15Seconds'), value: 15 },
  { label: $t('finance.30Seconds'), value: 30 },
  { label: $t('finance.60Seconds'), value: 60 }
];

const startCountdown = () => {
  countdown.value = refreshInterval.value;
  countdownTimer = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      fetchData();
      countdown.value = refreshInterval.value;
    }
  }, 1000);
};

const stopAllTimers = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
  countdown.value = 0;
};

const handleAutoRefreshToggle = (value: boolean) => {
  if (value) {
    startCountdown();
    message.success($t('finance.autoRefreshEnabled', { seconds: refreshInterval.value }));
  } else {
    stopAllTimers();
    message.success($t('finance.alreadyOffAuto'));
  }
};

const handleRefreshIntervalChange = (newInterval: number) => {
  if (autoRefresh.value) {
    stopAllTimers();
    startCountdown();
    message.success($t('finance.refreshIntervalChanged', { seconds: newInterval }));
  }
};
*/
</script>

<style scoped>
.recharge-order-list {
  padding: 16px;
}

.page-header {
  margin-bottom: 16px;
}

.filter-section {
  margin-bottom: 16px;
}

.filter-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.filter-form .filter-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.filter-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.table-section {
  margin-bottom: 16px;
}

.totals-summary {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

/* Responsive design */
@media (max-width: 768px) {
  .filter-form .filter-row {
    grid-template-columns: 1fr;
  }

  .filter-buttons {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
