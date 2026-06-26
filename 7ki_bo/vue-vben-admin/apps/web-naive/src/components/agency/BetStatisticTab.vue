<template>
  <div class="bet-statistic-tab">
    <div class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
      <n-card size="small" class="summary-card">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm text-gray-500">
              {{ $t('agency.betStatistic.totalBetAmount') }}
            </div>
            <div class="text-xl font-bold text-blue-600">
              {{ formatCurrency(totalBetAmount) }}
            </div>
          </div>
          <div class="text-2xl text-blue-500">🎯</div>
        </div>
      </n-card>

      <n-card size="small" class="summary-card">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm text-gray-500">
              {{ $t('agency.betStatistic.validBetAmount') }}
            </div>
            <div class="text-xl font-bold text-green-600">
              {{ formatCurrency(validBetAmount) }}
            </div>
          </div>
          <div class="text-2xl text-green-500">✅</div>
        </div>
      </n-card>

      <n-card size="small" class="summary-card">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm text-gray-500">
              {{ $t('agency.betStatistic.totalWinLoss') }}
            </div>
            <div
              class="text-xl font-bold"
              :class="totalWinLoss >= 0 ? 'text-green-600' : 'text-red-600'"
            >
              {{ formatCurrency(totalWinLoss) }}
            </div>
          </div>
          <div
            class="text-2xl"
            :class="totalWinLoss >= 0 ? 'text-green-500' : 'text-red-500'"
          >
            {{ totalWinLoss >= 0 ? '💰' : '💸' }}
          </div>
        </div>
      </n-card>

      <n-card size="small" class="summary-card">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm text-gray-500">
              {{ $t('agency.betStatistic.betCount') }}
            </div>
            <div class="text-xl font-bold text-purple-600">
              {{ totalBetCount }}
            </div>
          </div>
          <div class="text-2xl text-purple-500">📊</div>
        </div>
      </n-card>
    </div>

    <n-card :title="$t('agency.betStatistic.filterConditions')" class="mb-4">
      <div class="flex flex-wrap items-end gap-4">
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium text-gray-700">{{ $t('agency.betStatistic.gameType') }}</label>
          <n-select
            v-model:value="gameTypeFilter"
            :placeholder="$t('agency.betStatistic.selectGameType')"
            clearable
            style="width: 140px"
            :options="gameTypeOptions"
            @update:value="loadBetStatistics"
          />
        </div>
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium text-gray-700">{{ $t('common.status') }}</label>
          <n-select
            v-model:value="betStatusFilter"
            :placeholder="$t('agency.betStatistic.selectStatus')"
            clearable
            style="width: 120px"
            :options="betStatusOptions"
            @update:value="loadBetStatistics"
          />
        </div>
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium text-gray-700">{{ $t('agency.betStatistic.startDate') }}</label>
          <n-date-picker
            v-model:value="startDate"
            type="date"
            :placeholder="$t('agency.betStatistic.selectStartDate')"
            style="width: 150px"
            @update:value="loadBetStatistics"
          />
        </div>
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium text-gray-700">{{ $t('agency.betStatistic.endDate') }}</label>
          <n-date-picker
            v-model:value="endDate"
            type="date"
            :placeholder="$t('agency.betStatistic.selectEndDate')"
            style="width: 150px"
            @update:value="loadBetStatistics"
          />
        </div>
        <n-button
          type="primary"
          @click="loadBetStatistics"
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
            $t('agency.betStatistic.betRecords')
          }}</span>
          <div class="flex items-center gap-2 text-sm text-gray-500">
            <span>{{
              $t('agency.betStatistic.recordCount', [betRecords.length || 0])
            }}</span>
            <n-button size="tiny" @click="loadBetStatistics" class="ml-2">
              {{ $t('agency.betStatistic.reload') }}
            </n-button>
            <n-button size="tiny" @click="handleExportData" class="ml-1">
              {{ $t('agency.betStatistic.exportData') }}
            </n-button>
          </div>
        </div>
      </template>
      <n-data-table
        :loading="betLoading"
        :columns="betColumns"
        :data="betRecords"
        :pagination="betPagination"
        size="small"
        :row-key="(row: AgentBetRecord) => row.id"
        :scroll-x="1200"
      />
    </n-card>

    <n-card :title="$t('agency.betStatistic.trendChart')" class="mt-4">
      <div class="py-12 text-center text-gray-500">
        <n-icon size="48" class="mb-4">
          <BarChartOutline />
        </n-icon>
        <div class="mb-2 text-lg font-medium">
          {{ $t('agency.betStatistic.chartDeveloping') }}
        </div>
        <div class="text-sm">{{ $t('agency.betStatistic.chartHint') }}</div>
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
  NIcon,
  useMessage,
  type DataTableColumns,
} from 'naive-ui';
import { BarChartOutline } from '@vicons/ionicons5';
import {
  getAgentBetStatisticsApi,
  type AgentBetRecord,
} from '#/api/agency/agent-details';

interface Props {
  agentId?: number;
}

const props = withDefaults(defineProps<Props>(), {
  agentId: 0,
});

const message = useMessage();
const betLoading = ref(false);
const betRecords = ref<AgentBetRecord[]>([]);
const gameTypeFilter = ref('');
const betStatusFilter = ref('');
const startDate = ref<number | null>(null);
const endDate = ref<number | null>(null);

const betPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizePicker: true,
  pageSizes: [10, 20, 50],
  prefix: (info: { itemCount: number }) =>
    $t('agency.betStatistic.recordCount', [info.itemCount]),
  onUpdatePage: (page: number) => {
    betPagination.current = page;
    loadBetStatistics();
  },
  onUpdatePageSize: (pageSize: number) => {
    betPagination.pageSize = pageSize;
    betPagination.current = 1;
    loadBetStatistics();
  },
});

const gameTypeOptions = computed(() => [
  { label: $t('agency.betStatistic.sports'), value: 'sports' },
  { label: $t('agency.betStatistic.live'), value: 'live' },
  { label: $t('agency.betStatistic.slot'), value: 'slot' },
  { label: $t('agency.betStatistic.lottery'), value: 'lottery' },
  { label: $t('agency.betStatistic.chess'), value: 'chess' },
  { label: $t('agency.betStatistic.blockchain'), value: 'blockchain' },
]);

const betStatusOptions = computed(() => [
  { label: $t('agency.betStatistic.settled'), value: 'settled' },
  { label: $t('agency.betStatistic.unsettled'), value: 'unsettled' },
  { label: $t('agency.betStatistic.cancelled'), value: 'cancelled' },
  { label: $t('agency.betStatistic.refunded'), value: 'refunded' },
]);

const totalBetAmount = computed(() =>
  betRecords.value.reduce((sum, record) => sum + record.betAmount, 0),
);
const validBetAmount = computed(() =>
  betRecords.value.reduce((sum, record) => sum + record.validAmount, 0),
);
const totalWinLoss = computed(() =>
  betRecords.value.reduce((sum, record) => sum + record.winLoss, 0),
);
const totalBetCount = computed(() => betRecords.value.length);

const getGameTypeInfo = (gameType: string) => {
  const map: Record<string, { label: string; type: string; icon: string }> = {
    sports: { label: $t('agency.betStatistic.sports'), type: 'success', icon: '⚽' },
    live: { label: $t('agency.betStatistic.live'), type: 'info', icon: '🎰' },
    slot: { label: $t('agency.betStatistic.slot'), type: 'warning', icon: '🎮' },
    lottery: { label: $t('agency.betStatistic.lottery'), type: 'error', icon: '🎲' },
    chess: { label: $t('agency.betStatistic.chess'), type: 'default', icon: '♟️' },
    blockchain: {
      label: $t('agency.betStatistic.blockchain'),
      type: 'primary',
      icon: '🔗',
    },
  };
  return map[gameType] || { label: gameType, type: 'default', icon: '❓' };
};

const betColumns = computed<DataTableColumns<AgentBetRecord>>(() => [
  {
    title: $t('agency.betStatistic.betId'),
    key: 'id',
    width: 80,
    align: 'center',
    render: (row) =>
      h('span', { class: 'text-xs text-gray-500 font-mono' }, `#${row.id}`),
  },
  {
    title: $t('agency.betStatistic.gameType'),
    key: 'gameType',
    width: 120,
    render: (row) => {
      const typeInfo = getGameTypeInfo(row.gameType);
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
    title: $t('agency.betStatistic.gameName'),
    key: 'gameName',
    width: 200,
    ellipsis: true,
    tooltip: true,
  },
  {
    title: $t('agency.betStatistic.betAmount'),
    key: 'betAmount',
    width: 120,
    align: 'right',
    render: (row) =>
      h('span', { class: 'font-semibold' }, formatCurrency(row.betAmount)),
  },
  {
    title: $t('agency.betStatistic.validBet'),
    key: 'validAmount',
    width: 120,
    align: 'right',
    render: (row) =>
      h(
        'span',
        { class: 'font-semibold text-blue-600' },
        formatCurrency(row.validAmount),
      ),
  },
  {
    title: $t('agency.betStatistic.winLoss'),
    key: 'winLoss',
    width: 140,
    align: 'right',
    render: (row) => {
      const isWin = row.winLoss >= 0;
      const color = isWin ? 'text-green-600' : 'text-red-600';
      const icon = isWin ? '↗️' : '↘️';
      return h('div', { class: 'flex items-center justify-end gap-1' }, [
        h('span', { class: 'text-sm' }, icon),
        h(
          'span',
          { class: `font-semibold ${color}` },
          `${isWin ? '+' : ''}${formatCurrency(row.winLoss)}`,
        ),
      ]);
    },
  },
  {
    title: $t('common.status'),
    key: 'status',
    width: 100,
    align: 'center',
    render: (row) => {
      const statusMap: Record<string, { label: string; type: string; icon: string }> = {
        settled: {
          label: $t('agency.betStatistic.settled'),
          type: 'success',
          icon: '✅',
        },
        unsettled: {
          label: $t('agency.betStatistic.unsettled'),
          type: 'warning',
          icon: '⏳',
        },
        cancelled: {
          label: $t('agency.betStatistic.cancelled'),
          type: 'error',
          icon: '❌',
        },
        refunded: {
          label: $t('agency.betStatistic.refunded'),
          type: 'info',
          icon: '🔄',
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
    title: $t('common.platform'),
    key: 'platform',
    width: 100,
    align: 'center',
    render: (row) =>
      h(NTag, { type: 'info', size: 'small' }, { default: () => row.platform }),
  },
  {
    title: $t('common.time'),
    key: 'betTime',
    width: 180,
    render: (row) =>
      h('div', { class: 'text-sm' }, [
        h('div', { class: 'font-medium' }, formatDateTime(row.betTime)),
        row.settlementTime
          ? h(
              'div',
              { class: 'text-xs text-gray-500' },
              $t('agency.betStatistic.settlement', [
                formatDateTime(row.settlementTime),
              ]),
            )
          : null,
      ]),
  },
]);

const loadBetStatistics = async () => {
  if (!props.agentId) return;

  betLoading.value = true;
  try {
    const params: Record<string, unknown> = {
      page: betPagination.current,
      pageSize: betPagination.pageSize,
    };
    if (gameTypeFilter.value) params.gameType = gameTypeFilter.value;
    if (betStatusFilter.value) params.status = betStatusFilter.value;
    if (startDate.value) {
      params.startDate = new Date(startDate.value).toISOString();
    }
    if (endDate.value) {
      const end = new Date(endDate.value);
      end.setHours(23, 59, 59, 999);
      params.endDate = end.toISOString();
    }
    const response = await getAgentBetStatisticsApi(props.agentId, params);
    betRecords.value = response.list;
    betPagination.total = response.pagination.total;
    betPagination.current = 1;
  } catch (error) {
    console.error('Failed to load bet statistics:', error);
    message.error($t('agency.betStatistic.loadFailed'));
  } finally {
    betLoading.value = false;
  }
};

const handleResetFilter = () => {
  gameTypeFilter.value = '';
  betStatusFilter.value = '';
  startDate.value = null;
  endDate.value = null;
  betPagination.current = 1;
  loadBetStatistics();
};

const handleExportData = () => {
  message.info($t('agency.betStatistic.exportDeveloping'));
};

const formatCurrency = (amount: number) => `R$ ${Number(amount).toFixed(2)}`;
const formatDateTime = (dateString: string) =>
  new Date(dateString).toLocaleString();

onMounted(() => {
  if (props.agentId) loadBetStatistics();
});
</script>

<style scoped>
.bet-statistic-tab {
  padding: 16px;
}

.mb-6 {
  margin-bottom: 1.5rem;
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

.py-12 {
  padding-top: 3rem;
  padding-bottom: 3rem;
}

.text-center {
  text-align: center;
}

.text-gray-500 {
  color: #6b7280;
}

.text-gray-700 {
  color: #374151;
}

.text-lg {
  font-size: 1.125rem;
}

.text-sm {
  font-size: 0.875rem;
}

.font-medium {
  font-weight: 500;
}

.font-bold {
  font-weight: 700;
}

.text-blue-600 {
  color: #2563eb;
}

.text-green-600 {
  color: #059669;
}

.text-red-600 {
  color: #dc2626;
}

.text-purple-600 {
  color: #9333ea;
}

.text-blue-500 {
  color: #3b82f6;
}

.text-green-500 {
  color: #10b981;
}

.text-red-500 {
  color: #ef4444;
}

.text-purple-500 {
  color: #a855f7;
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

.justify-end {
  justify-content: flex-end;
}

.justify-center {
  justify-content: center;
}

.summary-card {
  transition: all 0.3s ease;
  border: 1px solid #e5e7eb;
}

.summary-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>
