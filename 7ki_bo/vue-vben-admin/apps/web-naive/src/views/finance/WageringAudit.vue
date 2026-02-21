<template>
  <Page title="投注任务(稽核)" description="稽核投注任务记录查询与管理">
    <!-- Breadcrumb -->
    <div class="mb-4">
      <n-breadcrumb>
        <n-breadcrumb-item>财务管理</n-breadcrumb-item>
        <n-breadcrumb-item>投注任务(稽核)</n-breadcrumb-item>
      </n-breadcrumb>
    </div>

    <!-- Tabs -->
    <n-tabs
      v-model:value="activeTab"
      type="line"
      animated
      @update:value="handleTabChange"
    >
      <n-tab-pane name="details" tab="投注任务明细">
        <!-- Filter Card -->
        <n-card :bordered="false" class="rounded-16px mb-4 shadow-sm">
          <div class="filter-section">
            <!-- Row 1: Date Range and Basic Filters -->
            <div
              class="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4"
            >
              <!-- Date Range -->
              <div class="filter-item">
                <n-form-item label="创建时间">
                  <n-date-picker
                    v-model:value="dateRange"
                    type="datetimerange"
                    clearable
                    size="small"
                    :shortcuts="dateShortcuts as any"
                    format="yyyy-MM-dd HH:mm:ss"
                    style="width: 100%"
                  />
                </n-form-item>
              </div>

              <!-- Source Type -->
              <div class="filter-item">
                <n-form-item label="触发模式">
                  <n-select
                    v-model:value="filters.sourceType"
                    placeholder="请选择触发模式"
                    clearable
                    size="small"
                    :options="sourceTypeOptions"
                    filterable
                  />
                </n-form-item>
              </div>

              <!-- Status -->
              <div class="filter-item">
                <n-form-item label="稽核状态">
                  <n-select
                    v-model:value="filters.status"
                    placeholder="请选择状态"
                    clearable
                    size="small"
                    :options="statusOptions"
                  />
                </n-form-item>
              </div>

              <!-- User Account -->
              <div class="filter-item">
                <n-form-item label="会员账号">
                  <n-input
                    v-model:value="filters.username"
                    placeholder="请输入会员账号"
                    clearable
                    size="small"
                  />
                </n-form-item>
              </div>
            </div>

            <!-- Row 2: Search Filters -->
            <div
              class="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4"
            >
              <!-- Min Required Amount -->
              <div class="filter-item">
                <n-form-item label="最小稽核金额">
                  <n-input-number
                    v-model:value="filters.minRequiredAmount"
                    placeholder="最小稽核金额"
                    clearable
                    size="small"
                    :precision="2"
                    :show-button="false"
                    style="width: 100%"
                  />
                </n-form-item>
              </div>

              <!-- Max Required Amount -->
              <div class="filter-item">
                <n-form-item label="最大稽核金额">
                  <n-input-number
                    v-model:value="filters.maxRequiredAmount"
                    placeholder="最大稽核金额"
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
              <div class="flex gap-2">
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
            <n-statistic label="总源金额" :value="statistics.totalSourceAmount">
              <template #prefix>
                <n-icon color="#18a058"><Cash /></n-icon>
              </template>
            </n-statistic>
          </n-card>
          <n-card :bordered="false" class="rounded-16px shadow-sm">
            <n-statistic
              label="总稽核金额"
              :value="statistics.totalRequiredBet"
            >
              <template #prefix>
                <n-icon color="#2080f0"><TrendingUp /></n-icon>
              </template>
            </n-statistic>
          </n-card>
          <n-card :bordered="false" class="rounded-16px shadow-sm">
            <n-statistic label="已完成" :value="statistics.totalCurrentBet">
              <template #prefix>
                <n-icon color="#f0a020"><CheckmarkCircle /></n-icon>
              </template>
            </n-statistic>
          </n-card>
          <n-card :bordered="false" class="rounded-16px shadow-sm">
            <n-statistic label="剩余" :value="statistics.totalRemaining">
              <template #prefix>
                <n-icon color="#d03050"><Hourglass /></n-icon>
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
          :scroll-x="2800"
          size="small"
          class="wagering-audit-table"
          @update:page="handlePageChange"
          @update:page-size="handlePageSizeChange"
          @refresh="loadData"
        >
          <template #actionBar>
            <n-card :bordered="false" class="rounded-16px mb-4 shadow-sm">
              <div class="flex items-center justify-between">
                <div class="text-sm">
                  <span class="font-semibold">页面合计：</span>
                  源金额:
                  <span class="font-semibold text-blue-600">{{
                    formatCurrency(pageTotals.totalSourceAmount)
                  }}</span>
                  &nbsp;|&nbsp; 稽核金额:
                  <span class="font-semibold text-green-600">{{
                    formatCurrency(pageTotals.totalRequiredBet)
                  }}</span>
                  &nbsp;|&nbsp; 已完成:
                  <span class="font-semibold text-orange-600">{{
                    formatCurrency(pageTotals.totalCurrentBet)
                  }}</span>
                  &nbsp;|&nbsp; 剩余:
                  <span class="font-semibold text-red-600">{{
                    formatCurrency(pageTotals.totalRemaining)
                  }}</span>
                </div>
              </div>
            </n-card>
          </template>
        </SmartDataGrid>
      </n-tab-pane>

      <n-tab-pane name="statistics" tab="稽核统计">
        <n-card :bordered="false" class="rounded-16px shadow-sm">
          <n-empty description="稽核统计功能开发中...">
            <template #extra>
              <n-button size="small"> 敬请期待 </n-button>
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
  NDatePicker,
  NEmpty,
  NFormItem,
  NIcon,
  NInput,
  NInputNumber,
  NSelect,
  NStatistic,
  NTabPane,
  NTabs,
  NTag,
  NProgress,
  useMessage,
  useDialog,
} from 'naive-ui';
import {
  SearchOutline,
  RefreshOutline,
  DownloadOutline,
  TrendingUp,
  CheckmarkCircle,
  Cash,
  Hourglass,
} from '@vicons/ionicons5';
import { Page } from '@vben/common-ui';
// ✅ PERFORMANCE FIX: Lazy load components to avoid blocking page load
import { defineAsyncComponent } from 'vue';
const SmartDataGrid = defineAsyncComponent(
  () => import('../../components/smart/SmartDataGrid/index.vue'),
);
const UserDetailModal = defineAsyncComponent(
  () => import('../../components/user/UserDetailModal.vue'),
);
import { notification } from '#/adapter/naive';
import {
  getWageringAuditsApi,
  getSourceTypesApi,
  getAuditStatusesApi,
  cancelAuditApi,
  forceCompleteAuditApi,
  type WageringAuditItem,
  type WageringAuditFilters,
} from '#/api/finance/wageringAudit';
import type { DataTableColumns } from 'naive-ui';

const route = useRoute();
const router = useRouter();
const message = useMessage();
const dialog = useDialog();

// State
const loading = ref(false);
const exporting = ref(false);
const activeTab = ref('details');
const showStatistics = ref(false);
const showUserDetailModal = ref(false);
const currentUserId = ref<number>(0);
const tableData = ref<WageringAuditItem[]>([]);
const dateRange = ref<[number, number] | null>(null);

// Filters
const filters = reactive<Partial<WageringAuditFilters>>({
  sourceType: undefined,
  status: undefined,
  username: undefined,
  minRequiredAmount: undefined,
  maxRequiredAmount: undefined,
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
  totalSourceAmount: 0,
  totalRequiredBet: 0,
  totalCurrentBet: 0,
  totalRemaining: 0,
});

const statistics = ref({
  totalSourceAmount: 0,
  totalRequiredBet: 0,
  totalCurrentBet: 0,
  totalRemaining: 0,
  count: 0,
});

// Filter Options
const sourceTypeOptions = ref<Array<{ label: string; value: string }>>([]);
const statusOptions = ref<Array<{ label: string; value: string }>>([]);

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
const columns: DataTableColumns<WageringAuditItem> = [
  {
    title: '稽核ID',
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
    render: (row) =>
      h(
        'span',
        {
          class: 'font-semibold text-blue-600 cursor-pointer hover:underline',
          onClick: () => handleUserClick(row.user.id),
        },
        row.user.account,
      ),
  },
  {
    title: '会员ID',
    key: 'user.userID',
    width: 120,
    render: (row) => row.user.userID || '-',
  },
  {
    title: '触发模式',
    key: 'sourceType',
    width: 120,
    render: (row) => {
      // ✅ Use the same comprehensive mapping as the dropdown
      const sourceTypeMap: Record<string, string> = {
        // Activity & Rewards
        activity_reward: '活动奖励',
        activity: '活动',
        activity_audit: '活动稽核',
        newbie_activity: '新人活动',
        novice_welfare_task: '新手福利任务',
        promotion_reward: '促销奖励',
        promotion: '促销',
        task_reward: '任务奖励',
        TASK_REWARD: '任务奖励',
        general_reward: '通用奖励',
        bonus_granted: '奖金发放',
        reward: '奖励',
        bonus: '奖金',

        // Deposit & Recharge
        deposit: '充值',
        recharge: '充值',
        member_recharge: '会员充值',
        deposit_bonus: '存款奖励',

        // VIP & Level Rewards
        vip: 'VIP',
        vip_reward: 'VIP奖励',
        vip_bonus: 'VIP奖金',
        VIP_BONUS: 'VIP奖金',

        // Rescue & Special
        rescue: '救援',
        rescue_bonus: '救援奖金',

        // Manual Operations
        manual: '人工解除',
        manual_credit: '人工加款',
        manual_debit: '人工扣款',

        // Audit & Reject
        FORCE_REJECT_AUDIT: '强制拒绝稽核',
        force_reject_audit: '强制拒绝稽核',

        // Commission & Rebate
        commission: '佣金',
        COMMISSION: '佣金',
        agent_commission: '代理佣金',
        rebate: '返水',
        referral_bonus: '推荐奖励',

        // Financial Operations
        adjustment: '资金修复',
        correction: '资金修复',
        fund_adjustment: '资金调整',
        fee_charged: '手续费',
        refund: '退款',
        interest_treasure: '利息宝',
        guarantee_claim: '保障金',
        agent_transfer: '代理转账',
        credit_loan: '信用贷款',
        security_deposit: '保证金',
        club_activity: '俱乐部活动',
        lucky_wheel: '幸运转盘',
        provident_fund: '公积金',
        mystery_box: '神秘宝箱',
        tip_reward: '小费奖励',

        // Wagering
        wagering: '流水',
        newbie: '新人',
      };

      const label = sourceTypeMap[row.sourceType] || row.sourceType;
      return h(NTag, { type: 'info', size: 'small' }, { default: () => label });
    },
  },
  {
    title: '来源描述',
    key: 'sourceDescription',
    width: 200,
    ellipsis: {
      tooltip: true,
    },
    render: (row) => translateSourceDescription(row.sourceDescription),
  },
  {
    title: '来源ID',
    key: 'sourceId',
    width: 150,
    ellipsis: {
      tooltip: true,
    },
  },
  {
    title: '源金额',
    key: 'sourceAmount',
    width: 120,
    align: 'right',
    render: (row) =>
      h(
        'span',
        { class: 'font-semibold text-green-600' },
        formatCurrency(row.sourceAmount),
      ),
  },
  {
    title: '稽核倍数',
    key: 'multiplier',
    width: 100,
    align: 'right',
    render: (row) => `${row.multiplier}x`,
  },
  {
    title: '稽核金额',
    key: 'requiredBetAmount',
    width: 120,
    align: 'right',
    render: (row) =>
      h(
        'span',
        { class: 'font-semibold text-blue-600' },
        formatCurrency(row.requiredBetAmount),
      ),
  },
  {
    title: '已完成',
    key: 'currentBetAmount',
    width: 120,
    align: 'right',
    render: (row) =>
      h(
        'span',
        { class: 'font-semibold text-orange-600' },
        formatCurrency(row.currentBetAmount),
      ),
  },
  {
    title: '剩余',
    key: 'remainingBetAmount',
    width: 120,
    align: 'right',
    render: (row) =>
      h(
        'span',
        { class: 'font-semibold text-red-600' },
        formatCurrency(row.remainingBetAmount),
      ),
  },
  {
    title: '进度',
    key: 'progressPercentage',
    width: 150,
    render: (row) => {
      const percentage = Number(row.progressPercentage);
      const status =
        percentage >= 100 ? 'success' : percentage >= 50 ? 'info' : 'warning';
      return h('div', { class: 'flex items-center gap-2' }, [
        h(NProgress, {
          type: 'line',
          percentage: Math.min(percentage, 100),
          status,
          showIndicator: false,
          height: 8,
        }),
        h('span', { class: 'text-xs font-semibold' }, `${percentage}%`),
      ]);
    },
  },
  {
    title: '优先级',
    key: 'priority',
    width: 80,
    align: 'center',
  },
  {
    title: '状态',
    key: 'status',
    width: 100,
    render: (row) => {
      const statusMap: Record<string, { color: string; label: string }> = {
        pending: { color: 'default', label: '待处理' },
        active: { color: 'info', label: '进行中' },
        completed: { color: 'success', label: '已完成' },
        expired: { color: 'warning', label: '已过期' },
        cancelled: { color: 'error', label: '已取消' },
      };
      const config = statusMap[row.status] || {
        color: 'default',
        label: row.status,
      };
      return h(
        NTag,
        { type: config.color as any, size: 'small' },
        { default: () => config.label },
      );
    },
  },
  {
    title: '创建时间',
    key: 'createdAt',
    width: 160,
    render: (row) => formatDateTime(row.createdAt),
  },
  {
    title: '激活时间',
    key: 'activatedAt',
    width: 160,
    render: (row) => (row.activatedAt ? formatDateTime(row.activatedAt) : '-'),
  },
  {
    title: '完成时间',
    key: 'completedAt',
    width: 160,
    render: (row) => (row.completedAt ? formatDateTime(row.completedAt) : '-'),
  },
  {
    title: '过期时间',
    key: 'expiresAt',
    width: 160,
    render: (row) => (row.expiresAt ? formatDateTime(row.expiresAt) : '-'),
  },
  {
    title: '操作',
    key: 'actions',
    width: 180,
    fixed: 'right',
    render: (row) => {
      // Only show actions for pending or active audits
      if (!['pending', 'active'].includes(row.status)) {
        return h('span', { class: 'text-gray-400 text-xs' }, '-');
      }

      return h('div', { class: 'flex gap-2' }, [
        // Clear (Cancel) button
        h(
          NButton,
          {
            type: 'error',
            size: 'small',
            secondary: true,
            onClick: () => handleCancelAudit(row),
          },
          { default: () => '清除' },
        ),

        // Complete button
        h(
          NButton,
          {
            type: 'success',
            size: 'small',
            onClick: () => handleCompleteAudit(row),
          },
          { default: () => '完成' },
        ),
      ]);
    },
  },
];

// Methods
const loadData = async () => {
  loading.value = true;
  try {
    const params: WageringAuditFilters = {
      page: paginationReactive.page,
      pageSize: paginationReactive.pageSize,
      ...filters,
    };

    // Add date range
    if (dateRange.value) {
      params.startDate = new Date(dateRange.value[0]).toISOString();
      const endDate = new Date(dateRange.value[1]);
      endDate.setHours(23, 59, 59, 999);
      params.endDate = endDate.toISOString();
    }

    const response = await getWageringAuditsApi(params);

    // Response interceptor unwraps the data, so we get it directly
    if (response && response.list) {
      tableData.value = response.list;
      paginationReactive.total = response.pagination.total;
      pageTotals.value = response.pageTotals;
      statistics.value = response.overallTotals;
      showStatistics.value = true;
    }
  } catch (error) {
    console.error('Error loading wagering audits:', error);
    notification.error({
      content: '加载稽核记录失败',
      duration: 3000,
    });
  } finally {
    loading.value = false;
  }
};

const loadFilterOptions = async () => {
  try {
    const [sourceTypes, statuses] = await Promise.all([
      getSourceTypesApi(),
      getAuditStatusesApi(),
    ]);

    // Response interceptor unwraps the data
    if (sourceTypes && Array.isArray(sourceTypes)) {
      // ✅ Comprehensive mapping of all source types to standardized Chinese labels
      const sourceTypeLabels: Record<string, string> = {
        // Activity & Rewards
        activity_reward: '活动奖励',
        activity: '活动',
        activity_audit: '活动稽核',
        newbie_activity: '新人活动',
        novice_welfare_task: '新手福利任务',
        promotion_reward: '促销奖励',
        promotion: '促销',
        task_reward: '任务奖励',
        TASK_REWARD: '任务奖励',
        general_reward: '通用奖励',
        bonus_granted: '奖金发放',
        reward: '奖励',
        bonus: '奖金',

        // Deposit & Recharge
        deposit: '充值',
        recharge: '充值',
        member_recharge: '会员充值',
        deposit_bonus: '存款奖励',

        // VIP & Level Rewards
        vip: 'VIP',
        vip_reward: 'VIP奖励',
        vip_bonus: 'VIP奖金',
        VIP_BONUS: 'VIP奖金',

        // Rescue & Special
        rescue: '救援',
        rescue_bonus: '救援奖金',

        // Manual Operations
        manual: '人工解除',
        manual_credit: '人工加款',
        manual_debit: '人工扣款',

        // Audit & Reject
        FORCE_REJECT_AUDIT: '强制拒绝稽核',
        force_reject_audit: '强制拒绝稽核',

        // Commission & Rebate
        commission: '佣金',
        COMMISSION: '佣金',
        agent_commission: '代理佣金',
        rebate: '返水',
        referral_bonus: '推荐奖励',

        // Financial Operations
        adjustment: '资金修复',
        correction: '资金修复',
        fund_adjustment: '资金调整',
        fee_charged: '手续费',
        refund: '退款',
        interest_treasure: '利息宝',
        guarantee_claim: '保障金',
        agent_transfer: '代理转账',
        credit_loan: '信用贷款',
        security_deposit: '保证金',
        club_activity: '俱乐部活动',
        lucky_wheel: '幸运转盘',
        provident_fund: '公积金',
        mystery_box: '神秘宝箱',
        tip_reward: '小费奖励',

        // Wagering
        wagering: '流水',
        newbie: '新人',
      };

      // Sort source types alphabetically by Chinese label for better UX
      sourceTypeOptions.value = sourceTypes
        .map((st) => ({
          label: sourceTypeLabels[st] || st,
          value: st,
          original: st,
        }))
        .sort((a, b) => {
          // Sort by Chinese label, but keep unmapped items at the end
          if (sourceTypeLabels[a.original] && sourceTypeLabels[b.original]) {
            return a.label.localeCompare(b.label, 'zh-CN');
          }
          if (sourceTypeLabels[a.original]) return -1;
          if (sourceTypeLabels[b.original]) return 1;
          return a.original.localeCompare(b.original);
        })
        .map((item) => ({
          label: item.label,
          value: item.value,
        }));
    }

    if (statuses && Array.isArray(statuses)) {
      const statusLabels: Record<string, string> = {
        pending: '待处理',
        active: '进行中',
        completed: '已完成',
        expired: '已过期',
        cancelled: '已取消',
      };
      statusOptions.value = statuses.map((s) => ({
        label: statusLabels[s] || s,
        value: s,
      }));
    }
  } catch (error) {
    console.error('Error loading filter options:', error);
  }
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
  paginationReactive.page = 1;
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

const handleCancelAudit = async (row: WageringAuditItem) => {
  dialog.warning({
    title: '清除稽核',
    content: `确定要清除稽核 ${row.id} 吗？此操作不可撤销。`,
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        const reason = `管理员手动清除稽核 - 用户: ${row.user.account}`;
        const response = await cancelAuditApi(row.id, reason);

        if (response.success) {
          message.success('稽核已清除');
          await loadData();
        } else {
          message.error(response.message || '清除失败');
        }
      } catch (error) {
        console.error('Error cancelling audit:', error);
        message.error('清除稽核失败');
      }
    },
  });
};

const handleCompleteAudit = async (row: WageringAuditItem) => {
  dialog.info({
    title: '完成稽核',
    content: `确定要强制完成稽核 ${row.id} 吗？`,
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        const reason = `管理员手动完成稽核 - 用户: ${row.user.account}`;
        const response = await forceCompleteAuditApi(row.id, reason);

        if (response.success) {
          message.success('稽核已完成');
          await loadData();
        } else {
          message.error(response.message || '完成失败');
        }
      } catch (error) {
        console.error('Error completing audit:', error);
        message.error('完成稽核失败');
      }
    },
  });
};

// Utility Functions
const translateSourceDescription = (description: string | null): string => {
  if (!description) return '-';

  // Common phrase mappings - matching UserDetailModal.vue
  const translations: Record<string, string> = {
    // Deposits & Withdrawals
    deposit: '充值',
    Deposit: '充值',
    recharge: '充值',
    Recharge: '充值',
    member_recharge: '会员充值',
    'Member recharge': '会员充值',
    withdrawal: '提现',
    Withdrawal: '提现',
    withdraw: '提现',
    Withdraw: '提现',

    // Betting
    bet_placed: '投注',
    'Bet placed': '投注',
    bet: '投注',
    Bet: '投注',
    bet_won: '派彩',
    'Bet won': '派彩',
    bet_win: '派彩',
    'Bet win': '派彩',
    bet_lost: '投注',
    'Bet lost': '投注',
    bet_settle: '结算',
    'Bet settle': '结算',

    // Check-in rewards
    'Day 1 check-in reward': '第1天签到奖励',
    'Day 2 check-in reward': '第2天签到奖励',
    'Day 3 check-in reward': '第3天签到奖励',
    'Day 4 check-in reward': '第4天签到奖励',
    'Day 5 check-in reward': '第5天签到奖励',
    'Day 6 check-in reward': '第6天签到奖励',
    'Day 7 check-in reward': '第7天签到奖励',
    'check-in reward': '签到奖励',
    'Check-in reward': '签到奖励',
    'check in reward': '签到奖励',
    'Check in reward': '签到奖励',

    // Rewards & Bonuses
    bonus: '奖励',
    Bonus: '奖励',
    activity_reward: '活动',
    'Activity reward': '活动',
    activity: '活动',
    Activity: '活动',
    task_reward: '任务奖励',
    'Task reward': '任务奖励',
    vip_reward: 'VIP奖励',
    'VIP reward': 'VIP奖励',
    VIP: 'VIP',
    deposit_bonus: '存款奖励',
    'Deposit bonus': '存款奖励',
    referral_bonus: '推荐奖励',
    'Referral bonus': '推荐奖励',
    rebate: '返水',
    Rebate: '返水',
    commission: '佣金',
    Commission: '佣金',

    // Manual operations
    manual_credit: '人工加款',
    'Manual credit': '人工加款',
    manual_debit: '人工扣款',
    'Manual debit': '人工扣款',
    manual: '人工',
    Manual: '人工',
    adjustment: '资金修复',
    Adjustment: '资金修复',
    correction: '资金修复',
    Correction: '资金修复',

    // Others
    rescue: '救援',
    Rescue: '救援',
    'rescue bonus': '救援奖金',
    'Rescue bonus': '救援奖金',
    newbie: '新人',
    Newbie: '新人',
    wagering: '流水',
    Wagering: '流水',
    promotion: '促销',
    Promotion: '促销',
    'first deposit': '首充',
    'First deposit': '首充',
    'bonus unlock': '奖金解锁',
    'Bonus unlock': '奖金解锁',

    // Fees
    fee: '手续费',
    Fee: '手续费',
    withdrawal_fee: '提现手续费',
    'Withdrawal fee': '提现手续费',
  };

  let translated = description;

  // Replace each known phrase
  Object.entries(translations).forEach(([en, zh]) => {
    translated = translated.replace(new RegExp(en, 'gi'), zh);
  });

  return translated;
};

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

  // Set default date range to today
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  dateRange.value = [now.getTime(), end.getTime()];

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

.wagering-audit-table :deep(.n-data-table-th) {
  font-weight: 600;
  background-color: #f8f9fa;
}

.wagering-audit-table :deep(.n-data-table-td) {
  font-size: 13px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
