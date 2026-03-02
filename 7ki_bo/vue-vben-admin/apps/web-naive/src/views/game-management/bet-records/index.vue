<template>
  <Page title="投注记录" description="游戏投注交易记录查询">
    <!-- Breadcrumb -->
    <div class="mb-4">
      <n-breadcrumb>
        <n-breadcrumb-item>游戏管理</n-breadcrumb-item>
        <n-breadcrumb-item>投注记录</n-breadcrumb-item>
      </n-breadcrumb>
    </div>

    <!-- Tabs -->
    <n-tabs
      v-model:value="activeTab"
      type="line"
      animated
      @update:value="handleTabChange"
    >
      <n-tab-pane name="details" tab="投注明细">
        <!-- Filter Card -->
        <n-card :bordered="false" class="rounded-16px mb-4 shadow-sm">
          <div class="filter-section">
            <!-- Row 1: Date Range and Basic Filters -->
            <div
              class="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4"
            >
              <!-- Date Range -->
              <div class="filter-item">
                <n-form-item label="投注时间">
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

              <!-- Game Provider -->
              <div class="filter-item">
                <n-form-item label="游戏平台">
                  <n-select
                    v-model:value="filters.gameProvider"
                    placeholder="请选择游戏平台"
                    clearable
                    size="small"
                    :options="providerOptions"
                    filterable
                  />
                </n-form-item>
              </div>

              <!-- Game Category -->
              <div class="filter-item">
                <n-form-item label="游戏类型">
                  <n-select
                    v-model:value="filters.gameCategory"
                    placeholder="请选择游戏类型"
                    clearable
                    size="small"
                    :options="categoryOptions"
                    filterable
                  />
                </n-form-item>
              </div>

              <!-- Transaction Type -->
              <div class="filter-item">
                <n-form-item label="交易类型">
                  <n-select
                    v-model:value="filters.type"
                    placeholder="请选择交易类型"
                    clearable
                    size="small"
                    :options="typeOptions"
                  />
                </n-form-item>
              </div>
            </div>

            <!-- Row 2: Search Filters -->
            <div
              class="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4"
            >
              <!-- Game Name -->
              <div class="filter-item">
                <n-form-item label="游戏名称">
                  <n-input
                    v-model:value="filters.gameName"
                    placeholder="请输入游戏名称"
                    clearable
                    size="small"
                  />
                </n-form-item>
              </div>

              <!-- User Account -->
              <div class="filter-item">
                <n-form-item label="会员账号">
                  <n-input
                    v-model:value="filters.username"
                    placeholder="请输入会员账号或ID"
                    clearable
                    size="small"
                  />
                </n-form-item>
              </div>

              <!-- Min Amount -->
              <div class="filter-item">
                <n-form-item label="最小金额">
                  <n-input-number
                    v-model:value="filters.minAmount"
                    placeholder="最小金额"
                    clearable
                    size="small"
                    :precision="2"
                    :show-button="false"
                    style="width: 100%"
                  />
                </n-form-item>
              </div>

              <!-- Max Amount -->
              <div class="filter-item">
                <n-form-item label="最大金额">
                  <n-input-number
                    v-model:value="filters.maxAmount"
                    placeholder="最大金额"
                    clearable
                    size="small"
                    :precision="2"
                    :show-button="false"
                    style="width: 100%"
                  />
                </n-form-item>
              </div>
            </div>

            <!-- Action Buttons -->
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
                  搜索
                </n-button>
                <n-button @click="handleReset">
                  <template #icon>
                    <n-icon><RefreshOutline /></n-icon>
                  </template>
                  重置
                </n-button>
                <n-button @click="handleExport" :loading="exporting">
                  <template #icon>
                    <n-icon><DownloadOutline /></n-icon>
                  </template>
                  导出
                </n-button>

                <!-- Consolidation Toggle -->
                <n-divider vertical />
                <div class="flex items-center gap-2">
                  <span class="text-sm text-gray-600">合并显示:</span>
                  <n-switch
                    v-model:value="consolidateView"
                    @update:value="handleConsolidateChange"
                    size="small"
                  >
                    <template #checked>按局</template>
                    <template #unchecked>明细</template>
                  </n-switch>
                  <n-tooltip trigger="hover">
                    <template #trigger>
                      <n-icon size="16" class="cursor-help text-gray-400">
                        <HelpCircleOutline />
                      </n-icon>
                    </template>
                    开启后：每局游戏显示为一行（投注+结果）<br />
                    关闭后：显示所有交易明细（下注、中奖分开）
                  </n-tooltip>
                </div>
              </div>
              <div class="text-sm text-gray-600">
                共 {{ paginationReactive.total }} 条记录
              </div>
            </div>
          </div>
        </n-card>

        <!-- Statistics Cards -->
        <div
          class="mb-4 grid grid-cols-1 gap-4 md:grid-cols-4"
          v-if="showStatistics"
        >
          <n-card :bordered="false" class="rounded-16px shadow-sm">
            <n-statistic label="总投注金额" :value="statistics.totalAmount">
              <template #prefix>
                <n-icon color="#18a058"><TrendingUp /></n-icon>
              </template>
            </n-statistic>
          </n-card>
          <n-card :bordered="false" class="rounded-16px shadow-sm">
            <n-statistic label="有效投注" :value="statistics.totalValidBet">
              <template #prefix>
                <n-icon color="#2080f0"><CheckmarkCircle /></n-icon>
              </template>
            </n-statistic>
          </n-card>
          <n-card :bordered="false" class="rounded-16px shadow-sm">
            <n-statistic label="流水" :value="statistics.totalTurnover">
              <template #prefix>
                <n-icon color="#f0a020"><Sync /></n-icon>
              </template>
            </n-statistic>
          </n-card>
          <n-card :bordered="false" class="rounded-16px shadow-sm">
            <n-statistic label="交易笔数" :value="statistics.count">
              <template #prefix>
                <n-icon color="#d03050"><Receipt /></n-icon>
              </template>
            </n-statistic>
          </n-card>
        </div>

        <!-- Data Table -->
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
                  <span class="font-semibold">页面合计：</span>
                  投注金额:
                  <span class="font-semibold text-gray-800">{{
                    formatCurrency(Math.abs(pageTotals.totalAmount))
                  }}</span>
                  &nbsp;|&nbsp; 有效投注:
                  <span class="font-semibold text-gray-800">{{
                    formatCurrency(pageTotals.totalValidBet)
                  }}</span>
                  &nbsp;|&nbsp; 预扣税:
                  <span class="font-semibold text-gray-500">0.00</span>
                  &nbsp;|&nbsp; 会员输赢:
                  <span
                    :class="
                      pageTotals.totalAmount >= 0
                        ? 'font-bold text-red-600'
                        : 'font-bold text-green-600'
                    "
                    >{{ formatCurrency(pageTotals.totalAmount) }}</span
                  >
                  &nbsp;|&nbsp; 流水:
                  <span class="font-semibold text-gray-600">{{
                    formatCurrency(pageTotals.totalTurnover)
                  }}</span>
                </div>
              </div>
            </n-card>
          </template>
        </SmartDataGrid>
      </n-tab-pane>

      <n-tab-pane name="statistics" tab="投注统计">
        <!-- Statistics Filter Card -->
        <n-card :bordered="false" class="rounded-16px mb-4 shadow-sm">
          <div class="filter-section">
            <!-- Date Range and Search Filters -->
            <div class="mb-4 flex flex-wrap items-start gap-3">
              <!-- Date Type Selector -->
              <div class="flex items-center gap-2">
                <n-radio-group
                  v-model:value="statsDateType"
                  size="small"
                  @update:value="handleStatsDateTypeChange"
                >
                  <n-radio value="day">日</n-radio>
                  <n-radio value="week">周</n-radio>
                  <n-radio value="month">月</n-radio>
                </n-radio-group>
              </div>

              <!-- Date Range Picker -->
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

              <!-- Member Account (Required) -->
              <div style="min-width: 200px">
                <n-input
                  v-model:value="statsFilters.memberAccount"
                  placeholder="会员账号或ID"
                  clearable
                  size="small"
                  :input-props="{ style: 'text-align: center' }"
                >
                  <template #suffix>
                    <n-icon><SearchOutline /></n-icon>
                  </template>
                </n-input>
              </div>

              <!-- Search & Reset Buttons -->
              <div class="flex gap-2">
                <n-button
                  type="primary"
                  size="small"
                  :loading="statsLoading"
                  @click="handleStatsSearch"
                >
                  搜索
                </n-button>
                <n-button size="small" @click="handleStatsReset">
                  重置
                </n-button>
              </div>
            </div>

            <!-- Summary Info -->
            <div
              v-if="statsData.summary"
              class="rounded bg-blue-50 p-2 text-sm text-gray-600"
            >
              会员账号:
              <span class="font-semibold text-blue-600">{{
                statsFilters.memberAccount
              }}</span>
              &nbsp;|&nbsp; 会员ID:
              <span class="font-semibold">{{
                statsData.userInfo?.userID || '-'
              }}</span>
              &nbsp;|&nbsp; 会员币种:
              <span class="font-semibold">{{
                statsData.userInfo?.currency || 'BRL'
              }}</span>
            </div>
          </div>
        </n-card>

        <!-- Statistics Content -->
        <template v-if="statsData.summary">
          <!-- Summary by Type Table -->
          <n-card :bordered="false" class="rounded-16px mb-4 shadow-sm">
            <template #header>
              <div class="flex items-center justify-between">
                <span class="font-semibold">类型汇总</span>
                <div class="text-sm text-gray-600">
                  总计 {{ statsData.byType?.length || 0 }} 条记录
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

          <!-- Detail by Game Table -->
          <n-card :bordered="false" class="rounded-16px shadow-sm">
            <template #header>
              <div class="flex items-center justify-between">
                <span class="font-semibold">游戏明细</span>
                <div class="text-sm text-gray-600">
                  共 {{ statsGameData.length }} 条记录
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

        <!-- Empty State -->
        <n-card v-else :bordered="false" class="rounded-16px shadow-sm">
          <n-empty description="">
            <template #icon>
              <n-icon size="80" :component="Receipt" color="#d0d0d0" />
            </template>
            <template #extra>
              <div class="text-sm text-gray-500">
                提示：必须输入会员账号或ID才能查询统计数据
              </div>
            </template>
          </n-empty>
        </n-card>
      </n-tab-pane>
    </n-tabs>

    <!-- User Detail Modal -->
    <UserDetailModal
      v-model:visible="showUserDetailModal"
      :user-id="currentUserId"
      @refresh="loadData"
    />
  </Page>
</template>

<script setup lang="ts">
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

const route = useRoute();
const router = useRouter();
const message = useMessage();

// Game category translation map
const gameCategoryLabels: Record<string, string> = {
  arcade: '街机',
  SLOT: '电子',
  fishing: '捕鱼',
  sports: '体育',
  LIVE: '真人',
  BLOCKCHAIN: '区块链',
  card: '棋牌',
};

// Helper function to translate game category
const translateGameCategory = (category: string): string => {
  return gameCategoryLabels[category] || category;
};

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
  今天: (): [number, number] => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return [now.getTime(), end.getTime()];
  },
  昨天: (): [number, number] => {
    const now = new Date();
    now.setDate(now.getDate() - 1);
    now.setHours(0, 0, 0, 0);
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    return [now.getTime(), end.getTime()];
  },
  最近7天: (): [number, number] => {
    const now = new Date();
    now.setDate(now.getDate() - 6);
    now.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return [now.getTime(), end.getTime()];
  },
  最近30天: (): [number, number] => {
    const now = new Date();
    now.setDate(now.getDate() - 29);
    now.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return [now.getTime(), end.getTime()];
  },
  本月: (): [number, number] => {
    const now = new Date();
    now.setDate(1);
    now.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return [now.getTime(), end.getTime()];
  },
  上月: (): [number, number] => {
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
    title: '注单编号',
    key: 'id',
    width: 180,
    fixed: 'left',
    ellipsis: {
      tooltip: true,
    },
  },
  {
    title: '会员账号',
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
    title: '会员ID',
    key: 'user.userID',
    width: 120,
    render: (row) => {
      const user = row.user || {};
      return user.userID || '-';
    },
  },
  {
    title: '游戏平台',
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
    title: '游戏类型',
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
    title: '游戏名称',
    key: 'gameName',
    width: 150,
    ellipsis: {
      tooltip: true,
    },
  },
  {
    title: '游戏ID',
    key: 'gameId',
    width: 120,
    ellipsis: {
      tooltip: true,
    },
  },
  {
    title: '局号',
    key: 'roundId',
    width: 150,
    ellipsis: {
      tooltip: true,
    },
  },
  {
    title: '交易类型',
    key: 'type',
    width: 120,
    render: (row) => {
      const typeMap: Record<string, { color: string; label: string }> = {
        bet_placed: { color: 'warning', label: '下注' },
        bet_won: { color: 'success', label: '中奖' },
        bet_lost: { color: 'error', label: '输' },
        bet_draw: { color: 'info', label: '平局' },
        bet_cancelled: { color: 'default', label: '取消' },
        bet_refunded: { color: 'info', label: '退款' },
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
    title: '投注金额',
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
    title: '有效投注',
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
    title: '预扣税',
    key: 'preTax',
    width: 100,
    align: 'right',
    render: () => h('span', { class: 'font-semibold text-gray-500' }, '0.00'),
  },
  {
    title: '会员输赢',
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
    title: '流水',
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
    title: '投注前余额',
    key: 'balanceBefore',
    width: 120,
    align: 'right',
    render: (row) => formatCurrency(row.balanceBefore),
  },
  {
    title: '投注后余额',
    key: 'balanceAfter',
    width: 120,
    align: 'right',
    render: (row) => formatCurrency(row.balanceAfter),
  },
  {
    title: '币种',
    key: 'currency',
    width: 80,
    align: 'center',
  },
  {
    title: '赔率',
    key: 'odds',
    width: 100,
    align: 'right',
    render: (row) => (row.odds ? Number(row.odds).toFixed(2) : '-'),
  },
  {
    title: '投注时间',
    key: 'createdAt',
    width: 160,
    render: (row) => formatDateTime(row.createdAt),
  },
  {
    title: '描述',
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
      content: '加载投注记录失败',
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
        bet_placed: '下注',
        bet_won: '中奖',
        bet_lost: '输',
        bet_draw: '平局',
        bet_cancelled: '取消',
        bet_refunded: '退款',
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
    message.info('导出功能开发中...');
  } catch (error) {
    console.error('Error exporting:', error);
    notification.error({
      content: '导出失败',
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
    title: '类型',
    key: 'type',
    width: 150,
    render: (row) => {
      // Map game categories to Chinese names
      const categoryMap: Record<string, string> = {
        SLOT: '电子',
        FISHING: '捕鱼',
        fishing: '捕鱼',
        LIVE: '真人',
        SPORT: '体育',
        LOTTERY: '彩票',
        POKER: '扑克',
        TABLE: '桌游',
        ARCADE: '街机',
      };
      const label = categoryMap[row.type] || row.type || row.category || '-';
      return h(NTag, { type: 'info', size: 'small' }, { default: () => label });
    },
  },
  {
    title: '总注单量',
    key: 'count',
    width: 120,
    align: 'right',
    render: (row) => h('span', { class: 'font-semibold' }, row.count || 0),
  },
  {
    title: '总投注金额',
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
    title: '总有效投注',
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
    title: '预扣税',
    key: 'preTax',
    width: 120,
    align: 'right',
    render: () => h('span', { class: 'font-semibold' }, '0.00'),
  },
  {
    title: '会员输赢',
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
    title: '占单量',
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
    title: '获利比',
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
    title: '平台',
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
    title: '类别',
    key: 'gameCategory',
    width: 100,
    render: (row) => {
      const categoryMap: Record<string, string> = {
        SLOT: '电子',
        FISHING: '捕鱼',
        LIVE: '真人',
        SPORT: '体育',
        LOTTERY: '彩票',
        POKER: '扑克',
        TABLE: '桌游',
        ARCADE: '街机',
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
    title: '游戏名称',
    key: 'gameName',
    width: 180,
    ellipsis: { tooltip: true },
    render: (row) => h('span', { class: 'font-medium' }, row.gameName || '-'),
  },
  {
    title: '注单数量',
    key: 'betCount',
    width: 100,
    align: 'right',
    render: (row) =>
      h('span', { class: 'font-semibold' }, row.count || row.betCount || 0),
  },
  {
    title: '投注金额',
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
    title: '有效投注',
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
    title: '预扣税',
    key: 'preTax',
    width: 120,
    align: 'right',
    render: () => h('span', { class: 'font-semibold' }, '0.00'),
  },
  {
    title: '会员输赢',
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
    title: '获利比',
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
    message.warning('请输入会员账号');
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

      message.success('查询成功');
    }
  } catch (error) {
    console.error('Error loading bet statistics:', error);
    notification.error({
      content: '加载投注统计失败',
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
    message.success(`已筛选用户: ${userName || userAccount}`);
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
