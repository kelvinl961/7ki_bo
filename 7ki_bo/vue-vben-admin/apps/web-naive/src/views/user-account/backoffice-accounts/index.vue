<template>
  <Page
    description="后台账号管理页面"
    title="后台账号"
  >
    <!-- 面包屑导航 -->
    <div class="mb-4">
      <n-breadcrumb>
        <n-breadcrumb-item>账号管理</n-breadcrumb-item>
        <n-breadcrumb-item>后台账号</n-breadcrumb-item>
      </n-breadcrumb>
    </div>

    <!-- 筛选器区域 -->
    <n-card class="mb-4">
      <div class="flex flex-wrap gap-4 items-end">
        <!-- 角色筛选 -->
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium">角色</label>
          <n-select
            v-model:value="filterForm.role"
            placeholder="选择角色"
            clearable
            style="width: 140px"
            :options="roleOptions"
            @update:value="handleFilter"
          />
        </div>

        <!-- 状态筛选 -->
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium">状态</label>
          <n-select
            v-model:value="filterForm.status"
            placeholder="选择状态"
            clearable
            style="width: 140px"
            :options="statusOptions"
            @update:value="handleFilter"
          />
        </div>

        <!-- 搜索框 -->
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium">搜索</label>
          <div class="flex gap-2">
            <n-input
              v-model:value="filterForm.search"
              placeholder="搜索用户名..."
              style="width: 240px"
              @keyup.enter="handleFilter"
            />
            <n-button type="primary" @click="handleFilter">
              搜索
            </n-button>
            <n-button @click="resetFilter">
              重置
            </n-button>
          </div>
        </div>
      </div>
    </n-card>

    <!-- 🚀 NEW: SmartDataGrid Component -->
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
          <div class="flex justify-between items-center">
            <div class="flex items-center gap-4">
              <!-- 主要操作按钮 -->
              <div class="flex gap-2">
                <n-button type="primary" @click="handleAddAccount">
                  新增账号
                </n-button>
              </div>
              
              <!-- 选择信息 -->
              <div class="text-sm text-gray-600">
                已选择 {{ selectedCount }} 条数据，共 {{ paginationReactive.total }} 条
              </div>
            </div>
            
            <div class="flex gap-2">
              <!-- 批量操作 -->
             <!-- <n-button 
                v-if="selectedCount > 0" 
                type="error" 
                size="small"
                @click="handleBulkDelete(selectedRows)"
              >
                批量删除 ({{ selectedCount }})
              </n-button>
              
              <!-- 选择控制 -->
              <n-button size="small" @click="clearSelection">清空选择</n-button>
              <n-button size="small" @click="selectAll">全选</n-button>
            </div>
          </div>
        </n-card>
      </template>
    </SmartDataGrid>

    <!-- 账号详情弹窗 -->
    <n-modal
      v-model:show="showDetailModal"
      title="账号详情"
      preset="dialog"
      style="width: 600px"
    >
      <n-card v-if="currentAccount">
        <n-descriptions bordered :column="2">
          <n-descriptions-item label="账号ID">
            {{ currentAccount.id }}
          </n-descriptions-item>
          <n-descriptions-item label="用户名">
            {{ currentAccount.username }}
          </n-descriptions-item>
          <n-descriptions-item label="角色">
            <n-tag :type="getRoleType(currentAccount.role)">
              {{ getRoleLabel(currentAccount.role) }}
            </n-tag>
          </n-descriptions-item>
          <n-descriptions-item label="状态">
            <n-tag :type="currentAccount.isSuspended ? 'error' : 'success'">
              {{ currentAccount.isSuspended ? '已停用' : '正常' }}
            </n-tag>
          </n-descriptions-item>
          <n-descriptions-item label="创建时间">
            {{ formatDateTime(currentAccount.createdDate) }}
          </n-descriptions-item>
          <n-descriptions-item label="最后登录">
            {{ currentAccount.lastLoginDate ? formatDateTime(currentAccount.lastLoginDate) : '从未登录' }}
          </n-descriptions-item>
          <n-descriptions-item label="最后登录IP">
            {{ currentAccount.lastLoginIp || '无' }}
          </n-descriptions-item>
          <n-descriptions-item label="登录失败次数">
            {{ currentAccount.failedLoginAttempt || 0 }} 次
          </n-descriptions-item>
        </n-descriptions>
        
        <div class="flex justify-end mt-4 gap-2">
          <n-button @click="showDetailModal = false">关闭</n-button>
          <n-button type="info" @click="handleEditAccount(currentAccount)">
            编辑
          </n-button>
          <n-button 
            :type="currentAccount.isSuspended ? 'success' : 'warning'"
            @click="handleToggleStatus(currentAccount)"
          >
            {{ currentAccount.isSuspended ? '启用' : '停用' }}
          </n-button>
          <!-- <n-button type="error" @click="handleDeleteAccount(currentAccount)">
            删除
          </n-button> -->
        </div>
      </n-card>
    </n-modal>

    <!-- 新增/编辑账号弹窗 -->
    <n-modal
      v-model:show="showEditModal"
      :title="editMode === 'add' ? '新增账号' : '编辑账号'"
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
        <n-form-item label="用户名" path="username">
          <n-input
            v-model:value="editForm.username"
            placeholder="请输入用户名"
            :disabled="editMode === 'edit'"
          />
        </n-form-item>
        <n-form-item label="密码" path="password" v-if="editMode === 'add'">
          <n-input
            v-model:value="editForm.password"
            type="password"
            placeholder="请输入密码"
            show-password-on="click"
          />
        </n-form-item>
        <n-form-item label="确认密码" path="confirmPassword" v-if="editMode === 'add'">
          <n-input
            v-model:value="editForm.confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            show-password-on="click"
          />
        </n-form-item>
        <n-form-item label="角色" path="role">
          <n-select
            v-model:value="editForm.role"
            placeholder="请选择角色"
            :options="roleOptions"
          />
        </n-form-item>
        <n-form-item label="状态" path="isSuspended">
          <n-switch
            v-model:value="editForm.isSuspended"
            :checked-value="false"
            :unchecked-value="true"
          >
            <template #checked>正常</template>
            <template #unchecked>停用</template>
          </n-switch>
        </n-form-item>
      </n-form>
      
      <div class="flex justify-end gap-2 mt-4">
        <n-button @click="showEditModal = false">取消</n-button>
        <n-button type="primary" @click="handleSubmitEdit">
          {{ editMode === 'add' ? '创建' : '保存' }}
        </n-button>
      </div>
    </n-modal>
  </Page>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, h, defineAsyncComponent } from 'vue';
// ✅ PERFORMANCE FIX: Lazy load components to avoid blocking page load
const SmartDataGrid = defineAsyncComponent(() => import('../../../components/smart/SmartDataGrid/index.vue'));
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
  type FormRules
} from 'naive-ui';
import { 
  getBackofficeAccountsApi,
  createBackofficeAccountApi,
  updateBackofficeAccountApi,
  deleteBackofficeAccountApi,
  toggleAccountStatusApi,
  type BackofficeAccount,
  type BackofficeAccountListParams
} from '#/api/core/user-account';

const message = useMessage();

// 响应式数据
const loading = ref(false);
const showDetailModal = ref(false);
const showEditModal = ref(false);
const checkedRowKeys = ref<(string | number)[]>([]);
const tableData = ref<BackofficeAccount[]>([]);
const currentAccount = ref<BackofficeAccount | null>(null);
const formRef = ref<FormInst | null>(null);
const editMode = ref<'add' | 'edit'>('add');

// 筛选表单
const filterForm = reactive({
  role: null as string | null,
  status: null as number | null,
  search: '',
});

// 编辑表单
const editForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  role: 'STAFF',
  isSuspended: false,
});

// 表单验证规则
const formRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在3-20个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    {
      validator: (rule, value) => {
        if (value !== editForm.password) {
          return new Error('两次输入的密码不一致');
        }
        return true;
      },
      trigger: 'blur'
    }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ]
};

// 分页配置 (simplified for SmartDataGrid)
const paginationReactive = reactive({
  page: 1,
  pageSize: 20,
  total: 0,
});

// 选项配置
const roleOptions = [
  { label: '超级管理员', value: 'SUPER_ADMIN' },
  { label: '管理员', value: 'ADMIN' },
  { label: '员工', value: 'STAFF' },
  { label: '客服', value: 'CUSTOMER_SERVICE' },
];

const statusOptions = [
  { label: '正常', value: 1 },
  { label: '停用', value: 0 },
];

// 工具函数 - Fixed to handle invalid dates
const formatDateTime = (dateString: string | null | undefined) => {
  if (!dateString) return '无';
  
  try {
    const date = new Date(dateString);
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return '无效日期';
    }
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  } catch (error) {
    console.warn('Invalid date string:', dateString, error);
    return '无效日期';
  }
};

const getRoleType = (role: string): 'error' | 'warning' | 'info' | 'success' | 'default' => {
  const roleMap: Record<string, 'error' | 'warning' | 'info' | 'success' | 'default'> = {
    'SUPER_ADMIN': 'error',
    'ADMIN': 'warning',
    'STAFF': 'info',
    'CUSTOMER_SERVICE': 'success'
  };
  return roleMap[role] || 'default';
};

const getRoleLabel = (role: string) => {
  const roleMap: Record<string, string> = {
    'SUPER_ADMIN': '超级管理员',
    'ADMIN': '管理员',
    'STAFF': '员工',
    'CUSTOMER_SERVICE': '客服'
  };
  return roleMap[role] || role;
};

// 表格列配置
const columns: DataTableColumns<BackofficeAccount> = [
  { type: 'selection' },
  {
    title: '账号ID',
    key: 'id',
    width: 80,
    render(row) {
      return h('span', { style: 'color: #2080f0; cursor: pointer' }, String(row.id));
    }
  },
  {
    title: '用户名',
    key: 'username',
    width: 150,
    ellipsis: { tooltip: true }
  },
  {
    title: '角色',
    key: 'role',
    width: 120,
    render(row) {
      return h(NTag, { 
        type: getRoleType(row.role) 
      }, { 
        default: () => getRoleLabel(row.role)
      });
    }
  },
  {
    title: '状态',
    key: 'isSuspended',
    width: 80,
    render(row) {
      return h(NSwitch, {
        value: !row.isSuspended,
        disabled: true,
        size: 'small'
      });
    }
  },
  {
    title: '创建时间',
    key: 'createdDate',
    width: 160,
    render(row) {
      return formatDateTime(row.createdDate);
    }
  },
  {
    title: '最后登录',
    key: 'lastLoginDate',
    width: 160,
    render(row) {
      if (!row.lastLoginDate) return '从未登录';
      const formatted = formatDateTime(row.lastLoginDate);
      return formatted === '无' || formatted === '无效日期' ? '从未登录' : formatted;
    }
  },
  {
    title: '登录失败次数',
    key: 'failedLoginAttempt',
    width: 120,
    render(row) {
      return h('span', { 
        style: row.failedLoginAttempt > 3 ? 'color: #f56565' : '' 
      }, `${row.failedLoginAttempt} 次`);
    }
  },
  {
    title: '操作',
    key: 'actions',
    width: 200,
    render(row) {
      return h('div', { class: 'flex gap-1' }, [
        h(NButton, {
          size: 'small',
          type: 'primary',
          onClick: () => handleViewDetail(row)
        }, { default: () => '详情' }),
        h(NButton, {
          size: 'small',
          type: 'info',
          onClick: () => handleEditAccount(row)
        }, { default: () => '编辑' }),
        
      ]);
    }
  }
];

// 事件处理函数
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

// SmartDataGrid event handlers
const handleRowClick = (account: BackofficeAccount) => {
  console.log('Account row clicked:', account);
  // Optional: Auto-open detail modal on row click
  handleViewDetail(account);
};

const clearSelection = () => {
  checkedRowKeys.value = [];
  message.success('已清空选择');
};

const selectAll = () => {
  checkedRowKeys.value = tableData.value.map(account => account.id);
  message.success('已全选');
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
        status: editForm.isSuspended ? 0 : 1
      });
      message.success('账号创建成功');
    } else {
      // For edit mode, we need the current account ID
      if (currentAccount.value) {
        await updateBackofficeAccountApi(currentAccount.value.id, {
          role: editForm.role,
          isSuspended: editForm.isSuspended
        });
        message.success('账号更新成功');
      }
    }
    
    showEditModal.value = false;
    loadTableData();
  } catch (error) {
    message.error(editMode.value === 'add' ? '创建账号失败' : '更新账号失败');
    console.error('Error submitting edit:', error);
  }
};

const handleDeleteAccount = async (account: BackofficeAccount) => {
  try {
    await deleteBackofficeAccountApi(account.id);
    message.success('账号删除成功');
    loadTableData();
    if (showDetailModal.value && currentAccount.value?.id === account.id) {
      showDetailModal.value = false;
    }
  } catch (error) {
    message.error('删除账号失败');
    console.error('Error deleting account:', error);
  }
};

const handleToggleStatus = async (account: BackofficeAccount) => {
  try {
    const newSuspendedStatus = !account.isSuspended;
    await toggleAccountStatusApi(account.id, newSuspendedStatus);
    message.success(`账号${newSuspendedStatus ? '停用' : '启用'}成功`);
    loadTableData();
    if (showDetailModal.value && currentAccount.value?.id === account.id) {
      showDetailModal.value = false;
    }
  } catch (error) {
    message.error('操作失败');
    console.error('Error toggling status:', error);
  }
};

const handleBulkDelete = async (selectedRows?: BackofficeAccount[]) => {
  const accountsToDelete = selectedRows || tableData.value.filter(account => 
    checkedRowKeys.value.includes(account.id)
  );
  
  if (accountsToDelete.length === 0) {
    message.warning('请选择要删除的账号');
    return;
  }
  
  try {
    // Delete accounts one by one since no bulk delete endpoint exists
    const promises = accountsToDelete.map(account => 
      deleteBackofficeAccountApi(Number(account.id))
    );
    
    await Promise.all(promises);
    message.success(`成功删除 ${accountsToDelete.length} 个账号`);
    checkedRowKeys.value = [];
    loadTableData();
  } catch (error) {
    message.error('批量删除失败');
    console.error('Error bulk deleting accounts:', error);
  }
};

// 数据加载
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
      sortOrder: 'desc'
    };

    const response = await getBackofficeAccountsApi(params);
    tableData.value = response.list;
    paginationReactive.total = response.pagination.total;
  } catch (error) {
    message.error('获取账号列表失败');
    console.error('Error loading table data:', error);
  } finally {
    loading.value = false;
  }
};

// 生命周期
onMounted(() => {
  loadTableData();
});
</script> 