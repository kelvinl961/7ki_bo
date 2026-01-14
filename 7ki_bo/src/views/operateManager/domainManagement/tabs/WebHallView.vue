<template>
  <div class="web-hall-view">
    <!-- Filters -->
    <n-card size="small" style="margin-bottom: 16px">
      <n-space :size="12" align="center">
        <n-input
          v-model:value="filters.search"
          placeholder="请输入子域名"
          clearable
          style="width: 200px"
          size="small"
          @keyup.enter="fetchDomains"
        />
        
        <n-select
          v-model:value="filters.useType"
          placeholder="全部使用状态"
          clearable
          style="width: 150px"
          size="small"
          :options="[
            { label: '全部', value: '' },
            { label: 'Web大厅', value: 'WEB_HALL' }
          ]"
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
          <n-button size="small" @click="fetchDomains">
            刷新
          </n-button>
        </n-space>
        <n-space align="center" :size="16">
          <div style="display: flex; align-items: center; gap: 8px; font-size: 13px;">
            <span>H5防控是都开启</span>
            <span style="color: #18a058; font-size: 16px;">⚫</span>
          </div>
          <span style="font-size: 13px; color: #999;">
            不自动创建
          </span>
          <span style="font-size: 13px; color: #666;">
            共 {{ pagination.itemCount || 0 }} 条记录
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
          <n-tag :type="'info'" size="small">{{ selectedDomain?.cdnProvider }}</n-tag>
        </div>
        <div>
          <div style="margin-bottom: 8px; font-weight: 500">目标CDN节点 <span style="color: red">*</span></div>
          <n-select
            v-model:value="targetCDN"
            :options="cdnOptions.filter(o => o.value !== selectedDomain?.cdnProvider)"
            placeholder="请选择目标CDN节点"
          />
        </div>
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
      </n-space>
    </n-modal>

    <!-- Create Subdomain Modal -->
    <CreateSubdomainModal
      v-model:show="showCreateModal"
      default-use-type="WEB_HALL"
      use-type-label="Web大厅"
      modal-title="新增Web大厅子域名"
      @success="handleCreateSuccess"
    />
  </div>
</template>

<script setup lang="ts">
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
  type DataTableColumn
} from 'naive-ui';
import { domainApi } from '../api/domainApi';
// ✅ PERFORMANCE FIX: Lazy load modal components - they only load when modals are opened
import { defineAsyncComponent } from 'vue';
const CreateSubdomainModal = defineAsyncComponent(() => import('../components/CreateSubdomainModal.vue'));
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
  useType: 'WEB_HALL'
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

const cdnOptions = [
  { label: 'Cloudflare', value: 'CLOUDFLARE' },
  { label: 'AWS', value: 'AWS' },
  { label: '华为云', value: 'HUAWEI_CLOUD' },
  { label: '腾讯云', value: 'TENCENT_CLOUD' },
  { label: '阿里云', value: 'ALIYUN' }
];

// Web Hall Columns - Based on second screenshot
const columns: DataTableColumn<Domain>[] = [
  {
    title: 'CDN节点名称',
    key: 'cdnProvider',
    width: 120
  },
  {
    title: '生效域名',
    key: 'domainName',
    width: 180,
    render(row: Domain) {
      return h('div', { style: 'display: flex; flex-direction: column; gap: 4px;' }, [
        h('span', {}, row.domainName),
        h('a', { 
          style: 'color: #18a058; font-size: 12px; cursor: pointer;',
          onClick: () => {
            navigator.clipboard.writeText(row.domainName);
            message.success('已解析');
          }
        }, '已解析')
      ]);
    }
  },
  {
    title: '端口类型',
    key: 'portType',
    width: 100,
    render(row: Domain) {
      return row.portType === 'FIXED' ? '固定' : '默认';
    }
  },
  {
    title: '端口',
    key: 'port',
    width: 80,
    render(row: Domain) {
      return row.customPort || 443;
    }
  },
  {
    title: h('div', { style: 'white-space: nowrap;' }, [
      h('div', {}, '解析说明'),
      h('div', { style: 'font-size: 11px; font-weight: normal; color: #999;' }, '(生效状态如同源)')
    ]) as any,
    key: 'dnsStatus',
    width: 150,
    render(row: Domain) {
      return h('div', { style: 'display: flex; align-items: center; gap: 8px;' }, [
        h(NTag, { 
          type: row.verificationStatus ? 'success' : 'info',
          size: 'small'
        }, () => row.verificationStatus ? '已生效' : '已生效'),
        h(NButton, {
          text: true,
          size: 'tiny',
          onClick: () => fetchDomains()
        }, () => '🔄')
      ]);
    }
  },
  {
    title: h('div', { style: 'white-space: nowrap;' }, [
      h('div', {}, '出现在其他组织'),
      h('div', { style: 'font-size: 11px; font-weight: normal; color: #999;' }, '剩余')
    ]) as any,
    key: 'otherOrg',
    width: 130,
    render() {
      return h('div', { style: 'text-align: center;' }, [
        h('input', {
          type: 'checkbox',
          style: 'transform: scale(1.2);'
        })
      ]);
    }
  },
  {
    title: h('div', { style: 'display: flex; align-items: center; gap: 4px; white-space: nowrap;' }, [
      h('span', {}, '作为推广域名'),
      h('span', { style: 'color: #52c41a;' }, '✓')
    ]) as any,
    key: 'isPromotionDomain',
    width: 130,
    render(row: Domain) {
      return h('div', { style: 'display: flex; justify-content: center;' }, [
        h('div', {
          style: `
            width: 44px;
            height: 22px;
            background: ${row.isPromotionDomain ? '#52c41a' : '#d9d9d9'};
            border-radius: 11px;
            position: relative;
            cursor: pointer;
            transition: all 0.3s;
          `,
          onClick: () => handleTogglePromotion(row)
        }, [
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
            `
          })
        ])
      ]);
    }
  },
  {
    title: '强制绑定上级',
    key: 'boundAgentId',
    width: 120,
    render(row: Domain) {
      return row.boundAgentId || '无';
    }
  },
  {
    title: '启用入口',
    key: 'enabledEntrance',
    width: 120,
    render(row: Domain) {
      const map: Record<string, string> = {
        ALL: '全部',
        APP_ONLY: '仅极速APP',
        H5_PWA: 'H5和PWA'
      };
      return h('div', { style: 'display: flex; align-items: center; gap: 4px;' }, [
        h('span', {}, map[row.enabledEntrance] || '全部'),
        h('span', { style: 'font-size: 10px; color: #999;' }, '▼')
      ]);
    }
  },
  {
    title: '屏蔽设备',
    key: 'blockedDevice',
    width: 120,
    render(row: Domain) {
      const map: Record<string, string> = {
        NONE: '都不屏蔽',
        BLOCK_MOBILE: '屏蔽手机端',
        BLOCK_PC: '屏蔽PC端'
      };
      return h('div', { style: 'display: flex; align-items: center; gap: 4px;' }, [
        h('span', {}, map[row.blockedDevice] || '都不屏蔽'),
        h('span', { style: 'font-size: 10px; color: #999;' }, '▼')
      ]);
    }
  },
  {
    title: '使用状态',
    key: 'status',
    width: 120,
    render(row: Domain) {
      const isEnabled = (row.status || 'NORMAL') !== 'DISABLED';
      return h('div', { style: 'display: flex; align-items: center; gap: 8px;' }, [
        h('div', {
          style: `
            width: 44px;
            height: 22px;
            background: ${isEnabled ? '#52c41a' : '#d9d9d9'};
            border-radius: 11px;
            position: relative;
            cursor: pointer;
            transition: all 0.3s;
          `,
          onClick: () => handleToggleStatus(row)
        }, [
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
            `
          })
        ])
      ]);
    }
  },
  {
    title: '备注',
    key: 'remark',
    width: 150,
    ellipsis: { tooltip: true },
    render(row: Domain) {
      return row.备注 || '';
    }
  },
  {
    title: '操作',
    key: 'actions',
    width: 280,
    fixed: 'right' as const,
    render(row: Domain) {
      return h('div', { style: 'display: flex; gap: 4px; flex-wrap: wrap;' }, [
        h(NButton, {
          size: 'small',
          onClick: () => handleSwitchCDN(row)
        }, { default: () => '更换节点' }),
        h(NButton, {
          size: 'small',
          onClick: () => handleBindAgent(row)
        }, { default: () => row.boundAgentId ? '修改代理' : '绑定代理' }),
        h(NPopconfirm, {
          onPositiveClick: () => handleToggleStatus(row),
          positiveText: '确认',
          negativeText: '取消',
          style: { width: '450px' }
        }, {
          default: () => h('div', { style: 'font-size: 14px; padding: 10px 0;' }, [
            h('div', { style: 'font-weight: 600; margin-bottom: 8px; font-size: 16px;' }, `${row.status === 'DISABLED' ? '✅ 确认启用？' : '⚠️ 确认停用？'}`),
            h('div', { style: 'color: #666;' }, `域名: ${row.domainName}`)
          ]),
          trigger: () => h(NButton, {
            size: 'small',
            type: row.status === 'DISABLED' ? 'success' : 'warning'
          }, { default: () => row.status === 'DISABLED' ? '启用' : '停用' })
        }),
        h(NPopconfirm, {
          onPositiveClick: () => handleClearCache(row),
          positiveText: '确认清理',
          negativeText: '取消',
          style: { width: '450px' }
        }, {
          default: () => h('div', { style: 'font-size: 14px; padding: 10px 0;' }, [
            h('div', { style: 'font-weight: 600; margin-bottom: 8px; font-size: 16px;' }, '🗑️ 确认清理缓存？'),
            h('div', { style: 'color: #666;' }, `域名: ${row.domainName}`),
            h('div', { style: 'color: #ff9800; margin-top: 8px; font-size: 13px;' }, '清理后用户可能需要重新加载资源')
          ]),
          trigger: () => h(NButton, {
            size: 'small'
          }, { default: () => '清缓存' })
        }),
        h(NPopconfirm, {
          onPositiveClick: () => handleDelete(row),
          positiveText: '确认删除',
          negativeText: '取消',
          style: { width: '500px' }
        }, {
          default: () => h('div', { style: 'font-size: 14px; padding: 10px 0;' }, [
            h('div', { style: 'font-weight: 600; margin-bottom: 8px; font-size: 16px;' }, '⚠️ 确认删除域名？'),
            h('div', { style: 'color: #666;' }, `域名: ${row.domainName}`),
            h('div', { style: 'color: #ff4d4f; margin-top: 8px; font-size: 13px;' }, '删除后将无法恢复，请谨慎操作！')
          ]),
          trigger: () => h(NButton, {
            size: 'small',
            type: 'error'
          }, { default: () => '删除' })
        })
      ]);
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
      useType: filters.value.useType,
      isParentDomain: false // ⭐ Only show subdomains in Web大厅 tab
    };
    
    if (filters.value.search) params.search = filters.value.search;
    
    const response: any = await domainApi.getDomains(params);
    // Response interceptor may unwrap the data, handle both cases
    const responseData = response.data?.data || response.data || response;
    
    domains.value = responseData.list || responseData.domains || [];
    pagination.itemCount = responseData.pagination?.total || responseData.total || 0;
    paginationConfig.itemCount = responseData.pagination?.total || responseData.total || 0;
  } catch (error: any) {
    message.error('获取域名列表失败');
  } finally {
    loading.value = false;
  }
};

const resetFilters = () => {
  filters.value = {
    search: '',
    useType: 'WEB_HALL'
  };
  pagination.page = 1;
  fetchDomains();
};

const handleCreateSuccess = () => {
  message.success('域名创建成功');
  fetchDomains();
};

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
    message.success('CDN节点切换成功');
    showSwitchCDNModal.value = false;
    fetchDomains();
  } catch (error: any) {
    message.error('切换CDN节点失败');
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
      boundAgentId: agentId.value || null
    } as any);
    message.success(agentId.value ? '代理绑定成功' : '代理解绑成功');
    showBindAgentModal.value = false;
    fetchDomains();
  } catch (error: any) {
    message.error('绑定代理失败');
  } finally {
    loading.value = false;
  }
};

const handleTogglePromotion = async (row: Domain) => {
  loading.value = true;
  try {
    await domainApi.updateDomain(row.id, {
      isPromotionDomain: !row.isPromotionDomain
    } as any);
    message.success(row.isPromotionDomain ? '已取消推广域名' : '已设为推广域名');
    fetchDomains();
  } catch (error: any) {
    message.error('操作失败');
  } finally {
    loading.value = false;
  }
};

const handleToggleStatus = async (row: Domain) => {
  const newStatus = (row.status || 'NORMAL') === 'DISABLED' ? 'NORMAL' : 'DISABLED';
  loading.value = true;
  try {
    await domainApi.updateDomain(row.id, {
      status: newStatus
    } as any);
    message.success(`域名${newStatus === 'DISABLED' ? '停用' : '启用'}成功`);
    fetchDomains();
  } catch (error: any) {
    message.error('操作失败');
  } finally {
    loading.value = false;
  }
};

const handleClearCache = async (row: Domain) => {
  loading.value = true;
  try {
    await domainApi.clearCache(row.id);
    message.success('缓存清理成功');
  } catch (error: any) {
    message.error('清理缓存失败');
  } finally {
    loading.value = false;
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

