<template>
  <div class="certificate-view">
    <!-- Filters -->
    <n-card size="small" style="margin-bottom: 16px">
      <n-space :size="12" align="center">
        <n-input
          v-model:value="filters.name"
          placeholder="请输入证书名称"
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
          placeholder="证书到期时间"
        />

        <n-select
          v-model:value="filters.provider"
          placeholder="供应商"
          clearable
          style="width: 130px"
          size="small"
          :options="providerOptions"
        />

        <n-select
          v-model:value="filters.type"
          placeholder="证书类型"
          clearable
          style="width: 130px"
          size="small"
          :options="typeOptions"
        />

        <n-select
          v-model:value="filters.status"
          placeholder="状态"
          clearable
          style="width: 120px"
          size="small"
          :options="statusOptions"
        />

        <n-button type="primary" size="small" @click="fetchCertificates">
          搜索
        </n-button>

        <n-button size="small" @click="resetFilters"> 重置 </n-button>
      </n-space>
    </n-card>

    <!-- Action Buttons -->
    <n-card size="small" style="margin-bottom: 16px">
      <n-space justify="space-between">
        <n-space>
          <n-button type="primary" size="small" @click="showApplyModal = true">
            申请免费证书
          </n-button>
          <n-button type="info" size="small" @click="showUploadModal = true">
            上传证书
          </n-button>
        </n-space>
        <n-space align="center">
          <span style="font-size: 13px; color: #666">
            共 {{ pagination.itemCount }} 条
          </span>
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
      title="申请免费证书"
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
        <n-form-item label="类型" path="type">
          <n-radio-group v-model:value="applyForm.type">
            <n-radio value="single">单域名证书</n-radio>
            <n-radio value="wildcard"
              >多域名通配符证书 (仅支持顶级域名)</n-radio
            >
          </n-radio-group>
        </n-form-item>

        <n-form-item label="验证方式" path="verificationMethod">
          <n-text>添加TXT类型解析</n-text>
        </n-form-item>

        <n-form-item label="*域名" path="domains">
          <n-input
            v-model:value="applyForm.domains"
            type="textarea"
            placeholder="请输入域名,多个请换行,格式如下:&#10;www.123.com&#10;123.com"
            :rows="3"
            :status="applyForm.domains ? 'success' : 'error'"
          />
          <div
            v-if="!applyForm.domains"
            style="color: #d03050; font-size: 12px; margin-top: 4px"
          >
            格式不正确
          </div>
        </n-form-item>

        <n-alert type="info" style="margin-top: 16px" size="small">
          <div style="font-size: 13px">
            <div>• 使用 Let's Encrypt 免费证书，有效期为90天，自动续期</div>
            <div>• 通过 DNS-01 验证方式，自动在 Route53 添加 TXT 记录</div>
            <div>• 域名必须先在域名管理中创建（AWS Route53）</div>
            <div>• 证书验证通常需要 2-5 分钟</div>
          </div>
        </n-alert>
      </n-form>

      <template #footer>
        <n-space justify="end">
          <n-button @click="showApplyModal = false">取消</n-button>
          <n-button
            type="primary"
            @click="handleApplyCertificate"
            :loading="applying"
          >
            申请
          </n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- Upload Certificate Modal -->
    <n-modal
      v-model:show="showUploadModal"
      preset="card"
      title="上传证书"
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
        <n-form-item label="证书名称" path="name">
          <n-input
            v-model:value="uploadForm.name"
            placeholder="请输入证书名称"
          />
        </n-form-item>

        <n-form-item label="域名" path="domain">
          <n-input
            v-model:value="uploadForm.domain"
            placeholder="证书绑定的域名"
          />
        </n-form-item>

        <n-form-item label="CRT文件内容" path="crtContent">
          <n-input
            v-model:value="uploadForm.crtContent"
            type="textarea"
            placeholder="请粘贴证书文件内容（.crt 或 .pem）"
            :rows="6"
          />
        </n-form-item>

        <n-form-item label="KEY文件内容" path="keyContent">
          <n-input
            v-model:value="uploadForm.keyContent"
            type="textarea"
            placeholder="请粘贴私钥文件内容（.key）"
            :rows="6"
          />
        </n-form-item>

        <n-alert type="warning" style="margin-top: 16px" size="small">
          <div style="font-size: 13px">
            <div>• 请确保证书和私钥文件匹配</div>
            <div>• 私钥文件请妥善保管，不要泄露给他人</div>
            <div>• 支持标准PEM格式的证书文件</div>
          </div>
        </n-alert>
      </n-form>

      <template #footer>
        <n-space justify="end">
          <n-button @click="showUploadModal = false">取消</n-button>
          <n-button
            type="primary"
            @click="handleUploadCertificate"
            :loading="uploading"
          >
            上传
          </n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- View Certificate Details Modal -->
    <n-modal
      v-model:show="showDetailModal"
      preset="card"
      title="证书详情"
      style="width: 700px"
      :bordered="false"
    >
      <n-descriptions
        v-if="selectedCertificate"
        :column="2"
        bordered
        size="small"
      >
        <n-descriptions-item label="证书ID">
          {{ selectedCertificate.id }}
        </n-descriptions-item>
        <n-descriptions-item label="证书名称">
          {{ selectedCertificate.name }}
        </n-descriptions-item>
        <n-descriptions-item label="供应商">
          {{ selectedCertificate.provider }}
        </n-descriptions-item>
        <n-descriptions-item label="验证方式">
          {{ selectedCertificate.verificationMethod }}
        </n-descriptions-item>
        <n-descriptions-item label="证书类型">
          {{ selectedCertificate.type }}
        </n-descriptions-item>
        <n-descriptions-item label="状态">
          {{ selectedCertificate.status }}
        </n-descriptions-item>
        <n-descriptions-item label="通配符证书">
          {{ selectedCertificate.isWildcard ? '是' : '否' }}
        </n-descriptions-item>
        <n-descriptions-item label="签发日期">
          {{
            selectedCertificate.issuedAt
              ? new Date(selectedCertificate.issuedAt).toLocaleDateString(
                  'zh-CN',
                )
              : '--'
          }}
        </n-descriptions-item>
        <n-descriptions-item label="到期日期" :span="2">
          {{
            selectedCertificate.expiresAt
              ? new Date(selectedCertificate.expiresAt).toLocaleDateString(
                  'zh-CN',
                )
              : '--'
          }}
        </n-descriptions-item>
        <n-descriptions-item label="绑定域名" :span="2">
          {{ selectedCertificate.domains.join(', ') }}
        </n-descriptions-item>
        <n-descriptions-item label="操作人">
          {{ selectedCertificate.operator }}
        </n-descriptions-item>
        <n-descriptions-item label="操作时间">
          {{ new Date(selectedCertificate.updatedAt).toLocaleString('zh-CN') }}
        </n-descriptions-item>
      </n-descriptions>

      <template #footer>
        <n-space justify="end">
          <n-button @click="showDetailModal = false">关闭</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
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
  { label: '全部', value: '' },
  { label: "Let's Encrypt", value: 'LETSENCRYPT' },
  { label: 'ZeroSSL', value: 'ZEROSSL' },
  { label: 'Cloudflare', value: 'CLOUDFLARE' },
  { label: '阿里云', value: 'ALIYUN' },
  { label: '腾讯云', value: 'TENCENT_CLOUD' },
  { label: '自定义', value: 'CUSTOM' },
];

const typeOptions = [
  { label: '全部', value: '' },
  { label: '免费证书', value: 'FREE' },
  { label: '付费证书', value: 'PAID' },
  { label: '自上传', value: 'UPLOADED' },
];

const statusOptions = [
  { label: '全部', value: '' },
  { label: '正常', value: 'VALID' },
  { label: '即将过期', value: 'EXPIRING_SOON' },
  { label: '已过期', value: 'EXPIRED' },
  { label: '待验证', value: 'PENDING_VALIDATION' },
];

const verificationMethodOptions = [
  { label: 'DNS验证', value: 'DNS' },
  { label: 'HTTP验证', value: 'HTTP' },
  { label: '文件验证', value: 'FILE' },
];

// Apply Form
const applyForm = reactive({
  type: 'single',
  domains: '',
  verificationMethod: 'DNS',
});

const applyRules: FormRules = {
  domains: [{ required: true, message: '请输入域名', trigger: 'blur' }],
};

// Upload Form
const uploadForm = reactive({
  name: '',
  domain: '',
  crtContent: '',
  keyContent: '',
});

const uploadRules: FormRules = {
  name: [{ required: true, message: '请输入证书名称', trigger: 'blur' }],
  domain: [{ required: true, message: '请输入域名', trigger: 'blur' }],
  crtContent: [
    { required: true, message: '请输入CRT文件内容', trigger: 'blur' },
  ],
  keyContent: [
    { required: true, message: '请输入KEY文件内容', trigger: 'blur' },
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
    VALID: '正常',
    EXPIRING_SOON: '即将过期',
    EXPIRED: '已过期',
    PENDING_VALIDATION: '待验证',
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
    title: '证书ID',
    key: 'id',
    width: 80,
    fixed: 'left' as const,
  },
  {
    title: '证书名称',
    key: 'name',
    width: 180,
    ellipsis: { tooltip: true },
  },
  {
    title: '供应商',
    key: 'provider',
    width: 120,
    render(row: Certificate) {
      const providerMap: Record<string, string> = {
        LETSENCRYPT: "Let's Encrypt",
        ZEROSSL: 'ZeroSSL',
        CLOUDFLARE: 'Cloudflare',
        ALIYUN: '阿里云',
        TENCENT_CLOUD: '腾讯云',
        CUSTOM: '自定义',
      };
      return providerMap[row.provider] || row.provider;
    },
  },
  {
    title: () =>
      h('div', {}, [
        h('span', {}, '验证方式 '),
        h(
          NTooltip,
          {},
          {
            trigger: () =>
              h('span', { style: 'color: #2080f0; cursor: help;' }, 'ⓘ'),
            default: () => '证书签发时使用的域名验证方式',
          },
        ),
      ]) as any,
    key: 'verificationMethod',
    width: 120,
    render(row: Certificate) {
      const methodMap: Record<string, string> = {
        DNS: 'DNS验证',
        HTTP: 'HTTP验证',
        FILE: '文件验证',
      };
      return methodMap[row.verificationMethod] || row.verificationMethod;
    },
  },
  {
    title: 'CRT文件',
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
            { default: () => '下载' },
          )
        : '--';
    },
  },
  {
    title: 'key文件',
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
            { default: () => '下载' },
          )
        : '--';
    },
  },
  {
    title: '类型',
    key: 'type',
    width: 100,
    render(row: Certificate) {
      const typeMap: Record<string, { text: string; type: any }> = {
        FREE: { text: '免费', type: 'success' },
        PAID: { text: '付费', type: 'warning' },
        UPLOADED: { text: '自上传', type: 'info' },
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
    title: '证书状态',
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
    title: '是否通配符证书',
    key: 'isWildcard',
    width: 130,
    render(row: Certificate) {
      return row.isWildcard ? '是' : '否';
    },
  },
  {
    title: '证书对应域名',
    key: 'domains',
    width: 200,
    ellipsis: { tooltip: true },
    render(row: Certificate) {
      return row.domains.join(', ');
    },
  },
  {
    title: '到期时间',
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
          days > 0 ? `还有${days}天` : '已过期',
        ),
      ]);
    },
  },
  {
    title: '操作',
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
            { default: () => '详情' },
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
                { default: () => '续期' },
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
            { default: () => '绑定域名' },
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
                { default: () => '验证DNS' },
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
                { default: () => '配置HTTPS' },
              )
            : null,
          h(
            NPopconfirm,
            {
              onPositiveClick: () => handleDelete(row),
              positiveText: '确认删除',
              negativeText: '取消',
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
                    '⚠️ 确认删除证书？',
                  ),
                  h(
                    'div',
                    { style: 'color: #666;' },
                    `证书域名: ${row.domains?.join(', ') || '未知'}`,
                  ),
                  h(
                    'div',
                    {
                      style:
                        'color: #ff4d4f; margin-top: 8px; font-size: 13px;',
                    },
                    '删除后将无法恢复，请谨慎操作！',
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
                  { default: () => '删除' },
                ),
            },
          ),
        ].filter(Boolean),
      );
    },
  },
  {
    title: '操作人',
    key: 'operator',
    width: 100,
  },
  {
    title: '操作时间',
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
    message.error('获取证书列表失败: ' + error.message);
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
      message.error('请输入至少一个域名');
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
        `域名 ${mainDomain} 未在系统中找到，请先在域名管理中创建该域名`,
      );
      return;
    }

    // Find exact match (search might return partial matches)
    const domainRecord = domainLookupResult.data.list.find(
      (d: any) => d.domainName === mainDomain,
    );

    if (!domainRecord) {
      message.error(
        `域名 ${mainDomain} 未在系统中找到，请先在域名管理中创建该域名`,
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
        `✅ ${mainDomain} 证书已创建！状态：待验证。请在证书列表中查看详情和安装脚本。`,
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
      message.error(result.message || '证书申请失败');
    }
  } catch (error: any) {
    console.error('Apply certificate error:', error);
    message.error('证书申请失败: ' + error.message);
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

    message.success('证书上传成功');
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
    message.error('证书上传失败');
  } finally {
    uploading.value = false;
  }
};

const handleViewDetail = (cert: Certificate) => {
  selectedCertificate.value = cert;
  showDetailModal.value = true;
};

const handleDownloadFile = (cert: Certificate, type: 'crt' | 'key') => {
  message.info(`下载证书${type === 'crt' ? 'CRT' : 'KEY'}文件`);
  // Implement actual download logic
};

const handleRenew = (cert: Certificate) => {
  message.info(`续期证书: ${cert.name}`);
  // Implement renew logic
};

const handleBindDomain = (cert: Certificate) => {
  message.info(`绑定域名到证书: ${cert.name}`);
  // Implement bind domain logic
};

const handleConfigureNGINX = async (cert: Certificate) => {
  try {
    if (!cert.domainId) {
      message.error('证书未绑定域名');
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
          message.info('NGINX配置命令已复制到剪贴板');
        })
        .catch(() => {
          message.info('请查看控制台获取NGINX配置命令');
        });
    } else {
      message.error(result.message || 'NGINX配置失败');
    }
  } catch (error: any) {
    console.error('Configure NGINX error:', error);
    message.error('NGINX配置失败: ' + error.message);
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
          `DNS记录: ${result.validationRecord.name} = ${result.validationRecord.value}`,
        );
      }
      fetchCertificates();
    } else {
      message.error(result.message || 'DNS验证失败');
    }
  } catch (error: any) {
    console.error('Validate DNS error:', error);
    message.error('DNS验证失败: ' + error.message);
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
      message.success('证书删除成功');
      fetchCertificates();
    } else {
      message.error(result.message || '证书删除失败');
    }
  } catch (error: any) {
    console.error('Delete certificate error:', error);
    message.error('证书删除失败: ' + error.message);
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
