<template>
  <div class="game-statistics-page">
    <n-card title="游戏类型/渠道" class="mb-4">
      <!-- Filter Section -->
      <div class="mb-4">
        <n-form inline>
          <!-- Time Granularity -->
          <n-form-item label="查询">
            <n-radio-group v-model:value="timeGranularity" @update:value="onTimeGranularityChange">
              <n-radio-button value="day">日</n-radio-button>
              <n-radio-button value="week">周</n-radio-button>
              <n-radio-button value="month">月</n-radio-button>
            </n-radio-group>
          </n-form-item>
          
          <!-- Date Range Picker -->
          <n-form-item>
            <n-date-picker
              v-model:value="dateRange"
              type="daterange"
              :shortcuts="dateShortcuts as any"
              placeholder="选择开始和结束日期"
              format="yyyy-MM-dd"
              style="width: 300px"
              clearable
            />
          </n-form-item>
          
          <!-- Game Type Filter -->
          <n-form-item label="游戏类型">
            <n-select
              v-model:value="gameType"
              :options="gameTypeOptions"
              placeholder="全部"
              style="width: 150px"
              clearable
            />
          </n-form-item>
          
          <!-- Action Buttons -->
          <n-form-item>
            <n-space>
              <n-button type="primary" @click="fetchData" :loading="loading">
                搜索
              </n-button>
              <n-button @click="resetFilters">
                重置
              </n-button>
              <n-button type="success" @click="exportToExcel" :loading="exporting">
                导出报表
              </n-button>
            </n-space>
          </n-form-item>
        </n-form>
      </div>

      <!-- Data Table -->
      <n-card size="small">
        <template #header>
          <n-space justify="space-between">
            <span>游戏类型统计</span>
            <span style="font-size: 13px; color: #666">
              共 {{ tableData?.length || 0 }} 条记录
            </span>
          </n-space>
        </template>
        
        <!-- Loading State -->
        <div v-if="loading" class="text-center py-8">
          <n-spin size="large" />
          <p class="mt-4">正在加载数据...</p>
        </div>
        
        <!-- Error State -->
        <div v-else-if="error" class="text-center py-8">
          <n-alert type="error" :title="error" />
        </div>
        
        <!-- Data Table -->
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
        
        <!-- Empty State -->
        <n-empty v-else description="暂无数据" style="padding: 40px 0" />
      </n-card>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, h, reactive } from 'vue';
import { 
  NCard, NForm, NFormItem, NDatePicker, NSelect, NButton, 
  NDataTable, NSpin, NAlert, NEmpty, NRadioGroup, NRadioButton, NSpace,
  type DataTableColumns 
} from 'naive-ui';
import { useMessage } from 'naive-ui';
import { exportGridData } from '#/utils/exportUtils';
import { getGameStatistics, getGameTypes } from '#/api/gameStatistics';

const message = useMessage();

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
  { label: '全部', value: null },
  { label: '棋牌', value: 'CHESS_CARDS' },
  { label: '电子', value: 'SLOT' },
  { label: '区块链', value: 'BLOCKCHAIN' },
  { label: '真人', value: 'LIVE' },
  { label: '体育', value: 'SPORTS' },
  { label: '捕鱼', value: 'HUNTING' },
  { label: '彩票', value: 'LOTTERY' },
  { label: '街机', value: 'ARCADE' },
  { label: '斗鸡', value: 'COCKFIGHT' }
];

// Pagination
const paginationConfig = computed(() => ({
  page: 1,
  pageSize: 20,
  showSizePicker: true,
  pageSizes: [10, 20, 50, 100],
  itemCount: reportData.value?.length || 0,
  prefix: (info: { itemCount?: number }) => `共 ${info.itemCount || 0} 条`
}));

// Date shortcuts
const dateShortcuts = computed(() => {
  const today = new Date();
  
  if (timeGranularity.value === 'day') {
    return {
      '今天': (): [number, number] => {
        const start = new Date(today);
        start.setHours(0, 0, 0, 0);
        return [start.getTime(), today.getTime()];
      },
      '昨天': (): [number, number] => {
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);
        return [yesterday.getTime(), yesterday.getTime()];
      },
      '最近7天': (): [number, number] => {
        const start = new Date(today);
        start.setDate(today.getDate() - 6);
        start.setHours(0, 0, 0, 0);
        return [start.getTime(), today.getTime()];
      }
    };
  } else if (timeGranularity.value === 'week') {
    return {
      '上周': (): [number, number] => {
        const dayOfWeek = today.getDay();
        const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        const lastMonday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - daysFromMonday - 7);
        lastMonday.setHours(0, 0, 0, 0);
        const lastSunday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - daysFromMonday - 1);
        lastSunday.setHours(0, 0, 0, 0);
        return [lastMonday.getTime(), lastSunday.getTime()];
      },
      '本周': (): [number, number] => {
        const dayOfWeek = today.getDay();
        const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        const thisMonday = new Date(today);
        thisMonday.setDate(today.getDate() - daysFromMonday);
        thisMonday.setHours(0, 0, 0, 0);
        return [thisMonday.getTime(), today.getTime()];
      }
    };
  } else {
    return {
      '本月': (): [number, number] => {
        const start = new Date(today.getFullYear(), today.getMonth(), 1);
        start.setHours(0, 0, 0, 0);
        return [start.getTime(), today.getTime()];
      },
      '上月': (): [number, number] => {
        const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        start.setHours(0, 0, 0, 0);
        const end = new Date(today.getFullYear(), today.getMonth(), 0);
        end.setHours(23, 59, 59, 999);
        return [start.getTime(), end.getTime()];
      }
    };
  }
});

// Table columns
const columns = computed<DataTableColumns<any>>(() => [
  {
    title: '币种',
    key: 'currency',
    width: 100,
    align: 'center',
    fixed: 'left'
  },
  {
    title: '游戏类型',
    key: 'gameType',
    width: 120,
    align: 'center',
    render: (row) => {
      if (row.isTotal) {
        return h('strong', {}, '合计');
      }
      return row.gameType || '-';
    }
  },
  {
    title: '平均日投注人数',
    key: 'avgDailyBettors',
    width: 150,
    align: 'right',
    render: (row) => renderNumericCell(row.avgDailyBettors, row, true)
  },
  {
    title: '注单数',
    key: 'betCount',
    width: 120,
    align: 'right',
    sorter: (a, b) => (a.betCount || 0) - (b.betCount || 0),
    render: (row) => renderNumericCell(row.betCount, row, true)
  },
  {
    title: '有效投注',
    key: 'validBet',
    width: 150,
    align: 'right',
    sorter: (a, b) => (a.validBet || 0) - (b.validBet || 0),
    render: (row) => renderNumericCell(row.validBet, row, false)
  },
  {
    title: '杀率',
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
            fontWeight: row.isTotal ? 'bold' : 'normal'
          }
        },
        `${value}%`
      );
    }
  },
  {
    title: '损益',
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
            fontWeight: row.isTotal ? 'bold' : 'normal'
          }
        },
        value
      );
    }
  }
]);

// Render numeric cell with formatting
const renderNumericCell = (value: any, row: any, isCount: boolean) => {
  if (value === null || value === undefined) return '-';
  
  const formatted = isCount 
    ? Math.round(Number(value)).toLocaleString()
    : Number(value).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  
  return h(
    'span',
    {
      style: {
        fontWeight: row.isTotal ? 'bold' : 'normal'
      }
    },
    formatted
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
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysFromMonday - 7);
      start.setHours(0, 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysFromMonday - 1);
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
    message.warning('请选择日期范围');
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    const startDateStr = new Date(dateRange.value[0]).toISOString().split('T')[0];
    const endDate = new Date(dateRange.value[1]);
    endDate.setHours(23, 59, 59, 999);
    const endDateStr = endDate.toISOString().split('T')[0];
    
    const response = await getGameStatistics({
      startDate: startDateStr,
      endDate: endDateStr,
      currency: 'BRL',
      gameType: gameType.value || undefined,
      granularity: timeGranularity.value as 'day' | 'week' | 'month'
    });

    if (response.success) {
      reportData.value = response.data || [];
      totalData.value = response.total || null;
      message.success('数据加载成功');
    } else {
      throw new Error(response.message || '获取数据失败');
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : '获取数据时发生错误';
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
    message.warning('请先选择日期范围');
    return;
  }

  if (!tableData.value || tableData.value.length === 0) {
    message.warning('没有数据可导出，请先搜索数据');
    return;
  }

  exporting.value = true;

  try {
    // Dynamically import xlsx
    const XLSX = await import('xlsx');
    
    const startDateStr = new Date(dateRange.value[0]).toISOString().split('T')[0];
    const endDate = new Date(dateRange.value[1]);
    endDate.setHours(23, 59, 59, 999);
    const endDateStr = endDate.toISOString().split('T')[0];
    
    // Prepare data with formatted values
    const exportData = tableData.value.map(row => ({
      '币种': row.currency || '',
      '游戏类型': row.gameType || '',
      '平均日投注人数': row.avgDailyBettors || 0,
      '注单数': row.betCount || 0,
      '有效投注': row.validBet ? Number(row.validBet).toFixed(2) : '0.00',
      '杀率': row.killRate ? (row.killRate * 100).toFixed(2) + '%' : '0.00%',
      '损益': row.profitLoss ? Number(row.profitLoss).toFixed(2) : '0.00'
    }));

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);
    
    // Auto-size columns
    const colWidths = [
      { wch: 8 },  // 币种
      { wch: 12 }, // 游戏类型
      { wch: 18 }, // 平均日投注人数
      { wch: 10 }, // 注单数
      { wch: 15 }, // 有效投注
      { wch: 12 }, // 杀率
      { wch: 15 }  // 损益
    ];
    ws['!cols'] = colWidths;
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '游戏统计');
    
    // Generate filename
    const filename = `游戏统计_${startDateStr}_至_${endDateStr}.xlsx`;
    
    // Download
    XLSX.writeFile(wb, filename);
    
    message.success('导出成功！');
  } catch (err: any) {
    console.error('Export error:', err);
    const errorMsg = err?.message || err?.toString() || '未知错误';
    message.error('导出失败: ' + errorMsg);
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

