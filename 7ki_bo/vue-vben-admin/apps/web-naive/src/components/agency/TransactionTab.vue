<template>
  <div class="transaction-tab">
    <n-card :title="$t('agency.transaction.overview')" class="mb-4">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div class="stat-card">
          <div class="stat-value">{{ formatCurrency(totalTransactions) }}</div>
          <div class="stat-label">{{ $t('agency.transaction.totalAmount') }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ totalCount }}</div>
          <div class="stat-label">{{ $t('agency.transaction.totalCount') }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ formatCurrency(totalInflow) }}</div>
          <div class="stat-label">{{ $t('agency.transaction.totalInflow') }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ formatCurrency(totalOutflow) }}</div>
          <div class="stat-label">{{ $t('agency.transaction.totalOutflow') }}</div>
        </div>
      </div>
    </n-card>

    <n-card :title="$t('agency.transaction.filterConditions')" class="mb-4">
      <div class="flex flex-wrap items-end gap-4">
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium text-gray-700">{{ $t('agency.transaction.transactionType') }}</label>
          <n-select
            v-model:value="transactionTypeFilter"
            :placeholder="$t('agency.transaction.selectTransactionType')"
            clearable
            style="width: 140px"
            :options="transactionTypeOptions"
            @update:value="loadTransactions"
          />
        </div>
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium text-gray-700">{{ $t('agency.transaction.transactionStatus') }}</label>
          <n-select
            v-model:value="transactionStatusFilter"
            :placeholder="$t('agency.transaction.selectStatus')"
            clearable
            style="width: 120px"
            :options="transactionStatusOptions"
            @update:value="loadTransactions"
          />
        </div>
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium text-gray-700">{{ $t('agency.transaction.startDate') }}</label>
          <n-date-picker
            v-model:value="startDate"
            type="date"
            :time-zone="timezone"
            :placeholder="$t('agency.transaction.selectStartDate')"
            style="width: 150px"
            @update:value="loadTransactions"
          />
        </div>
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium text-gray-700">{{ $t('agency.transaction.endDate') }}</label>
          <n-date-picker
            v-model:value="endDate"
            type="date"
            :time-zone="timezone"
            :placeholder="$t('agency.transaction.selectEndDate')"
            style="width: 150px"
            @update:value="loadTransactions"
          />
        </div>
        <n-button
          type="primary"
          @click="loadTransactions"
          class="flex items-center gap-1"
        >
          🔍 {{ $t('common.query') }}
        </n-button>
        <n-button @click="handleResetFilter" class="flex items-center gap-1">
          {{ $t('common.reset') }}
        </n-button>
      </div>
    </n-card>

    <n-card>
      <template #header>
        <div class="flex items-center justify-between">
          <span class="text-lg font-medium">{{
            $t('agency.transaction.transactionRecords')
          }}</span>
          <div class="flex items-center gap-2 text-sm text-gray-500">
            <span>{{
              $t('agency.transaction.recordCount', [transactions.length || 0])
            }}</span>
            <n-button size="tiny" @click="loadTransactions" class="ml-2">
              {{ $t('agency.transaction.reload') }}
            </n-button>
            <n-button size="tiny" @click="handleExportData" class="ml-1">
              {{ $t('agency.transaction.exportData') }}
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
import { $t } from '@vben/locales';

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
import { renderTzDateTime } from '#/components/common/tzDateTimeRender';
import { useDisplayTimezone } from '#/composables/useDisplayTimezone';
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
const { timezone } = useDisplayTimezone();
const transactionLoading = ref(false);
const transactions = ref<AgentTransactionRecord[]>([]);
const transactionTypeFilter = ref('');
const transactionStatusFilter = ref('');
const startDate = ref<number | null>(null);
const endDate = ref<number | null>(null);

const transactionPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizePicker: true,
  pageSizes: [10, 20, 50],
  prefix: (info: { itemCount: number }) =>
    $t('agency.transaction.recordCount', [info.itemCount]),
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

const transactionTypeOptions = computed(() => [
  { label: $t('agency.transaction.deposit'), value: 'deposit' },
  { label: $t('agency.transaction.withdrawal'), value: 'withdrawal' },
  { label: $t('agency.transaction.commission'), value: 'commission' },
  { label: $t('agency.transaction.betting'), value: 'betting' },
  { label: $t('agency.transaction.winning'), value: 'winning' },
  { label: $t('agency.transaction.bonus'), value: 'bonus' },
  { label: $t('agency.transaction.other'), value: 'other' },
]);

const transactionStatusOptions = computed(() => [
  { label: $t('common.success'), value: 'success' },
  { label: $t('agency.transaction.processing'), value: 'processing' },
  { label: $t('common.failed'), value: 'failed' },
  { label: $t('agency.transaction.cancelled'), value: 'cancelled' },
]);

const totalTransactions = computed(() =>
  transactions.value.reduce((sum, record) => sum + Math.abs(record.amount), 0),
);
const totalCount = computed(() => transactions.value.length);
const totalInflow = computed(() =>
  transactions.value
    .filter((record) => record.amount > 0)
    .reduce((sum, record) => sum + record.amount, 0),
);
const totalOutflow = computed(() =>
  transactions.value
    .filter((record) => record.amount < 0)
    .reduce((sum, record) => sum + Math.abs(record.amount), 0),
);

const getTypeInfo = (type: string) => {
  const map: Record<string, { label: string; type: string; icon: string }> = {
    deposit: { label: $t('agency.transaction.deposit'), type: 'success', icon: '💰' },
    withdrawal: {
      label: $t('agency.transaction.withdrawal'),
      type: 'warning',
      icon: '💸',
    },
    commission: { label: $t('agency.transaction.commission'), type: 'info', icon: '💼' },
    betting: { label: $t('agency.transaction.betting'), type: 'error', icon: '🎯' },
    winning: { label: $t('agency.transaction.winning'), type: 'success', icon: '🎉' },
    bonus: { label: $t('agency.transaction.bonus'), type: 'info', icon: '🎁' },
    other: { label: $t('agency.transaction.other'), type: 'default', icon: '📝' },
  };
  return map[type] || { label: type, type: 'default', icon: '❓' };
};

const transactionColumns = computed<DataTableColumns<AgentTransactionRecord>>(
  () => [
    {
      title: $t('agency.transaction.transactionId'),
      key: 'id',
      width: 80,
      align: 'center',
      render: (row) =>
        h('span', { class: 'text-xs text-gray-500 font-mono' }, `#${row.id}`),
    },
    {
      title: $t('agency.transaction.transactionType'),
      key: 'type',
      width: 120,
      render: (row) => {
        const typeInfo = getTypeInfo(row.type);
        return h('div', { class: 'flex items-center gap-2' }, [
          h('span', { class: 'text-lg' }, typeInfo.icon),
          h(
            NTag,
            { type: typeInfo.type as any, size: 'small' },
            { default: () => typeInfo.label },
          ),
        ]);
      },
    },
    {
      title: $t('agency.transaction.transactionAmount'),
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
      title: $t('agency.transaction.accountBalance'),
      key: 'balance',
      width: 140,
      align: 'right',
      render: (row) =>
        h(
          'span',
          { class: 'font-semibold text-blue-600' },
          formatCurrency(row.balance),
        ),
    },
    {
      title: $t('common.status'),
      key: 'status',
      width: 100,
      align: 'center',
      render: (row) => {
        const statusMap: Record<string, { label: string; type: string; icon: string }> = {
          success: { label: $t('common.success'), type: 'success', icon: '✅' },
          processing: {
            label: $t('agency.transaction.processing'),
            type: 'warning',
            icon: '⏳',
          },
          failed: { label: $t('common.failed'), type: 'error', icon: '❌' },
          cancelled: {
            label: $t('agency.transaction.cancelled'),
            type: 'default',
            icon: '🚫',
          },
        };
        const status = statusMap[row.status] || {
          label: row.status,
          type: 'default',
          icon: '❓',
        };
        return h('div', { class: 'flex items-center justify-center gap-1' }, [
          h('span', { class: 'text-sm' }, status.icon),
          h(
            NTag,
            { type: status.type as any, size: 'small' },
            { default: () => status.label },
          ),
        ]);
      },
    },
    {
      title: $t('common.description'),
      key: 'description',
      width: 200,
      ellipsis: true,
      tooltip: true,
    },
    {
      title: $t('agency.transaction.transactionTime'),
      key: 'transactionTime',
      width: 180,
      render: (row) =>
        h('div', { class: 'text-sm' }, [
          h('div', { class: 'font-medium' }, renderTzDateTime(row.transactionTime)),
        ]),
    },
    {
      title: $t('agency.transaction.referenceNo'),
      key: 'referenceId',
      width: 120,
      render: (row) =>
        row.referenceId
          ? h('span', { class: 'text-xs font-mono text-gray-600' }, row.referenceId)
          : h('span', { class: 'text-gray-400' }, '--'),
    },
    {
      title: $t('common.operator'),
      key: 'operator',
      width: 100,
      render: (row) => {
        if (!row.operator) return h('span', { class: 'text-gray-400' }, '--');
        const operatorMap: Record<string, { label: string; type: string }> = {
          system: { label: $t('agency.transaction.system'), type: 'info' },
          user: { label: $t('agency.transaction.user'), type: 'success' },
          admin: { label: $t('agency.transaction.admin'), type: 'warning' },
        };
        const operator = operatorMap[row.operator] || {
          label: row.operator,
          type: 'default',
        };
        return h(
          NTag,
          { type: operator.type as any, size: 'small' },
          { default: () => operator.label },
        );
      },
    },
  ],
);

const loadTransactions = async () => {
  if (!props.agentId) return;

  transactionLoading.value = true;
  try {
    const params: Record<string, unknown> = {
      page: transactionPagination.current,
      pageSize: transactionPagination.pageSize,
    };
    if (transactionTypeFilter.value) params.type = transactionTypeFilter.value;
    if (transactionStatusFilter.value) params.status = transactionStatusFilter.value;
    if (startDate.value) params.startDate = new Date(startDate.value).toISOString();
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
    message.error($t('agency.transaction.loadFailed'));
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
  message.info($t('agency.transaction.exportDeveloping'));
};

const formatCurrency = (amount: number) => `R$ ${Number(amount).toFixed(2)}`;

onMounted(() => {
  if (props.agentId) loadTransactions();
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
