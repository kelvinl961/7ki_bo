<template>
  <div class="web-hall-view">
    <!-- Filters -->
    <n-card size="small" style="margin-bottom: 16px">
      <n-space :size="12" align="center">
        <n-input
          v-model:value="filters.search"
          :placeholder="$t('operations.domain.filter.subdomainSearch')"
          clearable
          style="width: 200px"
          size="small"
          @keyup.enter="fetchDomains"
        />

        <n-select
          v-model:value="filters.useType"
          :placeholder="$t('operations.domain.filter.allUsageStatus')"
          clearable
          style="width: 150px"
          size="small"
          :options="[
            { label: $t('operations.domain.status.all'), value: '' },
            { label: $t('operations.domain.useType.webHall'), value: 'WEB_HALL' },
          ]"
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
        </n-space>
        <n-space align="center" :size="16">
          <div
            style="
              display: flex;
              align-items: center;
              gap: 8px;
              font-size: 13px;
            "
          >
            <span>{{ $t('operations.domain.h5Protection') }}</span>
            <span style="color: #18a058; font-size: 16px">⚫</span>
          </div>
          <span style="font-size: 13px; color: #999"> {{ $t('operations.domain.noAutoCreate') }} </span>
          <span style="font-size: 13px; color: #666">
            {{ $t('operations.domain.recordCount', [pagination.itemCount || 0]) }}
          </span>
        </n-space>
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
        :scroll-x="2500"
        size="small"
      />
    </n-card>

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
      </n-space>
    </n-modal>

    <!-- Create Subdomain Modal -->
    <CreateSubdomainModal
      v-model:show="showCreateModal"
      default-use-type="WEB_HALL"
      :use-type-label="$t('operations.domain.useType.webHall')"
      :modal-title="$t('operations.domain.createWebHallSubdomain')"
      @success="handleCreateSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { $t } from '@vben/locales';

import { ref, h, onMounted, reactive } from 'vue';
import {
  NButton,
  NTag,
  NSpace,
  NCard,
  NInput,
  NSelect,
  NDataTable,
  NModal,
  NPopconfirm,
  useMessage,
  type DataTableColumn,
} from 'naive-ui';
import { domainApi } from '../api/domainApi';
// ✅ PERFORMANCE FIX: Lazy load modal components - they only load when modals are opened
import { defineAsyncComponent } from 'vue';
const CreateSubdomainModal = defineAsyncComponent(
  () => import('../components/CreateSubdomainModal.vue'),
);
import type { Domain } from '../types';

const message = useMessage();

// State
const loading = ref(false);
const domains = ref<Domain[]>([]);
const showCreateModal = ref(false);
const showSwitchCDNModal = ref(false);
const showBindAgentModal = ref(false);
const selectedDomain = ref<Domain | null>(null);
const targetCDN = ref<string>('');
const agentId = ref<string>('');

// Filters
const filters = ref({
  search: '',
  useType: 'WEB_HALL',
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

const cdnOptions = [
  { label: 'Cloudflare', value: 'CLOUDFLARE' },
  { label: 'AWS', value: 'AWS' },
  { label: $t('operations.domain.cdn.huawei'), value: 'HUAWEI_CLOUD' },
  { label: $t('operations.certificate.providerTencent'), value: 'TENCENT_CLOUD' },
  { label: $t('operations.certificate.providerAliyun'), value: 'ALIYUN' },
];

// Web Hall Columns - Based on second screenshot
const columns: DataTableColumn<Domain>[] = [
  {
    title: $t('operations.domain.column.cdnNodeName'),
    key: 'cdnProvider',
    width: 120,
  },
  {
    title: $t('operations.domain.column.effectiveDomain'),
    key: 'domainName',
    width: 180,
    render(row: Domain) {
      return h(
        'div',
        { style: 'display: flex; flex-direction: column; gap: 4px;' },
        [
          h('span', {}, row.domainName),
          h(
            'a',
            {
              style: 'color: #18a058; font-size: 12px; cursor: pointer;',
              onClick: () => {
                navigator.clipboard.writeText(row.domainName);
                message.success($t('operations.domain.message.resolved'));
              },
            },
            $t('operations.domain.column.resolved'),
          ),
        ],
      );
    },
  },
  {
    title: $t('operations.domain.column.portType'),
    key: 'portType',
    width: 100,
    render(row: Domain) {
      return row.portType === 'FIXED' ? $t('operations.domain.status.fixed') : $t('operations.domain.status.defaultPort');
    },
  },
  {
    title: $t('operations.domain.column.port'),
    key: 'port',
    width: 80,
    render(row: Domain) {
      return row.customPort || 443;
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
        { style: 'display: flex; align-items: center; gap: 8px;' },
        [
          h(
            NTag,
            {
              type: row.verificationStatus ? 'success' : 'info',
              size: 'small',
            },
            () => $t('operations.domain.status.effective'),
          ),
          h(
            NButton,
            {
              text: true,
              size: 'tiny',
              onClick: () => fetchDomains(),
            },
            () => '🔄',
          ),
        ],
      );
    },
  },
  {
    title: h('div', { style: 'white-space: nowrap;' }, [
      h('div', {}, $t('operations.domain.column.otherOrg')),
      h(
        'div',
        { style: 'font-size: 11px; font-weight: normal; color: #999;' },
        $t('operations.domain.column.remaining'),
      ),
    ]) as any,
    key: 'otherOrg',
    width: 130,
    render() {
      return h('div', { style: 'text-align: center;' }, [
        h('input', {
          type: 'checkbox',
          style: 'transform: scale(1.2);',
        }),
      ]);
    },
  },
  {
    title: h(
      'div',
      {
        style:
          'display: flex; align-items: center; gap: 4px; white-space: nowrap;',
      },
      [
        h('span', {}, $t('operations.domain.column.promotionDomain')),
        h('span', { style: 'color: #52c41a;' }, '✓'),
      ],
    ) as any,
    key: 'isPromotionDomain',
    width: 130,
    render(row: Domain) {
      return h('div', { style: 'display: flex; justify-content: center;' }, [
        h(
          'div',
          {
            style: `
            width: 44px;
            height: 22px;
            background: ${row.isPromotionDomain ? '#52c41a' : '#d9d9d9'};
            border-radius: 11px;
            position: relative;
            cursor: pointer;
            transition: all 0.3s;
          `,
            onClick: () => handleTogglePromotion(row),
          },
          [
            h('div', {
              style: `
              width: 18px;
              height: 18px;
              background: white;
              border-radius: 50%;
              position: absolute;
              top: 2px;
              ${row.isPromotionDomain ? 'right: 2px;' : 'left: 2px;'}
              transition: all 0.3s;
            `,
            }),
          ],
        ),
      ]);
    },
  },
  {
    title: $t('operations.domain.column.forceBindParent'),
    key: 'boundAgentId',
    width: 120,
    render(row: Domain) {
      return row.boundAgentId || $t('operations.domain.status.none');
    },
  },
  {
    title: $t('operations.domain.column.enabledEntrance'),
    key: 'enabledEntrance',
    width: 120,
    render(row: Domain) {
      const map: Record<string, string> = {
        ALL: $t('operations.domain.entrance.all'),
        APP_ONLY: $t('operations.domain.entrance.appOnly'),
        H5_PWA: $t('operations.domain.entrance.h5Pwa'),
      };
      return h(
        'div',
        { style: 'display: flex; align-items: center; gap: 4px;' },
        [
          h('span', {}, map[row.enabledEntrance] || $t('common.all')),
          h('span', { style: 'font-size: 10px; color: #999;' }, '▼'),
        ],
      );
    },
  },
  {
    title: $t('operations.domain.column.blockedDevice'),
    key: 'blockedDevice',
    width: 120,
    render(row: Domain) {
      const map: Record<string, string> = {
        NONE: $t('operations.domain.device.none'),
        BLOCK_MOBILE: $t('operations.domain.device.blockMobile'),
        BLOCK_PC: $t('operations.domain.device.blockPc'),
      };
      return h(
        'div',
        { style: 'display: flex; align-items: center; gap: 4px;' },
        [
          h('span', {}, map[row.blockedDevice] || $t('operations.domain.device.none')),
          h('span', { style: 'font-size: 10px; color: #999;' }, '▼'),
        ],
      );
    },
  },
  {
    title: $t('operations.domain.column.usageStatus'),
    key: 'status',
    width: 120,
    render(row: Domain) {
      const isEnabled = (row.status || 'NORMAL') !== 'DISABLED';
      return h(
        'div',
        { style: 'display: flex; align-items: center; gap: 8px;' },
        [
          h(
            'div',
            {
              style: `
            width: 44px;
            height: 22px;
            background: ${isEnabled ? '#52c41a' : '#d9d9d9'};
            border-radius: 11px;
            position: relative;
            cursor: pointer;
            transition: all 0.3s;
          `,
              onClick: () => handleToggleStatus(row),
            },
            [
              h('div', {
                style: `
              width: 18px;
              height: 18px;
              background: white;
              border-radius: 50%;
              position: absolute;
              top: 2px;
              ${isEnabled ? 'right: 2px;' : 'left: 2px;'}
              transition: all 0.3s;
            `,
              }),
            ],
          ),
        ],
      );
    },
  },
  {
    title: $t('common.remark'),
    key: 'remark',
    width: 150,
    ellipsis: { tooltip: true },
    render(row: Domain) {
      return row.remark || '';
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
            size: 'small',
            onClick: () => handleSwitchCDN(row),
          },
          { default: () => $t('operations.domain.action.switchNode') },
        ),
        h(
          NButton,
          {
            size: 'small',
            onClick: () => handleBindAgent(row),
          },
          { default: () => (row.boundAgentId ? $t('operations.domain.action.modifyAgent') : $t('operations.domain.action.bindAgent')) },
        ),
        h(
          NPopconfirm,
          {
            onPositiveClick: () => handleToggleStatus(row),
            positiveText: $t('common.confirm'),
            negativeText: $t('common.cancel'),
            style: { width: '450px' },
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
                  row.status === 'DISABLED' ? $t('operations.domain.modal.confirmEnable') : $t('operations.domain.modal.confirmDisable'),
                ),
                h('div', { style: 'color: #666;' }, `$t('operations.domain.column.domain') + ': ' + row.domainName`),
              ]),
            trigger: () =>
              h(
                NButton,
                {
                  size: 'small',
                  type: row.status === 'DISABLED' ? 'success' : 'warning',
                },
                {
                  default: () => (row.status === 'DISABLED' ? $t('common.enable') : $t('common.disable')),
                },
              ),
          },
        ),
        h(
          NPopconfirm,
          {
            onPositiveClick: () => handleClearCache(row),
            positiveText: $t('operations.domain.modal.confirmClear'),
            negativeText: $t('common.cancel'),
            style: { width: '450px' },
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
                  $t('operations.domain.modal.confirmClearCache'),
                ),
                h('div', { style: 'color: #666;' }, `$t('operations.domain.column.domain') + ': ' + row.domainName`),
                h(
                  'div',
                  {
                    style: 'color: #ff9800; margin-top: 8px; font-size: 13px;',
                  },
                  $t('operations.domain.modal.confirmClearCacheHint'),
                ),
              ]),
            trigger: () =>
              h(
                NButton,
                {
                  size: 'small',
                },
                { default: () => $t('operations.domain.action.clearCache') },
              ),
          },
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
];

// Methods
const fetchDomains = async () => {
  loading.value = true;
  try {
    const params: any = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      useType: filters.value.useType,
      isParentDomain: false, // ⭐ Only show subdomains in Web大厅 tab
    };

    if (filters.value.search) params.search = filters.value.search;

    const response: any = await domainApi.getDomains(params);
    // Response interceptor may unwrap the data, handle both cases
    const responseData = response.data?.data || response.data || response;

    domains.value = responseData.list || responseData.domains || [];
    pagination.itemCount =
      responseData.pagination?.total || responseData.total || 0;
    paginationConfig.itemCount =
      responseData.pagination?.total || responseData.total || 0;
  } catch (error: any) {
    message.error($t('operations.domain.message.fetchListFailed'));
  } finally {
    loading.value = false;
  }
};

const resetFilters = () => {
  filters.value = {
    search: '',
    useType: 'WEB_HALL',
  };
  pagination.page = 1;
  fetchDomains();
};

const handleCreateSuccess = () => {
  message.success($t('operations.domain.message.createSuccess'));
  fetchDomains();
};

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
    message.error($t('operations.domain.message.cdnSwitchFailed'));
  } finally {
    loading.value = false;
  }
};

const handleBindAgent = (row: Domain) => {
  selectedDomain.value = row;
  agentId.value = row.boundAgentId || '';
  showBindAgentModal.value = true;
};

const confirmBindAgent = async () => {
  if (!selectedDomain.value) return;

  loading.value = true;
  try {
    await domainApi.updateDomain(selectedDomain.value.id, {
      boundAgentId: agentId.value || null,
    } as any);
    message.success(agentId.value ? $t('operations.domain.message.agentBindSuccess') : $t('operations.domain.message.agentUnbindSuccess'));
    showBindAgentModal.value = false;
    fetchDomains();
  } catch (error: any) {
    message.error($t('operations.domain.message.agentBindFailed'));
  } finally {
    loading.value = false;
  }
};

const handleTogglePromotion = async (row: Domain) => {
  loading.value = true;
  try {
    await domainApi.updateDomain(row.id, {
      isPromotionDomain: !row.isPromotionDomain,
    } as any);
    message.success(
      row.isPromotionDomain ? $t('operations.domain.message.promotionCancelled') : $t('operations.domain.message.promotionSet'),
    );
    fetchDomains();
  } catch (error: any) {
    message.error($t('operations.domain.message.operationFailed'));
  } finally {
    loading.value = false;
  }
};

const handleToggleStatus = async (row: Domain) => {
  const newStatus =
    (row.status || 'NORMAL') === 'DISABLED' ? 'NORMAL' : 'DISABLED';
  loading.value = true;
  try {
    await domainApi.updateDomain(row.id, {
      status: newStatus,
    } as any);
    message.success(newStatus === 'DISABLED' ? $t('operations.domain.message.domainDisableSuccess') : $t('operations.domain.message.domainEnableSuccess'));
    fetchDomains();
  } catch (error: any) {
    message.error($t('operations.domain.message.operationFailed'));
  } finally {
    loading.value = false;
  }
};

const handleClearCache = async (row: Domain) => {
  loading.value = true;
  try {
    await domainApi.clearCache(row.id);
    message.success($t('operations.domain.message.cacheClearSuccess'));
  } catch (error: any) {
    message.error($t('operations.domain.message.cacheClearFailed'));
  } finally {
    loading.value = false;
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

onMounted(() => {
  fetchDomains();
});
</script>

<style scoped lang="scss">
.web-hall-view {
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
}
</style>
