<template>
  <n-modal
    v-model:show="visible"
    preset="card"
    style="width: 90%; max-width: 1200px"
    :title="$t('user.transactionRecords.title')"
  >
    <template #header>
      <div class="flex w-full items-center justify-between">
        <h3 class="text-lg font-medium">{{ $t('user.transactionRecords.title') }}</h3>
        <n-button quaternary circle @click="visible = false">
          <template #icon>
            <n-icon>
              <CloseOutline />
            </n-icon>
          </template>
        </n-button>
      </div>
    </template>

    <div class="mb-4">
      <n-card size="small">
        <n-form inline :show-label="false">
          <n-form-item>
            <n-select
              v-model:value="filterType"
              style="width: 120px"
              :placeholder="$t('user.transactionRecords.transactionType')"
              :options="transactionTypeOptions"
              @update:value="handleFilterChange"
            />
          </n-form-item>
          <n-form-item>
            <n-button type="primary" @click="handleRefresh">
              <template #icon>
                <n-icon><RefreshOutline /></n-icon>
              </template>
              {{ $t('common.refresh') }}
            </n-button>
          </n-form-item>
        </n-form>
      </n-card>
    </div>

    <n-data-table
      :loading="loading"
      :columns="columns"
      :data="dataSource"
      :pagination="paginationConfig"
      :scroll-x="1400"
      :row-key="(row: TransactionRecord) => row.id"
      remote
      @update:page="handlePageChange"
      @update:page-size="handlePageSizeChange"
    />

    <n-modal
      v-model:show="detailVisible"
      preset="card"
      style="width: 600px"
      :title="$t('user.transactionRecords.transactionDetail')"
    >
      <div v-if="selectedRecord">
        <n-descriptions :column="2" label-placement="left" bordered>
          <n-descriptions-item :label="$t('user.transactionRecords.transactionId')">
            {{ selectedRecord.id }}
          </n-descriptions-item>
          <n-descriptions-item :label="$t('user.transactionRecords.transactionType')">
            <n-tag
              :type="getTransactionTypeColor(selectedRecord.transactionType)"
            >
              {{ formatTransactionType(selectedRecord) }}
            </n-tag>
          </n-descriptions-item>
          <n-descriptions-item :label="$t('common.amount')">
            <span :class="getAmountColor(selectedRecord.amount)">
              {{ formatCurrency(selectedRecord.amount) }}
            </span>
          </n-descriptions-item>
          <n-descriptions-item :label="$t('common.status')">
            <n-tag :type="formatTransactionStatus(selectedRecord.status).type">
              {{ formatTransactionStatus(selectedRecord.status).text }}
            </n-tag>
          </n-descriptions-item>
          <n-descriptions-item :label="$t('user.transactionRecords.balanceBeforeTx')">
            {{ formatCurrency(selectedRecord.balanceBefore) }}
          </n-descriptions-item>
          <n-descriptions-item :label="$t('user.transactionRecords.balanceAfterTx')">
            {{ formatCurrency(selectedRecord.balanceAfter) }}
          </n-descriptions-item>
          <n-descriptions-item :label="$t('user.transactionRecords.transactionTime')" :span="2">
            {{ formatDateTime(selectedRecord.createdAt) }}
          </n-descriptions-item>

          <template v-if="selectedRecord.transactionType === 'deposit'">
            <n-descriptions-item v-if="selectedRecord.trxId" :label="$t('user.transactionRecords.trxId')">
              {{ selectedRecord.trxId }}
            </n-descriptions-item>
            <n-descriptions-item
              v-if="selectedRecord.paymentMethod"
              :label="$t('user.transactionRecords.paymentMethod')"
            >
              {{ selectedRecord.paymentMethod }}
            </n-descriptions-item>
            <n-descriptions-item
              v-if="selectedRecord.paymentGateway"
              :label="$t('user.transactionRecords.paymentGateway')"
            >
              {{ selectedRecord.paymentGateway }}
            </n-descriptions-item>
            <n-descriptions-item
              v-if="selectedRecord.bonusAmount"
              :label="$t('user.transactionRecords.bonusAmount')"
            >
              <span class="text-green-600">{{
                formatCurrency(selectedRecord.bonusAmount)
              }}</span>
            </n-descriptions-item>
            <n-descriptions-item v-if="selectedRecord.fees" :label="$t('user.transactionRecords.fees')">
              <span class="text-red-600">{{
                formatCurrency(selectedRecord.fees)
              }}</span>
            </n-descriptions-item>
          </template>

          <template v-if="selectedRecord.transactionType === 'withdrawal'">
            <n-descriptions-item
              v-if="selectedRecord.memberBank"
              :label="$t('user.transactionRecords.withdrawBank')"
            >
              {{ selectedRecord.memberBank }}
            </n-descriptions-item>
            <n-descriptions-item
              v-if="selectedRecord.memberBankAccount"
              :label="$t('user.transactionRecords.bankAccount')"
            >
              {{ selectedRecord.memberBankAccount }}
            </n-descriptions-item>
            <n-descriptions-item
              v-if="selectedRecord.accountHolderName"
              :label="$t('user.transactionRecords.accountHolder')"
            >
              {{ selectedRecord.accountHolderName }}
            </n-descriptions-item>
            <n-descriptions-item
              v-if="selectedRecord.approvedBy"
              :label="$t('user.transactionRecords.approvedBy')"
            >
              {{ selectedRecord.approvedBy }}
            </n-descriptions-item>
            <n-descriptions-item
              v-if="selectedRecord.rejectionReason"
              :label="$t('user.transactionRecords.rejectionReason')"
              :span="2"
            >
              <span class="text-red-600">{{
                selectedRecord.rejectionReason
              }}</span>
            </n-descriptions-item>
          </template>

          <template v-if="selectedRecord.transactionType === 'manual'">
            <n-descriptions-item
              v-if="selectedRecord.processedBy"
              :label="$t('user.transactionRecords.processedBy')"
            >
              {{ selectedRecord.processedBy }}
            </n-descriptions-item>
            <n-descriptions-item v-if="selectedRecord.reason" :label="$t('user.userDetail.reason')">
              {{ selectedRecord.reason }}
            </n-descriptions-item>
            <n-descriptions-item
              v-if="selectedRecord.frontendNotes"
              :label="$t('user.userDetail.frontendNote')"
              :span="2"
            >
              {{ selectedRecord.frontendNotes }}
            </n-descriptions-item>
            <n-descriptions-item
              v-if="selectedRecord.backendNotes"
              :label="$t('user.userDetail.backendNote')"
              :span="2"
            >
              {{ selectedRecord.backendNotes }}
            </n-descriptions-item>
          </template>

          <n-descriptions-item
            v-if="selectedRecord.description"
            :label="$t('common.description')"
            :span="2"
          >
            {{ selectedRecord.description }}
          </n-descriptions-item>
        </n-descriptions>
      </div>
    </n-modal>
  </n-modal>
</template>

<script setup lang="ts">
import { $t } from '@vben/locales';

import { ref, computed, h } from 'vue';
import type { DataTableColumns } from 'naive-ui';
import {
  NButton,
  NCard,
  NDataTable,
  NDescriptions,
  NDescriptionsItem,
  NForm,
  NFormItem,
  NIcon,
  NModal,
  NSelect,
  NTag,
} from 'naive-ui';
import { CloseOutline, RefreshOutline } from '@vicons/ionicons5';
import { notification } from '#/adapter/naive';
import {
  getUserTransactionHistory,
  formatTransactionType,
  formatTransactionStatus,
  type TransactionRecord,
  type TransactionHistoryParams,
} from '#/api/core/transaction';

interface Props {
  userId?: number;
}

interface Emits {
  (e: 'close'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const visible = ref(false);
const detailVisible = ref(false);
const loading = ref(false);
const dataSource = ref<TransactionRecord[]>([]);
const selectedRecord = ref<TransactionRecord | null>(null);
const filterType = ref<string>('all');

const pagination = ref({
  page: 1,
  pageSize: 20,
  itemCount: 0,
});

const transactionTypeOptions = computed(() => [
  { label: $t('common.all'), value: 'all' },
  { label: $t('user.userDetail.deposit'), value: 'deposit' },
  { label: $t('user.userDetail.withdrawal'), value: 'withdrawal' },
  { label: $t('user.userDetail.manual'), value: 'manual' },
  { label: $t('user.userDetail.bet'), value: 'bet' },
  { label: $t('user.userDetail.bonus'), value: 'bonus' },
]);

const columns = computed<DataTableColumns<TransactionRecord>>(() => [
  {
    title: $t('user.transactionRecords.transactionId'),
    key: 'id',
    width: 120,
    ellipsis: { tooltip: true },
  },
  {
    title: $t('common.type'),
    key: 'transactionType',
    width: 100,
    render(row) {
      return h(
        NTag,
        {
          type: getTransactionTypeColor(row.transactionType),
          size: 'small',
        },
        { default: () => formatTransactionType(row) },
      );
    },
  },
  {
    title: $t('common.amount'),
    key: 'amount',
    width: 120,
    render(row) {
      return h(
        'span',
        {
          class: getAmountColor(row.amount),
        },
        formatCurrency(row.amount),
      );
    },
  },
  {
    title: $t('user.transactionRecords.balanceBeforeTx'),
    key: 'balanceBefore',
    width: 130,
    render(row) {
      return formatCurrency(row.balanceBefore);
    },
  },
  {
    title: $t('user.transactionRecords.balanceAfterTx'),
    key: 'balanceAfter',
    width: 130,
    render(row) {
      return formatCurrency(row.balanceAfter);
    },
  },
  {
    title: $t('common.status'),
    key: 'status',
    width: 100,
    render(row) {
      const status = formatTransactionStatus(row.status);
      return h(
        NTag,
        {
          type: status.type,
          size: 'small',
        },
        { default: () => status.text },
      );
    },
  },
  {
    title: $t('common.time'),
    key: 'createdAt',
    width: 160,
    render(row) {
      return formatDateTime(row.createdAt);
    },
  },
  {
    title: $t('common.description'),
    key: 'description',
    width: 200,
    ellipsis: { tooltip: true },
  },
  {
    title: $t('common.actions'),
    key: 'actions',
    fixed: 'right',
    width: 80,
    render(row) {
      return h(
        NButton,
        {
          size: 'small',
          quaternary: true,
          type: 'primary',
          onClick: () => handleViewDetail(row),
        },
        { default: () => $t('common.detail') },
      );
    },
  },
]);

const paginationConfig = computed(() => ({
  page: pagination.value.page,
  pageSize: pagination.value.pageSize,
  itemCount: pagination.value.itemCount,
  showSizePicker: true,
  pageSizes: [10, 20, 50, 100],
  showQuickJumper: true,
}));

const fetchTransactionHistory = async () => {
  if (!props.userId) return;

  loading.value = true;
  try {
    const params: TransactionHistoryParams = {
      type: filterType.value as any,
      page: pagination.value.page,
      pageSize: pagination.value.pageSize,
    };

    const response = await getUserTransactionHistory(props.userId, params);
    const processed = (response.list || []).map((transaction) => ({
      ...transaction,
      amount: parseFloat(transaction.amount),
      balanceBefore: parseFloat(transaction.balanceBefore),
      balanceAfter: parseFloat(transaction.balanceAfter),
    }));
    dataSource.value = processed;
    pagination.value.itemCount = response.pagination?.total || processed.length;
  } catch (error) {
    console.error('Failed to load transaction records:', error);
    notification.error({
      content: $t('user.transactionRecords.loadFailed'),
      duration: 3000,
    });
  } finally {
    loading.value = false;
  }
};

const handlePageChange = (page: number) => {
  pagination.value.page = page;
  fetchTransactionHistory();
};

const handlePageSizeChange = (pageSize: number) => {
  pagination.value.pageSize = pageSize;
  pagination.value.page = 1;
  fetchTransactionHistory();
};

const handleFilterChange = () => {
  pagination.value.page = 1;
  fetchTransactionHistory();
};

const handleRefresh = () => {
  fetchTransactionHistory();
};

const handleViewDetail = (record: TransactionRecord) => {
  selectedRecord.value = record;
  detailVisible.value = true;
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
};

const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString('pt-BR');
};

const getTransactionTypeColor = (
  type: string,
): 'success' | 'warning' | 'error' | 'info' => {
  switch (type) {
    case 'deposit':
      return 'success';
    case 'withdrawal':
      return 'warning';
    case 'manual':
      return 'info';
    case 'bet':
      return 'error';
    case 'bonus':
      return 'success';
    default:
      return 'info';
  }
};

const getAmountColor = (amount: number): string => {
  return amount >= 0 ? 'text-green-600' : 'text-red-600';
};

const show = (userId: number) => {
  if (userId) {
    (props as any).userId = userId;
    visible.value = true;
    pagination.value.page = 1;
    fetchTransactionHistory();
  }
};

const close = () => {
  visible.value = false;
  detailVisible.value = false;
  dataSource.value = [];
  selectedRecord.value = null;
  emit('close');
};

defineExpose({
  show,
  close,
});
</script>

<style scoped>
:deep(.n-data-table-th) {
  font-weight: 600;
}

:deep(.n-data-table-td) {
  font-size: 13px;
}

.text-green-600 {
  color: #059669;
}

.text-red-600 {
  color: #dc2626;
}
</style>
