<template>
  <Page :title="$t('brand.domainTitle')" :description="$t('brand.domainDesc')">
    <div class="mb-4">
      <n-breadcrumb>
        <n-breadcrumb-item>{{ $t('brand.management') }}</n-breadcrumb-item>
        <n-breadcrumb-item>{{ $t('brand.domainBreadcrumb') }}</n-breadcrumb-item>
      </n-breadcrumb>
    </div>

    <n-grid :cols="4" :x-gap="16" class="mb-4">
      <n-gi>
        <n-card>
          <n-statistic :label="$t('brand.totalDomains')" :value="stats.total" />
        </n-card>
      </n-gi>
      <n-gi>
        <n-card>
          <n-statistic
            label="Cloudflare"
            :value="stats.byProvider.cloudflare"
          />
        </n-card>
      </n-gi>
      <n-gi>
        <n-card>
          <n-statistic label="AWS" :value="stats.byProvider.aws" />
        </n-card>
      </n-gi>
      <n-gi>
        <n-card>
          <n-statistic :label="$t('brand.verified')" :value="stats.verified" />
        </n-card>
      </n-gi>
    </n-grid>

    
    <n-card class="mb-4">
      <div class="flex flex-wrap items-end gap-4">
        
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium">{{ $t('brand.cdnNode') }}</label>
          <n-select
            v-model:value="filters.cdnProvider"
            :placeholder="$t('common.all')"
            clearable
            style="width: 160px"
            :options="cdnProviderOptions"
            @update:value="handleFilter"
          />
        </div>

        
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium">{{ $t('brand.primaryDomainStatus') }}</label>
          <n-select
            v-model:value="filters.status"
            :placeholder="$t('common.all')"
            clearable
            style="width: 140px"
            :options="statusOptions"
            @update:value="handleFilter"
          />
        </div>

        
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium">{{ $t('brand.domainSearch') }}</label>
          <n-input
            v-model:value="filters.search"
            :placeholder="$t('brand.enterPrimaryDomain')"
            clearable
            style="width: 200px"
            @keyup.enter="handleFilter"
          />
        </div>

        
        <div class="flex gap-2">
          <n-button type="primary" @click="handleFilter"> {{ $t('common.search') }} </n-button>
          <n-button @click="resetFilter"> {{ $t('common.reset') }} </n-button>
        </div>
      </div>
    </n-card>

    
    <n-card :bordered="false" class="mb-4">
      <div class="flex items-center justify-between">
        <div class="flex gap-2">
          <n-button type="primary" @click="handleCreate"> {{ $t('common.create') }} </n-button>
          <n-button
            @click="handleBulkDelete"
            :disabled="selectedIds.length === 0"
          >
            {{ $t('brand.bulkDelete') }}
          </n-button>
          <n-button @click="handleRefresh"> {{ $t('common.refresh') }} </n-button>
        </div>
        <div class="text-sm text-gray-600">
          {{ $t('brand.totalRecords', [pagination.total]) }}
          <span v-if="selectedIds.length > 0" class="ml-2">
            {{ $t('brand.selectedRecords', [selectedIds.length]) }}
          </span>
        </div>
      </div>
    </n-card>

    
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
        <n-form-item :label="$t('brand.domainName')" path="domainName">
          <n-input
            v-model:value="formData.domainName"
            :placeholder="$t('brand.enterDomain')"
            :disabled="isEdit"
          />
        </n-form-item>

        <n-form-item :label="$t('brand.cdnPlatform')" path="cdnProvider">
          <n-select
            v-model:value="formData.cdnProvider"
            :options="cdnProviderOptions"
            :placeholder="$t('brand.selectCdnPlatform')"
          />
        </n-form-item>

        <n-form-item :label="$t('brand.cdnPlatformName')" path="cdnPlatformName">
          <n-input
            v-model:value="formData.cdnPlatformName"
            :placeholder="$t('brand.cdnPlatformNamePlaceholder')"
          />
        </n-form-item>

        <n-form-item :label="$t('common.status')" path="status">
          <n-select
            v-model:value="formData.status"
            :options="statusDetailOptions"
            :placeholder="$t('brand.selectStatus')"
          />
        </n-form-item>

        <n-form-item :label="$t('brand.verificationMethod')" path="verificationMethod">
          <n-select
            v-model:value="formData.verificationMethod"
            :options="verificationMethodOptions"
            :placeholder="$t('brand.selectVerificationMethod')"
          />
        </n-form-item>

        <n-form-item :label="$t('brand.verificationStatus')" path="verificationStatus">
          <n-switch v-model:value="formData.verificationStatus" />
          <span class="ml-2">{{
            formData.verificationStatus ? $t('brand.verifiedStatus') : $t('brand.unverifiedStatus')
          }}</span>
        </n-form-item>

        <n-form-item :label="$t('brand.expiryDate')" path="expiryDate">
          <n-date-picker
            v-model:value="formData.expiryDate"
            :time-zone="timezone"
            type="date"
            :placeholder="$t('brand.selectExpiryDate')"
            style="width: 100%"
            clearable
          />
        </n-form-item>

        <n-form-item :label="$t('brand.usageScenario')" path="usageScenario">
          <n-input
            v-model:value="formData.usageScenario"
            :placeholder="$t('brand.usageScenarioPlaceholder')"
          />
        </n-form-item>

        <n-form-item :label="$t('brand.enableSsl')" path="sslEnabled">
          <n-switch v-model:value="formData.sslEnabled" />
          <span class="ml-2">{{
            formData.sslEnabled ? $t('brand.sslEnabled') : $t('brand.sslDisabled')
          }}</span>
        </n-form-item>

        <n-form-item :label="$t('common.remark')" path="备注">
          <n-input
            v-model:value="formData.备注"
            type="textarea"
            :placeholder="$t('brand.enterRemark')"
            :rows="3"
          />
        </n-form-item>

        <n-form-item :label="$t('brand.autoCreate')" path="createOnCDN" v-if="!isEdit">
          <n-switch v-model:value="formData.createOnCDN" />
          <span class="ml-2">{{
            formData.createOnCDN ? $t('brand.createOnCdn') : $t('brand.recordOnly')
          }}</span>
          <n-alert
            v-if="formData.createOnCDN"
            :title="$t('brand.tip')"
            type="info"
            class="mt-2"
            :bordered="false"
          >
            {{ $t('brand.autoCreateHint', [
              formData.cdnProvider === 'CLOUDFLARE' ? 'Cloudflare' : 'AWS Route53',
            ]) }}
          </n-alert>
        </n-form-item>
      </n-form>

      <template #footer>
        <div class="flex justify-end gap-2">
          <n-button @click="showModal = false">{{ $t('common.cancel') }}</n-button>
          <n-button type="primary" @click="handleSubmit" :loading="submitting">
            {{ isEdit ? $t('common.save') : $t('common.create') }}
          </n-button>
        </div>
      </template>
    </n-modal>
  </Page>
</template>

<script setup lang="ts">
import { $t } from '@vben/locales';

import { h, computed, onMounted, reactive, ref } from 'vue';
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
import { useDisplayTimezone } from '#/composables/useDisplayTimezone';

const { timezone } = useDisplayTimezone();
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
  usageScenario: $t('brand.usageAll'),
  备注: '',
  sslEnabled: true,
  createdBy: '',
  operatedBy: '',
  createOnCDN: false,
});

const formRules = computed<FormRules>(() => ({
  domainName: [
    { required: true, message: $t('brand.enterDomainRequired'), trigger: 'blur' },
    {
      pattern:
        /^[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+$/,
      message: $t('brand.invalidDomainFormat'),
      trigger: 'blur',
    },
  ],
  cdnProvider: [
    { required: true, message: $t('brand.selectCdnRequired'), trigger: 'change' },
  ],
}));

const cdnProviderOptions = computed(() => [
  { label: $t('common.all'), value: 'ALL' },
  { label: 'Cloudflare', value: 'CLOUDFLARE' },
  { label: 'AWS', value: 'AWS' },
  { label: $t('brand.huaweiCloud'), value: 'HUAWEI_CLOUD' },
  { label: $t('brand.aliyun'), value: 'ALIYUN' },
  { label: $t('brand.tencentCloud'), value: 'TENCENT_CLOUD' },
  { label: $t('brand.other'), value: 'OTHER' },
]);

const statusOptions = computed(() => [
  { label: $t('common.all'), value: 'ALL' },
  { label: $t('brand.statusNormal'), value: 'NORMAL' },
  { label: $t('brand.statusExpired'), value: 'EXPIRED' },
  { label: $t('brand.statusExpiringSoon'), value: 'EXPIRING_SOON' },
  { label: $t('brand.statusVerificationPending'), value: 'VERIFICATION_PENDING' },
  { label: $t('brand.statusDisabled'), value: 'DISABLED' },
]);

const statusDetailOptions = computed(() =>
  statusOptions.value.filter((opt) => opt.value !== 'ALL'),
);

const verificationMethodOptions = computed(() => [
  { label: $t('brand.dnsValidation'), value: 'DNS_VALIDATION' },
  { label: $t('brand.whenDnsCompleted'), value: 'WHEN_DNS_COMPLETED' },
  { label: $t('brand.httpValidation'), value: 'HTTP_VALIDATION' },
  { label: $t('brand.emailValidation'), value: 'EMAIL_VALIDATION' },
]);

function getVerificationMethodLabel(method: string) {
  const map: Record<string, string> = {
    DNS_VALIDATION: $t('brand.dnsValidation'),
    WHEN_DNS_COMPLETED: $t('brand.whenDnsCompleted'),
    HTTP_VALIDATION: $t('brand.httpValidation'),
    EMAIL_VALIDATION: $t('brand.emailValidation'),
  };
  return map[method] || method;
}

function getStatusInfo(status: string) {
  const statusMap: Record<string, { label: string; type: 'success' | 'error' | 'warning' | 'info' | 'default' }> = {
    NORMAL: { label: $t('brand.statusNormal'), type: 'success' },
    EXPIRED: { label: $t('brand.statusExpired'), type: 'error' },
    EXPIRING_SOON: { label: $t('brand.statusExpiringSoon'), type: 'warning' },
    VERIFICATION_PENDING: { label: $t('brand.statusVerificationPending'), type: 'info' },
    DISABLED: { label: $t('brand.statusDisabled'), type: 'default' },
  };
  return statusMap[status] || { label: status, type: 'default' as const };
}

const columns = computed<DataTableColumns<DomainManagement>>(() => [
  { type: 'selection' },
  {
    title: $t('brand.cdnNodeName'),
    key: 'cdnPlatformName',
    width: 140,
    render: (row) => row.cdnPlatformName || row.cdnProvider,
  },
  {
    title: $t('brand.primaryDomain'),
    key: 'domainName',
    width: 200,
    ellipsis: { tooltip: true },
  },
  {
    title: $t('brand.verificationMethod'),
    key: 'verificationMethod',
    width: 140,
    render: (row) => getVerificationMethodLabel(row.verificationMethod),
  },
  {
    title: $t('brand.primaryDomainStatus'),
    key: 'status',
    width: 120,
    render: (row) => {
      const statusInfo = getStatusInfo(row.status);
      return h(NTag, { type: statusInfo.type }, () => statusInfo.label);
    },
  },
  {
    title: $t('brand.domainExpiry'),
    key: 'expiryDate',
    width: 140,
    render: (row) =>
      row.expiryDate ? new Date(row.expiryDate).toLocaleDateString() : '-',
  },
  {
    title: $t('brand.certExpiry'),
    key: 'certificateExpiryDate',
    width: 140,
    render: (row) =>
      row.certificateExpiryDate
        ? new Date(row.certificateExpiryDate).toLocaleDateString()
        : '-',
  },
  {
    title: $t('brand.usageScenario'),
    key: 'usageScenario',
    width: 100,
    render: (row) => row.usageScenario || '-',
  },
  {
    title: $t('common.remark'),
    key: '备注',
    width: 150,
    ellipsis: { tooltip: true },
    render: (row) => row.备注 || '-',
  },
  {
    title: $t('common.operator'),
    key: 'operatedBy',
    width: 100,
    render: (row) => row.operatedBy || row.createdBy || '-',
  },
  {
    title: $t('common.actions'),
    key: 'actions',
    width: 180,
    fixed: 'right',
    render: (row) =>
      h('div', { class: 'flex gap-2' }, [
        h(NButton, { size: 'small', quaternary: true, onClick: () => handleEdit(row) }, () => $t('common.edit')),
        h(NButton, { size: 'small', quaternary: true, onClick: () => handleCopyDomain(row) }, () => $t('common.copy')),
        h(
          NPopconfirm,
          {
            onPositiveClick: () => handleDelete(row.id),
            negativeText: $t('common.cancel'),
            positiveText: $t('common.confirm'),
          },
          {
            default: () => $t('brand.confirmDeleteDomain'),
            trigger: () =>
              h(NButton, { size: 'small', quaternary: true, type: 'error' }, () => $t('common.delete')),
          },
        ),
      ]),
  },
]);

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
    message.error($t('brand.loadDomainListFailed'));
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
  modalTitle.value = $t('brand.addDomain');
  resetForm();
  showModal.value = true;
}

function handleEdit(row: DomainManagement) {
  isEdit.value = true;
  modalTitle.value = $t('brand.editDomain');
  currentEditId.value = row.id;

  Object.assign(formData, {
    domainName: row.domainName,
    cdnProvider: row.cdnProvider,
    cdnPlatformName: row.cdnPlatformName,
    status: row.status,
    verificationMethod: row.verificationMethod,
    verificationStatus: row.verificationStatus,
    expiryDate: row.expiryDate ? new Date(row.expiryDate).getTime() : undefined,
    certificateExpiryDate: row.certificateExpiryDate
      ? new Date(row.certificateExpiryDate).getTime()
      : undefined,
    usageScenario: row.usageScenario,
    备注: row.备注,
    sslEnabled: row.sslEnabled,
  });

  showModal.value = true;
}

function handleCopyDomain(row: DomainManagement) {
  isEdit.value = false;
  modalTitle.value = $t('brand.copyDomain');

  Object.assign(formData, {
    domainName: `${row.domainName}-copy`,
    cdnProvider: row.cdnProvider,
    cdnPlatformName: row.cdnPlatformName,
    status: row.status,
    verificationMethod: row.verificationMethod,
    verificationStatus: false,
    expiryDate: row.expiryDate ? new Date(row.expiryDate).getTime() : undefined,
    certificateExpiryDate: row.certificateExpiryDate
      ? new Date(row.certificateExpiryDate).getTime()
      : undefined,
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
      expiryDate: formData.expiryDate
        ? new Date(formData.expiryDate).toISOString()
        : undefined,
      certificateExpiryDate: formData.certificateExpiryDate
        ? new Date(formData.certificateExpiryDate).toISOString()
        : undefined,
    };

    if (isEdit.value && currentEditId.value) {
      await updateDomainApi(currentEditId.value, submitData);
      message.success($t('common.saveSuccess'));
    } else {
      const result = await createDomainApi(submitData);

      if (formData.createOnCDN && result.cdnCreationResult) {
        if (result.cdnCreationResult.success) {
          message.success($t('brand.domainCreatedOnCdn', [formData.cdnProvider]));
          if (result.cdnCreationResult.nameServers?.length > 0) {
            message.info(
              `Nameservers: ${result.cdnCreationResult.nameServers.join(', ')}`,
              { duration: 10000 },
            );
          }
        } else {
          message.warning(
            $t('brand.domainCreatedCdnFailed', [result.cdnCreationResult.error ?? '']),
          );
        }
      } else {
        message.success($t('common.operationSuccess'));
      }
    }

    showModal.value = false;
    fetchData();
  } catch (error: any) {
    if (error.errors) {
      message.error($t('brand.checkFormFill'));
    } else {
      message.error(error.message || $t('common.operationFailed'));
    }
  } finally {
    submitting.value = false;
  }
}

async function handleDelete(id: number) {
  try {
    await deleteDomainApi(id);
    message.success($t('common.deleteSuccess'));
    fetchData();
  } catch (error) {
    message.error($t('common.operationFailed'));
    console.error('Failed to delete domain:', error);
  }
}

async function handleBulkDelete() {
  if (selectedIds.value.length === 0) {
    message.warning($t('brand.selectAtLeastOneDomain'));
    return;
  }

  try {
    const result = await bulkDeleteDomainsApi(selectedIds.value);
    message.success($t('brand.bulkDeleteSuccess', [result.deletedCount]));
    selectedIds.value = [];
    fetchData();
  } catch (error) {
    message.error($t('brand.bulkDeleteFailed'));
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
    usageScenario: $t('brand.usageAll'),
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
