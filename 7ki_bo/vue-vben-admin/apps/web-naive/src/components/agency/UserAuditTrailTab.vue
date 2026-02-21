<template>
  <div class="user-audit-trail-tab">
    <!-- Filter Section -->
    <n-card title="筛选条件" class="mb-4">
      <div class="flex flex-wrap gap-4 items-end">
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium text-gray-700">操作类型</label>
          <n-select
            v-model:value="actionTypeFilter"
            placeholder="选择操作类型"
            clearable
            style="width: 140px"
            :options="actionTypeOptions"
            @update:value="loadAuditTrail"
          />
        </div>
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium text-gray-700">操作状态</label>
          <n-select
            v-model:value="actionStatusFilter"
            placeholder="选择状态"
            clearable
            style="width: 120px"
            :options="actionStatusOptions"
            @update:value="loadAuditTrail"
          />
        </div>
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium text-gray-700">开始日期</label>
          <n-date-picker
            v-model:value="startDate"
            type="date"
            placeholder="选择开始日期"
            style="width: 150px"
            @update:value="loadAuditTrail"
          />
        </div>
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium text-gray-700">结束日期</label>
          <n-date-picker
            v-model:value="endDate"
            type="date"
            placeholder="选择结束日期"
            style="width: 150px"
            @update:value="loadAuditTrail"
          />
        </div>
        <n-button type="primary" @click="loadAuditTrail" class="flex items-center gap-1">
          🔍 查询
        </n-button>
        <n-button @click="handleResetFilter" class="flex items-center gap-1">
          重置
        </n-button>
      </div>
    </n-card>

    <!-- Audit Trail Table -->
    <n-card>
      <template #header>
        <div class="flex items-center justify-between">
          <span class="text-lg font-medium">代理操作日志</span>
          <div class="flex items-center gap-2 text-sm text-gray-500">
            <span>共 {{ auditRecords.length || 0 }} 条记录</span>
            <n-button size="tiny" @click="loadAuditTrail" class="ml-2">
              重新加载
            </n-button>
            <n-button size="tiny" @click="handleExportData" class="ml-1">
              导出数据
            </n-button>
          </div>
        </div>
      </template>
      <n-data-table
        :loading="auditLoading"
        :columns="auditColumns"
        :data="auditRecords"
        :pagination="auditPagination"
        size="small"
        :row-key="(row: AgentAuditRecord) => row.id"
        :scroll-x="1200"
      />
    </n-card>

    <!-- Statistics Summary -->
    <n-card title="操作统计" class="mt-4">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="stat-card">
          <div class="stat-value">{{ totalActions }}</div>
          <div class="stat-label">总操作数</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ successfulActions }}</div>
          <div class="stat-label">成功操作</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ failedActions }}</div>
          <div class="stat-label">失败操作</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ uniqueUsers }}</div>
          <div class="stat-label">涉及用户数</div>
        </div>
      </div>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, h, onMounted } from 'vue';
import { 
  NCard, 
  NButton, 
  NDataTable, 
  NDatePicker, 
  NSelect, 
  NTag, 
  NIcon,
  useMessage,
  type DataTableColumns 
} from 'naive-ui';
import { 
  getAgentAuditTrailApi,
  type AgentAuditRecord 
} from '#/api/agency/agent-details';

interface Props {
  agentId?: number;
}

const props = withDefaults(defineProps<Props>(), {
  agentId: 0
});

const message = useMessage();

// Reactive data
const auditLoading = ref(false);
const auditRecords = ref<AgentAuditRecord[]>([]);

// Filters
const actionTypeFilter = ref('');
const actionStatusFilter = ref('');
const startDate = ref<number | null>(null);
const endDate = ref<number | null>(null);

// Pagination
const auditPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizePicker: true,
  pageSizes: [10, 20, 50],
  prefix: (info: any) => `共 ${info.itemCount} 条`,
  onUpdatePage: (page: number) => {
    auditPagination.current = page;
    loadAuditTrail();
  },
  onUpdatePageSize: (pageSize: number) => {
    auditPagination.pageSize = pageSize;
    auditPagination.current = 1;
    loadAuditTrail();
  },
});

// Options
const actionTypeOptions = [
  { label: '登录操作', value: 'login' },
  { label: '资料修改', value: 'profile_update' },
  { label: '状态变更', value: 'status_change' },
  { label: '佣金操作', value: 'commission' },
  { label: '系统操作', value: 'system' },
  { label: '其他操作', value: 'other' }
];

const actionStatusOptions = [
  { label: '成功', value: 'success' },
  { label: '失败', value: 'failed' },
  { label: '部分成功', value: 'partial' },
  { label: '待处理', value: 'pending' }
];

// Computed
const totalActions = computed(() => auditRecords.value.length);

const successfulActions = computed(() => 
  auditRecords.value.filter(record => record.status === 'success').length
);

const failedActions = computed(() => 
  auditRecords.value.filter(record => record.status === 'failed').length
);

const uniqueUsers = computed(() => {
  const users = new Set(auditRecords.value.map(record => record.operator));
  return users.size;
});

// Table columns
const auditColumns: DataTableColumns<AgentAuditRecord> = [
  {
    title: 'ID',
    key: 'id',
    width: 80,
    align: 'center',
    render: (row) => {
      return h('span', { class: 'text-xs text-gray-500 font-mono' }, `#${row.id}`);
    }
  },
  {
    title: '操作类型',
    key: 'actionType',
    width: 120,
    render: (row) => {
      const typeMap = {
        'login': { label: '登录操作', type: 'info', icon: '' },
        'profile_update': { label: '资料修改', type: 'warning', icon: '' },
        'status_change': { label: '状态变更', type: 'error', icon: '' },
        'commission': { label: '佣金操作', type: 'success', icon: '' },
        'system': { label: '系统操作', type: 'default', icon: '' },
        'other': { label: '其他操作', type: 'default', icon: '' }
      };
      const typeInfo = typeMap[row.actionType as keyof typeof typeMap] || { label: row.actionType, type: 'default', icon: '❓' };
      return h('div', { class: 'flex items-center gap-2' }, [
        h('span', { class: 'text-lg' }, typeInfo.icon),
        h(NTag, { type: typeInfo.type as any, size: 'small' }, { default: () => typeInfo.label })
      ]);
    }
  },
  {
    title: '操作名称',
    key: 'actionName',
    width: 120
  },
  {
    title: '描述',
    key: 'description',
    width: 200,
    ellipsis: true,
  },
  {
    title: '状态',
    key: 'status',
    width: 100,
    align: 'center',
    render: (row) => {
      const statusMap = {
        'success': { label: '成功', type: 'success', icon: '✅' },
        'failed': { label: '失败', type: 'error', icon: '❌' },
        'partial': { label: '部分成功', type: 'warning', icon: '⚠️' },
        'pending': { label: '待处理', type: 'info', icon: '⏳' }
      };
      const status = statusMap[row.status as keyof typeof statusMap] || { label: row.status, type: 'default', icon: '❓' };
      return h('div', { class: 'flex items-center justify-center gap-1' }, [
        h('span', { class: 'text-sm' }, status.icon),
        h(NTag, { type: status.type as any, size: 'small' }, { default: () => status.label })
      ]);
    }
  },
  {
    title: '操作员',
    key: 'operator',
    width: 120,
    render: (row) => {
      return h('div', { class: 'text-sm' }, [
        h('div', { class: 'font-medium' }, row.operator),
        h('div', { class: 'text-xs text-gray-500' }, row.operatorRole)
      ]);
    }
  },
  {
    title: '目标用户',
    key: 'targetUser',
    width: 120,
    render: (row) => {
      return row.targetUser ? h('span', { class: 'text-sm' }, row.targetUser) : h('span', { class: 'text-gray-400' }, '--');
    }
  },
  {
    title: 'IP地址',
    key: 'ipAddress',
    width: 120,
    render: (row) => {
      return h('span', { class: 'text-xs font-mono text-gray-600' }, row.ipAddress);
    }
  },
  {
    title: '操作时间',
    key: 'actionTime',
    width: 180,
    render: (row) => {
      return h('div', { class: 'text-sm' }, [
        h('div', { class: 'font-medium' }, formatDateTime(row.actionTime))
      ]);
    }
  },
  {
    title: '详情',
    key: 'details',
    width: 100,
    align: 'center',
    render: (row) => {
      if (!row.details) return h('span', { class: 'text-gray-400' }, '--');
      return h(NButton, {
        size: 'tiny',
        type: 'info',
        onClick: () => handleViewDetails(row)
      }, { default: () => '查看' });
    }
  }
];

// Methods
const loadAuditTrail = async () => {
  if (!props.agentId) return;
  
  auditLoading.value = true;
  try {
    const params: any = {
      page: auditPagination.current,
      pageSize: auditPagination.pageSize
    };
    
    if (actionTypeFilter.value) {
      params.actionType = actionTypeFilter.value;
    }
    
    if (actionStatusFilter.value) {
      params.status = actionStatusFilter.value;
    }
    
    if (startDate.value) {
      params.startDate = new Date(startDate.value).toISOString();
    }
    
    if (endDate.value) {
      const end = new Date(endDate.value);
      end.setHours(23, 59, 59, 999);
      params.endDate = end.toISOString();
    }
    
    const response = await getAgentAuditTrailApi(props.agentId, params);
    auditRecords.value = response.list;
    auditPagination.total = response.pagination.total;
    auditPagination.current = 1;
    
  } catch (error) {
    console.error('Failed to load audit trail:', error);
    message.error('加载审计日志失败');
  } finally {
    auditLoading.value = false;
  }
};

const handleResetFilter = () => {
  actionTypeFilter.value = '';
  actionStatusFilter.value = '';
  startDate.value = null;
  endDate.value = null;
  auditPagination.current = 1;
  loadAuditTrail();
};

const handleExportData = () => {
  message.info('导出数据功能开发中...');
};

const handleViewDetails = (record: AgentAuditRecord) => {
  if (record.details) {
    message.info(`查看详情: ${JSON.stringify(record.details, null, 2)}`);
  } else {
    message.info('暂无详细信息');
  }
};

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN');
};

onMounted(() => {
  if (props.agentId) {
    loadAuditTrail();
  }
});
</script>

<style scoped>
.user-audit-trail-tab {
  padding: 16px;
}

.mb-4 {
  margin-bottom: 1rem;
}

.mt-4 {
  margin-top: 1rem;
}

.ml-2 {
  margin-left: 0.5rem;
}

.ml-1 {
  margin-left: 0.25rem;
}

.text-sm {
  font-size: 0.875rem;
}

.text-xs {
  font-size: 0.75rem;
}

.font-medium {
  font-weight: 500;
}

.font-mono {
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace;
}

.text-gray-500 {
  color: #6b7280;
}

.text-gray-600 {
  color: #4b5563;
}

.text-gray-400 {
  color: #9ca3af;
}

.text-gray-700 {
  color: #374151;
}

.grid {
  display: grid;
}

.grid-cols-1 {
  grid-template-columns: repeat(1, minmax(0, 1fr));
}

.md\:grid-cols-4 {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.gap-4 {
  gap: 1rem;
}

.gap-2 {
  gap: 0.5rem;
}

.gap-1 {
  gap: 0.25rem;
}

.flex {
  display: flex;
}

.flex-wrap {
  flex-wrap: wrap;
}

.items-center {
  align-items: center;
}

.justify-between {
  justify-content: space-between;
}

.justify-center {
  justify-content: center;
}

.stat-card {
  text-align: center;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  background-color: #f9fafb;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
}
</style>
