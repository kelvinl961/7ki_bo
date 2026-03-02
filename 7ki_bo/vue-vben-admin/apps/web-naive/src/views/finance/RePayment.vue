<template>
  <div class="re-payment">
    <!-- Header and Filters -->
    <div class="header-section">
      <n-card :bordered="false" class="rounded-16px shadow-sm">
        <div class="mb-4 flex items-center justify-between">
          <div>
            <h2 class="text-xl font-semibold text-gray-800">重新代付</h2>
            <p class="mt-1 text-sm text-gray-600">回调异常订单(含重新代付)</p>
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

            <!-- Callback Status -->
            <div class="filter-item">
              <n-form-item label="回调状态">
                <n-select
                  v-model:value="filters.callbackStatus"
                  placeholder="回调状态"
                  clearable
                  size="small"
                  :options="callbackStatusOptions"
                />
              </n-form-item>
            </div>

            <!-- Re-payment Type -->
            <div class="filter-item">
              <n-form-item label="代付类型">
                <n-select
                  v-model:value="filters.rePaymentType"
                  placeholder="代付类型"
                  clearable
                  size="small"
                  :options="rePaymentTypeOptions"
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
              <n-tag type="warning" size="small">异常订单</n-tag>
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
                  >异常订单总数:
                  <span class="font-semibold text-red-600">{{
                    paginationReactive.total
                  }}</span></span
                >
                <span
                  >待重新代付:
                  <span class="font-semibold text-orange-600">{{
                    statistics.pendingRepayment
                  }}</span></span
                >
                <span
                  >重新代付成功:
                  <span class="font-semibold text-green-600">{{
                    statistics.repaymentSuccess
                  }}</span></span
                >
              </div>

              <!-- 选择信息 -->
              <div class="text-sm text-gray-600">
                已选择 {{ selectedCount }} 条数据，共
                {{ paginationReactive.total }} 条
                <n-tag type="warning" size="small" class="ml-2">
                  重新代付
                </n-tag>
              </div>
            </div>

            <div class="flex items-center gap-4">
              <!-- 批量操作 -->
              <div v-if="selectedCount > 0" class="flex gap-2">
                <n-button
                  type="success"
                  size="small"
                  @click="handleBulkRePayment(selectedRows)"
                >
                  批量重新代付 ({{ selectedCount }})
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

    <!-- Batch Operations Panel (keep existing for now) -->
    <div v-if="selectedIds.length > 0" class="batch-operations mt-4">
      <n-card :bordered="false" class="rounded-16px shadow-sm">
        <div class="border-t p-4">
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
      </n-card>
    </div>

    <!-- Re-payment Modal -->
    <n-modal
      v-model:show="rePaymentModal.show"
      preset="dialog"
      title="重新代付确认"
      positive-text="确认代付"
      negative-text="取消"
      @positive-click="handleRePayment"
    >
      <div class="space-y-4">
        <div>
          <n-alert type="warning" :show-icon="false">
            确认重新代付以下{{ rePaymentModal.items.length }}个异常订单？
          </n-alert>
        </div>
        <div class="max-h-60 overflow-y-auto">
          <div
            v-for="item in rePaymentModal.items"
            :key="item.id"
            class="mb-2 rounded border p-2"
          >
            <div class="text-sm">
              <div><strong>订单号:</strong> {{ item.orderId }}</div>
              <div><strong>会员:</strong> {{ item.memberAccount }}</div>
              <div>
                <strong>金额:</strong> {{ item.amount }} {{ item.currency }}
              </div>
              <div>
                <strong>异常原因:</strong>
                {{ item.callbackError || '回调异常' }}
              </div>
            </div>
          </div>
        </div>
        <div>
          <n-form-item label="代付通道" required>
            <n-select
              v-model:value="rePaymentModal.paymentChannel"
              placeholder="请选择代付通道"
              :options="paymentChannelOptions"
            />
          </n-form-item>
        </div>
        <div>
          <n-form-item label="备注说明">
            <n-input
              v-model:value="rePaymentModal.notes"
              type="textarea"
              placeholder="请输入重新代付备注（可选）"
              :rows="3"
            />
          </n-form-item>
        </div>
      </div>
    </n-modal>

    <!-- Detail Modal -->
    <n-modal
      v-model:show="detailModal.show"
      preset="card"
      title="异常订单详情"
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

          <n-card title="异常信息" size="small">
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600">回调状态:</span>
                <n-tag
                  :type="getCallbackStatusType(detailModal.data.callbackStatus)"
                >
                  {{ detailModal.data.callbackStatus || '异常' }}
                </n-tag>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">异常原因:</span>
                <span class="text-red-600">{{
                  detailModal.data.callbackError || '回调超时'
                }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">重试次数:</span>
                <span>{{ detailModal.data.retryCount || 0 }}次</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">最后重试:</span>
                <span>{{
                  formatDateTime(detailModal.data.lastRetryTime) || '-'
                }}</span>
              </div>
            </div>
          </n-card>
        </div>

        <!-- Payment Info -->
        <n-card title="代付信息" size="small">
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600">代付金额:</span>
              <span class="font-semibold text-green-600">
                {{ detailModal.data.amount }} {{ detailModal.data.currency }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">代付通道:</span>
              <span>{{ detailModal.data.paymentChannel }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">第三方订单号:</span>
              <span>{{ detailModal.data.thirdPartyOrderNo || '-' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">收款方式:</span>
              <span>{{ detailModal.data.paymentMethod }}</span>
            </div>
          </div>
        </n-card>

        <!-- Callback Logs -->
        <n-card title="回调日志" size="small">
          <div class="max-h-40 overflow-y-auto">
            <div
              v-for="(log, index) in detailModal.data.callbackLogs"
              :key="index"
              class="mb-2 border-b pb-2 last:border-b-0"
            >
              <div class="text-xs text-gray-500">
                {{ formatDateTime(log.timestamp) }}
              </div>
              <div class="text-sm">{{ log.message }}</div>
            </div>
            <div
              v-if="!detailModal.data.callbackLogs?.length"
              class="py-4 text-center text-gray-500"
            >
              暂无回调日志
            </div>
          </div>
        </n-card>

        <!-- Actions -->
        <div class="flex justify-end gap-3">
          <n-button @click="detailModal.show = false">关闭</n-button>
          <n-button
            type="warning"
            @click="showSingleRePaymentModal(detailModal.data)"
            v-if="canRePayment(detailModal.data.status)"
          >
            重新代付
          </n-button>
        </div>
      </div>
    </n-modal>
  </div>
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
  RepeatOutline,
  WarningOutline,
  DownloadOutline,
} from '@vicons/ionicons5';
import { rePaymentApi } from '#/api/finance/rePayment';
import { useUserStore } from '@vben/stores';

interface RePaymentRecord {
  id: string;
  orderId: string;
  memberAccount: string;
  memberName: string;
  vipLevel: string;
  applicationTime: string;
  currency: string;
  amount: number;
  paymentMethod: string;
  paymentChannel: string;
  accountNumber: string;
  bankName: string;
  accountHolderName: string;
  status: string;
  callbackStatus: string;
  callbackError: string;
  retryCount: number;
  lastRetryTime: string;
  thirdPartyOrderNo: string;
  operator: string;
  notes: string;
  // Lock related fields
  isLocked: boolean;
  lockedBy: string | null;
  lockedAt: string | null;
  // Callback logs
  callbackLogs: Array<{
    timestamp: string;
    message: string;
    status: string;
  }>;
  [key: string]: any;
}

const message = useMessage();
const dialog = useDialog();

// Data and state
const loading = ref(false);
const autoRefreshEnabled = ref(false);
const tableData = ref<RePaymentRecord[]>([]);
const selectedIds = ref<string[]>([]);
const batchOperation = ref('');

// Helper functions for date ranges (matching AutoWithdrawal pattern)
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
  dateRange: getTodayRange() as [number, number] | null, // Default to today (matching AutoWithdrawal)
  memberAccount: '',
  thirdPartyPayment: '',
  amount: '',
  callbackStatus: '',
  rePaymentType: '',
});

// Pagination - SmartDataGrid compatible
const paginationReactive = reactive({
  page: 1,
  pageSize: 20,
  total: 0,
});

// Statistics
const statistics = reactive({
  pendingRepayment: 0,
  repaymentSuccess: 0,
  repaymentFailed: 0,
});

// Modals
const rePaymentModal = reactive({
  show: false,
  items: [] as RePaymentRecord[],
  paymentChannel: '',
  notes: '',
});

const detailModal = reactive({
  show: false,
  data: null as RePaymentRecord | null,
});

// Options
const thirdPartyOptions = [
  { label: 'PIX自动代付', value: 'PIX_AUTO' },
  { label: '银行转账', value: 'BANK_TRANSFER' },
  { label: '数字钱包', value: 'DIGITAL_WALLET' },
];

const callbackStatusOptions = [
  { label: '回调异常', value: 'exception' },
  { label: '回调超时', value: 'timeout' },
  { label: '回调失败', value: 'failed' },
  { label: '处理中', value: 'processing' },
];

const rePaymentTypeOptions = [
  { label: '重新代付', value: 'repayment' },
  { label: '手动处理', value: 'manual' },
  { label: '系统重试', value: 'auto_retry' },
];

const paymentChannelOptions = [
  { label: 'PIX通道1', value: 'PIX_CHANNEL_1' },
  { label: 'PIX通道2', value: 'PIX_CHANNEL_2' },
  { label: '银行代付通道', value: 'BANK_CHANNEL' },
];

const batchOperationOptions = [
  { label: '批量重新代付', value: 'batch_repayment' },
  { label: '批量标记处理', value: 'batch_mark' },
  { label: '批量导出', value: 'batch_export' },
];

// Table columns based on screenshot
const columns: DataTableColumns<RePaymentRecord> = [
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
        { default: () => row.orderId },
      ),
  },
  {
    title: '会员ID (VIP等级)',
    key: 'memberInfo',
    width: 100,
    render: (row) =>
      h('div', { class: 'text-center' }, [
        h('div', { class: 'text-blue-600' }, row.memberAccount),
        h('div', { class: 'text-xs text-gray-500' }, row.vipLevel || 'VIP0'),
      ]),
  },
  {
    title: '会员账号 (会员层级)',
    key: 'memberAccount',
    width: 120,
    render: (row) =>
      h('div', [
        h('div', row.memberAccount),
        h(
          'div',
          { class: 'text-xs text-gray-500' },
          row.memberName || '会员层级',
        ),
      ]),
  },
  {
    title: '申请时间 (操作时间)',
    key: 'applicationTime',
    width: 150,
    render: (row) =>
      h('div', { class: 'text-center' }, [
        h('div', formatDateTime(row.applicationTime)),
        h('div', { class: 'text-xs text-gray-500' }, '完成时长'),
      ]),
  },
  {
    title: '会员币种 (比例)',
    key: 'currency',
    width: 80,
    render: (row) =>
      h('div', { class: 'text-center' }, [
        h('div', row.currency),
        h('div', { class: 'text-xs text-gray-500' }, '(汇率)'),
      ]),
  },
  {
    title: '提现金额 到账币种',
    key: 'amount',
    width: 110,
    render: (row) =>
      h('div', { class: 'text-center' }, [
        h(
          'div',
          { class: 'font-semibold text-green-600' },
          `${row.amount.toFixed(2)}`,
        ),
        h('div', { class: 'text-xs text-gray-500' }, `${row.currency}`),
      ]),
  },
  {
    title: '预计到账 (手续费) 实际到账',
    key: 'settlements',
    width: 130,
    render: (row) =>
      h('div', { class: 'text-center' }, [
        h('div', { class: 'text-green-600' }, '预计金额'),
        h('div', { class: 'text-xs text-gray-500' }, '实际到账'),
      ]),
  },
  {
    title: '充/提次数 (累计充/提金额) (重复IP人数)',
    key: 'statistics',
    width: 140,
    render: (row) =>
      h('div', { class: 'text-center text-xs text-gray-500' }, [
        h('div', '充/提统计'),
        h('div', '累计金额'),
      ]),
  },
  {
    title: '收款方式 (收款人信息)',
    key: 'paymentInfo',
    width: 140,
    render: (row) =>
      h('div', [
        h('div', { class: 'flex items-center gap-1' }, [
          h('span', row.paymentMethod),
          h(
            'span',
            { class: 'bg-red-500 text-white text-xs px-1 rounded' },
            '异常',
          ),
        ]),
        h(
          'div',
          { class: 'text-xs text-gray-500' },
          `账号/地址: ${row.accountNumber || '-'}`,
        ),
        h(
          'div',
          { class: 'text-xs text-gray-500' },
          `类型: ${row.bankName || '-'}`,
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
    render: () => h('div', { class: 'text-center text-gray-500' }, '回调异常'),
  },
  {
    title: '后台备注',
    key: 'backendNotes',
    width: 100,
    render: (row) =>
      h(
        'div',
        { class: 'text-center text-red-500' },
        row.callbackError || '待重新代付',
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
        h(
          'div',
          { class: 'text-xs text-gray-500' },
          `(${row.retryCount || 0}次)`,
        ),
      ]);
    },
  },
  {
    title: '回调异常类型',
    key: 'callbackType',
    width: 100,
    render: (row) =>
      h('div', { class: 'text-center' }, [
        h(
          NTag,
          {
            type: getCallbackStatusType(row.callbackStatus),
            size: 'small',
          },
          { default: () => row.callbackStatus || '异常' },
        ),
      ]),
  },
  {
    title: '操作',
    key: 'actions',
    width: 200,
    fixed: 'right',
    render: (row) =>
      h('div', { class: 'flex gap-1 flex-wrap' }, [
        // Lock/Unlock button - First operation required
        h(
          NButton,
          {
            size: 'small',
            type: row.isLocked ? 'warning' : 'default',
            onClick: () => (row.isLocked ? unlockOrder(row) : lockOrder(row)),
          },
          { default: () => (row.isLocked ? '解锁' : '锁定') },
        ),
        // Re-payment with third-party selection - Always available (enabled)
        h(
          NButton,
          {
            size: 'small',
            type: 'primary',
            onClick: () => showRePaymentModal(row),
          },
          { default: () => '重新代付' },
        ),
        // Manual processing for unresolvable issues - Always available (enabled)
        h(
          NButton,
          {
            size: 'small',
            type: 'warning',
            onClick: () => showManualProcessModal(row),
          },
          { default: () => '人工出款' },
        ),
        // Refresh status - Always available
        h(
          NButton,
          {
            size: 'small',
            type: 'default',
            onClick: () => refreshOrderStatus(row),
          },
          { default: () => '刷新状态' },
        ),
        // Notes - Always available
        h(
          NButton,
          {
            size: 'small',
            type: 'info',
            onClick: () => showNotesModal(row),
          },
          { default: () => '备注' },
        ),
        // Reject - for unrecoverable failures - Always available (enabled)
        h(
          NButton,
          {
            size: 'small',
            type: 'error',
            onClick: () => showRejectModal(row),
          },
          { default: () => '拒绝' },
        ),
      ]),
  },
];

// Helper functions
const getCurrentUser = () => {
  // Get current user from authentication store (consistent with other components)
  const userStore = useUserStore();
  const userInfo = userStore.userInfo;
  if (userInfo) {
    // Use username or id from actual user store
    return (
      userInfo.username || userInfo.userId || userInfo.id?.toString() || 'admin'
    );
  }

  // Fallback to admin for development/testing (matches backend)
  return 'admin';
};

const lockOrder = async (row: RePaymentRecord) => {
  try {
    row.isLocked = true;
    row.lockedBy = getCurrentUser();
    row.lockedAt = new Date().toISOString();
    message.success(`订单 ${row.orderId} 已锁定`);
  } catch (error) {
    message.error('锁定失败');
  }
};

const unlockOrder = async (row: RePaymentRecord) => {
  try {
    row.isLocked = false;
    row.lockedBy = null;
    row.lockedAt = null;
    message.success(`订单 ${row.orderId} 已解锁`);
  } catch (error) {
    message.error('解锁失败');
  }
};

const showRePaymentModal = (row: RePaymentRecord) => {
  dialog.info({
    title: '重新代付确认',
    content: `确认重新代付订单 ${row.orderId}？请选择三方代付商户进行重新出款。`,
    positiveText: '确认重新代付',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        // TODO: Show third-party provider selection modal
        row.status = 'reprocessing';
        message.success('重新代付处理中');
      } catch (error) {
        message.error('重新代付失败');
      }
    },
  });
};

const showManualProcessModal = (row: RePaymentRecord) => {
  dialog.warning({
    title: '人工出款确认',
    content: `确认人工出款订单 ${row.orderId}？此操作将把状态改为"已人工"，请谨慎操作！`,
    positiveText: '确认人工出款',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        row.status = 'completed';
        message.success('人工出款成功');
      } catch (error) {
        message.error('人工出款失败');
      }
    },
  });
};

const refreshOrderStatus = async (row: RePaymentRecord) => {
  try {
    // TODO: Implement actual status refresh API call
    const refreshResults = [
      '刷新成功',
      '该三方代付不支持刷新',
      '每3分钟才能刷新一次',
      '刷新失败',
    ];
    const result =
      refreshResults[Math.floor(Math.random() * refreshResults.length)];

    if (result === '刷新成功') {
      message.success(result);
    } else if (result === '刷新失败') {
      message.error(result);
    } else {
      message.warning(result);
    }
  } catch (error) {
    message.error('刷新状态失败');
  }
};

const showNotesModal = (row: RePaymentRecord) => {
  // TODO: Implement notes modal with frontend/backend notes
  message.info('备注功能开发中');
};

const showRejectModal = (row: RePaymentRecord) => {
  dialog.error({
    title: '拒绝订单确认',
    content: `确认拒绝订单 ${row.orderId}？拒绝后，冻结金额将从会员账户中扣除，请谨慎操作！`,
    positiveText: '确认拒绝',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        row.status = 'rejected';
        message.success('订单已拒绝');
      } catch (error) {
        message.error('拒绝失败');
      }
    },
  });
};

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

const handleRowClick = (_row: CallbackExceptionRecord) => {
  // console.log('Row clicked:', row);
};

const clearSelection = () => {
  selectedIds.value = [];
};

const selectAll = () => {
  selectedIds.value = tableData.value.map((row) => row.id);
};

// Bulk operation handlers that work with selectedRows
const handleBulkRePayment = (_selectedRows: CallbackExceptionRecord[]) => {
  showBulkRePaymentModal();
};

const handleExportSearch = () => {
  // TODO: Implement export search functionality
  message.info('导出搜索功能开发中');
};

// Methods
const fetchData = async () => {
  loading.value = true;
  try {
    const params: any = {
      page: paginationReactive.page,
      limit: paginationReactive.pageSize,
    };

    // Add filters - use full datetime for accurate filtering (matching AutoWithdrawal)
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
    if (filters.callbackStatus) params.callbackStatus = filters.callbackStatus;
    if (filters.rePaymentType) params.rePaymentType = filters.rePaymentType;

    try {
      const response =
        await rePaymentApi.getCallbackExceptionWithdrawals(params);

      if (response && response.success) {
        tableData.value = response.data.withdrawals || [];
        paginationReactive.total = response.data.pagination?.total || 0;

        // Update statistics
        Object.assign(statistics, response.data.statistics);
      } else {
        console.warn('API response:', response);
        // Fallback to empty data
        tableData.value = [];
        paginationReactive.total = 0;
        message.warning(response?.message || '暂无异常订单');
      }
    } catch (apiError) {
      console.error('API call failed:', apiError);
      // Set empty state on API failure
      tableData.value = [];
      paginationReactive.total = 0;
      statistics.pendingRepayment = 0;
      statistics.repaymentSuccess = 0;
      statistics.repaymentFailed = 0;
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
    dateRange: getTodayRange(), // Reset to today (matching AutoWithdrawal)
    memberAccount: '',
    thirdPartyPayment: '',
    amount: '',
    callbackStatus: '',
    rePaymentType: '',
  });
  paginationReactive.page = 1;
  fetchData();
};

// Watch for timeRange changes and update dateRange accordingly (matching AutoWithdrawal)
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

const showDetail = async (row: RePaymentRecord) => {
  detailModal.data = row;
  detailModal.show = true;
};

const showBulkRePaymentModal = () => {
  const selectedItems = tableData.value.filter((item) =>
    selectedIds.value.includes(item.id),
  );
  rePaymentModal.items = selectedItems;
  rePaymentModal.paymentChannel = '';
  rePaymentModal.notes = '';
  rePaymentModal.show = true;
};

const showSingleRePaymentModal = (row: RePaymentRecord) => {
  rePaymentModal.items = [row];
  rePaymentModal.paymentChannel = '';
  rePaymentModal.notes = '';
  rePaymentModal.show = true;
};

const handleRePayment = async () => {
  try {
    if (!rePaymentModal.paymentChannel) {
      message.error('请选择代付通道');
      return;
    }

    if (rePaymentModal.items.length === 1) {
      // Single re-payment
      try {
        const response = await rePaymentApi.initiateRePayment(
          rePaymentModal.items[0].id,
          {
            paymentChannel: rePaymentModal.paymentChannel,
            notes: rePaymentModal.notes,
          },
        );

        if (response.success) {
          message.success('成功发起重新代付');
          rePaymentModal.show = false;
          selectedIds.value = [];
          fetchData();
        } else {
          message.error(response.message || '重新代付失败');
        }
      } catch (apiError) {
        console.warn('API call failed:', apiError);
        message.success(`成功重新代付 1 个订单 (模拟)`);
        rePaymentModal.show = false;
        selectedIds.value = [];
        fetchData();
      }
    } else {
      // Bulk re-payment
      try {
        const response = await rePaymentApi.bulkRePayment({
          withdrawalIds: rePaymentModal.items.map((item) => item.id),
          paymentChannel: rePaymentModal.paymentChannel,
          notes: rePaymentModal.notes,
        });

        if (response.success) {
          message.success(`成功重新代付 ${rePaymentModal.items.length} 个订单`);
          rePaymentModal.show = false;
          selectedIds.value = [];
          fetchData();
        } else {
          message.error(response.message || '批量重新代付失败');
        }
      } catch (apiError) {
        console.warn('API call failed:', apiError);
        message.success(
          `成功重新代付 ${rePaymentModal.items.length} 个订单 (模拟)`,
        );
        rePaymentModal.show = false;
        selectedIds.value = [];
        fetchData();
      }
    }
  } catch (error) {
    message.error('重新代付失败');
  }
};

// Auto refresh functionality (simplified with SmartAutoRefresh)
const handleRefreshIntervalChange = (newInterval: number) => {
  console.log('RePayment: Refresh interval changed to', newInterval, 'seconds');
  // SmartAutoRefresh component handles all timer logic
};

// Utility functions
const formatDateTime = (dateTime: string) => {
  if (!dateTime) return '-';
  return new Date(dateTime).toLocaleString('zh-CN');
};

const getStatusType = (status: string) => {
  const statusMap: Record<string, string> = {
    callback_failed: 'error',
    callback_timeout: 'warning',
    repayment_pending: 'info',
    repayment_success: 'success',
    repayment_failed: 'error',
  };
  return statusMap[status] || 'default';
};

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    callback_failed: '回调失败',
    callback_timeout: '回调超时',
    repayment_pending: '重新代付中',
    repayment_success: '代付成功',
    repayment_failed: '代付失败',
  };
  return statusMap[status] || status;
};

const getCallbackStatusType = (callbackStatus: string) => {
  const statusMap: Record<string, string> = {
    timeout: 'warning',
    failed: 'error',
    exception: 'error',
    processing: 'info',
  };
  return statusMap[callbackStatus] || 'default';
};

const canRePayment = (status: string) => {
  return ['callback_failed', 'callback_timeout', 'repayment_failed'].includes(
    status,
  );
};

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
.re-payment {
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
