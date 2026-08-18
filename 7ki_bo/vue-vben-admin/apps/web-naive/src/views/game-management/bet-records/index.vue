<template>
  <Page :title="$t('game.betRecords.title')" :description="$t('game.betRecords.desc')">
    <div class="mb-4">
      <n-breadcrumb>
        <n-breadcrumb-item>{{ $t('page.menu.gameManagement') }}</n-breadcrumb-item>
        <n-breadcrumb-item>{{ $t('page.menu.betRecords') }}</n-breadcrumb-item>
      </n-breadcrumb>
    </div>

    <n-tabs
      v-model:value="activeTab"
      type="line"
      animated
      @update:value="handleTabChange"
    >
      <n-tab-pane name="details" :tab="$t('game.betRecords.detailsTab')">
        <n-card :bordered="false" class="rounded-16px mb-4 shadow-sm">
          <div class="filter-section">
            <div
              class="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4"
            >
              <div class="filter-item">
                <n-form-item :label="$t('game.betRecords.betTime')">
                  <n-date-picker
                    v-model:value="dateRange"
                    type="datetimerange"
                    clearable
                    size="small"
                    :shortcuts="dateShortcuts"
                    format="yyyy-MM-dd HH:mm:ss"
                    style="width: 100%"
                    @update:value="handleDateRangeUpdate"
                  />
                </n-form-item>
              </div>

              <div class="filter-item">
                <n-form-item :label="$t('game.betRecords.gamePlatform')">
                  <n-select
                    v-model:value="filters.gameProvider"
                    :placeholder="$t('game.betRecords.selectGamePlatform')"
                    clearable
                    size="small"
                    :options="providerOptions"
                    filterable
                  />
                </n-form-item>
              </div>

              <div class="filter-item">
                <n-form-item :label="$t('game.betRecords.gameType')">
                  <n-select
                    v-model:value="filters.gameCategory"
                    :placeholder="$t('game.betRecords.selectGameType')"
                    clearable
                    size="small"
                    :options="categoryOptions"
                    filterable
                  />
                </n-form-item>
              </div>

              <div class="filter-item">
                <n-form-item :label="$t('game.betRecords.transactionType')">
                  <n-select
                    v-model:value="filters.type"
                    :placeholder="$t('game.betRecords.selectTransactionType')"
                    clearable
                    size="small"
                    :options="typeOptions"
                  />
                </n-form-item>
              </div>
            </div>

            <div
              class="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4"
            >
              <div class="filter-item">
                <n-form-item :label="$t('game.betRecords.gameName')">
                  <n-input
                    v-model:value="filters.gameName"
                    :placeholder="$t('game.betRecords.enterGameName')"
                    clearable
                    size="small"
                  />
                </n-form-item>
              </div>

              <div class="filter-item">
                <n-form-item :label="$t('game.betRecords.memberAccount')">
                  <n-input
                    v-model:value="filters.username"
                    :placeholder="$t('game.betRecordsExtra.enterMemberOrId')"
                    clearable
                    size="small"
                  />
                </n-form-item>
              </div>

              <div class="filter-item">
                <n-form-item :label="$t('game.betRecordsExtra.minAmount')">
                  <n-input-number
                    v-model:value="filters.minAmount"
                    :placeholder="$t('game.betRecordsExtra.minAmount')"
                    clearable
                    size="small"
                    :precision="2"
                    :show-button="false"
                    style="width: 100%"
                  />
                </n-form-item>
              </div>

              <div class="filter-item">
                <n-form-item :label="$t('game.betRecordsExtra.maxAmount')">
                  <n-input-number
                    v-model:value="filters.maxAmount"
                    :placeholder="$t('game.betRecordsExtra.maxAmount')"
                    clearable
                    size="small"
                    :precision="2"
                    :show-button="false"
                    style="width: 100%"
                  />
                </n-form-item>
              </div>
            </div>

            <div class="flex items-center justify-between">
              <div class="flex flex-wrap items-center gap-2">
                <n-button
                  type="primary"
                  @click="handleSearch"
                  :loading="loading"
                >
                  <template #icon>
                    <n-icon><SearchOutline /></n-icon>
                  </template>
                  {{ $t('common.search') }}
                </n-button>
                <n-button @click="handleReset">
                  <template #icon>
                    <n-icon><RefreshOutline /></n-icon>
                  </template>
                  {{ $t('common.reset') }}
                </n-button>
                <n-button @click="handleExport" :loading="exporting">
                  <template #icon>
                    <n-icon><DownloadOutline /></n-icon>
                  </template>
                  {{ $t('common.export') }}
                </n-button>

                <n-divider vertical />
                <div class="flex items-center gap-2">
                  <span class="text-sm text-gray-600">{{ $t('game.betRecordsExtra2.mergeDisplay') }}</span>
                  <n-switch
                    v-model:value="consolidateView"
                    @update:value="handleConsolidateChange"
                    size="small"
                  >
                    <template #checked>{{ $t('game.betRecordsExtra2.byRound') }}</template>
                    <template #unchecked>{{ $t('game.betRecordsExtra2.details') }}</template>
                  </n-switch>
                  <n-tooltip trigger="hover">
                    <template #trigger>
                      <n-icon size="16" class="cursor-help text-gray-400">
                        <HelpCircleOutline />
                      </n-icon>
                    </template>
                    {{ $t('game.betRecordsExtra2.mergeHintOn') }}<br />{{ $t('game.betRecordsExtra2.mergeHintOff') }}
                  </n-tooltip>
                </div>
              </div>
              <div class="text-sm text-gray-600">
                {{ $t('game.betRecordsExtra.recordCount', [paginationReactive.total]) }}
              </div>
            </div>
          </div>
        </n-card>

        <div
          class="mb-4 grid grid-cols-1 gap-4 md:grid-cols-4"
          v-if="showStatistics"
        >
          <n-card :bordered="false" class="rounded-16px shadow-sm">
            <n-statistic :label="$t('game.betRecordsExtra.totalBet')" :value="statistics.totalAmount">
              <template #prefix>
                <n-icon color="#18a058"><TrendingUp /></n-icon>
              </template>
            </n-statistic>
          </n-card>
          <n-card :bordered="false" class="rounded-16px shadow-sm">
            <n-statistic :label="$t('game.betRecordsExtra.totalValidBet')" :value="statistics.totalValidBet">
              <template #prefix>
                <n-icon color="#2080f0"><CheckmarkCircle /></n-icon>
              </template>
            </n-statistic>
          </n-card>
          <n-card :bordered="false" class="rounded-16px shadow-sm">
            <n-statistic :label="$t('game.betRecordsExtra2.turnover')" :value="statistics.totalTurnover">
              <template #prefix>
                <n-icon color="#f0a020"><Sync /></n-icon>
              </template>
            </n-statistic>
          </n-card>
          <n-card :bordered="false" class="rounded-16px shadow-sm">
            <n-statistic :label="$t('game.betRecordsExtra2.transactionCount')" :value="statistics.count">
              <template #prefix>
                <n-icon color="#d03050"><Receipt /></n-icon>
              </template>
            </n-statistic>
          </n-card>
        </div>

        <SmartDataGrid
          :data="tableData"
          :columns="columns"
          :loading="loading"
          :pagination="paginationReactive"
          :scroll-x="2440"
          size="small"
          class="bet-records-table"
          @update:page="handlePageChange"
          @update:page-size="handlePageSizeChange"
          @refresh="loadData"
        >
          <template #actionBar>
            <n-card :bordered="false" class="rounded-16px mb-4 shadow-sm">
              <div class="flex items-center justify-between">
                <div class="text-sm">
                  <span class="font-semibold">{{ $t('game.betRecordsExtra2.pageTotal') }}</span>
                  {{ $t('game.betRecords.betAmount') }}:
                  <span class="font-semibold text-gray-800">{{
                    formatCurrency(Math.abs(pageTotals.totalAmount))
                  }}</span>
                  &nbsp;|&nbsp; {{ $t('game.betRecords.validBet') }}:
                  <span class="font-semibold text-gray-800">{{
                    formatCurrency(pageTotals.totalValidBet)
                  }}</span>
                  &nbsp;|&nbsp; {{ $t('game.betRecordsExtra2.withholdingTax') }}:
                  <span class="font-semibold text-gray-500">0.00</span>
                  &nbsp;|&nbsp; {{ $t('game.betRecords.winLoss') }}:
                  <span
                    :class="
                      pageTotals.totalAmount >= 0
                        ? 'font-bold text-red-600'
                        : 'font-bold text-green-600'
                    "
                    >{{ formatCurrency(pageTotals.totalAmount) }}</span
                  >
                  &nbsp;|&nbsp; {{ $t('game.betRecordsExtra2.turnover') }}:
                  <span class="font-semibold text-gray-600">{{
                    formatCurrency(pageTotals.totalTurnover)
                  }}</span>
                </div>
              </div>
            </n-card>
          </template>
        </SmartDataGrid>
      </n-tab-pane>

      <n-tab-pane name="statistics" :tab="$t('game.betRecordsExtra2.statsTab')">
        <n-card :bordered="false" class="rounded-16px mb-4 shadow-sm">
          <div class="filter-section">
            <div class="mb-4 flex flex-wrap items-start gap-3">
              <div class="flex items-center gap-2">
                <n-radio-group
                  v-model:value="statsDateType"
                  size="small"
                  @update:value="handleStatsDateTypeChange"
                >
                  <n-radio value="day">{{ $t('game.statistics.day') }}</n-radio>
                  <n-radio value="week">{{ $t('game.statistics.week') }}</n-radio>
                  <n-radio value="month">{{ $t('game.statistics.month') }}</n-radio>
                </n-radio-group>
              </div>

              <div style="min-width: 300px">
                <n-date-picker
                  v-model:value="statsDateRange"
                  type="datetimerange"
                  clearable
                  size="small"
                  :shortcuts="dateShortcuts"
                  format="yyyy-MM-dd HH:mm:ss"
                  style="width: 100%"
                  @update:value="handleStatsDateRangeUpdate"
                />
              </div>

              <div style="min-width: 200px">
                <n-input
                  v-model:value="statsFilters.memberAccount"
                  :placeholder="$t('game.betRecordsExtra.enterMemberOrId')"
                  clearable
                  size="small"
                  :input-props="{ style: 'text-align: center' }"
                >
                  <template #suffix>
                    <n-icon><SearchOutline /></n-icon>
                  </template>
                </n-input>
              </div>

              <div class="flex gap-2">
                <n-button
                  type="primary"
                  size="small"
                  :loading="statsLoading"
                  @click="handleStatsSearch"
                >
                  {{ $t('common.search') }}
                </n-button>
                <n-button size="small" @click="handleStatsReset">
                  {{ $t('common.reset') }}
                </n-button>
              </div>
            </div>

            <div
              v-if="statsData.summary"
              class="rounded bg-blue-50 p-2 text-sm text-gray-600"
            >
              {{ $t('game.betRecords.memberAccount') }}:
              <span class="font-semibold text-blue-600">{{
                statsFilters.memberAccount
              }}</span>
              &nbsp;|&nbsp; {{ $t('game.betRecordsExtra2.memberId') }}:
              <span class="font-semibold">{{
                statsData.userInfo?.userID || '-'
              }}</span>
              &nbsp;|&nbsp; {{ $t('game.betRecordsExtra2.memberCurrency') }}:
              <span class="font-semibold">{{
                statsData.userInfo?.currency || 'BRL'
              }}</span>
            </div>
          </div>
        </n-card>

        <template v-if="statsData.summary">
          <n-card :bordered="false" class="rounded-16px mb-4 shadow-sm">
            <template #header>
              <div class="flex items-center justify-between">
                <span class="font-semibold">{{ $t('game.betRecordsExtra2.typeSummary') }}</span>
                <div class="text-sm text-gray-600">
                  {{ $t('game.betRecordsExtra.recordCount', [statsData.byType?.length || 0]) }}
                </div>
              </div>
            </template>

            <n-data-table
              :columns="statsTypeColumns"
              :data="statsData.byType"
              :pagination="false"
              size="small"
              :scroll-x="1000"
              bordered
              striped
            />
          </n-card>

          <n-card :bordered="false" class="rounded-16px shadow-sm">
            <template #header>
              <div class="flex items-center justify-between">
                <span class="font-semibold">{{ $t('game.betRecordsExtra2.gameDetails') }}</span>
                <div class="text-sm text-gray-600">
                  {{ $t('game.betRecordsExtra.recordCount', [statsGameData.length]) }}
                </div>
              </div>
            </template>

            <n-data-table
              :columns="statsGameColumns"
              :data="statsGameData"
              :pagination="statsGamePagination"
              size="small"
              :scroll-x="1600"
              bordered
              striped
              :loading="statsLoading"
            />
          </n-card>
        </template>

        <n-card v-else :bordered="false" class="rounded-16px shadow-sm">
          <n-empty description="">
            <template #icon>
              <n-icon size="80" :component="Receipt" color="#d0d0d0" />
            </template>
            <template #extra>
              <div class="text-sm text-gray-500">
                {{ $t('game.betRecordsExtra2.statsEmptyHint') }}
              </div>
            </template>
          </n-empty>
        </n-card>
      </n-tab-pane>
    </n-tabs>

    <UserDetailModal
      v-model:visible="showUserDetailModal"
      :user-id="currentUserId"
      @refresh="loadData"
    />
  </Page>
</template>

<script setup lang="ts">
import { $t } from '@vben/locales';

import { ref, reactive, onMounted, h } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  NBreadcrumb,
  NBreadcrumbItem,
  NButton,
  NCard,
  NDataTable,
  NDatePicker,
  NDivider,
  NEmpty,
  NFormItem,
  NIcon,
  NInput,
  NInputNumber,
  NRadio,
  NRadioGroup,
  NSelect,
  NStatistic,
  NSwitch,
  NTabPane,
  NTabs,
  NTag,
  NTooltip,
  useMessage,
} from 'naive-ui';
// ✅ PERFORMANCE FIX: Lazy load components to avoid blocking page load
import { defineAsyncComponent } from 'vue';
const UserDetailModal = defineAsyncComponent(
  () => import('../../../components/user/UserDetailModal.vue'),
);
import {
  SearchOutline,
  RefreshOutline,
  DownloadOutline,
  TrendingUp,
  CheckmarkCircle,
  Sync,
  Receipt,
  HelpCircleOutline,
} from '@vicons/ionicons5';
import { Page } from '@vben/common-ui';
const SmartDataGrid = defineAsyncComponent(
  () => import('../../../components/smart/SmartDataGrid/index.vue'),
);
import { notification } from '#/adapter/naive';
import {
  getBetTransactionsApi,
  getBetTransactionStatisticsApi,
  getGameProvidersApi,
  getGameCategoriesApi,
  getBetTransactionTypesApi,
  type BetTransactionItem,
  type BetTransactionFilters,
} from '#/api/game/betTransactions';
import type { DataTableColumns } from 'naive-ui';
import {
  getGameCategoryLabel,
  getLocalizedGameName,
} from '#/utils/gameTypeI18n';

const route = useRoute();
const router = useRouter();
const message = useMessage();

const translateGameCategory = (category: string): string =>
  getGameCategoryLabel(category);

// State
const loading = ref(false);
const exporting = ref(false);
const activeTab = ref('details');
const showStatistics = ref(false);
const showUserDetailModal = ref(false);
const currentUserId = ref<number>(0);
const tableData = ref<BetTransactionItem[]>([]);
const dateRange = ref<[number, number] | null>(null);
const consolidateView = ref(false); // Default to consolidated view

// Statistics State
const statsLoading = ref(false);
const statsDateType = ref('week');
const statsDateRange = ref<[number, number] | null>(null);
const statsFilters = reactive({
  memberAccount: undefined as string | undefined,
});
const statsData = ref<{
  summary?: any;
  userInfo?: any;
  byType?: any[];
  byProvider?: any[];
  byCategory?: any[];
  byGame?: any[];
}>({});
const statsGameData = ref<any[]>([]);
const statsGamePagination = reactive({
  page: 1,
  pageSize: 20,
  showSizePicker: true,
  pageSizes: [10, 20, 50, 100],
});

// Filters
const filters = reactive<Partial<BetTransactionFilters>>({
  gameProvider: undefined,
  gameCategory: undefined,
  gameName: undefined,
  username: undefined,
  type: undefined,
  minAmount: undefined,
  maxAmount: undefined,
});

// Pagination
const paginationReactive = reactive({
  page: 1,
  pageSize: 20,
  total: 0,
  showSizePicker: true,
  pageSizes: [10, 20, 50, 100, 200],
});

// Totals
const pageTotals = ref({
  totalAmount: 0,
  totalValidBet: 0,
  totalTurnover: 0,
});

const statistics = ref({
  totalAmount: 0,
  totalValidBet: 0,
  totalTurnover: 0,
  count: 0,
});

// Filter Options
const providerOptions = ref<Array<{ label: string; value: string }>>([]);
const categoryOptions = ref<Array<{ label: string; value: string }>>([]);
const typeOptions = ref<Array<{ label: string; value: string }>>([]);

// Date Shortcuts
const dateShortcuts = {
  [$t('game.betRecordsExtra2.today')]: (): [number, number] => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return [now.getTime(), end.getTime()];
  },
  [$t('game.betRecordsExtra2.yesterday')]: (): [number, number] => {
    const now = new Date();
    now.setDate(now.getDate() - 1);
    now.setHours(0, 0, 0, 0);
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    return [now.getTime(), end.getTime()];
  },
  [$t('game.betRecordsExtra2.last7Days')]: (): [number, number] => {
    const now = new Date();
    now.setDate(now.getDate() - 6);
    now.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return [now.getTime(), end.getTime()];
  },
  [$t('game.betRecordsExtra2.last30Days')]: (): [number, number] => {
    const now = new Date();
    now.setDate(now.getDate() - 29);
    now.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return [now.getTime(), end.getTime()];
  },
  [$t('game.betRecordsExtra2.thisMonth')]: (): [number, number] => {
    const now = new Date();
    now.setDate(1);
    now.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return [now.getTime(), end.getTime()];
  },
  [$t('game.betRecordsExtra2.lastMonth')]: (): [number, number] => {
    const now = new Date();
    now.setMonth(now.getMonth() - 1);
    now.setDate(1);
    now.setHours(0, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    end.setHours(23, 59, 59, 999);
    return [now.getTime(), end.getTime()];
  },
};

// Table Columns
const columns: DataTableColumns<BetTransactionItem> = [
  {
    title: $t('game.betRecords.betId'),
    key: 'id',
    width: 180,
    fixed: 'left',
    ellipsis: {
      tooltip: true,
    },
  },
  {
    title: $t('game.betRecords.memberAccount'),
    key: 'user.account',
    width: 120,
    render: (row) => {
      const user = row.user || {};
      const account = user.account || 'N/A';
      const userId = user.id || row.userId;

      return h(
        'span',
        {
          class: 'font-semibold text-blue-600 cursor-pointer hover:underline',
          onClick: () => userId && handleUserClick(userId),
        },
        account,
      );
    },
  },
  {
    title: $t('game.betRecordsExtra2.memberId'),
    key: 'user.userID',
    width: 120,
    render: (row) => {
      const user = row.user || {};
      return user.userID || '-';
    },
  },
  {
    title: $t('game.betRecords.gamePlatform'),
    key: 'gameProvider',
    width: 120,
    render: (row) =>
      h(
        NTag,
        { type: 'info', size: 'small' },
        { default: () => row.gameProvider },
      ),
  },
  {
    title: $t('game.subgame.gameType'),
    key: 'gameCategory',
    width: 100,
    render: (row) =>
      h(
        NTag,
        { type: 'success', size: 'small' },
        { default: () => translateGameCategory(row.gameCategory) },
      ),
  },
  {
    title: $t('game.subgame.gameNameZh'),
    key: 'gameName',
    width: 150,
    ellipsis: {
      tooltip: true,
    },
    render: (row) =>
      getLocalizedGameName({
        gameName: row.gameName,
        gameNameEn: (row as any).gameNameEn,
      }),
  },
  {
    title: $t('game.subgame.gameId'),
    key: 'gameId',
    width: 120,
    ellipsis: {
      tooltip: true,
    },
  },
  {
    title: $t('game.betRecordsExtra.roundNo'),
    key: 'roundId',
    width: 150,
    ellipsis: {
      tooltip: true,
    },
  },
  {
    title: $t('game.betRecords.transactionType'),
    key: 'type',
    width: 120,
    render: (row) => {
      const typeMap: Record<string, { color: string; label: string }> = {
        bet_placed: { color: 'warning', label: $t('game.betRecordsExtra2.betPlaced') },
        bet_won: { color: 'success', label: $t('game.betRecordsExtra2.betWon') },
        bet_lost: { color: 'error', label: $t('game.betRecordsExtra2.betLost') },
        bet_draw: { color: 'info', label: $t('game.betRecordsExtra2.betDraw') },
        bet_cancelled: { color: 'default', label: $t('game.betRecordsExtra2.betCancelled') },
        bet_refunded: { color: 'info', label: $t('game.betRecordsExtra2.betRefunded') },
      };
      const config = typeMap[row.type] || { color: 'default', label: row.type };
      return h(
        NTag,
        { type: config.color as any, size: 'small' },
        { default: () => config.label },
      );
    },
  },
  {
    title: $t('game.betRecords.betAmount'),
    key: 'amount',
    width: 110,
    align: 'right',
    render: (row) => {
      // Show bet amount (always positive for consolidated view)
      const amount = row.consolidatedData
        ? row.consolidatedData.betAmount
        : Math.abs(row.amount);
      return h(
        'span',
        { class: 'font-semibold text-gray-800' },
        formatCurrency(amount),
      );
    },
  },
  {
    title: $t('game.betRecords.validBet'),
    key: 'validBet',
    width: 110,
    align: 'right',
    render: (row) =>
      h(
        'span',
        { class: 'font-semibold text-gray-800' },
        formatCurrency(row.validBet),
      ),
  },
  {
    title: $t('game.betRecordsExtra2.withholdingTax'),
    key: 'preTax',
    width: 100,
    align: 'right',
    render: () => h('span', { class: 'font-semibold text-gray-500' }, '0.00'),
  },
  {
    title: $t('game.betRecords.winLoss'),
    key: 'memberWinLoss',
    width: 120,
    align: 'right',
    render: (row) => {
      let netAmount = 0;

      if (row.consolidatedData) {
        // Consolidated view: use victory/defeat amount
        netAmount = row.consolidatedData.victoryDefeatAmount;
      } else {
        // Detailed view: calculate from transaction type
        if (row.type === 'bet_won') {
          netAmount = Number(row.amount);
        } else if (row.type === 'bet_lost') {
          netAmount = -Math.abs(Number(row.validBet || row.amount));
        } else if (row.type === 'bet_draw') {
          netAmount = 0;
        } else {
          netAmount = Number(row.amount);
        }
      }

      const isWin = netAmount > 0;
      const isLoss = netAmount < 0;

      return h(
        'span',
        {
          class: isWin
            ? 'text-red-600 font-bold text-base'
            : isLoss
              ? 'text-green-600 font-bold text-base'
              : 'text-gray-600 font-semibold',
        },
        formatCurrency(netAmount),
      );
    },
  },
  {
    title: $t('game.betRecordsExtra2.turnover'),
    key: 'turnover',
    width: 100,
    align: 'right',
    render: (row) =>
      h(
        'span',
        { class: 'font-semibold text-gray-600' },
        formatCurrency(row.turnover),
      ),
  },
  {
    title: $t('game.betRecords.balanceBefore'),
    key: 'balanceBefore',
    width: 120,
    align: 'right',
    render: (row) => formatCurrency(row.balanceBefore),
  },
  {
    title: $t('game.betRecords.balanceAfter'),
    key: 'balanceAfter',
    width: 120,
    align: 'right',
    render: (row) => formatCurrency(row.balanceAfter),
  },
  {
    title: $t('common.currency'),
    key: 'currency',
    width: 80,
    align: 'center',
  },
  {
    title: $t('game.betRecordsExtra2.odds'),
    key: 'odds',
    width: 100,
    align: 'right',
    render: (row) => (row.odds ? Number(row.odds).toFixed(2) : '-'),
  },
  {
    title: $t('game.betRecordsExtra2.betTime'),
    key: 'createdAt',
    width: 160,
    render: (row) => formatDateTime(row.createdAt),
  },
  {
    title: $t('game.betRecordsExtra2.description'),
    key: 'description',
    width: 200,
    ellipsis: {
      tooltip: true,
    },
  },
];

// Methods
const loadData = async () => {
  loading.value = true;
  try {
    const params: BetTransactionFilters = {
      page: paginationReactive.page,
      pageSize: paginationReactive.pageSize,
      consolidate: consolidateView.value,
      // Only exclude bet_placed when consolidating (consolidation creates proper results)
      excludeBetPlaced: consolidateView.value,
      ...filters,
    };

    // Add date range (preserve user-selected start/end time, do not force 23:59:59)
    if (dateRange.value) {
      params.startDate = new Date(dateRange.value[0]).toISOString();
      params.endDate = new Date(dateRange.value[1]).toISOString();
    }

    const response = await getBetTransactionsApi(params);

    console.log(
      '📊 [BetRecords] Raw API Response:',
      JSON.stringify(response, null, 2),
    );
    console.log('📊 [BetRecords] Response type:', typeof response);
    console.log('📊 [BetRecords] Has list?', !!(response as any)?.list);
    console.log(
      '📊 [BetRecords] Has data.list?',
      !!(response as any)?.data?.list,
    );

    // Response interceptor should unwrap {code: 0, data: {...}} to just {...}
    // But handle both cases to be safe
    let responseData: any = response;

    // Check if response is wrapped in a data property
    if (response && (response as any).data) {
      // Check if it's {code: 0, data: {...}} format
      if ((response as any).code === 0 && (response as any).data) {
        responseData = (response as any).data;
        console.log('📊 [BetRecords] Unwrapped {code: 0, data: {...}} format');
      }
      // Check if it's {data: {...}} format
      else if ((response as any).data && (response as any).data.list) {
        responseData = (response as any).data;
        console.log('📊 [BetRecords] Unwrapped {data: {...}} format');
      }
    }

    // Now responseData should be {list: [...], pagination: {...}, ...}
    const list = responseData?.list || responseData?.data?.list || [];
    const pagination =
      responseData?.pagination || responseData?.data?.pagination;
    const pageTotalsData =
      responseData?.pageTotals || responseData?.data?.pageTotals;
    const overallTotalsData =
      responseData?.overallTotals || responseData?.data?.overallTotals;

    console.log('📊 [BetRecords] Extracted list length:', list.length);
    console.log('📊 [BetRecords] Extracted pagination:', pagination);
    console.log('📊 [BetRecords] Consolidate view:', consolidateView.value);

    if (Array.isArray(list) && list.length > 0) {
      let displayList = [...list]; // Create a copy to avoid mutating original

      // If NOT consolidating, filter out bet_placed on frontend
      // (Can't do it backend due to pagination, and some providers don't send bet_lost)
      if (!consolidateView.value) {
        // Keep bet_placed for now, but mark losses properly
        displayList = list.map((item) => {
          // If it's a bet_placed with no corresponding bet_won, treat as loss
          if (item.type === 'bet_placed') {
            return {
              ...item,
              type: 'bet_lost', // Convert to lost for display
              consolidatedData: {
                betAmount: Math.abs(item.amount),
                winAmount: 0,
                victoryDefeatAmount: item.amount,
                netAmount: item.amount,
                transactionCount: 1,
                status: 'lost',
                originalTransactions: [],
              },
            };
          }
          return item;
        });
      }

      console.log(
        '📊 [BetRecords] Final displayList length:',
        displayList.length,
      );
      console.log(
        '📊 [BetRecords] First 3 items:',
        displayList.slice(0, 3).map((item) => ({
          id: item.id,
          type: item.type,
          amount: item.amount,
        })),
      );

      tableData.value = displayList;
      paginationReactive.total = pagination?.total || 0;
      pageTotals.value = pageTotalsData || {
        totalAmount: 0,
        totalValidBet: 0,
        totalTurnover: 0,
      };
      statistics.value = overallTotalsData || {
        totalAmount: 0,
        totalValidBet: 0,
        totalTurnover: 0,
        count: 0,
      };
      showStatistics.value = true;
    } else {
      console.warn('⚠️ [BetRecords] No valid list found in response');
      console.warn('⚠️ [BetRecords] Response structure:', responseData);
      tableData.value = [];
      // Still set pagination and totals if they exist (for summary cards)
      if (pagination) {
        paginationReactive.total = pagination.total || 0;
      }
      if (pageTotalsData) {
        pageTotals.value = pageTotalsData;
      }
      if (overallTotalsData) {
        statistics.value = overallTotalsData;
        showStatistics.value = true;
      }
    }
  } catch (error) {
    console.error('Error loading bet transactions:', error);
    notification.error({
      content: $t('game.betRecordsExtra2.loadBetRecordsFailedMsg'),
      duration: 3000,
    });
  } finally {
    loading.value = false;
  }
};

const loadFilterOptions = async () => {
  try {
    const [providers, categories, types] = await Promise.all([
      getGameProvidersApi(),
      getGameCategoriesApi(),
      getBetTransactionTypesApi(),
    ]);

    // Response interceptor unwraps the data
    if (providers && Array.isArray(providers)) {
      providerOptions.value = providers.map((p) => ({ label: p, value: p }));
    }

    if (categories && Array.isArray(categories)) {
      // 🎯 FIX: Use Chinese labels for game categories
      categoryOptions.value = categories.map((c) => ({
        label: translateGameCategory(c),
        value: c,
      }));
    }

    if (types && Array.isArray(types)) {
      const typeLabels: Record<string, string> = {
        bet_placed: $t('game.betRecordsExtra2.betPlaced'),
        bet_won: $t('game.betRecordsExtra2.betWon'),
        bet_lost: $t('game.betRecordsExtra2.betLost'),
        bet_draw: $t('game.betRecordsExtra2.betDraw'),
        bet_cancelled: $t('game.betRecordsExtra2.betCancelled'),
        bet_refunded: $t('game.betRecordsExtra2.betRefunded'),
      };
      typeOptions.value = types.map((t) => ({
        label: typeLabels[t] || t,
        value: t,
      }));
    }
  } catch (error) {
    console.error('Error loading filter options:', error);
  }
};

const handleDateRangeUpdate = (value: [number, number] | null) => {
  // Preserve user-selected end time (datetimerange), do not override to 23:59:59
  dateRange.value = value;
};

const handleStatsDateRangeUpdate = (value: [number, number] | null) => {
  // Preserve user-selected end time (datetimerange), do not override to 23:59:59
  statsDateRange.value = value;
};

const handleSearch = () => {
  paginationReactive.page = 1;
  loadData();
};

const handleReset = () => {
  Object.keys(filters).forEach((key) => {
    filters[key as keyof typeof filters] = undefined;
  });
  dateRange.value = null;
  consolidateView.value = false; // Reset to default consolidated view
  paginationReactive.page = 1;
  loadData();
};

const handleConsolidateChange = () => {
  paginationReactive.page = 1; // Reset to first page when toggling
  loadData();
};

const handleExport = async () => {
  exporting.value = true;
  try {
    // TODO: Implement export functionality
    message.info($t('game.betRecordsExtra2.exportDeveloping'));
  } catch (error) {
    console.error('Error exporting:', error);
    notification.error({
      content: $t('game.betRecords.exportFailed'),
      duration: 3000,
    });
  } finally {
    exporting.value = false;
  }
};

const handlePageChange = (page: number) => {
  paginationReactive.page = page;
  loadData();
};

const handlePageSizeChange = (pageSize: number) => {
  paginationReactive.pageSize = pageSize;
  paginationReactive.page = 1;
  loadData();
};

const handleTabChange = (value: string) => {
  router.push({
    path: route.path,
    query: {
      ...route.query,
      tab: value,
    },
  });
};

const handleUserClick = (userId: number) => {
  currentUserId.value = userId;
  showUserDetailModal.value = true;
};

// Statistics Table Columns
const statsTypeColumns: DataTableColumns<any> = [
  {
    title: $t('game.betRecordsExtra2.type'),
    key: 'type',
    width: 150,
    render: (row) => {
      // Map game categories to Chinese names
      const categoryMap: Record<string, string> = {
        SLOT: $t('game.statisticsExtra.typeSlotShort'),
        FISHING: $t('game.betRecordsExtra2.typeFishing'),
        fishing: $t('game.statisticsExtra.typeHuntingShort'),
        LIVE: $t('game.statisticsExtra.typeLiveShort'),
        SPORT: $t('game.betRecordsExtra2.typeSport'),
        LOTTERY: $t('game.statisticsExtra.typeLotteryShort'),
        POKER: $t('game.betRecordsExtra2.typePoker'),
        TABLE: $t('game.betRecordsExtra2.typeTable'),
        ARCADE: $t('game.statisticsExtra.typeArcadeShort'),
      };
      const label = categoryMap[row.type] || row.type || row.category || '-';
      return h(NTag, { type: 'info', size: 'small' }, { default: () => label });
    },
  },
  {
    title: $t('game.betRecordsExtra2.totalBetCount'),
    key: 'count',
    width: 120,
    align: 'right',
    render: (row) => h('span', { class: 'font-semibold' }, row.count || 0),
  },
  {
    title: $t('game.betRecordsExtra2.totalBetAmount'),
    key: 'totalAmount',
    width: 150,
    align: 'right',
    render: (row) =>
      h(
        'span',
        { class: 'text-blue-600 font-semibold' },
        formatCurrency(Math.abs(row.totalAmount || row.amount || 0)),
      ),
  },
  {
    title: $t('game.betRecordsExtra2.totalValidBet'),
    key: 'totalValidBet',
    width: 150,
    align: 'right',
    render: (row) =>
      h(
        'span',
        { class: 'text-green-600 font-semibold' },
        formatCurrency(Math.abs(row.totalValidBet || row.validBet || 0)),
      ),
  },
  {
    title: $t('game.betRecordsExtra2.withholdingTax'),
    key: 'preTax',
    width: 120,
    align: 'right',
    render: () => h('span', { class: 'font-semibold' }, '0.00'),
  },
  {
    title: $t('game.betRecords.winLoss'),
    key: 'memberWinLoss',
    width: 150,
    align: 'right',
    render: (row) => {
      const value = row.memberWinLoss || 0;
      const isPositive = Number(value) >= 0;
      return h(
        'span',
        {
          class: isPositive
            ? 'text-green-600 font-semibold'
            : 'text-red-600 font-semibold',
        },
        formatCurrency(value),
      );
    },
  },
  {
    title: $t('game.betRecordsExtra2.orderShare'),
    key: 'occupiedCount',
    width: 120,
    align: 'right',
    render: (row) =>
      h(
        'span',
        { class: 'font-semibold' },
        row.occupiedCount || row.count || 0,
      ),
  },
  {
    title: $t('game.betRecordsExtra2.profitRatio'),
    key: 'profitRatio',
    width: 120,
    align: 'right',
    render: (row) => {
      const ratio = row.profitRatio || 0;
      const isPositive = Number(ratio) >= 0;
      return h(
        'span',
        {
          class: isPositive
            ? 'text-green-600 font-semibold'
            : 'text-red-600 font-semibold',
        },
        `${Number(ratio).toFixed(2)}%`,
      );
    },
  },
];

const statsGameColumns: DataTableColumns<any> = [
  {
    title: $t('common.platform'),
    key: 'gameProvider',
    width: 100,
    fixed: 'left',
    render: (row) =>
      h(
        NTag,
        { type: 'info', size: 'small' },
        { default: () => row.gameProvider || '-' },
      ),
  },
  {
    title: $t('game.betRecordsExtra2.category'),
    key: 'gameCategory',
    width: 100,
    render: (row) => {
      const categoryMap: Record<string, string> = {
        SLOT: $t('game.statisticsExtra.typeSlotShort'),
        FISHING: $t('game.betRecordsExtra2.typeFishing'),
        LIVE: $t('game.statisticsExtra.typeLiveShort'),
        SPORT: $t('game.betRecordsExtra2.typeSport'),
        LOTTERY: $t('game.statisticsExtra.typeLotteryShort'),
        POKER: $t('game.betRecordsExtra2.typePoker'),
        TABLE: $t('game.betRecordsExtra2.typeTable'),
        ARCADE: $t('game.statisticsExtra.typeArcadeShort'),
      };
      const label = categoryMap[row.gameCategory] || row.gameCategory || '-';
      return h(
        NTag,
        { type: 'success', size: 'small' },
        { default: () => label },
      );
    },
  },
  {
    title: $t('game.subgame.gameNameZh'),
    key: 'gameName',
    width: 180,
    ellipsis: { tooltip: true },
    render: (row) => h('span', { class: 'font-medium' }, row.gameName || '-'),
  },
  {
    title: $t('game.betRecordsExtra2.betCount'),
    key: 'betCount',
    width: 100,
    align: 'right',
    render: (row) =>
      h('span', { class: 'font-semibold' }, row.count || row.betCount || 0),
  },
  {
    title: $t('game.betRecords.betAmount'),
    key: 'betAmount',
    width: 140,
    align: 'right',
    render: (row) =>
      h(
        'span',
        { class: 'text-blue-600 font-semibold' },
        formatCurrency(Math.abs(row.amount || row.betAmount || 0)),
      ),
  },
  {
    title: $t('game.betRecords.validBet'),
    key: 'validBet',
    width: 140,
    align: 'right',
    render: (row) =>
      h(
        'span',
        { class: 'text-green-600 font-semibold' },
        formatCurrency(Math.abs(row.validBet || 0)),
      ),
  },
  {
    title: $t('game.betRecordsExtra2.withholdingTax'),
    key: 'preTax',
    width: 120,
    align: 'right',
    render: () => h('span', { class: 'font-semibold' }, '0.00'),
  },
  {
    title: $t('game.betRecords.winLoss'),
    key: 'memberWinLoss',
    width: 140,
    align: 'right',
    render: (row) => {
      const value = row.memberWinLoss || 0;
      const isPositive = Number(value) >= 0;
      return h(
        'span',
        {
          class: isPositive
            ? 'text-green-600 font-semibold'
            : 'text-red-600 font-semibold',
        },
        formatCurrency(value),
      );
    },
  },
  {
    title: $t('game.betRecordsExtra2.profitRatio'),
    key: 'profitRatio',
    width: 100,
    align: 'right',
    render: (row) => {
      const ratio = row.profitRatio || 0;
      const isPositive = Number(ratio) >= 0;
      return h(
        'span',
        {
          class: isPositive
            ? 'text-green-600 font-semibold'
            : 'text-red-600 font-semibold',
        },
        `${Number(ratio).toFixed(2)}%`,
      );
    },
  },
];

// Statistics Methods
const handleStatsDateTypeChange = (value: string) => {
  // Update date range based on selected type
  if (value === 'day') {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    statsDateRange.value = [now.getTime(), end.getTime()];
  } else if (value === 'week') {
    const now = new Date();
    now.setDate(now.getDate() - 6);
    now.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    statsDateRange.value = [now.getTime(), end.getTime()];
  } else if (value === 'month') {
    const now = new Date();
    now.setDate(now.getDate() - 29);
    now.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    statsDateRange.value = [now.getTime(), end.getTime()];
  }
};

const handleStatsSearch = async () => {
  if (!statsFilters.memberAccount || statsFilters.memberAccount.trim() === '') {
    message.warning($t('game.betRecordsExtra2.enterMemberAccount'));
    return;
  }

  statsLoading.value = true;
  try {
    const params: any = {
      username: statsFilters.memberAccount,
    };

    // Add date range if selected
    if (statsDateRange.value) {
      params.startDate = new Date(statsDateRange.value[0]).toISOString();
      params.endDate = new Date(statsDateRange.value[1]).toISOString();
    }

    const response = await getBetTransactionStatisticsApi(params);

    if (response) {
      // Group by category (SLOT, FISHING, etc.)
      const categoryMap = new Map<string, any>();

      if (response.byCategory && Array.isArray(response.byCategory)) {
        response.byCategory.forEach((category: any) => {
          const key = category.category;
          if (!categoryMap.has(key)) {
            categoryMap.set(key, {
              type: key,
              count: 0,
              totalAmount: 0,
              totalValidBet: 0,
              preTax: 0,
              memberWinLoss: 0,
              occupiedCount: 0,
              profitRatio: 0,
            });
          }
          const item = categoryMap.get(key)!;
          item.count += category.count || 0;
          item.totalAmount += Number(category.amount || 0);
          item.totalValidBet += Number(category.validBet || 0);
          item.occupiedCount += category.count || 0;
          item.memberWinLoss += Number(category.memberWinLoss || 0);
          // Calculate profit ratio: (memberWinLoss / totalValidBet) * 100
          if (item.totalValidBet > 0) {
            item.profitRatio = (item.memberWinLoss / item.totalValidBet) * 100;
          }
        });
      }

      statsData.value = {
        summary: response.totals,
        userInfo: response.userInfo || {
          userID: statsFilters.memberAccount,
          currency: 'BRL',
        },
        byType: Array.from(categoryMap.values()),
        byProvider: response.byProvider,
        byCategory: response.byCategory,
        byGame: response.byGame || [],
      };

      // Prepare game detail data from byGame
      statsGameData.value = (response.byGame || []).map((game: any) => ({
        gameProvider: game.provider,
        gameCategory: game.category,
        gameName: game.gameName,
        count: game.count || 0,
        betCount: game.count || 0,
        amount: Number(game.amount || 0),
        betAmount: Number(game.amount || 0),
        validBet: Number(game.validBet || 0),
        preTax: 0,
        memberWinLoss: game.memberWinLoss || 0,
        profitRatio: game.profitRatio || 0,
      }));

      message.success($t('game.betRecordsExtra2.querySuccess'));
    }
  } catch (error) {
    console.error('Error loading bet statistics:', error);
    notification.error({
      content: $t('game.betRecordsExtra2.loadStatsFailed'),
      duration: 3000,
    });
  } finally {
    statsLoading.value = false;
  }
};

const handleStatsReset = () => {
  statsFilters.memberAccount = undefined;
  statsDateType.value = 'week';
  // Set default week range
  const now = new Date();
  now.setDate(now.getDate() - 6);
  now.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  statsDateRange.value = [now.getTime(), end.getTime()];
  statsData.value = {};
  statsGameData.value = [];
  statsGamePagination.page = 1;
};

// Utility Functions
const formatCurrency = (value: number | string | null): string => {
  if (value === null || value === undefined) return '0.00';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return num.toFixed(2);
};

const formatDateTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
};

// Lifecycle
onMounted(() => {
  // Initialize tab from URL
  const tab = route.query.tab as string;
  if (tab && ['details', 'statistics'].includes(tab)) {
    activeTab.value = tab;
  }

  // Check if user filter is passed from UserDetailModal
  const userAccount = route.query.userAccount as string;
  const userName = route.query.userName as string;
  if (userAccount) {
    filters.username = userAccount;
    message.success($t('game.betRecordsExtra2.filteredUser', [userName || userAccount]));
  }

  // Set default date range to today for details tab
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  dateRange.value = [now.getTime(), end.getTime()];

  // Set default week range for statistics tab
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 6);
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date();
  weekEnd.setHours(23, 59, 59, 999);
  statsDateRange.value = [weekStart.getTime(), weekEnd.getTime()];

  loadFilterOptions();
  loadData();
});
</script>

<style scoped>
.filter-section {
  padding: 8px 0;
}

.filter-item {
  width: 100%;
}

.filter-item :deep(.n-form-item) {
  margin-bottom: 0;
}

.filter-item :deep(.n-form-item-label) {
  font-size: 13px;
  font-weight: 500;
  color: #333;
}

.bet-records-table :deep(.n-data-table-th) {
  font-weight: 600;
  background-color: #f8f9fa;
}

.bet-records-table :deep(.n-data-table-td) {
  font-size: 13px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
