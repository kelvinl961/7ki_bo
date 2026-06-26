<template>
  <div class="all-domains-view">
    <!-- Statistics Cards -->
    <n-grid :cols="4" :x-gap="16" style="margin-bottom: 16px">
      <n-gi>
        <n-card size="small">
          <n-statistic :label="$t('operations.domain.stats.totalDomains')" :value="stats.total" />
        </n-card>
      </n-gi>
      <n-gi>
        <n-card size="small">
          <n-statistic label="Cloudflare" :value="stats.cloudflare" />
        </n-card>
      </n-gi>
      <n-gi>
        <n-card size="small">
          <n-statistic label="AWS" :value="stats.aws" />
        </n-card>
      </n-gi>
      <n-gi>
        <n-card size="small">
          <n-statistic :label="$t('operations.domain.stats.verified')" :value="stats.verified" />
        </n-card>
      </n-gi>
    </n-grid>

    <!-- Filters -->
    <n-card size="small" style="margin-bottom: 16px">
      <n-space :size="12" align="center">
        <n-select
          v-model:value="filters.cdnProvider"
          :options="cdnProviderOptions"
          :placeholder="$t('operations.domain.filter.cdnNode')"
          clearable
          style="width: 150px"
          size="small"
        />

        <n-select
          v-model:value="filters.status"
          :options="statusOptions"
          :placeholder="$t('operations.domain.filter.mainDomainStatus')"
          clearable
          style="width: 140px"
          size="small"
        />

        <n-input
          v-model:value="filters.search"
          :placeholder="$t('operations.domain.filter.domainSearch')"
          clearable
          style="width: 200px"
          size="small"
          @keyup.enter="fetchDomains"
        />

        <n-button type="primary" size="small" @click="fetchDomains">{{ $t('common.search') }}</n-button>

        <n-button size="small" @click="resetFilters"> {{ $t('common.reset') }} </n-button>
      </n-space>
    </n-card>

    <!-- Actions -->
    <n-card size="small" style="margin-bottom: 16px">
      <n-space justify="space-between">
        <n-space>
          <n-button type="primary" size="small" @click="showCreateModal = true">{{ $t('common.create') }}</n-button>
          <n-button
            size="small"
            :disabled="selectedRowKeys.length === 0"
            @click="handleBulkDelete"
          >{{ $t('operations.domain.action.bulkDelete') }}</n-button>
          <n-button size="small" @click="fetchDomains"> {{ $t('common.refresh') }} </n-button>
        </n-space>
        <span style="font-size: 13px; color: #666">
          {{ $t('operations.domain.recordCount', [pagination.itemCount || 0]) }}
          <span v-if="selectedRowKeys.length > 0" style="margin-left: 8px">
            {{ $t('operations.domain.selectedCount', [selectedRowKeys.length]) }}
          </span>
        </span>
      </n-space>
    </n-card>

    <!-- Data Table -->
    <n-card size="small">
      <n-data-table
        :columns="columns"
        :data="domains"
        :loading="loading"
        :pagination="paginationConfig"
        :row-key="(row: Domain) => row.id"
        :checked-row-keys="selectedRowKeys"
        @update:checked-row-keys="handleCheck"
        :scroll-x="2000"
        size="small"
      />
    </n-card>

    <!-- Create Domain Modal -->
    <CreateDomainModal
      v-model:show="showCreateModal"
      @success="handleCreateSuccess"
    />

    <!-- Switch CDN Modal -->
    <n-modal
      v-model:show="showSwitchCDNModal"
      preset="dialog"
      :title="$t('operations.domain.modal.switchCdnTitle')"
      :positive-text="$t('common.confirm')"
      :negative-text="$t('common.cancel')"
      @positive-click="confirmSwitchCDN"
    >
      <n-space vertical :size="16" style="margin: 20px 0">
        <div>
          <div style="margin-bottom: 8px; font-weight: 500">{{ $t('operations.domain.modal.currentDomain') }}</div>
          <div style="color: #666">{{ selectedDomain?.domainName }}</div>
        </div>
        <div>
          <div style="margin-bottom: 8px; font-weight: 500">{{ $t('operations.domain.modal.currentCdn') }}</div>
          <n-tag :type="'info'" size="small">{{
            selectedDomain?.cdnProvider
          }}</n-tag>
        </div>
        <div>
          <div style="margin-bottom: 8px; font-weight: 500">{{ $t('operations.domain.modal.targetCdnRequired') }} <span style="color: red">*</span>
          </div>
          <n-select
            v-model:value="targetCDN"
            :options="
              cdnProviderOptions.filter(
                (o) => o.value && o.value !== selectedDomain?.cdnProvider,
              )
            "
            :placeholder="$t('operations.domain.modal.selectTargetCdn')"
          />
        </div>
        <n-alert type="warning" :show-icon="false" style="margin-top: 12px">
          <div style="font-size: 13px; line-height: 1.8">
            <div style="font-weight: 500; margin-bottom: 8px">{{ $t('operations.domain.modal.featureDescription') }}</div>
            <div>
              • {{ $t('operations.domain.modal.cdnSwitchHint') }}
            </div>
            <div style="margin-top: 8px; font-weight: 500">{{ $t('operations.domain.modal.supportedCdn') }}</div>
            <div>
              {{ $t('operations.domain.modal.cdnList') }}
            </div>
          </div>
        </n-alert>
      </n-space>
    </n-modal>

    <!-- Bind Agent Modal -->
    <n-modal
      v-model:show="showBindAgentModal"
      preset="dialog"
      :title="$t('operations.domain.modal.bindAgentTitle')"
      :positive-text="$t('common.confirm')"
      :negative-text="$t('common.cancel')"
      @positive-click="confirmBindAgent"
    >
      <n-space vertical :size="16" style="margin: 20px 0">
        <div>
          <div style="margin-bottom: 8px; font-weight: 500">{{ $t('operations.domain.modal.currentDomain') }}</div>
          <div style="color: #666">{{ selectedDomain?.domainName }}</div>
        </div>
        <div>
          <div style="margin-bottom: 8px; font-weight: 500">{{ $t('operations.layout.agent') }}ID</div>
          <n-input
            v-model:value="agentId"
            :placeholder="$t('operations.domain.modal.agentIdPlaceholder')"
            clearable
          />
        </div>
        <n-alert type="info" :show-icon="false">
          <div style="font-size: 13px">
            <div>• {{ $t('operations.domain.modal.bindAgentHint1') }}</div>
            <div>• {{ $t('operations.domain.modal.bindAgentHint2') }}</div>
            <div style="padding-left: 16px">
              {{ $t('operations.domain.modal.bindAgentPriority1') }}
            </div>
            <div style="padding-left: 16px">{{ $t('operations.domain.modal.bindAgentPriority2') }}</div>
            <div style="padding-left: 16px">
              {{ $t('operations.domain.modal.bindAgentPriority3') }}
            </div>
          </div>
        </n-alert>
      </n-space>
    </n-modal>

    <!-- Subdomain List Modal -->
    <n-modal
      v-model:show="showSubdomainModal"
      :mask-closable="false"
      preset="card"
      :title="$t('operations.domain.modal.subdomainTitle')"
      style="width: 900px"
    >
      <n-spin :show="subdomainLoading">
        <n-data-table
          :columns="subdomainColumns"
          :data="subdomains"
          :pagination="false"
          size="small"
          :max-height="400"
        />
      </n-spin>
      <template #footer>
        <div style="display: flex; justify-content: flex-end">
          <n-button type="primary" @click="showSubdomainModal = false">{{ $t('common.close') }}</n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { $t } from '@vben/locales';

import { ref, h, onMounted, reactive, computed } from 'vue';
import {
  NButton,
  NTag,
  NSpace,
  NPopconfirm,
  NGrid,
  NGi,
  NCard,
  NStatistic,
  NSelect,
  NInput,
  NDataTable,
  NModal,
  NAlert,
  NSpin,
  useMessage,
  type DataTableColumn,
  type SelectOption,
} from 'naive-ui';
import { domainApi } from '../api/domainApi';
// ✅ PERFORMANCE FIX: Lazy load modal components - they only load when modals are opened
import { defineAsyncComponent } from 'vue';
const CreateDomainModal = defineAsyncComponent(
  () => import('../components/CreateDomainModal.vue'),
);
import type { Domain } from '../types';

interface Props {
  initialFilter?: {
    useType?: string;
    cdnProvider?: string;
    status?: string;
  };
  title?: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: $t('operations.domain.title'),
});

const message = useMessage();

// State
const loading = ref(false);
const domains = ref<Domain[]>([]);
const selectedRowKeys = ref<number[]>([]);
const showCreateModal = ref(false);

// Modal states
const showSwitchCDNModal = ref(false);
const showBindAgentModal = ref(false);
const showSubdomainModal = ref(false);
const selectedDomain = ref<Domain | null>(null);
const targetCDN = ref<string>('');
const agentId = ref<string>('');

// Subdomain modal states
const subdomains = ref<Domain[]>([]);
const subdomainLoading = ref(false);
const subdomainCounts = ref<Record<number, number>>({});

// Verification states
const isVerifying = ref<Record<number, boolean>>({});

// Stats
const stats = ref({
  total: 0,
  cloudflare: 0,
  aws: 0,
  verified: 0,
});

// Filters
const filters = ref({
  cdnProvider: null as string | null,
  status: null as string | null,
  search: '',
});

// Pagination
const pagination = reactive({
  page: 1,
  pageSize: 20,
  itemCount: 0,
});

const paginationConfig = reactive({
  page: 1,
  pageSize: 20,
  showSizePicker: true,
  pageSizes: [10, 20, 50, 100],
  itemCount: 0,
  onChange: (page: number) => {
    pagination.page = page;
    fetchDomains();
  },
  onUpdatePageSize: (pageSize: number) => {
    pagination.pageSize = pageSize;
    pagination.page = 1;
    fetchDomains();
  },
});

// Expanded rows state (for verification method expand/collapse)
const expandedRows = ref<Record<number, boolean>>({});

// Options
const cdnProviderOptions: SelectOption[] = [
  { label: $t('operations.domain.status.all'), value: '' },
  { label: 'Cloudflare (CF)', value: 'CLOUDFLARE' },
  { label: 'AWS (A8)', value: 'AWS' },
  { label: 'Wangsu', value: 'WANGSU' },
  { label: 'Volcengine', value: 'VOLCENGINE' },
  { label: 'Aliyun', value: 'ALIYUN' },
  { label: 'Tencent Cloud', value: 'TENCENT_CLOUD' },
  { label: $t('operations.domain.cdn.huawei'), value: 'HUAWEI_CLOUD' },
  { label: 'SuperEdge', value: 'SUPEREDGE' },
  { label: 'Funnull', value: 'FUNNULL' },
  { label: 'Yundun', value: 'YUNDUN' },
];

const statusOptions: SelectOption[] = [
  { label: $t('operations.domain.status.all'), value: '' },
  { label: $t('operations.domain.status.normal'), value: 'NORMAL' },
  { label: $t('operations.domain.status.expired'), value: 'EXPIRED' },
  { label: $t('operations.domain.status.expiringSoon'), value: 'EXPIRING_SOON' },
  { label: $t('operations.domain.status.verificationPending'), value: 'VERIFICATION_PENDING' },
  { label: $t('operations.domain.status.disabled'), value: 'DISABLED' },
];

// Table Columns (computed to react to expandedRows changes)
const columns = computed<DataTableColumn<Domain>[]>(() => [
  {
    type: 'selection' as const,
  },
  {
    title: $t('operations.domain.column.cdnNodeName'),
    key: 'cdnProvider',
    width: 130,
    render(row: Domain) {
      const colorMap: Record<string, string> = {
        CLOUDFLARE: 'info',
        AWS: 'warning',
        TENCENT_CLOUD: 'success',
        ALIYUN: 'error',
        HUAWEI_CLOUD: 'default',
      };
      return h(
        NTag,
        { type: colorMap[row.cdnProvider] as any, size: 'small' },
        () => row.cdnProvider,
      );
    },
  },
  {
    title: $t('operations.domain.column.mainDomain'),
    key: 'domainName',
    width: 220,
    render(row: Domain) {
      const count = subdomainCounts.value[row.id] || 0;
      return h(
        'div',
        {
          style:
            'display: flex; align-items: center; gap: 8px; cursor: pointer;',
          onClick: () => handleShowSubdomains(row),
        },
        [
          h('span', {}, `${row.domainName}(${count})`),
          h(
            NButton,
            {
              text: true,
              size: 'tiny',
              type: 'info',
              onClick: (e: Event) => {
                e.stopPropagation();
                handleShowSubdomains(row);
              },
            },
            {
              default: () =>
                h(
                  'span',
                  {
                    style: 'font-size: 16px;',
                  },
                  '',
                ),
            },
          ),
        ],
      );
    },
  },
  {
    title: $t('operations.domain.column.verificationMethod'),
    key: 'verificationMethod',
    width: 280,
    render(row: Domain) {
      const methodMap: Record<string, string> = {
        DNS_VALIDATION: $t('operations.domain.verification.dns'),
        WHEN_DNS_COMPLETED: $t('operations.domain.verification.whenDnsCompleted'),
        HTTP_VALIDATION: $t('operations.domain.verification.http'),
        EMAIL_VALIDATION: $t('operations.domain.verification.email'),
      };

      const nameservers = Array.isArray(row.nameservers) ? row.nameservers : [];
      const hasNameservers = nameservers.length > 0;
      const isExpanded = expandedRows.value[row.id] || false;

      return h(
        'div',
        { style: 'display: flex; flex-direction: column; gap: 4px;' },
        [
          h('div', { style: 'display: flex; align-items: center; gap: 8px;' }, [
            h(
              'span',
              {},
              methodMap[row.verificationMethod] || row.verificationMethod,
            ),
            hasNameservers &&
              h(
                NButton,
                {
                  text: true,
                  size: 'tiny',
                  type: 'primary',
                  onClick: () => {
                    expandedRows.value[row.id] = !expandedRows.value[row.id];
                  },
                },
                { default: () => (isExpanded ? $t('operations.domain.action.collapse') : $t('operations.domain.action.expand')) },
              ),
          ]),
          isExpanded &&
            hasNameservers &&
            h(
              'div',
              {
                style:
                  'padding: 8px; background: #f5f7fa; border-radius: 4px; font-size: 12px;',
              },
              nameservers.map((ns: string, index: number) =>
                h(
                  'div',
                  {
                    key: index,
                    style:
                      'display: flex; align-items: center; gap: 4px; margin-bottom: 4px;',
                  },
                  [
                    h('span', { style: 'color: #666;' }, `ns${index + 1}:`),
                    h(
                      'span',
                      { style: 'color: #18a058; font-family: monospace;' },
                      ns,
                    ),
                    h(
                      NButton,
                      {
                        text: true,
                        size: 'tiny',
                        onClick: () => {
                          navigator.clipboard.writeText(ns);
                          message.success($t('operations.domain.message.copied'));
                        },
                      },
                      { default: () => '' },
                    ),
                  ],
                ),
              ),
            ),
        ],
      );
    },
  },
  {
    title: $t('operations.domain.column.mainDomainStatus'),
    key: 'status',
    width: 160,
    render(row: Domain) {
      const statusMap: Record<string, { type: string; text: string }> = {
        NORMAL: { type: 'success', text: $t('operations.domain.status.normal') },
        VERIFICATION_PENDING: { type: 'warning', text: $t('operations.domain.status.verificationPending') },
        DISABLED: { type: 'error', text: $t('operations.domain.status.disabled') },
        EXPIRED: { type: 'default', text: $t('operations.domain.status.expired') },
      };
      const status = statusMap[row.status] ||
        statusMap.NORMAL || { type: 'success', text: $t('operations.domain.status.normal') };

      // Show verification button for pending domains
      if (row.status === 'VERIFICATION_PENDING') {
        // Check if domain is in cooldown period (10 minutes = 600 seconds)
        const lastCheck = (row as any).lastVerificationCheck;
        const isInCooldown = lastCheck
          ? (Date.now() - new Date(lastCheck).getTime()) / 1000 < 600
          : false;

        // If currently verifying, show "验证中..."
        if (isVerifying.value[row.id]) {
          return h(
            'div',
            { style: 'display: flex; align-items: center; gap: 8px;' },
            [
              h(
                NTag,
                { type: status.type as any, size: 'small' },
                () => status.text,
              ),
              h(
                'span',
                { style: 'color: #999; font-size: 12px;' },
                $t('operations.domain.action.verifying'),
              ),
            ],
          );
        }

        // If in cooldown, hide the button completely
        if (isInCooldown) {
          return h(
            NTag,
            { type: status.type as any, size: 'small' },
            () => status.text,
          );
        }

        // Show verification button if not in cooldown
        return h(
          'div',
          { style: 'display: flex; align-items: center; gap: 8px;' },
          [
            h(
              NTag,
              { type: status.type as any, size: 'small' },
              () => status.text,
            ),
            h(
              NButton,
              {
                text: true,
                size: 'tiny',
                type: 'info',
                onClick: () => handleVerifyDomain(row),
              },
              {
                default: () => $t('operations.domain.action.verifyClick'),
              },
            ),
          ],
        );
      }

      return h(
        NTag,
        { type: status.type as any, size: 'small' },
        () => status.text,
      );
    },
  },
  {
    title: $t('operations.domain.column.domainExpiry'),
    key: 'expiryDate',
    width: 140,
    render(row: Domain) {
      return row.expiryDate
        ? new Date(row.expiryDate).toLocaleDateString('zh-CN')
        : '-';
    },
  },
  {
    title: $t('operations.domain.column.certExpiry'),
    key: 'certificateExpiryDate',
    width: 140,
    render(row: Domain) {
      return row.certificateExpiryDate
        ? new Date(row.certificateExpiryDate).toLocaleDateString('zh-CN')
        : '-';
    },
  },
  {
    title: $t('operations.domain.column.usageScenario'),
    key: 'usageScenario',
    width: 120,
    render(row: Domain) {
      return row.usageScenario || $t('operations.domain.status.all');
    },
  },
  {
    title: $t('common.remark'),
    key: 'remark',
    width: 200,
    ellipsis: { tooltip: true },
    render(row: Domain) {
      return row.remark || '-';
    },
  },
  {
    title: $t('common.operator'),
    key: 'operatedBy',
    width: 100,
    render(row: any) {
      return row.operatedBy || '-';
    },
  },
  {
    title: $t('common.actions'),
    key: 'actions',
    width: 300,
    fixed: 'right' as const,
    render(row: Domain) {
      const isDisabled = (row.status || 'NORMAL') === 'DISABLED';
      return h('div', { style: 'display: flex; gap: 4px; flex-wrap: wrap;' }, [
        h(
          NButton,
          {
            size: 'small',
            onClick: () => handleSwitchCDN(row),
          },
          () => $t('operations.domain.action.switchNode'),
        ),
        h(
          NButton,
          {
            size: 'small',
            onClick: () => handleBindAgent(row),
          },
          () => $t('operations.domain.action.bindAgent'),
        ),
        h(
          NButton,
          {
            size: 'small',
            type: isDisabled ? 'success' : 'warning',
            onClick: () => handleToggleStatus(row),
          },
          () => (isDisabled ? $t('common.enable') : $t('common.disable')),
        ),
        h(
          NButton,
          {
            size: 'small',
            onClick: () => handleClearCache(row),
          },
          () => $t('operations.domain.action.clearCache'),
        ),
        h(
          NPopconfirm,
          {
            onPositiveClick: () => handleDelete(row.id),
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
                  $t('operations.domain.modal.confirmDeleteDomain'),
                ),
                h('div', { style: 'color: #666;' }, `$t('operations.domain.column.domain') + ': ' + row.domainName`),
                h(
                  'div',
                  {
                    style: 'color: #ff4d4f; margin-top: 8px; font-size: 13px;',
                  },
                  $t('operations.domain.modal.deleteIrreversible'),
                ),
              ]),
            trigger: () =>
              h(
                NButton,
                {
                  size: 'small',
                  type: 'error',
                },
                () => $t('common.delete'),
              ),
          },
        ),
      ]);
    },
  },
]);

// Subdomain Columns
const subdomainColumns: DataTableColumn<Domain>[] = [
  {
    title: $t('operations.domain.column.subdomain'),
    key: 'domainName',
    width: 250,
    ellipsis: { tooltip: true },
  },
  {
    title: $t('operations.domain.column.cdnNodeName'),
    key: 'cdnProvider',
    width: 150,
    render(row: Domain) {
      const colorMap: Record<string, string> = {
        CLOUDFLARE: 'info',
        AWS: 'warning',
        TENCENT_CLOUD: 'success',
        ALIYUN: 'error',
        HUAWEI_CLOUD: 'default',
      };
      return h(
        NTag,
        { type: colorMap[row.cdnProvider] as any, size: 'small' },
        () => row.cdnProvider,
      );
    },
  },
  {
    title: $t('operations.domain.column.domainPurpose'),
    key: 'useType',
    width: 150,
    render(row: Domain) {
      const useTypeMap: Record<string, string> = {
        WEB_HALL: $t('operations.domain.useType.webHall'),
        APP_HALL: $t('operations.domain.useType.appHall'),
        DOWNLOAD_SITE: $t('operations.domain.useType.downloadSite'),
        BACKEND_API: $t('operations.domain.useType.backendApi'),
        OSS_ACCELERATION: $t('operations.domain.useType.ossAcceleration'),
        TRANSFER_PAGE: $t('operations.domain.useType.transferPage'),
        APP_UPDATE: $t('operations.domain.useType.appUpdate'),
      };
      return useTypeMap[row.useType || ''] || row.useType || '-';
    },
  },
  {
    title: $t('operations.domain.column.usageStatus'),
    key: 'status',
    width: 120,
    render(row: Domain) {
      const isDisabled = row.status === 'DISABLED';
      return h(
        NTag,
        {
          type: isDisabled ? 'error' : 'success',
          size: 'small',
        },
        () => (isDisabled ? $t('operations.messageSettings.option.statusDisabled') : $t('operations.domain.status.enabledSuccess')),
      );
    },
  },
];

// Methods
const fetchDomains = async () => {
  loading.value = true;
  try {
    const params: any = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      isParentDomain: true, // ⭐ Only show parent domains in 域名管理 tab
    };

    if (filters.value.cdnProvider)
      params.cdnProvider = filters.value.cdnProvider;
    if (filters.value.status) params.status = filters.value.status;
    if (filters.value.search) params.search = filters.value.search;

    if (props.initialFilter?.useType)
      params.useType = props.initialFilter.useType;
    if (props.initialFilter?.cdnProvider)
      params.cdnProvider = props.initialFilter.cdnProvider;
    if (props.initialFilter?.status) params.status = props.initialFilter.status;

    const response: any = await domainApi.getDomains(params);
    // Response interceptor unwraps the data, so response is already the data part
    const responseData = response.data?.data || response;

    domains.value = responseData.list || responseData.domains || [];
    pagination.itemCount =
      responseData.pagination?.total || responseData.total || 0;
    paginationConfig.itemCount =
      responseData.pagination?.total || responseData.total || 0;

    updateStats();

    // Fetch subdomain counts for each parent domain
    fetchSubdomainCounts();
  } catch (error: any) {
    message.error($t('operations.domain.message.fetchListFailed'));
    console.error('Fetch domains error:', error);
    console.error('Error response:', error.response?.data);
  } finally {
    loading.value = false;
  }
};

const updateStats = () => {
  stats.value = {
    total: domains.value.length,
    cloudflare: domains.value.filter(
      (d: Domain) => d.cdnProvider === 'CLOUDFLARE',
    ).length,
    aws: domains.value.filter((d: Domain) => d.cdnProvider === 'AWS').length,
    verified: domains.value.filter((d: Domain) => d.verificationStatus).length,
  };
};

// Fetch subdomain counts for all parent domains
const fetchSubdomainCounts = async () => {
  try {
    // Fetch counts for all parent domains in parallel
    const countPromises = domains.value.map(async (domain) => {
      try {
        const response: any = await domainApi.getDomains({
          parentId: domain.id,
          isParentDomain: false,
          pageSize: 1, // Just need count, not actual data
        });
        const responseData = response.data?.data || response;
        return {
          domainId: domain.id,
          count: responseData.pagination?.total || responseData.total || 0,
        };
      } catch (error) {
        return {
          domainId: domain.id,
          count: 0,
        };
      }
    });

    const counts = await Promise.all(countPromises);
    counts.forEach(({ domainId, count }) => {
      subdomainCounts.value[domainId] = count;
    });
  } catch (error) {
    console.error('Failed to fetch subdomain counts:', error);
  }
};

// Show subdomain modal
const handleShowSubdomains = async (domain: Domain) => {
  selectedDomain.value = domain;
  showSubdomainModal.value = true;
  subdomainLoading.value = true;

  try {
    const response: any = await domainApi.getDomains({
      parentId: domain.id,
      isParentDomain: false,
      pageSize: 100, // Get all subdomains
    });
    const responseData = response.data?.data || response;
    subdomains.value = responseData.list || responseData.domains || [];
  } catch (error: any) {
    message.error($t('operations.domain.message.fetchSubdomainsFailed'));
    console.error('Fetch subdomains error:', error);
  } finally {
    subdomainLoading.value = false;
  }
};

const resetFilters = () => {
  filters.value = {
    cdnProvider: null,
    status: null,
    search: '',
  };
  pagination.page = 1;
  fetchDomains();
};

const handleCheck = (keys: (string | number)[]) => {
  selectedRowKeys.value = keys as number[];
};

const handleCreateSuccess = () => {
  message.success($t('operations.domain.message.createSuccess'));
  fetchDomains();
};

const handleDelete = async (id: number) => {
  try {
    await domainApi.deleteDomain(id);
    message.success($t('common.deleteSuccess'));
    fetchDomains();
  } catch (error) {
    message.error($t('operations.domain.message.deleteFailed'));
  }
};

const handleBulkDelete = () => {
  if (selectedRowKeys.value.length === 0) {
    message.warning($t('operations.domain.message.selectDomainsToDelete'));
    return;
  }
  message.info($t('operations.domain.message.bulkDeleteDeveloping'));
};

// Switch CDN
const handleSwitchCDN = (row: Domain) => {
  selectedDomain.value = row;
  targetCDN.value = '';
  showSwitchCDNModal.value = true;
};

const confirmSwitchCDN = async () => {
  if (!selectedDomain.value || !targetCDN.value) {
    message.warning($t('operations.domain.message.selectTargetCdn'));
    return;
  }

  loading.value = true;
  try {
    await domainApi.switchCDN(selectedDomain.value.id, {
      targetProvider: targetCDN.value,
      migrateData: false,
      updateDNS: true,
    });
    message.success($t('operations.domain.message.cdnSwitchSuccess'));
    showSwitchCDNModal.value = false;
    fetchDomains();
  } catch (error: any) {
    message.error(error.response?.data?.message || $t('operations.domain.message.cdnSwitchFailed'));
  } finally {
    loading.value = false;
  }
};

// Bind Agent
const handleBindAgent = (row: Domain) => {
  selectedDomain.value = row;
  agentId.value = row.boundAgentId || '';
  showBindAgentModal.value = true;
};

const confirmBindAgent = async () => {
  if (!selectedDomain.value) {
    return;
  }

  loading.value = true;
  try {
    await domainApi.updateDomain(selectedDomain.value.id, {
      boundAgentId: agentId.value || null,
    } as any);
    message.success(agentId.value ? $t('operations.domain.message.agentBindSuccess') : $t('operations.domain.message.agentUnbindSuccess'));
    showBindAgentModal.value = false;
    fetchDomains();
  } catch (error: any) {
    message.error(error.response?.data?.message || $t('operations.domain.message.agentBindFailed'));
  } finally {
    loading.value = false;
  }
};

// Verify Domain
const handleVerifyDomain = async (domain: Domain) => {
  if (isVerifying.value[domain.id]) {
    return; // Prevent double clicks
  }

  isVerifying.value[domain.id] = true;

  try {
    const response: any = await domainApi.verifyDomain(domain.id);
    const result = response.data || response;

    if (result.code === 0) {
      message.success(result.data.message || $t('operations.domain.message.verifyComplete'));
      // Refresh domains to show updated status
      fetchDomains();
    } else {
      message.warning(result.message || $t('operations.domain.message.verifyFailed'));
    }
  } catch (error: any) {
    if (error.response?.status === 429) {
      // Rate limit error
      message.warning(error.response?.data?.message || $t('operations.domain.message.tryAgainLater'));
    } else {
      message.error(error.response?.data?.message || $t('operations.domain.message.verifyFailed'));
    }
  } finally {
    isVerifying.value[domain.id] = false;
  }
};

// Toggle Enable/Disable
const handleToggleStatus = async (row: Domain) => {
  const newStatus = row.status === 'DISABLED' ? 'NORMAL' : 'DISABLED';
  const action = newStatus === 'DISABLED' ? $t('common.disable') : $t('common.enable');

  loading.value = true;
  try {
    await domainApi.updateDomain(row.id, {
      status: newStatus,
    } as any);
    message.success($t('operations.domain.message.domainEnableSuccess'));
    fetchDomains();
  } catch (error: any) {
    message.error(error.response?.data?.message || $t('operations.domain.message.operationFailed'));
  } finally {
    loading.value = false;
  }
};

// Clear Cache
const handleClearCache = async (row: Domain) => {
  loading.value = true;
  try {
    await domainApi.clearCache(row.id);
    message.success($t('operations.domain.message.cacheClearSuccess'));
  } catch (error: any) {
    message.error(error.response?.data?.message || $t('operations.domain.message.cacheClearFailed'));
  } finally {
    loading.value = false;
  }
};

// Lifecycle
onMounted(() => {
  fetchDomains();
});
</script>

<style scoped lang="scss">
.all-domains-view {
  :deep(.n-card) {
    border-radius: 4px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
  }

  :deep(.n-statistic) {
    .n-statistic-value {
      font-size: 24px;
      font-weight: 600;
      color: #333;
    }
  }

  :deep(.n-data-table) {
    .n-data-table-th {
      font-weight: 600;
      background: #fafafa;
      font-size: 13px;
    }

    .n-data-table-td {
      font-size: 13px;
    }
  }

  :deep(.n-space) {
    flex-wrap: wrap;
  }
}
</style>
