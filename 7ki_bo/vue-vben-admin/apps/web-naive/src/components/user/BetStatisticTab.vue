<template>
  <div class="bet-statistic-tab">
    <!-- Enhanced Query Section -->
    <n-card :title="$t('user.betStatistic.queryConditions')" class="query-card mb-4">
      <div class="flex flex-wrap items-end gap-4">
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium text-gray-700">{{ $t('user.betStatistic.dateRange') }}</label>
          <n-date-picker
            v-model:value="dateRange"
            type="daterange"
            :placeholder="$t('user.betStatistic.selectDateRange')"
            style="width: 320px"
            :shortcuts="dateShortcuts"
            @update:value="handleDateRangeChange"
            clearable
          />
        </div>

        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium text-gray-700">{{ $t('user.betStatistic.gameProvider') }}</label>
          <n-select
            v-model:value="gameProviderFilter"
            :placeholder="$t('user.betStatistic.selectGameProvider')"
            style="width: 150px"
            :options="gameProviderOptions"
            clearable
            @update:value="handleFilterChange"
          />
        </div>

        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium text-gray-700">{{ $t('user.betStatistic.gameCategory') }}</label>
          <n-select
            v-model:value="gameCategoryFilter"
            :placeholder="$t('user.betStatistic.selectGameCategory')"
            style="width: 150px"
            :options="gameCategoryOptions"
            clearable
            @update:value="handleFilterChange"
          />
        </div>

        <div class="flex gap-2">
          <n-button
            type="primary"
            @click="loadBetStatistics"
            :loading="loading"
            class="action-button"
            >{{ $t('user.betStatistic.queryStats') }}</n-button
          >
          <n-button @click="handleReset" class="action-button">{{ $t('common.reset') }}</n-button>
          <n-button
            @click="loadBetStatistics"
            :disabled="loading"
            class="action-button"
            >{{ $t('common.refresh') }}</n-button
          >
        </div>
      </div>
    </n-card>

    <!-- Loading State -->
    <div v-if="loading" class="flex h-64 items-center justify-center">
      <n-spin size="large" />
    </div>

    <!-- No Data State -->
    <div v-else-if="!hasData" class="py-12 text-center text-gray-500">
      <div class="text-lg font-medium">{{ $t('user.betStatistic.noBetData') }}</div>
      <div class="mt-2 text-sm text-gray-400">{{ $t('user.betStatistic.selectDateToQuery') }}</div>
    </div>

    <!-- Data Content -->
    <div v-else class="bet-statistic-content">
      <!-- Enhanced Summary Cards -->
      <div class="mb-6">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-800">{{ $t('user.betStatistic.statsOverview') }}</h3>
          <n-tag type="success" size="small">{{ $t('user.betStatistic.realtimeData') }}</n-tag>
        </div>

        <div
          class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
        >
          <!-- Total Bet Count -->
          <n-card size="small" class="summary-card stat-card-blue">
            <div class="stat-content">
              <div class="stat-info">
                <div class="stat-label">{{ $t('user.betStatistic.totalBetCount') }}</div>
                <div class="stat-value">{{ summary.totalBetCount }}</div>
                <div class="stat-unit">{{ $t('user.betStatistic.betUnit') }}</div>
              </div>
            </div>
          </n-card>

          <!-- Total Bet Amount -->
          <n-card size="small" class="summary-card stat-card-green">
            <div class="stat-content">
              <div class="stat-info">
                <div class="stat-label">{{ $t('user.betStatistic.totalBetAmount') }}</div>
                <div class="stat-value">
                  {{ formatCurrency(summary.totalBetAmount) }}
                </div>
                <div class="stat-unit">BRL</div>
              </div>
            </div>
          </n-card>

          <!-- Total Valid Bet -->
          <n-card size="small" class="summary-card stat-card-purple">
            <div class="stat-content">
              <div class="stat-info">
                <div class="stat-label">{{ $t('user.betStatistic.totalValidBet') }}</div>
                <div class="stat-value">
                  {{ formatCurrency(summary.totalValidBetAmount) }}
                </div>
                <div class="stat-unit">BRL</div>
              </div>
            </div>
            <div class="pb-2 pr-3 text-right text-xs text-gray-500">
              {{ $t('user.betStatistic.validRate') }}
              {{
                (
                  (summary.totalValidBetAmount /
                    (summary.totalBetAmount || 1)) *
                  100
                ).toFixed(1)
              }}%
            </div>
          </n-card>

          <!-- Member Count -->
          <n-card size="small" class="summary-card stat-card-orange">
            <div class="stat-content">
              <div class="stat-info">
                <div class="stat-label">{{ $t('common.member') }}</div>
                <div class="stat-value">{{ summary.memberCount }}</div>
                <div class="stat-unit">{{ $t('user.betStatistic.peopleUnit') }}</div>
              </div>
            </div>
          </n-card>

          <!-- Subordinate Bet Count -->
          <n-card size="small" class="summary-card stat-card-indigo">
            <div class="stat-content">
              <div class="stat-info">
                <div class="stat-label">{{ $t('user.betStatistic.subordinateBetCount') }}</div>
                <div class="stat-value">{{ summary.subordinateBetCount }}</div>
                <div class="stat-unit">{{ $t('user.betStatistic.betUnit') }}</div>
              </div>
            </div>
          </n-card>

          <!-- Profit Ratio -->
          <n-card
            size="small"
            class="summary-card"
            :class="
              summary.profitRatio >= 0
                ? 'stat-card-success'
                : 'stat-card-danger'
            "
          >
            <div class="stat-content">
              <div class="stat-info">
                <div class="stat-label">{{ $t('user.betStatistic.profitRatio') }}</div>
                <div class="stat-value">
                  {{ summary.profitRatio.toFixed(2) }}
                </div>
                <div class="stat-unit">%</div>
              </div>
            </div>
          </n-card>
        </div>
      </div>

      <!-- Enhanced Game Details Table -->
      <n-card class="game-details-card mb-4">
        <template #header>
          <div class="flex items-center gap-2">
            <span class="text-lg font-semibold">{{ $t('user.betStatistic.gameBetDetails') }}</span>
            <n-tag type="info" size="small">{{ $t('user.betStatistic.byPlatform') }}</n-tag>
          </div>
        </template>

        <template #header-extra>
          <div class="flex items-center gap-3">
            <div class="flex items-center gap-2 text-sm text-gray-600">
              <span class="font-medium"
                >{{ $t('user.betStatistic.gameCount', [filteredGameDetails.length]) }}</span
              >
              <span class="text-gray-400">|</span>
              <span
                >{{ $t('user.betStatistic.totalBetLabel') }}:
                {{
                  formatCurrency(
                    filteredGameDetails.reduce(
                      (sum, game) => sum + game.betAmount,
                      0,
                    ),
                  )
                }}</span
              >
            </div>
            <n-button
              size="tiny"
              type="primary"
              @click="loadBetStatistics"
              :disabled="loading"
              >{{ $t('common.refresh') }}</n-button
            >
          </div>
        </template>

        <!-- Table Filters -->
        <div
          v-if="gameDetails.length > 0"
          class="mb-4 rounded-lg bg-gray-50 p-3"
        >
          <div class="flex flex-wrap items-center gap-4">
            <div class="flex items-center gap-2">
              <span class="text-sm font-medium text-gray-700">{{ $t('user.betStatistic.quickFilter') }}:</span>
              <n-button-group size="small">
                <n-button
                  :type="
                    !gameProviderFilter && !gameCategoryFilter
                      ? 'primary'
                      : 'default'
                  "
                  @click="clearTableFilters"
                >
                  {{ $t('common.all') }}
                </n-button>
                <n-button
                  v-for="provider in gameProviderOptions.slice(0, 3)"
                  :key="provider.value"
                  :type="
                    gameProviderFilter === provider.value
                      ? 'primary'
                      : 'default'
                  "
                  @click="
                    gameProviderFilter =
                      gameProviderFilter === provider.value
                        ? ''
                        : provider.value
                  "
                >
                  {{ provider.label }}
                </n-button>
              </n-button-group>
            </div>

            <div class="flex items-center gap-2">
              <span class="text-sm font-medium text-gray-700">{{ $t('user.betStatistic.sort') }}:</span>
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
          :row-key="
            (row: BetGameDetail) =>
              `${row.gameProvider}-${row.gameCategory}-${row.gameName}`
          "
          :scroll-x="1400"
          bordered
          striped
          :row-class-name="getRowClassName"
        />

        <!-- Table Summary -->
        <div
          v-if="filteredGameDetails.length > 0"
          class="mt-4 rounded-lg bg-blue-50 p-3"
        >
          <div class="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
            <div class="flex justify-between">
              <span class="text-gray-600">{{ $t('user.betStatistic.summaryBet') }}:</span>
              <span class="font-semibold text-blue-600">{{
                formatCurrency(
                  filteredGameDetails.reduce(
                    (sum, game) => sum + game.betAmount,
                    0,
                  ),
                )
              }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">{{ $t('user.betStatistic.summaryValidBet') }}:</span>
              <span class="font-semibold text-purple-600">{{
                formatCurrency(
                  filteredGameDetails.reduce(
                    (sum, game) => sum + game.validBetAmount,
                    0,
                  ),
                )
              }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">{{ $t('user.betStatistic.summaryPnl') }}:</span>
              <span
                class="font-semibold"
                :class="
                  filteredGameDetails.reduce(
                    (sum, game) => sum + game.profitLoss,
                    0,
                  ) >= 0
                    ? 'text-green-600'
                    : 'text-red-600'
                "
              >
                {{
                  formatMemberProfitLoss(
                    filteredGameDetails.reduce(
                      (sum, game) => sum + game.profitLoss,
                      0,
                    ),
                  )
                }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">{{ $t('user.betStatistic.summaryBetCount') }}:</span>
              <span class="font-semibold text-orange-600">{{
                filteredGameDetails.reduce(
                  (sum, game) => sum + game.betCount,
                  0,
                )
              }}</span>
            </div>
          </div>
        </div>
      </n-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { $t } from '@vben/locales';

import { ref, computed, onMounted, h } from 'vue';
import { NCard, NButton, NDatePicker, NDataTable, NSpin, NTag } from 'naive-ui';
import {
  getBetStatisticData,
  type BetStatisticSummary,
  type BetGameDetail,
  type BetStatisticRequest,
} from '#/api/core/betStatistic';

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
  profitRatio: 0,
});
const gameDetails = ref<BetGameDetail[]>([]);
const dateRange = ref<[number, number] | null>(null);

// Enhanced filters
const gameProviderFilter = ref<string>('');
const gameCategoryFilter = ref<string>('');
const gameProviderOptions = ref<Array<{ label: string; value: string }>>([]);
const gameCategoryOptions = ref<Array<{ label: string; value: string }>>([]);

// Query tracking
const lastQueryInfo = ref<{
  timestamp: string;
  dateRange: string;
  gameCount: number;
  totalBet: string;
} | null>(null);

// Table enhancements
const sortBy = ref<string>('betAmount');
const sortOptions = computed(() => [
  { label: $t('user.betStatistic.sortBetAmount'), value: 'betAmount' },
  { label: $t('user.betStatistic.sortBetCount'), value: 'betCount' },
  { label: $t('user.betStatistic.sortValidBet'), value: 'validBetAmount' },
  { label: $t('user.betStatistic.sortProfitLoss'), value: 'profitLoss' },
  { label: $t('user.betStatistic.sortGameName'), value: 'gameName' },
]);

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
    filtered = filtered.filter(
      (game) => game.gameProvider === gameProviderFilter.value,
    );
  }

  if (gameCategoryFilter.value) {
    filtered = filtered.filter(
      (game) => game.gameCategory === gameCategoryFilter.value,
    );
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
  },
});

// ===================================
// DATE SHORTCUTS
// ===================================

const dateShortcuts = computed(() => {
  const last7 = () => {
    const end = new Date();
    const start = new Date(end.getFullYear(), end.getMonth(), end.getDate() - 6);
    return [start.getTime(), end.getTime()];
  };
  return {
    [$t('common.today')]: () => {
      const today = new Date();
      const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      return [start.getTime(), start.getTime()];
    },
    [$t('advancedSearch.yesterday')]: () => {
      const today = new Date();
      const start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
      return [start.getTime(), start.getTime()];
    },
    [$t('user.betStatistic.last7Days')]: last7,
    [$t('user.betStatistic.last30Days')]: () => {
      const end = new Date();
      const start = new Date(end.getFullYear(), end.getMonth(), end.getDate() - 29);
      return [start.getTime(), end.getTime()];
    },
    [$t('common.thisMonth')]: () => {
      const now = new Date();
      return [new Date(now.getFullYear(), now.getMonth(), 1).getTime(), now.getTime()];
    },
  };
});
const last7DaysShortcut = computed(() => dateShortcuts.value[$t('user.betStatistic.last7Days')]);

// ===================================
// TABLE COLUMNS
// ===================================

const enhancedGameColumns = computed(() => [
  {
    title: $t('user.betStatistic.platform'),
    key: 'gameProvider',
    width: 120,
    fixed: 'left',
  },
  {
    title: $t('user.betStatistic.category'),
    key: 'gameCategory',
    width: 120,
  },
  {
    title: $t('user.betStatistic.gameName'),
    key: 'gameName',
    width: 200,
    ellipsis: {
      tooltip: true,
    },
    render: (row: BetGameDetail) =>
      h('div', { class: 'font-medium text-gray-800' }, row.gameName),
  },
  {
    title: $t('user.betStatistic.betCount'),
    key: 'betCount',
    width: 100,
    align: 'right',
    sorter: true,
    render: (row: BetGameDetail) =>
      h('span', { class: 'font-bold text-blue-600' }, row.betCount),
  },
  {
    title: $t('user.betStatistic.betAmount'),
    key: 'betAmount',
    width: 130,
    align: 'right',
    sorter: true,
    render: (row: BetGameDetail) =>
      h(
        'span',
        { class: 'font-bold text-green-600' },
        `R$ ${formatCurrency(row.betAmount)}`,
      ),
  },
  {
    title: $t('user.betStatistic.validBet'),
    key: 'validBetAmount',
    width: 130,
    align: 'right',
    sorter: true,
    render: (row: BetGameDetail) =>
      h(
        'span',
        { class: 'font-bold text-purple-600' },
        `R$ ${formatCurrency(row.validBetAmount)}`,
      ),
  },
  {
    title: $t('user.betStatistic.profitLoss'),
    key: 'profitLoss',
    width: 130,
    align: 'right',
    sorter: true,
    render: (row: BetGameDetail) => {
      const pl = row.profitLoss;
      const isProfit = pl >= 0;
      return h(
        'span',
        { class: `font-bold ${isProfit ? 'text-green-600' : 'text-red-600'}` },
        formatMemberProfitLoss(pl),
      );
    },
  },
  {
    title: $t('user.betStatistic.memberCount'),
    key: 'memberCount',
    width: 100,
    align: 'right',
    render: (row: BetGameDetail) =>
      h('span', { class: 'font-bold text-orange-600' }, row.memberCount),
  },
]);

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
      userId: props.userId,
    };

    // Add date range if selected
    if (dateRange.value && dateRange.value.length === 2) {
      const start = new Date(dateRange.value[0]);
      const end = new Date(dateRange.value[1]);
      // Normalize to full-day boundaries (UTC) to avoid invalid end date
      const startISO = new Date(
        Date.UTC(
          start.getUTCFullYear(),
          start.getUTCMonth(),
          start.getUTCDate(),
          0,
          0,
          0,
          0,
        ),
      ).toISOString();
      const endISO = new Date(
        Date.UTC(
          end.getUTCFullYear(),
          end.getUTCMonth(),
          end.getUTCDate(),
          23,
          59,
          59,
          999,
        ),
      ).toISOString();
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
        profitRatio: 0,
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
      dateRange: dateRange.value
        ? `${dateRange.value[0]} ~ ${dateRange.value[1]}`
        : $t('user.betStatistic.last7Days'),
      gameCount: gameDetails.value.length,
      totalBet: formatCurrency(summary.value.totalBetAmount),
    };

    console.log('✅ Bet statistics loaded:', {
      summary: summary.value,
      gameCount: gameDetails.value.length,
      queryInfo: lastQueryInfo.value,
    });
  } catch (error) {
    console.error('❌ Error loading bet statistics:', error);
    summary.value = {
      totalBetCount: 0,
      totalBetAmount: 0,
      totalValidBetAmount: 0,
      memberCount: 0,
      subordinateBetCount: 0,
      profitRatio: 0,
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
    profitRatio: 0,
  };
  gameDetails.value = [];
  lastQueryInfo.value = null;
  console.log('🔄 Reset bet statistics');
};

const handleFilterChange = () => {
  console.log('🔧 Filter changed:', {
    provider: gameProviderFilter.value,
    category: gameCategoryFilter.value,
  });
};

const formatCurrency = (amount: number): string => {
  // Always show exact amount with 2 decimal places, no K/M abbreviations
  return amount.toFixed(2);
};

/** 会员视角盈亏：赢为 +，输为 - */
const formatMemberProfitLoss = (amount: number): string => {
  const abs = formatCurrency(Math.abs(amount));
  if (amount > 0) return `+R$ ${abs}`;
  if (amount < 0) return `-R$ ${abs}`;
  return `R$ ${abs}`;
};

const updateFilterOptions = () => {
  // Extract unique providers and categories from game details
  const providers = [
    ...new Set(gameDetails.value.map((game) => game.gameProvider)),
  ];
  const categories = [
    ...new Set(gameDetails.value.map((game) => game.gameCategory)),
  ];

  gameProviderOptions.value = providers.map((provider) => ({
    label: provider,
    value: provider,
  }));

  gameCategoryOptions.value = categories.map((category) => ({
    label: category,
    value: category,
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
  dateRange.value = last7DaysShortcut.value();
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
  @apply border-0 transition-all duration-300 hover:shadow-lg;
}

.summary-card:hover {
  @apply scale-105 transform;
}

/* Stat Card Variants */
.stat-card-blue {
  @apply border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100;
}

.stat-card-green {
  @apply border-green-200 bg-gradient-to-br from-green-50 to-green-100;
}

.stat-card-purple {
  @apply border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100;
}

.stat-card-orange {
  @apply border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100;
}

.stat-card-indigo {
  @apply border-indigo-200 bg-gradient-to-br from-indigo-50 to-indigo-100;
}

.stat-card-success {
  @apply border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100;
}

.stat-card-danger {
  @apply border-red-200 bg-gradient-to-br from-red-50 to-red-100;
}

/* Stat Content Layout */
.stat-content {
  @apply mb-3 flex items-center justify-between;
}

.stat-icon {
  @apply text-2xl opacity-80;
}

.stat-info {
  @apply flex-1 text-right;
}

.stat-label {
  @apply mb-1 text-xs font-medium text-gray-600;
}

.stat-value {
  @apply text-xl font-bold leading-tight text-gray-800;
}

.stat-unit {
  @apply text-xs font-medium text-gray-500;
}

/* Trend Indicators */
.stat-trend {
  @apply flex items-center justify-between text-xs;
}

.trend-indicator {
  @apply rounded-full px-2 py-1 font-semibold;
}

.trend-indicator.positive {
  @apply bg-green-100 text-green-600;
}

.trend-indicator.negative {
  @apply bg-red-100 text-red-600;
}

.trend-percentage {
  @apply rounded-full bg-gray-100 px-2 py-1 font-semibold text-gray-700;
}

.trend-label {
  @apply font-medium text-gray-500;
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
    @apply mt-2 text-left;
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
