<template>
  <div class="withdraw-account-tab">
    <!-- Account Summary -->
    <n-card title="提现账号概览" class="mb-4">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div class="stat-card">
          <div class="stat-value">{{ withdrawAccounts.length }}</div>
          <div class="stat-label">总账号数</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ activeAccounts.length }}</div>
          <div class="stat-label">活跃账号</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ verifiedAccounts.length }}</div>
          <div class="stat-label">已验证账号</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">
            {{ formatCurrency(totalWithdrawAmount) }}
          </div>
          <div class="stat-label">累计提现</div>
        </div>
      </div>
    </n-card>

    <!-- Action Buttons -->
    <n-card title="操作" class="mb-4">
      <div class="flex flex-wrap gap-2">
        <n-button type="primary" @click="handleAddAccount">
          添加提现账号
        </n-button>
        <n-button type="info" @click="handleBatchVerify"> 批量验证 </n-button>
        <n-button type="warning" @click="handleExportAccounts">
          导出账号
        </n-button>
        <n-button @click="handleRefresh"> 刷新 </n-button>
      </div>
    </n-card>

    <!-- Withdraw Accounts Table -->
    <n-card title="提现账号列表">
      <n-data-table
        :columns="columns"
        :data="withdrawAccounts"
        :pagination="pagination"
        :loading="loading"
        size="small"
        :row-key="(row) => row.id"
      />
    </n-card>

    <!-- Add/Edit Account Modal -->
    <n-modal
      v-model:show="showAccountModal"
      preset="card"
      title="提现账号"
      style="width: 600px"
    >
      <n-form
        ref="formRef"
        :model="accountForm"
        :rules="rules"
        label-placement="left"
        label-width="120px"
      >
        <n-form-item label="账号类型" path="type">
          <n-select
            v-model:value="accountForm.type"
            :options="accountTypeOptions"
          />
        </n-form-item>

        <n-form-item label="账号名称" path="name">
          <n-input
            v-model:value="accountForm.name"
            placeholder="请输入账号名称"
          />
        </n-form-item>

        <n-form-item label="账号号码" path="number">
          <n-input
            v-model:value="accountForm.number"
            placeholder="请输入账号号码"
          />
        </n-form-item>

        <n-form-item
          label="开户行"
          path="bank"
          v-if="accountForm.type === 'bank'"
        >
          <n-input
            v-model:value="accountForm.bank"
            placeholder="请输入开户行"
          />
        </n-form-item>

        <n-form-item
          label="支付宝账号"
          path="alipayAccount"
          v-if="accountForm.type === 'alipay'"
        >
          <n-input
            v-model:value="accountForm.alipayAccount"
            placeholder="请输入支付宝账号"
          />
        </n-form-item>

        <n-form-item
          label="微信账号"
          path="wechatAccount"
          v-if="accountForm.type === 'wechat'"
        >
          <n-input
            v-model:value="accountForm.wechatAccount"
            placeholder="请输入微信账号"
          />
        </n-form-item>

        <n-form-item label="状态" path="status">
          <n-select
            v-model:value="accountForm.status"
            :options="statusOptions"
          />
        </n-form-item>

        <n-form-item label="备注" path="remark">
          <n-input
            v-model:value="accountForm.remark"
            type="textarea"
            placeholder="请输入备注信息"
            :rows="3"
          />
        </n-form-item>
      </n-form>

      <template #action>
        <div class="flex gap-2">
          <n-button @click="showAccountModal = false">取消</n-button>
          <n-button
            type="primary"
            @click="handleSubmitAccount"
            :loading="submitting"
          >
            {{ isEdit ? '更新' : '添加' }}
          </n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, h, onMounted } from 'vue';
import {
  NCard,
  NButton,
  NDataTable,
  NModal,
  NForm,
  NFormItem,
  NInput,
  NSelect,
  NTag,
  useMessage,
  type DataTableColumns,
} from 'naive-ui';
import {
  getAgentWithdrawalAccountsApi,
  createWithdrawalAccountApi,
  updateWithdrawalAccountApi,
  deleteWithdrawalAccountApi,
  type AgentWithdrawalAccount,
} from '#/api/agency/agent-details';

interface Props {
  agentId?: number;
}

interface AccountForm {
  type: string;
  name: string;
  number: string;
  bank: string;
  alipayAccount: string;
  wechatAccount: string;
  status: string;
  remark: string;
}

const props = withDefaults(defineProps<Props>(), {
  agentId: 0,
});

const message = useMessage();

// Reactive data
const loading = ref(false);
const submitting = ref(false);
const showAccountModal = ref(false);
const isEdit = ref(false);
const currentAccountId = ref<number | null>(null);

// Data from API
const withdrawAccounts = ref<AgentWithdrawalAccount[]>([]);

const accountForm = reactive<AccountForm>({
  type: 'bank',
  name: '',
  number: '',
  bank: '',
  alipayAccount: '',
  wechatAccount: '',
  status: 'active',
  remark: '',
});

// Options
const accountTypeOptions = [
  { label: '银行账户', value: 'bank' },
  { label: '支付宝', value: 'alipay' },
  { label: '微信', value: 'wechat' },
  { label: '其他', value: 'other' },
];

const statusOptions = [
  { label: '活跃', value: 'active' },
  { label: '停用', value: 'inactive' },
  { label: '待验证', value: 'pending' },
];

// Pagination
const pagination = reactive({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  showSizePicker: true,
  pageSizes: [10, 20, 50],
  prefix: (info: any) => `共 ${info.itemCount} 条`,
  onUpdatePage: (page: number) => {
    pagination.page = page;
    loadAccounts();
  },
  onUpdatePageSize: (pageSize: number) => {
    pagination.pageSize = pageSize;
    pagination.current = 1;
    loadAccounts();
  },
});

// Computed
const activeAccounts = computed(() =>
  withdrawAccounts.value.filter((account) => account.status === 'active'),
);

const verifiedAccounts = computed(() =>
  withdrawAccounts.value.filter((account) => account.status === 'active'),
);

const totalWithdrawAmount = computed(() => {
  // This would need to be calculated from actual withdrawal data
  return 5000.0;
});

// Table columns
const columns: DataTableColumns<AgentWithdrawalAccount> = [
  {
    title: 'ID',
    key: 'id',
    width: 80,
    align: 'center',
  },
  {
    title: '账号类型',
    key: 'type',
    width: 100,
    render: (row) => {
      const typeMap = {
        bank: { label: '银行账户', type: 'info' },
        alipay: { label: '支付宝', type: 'success' },
        wechat: { label: '微信', type: 'success' },
        other: { label: '其他', type: 'default' },
      };
      const typeInfo = typeMap[row.type as keyof typeof typeMap] || {
        label: row.type,
        type: 'default',
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
    title: '账号名称',
    key: 'name',
    width: 150,
  },
  {
    title: '账号号码',
    key: 'number',
    width: 200,
    ellipsis: true,
  },
  {
    title: '开户行/平台',
    key: 'bank',
    width: 150,
    render: (row) => {
      if (row.type === 'bank') return row.bank || '--';
      if (row.type === 'alipay') return '支付宝';
      if (row.type === 'wechat') return '微信';
      return '--';
    },
  },
  {
    title: '状态',
    key: 'status',
    width: 100,
    render: (row) => {
      const statusMap = {
        active: { label: '活跃', type: 'success', icon: '✅' },
        inactive: { label: '停用', type: 'error', icon: '❌' },
        pending: { label: '待验证', type: 'warning', icon: '⏳' },
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
    title: '备注',
    key: 'remark',
    ellipsis: true,
    tooltip: true,
  },
  {
    title: '创建时间',
    key: 'createdAt',
    width: 180,
    render: (row) => new Date(row.createdAt).toLocaleString('zh-CN'),
  },
  {
    title: '操作',
    key: 'actions',
    width: 150,
    fixed: 'right',
    render: (row) => {
      return h('div', { class: 'flex gap-1' }, [
        h(
          NButton,
          {
            size: 'tiny',
            type: 'primary',
            onClick: () => handleEditAccount(row),
          },
          { default: () => '编辑' },
        ),
        h(
          NButton,
          {
            size: 'tiny',
            type: row.status === 'active' ? 'warning' : 'success',
            onClick: () => handleToggleStatus(row),
          },
          { default: () => (row.status === 'active' ? '停用' : '启用') },
        ),
        h(
          NButton,
          {
            size: 'tiny',
            type: 'error',
            onClick: () => handleDeleteAccount(row.id),
          },
          { default: () => '删除' },
        ),
      ]);
    },
  },
];

// Form validation rules
const rules = {
  type: {
    required: true,
    message: '请选择账号类型',
    trigger: 'blur',
  },
  name: {
    required: true,
    message: '请输入账号名称',
    trigger: 'blur',
  },
  number: {
    required: true,
    message: '请输入账号号码',
    trigger: 'blur',
  },
};

// Methods
const loadAccounts = async () => {
  if (!props.agentId) return;

  loading.value = true;
  try {
    const response = await getAgentWithdrawalAccountsApi(props.agentId, {
      page: pagination.page,
      pageSize: pagination.pageSize,
    });

    withdrawAccounts.value = response.list;
    pagination.itemCount = response.pagination.total;
  } catch (error) {
    console.error('Failed to load withdrawal accounts:', error);
    message.error('加载提现账号失败');
  } finally {
    loading.value = false;
  }
};

const handleAddAccount = () => {
  isEdit.value = false;
  currentAccountId.value = null;
  resetForm();
  showAccountModal.value = true;
};

const handleEditAccount = (account: AgentWithdrawalAccount) => {
  isEdit.value = true;
  currentAccountId.value = account.id;
  Object.assign(accountForm, {
    type: account.type,
    name: account.name,
    number: account.number,
    bank: account.bank || '',
    alipayAccount: account.alipayAccount || '',
    wechatAccount: account.wechatAccount || '',
    status: account.status,
    remark: account.remark || '',
  });
  showAccountModal.value = true;
};

const handleSubmitAccount = async () => {
  if (!props.agentId) return;

  try {
    submitting.value = true;

    if (isEdit.value && currentAccountId.value) {
      // Update existing account
      await updateWithdrawalAccountApi(
        props.agentId,
        currentAccountId.value,
        accountForm,
      );
      message.success('账号更新成功');
    } else {
      // Add new account
      await createWithdrawalAccountApi(props.agentId, accountForm);
      message.success('账号添加成功');
    }

    showAccountModal.value = false;
    loadAccounts();
  } catch (error) {
    console.error('Failed to submit account:', error);
    message.error('操作失败');
  } finally {
    submitting.value = false;
  }
};

const handleToggleStatus = async (account: AgentWithdrawalAccount) => {
  if (!props.agentId) return;

  try {
    const newStatus = account.status === 'active' ? 'inactive' : 'active';
    await updateWithdrawalAccountApi(props.agentId, account.id, {
      status: newStatus,
    });
    account.status = newStatus;
    message.success(`账号已${newStatus === 'active' ? '启用' : '停用'}`);
  } catch (error) {
    console.error('Failed to toggle status:', error);
    message.error('状态更新失败');
  }
};

const handleDeleteAccount = async (id: number) => {
  if (!props.agentId) return;

  try {
    await deleteWithdrawalAccountApi(props.agentId, id);
    message.success('账号删除成功');
    loadAccounts();
  } catch (error) {
    console.error('Failed to delete account:', error);
    message.error('删除失败');
  }
};

const handleBatchVerify = () => {
  message.info('批量验证功能开发中...');
};

const handleExportAccounts = () => {
  message.info('导出账号功能开发中...');
};

const handleRefresh = () => {
  loadAccounts();
  message.success('已刷新');
};

const resetForm = () => {
  Object.assign(accountForm, {
    type: 'bank',
    name: '',
    number: '',
    bank: '',
    alipayAccount: '',
    wechatAccount: '',
    status: 'active',
    remark: '',
  });
};

const formatCurrency = (amount: number) => {
  return `R$ ${Number(amount).toFixed(2)}`;
};

onMounted(() => {
  if (props.agentId) {
    loadAccounts();
  }
});
</script>

<style scoped>
.withdraw-account-tab {
  padding: 16px;
}

.mb-4 {
  margin-bottom: 1rem;
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
