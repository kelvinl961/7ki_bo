<template>
  <div class="download-site-view">
    <!-- Filters -->
    <n-card size="small" style="margin-bottom: 16px">
      <n-space :size="12" align="center">
        <n-input
          v-model:value="filters.search"
          :placeholder="$t('operations.domain.filter.domainInput')"
          clearable
          style="width: 200px"
          size="small"
          @keyup.enter="fetchDomains"
        />

        <n-select
          v-model:value="filters.cdnProvider"
          :placeholder="$t('operations.domain.filter.allCdnNodes')"
          clearable
          style="width: 150px"
          size="small"
          :options="cdnFilterOptions"
          @update:value="fetchDomains"
        />

        <n-select
          v-model:value="filters.status"
          :placeholder="$t('operations.domain.filter.allStatus')"
          clearable
          style="width: 130px"
          size="small"
          :options="statusFilterOptions"
          @update:value="fetchDomains"
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
          <n-button size="small" @click="fetchDomains"> {{ $t('common.refresh') }} </n-button>
          <n-select
            v-model:value="selectedBatchAction"
            :placeholder="$t('common.batchOperation')"
            style="width: 140px"
            size="small"
            :options="batchActionOptions"
            :disabled="!selectedRowKeys.length"
          />
          <n-button
            type="primary"
            size="small"
            :disabled="!selectedRowKeys.length || !selectedBatchAction"
            @click="handleBatchAction"
          >{{ $t('operations.healthCheck.execute') }}</n-button>
        </n-space>
        <n-space align="center" :size="16">
          <span style="font-size: 13px; color: #666">
            {{ $t('operations.domain.selectedCount', [selectedRowKeys.length]) }}
          </span>
          <span style="font-size: 13px; color: #666">{{ $t('operations.domain.modal.recordsCount', [pagination.itemCount || 0]) }}</span>
        </n-space>
      </n-space>
    </n-card>

    <!-- Data Table -->
    <n-card size="small">
      <n-data-table
        v-model:checked-row-keys="selectedRowKeys"
        :columns="columns"
        :data="domains"
        :loading="loading"
        :pagination="paginationConfig"
        :row-key="(row: Domain) => row.id"
        :scroll-x="2000"
        size="small"
      />
    </n-card>

    <!-- Create Domain Modal -->
    <BackendApiCreateModal
      v-model:show="showCreateModal"
      use-type="DOWNLOAD_SITE"
      :use-type-label="$t('operations.domain.useType.downloadSite')"
      :modal-title="$t('operations.domain.createDownloadSubdomain')"
      @success="handleCreateSuccess"
    />

    <!-- Switch CDN Modal -->
    <n-modal
      v-model:show="showSwitchCDNModal"
      preset="dialog"
      :title="$t('operations.domain.modal.switchNodeTitle')"
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
              cdnOptions.filter((o) => o.value !== selectedDomain?.cdnProvider)
            "
            :placeholder="$t('operations.domain.modal.selectTargetCdn')"
          />
        </div>
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
          <div style="margin-bottom: 8px; font-weight: 500">{{ $t('operations.domain.column.domain') }}</div>
          <div style="color: #666">{{ selectedDomain?.domainName }}</div>
        </div>
        <div>
          <div style="margin-bottom: 8px; font-weight: 500">
            {{ $t('operations.domain.modal.agentAccount') }} <span style="color: red">*</span>
          </div>
          <n-input v-model:value="agentId" :placeholder="$t('operations.domain.modal.agentAccountPlaceholder')" />
        </div>
        <n-alert type="info" size="small">
          {{ $t('operations.domain.modal.bindAgentHint2') }}: APP > {{ $t('operations.domain.modal.bindAgentPriority2') }} > {{ $t('operations.domain.modal.bindAgentPriority3') }}
        </n-alert>
      </n-space>
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
  NTag,
  NModal,
  NSwitch,
  NPopconfirm,
  NAlert,
  useMessage,
  type DataTableColumn,
} from 'naive-ui';
import { domainApi } from '../api/domainApi';
// ✅ PERFORMANCE FIX: Lazy load modal components - they only load when modals are opened
import { defineAsyncComponent } from 'vue';
const BackendApiCreateModal = defineAsyncComponent(
  () => import('../components/BackendApiCreateModal.vue'),
);

const message = useMessage();

interface Domain {
  id: number;
  domainName: string;
  cdnProvider: string;
  cdnPlatformName?: string;
  status: string;
  useType?: string;
  portType?: string;
  customPort?: number;
  sslEnabled: boolean;
  verificationStatus: boolean;
  isPromotionDomain?: boolean;
  boundAgentId?: string;
  remark?: string;
  createdAt: string;
  updatedAt: string;
  operatedBy?: string;
}

// State
const loading = ref(false);
const domains = ref<Domain[]>([]);
const selectedRowKeys = ref<number[]>([]);
const showCreateModal = ref(false);
const showSwitchCDNModal = ref(false);
const showBindAgentModal = ref(false);
const selectedDomain = ref<Domain | null>(null);
const targetCDN = ref('');
const agentId = ref('');
const selectedBatchAction = ref('');

// Filters
const filters = reactive({
  search: '',
  cdnProvider: '',
  status: '',
  useType: 'DOWNLOAD_SITE',
});

// Pagination
const pagination = reactive({
  page: 1,
  pageSize: 20,
  itemCount: 0,
  showSizePicker: true,
  pageSizes: [10, 20, 50, 100],
});

const paginationConfig = computed(() => ({
  page: pagination.page,
  pageSize: pagination.pageSize,
  itemCount: pagination.itemCount,
  showSizePicker: true,
  pageSizes: pagination.pageSizes,
  prefix: ({ itemCount }: { itemCount: number }) => $t('operations.domain.modal.recordsCount', [itemCount]),
  onChange: (page: number) => {
    pagination.page = page;
    fetchDomains();
  },
  onUpdatePageSize: (pageSize: number) => {
    pagination.pageSize = pageSize;
    pagination.page = 1;
    fetchDomains();
  },
}));

// CDN Options
const cdnOptions = [
  { label: 'Cloudflare', value: 'CLOUDFLARE' },
  { label: 'AWS', value: 'AWS' },
  { label: $t('operations.domain.cdn.huawei'), value: 'HUAWEI_CLOUD' },
  { label: $t('operations.certificate.providerAliyun'), value: 'ALIYUN' },
  { label: $t('operations.certificate.providerTencent'), value: 'TENCENT_CLOUD' },
  { label: 'A8', value: 'A8' },
  { label: 'Wangsu', value: 'WANGSU' },
  { label: 'Funnull', value: 'FUNNULL' },
  { label: 'Yundun', value: 'YUNDUN' },
  { label: 'SuperEdge', value: 'SUPEREDGE' },
];

const cdnFilterOptions = [{ label: $t('operations.domain.status.all'), value: '' }, ...cdnOptions];

const statusFilterOptions = [
  { label: $t('operations.domain.status.all'), value: '' },
  { label: $t('operations.domain.status.enabledSuccess'), value: 'NORMAL' },
  { label: $t('operations.domain.status.pendingEnable'), value: 'DISABLED' },
  { label: $t('operations.domain.status.expired'), value: 'EXPIRED' },
];

const batchActionOptions = [
  { label: $t('common.batchOperation'), value: '', disabled: true },
  { label: $t('common.enable'), value: 'enable' },
  { label: $t('common.disable'), value: 'disable' },
  { label: $t('common.delete'), value: 'delete' },
];

// Table Columns
const columns: DataTableColumn<Domain>[] = [
  { type: 'selection' as const, width: 50 },
  {
    title: $t('operations.domain.column.cdnPlatformName'),
    key: 'cdnProvider',
    width: 120,
    render(row: Domain) {
      const colorMap: Record<string, any> = {
        CLOUDFLARE: 'info',
        AWS: 'warning',
        HUAWEI_CLOUD: 'error',
        ALIYUN: 'success',
        TENCENT_CLOUD: 'default',
      };
      return h(
        NTag,
        {
          type: colorMap[row.cdnProvider] as any,
          size: 'small',
        },
        {
          default: () => row.cdnPlatformName || row.cdnProvider,
        },
      );
    },
  },
  {
    title: $t('operations.domain.column.effectiveDomain'),
    key: 'domainName',
    width: 220,
    ellipsis: { tooltip: true },
    render(row: Domain) {
      return h(
        'div',
        { style: 'display: flex; align-items: center; gap: 6px;' },
        [
          h('div', { style: 'display: flex; flex-direction: column;' }, [
            h('span', {}, row.domainName),
            h(
              'span',
              {
                style: 'font-size: 11px; color: #18a058; cursor: pointer;',
                onClick: () => {
                  navigator.clipboard.writeText(row.domainName);
                  message.success($t('operations.domain.message.copied'));
                },
              },
              $t('operations.domain.column.resolved'),
            ),
          ]),
        ],
      );
    },
  },
  {
    title: $t('operations.domain.column.portType'),
    key: 'portType',
    width: 100,
    render(row: Domain) {
      const portTypeMap: Record<string, string> = {
        DEFAULT: $t('operations.domain.status.defaultPort'),
        FIXED: $t('operations.domain.status.fixed'),
      };
      return portTypeMap[row.portType || 'DEFAULT'] || $t('operations.domain.status.defaultPort');
    },
  },
  {
    title: $t('operations.domain.column.port'),
    key: 'customPort',
    width: 80,
    render(row: Domain) {
      return row.customPort || '443';
    },
  },
  {
    title: h('div', { style: 'white-space: nowrap;' }, [
      h('div', {}, $t('operations.domain.column.dnsNote')),
      h(
        'div',
        { style: 'font-size: 11px; font-weight: normal; color: #999;' },
        $t('operations.domain.column.dnsNoteHint'),
      ),
    ]) as any,
    key: 'dnsStatus',
    width: 150,
    render(row: Domain) {
      return h(
        'div',
        { style: 'display: flex; align-items: center; gap: 6px;' },
        [
          h(
            NTag,
            {
              type: row.verificationStatus ? 'success' : 'warning',
              size: 'small',
            },
            {
              default: () => (row.verificationStatus ? $t('operations.domain.status.effective') : $t('operations.domain.status.verificationPending')),
            },
          ),
          h(
            NButton,
            {
              size: 'tiny',
              text: true,
              style: 'color: #18a058;',
              onClick: () => fetchDomains(),
            },
            { default: () => '↻' },
          ),
        ],
      );
    },
  },
  {
    title: h('div', { style: 'white-space: nowrap; text-align: center;' }, [
      h('div', {}, $t('operations.domain.column.otherOrg')),
      h('div', {}, ''),
    ]) as any,
    key: 'isPromotionDomain',
    width: 120,
    align: 'center' as const,
    render(row: Domain) {
      return h(NSwitch, {
        value: row.isPromotionDomain || false,
        size: 'small',
        onUpdateValue: (value: boolean) => handleTogglePromotion(row, value),
      });
    },
  },
  {
    title: h('div', { style: 'white-space: nowrap; text-align: center;' }, [
      h('div', {}, $t('operations.domain.column.forceBindParent')),
    ]) as any,
    key: 'boundAgent',
    width: 130,
    render(row: Domain) {
      return h(
        'div',
        {
          style:
            'display: flex; align-items: center; gap: 6px; justify-content: center;',
        },
        [
          h(NSwitch, {
            value: !!row.boundAgentId,
            size: 'small',
            onUpdateValue: (value: boolean) => {
              if (value) {
                handleBindAgent(row);
              } else {
                handleUnbindAgent(row);
              }
            },
          }),
          h(
            'span',
            { style: 'font-size: 12px; color: #999;' },
            row.boundAgentId || $t('operations.domain.status.none'),
          ),
        ],
      );
    },
  },
  {
    title: $t('operations.domain.column.usageStatus'),
    key: 'status',
    width: 100,
    render(row: Domain) {
      const statusMap: Record<string, { text: string; type: any }> = {
        NORMAL: { text: $t('operations.domain.status.enabledSuccess'), type: 'success' },
        DISABLED: { text: $t('operations.domain.status.pendingEnable'), type: 'warning' },
        EXPIRED: { text: $t('operations.domain.status.expired'), type: 'error' },
      };
      const status = statusMap[row.status] || {
        text: row.status,
        type: 'default',
      };
      return h(
        NTag,
        { type: status.type as any, size: 'small' },
        { default: () => status.text },
      );
    },
  },
  {
    title: $t('common.remark'),
    key: 'remark',
    width: 120,
    ellipsis: { tooltip: true },
    render(row: Domain) {
      return h(
        'span',
        {
          style: 'color: #18a058; cursor: pointer;',
          onClick: () => {
            // Open edit remark modal
          },
        },
        row.remark || '',
      );
    },
  },
  {
    title: $t('common.actions'),
    key: 'actions',
    width: 280,
    fixed: 'right' as const,
    render(row: Domain) {
      return h('div', { style: 'display: flex; gap: 4px; flex-wrap: wrap;' }, [
        h(
          NButton,
          {
            text: true,
            type: 'primary',
            size: 'small',
            onClick: () => handleSwitchCDN(row),
          },
          { default: () => $t('operations.domain.action.switchNode') },
        ),
        h(
          NButton,
          {
            text: true,
            type: 'primary',
            size: 'small',
            onClick: () => handleBindAgent(row),
          },
          { default: () => (row.boundAgentId ? $t('operations.domain.action.modifyAgent') : $t('operations.domain.action.bindAgent')) },
        ),
        h(
          NButton,
          {
            text: true,
            type: row.status === 'DISABLED' ? 'success' : 'warning',
            size: 'small',
            onClick: () => handleToggleStatus(row),
          },
          { default: () => (row.status === 'DISABLED' ? $t('common.enable') : $t('common.disable')) },
        ),
        h(
          NButton,
          {
            text: true,
            type: 'primary',
            size: 'small',
            onClick: () => handleClearCache(row),
          },
          { default: () => $t('operations.domain.action.clearCache') },
        ),
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
                  '⚠️ ' + $t('operations.domain.modal.confirmDeleteDomain'),
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
                  text: true,
                  type: 'error',
                  size: 'small',
                },
                { default: () => $t('common.delete') },
              ),
          },
        ),
      ]);
    },
  },
  {
    title: $t('common.operator'),
    key: 'operatedBy',
    width: 100,
    render(row: Domain) {
      return row.operatedBy || '-';
    },
  },
  {
    title: $t('common.operationTime'),
    key: 'updatedAt',
    width: 160,
    render(row: Domain) {
      return new Date(row.updatedAt).toLocaleString('zh-CN');
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
      isParentDomain: false, // ⭐ Only show subdomains
    };

    if (filters.search) params.search = filters.search;
    if (filters.cdnProvider) params.cdnProvider = filters.cdnProvider;
    if (filters.status) params.status = filters.status;
    if (filters.useType) params.useType = filters.useType;

    const response: any = await domainApi.getDomains(params);

    // Parse response correctly - handle nested data structure
    const responseData = response.data?.data || response.data || response;

    domains.value = responseData.list || responseData.domains || [];
    pagination.itemCount =
      responseData.pagination?.total || responseData.total || 0;
  } catch (error: any) {
    console.error('Fetch domains error:', error);
    message.error(
      error.response?.data?.message || error.message || $t('operations.domain.message.fetchListFailed'),
    );
  } finally {
    loading.value = false;
  }
};

const resetFilters = () => {
  filters.search = '';
  filters.cdnProvider = '';
  filters.status = '';
  pagination.page = 1;
  fetchDomains();
};

const handleCreateSuccess = () => {
  message.success($t('operations.domain.message.createSuccess'));
  fetchDomains();
};

const handleSwitchCDN = (domain: Domain) => {
  selectedDomain.value = domain;
  targetCDN.value = '';
  showSwitchCDNModal.value = true;
};

const confirmSwitchCDN = async () => {
  if (!targetCDN.value) {
    message.warning($t('operations.domain.message.selectTargetCdn'));
    return false;
  }

  try {
    const response = await domainApi.switchCDN(selectedDomain.value!.id, {
      targetProvider: targetCDN.value,
      migrateData: true,
      updateDNS: true,
    });

    if (response.code === 0) {
      message.success($t('operations.domain.message.cdnChangeSuccess'));
      fetchDomains();
      return true;
    } else {
      message.error(response.message || $t('operations.domain.message.cdnChangeFailed'));
      return false;
    }
  } catch (error: any) {
    console.error('Switch CDN error:', error);
    message.error(error.response?.data?.message || $t('operations.domain.message.cdnChangeFailed'));
    return false;
  }
};

const handleBindAgent = (domain: Domain) => {
  selectedDomain.value = domain;
  agentId.value = domain.boundAgentId || '';
  showBindAgentModal.value = true;
};

const confirmBindAgent = async () => {
  if (!agentId.value) {
    message.warning($t('operations.domain.message.enterAgentAccount'));
    return false;
  }

  try {
    const response = await domainApi.bindAgent(selectedDomain.value!.id, {
      agentId: agentId.value,
      operatedBy: 'admin',
    });

    if (response.code === 0) {
      message.success($t('operations.domain.message.agentBindSuccess'));
      fetchDomains();
      return true;
    } else {
      message.error(response.message || $t('operations.domain.message.agentBindFailed'));
      return false;
    }
  } catch (error: any) {
    console.error('Bind agent error:', error);
    message.error(error.response?.data?.message || $t('operations.domain.message.agentBindFailed'));
    return false;
  }
};

const handleUnbindAgent = async (domain: Domain) => {
  try {
    const response = await domainApi.unbindAgent(domain.id, {
      operatedBy: 'admin',
    });

    if (response.code === 0) {
      message.success($t('operations.domain.message.agentUnbindSuccess'));
      fetchDomains();
    } else {
      message.error(response.message || $t('operations.domain.message.agentUnbindFailed'));
    }
  } catch (error: any) {
    console.error('Unbind agent error:', error);
    message.error(error.response?.data?.message || $t('operations.domain.message.agentUnbindFailed'));
  }
};

const handleTogglePromotion = async (domain: Domain, value: boolean) => {
  try {
    const response = await domainApi.updateDomain(domain.id, {
      isPromotionDomain: value,
    });

    if (response.code === 0) {
      message.success(value ? $t('operations.domain.message.addedToOtherOrg') : $t('operations.domain.message.removedFromOtherOrg'));
      fetchDomains();
    } else {
      message.error(response.message || $t('operations.domain.message.operationFailed'));
    }
  } catch (error: any) {
    console.error('Toggle promotion error:', error);
    message.error(error.response?.data?.message || $t('operations.domain.message.operationFailed'));
  }
};

const handleToggleStatus = async (domain: Domain) => {
  try {
    const response = await domainApi.toggleDomainStatus(domain.id, {
      operatedBy: 'admin',
    });

    if (response.code === 0) {
      message.success(
        domain.status === 'DISABLED' ? $t('operations.domain.message.domainEnableSuccess') : $t('operations.domain.message.domainDisableSuccess'),
      );
      fetchDomains();
    } else {
      message.error(response.message || $t('operations.domain.message.operationFailed'));
    }
  } catch (error: any) {
    console.error('Toggle status error:', error);
    message.error(error.response?.data?.message || $t('operations.domain.message.operationFailed'));
  }
};

const handleClearCache = async (domain: Domain) => {
  try {
    const response = await domainApi.clearCache(domain.id);

    if (response.code === 0) {
      message.success($t('operations.domain.message.cacheClearSuccess'));
    } else {
      message.error(response.message || $t('operations.domain.message.cacheClearFailed'));
    }
  } catch (error: any) {
    console.error('Clear cache error:', error);
    message.error(error.response?.data?.message || $t('operations.domain.message.cacheClearFailed'));
  }
};

const handleDelete = async (domain: Domain) => {
  try {
    const response = await domainApi.deleteDomain(domain.id);

    if (response.code === 0) {
      message.success($t('operations.domain.message.domainDeleteSuccess'));
      fetchDomains();
    } else {
      message.error(response.message || $t('operations.domain.message.domainDeleteFailed'));
    }
  } catch (error: any) {
    console.error('Delete domain error:', error);
    message.error(error.response?.data?.message || $t('operations.domain.message.domainDeleteFailed'));
  }
};

const handleBatchAction = async () => {
  if (!selectedBatchAction.value || !selectedRowKeys.value.length) {
    return;
  }

  const actionMap: Record<string, string> = {
    enable: $t('common.enable'), disable: $t('common.disable'), delete: $t('common.delete'),
  };

  const actionText = actionMap[selectedBatchAction.value];

  try {
    if (selectedBatchAction.value === 'delete') {
      const response = await domainApi.bulkDeleteDomains(selectedRowKeys.value);
      if (response.code === 0) {
        message.success($t('operations.domain.message.bulkActionSuccess', [actionText]));
        selectedRowKeys.value = [];
        selectedBatchAction.value = '';
        fetchDomains();
      } else {
        message.error(response.message || $t('operations.domain.message.bulkActionFailed', [actionText]));
      }
    } else {
      // Handle enable/disable batch actions
      message.info($t('operations.domain.message.bulkActionDeveloping', [actionText]));
    }
  } catch (error: any) {
    console.error('Batch action error:', error);
    message.error(error.response?.data?.message || $t('operations.domain.message.bulkActionFailed', [actionText]));
  }
};

onMounted(() => {
  fetchDomains();
});
</script>

<style scoped lang="scss">
.download-site-view {
  padding: 0;
}

:deep(.n-data-table) {
  .n-data-table-th {
    font-weight: 600;
  }
}
</style>
