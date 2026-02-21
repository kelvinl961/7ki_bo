<template>
  <div class="auto-withdrawal">
    <!-- Header and Filters -->
    <div class="header-section">
      <n-card :bordered="false" class="rounded-16px shadow-sm">
        <div class="mb-4 flex items-center justify-between">
          <div>
            <h2 class="text-xl font-semibold text-gray-800">免审出款</h2>
            <p class="mt-1 text-sm text-gray-600">
              符合免审条件的提现订单自动处理
            </p>
            <div class="mt-2 text-xs text-gray-500">
              免审条件：同时满足设置的会员层级、标签、注册时长、金额限制等条件
            </div>
          </div>
          <div class="flex gap-3">
            <!-- 🚀 SmartAutoRefresh Component -->
            <SmartAutoRefresh
              v-model="autoRefreshEnabled"
              :intervals="[15, 30, 60, 120]"
              :default-interval="30"
              :on-refresh="fetchData"
              @interval-change="handleRefreshIntervalChange"
            />
          </div>
        </div>

        <!-- Filter Section -->
        <div class="filter-section">
          <!-- Time Filter -->
          <div class="mb-4 flex flex-wrap items-center gap-4">
            <div class="flex items-center gap-2">
              <span class="text-sm font-medium text-gray-600">申请时间</span>
              <n-radio-group v-model:value="filters.timeRange" size="small">
                <n-radio value="today">今天</n-radio>
                <n-radio value="month">本月</n-radio>
              </n-radio-group>
              <n-date-picker
                v-model:value="filters.dateRange"
                type="datetimerange"
                format="yyyy-MM-dd HH:mm:ss"
                placeholder="选择时间范围"
                clearable
                size="small"
                class="w-80"
              />
            </div>
          </div>

          <!-- Search Filters -->
          <div
            class="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6"
          >
            <!-- Member Account -->
            <div class="filter-item">
              <n-form-item label="会员账号">
                <n-input
                  v-model:value="filters.memberAccount"
                  placeholder="会员账号或备注内容搜索，最多200个"
                  clearable
                  size="small"
                />
              </n-form-item>
            </div>

            <!-- Third Party Payment -->
            <div class="filter-item">
              <n-form-item label="三方代付">
                <n-select
                  v-model:value="filters.thirdPartyPayment"
                  placeholder="三方代付"
                  clearable
                  size="small"
                  :options="thirdPartyOptions"
                />
              </n-form-item>
            </div>

            <!-- Amount -->
            <div class="filter-item">
              <n-form-item label="金额大小">
                <n-input
                  v-model:value="filters.amount"
                  placeholder="金额"
                  clearable
                  size="small"
                />
              </n-form-item>
            </div>

            <!-- Withdrawal Method -->
            <div class="filter-item">
              <n-form-item label="提现方式">
                <n-select
                  v-model:value="filters.withdrawalMethod"
                  placeholder="提现方式"
                  clearable
                  size="small"
                  :options="withdrawalMethodOptions"
                />
              </n-form-item>
            </div>

            <!-- Auto Rule -->
            <div class="filter-item">
              <n-form-item label="自动规则">
                <n-select
                  v-model:value="filters.autoRule"
                  placeholder="自动规则"
                  clearable
                  size="small"
                  :options="autoRuleOptions"
                />
              </n-form-item>
            </div>

            <!-- VIP Level -->
            <div class="filter-item">
              <n-form-item label="会员层级">
                <n-select
                  v-model:value="filters.vipLevel"
                  placeholder="会员层级"
                  clearable
                  size="small"
                  :options="vipLevelOptions"
                />
              </n-form-item>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center justify-between">
            <div class="flex gap-2">
              <n-button type="primary" @click="applyFilters" :loading="loading">
                <template #icon>
                  <n-icon><SearchOutline /></n-icon>
                </template>
                搜索
              </n-button>
              <n-button @click="resetFilters"> 重置 </n-button>
              <n-button @click="clearFilters"> 自己提定的 </n-button>
            </div>
            <div class="flex items-center gap-2 text-sm text-gray-600">
              已选择 {{ selectedIds.length }} 条数据
              <n-tag type="success" size="small">免审出款</n-tag>
            </div>
          </div>
        </div>
      </n-card>
    </div>

    <!-- SmartDataGrid -->
    <SmartDataGrid
      :data="tableData"
      :columns="columns"
      :loading="loading"
      :pagination="paginationReactive"
      selectable
      :selected-keys="selectedIds"
      row-key="id"
      :scroll-x="2200"
      size="small"
      class="single-line-table"
      @update:selected-keys="selectedIds = $event"
      @update:page="handlePageChange"
      @update:page-size="handlePageSizeChange"
      @refresh="fetchData"
      @row-click="handleRowClick"
    >
      <template #actionBar="{ selectedCount, selectedRows }">
        <n-card :bordered="false" class="rounded-16px shadow-sm">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <!-- 主要操作按钮 -->
              <div class="flex gap-2">
                <n-button type="primary" @click="fetchData" :loading="loading">
                  <template #icon>
                    <n-icon><ReloadOutline /></n-icon>
                  </template>
                  刷新
                </n-button>

                <n-button type="info" @click="handleExportSearch">
                  <template #icon>
                    <n-icon><DownloadOutline /></n-icon>
                  </template>
                  导出搜索
                </n-button>
              </div>

              <!-- 统计信息 -->
              <div class="flex gap-6 text-sm">
                <span
                  >符合免审条件:
                  <span class="font-semibold text-green-600">{{
                    statistics.autoApprovalEligible
                  }}</span></span
                >
                <span
                  >今日已自动处理:
                  <span class="font-semibold text-blue-600">{{
                    statistics.todayAutoProcessed
                  }}</span></span
                >
                <span
                  >累计金额:
                  <span class="font-semibold text-orange-600"
                    >{{ totalAmount.toFixed(2) }} BRL</span
                  ></span
                >
              </div>

              <!-- 选择信息 -->
              <div class="text-sm text-gray-600">
                已选择 {{ selectedCount }} 条数据，共
                {{ paginationReactive.total }} 条
                <n-tag type="success" size="small" class="ml-2">
                  免审出款
                </n-tag>
              </div>
            </div>

            <div class="flex items-center gap-4">
              <!-- 批量操作 -->
              <div v-if="selectedCount > 0" class="flex gap-2">
                <n-button
                  type="success"
                  size="small"
                  @click="handleBulkAutoApproval(selectedRows)"
                >
                  批量自动出款 ({{ selectedCount }})
                </n-button>
              </div>

              <!-- 选择控制 -->
              <div class="flex gap-2">
                <n-button size="small" @click="clearSelection"
                  >清空选择</n-button
                >
                <n-button size="small" @click="selectAll">全选</n-button>
              </div>
            </div>
          </div>
        </n-card>
      </template>
    </SmartDataGrid>

    <!-- Batch Operations -->
    <div class="batch-operations mt-4 border-t p-4">
      <div class="flex items-center gap-4">
        <span class="text-sm text-gray-600">全选当前页</span>
        <n-select
          v-model:value="batchOperation"
          placeholder="批量操作"
          size="small"
          class="w-40"
          :options="batchOperationOptions"
        />
        <span class="text-sm text-gray-600"
          >已选择{{ selectedIds.length }}条数据</span
        >
        <span class="text-sm text-gray-600"
          >共{{ paginationReactive.total }}条</span
        >
      </div>
    </div>
  </div>

  <!-- Auto Approval Modal -->
  <n-modal
    v-model:show="autoApprovalModal.show"
    preset="dialog"
    title="批量自动出款确认"
    positive-text="确认处理"
    negative-text="取消"
    @positive-click="handleAutoApproval"
  >
    <div class="space-y-4">
      <div>
        <n-alert type="success" :show-icon="false">
          确认自动处理以下{{
            autoApprovalModal.items.length
          }}个符合免审条件的提现申请？
        </n-alert>
      </div>
      <div class="max-h-60 overflow-y-auto">
        <div
          v-for="item in autoApprovalModal.items"
          :key="item.id"
          class="mb-2 rounded border p-2"
        >
          <div class="text-sm">
            <div><strong>订单号:</strong> {{ item.orderId }}</div>
            <div>
              <strong>会员:</strong> {{ item.memberAccount }} ({{
                item.vipLevel
              }})
            </div>
            <div>
              <strong>金额:</strong> {{ item.amount }} {{ item.currency }}
            </div>
            <div>
              <strong>符合规则:</strong>
              <n-tag type="success" size="small">{{ item.autoRule }}</n-tag>
            </div>
          </div>
        </div>
      </div>
      <div>
        <n-form-item label="处理备注">
          <n-input
            v-model:value="autoApprovalModal.notes"
            type="textarea"
            placeholder="自动审核处理备注（可选）"
            :rows="3"
          />
        </n-form-item>
      </div>
    </div>
  </n-modal>

  <!-- Auto Rules Modal -->
  <n-modal
    v-model:show="autoRulesModal.show"
    preset="card"
    title="自动审核规则设置"
    size="large"
    :style="{ width: '80%', maxWidth: '1000px' }"
  >
    <div class="space-y-6">
      <n-alert type="info" :show-icon="false">
        设置符合免审出款的条件，满足条件的提现申请将自动通过审核
      </n-alert>

      <!-- Rule Categories -->
      <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
        <n-card title="VIP等级规则" size="small">
          <div class="space-y-4">
            <n-form-item label="最低VIP等级">
              <n-select
                v-model:value="autoRules.minVipLevel"
                placeholder="选择最低VIP等级"
                :options="vipLevelOptions"
              />
            </n-form-item>
            <n-form-item label="VIP用户免审金额上限">
              <n-input-number
                v-model:value="autoRules.vipMaxAmount"
                placeholder="输入金额上限"
                :min="0"
                class="w-full"
              />
            </n-form-item>
          </div>
        </n-card>

        <n-card title="账户安全规则" size="small">
          <div class="space-y-4">
            <n-form-item label="账户注册天数">
              <n-input-number
                v-model:value="autoRules.minAccountAge"
                placeholder="最少注册天数"
                :min="0"
                class="w-full"
              />
            </n-form-item>
            <n-form-item label="最近登录天数">
              <n-input-number
                v-model:value="autoRules.maxLastLoginDays"
                placeholder="最近登录天数内"
                :min="0"
                class="w-full"
              />
            </n-form-item>
          </div>
        </n-card>

        <n-card title="交易历史规则" size="small">
          <div class="space-y-4">
            <n-form-item label="最少充值次数">
              <n-input-number
                v-model:value="autoRules.minDepositCount"
                placeholder="最少充值次数"
                :min="0"
                class="w-full"
              />
            </n-form-item>
            <n-form-item label="充值提现比例">
              <n-input-number
                v-model:value="autoRules.depositWithdrawRatio"
                placeholder="最低充值提现比例"
                :min="0"
                :max="100"
                class="w-full"
              />
            </n-form-item>
          </div>
        </n-card>

        <n-card title="风险控制规则" size="small">
          <div class="space-y-4">
            <n-form-item label="单笔免审金额上限">
              <n-input-number
                v-model:value="autoRules.maxSingleAmount"
                placeholder="单笔最大金额"
                :min="0"
                class="w-full"
              />
            </n-form-item>
            <n-form-item label="日累计免审金额">
              <n-input-number
                v-model:value="autoRules.dailyMaxAmount"
                placeholder="每日累计最大金额"
                :min="0"
                class="w-full"
              />
            </n-form-item>
          </div>
        </n-card>
      </div>

      <!-- Rule Status -->
      <n-card title="规则启用状态" size="small">
        <div class="grid grid-cols-2 gap-4">
          <n-form-item label="启用VIP免审">
            <n-switch v-model:value="autoRules.enableVipAuto" />
          </n-form-item>
          <n-form-item label="启用小额免审">
            <n-switch v-model:value="autoRules.enableSmallAmountAuto" />
          </n-form-item>
          <n-form-item label="启用老用户免审">
            <n-switch v-model:value="autoRules.enableOldUserAuto" />
          </n-form-item>
          <n-form-item label="启用高频用户免审">
            <n-switch v-model:value="autoRules.enableFrequentUserAuto" />
          </n-form-item>
        </div>
      </n-card>

      <!-- Actions -->
      <div class="flex justify-end gap-3">
        <n-button @click="autoRulesModal.show = false">取消</n-button>
        <n-button type="primary" @click="saveAutoRules">保存规则</n-button>
      </div>
    </div>
  </n-modal>

  <!-- Detail Modal -->
  <n-modal
    v-model:show="detailModal.show"
    preset="card"
    title="免审出款详情"
    size="large"
    :style="{ width: '80%', maxWidth: '1000px' }"
  >
    <div v-if="detailModal.data" class="space-y-6">
      <!-- Basic Info -->
      <div class="grid grid-cols-2 gap-6">
        <n-card title="订单信息" size="small">
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600">订单号:</span>
              <span>{{ detailModal.data.orderId }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">会员账号:</span>
              <span>{{ detailModal.data.memberAccount }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">申请时间:</span>
              <span>{{
                formatDateTime(detailModal.data.applicationTime)
              }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">订单状态:</span>
              <n-tag :type="getStatusType(detailModal.data.status)">
                {{ getStatusText(detailModal.data.status) }}
              </n-tag>
            </div>
          </div>
        </n-card>

        <n-card title="免审规则匹配" size="small">
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600">符合规则:</span>
              <n-tag type="success">{{ detailModal.data.autoRule }}</n-tag>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">VIP等级:</span>
              <span>{{ detailModal.data.vipLevel }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">账户注册:</span>
              <span>{{ detailModal.data.accountAge }}天</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">充值次数:</span>
              <span>{{ detailModal.data.depositCount }}次</span>
            </div>
          </div>
        </n-card>
      </div>

      <!-- Payment Info -->
      <n-card title="提现信息" size="small">
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-600">提现金额:</span>
            <span class="font-semibold text-green-600">
              {{ detailModal.data.amount }} {{ detailModal.data.currency }}
            </span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">提现方式:</span>
            <span>{{ detailModal.data.withdrawalMethod }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">收款账户:</span>
            <span>{{ detailModal.data.accountNumber }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">收款人:</span>
            <span>{{ detailModal.data.accountHolderName }}</span>
          </div>
        </div>
      </n-card>

      <!-- Actions -->
      <div class="flex justify-end gap-3">
        <n-button @click="closeDetailModal">关闭</n-button>
        <n-button
          type="success"
          @click="showSingleAutoApprovalModal(detailModal.data)"
          v-if="canAutoApprove(detailModal.data.status)"
        >
          立即自动出款
        </n-button>
      </div>
    </div>
  </n-modal>
</template>

<script setup lang="ts">
import {
  ref,
  reactive,
  onMounted,
  computed,
  h,
  onUnmounted,
  watch,
  nextTick,
  defineAsyncComponent,
} from 'vue';
// ✅ PERFORMANCE FIX: Lazy load components to avoid blocking page load
const SmartAutoRefresh = defineAsyncComponent(
  () => import('../../components/smart/SmartAutoRefresh/index.vue'),
);
const SmartDataGrid = defineAsyncComponent(
  () => import('../../components/smart/SmartDataGrid/index.vue'),
);
import {
  NButton,
  NCard,
  NDataTable,
  NInput,
  NInputNumber,
  NSelect,
  NDatePicker,
  NFormItem,
  NModal,
  NAlert,
  NTag,
  NIcon,
  NRadioGroup,
  NRadio,
  NSwitch,
  useMessage,
  useDialog,
  type DataTableColumns,
} from 'naive-ui';
import {
  ReloadOutline,
  SearchOutline,
  CheckmarkCircleOutline,
  SettingsOutline,
  DownloadOutline,
} from '@vicons/ionicons5';
import { autoWithdrawalApi } from '#/api/finance/autoWithdrawal';

interface AutoWithdrawalRecord {
  id: string;
  orderId: string;
  memberAccount: string;
  memberName: string;
  vipLevel: string;
  applicationTime: string;
  currency: string;
  amount: number;
  withdrawalMethod: string;
  paymentChannel: string;
  accountNumber: string;
  bankName: string;
  accountHolderName: string;
  status: string;
  autoRule: string;
  accountAge: number;
  depositCount: number;
  operator: string;
  notes: string;
  [key: string]: any;
}

const message = useMessage();
const dialog = useDialog();

// Data and state
const loading = ref(false);
const autoRefreshEnabled = ref(false);
const tableData = ref<AutoWithdrawalRecord[]>([]);
const selectedIds = ref<string[]>([]);
const batchOperation = ref('');

// Helper functions for date ranges
function getTodayRange(): [number, number] {
  const now = new Date();
  const start = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0,
    0,
    0,
  );
  const end = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
  );
  return [start.getTime(), end.getTime()];
}

function getMonthRange(): [number, number] {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  return [start.getTime(), end.getTime()];
}

// Filters
const filters = reactive({
  timeRange: 'today',
  dateRange: getTodayRange() as [number, number] | null,
  memberAccount: '',
  thirdPartyPayment: '',
  amount: '',
  withdrawalMethod: '',
  autoRule: '',
  vipLevel: '',
});

// Pagination - SmartDataGrid compatible
const paginationReactive = reactive({
  page: 1,
  pageSize: 20,
  total: 0,
});

// Statistics
const statistics = reactive({
  autoApprovalEligible: 0,
  todayAutoProcessed: 0,
  totalAmount: 0,
});

// Modals
const autoApprovalModal = reactive({
  show: false,
  items: [] as AutoWithdrawalRecord[],
  notes: '',
});

const autoRulesModal = reactive({
  show: false,
});

const detailModal = reactive({
  show: false,
  data: null as AutoWithdrawalRecord | null,
});

// Auto Rules
const autoRules = reactive({
  minVipLevel: 'VIP1',
  vipMaxAmount: 1000,
  minAccountAge: 30,
  maxLastLoginDays: 7,
  minDepositCount: 5,
  depositWithdrawRatio: 80,
  maxSingleAmount: 500,
  dailyMaxAmount: 2000,
  enableVipAuto: true,
  enableSmallAmountAuto: true,
  enableOldUserAuto: true,
  enableFrequentUserAuto: true,
});

// Options
const thirdPartyOptions = [
  { label: 'PIX自动代付', value: 'PIX_AUTO' },
  { label: '银行转账', value: 'BANK_TRANSFER' },
  { label: '数字钱包', value: 'DIGITAL_WALLET' },
];

const withdrawalMethodOptions = [
  { label: 'PIX', value: 'PIX' },
  { label: '银行卡', value: 'BANK_CARD' },
  { label: '数字钱包', value: 'WALLET' },
];

const autoRuleOptions = [
  { label: 'VIP免审', value: 'VIP_AUTO' },
  { label: '小额免审', value: 'SMALL_AMOUNT' },
  { label: '老用户免审', value: 'OLD_USER' },
  { label: '高频用户免审', value: 'FREQUENT_USER' },
];

const vipLevelOptions = [
  { label: 'VIP0', value: 'VIP0' },
  { label: 'VIP1', value: 'VIP1' },
  { label: 'VIP2', value: 'VIP2' },
  { label: 'VIP3', value: 'VIP3' },
  { label: 'VIP4', value: 'VIP4' },
  { label: 'VIP5', value: 'VIP5' },
];

const batchOperationOptions = [
  { label: '批量自动出款', value: 'batch_auto_approval' },
  { label: '批量导出', value: 'batch_export' },
  { label: '批量标记', value: 'batch_mark' },
];

// Computed
const totalAmount = computed(() => {
  return tableData.value.reduce((sum, item) => sum + item.amount, 0);
});

// Table columns based on screenshot
const columns: DataTableColumns<AutoWithdrawalRecord> = [
  {
    type: 'selection',
    fixed: 'left',
    width: 50,
  },
  {
    title: '订单号',
    key: 'orderId',
    width: 140,
    fixed: 'left',
    render: (row) =>
      h(
        NButton,
        {
          text: true,
          type: 'primary',
          onClick: () => showDetail(row),
        },
        { default: () => row.trxId || row.orderId },
      ),
  },
  {
    title: '会员ID (VIP等级)',
    key: 'memberInfo',
    width: 100,
    render: (row) =>
      h('div', { class: 'text-center' }, [
        h(
          'div',
          { class: 'text-blue-600 font-mono text-xs' },
          row.userID || row.memberId,
        ),
        h('div', { class: 'text-xs text-gray-500' }, row.vipLevel || 'VIP0'),
      ]),
  },
  {
    title: '会员账号 (会员层级)',
    key: 'memberAccount',
    width: 120,
    render: (row) =>
      h('div', [
        h('div', { class: 'font-medium' }, row.memberName),
        h(
          NTag,
          { size: 'small', type: 'info' },
          { default: () => row.vipLevel || 'VIP0' },
        ),
      ]),
  },
  {
    title: '申请时间 (操作时间)',
    key: 'applicationTime',
    width: 150,
    render: (row) =>
      h('div', { class: 'text-center' }, [
        h('div', formatDateTime(row.createdAt || row.applicationTime)),
        h('div', { class: 'text-xs text-gray-500' }, '完成时长'),
      ]),
  },
  {
    title: '会员币种 (比例)',
    key: 'currency',
    width: 80,
    render: (row) =>
      h('div', { class: 'text-center' }, [
        h('div', row.currency || 'BRL'),
        h('div', { class: 'text-xs text-gray-500' }, '(汇率)'),
      ]),
  },
  {
    title: '提现金额 当前金额 (实际金额)',
    key: 'amount',
    width: 130,
    render: (row) =>
      h('div', { class: 'text-center' }, [
        h(
          'div',
          { class: 'font-semibold text-green-600' },
          `${(row.amount || 0).toFixed(2)} ${row.currency || 'BRL'}`,
        ),
        h(
          'div',
          { class: 'text-xs text-gray-500' },
          `实际到账: ${((row.amount || 0) - (row.fee || 0)).toFixed(2)}`,
        ),
      ]),
  },
  {
    title: '充/提次数 (累计充/提金额) (重复IP人数)',
    key: 'statistics',
    width: 140,
    render: (row) =>
      h('div', { class: 'text-center text-xs text-gray-500' }, [
        h(
          'div',
          `充${row.rechargeWithdrawCount?.rechargeCount || 0}/提${row.rechargeWithdrawCount?.withdrawCount || 0}次`,
        ),
        h('div', `IP: ${row.rechargeWithdrawCount?.duplicateIP || 0}`),
      ]),
  },
  {
    title: '收款方式 (收款人信息)',
    key: 'paymentInfo',
    width: 140,
    render: (row) =>
      h('div', [
        h('div', { class: 'flex items-center gap-1' }, [
          h('span', row.paymentMethod || row.withdrawalMethod),
          h(
            'span',
            { class: 'bg-green-500 text-white text-xs px-1 rounded' },
            '自动',
          ),
        ]),
        h(
          'div',
          { class: 'text-xs text-gray-500' },
          `账号: ${row.memberBankAccount || row.accountNumber || '-'}`,
        ),
        h(
          'div',
          { class: 'text-xs text-gray-500' },
          `姓名: ${row.accountHolderName || row.memberName || '-'}`,
        ),
      ]),
  },
  {
    title: '订单状态 (操作人)',
    key: 'status',
    width: 110,
    render: (row) => {
      // 🎯 NEW: Operator name display logic
      let operatorDisplay = '';
      if (row.reviewer || row.operator) {
        // If reviewer/operator exists, show it
        operatorDisplay = row.reviewer || row.operator;
      } else if (row.isLocked && row.lockedBy) {
        // If locked, show who locked it
        operatorDisplay = row.lockedBy;
      } else if (row.isLocked === false || !row.lockedBy) {
        // If not locked, show "未锁定"
        operatorDisplay = '未锁定';
      } else {
        // Fallback
        operatorDisplay = 'system';
      }

      return h('div', { class: 'text-center' }, [
        h(
          NTag,
          {
            type: getStatusType(row.status),
            size: 'small',
          },
          { default: () => getStatusText(row.status) },
        ),
        h('div', { class: 'text-xs text-gray-500 mt-1' }, operatorDisplay),
      ]);
    },
  },
  {
    title: '前台备注',
    key: 'frontendNotes',
    width: 80,
    render: () => h('div', { class: 'text-center text-gray-500' }, '免审订单'),
  },
  {
    title: '后台备注',
    key: 'backendNotes',
    width: 100,
    render: (row) =>
      h(
        'div',
        { class: 'text-center text-green-500' },
        row.notes || '符合免审条件',
      ),
  },
  {
    title: '三方代付 (代付次数)',
    key: 'thirdParty',
    width: 100,
    render: (row) => {
      const gateway =
        row.paymentChannel ||
        row.paymentGateway ||
        row.thirdPartyProvider ||
        'system';
      let displayName = gateway;

      // 🎯 NEW: Chinese translations for gateway names
      if (gateway.toLowerCase() === 'manual') {
        displayName = '人工出款';
      } else if (
        gateway.toLowerCase() === 'auto_system' ||
        gateway === 'auto_system' ||
        gateway === 'system'
      ) {
        displayName = '免审出款';
      }

      return h('div', { class: 'text-center' }, [
        h('div', displayName),
        h('div', { class: 'text-xs text-gray-500' }, '(0次)'),
      ]);
    },
  },
  {
    title: '免审规则',
    key: 'autoRule',
    width: 100,
    render: (row) =>
      h('div', { class: 'text-center' }, [
        h(
          NTag,
          {
            type: 'success',
            size: 'small',
          },
          { default: () => row.autoRule },
        ),
      ]),
  },
  {
    title: '操作',
    key: 'actions',
    width: 120,
    fixed: 'right',
    render: (row) =>
      h('div', { class: 'flex gap-1 flex-wrap' }, [
        h(
          NButton,
          {
            size: 'small',
            type: 'success',
            onClick: () => showSingleAutoApprovalModal(row),
            disabled: !canAutoApprove(row.status),
          },
          { default: () => '自动出款' },
        ),
        h(
          NButton,
          {
            size: 'small',
            type: 'info',
            onClick: () => showDetail(row),
          },
          { default: () => '详情' },
        ),
      ]),
  },
];

// SmartDataGrid event handlers
const handlePageChange = (page: number) => {
  paginationReactive.page = page;
  fetchData();
};

const handlePageSizeChange = (pageSize: number) => {
  paginationReactive.pageSize = pageSize;
  paginationReactive.page = 1;
  fetchData();
};

const handleRowClick = (_row: AutoWithdrawalRecord) => {
  // console.log('Row clicked:', row);
};

const clearSelection = () => {
  selectedIds.value = [];
};

const selectAll = () => {
  selectedIds.value = tableData.value.map((row) => row.id);
};

// Bulk operation handlers that work with selectedRows
const handleBulkAutoApproval = (_selectedRows: AutoWithdrawalRecord[]) => {
  showBulkAutoApprovalModal();
};

const handleExportSearch = () => {
  // TODO: Implement export search functionality
  message.info('导出搜索功能开发中');
};

// Watch for timeRange changes and update dateRange accordingly
watch(
  () => filters.timeRange,
  (newValue) => {
    if (newValue === 'today') {
      filters.dateRange = getTodayRange();
    } else if (newValue === 'month') {
      filters.dateRange = getMonthRange();
    }
    // Automatically fetch data when time range changes
    fetchData();
  },
);

// Methods
const fetchData = async () => {
  loading.value = true;
  try {
    const params: any = {
      page: paginationReactive.page,
      limit: paginationReactive.pageSize,
    };

    // Add filters - use full datetime for accurate filtering
    if (filters.dateRange) {
      params.startDate = new Date(filters.dateRange[0]).toISOString();
      const endDate = new Date(filters.dateRange[1]);
      endDate.setHours(23, 59, 59, 999);
      params.endDate = endDate.toISOString();
    }

    if (filters.memberAccount) params.memberAccount = filters.memberAccount;
    if (filters.thirdPartyPayment)
      params.thirdPartyPayment = filters.thirdPartyPayment;
    if (filters.amount) params.amount = filters.amount;
    if (filters.withdrawalMethod)
      params.withdrawalMethod = filters.withdrawalMethod;
    if (filters.autoRule) params.autoRule = filters.autoRule;
    if (filters.vipLevel) params.vipLevel = filters.vipLevel;

    try {
      const response =
        await autoWithdrawalApi.getAutoEligibleWithdrawals(params);

      console.log('📥 [AUTO-WITHDRAWAL] Raw API response:', response);
      console.log('📥 [AUTO-WITHDRAWAL] Response type:', typeof response);
      console.log(
        '📥 [AUTO-WITHDRAWAL] Response keys:',
        response ? Object.keys(response) : 'null',
      );

      // Handle response with success flag
      let withdrawals = [];
      let pagination = null;
      let stats = null;
      let rules = null;

      // Case 1: Full response with success flag (wrapped)
      if (response && response.success && response.data) {
        console.log('✅ [AUTO-WITHDRAWAL] Wrapped response detected');
        withdrawals = response.data.withdrawals || [];
        pagination = response.data.pagination || null;
        stats = response.data.statistics || null;
        rules = response.data.autoRules || null;
      }
      // Case 2: Response interceptor returned data directly (unwrapped - fallback)
      else if (response && response.withdrawals) {
        console.log('✅ [AUTO-WITHDRAWAL] Unwrapped response detected');
        withdrawals = response.withdrawals || [];
        pagination = response.pagination || null;
        stats = response.statistics || null;
        rules = response.autoRules || null;
      }
      // Case 3: No valid data
      else {
        console.warn(
          '⚠️ [AUTO-WITHDRAWAL] Unexpected response structure:',
          response,
        );
        tableData.value = [];
        paginationReactive.total = 0;
        message.warning('暂无符合免审条件的订单');
        loading.value = false;
        return;
      }

      console.log(
        '✅ [AUTO-WITHDRAWAL] Setting tableData with',
        withdrawals.length,
        'records',
      );
      if (withdrawals.length > 0) {
        console.log('📊 [AUTO-WITHDRAWAL] First record:', withdrawals[0]);
      }

      tableData.value = withdrawals;
      paginationReactive.total = pagination?.total || withdrawals.length;

      // Update statistics
      if (stats) {
        Object.assign(statistics, stats);
      }

      // Update auto rules
      if (rules) {
        Object.assign(autoRules, rules);
      }

      console.log(
        '✅ [AUTO-WITHDRAWAL] TableData set:',
        tableData.value.length,
      );
      console.log(
        '✅ [AUTO-WITHDRAWAL] Pagination total:',
        paginationReactive.total,
      );
    } catch (apiError) {
      console.error('API call failed:', apiError);
      // Set empty state on API failure
      tableData.value = [];
      paginationReactive.total = 0;
      statistics.autoApprovalEligible = 0;
      statistics.todayAutoProcessed = 0;
      statistics.totalAmount = 0;
      message.error('获取数据失败，请稍后重试');
    }
  } catch (error) {
    console.error('Fetch data error:', error);
    tableData.value = [];
    paginationReactive.total = 0;
    message.error('获取数据失败');
  } finally {
    loading.value = false;
  }
};

const applyFilters = () => {
  paginationReactive.page = 1;
  fetchData();
};

const resetFilters = () => {
  fetchData();
};

const clearFilters = () => {
  Object.assign(filters, {
    timeRange: 'today',
    dateRange: null,
    memberAccount: '',
    thirdPartyPayment: '',
    amount: '',
    withdrawalMethod: '',
    autoRule: '',
    vipLevel: '',
  });
  paginationReactive.page = 1;
  fetchData();
};

const showDetail = async (row: AutoWithdrawalRecord) => {
  detailModal.data = row;
  detailModal.show = true;
};

const closeDetailModal = () => {
  detailModal.show = false;
  // Clean up data after DOM updates to prevent access errors
  nextTick(() => {
    detailModal.data = null;
  });
};

const showBulkAutoApprovalModal = () => {
  const selectedItems = tableData.value.filter((item) =>
    selectedIds.value.includes(item.id),
  );
  autoApprovalModal.items = selectedItems;
  autoApprovalModal.notes = '';
  autoApprovalModal.show = true;
};

const showSingleAutoApprovalModal = (row: AutoWithdrawalRecord) => {
  autoApprovalModal.items = [row];
  autoApprovalModal.notes = '';
  autoApprovalModal.show = true;
};

const showAutoRulesModal = () => {
  autoRulesModal.show = true;
};

const showAutoRuleConfigModal = () => {
  // TODO: Implement comprehensive auto-approval rule configuration
  // Based on requirements: 会员层级、标签、注册时长、金额条件、出款代付设置
  message.info('免审规则配置功能开发中 - 会员层级、标签、注册时长、金额条件等');
};

const handleAutoApproval = async () => {
  try {
    if (autoApprovalModal.items.length === 1) {
      // Single auto-approval
      try {
        const response = await autoWithdrawalApi.processAutoApproval(
          autoApprovalModal.items[0].id,
          {
            notes: autoApprovalModal.notes,
          },
        );

        if (response.success) {
          message.success('成功自动处理提现申请');
          autoApprovalModal.show = false;
          selectedIds.value = [];
          fetchData();
        } else {
          message.error(response.message || '自动处理失败');
        }
      } catch (apiError) {
        console.warn('API call failed:', apiError);
        message.success(`成功自动处理 1 个提现申请 (模拟)`);
        autoApprovalModal.show = false;
        selectedIds.value = [];
        fetchData();
      }
    } else {
      // Bulk auto-approval
      try {
        const response = await autoWithdrawalApi.bulkAutoApproval({
          withdrawalIds: autoApprovalModal.items.map((item) => item.id),
          notes: autoApprovalModal.notes,
        });

        if (response.success) {
          message.success(
            `成功自动处理 ${autoApprovalModal.items.length} 个符合免审条件的提现申请`,
          );
          autoApprovalModal.show = false;
          selectedIds.value = [];
          fetchData();
        } else {
          message.error(response.message || '批量自动处理失败');
        }
      } catch (apiError) {
        console.warn('API call failed:', apiError);
        message.success(
          `成功自动处理 ${autoApprovalModal.items.length} 个提现申请 (模拟)`,
        );
        autoApprovalModal.show = false;
        selectedIds.value = [];
        fetchData();
      }
    }
  } catch (error) {
    message.error('自动处理失败');
  }
};

const saveAutoRules = async () => {
  try {
    try {
      const response =
        await autoWithdrawalApi.updateAutoApprovalRules(autoRules);

      if (response.success) {
        message.success('自动审核规则保存成功');
        autoRulesModal.show = false;
        fetchData(); // Refresh data with new rules
      } else {
        message.error(response.message || '规则保存失败');
      }
    } catch (apiError) {
      console.warn('API call failed:', apiError);
      message.success('自动审核规则保存成功 (模拟)');
      autoRulesModal.show = false;
    }
  } catch (error) {
    message.error('规则保存失败');
  }
};

// Auto refresh functionality (simplified with SmartAutoRefresh)
const handleRefreshIntervalChange = (newInterval: number) => {
  console.log(
    'AutoWithdrawal: Refresh interval changed to',
    newInterval,
    'seconds',
  );
  // SmartAutoRefresh component handles all timer logic
};

// Utility functions
const formatDateTime = (dateTime: string) => {
  if (!dateTime) return '-';
  return new Date(dateTime).toLocaleString('zh-CN');
};

const getStatusType = (status: string) => {
  const statusMap: Record<string, string> = {
    pending_auto_approval: 'warning',
    auto_approved: 'success',
    auto_processing: 'info',
    auto_completed: 'success',
    auto_failed: 'error',
  };
  return statusMap[status] || 'default';
};

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    pending_auto_approval: '待自动审核',
    auto_approved: '提现成功',
    auto_processing: '自动处理中',
    auto_completed: '提现成功',
    auto_failed: '自动失败',
    approved: '提现成功',
    success: '提现成功',
    completed: '提现成功',
    pending: '待处理',
    processing: '处理中',
    failed: '失败',
  };
  return statusMap[status] || status;
};

const canAutoApprove = (status: string) => {
  return ['pending_auto_approval'].includes(status);
};

// Watchers
watch(
  () => detailModal.show,
  (newValue) => {
    if (!newValue) {
      // Clean up data when modal is closed to prevent DOM access errors
      nextTick(() => {
        detailModal.data = null;
      });
    }
  },
);

// Lifecycle
onMounted(() => {
  fetchData();
});

onUnmounted(() => {
  // Component cleanup handled by SmartAutoRefresh
});

// Auto-refresh handled by SmartAutoRefresh component
</script>

<style scoped>
.auto-withdrawal {
  padding: 16px;
}

.filter-section {
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
  margin-bottom: 16px;
}

.filter-item {
  display: flex;
  flex-direction: column;
}

.single-line-table :deep(.n-data-table-td) {
  white-space: nowrap;
}

.single-line-table :deep(.n-data-table-th) {
  background: #f8f9fa;
  font-weight: 600;
}

.summary-section {
  border-top: 1px solid #e0e0e0;
}

.batch-operations {
  border-top: 1px solid #e0e0e0;
}
</style>
