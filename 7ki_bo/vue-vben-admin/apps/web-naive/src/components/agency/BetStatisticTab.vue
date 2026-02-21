<template>
  <div class="bet-statistic-tab">
    <!-- Statistics Overview -->
    <div class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
      <n-card size="small" class="summary-card">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm text-gray-500">总投注金额</div>
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
            <div class="text-sm text-gray-500">有效投注金额</div>
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
            <div class="text-sm text-gray-500">总输赢金额</div>
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
            <div class="text-sm text-gray-500">投注次数</div>
            <div class="text-xl font-bold text-purple-600">
              {{ totalBetCount }}
            </div>
          </div>
          <div class="text-2xl text-purple-500">📊</div>
        </div>
      </n-card>
    </div>

    <!-- Filter Section -->
    <n-card title="筛选条件" class="mb-4">
      <div class="flex flex-wrap items-end gap-4">
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium text-gray-700">游戏类型</label>
          <n-select
            v-model:value="gameTypeFilter"
            placeholder="选择游戏类型"
            clearable
            style="width: 140px"
            :options="gameTypeOptions"
            @update:value="loadBetStatistics"
          />
        </div>
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium text-gray-700">状态</label>
          <n-select
            v-model:value="betStatusFilter"
            placeholder="选择状态"
            clearable
            style="width: 120px"
            :options="betStatusOptions"
            @update:value="loadBetStatistics"
          />
        </div>
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium text-gray-700">开始日期</label>
          <n-date-picker
            v-model:value="startDate"
            type="date"
            placeholder="选择开始日期"
            style="width: 150px"
            @update:value="loadBetStatistics"
          />
        </div>
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium text-gray-700">结束日期</label>
          <n-date-picker
            v-model:value="endDate"
            type="date"
            placeholder="选择结束日期"
            style="width: 150px"
            @update:value="loadBetStatistics"
          />
        </div>
        <n-button
          type="primary"
          @click="loadBetStatistics"
          class="flex items-center gap-1"
        >
          🔍 查询
        </n-button>
        <n-button @click="handleResetFilter" class="flex items-center gap-1">
          重置
        </n-button>
      </div>
    </n-card>

    <!-- Betting Statistics Table -->
    <n-card>
      <template #header>
        <div class="flex items-center justify-between">
          <span class="text-lg font-medium">投注统计记录</span>
          <div class="flex items-center gap-2 text-sm text-gray-500">
            <span>共 {{ betRecords.length || 0 }} 条记录</span>
            <n-button size="tiny" @click="loadBetStatistics" class="ml-2">
              重新加载
            </n-button>
            <n-button size="tiny" @click="handleExportData" class="ml-1">
              导出数据
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

    <!-- Chart Section -->
    <n-card title="投注趋势图表" class="mt-4">
      <div class="py-12 text-center text-gray-500">
        <n-icon size="48" class="mb-4">
          <BarChartOutline />
        </n-icon>
        <div class="mb-2 text-lg font-medium">图表功能开发中</div>
        <div class="text-sm">投注趋势图表将在此显示</div>
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

// Reactive data
const betLoading = ref(false);
const betRecords = ref<AgentBetRecord[]>([]);

// Filters
const gameTypeFilter = ref('');
const betStatusFilter = ref('');
const startDate = ref<number | null>(null);
const endDate = ref<number | null>(null);

// Pagination
const betPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizePicker: true,
  pageSizes: [10, 20, 50],
  prefix: (info: any) => `共 ${info.itemCount} 条`,
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

// Options
const gameTypeOptions = [
  { label: '体育博彩', value: 'sports' },
  { label: '真人娱乐', value: 'live' },
  { label: '电子游戏', value: 'slot' },
  { label: '彩票游戏', value: 'lottery' },
  { label: '棋牌游戏', value: 'chess' },
  { label: '区块链游戏', value: 'blockchain' },
];

const betStatusOptions = [
  { label: '已结算', value: 'settled' },
  { label: '未结算', value: 'unsettled' },
  { label: '已取消', value: 'cancelled' },
  { label: '已退款', value: 'refunded' },
];

// Computed
const totalBetAmount = computed(() => {
  return betRecords.value.reduce((sum, record) => sum + record.betAmount, 0);
});

const validBetAmount = computed(() => {
  return betRecords.value.reduce((sum, record) => sum + record.validAmount, 0);
});

const totalWinLoss = computed(() => {
  return betRecords.value.reduce((sum, record) => sum + record.winLoss, 0);
});

const totalBetCount = computed(() => {
  return betRecords.value.length;
});

// Table columns
const betColumns: DataTableColumns<AgentBetRecord> = [
  {
    title: '投注ID',
    key: 'id',
    width: 80,
    align: 'center',
    render: (row) => {
      return h(
        'span',
        { class: 'text-xs text-gray-500 font-mono' },
        `#${row.id}`,
      );
    },
  },
  {
    title: '游戏类型',
    key: 'gameType',
    width: 120,
    render: (row) => {
      const typeMap = {
        sports: { label: '体育博彩', type: 'success', icon: '⚽' },
        live: { label: '真人娱乐', type: 'info', icon: '🎰' },
        slot: { label: '电子游戏', type: 'warning', icon: '🎮' },
        lottery: { label: '彩票游戏', type: 'error', icon: '🎲' },
        chess: { label: '棋牌游戏', type: 'default', icon: '♟️' },
        blockchain: { label: '区块链游戏', type: 'primary', icon: '🔗' },
      };
      const typeInfo = typeMap[row.gameType as keyof typeof typeMap] || {
        label: row.gameType,
        type: 'default',
        icon: '❓',
      };
      return h('div', { class: 'flex items-center gap-2' }, [
        h('span', { class: 'text-lg' }, typeInfo.icon),
        h(
          NTag,
          { type: typeInfo.type, size: 'small' },
          { default: () => typeInfo.label },
        ),
      ]);
    },
  },
  {
    title: '游戏名称',
    key: 'gameName',
    width: 200,
    ellipsis: true,
    tooltip: true,
  },
  {
    title: '投注金额',
    key: 'betAmount',
    width: 120,
    align: 'right',
    render: (row) => {
      return h(
        'span',
        { class: 'font-semibold' },
        formatCurrency(row.betAmount),
      );
    },
  },
  {
    title: '有效投注',
    key: 'validAmount',
    width: 120,
    align: 'right',
    render: (row) => {
      return h(
        'span',
        { class: 'font-semibold text-blue-600' },
        formatCurrency(row.validAmount),
      );
    },
  },
  {
    title: '输赢金额',
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
    title: '状态',
    key: 'status',
    width: 100,
    align: 'center',
    render: (row) => {
      const statusMap = {
        settled: { label: '已结算', type: 'success', icon: '✅' },
        unsettled: { label: '未结算', type: 'warning', icon: '⏳' },
        cancelled: { label: '已取消', type: 'error', icon: '❌' },
        refunded: { label: '已退款', type: 'info', icon: '🔄' },
      };
      const status = statusMap[row.status as keyof typeof statusMap] || {
        label: row.status,
        type: 'default',
        icon: '❓',
      };
      return h('div', { class: 'flex items-center justify-center gap-1' }, [
        h('span', { class: 'text-sm' }, status.icon),
        h(
          NTag,
          { type: status.type, size: 'small' },
          { default: () => status.label },
        ),
      ]);
    },
  },
  {
    title: '平台',
    key: 'platform',
    width: 100,
    align: 'center',
    render: (row) => {
      return h(
        NTag,
        { type: 'info', size: 'small' },
        { default: () => row.platform },
      );
    },
  },
  {
    title: '投注时间',
    key: 'betTime',
    width: 180,
    render: (row) => {
      return h('div', { class: 'text-sm' }, [
        h('div', { class: 'font-medium' }, formatDateTime(row.betTime)),
        row.settlementTime
          ? h(
              'div',
              { class: 'text-xs text-gray-500' },
              `结算: ${formatDateTime(row.settlementTime)}`,
            )
          : null,
      ]);
    },
  },
];

// Methods
const loadBetStatistics = async () => {
  if (!props.agentId) return;

  betLoading.value = true;
  try {
    const params: any = {
      page: betPagination.current,
      pageSize: betPagination.pageSize,
    };

    if (gameTypeFilter.value) {
      params.gameType = gameTypeFilter.value;
    }

    if (betStatusFilter.value) {
      params.status = betStatusFilter.value;
    }

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
    message.error('加载投注统计失败');
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
  message.info('导出数据功能开发中...');
};

const formatCurrency = (amount: number) => {
  return `R$ ${Number(amount).toFixed(2)}`;
};

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN');
};

onMounted(() => {
  if (props.agentId) {
    loadBetStatistics();
  }
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
