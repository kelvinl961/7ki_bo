<template>
  <div class="daily-operations-report">
    <n-card title="" class="mb-4">
      <!-- Filter Section -->
      <div class="mb-4">
        <n-form inline>
          <!-- Time Granularity Selector -->
          <n-form-item label="快捷选择">
            <n-radio-group
              v-model:value="timeGranularity"
              @update:value="onTimeGranularityChange"
            >
              <n-radio-button value="day">日</n-radio-button>
              <n-radio-button value="week">周</n-radio-button>
              <n-radio-button value="month">月</n-radio-button>
            </n-radio-group>
          </n-form-item>

          <!-- Date Range Picker -->
          <n-form-item :label="`日期范围 (${currentTimezone})`">
            <n-date-picker
              v-model:value="dateRange"
              type="daterange"
              :shortcuts="dateShortcuts as any"
              :placeholder="`选择开始和结束日期 (${currentTimezone})`"
              format="yyyy-MM-dd"
              style="width: 300px"
              clearable
            />
          </n-form-item>

          <!-- Currency Selector -->
          <n-form-item label="币种">
            <n-select
              v-model:value="currency"
              :options="currencyOptions"
              placeholder="选择币种"
              style="width: 120px"
            />
          </n-form-item>

          <!-- Action Buttons -->
          <n-form-item>
            <n-button type="primary" @click="fetchData" :loading="loading">
              搜索
            </n-button>
          </n-form-item>
          <n-form-item>
            <n-button @click="resetFilters"> 重置 </n-button>
          </n-form-item>
          <n-form-item>
            <n-button
              type="success"
              @click="exportToExcel"
              :loading="exporting"
            >
              导出Excel
            </n-button>
          </n-form-item>
        </n-form>
      </div>

      <!-- Data Grid -->
      <n-card size="small">
        <template #header>
          <n-space justify="space-between">
            <span>数据列表</span>
            <span style="font-size: 13px; color: #666">
              共 {{ reportData?.length || 0 }} 条记录
            </span>
          </n-space>
        </template>

        <!-- Loading State -->
        <div v-if="loading" class="py-8 text-center">
          <n-spin size="large" />
          <p class="mt-4">正在加载数据...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="py-8 text-center">
          <n-alert type="error" :title="error" />
        </div>

        <!-- Data Table -->
        <div
          v-else-if="tableData && tableData.length > 0"
          class="table-wrapper"
        >
          <n-data-table
            :columns="columns"
            :data="tableData"
            :loading="loading"
            :pagination="paginationConfig"
            :bordered="true"
            :scroll-x="scrollXWidth"
            size="small"
            :row-class-name="getRowClassName"
            class="operations-report-table"
            style="width: 100%; min-width: max-content"
          />
        </div>

        <!-- Empty State -->
        <n-empty v-else description="暂无数据" style="padding: 40px 0" />
      </n-card>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, h, watch } from 'vue';
import { useRouter } from 'vue-router';
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
  type DataTableColumns,
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
const router = useRouter();

// Reactive data
const loading = ref(false);
const exporting = ref(false);
const error = ref('');
const reportData = ref<any[]>([]);
const totalData = ref<any>(null);

// Pagination state
const paginationPage = ref(1);
const paginationPageSize = ref(20);

// Computed: combine reportData and totalData, with pagination
const tableData = computed(() => {
  if (!reportData.value || reportData.value.length === 0) return [];

  // Apply pagination to reportData (exclude total row from pagination)
  const startIndex = (paginationPage.value - 1) * paginationPageSize.value;
  const endIndex = startIndex + paginationPageSize.value;
  const paginatedData = reportData.value.slice(startIndex, endIndex);

  // Append total row at the end (always show total)
  if (totalData.value) {
    return [...paginatedData, { ...(totalData.value as any), isTotal: true }];
  }

  return paginatedData;
});

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

// Pagination config with reactive handlers
const paginationConfig = computed(() => ({
  page: paginationPage.value,
  pageSize: paginationPageSize.value,
  showSizePicker: true,
  pageSizes: [10, 20, 50, 100],
  itemCount: reportData.value?.length || 0,
  prefix: (info: { itemCount?: number }) => `共 ${info.itemCount || 0} 条`,
  onUpdatePage: (page: number) => {
    paginationPage.value = page;
    // Scroll to top of table when page changes
    const tableElement = document.querySelector('.operations-report-table');
    if (tableElement) {
      tableElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  },
  onUpdatePageSize: (pageSize: number) => {
    paginationPageSize.value = pageSize;
    paginationPage.value = 1; // Reset to first page when page size changes
  },
}));

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
      今天: (): [number, number] => {
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
      昨天: (): [number, number] => {
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
      最近3天: (): [number, number] => {
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
      最近7天: (): [number, number] => {
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
      上周: (): [number, number] => {
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
      上上周: (): [number, number] => {
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
      最近4周: (): [number, number] => {
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
      本月: (): [number, number] => {
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
      上月: (): [number, number] => {
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
      最近3个月: (): [number, number] => {
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

// Row class name for styling total row
const getRowClassName = (row: any) => {
  return row.isTotal ? 'total-row' : '';
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

// Helper function to check if a column category has any non-zero data
const hasDataForCategory = (keys: string[]): boolean => {
  if (!tableData.value || tableData.value.length === 0) return false;

  // Check all rows (excluding total row) for any non-zero values
  const dataRows = tableData.value.filter((row: any) => !row.isTotal);
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
  const baseColumns: DataTableColumns = [
    // Fixed columns
    {
      title: '日期',
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
      title: '币种',
      key: 'currency',
      width: 80,
    },

    // 会员(人) category - WITH HEADER
    {
      title: '会员(人)',
      key: 'memberCategory',
      children: [
        {
          title: '访问量',
          key: 'visitCount',
          width: 100,
          sorter: true,
          render: (row: any) =>
            renderNumericCell(row, 'visitCount', true, true), // isCount
        },
        {
          title: '新增代理',
          key: 'newAgents',
          width: 100,
          sorter: true,
          render: (row: any) =>
            renderNumericCell(row, 'newAgents', true, true), // isCount
        },
        {
          title: '注册',
          key: 'registrations',
          width: 100,
          sorter: true,
          render: (row: any) =>
            renderNumericCell(row, 'registrations', true, true), // isCount
        },
        {
          title: '首充',
          key: 'firstDeposits',
          width: 100,
          sorter: true,
          render: (row: any) =>
            renderNumericCell(row, 'firstDeposits', true, true), // isCount
        },
        {
          title: '登录',
          key: 'logins',
          width: 100,
          sorter: true,
          render: (row: any) => renderNumericCell(row, 'logins', false, true), // isCount
        },
      ],
    },

    // 充提 category - WITH HEADER
    {
      title: '充提',
      key: 'depositWithdrawCategory',
      children: [
        {
          title: '首充金额',
          key: 'firstDepositAmount',
          width: 120,
          sorter: true,
          render: (row: any) => renderNumericCell(row, 'firstDepositAmount'),
        },
        {
          title: '充值总额',
          key: 'totalDepositAmount',
          width: 120,
          sorter: true,
          render: (row: any) =>
            renderNumericCell(row, 'totalDepositAmount', true),
        },
        {
          title: '手动充值',
          key: 'manualRechargeAmount',
          width: 120,
          sorter: true,
          render: (row: any) =>
            renderNumericCell(row, 'manualRechargeAmount', true),
        },
        {
          title: '充值人数',
          key: 'depositUserCount',
          width: 100,
          sorter: true,
          render: (row: any) =>
            renderNumericCell(row, 'depositUserCount', true, true), // isCount
        },
        {
          title: '充值次数',
          key: 'depositCount',
          width: 100,
          sorter: true,
          render: (row: any) =>
            renderNumericCell(row, 'depositCount', false, true), // isCount
        },
        {
          title: '提现总额',
          key: 'totalWithdrawalAmount',
          width: 120,
          sorter: true,
          render: (row: any) =>
            renderNumericCell(row, 'totalWithdrawalAmount', true),
        },
        {
          title: '提现人数',
          key: 'withdrawalUserCount',
          width: 100,
          sorter: true,
          render: (row: any) =>
            renderNumericCell(row, 'withdrawalUserCount', true, true), // isCount
        },
        {
          title: '提现次数',
          key: 'withdrawalCount',
          width: 100,
          sorter: true,
          render: (row: any) =>
            renderNumericCell(row, 'withdrawalCount', false, true), // isCount
        },
        {
          title: '未充值出款人数',
          key: 'unfundedWithdrawUserCount',
          width: 130,
          sorter: true,
          render: (row: any) =>
            renderNumericCell(row, 'unfundedWithdrawUserCount', true, true),
        },
        {
          title: '已充值出款人数',
          key: 'fundedWithdrawUserCount',
          width: 130,
          sorter: true,
          render: (row: any) =>
            renderNumericCell(row, 'fundedWithdrawUserCount', true, true),
        },
        {
          title: '未充值出款总额',
          key: 'unfundedWithdrawAmount',
          width: 130,
          sorter: true,
          render: (row: any) =>
            renderNumericCell(row, 'unfundedWithdrawAmount', true),
        },
        {
          title: '已充值出款总额',
          key: 'fundedWithdrawAmount',
          width: 130,
          sorter: true,
          render: (row: any) =>
            renderNumericCell(row, 'fundedWithdrawAmount', true),
        },
        {
          title: '充提差额',
          key: 'depositWithdrawalDiff',
          width: 120,
          sorter: true,
          render: (row: any) => renderNumericCell(row, 'depositWithdrawalDiff'),
        },
        {
          title: '大R玩家',
          key: 'bigRPlayers',
          width: 100,
          sorter: true,
          render: (row: any) =>
            renderNumericCell(row, 'bigRPlayers', false, true), // isCount
        },
      ],
    },

    // 俱乐部 category - WITH HEADER
    {
      title: '俱乐部',
      key: 'clubCategory',
      children: [
        {
          title: '保证金结算收益',
          key: 'clubDepositSettlementRevenue',
          width: 140,
          sorter: true,
          render: (row: any) =>
            renderNumericCell(row, 'clubDepositSettlementRevenue'),
        },
        {
          title: '俱乐部保证金充值',
          key: 'clubDepositRecharge',
          width: 150,
          sorter: true,
          render: (row: any) => renderNumericCell(row, 'clubDepositRecharge'),
        },
        {
          title: '俱乐部保证金转出',
          key: 'clubDepositTransferOut',
          width: 150,
          sorter: true,
          render: (row: any) =>
            renderNumericCell(row, 'clubDepositTransferOut'),
        },
        {
          title: '俱乐部成员上分',
          key: 'clubMemberTopUp',
          width: 140,
          sorter: true,
          render: (row: any) => renderNumericCell(row, 'clubMemberTopUp'),
        },
        {
          title: '俱乐部成员下分',
          key: 'clubMemberWithdraw',
          width: 140,
          sorter: true,
          render: (row: any) => renderNumericCell(row, 'clubMemberWithdraw'),
        },
      ],
    },

    // 信用借款 category - WITH HEADER
    {
      title: '信用借款',
      key: 'creditLoanCategory',
      children: [
        {
          title: '净放债',
          key: 'netLending',
          width: 100,
          sorter: true,
          render: (row: any) => renderNumericCell(row, 'netLending'),
        },
        {
          title: '逾期债务',
          key: 'overdueDebt',
          width: 100,
          sorter: true,
          render: (row: any) => renderNumericCell(row, 'overdueDebt'),
        },
        {
          title: '会员借款',
          key: 'memberLoan',
          width: 100,
          sorter: true,
          render: (row: any) => renderNumericCell(row, 'memberLoan'),
        },
        {
          title: '会员还款',
          key: 'memberRepayment',
          width: 100,
          sorter: true,
          render: (row: any) => renderNumericCell(row, 'memberRepayment'),
        },
        {
          title: '投注人数',
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
      title: '游戏',
      key: 'gameCategory',
      children: [
        {
          title: '有效投注',
          key: 'validBetting',
          width: 120,
          sorter: true,
          render: (row: any) => renderNumericCell(row, 'validBetting', true),
        },
        {
          title: '杀率',
          key: 'killRate',
          width: 100,
          sorter: true,
          render: (row: any) => {
            const value = row.killRate || 0;
            return h('span', {}, `${value.toFixed(2)}%`);
          },
        },
        {
          title: '游戏盈亏',
          key: 'gameProfitLoss',
          width: 120,
          sorter: true,
          render: (row: any) => renderNumericCell(row, 'gameProfitLoss'),
        },
        {
          title: '预扣税',
          key: 'withholdingTax',
          width: 100,
          sorter: true,
          render: (row: any) => renderNumericCell(row, 'withholdingTax'),
        },
        {
          title: '投充比',
          key: 'betDepositRatio',
          width: 100,
          sorter: true,
          render: (row: any) => {
            const value = row.betDepositRatio || 0;
            return h('span', {}, `${value.toFixed(2)}%`);
          },
        },
        {
          title: '未结算投注',
          key: 'unsettledBets',
          width: 120,
          sorter: true,
          render: (row: any) => renderNumericCell(row, 'unsettledBets'),
        },
      ],
    },

    // 优惠活动 category - WITH HEADER
    {
      title: '优惠活动',
      key: 'promotionCategory',
      children: [
        {
          title: '佣金',
          key: 'commission',
          width: 100,
          sorter: true,
          render: (row: any) => renderNumericCell(row, 'commission', true),
        },
        {
          title: '优惠金额',
          key: 'promotionalAmount',
          width: 120,
          sorter: true,
          render: (row: any) =>
            renderNumericCell(row, 'promotionalAmount', true),
        },
        {
          title: '放弃奖励',
          key: 'abandonedRewards',
          width: 100,
          sorter: true,
          render: (row: any) => renderNumericCell(row, 'abandonedRewards'),
        },
        {
          title: '活动',
          key: 'activities',
          width: 100,
          sorter: true,
          render: (row: any) => renderNumericCell(row, 'activities'),
        },
        {
          title: '任务',
          key: 'tasks',
          width: 100,
          sorter: true,
          render: (row: any) => renderNumericCell(row, 'tasks'),
        },
        {
          title: '返水',
          key: 'rebate',
          width: 100,
          sorter: true,
          render: (row: any) => renderNumericCell(row, 'rebate'),
        },
        {
          title: 'VIP奖励',
          key: 'vipRewards',
          width: 100,
          sorter: true,
          render: (row: any) => renderNumericCell(row, 'vipRewards'),
        },
        {
          title: '充值优惠',
          key: 'depositBonus',
          width: 100,
          sorter: true,
          render: (row: any) => renderNumericCell(row, 'depositBonus'),
        },
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
      ],
    },

    // 存量 category - WITH HEADER
    {
      title: '存量',
      key: 'inventoryCategory',
      children: [
        {
          title: '账号余额',
          key: 'accountBalance',
          width: 120,
          sorter: true,
          render: (row: any) => renderNumericCell(row, 'accountBalance', true),
        },
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
        {
          title: '三方余额',
          key: 'thirdPartyBalance',
          width: 100,
          sorter: true,
          render: (row: any) => renderNumericCell(row, 'thirdPartyBalance'),
        },
        {
          title: '俱乐部保证金',
          key: 'clubDeposit',
          width: 120,
          sorter: true,
          render: (row: any) => renderNumericCell(row, 'clubDeposit'),
        },
      ],
    },

    // No category columns (without header group)
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
    {
      title: '在线充值',
      key: 'onlineRecharge',
      width: 100,
      sorter: true,
      render: (row: any) => renderNumericCell(row, 'onlineRecharge'),
    },
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
    {
      title: '人工修正',
      key: 'manualAdjustment',
      width: 100,
      sorter: true,
      render: (row: any) => renderNumericCell(row, 'manualAdjustment'),
    },
    {
      title: '手动加款',
      key: 'manualAddFunds',
      width: 100,
      sorter: true,
      render: (row: any) => renderNumericCell(row, 'manualAddFunds'),
    },
    {
      title: '手动扣除',
      key: 'manualDeductFunds',
      width: 100,
      sorter: true,
      render: (row: any) => renderNumericCell(row, 'manualDeductFunds'),
    },
    {
      title: '打赏',
      key: 'tipping',
      width: 80,
      sorter: true,
      render: (row: any) => renderNumericCell(row, 'tipping'),
    },
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

/** 报表行日期（YYYY-MM-DD）在 currentTimezone 下当天起止时间戳，用于下钻筛选 */
function getRowTimezoneDayRangeMs(row: any): [number, number] | null {
  if (!row || row.isTotal) return null;
  const s = row.date;
  if (!s || typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const parts = s.split('-').map((x) => parseInt(x, 10));
  const y = parts[0]!;
  const m = parts[1]!;
  const d = parts[2]!;
  const tz = currentTimezone.value;
  const start = convertTimezoneToUTC(y, m, d, 0, 0, 0, tz);
  const end = convertTimezoneToUTC(y, m, d, 23, 59, 59, tz);
  return [start.getTime(), end.getTime()];
}

// Handle cell click for drill-down functionality（下钻使用与报表相同的 header 时区，默认巴西）
const handleCellClick = (field: string, row: any) => {
  const range = getRowTimezoneDayRangeMs(row);
  if (!range) return;
  const [startMs, endMs] = range;
  const rowCurrency =
    typeof row.currency === 'string' && row.currency ? row.currency : currency.value;

  switch (field) {
    case 'newAgents':
      void router.push({
        path: '/agency/agent-list',
        query: {
          agentDateStart: String(startMs),
          agentDateEnd: String(endMs),
        },
      });
      break;
    case 'registrations':
      void router.push({
        path: '/user-management/all-members',
        query: {
          opsDrill: '1',
          opsTimeType: 'registrationTime',
          opsDateStart: String(startMs),
          opsDateEnd: String(endMs),
        },
      });
      break;
    case 'firstDeposits':
      void router.push({
        path: '/user-management/all-members',
        query: {
          opsDrill: '1',
          opsTimeType: 'firstDepositTime',
          opsDateStart: String(startMs),
          opsDateEnd: String(endMs),
        },
      });
      break;
    case 'totalWithdrawalAmount':
      void router.push({
        path: '/finance/withdraw-management',
        query: {
          tab: 'all-withdrawals',
          opsDateStart: String(startMs),
          opsDateEnd: String(endMs),
          opsCurrency: rowCurrency,
        },
      });
      break;
    case 'unfundedWithdrawUserCount':
      void router.push({
        path: '/finance/withdraw-management',
        query: {
          tab: 'all-withdrawals',
          opsDateStart: String(startMs),
          opsDateEnd: String(endMs),
          opsCurrency: rowCurrency,
          opsFunding: 'unfunded',
        },
      });
      break;
    case 'fundedWithdrawUserCount':
      void router.push({
        path: '/finance/withdraw-management',
        query: {
          tab: 'all-withdrawals',
          opsDateStart: String(startMs),
          opsDateEnd: String(endMs),
          opsCurrency: rowCurrency,
          opsFunding: 'funded',
        },
      });
      break;
    default:
      break;
  }
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
    message.warning('请选择日期范围');
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
      message.success('数据加载成功');
    } else {
      throw new Error(result.message || '获取数据失败');
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : '获取数据时发生错误';
    message.error(error.value);
  } finally {
    loading.value = false;
  }
};

// Export to Excel using reusable utility
const exportToExcel = async () => {
  if (!dateRange.value || dateRange.value.length !== 2) {
    message.warning('请先选择日期范围');
    return;
  }

  if (!tableData.value || tableData.value.length === 0) {
    message.warning('没有数据可导出，请先搜索数据');
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
    const filename = `日运营报表_${startDateStr}_至_${endDateStr}`;

    // Use the reusable export utility with table columns and data
    await exportGridData(columns.value as any, tableData.value, {
      filename,
      sheetName: '日运营报表',
      format: 'xlsx',
    });
  } catch (err) {
    console.error('Export error:', err);
    message.error(
      '导出失败: ' + (err instanceof Error ? err.message : '未知错误'),
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

/* Total row styling */
.operations-report-table :deep(.total-row .n-data-table-td) {
  background-color: #fafafa !important;
  font-weight: bold;
  border-top: 2px solid #d9d9d9;
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

/* Fix scrollbar visibility and functionality */
.table-wrapper {
  position: relative;
  width: 100%;
  overflow-x: auto;
  overflow-y: visible;
  -webkit-overflow-scrolling: touch; /* Smooth scrolling on iOS */
}

/* Custom scrollbar styling for better visibility */
.table-wrapper::-webkit-scrollbar {
  height: 12px;
  width: 12px;
}

.table-wrapper::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 6px;
}

.table-wrapper::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 6px;
  border: 2px solid #f1f1f1;
}

.table-wrapper::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Firefox scrollbar */
.table-wrapper {
  scrollbar-width: thin;
  scrollbar-color: #888 #f1f1f1;
}

/* Ensure table can scroll horizontally and has proper width */
.operations-report-table :deep(.n-data-table-wrapper) {
  overflow-x: visible !important;
  overflow-y: visible !important;
}

.operations-report-table :deep(.n-data-table-base-table) {
  min-width: max-content;
  width: 100%;
}

/* Ensure table container allows horizontal scroll */
.operations-report-table {
  min-width: max-content;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .daily-operations-report {
    padding: 8px;
  }
}
</style>
