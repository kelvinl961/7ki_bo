<template>
  <div class="withdraw-account-tab">
    <div v-if="loading" class="flex h-96 items-center justify-center">
      <n-spin size="large" />
    </div>

    <div v-else class="withdraw-account-content">
      <!-- Header Actions -->
      <div class="mb-4 flex items-center justify-between">
        <h3 class="text-lg font-medium">{{ $t('user.withdrawAccount.title') }}</h3>
        <div class="flex gap-2">
          <n-button @click="handleRefresh"> {{ $t('common.refresh') }} </n-button>
          <n-button type="primary" @click="handleAddAccount">
            {{ $t('user.withdrawAccount.addMemberAccount') }}
          </n-button>
        </div>
      </div>

      <!-- Data Table -->
      <n-card>
        <n-data-table
          :loading="tableLoading"
          :columns="columns"
          :data="accountList"
          :pagination="pagination"
          size="small"
          :row-key="(row: WithdrawAccount) => row.id"
          :scroll-x="1200"
        />
      </n-card>

      <!-- Edit Note Modal -->
      <n-modal
        v-model:show="showEditNoteModal"
        preset="dialog"
        :title="$t('user.withdrawAccount.editBackendNote')"
      >
        <n-input
          v-model:value="editingNote"
          type="textarea"
          :placeholder="$t('user.withdrawAccount.enterBackendNote')"
          :rows="4"
        />
        <template #action>
          <div class="flex gap-2">
            <n-button @click="showEditNoteModal = false">{{ $t('common.cancel') }}</n-button>
            <n-button
              type="primary"
              :loading="noteLoading"
              @click="handleSaveNote"
            >
              {{ $t('common.save') }}
            </n-button>
          </div>
        </template>
      </n-modal>

      <!-- Add/Edit Account Form -->
      <WithdrawAccountForm
        v-model:visible="showAccountForm"
        :user-id="userId"
        :edit-data="editingAccount"
        @success="handleAccountSuccess"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { $t } from '@vben/locales';

import { ref, reactive, computed, h, onMounted } from 'vue';
import {
  NCard,
  NButton,
  NDataTable,
  NTag,
  NModal,
  NInput,
  NSpin,
  NPopconfirm,
  useMessage,
  type DataTableColumns,
} from 'naive-ui';
import {
  getWithdrawAccountsByUserIdApi,
  toggleWithdrawAccountStatusApi,
  updateWithdrawAccountApi,
  deleteWithdrawAccountApi,
  type WithdrawAccount,
} from '#/api/core/withdrawal-account';
import WithdrawAccountForm from './WithdrawAccountForm.vue';

interface Props {
  userId: number;
}

const props = defineProps<Props>();
const message = useMessage();

// State
const loading = ref(false);
const tableLoading = ref(false);
const accountList = ref<WithdrawAccount[]>([]);
const showAccountForm = ref(false);
const editingAccount = ref<WithdrawAccount | null>(null);

// Edit note modal
const showEditNoteModal = ref(false);
const editingNote = ref('');
const editingAccountId = ref('');
const noteLoading = ref(false);

// Pagination
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizePicker: true,
  pageSizes: [10, 20, 50],
  prefix: (info: any) => $t('user.withdrawAccount.totalRecords', [info.itemCount]),
  onUpdatePage: (page: number) => {
    pagination.current = page;
    loadAccounts();
  },
  onUpdatePageSize: (pageSize: number) => {
    pagination.pageSize = pageSize;
    pagination.current = 1;
    loadAccounts();
  },
});

const getMethodTypeLabel = (methodType: string) => {
  const typeMap: Record<string, string> = {
    PIX: 'PIX',
    BANK_TRANSFER: $t('user.withdrawAccount.bankTransfer'),
    TED: 'TED',
    DOC: 'DOC',
  };
  return typeMap[methodType] || methodType;
};

const getAccountTypeLabel = (accountType: string) => {
  const typeMap: Record<string, string> = {
    PHONE: $t('user.allMembers.phone'),
    CPF: 'CPF',
    EMAIL: $t('user.contact.email'),
    RANDOM_KEY: $t('user.withdrawAccount.randomKey'),
    BANK_ACCOUNT: $t('user.withdrawAccount.bankAccount'),
    'Individual Tax Number': 'CPF',
    PIX_CPF: 'CPF',
  };
  return typeMap[accountType] || accountType;
};

// Table columns
const columns = computed<DataTableColumns<WithdrawAccount>>(() => [
  {
    title: $t('common.currency'),
    key: 'currency',
    width: 80,
    align: 'center',
    render: (row) => {
      return h(
        NTag,
        { type: 'info', size: 'small' },
        { default: () => row.currency },
      );
    },
  },
  {
    title: $t('user.withdrawAccount.withdrawMethod'),
    key: 'methodType',
    width: 100,
    render: (row) => {
      return h(
        NTag,
        { type: 'default', size: 'small' },
        { default: () => getMethodTypeLabel(row.methodType) },
      );
    },
  },
  {
    title: $t('user.withdrawAccount.accountType'),
    key: 'accountType',
    width: 120,
    render: (row) => getAccountTypeLabel(row.accountType),
  },
  {
    title: $t('user.withdrawAccount.withdrawAddress'),
    key: 'accountValue',
    width: 200,
    ellipsis: true,
    tooltip: true,
  },
  {
    title: $t('user.withdrawAccount.bankInfo'),
    key: 'bankInfo',
    width: 180,
    render: (row) => {
      if (row.methodType === 'BANK_TRANSFER') {
        return h('div', { class: 'text-sm' }, [
          row.bankName &&
            h('div', {}, `${$t('user.withdrawAccount.bankName')}: ${row.bankName}`),
          row.bankHolderName &&
            h(
              'div',
              {},
              `${$t('user.withdrawAccount.accountHolder')}: ${row.bankHolderName}`,
            ),
          row.bankCode &&
            h('div', {}, `${$t('user.withdrawAccount.bankCode')}: ${row.bankCode}`),
        ]);
      }
      return '-';
    },
  },
  {
    title: $t('user.withdrawAccount.backendNote'),
    key: 'backendNote',
    width: 150,
    ellipsis: true,
    render: (row) => {
      return h('div', { class: 'flex items-center gap-2' }, [
        h('span', {}, row.backendNote || '-'),
        h(
          NButton,
          {
            text: true,
            size: 'small',
            type: 'primary',
            onClick: () => handleEditNote(row),
          },
          { default: () => $t('common.edit') },
        ),
      ]);
    },
  },
  {
    title: $t('user.withdrawAccount.addedTime'),
    key: 'createdAt',
    width: 160,
    render: (row) => {
      return new Date(row.createdAt).toLocaleString();
    },
  },
  {
    title: $t('common.status'),
    key: 'status',
    width: 100,
    align: 'center',
    render: (row) => {
      const isActive = row.status === 'ACTIVE';
      return h(
        NTag,
        {
          type: isActive ? 'success' : 'error',
          size: 'small',
        },
        { default: () => (isActive ? $t('common.enabled') : $t('common.disabled')) },
      );
    },
  },
  {
    title: $t('common.actions'),
    key: 'actions',
    width: 180,
    align: 'center',
    render: (row) => {
      const isActive = row.status === 'ACTIVE';
      return h('div', { class: 'flex gap-1' }, [
        h(
          NButton,
          {
            text: true,
            size: 'small',
            type: 'primary',
            onClick: () => handleEditAccount(row),
          },
          { default: () => $t('common.edit') },
        ),
        h(
          NButton,
          {
            text: true,
            size: 'small',
            type: isActive ? 'warning' : 'success',
            onClick: () => handleToggleStatus(row),
          },
          { default: () => (isActive ? $t('common.disable') : $t('common.enable')) },
        ),
        h(
          NPopconfirm,
          {
            onPositiveClick: () => handleDeleteAccount(row.id),
          },
          {
            default: () => $t('user.withdrawAccount.confirmDelete'),
            trigger: () =>
              h(
                NButton,
                {
                  text: true,
                  size: 'small',
                  type: 'error',
                },
                { default: () => $t('common.delete') },
              ),
          },
        ),
      ]);
    },
  },
]);

// Methods
const loadAccounts = async () => {
  tableLoading.value = true;
  try {
    const response = await getWithdrawAccountsByUserIdApi({
      userId: props.userId,
      page: pagination.current,
      pageSize: pagination.pageSize,
    });

    accountList.value = response.list;
    pagination.total = response.pagination.total;
  } catch (error) {
    message.error($t('user.withdrawAccount.loadFailed'));
    console.error('Error loading accounts:', error);
  } finally {
    tableLoading.value = false;
  }
};

const handleRefresh = () => {
  loadAccounts();
};

const handleAddAccount = () => {
  editingAccount.value = null;
  showAccountForm.value = true;
};

const handleEditAccount = (account: WithdrawAccount) => {
  editingAccount.value = account;
  showAccountForm.value = true;
};

const handleAccountSuccess = () => {
  loadAccounts();
};

const handleEditNote = (account: WithdrawAccount) => {
  editingAccountId.value = account.id;
  editingNote.value = account.backendNote || '';
  showEditNoteModal.value = true;
};

const handleSaveNote = async () => {
  if (!editingAccountId.value) return;

  noteLoading.value = true;
  try {
    await updateWithdrawAccountApi(editingAccountId.value, {
      backendNote: editingNote.value,
    });

    message.success($t('user.withdrawAccount.noteUpdateSuccess'));
    showEditNoteModal.value = false;
    loadAccounts();
  } catch (error) {
    message.error($t('user.withdrawAccount.noteUpdateFailed'));
    console.error('Error updating note:', error);
  } finally {
    noteLoading.value = false;
  }
};

const handleToggleStatus = async (account: WithdrawAccount) => {
  try {
    const newStatus = account.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    await toggleWithdrawAccountStatusApi(account.id, newStatus);

    message.success(
      $t('user.withdrawAccount.statusToggled', [
        newStatus === 'ACTIVE'
          ? $t('common.enable')
          : $t('common.disable'),
      ]),
    );
    loadAccounts();
  } catch (error) {
    message.error($t('user.withdrawAccount.statusToggleFailed'));
    console.error('Error toggling status:', error);
  }
};

const handleDeleteAccount = async (accountId: string) => {
  try {
    await deleteWithdrawAccountApi(accountId);
    message.success($t('user.withdrawAccount.deleteSuccess'));
    loadAccounts();
  } catch (error) {
    message.error($t('user.withdrawAccount.deleteFailed'));
    console.error('Error deleting account:', error);
  }
};

// Lifecycle
onMounted(() => {
  loadAccounts();
});
</script>

<style scoped>
.withdraw-account-tab {
  padding: 16px;
}

.withdraw-account-content {
  min-height: 400px;
}

.flex {
  display: flex;
}

.justify-center {
  justify-content: center;
}

.justify-between {
  justify-content: space-between;
}

.items-center {
  align-items: center;
}

.gap-1 {
  gap: 4px;
}

.gap-2 {
  gap: 8px;
}

.mb-4 {
  margin-bottom: 16px;
}

.h-96 {
  height: 24rem;
}

.text-lg {
  font-size: 1.125rem;
}

.text-sm {
  font-size: 0.875rem;
}

.font-medium {
  font-weight: 500;
}
</style>
