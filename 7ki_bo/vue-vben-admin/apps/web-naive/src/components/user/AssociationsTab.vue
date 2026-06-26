<template>
  <div class="associations-tab">
    <!-- Filter Section -->
    <n-card class="mb-4">
      <n-form
        :model="filterForm"
        label-placement="left"
        label-width="100px"
        class="filter-form"
      >
        <div class="filter-form-row">
          <!-- 操作时间类型选择 -->
          <n-form-item :label="$t('common.operationTime')">
            <n-select
              v-model:value="filterForm.timeType"
              :options="timeTypeOptions"
              :placeholder="$t('user.associations.selectTimeType')"
              style="width: 150px"
              clearable
            />
          </n-form-item>

          <!-- 时间段快捷选择 (日/周/月) -->
          <div class="flex flex-col">
            <QuickDateSelect
              v-model="filterForm.dateQuickSelect"
              @update:modelValue="handleQuickDateSelect"
            />
          </div>

          <!-- 日期范围选择器 -->
          <div class="flex flex-col">
            <TimezoneDatePicker
              v-model="filterForm.dateRange"
              @update:modelValue="handleDateRangeChange"
            />
          </div>
        </div>

        <div class="filter-form-row">
          <n-form-item :label="$t('common.memberAccount')">
            <n-input
              v-model:value="filterForm.memberAccount"
              :placeholder="$t('user.associations.enterMemberAccount')"
              style="width: 200px"
              clearable
            />
          </n-form-item>

          <n-form-item :label="$t('user.associations.associationType')">
            <n-select
              v-model:value="filterForm.associationType"
              :options="typeOptions"
              :placeholder="$t('user.associations.selectAssociationType')"
              style="width: 150px"
              clearable
            />
          </n-form-item>

          <n-form-item :label="$t('user.associations.allPunishmentMethods')">
            <n-select
              v-model:value="filterForm.punishmentMethod"
              :options="punishmentMethodOptions"
              :placeholder="$t('user.associations.selectPunishmentMethod')"
              style="width: 150px"
              clearable
            />
          </n-form-item>
        </div>

        <div class="filter-form-row">
          <n-form-item>
            <n-space>
              <n-button type="primary" @click="handleSearch">{{ $t('common.search') }}</n-button>
              <n-button @click="handleReset">{{ $t('common.reset') }}</n-button>
              <n-button @click="handleExport">{{ $t('common.exportReport') }}</n-button>
            </n-space>
          </n-form-item>
        </div>
      </n-form>
    </n-card>

    <!-- Data Table -->
    <n-card class="table-card">
      <div class="table-container">
        <div class="table-content-wrapper">
          <n-data-table
            :columns="columns"
            :data="tableData"
            :loading="loading"
            :pagination="false"
            :row-key="(row) => row.id"
            :scroll-x="minTableWidth"
            :bordered="true"
            :single-line="false"
          />
        </div>
        <!-- Fixed Pagination Bar -->
        <div class="pagination-wrapper">
          <n-pagination
            v-model:page="pagination.page"
            v-model:page-size="pagination.pageSize"
            :page-count="(pagination as any).pageCount"
            :page-sizes="pagination.pageSizes"
            show-size-picker
            show-quick-jumper
            @update:page="handlePageChange"
            @update:page-size="handlePageSizeChange"
          />
        </div>
      </div>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { $t } from '@vben/locales';

import { ref, onMounted, watch, computed, h } from 'vue';
import {
  NCard,
  NForm,
  NFormItem,
  NInput,
  NSelect,
  NButton,
  NSpace,
  NDataTable,
  useMessage,
} from 'naive-ui';
import { requestClient } from '#/api/request';
import TimezoneDatePicker from '#/components/common/TimezoneDatePicker.vue';
import QuickDateSelect from '#/components/common/QuickDateSelect.vue';
import { formatCurrency, formatDateTime } from '#/utils/format';
import {
  convertTimezoneToUTC,
  getDisplayTimezone,
  getNowInTimezone,
} from '#/utils/timezoneUtils';

interface Props {
  userId: number;
  initialAssociationType?: string | null;
}

const props = withDefaults(defineProps<Props>(), {
  initialAssociationType: null,
});

const message = useMessage();

// Filter form
const filterForm = ref({
  timeType: 'operationTime' as 'operationTime' | 'associationTime', // 操作时间 or 关联时间
  dateQuickSelect: 'day' as 'day' | 'week' | 'month', // day, week, month
  dateRange: null as [number, number] | null,
  memberAccount: '',
  punishmentMethod: null as string | null,
  associationType: null as string | null,
});

// Table data
const tableData = ref<any[]>([]);
const loading = ref(false);
const total = ref(0);
const pagination = ref({
  page: 1,
  pageSize: 20,
  showSizePicker: true,
  pageSizes: [10, 20, 50, 100],
  onChange: (page: number) => {
    pagination.value.page = page;
  },
  onUpdatePageSize: (pageSize: number) => {
    pagination.value.pageSize = pageSize;
    pagination.value.page = 1;
  },
});

// Options
const timeTypeOptions = computed(() => [
  { label: $t('common.operationTime'), value: 'operationTime' },
  { label: $t('user.associations.associationTime'), value: 'associationTime' },
]);

const typeOptions = computed(() => [
  { label: $t('user.associations.typeAll'), value: 'all' },
  { label: $t('user.associations.typeSameSuperiorAgent'), value: 'same_superior_agent' },
  { label: $t('user.associations.typeSameName'), value: 'same_name' },
  { label: $t('user.associations.typeSameIp'), value: 'same_ip' },
  { label: $t('user.associations.typeSameDevice'), value: 'same_device' },
  { label: $t('user.associations.typeSamePassword'), value: 'same_password' },
  { label: $t('user.associations.typeSameWithdrawalPin'), value: 'same_withdrawal_pin' },
  { label: $t('user.associations.typeSameWithdrawalAccount'), value: 'same_withdrawal_account' },
]);

const punishmentMethodOptions = computed(() => [
  { label: $t('user.associations.punishmentAll'), value: 'all' },
  { label: $t('user.associations.punishmentBlacklist'), value: 'blacklist' },
  { label: $t('user.associations.punishmentChangeTier'), value: 'change_member_tier' },
  { label: $t('user.associations.punishmentChangeTag'), value: 'change_member_tag' },
  { label: $t('user.associations.punishmentRestoreNormal'), value: 'restore_normal' },
  { label: $t('user.associations.punishmentBanBonus'), value: 'ban_bonus' },
  { label: $t('user.associations.punishmentFreeze'), value: 'freeze' },
  { label: $t('user.associations.punishmentBanGame'), value: 'ban_game' },
]);

// Calculate minimum table width for horizontal scrolling
const minTableWidth = computed(() => {
  // Sum of all column widths + selection column (50px) + padding
  return (
    50 +
    180 +
    120 +
    200 +
    100 +
    80 +
    120 +
    150 +
    120 +
    120 +
    120 +
    100 +
    180 +
    140 +
    140 +
    120 +
    120 +
    100 +
    140 +
    120 +
    120 +
    150 +
    180 +
    100 +
    100
  );
});

// Table columns with responsive widths
const columns = computed(() => [
  {
    type: 'selection' as const,
    multiple: true,
    width: 50,
    fixed: 'left' as const,
  },
  {
    title: $t('user.associations.associationTimeCol'),
    key: 'associationTime',
    width: 180,
    minWidth: 150,
    render: (row: any) => formatDateTime(row.associationTime),
  },
  {
    title: $t('user.associations.associationTypeCol'),
    key: 'associationType',
    width: 120,
    minWidth: 100,
  },
  {
    title: $t('user.associations.associationInfo'),
    key: 'associationInfo',
    width: 200,
    minWidth: 150,
    ellipsis: { tooltip: true },
  },
  {
    title: $t('user.associations.punishmentMethod'),
    key: 'punishmentMethod',
    width: 100,
    minWidth: 80,
  },
  {
    title: $t('common.currency'),
    key: 'currency',
    width: 80,
    minWidth: 60,
  },
  {
    title: $t('user.associations.memberId'),
    key: 'userId',
    width: 120,
    minWidth: 100,
  },
  {
    title: $t('common.memberAccount'),
    key: 'account',
    width: 180,
    minWidth: 150,
    ellipsis: { tooltip: true },
    render: (row: any) => `${row.account} (${row.memberLevel})`,
  },
  {
    title: $t('user.associations.realName'),
    key: 'realName',
    width: 120,
    minWidth: 100,
    ellipsis: { tooltip: true },
  },
  {
    title: $t('user.associations.topAgent'),
    key: 'topAgent',
    width: 120,
    minWidth: 100,
    ellipsis: { tooltip: true },
  },
  {
    title: $t('user.associations.superiorAgent'),
    key: 'superiorAgent',
    width: 120,
    minWidth: 100,
    ellipsis: { tooltip: true },
  },
  {
    title: $t('user.associations.accountStatus'),
    key: 'accountStatus',
    width: 100,
    minWidth: 80,
  },
  {
    title: $t('user.associations.registrationTime'),
    key: 'registrationTime',
    width: 180,
    minWidth: 150,
    render: (row: any) => formatDateTime(row.registrationTime),
  },
  {
    title: $t('user.associations.totalDepositAmount'),
    key: 'totalDeposit',
    width: 140,
    minWidth: 120,
    render: (row: any) => formatCurrency(row.totalDeposit),
  },
  {
    title: $t('user.associations.totalWithdrawAmount'),
    key: 'totalWithdraw',
    width: 140,
    minWidth: 120,
    render: (row: any) => formatCurrency(row.totalWithdraw),
  },
  {
    title: $t('user.associations.depositWithdrawDiff'),
    key: 'depositWithdrawDiff',
    width: 120,
    minWidth: 100,
    render: (row: any) => formatCurrency(row.depositWithdrawDiff),
  },
  {
    title: $t('user.associations.currentBalance'),
    key: 'currentBalance',
    width: 120,
    minWidth: 100,
    render: (row: any) => formatCurrency(row.currentBalance),
  },
  {
    title: $t('user.associations.interestTreasure'),
    key: 'savingsWallet',
    width: 100,
    minWidth: 80,
    render: (row: any) => formatCurrency(row.savingsWallet),
  },
  {
    title: $t('user.associations.totalRewards'),
    key: 'totalRewards',
    width: 140,
    minWidth: 120,
    render: (row: any) => formatCurrency(row.totalRewards),
  },
  {
    title: $t('user.associations.totalBetting'),
    key: 'totalBetting',
    width: 120,
    minWidth: 100,
    render: (row: any) => formatCurrency(row.totalBetting),
  },
  {
    title: $t('user.associations.totalWinLoss'),
    key: 'totalWinLoss',
    width: 120,
    minWidth: 100,
    render: (row: any) => formatCurrency(row.totalWinLoss),
  },
  {
    title: $t('common.remark'),
    key: 'notes',
    width: 150,
    minWidth: 120,
    ellipsis: { tooltip: true },
  },
  {
    title: $t('common.operationTime'),
    key: 'operationTime',
    width: 180,
    minWidth: 150,
    render: (row: any) => formatDateTime(row.operationTime),
  },
  {
    title: $t('common.operator'),
    key: 'operator',
    width: 100,
    minWidth: 80,
    ellipsis: { tooltip: true },
  },
  {
    title: $t('common.actions'),
    key: 'actions',
    width: 100,
    minWidth: 80,
    fixed: 'right' as const,
    render: (row: any) => {
      return h('div', [
        h(
          NButton,
          {
            text: true,
            type: 'primary',
            size: 'small',
            onClick: () => handleViewUser(row.id),
          },
          { default: () => $t('common.view') },
        ),
      ]);
    },
  },
]);

// Watch for initial association type
watch(
  () => props.initialAssociationType,
  (newType) => {
    if (newType) {
      filterForm.value.associationType = newType;
      loadTableData();
    }
  },
  { immediate: true },
);

// Load table data
const loadTableData = async () => {
  if (!props.userId) return;

  loading.value = true;
  try {
    const params: any = {
      page: pagination.value.page,
      pageSize: pagination.value.pageSize,
      associationType: filterForm.value.associationType,
    };

    if (filterForm.value.dateRange) {
      const [start, end] = filterForm.value.dateRange;
      // Convert from display timezone to UTC
      const tz = getDisplayTimezone();
      const startDate = new Date(start);
      const endDate = new Date(end);

      // Get date components in display timezone
      const startTz = new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }).formatToParts(startDate);

      const endTz = new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }).formatToParts(endDate);

      const startUTC = convertTimezoneToUTC(
        parseInt(startTz.find((p) => p.type === 'year')!.value),
        parseInt(startTz.find((p) => p.type === 'month')!.value),
        parseInt(startTz.find((p) => p.type === 'day')!.value),
        parseInt(startTz.find((p) => p.type === 'hour')!.value),
        parseInt(startTz.find((p) => p.type === 'minute')!.value),
        parseInt(startTz.find((p) => p.type === 'second')!.value),
        tz,
      );

      const endUTC = convertTimezoneToUTC(
        parseInt(endTz.find((p) => p.type === 'year')!.value),
        parseInt(endTz.find((p) => p.type === 'month')!.value),
        parseInt(endTz.find((p) => p.type === 'day')!.value),
        parseInt(endTz.find((p) => p.type === 'hour')!.value),
        parseInt(endTz.find((p) => p.type === 'minute')!.value),
        parseInt(endTz.find((p) => p.type === 'second')!.value),
        tz,
      );

      params.startDate = startUTC.toISOString();
      params.endDate = endUTC.toISOString();
    }

    // Always include associationType if set
    if (filterForm.value.associationType) {
      params.associationType = filterForm.value.associationType;
    }

    if (filterForm.value.memberAccount) {
      params.memberAccount = filterForm.value.memberAccount;
    }

    if (filterForm.value.punishmentMethod) {
      params.punishmentMethod = filterForm.value.punishmentMethod;
    }

    const response = await requestClient.get(
      `/users/${props.userId}/associations`,
      { params },
    );

    console.log('🔍 [AssociationsTab] API response:', response);
    console.log('🔍 [AssociationsTab] Response type:', typeof response);
    console.log(
      '🔍 [AssociationsTab] Response keys:',
      response ? Object.keys(response) : 'undefined',
    );

    // Response interceptor unwraps {code: 0, data: {...}} to just {...}
    // So response is already the data object with list, total, page, pageSize
    if (response && typeof response === 'object') {
      // Check if it's the unwrapped format (has list and total directly)
      if ('list' in response && 'total' in response) {
        tableData.value = (response as any).list || [];
        total.value = (response as any).total || 0;
        (pagination.value as any).pageCount = Math.ceil(
          total.value / pagination.value.pageSize,
        );
        console.log(
          '✅ [AssociationsTab] Loaded data - list:',
          tableData.value.length,
          'total:',
          total.value,
        );
      }
      // Check if it's still wrapped (has code and data)
      else if (
        'code' in response &&
        (response as any).code === 0 &&
        'data' in response
      ) {
        const data = (response as any).data;
        tableData.value = data.list || [];
        total.value = data.total || 0;
        (pagination.value as any).pageCount = Math.ceil(
          total.value / pagination.value.pageSize,
        );
      }
      // Check if it's error format
      else if ('code' in response && (response as any).code !== 0) {
        message.error((response as any).message || $t('user.associations.loadFailed'));
        tableData.value = [];
        total.value = 0;
        (pagination.value as any).pageCount = 0;
      } else {
        // Unknown format, try to use response directly
        console.warn('Unknown response format:', response);
        tableData.value = [];
        total.value = 0;
        (pagination.value as any).pageCount = 0;
      }
    } else {
      tableData.value = [];
      total.value = 0;
      (pagination.value as any).pageCount = 0;
    }
  } catch (error: any) {
    console.error('Error loading associations:', error);
    // Only show error on actual network/exception errors
    message.error($t('user.associations.loadFailed'));
    tableData.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
};

// Handlers
const handleQuickDateSelect = (value: 'day' | 'week' | 'month' | null) => {
  if (!value) return; // Handle null case

  // Use the exact same logic as user management page
  const tz = getDisplayTimezone();
  const tzNow = getNowInTimezone(tz);

  let startYear: number, startMonth: number, startDay: number;
  let endYear: number, endMonth: number, endDay: number;

  switch (value) {
    case 'day':
      // Today in display timezone: 00:00:00 to 23:59:59
      startYear = endYear = tzNow.year;
      startMonth = endMonth = tzNow.month;
      startDay = endDay = tzNow.day;
      break;
    case 'week':
      // Last 7 days: calculate 7 days ago
      const weekAgo = new Date(tzNow.year, tzNow.month - 1, tzNow.day);
      weekAgo.setDate(weekAgo.getDate() - 7);
      startYear = weekAgo.getFullYear();
      startMonth = weekAgo.getMonth() + 1;
      startDay = weekAgo.getDate();
      endYear = tzNow.year;
      endMonth = tzNow.month;
      endDay = tzNow.day;
      break;
    case 'month':
      // Last 30 days: calculate 30 days ago
      const monthAgo = new Date(tzNow.year, tzNow.month - 1, tzNow.day);
      monthAgo.setDate(monthAgo.getDate() - 30);
      startYear = monthAgo.getFullYear();
      startMonth = monthAgo.getMonth() + 1;
      startDay = monthAgo.getDate();
      endYear = tzNow.year;
      endMonth = tzNow.month;
      endDay = tzNow.day;
      break;
    default:
      return;
  }

  // Convert to UTC timestamps using the same logic as user management
  const startDateUTC = convertTimezoneToUTC(
    startYear,
    startMonth,
    startDay,
    0,
    0,
    0,
    tz,
  );
  const endDateUTC = convertTimezoneToUTC(
    endYear,
    endMonth,
    endDay,
    23,
    59,
    59,
    tz,
  );

  // Validate and store UTC timestamps directly
  if (isNaN(startDateUTC.getTime()) || isNaN(endDateUTC.getTime())) {
    console.error('❌ Failed to convert timezone dates to UTC');
    // Fallback: approximate UTC (not ideal)
    filterForm.value.dateRange = [
      new Date(
        Date.UTC(startYear, startMonth - 1, startDay, 3, 0, 0),
      ).getTime(), // São Paulo is UTC-3
      new Date(Date.UTC(endYear, endMonth - 1, endDay, 2, 59, 59)).getTime(),
    ];
  } else {
    // Store UTC timestamps - these represent display timezone time
    filterForm.value.dateRange = [startDateUTC.getTime(), endDateUTC.getTime()];
  }
};

const handleDateRangeChange = (value: [number, number] | null) => {
  filterForm.value.dateRange = value;
};

const handleSearch = () => {
  pagination.value.page = 1;
  loadTableData();
};

const handleReset = () => {
  filterForm.value = {
    timeType: 'operationTime',
    dateQuickSelect: 'day',
    dateRange: null,
    memberAccount: '',
    punishmentMethod: null,
    associationType: props.initialAssociationType || null,
  };
  handleQuickDateSelect('day'); // Re-apply default date range
  pagination.value.page = 1;
  loadTableData();
};

const handleExport = () => {
  message.info($t('user.associations.exportDeveloping'));
};

const handlePageChange = (page: number) => {
  pagination.value.page = page;
  loadTableData();
};

const handlePageSizeChange = (pageSize: number) => {
  pagination.value.pageSize = pageSize;
  pagination.value.page = 1;
  loadTableData();
};

const handleViewUser = (userId: number) => {
  // Emit event to parent to open user detail modal
  // This will be handled by the parent component
  message.info($t('user.associations.viewUser', [userId]));
};

onMounted(() => {
  if (props.initialAssociationType) {
    filterForm.value.associationType = props.initialAssociationType;
  }
  loadTableData();
});
</script>

<style scoped>
.associations-tab {
  padding: 16px;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.table-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.table-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.table-content-wrapper {
  flex: 1;
  overflow: auto;
  min-height: 0;
}

.table-content-wrapper :deep(.n-data-table) {
  min-width: 100%;
}

/* Make table cells wrap text better on small screens */
.table-content-wrapper :deep(.n-data-table td) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Fixed Pagination Bar */
.pagination-wrapper {
  flex-shrink: 0;
  padding: 16px;
  border-top: 1px solid var(--n-border-color);
  background: var(--n-color);
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Filter form layout - responsive wrapping */
.filter-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.filter-form-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: flex-start;
}

.filter-form-row :deep(.n-form-item) {
  margin-bottom: 0;
  flex: 0 0 auto;
}

/* Responsive: On small screens, wrap to multiple rows */
@media (max-width: 1200px) {
  .filter-form-row {
    flex-wrap: wrap;
  }

  .filter-form-row :deep(.n-form-item) {
    min-width: 200px;
  }
}

@media (max-width: 768px) {
  .filter-form-row {
    flex-direction: column;
  }

  .filter-form-row :deep(.n-form-item) {
    width: 100%;
    margin-bottom: 12px;
  }

  .filter-form-row :deep(.n-form-item .n-input),
  .filter-form-row :deep(.n-form-item .n-select),
  .filter-form-row :deep(.n-form-item .n-date-picker) {
    width: 100% !important;
  }
}
</style>
