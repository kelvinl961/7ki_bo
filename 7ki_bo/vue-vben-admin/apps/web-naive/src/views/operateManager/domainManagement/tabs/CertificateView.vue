<template>
  <div class="certificate-view">
    <!-- Filters -->
    <n-card size="small" style="margin-bottom: 16px">
      <n-space :size="12" align="center">
        <n-input
          v-model:value="filters.name"
          :placeholder="$t('operations.certificate.filterName')"
          clearable
          style="width: 160px"
          size="small"
        />

        <n-date-picker
          v-model:value="filters.expiryDate"
          type="daterange"
          clearable
          style="width: 280px"
          size="small"
          :placeholder="$t('operations.certificate.filterExpiry')"
        />

        <n-select
          v-model:value="filters.provider"
          :placeholder="$t('operations.certificate.filterVendor')"
          clearable
          style="width: 130px"
          size="small"
          :options="providerOptions"
        />

        <n-select
          v-model:value="filters.type"
          :placeholder="$t('operations.certificate.filterType')"
          clearable
          style="width: 130px"
          size="small"
          :options="typeOptions"
        />

        <n-select
          v-model:value="filters.status"
          :placeholder="$t('common.status')"
          clearable
          style="width: 120px"
          size="small"
          :options="statusOptions"
        />

        <n-button type="primary" size="small" @click="fetchCertificates">{{ $t('common.search') }}</n-button>

        <n-button size="small" @click="resetFilters"> {{ $t('common.reset') }} </n-button>
      </n-space>
    </n-card>

    <!-- Action Buttons -->
    <n-card size="small" style="margin-bottom: 16px">
      <n-space justify="space-between">
        <n-space>
          <n-button type="primary" size="small" @click="showApplyModal = true">{{ $t('operations.certificate.applyFree') }}</n-button>
          <n-button type="info" size="small" @click="showUploadModal = true">{{ $t('operations.certificate.uploadCert') }}</n-button>
        </n-space>
        <n-space align="center">
          <span style="font-size: 13px; color: #666">{{ $t('operations.domain.modal.recordsCount', [pagination.itemCount]) }}</span>
        </n-space>
      </n-space>
    </n-card>

    <!-- Certificates Table -->
    <n-card size="small">
      <n-data-table
        :columns="columns"
        :data="certificates"
        :loading="loading"
        :pagination="paginationConfig"
        :row-key="(row: Certificate) => row.id"
        :scroll-x="2000"
        size="small"
      />
    </n-card>

    <!-- Apply Free Certificate Modal -->
    <n-modal
      v-model:show="showApplyModal"
      preset="card"
      :title="$t('operations.certificate.applyTitle')"
      style="width: 600px"
      :bordered="false"
    >
      <n-form
        ref="applyFormRef"
        :model="applyForm"
        :rules="applyRules"
        label-placement="left"
        label-width="120"
        size="small"
      >
        <n-form-item :label="$t('common.type')" path="type">
          <n-radio-group v-model:value="applyForm.type">
            <n-radio value="single">{{ $t('operations.certificate.singleDomain') }}</n-radio>
            <n-radio value="wildcard"
              >{{ $t('operations.certificate.wildcardDomain') }}</n-radio
            >
          </n-radio-group>
        </n-form-item>

        <n-form-item :label="$t('operations.certificate.verificationMethod')" path="verificationMethod">
          <n-text>{{ $t('operations.certificate.addTxtRecord') }}</n-text>
        </n-form-item>

        <n-form-item :label="$t('operations.certificate.domainsLabel')" path="domains">
          <n-input
            v-model:value="applyForm.domains"
            type="textarea"
            :placeholder="$t('operations.certificate.domainsPlaceholder')"
            :rows="3"
            :status="applyForm.domains ? 'success' : 'error'"
          />
          <div
            v-if="!applyForm.domains"
            style="color: #d03050; font-size: 12px; margin-top: 4px"
          >{{ $t('operations.certificate.invalidFormat') }}</div>
        </n-form-item>

        <n-alert type="info" style="margin-top: 16px" size="small">
          <div style="font-size: 13px">
            <div>• {{ $t('operations.certificate.applyHint1') }}</div>
            <div>• {{ $t('operations.certificate.applyHint2') }}</div>
            <div>• {{ $t('operations.certificate.applyHint3') }}</div>
            <div>• {{ $t('operations.certificate.applyHint4') }}</div>
          </div>
        </n-alert>
      </n-form>

      <template #footer>
        <n-space justify="end">
          <n-button @click="showApplyModal = false">{{ $t('common.cancel') }}</n-button>
          <n-button
            type="primary"
            @click="handleApplyCertificate"
            :loading="applying"
          >{{ $t('operations.certificate.apply') }}</n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- Upload Certificate Modal -->
    <n-modal
      v-model:show="showUploadModal"
      preset="card"
      :title="$t('operations.certificate.uploadTitle')"
      style="width: 600px"
      :bordered="false"
    >
      <n-form
        ref="uploadFormRef"
        :model="uploadForm"
        :rules="uploadRules"
        label-placement="left"
        label-width="120"
        size="small"
      >
        <n-form-item :label="$t('operations.certificate.certName')" path="name">
          <n-input
            v-model:value="uploadForm.name"
            :placeholder="$t('operations.certificate.filterName')"
          />
        </n-form-item>

        <n-form-item :label="$t('operations.certificate.boundDomain')" path="domain">
          <n-input
            v-model:value="uploadForm.domain"
            :placeholder="$t('operations.certificate.boundDomainPlaceholder')"
          />
        </n-form-item>

        <n-form-item :label="$t('operations.certificate.crtContent')" path="crtContent">
          <n-input
            v-model:value="uploadForm.crtContent"
            type="textarea"
            :placeholder="$t('operations.certificate.crtPlaceholder')"
            :rows="6"
          />
        </n-form-item>

        <n-form-item :label="$t('operations.certificate.keyContent')" path="keyContent">
          <n-input
            v-model:value="uploadForm.keyContent"
            type="textarea"
            :placeholder="$t('operations.certificate.keyPlaceholder')"
            :rows="6"
          />
        </n-form-item>

        <n-alert type="warning" style="margin-top: 16px" size="small">
          <div style="font-size: 13px">
            <div>• {{ $t('operations.certificate.uploadHint1') }}</div>
            <div>• {{ $t('operations.certificate.uploadHint2') }}</div>
            <div>• {{ $t('operations.certificate.uploadHint3') }}</div>
          </div>
        </n-alert>
      </n-form>

      <template #footer>
        <n-space justify="end">
          <n-button @click="showUploadModal = false">{{ $t('common.cancel') }}</n-button>
          <n-button
            type="primary"
            @click="handleUploadCertificate"
            :loading="uploading"
          >{{ $t('common.upload') }}</n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- View Certificate Details Modal -->
    <n-modal
      v-model:show="showDetailModal"
      preset="card"
      :title="$t('operations.certificate.detailTitle')"
      style="width: 700px"
      :bordered="false"
    >
      <n-descriptions
        v-if="selectedCertificate"
        :column="2"
        bordered
        size="small"
      >
        <n-descriptions-item :label="$t('operations.certificate.certId')">
          {{ selectedCertificate.id }}
        </n-descriptions-item>
        <n-descriptions-item :label="$t('operations.certificate.certName')">
          {{ selectedCertificate.name }}
        </n-descriptions-item>
        <n-descriptions-item :label="$t('operations.certificate.vendor')">
          {{ selectedCertificate.provider }}
        </n-descriptions-item>
        <n-descriptions-item :label="$t('operations.certificate.verificationMethod')">
          {{ selectedCertificate.verificationMethod }}
        </n-descriptions-item>
        <n-descriptions-item :label="$t('operations.certificate.certType')">
          {{ selectedCertificate.type }}
        </n-descriptions-item>
        <n-descriptions-item :label="$t('common.status')">
          {{ selectedCertificate.status }}
        </n-descriptions-item>
        <n-descriptions-item :label="$t('operations.certificate.wildcardCert')">
          {{ selectedCertificate.isWildcard ? $t('common.yes') : $t('common.no') }}
        </n-descriptions-item>
        <n-descriptions-item :label="$t('operations.certificate.issuedDate')">
          {{
            selectedCertificate.issuedAt
              ? new Date(selectedCertificate.issuedAt).toLocaleDateString(
                  'zh-CN',
                )
              : '--'
          }}
        </n-descriptions-item>
        <n-descriptions-item :label="$t('operations.certificate.expiryDate')" :span="2">
          {{
            selectedCertificate.expiresAt
              ? new Date(selectedCertificate.expiresAt).toLocaleDateString(
                  'zh-CN',
                )
              : '--'
          }}
        </n-descriptions-item>
        <n-descriptions-item :label="$t('operations.certificate.bindTitle')" :span="2">
          {{ selectedCertificate.domains.join(', ') }}
        </n-descriptions-item>
        <n-descriptions-item :label="$t('common.operator')">
          {{ selectedCertificate.operator }}
        </n-descriptions-item>
        <n-descriptions-item :label="$t('common.operationTime')">
          {{ new Date(selectedCertificate.updatedAt).toLocaleString('zh-CN') }}
        </n-descriptions-item>
      </n-descriptions>

      <template #footer>
        <n-space justify="end">
          <n-button @click="showDetailModal = false">{{ $t('common.close') }}</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { $t } from '@vben/locales';

import { ref, reactive, h, onMounted, computed } from 'vue';
import {
  NCard,
  NSpace,
  NInput,
  NSelect,
  NButton,
  NDataTable,
  NModal,
  NForm,
  NFormItem,
  NDatePicker,
  NAlert,
  NTag,
  NTooltip,
  NDescriptions,
  NDescriptionsItem,
  NPopconfirm,
  NRadioGroup,
  NRadio,
  NText,
  useMessage,
  type DataTableColumn,
  type FormInst,
  type FormRules,
} from 'naive-ui';

const message = useMessage();

interface Certificate {
  id: number;
  domainId?: number;
  name: string;
  provider: string;
  verificationMethod: string;
  crtFile?: string;
  keyFile?: string;
  type: string;
  status: string;
  isWildcard: boolean;
  domains: string[];
  issuedAt?: string;
  expiresAt?: string;
  operator: string;
  createdAt: string;
  updatedAt: string;
}

// State
const loading = ref(false);
const certificates = ref<Certificate[]>([]);
const showApplyModal = ref(false);
const showUploadModal = ref(false);
const showDetailModal = ref(false);
const selectedCertificate = ref<Certificate | null>(null);
const applying = ref(false);
const uploading = ref(false);

// Form Refs
const applyFormRef = ref<FormInst | null>(null);
const uploadFormRef = ref<FormInst | null>(null);

// Filters
const filters = reactive({
  name: '',
  expiryDate: null as [number, number] | null,
  provider: '',
  type: '',
  status: '',
});

// Pagination
const pagination = reactive({
  page: 1,
  pageSize: 20,
  itemCount: 0,
});

const paginationConfig = computed(() => ({
  page: pagination.page,
  pageSize: pagination.pageSize,
  itemCount: pagination.itemCount,
  showSizePicker: true,
  pageSizes: [10, 20, 50, 100],
  onChange: (page: number) => {
    pagination.page = page;
    fetchCertificates();
  },
  onUpdatePageSize: (pageSize: number) => {
    pagination.pageSize = pageSize;
    pagination.page = 1;
    fetchCertificates();
  },
}));

// Options
const providerOptions = [
  { label: $t('operations.domain.status.all'), value: '' },
  { label: "Let's Encrypt", value: 'LETSENCRYPT' },
  { label: 'ZeroSSL', value: 'ZEROSSL' },
  { label: 'Cloudflare', value: 'CLOUDFLARE' },
  { label: $t('operations.certificate.providerAliyun'), value: 'ALIYUN' },
  { label: $t('operations.certificate.providerTencent'), value: 'TENCENT_CLOUD' },
  { label: $t('operations.certificate.providerCustom'), value: 'CUSTOM' },
];

const typeOptions = [
  { label: $t('operations.domain.status.all'), value: '' },
  { label: $t('operations.certificate.freeCert'), value: 'FREE' },
  { label: $t('operations.certificate.paidCert'), value: 'PAID' },
  { label: $t('operations.certificate.uploadedCert'), value: 'UPLOADED' },
];

const statusOptions = [
  { label: $t('operations.domain.status.all'), value: '' },
  { label: $t('operations.certificate.validStatus'), value: 'VALID' },
  { label: $t('operations.domain.status.expiringSoon'), value: 'EXPIRING_SOON' },
  { label: $t('operations.domain.status.expired'), value: 'EXPIRED' },
  { label: $t('operations.certificate.pendingValidation'), value: 'PENDING_VALIDATION' },
];

const verificationMethodOptions = [
  { label: $t('operations.domain.verification.dns'), value: 'DNS' },
  { label: $t('operations.domain.verification.http'), value: 'HTTP' },
  { label: $t('operations.certificate.fileValidation'), value: 'FILE' },
];

// Apply Form
const applyForm = reactive({
  type: 'single',
  domains: '',
  verificationMethod: 'DNS',
});

const applyRules: FormRules = {
  domains: [{ required: true, message: $t('common.pleaseEnterField', [$t('operations.certificate.validateDomain')]), trigger: 'blur' }],
};

// Upload Form
const uploadForm = reactive({
  name: '',
  domain: '',
  crtContent: '',
  keyContent: '',
});

const uploadRules: FormRules = {
  name: [{ required: true, message: $t('common.pleaseEnterField', [$t('operations.certificate.validateCertName')]), trigger: 'blur' }],
  domain: [{ required: true, message: $t('common.pleaseEnterField', [$t('operations.certificate.validateDomain')]), trigger: 'blur' }],
  crtContent: [
    { required: true, message: $t('common.pleaseEnterField', [$t('operations.certificate.validateCrt')]), trigger: 'blur' },
  ],
  keyContent: [
    { required: true, message: $t('common.pleaseEnterField', [$t('operations.certificate.validateKey')]), trigger: 'blur' },
  ],
};

// Helper functions
const getStatusType = (status: string) => {
  const map: Record<string, any> = {
    VALID: 'success',
    EXPIRING_SOON: 'warning',
    EXPIRED: 'error',
    PENDING_VALIDATION: 'info',
  };
  return map[status] || 'default';
};

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    VALID: $t('operations.certificate.validStatus'),
    EXPIRING_SOON: $t('operations.domain.status.expiringSoon'),
    EXPIRED: $t('operations.certificate.expired'),
    PENDING_VALIDATION: $t('operations.certificate.pendingValidation'),
  };
  return map[status] || status;
};

const getDaysUntilExpiry = (expiresAt: string) => {
  const now = new Date();
  const expiry = new Date(expiresAt);
  const diffTime = expiry.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Table Columns
const columns: DataTableColumn<Certificate>[] = [
  {
    title: $t('operations.certificate.certId'),
    key: 'id',
    width: 80,
    fixed: 'left' as const,
  },
  {
    title: $t('operations.certificate.certName'),
    key: 'name',
    width: 180,
    ellipsis: { tooltip: true },
  },
  {
    title: $t('operations.certificate.vendor'),
    key: 'provider',
    width: 120,
    render(row: Certificate) {
      const providerMap: Record<string, string> = {
        LETSENCRYPT: "Let's Encrypt",
        ZEROSSL: 'ZeroSSL',
        CLOUDFLARE: 'Cloudflare',
        ALIYUN: $t('operations.certificate.providerAliyun'),
        TENCENT_CLOUD: $t('operations.certificate.providerTencent'),
        CUSTOM: $t('operations.certificate.providerCustom'),
      };
      return providerMap[row.provider] || row.provider;
    },
  },
  {
    title: () =>
      h('div', {}, [
        h('span', {}, $t('operations.certificate.verificationMethod') + ' '),
        h(
          NTooltip,
          {},
          {
            trigger: () =>
              h('span', { style: 'color: #2080f0; cursor: help;' }, 'ⓘ'),
            default: () => $t('operations.certificate.verificationTooltip'),
          },
        ),
      ]) as any,
    key: 'verificationMethod',
    width: 120,
    render(row: Certificate) {
      const methodMap: Record<string, string> = {
        DNS: $t('operations.domain.verification.dns'),
        HTTP: $t('operations.domain.verification.http'),
        FILE: $t('operations.certificate.fileValidation'),
      };
      return methodMap[row.verificationMethod] || row.verificationMethod;
    },
  },
  {
    title: $t('operations.certificate.crtFile'),
    key: 'crtFile',
    width: 100,
    render(row: Certificate) {
      return row.crtFile
        ? h(
            NButton,
            {
              text: true,
              type: 'primary',
              size: 'small',
              onClick: () => handleDownloadFile(row, 'crt'),
            },
            { default: () => $t('common.download') },
          )
        : '--';
    },
  },
  {
    title: $t('operations.certificate.keyFile'),
    key: 'keyFile',
    width: 100,
    render(row: Certificate) {
      return row.keyFile
        ? h(
            NButton,
            {
              text: true,
              type: 'primary',
              size: 'small',
              onClick: () => handleDownloadFile(row, 'key'),
            },
            { default: () => $t('common.download') },
          )
        : '--';
    },
  },
  {
    title: $t('common.type'),
    key: 'type',
    width: 100,
    render(row: Certificate) {
      const typeMap: Record<string, { text: string; type: any }> = {
        FREE: { text: $t('operations.certificate.free'), type: 'success' },
        PAID: { text: $t('operations.certificate.paid'), type: 'warning' },
        UPLOADED: { text: $t('operations.certificate.uploadedCert'), type: 'info' },
      };
      const type = typeMap[row.type] || { text: row.type, type: 'default' };
      return h(
        NTag,
        { type: type.type, size: 'small' },
        { default: () => type.text },
      );
    },
  },
  {
    title: $t('operations.certificate.certStatus'),
    key: 'status',
    width: 110,
    render(row: Certificate) {
      return h(
        NTag,
        {
          type: getStatusType(row.status) as any,
          size: 'small',
        },
        {
          default: () => getStatusText(row.status),
        },
      );
    },
  },
  {
    title: $t('operations.certificate.isWildcard'),
    key: 'isWildcard',
    width: 130,
    render(row: Certificate) {
      return row.isWildcard ? $t('common.yes') : $t('common.no');
    },
  },
  {
    title: $t('operations.certificate.certDomains'),
    key: 'domains',
    width: 200,
    ellipsis: { tooltip: true },
    render(row: Certificate) {
      return row.domains.join(', ');
    },
  },
  {
    title: $t('operations.certificate.expiryTime'),
    key: 'expiresAt',
    width: 150,
    render(row: Certificate) {
      if (!row.expiresAt) return '--';
      const days = getDaysUntilExpiry(row.expiresAt);
      const color = days <= 7 ? '#f5222d' : days <= 30 ? '#faad14' : '#52c41a';
      return h('div', {}, [
        h('div', {}, new Date(row.expiresAt).toLocaleDateString('zh-CN')),
        h(
          'div',
          {
            style: `font-size: 11px; color: ${color};`,
          },
          days > 0 ? $t('operations.certificate.daysRemaining', [days]) : $t('operations.certificate.expired'),
        ),
      ]);
    },
  },
  {
    title: $t('common.actions'),
    key: 'actions',
    width: 200,
    fixed: 'right' as const,
    render(row: Certificate) {
      return h(
        'div',
        { style: 'display: flex; gap: 4px; flex-wrap: wrap;' },
        [
          h(
            NButton,
            {
              text: true,
              type: 'primary',
              size: 'small',
              onClick: () => handleViewDetail(row),
            },
            { default: () => $t('common.detail') },
          ),
          row.status === 'EXPIRING_SOON' || row.status === 'EXPIRED'
            ? h(
                NButton,
                {
                  text: true,
                  type: 'warning',
                  size: 'small',
                  onClick: () => handleRenew(row),
                },
                { default: () => $t('operations.certificate.renew') },
              )
            : null,
          h(
            NButton,
            {
              text: true,
              type: 'info',
              size: 'small',
              onClick: () => handleBindDomain(row),
            },
            { default: () => $t('operations.domain.action.bindDomain') },
          ),
          row.provider === 'AWS_ACM' && row.status === 'PENDING_VALIDATION'
            ? h(
                NButton,
                {
                  text: true,
                  type: 'success',
                  size: 'small',
                  onClick: () => handleValidateDNS(row),
                },
                { default: () => $t('operations.certificate.validateDns') },
              )
            : null,
          row.provider === 'AWS_ACM' && row.status === 'ISSUED'
            ? h(
                NButton,
                {
                  text: true,
                  type: 'warning',
                  size: 'small',
                  onClick: () => handleConfigureNGINX(row),
                },
                { default: () => $t('operations.certificate.configureHttps') },
              )
            : null,
          h(
            NPopconfirm,
            {
              onPositiveClick: () => handleDelete(row),
              positiveText: $t('operations.domain.modal.confirmDelete'),
              negativeText: $t('common.cancel'),
              style: { width: '500px' },
            },
            {
              default: () =>
                h('div', { style: 'font-size: 14px; padding: 10px 0;' }, [
                  h(
                    'div',
                    {
                      style:
                        'font-weight: 600; margin-bottom: 8px; font-size: 16px;',
                    },
                    $t('operations.certificate.confirmDeleteCert'),
                  ),
                  h(
                    'div',
                    { style: 'color: #666;' },
                    $t('operations.certificate.certDomainLabel') + ': ' + (row.domains?.join(', ') || $t('operations.certificate.unknown')),
                  ),
                  h(
                    'div',
                    {
                      style:
                        'color: #ff4d4f; margin-top: 8px; font-size: 13px;',
                    },
                    $t('operations.domain.modal.deleteIrreversible'),
                  ),
                ]),
              trigger: () =>
                h(
                  NButton,
                  {
                    text: true,
                    type: 'error',
                    size: 'small',
                  },
                  { default: () => $t('common.delete') },
                ),
            },
          ),
        ].filter(Boolean),
      );
    },
  },
  {
    title: $t('common.operator'),
    key: 'operator',
    width: 100,
  },
  {
    title: $t('common.operationTime'),
    key: 'updatedAt',
    width: 160,
    render(row: Certificate) {
      return new Date(row.updatedAt).toLocaleString('zh-CN');
    },
  },
];

// Methods
const fetchCertificates = async () => {
  loading.value = true;
  try {
    // Call the real API to get certificates
    const response = await fetch('/api/certificates', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.code === 0) {
      certificates.value = result.data || [];
      pagination.itemCount = certificates.value.length;
    } else {
      console.error('API error:', result.error);
      certificates.value = [];
      pagination.itemCount = 0;
    }
  } catch (error: any) {
    console.error('Fetch certificates error:', error);
    message.error($t('operations.certificate.fetchFailed', [error.message || '']));
    certificates.value = [];
    pagination.itemCount = 0;
  } finally {
    loading.value = false;
  }
};

const resetFilters = () => {
  filters.name = '';
  filters.expiryDate = null;
  filters.provider = '';
  filters.type = '';
  filters.status = '';
  pagination.page = 1;
  fetchCertificates();
};

const handleApplyCertificate = async () => {
  if (!applyFormRef.value) return;

  try {
    await applyFormRef.value.validate();
    applying.value = true;

    // Parse domains from textarea
    const domains = applyForm.domains
      .split('\n')
      .map((d) => d.trim())
      .filter((d) => d.length > 0);

    if (domains.length === 0) {
      message.error($t('operations.certificate.enterOneDomain'));
      return;
    }

    const mainDomain = domains[0]; // First domain is the main domain
    const alternativeNames = domains.slice(1); // Rest are alternative names

    // First, look up the domain in the database to get domainId
    const domainLookupResponse = await fetch(
      `/api/domain-management?search=${encodeURIComponent(mainDomain || '')}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      },
    );

    const domainLookupResult = await domainLookupResponse.json();

    // The API returns data.list, not data directly
    if (
      domainLookupResult.code !== 0 ||
      !domainLookupResult.data?.list ||
      domainLookupResult.data.list.length === 0
    ) {
      message.error(
        $t('operations.certificate.domainNotFound', [mainDomain]),
      );
      return;
    }

    // Find exact match (search might return partial matches)
    const domainRecord = domainLookupResult.data.list.find(
      (d: any) => d.domainName === mainDomain,
    );

    if (!domainRecord) {
      message.error(
        $t('operations.certificate.domainNotFound', [mainDomain]),
      );
      return;
    }

    // Call Let's Encrypt API (NEW)
    const response = await fetch('/api/letsencrypt/request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        domainId: domainRecord.id,
        domain: mainDomain,
        alternativeNames:
          alternativeNames.length > 0 ? alternativeNames : undefined,
        email: 'admin@sevenki.com', // Default email, can make this configurable
      }),
    });

    const result = await response.json();

    if (result.success) {
      message.success(
        $t('operations.certificate.applySuccess', [mainDomain]),
      );
      showApplyModal.value = false;

      // Reset form
      Object.assign(applyForm, {
        type: 'single',
        domains: '',
        verificationMethod: 'DNS',
      });

      fetchCertificates();
    } else {
      message.error(result.message || $t('operations.certificate.applyFailed'));
    }
  } catch (error: any) {
    console.error('Apply certificate error:', error);
    message.error($t('operations.certificate.applyFailedWith', [error.message || '']));
  } finally {
    applying.value = false;
  }
};

const handleUploadCertificate = async () => {
  if (!uploadFormRef.value) return;

  try {
    await uploadFormRef.value.validate();
    uploading.value = true;

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    message.success($t('operations.certificate.uploadSuccess'));
    showUploadModal.value = false;

    // Reset form
    Object.assign(uploadForm, {
      name: '',
      domain: '',
      crtContent: '',
      keyContent: '',
    });

    fetchCertificates();
  } catch (error: any) {
    console.error('Upload certificate error:', error);
    message.error($t('operations.certificate.uploadFailed'));
  } finally {
    uploading.value = false;
  }
};

const handleViewDetail = (cert: Certificate) => {
  selectedCertificate.value = cert;
  showDetailModal.value = true;
};

const handleDownloadFile = (cert: Certificate, type: 'crt' | 'key') => {
  message.info($t('operations.certificate.downloadCertFile', [type === 'crt' ? 'CRT' : 'KEY']));
  // Implement actual download logic
};

const handleRenew = (cert: Certificate) => {
  message.info($t('operations.certificate.renewInfo', [cert.name]));
  // Implement renew logic
};

const handleBindDomain = (cert: Certificate) => {
  message.info($t('operations.certificate.bindInfo', [cert.name]));
  // Implement bind domain logic
};

const handleConfigureNGINX = async (cert: Certificate) => {
  try {
    if (!cert.domainId) {
      message.error($t('operations.certificate.notBoundDomain'));
      return;
    }

    const response = await fetch(
      `/api/aws-ssl/configure-nginx/${cert.domainId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      },
    );

    const result = await response.json();

    if (result.success) {
      message.success(result.message);

      // Show commands in a modal or copy to clipboard
      const commands = result.commands.join('\n');
      console.log('NGINX Configuration Commands:');
      console.log(commands);

      // Copy to clipboard
      navigator.clipboard
        .writeText(commands)
        .then(() => {
          message.info($t('operations.certificate.nginxCopied'));
        })
        .catch(() => {
          message.info($t('operations.certificate.nginxConsole'));
        });
    } else {
      message.error(result.message || $t('operations.certificate.nginxFailed'));
    }
  } catch (error: any) {
    console.error('Configure NGINX error:', error);
    message.error($t('operations.certificate.nginxFailedWith', [error.message || '']));
  }
};

const handleValidateDNS = async (cert: Certificate) => {
  try {
    const response = await fetch(`/api/aws-ssl/validate-dns/${cert.id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });

    const result = await response.json();

    if (result.success) {
      message.success(result.message);
      if (result.validationRecord) {
        message.info(
          $t('operations.certificate.dnsRecord', [result.validationRecord.name, result.validationRecord.value]),
        );
      }
      fetchCertificates();
    } else {
      message.error(result.message || $t('operations.certificate.dnsValidateFailed'));
    }
  } catch (error: any) {
    console.error('Validate DNS error:', error);
    message.error($t('operations.certificate.dnsValidateFailedWith', [error.message || '']));
  }
};

const handleDelete = async (cert: Certificate) => {
  try {
    const response = await fetch(`/api/certificates/${cert.id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });

    const result = await response.json();

    if (result.code === 0) {
      message.success($t('operations.certificate.deleteSuccess'));
      fetchCertificates();
    } else {
      message.error(result.message || $t('operations.certificate.deleteFailed'));
    }
  } catch (error: any) {
    console.error('Delete certificate error:', error);
    message.error($t('operations.certificate.deleteFailedWith', [error.message || '']));
  }
};

onMounted(() => {
  fetchCertificates();
});
</script>

<style scoped lang="scss">
.certificate-view {
  padding: 0;
}

:deep(.n-data-table) {
  .n-data-table-th {
    font-weight: 600;
  }
}
</style>
