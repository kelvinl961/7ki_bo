<template>
  <div class="bet-statistic-tab">
    <!-- Enhanced Query Section -->
    <n-card title="查询条件" class="mb-4 query-card">
      
      <div class="flex flex-wrap gap-4 items-end">
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium text-gray-700">日期范围</label>
          <n-date-picker
            v-model:value="dateRange"
            type="daterange"
            placeholder="选择日期范围"
            style="width: 320px"
            :shortcuts="dateShortcuts"
            @update:value="handleDateRangeChange"
            clearable
          />
        </div>
        
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium text-gray-700">游戏平台</label>
          <n-select
            v-model:value="gameProviderFilter"
            placeholder="选择游戏平台"
            style="width: 150px"
            :options="gameProviderOptions"
            clearable
            @update:value="handleFilterChange"
          />
        </div>
        
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium text-gray-700">游戏类别</label>
          <n-select
            v-model:value="gameCategoryFilter"
            placeholder="选择游戏类别"
            style="width: 150px"
            :options="gameCategoryOptions"
            clearable
            @update:value="handleFilterChange"
          />
        </div>
        
        <div class="flex gap-2">
          <n-button type="primary" @click="loadBetStatistics" :loading="loading" class="action-button">查询统计</n-button>
          <n-button @click="handleReset" class="action-button">重置</n-button>
          <n-button @click="loadBetStatistics" :disabled="loading" class="action-button">刷新</n-button>
        </div>
      </div>
    </n-card>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center h-64">
      <n-spin size="large" />
    </div>

    <!-- No Data State -->
    <div v-else-if="!hasData" class="text-center text-gray-500 py-12">
      <div class="text-lg font-medium">暂无投注数据</div>
      <div class="text-sm text-gray-400 mt-2">请选择日期范围后重新查询</div>
    </div>

    <!-- Data Content -->
    <div v-else class="bet-statistic-content">
      <!-- Enhanced Summary Cards -->
      <div class="mb-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-800">投注统计总览</h3>
          <n-tag type="success" size="small">实时数据</n-tag>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <!-- Total Bet Count -->
          <n-card size="small" class="summary-card stat-card-blue">
            <div class="stat-content">
              <div class="stat-info">
                <div class="stat-label">总注单量</div>
                <div class="stat-value">{{ summary.totalBetCount }}</div>
                <div class="stat-unit">笔</div>
              </div>
            </div>
          </n-card>

          <!-- Total Bet Amount -->
          <n-card size="small" class="summary-card stat-card-green">
            <div class="stat-content">
              <div class="stat-info">
                <div class="stat-label">总投注金额</div>
                <div class="stat-value">{{ formatCurrency(summary.totalBetAmount) }}</div>
                <div class="stat-unit">BRL</div>
              </div>
            </div>
          </n-card>

          <!-- Total Valid Bet -->
          <n-card size="small" class="summary-card stat-card-purple">
            <div class="stat-content">
              <div class="stat-info">
                <div class="stat-label">总有效投注</div>
                <div class="stat-value">{{ formatCurrency(summary.totalValidBetAmount) }}</div>
                <div class="stat-unit">BRL</div>
              </div>
            </div>
            <div class="text-right text-xs text-gray-500 pr-3 pb-2">有效率 {{ ((summary.totalValidBetAmount / (summary.totalBetAmount || 1)) * 100).toFixed(1) }}%</div>
          </n-card>

          <!-- Member Count -->
          <n-card size="small" class="summary-card stat-card-orange">
            <div class="stat-content">
              <div class="stat-info">
                <div class="stat-label">参与会员</div>
                <div class="stat-value">{{ summary.memberCount }}</div>
                <div class="stat-unit">人</div>
              </div>
            </div>
          </n-card>

          <!-- Subordinate Bet Count -->
          <n-card size="small" class="summary-card stat-card-indigo">
            <div class="stat-content">
              <div class="stat-info">
                <div class="stat-label">占单量</div>
                <div class="stat-value">{{ summary.subordinateBetCount }}</div>
                <div class="stat-unit">笔</div>
              </div>
            </div>
          </n-card>

          <!-- Profit Ratio -->
          <n-card size="small" class="summary-card" :class="summary.profitRatio >= 0 ? 'stat-card-success' : 'stat-card-danger'">
            <div class="stat-content">
              <div class="stat-info">
                <div class="stat-label">获利比</div>
                <div class="stat-value">{{ summary.profitRatio.toFixed(2) }}</div>
                <div class="stat-unit">%</div>
              </div>
            </div>
          </n-card>
        </div>
      </div>

      <!-- Enhanced Game Details Table -->
      <n-card class="mb-4 game-details-card">
        <template #header>
          <div class="flex items-center gap-2">
            <span class="text-lg font-semibold">游戏投注明细</span>
            <n-tag type="info" size="small">按平台分类</n-tag>
          </div>
        </template>
        
        <template #header-extra>
          <div class="flex items-center gap-3">
            <div class="flex items-center gap-2 text-sm text-gray-600">
              <span class="font-medium">共 {{ filteredGameDetails.length }} 个游戏</span>
              <span class="text-gray-400">|</span>
              <span>总投注: {{ formatCurrency(filteredGameDetails.reduce((sum, game) => sum + game.betAmount, 0)) }}</span>
            </div>
            <n-button size="tiny" type="primary" @click="loadBetStatistics" :disabled="loading">刷新</n-button>
          </div>
        </template>

        <!-- Table Filters -->
        <div v-if="gameDetails.length > 0" class="mb-4 p-3 bg-gray-50 rounded-lg">
          <div class="flex flex-wrap gap-4 items-center">
            <div class="flex items-center gap-2">
              <span class="text-sm font-medium text-gray-700">快速筛选:</span>
              <n-button-group size="small">
                <n-button 
                  :type="!gameProviderFilter && !gameCategoryFilter ? 'primary' : 'default'"
                  @click="clearTableFilters"
                >
                  全部
                </n-button>
                <n-button 
                  v-for="provider in gameProviderOptions.slice(0, 3)"
                  :key="provider.value"
                  :type="gameProviderFilter === provider.value ? 'primary' : 'default'"
                  @click="gameProviderFilter = gameProviderFilter === provider.value ? '' : provider.value"
                >
                  {{ provider.label }}
                </n-button>
              </n-button-group>
            </div>
            
            <div class="flex items-center gap-2">
              <span class="text-sm font-medium text-gray-700">排序:</span>
              <n-select
                v-model:value="sortBy"
                size="small"
                style="width: 120px"
                :options="sortOptions"
                @update:value="handleSortChange"
              />
            </div>
          </div>
        </div>

        <n-data-table
          :loading="loading"
          :columns="enhancedGameColumns"
          :data="filteredGameDetails"
          :pagination="pagination"
          size="small"
          :row-key="(row: BetGameDetail) => `${row.gameProvider}-${row.gameCategory}-${row.gameName}`"
          :scroll-x="1400"
          bordered
          striped
          :row-class-name="getRowClassName"
        />
        
        <!-- Table Summary -->
        <div v-if="filteredGameDetails.length > 0" class="mt-4 p-3 bg-blue-50 rounded-lg">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600">汇总投注:</span>
              <span class="font-semibold text-blue-600">{{ formatCurrency(filteredGameDetails.reduce((sum, game) => sum + game.betAmount, 0)) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">有效投注:</span>
              <span class="font-semibold text-purple-600">{{ formatCurrency(filteredGameDetails.reduce((sum, game) => sum + game.validBetAmount, 0)) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">总盈亏:</span>
              <span class="font-semibold" :class="filteredGameDetails.reduce((sum, game) => sum + game.profitLoss, 0) >= 0 ? 'text-green-600' : 'text-red-600'">
                {{ formatCurrency(filteredGameDetails.reduce((sum, game) => sum + game.profitLoss, 0)) }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">注单数:</span>
              <span class="font-semibold text-orange-600">{{ filteredGameDetails.reduce((sum, game) => sum + game.betCount, 0) }}</span>
            </div>
          </div>
        </div>
      </n-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, h } from 'vue';
import { NCard, NButton, NDatePicker, NDataTable, NSpin, NTag } from 'naive-ui';
import { getBetStatisticData, type BetStatisticSummary, type BetGameDetail, type BetStatisticRequest } from '#/api/core/betStatistic';

// ===================================
// PROPS & EMITS
// ===================================

interface Props {
  userId: number;
}

const props = defineProps<Props>();

// ===================================
// REACTIVE DATA
// ===================================

const loading = ref(false);
const summary = ref<BetStatisticSummary>({
  totalBetCount: 0,
  totalBetAmount: 0,
  totalValidBetAmount: 0,
  memberCount: 0,
  subordinateBetCount: 0,
  profitRatio: 0
});
const gameDetails = ref<BetGameDetail[]>([]);
const dateRange = ref<[number, number] | null>(null);

// Enhanced filters
const gameProviderFilter = ref<string>('');
const gameCategoryFilter = ref<string>('');
const gameProviderOptions = ref<Array<{label: string, value: string}>>([]);
const gameCategoryOptions = ref<Array<{label: string, value: string}>>([]);

// Query tracking
const lastQueryInfo = ref<{
  timestamp: string;
  dateRange: string;
  gameCount: number;
  totalBet: string;
} | null>(null);

// Table enhancements
const sortBy = ref<string>('betAmount');
const sortOptions = [
  { label: '投注金额', value: 'betAmount' },
  { label: '注单数量', value: 'betCount' },
  { label: '有效投注', value: 'validBetAmount' },
  { label: '盈亏', value: 'profitLoss' },
  { label: '游戏名称', value: 'gameName' }
];

// ===================================
// COMPUTED
// ===================================

const hasData = computed(() => {
  return summary.value.totalBetCount > 0 || gameDetails.value.length > 0;
});

const filteredGameDetails = computed(() => {
  let filtered = gameDetails.value;
  
  // Apply filters
  if (gameProviderFilter.value) {
    filtered = filtered.filter(game => game.gameProvider === gameProviderFilter.value);
  }
  
  if (gameCategoryFilter.value) {
    filtered = filtered.filter(game => game.gameCategory === gameCategoryFilter.value);
  }
  
  // Apply sorting
  if (sortBy.value) {
    filtered = [...filtered].sort((a, b) => {
      const aValue = a[sortBy.value as keyof BetGameDetail];
      const bValue = b[sortBy.value as keyof BetGameDetail];
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return bValue - aValue; // Descending order for numbers
      } else {
        return String(aValue).localeCompare(String(bValue));
      }
    });
  }
  
  return filtered;
});

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
  }
});

// ===================================
// DATE SHORTCUTS
// ===================================

const dateShortcuts = {
  '今天': () => {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const end = new Date(start);
    return [start.getTime(), end.getTime()];
  },
  '昨天': () => {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
    const end = new Date(start);
    return [start.getTime(), end.getTime()];
  },
  '最近7天': () => {
    const end = new Date();
    const start = new Date(end.getFullYear(), end.getMonth(), end.getDate() - 6);
    return [start.getTime(), end.getTime()];
  },
  '最近30天': () => {
    const end = new Date();
    const start = new Date(end.getFullYear(), end.getMonth(), end.getDate() - 29);
    return [start.getTime(), end.getTime()];
  },
  '本月': () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date();
    return [start.getTime(), end.getTime()];
  }
};

// ===================================
// TABLE COLUMNS
// ===================================

const enhancedGameColumns = [
  {
    title: '平台',
    key: 'gameProvider',
    width: 120,
    fixed: 'left'
  },
  {
    title: '类别',
    key: 'gameCategory',
    width: 120
  },
  {
    title: '游戏名称',
    key: 'gameName',
    width: 200,
    ellipsis: {
      tooltip: true
    },
    render: (row: BetGameDetail) => h('div', { class: 'font-medium text-gray-800' }, row.gameName)
  },
  {
    title: '注单数量',
    key: 'betCount',
    width: 100,
    align: 'right',
    sorter: true,
    render: (row: BetGameDetail) => h('span', { class: 'font-bold text-blue-600' }, row.betCount)
  },
  {
    title: '投注金额',
    key: 'betAmount',
    width: 130,
    align: 'right',
    sorter: true,
    render: (row: BetGameDetail) => h('span', { class: 'font-bold text-green-600' }, `R$ ${formatCurrency(row.betAmount)}`)
  },
  {
    title: '有效投注',
    key: 'validBetAmount',
    width: 130,
    align: 'right',
    sorter: true,
    render: (row: BetGameDetail) => h('span', { class: 'font-bold text-purple-600' }, `R$ ${formatCurrency(row.validBetAmount)}`)
  },
  {
    title: '盈亏',
    key: 'profitLoss',
    width: 130,
    align: 'right',
    sorter: true,
    render: (row: BetGameDetail) => {
      const isProfit = row.profitLoss >= 0;
      return h('span', { class: `font-bold ${isProfit ? 'text-green-600' : 'text-red-600'}` }, `${isProfit ? '+' : ''}R$ ${formatCurrency(Math.abs(row.profitLoss))}`);
    }
  },
  {
    title: '会员数量',
    key: 'memberCount',
    width: 100,
    align: 'right',
    render: (row: BetGameDetail) => h('span', { class: 'font-bold text-orange-600' }, row.memberCount)
  }
];

// ===================================
// METHODS
// ===================================

const loadBetStatistics = async () => {
  if (!props.userId) {
    console.error('❌ User ID is required');
    return;
  }

  loading.value = true;
  
  try {
    const params: BetStatisticRequest = {
      userId: props.userId
    };

    // Add date range if selected
    if (dateRange.value && dateRange.value.length === 2) {
      const start = new Date(dateRange.value[0]);
      const end = new Date(dateRange.value[1]);
      // Normalize to full-day boundaries (UTC) to avoid invalid end date
      const startISO = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate(), 0, 0, 0, 0)).toISOString();
      const endISO = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate(), 23, 59, 59, 999)).toISOString();
      params.startDate = startISO;
      params.endDate = endISO;
    }

    console.log('🔍 Loading bet statistics with params:', params);

    const response = await getBetStatisticData(params);
    console.log('📊 Raw API response:', response);
    
    // Handle both response structures: {code, data} and {summary, gameDetails}
    let data;
    if (response.code === 0 && response.data) {
      // Standard API response structure
      data = response.data;
    } else if ('summary' in response && 'gameDetails' in response) {
      // Unwrapped response structure
      data = response;
    } else {
      console.error('❌ Failed to load bet statistics:', response);
      summary.value = {
        totalBetCount: 0,
        totalBetAmount: 0,
        totalValidBetAmount: 0,
        memberCount: 0,
        subordinateBetCount: 0,
        profitRatio: 0
      };
      gameDetails.value = [];
      return;
    }
    
    // Set the data
    summary.value = data.summary;
    gameDetails.value = data.gameDetails;
    
    // Update filter options
    updateFilterOptions();
    
    // Update query info
    lastQueryInfo.value = {
      timestamp: new Date().toLocaleString('zh-CN'),
      dateRange: dateRange.value ? 
        `${dateRange.value[0]} ~ ${dateRange.value[1]}` : 
        '最近7天',
      gameCount: gameDetails.value.length,
      totalBet: formatCurrency(summary.value.totalBetAmount)
    };
    
    console.log('✅ Bet statistics loaded:', {
      summary: summary.value,
      gameCount: gameDetails.value.length,
      queryInfo: lastQueryInfo.value
    });
  } catch (error) {
    console.error('❌ Error loading bet statistics:', error);
    summary.value = {
      totalBetCount: 0,
      totalBetAmount: 0,
      totalValidBetAmount: 0,
      memberCount: 0,
      subordinateBetCount: 0,
      profitRatio: 0
    };
    gameDetails.value = [];
  } finally {
    loading.value = false;
  }
};

const handleDateRangeChange = () => {
  console.log('📅 Date range changed:', dateRange.value);
};

const handleReset = () => {
  dateRange.value = null;
  gameProviderFilter.value = '';
  gameCategoryFilter.value = '';
  summary.value = {
    totalBetCount: 0,
    totalBetAmount: 0,
    totalValidBetAmount: 0,
    memberCount: 0,
    subordinateBetCount: 0,
    profitRatio: 0
  };
  gameDetails.value = [];
  lastQueryInfo.value = null;
  console.log('🔄 Reset bet statistics');
};

const handleFilterChange = () => {
  console.log('🔧 Filter changed:', {
    provider: gameProviderFilter.value,
    category: gameCategoryFilter.value
  });
};

const formatCurrency = (amount: number): string => {
  // Always show exact amount with 2 decimal places, no K/M abbreviations
  return amount.toFixed(2);
};

const updateFilterOptions = () => {
  // Extract unique providers and categories from game details
  const providers = [...new Set(gameDetails.value.map(game => game.gameProvider))];
  const categories = [...new Set(gameDetails.value.map(game => game.gameCategory))];
  
  gameProviderOptions.value = providers.map(provider => ({
    label: provider,
    value: provider
  }));
  
  gameCategoryOptions.value = categories.map(category => ({
    label: category,
    value: category
  }));
};

const clearTableFilters = () => {
  gameProviderFilter.value = '';
  gameCategoryFilter.value = '';
};

const handleSortChange = () => {
  console.log('📊 Sort changed:', sortBy.value);
};

const getRowClassName = (row: BetGameDetail) => {
  if (row.profitLoss > 0) {
    return 'profit-row';
  } else if (row.profitLoss < 0) {
    return 'loss-row';
  }
  return '';
};

// ===================================
// LIFECYCLE
// ===================================

onMounted(() => {
  console.log('🎯 BetStatisticTab mounted for user:', props.userId);
  // Default to 最近7天
  dateRange.value = dateShortcuts['最近7天']();
  loadBetStatistics();
});
</script>

<style scoped>
.bet-statistic-tab {
  @apply space-y-4;
}

/* Query Card Styles */
.query-card {
  @apply border border-gray-200 shadow-sm;
}

.action-button {
  @apply min-w-[100px] font-medium;
}

/* Enhanced Summary Card Styles */
.summary-card {
  @apply transition-all duration-300 hover:shadow-lg border-0;
}

.summary-card:hover {
  @apply transform scale-105;
}

/* Stat Card Variants */
.stat-card-blue {
  @apply bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200;
}

.stat-card-green {
  @apply bg-gradient-to-br from-green-50 to-green-100 border-green-200;
}

.stat-card-purple {
  @apply bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200;
}

.stat-card-orange {
  @apply bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200;
}

.stat-card-indigo {
  @apply bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200;
}

.stat-card-success {
  @apply bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200;
}

.stat-card-danger {
  @apply bg-gradient-to-br from-red-50 to-red-100 border-red-200;
}

/* Stat Content Layout */
.stat-content {
  @apply flex items-center justify-between mb-3;
}

.stat-icon {
  @apply text-2xl opacity-80;
}

.stat-info {
  @apply flex-1 text-right;
}

.stat-label {
  @apply text-xs text-gray-600 font-medium mb-1;
}

.stat-value {
  @apply text-xl font-bold text-gray-800 leading-tight;
}

.stat-unit {
  @apply text-xs text-gray-500 font-medium;
}

/* Trend Indicators */
.stat-trend {
  @apply flex items-center justify-between text-xs;
}

.trend-indicator {
  @apply font-semibold px-2 py-1 rounded-full;
}

.trend-indicator.positive {
  @apply text-green-600 bg-green-100;
}

.trend-indicator.negative {
  @apply text-red-600 bg-red-100;
}

.trend-percentage {
  @apply font-semibold text-gray-700 px-2 py-1 bg-gray-100 rounded-full;
}

.trend-label {
  @apply text-gray-500 font-medium;
}

/* Content Sections */
.bet-statistic-content {
  @apply space-y-6;
}

/* Responsive Design */
@media (max-width: 768px) {
  .stat-content {
    @apply flex-col items-start;
  }
  
  .stat-info {
    @apply text-left mt-2;
  }
  
  .stat-icon {
    @apply text-xl;
  }
  
  .stat-value {
    @apply text-lg;
  }
}

/* Animation for loading states */
.summary-card {
  animation: fadeInUp 0.5s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Table enhancements */
.game-details-card {
  @apply border border-gray-200 shadow-sm;
}

:deep(.n-data-table-th) {
  @apply bg-gray-50 font-semibold text-gray-700;
}

:deep(.n-data-table-td) {
  @apply border-b border-gray-100 py-3;
}

:deep(.n-data-table-tr:hover .n-data-table-td) {
  @apply bg-blue-50;
}

:deep(.profit-row .n-data-table-td) {
  @apply bg-green-50;
}

:deep(.loss-row .n-data-table-td) {
  @apply bg-red-50;
}

:deep(.n-button-group .n-button) {
  @apply min-w-[60px];
}
</style> 