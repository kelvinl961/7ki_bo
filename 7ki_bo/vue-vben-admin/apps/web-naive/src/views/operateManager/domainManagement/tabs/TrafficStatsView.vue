<template>
  <div class="traffic-stats-view">
    <!-- Header -->
    <n-card size="small" style="margin-bottom: 16px">
      <n-space justify="space-between" align="center">
        <span style="font-size: 16px; font-weight: 600">{{ $t('operations.domain.trafficStats.title') }}</span>
        <n-button type="primary" size="small" @click="handleExport">{{ $t('common.exportReport') }}</n-button>
      </n-space>
    </n-card>

    <!-- Statistics Table -->
    <n-card size="small">
      <n-data-table
        :columns="columns"
        :data="statsData"
        :loading="loading"
        :pagination="false"
        size="small"
        :scroll-x="2400"
      />
    </n-card>

    <!-- Domain Detail Modal -->
    <n-modal
      v-model:show="showDomainDetailModal"
      preset="card"
      :title="$t('operations.domain.trafficStats.subdomainDetail')"
      style="width: 80%; max-width: 1200px"
      :bordered="false"
      size="huge"
    >
      <n-card size="small" :bordered="false">
        <div style="margin-bottom: 16px">
          <n-space align="center">
            <span style="font-size: 14px; font-weight: 500"
              >{{ $t('operations.domain.trafficStats.monthLabel', [selectedMonth]) }}</span
            >
            <span style="font-size: 14px; font-weight: 500"
              >{{ $t('operations.domain.trafficStats.subdomainCount', [selectedDomainCount]) }}</span
            >
          </n-space>
        </div>

        <n-data-table
          :columns="domainDetailColumns"
          :data="domainDetailData"
          :pagination="paginationConfig"
          size="small"
        />
      </n-card>

      <template #footer>
        <n-space justify="end">
          <n-button @click="showDomainDetailModal = false">{{ $t('common.close') }}</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { $t } from '@vben/locales';

import { ref, reactive, h, onMounted, computed } from 'vue';
import { requestClient } from '#/api/request';
import {
  NCard,
  NSpace,
  NButton,
  NDataTable,
  NModal,
  NTooltip,
  useMessage,
  type DataTableColumn,
} from 'naive-ui';

const message = useMessage();

interface TrafficStats {
  id: number;
  date: string;
  totalCost: number;
  cdnNodes: number;
  nodeCost: number;
  freeTraffic: number;
  usedTraffic: number;
  excessTraffic: number;
  excessUnitPrice: number;
  excessCost: number;
  freeDomains: number;
  domainCount: number;
  excessDomainCount: number;
  domainUnitPrice: number;
  domainExcessCost: number;
  independentIP: number;
  independentIPCost: number;
  ipUsage: number;
}

interface DomainDetail {
  id: number;
  domainName: string;
  cdnProvider: string;
  status: string;
  traffic: number;
  createdAt: string;
}

// State
const loading = ref(false);
const statsData = ref<TrafficStats[]>([]);
const showDomainDetailModal = ref(false);
const selectedMonth = ref('');
const selectedDomainCount = ref(0);
const domainDetailData = ref<DomainDetail[]>([]);

// Pagination for domain detail
const pagination = reactive({
  page: 1,
  pageSize: 20,
  itemCount: 0,
});

const paginationConfig = computed(() => ({
  page: pagination.page,
  pageSize: pagination.pageSize,
  itemCount: pagination.itemCount,
  onChange: (page: number) => {
    pagination.page = page;
  },
}));

// Table Columns
const columns: DataTableColumn<TrafficStats>[] = [
  {
    title: $t('operations.domain.column.date'),
    key: 'date',
    width: 100,
    fixed: 'left' as const,
    render(row: TrafficStats) {
      return h(
        'a',
        {
          href: '#',
          style: 'color: #2080f0; text-decoration: none;',
          onClick: (e: Event) => {
            e.preventDefault();
            handleDateClick(row);
          },
        },
        row.date,
      );
    },
  },
  {
    title: $t('operations.domain.trafficStats.totalCostBrl'),
    key: 'totalCost',
    width: 100,
    render(row: TrafficStats) {
      return row.totalCost.toFixed(2);
    },
  },
  {
    title: () =>
      h('div', {}, [
        h('span', {}, $t('operations.domain.trafficStats.cdnNodeCount') + ' '),
        h(
          NTooltip,
          {},
          {
            trigger: () =>
              h('span', { style: 'color: #2080f0; cursor: help;' }, 'ⓘ'),
            default: () => $t('operations.domain.trafficStats.cdnNodeTooltip'),
          },
        ),
      ]) as any,
    key: 'cdnNodes',
    width: 100,
  },
  {
    title: $t('operations.domain.trafficStats.nodeCostBrl'),
    key: 'nodeCost',
    width: 110,
    render(row: TrafficStats) {
      return row.nodeCost.toFixed(2);
    },
  },
  {
    title: () =>
      h('div', {}, [
        h('span', {}, $t('operations.domain.trafficStats.freeTrafficGb') + ' '),
        h(
          NTooltip,
          {},
          {
            trigger: () =>
              h('span', { style: 'color: #2080f0; cursor: help;' }, 'ⓘ'),
            default: () => $t('operations.domain.trafficStats.freeTrafficTooltip'),
          },
        ),
      ]) as any,
    key: 'freeTraffic',
    width: 130,
    render(row: TrafficStats) {
      return row.freeTraffic.toFixed(2);
    },
  },
  {
    title: $t('operations.domain.trafficStats.usedGb'),
    key: 'usedTraffic',
    width: 110,
    render(row: TrafficStats) {
      return h(
        'a',
        {
          href: '#',
          style: 'color: #2080f0; text-decoration: none;',
          onClick: (e: Event) => {
            e.preventDefault();
            message.info($t('operations.domain.trafficStats.viewTrafficDetail'));
          },
        },
        row.usedTraffic.toFixed(2),
      );
    },
  },
  {
    title: $t('operations.domain.trafficStats.exceededGb'),
    key: 'excessTraffic',
    width: 130,
    render(row: TrafficStats) {
      return row.excessTraffic.toFixed(2);
    },
  },
  {
    title: $t('operations.domain.trafficStats.exceededUnitPrice'),
    key: 'excessUnitPrice',
    width: 160,
    render(row: TrafficStats) {
      return row.excessUnitPrice.toFixed(2);
    },
  },
  {
    title: $t('operations.domain.trafficStats.exceededCostBrl'),
    key: 'excessCost',
    width: 120,
    render(row: TrafficStats) {
      return row.excessCost.toFixed(2);
    },
  },
  {
    title: () =>
      h('div', {}, [
        h('span', {}, $t('operations.domain.trafficStats.freeSubdomains') + ' '),
        h(
          NTooltip,
          {},
          {
            trigger: () =>
              h('span', { style: 'color: #2080f0; cursor: help;' }, 'ⓘ'),
            default: () => $t('operations.domain.trafficStats.freeSubdomainTooltip'),
          },
        ),
      ]) as any,
    key: 'freeDomains',
    width: 140,
  },
  {
    title: () =>
      h('div', {}, [
        h('span', {}, $t('operations.domain.trafficStats.subdomainCountCol') + ' '),
        h(
          NTooltip,
          {},
          {
            trigger: () =>
              h('span', { style: 'color: #2080f0; cursor: help;' }, 'ⓘ'),
            default: () => $t('operations.domain.trafficStats.subdomainUsedTooltip'),
          },
        ),
      ]) as any,
    key: 'domainCount',
    width: 120,
    render(row: TrafficStats) {
      return h(
        'a',
        {
          href: '#',
          style: 'color: #2080f0; text-decoration: none;',
          onClick: (e: Event) => {
            e.preventDefault();
            handleShowDomainDetail(row);
          },
        },
        row.domainCount,
      );
    },
  },
  {
    title: $t('operations.domain.trafficStats.exceededCount'),
    key: 'excessDomainCount',
    width: 120,
  },
  {
    title: $t('operations.domain.trafficStats.exceededUnitPriceItem'),
    key: 'domainUnitPrice',
    width: 140,
    render(row: TrafficStats) {
      return row.domainUnitPrice.toFixed(2);
    },
  },
  {
    title: $t('operations.domain.trafficStats.exceededCostBrl'),
    key: 'domainExcessCost',
    width: 120,
    render(row: TrafficStats) {
      return row.domainExcessCost.toFixed(2);
    },
  },
  {
    title: () =>
      h('div', {}, [
        h('span', {}, $t('operations.domain.trafficStats.independentIp') + ' '),
        h(
          NTooltip,
          {},
          {
            trigger: () =>
              h('span', { style: 'color: #2080f0; cursor: help;' }, 'ⓘ'),
            default: () => $t('operations.domain.trafficStats.ipCountTooltip'),
          },
        ),
      ]) as any,
    key: 'independentIP',
    width: 120,
  },
  {
    title: $t('operations.domain.trafficStats.ipCostMonthly'),
    key: 'independentIPCost',
    width: 140,
    render(row: TrafficStats) {
      return row.independentIPCost.toFixed(2);
    },
  },
  {
    title: $t('operations.domain.trafficStats.ipCost'),
    key: 'ipUsage',
    width: 100,
    render(row: TrafficStats) {
      return row.ipUsage.toFixed(2);
    },
  },
];

// Domain Detail Columns
const domainDetailColumns: DataTableColumn<DomainDetail>[] = [
  { title: $t('operations.domain.column.domain'), key: 'domainName', width: 240 },
  { title: $t('operations.domain.column.cdnProvider'), key: 'cdnProvider', width: 140 },
  { title: $t('common.status'), key: 'status', width: 100 },
  {
    title: $t('operations.domain.column.trafficUsage'),
    key: 'traffic',
    width: 140,
    render(row: DomainDetail) {
      return row.traffic.toFixed(2);
    },
  },
  {
    title: $t('common.createTime'),
    key: 'createdAt',
    width: 180,
    render(row: DomainDetail) {
      return new Date(row.createdAt).toLocaleString('zh-CN');
    },
  },
];

// Methods
const fetchStatsData = async () => {
  loading.value = true;
  try {
    // Fetch real traffic stats from API
    const result: any = await requestClient.get('/domain-data/traffic');

    if (result.code === 0 && result.data) {
      // Group traffic stats by month
      const monthlyStats = new Map<string, any>();

      result.data.forEach((stat: any) => {
        const date = new Date(stat.periodStart);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

        if (!monthlyStats.has(monthKey)) {
          monthlyStats.set(monthKey, {
            totalTraffic: 0,
            totalBandwidth: 0,
            totalRequests: 0,
            domainIds: new Set(),
            cdnProviders: new Set(),
          });
        }

        const monthData = monthlyStats.get(monthKey);
        monthData.totalTraffic += stat.totalTraffic || 0;
        monthData.totalBandwidth += stat.totalBandwidth || 0;
        monthData.totalRequests += stat.totalRequests || 0;
        monthData.domainIds.add(stat.domainId);

        // Get CDN provider from domain
        if (stat.domain?.cdnProvider) {
          monthData.cdnProviders.add(stat.domain.cdnProvider);
        }
      });

      // Convert to TrafficStats format
      const formattedData: TrafficStats[] = [];
      let id = 1;

      // Sort by date descending (newest first)
      const sortedMonths = Array.from(monthlyStats.entries()).sort((a, b) =>
        b[0].localeCompare(a[0]),
      );

      sortedMonths.forEach(([monthKey, data]) => {
        const trafficGB = data.totalTraffic / (1024 * 1024 * 1024); // Convert to GB
        const freeTrafficGB = 2000; // From config
        const excessTrafficGB = Math.max(0, trafficGB - freeTrafficGB);
        const excessUnitPrice = 0.2; // From config
        const excessCost = excessTrafficGB * excessUnitPrice;

        const domainCount = data.domainIds.size;
        const freeDomains = 60; // From config
        const excessDomainCount = Math.max(0, domainCount - freeDomains);
        const domainUnitPrice = 3.0; // From config
        const domainExcessCost = excessDomainCount * domainUnitPrice;

        const totalCost = excessCost + domainExcessCost;

        formattedData.push({
          id: id++,
          date: monthKey,
          totalCost: Number(totalCost.toFixed(2)),
          cdnNodes: data.cdnProviders.size,
          nodeCost: 0.0,
          freeTraffic: freeTrafficGB,
          usedTraffic: Number(trafficGB.toFixed(2)),
          excessTraffic: Number(excessTrafficGB.toFixed(2)),
          excessUnitPrice,
          excessCost: Number(excessCost.toFixed(2)),
          freeDomains,
          domainCount,
          excessDomainCount,
          domainUnitPrice,
          domainExcessCost: Number(domainExcessCost.toFixed(2)),
          independentIP: 0,
          independentIPCost: 130.0,
          ipUsage: 0.0,
        });
      });

      statsData.value = formattedData.length > 0 ? formattedData : [];

      if (formattedData.length === 0) {
        message.info($t('operations.domain.trafficStats.noStats'));
      }
    } else {
      // No data available
      statsData.value = [];
      message.info($t('operations.domain.trafficStats.noStats'));
    }
  } catch (error: any) {
    console.error('Fetch stats data error:', error);
    message.error($t('operations.domain.message.fetchStatsFailed'));
    statsData.value = [];
  } finally {
    loading.value = false;
  }
};

const handleDateClick = (row: TrafficStats) => {
  message.info($t('operations.domain.trafficStats.viewDateDetail', [row.date]));
};

const handleShowDomainDetail = async (row: TrafficStats) => {
  selectedMonth.value = row.date;
  selectedDomainCount.value = row.domainCount;

  try {
    // Fetch real domain data with traffic for this month
    const [year, month] = row.date.split('-');
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0);

    const result: any = await requestClient.get('/domain-data/traffic');

    if (result.code === 0 && result.data) {
      // Filter traffic stats for this month and group by domain
      const domainTrafficMap = new Map<number, any>();

      result.data.forEach((stat: any) => {
        const statDate = new Date(stat.periodStart);
        const statMonth = `${statDate.getFullYear()}-${String(statDate.getMonth() + 1).padStart(2, '0')}`;

        if (statMonth === row.date) {
          const domainId = stat.domainId;
          if (!domainTrafficMap.has(domainId)) {
            domainTrafficMap.set(domainId, {
              id: domainId,
              domainName: stat.domain?.domainName || 'Unknown',
              cdnProvider: stat.domain?.cdnProvider || 'Unknown',
              status: stat.domain?.status || 'NORMAL',
              traffic: 0,
              createdAt: stat.domain?.createdAt || new Date().toISOString(),
            });
          }

          const domainData = domainTrafficMap.get(domainId);
          domainData.traffic += (stat.totalTraffic || 0) / (1024 * 1024 * 1024); // Convert to GB
        }
      });

      // Convert map to array and format
      const formattedDomains: DomainDetail[] = Array.from(
        domainTrafficMap.values(),
      ).map((d) => ({
        ...d,
        traffic: Number(d.traffic.toFixed(2)),
        status:
          d.status === 'NORMAL'
            ? $t('operations.domain.trafficStats.statusNormal')
            : d.status === 'DISABLED'
              ? $t('operations.domain.trafficStats.statusDisabled')
              : d.status === 'EXPIRED'
                ? $t('operations.domain.trafficStats.statusExpired')
                : $t('operations.domain.trafficStats.statusAbnormal'),
      }));

      domainDetailData.value = formattedDomains;
      pagination.itemCount = formattedDomains.length;
    } else {
      domainDetailData.value = [];
      pagination.itemCount = 0;
      message.warning($t('operations.domain.message.noDomainData'));
    }
  } catch (error: any) {
    console.error('Fetch domain detail error:', error);
    message.error($t('operations.domain.message.fetchDomainDetailFailed'));
    domainDetailData.value = [];
    pagination.itemCount = 0;
  }

  showDomainDetailModal.value = true;
};

const handleExport = () => {
  message.success($t('operations.domain.message.exportDeveloping'));
  // Implement export functionality here
};

onMounted(() => {
  fetchStatsData();
});
</script>

<style scoped lang="scss">
.traffic-stats-view {
  padding: 0;
}

:deep(.n-data-table) {
  .n-data-table-th {
    font-weight: 600;
  }
}
</style>
