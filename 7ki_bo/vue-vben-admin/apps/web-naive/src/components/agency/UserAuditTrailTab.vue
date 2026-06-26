<template>
  <div class="user-audit-trail-tab">
    <n-card :title="$t('agency.auditTrail.filterConditions')" class="mb-4">
      <div class="flex flex-wrap items-end gap-4">
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium text-gray-700">{{ $t('agency.auditTrail.actionType') }}</label>
          <n-select
            v-model:value="actionTypeFilter"
            :placeholder="$t('agency.auditTrail.selectActionType')"
            clearable
            style="width: 140px"
            :options="actionTypeOptions"
            @update:value="loadAuditTrail"
          />
        </div>
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium text-gray-700">{{ $t('agency.auditTrail.actionStatus') }}</label>
          <n-select
            v-model:value="actionStatusFilter"
            :placeholder="$t('agency.auditTrail.selectStatus')"
            clearable
            style="width: 120px"
            :options="actionStatusOptions"
            @update:value="loadAuditTrail"
          />
        </div>
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium text-gray-700">{{ $t('agency.auditTrail.startDate') }}</label>
          <n-date-picker
            v-model:value="startDate"
            type="date"
            :placeholder="$t('agency.auditTrail.selectStartDate')"
            style="width: 150px"
            @update:value="loadAuditTrail"
          />
        </div>
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium text-gray-700">{{ $t('agency.auditTrail.endDate') }}</label>
          <n-date-picker
            v-model:value="endDate"
            type="date"
            :placeholder="$t('agency.auditTrail.selectEndDate')"
            style="width: 150px"
            @update:value="loadAuditTrail"
          />
        </div>
        <n-button
          type="primary"
          @click="loadAuditTrail"
          class="flex items-center gap-1"
        >
          🔍 {{ $t('common.query') }}
        </n-button>
        <n-button @click="handleResetFilter" class="flex items-center gap-1">
          {{ $t('common.reset') }}
        </n-button>
      </div>
    </n-card>

    <n-card>
      <template #header>
        <div class="flex items-center justify-between">
          <span class="text-lg font-medium">{{
            $t('agency.auditTrail.agentOperationLog')
          }}</span>
          <div class="flex items-center gap-2 text-sm text-gray-500">
            <span>{{
              $t('agency.auditTrail.recordCount', [auditRecords.length || 0])
            }}</span>
            <n-button size="tiny" @click="loadAuditTrail" class="ml-2">
              {{ $t('agency.auditTrail.reload') }}
            </n-button>
            <n-button size="tiny" @click="handleExportData" class="ml-1">
              {{ $t('agency.auditTrail.exportData') }}
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

    <n-card :title="$t('agency.auditTrail.operationStats')" class="mt-4">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div class="stat-card">
          <div class="stat-value">{{ totalActions }}</div>
          <div class="stat-label">{{ $t('agency.auditTrail.totalActions') }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ successfulActions }}</div>
          <div class="stat-label">
            {{ $t('agency.auditTrail.successfulActions') }}
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ failedActions }}</div>
          <div class="stat-label">{{ $t('agency.auditTrail.failedActions') }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ uniqueUsers }}</div>
          <div class="stat-label">{{ $t('agency.auditTrail.uniqueUsers') }}</div>
        </div>
      </div>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { $t } from '@vben/locales';

import { ref, reactive, computed, h, onMounted } from 'vue';
import {
  NCard,
  NButton,
  NDataTable,
  NDatePicker,
  NSelect,
  NTag,
  useMessage,
  type DataTableColumns,
} from 'naive-ui';
import {
  getAgentAuditTrailApi,
  type AgentAuditRecord,
} from '#/api/agency/agent-details';

interface Props {
  agentId?: number;
}

const props = withDefaults(defineProps<Props>(), {
  agentId: 0,
});

const message = useMessage();
const auditLoading = ref(false);
const auditRecords = ref<AgentAuditRecord[]>([]);
const actionTypeFilter = ref('');
const actionStatusFilter = ref('');
const startDate = ref<number | null>(null);
const endDate = ref<number | null>(null);

const auditPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizePicker: true,
  pageSizes: [10, 20, 50],
  prefix: (info: { itemCount: number }) =>
    $t('agency.auditTrail.recordCount', [info.itemCount]),
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

const actionTypeOptions = computed(() => [
  { label: $t('agency.auditTrail.login'), value: 'login' },
  { label: $t('agency.auditTrail.profileUpdate'), value: 'profile_update' },
  { label: $t('agency.auditTrail.statusChange'), value: 'status_change' },
  { label: $t('agency.auditTrail.commissionAction'), value: 'commission' },
  { label: $t('agency.auditTrail.systemAction'), value: 'system' },
  { label: $t('agency.auditTrail.otherAction'), value: 'other' },
]);

const actionStatusOptions = computed(() => [
  { label: $t('common.success'), value: 'success' },
  { label: $t('common.failed'), value: 'failed' },
  { label: $t('agency.auditTrail.partial'), value: 'partial' },
  { label: $t('agency.auditTrail.pending'), value: 'pending' },
]);

const totalActions = computed(() => auditRecords.value.length);
const successfulActions = computed(
  () => auditRecords.value.filter((record) => record.status === 'success').length,
);
const failedActions = computed(
  () => auditRecords.value.filter((record) => record.status === 'failed').length,
);
const uniqueUsers = computed(() => {
  const users = new Set(auditRecords.value.map((record) => record.operator));
  return users.size;
});

const getActionTypeInfo = (actionType: string) => {
  const map: Record<string, { label: string; type: string; icon: string }> = {
    login: { label: $t('agency.auditTrail.login'), type: 'info', icon: '' },
    profile_update: {
      label: $t('agency.auditTrail.profileUpdate'),
      type: 'warning',
      icon: '',
    },
    status_change: {
      label: $t('agency.auditTrail.statusChange'),
      type: 'error',
      icon: '',
    },
    commission: {
      label: $t('agency.auditTrail.commissionAction'),
      type: 'success',
      icon: '',
    },
    system: { label: $t('agency.auditTrail.systemAction'), type: 'default', icon: '' },
    other: { label: $t('agency.auditTrail.otherAction'), type: 'default', icon: '' },
  };
  return (
    map[actionType] || { label: actionType, type: 'default', icon: '❓' }
  );
};

const auditColumns = computed<DataTableColumns<AgentAuditRecord>>(() => [
  {
    title: 'ID',
    key: 'id',
    width: 80,
    align: 'center',
    render: (row) =>
      h('span', { class: 'text-xs text-gray-500 font-mono' }, `#${row.id}`),
  },
  {
    title: $t('agency.auditTrail.actionType'),
    key: 'actionType',
    width: 120,
    render: (row) => {
      const typeInfo = getActionTypeInfo(row.actionType);
      return h('div', { class: 'flex items-center gap-2' }, [
        h('span', { class: 'text-lg' }, typeInfo.icon),
        h(
          NTag,
          { type: typeInfo.type as any, size: 'small' },
          { default: () => typeInfo.label },
        ),
      ]);
    },
  },
  {
    title: $t('agency.auditTrail.actionName'),
    key: 'actionName',
    width: 120,
  },
  {
    title: $t('common.description'),
    key: 'description',
    width: 200,
    ellipsis: true,
  },
  {
    title: $t('common.status'),
    key: 'status',
    width: 100,
    align: 'center',
    render: (row) => {
      const statusMap: Record<string, { label: string; type: string; icon: string }> = {
        success: { label: $t('common.success'), type: 'success', icon: '✅' },
        failed: { label: $t('common.failed'), type: 'error', icon: '❌' },
        partial: {
          label: $t('agency.auditTrail.partial'),
          type: 'warning',
          icon: '⚠️',
        },
        pending: {
          label: $t('agency.auditTrail.pending'),
          type: 'info',
          icon: '⏳',
        },
      };
      const status = statusMap[row.status] || {
        label: row.status,
        type: 'default',
        icon: '❓',
      };
      return h('div', { class: 'flex items-center justify-center gap-1' }, [
        h('span', { class: 'text-sm' }, status.icon),
        h(
          NTag,
          { type: status.type as any, size: 'small' },
          { default: () => status.label },
        ),
      ]);
    },
  },
  {
    title: $t('common.operator'),
    key: 'operator',
    width: 120,
    render: (row) =>
      h('div', { class: 'text-sm' }, [
        h('div', { class: 'font-medium' }, row.operator),
        h('div', { class: 'text-xs text-gray-500' }, row.operatorRole),
      ]),
  },
  {
    title: $t('agency.auditTrail.targetUser'),
    key: 'targetUser',
    width: 120,
    render: (row) =>
      row.targetUser
        ? h('span', { class: 'text-sm' }, row.targetUser)
        : h('span', { class: 'text-gray-400' }, '--'),
  },
  {
    title: $t('agency.loginDevices.ipAddress'),
    key: 'ipAddress',
    width: 120,
    render: (row) =>
      h('span', { class: 'text-xs font-mono text-gray-600' }, row.ipAddress),
  },
  {
    title: $t('common.operationTime'),
    key: 'actionTime',
    width: 180,
    render: (row) =>
      h('div', { class: 'text-sm' }, [
        h('div', { class: 'font-medium' }, formatDateTime(row.actionTime)),
      ]),
  },
  {
    title: $t('common.detail'),
    key: 'details',
    width: 100,
    align: 'center',
    render: (row) => {
      if (!row.details) return h('span', { class: 'text-gray-400' }, '--');
      return h(
        NButton,
        {
          size: 'tiny',
          type: 'info',
          onClick: () => handleViewDetails(row),
        },
        { default: () => $t('agency.auditTrail.viewDetails') },
      );
    },
  },
]);

const loadAuditTrail = async () => {
  if (!props.agentId) return;

  auditLoading.value = true;
  try {
    const params: Record<string, unknown> = {
      page: auditPagination.current,
      pageSize: auditPagination.pageSize,
    };
    if (actionTypeFilter.value) params.actionType = actionTypeFilter.value;
    if (actionStatusFilter.value) params.status = actionStatusFilter.value;
    if (startDate.value) params.startDate = new Date(startDate.value).toISOString();
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
    message.error($t('agency.auditTrail.loadFailed'));
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
  message.info($t('agency.auditTrail.exportDeveloping'));
};

const handleViewDetails = (record: AgentAuditRecord) => {
  if (record.details) {
    message.info(
      `${$t('agency.auditTrail.viewDetailsPrefix')}${JSON.stringify(record.details, null, 2)}`,
    );
  } else {
    message.info($t('agency.auditTrail.noDetails'));
  }
};

const formatDateTime = (dateString: string) =>
  new Date(dateString).toLocaleString();

onMounted(() => {
  if (props.agentId) loadAuditTrail();
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
  font-family:
    ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation Mono', Menlo,
    monospace;
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
