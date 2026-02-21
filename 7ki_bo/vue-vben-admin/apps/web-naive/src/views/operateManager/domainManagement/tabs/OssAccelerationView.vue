<template>
  <div class="oss-acceleration-view">
    <!-- Filters -->
    <n-card size="small" style="margin-bottom: 16px">
      <n-space :size="12" align="center">
        <n-input
          v-model:value="filters.search"
          placeholder="请输入域名"
          clearable
          style="width: 200px"
          size="small"
          @keyup.enter="fetchDomains"
        />

        <n-select
          v-model:value="filters.cdnProvider"
          placeholder="CDN节点"
          clearable
          style="width: 150px"
          size="small"
          :options="cdnFilterOptions"
          @update:value="fetchDomains"
        />

        <n-select
          v-model:value="filters.status"
          placeholder="使用状态"
          clearable
          style="width: 150px"
          size="small"
          :options="statusFilterOptions"
          @update:value="fetchDomains"
        />

        <n-button type="primary" size="small" @click="fetchDomains">
          搜索
        </n-button>

        <n-button size="small" @click="resetFilters"> 重置 </n-button>
      </n-space>
    </n-card>

    <!-- Actions -->
    <n-card size="small" style="margin-bottom: 16px">
      <n-space justify="space-between">
        <n-space>
          <n-button type="primary" size="small" @click="showCreateModal = true">
            新增
          </n-button>
          <n-button size="small" @click="fetchDomains"> 刷新 </n-button>
          <n-button
            size="small"
            :disabled="!selectedRowKeys.length"
            @click="handleBulkDelete"
          >
            批量删除
          </n-button>
        </n-space>
        <n-space align="center" :size="16">
          <span style="font-size: 13px; color: #666">
            共 {{ pagination.itemCount || 0 }} 条记录
          </span>
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
        :scroll-x="1800"
        size="small"
      />
    </n-card>

    <!-- Create Domain Modal -->
    <BackendApiCreateModal
      v-model:show="showCreateModal"
      use-type="OSS_ACCELERATION"
      use-type-label="OSS加速域名"
      modal-title="新增OSS加速域名"
      @success="handleCreateSuccess"
    />

    <!-- Switch CDN Modal -->
    <n-modal
      v-model:show="showSwitchCDNModal"
      preset="dialog"
      title="更换节点"
      positive-text="确认"
      negative-text="取消"
      @positive-click="confirmSwitchCDN"
    >
      <n-space vertical :size="16" style="margin: 20px 0">
        <div>
          <div style="margin-bottom: 8px; font-weight: 500">当前域名</div>
          <div style="color: #666">{{ selectedDomain?.domainName }}</div>
        </div>
        <div>
          <div style="margin-bottom: 8px; font-weight: 500">当前CDN</div>
          <n-tag :type="'info'" size="small">{{
            selectedDomain?.cdnProvider
          }}</n-tag>
        </div>
        <div>
          <div style="margin-bottom: 8px; font-weight: 500">
            目标CDN节点 <span style="color: red">*</span>
          </div>
          <n-select
            v-model:value="targetCDN"
            :options="
              cdnOptions.filter((o) => o.value !== selectedDomain?.cdnProvider)
            "
            placeholder="请选择目标CDN节点"
          />
        </div>
      </n-space>
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
  NTag,
  NModal,
  NPopconfirm,
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
  sslEnabled: boolean;
  verificationStatus: boolean;
  备注?: string;
  createdAt: string;
  updatedAt: string;
}

// State
const loading = ref(false);
const domains = ref<Domain[]>([]);
const selectedRowKeys = ref<number[]>([]);
const showCreateModal = ref(false);
const showSwitchCDNModal = ref(false);
const selectedDomain = ref<Domain | null>(null);
const targetCDN = ref('');

// Filters
const filters = reactive({
  search: '',
  cdnProvider: '',
  status: '',
  useType: 'OSS_ACCELERATION', // Only show OSS Acceleration domains in this tab
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
  prefix: ({ itemCount }: { itemCount: number }) => `共 ${itemCount} 条`,
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
  { label: '华为云', value: 'HUAWEI_CLOUD' },
  { label: '阿里云', value: 'ALIYUN' },
  { label: '腾讯云', value: 'TENCENT_CLOUD' },
];

const cdnFilterOptions = [{ label: '全部', value: '' }, ...cdnOptions];

const statusFilterOptions = [
  { label: '全部', value: '' },
  { label: '正常', value: 'NORMAL' },
  { label: '已停用', value: 'DISABLED' },
  { label: '已过期', value: 'EXPIRED' },
  { label: '验证中', value: 'VERIFICATION_PENDING' },
];

// Table Columns - Optimized width for better UX
const columns: DataTableColumn<Domain>[] = [
  { type: 'selection' as const, width: 50 },
  {
    title: 'CDN平台',
    key: 'cdnProvider',
    width: 110,
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
    title: '生效域名',
    key: 'domainName',
    width: 220,
    ellipsis: { tooltip: true },
    render(row: Domain) {
      return h(
        'div',
        { style: 'display: flex; align-items: center; gap: 6px;' },
        [
          h('span', {}, row.domainName),
          h(
            NButton,
            {
              size: 'tiny',
              text: true,
              onClick: () => {
                navigator.clipboard.writeText(row.domainName);
                message.success('已复制');
              },
            },
            { default: () => '复制' },
          ),
        ],
      );
    },
  },
  {
    title: h('div', { style: 'white-space: nowrap;' }, [
      h('div', {}, '解析说明'),
      h(
        'div',
        { style: 'font-size: 11px; font-weight: normal; color: #999;' },
        '(生效状态如同源)',
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
              default: () => (row.verificationStatus ? '已生效' : '待解析'),
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
    title: '使用状态',
    key: 'status',
    width: 100,
    render(row: Domain) {
      const statusMap: Record<string, { text: string; type: any }> = {
        NORMAL: { text: '启用成功', type: 'success' },
        DISABLED: { text: '待启用', type: 'warning' },
        EXPIRED: { text: '已过期', type: 'error' },
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
    title: '备注',
    key: '备注',
    width: 150,
    ellipsis: { tooltip: true },
    render(row: Domain) {
      return row.备注 || '-';
    },
  },
  {
    title: '操作',
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
          { default: () => '更换节点' },
        ),
        h(
          NPopconfirm,
          {
            onPositiveClick: () => handleToggleStatus(row),
            positiveText: '确认',
            negativeText: '取消',
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
                  `${row.status === 'DISABLED' ? '✅ 确认启用？' : '⚠️ 确认停用？'}`,
                ),
                h('div', { style: 'color: #666;' }, `域名: ${row.domainName}`),
              ]),
            trigger: () =>
              h(
                NButton,
                {
                  size: 'small',
                  type: row.status === 'DISABLED' ? 'success' : 'warning',
                },
                {
                  default: () => (row.status === 'DISABLED' ? '启用' : '停用'),
                },
              ),
          },
        ),
        h(
          NPopconfirm,
          {
            onPositiveClick: () => handleClearCache(row),
            positiveText: '确认清理',
            negativeText: '取消',
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
                  '🗑️ 确认清理缓存？',
                ),
                h('div', { style: 'color: #666;' }, `域名: ${row.domainName}`),
                h(
                  'div',
                  {
                    style: 'color: #ff9800; margin-top: 8px; font-size: 13px;',
                  },
                  '清理后用户可能需要重新加载资源',
                ),
              ]),
            trigger: () =>
              h(
                NButton,
                {
                  size: 'small',
                },
                { default: () => '清缓存' },
              ),
          },
        ),
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
                  '⚠️ 确认删除域名？',
                ),
                h('div', { style: 'color: #666;' }, `域名: ${row.domainName}`),
                h(
                  'div',
                  {
                    style: 'color: #ff4d4f; margin-top: 8px; font-size: 13px;',
                  },
                  '删除后将无法恢复，请谨慎操作！',
                ),
              ]),
            trigger: () =>
              h(
                NButton,
                {
                  size: 'small',
                  type: 'error',
                },
                { default: () => '删除' },
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
      error.response?.data?.message || error.message || '获取域名列表失败',
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
  message.success('域名创建成功');
  fetchDomains();
};

const handleSwitchCDN = (domain: Domain) => {
  selectedDomain.value = domain;
  targetCDN.value = '';
  showSwitchCDNModal.value = true;
};

const confirmSwitchCDN = async () => {
  if (!targetCDN.value) {
    message.warning('请选择目标CDN节点');
    return false;
  }

  try {
    const response = await domainApi.switchCDN(selectedDomain.value!.id, {
      targetProvider: targetCDN.value,
      migrateData: true,
      updateDNS: true,
    });

    if (response.code === 0) {
      message.success('CDN节点更换成功');
      fetchDomains();
      return true;
    } else {
      message.error(response.message || 'CDN节点更换失败');
      return false;
    }
  } catch (error: any) {
    console.error('Switch CDN error:', error);
    message.error(error.response?.data?.message || 'CDN节点更换失败');
    return false;
  }
};

const handleToggleStatus = async (domain: Domain) => {
  try {
    const response = await domainApi.toggleDomainStatus(domain.id, {
      operatedBy: 'admin',
    });

    if (response.code === 0) {
      message.success(
        `域名${domain.status === 'DISABLED' ? '启用' : '停用'}成功`,
      );
      fetchDomains();
    } else {
      message.error(response.message || '操作失败');
    }
  } catch (error: any) {
    console.error('Toggle status error:', error);
    message.error(error.response?.data?.message || '操作失败');
  }
};

const handleClearCache = async (domain: Domain) => {
  try {
    const response = await domainApi.clearCache(domain.id);

    if (response.code === 0) {
      message.success('缓存清理成功');
    } else {
      message.error(response.message || '缓存清理失败');
    }
  } catch (error: any) {
    console.error('Clear cache error:', error);
    message.error(error.response?.data?.message || '缓存清理失败');
  }
};

const handleDelete = async (domain: Domain) => {
  try {
    const response = await domainApi.deleteDomain(domain.id);

    if (response.code === 0) {
      message.success('域名删除成功');
      fetchDomains();
    } else {
      message.error(response.message || '域名删除失败');
    }
  } catch (error: any) {
    console.error('Delete domain error:', error);
    message.error(error.response?.data?.message || '域名删除失败');
  }
};

const handleBulkDelete = async () => {
  if (!selectedRowKeys.value.length) {
    message.warning('请选择要删除的域名');
    return;
  }

  try {
    const response = await domainApi.bulkDeleteDomains(selectedRowKeys.value);

    if (response.code === 0) {
      message.success(`成功删除 ${selectedRowKeys.value.length} 个域名`);
      selectedRowKeys.value = [];
      fetchDomains();
    } else {
      message.error(response.message || '批量删除失败');
    }
  } catch (error: any) {
    console.error('Bulk delete error:', error);
    message.error(error.response?.data?.message || '批量删除失败');
  }
};

onMounted(() => {
  fetchDomains();
});
</script>

<style scoped lang="scss">
.oss-acceleration-view {
  padding: 0;
}

:deep(.n-data-table) {
  .n-data-table-th {
    font-weight: 600;
  }
}
</style>
