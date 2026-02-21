<template>
  <Page title="域名管理" description="CDN域名配置与管理">
    <!-- 面包屑导航 -->
    <div class="mb-4">
      <n-breadcrumb>
        <n-breadcrumb-item>品牌管理</n-breadcrumb-item>
        <n-breadcrumb-item>域名管理</n-breadcrumb-item>
      </n-breadcrumb>
    </div>

    <!-- 统计卡片 -->
    <n-grid :cols="4" :x-gap="16" class="mb-4">
      <n-gi>
        <n-card>
          <n-statistic label="总域名数" :value="stats.total" />
        </n-card>
      </n-gi>
      <n-gi>
        <n-card>
          <n-statistic label="Cloudflare" :value="stats.byProvider.cloudflare" />
        </n-card>
      </n-gi>
      <n-gi>
        <n-card>
          <n-statistic label="AWS" :value="stats.byProvider.aws" />
        </n-card>
      </n-gi>
      <n-gi>
        <n-card>
          <n-statistic label="已验证" :value="stats.verified" />
        </n-card>
      </n-gi>
    </n-grid>

    <!-- 筛选器 -->
    <n-card class="mb-4">
      <div class="flex flex-wrap gap-4 items-end">
        <!-- CDN节点筛选 -->
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium">CDN节点</label>
          <n-select
            v-model:value="filters.cdnProvider"
            placeholder="全部"
            clearable
            style="width: 160px"
            :options="cdnProviderOptions"
            @update:value="handleFilter"
          />
        </div>

        <!-- 状态筛选 -->
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium">主域名状态</label>
          <n-select
            v-model:value="filters.status"
            placeholder="全部"
            clearable
            style="width: 140px"
            :options="statusOptions"
            @update:value="handleFilter"
          />
        </div>

        <!-- 域名搜索 -->
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium">域名搜索</label>
          <n-input
            v-model:value="filters.search"
            placeholder="请输入主域名"
            clearable
            style="width: 200px"
            @keyup.enter="handleFilter"
          />
        </div>

        <!-- 操作按钮 -->
        <div class="flex gap-2">
          <n-button type="primary" @click="handleFilter">
            搜索
          </n-button>
          <n-button @click="resetFilter">
            重置
          </n-button>
        </div>
      </div>
    </n-card>

    <!-- 操作栏 -->
    <n-card :bordered="false" class="mb-4">
      <div class="flex justify-between items-center">
        <div class="flex gap-2">
          <n-button type="primary" @click="handleCreate">
            新增
          </n-button>
          <n-button @click="handleBulkDelete" :disabled="selectedIds.length === 0">
            批量删除
          </n-button>
          <n-button @click="handleRefresh">
            刷新
          </n-button>
        </div>
        <div class="text-sm text-gray-600">
          共 {{ pagination.total }} 条记录
          <span v-if="selectedIds.length > 0" class="ml-2">
            已选择 {{ selectedIds.length }} 条
          </span>
        </div>
      </div>
    </n-card>

    <!-- 数据表格 -->
    <n-card>
      <n-data-table
        :columns="columns"
        :data="tableData"
        :loading="loading"
        :pagination="paginationReactive"
        :row-key="(row: DomainManagement) => row.id"
        :checked-row-keys="selectedIds"
        @update:checked-row-keys="handleSelectionChange"
        @update:page="handlePageChange"
        @update:page-size="handlePageSizeChange"
      />
    </n-card>

    <!-- 创建/编辑对话框 -->
    <n-modal
      v-model:show="showModal"
      :title="modalTitle"
      preset="card"
      style="width: 800px"
      :segmented="{ content: 'soft', footer: 'soft' }"
    >
      <n-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-placement="left"
        label-width="120px"
      >
        <n-form-item label="域名" path="domainName">
          <n-input
            v-model:value="formData.domainName"
            placeholder="请输入域名 (例: example.com)"
            :disabled="isEdit"
          />
        </n-form-item>

        <n-form-item label="CDN平台" path="cdnProvider">
          <n-select
            v-model:value="formData.cdnProvider"
            :options="cdnProviderOptions"
            placeholder="选择CDN平台"
          />
        </n-form-item>

        <n-form-item label="CDN平台名称" path="cdnPlatformName">
          <n-input
            v-model:value="formData.cdnPlatformName"
            placeholder="例: Cloudflare"
          />
        </n-form-item>

        <n-form-item label="状态" path="status">
          <n-select
            v-model:value="formData.status"
            :options="statusDetailOptions"
            placeholder="选择状态"
          />
        </n-form-item>

        <n-form-item label="验证方式" path="verificationMethod">
          <n-select
            v-model:value="formData.verificationMethod"
            :options="verificationMethodOptions"
            placeholder="选择验证方式"
          />
        </n-form-item>

        <n-form-item label="验证状态" path="verificationStatus">
          <n-switch v-model:value="formData.verificationStatus" />
          <span class="ml-2">{{ formData.verificationStatus ? '已验证' : '未验证' }}</span>
        </n-form-item>

        <n-form-item label="过期日期" path="expiryDate">
          <n-date-picker
            v-model:value="formData.expiryDate"
            type="date"
            placeholder="选择过期日期"
            style="width: 100%"
            clearable
          />
        </n-form-item>

        <n-form-item label="使用场景" path="usageScenario">
          <n-input
            v-model:value="formData.usageScenario"
            placeholder="例: 全部、移动端、PC端"
          />
        </n-form-item>

        <n-form-item label="启用SSL" path="sslEnabled">
          <n-switch v-model:value="formData.sslEnabled" />
          <span class="ml-2">{{ formData.sslEnabled ? '已启用' : '未启用' }}</span>
        </n-form-item>

        <n-form-item label="备注" path="备注">
          <n-input
            v-model:value="formData.备注"
            type="textarea"
            placeholder="输入备注信息"
            :rows="3"
          />
        </n-form-item>

        <n-form-item label="自动创建" path="createOnCDN" v-if="!isEdit">
          <n-switch v-model:value="formData.createOnCDN" />
          <span class="ml-2">{{ formData.createOnCDN ? '同时在CDN提供商创建域名' : '仅在系统中记录' }}</span>
          <n-alert v-if="formData.createOnCDN" title="提示" type="info" class="mt-2" :bordered="false">
            启用后将自动在 {{ formData.cdnProvider === 'CLOUDFLARE' ? 'Cloudflare' : 'AWS Route53' }} 创建域名、配置DNS和SSL
          </n-alert>
        </n-form-item>
      </n-form>

      <template #footer>
        <div class="flex justify-end gap-2">
          <n-button @click="showModal = false">取消</n-button>
          <n-button type="primary" @click="handleSubmit" :loading="submitting">
            {{ isEdit ? '更新' : '创建' }}
          </n-button>
        </div>
      </template>
    </n-modal>
  </Page>
</template>

<script setup lang="ts">
import { h, onMounted, reactive, ref } from 'vue';
import { Page } from '@vben/common-ui';
import {
  NButton,
  NBreadcrumb,
  NBreadcrumbItem,
  NCard,
  NDataTable,
  NDatePicker,
  NEmpty,
  NForm,
  NFormItem,
  NGi,
  NGrid,
  NInput,
  NModal,
  NPopconfirm,
  NSelect,
  NStatistic,
  NSwitch,
  NTag,
  useMessage,
  type DataTableColumns,
  type FormInst,
  type FormRules,
} from 'naive-ui';
import type {
  CDNProvider,
  CreateDomainRequest,
  DomainManagement,
  DomainStats,
  UpdateDomainRequest,
} from '#/api/domainManagement';
import {
  bulkDeleteDomainsApi,
  createDomainApi,
  deleteDomainApi,
  getDomainListApi,
  getDomainStatsApi,
  updateDomainApi,
} from '#/api/domainManagement';

const message = useMessage();
const formRef = ref<FormInst | null>(null);

// State
const loading = ref(false);
const submitting = ref(false);
const showModal = ref(false);
const isEdit = ref(false);
const tableData = ref<DomainManagement[]>([]);
const selectedIds = ref<number[]>([]);
const currentEditId = ref<number | null>(null);

// Statistics
const stats = ref<DomainStats>({
  total: 0,
  byProvider: {
    cloudflare: 0,
    aws: 0,
  },
  byStatus: {
    normal: 0,
    expiringSoon: 0,
  },
  verified: 0,
  unverified: 0,
});

// Filters
const filters = reactive({
  cdnProvider: null as string | null,
  status: null as string | null,
  search: '',
});

// Pagination
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0,
});

const paginationReactive = reactive({
  page: 1,
  pageSize: 20,
  pageCount: 0,
  itemCount: 0,
  showSizePicker: true,
  pageSizes: [10, 20, 50, 100],
  onChange: (page: number) => {
    pagination.page = page;
    fetchData();
  },
  onUpdatePageSize: (pageSize: number) => {
    pagination.pageSize = pageSize;
    pagination.page = 1;
    fetchData();
  },
});

// Form data
const formData = reactive<CreateDomainRequest & { createOnCDN?: boolean }>({
  domainName: '',
  cdnProvider: 'CLOUDFLARE',
  cdnPlatformName: '',
  status: 'NORMAL',
  verificationMethod: 'DNS_VALIDATION',
  verificationStatus: false,
  expiryDate: undefined,
  certificateExpiryDate: undefined,
  usageScenario: '全部',
  备注: '',
  sslEnabled: true,
  createdBy: '',
  operatedBy: '',
  createOnCDN: false,
});

// Form rules
const formRules: FormRules = {
  domainName: [
    { required: true, message: '请输入域名', trigger: 'blur' },
    {
      pattern: /^[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+$/,
      message: '请输入有效的域名格式',
      trigger: 'blur',
    },
  ],
  cdnProvider: [{ required: true, message: '请选择CDN平台', trigger: 'change' }],
};

// Options
const cdnProviderOptions = [
  { label: '全部', value: 'ALL' },
  { label: 'Cloudflare', value: 'CLOUDFLARE' },
  { label: 'AWS', value: 'AWS' },
  { label: '华为云', value: 'HUAWEI_CLOUD' },
  { label: '阿里云', value: 'ALIYUN' },
  { label: '腾讯云', value: 'TENCENT_CLOUD' },
  { label: '其他', value: 'OTHER' },
];

const statusOptions = [
  { label: '全部', value: 'ALL' },
  { label: '正常', value: 'NORMAL' },
  { label: '已过期', value: 'EXPIRED' },
  { label: '即将过期', value: 'EXPIRING_SOON' },
  { label: '验证中', value: 'VERIFICATION_PENDING' },
  { label: '已停用', value: 'DISABLED' },
];

const statusDetailOptions = statusOptions.filter(opt => opt.value !== 'ALL');

const verificationMethodOptions = [
  { label: 'DNS验证', value: 'DNS_VALIDATION' },
  { label: '当DNS完成为', value: 'WHEN_DNS_COMPLETED' },
  { label: 'HTTP验证', value: 'HTTP_VALIDATION' },
  { label: '邮箱验证', value: 'EMAIL_VALIDATION' },
];

// Columns
const columns: DataTableColumns<DomainManagement> = [
  {
    type: 'selection',
  },
  {
    title: 'CDN节点名称',
    key: 'cdnPlatformName',
    width: 140,
    render: (row) => row.cdnPlatformName || row.cdnProvider,
  },
  {
    title: '主域名(子域名)',
    key: 'domainName',
    width: 200,
    ellipsis: {
      tooltip: true,
    },
  },
  {
    title: '验证方式',
    key: 'verificationMethod',
    width: 140,
    render: (row) => {
      const methodMap: Record<string, string> = {
        DNS_VALIDATION: 'DNS验证',
        WHEN_DNS_COMPLETED: '当DNS完成为',
        HTTP_VALIDATION: 'HTTP验证',
        EMAIL_VALIDATION: '邮箱验证',
      };
      return methodMap[row.verificationMethod] || row.verificationMethod;
    },
  },
  {
    title: '主域名状态',
    key: 'status',
    width: 120,
    render: (row) => {
      const statusMap = {
        NORMAL: { label: '正常', type: 'success' as const },
        EXPIRED: { label: '已过期', type: 'error' as const },
        EXPIRING_SOON: { label: '即将过期', type: 'warning' as const },
        VERIFICATION_PENDING: { label: '验证中', type: 'info' as const },
        DISABLED: { label: '已停用', type: 'default' as const },
      };
      const statusInfo = statusMap[row.status] || { label: row.status, type: 'default' as const };
      return h(NTag, { type: statusInfo.type }, () => statusInfo.label);
    },
  },
  {
    title: '域名过期日',
    key: 'expiryDate',
    width: 140,
    render: (row) => row.expiryDate ? new Date(row.expiryDate).toLocaleDateString('zh-CN') : '-',
  },
  {
    title: '证书过期日',
    key: 'certificateExpiryDate',
    width: 140,
    render: (row) => row.certificateExpiryDate ? new Date(row.certificateExpiryDate).toLocaleDateString('zh-CN') : '-',
  },
  {
    title: '使用场景',
    key: 'usageScenario',
    width: 100,
    render: (row) => row.usageScenario || '-',
  },
  {
    title: '备注',
    key: '备注',
    width: 150,
    ellipsis: {
      tooltip: true,
    },
    render: (row) => row.备注 || '-',
  },
  {
    title: '操作人',
    key: 'operatedBy',
    width: 100,
    render: (row) => row.operatedBy || row.createdBy || '-',
  },
  {
    title: '操作',
    key: 'actions',
    width: 180,
    fixed: 'right',
    render: (row) => h('div', { class: 'flex gap-2' }, [
      h(NButton, {
        size: 'small',
        quaternary: true,
        onClick: () => handleEdit(row),
      }, () => '编辑'),
      h(NButton, {
        size: 'small',
        quaternary: true,
        onClick: () => handleCopyDomain(row),
      }, () => '复制'),
      h(NPopconfirm, {
        onPositiveClick: () => handleDelete(row.id),
        negativeText: '取消',
        positiveText: '确定',
      }, {
        default: () => '确定删除这个域名吗？',
        trigger: () => h(NButton, {
          size: 'small',
          quaternary: true,
          type: 'error',
        }, () => '删除'),
      }),
    ]),
  },
];

// Computed
const modalTitle = ref('');

// Methods
async function fetchStats() {
  try {
    stats.value = await getDomainStatsApi();
  } catch (error) {
    console.error('Failed to fetch domain stats:', error);
  }
}

async function fetchData() {
  loading.value = true;
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      cdnProvider: filters.cdnProvider || undefined,
      status: filters.status || undefined,
      search: filters.search || undefined,
    };

    const response = await getDomainListApi(params);
    tableData.value = response.list;
    pagination.total = response.pagination.total;
    
    paginationReactive.page = response.pagination.current;
    paginationReactive.pageSize = response.pagination.pageSize;
    paginationReactive.itemCount = response.pagination.total;
    paginationReactive.pageCount = response.pagination.totalPages;

    await fetchStats();
  } catch (error) {
    message.error('获取域名列表失败');
    console.error('Failed to fetch domains:', error);
  } finally {
    loading.value = false;
  }
}

function handleFilter() {
  pagination.page = 1;
  fetchData();
}

function resetFilter() {
  filters.cdnProvider = null;
  filters.status = null;
  filters.search = '';
  pagination.page = 1;
  fetchData();
}

function handlePageChange(page: number) {
  pagination.page = page;
  fetchData();
}

function handlePageSizeChange(pageSize: number) {
  pagination.pageSize = pageSize;
  pagination.page = 1;
  fetchData();
}

function handleSelectionChange(keys: number[]) {
  selectedIds.value = keys;
}

function handleRefresh() {
  fetchData();
}

function handleCreate() {
  isEdit.value = false;
  modalTitle.value = '新增域名';
  resetForm();
  showModal.value = true;
}

function handleEdit(row: DomainManagement) {
  isEdit.value = true;
  modalTitle.value = '编辑域名';
  currentEditId.value = row.id;
  
  Object.assign(formData, {
    domainName: row.domainName,
    cdnProvider: row.cdnProvider,
    cdnPlatformName: row.cdnPlatformName,
    status: row.status,
    verificationMethod: row.verificationMethod,
    verificationStatus: row.verificationStatus,
    expiryDate: row.expiryDate ? new Date(row.expiryDate).getTime() : undefined,
    certificateExpiryDate: row.certificateExpiryDate ? new Date(row.certificateExpiryDate).getTime() : undefined,
    usageScenario: row.usageScenario,
    备注: row.备注,
    sslEnabled: row.sslEnabled,
  });
  
  showModal.value = true;
}

function handleCopyDomain(row: DomainManagement) {
  isEdit.value = false;
  modalTitle.value = '复制域名';
  
  Object.assign(formData, {
    domainName: `${row.domainName}-copy`,
    cdnProvider: row.cdnProvider,
    cdnPlatformName: row.cdnPlatformName,
    status: row.status,
    verificationMethod: row.verificationMethod,
    verificationStatus: false,
    expiryDate: row.expiryDate ? new Date(row.expiryDate).getTime() : undefined,
    certificateExpiryDate: row.certificateExpiryDate ? new Date(row.certificateExpiryDate).getTime() : undefined,
    usageScenario: row.usageScenario,
    备注: row.备注,
    sslEnabled: row.sslEnabled,
  });
  
  showModal.value = true;
}

async function handleSubmit() {
  try {
    await formRef.value?.validate();
    submitting.value = true;

    const submitData: CreateDomainRequest | UpdateDomainRequest = {
      ...formData,
      expiryDate: formData.expiryDate ? new Date(formData.expiryDate).toISOString() : undefined,
      certificateExpiryDate: formData.certificateExpiryDate ? new Date(formData.certificateExpiryDate).toISOString() : undefined,
    };

    if (isEdit.value && currentEditId.value) {
      await updateDomainApi(currentEditId.value, submitData);
      message.success('更新成功');
    } else {
      const result = await createDomainApi(submitData);
      
      // Show CDN creation result if applicable
      if (formData.createOnCDN && result.cdnCreationResult) {
        if (result.cdnCreationResult.success) {
          message.success(`域名已成功创建在${formData.cdnProvider}和系统中`);
          if (result.cdnCreationResult.nameServers?.length > 0) {
            message.info(`Nameservers: ${result.cdnCreationResult.nameServers.join(', ')}`, {
              duration: 10000,
            });
          }
        } else {
          message.warning(`域名已在系统中创建，但CDN创建失败: ${result.cdnCreationResult.error}`);
        }
      } else {
        message.success('创建成功');
      }
    }

    showModal.value = false;
    fetchData();
  } catch (error: any) {
    if (error.errors) {
      message.error('请检查表单填写');
    } else {
      message.error(error.message || '操作失败');
    }
  } finally {
    submitting.value = false;
  }
}

async function handleDelete(id: number) {
  try {
    await deleteDomainApi(id);
    message.success('删除成功');
    fetchData();
  } catch (error) {
    message.error('删除失败');
    console.error('Failed to delete domain:', error);
  }
}

async function handleBulkDelete() {
  if (selectedIds.value.length === 0) {
    message.warning('请至少选择一个域名');
    return;
  }

  try {
    const result = await bulkDeleteDomainsApi(selectedIds.value);
    message.success(`成功删除 ${result.deletedCount} 个域名`);
    selectedIds.value = [];
    fetchData();
  } catch (error) {
    message.error('批量删除失败');
    console.error('Failed to bulk delete domains:', error);
  }
}

function resetForm() {
  Object.assign(formData, {
    domainName: '',
    cdnProvider: 'CLOUDFLARE',
    cdnPlatformName: '',
    status: 'NORMAL',
    verificationMethod: 'DNS_VALIDATION',
    verificationStatus: false,
    expiryDate: undefined,
    certificateExpiryDate: undefined,
    usageScenario: '全部',
    备注: '',
    sslEnabled: true,
    createdBy: '',
    operatedBy: '',
    createOnCDN: false,
  });
  formRef.value?.restoreValidation();
}

// Lifecycle
onMounted(() => {
  fetchData();
});
</script>

<style scoped>
:deep(.n-data-table) {
  font-size: 13px;
}

:deep(.n-data-table .n-data-table-th) {
  font-weight: 600;
}
</style>
