<template>
  <div class="transaction-tab">
    <!-- Transaction Summary -->
    <n-card title="交易概览" class="mb-4">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div class="stat-card">
          <div class="stat-value">{{ formatCurrency(totalTransactions) }}</div>
          <div class="stat-label">总交易金额</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ totalCount }}</div>
          <div class="stat-label">总交易笔数</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ formatCurrency(totalInflow) }}</div>
          <div class="stat-label">总流入</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ formatCurrency(totalOutflow) }}</div>
          <div class="stat-label">总流出</div>
        </div>
      </div>
    </n-card>

    <!-- Filter Section -->
    <n-card title="筛选条件" class="mb-4">
      <div class="flex flex-wrap items-end gap-4">
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium text-gray-700">交易类型</label>
          <n-select
            v-model:value="transactionTypeFilter"
            placeholder="选择交易类型"
            clearable
            style="width: 140px"
            :options="transactionTypeOptions"
            @update:value="loadTransactions"
          />
        </div>
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium text-gray-700">交易状态</label>
          <n-select
            v-model:value="transactionStatusFilter"
            placeholder="选择状态"
            clearable
            style="width: 120px"
            :options="transactionStatusOptions"
            @update:value="loadTransactions"
          />
        </div>
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium text-gray-700">开始日期</label>
          <n-date-picker
            v-model:value="startDate"
            type="date"
            placeholder="选择开始日期"
            style="width: 150px"
            @update:value="loadTransactions"
          />
        </div>
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium text-gray-700">结束日期</label>
          <n-date-picker
            v-model:value="endDate"
            type="date"
            placeholder="选择结束日期"
            style="width: 150px"
            @update:value="loadTransactions"
          />
        </div>
        <n-button
          type="primary"
          @click="loadTransactions"
          class="flex items-center gap-1"
        >
          🔍 查询
        </n-button>
        <n-button @click="handleResetFilter" class="flex items-center gap-1">
          重置
        </n-button>
      </div>
    </n-card>

    <!-- Transactions Table -->
    <n-card>
      <template #header>
        <div class="flex items-center justify-between">
          <span class="text-lg font-medium">账户交易记录</span>
          <div class="flex items-center gap-2 text-sm text-gray-500">
            <span>共 {{ transactions.length || 0 }} 条记录</span>
            <n-button size="tiny" @click="loadTransactions" class="ml-2">
              重新加载
            </n-button>
            <n-button size="tiny" @click="handleExportData" class="ml-1">
              导出数据
            </n-button>
          </div>
        </div>
      </template>
      <n-data-table
        :loading="transactionLoading"
        :columns="transactionColumns"
        :data="transactions"
        :pagination="transactionPagination"
        size="small"
        :row-key="(row: AgentTransactionRecord) => row.id"
        :scroll-x="1200"
      />
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, h, onMounted } from 'vue';
import {
  NCard,
  NButton,
  NDataTable,
  NDatePicker,
  NSelect,
  NTag,
  useMessage,
  type DataTableColumns,
} from 'naive-ui';
import {
  getAgentTransactionsApi,
  type AgentTransactionRecord,
} from '#/api/agency/agent-details';

interface Props {
  agentId?: number;
}

const props = withDefaults(defineProps<Props>(), {
  agentId: 0,
});

const message = useMessage();

// Reactive data
const transactionLoading = ref(false);
const transactions = ref<AgentTransactionRecord[]>([]);

// Filters
const transactionTypeFilter = ref('');
const transactionStatusFilter = ref('');
const startDate = ref<number | null>(null);
const endDate = ref<number | null>(null);

// Pagination
const transactionPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizePicker: true,
  pageSizes: [10, 20, 50],
  prefix: (info: any) => `共 ${info.itemCount} 条`,
  onUpdatePage: (page: number) => {
    transactionPagination.current = page;
    loadTransactions();
  },
  onUpdatePageSize: (pageSize: number) => {
    transactionPagination.pageSize = pageSize;
    transactionPagination.current = 1;
    loadTransactions();
  },
});

// Options
const transactionTypeOptions = [
  { label: '充值', value: 'deposit' },
  { label: '提现', value: 'withdrawal' },
  { label: '佣金', value: 'commission' },
  { label: '投注', value: 'betting' },
  { label: '中奖', value: 'winning' },
  { label: '活动', value: 'bonus' },
  { label: '其他', value: 'other' },
];

const transactionStatusOptions = [
  { label: '成功', value: 'success' },
  { label: '处理中', value: 'processing' },
  { label: '失败', value: 'failed' },
  { label: '已取消', value: 'cancelled' },
];

// Computed
const totalTransactions = computed(() => {
  return transactions.value.reduce(
    (sum, record) => sum + Math.abs(record.amount),
    0,
  );
});

const totalCount = computed(() => transactions.value.length);

const totalInflow = computed(() => {
  return transactions.value
    .filter((record) => record.amount > 0)
    .reduce((sum, record) => sum + record.amount, 0);
});

const totalOutflow = computed(() => {
  return transactions.value
    .filter((record) => record.amount < 0)
    .reduce((sum, record) => sum + Math.abs(record.amount), 0);
});

// Table columns
const transactionColumns: DataTableColumns<AgentTransactionRecord> = [
  {
    title: '交易ID',
    key: 'id',
    width: 80,
    align: 'center',
    render: (row) => {
      return h(
        'span',
        { class: 'text-xs text-gray-500 font-mono' },
        `#${row.id}`,
      );
    },
  },
  {
    title: '交易类型',
    key: 'type',
    width: 120,
    render: (row) => {
      const typeMap = {
        deposit: { label: '充值', type: 'success', icon: '💰' },
        withdrawal: { label: '提现', type: 'warning', icon: '💸' },
        commission: { label: '佣金', type: 'info', icon: '💼' },
        betting: { label: '投注', type: 'error', icon: '🎯' },
        winning: { label: '中奖', type: 'success', icon: '🎉' },
        bonus: { label: '活动', type: 'info', icon: '🎁' },
        other: { label: '其他', type: 'default', icon: '📝' },
      };
      const typeInfo = typeMap[row.type as keyof typeof typeMap] || {
        label: row.type,
        type: 'default',
        icon: '❓',
      };
      return h('div', { class: 'flex items-center gap-2' }, [
        h('span', { class: 'text-lg' }, typeInfo.icon),
        h(
          NTag,
          { type: typeInfo.type, size: 'small' },
          { default: () => typeInfo.label },
        ),
      ]);
    },
  },
  {
    title: '交易金额',
    key: 'amount',
    width: 140,
    align: 'right',
    render: (row) => {
      const isPositive = row.amount >= 0;
      const color = isPositive ? 'text-green-600' : 'text-red-600';
      const sign = isPositive ? '+' : '';
      return h('div', { class: `font-semibold ${color}` }, [
        h('span', { class: 'text-sm' }, sign),
        h('span', formatCurrency(Math.abs(row.amount))),
      ]);
    },
  },
  {
    title: '账户余额',
    key: 'balance',
    width: 140,
    align: 'right',
    render: (row) => {
      return h(
        'span',
        { class: 'font-semibold text-blue-600' },
        formatCurrency(row.balance),
      );
    },
  },
  {
    title: '状态',
    key: 'status',
    width: 100,
    align: 'center',
    render: (row) => {
      const statusMap = {
        success: { label: '成功', type: 'success', icon: '✅' },
        processing: { label: '处理中', type: 'warning', icon: '⏳' },
        failed: { label: '失败', type: 'error', icon: '❌' },
        cancelled: { label: '已取消', type: 'default', icon: '🚫' },
      };
      const status = statusMap[row.status as keyof typeof statusMap] || {
        label: row.status,
        type: 'default',
        icon: '❓',
      };
      return h('div', { class: 'flex items-center justify-center gap-1' }, [
        h('span', { class: 'text-sm' }, status.icon),
        h(
          NTag,
          { type: status.type, size: 'small' },
          { default: () => status.label },
        ),
      ]);
    },
  },
  {
    title: '描述',
    key: 'description',
    width: 200,
    ellipsis: true,
    tooltip: true,
  },
  {
    title: '交易时间',
    key: 'transactionTime',
    width: 180,
    render: (row) => {
      return h('div', { class: 'text-sm' }, [
        h('div', { class: 'font-medium' }, formatDateTime(row.transactionTime)),
      ]);
    },
  },
  {
    title: '参考号',
    key: 'referenceId',
    width: 120,
    render: (row) => {
      return row.referenceId
        ? h(
            'span',
            { class: 'text-xs font-mono text-gray-600' },
            row.referenceId,
          )
        : h('span', { class: 'text-gray-400' }, '--');
    },
  },
  {
    title: '操作员',
    key: 'operator',
    width: 100,
    render: (row) => {
      if (!row.operator) return h('span', { class: 'text-gray-400' }, '--');
      const operatorMap = {
        system: { label: '系统', type: 'info' },
        user: { label: '用户', type: 'success' },
        admin: { label: '管理员', type: 'warning' },
      };
      const operator = operatorMap[
        row.operator as keyof typeof operatorMap
      ] || { label: row.operator, type: 'default' };
      return h(
        NTag,
        { type: operator.type, size: 'small' },
        { default: () => operator.label },
      );
    },
  },
];

// Methods
const loadTransactions = async () => {
  if (!props.agentId) return;

  transactionLoading.value = true;
  try {
    const params: any = {
      page: transactionPagination.current,
      pageSize: transactionPagination.pageSize,
    };

    if (transactionTypeFilter.value) {
      params.type = transactionTypeFilter.value;
    }

    if (transactionStatusFilter.value) {
      params.status = transactionStatusFilter.value;
    }

    if (startDate.value) {
      params.startDate = new Date(startDate.value).toISOString();
    }

    if (endDate.value) {
      const end = new Date(endDate.value);
      end.setHours(23, 59, 59, 999);
      params.endDate = end.toISOString();
    }

    const response = await getAgentTransactionsApi(props.agentId, params);
    transactions.value = response.list;
    transactionPagination.total = response.pagination.total;
    transactionPagination.current = 1;
  } catch (error) {
    console.error('Failed to load transactions:', error);
    message.error('加载交易记录失败');
  } finally {
    transactionLoading.value = false;
  }
};

const handleResetFilter = () => {
  transactionTypeFilter.value = '';
  transactionStatusFilter.value = '';
  startDate.value = null;
  endDate.value = null;
  transactionPagination.current = 1;
  loadTransactions();
};

const handleExportData = () => {
  message.info('导出数据功能开发中...');
};

const formatCurrency = (amount: number) => {
  return `R$ ${Number(amount).toFixed(2)}`;
};

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN');
};

onMounted(() => {
  if (props.agentId) {
    loadTransactions();
  }
});
</script>

<style scoped>
.transaction-tab {
  padding: 16px;
}

.mb-4 {
  margin-bottom: 1rem;
}

.ml-2 {
  margin-left: 0.5rem;
}

.ml-1 {
  margin-left: 0.25rem;
}

.text-sm {
  font-size: 0.875rem;
}

.text-xs {
  font-size: 0.75rem;
}

.font-medium {
  font-weight: 500;
}

.font-semibold {
  font-weight: 600;
}

.font-mono {
  font-family:
    ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation Mono', Menlo,
    monospace;
}

.text-gray-500 {
  color: #6b7280;
}

.text-gray-600 {
  color: #4b5563;
}

.text-gray-400 {
  color: #9ca3af;
}

.text-gray-700 {
  color: #374151;
}

.text-green-600 {
  color: #059669;
}

.text-red-600 {
  color: #dc2626;
}

.text-blue-600 {
  color: #2563eb;
}

.grid {
  display: grid;
}

.grid-cols-1 {
  grid-template-columns: repeat(1, minmax(0, 1fr));
}

.md\:grid-cols-4 {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.gap-4 {
  gap: 1rem;
}

.gap-2 {
  gap: 0.5rem;
}

.gap-1 {
  gap: 0.25rem;
}

.flex {
  display: flex;
}

.flex-wrap {
  flex-wrap: wrap;
}

.items-center {
  align-items: center;
}

.justify-between {
  justify-content: space-between;
}

.justify-center {
  justify-content: center;
}

.stat-card {
  text-align: center;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  background-color: #f9fafb;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
}
</style>
