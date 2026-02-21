<template>
  <div class="traffic-stats-view">
    <!-- Header -->
    <n-card size="small" style="margin-bottom: 16px">
      <n-space justify="space-between" align="center">
        <span style="font-size: 16px; font-weight: 600">流量统计</span>
        <n-button type="primary" size="small" @click="handleExport">
          导出报表
        </n-button>
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
      title="子域名详情"
      style="width: 80%; max-width: 1200px"
      :bordered="false"
      size="huge"
    >
      <n-card size="small" :bordered="false">
        <div style="margin-bottom: 16px">
          <n-space align="center">
            <span style="font-size: 14px; font-weight: 500"
              >月份：{{ selectedMonth }}</span
            >
            <span style="font-size: 14px; font-weight: 500"
              >子域名数量：{{ selectedDomainCount }}</span
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
          <n-button @click="showDomainDetailModal = false">关闭</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
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
    title: '日期',
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
    title: '总费用(U)',
    key: 'totalCost',
    width: 100,
    render(row: TrafficStats) {
      return row.totalCost.toFixed(2);
    },
  },
  {
    title: () =>
      h('div', {}, [
        h('span', {}, 'CDN节点 '),
        h(
          NTooltip,
          {},
          {
            trigger: () =>
              h('span', { style: 'color: #2080f0; cursor: help;' }, 'ⓘ'),
            default: () => '本月启用的 CDN 节点数量',
          },
        ),
      ]) as any,
    key: 'cdnNodes',
    width: 100,
  },
  {
    title: '节点费用(U)',
    key: 'nodeCost',
    width: 110,
    render(row: TrafficStats) {
      return row.nodeCost.toFixed(2);
    },
  },
  {
    title: () =>
      h('div', {}, [
        h('span', {}, '免费流量(GB) '),
        h(
          NTooltip,
          {},
          {
            trigger: () =>
              h('span', { style: 'color: #2080f0; cursor: help;' }, 'ⓘ'),
            default: () => '平台赠送的免费流量',
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
    title: '已使用(GB)',
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
            message.info('查看流量详情');
          },
        },
        row.usedTraffic.toFixed(2),
      );
    },
  },
  {
    title: '超出用量(GB)',
    key: 'excessTraffic',
    width: 130,
    render(row: TrafficStats) {
      return row.excessTraffic.toFixed(2);
    },
  },
  {
    title: '超出单价(1GB/月)',
    key: 'excessUnitPrice',
    width: 160,
    render(row: TrafficStats) {
      return row.excessUnitPrice.toFixed(2);
    },
  },
  {
    title: '超出费用(U)',
    key: 'excessCost',
    width: 120,
    render(row: TrafficStats) {
      return row.excessCost.toFixed(2);
    },
  },
  {
    title: () =>
      h('div', {}, [
        h('span', {}, '免费子域名(个) '),
        h(
          NTooltip,
          {},
          {
            trigger: () =>
              h('span', { style: 'color: #2080f0; cursor: help;' }, 'ⓘ'),
            default: () => '本月免费子域名额度数量',
          },
        ),
      ]) as any,
    key: 'freeDomains',
    width: 140,
  },
  {
    title: () =>
      h('div', {}, [
        h('span', {}, '子域名(个) '),
        h(
          NTooltip,
          {},
          {
            trigger: () =>
              h('span', { style: 'color: #2080f0; cursor: help;' }, 'ⓘ'),
            default: () => '实际使用的子域名数量',
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
    title: '超出数量(个)',
    key: 'excessDomainCount',
    width: 120,
  },
  {
    title: '超出单价(个/月)',
    key: 'domainUnitPrice',
    width: 140,
    render(row: TrafficStats) {
      return row.domainUnitPrice.toFixed(2);
    },
  },
  {
    title: '超出费用(U)',
    key: 'domainExcessCost',
    width: 120,
    render(row: TrafficStats) {
      return row.domainExcessCost.toFixed(2);
    },
  },
  {
    title: () =>
      h('div', {}, [
        h('span', {}, '独立IP(个) '),
        h(
          NTooltip,
          {},
          {
            trigger: () =>
              h('span', { style: 'color: #2080f0; cursor: help;' }, 'ⓘ'),
            default: () => '独立IP数量',
          },
        ),
      ]) as any,
    key: 'independentIP',
    width: 120,
  },
  {
    title: 'IP费用(1个/月)',
    key: 'independentIPCost',
    width: 140,
    render(row: TrafficStats) {
      return row.independentIPCost.toFixed(2);
    },
  },
  {
    title: 'IP费用',
    key: 'ipUsage',
    width: 100,
    render(row: TrafficStats) {
      return row.ipUsage.toFixed(2);
    },
  },
];

// Domain Detail Columns
const domainDetailColumns: DataTableColumn<DomainDetail>[] = [
  { title: '域名', key: 'domainName', width: 240 },
  { title: 'CDN提供商', key: 'cdnProvider', width: 140 },
  { title: '状态', key: 'status', width: 100 },
  {
    title: '流量使用(GB)',
    key: 'traffic',
    width: 140,
    render(row: DomainDetail) {
      return row.traffic.toFixed(2);
    },
  },
  {
    title: '创建时间',
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
        message.info('暂无流量统计数据');
      }
    } else {
      // No data available
      statsData.value = [];
      message.info('暂无流量统计数据');
    }
  } catch (error: any) {
    console.error('Fetch stats data error:', error);
    message.error('获取统计数据失败');
    statsData.value = [];
  } finally {
    loading.value = false;
  }
};

const handleDateClick = (row: TrafficStats) => {
  message.info(`查看 ${row.date} 的详细数据`);
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
            ? '正常'
            : d.status === 'DISABLED'
              ? '停用'
              : d.status === 'EXPIRED'
                ? '已过期'
                : '异常',
      }));

      domainDetailData.value = formattedDomains;
      pagination.itemCount = formattedDomains.length;
    } else {
      domainDetailData.value = [];
      pagination.itemCount = 0;
      message.warning('暂无该月域名数据');
    }
  } catch (error: any) {
    console.error('Fetch domain detail error:', error);
    message.error('获取域名详情失败');
    domainDetailData.value = [];
    pagination.itemCount = 0;
  }

  showDomainDetailModal.value = true;
};

const handleExport = () => {
  message.success('导出报表功能开发中');
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
