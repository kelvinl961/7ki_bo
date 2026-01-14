<template>
  <div class="withdraw-account-tab">
    <div v-if="loading" class="flex justify-center items-center h-96">
      <n-spin size="large" />
    </div>

    <div v-else class="withdraw-account-content">
      <!-- Header Actions -->
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-medium">提现账号管理</h3>
        <div class="flex gap-2">
          <n-button @click="handleRefresh">
            刷新
          </n-button>
          <n-button type="primary" @click="handleAddAccount">
            添加会员提现账号
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
      <n-modal v-model:show="showEditNoteModal" preset="dialog" title="编辑后台备注">
        <n-input
          v-model:value="editingNote"
          type="textarea"
          placeholder="输入后台备注"
          :rows="4"
        />
        <template #action>
          <div class="flex gap-2">
            <n-button @click="showEditNoteModal = false">取消</n-button>
            <n-button type="primary" :loading="noteLoading" @click="handleSaveNote">
              保存
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
import { ref, reactive, h, onMounted } from 'vue';
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
  type DataTableColumns
} from 'naive-ui';
import {
  getWithdrawAccountsByUserIdApi,
  toggleWithdrawAccountStatusApi,
  updateWithdrawAccountApi,
  deleteWithdrawAccountApi,
  type WithdrawAccount
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
  prefix: (info: any) => `共 ${info.itemCount} 条`,
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

// Table columns
const columns: DataTableColumns<WithdrawAccount> = [
  {
    title: '币种',
    key: 'currency',
    width: 80,
    align: 'center',
    render: (row) => {
      return h(NTag, { type: 'info', size: 'small' }, { default: () => row.currency });
    }
  },
  {
    title: '提现方式',
    key: 'methodType',
    width: 100,
    render: (row) => {
      const typeMap = {
        'PIX': 'PIX',
        'BANK_TRANSFER': '银行转账',
        'TED': 'TED',
        'DOC': 'DOC'
      };
      const type = typeMap[row.methodType as keyof typeof typeMap] || row.methodType;
      return h(NTag, { type: 'default', size: 'small' }, { default: () => type });
    }
  },
  {
    title: '提现账户类型',
    key: 'accountType',
    width: 120,
    render: (row) => {
      const typeMap = {
        'PHONE': '手机号',
        'CPF': 'CPF',
        'EMAIL': '邮箱',
        'RANDOM_KEY': '随机密钥',
        'BANK_ACCOUNT': '银行账户',
        'Individual Tax Number': 'CPF', // Map database value to CPF
        'PIX_CPF': 'CPF' // Alternative format
      };
      return typeMap[row.accountType as keyof typeof typeMap] || row.accountType;
    }
  },
  {
    title: '提现账号/地址',
    key: 'accountValue',
    width: 200,
    ellipsis: true,
    tooltip: true
  },
  {
    title: '银行信息',
    key: 'bankInfo',
    width: 180,
    render: (row) => {
      if (row.methodType === 'BANK_TRANSFER') {
        return h('div', { class: 'text-sm' }, [
          row.bankName && h('div', {}, `银行: ${row.bankName}`),
          row.bankHolderName && h('div', {}, `户名: ${row.bankHolderName}`),
          row.bankCode && h('div', {}, `代码: ${row.bankCode}`)
        ]);
      }
      return '-';
    }
  },
  {
    title: '后台备注',
    key: 'backendNote',
    width: 150,
    ellipsis: true,
    render: (row) => {
      return h('div', { class: 'flex items-center gap-2' }, [
        h('span', {}, row.backendNote || '-'),
        h(NButton, {
          text: true,
          size: 'small',
          type: 'primary',
          onClick: () => handleEditNote(row)
        }, { default: () => '编辑' })
      ]);
    }
  },
  {
    title: '添加时间',
    key: 'createdAt',
    width: 160,
    render: (row) => {
      return new Date(row.createdAt).toLocaleString('zh-CN');
    }
  },
  {
    title: '状态',
    key: 'status',
    width: 100,
    align: 'center',
    render: (row) => {
      const isActive = row.status === 'ACTIVE';
      return h(NTag, {
        type: isActive ? 'success' : 'error',
        size: 'small'
      }, { default: () => isActive ? '启用' : '禁用' });
    }
  },
  {
    title: '操作',
    key: 'actions',
    width: 180,
    align: 'center',
    render: (row) => {
      const isActive = row.status === 'ACTIVE';
      return h('div', { class: 'flex gap-1' }, [
        h(NButton, {
          text: true,
          size: 'small',
          type: 'primary',
          onClick: () => handleEditAccount(row)
        }, { default: () => '编辑' }),
        h(NButton, {
          text: true,
          size: 'small',
          type: isActive ? 'warning' : 'success',
          onClick: () => handleToggleStatus(row)
        }, { default: () => isActive ? '停用' : '启用' }),
        h(NPopconfirm, {
          onPositiveClick: () => handleDeleteAccount(row.id)
        }, {
          default: () => '确定删除这个提现账号吗？',
          trigger: () => h(NButton, {
            text: true,
            size: 'small',
            type: 'error'
          }, { default: () => '删除' })
        })
      ]);
    }
  }
];

// Methods
const loadAccounts = async () => {
  tableLoading.value = true;
  try {
    const response = await getWithdrawAccountsByUserIdApi({
      userId: props.userId,
      page: pagination.current,
      pageSize: pagination.pageSize
    });
    
    accountList.value = response.list;
    pagination.total = response.pagination.total;
  } catch (error) {
    message.error('获取提现账号失败');
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
      backendNote: editingNote.value
    });
    
    message.success('备注更新成功');
    showEditNoteModal.value = false;
    loadAccounts();
  } catch (error) {
    message.error('备注更新失败');
    console.error('Error updating note:', error);
  } finally {
    noteLoading.value = false;
  }
};

const handleToggleStatus = async (account: WithdrawAccount) => {
  try {
    const newStatus = account.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    await toggleWithdrawAccountStatusApi(account.id, newStatus);
    
    message.success(`账号已${newStatus === 'ACTIVE' ? '启用' : '停用'}`);
    loadAccounts();
  } catch (error) {
    message.error('状态切换失败');
    console.error('Error toggling status:', error);
  }
};

const handleDeleteAccount = async (accountId: string) => {
  try {
    await deleteWithdrawAccountApi(accountId);
    message.success('提现账号删除成功');
    loadAccounts();
  } catch (error) {
    message.error('删除失败');
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