<template>
  <div class="withdraw-account-tab">
    <n-card :title="$t('agency.withdrawAccount.overview')" class="mb-4">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div class="stat-card">
          <div class="stat-value">{{ withdrawAccounts.length }}</div>
          <div class="stat-label">
            {{ $t('agency.withdrawAccount.totalAccounts') }}
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ activeAccounts.length }}</div>
          <div class="stat-label">
            {{ $t('agency.withdrawAccount.activeAccounts') }}
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ verifiedAccounts.length }}</div>
          <div class="stat-label">
            {{ $t('agency.withdrawAccount.verifiedAccounts') }}
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-value">
            {{ formatCurrency(totalWithdrawAmount) }}
          </div>
          <div class="stat-label">
            {{ $t('agency.withdrawAccount.totalWithdrawn') }}
          </div>
        </div>
      </div>
    </n-card>

    <n-card :title="$t('common.actions')" class="mb-4">
      <div class="flex flex-wrap gap-2">
        <n-button type="primary" @click="handleAddAccount">
          {{ $t('agency.withdrawAccount.addAccount') }}
        </n-button>
        <n-button type="info" @click="handleBatchVerify">
          {{ $t('agency.withdrawAccount.batchVerify') }}
        </n-button>
        <n-button type="warning" @click="handleExportAccounts">
          {{ $t('agency.withdrawAccount.exportAccounts') }}
        </n-button>
        <n-button @click="handleRefresh"> {{ $t('common.refresh') }} </n-button>
      </div>
    </n-card>

    <n-card :title="$t('agency.withdrawAccount.accountList')">
      <n-data-table
        :columns="columns"
        :data="withdrawAccounts"
        :pagination="pagination"
        :loading="loading"
        size="small"
        :row-key="(row) => row.id"
      />
    </n-card>

    <n-modal
      v-model:show="showAccountModal"
      preset="card"
      :title="$t('agency.withdrawAccount.accountTitle')"
      style="width: 600px"
    >
      <n-form
        ref="formRef"
        :model="accountForm"
        :rules="rules"
        label-placement="left"
        label-width="120px"
      >
        <n-form-item
          :label="$t('agency.withdrawAccount.accountType')"
          path="type"
        >
          <n-select
            v-model:value="accountForm.type"
            :options="accountTypeOptions"
          />
        </n-form-item>

        <n-form-item
          :label="$t('agency.withdrawAccount.accountName')"
          path="name"
        >
          <n-input
            v-model:value="accountForm.name"
            :placeholder="$t('agency.withdrawAccount.enterAccountName')"
          />
        </n-form-item>

        <n-form-item
          :label="$t('agency.withdrawAccount.accountNumber')"
          path="number"
        >
          <n-input
            v-model:value="accountForm.number"
            :placeholder="$t('agency.withdrawAccount.enterAccountNumber')"
          />
        </n-form-item>

        <n-form-item
          :label="$t('agency.withdrawAccount.bankName')"
          path="bank"
          v-if="accountForm.type === 'bank'"
        >
          <n-input
            v-model:value="accountForm.bank"
            :placeholder="$t('agency.withdrawAccount.enterBankName')"
          />
        </n-form-item>

        <n-form-item
          :label="$t('agency.withdrawAccount.alipayAccount')"
          path="alipayAccount"
          v-if="accountForm.type === 'alipay'"
        >
          <n-input
            v-model:value="accountForm.alipayAccount"
            :placeholder="$t('agency.withdrawAccount.enterAlipay')"
          />
        </n-form-item>

        <n-form-item
          :label="$t('agency.withdrawAccount.wechatAccount')"
          path="wechatAccount"
          v-if="accountForm.type === 'wechat'"
        >
          <n-input
            v-model:value="accountForm.wechatAccount"
            :placeholder="$t('agency.withdrawAccount.enterWechat')"
          />
        </n-form-item>

        <n-form-item :label="$t('common.status')" path="status">
          <n-select
            v-model:value="accountForm.status"
            :options="statusOptions"
          />
        </n-form-item>

        <n-form-item :label="$t('common.remark')" path="remark">
          <n-input
            v-model:value="accountForm.remark"
            type="textarea"
            :placeholder="$t('agency.withdrawAccount.enterRemark')"
            :rows="3"
          />
        </n-form-item>
      </n-form>

      <template #action>
        <div class="flex gap-2">
          <n-button @click="showAccountModal = false">{{ $t('common.cancel') }}</n-button>
          <n-button
            type="primary"
            @click="handleSubmitAccount"
            :loading="submitting"
          >
            {{ isEdit ? $t('agency.shared.update') : $t('common.add') }}
          </n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { $t } from '@vben/locales';

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
  type FormInst,
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
const loading = ref(false);
const submitting = ref(false);
const showAccountModal = ref(false);
const isEdit = ref(false);
const currentAccountId = ref<number | null>(null);
const formRef = ref<FormInst | null>(null);
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

const accountTypeOptions = computed(() => [
  { label: $t('agency.withdrawAccount.bankAccount'), value: 'bank' },
  { label: $t('agency.withdrawAccount.alipay'), value: 'alipay' },
  { label: $t('agency.withdrawAccount.wechat'), value: 'wechat' },
  { label: $t('agency.withdrawAccount.other'), value: 'other' },
]);

const statusOptions = computed(() => [
  { label: $t('agency.withdrawAccount.active'), value: 'active' },
  { label: $t('agency.withdrawAccount.inactive'), value: 'inactive' },
  { label: $t('agency.withdrawAccount.pending'), value: 'pending' },
]);

const pagination = reactive({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  showSizePicker: true,
  pageSizes: [10, 20, 50],
  prefix: (info: { itemCount: number }) =>
    $t('agency.withdrawAccount.totalRecords', [info.itemCount]),
  onUpdatePage: (page: number) => {
    pagination.page = page;
    loadAccounts();
  },
  onUpdatePageSize: (pageSize: number) => {
    pagination.pageSize = pageSize;
    pagination.page = 1;
    loadAccounts();
  },
});

const activeAccounts = computed(() =>
  withdrawAccounts.value.filter((account) => account.status === 'active'),
);

const verifiedAccounts = computed(() =>
  withdrawAccounts.value.filter((account) => account.status === 'active'),
);

const isBankType = computed(() => accountForm.type === 'bank');

const totalWithdrawAmount = computed(() => 5000.0);

const getTypeLabel = (type: string) => {
  const map: Record<string, string> = {
    bank: $t('agency.withdrawAccount.bankAccount'),
    alipay: $t('agency.withdrawAccount.alipay'),
    wechat: $t('agency.withdrawAccount.wechat'),
    other: $t('agency.withdrawAccount.other'),
  };
  return map[type] || type;
};

const getStatusInfo = (status: string) => {
  const map: Record<string, { label: string; type: string; icon: string }> = {
    active: {
      label: $t('agency.withdrawAccount.active'),
      type: 'success',
      icon: '✅',
    },
    inactive: {
      label: $t('agency.withdrawAccount.inactive'),
      type: 'error',
      icon: '❌',
    },
    pending: {
      label: $t('agency.withdrawAccount.pending'),
      type: 'warning',
      icon: '⏳',
    },
  };
  return (
    map[status] || { label: status, type: 'default', icon: '❓' }
  );
};

const columns = computed<DataTableColumns<AgentWithdrawalAccount>>(() => [
  {
    title: 'ID',
    key: 'id',
    width: 80,
    align: 'center',
  },
  {
    title: $t('agency.withdrawAccount.accountType'),
    key: 'type',
    width: 100,
    render: (row) => {
      const typeMap: Record<string, { label: string; type: string }> = {
        bank: { label: getTypeLabel('bank'), type: 'info' },
        alipay: { label: getTypeLabel('alipay'), type: 'success' },
        wechat: { label: getTypeLabel('wechat'), type: 'success' },
        other: { label: getTypeLabel('other'), type: 'default' },
      };
      const typeInfo = typeMap[row.type] || {
        label: row.type,
        type: 'default',
      };
      return h('div', { class: 'flex items-center gap-2' }, [
        h(
          NTag,
          { type: typeInfo.type as any, size: 'small' },
          { default: () => typeInfo.label },
        ),
      ]);
    },
  },
  {
    title: $t('agency.withdrawAccount.accountName'),
    key: 'name',
    width: 150,
  },
  {
    title: $t('agency.withdrawAccount.accountNumber'),
    key: 'number',
    width: 200,
    ellipsis: true,
  },
  {
    title: $t('agency.withdrawAccount.bankPlatform'),
    key: 'bank',
    width: 150,
    render: (row) => {
      if (row.type === 'bank') return row.bank || '--';
      if (row.type === 'alipay') return $t('agency.withdrawAccount.alipay');
      if (row.type === 'wechat') return $t('agency.withdrawAccount.wechat');
      return '--';
    },
  },
  {
    title: $t('common.status'),
    key: 'status',
    width: 100,
    render: (row) => {
      const status = getStatusInfo(row.status);
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
    title: $t('common.remark'),
    key: 'remark',
    ellipsis: true,
    tooltip: true,
  },
  {
    title: $t('common.createTime'),
    key: 'createdAt',
    width: 180,
    render: (row) => new Date(row.createdAt).toLocaleString(),
  },
  {
    title: $t('common.actions'),
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
          { default: () => $t('common.edit') },
        ),
        h(
          NButton,
          {
            size: 'tiny',
            type: row.status === 'active' ? 'warning' : 'success',
            onClick: () => handleToggleStatus(row),
          },
          {
            default: () =>
              row.status === 'active'
                ? $t('common.disable')
                : $t('common.enable'),
          },
        ),
        h(
          NButton,
          {
            size: 'tiny',
            type: 'error',
            onClick: () => handleDeleteAccount(row.id),
          },
          { default: () => $t('common.delete') },
        ),
      ]);
    },
  },
]);

const rules = computed(() => ({
  type: {
    required: true,
    message: $t('agency.withdrawAccount.selectAccountType'),
    trigger: 'blur',
  },
  name: {
    required: false,
    validator: (_rule: unknown, value: string) => {
      const normalized = String(value || '').trim();
      if (!normalized) {
        return new Error(
          isBankType.value
            ? $t('agency.withdrawAccount.enterHolderName')
            : $t('agency.withdrawAccount.enterAccountNameRequired'),
        );
      }
      return true;
    },
    trigger: 'blur',
  },
  number: {
    required: true,
    message: $t('agency.withdrawAccount.enterAccountNumberRequired'),
    trigger: 'blur',
  },
}));

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
    message.error($t('agency.withdrawAccount.loadFailed'));
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
    await formRef.value?.validate();
    submitting.value = true;
    const submitPayload = {
      ...accountForm,
      name: accountForm.name.trim(),
      number: accountForm.number.trim(),
      bank: accountForm.bank.trim(),
      alipayAccount: accountForm.alipayAccount.trim(),
      wechatAccount: accountForm.wechatAccount.trim(),
      remark: accountForm.remark.trim(),
    };

    if (isEdit.value && currentAccountId.value) {
      await updateWithdrawalAccountApi(
        props.agentId,
        currentAccountId.value,
        submitPayload,
      );
      message.success($t('agency.withdrawAccount.updateSuccess'));
    } else {
      await createWithdrawalAccountApi(props.agentId, submitPayload);
      message.success($t('agency.withdrawAccount.addSuccess'));
    }

    showAccountModal.value = false;
    loadAccounts();
  } catch (error) {
    console.error('Failed to submit account:', error);
    message.error($t('agency.withdrawAccount.opFailed'));
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
    message.success(
      $t('agency.withdrawAccount.statusUpdated', [
        newStatus === 'active'
          ? $t('common.enable')
          : $t('common.disable'),
      ]),
    );
  } catch (error) {
    console.error('Failed to toggle status:', error);
    message.error($t('agency.withdrawAccount.statusUpdateFailed'));
  }
};

const handleDeleteAccount = async (id: number) => {
  if (!props.agentId) return;

  try {
    await deleteWithdrawalAccountApi(props.agentId, id);
    message.success($t('agency.withdrawAccount.deleteSuccess'));
    loadAccounts();
  } catch (error) {
    console.error('Failed to delete account:', error);
    message.error($t('agency.withdrawAccount.deleteFailed'));
  }
};

const handleBatchVerify = () => {
  message.info($t('agency.withdrawAccount.batchVerifyDeveloping'));
};

const handleExportAccounts = () => {
  message.info($t('agency.withdrawAccount.exportDeveloping'));
};

const handleRefresh = () => {
  loadAccounts();
  message.success($t('agency.withdrawAccount.refreshed'));
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
