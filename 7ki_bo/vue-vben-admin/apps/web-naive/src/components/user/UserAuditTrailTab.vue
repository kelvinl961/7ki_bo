<template>
  <div class="user-audit-trail-tab">
    <!-- Enhanced Query Section -->
    <n-card title="查询条件" class="query-card mb-4">
      <template #header-extra>
        <n-tag type="info" size="small"> 操作日志查询 </n-tag>
      </template>

      <div
        class="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        <!-- Date Range -->
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium text-gray-700">
            日期范围
          </label>
          <n-date-picker
            v-model:value="dateRange"
            type="daterange"
            placeholder="选择日期范围"
            :shortcuts="dateShortcuts"
            @update:value="handleDateRangeChange"
            clearable
          />
        </div>

        <!-- Action Filter -->
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium text-gray-700">
            操作项目
          </label>
          <n-select
            v-model:value="actionFilter"
            placeholder="选择操作项目"
            :options="actionOptions"
            clearable
            @update:value="handleFilterChange"
          />
        </div>

        <!-- Module Filter -->
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium text-gray-700">
            操作模块
          </label>
          <n-select
            v-model:value="moduleFilter"
            placeholder="选择操作模块"
            :options="moduleOptions"
            clearable
            @update:value="handleFilterChange"
          />
        </div>

        <!-- Result Filter -->
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium text-gray-700">
            操作结果
          </label>
          <n-select
            v-model:value="resultFilter"
            placeholder="选择操作结果"
            :options="resultOptions"
            clearable
            @update:value="handleFilterChange"
          />
        </div>

        <!-- Source Filter -->
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium text-gray-700">
            操作入口
          </label>
          <n-select
            v-model:value="sourceFilter"
            placeholder="选择操作入口"
            :options="sourceOptions"
            clearable
            @update:value="handleFilterChange"
          />
        </div>

        <!-- Operator Type Filter -->
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium text-gray-700">
            操作人类型
          </label>
          <n-select
            v-model:value="operatorTypeFilter"
            placeholder="选择操作人类型"
            :options="operatorTypeOptions"
            clearable
            @update:value="handleFilterChange"
          />
        </div>
      </div>

      <div class="flex flex-wrap gap-2">
        <n-button
          type="primary"
          @click="loadAuditTrails"
          :loading="loading"
          class="action-button"
        >
          查询日志
        </n-button>
        <n-button @click="handleReset" class="action-button"> 重置 </n-button>
        <n-button
          @click="loadAuditTrails"
          :disabled="loading"
          class="action-button"
        >
          刷新
        </n-button>
        <n-button
          @click="handleExport"
          :loading="exportLoading"
          class="action-button"
        >
          导出Excel
        </n-button>
      </div>

      <!-- Query Status -->
      <div v-if="lastQueryInfo" class="mt-4 border-t border-gray-200 pt-3">
        <div class="flex items-center gap-4 text-sm text-gray-600">
          <span>查询时间: {{ lastQueryInfo.timestamp }}</span>
          <span>数据范围: {{ lastQueryInfo.dateRange }}</span>
          <span>记录数: {{ lastQueryInfo.totalCount }}</span>
          <span>成功率: {{ lastQueryInfo.successRate }}%</span>
        </div>
      </div>
    </n-card>

    <!-- Statistics Cards -->
    <div v-if="stats" class="mb-6">
      <div class="mb-4 flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-800">统计概览</h3>
        <n-tag type="success" size="small"> 实时数据 </n-tag>
      </div>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <!-- Total Count -->
        <n-card size="small" class="stat-card stat-card-blue">
          <div class="stat-content">
            <div class="stat-info">
              <div class="stat-label">总操作数</div>
              <div class="stat-value">{{ stats.totalCount }}</div>
            </div>
          </div>
        </n-card>

        <!-- Success Count -->
        <n-card size="small" class="stat-card stat-card-green">
          <div class="stat-content">
            <div class="stat-info">
              <div class="stat-label">成功操作</div>
              <div class="stat-value">{{ stats.successCount }}</div>
            </div>
          </div>
        </n-card>

        <!-- Failed Count -->
        <n-card size="small" class="stat-card stat-card-red">
          <div class="stat-content">
            <div class="stat-info">
              <div class="stat-label">失败操作</div>
              <div class="stat-value">{{ stats.failedCount }}</div>
            </div>
          </div>
        </n-card>

        <!-- Success Rate -->
        <n-card size="small" class="stat-card stat-card-purple">
          <div class="stat-content">
            <div class="stat-info">
              <div class="stat-label">成功率</div>
              <div class="stat-value">{{ stats.successRate }}%</div>
            </div>
          </div>
        </n-card>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex h-64 items-center justify-center">
      <n-spin size="large" />
    </div>

    <!-- No Data State -->
    <div v-else-if="!hasData" class="py-12 text-center text-gray-500">
      <div class="mb-4 text-4xl"></div>
      <div class="text-lg font-medium">暂无操作日志</div>
      <div class="mt-2 text-sm text-gray-400">请选择日期范围后重新查询</div>
    </div>

    <!-- Audit Trail Table -->
    <n-card v-else class="audit-trail-table-card">
      <template #header>
        <div class="flex items-center gap-2">
          <span class="text-lg font-semibold">操作日志明细</span>
          <n-tag type="info" size="small"> 按时间降序 </n-tag>
        </div>
      </template>

      <template #header-extra>
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-2 text-sm text-gray-600">
            <span class="font-medium"
              >共 {{ pagination.itemCount }} 条记录</span
            >
            <span class="text-gray-400">|</span>
            <span
              >第 {{ pagination.page }} /
              {{
                Math.ceil(pagination.itemCount / pagination.pageSize)
              }}
              页</span
            >
          </div>
        </div>
      </template>

      <n-data-table
        :loading="loading"
        :columns="auditTrailColumns"
        :data="auditTrails"
        :pagination="pagination"
        size="small"
        :row-key="(row: UserAuditTrail) => row.id"
        :scroll-x="1600"
        bordered
        striped
        :row-class-name="getRowClassName"
        @update:page="handlePageChange"
        @update:page-size="handlePageSizeChange"
      />
    </n-card>

    <!-- Detail Modal -->
    <n-modal
      v-model:show="showDetailModal"
      preset="card"
      title="操作日志详情"
      style="width: 800px"
    >
      <div v-if="selectedAuditTrail" class="space-y-4">
        <n-descriptions bordered :column="2" size="small">
          <n-descriptions-item label="操作时间">
            {{ formatOperationTime(selectedAuditTrail.operationTime) }}
          </n-descriptions-item>
          <n-descriptions-item label="用户账号">
            {{ selectedAuditTrail.userAccount }}
          </n-descriptions-item>
          <n-descriptions-item label="操作项目">
            {{ getActionLabel(selectedAuditTrail.action) }}
          </n-descriptions-item>
          <n-descriptions-item label="操作模块">
            {{ getModuleLabel(selectedAuditTrail.module) }}
          </n-descriptions-item>
          <n-descriptions-item label="操作结果">
            <n-tag :type="getResultType(selectedAuditTrail.result)">
              {{ getResultLabel(selectedAuditTrail.result) }}
            </n-tag>
          </n-descriptions-item>
          <n-descriptions-item label="操作入口">
            {{ getSourceLabel(selectedAuditTrail.source) }}
          </n-descriptions-item>
          <n-descriptions-item label="操作人">
            {{ selectedAuditTrail.operatorName || '-' }}
          </n-descriptions-item>
          <n-descriptions-item label="操作人类型">
            {{ getOperatorTypeLabel(selectedAuditTrail.operatorType) }}
          </n-descriptions-item>
          <n-descriptions-item label="IP地址">
            {{ selectedAuditTrail.ipAddress || '-' }}
          </n-descriptions-item>
          <n-descriptions-item label="浏览器">
            {{ selectedAuditTrail.browserName || '-' }}
            {{ selectedAuditTrail.browserVersion || '' }}
          </n-descriptions-item>
          <n-descriptions-item label="操作系统">
            {{ selectedAuditTrail.operatingSystem || '-' }}
            {{ selectedAuditTrail.osVersion || '' }}
          </n-descriptions-item>
          <n-descriptions-item label="设备信息">
            {{ selectedAuditTrail.deviceBrand || '-' }}
            {{ selectedAuditTrail.deviceModel || '' }}
          </n-descriptions-item>
        </n-descriptions>

        <n-divider />

        <div class="space-y-2">
          <div class="text-sm font-medium text-gray-700">操作描述</div>
          <div class="rounded bg-gray-50 p-2 text-sm text-gray-600">
            {{ selectedAuditTrail.actionDescription }}
          </div>
        </div>

        <div
          v-if="selectedAuditTrail.oldValue || selectedAuditTrail.newValue"
          class="grid grid-cols-1 gap-4 md:grid-cols-2"
        >
          <div v-if="selectedAuditTrail.oldValue">
            <div class="mb-2 text-sm font-medium text-gray-700">变更前</div>
            <div
              class="rounded border border-red-200 bg-red-50 p-2 text-sm text-gray-600"
            >
              {{ selectedAuditTrail.oldValue }}
            </div>
          </div>
          <div v-if="selectedAuditTrail.newValue">
            <div class="mb-2 text-sm font-medium text-gray-700">变更后</div>
            <div
              class="rounded border border-green-200 bg-green-50 p-2 text-sm text-gray-600"
            >
              {{ selectedAuditTrail.newValue }}
            </div>
          </div>
        </div>

        <div v-if="selectedAuditTrail.errorMessage" class="space-y-2">
          <div class="text-sm font-medium text-red-700">错误信息</div>
          <div
            class="rounded border border-red-200 bg-red-50 p-2 text-sm text-red-600"
          >
            {{ selectedAuditTrail.errorMessage }}
          </div>
        </div>
      </div>

      <template #action>
        <n-button @click="showDetailModal = false">关闭</n-button>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, h } from 'vue';
import {
  NCard,
  NButton,
  NDatePicker,
  NDataTable,
  NSpin,
  NTag,
  NSelect,
  NModal,
  NDescriptions,
  NDescriptionsItem,
  NDivider,
} from 'naive-ui';
import {
  getUserAuditTrails,
  getAuditTrailStats,
  exportUserAuditTrails,
  formatOperationTime,
  getResultLabel,
  getResultType,
  getSourceLabel,
  getOperatorTypeLabel,
  getModuleLabel,
  getActionLabel,
  getFriendlyActionDescription,
  type UserAuditTrail,
  type AuditTrailStats,
  type AuditTrailFilters,
} from '#/api/core/userAuditTrail';

// ===================================
// PROPS & EMITS
// ===================================

interface Props {
  userId: number;
}

const props = defineProps<Props>();

// ===================================
// REACTIVE DATA
// ===================================

const loading = ref(false);
const exportLoading = ref(false);
const auditTrails = ref<UserAuditTrail[]>([]);
const stats = ref<AuditTrailStats | null>(null);
const dateRange = ref<[number, number] | null>(null);
const showDetailModal = ref(false);
const selectedAuditTrail = ref<UserAuditTrail | null>(null);

// Filters
const actionFilter = ref<string>('');
const moduleFilter = ref<string>('');
const resultFilter = ref<string>('');
const sourceFilter = ref<string>('');
const operatorTypeFilter = ref<string>('');

// Query tracking
const lastQueryInfo = ref<{
  timestamp: string;
  dateRange: string;
  totalCount: number;
  successRate: string;
} | null>(null);

// Pagination
const pagination = ref({
  page: 1,
  pageSize: 20,
  itemCount: 0,
  showSizePicker: true,
  pageSizes: [10, 20, 50, 100],
});

// ===================================
// COMPUTED
// ===================================

const hasData = computed(() => {
  return auditTrails.value.length > 0;
});

// ===================================
// FILTER OPTIONS
// ===================================

const actionOptions = ref([
  { label: '登录', value: 'login' },
  { label: '登出', value: 'logout' },
  { label: '注册', value: 'register' },
  { label: '更新资料', value: 'profile_update' },
  { label: '修改密码', value: 'password_change' },
  { label: '充值', value: 'deposit' },
  { label: '提现', value: 'withdrawal' },
  { label: '下注', value: 'bet_place' },
  { label: '中奖', value: 'bet_win' },
  { label: '输注', value: 'bet_lose' },
  { label: '领取奖金', value: 'bonus_claim' },
  { label: '上传证件', value: 'document_upload' },
  { label: '身份验证', value: 'verification' },
  { label: '账户锁定', value: 'account_lock' },
  { label: '账户解锁', value: 'account_unlock' },
  { label: '余额调整', value: 'balance_adjustment' },
]);

const moduleOptions = ref([
  { label: '账户管理', value: 'account' },
  { label: '财务管理', value: 'finance' },
  { label: '游戏管理', value: 'gaming' },
  { label: '个人资料', value: 'profile' },
  { label: '安全管理', value: 'security' },
  { label: '身份验证', value: 'verification' },
  { label: '优惠活动', value: 'promotion' },
  { label: '客服支持', value: 'support' },
]);

const resultOptions = ref([
  { label: '成功', value: 'success' },
  { label: '失败', value: 'failed' },
  { label: '处理中', value: 'pending' },
  { label: '已取消', value: 'cancelled' },
]);

const sourceOptions = ref([
  { label: '前台', value: 'frontend' },
  { label: '后台', value: 'backend' },
  { label: 'API', value: 'api' },
  { label: '移动端', value: 'mobile' },
  { label: '管理后台', value: 'admin_panel' },
  { label: '系统', value: 'system' },
]);

const operatorTypeOptions = ref([
  { label: '用户', value: 'user' },
  { label: '管理员', value: 'admin' },
  { label: '系统', value: 'system' },
]);

// ===================================
// DATE SHORTCUTS
// ===================================

const dateShortcuts = {
  今天: () => {
    const today = new Date();
    const start = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const end = new Date(start);
    return [start.getTime(), end.getTime()];
  },
  昨天: () => {
    const today = new Date();
    const start = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - 1,
    );
    const end = new Date(start);
    return [start.getTime(), end.getTime()];
  },
  最近7天: () => {
    const end = new Date();
    const start = new Date(
      end.getFullYear(),
      end.getMonth(),
      end.getDate() - 6,
    );
    return [start.getTime(), end.getTime()];
  },
  最近30天: () => {
    const end = new Date();
    const start = new Date(
      end.getFullYear(),
      end.getMonth(),
      end.getDate() - 29,
    );
    return [start.getTime(), end.getTime()];
  },
  本月: () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date();
    return [start.getTime(), end.getTime()];
  },
};

// ===================================
// TABLE COLUMNS
// ===================================

const auditTrailColumns = [
  {
    title: '操作时间',
    key: 'operationTime',
    width: 160,
    render: (row: UserAuditTrail) => {
      return h(
        'div',
        { class: 'text-sm' },
        formatOperationTime(row.operationTime),
      );
    },
  },
  {
    title: '操作项目',
    key: 'action',
    width: 120,
    render: (row: UserAuditTrail) => {
      return getActionLabel(row.action);
    },
  },
  {
    title: '操作',
    key: 'actionDescription',
    width: 200,
    ellipsis: {
      tooltip: true,
    },
    render: (row: UserAuditTrail) => {
      return getFriendlyActionDescription(row.action, row.actionDescription);
    },
  },
  {
    title: '变更前',
    key: 'oldValue',
    width: 150,
    ellipsis: {
      tooltip: true,
    },
    render: (row: UserAuditTrail) => {
      return row.oldValue || '无';
    },
  },
  {
    title: '变更后',
    key: 'newValue',
    width: 150,
    ellipsis: {
      tooltip: true,
    },
    render: (row: UserAuditTrail) => {
      return row.newValue || '无';
    },
  },
  {
    title: '操作结果',
    key: 'result',
    width: 100,
    render: (row: UserAuditTrail) => {
      return getResultLabel(row.result);
    },
  },
  {
    title: '操作入口',
    key: 'source',
    width: 120,
    render: (row: UserAuditTrail) => {
      return getSourceLabel(row.source);
    },
  },
  {
    title: '操作来源',
    key: 'operatorName',
    width: 120,
    render: (row: UserAuditTrail) => {
      return row.operatorName || '会员';
    },
  },
  {
    title: '操作人',
    key: 'operatorType',
    width: 100,
    render: (row: UserAuditTrail) => {
      return getOperatorTypeLabel(row.operatorType);
    },
  },
  {
    title: '客户端类型',
    key: 'platform',
    width: 120,
    render: (row: UserAuditTrail) => {
      return row.platform || '未知';
    },
  },
  {
    title: '浏览器品牌',
    key: 'browserName',
    width: 120,
    render: (row: UserAuditTrail) => {
      return row.browserName || '未知';
    },
  },
  {
    title: '操作系统',
    key: 'operatingSystem',
    width: 120,
    render: (row: UserAuditTrail) => {
      return row.operatingSystem || '未知';
    },
  },
  {
    title: '系统版本',
    key: 'osVersion',
    width: 100,
    render: (row: UserAuditTrail) => {
      return row.osVersion || '未知';
    },
  },
  {
    title: '设备品牌',
    key: 'deviceBrand',
    width: 100,
    render: (row: UserAuditTrail) => {
      return row.deviceBrand || '未知';
    },
  },
  {
    title: '设备型号',
    key: 'deviceModel',
    width: 120,
    render: (row: UserAuditTrail) => {
      return row.deviceModel || '未知';
    },
  },
];

// ===================================
// METHODS
// ===================================

const loadAuditTrails = async () => {
  if (!props.userId) {
    console.error('❌ User ID is required');
    return;
  }

  loading.value = true;

  try {
    const params: AuditTrailFilters = {
      userId: props.userId,
      page: pagination.value.page,
      pageSize: pagination.value.pageSize,
    };

    // Add filters
    if (dateRange.value && dateRange.value.length === 2) {
      const start = new Date(dateRange.value[0]);
      const end = new Date(dateRange.value[1]);
      const startISO = new Date(
        Date.UTC(
          start.getUTCFullYear(),
          start.getUTCMonth(),
          start.getUTCDate(),
          0,
          0,
          0,
          0,
        ),
      ).toISOString();
      const endISO = new Date(
        Date.UTC(
          end.getUTCFullYear(),
          end.getUTCMonth(),
          end.getUTCDate(),
          23,
          59,
          59,
          999,
        ),
      ).toISOString();
      params.startDate = startISO;
      params.endDate = endISO;
    }

    if (actionFilter.value) params.action = actionFilter.value;
    if (moduleFilter.value) params.module = moduleFilter.value;
    if (resultFilter.value) params.result = resultFilter.value;
    if (sourceFilter.value) params.source = sourceFilter.value;
    if (operatorTypeFilter.value)
      params.operatorType = operatorTypeFilter.value;

    console.log('🔍 Loading audit trails with params:', params);

    const response = await getUserAuditTrails(params);

    // Handle both response structures
    let data;
    if (response.code === 0 && response.data) {
      data = response.data;
    } else if ('list' in response) {
      data = response;
    } else {
      console.error('❌ Failed to load audit trails:', response);
      return;
    }

    auditTrails.value = data.list;
    pagination.value.itemCount = data.total;

    // Load stats
    await loadStats();

    // Update query info
    lastQueryInfo.value = {
      timestamp: new Date().toLocaleString('zh-CN'),
      dateRange: dateRange.value
        ? `${dateRange.value[0]} ~ ${dateRange.value[1]}`
        : '全部',
      totalCount: data.total,
      successRate: stats.value?.successRate || '0.00',
    };

    console.log('✅ Audit trails loaded:', {
      count: auditTrails.value.length,
      total: data.total,
      page: pagination.value.page,
    });
  } catch (error) {
    console.error('❌ Error loading audit trails:', error);
  } finally {
    loading.value = false;
  }
};

const loadStats = async () => {
  try {
    const params = {
      userId: props.userId,
      startDate: dateRange.value?.[0],
      endDate: dateRange.value?.[1],
    };

    const response = await getAuditTrailStats(params);

    if (response.code === 0 && response.data) {
      stats.value = response.data;
    } else if ('totalCount' in response) {
      stats.value = response;
    }
  } catch (error) {
    console.error('❌ Error loading stats:', error);
  }
};

const handlePageChange = (page: number) => {
  pagination.value.page = page;
  loadAuditTrails();
};

const handlePageSizeChange = (pageSize: number) => {
  pagination.value.pageSize = pageSize;
  pagination.value.page = 1;
  loadAuditTrails();
};

const handleDateRangeChange = () => {
  console.log('📅 Date range changed:', dateRange.value);
};

const handleFilterChange = () => {
  console.log('🔧 Filter changed');
  pagination.value.page = 1; // Reset to first page
};

const handleReset = () => {
  dateRange.value = null;
  actionFilter.value = '';
  moduleFilter.value = '';
  resultFilter.value = '';
  sourceFilter.value = '';
  operatorTypeFilter.value = '';
  pagination.value.page = 1;
  auditTrails.value = [];
  stats.value = null;
  lastQueryInfo.value = null;
  console.log('🔄 Reset audit trail filters');
};

const handleViewDetail = (row: UserAuditTrail) => {
  selectedAuditTrail.value = row;
  showDetailModal.value = true;
};

const handleExport = async () => {
  if (!props.userId) {
    console.error('❌ User ID is required');
    return;
  }

  exportLoading.value = true;

  try {
    const params: AuditTrailFilters = {
      userId: props.userId,
    };

    // Add filters
    if (dateRange.value && dateRange.value.length === 2) {
      params.startDate = dateRange.value[0];
      params.endDate = dateRange.value[1];
    }

    if (actionFilter.value) params.action = actionFilter.value;
    if (moduleFilter.value) params.module = moduleFilter.value;
    if (resultFilter.value) params.result = resultFilter.value;
    if (sourceFilter.value) params.source = sourceFilter.value;
    if (operatorTypeFilter.value)
      params.operatorType = operatorTypeFilter.value;

    const response = await exportUserAuditTrails(params);

    // Handle export data
    let exportData;
    if (response.code === 0 && response.data) {
      exportData = response.data;
    } else if (Array.isArray(response)) {
      exportData = response;
    } else {
      console.error('❌ Failed to export audit trails:', response);
      return;
    }

    // Convert to CSV and download
    const csvContent = convertToCSV(exportData);
    downloadCSV(
      csvContent,
      `用户${props.userId}_操作日志_${new Date().toISOString().split('T')[0]}.csv`,
    );

    console.log('📤 Exported audit trails:', exportData.length);
  } catch (error) {
    console.error('❌ Error exporting audit trails:', error);
  } finally {
    exportLoading.value = false;
  }
};

const convertToCSV = (data: any[]): string => {
  if (!data.length) return '';

  const headers = Object.keys(data[0]);
  const csvRows = [];

  // Add headers
  csvRows.push(headers.join(','));

  // Add data rows
  for (const row of data) {
    const values = headers.map((header) => {
      const value = row[header];
      return typeof value === 'string'
        ? `"${value.replace(/"/g, '""')}"`
        : value;
    });
    csvRows.push(values.join(','));
  }

  return csvRows.join('\n');
};

const downloadCSV = (csvContent: string, filename: string) => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

const getRowClassName = (row: UserAuditTrail) => {
  if (row.result === 'failed') {
    return 'failed-row';
  } else if (row.result === 'success') {
    return 'success-row';
  }
  return '';
};

// ===================================
// LIFECYCLE
// ===================================

onMounted(() => {
  console.log('🎯 UserAuditTrailTab mounted for user:', props.userId);
  // Load with default date range (last 7 days)
  dateRange.value = dateShortcuts['最近7天']();
  loadAuditTrails();
});
</script>

<style scoped>
.user-audit-trail-tab {
  @apply space-y-4;
}

/* Query Card Styles */
.query-card {
  @apply border border-gray-200 shadow-sm;
}

.action-button {
  @apply min-w-[100px] font-medium;
}

/* Statistics Card Styles */
.stat-card {
  @apply border-0 transition-all duration-300 hover:shadow-lg;
}

.stat-card:hover {
  @apply scale-105 transform;
}

.stat-card-blue {
  @apply border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100;
}

.stat-card-green {
  @apply border-green-200 bg-gradient-to-br from-green-50 to-green-100;
}

.stat-card-red {
  @apply border-red-200 bg-gradient-to-br from-red-50 to-red-100;
}

.stat-card-purple {
  @apply border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100;
}

.stat-content {
  @apply flex items-center gap-3;
}

.stat-info {
  @apply flex-1;
}

.stat-label {
  @apply mb-1 text-xs font-medium text-gray-600;
}

.stat-value {
  @apply text-xl font-bold text-gray-800;
}

/* Table Styles */
.audit-trail-table-card {
  @apply border border-gray-200 shadow-sm;
}

:deep(.n-data-table-th) {
  @apply bg-gray-50 font-semibold text-gray-700;
}

:deep(.n-data-table-td) {
  @apply border-b border-gray-100 py-3;
}

:deep(.n-data-table-tr:hover .n-data-table-td) {
  @apply bg-blue-50;
}

:deep(.success-row .n-data-table-td) {
  @apply bg-green-50;
}

:deep(.failed-row .n-data-table-td) {
  @apply bg-red-50;
}

/* Responsive Design */
@media (max-width: 768px) {
  .stat-content {
    @apply flex-col items-start;
  }

  .stat-value {
    @apply text-lg;
  }
}

/* Animation */
.stat-card {
  animation: fadeInUp 0.5s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
