<template>
  <Page
    :description="$t('user.backofficeAccount.pageDescription')"
    :title="$t('user.backofficeAccount.pageTitle')"
  >
    <div class="mb-4">
      <n-breadcrumb>
        <n-breadcrumb-item>{{ $t('user.backofficeAccount.breadcrumbAccountMgmt') }}</n-breadcrumb-item>
        <n-breadcrumb-item>{{
          $t('user.backofficeAccount.breadcrumbBackoffice')
        }}</n-breadcrumb-item>
      </n-breadcrumb>
    </div>

    <n-card class="mb-4">
      <div class="flex flex-wrap items-end gap-4">
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium">{{
            $t('user.backofficeAccount.role')
          }}</label>
          <n-select
            v-model:value="filterForm.role"
            :placeholder="$t('user.backofficeAccount.selectRole')"
            clearable
            style="width: 140px"
            :options="roleOptions"
            @update:value="handleFilter"
          />
        </div>

        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium">{{ $t('common.status') }}</label>
          <n-select
            v-model:value="filterForm.status"
            :placeholder="$t('user.backofficeAccount.selectStatus')"
            clearable
            style="width: 140px"
            :options="statusOptions"
            @update:value="handleFilter"
          />
        </div>

        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium">{{ $t('common.search') }}</label>
          <div class="flex gap-2">
            <n-input
              v-model:value="filterForm.search"
              :placeholder="$t('user.backofficeAccount.searchUsername')"
              style="width: 240px"
              @keyup.enter="handleFilter"
            />
            <n-button type="primary" @click="handleFilter">
              {{ $t('common.search') }}
            </n-button>
            <n-button @click="resetFilter"> {{ $t('common.reset') }} </n-button>
          </div>
        </div>
      </div>
    </n-card>

    <SmartDataGrid
      :data="tableData"
      :columns="columns"
      :loading="loading"
      :pagination="paginationReactive"
      selectable
      :selected-keys="checkedRowKeys"
      row-key="id"
      @update:selected-keys="checkedRowKeys = $event"
      @update:page="handlePageChange"
      @update:page-size="handlePageSizeChange"
      @refresh="handleRefresh"
      @row-click="handleRowClick"
    >
      <template #actionBar="{ selectedCount, selectedRows }">
        <n-card :bordered="false" class="rounded-16px shadow-sm">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div class="flex gap-2">
                <n-button type="primary" @click="handleAddAccount">
                  {{ $t('user.backofficeAccount.addAccount') }}
                </n-button>
              </div>

              <div class="text-sm text-gray-600">
                {{
                  $t('user.backofficeAccount.selectedCount', [
                    selectedCount,
                    paginationReactive.total,
                  ])
                }}
              </div>
            </div>

            <div class="flex gap-2">
              <n-button size="small" @click="clearSelection">{{
                $t('user.backofficeAccount.clearSelection')
              }}</n-button>
              <n-button size="small" @click="selectAll">{{
                $t('common.selectAll')
              }}</n-button>
            </div>
          </div>
        </n-card>
      </template>
    </SmartDataGrid>

    <n-modal
      v-model:show="showDetailModal"
      :title="$t('user.backofficeAccount.accountDetail')"
      preset="dialog"
      style="width: 600px"
    >
      <n-card v-if="currentAccount">
        <n-descriptions bordered :column="2">
          <n-descriptions-item :label="$t('user.backofficeAccount.accountId')">
            {{ currentAccount.id }}
          </n-descriptions-item>
          <n-descriptions-item :label="$t('user.backofficeAccount.username')">
            {{ currentAccount.username }}
          </n-descriptions-item>
          <n-descriptions-item :label="$t('user.backofficeAccount.role')">
            <n-tag :type="getRoleType(currentAccount.role)">
              {{ getRoleLabel(currentAccount.role) }}
            </n-tag>
          </n-descriptions-item>
          <n-descriptions-item :label="$t('common.status')">
            <n-tag :type="currentAccount.isSuspended ? 'error' : 'success'">
              {{
                currentAccount.isSuspended
                  ? $t('user.backofficeAccount.suspended')
                  : $t('user.backofficeAccount.normal')
              }}
            </n-tag>
          </n-descriptions-item>
          <n-descriptions-item :label="$t('common.createTime')">
            <TzDateTime :value="currentAccount.createdDate" />
          </n-descriptions-item>
          <n-descriptions-item :label="$t('user.backofficeAccount.lastLogin')">
            <TzDateTime
              v-if="currentAccount.lastLoginDate"
              :value="currentAccount.lastLoginDate"
            />
            <span v-else>{{ $t('user.backofficeAccount.neverLoggedIn') }}</span>
          </n-descriptions-item>
          <n-descriptions-item :label="$t('user.backofficeAccount.lastLoginIp')">
            {{ currentAccount.lastLoginIp || $t('user.backofficeAccount.none') }}
          </n-descriptions-item>
          <n-descriptions-item :label="$t('user.backofficeAccount.failedLoginCount')">
            {{ currentAccount.failedLoginAttempt || 0 }}
            {{ $t('user.backofficeAccount.times') }}
          </n-descriptions-item>
        </n-descriptions>

        <div class="mt-4 flex justify-end gap-2">
          <n-button @click="showDetailModal = false">{{ $t('common.close') }}</n-button>
          <n-button type="info" @click="handleEditAccount(currentAccount)">
            {{ $t('common.edit') }}
          </n-button>
          <n-button
            :type="currentAccount.isSuspended ? 'success' : 'warning'"
            @click="handleToggleStatus(currentAccount)"
          >
            {{
              currentAccount.isSuspended
                ? $t('common.enable')
                : $t('common.disable')
            }}
          </n-button>
        </div>
      </n-card>
    </n-modal>

    <n-modal
      v-model:show="showEditModal"
      :title="
        editMode === 'add'
          ? $t('user.backofficeAccount.addAccount')
          : $t('user.backofficeAccount.editAccount')
      "
      preset="dialog"
      style="width: 500px"
    >
      <n-form
        ref="formRef"
        :model="editForm"
        :rules="formRules"
        label-placement="left"
        label-width="80px"
      >
        <n-form-item :label="$t('user.backofficeAccount.username')" path="username">
          <n-input
            v-model:value="editForm.username"
            :placeholder="$t('user.backofficeAccount.enterUsername')"
            :disabled="editMode === 'edit'"
          />
        </n-form-item>
        <n-form-item :label="$t('user.backofficeAccount.password')" path="password">
          <n-input
            v-model:value="editForm.password"
            type="password"
            :placeholder="
              editMode === 'add'
                ? $t('user.backofficeAccount.enterPassword')
                : $t('user.backofficeAccount.leaveBlankNoChange')
            "
            show-password-on="click"
          />
        </n-form-item>
        <n-form-item
          :label="
            editMode === 'add'
              ? $t('user.backofficeAccount.confirmPassword')
              : $t('user.backofficeAccount.confirmNewPassword')
          "
          path="confirmPassword"
          v-if="editMode === 'add' || !!editForm.password"
        >
          <n-input
            v-model:value="editForm.confirmPassword"
            type="password"
            :placeholder="
              editMode === 'add'
                ? $t('user.backofficeAccount.enterPasswordAgain')
                : $t('user.backofficeAccount.enterNewPasswordAgain')
            "
            show-password-on="click"
          />
        </n-form-item>
        <n-form-item :label="$t('user.backofficeAccount.role')" path="role">
          <n-select
            v-model:value="editForm.role"
            :placeholder="$t('user.backofficeAccount.selectRolePlaceholder')"
            :options="roleOptions"
          />
        </n-form-item>
        <n-form-item :label="$t('common.status')" path="isSuspended">
          <n-switch
            v-model:value="editForm.isSuspended"
            :checked-value="false"
            :unchecked-value="true"
          >
            <template #checked>{{ $t('user.backofficeAccount.normal') }}</template>
            <template #unchecked>{{ $t('common.disable') }}</template>
          </n-switch>
        </n-form-item>
      </n-form>

      <div class="mt-4 flex justify-end gap-2">
        <n-button @click="showEditModal = false">{{ $t('common.cancel') }}</n-button>
        <n-button type="primary" @click="handleSubmitEdit">
          {{ editMode === 'add' ? $t('common.create') : $t('common.save') }}
        </n-button>
      </div>
    </n-modal>
  </Page>
</template>

<script setup lang="ts">
import { $t } from '@vben/locales';

import { ref, reactive, onMounted, h, computed, defineAsyncComponent } from 'vue';
const SmartDataGrid = defineAsyncComponent(
  () => import('../../../components/smart/SmartDataGrid/index.vue'),
);
import { Page } from '@vben/common-ui';
import {
  NCard,
  NButton,
  NSelect,
  NInput,
  NModal,
  NTag,
  NSwitch,
  NDescriptions,
  NDescriptionsItem,
  NBreadcrumb,
  NBreadcrumbItem,
  NForm,
  NFormItem,
  useMessage,
  type DataTableColumns,
  type FormInst,
  type FormRules,
} from 'naive-ui';
import TzDateTime from '#/components/common/TzDateTime.vue';
import { renderTzDateTime } from '#/components/common/tzDateTimeRender';
import {
  getBackofficeAccountsApi,
  createBackofficeAccountApi,
  updateBackofficeAccountApi,
  deleteBackofficeAccountApi,
  toggleAccountStatusApi,
  type BackofficeAccount,
  type BackofficeAccountListParams,
} from '#/api/core/user-account';

const message = useMessage();

const loading = ref(false);
const showDetailModal = ref(false);
const showEditModal = ref(false);
const checkedRowKeys = ref<(string | number)[]>([]);
const tableData = ref<BackofficeAccount[]>([]);
const currentAccount = ref<BackofficeAccount | null>(null);
const formRef = ref<FormInst | null>(null);
const editMode = ref<'add' | 'edit'>('add');

const filterForm = reactive({
  role: null as string | null,
  status: null as number | null,
  search: '',
});

const editForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  role: 'STAFF',
  isSuspended: false,
});

const formRules = computed<FormRules>(() => ({
  username: [
    {
      required: true,
      message: $t('user.backofficeAccount.enterUsername'),
      trigger: 'blur',
    },
    {
      min: 3,
      max: 20,
      message: $t('user.backofficeAccount.usernameLength'),
      trigger: 'blur',
    },
  ],
  password: [
    {
      validator: (_rule, value) => {
        if (editMode.value === 'add' && !value) {
          return new Error($t('user.backofficeAccount.enterPassword'));
        }
        if (value && value.length < 6) {
          return new Error($t('user.backofficeAccount.passwordMinLength'));
        }
        return true;
      },
      trigger: ['blur', 'input'],
    },
  ],
  confirmPassword: [
    {
      validator: (_rule, value) => {
        if (editMode.value === 'add' && !value) {
          return new Error($t('user.backofficeAccount.enterPasswordAgain'));
        }
        if (editMode.value === 'edit' && editForm.password && !value) {
          return new Error($t('user.backofficeAccount.enterNewPasswordAgain'));
        }
        if (editMode.value === 'edit' && !editForm.password && !value) {
          return true;
        }
        if (value !== editForm.password) {
          return new Error($t('user.backofficeAccount.passwordMismatch'));
        }
        return true;
      },
      trigger: ['blur', 'input'],
    },
  ],
  role: [
    {
      required: true,
      message: $t('user.backofficeAccount.selectRoleRequired'),
      trigger: 'change',
    },
  ],
}));

const paginationReactive = reactive({
  page: 1,
  pageSize: 20,
  total: 0,
});

const roleOptions = computed(() => [
  { label: $t('user.backofficeAccount.roleSuperAdmin'), value: 'SUPER_ADMIN' },
  { label: $t('user.backofficeAccount.roleAdmin'), value: 'ADMIN' },
  { label: $t('user.backofficeAccount.roleStaff'), value: 'STAFF' },
  {
    label: $t('user.backofficeAccount.roleCustomerService'),
    value: 'CUSTOMER_SERVICE',
  },
]);

const statusOptions = computed(() => [
  { label: $t('user.backofficeAccount.normal'), value: 1 },
  { label: $t('common.disable'), value: 0 },
]);

const getRoleType = (
  role: string,
): 'error' | 'warning' | 'info' | 'success' | 'default' => {
  const roleMap: Record<
    string,
    'error' | 'warning' | 'info' | 'success' | 'default'
  > = {
    SUPER_ADMIN: 'error',
    ADMIN: 'warning',
    STAFF: 'info',
    CUSTOMER_SERVICE: 'success',
  };
  return roleMap[role] || 'default';
};

const getRoleLabel = (role: string) => {
  const roleMap: Record<string, string> = {
    SUPER_ADMIN: $t('user.backofficeAccount.roleSuperAdmin'),
    ADMIN: $t('user.backofficeAccount.roleAdmin'),
    STAFF: $t('user.backofficeAccount.roleStaff'),
    CUSTOMER_SERVICE: $t('user.backofficeAccount.roleCustomerService'),
  };
  return roleMap[role] || role;
};

const columns = computed<DataTableColumns<BackofficeAccount>>(() => [
  { type: 'selection' },
  {
    title: $t('user.backofficeAccount.accountId'),
    key: 'id',
    width: 80,
    render(row) {
      return h(
        'span',
        { style: 'color: #2080f0; cursor: pointer' },
        String(row.id),
      );
    },
  },
  {
    title: $t('user.backofficeAccount.username'),
    key: 'username',
    width: 150,
    ellipsis: { tooltip: true },
  },
  {
    title: $t('user.backofficeAccount.role'),
    key: 'role',
    width: 120,
    render(row) {
      return h(
        NTag,
        { type: getRoleType(row.role) },
        { default: () => getRoleLabel(row.role) },
      );
    },
  },
  {
    title: $t('common.status'),
    key: 'isSuspended',
    width: 80,
    render(row) {
      return h(NSwitch, {
        value: !row.isSuspended,
        disabled: true,
        size: 'small',
      });
    },
  },
  {
    title: $t('common.createTime'),
    key: 'createdDate',
    width: 160,
    render(row) {
      return renderTzDateTime(row.createdDate);
    },
  },
  {
    title: $t('user.backofficeAccount.lastLogin'),
    key: 'lastLoginDate',
    width: 160,
    render(row) {
      if (!row.lastLoginDate) return $t('user.backofficeAccount.neverLoggedIn');
      return renderTzDateTime(row.lastLoginDate);
    },
  },
  {
    title: $t('user.backofficeAccount.failedLoginCount'),
    key: 'failedLoginAttempt',
    width: 120,
    render(row) {
      return h(
        'span',
        { style: row.failedLoginAttempt > 3 ? 'color: #f56565' : '' },
        `${row.failedLoginAttempt} ${$t('user.backofficeAccount.times')}`,
      );
    },
  },
  {
    title: $t('common.actions'),
    key: 'actions',
    width: 200,
    render(row) {
      return h('div', { class: 'flex gap-1' }, [
        h(
          NButton,
          {
            size: 'small',
            type: 'primary',
            onClick: () => handleViewDetail(row),
          },
          { default: () => $t('common.detail') },
        ),
        h(
          NButton,
          {
            size: 'small',
            type: 'info',
            onClick: () => handleEditAccount(row),
          },
          { default: () => $t('common.edit') },
        ),
      ]);
    },
  },
]);

const handleFilter = () => {
  paginationReactive.page = 1;
  loadTableData();
};

const resetFilter = () => {
  Object.assign(filterForm, {
    role: null,
    status: null,
    search: '',
  });
  paginationReactive.page = 1;
  loadTableData();
};

const handleRefresh = () => {
  loadTableData();
};

const handlePageChange = (page: number) => {
  paginationReactive.page = page;
  loadTableData();
};

const handlePageSizeChange = (pageSize: number) => {
  paginationReactive.pageSize = pageSize;
  paginationReactive.page = 1;
  loadTableData();
};

const handleRowClick = (account: BackofficeAccount) => {
  handleViewDetail(account);
};

const clearSelection = () => {
  checkedRowKeys.value = [];
  message.success($t('user.backofficeAccount.clearedSelection'));
};

const selectAll = () => {
  checkedRowKeys.value = tableData.value.map((account) => account.id);
  message.success($t('user.backofficeAccount.selectedAll'));
};

const handleViewDetail = (account: BackofficeAccount) => {
  currentAccount.value = account;
  showDetailModal.value = true;
};

const handleAddAccount = () => {
  editMode.value = 'add';
  Object.assign(editForm, {
    username: '',
    password: '',
    confirmPassword: '',
    role: 'STAFF',
    isSuspended: false,
  });
  showEditModal.value = true;
};

const handleEditAccount = (account: BackofficeAccount) => {
  currentAccount.value = account;
  editMode.value = 'edit';
  Object.assign(editForm, {
    username: account.username,
    password: '',
    confirmPassword: '',
    role: account.role,
    isSuspended: account.isSuspended,
  });
  showEditModal.value = true;
};

const handleSubmitEdit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();

    if (editMode.value === 'add') {
      await createBackofficeAccountApi({
        username: editForm.username,
        password: editForm.password,
        role: editForm.role,
        status: editForm.isSuspended ? 0 : 1,
      });
      message.success($t('user.backofficeAccount.accountCreated'));
    } else if (currentAccount.value) {
      const updatePayload: {
        role: string;
        isSuspended: boolean;
        password?: string;
      } = {
        role: editForm.role,
        isSuspended: editForm.isSuspended,
      };
      const newPassword = editForm.password.trim();
      if (newPassword) {
        updatePayload.password = newPassword;
      }
      await updateBackofficeAccountApi(currentAccount.value.id, {
        ...updatePayload,
      });
      message.success(
        newPassword
          ? $t('user.backofficeAccount.accountPasswordUpdated')
          : $t('user.backofficeAccount.accountUpdated'),
      );
    }

    showEditModal.value = false;
    loadTableData();
  } catch (error) {
    message.error(
      editMode.value === 'add'
        ? $t('user.backofficeAccount.createFailed')
        : $t('user.backofficeAccount.updateFailed'),
    );
    console.error('Error submitting edit:', error);
  }
};

const handleDeleteAccount = async (account: BackofficeAccount) => {
  try {
    await deleteBackofficeAccountApi(account.id);
    message.success($t('user.backofficeAccount.deleteSuccess'));
    loadTableData();
    if (showDetailModal.value && currentAccount.value?.id === account.id) {
      showDetailModal.value = false;
    }
  } catch (error) {
    message.error($t('user.backofficeAccount.deleteFailed'));
    console.error('Error deleting account:', error);
  }
};

const handleToggleStatus = async (account: BackofficeAccount) => {
  try {
    const newSuspendedStatus = !account.isSuspended;
    await toggleAccountStatusApi(account.id, newSuspendedStatus);
    message.success(
      $t('user.backofficeAccount.toggleSuccess', [
        newSuspendedStatus
          ? $t('user.backofficeAccount.toggleDisabled')
          : $t('user.backofficeAccount.toggleEnabled'),
      ]),
    );
    loadTableData();
    if (showDetailModal.value && currentAccount.value?.id === account.id) {
      showDetailModal.value = false;
    }
  } catch (error) {
    message.error($t('common.operationFailed'));
    console.error('Error toggling status:', error);
  }
};

const handleBulkDelete = async (selectedRows?: BackofficeAccount[]) => {
  const accountsToDelete =
    selectedRows ||
    tableData.value.filter((account) =>
      checkedRowKeys.value.includes(account.id),
    );

  if (accountsToDelete.length === 0) {
    message.warning($t('user.backofficeAccount.selectToDelete'));
    return;
  }

  try {
    const promises = accountsToDelete.map((account) =>
      deleteBackofficeAccountApi(Number(account.id)),
    );

    await Promise.all(promises);
    message.success(
      $t('user.backofficeAccount.bulkDeleteSuccess', [accountsToDelete.length]),
    );
    checkedRowKeys.value = [];
    loadTableData();
  } catch (error) {
    message.error($t('user.backofficeAccount.bulkDeleteFailed'));
    console.error('Error bulk deleting accounts:', error);
  }
};

const loadTableData = async () => {
  loading.value = true;
  try {
    const params: BackofficeAccountListParams = {
      page: paginationReactive.page,
      pageSize: paginationReactive.pageSize,
      search: filterForm.search || undefined,
      role: filterForm.role || undefined,
      status: filterForm.status || undefined,
      sortBy: 'createdDate',
      sortOrder: 'desc',
    };

    const response = await getBackofficeAccountsApi(params);
    tableData.value = response.list;
    paginationReactive.total = response.pagination.total;
  } catch (error) {
    message.error($t('user.backofficeAccount.loadFailed'));
    console.error('Error loading table data:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadTableData();
});
</script>
