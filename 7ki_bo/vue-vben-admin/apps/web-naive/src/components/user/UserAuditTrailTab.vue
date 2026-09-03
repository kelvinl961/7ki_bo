<template>
  <div class="user-audit-trail-tab">
    <!-- Enhanced Query Section -->
    <n-card :title="$t('user.auditTrail.queryConditions')" class="query-card mb-4">
      <template #header-extra>
        <n-tag type="info" size="small"> {{ $t('user.auditTrail.operationLogQuery') }} </n-tag>
      </template>

      <div
        class="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        <!-- Date Range -->
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium text-gray-700">
            {{ $t('user.auditTrail.dateRange') }}
          </label>
          <n-date-picker
            v-model:value="dateRange"
            type="daterange"
            :time-zone="timezone"
            :placeholder="$t('user.auditTrail.selectDateRange')"
            :shortcuts="dateShortcuts"
            @update:value="handleDateRangeChange"
            clearable
          />
        </div>

        <!-- Action Filter -->
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium text-gray-700">
            {{ $t('user.auditTrail.actionItem') }}
          </label>
          <n-select
            v-model:value="actionFilter"
            :placeholder="$t('user.auditTrail.selectActionItem')"
            :options="actionOptions"
            clearable
            @update:value="handleFilterChange"
          />
        </div>

        <!-- Module Filter -->
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium text-gray-700">
            {{ $t('user.auditTrail.actionModule') }}
          </label>
          <n-select
            v-model:value="moduleFilter"
            :placeholder="$t('user.auditTrail.selectActionModule')"
            :options="moduleOptions"
            clearable
            @update:value="handleFilterChange"
          />
        </div>

        <!-- Result Filter -->
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium text-gray-700">
            {{ $t('user.auditTrail.actionResult') }}
          </label>
          <n-select
            v-model:value="resultFilter"
            :placeholder="$t('user.auditTrail.selectActionResult')"
            :options="resultOptions"
            clearable
            @update:value="handleFilterChange"
          />
        </div>

        <!-- Source Filter -->
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium text-gray-700">
            {{ $t('user.auditTrail.actionSource') }}
          </label>
          <n-select
            v-model:value="sourceFilter"
            :placeholder="$t('user.auditTrail.selectActionSource')"
            :options="sourceOptions"
            clearable
            @update:value="handleFilterChange"
          />
        </div>

        <!-- Operator Type Filter -->
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium text-gray-700">
            {{ $t('user.auditTrail.operatorType') }}
          </label>
          <n-select
            v-model:value="operatorTypeFilter"
            :placeholder="$t('user.auditTrail.selectOperatorType')"
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
          {{ $t('user.auditTrail.queryLogs') }}
        </n-button>
        <n-button @click="handleReset" class="action-button"> {{ $t('common.reset') }} </n-button>
        <n-button
          @click="loadAuditTrails"
          :disabled="loading"
          class="action-button"
        >
          {{ $t('common.refresh') }}
        </n-button>
        <n-button
          @click="handleExport"
          :loading="exportLoading"
          class="action-button"
        >
          {{ $t('user.auditTrail.exportExcel') }}
        </n-button>
      </div>

      <!-- Query Status -->
      <div v-if="lastQueryInfo" class="mt-4 border-t border-gray-200 pt-3">
        <div class="flex items-center gap-4 text-sm text-gray-600">
          <span>{{ $t('user.auditTrail.queryTime') }}: <TzDateTime :value="lastQueryInfo.timestamp" /></span>
          <span>{{ $t('user.auditTrail.dataRange') }}: {{ lastQueryInfo.dateRange }}</span>
          <span>{{ $t('user.auditTrail.recordCount') }}: {{ lastQueryInfo.totalCount }}</span>
          <span>{{ $t('user.auditTrail.successRate') }}: {{ lastQueryInfo.successRate }}%</span>
        </div>
      </div>
    </n-card>

    <!-- Statistics Cards -->
    <div v-if="stats" class="mb-6">
      <div class="mb-4 flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-800">{{ $t('user.auditTrail.statsOverview') }}</h3>
        <n-tag type="success" size="small"> {{ $t('user.auditTrail.realtimeData') }} </n-tag>
      </div>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <!-- Total Count -->
        <n-card size="small" class="stat-card stat-card-blue">
          <div class="stat-content">
            <div class="stat-info">
              <div class="stat-label">{{ $t('user.auditTrail.totalOperations') }}</div>
              <div class="stat-value">{{ stats.totalCount }}</div>
            </div>
          </div>
        </n-card>

        <!-- Success Count -->
        <n-card size="small" class="stat-card stat-card-green">
          <div class="stat-content">
            <div class="stat-info">
              <div class="stat-label">{{ $t('user.auditTrail.successOperations') }}</div>
              <div class="stat-value">{{ stats.successCount }}</div>
            </div>
          </div>
        </n-card>

        <!-- Failed Count -->
        <n-card size="small" class="stat-card stat-card-red">
          <div class="stat-content">
            <div class="stat-info">
              <div class="stat-label">{{ $t('user.auditTrail.failedOperations') }}</div>
              <div class="stat-value">{{ stats.failedCount }}</div>
            </div>
          </div>
        </n-card>

        <!-- Success Rate -->
        <n-card size="small" class="stat-card stat-card-purple">
          <div class="stat-content">
            <div class="stat-info">
              <div class="stat-label">{{ $t('user.auditTrail.successRate') }}</div>
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
      <div class="text-lg font-medium">{{ $t('user.auditTrail.noLogs') }}</div>
      <div class="mt-2 text-sm text-gray-400">{{ $t('user.auditTrail.selectDateToQuery') }}</div>
    </div>

    <!-- Audit Trail Table -->
    <n-card v-else class="audit-trail-table-card">
      <template #header>
        <div class="flex items-center gap-2">
          <span class="text-lg font-semibold">{{ $t('user.auditTrail.logDetails') }}</span>
          <n-tag type="info" size="small"> {{ $t('user.auditTrail.sortByTimeDesc') }} </n-tag>
        </div>
      </template>

      <template #header-extra>
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-2 text-sm text-gray-600">
            <span class="font-medium">{{
              $t('user.auditTrail.totalRecords', [pagination.itemCount])
            }}</span>
            <span class="text-gray-400">|</span>
            <span>{{
              $t('user.auditTrail.pageOf', [
                pagination.page,
                Math.ceil(pagination.itemCount / pagination.pageSize),
              ])
            }}</span>
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
      :title="$t('user.auditTrail.logDetailTitle')"
      style="width: 800px"
    >
      <div v-if="selectedAuditTrail" class="space-y-4">
        <n-descriptions bordered :column="2" size="small">
          <n-descriptions-item :label="$t('common.operationTime')">
            <TzDateTime :value="selectedAuditTrail.operationTime" />
          </n-descriptions-item>
          <n-descriptions-item :label="$t('user.auditTrail.userAccount')">
            {{ selectedAuditTrail.userAccount }}
          </n-descriptions-item>
          <n-descriptions-item :label="$t('user.auditTrail.actionItem')">
            {{ getActionLabel(selectedAuditTrail.action) }}
          </n-descriptions-item>
          <n-descriptions-item :label="$t('user.auditTrail.actionModule')">
            {{ getModuleLabel(selectedAuditTrail.module) }}
          </n-descriptions-item>
          <n-descriptions-item :label="$t('user.auditTrail.actionResult')">
            <n-tag :type="getResultType(selectedAuditTrail.result)">
              {{ getResultLabel(selectedAuditTrail.result) }}
            </n-tag>
          </n-descriptions-item>
          <n-descriptions-item :label="$t('user.auditTrail.actionSource')">
            {{ getSourceLabel(selectedAuditTrail.source) }}
          </n-descriptions-item>
          <n-descriptions-item :label="$t('common.operator')">
            {{ selectedAuditTrail.operatorName || '-' }}
          </n-descriptions-item>
          <n-descriptions-item :label="$t('user.auditTrail.operatorType')">
            {{ getOperatorTypeLabel(selectedAuditTrail.operatorType) }}
          </n-descriptions-item>
          <n-descriptions-item :label="$t('user.auditTrail.ipAddress')">
            {{ selectedAuditTrail.ipAddress || '-' }}
          </n-descriptions-item>
          <n-descriptions-item :label="$t('user.auditTrail.browser')">
            {{ selectedAuditTrail.browserName || '-' }}
            {{ selectedAuditTrail.browserVersion || '' }}
          </n-descriptions-item>
          <n-descriptions-item :label="$t('user.auditTrail.browser')">
            {{ selectedAuditTrail.operatingSystem || '-' }}
            {{ selectedAuditTrail.osVersion || '' }}
          </n-descriptions-item>
          <n-descriptions-item :label="$t('user.auditTrail.deviceInfo')">
            {{ selectedAuditTrail.deviceBrand || '-' }}
            {{ selectedAuditTrail.deviceModel || '' }}
          </n-descriptions-item>
        </n-descriptions>

        <n-divider />

        <div class="space-y-2">
          <div class="text-sm font-medium text-gray-700">{{ $t('user.auditTrail.actionDescription') }}</div>
          <div class="rounded bg-gray-50 p-2 text-sm text-gray-600">
            {{ selectedAuditTrail.actionDescription }}
          </div>
        </div>

        <div
          v-if="selectedAuditTrail.oldValue || selectedAuditTrail.newValue"
          class="grid grid-cols-1 gap-4 md:grid-cols-2"
        >
          <div v-if="selectedAuditTrail.oldValue">
            <div class="mb-2 text-sm font-medium text-gray-700">{{ $t('user.auditTrail.valueBefore') }}</div>
            <div
              class="rounded border border-red-200 bg-red-50 p-2 text-sm text-gray-600"
            >
              {{ selectedAuditTrail.oldValue }}
            </div>
          </div>
          <div v-if="selectedAuditTrail.newValue">
            <div class="mb-2 text-sm font-medium text-gray-700">{{ $t('user.auditTrail.valueAfter') }}</div>
            <div
              class="rounded border border-green-200 bg-green-50 p-2 text-sm text-gray-600"
            >
              {{ selectedAuditTrail.newValue }}
            </div>
          </div>
        </div>

        <div v-if="selectedAuditTrail.errorMessage" class="space-y-2">
          <div class="text-sm font-medium text-red-700">{{ $t('user.auditTrail.errorMessage') }}</div>
          <div
            class="rounded border border-red-200 bg-red-50 p-2 text-sm text-red-600"
          >
            {{ selectedAuditTrail.errorMessage }}
          </div>
        </div>
      </div>

      <template #action>
        <n-button @click="showDetailModal = false">{{ $t('common.close') }}</n-button>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { $t } from '@vben/locales';

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
import TzDateTime from '#/components/common/TzDateTime.vue';
import { renderTzDateTime } from '#/components/common/tzDateTimeRender';
import { useDisplayTimezone } from '#/composables/useDisplayTimezone';
import { formatDateTimeInTimezone } from '#/utils/timezoneUtils';
import {
  getUserAuditTrails,
  getAuditTrailStats,
  exportUserAuditTrails,
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
const { timezone } = useDisplayTimezone();

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

const actionOptions = computed(() => [
  { label: $t('user.auditTrail.actionLogin'), value: 'login' },
  { label: $t('user.auditTrail.actionLogout'), value: 'logout' },
  { label: $t('user.auditTrail.actionRegister'), value: 'register' },
  { label: $t('user.auditTrail.actionProfileUpdate'), value: 'profile_update' },
  { label: $t('user.auditTrail.actionPasswordChange'), value: 'password_change' },
  { label: $t('user.auditTrail.actionDeposit'), value: 'deposit' },
  { label: $t('user.auditTrail.actionWithdrawal'), value: 'withdrawal' },
  { label: $t('user.auditTrail.actionBetPlace'), value: 'bet_place' },
  { label: $t('user.auditTrail.actionBetWin'), value: 'bet_win' },
  { label: $t('user.auditTrail.actionBetLose'), value: 'bet_lose' },
  { label: $t('user.auditTrail.actionBonusClaim'), value: 'bonus_claim' },
  { label: $t('user.auditTrail.actionDocumentUpload'), value: 'document_upload' },
  { label: $t('user.auditTrail.actionVerification'), value: 'verification' },
  { label: $t('user.auditTrail.actionAccountLock'), value: 'account_lock' },
  { label: $t('user.auditTrail.actionAccountUnlock'), value: 'account_unlock' },
  { label: $t('user.auditTrail.actionBalanceAdjustment'), value: 'balance_adjustment' },
]);

const moduleOptions = computed(() => [
  { label: $t('user.auditTrail.moduleAccount'), value: 'account' },
  { label: $t('user.auditTrail.moduleFinance'), value: 'finance' },
  { label: $t('user.auditTrail.moduleGaming'), value: 'gaming' },
  { label: $t('user.auditTrail.moduleProfile'), value: 'profile' },
  { label: $t('user.auditTrail.moduleSecurity'), value: 'security' },
  { label: $t('user.auditTrail.moduleVerification'), value: 'verification' },
  { label: $t('user.auditTrail.modulePromotion'), value: 'promotion' },
  { label: $t('user.auditTrail.moduleSupport'), value: 'support' },
]);

const resultOptions = computed(() => [
  { label: $t('user.auditTrail.resultSuccess'), value: 'success' },
  { label: $t('user.auditTrail.resultFailed'), value: 'failed' },
  { label: $t('user.auditTrail.resultPending'), value: 'pending' },
  { label: $t('user.auditTrail.resultCancelled'), value: 'cancelled' },
]);

const sourceOptions = computed(() => [
  { label: $t('user.auditTrail.sourceFrontend'), value: 'frontend' },
  { label: $t('user.auditTrail.sourceBackend'), value: 'backend' },
  { label: $t('user.auditTrail.sourceApi'), value: 'api' },
  { label: $t('user.auditTrail.sourceMobile'), value: 'mobile' },
  { label: $t('user.auditTrail.sourceAdminPanel'), value: 'admin_panel' },
  { label: $t('user.auditTrail.sourceSystem'), value: 'system' },
]);

const operatorTypeOptions = computed(() => [
  { label: $t('user.auditTrail.operatorUser'), value: 'user' },
  { label: $t('user.auditTrail.operatorAdmin'), value: 'admin' },
  { label: $t('user.auditTrail.operatorSystem'), value: 'system' },
]);

// ===================================
// DATE SHORTCUTS
// ===================================

const dateShortcuts = computed(() => {
  const last7 = () => {
    const end = new Date();
    const start = new Date(end.getFullYear(), end.getMonth(), end.getDate() - 6);
    return [start.getTime(), end.getTime()];
  };
  return {
    [$t('common.today')]: () => {
      const today = new Date();
      const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const end = new Date(start);
      return [start.getTime(), end.getTime()];
    },
    [$t('advancedSearch.yesterday')]: () => {
      const today = new Date();
      const start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
      const end = new Date(start);
      return [start.getTime(), end.getTime()];
    },
    [$t('user.auditTrail.last7Days')]: last7,
    [$t('user.auditTrail.last30Days')]: () => {
      const end = new Date();
      const start = new Date(end.getFullYear(), end.getMonth(), end.getDate() - 29);
      return [start.getTime(), end.getTime()];
    },
    [$t('common.thisMonth')]: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date();
      return [start.getTime(), end.getTime()];
    },
  };
});

const last7DaysShortcut = computed(() => {
  const shortcuts = dateShortcuts.value;
  return shortcuts[$t('user.auditTrail.last7Days')] || Object.values(shortcuts)[2];
});

// ===================================
// TABLE COLUMNS
// ===================================

const auditTrailColumns = computed(() => [
  {
    title: $t('common.operationTime'),
    key: 'operationTime',
    width: 160,
    render: (row: UserAuditTrail) => renderTzDateTime(row.operationTime),
  },
  {
    title: $t('user.auditTrail.actionItem'),
    key: 'action',
    width: 120,
    render: (row: UserAuditTrail) => {
      return getActionLabel(row.action);
    },
  },
  {
    title: $t('user.auditTrail.actionCol'),
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
    title: $t('user.auditTrail.valueBefore'),
    key: 'oldValue',
    width: 150,
    ellipsis: {
      tooltip: true,
    },
    render: (row: UserAuditTrail) => {
      return row.oldValue || $t('user.userDetail.none');
    },
  },
  {
    title: $t('user.auditTrail.valueAfter'),
    key: 'newValue',
    width: 150,
    ellipsis: {
      tooltip: true,
    },
    render: (row: UserAuditTrail) => {
      return row.newValue || $t('user.userDetail.none');
    },
  },
  {
    title: $t('user.auditTrail.actionResult'),
    key: 'result',
    width: 100,
    render: (row: UserAuditTrail) => {
      return getResultLabel(row.result);
    },
  },
  {
    title: $t('user.auditTrail.actionSource'),
    key: 'source',
    width: 120,
    render: (row: UserAuditTrail) => {
      return getSourceLabel(row.source);
    },
  },
  {
    title: $t('user.auditTrail.actionSourceCol'),
    key: 'operatorName',
    width: 120,
    render: (row: UserAuditTrail) => {
      return row.operatorName || $t('user.auditTrail.memberOperator');
    },
  },
  {
    title: $t('user.auditTrail.operatorCol'),
    key: 'operatorType',
    width: 100,
    render: (row: UserAuditTrail) => {
      return getOperatorTypeLabel(row.operatorType);
    },
  },
  {
    title: $t('user.auditTrail.clientType'),
    key: 'platform',
    width: 120,
    render: (row: UserAuditTrail) => {
      return row.platform || $t('user.userDetail.unknown');
    },
  },
  {
    title: $t('user.auditTrail.browserBrand'),
    key: 'browserName',
    width: 120,
    render: (row: UserAuditTrail) => {
      return row.browserName || $t('user.userDetail.unknown');
    },
  },
  {
    title: $t('user.auditTrail.browser'),
    key: 'operatingSystem',
    width: 120,
    render: (row: UserAuditTrail) => {
      return row.operatingSystem || $t('user.userDetail.unknown');
    },
  },
  {
    title: $t('user.auditTrail.osVersion'),
    key: 'osVersion',
    width: 100,
    render: (row: UserAuditTrail) => {
      return row.osVersion || $t('user.userDetail.unknown');
    },
  },
  {
    title: $t('user.auditTrail.deviceBrand'),
    key: 'deviceBrand',
    width: 100,
    render: (row: UserAuditTrail) => {
      return row.deviceBrand || $t('user.userDetail.unknown');
    },
  },
  {
    title: $t('user.auditTrail.deviceModel'),
    key: 'deviceModel',
    width: 120,
    render: (row: UserAuditTrail) => {
      return row.deviceModel || $t('user.userDetail.unknown');
    },
  },
]);

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
      timestamp: new Date().toISOString(),
      dateRange: dateRange.value
        ? `${dateRange.value[0]} ~ ${dateRange.value[1]}`
        : $t('user.auditTrail.allData'),
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
      $t('user.auditTrail.exportFileName', [
        String(props.userId),
        new Date().toISOString().split('T')[0],
      ]),
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
      if (header === 'operationTime' && value) {
        const formatted = formatDateTimeInTimezone(value);
        return `"${formatted.replace(/"/g, '""')}"`;
      }
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
  dateRange.value = last7DaysShortcut.value();
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
