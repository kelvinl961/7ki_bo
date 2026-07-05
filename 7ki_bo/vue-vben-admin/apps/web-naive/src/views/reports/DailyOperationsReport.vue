<template>
  <div class="daily-operations-report">
    <n-card title="" class="mb-4">
      <!-- Filter Section -->
      <div class="mb-4">
        <n-form inline>
          <!-- Time Granularity Selector -->
          <n-form-item :label="$t('reports.quickSelect')">
            <n-radio-group
              v-model:value="timeGranularity"
              @update:value="onTimeGranularityChange"
            >
              <n-radio-button value="day">{{ $t('common.day') }}</n-radio-button>
              <n-radio-button value="week">{{ $t('common.week') }}</n-radio-button>
              <n-radio-button value="month">{{ $t('common.month') }}</n-radio-button>
            </n-radio-group>
          </n-form-item>

          <!-- Date Range Picker -->
          <n-form-item :label="dateRangeLabel">
            <n-date-picker
              v-model:value="dateRange"
              type="daterange"
              :shortcuts="dateShortcuts as any"
              :placeholder="dateRangePlaceholder"
              format="yyyy-MM-dd"
              style="width: 300px"
              clearable
            />
          </n-form-item>

          <!-- Currency Selector -->
          <n-form-item :label="$t('common.currency')">
            <n-select
              v-model:value="currency"
              :options="currencyOptions"
              :placeholder="$t('reports.selectCurrency')"
              style="width: 120px"
            />
          </n-form-item>

          <!-- Action Buttons -->
          <n-form-item>
            <n-button type="primary" @click="fetchData" :loading="loading">
              {{ $t('common.search') }}
            </n-button>
          </n-form-item>
          <n-form-item>
            <n-button @click="resetFilters"> {{ $t('common.reset') }} </n-button>
          </n-form-item>
          <n-form-item>
            <n-button
              type="success"
              @click="exportToExcel"
              :loading="exporting"
            >
              {{ $t('reports.exportExcel') }}
            </n-button>
          </n-form-item>
        </n-form>
      </div>

      <!-- Data Grid -->
      <n-card size="small">
        <template #header>
          <n-space justify="space-between">
            <span>{{ $t('reports.dataList') }}</span>
            <span style="font-size: 13px; color: #666">
              {{ $t('reports.totalRecords', [reportData?.length || 0]) }}
            </span>
          </n-space>
        </template>

        <!-- Loading State -->
        <div v-if="loading" class="py-8 text-center">
          <n-spin size="large" />
          <p class="mt-4">{{ $t('reports.loadingData') }}</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="py-8 text-center">
          <n-alert type="error" :title="error" />
        </div>

        <!-- Data Table -->
        <div
          v-else-if="reportData.length > 0 || totalData"
          class="table-wrapper"
        >
          <n-data-table
            :columns="columns"
            :data="tableBodyData"
            :loading="loading"
            :pagination="false"
            :bordered="true"
            :scroll-x="scrollXWidth"
            :max-height="opsTableMaxHeight"
            :summary="operationsTableSummary"
            size="small"
            class="operations-report-table"
          />
          <div class="ops-table-pagination">
            <n-pagination
              size="small"
              :page="paginationPage"
              :page-size="paginationPageSize"
              :item-count="reportData.length"
              :page-sizes="[20, 40, 50, 100]"
              show-size-picker
              :prefix="paginationPrefix"
              @update:page="onPaginationPageChange"
              @update:page-size="onPaginationPageSizeChange"
            />
          </div>
        </div>

        <!-- Empty State -->
        <n-empty v-else :description="$t('common.noData')" style="padding: 40px 0" />
      </n-card>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { $t } from '@vben/locales';

import { ref, onMounted, onUnmounted, computed, h, watch } from 'vue';
import {
  NCard,
  NForm,
  NFormItem,
  NDatePicker,
  NSelect,
  NButton,
  NDataTable,
  NSpin,
  NAlert,
  NEmpty,
  NRadioGroup,
  NRadioButton,
  NSpace,
  NPagination,
  type DataTableColumns,
  type DataTableCreateSummary,
} from 'naive-ui';
import { useMessage } from 'naive-ui';
import { getDailyOperationsReport } from '#/api/operationsStatistics';
import { exportGridData } from '#/utils/exportUtils';
import {
  getDisplayTimezone,
  getNowInTimezone,
  convertTimezoneToUTC,
} from '#/utils/timezoneUtils';

const message = useMessage();

// Reactive data
const loading = ref(false);
const exporting = ref(false);
const error = ref('');
const reportData = ref<any[]>([]);
const totalData = ref<any>(null);

// Pagination state
const paginationPage = ref(1);
const paginationPageSize = ref(40);

// Paginated body rows only (总计 via table :summary)
const tableBodyData = computed(() => {
  if (!reportData.value || reportData.value.length === 0) return [];

  const startIndex = (paginationPage.value - 1) * paginationPageSize.value;
  const endIndex = startIndex + paginationPageSize.value;
  return reportData.value.slice(startIndex, endIndex);
});

/** Full dataset + 总计 for Excel export */
const exportTableData = computed(() => {
  const rows = [...reportData.value];
  if (totalData.value) {
    rows.push({
      ...(totalData.value as any),
      isTotal: true,
      date: totalData.value.date || $t('common.total'),
    });
  }
  return rows;
});

/** ~7 data rows + header + 总计 summary inside one table scroll area */
const OPS_TABLE_VISIBLE_DATA_ROWS = 7;
const OPS_TABLE_HEADER_PX = 76;
const OPS_TABLE_ROW_PX = 34;
const OPS_TABLE_SUMMARY_ROW_PX = 36;

const opsTableMaxHeight = computed(
  () =>
    OPS_TABLE_HEADER_PX +
    OPS_TABLE_VISIBLE_DATA_ROWS * OPS_TABLE_ROW_PX +
    OPS_TABLE_SUMMARY_ROW_PX,
);

const paginationPrefix = (info: { itemCount?: number }) =>
  $t('reports.paginationTotal', [info.itemCount ?? 0]);

const dateRangeLabel = computed(() =>
  $t('reports.dateRangeWithTimezone', [currentTimezone.value]),
);

const dateRangePlaceholder = computed(() =>
  $t('reports.selectStartEndDate', [currentTimezone.value]),
);

function scrollOpsTableToTop() {
  const scrollEl = document.querySelector(
    '.operations-report-table .n-scrollbar-container',
  ) as HTMLElement | null;
  scrollEl?.scrollTo({ top: 0 });
}

function onPaginationPageChange(page: number) {
  paginationPage.value = page;
  scrollOpsTableToTop();
}

function onPaginationPageSizeChange(pageSize: number) {
  paginationPageSize.value = pageSize;
  paginationPage.value = 1;
}

// Form data
const timeGranularity = ref('day');
const dateRange = ref<[number, number] | null>(null);
const currency = ref('BRL');

// Map header timezone key to actual timezone string
const timezoneKeyMap: Record<string, string> = {
  brazil: 'America/Sao_Paulo',
  vietnam: 'Asia/Ho_Chi_Minh',
  china: 'Asia/Shanghai',
};

// Get timezone from header (stored in localStorage as 'preferred_timezone')
// This automatically follows the header timezone selection
const getHeaderTimezone = (): string => {
  const headerTzKey = localStorage.getItem('preferred_timezone');
  if (headerTzKey && timezoneKeyMap[headerTzKey]) {
    return timezoneKeyMap[headerTzKey];
  }
  // Fallback to display timezone or default to Brazil
  return getDisplayTimezone();
};

// Get current timezone string - reactive to header timezone changes
const currentTimezone = computed(() => getHeaderTimezone());

// Currency options
const currencyOptions = [
  { label: 'BRL', value: 'BRL' },
  { label: 'USD', value: 'USD' },
  { label: 'EUR', value: 'EUR' },
];

// Calculate dynamic scroll width based on columns
const scrollXWidth = computed(() => {
  // Calculate approximate width based on column count
  // Each column is roughly 100-150px, add some padding
  const baseWidth = 1200; // Minimum width for fixed columns
  if (!columns.value || columns.value.length === 0) {
    return baseWidth;
  }
  const dynamicWidth = (columns.value as any[]).reduce((total, col: any) => {
    if (col.children && Array.isArray(col.children)) {
      return total + col.children.length * 120;
    }
    return total + (col.width || 120);
  }, 0);
  return Math.max(baseWidth, dynamicWidth);
});

// Date shortcuts - use selected timezone
const dateShortcuts = computed(() => {
  const tz = currentTimezone.value;
  const tzNow = getNowInTimezone(tz);

  if (timeGranularity.value === 'day') {
    return {
      [$t('common.today')]: (): [number, number] => {
        const startUTC = convertTimezoneToUTC(
          tzNow.year,
          tzNow.month,
          tzNow.day,
          0,
          0,
          0,
          tz,
        );
        const endUTC = convertTimezoneToUTC(
          tzNow.year,
          tzNow.month,
          tzNow.day,
          23,
          59,
          59,
          tz,
        );
        return [startUTC.getTime(), endUTC.getTime()];
      },
      [$t('reports.shortcuts.yesterday')]: (): [number, number] => {
        const yesterday = new Date(tzNow.year, tzNow.month - 1, tzNow.day);
        yesterday.setDate(yesterday.getDate() - 1);
        const startUTC = convertTimezoneToUTC(
          yesterday.getFullYear(),
          yesterday.getMonth() + 1,
          yesterday.getDate(),
          0,
          0,
          0,
          tz,
        );
        const endUTC = convertTimezoneToUTC(
          yesterday.getFullYear(),
          yesterday.getMonth() + 1,
          yesterday.getDate(),
          23,
          59,
          59,
          tz,
        );
        return [startUTC.getTime(), endUTC.getTime()];
      },
      [$t('reports.shortcuts.last3Days')]: (): [number, number] => {
        const threeDaysAgo = new Date(tzNow.year, tzNow.month - 1, tzNow.day);
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 2);
        const startUTC = convertTimezoneToUTC(
          threeDaysAgo.getFullYear(),
          threeDaysAgo.getMonth() + 1,
          threeDaysAgo.getDate(),
          0,
          0,
          0,
          tz,
        );
        const endUTC = convertTimezoneToUTC(
          tzNow.year,
          tzNow.month,
          tzNow.day,
          23,
          59,
          59,
          tz,
        );
        return [startUTC.getTime(), endUTC.getTime()];
      },
      [$t('reports.shortcuts.last7Days')]: (): [number, number] => {
        const sevenDaysAgo = new Date(tzNow.year, tzNow.month - 1, tzNow.day);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        const startUTC = convertTimezoneToUTC(
          sevenDaysAgo.getFullYear(),
          sevenDaysAgo.getMonth() + 1,
          sevenDaysAgo.getDate(),
          0,
          0,
          0,
          tz,
        );
        const endUTC = convertTimezoneToUTC(
          tzNow.year,
          tzNow.month,
          tzNow.day,
          23,
          59,
          59,
          tz,
        );
        return [startUTC.getTime(), endUTC.getTime()];
      },
    };
  } else if (timeGranularity.value === 'week') {
    return {
      [$t('reports.shortcuts.lastWeek')]: (): [number, number] => {
        const now = new Date(tzNow.year, tzNow.month - 1, tzNow.day);
        const dayOfWeek = now.getDay();
        const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        const lastMonday = new Date(now);
        lastMonday.setDate(now.getDate() - daysFromMonday - 7);
        const lastSunday = new Date(now);
        lastSunday.setDate(now.getDate() - daysFromMonday - 1);
        const startUTC = convertTimezoneToUTC(
          lastMonday.getFullYear(),
          lastMonday.getMonth() + 1,
          lastMonday.getDate(),
          0,
          0,
          0,
          tz,
        );
        const endUTC = convertTimezoneToUTC(
          lastSunday.getFullYear(),
          lastSunday.getMonth() + 1,
          lastSunday.getDate(),
          23,
          59,
          59,
          tz,
        );
        return [startUTC.getTime(), endUTC.getTime()];
      },
      [$t('reports.shortcuts.weekBeforeLast')]: (): [number, number] => {
        const now = new Date(tzNow.year, tzNow.month - 1, tzNow.day);
        const dayOfWeek = now.getDay();
        const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        const twoWeeksAgoMonday = new Date(now);
        twoWeeksAgoMonday.setDate(now.getDate() - daysFromMonday - 14);
        const twoWeeksAgoSunday = new Date(now);
        twoWeeksAgoSunday.setDate(now.getDate() - daysFromMonday - 8);
        const startUTC = convertTimezoneToUTC(
          twoWeeksAgoMonday.getFullYear(),
          twoWeeksAgoMonday.getMonth() + 1,
          twoWeeksAgoMonday.getDate(),
          0,
          0,
          0,
          tz,
        );
        const endUTC = convertTimezoneToUTC(
          twoWeeksAgoSunday.getFullYear(),
          twoWeeksAgoSunday.getMonth() + 1,
          twoWeeksAgoSunday.getDate(),
          23,
          59,
          59,
          tz,
        );
        return [startUTC.getTime(), endUTC.getTime()];
      },
      [$t('reports.shortcuts.last4Weeks')]: (): [number, number] => {
        const now = new Date(tzNow.year, tzNow.month - 1, tzNow.day);
        const dayOfWeek = now.getDay();
        const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        const fourWeeksAgoMonday = new Date(now);
        fourWeeksAgoMonday.setDate(now.getDate() - daysFromMonday - 28);
        const lastSunday = new Date(now);
        lastSunday.setDate(now.getDate() - daysFromMonday - 1);
        const startUTC = convertTimezoneToUTC(
          fourWeeksAgoMonday.getFullYear(),
          fourWeeksAgoMonday.getMonth() + 1,
          fourWeeksAgoMonday.getDate(),
          0,
          0,
          0,
          tz,
        );
        const endUTC = convertTimezoneToUTC(
          lastSunday.getFullYear(),
          lastSunday.getMonth() + 1,
          lastSunday.getDate(),
          23,
          59,
          59,
          tz,
        );
        return [startUTC.getTime(), endUTC.getTime()];
      },
    };
  } else if (timeGranularity.value === 'month') {
    return {
      [$t('common.thisMonth')]: (): [number, number] => {
        const startUTC = convertTimezoneToUTC(
          tzNow.year,
          tzNow.month,
          1,
          0,
          0,
          0,
          tz,
        );
        const endUTC = convertTimezoneToUTC(
          tzNow.year,
          tzNow.month,
          tzNow.day,
          23,
          59,
          59,
          tz,
        );
        return [startUTC.getTime(), endUTC.getTime()];
      },
      [$t('reports.shortcuts.lastMonth')]: (): [number, number] => {
        const lastMonth = tzNow.month === 1 ? 12 : tzNow.month - 1;
        const lastMonthYear = tzNow.month === 1 ? tzNow.year - 1 : tzNow.year;
        const lastDay = new Date(lastMonthYear, lastMonth, 0).getDate();
        const startUTC = convertTimezoneToUTC(
          lastMonthYear,
          lastMonth,
          1,
          0,
          0,
          0,
          tz,
        );
        const endUTC = convertTimezoneToUTC(
          lastMonthYear,
          lastMonth,
          lastDay,
          23,
          59,
          59,
          tz,
        );
        return [startUTC.getTime(), endUTC.getTime()];
      },
      [$t('reports.shortcuts.last3Months')]: (): [number, number] => {
        const threeMonthsAgo =
          tzNow.month <= 3 ? tzNow.month + 9 : tzNow.month - 3;
        const threeMonthsAgoYear =
          tzNow.month <= 3 ? tzNow.year - 1 : tzNow.year;
        const startUTC = convertTimezoneToUTC(
          threeMonthsAgoYear,
          threeMonthsAgo,
          1,
          0,
          0,
          0,
          tz,
        );
        const endUTC = convertTimezoneToUTC(
          tzNow.year,
          tzNow.month,
          tzNow.day,
          23,
          59,
          59,
          tz,
        );
        return [startUTC.getTime(), endUTC.getTime()];
      },
    };
  }

  return {};
});

function walkLeafColumns(
  cols: DataTableColumns,
  visitor: (col: Record<string, any>) => void,
) {
  for (const col of cols as Record<string, any>[]) {
    if (col.children?.length) {
      walkLeafColumns(col.children, visitor);
    } else {
      visitor(col);
    }
  }
}

/** Bottom 总计 row — single table, no duplicate header */
const operationsTableSummary: DataTableCreateSummary = () => {
  const total = totalData.value;
  if (!total) return {};

  const summaryRow = {
    ...(total as Record<string, any>),
    isTotal: true,
    date: $t('common.total'),
  };
  const summary: Record<string, { value: unknown }> = {};

  walkLeafColumns(columns.value, (col) => {
    const key = col.key as string;
    if (!key) return;
    if (key === 'date') {
      summary[key] = {
        value: h('span', { style: { fontWeight: 'bold' } }, $t('common.total')),
      };
      return;
    }
    if (col.render) {
      summary[key] = { value: col.render(summaryRow) };
      return;
    }
    summary[key] = { value: summaryRow[key] ?? '' };
  });

  return summary;
};

// Helper function to render numeric cell
// Count fields (人数, 次数, count) show no decimals
// Amount fields show 2 decimals
const renderNumericCell = (
  row: any,
  key: string,
  clickable = false,
  isCount = false,
) => {
  const value = row[key] || 0;
  const style: any = {};

  // Don't make total row cells clickable
  if (clickable && value !== 0 && !row.isTotal) {
    style.color = '#1890ff';
    style.cursor = 'pointer';
  }

  // Format based on field type
  let displayValue: string;
  if (typeof value === 'number') {
    displayValue = isCount ? Math.round(value).toString() : value.toFixed(2);
  } else {
    displayValue = value;
  }

  return h(
    'span',
    {
      style,
      onClick:
        clickable && value !== 0 && !row.isTotal
          ? () => handleCellClick(key, row)
          : undefined,
    },
    displayValue,
  );
};

const toNumber = (value: unknown): number => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const getFirstDepositPerCapita = (row: any): number => {
  if (row?.firstDepositPerCapita !== undefined && row?.firstDepositPerCapita !== null) {
    return toNumber(row.firstDepositPerCapita);
  }
  if (
    row?.firstDepositAvgAmount !== undefined &&
    row?.firstDepositAvgAmount !== null
  ) {
    return toNumber(row.firstDepositAvgAmount);
  }

  const firstDepositAmount = toNumber(row?.firstDepositAmount);
  const firstDepositCount = toNumber(row?.firstDeposits);

  const manualFirstDepositAmount =
    toNumber(row?.manualFirstDepositAmount) +
    toNumber(row?.manualApprovedFirstDepositAmount) +
    toNumber(row?.manualApproveFirstDepositAmount);
  const manualFirstDepositCount =
    toNumber(row?.manualFirstDepositCount) +
    toNumber(row?.manualApprovedFirstDepositCount) +
    toNumber(row?.manualApproveFirstDepositCount);

  const adjustedAmount = Math.max(0, firstDepositAmount - manualFirstDepositAmount);
  const adjustedCount = Math.max(0, firstDepositCount - manualFirstDepositCount);

  if (adjustedCount <= 0) return 0;
  return adjustedAmount / adjustedCount;
};

// Helper function to check if a column category has any non-zero data
const hasDataForCategory = (keys: string[]): boolean => {
  if (!reportData.value || reportData.value.length === 0) return false;

  const dataRows = reportData.value;
  if (dataRows.length === 0) return false;

  return keys.some((key) => {
    return dataRows.some((row: any) => {
      const value = row[key];
      if (value === null || value === undefined) return false;
      const numValue = typeof value === 'number' ? value : parseFloat(value);
      return !isNaN(numValue) && numValue !== 0;
    });
  });
};

// Table columns with category grouping - dynamically hide unused categories
const columns = computed<DataTableColumns>(() => {
  const c = (key: string) => $t(`reports.columns.${key}`);
  const g = (key: string) => $t(`reports.categories.${key}`);

  const baseColumns: DataTableColumns = [
    // Fixed columns
    {
      title: c('date'),
      key: 'date',
      width: 120,
      fixed: 'left',
      render: (row: any) => {
        // Display date as-is from API (should already be in correct format)
        // The API returns dates as YYYY-MM-DD strings, display them directly
        let displayDate = row.date || '';
        if (row.date && typeof row.date === 'string') {
          // If it's already in YYYY-MM-DD format, convert to display format
          if (/^\d{4}-\d{2}-\d{2}$/.test(row.date)) {
            const [year, month, day] = row.date.split('-');
            displayDate = `${year}/${month}/${day}`;
          } else {
            // Try to parse and format if it's a different format
            try {
              const dateObj = new Date(row.date);
              if (!isNaN(dateObj.getTime())) {
                displayDate = new Intl.DateTimeFormat('zh-CN', {
                  timeZone: currentTimezone.value,
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                }).format(dateObj);
              }
            } catch (e) {
              // Keep original if formatting fails
            }
          }
        }
        return h(
          'span',
          {
            style: row.isTotal ? { fontWeight: 'bold' } : {},
          },
          displayDate,
        );
      },
    },
    {
      title: $t('common.currency'),
      key: 'currency',
      width: 80,
    },

    // 会员(人) category - WITH HEADER
    {
      title: g('memberPeople'),
      key: 'memberCategory',
      children: [
        {
          title: c('visitCount'),
          key: 'visitCount',
          width: 100,
          sorter: true,
          render: (row: any) =>
            renderNumericCell(row, 'visitCount', true, true), // isCount
        },
        {
          title: c('newAgents'),
          key: 'newAgents',
          width: 100,
          sorter: true,
          render: (row: any) =>
            renderNumericCell(row, 'newAgents', false, true), // isCount
        },
        {
          title: c('registrations'),
          key: 'registrations',
          width: 100,
          sorter: true,
          render: (row: any) =>
            renderNumericCell(row, 'registrations', true, true), // isCount
        },
        {
          title: c('firstDeposits'),
          key: 'firstDeposits',
          width: 100,
          sorter: true,
          render: (row: any) =>
            renderNumericCell(row, 'firstDeposits', true, true), // isCount
        },
        {
          title: c('logins'),
          key: 'logins',
          width: 100,
          sorter: true,
          render: (row: any) => renderNumericCell(row, 'logins', false, true), // isCount
        },
      ],
    },

    // 充提 category - WITH HEADER
    {
      title: g('depositWithdraw'),
      key: 'depositWithdrawCategory',
      children: [
        {
          title: c('firstDepositAmount'),
          key: 'firstDepositAmount',
          width: 120,
          sorter: true,
          render: (row: any) => renderNumericCell(row, 'firstDepositAmount'),
        },
        {
          title: c('firstDepositPerCapita'),
          key: 'firstDepositPerCapita',
          width: 130,
          sorter: true,
          render: (row: any) => {
            const value = getFirstDepositPerCapita(row);
            return h('span', {}, value.toFixed(2));
          },
        },
        {
          title: c('totalDepositAmount'),
          key: 'totalDepositAmount',
          width: 120,
          sorter: true,
          render: (row: any) =>
            renderNumericCell(row, 'totalDepositAmount', true),
        },
        {
          title: c('manualRechargeAmount'),
          key: 'manualRechargeAmount',
          width: 120,
          sorter: true,
          render: (row: any) =>
            renderNumericCell(row, 'manualRechargeAmount', true),
        },
        {
          title: c('depositUserCount'),
          key: 'depositUserCount',
          width: 100,
          sorter: true,
          render: (row: any) =>
            renderNumericCell(row, 'depositUserCount', true, true), // isCount
        },
        {
          title: c('depositCount'),
          key: 'depositCount',
          width: 100,
          sorter: true,
          render: (row: any) =>
            renderNumericCell(row, 'depositCount', false, true), // isCount
        },
        {
          title: c('totalWithdrawalAmount'),
          key: 'totalWithdrawalAmount',
          width: 120,
          sorter: true,
          render: (row: any) =>
            renderNumericCell(row, 'totalWithdrawalAmount', true),
        },
        {
          title: c('withdrawalUserCount'),
          key: 'withdrawalUserCount',
          width: 100,
          sorter: true,
          render: (row: any) =>
            renderNumericCell(row, 'withdrawalUserCount', true, true), // isCount
        },
        {
          title: c('withdrawalCount'),
          key: 'withdrawalCount',
          width: 100,
          sorter: true,
          render: (row: any) =>
            renderNumericCell(row, 'withdrawalCount', false, true), // isCount
        },
        {
          title: c('unfundedWithdrawUserCount'),
          key: 'unfundedWithdrawUserCount',
          width: 120,
          sorter: true,
          render: (row: any) =>
            renderNumericCell(row, 'unfundedWithdrawUserCount', true, true), // isCount
        },
        {
          title: c('fundedWithdrawUserCount'),
          key: 'fundedWithdrawUserCount',
          width: 120,
          sorter: true,
          render: (row: any) =>
            renderNumericCell(row, 'fundedWithdrawUserCount', true, true), // isCount
        },
        {
          title: c('unfundedWithdrawAmount'),
          key: 'unfundedWithdrawAmount',
          width: 120,
          sorter: true,
          render: (row: any) =>
            renderNumericCell(row, 'unfundedWithdrawAmount', true),
        },
        {
          title: c('fundedWithdrawAmount'),
          key: 'fundedWithdrawAmount',
          width: 120,
          sorter: true,
          render: (row: any) =>
            renderNumericCell(row, 'fundedWithdrawAmount', true),
        },
        {
          title: c('depositWithdrawalDiff'),
          key: 'depositWithdrawalDiff',
          width: 120,
          sorter: true,
          render: (row: any) => renderNumericCell(row, 'depositWithdrawalDiff'),
        },
        /* hidden: 大R玩家
        {
          title: '大R玩家',
          key: 'bigRPlayers',
          width: 100,
          sorter: true,
          render: (row: any) =>
            renderNumericCell(row, 'bigRPlayers', false, true), // isCount
        },
        */
      ],
    },

    // 俱乐部 category - WITH HEADER
    {
      title: g('club'),
      key: 'clubCategory',
      children: [
        {
          title: c('clubDepositSettlementRevenue'),
          key: 'clubDepositSettlementRevenue',
          width: 140,
          sorter: true,
          render: (row: any) =>
            renderNumericCell(row, 'clubDepositSettlementRevenue'),
        },
        {
          title: c('clubDepositRecharge'),
          key: 'clubDepositRecharge',
          width: 150,
          sorter: true,
          render: (row: any) => renderNumericCell(row, 'clubDepositRecharge'),
        },
        {
          title: c('clubDepositTransferOut'),
          key: 'clubDepositTransferOut',
          width: 150,
          sorter: true,
          render: (row: any) =>
            renderNumericCell(row, 'clubDepositTransferOut'),
        },
        {
          title: c('clubMemberTopUp'),
          key: 'clubMemberTopUp',
          width: 140,
          sorter: true,
          render: (row: any) => renderNumericCell(row, 'clubMemberTopUp'),
        },
        {
          title: c('clubMemberWithdraw'),
          key: 'clubMemberWithdraw',
          width: 140,
          sorter: true,
          render: (row: any) => renderNumericCell(row, 'clubMemberWithdraw'),
        },
      ],
    },

    // 信用借款 category - WITH HEADER
    {
      title: g('creditLoan'),
      key: 'creditLoanCategory',
      children: [
        {
          title: c('netLending'),
          key: 'netLending',
          width: 100,
          sorter: true,
          render: (row: any) => renderNumericCell(row, 'netLending'),
        },
        {
          title: c('overdueDebt'),
          key: 'overdueDebt',
          width: 100,
          sorter: true,
          render: (row: any) => renderNumericCell(row, 'overdueDebt'),
        },
        {
          title: c('memberLoan'),
          key: 'memberLoan',
          width: 100,
          sorter: true,
          render: (row: any) => renderNumericCell(row, 'memberLoan'),
        },
        {
          title: c('memberRepayment'),
          key: 'memberRepayment',
          width: 100,
          sorter: true,
          render: (row: any) => renderNumericCell(row, 'memberRepayment'),
        },
        {
          title: c('bettorCount'),
          key: 'bettorCount',
          width: 100,
          sorter: true,
          render: (row: any) =>
            renderNumericCell(row, 'bettorCount', false, true), // isCount
        },
      ],
    },

    // 游戏 category - WITH HEADER
    {
      title: g('game'),
      key: 'gameCategory',
      children: [
        {
          title: c('validBetting'),
          key: 'validBetting',
          width: 120,
          sorter: true,
          render: (row: any) => renderNumericCell(row, 'validBetting', true),
        },
        {
          title: c('killRate'),
          key: 'killRate',
          width: 100,
          sorter: true,
          render: (row: any) => {
            const value = row.killRate || 0;
            return h('span', {}, `${value.toFixed(2)}%`);
          },
        },
        {
          title: c('gameProfitLoss'),
          key: 'gameProfitLoss',
          width: 120,
          sorter: true,
          render: (row: any) => renderNumericCell(row, 'gameProfitLoss'),
        },
        /* hidden: 预扣税
        {
          title: '预扣税',
          key: 'withholdingTax',
          width: 100,
          sorter: true,
          render: (row: any) => renderNumericCell(row, 'withholdingTax'),
        },
        */
        {
          title: c('betDepositRatio'),
          key: 'betDepositRatio',
          width: 100,
          sorter: true,
          render: (row: any) => {
            const value = row.betDepositRatio || 0;
            return h('span', {}, `${value.toFixed(2)}%`);
          },
        },
        {
          title: c('unsettledBets'),
          key: 'unsettledBets',
          width: 120,
          sorter: true,
          render: (row: any) => renderNumericCell(row, 'unsettledBets'),
        },
      ],
    },

    // 优惠活动 category - WITH HEADER
    {
      title: g('promotion'),
      key: 'promotionCategory',
      children: [
        {
          title: c('commission'),
          key: 'commission',
          width: 100,
          sorter: true,
          render: (row: any) => renderNumericCell(row, 'commission', true),
        },
        {
          title: c('promotionalAmount'),
          key: 'promotionalAmount',
          width: 120,
          sorter: true,
          render: (row: any) =>
            renderNumericCell(row, 'promotionalAmount', true),
        },
        {
          title: c('abandonedRewards'),
          key: 'abandonedRewards',
          width: 100,
          sorter: true,
          render: (row: any) => renderNumericCell(row, 'abandonedRewards'),
        },
        {
          title: c('activities'),
          key: 'activities',
          width: 100,
          sorter: true,
          render: (row: any) => renderNumericCell(row, 'activities'),
        },
        {
          title: c('tasks'),
          key: 'tasks',
          width: 100,
          sorter: true,
          render: (row: any) => renderNumericCell(row, 'tasks'),
        },
        {
          title: c('rebate'),
          key: 'rebate',
          width: 100,
          sorter: true,
          render: (row: any) => renderNumericCell(row, 'rebate'),
        },
        {
          title: c('vipRewards'),
          key: 'vipRewards',
          width: 100,
          sorter: true,
          render: (row: any) => renderNumericCell(row, 'vipRewards'),
        },
        {
          title: c('depositBonus'),
          key: 'depositBonus',
          width: 100,
          sorter: true,
          render: (row: any) => renderNumericCell(row, 'depositBonus'),
        },
        /* hidden: 利息宝利息 / 公积金 / 盲盒抽奖 / 幸运转盘
        {
          title: '利息宝利息',
          key: 'interestTreasureInterest',
          width: 120,
          sorter: true,
          render: (row: any) =>
            renderNumericCell(row, 'interestTreasureInterest'),
        },
        {
          title: '公积金',
          key: 'providentFund',
          width: 100,
          sorter: true,
          render: (row: any) => renderNumericCell(row, 'providentFund'),
        },
        {
          title: '盲盒抽奖',
          key: 'blindBoxLottery',
          width: 100,
          sorter: true,
          render: (row: any) => renderNumericCell(row, 'blindBoxLottery'),
        },
        {
          title: '幸运转盘',
          key: 'luckyWheel',
          width: 100,
          sorter: true,
          render: (row: any) => renderNumericCell(row, 'luckyWheel'),
        },
        */
      ],
    },

    // 存量 category - WITH HEADER
    {
      title: g('inventory'),
      key: 'inventoryCategory',
      children: [
        {
          title: c('accountBalance'),
          key: 'accountBalance',
          width: 120,
          sorter: true,
          render: (row: any) => renderNumericCell(row, 'accountBalance', true),
        },
        /* hidden: 利息宝 / 奖励钱包
        {
          title: '利息宝',
          key: 'interestTreasure',
          width: 100,
          sorter: true,
          render: (row: any) =>
            renderNumericCell(row, 'interestTreasure', true),
        },
        {
          title: '奖励钱包',
          key: 'rewardWallet',
          width: 100,
          sorter: true,
          render: (row: any) => renderNumericCell(row, 'rewardWallet'),
        },
        */
        {
          title: c('thirdPartyBalance'),
          key: 'thirdPartyBalance',
          width: 100,
          sorter: true,
          render: (row: any) => renderNumericCell(row, 'thirdPartyBalance'),
        },
        {
          title: c('clubDeposit'),
          key: 'clubDeposit',
          width: 120,
          sorter: true,
          render: (row: any) => renderNumericCell(row, 'clubDeposit'),
        },
      ],
    },

    // No category columns (without header group)
    /* hidden: 余额账变总计 / 三方转出入账变 / 利息宝转出入 / 银商充值
    {
      title: '余额账变总计',
      key: 'balanceChanges',
      width: 130,
      sorter: true,
      render: (row: any) => renderNumericCell(row, 'balanceChanges', true),
    },
    {
      title: '三方转出入账变',
      key: 'thirdPartyTransfer',
      width: 140,
      sorter: true,
      render: (row: any) => renderNumericCell(row, 'thirdPartyTransfer'),
    },
    {
      title: '利息宝转出入',
      key: 'interestTreasureTransfer',
      width: 130,
      sorter: true,
      render: (row: any) => renderNumericCell(row, 'interestTreasureTransfer'),
    },
    {
      title: '银商充值',
      key: 'silverMerchantRecharge',
      width: 100,
      sorter: true,
      render: (row: any) => renderNumericCell(row, 'silverMerchantRecharge'),
    },
    */
    {
      title: c('onlineRecharge'),
      key: 'onlineRecharge',
      width: 100,
      sorter: true,
      render: (row: any) => renderNumericCell(row, 'onlineRecharge'),
    },
    /* hidden: 转账充值 / 客服代充
    {
      title: '转账充值',
      key: 'transferRecharge',
      width: 100,
      sorter: true,
      render: (row: any) => renderNumericCell(row, 'transferRecharge'),
    },
    {
      title: '客服代充',
      key: 'customerServiceRecharge',
      width: 100,
      sorter: true,
      render: (row: any) => renderNumericCell(row, 'customerServiceRecharge'),
    },
    */
    {
      title: c('manualAdjustment'),
      key: 'manualAdjustment',
      width: 100,
      sorter: true,
      render: (row: any) => renderNumericCell(row, 'manualAdjustment'),
    },
    {
      title: c('manualAddFunds'),
      key: 'manualAddFunds',
      width: 100,
      sorter: true,
      render: (row: any) => renderNumericCell(row, 'manualAddFunds'),
    },
    {
      title: c('manualDeductFunds'),
      key: 'manualDeductFunds',
      width: 100,
      sorter: true,
      render: (row: any) => renderNumericCell(row, 'manualDeductFunds'),
    },
    /* hidden: 打赏
    {
      title: '打赏',
      key: 'tipping',
      width: 80,
      sorter: true,
      render: (row: any) => renderNumericCell(row, 'tipping'),
    },
    */
  ];

  // ✅ Filter out unused categories (club and credit loan) if they have no data
  const clubKeys = [
    'clubDepositSettlementRevenue',
    'clubDepositRecharge',
    'clubDepositTransferOut',
    'clubMemberTopUp',
    'clubMemberWithdraw',
    'clubDeposit',
  ];
  const creditLoanKeys = [
    'netLending',
    'overdueDebt',
    'memberLoan',
    'memberRepayment',
  ];

  const hasClubData = hasDataForCategory(clubKeys);
  const hasCreditLoanData = hasDataForCategory(creditLoanKeys);

  // Filter out club category if no data
  if (!hasClubData) {
    const clubCategoryIndex = baseColumns.findIndex(
      (col: any) => col.key === 'clubCategory',
    );
    if (clubCategoryIndex !== -1) {
      baseColumns.splice(clubCategoryIndex, 1);
    }
    // Also remove clubDeposit from inventory category
    const inventoryCategory = baseColumns.find(
      (col: any) => col.key === 'inventoryCategory',
    ) as any;
    if (inventoryCategory && inventoryCategory.children) {
      const clubDepositIndex = inventoryCategory.children.findIndex(
        (col: any) => col.key === 'clubDeposit',
      );
      if (clubDepositIndex !== -1) {
        inventoryCategory.children.splice(clubDepositIndex, 1);
      }
    }
  }

  // Filter out credit loan category if no data (but keep bettorCount - move it to game category)
  if (!hasCreditLoanData) {
    const creditLoanCategoryIndex = baseColumns.findIndex(
      (col: any) => col.key === 'creditLoanCategory',
    );
    if (creditLoanCategoryIndex !== -1) {
      const creditLoanCategory = baseColumns[creditLoanCategoryIndex] as any;
      // Extract bettorCount before removing the category
      const bettorCountCol = creditLoanCategory.children?.find(
        (col: any) => col.key === 'bettorCount',
      );
      if (bettorCountCol) {
        // Move bettorCount to game category
        const gameCategory = baseColumns.find(
          (col: any) => col.key === 'gameCategory',
        ) as any;
        if (gameCategory && gameCategory.children) {
          // Remove bettorCount from credit loan
          const bettorCountIndex = creditLoanCategory.children.findIndex(
            (col: any) => col.key === 'bettorCount',
          );
          if (bettorCountIndex !== -1) {
            creditLoanCategory.children.splice(bettorCountIndex, 1);
          }
          // Add to game category
          gameCategory.children.push(bettorCountCol);
        }
      }
      // Remove the entire credit loan category
      baseColumns.splice(creditLoanCategoryIndex, 1);
    }
  }

  return baseColumns;
});

// Handle cell click for drill-down functionality
const handleCellClick = (field: string, row: any) => {
  console.log(`Clicked ${field} for date ${row.date}`);
  // TODO: Implement drill-down navigation
};

// Handle time granularity change
const onTimeGranularityChange = (value: string) => {
  timeGranularity.value = value;
  // Update date range based on granularity
  updateDateRangeForGranularity();
};

// Update date range based on selected granularity - use timezone
const updateDateRangeForGranularity = () => {
  const tz = currentTimezone.value;
  const tzNow = getNowInTimezone(tz);
  let startUTC: Date;
  let endUTC: Date;

  switch (timeGranularity.value) {
    case 'day':
      // Show current day only in timezone
      startUTC = convertTimezoneToUTC(
        tzNow.year,
        tzNow.month,
        tzNow.day,
        0,
        0,
        0,
        tz,
      );
      endUTC = convertTimezoneToUTC(
        tzNow.year,
        tzNow.month,
        tzNow.day,
        23,
        59,
        59,
        tz,
      );
      break;
    case 'week':
      // Show last 7 days including today in timezone
      const today = new Date(tzNow.year, tzNow.month - 1, tzNow.day);
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 6); // 6 days ago + today = 7 days total

      startUTC = convertTimezoneToUTC(
        sevenDaysAgo.getFullYear(),
        sevenDaysAgo.getMonth() + 1,
        sevenDaysAgo.getDate(),
        0,
        0,
        0,
        tz,
      );
      endUTC = convertTimezoneToUTC(
        today.getFullYear(),
        today.getMonth() + 1,
        today.getDate(),
        23,
        59,
        59,
        tz,
      );
      break;
    case 'month':
      // Show current month (1st to today) in timezone
      startUTC = convertTimezoneToUTC(tzNow.year, tzNow.month, 1, 0, 0, 0, tz);
      endUTC = convertTimezoneToUTC(
        tzNow.year,
        tzNow.month,
        tzNow.day,
        23,
        59,
        59,
        tz,
      );
      break;
    default:
      startUTC = convertTimezoneToUTC(
        tzNow.year,
        tzNow.month,
        tzNow.day,
        0,
        0,
        0,
        tz,
      );
      endUTC = convertTimezoneToUTC(
        tzNow.year,
        tzNow.month,
        tzNow.day,
        23,
        59,
        59,
        tz,
      );
  }

  dateRange.value = [startUTC.getTime(), endUTC.getTime()];
};

// Watch for timezone changes from header
watch(currentTimezone, () => {
  // Update date range when header timezone changes
  if (dateRange.value) {
    updateDateRangeForGranularity();
  }
});

// Reset filters
const resetFilters = () => {
  timeGranularity.value = 'day';
  currency.value = 'BRL';
  updateDateRangeForGranularity();
  fetchData();
};

// Fetch data from API - convert timezone dates to UTC
const fetchData = async () => {
  if (!dateRange.value || dateRange.value.length !== 2) {
    message.warning($t('reports.selectDateRange'));
    return;
  }

  loading.value = true;
  error.value = '';
  // Reset pagination when fetching new data
  paginationPage.value = 1;

  try {
    const tz = currentTimezone.value;

    // The dateRange contains timestamps from the date picker
    // The date picker shows dates in browser local time, but we need to interpret
    // what date the user actually selected in the selected timezone
    const startDate = new Date(dateRange.value[0]);
    const endDate = new Date(dateRange.value[1]);

    // Get date components in the selected timezone using formatToParts (more reliable)
    const startTzParts = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).formatToParts(startDate);

    const endTzParts = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).formatToParts(endDate);

    // Extract date components (what the user selected in timezone)
    const startYear = parseInt(
      startTzParts.find((p) => p.type === 'year')!.value,
    );
    const startMonth = parseInt(
      startTzParts.find((p) => p.type === 'month')!.value,
    );
    const startDay = parseInt(
      startTzParts.find((p) => p.type === 'day')!.value,
    );

    const endYear = parseInt(endTzParts.find((p) => p.type === 'year')!.value);
    const endMonth = parseInt(
      endTzParts.find((p) => p.type === 'month')!.value,
    );
    const endDay = parseInt(endTzParts.find((p) => p.type === 'day')!.value);

    // Convert timezone dates to UTC timestamps (start and end of day in selected timezone)
    const startUTC = convertTimezoneToUTC(
      startYear,
      startMonth,
      startDay,
      0,
      0,
      0,
      tz,
    );
    const endUTC = convertTimezoneToUTC(
      endYear,
      endMonth,
      endDay,
      23,
      59,
      59,
      tz,
    );

    // Send the dates as the user selected them in the timezone (YYYY-MM-DD format)
    // The backend should ideally handle timezone conversion, but currently it interprets dates as UTC
    // For now, we send the dates as selected and the backend will query for those UTC days
    // TODO: Backend should use TimezoneAwareDateService to properly handle timezone conversion
    const startDateStr = `${startYear}-${String(startMonth).padStart(2, '0')}-${String(startDay).padStart(2, '0')}`;
    const endDateStr = `${endYear}-${String(endMonth).padStart(2, '0')}-${String(endDay).padStart(2, '0')}`;

    console.log('📅 Date conversion:', {
      timezone: tz,
      userSelectedInTimezone: {
        start: `${startYear}-${String(startMonth).padStart(2, '0')}-${String(startDay).padStart(2, '0')}`,
        end: `${endYear}-${String(endMonth).padStart(2, '0')}-${String(endDay).padStart(2, '0')}`,
      },
      utcTimestamps: {
        start: startUTC.toISOString(),
        end: endUTC.toISOString(),
      },
      sentToAPI: {
        start: startDateStr,
        end: endDateStr,
      },
    });

    // Add forceRefresh to bypass cache and get fresh data
    const result = await getDailyOperationsReport({
      startDate: startDateStr,
      endDate: endDateStr,
      currency: currency.value,
      granularity: timeGranularity.value as 'day' | 'week' | 'month',
      forceRefresh: 'true', // Force refresh to bypass cache with old data
    });

    if (result.success) {
      reportData.value = result.data || [];
      totalData.value = result.total || null;
      message.success($t('reports.dataLoadedSuccess'));
    } else {
      throw new Error(result.message || $t('reports.fetchDataFailed'));
    }
  } catch (err) {
    error.value =
      err instanceof Error ? err.message : $t('reports.fetchDataError');
    message.error(error.value);
  } finally {
    loading.value = false;
  }
};

// Export to Excel using reusable utility
const exportToExcel = async () => {
  if (!dateRange.value || dateRange.value.length !== 2) {
    message.warning($t('reports.selectDateRangeFirst'));
    return;
  }

  if (!exportTableData.value || exportTableData.value.length === 0) {
    message.warning($t('reports.noDataToExport'));
    return;
  }

  exporting.value = true;

  try {
    // Generate filename
    const startDateStr = new Date(dateRange.value[0])
      .toISOString()
      .split('T')[0];
    const endDate = new Date(dateRange.value[1]);
    endDate.setHours(23, 59, 59, 999);
    const endDateStr = endDate.toISOString().split('T')[0];
    const filename = $t('reports.exportFilename', [startDateStr, endDateStr]);

    await exportGridData(columns.value as any, exportTableData.value, {
      filename,
      sheetName: $t('reports.exportSheetName'),
      format: 'xlsx',
    });
  } catch (err) {
    console.error('Export error:', err);
    message.error(
      $t('reports.exportFailed', [
        err instanceof Error ? err.message : $t('reports.unknownError'),
      ]),
    );
  } finally {
    exporting.value = false;
  }
};

// Listen for timezone changes from header
const handleStorageChange = (e: StorageEvent) => {
  if (e.key === 'preferred_timezone') {
    // Header timezone changed, update date range
    if (dateRange.value) {
      updateDateRangeForGranularity();
    }
  }
};

// Listen for timezone changes from header
const handleCustomTimezoneChange = () => {
  if (dateRange.value) {
    updateDateRangeForGranularity();
  }
};

// Initialize with default values
onMounted(() => {
  updateDateRangeForGranularity();
  fetchData();

  // Listen for timezone changes from header component
  window.addEventListener('storage', handleStorageChange);
  window.addEventListener('timezone-changed', handleCustomTimezoneChange);
});

onUnmounted(() => {
  window.removeEventListener('storage', handleStorageChange);
  window.removeEventListener('timezone-changed', handleCustomTimezoneChange);
});
</script>

<style scoped>
.daily-operations-report {
  padding: 0px;
}

/* Table styling */
.operations-report-table :deep(.n-data-table-th) {
  font-weight: 600;
  background-color: #fafafa;
  border: 1px solid #d9d9d9 !important;
  text-align: right !important;
}

/* Right-align category headers (parent headers with children) */
.operations-report-table :deep(.n-data-table-th:has(.n-data-table-th)) {
  text-align: right !important;
  justify-content: flex-end !important;
}

/* Category header styling - top level headers with children */
.operations-report-table
  :deep(.n-data-table-thead > tr:first-child > .n-data-table-th) {
  text-align: center !important;
  font-weight: bold;
  background-color: #f0f0f0;
  border-bottom: 2px solid #d9d9d9;
}

.operations-report-table
  :deep(
    .n-data-table-thead
      > tr:first-child
      > .n-data-table-th
      .n-data-table-th__title
  ) {
  justify-content: flex-end !important;
}

.ops-table-pagination {
  display: flex;
  justify-content: flex-end;
  padding-top: 10px;
}

/* 总计行贴在表格滚动区底部（与 SiteBillDetailPanel 相同做法） */
.operations-report-table
  :deep(tr.n-data-table-tr--summary td.n-data-table-td) {
  position: sticky;
  bottom: 0;
  z-index: 3;
  background-color: #f5f5f5 !important;
  font-weight: bold;
  border-top: 2px solid #bfbfbf;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.08);
}

/* Clickable cells */
:deep(.clickable-cell) {
  cursor: pointer;
  color: #1890ff;
}

:deep(.clickable-cell:hover) {
  text-decoration: underline;
}

/* Grid lines and center alignment for all cells */
.operations-report-table :deep(.n-data-table-td) {
  text-align: center !important;
  border: 1px solid #d9d9d9 !important;
}

/* Ensure table has borders */
.operations-report-table :deep(.n-data-table) {
  border: 1px solid #d9d9d9;
}

.table-wrapper {
  position: relative;
  width: 100%;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .daily-operations-report {
    padding: 8px;
  }
}
</style>
