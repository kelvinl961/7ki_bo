<template>
  <div class="all-domains-view">
    <!-- Statistics Cards -->
    <n-grid :cols="4" :x-gap="16" style="margin-bottom: 16px">
      <n-gi>
        <n-card size="small">
          <n-statistic label="总域名数" :value="stats.total" />
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
          <n-statistic label="已验证" :value="stats.verified" />
        </n-card>
      </n-gi>
    </n-grid>

    <!-- Filters -->
    <n-card size="small" style="margin-bottom: 16px">
      <n-space :size="12" align="center">
        <n-select
          v-model:value="filters.cdnProvider"
          :options="cdnProviderOptions"
          placeholder="CDN节点"
          clearable
          style="width: 150px"
          size="small"
        />
        
        <n-select
          v-model:value="filters.status"
          :options="statusOptions"
          placeholder="主域名状态"
          clearable
          style="width: 140px"
          size="small"
        />
        
        <n-input
          v-model:value="filters.search"
          placeholder="域名搜索"
          clearable
          style="width: 200px"
          size="small"
          @keyup.enter="fetchDomains"
        />
        
        <n-button type="primary" size="small" @click="fetchDomains">
          搜索
        </n-button>
        
        <n-button size="small" @click="resetFilters">
          重置
        </n-button>
      </n-space>
    </n-card>

    <!-- Actions -->
    <n-card size="small" style="margin-bottom: 16px">
      <n-space justify="space-between">
        <n-space>
          <n-button type="primary" size="small" @click="showCreateModal = true">
            新增
          </n-button>
          <n-button size="small" :disabled="selectedRowKeys.length === 0" @click="handleBulkDelete">
            批量删除
          </n-button>
          <n-button size="small" @click="fetchDomains">
            刷新
          </n-button>
        </n-space>
        <span style="font-size: 13px; color: #666">
          共 {{ pagination.itemCount || 0 }} 条记录
          <span v-if="selectedRowKeys.length > 0" style="margin-left: 8px">
            已选择 {{ selectedRowKeys.length }} 条
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
      title="更换CDN节点"
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
          <n-tag :type="'info'" size="small">{{ selectedDomain?.cdnProvider }}</n-tag>
        </div>
        <div>
          <div style="margin-bottom: 8px; font-weight: 500">目标CDN节点 <span style="color: red">*</span></div>
          <n-select
            v-model:value="targetCDN"
            :options="cdnProviderOptions.filter(o => o.value && o.value !== selectedDomain?.cdnProvider)"
            placeholder="请选择目标CDN节点"
          />
        </div>
        <n-alert type="warning" :show-icon="false" style="margin-top: 12px;">
          <div style="font-size: 13px; line-height: 1.8;">
            <div style="font-weight: 500; margin-bottom: 8px;">功能说明：</div>
            <div>• 仅限域名已托管DNS厂商（阿里云与Cloudflare），切换过程无感知，预计5-10分钟域名生效</div>
            <div style="margin-top: 8px; font-weight: 500;">支持CDN节点：</div>
            <div>Cloudflare、AWS、网宿、火山云、阿里云、腾讯云、华为云、SuperEdge、Funnull、云盾</div>
          </div>
        </n-alert>
      </n-space>
    </n-modal>

    <!-- Bind Agent Modal -->
    <n-modal
      v-model:show="showBindAgentModal"
      preset="dialog"
      title="绑定代理"
      positive-text="确认"
      negative-text="取消"
      @positive-click="confirmBindAgent"
    >
      <n-space vertical :size="16" style="margin: 20px 0">
        <div>
          <div style="margin-bottom: 8px; font-weight: 500">当前域名</div>
          <div style="color: #666">{{ selectedDomain?.domainName }}</div>
        </div>
        <div>
          <div style="margin-bottom: 8px; font-weight: 500">代理ID</div>
          <n-input
            v-model:value="agentId"
            placeholder="请输入代理ID（留空则解绑）"
            clearable
          />
        </div>
        <n-alert type="info" :show-icon="false">
          <div style="font-size: 13px">
            <div>• 为特定域名分配代理，以便管理流量和推广策略</div>
            <div>• 上级归属判定优先级：</div>
            <div style="padding-left: 16px">1. 推广链接的上级（最高优先级）</div>
            <div style="padding-left: 16px">2. 渠道ID配置的强制绑定上级</div>
            <div style="padding-left: 16px">3. 域名管理中配置的强制绑定上级</div>
          </div>
        </n-alert>
      </n-space>
    </n-modal>

    <!-- Subdomain List Modal -->
    <n-modal
      v-model:show="showSubdomainModal"
      :mask-closable="false"
      preset="card"
      title="子域名"
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
        <div style="display: flex; justify-content: flex-end;">
          <n-button type="primary" @click="showSubdomainModal = false">
            关闭
          </n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
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
  type SelectOption
} from 'naive-ui';
import { domainApi } from '../api/domainApi';
// ✅ PERFORMANCE FIX: Lazy load modal components - they only load when modals are opened
import { defineAsyncComponent } from 'vue';
const CreateDomainModal = defineAsyncComponent(() => import('../components/CreateDomainModal.vue'));
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
  title: '域名管理'
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
  verified: 0
});

// Filters
const filters = ref({
  cdnProvider: null as string | null,
  status: null as string | null,
  search: ''
});

// Pagination
const pagination = reactive({
  page: 1,
  pageSize: 20,
  itemCount: 0
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
  }
});

// Expanded rows state (for verification method expand/collapse)
const expandedRows = ref<Record<number, boolean>>({});

// Options
const cdnProviderOptions: SelectOption[] = [
  { label: '全部', value: '' },
  { label: 'Cloudflare (CF)', value: 'CLOUDFLARE' },
  { label: 'AWS (A8)', value: 'AWS' },
  { label: '网宿 (Wangsu)', value: 'WANGSU' },
  { label: '火山云 (Volcengine)', value: 'VOLCENGINE' },
  { label: '阿里云 (Aliyun)', value: 'ALIYUN' },
  { label: '腾讯云 (Tencent)', value: 'TENCENT_CLOUD' },
  { label: '华为云 (Huawei)', value: 'HUAWEI_CLOUD' },
  { label: 'SuperEdge', value: 'SUPEREDGE' },
  { label: 'Funnull', value: 'FUNNULL' },
  { label: '云盾 (Yundun)', value: 'YUNDUN' }
];

const statusOptions: SelectOption[] = [
  { label: '全部', value: '' },
  { label: '正常', value: 'NORMAL' },
  { label: '已过期', value: 'EXPIRED' },
  { label: '即将过期', value: 'EXPIRING_SOON' },
  { label: '验证中', value: 'VERIFICATION_PENDING' },
  { label: '已停用', value: 'DISABLED' }
];

// Table Columns (computed to react to expandedRows changes)
const columns = computed<DataTableColumn<Domain>[]>(() => [
  {
    type: 'selection' as const
  },
  {
    title: 'CDN节点名称',
    key: 'cdnProvider',
    width: 130,
    render(row: Domain) {
      const colorMap: Record<string, string> = {
        CLOUDFLARE: 'info',
        AWS: 'warning',
        TENCENT_CLOUD: 'success',
        ALIYUN: 'error',
        HUAWEI_CLOUD: 'default'
      };
      return h(NTag, { type: colorMap[row.cdnProvider] as any, size: 'small' }, () => row.cdnProvider);
    }
  },
  {
    title: '主域名(子域名数)',
    key: 'domainName',
    width: 220,
    render(row: Domain) {
      const count = subdomainCounts.value[row.id] || 0;
      return h('div', { 
        style: 'display: flex; align-items: center; gap: 8px; cursor: pointer;',
        onClick: () => handleShowSubdomains(row)
      }, [
        h('span', {}, `${row.domainName}(${count})`),
        h(NButton, {
          text: true,
          size: 'tiny',
          type: 'info',
          onClick: (e: Event) => {
            e.stopPropagation();
            handleShowSubdomains(row);
          }
        }, { 
          default: () => h('span', { 
            style: 'font-size: 16px;' 
          }, '')
        })
      ]);
    }
  },
  {
    title: '验证方式',
    key: 'verificationMethod',
    width: 280,
    render(row: Domain) {
      const methodMap: Record<string, string> = {
        DNS_VALIDATION: 'DNS验证',
        WHEN_DNS_COMPLETED: '当DNS完成为',
        HTTP_VALIDATION: 'HTTP验证',
        EMAIL_VALIDATION: '邮箱验证'
      };
      
      const nameservers = Array.isArray(row.nameservers) ? row.nameservers : [];
      const hasNameservers = nameservers.length > 0;
      const isExpanded = expandedRows.value[row.id] || false;
      
      return h('div', { style: 'display: flex; flex-direction: column; gap: 4px;' }, [
        h('div', { style: 'display: flex; align-items: center; gap: 8px;' }, [
          h('span', {}, methodMap[row.verificationMethod] || row.verificationMethod),
          hasNameservers && h(NButton, {
            text: true,
            size: 'tiny',
            type: 'primary',
            onClick: () => {
              expandedRows.value[row.id] = !expandedRows.value[row.id];
            }
          }, { default: () => isExpanded ? '收起' : '展开' })
        ]),
        isExpanded && hasNameservers && h('div', { 
          style: 'padding: 8px; background: #f5f7fa; border-radius: 4px; font-size: 12px;'
        }, nameservers.map((ns: string, index: number) => 
          h('div', { 
            key: index,
            style: 'display: flex; align-items: center; gap: 4px; margin-bottom: 4px;'
          }, [
            h('span', { style: 'color: #666;' }, `ns${index + 1}:`),
            h('span', { style: 'color: #18a058; font-family: monospace;' }, ns),
            h(NButton, {
              text: true,
              size: 'tiny',
              onClick: () => {
                navigator.clipboard.writeText(ns);
                message.success('已复制');
              }
            }, { default: () => '' })
          ])
        ))
      ]);
    }
  },
  {
    title: '主域名状态',
    key: 'status',
    width: 160,
    render(row: Domain) {
      const statusMap: Record<string, { type: string; text: string }> = {
        NORMAL: { type: 'success', text: '正常' },
        VERIFICATION_PENDING: { type: 'warning', text: '验证中' },
        DISABLED: { type: 'error', text: '已禁用' },
        EXPIRED: { type: 'default', text: '已过期' }
      };
      const status = statusMap[row.status] || statusMap.NORMAL || { type: 'success', text: '正常' };
      
      // Show verification button for pending domains
      if (row.status === 'VERIFICATION_PENDING') {
        // Check if domain is in cooldown period (10 minutes = 600 seconds)
        const lastCheck = (row as any).lastVerificationCheck;
        const isInCooldown = lastCheck ? 
          ((Date.now() - new Date(lastCheck).getTime()) / 1000) < 600 : 
          false;
        
        // If currently verifying, show "验证中..."
        if (isVerifying.value[row.id]) {
          return h('div', { style: 'display: flex; align-items: center; gap: 8px;' }, [
            h(NTag, { type: status.type as any, size: 'small' }, () => status.text),
            h('span', { style: 'color: #999; font-size: 12px;' }, '验证中...')
          ]);
        }
        
        // If in cooldown, hide the button completely
        if (isInCooldown) {
          return h(NTag, { type: status.type as any, size: 'small' }, () => status.text);
        }
        
        // Show verification button if not in cooldown
        return h('div', { style: 'display: flex; align-items: center; gap: 8px;' }, [
          h(NTag, { type: status.type as any, size: 'small' }, () => status.text),
          h(NButton, {
            text: true,
            size: 'tiny',
            type: 'info',
            onClick: () => handleVerifyDomain(row)
          }, { 
            default: () => '点击验证'
          })
        ]);
      }
      
      return h(NTag, { type: status.type as any, size: 'small' }, () => status.text);
    }
  },
  {
    title: '域名过期日',
    key: 'expiryDate',
    width: 140,
    render(row: Domain) {
      return row.expiryDate ? new Date(row.expiryDate).toLocaleDateString('zh-CN') : '-';
    }
  },
  {
    title: '证书过期日',
    key: 'certificateExpiryDate',
    width: 140,
    render(row: Domain) {
      return row.certificateExpiryDate ? new Date(row.certificateExpiryDate).toLocaleDateString('zh-CN') : '-';
    }
  },
  {
    title: '使用场景',
    key: 'usageScenario',
    width: 120,
    render(row: Domain) {
      return row.usageScenario || '全部';
    }
  },
  {
    title: '备注',
    key: 'remark',
    width: 200,
    ellipsis: { tooltip: true },
    render(row: Domain) {
      return row.备注 || '-';
    }
  },
  {
    title: '操作人',
    key: 'operatedBy',
    width: 100,
    render(row: any) {
      return row.operatedBy || '-';
    }
  },
  {
    title: '操作',
    key: 'actions',
    width: 300,
    fixed: 'right' as const,
    render(row: Domain) {
      const isDisabled = (row.status || 'NORMAL') === 'DISABLED';
      return h('div', { style: 'display: flex; gap: 4px; flex-wrap: wrap;' }, [
        h(NButton, {
          size: 'small',
          onClick: () => handleSwitchCDN(row)
        }, () => '更换节点'),
        h(NButton, {
          size: 'small',
          onClick: () => handleBindAgent(row)
        }, () => '绑定代理'),
        h(NButton, {
          size: 'small',
          type: isDisabled ? 'success' : 'warning',
          onClick: () => handleToggleStatus(row)
        }, () => isDisabled ? '启用' : '停用'),
        h(NButton, {
          size: 'small',
          onClick: () => handleClearCache(row)
        }, () => '清缓存'),
        h(NPopconfirm, {
          onPositiveClick: () => handleDelete(row.id),
          positiveText: '确认删除',
          negativeText: '取消',
          style: { width: '500px' }
        }, {
          default: () => h('div', { style: 'font-size: 14px; padding: 10px 0;' }, [
            h('div', { style: 'font-weight: 600; margin-bottom: 8px; font-size: 16px;' }, '确认删除域名？'),
            h('div', { style: 'color: #666;' }, `域名: ${row.domainName}`),
            h('div', { style: 'color: #ff4d4f; margin-top: 8px; font-size: 13px;' }, '删除后将无法恢复，请谨慎操作！')
          ]),
          trigger: () => h(NButton, {
            size: 'small',
            type: 'error'
          }, () => '删除')
        })
      ]);
    }
  }
]);

// Subdomain Columns
const subdomainColumns: DataTableColumn<Domain>[] = [
  {
    title: '子域名',
    key: 'domainName',
    width: 250,
    ellipsis: { tooltip: true }
  },
  {
    title: 'CDN节点名称',
    key: 'cdnProvider',
    width: 150,
    render(row: Domain) {
      const colorMap: Record<string, string> = {
        CLOUDFLARE: 'info',
        AWS: 'warning',
        TENCENT_CLOUD: 'success',
        ALIYUN: 'error',
        HUAWEI_CLOUD: 'default'
      };
      return h(NTag, { type: colorMap[row.cdnProvider] as any, size: 'small' }, () => row.cdnProvider);
    }
  },
  {
    title: '域名用途',
    key: 'useType',
    width: 150,
    render(row: Domain) {
      const useTypeMap: Record<string, string> = {
        WEB_HALL: 'Web大厅',
        APP_HALL: 'APP大厅',
        DOWNLOAD_SITE: '下载站',
        BACKEND_API: '后端加速域名',
        OSS_ACCELERATION: 'OSS加速',
        TRANSFER_PAGE: '中转页',
        APP_UPDATE: 'APP更新'
      };
      return useTypeMap[row.useType || ''] || row.useType || '-';
    }
  },
  {
    title: '使用状态',
    key: 'status',
    width: 120,
    render(row: Domain) {
      const isDisabled = row.status === 'DISABLED';
      return h(NTag, { 
        type: isDisabled ? 'error' : 'success', 
        size: 'small' 
      }, () => isDisabled ? '已停用' : '启用成功');
    }
  }
];

// Methods
const fetchDomains = async () => {
  loading.value = true;
  try {
    const params: any = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      isParentDomain: true // ⭐ Only show parent domains in 域名管理 tab
    };
    
    if (filters.value.cdnProvider) params.cdnProvider = filters.value.cdnProvider;
    if (filters.value.status) params.status = filters.value.status;
    if (filters.value.search) params.search = filters.value.search;
    
    if (props.initialFilter?.useType) params.useType = props.initialFilter.useType;
    if (props.initialFilter?.cdnProvider) params.cdnProvider = props.initialFilter.cdnProvider;
    if (props.initialFilter?.status) params.status = props.initialFilter.status;
    
    const response: any = await domainApi.getDomains(params);
    // Response interceptor unwraps the data, so response is already the data part
    const responseData = response.data?.data || response;
    
    domains.value = responseData.list || responseData.domains || [];
    pagination.itemCount = responseData.pagination?.total || responseData.total || 0;
    paginationConfig.itemCount = responseData.pagination?.total || responseData.total || 0;

    updateStats();
    
    // Fetch subdomain counts for each parent domain
    fetchSubdomainCounts();
  } catch (error: any) {
    message.error('获取域名列表失败');
    console.error('Fetch domains error:', error);
    console.error('Error response:', error.response?.data);
  } finally {
    loading.value = false;
  }
};

const updateStats = () => {
  stats.value = {
    total: domains.value.length,
    cloudflare: domains.value.filter((d: Domain) => d.cdnProvider === 'CLOUDFLARE').length,
    aws: domains.value.filter((d: Domain) => d.cdnProvider === 'AWS').length,
    verified: domains.value.filter((d: Domain) => d.verificationStatus).length
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
          pageSize: 1 // Just need count, not actual data
        });
        const responseData = response.data?.data || response;
        return {
          domainId: domain.id,
          count: responseData.pagination?.total || responseData.total || 0
        };
      } catch (error) {
        return {
          domainId: domain.id,
          count: 0
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
      pageSize: 100 // Get all subdomains
    });
    const responseData = response.data?.data || response;
    subdomains.value = responseData.list || responseData.domains || [];
  } catch (error: any) {
    message.error('获取子域名失败');
    console.error('Fetch subdomains error:', error);
  } finally {
    subdomainLoading.value = false;
  }
};

const resetFilters = () => {
  filters.value = {
    cdnProvider: null,
    status: null,
    search: ''
  };
  pagination.page = 1;
  fetchDomains();
};

const handleCheck = (keys: (string | number)[]) => {
  selectedRowKeys.value = keys as number[];
};

const handleCreateSuccess = () => {
  message.success('域名创建成功');
  fetchDomains();
};

const handleDelete = async (id: number) => {
  try {
    await domainApi.deleteDomain(id);
    message.success('删除成功');
    fetchDomains();
  } catch (error) {
    message.error('删除失败');
  }
};

const handleBulkDelete = () => {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请选择要删除的域名');
    return;
  }
  message.info('批量删除功能开发中');
};

// Switch CDN
const handleSwitchCDN = (row: Domain) => {
  selectedDomain.value = row;
  targetCDN.value = '';
  showSwitchCDNModal.value = true;
};

const confirmSwitchCDN = async () => {
  if (!selectedDomain.value || !targetCDN.value) {
    message.warning('请选择目标CDN节点');
    return;
  }

  loading.value = true;
  try {
    await domainApi.switchCDN(selectedDomain.value.id, {
      targetProvider: targetCDN.value,
      migrateData: false,
      updateDNS: true
    });
    message.success('CDN节点切换成功，预计5-30分钟生效');
    showSwitchCDNModal.value = false;
    fetchDomains();
  } catch (error: any) {
    message.error(error.response?.data?.message || '切换CDN节点失败');
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
      boundAgentId: agentId.value || null
    } as any);
    message.success(agentId.value ? '代理绑定成功' : '代理解绑成功');
    showBindAgentModal.value = false;
    fetchDomains();
  } catch (error: any) {
    message.error(error.response?.data?.message || '绑定代理失败');
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
      message.success(result.data.message || '验证完成');
      // Refresh domains to show updated status
      fetchDomains();
    } else {
      message.warning(result.message || '验证失败');
    }
  } catch (error: any) {
    if (error.response?.status === 429) {
      // Rate limit error
      message.warning(error.response?.data?.message || '请稍后再试');
    } else {
      message.error(error.response?.data?.message || '验证失败');
    }
  } finally {
    isVerifying.value[domain.id] = false;
  }
};

// Toggle Enable/Disable
const handleToggleStatus = async (row: Domain) => {
  const newStatus = row.status === 'DISABLED' ? 'NORMAL' : 'DISABLED';
  const action = newStatus === 'DISABLED' ? '停用' : '启用';

  loading.value = true;
  try {
    await domainApi.updateDomain(row.id, {
      status: newStatus
    } as any);
    message.success(`域名${action}成功`);
    fetchDomains();
  } catch (error: any) {
    message.error(error.response?.data?.message || `域名${action}失败`);
  } finally {
    loading.value = false;
  }
};

// Clear Cache
const handleClearCache = async (row: Domain) => {
  loading.value = true;
  try {
    await domainApi.clearCache(row.id);
    message.success('缓存清理成功');
  } catch (error: any) {
    message.error(error.response?.data?.message || '清理缓存失败');
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
