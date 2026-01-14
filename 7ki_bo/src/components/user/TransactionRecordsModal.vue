<template>
  <n-modal v-model:show="visible" preset="card" style="width: 90%; max-width: 1200px;" title="账变记录">
    <template #header>
      <div class="flex items-center justify-between w-full">
        <h3 class="text-lg font-medium">账变记录</h3>
        <n-button quaternary circle @click="visible = false">
          <template #icon>
            <n-icon>
              <CloseOutline />
            </n-icon>
          </template>
        </n-button>
      </div>
    </template>

    <!-- 筛选器 -->
    <div class="mb-4">
      <n-card size="small">
        <n-form inline :show-label="false">
          <n-form-item>
            <n-select
              v-model:value="filterType"
              style="width: 120px"
              placeholder="交易类型"
              @update:value="handleFilterChange"
            >
              <n-option value="all" label="全部" />
              <n-option value="deposit" label="存款" />
              <n-option value="withdrawal" label="提款" />
              <n-option value="manual" label="手动" />
              <n-option value="bet" label="投注" />
              <n-option value="bonus" label="奖金" />
            </n-select>
          </n-form-item>
          <n-form-item>
            <n-button type="primary" @click="handleRefresh">
              <template #icon>
                <n-icon><RefreshOutline /></n-icon>
              </template>
              刷新
            </n-button>
          </n-form-item>
        </n-form>
      </n-card>
    </div>

    <!-- 交易记录表格 -->
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

    <!-- 交易详情模态框 -->
    <n-modal v-model:show="detailVisible" preset="card" style="width: 600px;" title="交易详情">
      <div v-if="selectedRecord">
        <n-descriptions :column="2" label-placement="left" bordered>
          <n-descriptions-item label="交易ID">
            {{ selectedRecord.id }}
          </n-descriptions-item>
          <n-descriptions-item label="交易类型">
            <n-tag :type="getTransactionTypeColor(selectedRecord.transactionType)">
              {{ formatTransactionType(selectedRecord) }}
            </n-tag>
          </n-descriptions-item>
          <n-descriptions-item label="金额">
            <span :class="getAmountColor(selectedRecord.amount)">
              {{ formatCurrency(selectedRecord.amount) }}
            </span>
          </n-descriptions-item>
          <n-descriptions-item label="状态">
            <n-tag :type="formatTransactionStatus(selectedRecord.status).type">
              {{ formatTransactionStatus(selectedRecord.status).text }}
            </n-tag>
          </n-descriptions-item>
          <n-descriptions-item label="交易前余额">
            {{ formatCurrency(selectedRecord.balanceBefore) }}
          </n-descriptions-item>
          <n-descriptions-item label="交易后余额">
            {{ formatCurrency(selectedRecord.balanceAfter) }}
          </n-descriptions-item>
          <n-descriptions-item label="交易时间" :span="2">
            {{ formatDateTime(selectedRecord.createdAt) }}
          </n-descriptions-item>
          
          <!-- 存款特有字段 -->
          <template v-if="selectedRecord.transactionType === 'deposit'">
            <n-descriptions-item v-if="selectedRecord.trxId" label="交易单号">
              {{ selectedRecord.trxId }}
            </n-descriptions-item>
            <n-descriptions-item v-if="selectedRecord.paymentMethod" label="支付方式">
              {{ selectedRecord.paymentMethod }}
            </n-descriptions-item>
            <n-descriptions-item v-if="selectedRecord.paymentGateway" label="支付通道">
              {{ selectedRecord.paymentGateway }}
            </n-descriptions-item>
            <n-descriptions-item v-if="selectedRecord.bonusAmount" label="奖金金额">
              <span class="text-green-600">{{ formatCurrency(selectedRecord.bonusAmount) }}</span>
            </n-descriptions-item>
            <n-descriptions-item v-if="selectedRecord.fees" label="手续费">
              <span class="text-red-600">{{ formatCurrency(selectedRecord.fees) }}</span>
            </n-descriptions-item>
          </template>
          
          <!-- 提款特有字段 -->
          <template v-if="selectedRecord.transactionType === 'withdrawal'">
            <n-descriptions-item v-if="selectedRecord.memberBank" label="提款银行">
              {{ selectedRecord.memberBank }}
            </n-descriptions-item>
            <n-descriptions-item v-if="selectedRecord.memberBankAccount" label="银行账号">
              {{ selectedRecord.memberBankAccount }}
            </n-descriptions-item>
            <n-descriptions-item v-if="selectedRecord.accountHolderName" label="开户名">
              {{ selectedRecord.accountHolderName }}
            </n-descriptions-item>
            <n-descriptions-item v-if="selectedRecord.approvedBy" label="审批人">
              {{ selectedRecord.approvedBy }}
            </n-descriptions-item>
            <n-descriptions-item v-if="selectedRecord.rejectionReason" label="拒绝原因" :span="2">
              <span class="text-red-600">{{ selectedRecord.rejectionReason }}</span>
            </n-descriptions-item>
          </template>
          
          <!-- 手动交易特有字段 -->
          <template v-if="selectedRecord.transactionType === 'manual'">
            <n-descriptions-item v-if="selectedRecord.processedBy" label="操作员">
              {{ selectedRecord.processedBy }}
            </n-descriptions-item>
            <n-descriptions-item v-if="selectedRecord.reason" label="操作原因">
              {{ selectedRecord.reason }}
            </n-descriptions-item>
            <n-descriptions-item v-if="selectedRecord.frontendNotes" label="前台备注" :span="2">
              {{ selectedRecord.frontendNotes }}
            </n-descriptions-item>
            <n-descriptions-item v-if="selectedRecord.backendNotes" label="后台备注" :span="2">
              {{ selectedRecord.backendNotes }}
            </n-descriptions-item>
          </template>
          
          <n-descriptions-item v-if="selectedRecord.description" label="描述" :span="2">
            {{ selectedRecord.description }}
          </n-descriptions-item>
        </n-descriptions>
      </div>
    </n-modal>
  </n-modal>
</template>

<script setup lang="ts">
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

// 响应式数据
const visible = ref(false);
const detailVisible = ref(false);
const loading = ref(false);
const dataSource = ref<TransactionRecord[]>([]);
const selectedRecord = ref<TransactionRecord | null>(null);
const filterType = ref<string>('all');

// 分页信息
const pagination = ref({
  page: 1,
  pageSize: 20,
  itemCount: 0,
});

// 表格列配置
const columns: DataTableColumns<TransactionRecord> = [
  {
    title: '交易ID',
    key: 'id',
    width: 120,
    ellipsis: { tooltip: true },
  },
  {
    title: '类型',
    key: 'transactionType',
    width: 100,
    render(row) {
      return h(NTag, { 
        type: getTransactionTypeColor(row.transactionType),
        size: 'small'
      }, { default: () => formatTransactionType(row) });
    },
  },
  {
    title: '金额',
    key: 'amount',
    width: 120,
    render(row) {
      return h('span', { 
        class: getAmountColor(row.amount)
      }, formatCurrency(row.amount));
    },
  },
  {
    title: '交易前余额',
    key: 'balanceBefore',
    width: 130,
    render(row) {
      return formatCurrency(row.balanceBefore);
    },
  },
  {
    title: '交易后余额',
    key: 'balanceAfter',
    width: 130,
    render(row) {
      return formatCurrency(row.balanceAfter);
    },
  },
  {
    title: '状态',
    key: 'status',
    width: 100,
    render(row) {
      const status = formatTransactionStatus(row.status);
      return h(NTag, { 
        type: status.type,
        size: 'small'
      }, { default: () => status.text });
    },
  },
  {
    title: '时间',
    key: 'createdAt',
    width: 160,
    render(row) {
      return formatDateTime(row.createdAt);
    },
  },
  {
    title: '描述',
    key: 'description',
    width: 200,
    ellipsis: { tooltip: true },
  },
  {
    title: '操作',
    key: 'actions',
    fixed: 'right',
    width: 80,
    render(row) {
      return h(NButton, {
        size: 'small',
        quaternary: true,
        type: 'primary',
        onClick: () => handleViewDetail(row),
      }, { default: () => '详情' });
    },
  },
];

// 分页配置
const paginationConfig = computed(() => ({
  page: pagination.value.page,
  pageSize: pagination.value.pageSize,
  itemCount: pagination.value.itemCount,
  showSizePicker: true,
  pageSizes: [10, 20, 50, 100],
  showQuickJumper: true,
}));

// 获取交易记录
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
    // Normalize numeric fields for table display
    const processed = (response.list || []).map(transaction => ({
      ...transaction,
      amount: parseFloat(transaction.amount),
      balanceBefore: parseFloat(transaction.balanceBefore),
      balanceAfter: parseFloat(transaction.balanceAfter),
    }));
    dataSource.value = processed;
    pagination.value.itemCount = response.pagination?.total || processed.length;
  } catch (error) {
    console.error('获取交易记录失败:', error);
    notification.error({
      content: '获取交易记录失败',
      duration: 3000,
    });
  } finally {
    loading.value = false;
  }
};

// 事件处理
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

// 工具函数
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
};

const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString('pt-BR');
};

const getTransactionTypeColor = (type: string): 'success' | 'warning' | 'error' | 'info' => {
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

// 打开模态框
const show = (userId: number) => {
  if (userId) {
    (props as any).userId = userId;
    visible.value = true;
    pagination.value.page = 1;
    fetchTransactionHistory();
  }
};

// 关闭模态框
const close = () => {
  visible.value = false;
  detailVisible.value = false;
  dataSource.value = [];
  selectedRecord.value = null;
  emit('close');
};

// 监听模态框关闭
const handleModalClose = () => {
  close();
};

// 暴露方法
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