<template>
  <div class="game-statistics-page">
    <n-card :title="$t('game.statistics.title')" class="mb-4">
      <div class="mb-4">
        <n-form inline>
          <n-form-item :label="$t('game.statistics.query')">
            <n-radio-group
              v-model:value="timeGranularity"
              @update:value="onTimeGranularityChange"
            >
              <n-radio-button value="day">{{ $t('game.statistics.day') }}</n-radio-button>
              <n-radio-button value="week">{{ $t('game.statistics.week') }}</n-radio-button>
              <n-radio-button value="month">{{ $t('game.statistics.month') }}</n-radio-button>
            </n-radio-group>
          </n-form-item>

          <n-form-item>
            <n-date-picker
              v-model:value="dateRange"
              type="daterange"
              :time-zone="timezone"
              :shortcuts="dateShortcuts as any"
              :placeholder="$t('game.statistics.selectDateRange')"
              format="yyyy-MM-dd"
              style="width: 300px"
              clearable
            />
          </n-form-item>

          <n-form-item :label="$t('game.statistics.gameType')">
            <n-select
              v-model:value="gameType"
              :options="gameTypeOptions"
              :placeholder="$t('game.statisticsExtra.all')"
              style="width: 150px"
              clearable
            />
          </n-form-item>

          <n-form-item>
            <n-space>
              <n-button type="primary" :loading="loading" @click="fetchData">
                {{ $t('common.search') }}
              </n-button>
              <n-button @click="resetFilters">{{ $t('common.reset') }}</n-button>
              <n-button type="success" :loading="exporting" @click="exportToExcel">
                {{ $t('game.statistics.exportReport') }}
              </n-button>
            </n-space>
          </n-form-item>
        </n-form>
      </div>

      <n-card size="small">
        <template #header>
          <n-space justify="space-between">
            <span>{{ $t('game.statistics.gameTypeStats') }}</span>
            <span style="font-size: 13px; color: #666">
              {{ $t('game.statisticsExtra.paginationTotal', [tableData?.length || 0]) }}
            </span>
          </n-space>
        </template>

        <div v-if="loading" class="py-8 text-center">
          <n-spin size="large" />
          <p class="mt-4">{{ $t('game.statistics.loadingData') }}</p>
        </div>

        <div v-else-if="error" class="py-8 text-center">
          <n-alert type="error" :title="error" />
        </div>

        <n-data-table
          v-else-if="tableData && tableData.length > 0"
          :columns="columns"
          :data="tableData"
          :loading="loading"
          :pagination="paginationConfig"
          :bordered="true"
          :scroll-x="1200"
          size="small"
          :row-class-name="getRowClassName"
          class="game-statistics-table"
        />

        <n-empty
          v-else
          :description="$t('game.statistics.noData')"
          style="padding: 40px 0"
        />
      </n-card>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { $t } from '@vben/locales';

import { ref, onMounted, computed, h, reactive } from 'vue';
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
import { exportGridData } from '#/utils/exportUtils';
import { getGameStatistics, getGameTypes } from '#/api/gameStatistics';
import { getGameTypeLabel } from '#/utils/gameTypeI18n';
import { formatIsoDateInTimezone } from '#/utils/timezoneUtils';
import { useDisplayTimezone } from '#/composables/useDisplayTimezone';

const message = useMessage();
const { timezone } = useDisplayTimezone();

// Reactive data
const loading = ref(false);
const exporting = ref(false);
const error = ref('');
const reportData = ref<any[]>([]);
const totalData = ref<any>(null);

// Computed: combine reportData and totalData
const tableData = computed(() => {
  if (!reportData.value || reportData.value.length === 0) return [];
  if (!totalData.value) return reportData.value;

  // Append total row at the end
  return [...reportData.value, { ...totalData.value, isTotal: true }];
});

// Form data
const timeGranularity = ref('day');
const dateRange = ref<[number, number] | null>(null);
const gameType = ref<string | null>(null);

// Game type options
const gameTypeOptions = [
  { label: $t('game.statisticsExtra.all'), value: null },
  { label: $t('game.statisticsExtra.typeChessShort'), value: 'CHESS_CARDS' },
  { label: $t('game.statisticsExtra.typeSlotShort'), value: 'SLOT' },
  { label: $t('game.statisticsExtra.typeBlockchainShort'), value: 'BLOCKCHAIN' },
  { label: $t('game.statisticsExtra.typeLiveShort'), value: 'LIVE' },
  { label: $t('game.statisticsExtra.typeSportsShort'), value: 'SPORTS' },
  { label: $t('game.statisticsExtra.typeHuntingShort'), value: 'HUNTING' },
  { label: $t('game.statisticsExtra.typeLotteryShort'), value: 'LOTTERY' },
  { label: $t('game.statisticsExtra.typeArcadeShort'), value: 'ARCADE' },
  { label: $t('game.statisticsExtra.typeCockfightShort'), value: 'COCKFIGHT' },
];

// Pagination
const paginationConfig = computed(() => ({
  page: 1,
  pageSize: 20,
  showSizePicker: true,
  pageSizes: [10, 20, 50, 100],
  itemCount: reportData.value?.length || 0,
  prefix: (info) => $t('game.statisticsExtra.paginationTotal', [info.itemCount || 0]),
}));

// Date shortcuts
const dateShortcuts = computed(() => {
  const today = new Date();

  if (timeGranularity.value === 'day') {
    return {
      [$t('game.betRecordsExtra2.today')]: (): [number, number] => {
        const start = new Date(today);
        start.setHours(0, 0, 0, 0);
        return [start.getTime(), today.getTime()];
      },
      [$t('game.betRecordsExtra2.yesterday')]: (): [number, number] => {
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);
        return [yesterday.getTime(), yesterday.getTime()];
      },
      [$t('game.betRecordsExtra2.last7Days')]: (): [number, number] => {
        const start = new Date(today);
        start.setDate(today.getDate() - 6);
        start.setHours(0, 0, 0, 0);
        return [start.getTime(), today.getTime()];
      },
    };
  } else if (timeGranularity.value === 'week') {
    return {
      [$t('game.statisticsExtra.lastWeek')]: (): [number, number] => {
        const dayOfWeek = today.getDay();
        const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        const lastMonday = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() - daysFromMonday - 7,
        );
        lastMonday.setHours(0, 0, 0, 0);
        const lastSunday = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() - daysFromMonday - 1,
        );
        lastSunday.setHours(0, 0, 0, 0);
        return [lastMonday.getTime(), lastSunday.getTime()];
      },
      [$t('game.statisticsExtra.thisWeek')]: (): [number, number] => {
        const dayOfWeek = today.getDay();
        const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        const thisMonday = new Date(today);
        thisMonday.setDate(today.getDate() - daysFromMonday);
        thisMonday.setHours(0, 0, 0, 0);
        return [thisMonday.getTime(), today.getTime()];
      },
    };
  } else {
    return {
      [$t('game.betRecordsExtra2.thisMonth')]: (): [number, number] => {
        const start = new Date(today.getFullYear(), today.getMonth(), 1);
        start.setHours(0, 0, 0, 0);
        return [start.getTime(), today.getTime()];
      },
      [$t('game.betRecordsExtra2.lastMonth')]: (): [number, number] => {
        const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        start.setHours(0, 0, 0, 0);
        const end = new Date(today.getFullYear(), today.getMonth(), 0);
        end.setHours(23, 59, 59, 999);
        return [start.getTime(), end.getTime()];
      },
    };
  }
});

// Table columns
const columns = computed<DataTableColumns<any>>(() => [
  {
    title: $t('common.currency'),
    key: 'currency',
    width: 100,
    align: 'center',
    fixed: 'left',
  },
  {
    title: $t('game.subgame.gameType'),
    key: 'gameType',
    width: 120,
    align: 'center',
    render: (row) => {
      if (row.isTotal) {
        return h('strong', {}, $t('game.statisticsExtra.totalRow'));
      }
      return getGameTypeLabel(row.gameType);
    },
  },
  {
    title: $t('game.statisticsExtra.avgDailyBettors'),
    key: 'avgDailyBettors',
    width: 150,
    align: 'right',
    render: (row) => renderNumericCell(row.avgDailyBettors, row, true),
  },
  {
    title: $t('game.statisticsExtra.betCountCol'),
    key: 'betCount',
    width: 120,
    align: 'right',
    sorter: (a, b) => (a.betCount || 0) - (b.betCount || 0),
    render: (row) => renderNumericCell(row.betCount, row, true),
  },
  {
    title: $t('game.betRecords.validBet'),
    key: 'validBet',
    width: 150,
    align: 'right',
    sorter: (a, b) => (a.validBet || 0) - (b.validBet || 0),
    render: (row) => renderNumericCell(row.validBet, row, false),
  },
  {
    title: $t('game.statisticsExtra.killRate'),
    key: 'killRate',
    width: 120,
    align: 'right',
    sorter: (a, b) => (a.killRate || 0) - (b.killRate || 0),
    render: (row) => {
      if (!row.killRate && row.killRate !== 0) return '-';
      const value = (row.killRate * 100).toFixed(2);
      const isNegative = row.killRate < 0;
      return h(
        'span',
        {
          style: {
            color: isNegative ? '#d03050' : '#18a058',
            fontWeight: row.isTotal ? 'bold' : 'normal',
          },
        },
        `${value}%`,
      );
    },
  },
  {
    title: $t('game.statisticsExtra.profitLoss'),
    key: 'profitLoss',
    width: 150,
    align: 'right',
    sorter: (a, b) => (a.profitLoss || 0) - (b.profitLoss || 0),
    render: (row) => {
      if (!row.profitLoss && row.profitLoss !== 0) return '-';
      const value = Number(row.profitLoss).toFixed(2);
      const isNegative = row.profitLoss < 0;
      return h(
        'span',
        {
          style: {
            color: isNegative ? '#d03050' : '#18a058',
            fontWeight: row.isTotal ? 'bold' : 'normal',
          },
        },
        value,
      );
    },
  },
]);

// Render numeric cell with formatting
const renderNumericCell = (value: any, row: any, isCount: boolean) => {
  if (value === null || value === undefined) return '-';

  const formatted = isCount
    ? Math.round(Number(value)).toLocaleString()
    : Number(value)
        .toFixed(2)
        .replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return h(
    'span',
    {
      style: {
        fontWeight: row.isTotal ? 'bold' : 'normal',
      },
    },
    formatted,
  );
};

// Get row class name
const getRowClassName = (row: any) => {
  return row.isTotal ? 'total-row' : '';
};

// Update date range based on granularity
const onTimeGranularityChange = () => {
  updateDateRangeForGranularity();
};

const updateDateRangeForGranularity = () => {
  const now = new Date();
  let start: Date;
  let end: Date;

  switch (timeGranularity.value) {
    case 'day':
      // Current day (start to end of today)
      start = new Date(now);
      start.setHours(0, 0, 0, 0);
      end = new Date(now);
      end.setHours(23, 59, 59, 999);
      break;

    case 'week':
      // Last complete week (last Monday to last Sunday, both full days)
      const dayOfWeek = now.getDay(); // 0=Sunday, 1=Monday
      const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      start = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - daysFromMonday - 7,
      );
      start.setHours(0, 0, 0, 0);
      end = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - daysFromMonday - 1,
      );
      end.setHours(23, 59, 59, 999);
      break;

    case 'month':
      // Current month (1st to end of today)
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      start.setHours(0, 0, 0, 0);
      end = new Date(now);
      end.setHours(23, 59, 59, 999);
      break;

    default:
      start = new Date(now);
      start.setHours(0, 0, 0, 0);
      end = new Date(now);
      end.setHours(23, 59, 59, 999);
  }

  dateRange.value = [start.getTime(), end.getTime()];
};

// Reset filters
const resetFilters = () => {
  timeGranularity.value = 'day';
  gameType.value = null;
  updateDateRangeForGranularity();
  fetchData();
};

// Fetch data from API
const fetchData = async () => {
  if (!dateRange.value || dateRange.value.length !== 2) {
    message.warning($t('game.statisticsExtra.selectDateRange'));
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    const startDateStr = formatIsoDateInTimezone(dateRange.value[0]);
    const endDateStr = formatIsoDateInTimezone(dateRange.value[1]);

    const response = await getGameStatistics({
      startDate: startDateStr,
      endDate: endDateStr,
      currency: 'BRL',
      gameType: gameType.value || undefined,
      granularity: timeGranularity.value as 'day' | 'week' | 'month',
    });

    if (response.success) {
      reportData.value = response.data || [];
      totalData.value = response.total || null;
      message.success($t('game.statisticsExtra.loadSuccess'));
    } else {
      throw new Error(response.message || $t('game.statisticsExtra.fetchFailed'));
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : $t('game.statisticsExtra.fetchError');
    message.error(error.value);
    reportData.value = [];
    totalData.value = null;
  } finally {
    loading.value = false;
  }
};

// Export to Excel
const exportToExcel = async () => {
  if (!dateRange.value || dateRange.value.length !== 2) {
    message.warning($t('game.statisticsExtra.selectDateFirst'));
    return;
  }

  if (!tableData.value || tableData.value.length === 0) {
    message.warning($t('game.statisticsExtra.noDataToExport'));
    return;
  }

  exporting.value = true;

  try {
    // Dynamically import xlsx
    const XLSX = await import('xlsx');

    const startDateStr = formatIsoDateInTimezone(dateRange.value[0]);
    const endDateStr = formatIsoDateInTimezone(dateRange.value[1]);

    // Prepare data with formatted values
    const exportData = tableData.value.map((row) => ({
      [$t('common.currency')]: row.currency || '',
      [$t('game.statistics.gameType')]: getGameTypeLabel(row.gameType),
      [$t('game.statisticsExtra.avgDailyBettors')]: row.avgDailyBettors || 0,
      [$t('game.statisticsExtra.betCountCol')]: row.betCount || 0,
      [$t('game.betRecords.validBet')]: row.validBet ? Number(row.validBet).toFixed(2) : '0.00',
      [$t('game.statisticsExtra.killRate')]: row.killRate ? (row.killRate * 100).toFixed(2) + '%' : '0.00%',
      [$t('game.statisticsExtra.profitLoss')]: row.profitLoss ? Number(row.profitLoss).toFixed(2) : '0.00',
    }));

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);

    // Auto-size columns
    const colWidths = [
      { wch: 8 }, 
      { wch: 12 }, 
      { wch: 18 }, 
      { wch: 10 }, 
      { wch: 15 }, 
      { wch: 12 }, 
      { wch: 15 }, 
    ];
    ws['!cols'] = colWidths;

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, $t('game.statisticsExtra.exportSheetName'));

    // Generate filename
    const filename = $t('game.statisticsExtra.exportFileName', [startDateStr, endDateStr]);

    // Download
    XLSX.writeFile(wb, filename);

    message.success($t('game.statisticsExtra.exportSuccess'));
  } catch (err: any) {
    console.error('Export error:', err);
    const errorMsg = err?.message || err?.toString() || $t('game.statisticsExtra.unknownError');
    message.error($t('game.statisticsExtra.exportFailed', [errorMsg]));
  } finally {
    exporting.value = false;
  }
};

// Initialize with default values
onMounted(() => {
  updateDateRangeForGranularity();
  fetchData();
});
</script>

<style scoped>
.game-statistics-page {
  padding: 16px;
}

/* Table styling */
.game-statistics-table :deep(.n-data-table-th) {
  font-weight: 600;
  background-color: #fafafa;
}

/* Total row styling */
.total-row :deep(.n-data-table-td) {
  background-color: #f5f5f5 !important;
  font-weight: bold;
  border-top: 2px solid #d9d9d9;
}

/* Responsive */
@media (max-width: 768px) {
  .game-statistics-page {
    padding: 8px;
  }
}
</style>
