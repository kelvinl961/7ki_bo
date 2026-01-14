<template>
  <div class="health-check-view">
    <n-layout has-sider>
      <!-- Main Content -->
      <n-layout-content style="padding-right: 16px;">
        <!-- Filters -->
        <n-card size="small" style="margin-bottom: 16px">
          <n-space :size="12" align="center">
        <n-select
              v-model:value="filters.domainType"
              placeholder="全部域名"
              style="width: 160px"
              size="small"
              :options="domainTypeOptions"
          @update:value="fetchHealthData"
        />
            
            <n-input
              v-model:value="filters.search"
              placeholder="请输入域名"
              clearable
              style="width: 180px"
              size="small"
              @keyup.enter="fetchHealthData"
            />
            
        <n-select
          v-model:value="filters.status"
              placeholder="检测状态"
          clearable
              style="width: 140px"
              size="small"
              :options="statusOptions"
              @update:value="fetchHealthData"
            />
            
            <n-select
              v-model:value="filters.region"
              placeholder="中国"
              style="width: 120px"
              size="small"
              :options="regionOptions"
          @update:value="fetchHealthData"
        />
            
            <n-button type="primary" size="small" @click="fetchHealthData">
              搜索
        </n-button>
            
            <n-button size="small" @click="resetFilters">
              重置
        </n-button>
      </n-space>
        </n-card>

        <!-- Results Table -->
        <n-card size="small" style="margin-bottom: 16px">
          <n-space justify="space-between" align="center" style="margin-bottom: 12px;">
            <span style="font-size: 13px; color: #666;">
              {{ selectedDomainIdForMap ? `地图显示: ${healthData.find(h => h.id === selectedDomainIdForMap)?.domainName}` : '地图显示: 全部域名' }}
            </span>
            <n-button 
              v-if="selectedDomainIdForMap" 
              size="small" 
              @click="handleResetMapView"
            >
              显示全部域名
            </n-button>
          </n-space>
    <n-data-table
            v-model:checked-row-keys="selectedRowKeys"
      :columns="columns"
      :data="healthData"
      :loading="loading"
            :pagination="paginationConfig"
            :row-key="(row: HealthRecord) => row.id"
            size="small"
            max-height="400"
            :row-props="rowProps"
            :row-class-name="rowClassName"
          />
        </n-card>

        <!-- Batch Actions -->
        <n-card size="small">
          <n-space justify="space-between" align="center">
            <n-space>
              <span style="font-size: 13px; color: #666;">全当操作</span>
              <n-select
                v-model:value="selectedBatchAction"
                placeholder="批量操作"
                style="width: 140px"
                size="small"
                :options="batchActionOptions"
                :disabled="!selectedRowKeys.length"
              />
              <n-button 
                size="small" 
                :disabled="!selectedRowKeys.length || !selectedBatchAction"
                @click="handleBatchDetect"
              >
                执行
              </n-button>
            </n-space>
            <n-space align="center">
              <span style="font-size: 13px; color: #666;">
                已选择 {{ selectedRowKeys.length }} 条
              </span>
              <span style="font-size: 13px; color: #666;">
                共 {{ pagination.itemCount }} 条数据
              </span>
              <span style="font-size: 13px; color: #666;">
                前往 1 页 共 {{ Math.ceil(pagination.itemCount / pagination.pageSize) }} 条
              </span>
              <n-select
                v-model:value="pagination.pageSize"
                style="width: 120px"
                size="small"
                :options="pageSizeOptions"
                @update:value="handlePageSizeChange"
              />
            </n-space>
          </n-space>
        </n-card>
      </n-layout-content>

      <!-- Map Sidebar -->
      <n-layout-sider
        :width="500"
        :native-scrollbar="false"
        style="background: transparent;"
      >
        <n-card size="small" style="height: 100%;">
          <div class="map-container">
            <div id="health-map" ref="mapContainer" style="width: 100%; height: 450px; background: #f5f7fa;">
            </div>
            
            <!-- Health Legend -->
            <div class="health-legend" style="margin-top: 16px;">
              <n-space vertical :size="8">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <div style="width: 20px; height: 14px; background: #66bb6a;"></div>
                  <span style="font-size: 13px;">正常 (&lt; 500ms)</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <div style="width: 20px; height: 14px; background: #fdd835;"></div>
                  <span style="font-size: 13px;">一般 (500-1000ms)</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <div style="width: 20px; height: 14px; background: #ff9800;"></div>
                  <span style="font-size: 13px;">缓慢 (&gt; 1000ms)</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <div style="width: 20px; height: 14px; background: #d32f2f;"></div>
                  <span style="font-size: 13px;">失败</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <div style="width: 20px; height: 14px; background: #ccc;"></div>
                  <span style="font-size: 13px;">无数据</span>
                </div>
              </n-space>
              
              <n-divider style="margin: 16px 0;" />
              
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 14px; font-weight: 500;">今日检测次数：</span>
                <span style="font-size: 14px; color: #2080f0;">
                  {{ todayUsage.used }}/{{ todayUsage.total }}
                </span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
                <span style="font-size: 14px; font-weight: 500;">拨测点</span>
                <span style="font-size: 14px; color: #2080f0;">
                  {{ monitorPoints.active }}/{{ monitorPoints.total }}
                </span>
              </div>
            </div>
          </div>
        </n-card>
      </n-layout-sider>
    </n-layout>

    <!-- Detail Modal -->
    <n-modal
      v-model:show="showDetailModal"
      preset="card"
      title="检测详情"
      style="width: 90%; max-width: 1400px;"
      :bordered="false"
      size="huge"
    >
      <n-card size="small" :bordered="false">
        <div style="margin-bottom: 16px;">
          <n-space align="center" :size="16">
            <span style="font-size: 14px; font-weight: 500;">域名：{{ selectedDomain?.domainName }}</span>
            <n-tag :type="getHealthType(selectedDomain?.healthScore || 0)" size="small">
              {{ getHealthText(selectedDomain?.healthScore || 0) }}
            </n-tag>
            <span style="font-size: 14px;">健康值：{{ selectedDomain?.healthScore }}%</span>
          </n-space>
        </div>

        <!-- Detection Tabs -->
        <n-tabs v-model:value="detailTab" type="line" size="small">
          <n-tab-pane name="all" tab="全部">
            <n-data-table
              :columns="detailColumns"
              :data="detailData"
              :pagination="false"
              size="small"
              :max-height="400"
              :scroll-x="1400"
            />
          </n-tab-pane>
          <n-tab-pane name="success" tab="访问成功">
            <n-data-table
              :columns="detailColumns"
              :data="detailData.filter(d => d.status === '正常')"
              :pagination="false"
              size="small"
              :max-height="400"
              :scroll-x="1400"
            />
          </n-tab-pane>
          <n-tab-pane name="failed" tab="访问失败">
        <n-data-table
              :columns="detailColumns"
              :data="detailData.filter(d => d.status === '失败')"
          :pagination="false"
              size="small"
              :max-height="400"
              :scroll-x="1400"
            />
          </n-tab-pane>
        </n-tabs>

        <n-alert type="warning" style="margin-top: 16px;" size="small">
          <div style="font-size: 13px;">
            <div style="font-weight: 500; margin-bottom: 4px;">检测节点响应无法优化的IP地址如下（DNS污染），建议更换域名：</div>
            <div>127.0.0.1   127.0.0.2   0.0.0.0</div>
          </div>
        </n-alert>
      </n-card>

      <template #footer>
        <n-space justify="end">
          <n-button @click="showDetailModal = false">关闭</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, h, onMounted, onBeforeUnmount, computed } from 'vue';
import { requestClient } from '#/api/request';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  NLayout,
  NLayoutContent,
  NLayoutSider,
  NCard, 
  NSpace, 
  NInput, 
  NSelect, 
  NButton, 
  NDataTable, 
  NTag,
  NModal,
  NTabs,
  NTabPane,
  NAlert,
  NDivider,
  useMessage,
  type DataTableColumn
} from 'naive-ui';

const message = useMessage();

interface HealthRecord {
  id: number;
  domainName: string;
  status: string;
  healthScore: number;
  lastCheckTime: string;
  useType?: string;
}

interface MonitorDetail {
  id: number;
  monitorPoint: string;
  responseIP: string;
  ipLocation: string;
  status: string;
  totalTime: string;
  dnsTime: string;
  connectTime: string;
  downloadTime: string;
  redirectTime: string;
  headTime: string;
  responseImage: string;
}

// State
const loading = ref(false);
const healthData = ref<HealthRecord[]>([]);
const selectedRowKeys = ref<number[]>([]);
const showDetailModal = ref(false);
const selectedDomain = ref<HealthRecord | null>(null);
const selectedDomainIdForMap = ref<number | null>(null); // Track which domain is displayed on map
const detailTab = ref('all');
const detailData = ref<MonitorDetail[]>([]);
const mapContainer = ref<HTMLElement | null>(null);

// Usage Statistics
const todayUsage = ref({
  used: 0,
  total: 30
});

const monitorPoints = ref({
  active: 0,
  total: 0
});

// Filters
const filters = reactive({
  domainType: '',
  search: '',
  status: '',
  region: '中国'
});

// Pagination
const pagination = reactive({
  page: 1,
  pageSize: 100,
  itemCount: 0
});

const paginationConfig = computed(() => ({
  page: pagination.page,
  pageSize: pagination.pageSize,
  itemCount: pagination.itemCount,
  showSizePicker: false,
  onChange: (page: number) => {
    pagination.page = page;
    fetchHealthData();
  }
}));

const selectedBatchAction = ref('');

// Options
const domainTypeOptions = [
  { label: '全部域名', value: '' },
  { label: 'Web大厅域名', value: 'WEB_HALL' },
  { label: 'APP大厅域名', value: 'APP_HALL' },
  { label: '后端加速域名', value: 'BACKEND_API' },
  { label: 'APP更新', value: 'APP_UPDATE' },
  { label: 'OSS加速域名', value: 'OSS_ACCELERATION' },
  { label: '下载站域名', value: 'DOWNLOAD_SITE' }
];

const statusOptions = [
  { label: '全部状态', value: '' },
  { label: '优', value: 'EXCELLENT' },
  { label: '良', value: 'GOOD' },
  { label: '差', value: 'POOR' }
];

const regionOptions = [
  { label: '全球', value: 'GLOBAL' },
  { label: '中国', value: 'CHINA' },
  { label: '亚洲', value: 'ASIA' },
  { label: '欧洲', value: 'EUROPE' },
  { label: '北美', value: 'NORTH_AMERICA' },
  { label: '南美', value: 'SOUTH_AMERICA' }
];

const batchActionOptions = [
  { label: '批量操作', value: '', disabled: true },
  { label: '手动检测', value: 'detect' }
];

const pageSizeOptions = [
  { label: '100条/页', value: 100 },
  { label: '50条/页', value: 50 },
  { label: '20条/页', value: 20 }
];

// Helper functions
const getHealthType = (score: number) => {
  if (score >= 85) return 'success';
  if (score >= 70) return 'warning';
  if (score >= 60) return 'default';
  return 'error';
};

const getHealthText = (score: number) => {
  if (score >= 85) return '优';
  if (score >= 70) return '良';
  if (score >= 60) return '中';
  return '差';
};

const getHealthColor = (score: number) => {
  if (score >= 85) return '#52c41a';
  if (score >= 70) return '#faad14';
  if (score >= 60) return '#ff9800';
  return '#f5222d';
};

// Table Columns
const columns: DataTableColumn<HealthRecord>[] = [
  { type: 'selection' as const, width: 50 },
  {
    title: '域名',
    key: 'domainName',
    width: 240,
    ellipsis: { tooltip: true },
    render(row: HealthRecord) {
      return h('div', { style: 'display: flex; align-items: center; gap: 6px;' }, [
        h('a', {
          href: `https://${row.domainName}`,
          target: '_blank',
          style: 'color: #2080f0; text-decoration: none;'
        }, row.domainName),
        h(NButton, {
          size: 'tiny',
          text: true,
          onClick: () => {
            navigator.clipboard.writeText(row.domainName);
            message.success('已复制');
          }
        }, { default: () => '' })
      ]);
    }
  },
  {
    title: '状态',
    key: 'status',
    width: 80,
    render(row: HealthRecord) {
      return h(NTag, { 
        type: getHealthType(row.healthScore) as any,
        size: 'small'
      }, { 
        default: () => getHealthText(row.healthScore)
      });
    }
  },
  { 
    title: '健康值', 
    key: 'healthScore', 
    width: 150,
    sorter: (a: HealthRecord, b: HealthRecord) => a.healthScore - b.healthScore,
    render(row: HealthRecord) {
      const needReplace = row.healthScore < 60;
      return h('div', { style: 'display: flex; align-items: center; gap: 8px;' }, [
        h('span', { 
          style: `color: ${getHealthColor(row.healthScore)}; font-weight: 500;` 
        }, `${row.healthScore}%`),
        needReplace ? h('span', { 
          style: 'color: #f5222d; font-size: 12px;' 
        }, '建议更换域名') : null
      ].filter(Boolean));
    }
  },
  { 
    title: '检测时间', 
    key: 'lastCheckTime', 
    width: 180,
    render(row: HealthRecord) {
      return new Date(row.lastCheckTime).toLocaleString('zh-CN');
    }
  },
  {
    title: '操作',
    key: 'actions',
    width: 150,
    render(row: HealthRecord) {
      return h('div', { style: 'display: flex; gap: 8px;' }, [
        h(NButton, {
          text: true,
          type: 'primary',
          size: 'small',
          onClick: () => handleShowDetail(row)
        }, { default: () => '详情' }),
        h(NButton, {
          text: true,
          type: 'info',
          size: 'small',
          onClick: () => handleManualDetect(row)
        }, { default: () => '检测' })
      ]);
    }
  }
];

// Detail Columns
const detailColumns: DataTableColumn<MonitorDetail>[] = [
  { 
    title: '监测点', 
    key: 'monitorPoint', 
    width: 120,
    fixed: 'left' as const,
    render(row: MonitorDetail) {
      const parts = row.monitorPoint.split('/');
      return h('div', { style: 'display: flex; flex-direction: column;' }, [
        h('span', { style: 'font-size: 12px; font-weight: 500;' }, parts[0]),
        parts[1] ? h('span', { style: 'font-size: 11px; color: #999;' }, parts[1]) : null
      ].filter(Boolean));
    }
  },
  { 
    title: '响应IP', 
    key: 'responseIP', 
    width: 140,
    render(row: MonitorDetail) {
      const isPolluted = ['127.0.0.1', '127.0.0.2', '0.0.0.0'].includes(row.responseIP);
      return h('div', { style: 'display: flex; align-items: center; gap: 4px;' }, [
        h('span', { 
          style: isPolluted ? 'color: #f5222d;' : '' 
        }, row.responseIP),
        isPolluted ? h('span', { 
          style: 'font-size: 11px; color: #f5222d;' 
        }, '🚫') : null
      ].filter(Boolean));
    }
  },
  { 
    title: 'IP位置', 
    key: 'ipLocation', 
    width: 180,
    ellipsis: { tooltip: true }
  },
  {
    title: '状态',
    key: 'status', 
    width: 80,
    render(row: MonitorDetail) {
      return h(NTag, { 
        type: row.status === '正常' ? 'success' : 'error',
        size: 'small'
      }, { 
        default: () => row.status
      });
    }
  },
  {
    title: '总耗时', 
    key: 'totalTime', 
    width: 100,
    render(row: MonitorDetail) {
      return h('span', { 
        style: 'color: #f5222d; font-weight: 500;' 
      }, row.totalTime);
    }
  },
  { title: '解析', key: 'dnsTime', width: 90 },
  { title: '连接', key: 'connectTime', width: 90 },
  { title: '下载', key: 'downloadTime', width: 90 },
  { title: '重定向', key: 'redirectTime', width: 90 },
  { title: 'Head', key: 'headTime', width: 90 },
  { 
    title: '响应图片', 
    key: 'responseImage', 
    width: 100,
    render(row: MonitorDetail) {
      return row.responseImage ? h('img', {
        src: row.responseImage,
        style: 'max-width: 50px; max-height: 30px;'
      }) : '--';
    }
  }
];

// Methods
const fetchHealthData = async () => {
  loading.value = true;
  try {
    // Fetch real health check data from API
    const response: any = await requestClient.get('/domain-data/health', {
      params: { limit: 50 }
    });
    
    // Handle different response structures from requestClient
    const result = response.data || response;
    const healthChecks = Array.isArray(result) ? result : (result.data || []);
    
    if (healthChecks && healthChecks.length > 0) {
      // Group health checks by domain (get latest check per domain)
      const domainMap = new Map<number, HealthRecord>();
      
      healthChecks.forEach((check: any) => {
        const domainId = check.domainId;
        
        // Only keep the most recent check per domain
        if (!domainMap.has(domainId) || 
            new Date(check.checkTime) > new Date(domainMap.get(domainId)!.lastCheckTime)) {
          domainMap.set(domainId, {
            id: domainId,
            domainName: check.domain?.domainName || 'Unknown',
            status: check.status || 'UNKNOWN',
            healthScore: check.healthScore || 0,
            lastCheckTime: new Date(check.checkTime).toLocaleString('zh-CN'),
            useType: check.domain?.useType
          });
        }
      });
      
      // Convert map to array
      healthData.value = Array.from(domainMap.values());
      pagination.itemCount = healthData.value.length;
      
      // Update usage stats (today's checks)
      const today = new Date().toDateString();
      const todayChecks = healthChecks.filter((check: any) => 
        new Date(check.checkTime).toDateString() === today
      );
      
      todayUsage.value = {
        used: new Set(todayChecks.map((c: any) => c.domainId)).size,
        total: 30 // Configurable limit
      };
      
      monitorPoints.value = {
        active: healthChecks.length,
        total: healthData.value.length * 8 // 8 locations per domain
      };
    } else {
      // No data available
      healthData.value = [];
      pagination.itemCount = 0;
      
      todayUsage.value = {
        used: 0,
        total: 30
      };
      
      monitorPoints.value = {
        active: 0,
        total: 0
      };
      
      message.info('暂无健康检测数据。请先创建域名并等待初始同步完成。');
    }
  } catch (error: any) {
    console.error('Fetch health data error:', error);
    message.error('获取检测数据失败: ' + (error.message || '未知错误'));
    
    // Set empty state on error
    healthData.value = [];
    pagination.itemCount = 0;
  } finally {
    loading.value = false;
  }
};

const resetFilters = () => {
  filters.domainType = '';
  filters.search = '';
  filters.status = '';
  filters.region = '中国';
  pagination.page = 1;
  fetchHealthData();
};

const handlePageSizeChange = (value: number) => {
  pagination.pageSize = value;
  pagination.page = 1;
  fetchHealthData();
};

const handleShowDetail = async (domain: HealthRecord) => {
  selectedDomain.value = domain;
  detailTab.value = 'all';
  
  try {
    // Fetch detailed health check data for this domain
    const response: any = await requestClient.get('/domain-data/health', {
      params: { domainId: domain.id, limit: 50 }
    });
    
    // Handle different response structures from requestClient
    const result = response.data || response;
    const healthChecks = Array.isArray(result) ? result : (result.data || []);
    
    if (healthChecks && healthChecks.length > 0) {
      // Transform API data to MonitorDetail format
      detailData.value = healthChecks.map((check: any) => ({
        id: check.id,
        monitorPoint: check.monitorPoint || check.location || 'Unknown',
        responseIP: check.responseIP || '--',
        ipLocation: check.ipLocation || '--',
        status: check.checkStatus || check.status || 'Unknown',
        totalTime: check.totalTime ? `${(check.totalTime / 1000).toFixed(3)}s` : '--',
        dnsTime: check.dnsTime ? `${(check.dnsTime / 1000).toFixed(3)}s` : '--',
        connectTime: check.connectTime ? `${(check.connectTime / 1000).toFixed(3)}s` : '--',
        downloadTime: check.downloadTime ? `${(check.downloadTime / 1000).toFixed(3)}s` : '--',
        redirectTime: check.redirectTime ? `${(check.redirectTime / 1000).toFixed(3)}s` : '--',
        headTime: check.headTime ? `${(check.headTime / 1000).toFixed(3)}s` : '--',
        responseImage: ''
      }));
      
      if (detailData.value.length === 0) {
        message.info('该域名暂无详细监测数据');
      }
    } else {
      detailData.value = [];
      message.warning('获取详细数据失败');
    }
  } catch (error: any) {
    console.error('Fetch detail data error:', error);
    message.error('获取详细数据失败');
    detailData.value = [];
  }
  
  showDetailModal.value = true;
};

const handleManualDetect = async (domain: HealthRecord) => {
  try {
    const loadingMsg = message.loading(`正在执行实时检测 ${domain.domainName}...`, { duration: 0 });
    
    // Trigger REAL-TIME health check (not background sync)
    const response: any = await requestClient.post('/domain-data/health-check', {
      domainId: domain.id
    });
    
    loadingMsg.destroy();
    
    // Handle different response structures from requestClient
    const result = response.data || response;
    const checkData = result.data || result;
    
    if (response.code === 0 || result.code === 0 || checkData.checks) {
      const healthScore = checkData.checks?.[0]?.healthScore || 0;
      const totalLocations = checkData.totalLocations || 0;
      
      message.success(
        `检测完成！${domain.domainName}\n` +
        `健康值: ${healthScore}%\n` +
        `检测点: ${totalLocations} 个位置`,
        { duration: 3000 }
      );
      
      // Immediately refresh data to show new results
      await fetchHealthData();
      await fetchLocationHealth(selectedDomainIdForMap.value);
      
      // Refresh map markers
      setTimeout(() => {
        initMap();
      }, 500);
    } else {
      message.error(`检测失败: ${result.message || '未知错误'}`);
    }
  } catch (error: any) {
    console.error('Manual detect error:', error);
    message.error('检测失败: ' + (error.message || '未知错误'));
  }
};

const handleBatchDetect = async () => {
  if (!selectedRowKeys.value.length) {
    message.warning('请选择要检测的域名');
    return;
  }

  try {
    message.loading(`正在批量检测 ${selectedRowKeys.value.length} 个域名...`);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    message.success('批量检测完成');
    selectedRowKeys.value = [];
    selectedBatchAction.value = '';
    fetchHealthData();
  } catch (error: any) {
    console.error('Batch detect error:', error);
    message.error('批量检测失败');
  }
};

// Location coordinates for monitoring points on map (REAL WORLD COORDINATES)
const locationCoordinates: Record<string, {lat: number, lng: number, name: string}> = {
  'CN-Beijing': { lat: 39.9042, lng: 116.4074, name: '北京' },
  'CN-Shanghai': { lat: 31.2304, lng: 121.4737, name: '上海' },
  'CN-Guangzhou': { lat: 23.1291, lng: 113.2644, name: '广州' },
  'CN-Chengdu': { lat: 30.5728, lng: 104.0668, name: '成都' },
  'US-California': { lat: 37.7749, lng: -122.4194, name: 'California' },
  'US-Virginia': { lat: 37.4316, lng: -78.6569, name: 'Virginia' },
  'EU-Frankfurt': { lat: 50.1109, lng: 8.6821, name: 'Frankfurt' },
  'APAC-Singapore': { lat: 1.3521, lng: 103.8198, name: 'Singapore' }
};

// Leaflet map instance
let leafletMap: L.Map | null = null;
const mapMarkers: L.CircleMarker[] = [];

// Fetch location health data - show LATEST check per location (matching detail modal)
const locationHealthData = ref<Record<string, {status: string, responseTime: number, count: number}>>({});

const fetchLocationHealth = async (domainId?: number | null) => {
  try {
    const params: any = { limit: 200 };
    
    // If domainId provided, filter by that domain only
    if (domainId) {
      params.domainId = domainId;
    }
    
    const response: any = await requestClient.get('/domain-data/health', {
      params
    });
    
    // Handle different response structures from requestClient
    const result = response.data || response;
    const healthChecks = Array.isArray(result) ? result : (result.data || []);
    
    if (healthChecks && healthChecks.length > 0) {
      // If filtering by specific domain, we don't need complex aggregation
      if (domainId) {
        // Sort by checkTime and get latest check per location for this domain
        healthChecks.sort((a: any, b: any) => 
          new Date(b.checkTime).getTime() - new Date(a.checkTime).getTime()
        );
        
        const locationMap = new Map<string, any>();
        healthChecks.forEach((check: any) => {
          if (check.location && !locationMap.has(check.location)) {
            locationMap.set(check.location, check);
          }
        });
        
        // Convert to location health data
        locationHealthData.value = {};
        locationMap.forEach((check, location) => {
          locationHealthData.value[location] = {
            status: check.checkStatus || '正常',
            responseTime: check.totalTime || 0,
            count: 1
          };
        });
      } else {
        // Aggregate all domains (original logic)
        // Group by domain first to get latest checks
        const domainChecks = new Map<number, any[]>();
        
        healthChecks.forEach((check: any) => {
          const checkDomainId = check.domainId;
          if (!domainChecks.has(checkDomainId)) {
            domainChecks.set(checkDomainId, []);
          }
          domainChecks.get(checkDomainId)!.push(check);
        });
        
        // For each domain, get the latest check per location
        const latestChecks: any[] = [];
        domainChecks.forEach((checks, _domainId) => {
          // Sort by checkTime descending
          checks.sort((a, b) => new Date(b.checkTime).getTime() - new Date(a.checkTime).getTime());
          
          // Get latest check per location for this domain
          const locationMap = new Map<string, any>();
          checks.forEach(check => {
            if (!locationMap.has(check.location)) {
              locationMap.set(check.location, check);
            }
          });
          
          latestChecks.push(...locationMap.values());
        });
        
        // Now group by location for the map
        const locationStats: Record<string, {totalTime: number, status: string, count: number}> = {};
        
        latestChecks.forEach((check: any) => {
          const loc = check.location;
          if (!loc) return;
          
          if (!locationStats[loc]) {
            locationStats[loc] = { totalTime: check.totalTime || 0, status: check.checkStatus || '正常', count: 1 };
          } else {
            // If multiple domains, average the time
            locationStats[loc].totalTime = ((locationStats[loc].totalTime * locationStats[loc].count) + (check.totalTime || 0)) / (locationStats[loc].count + 1);
            locationStats[loc].count++;
            // If ANY domain fails, mark location as failed
            if (check.checkStatus === '失败') {
              locationStats[loc].status = '失败';
            }
          }
        });
        
        // Convert to health data
        locationHealthData.value = Object.entries(locationStats).reduce((acc, [loc, stats]) => {
          acc[loc] = {
            status: stats.status,
            responseTime: Math.round(stats.totalTime),
            count: stats.count
          };
          return acc;
        }, {} as Record<string, {status: string, responseTime: number, count: number}>);
      }
    }
  } catch (error) {
    console.error('Failed to fetch location health:', error);
  }
};

// Get color based on health status and response time
const getLocationColor = (location: string): string => {
  const health = locationHealthData.value[location];
  if (!health || health.count === 0) return '#ccc'; // Gray for no data
  
  if (health.status === '失败') return '#d32f2f'; // Red for failed
  if (health.responseTime > 1000) return '#ff9800'; // Orange for slow
  if (health.responseTime > 500) return '#fdd835'; // Yellow for medium
  return '#66bb6a'; // Green for good
};

// Initialize REAL Interactive Leaflet Map
const initMap = () => {
  if (!mapContainer.value) return;
  
  // Clean up existing map
  if (leafletMap) {
    leafletMap.remove();
    leafletMap = null;
  }
  
  mapMarkers.length = 0;
  
  // Create Leaflet map
  leafletMap = L.map('health-map', {
    center: [30, 110], // Center on China/Asia
    zoom: 3,
    minZoom: 2,
    maxZoom: 10,
    zoomControl: true,
    scrollWheelZoom: true
  });
  
  // Add OpenStreetMap tile layer (FREE, no API key needed!)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
  }).addTo(leafletMap);
  
  // Add markers for each monitoring location
  Object.entries(locationCoordinates).forEach(([code, location]) => {
    const color = getLocationColor(code);
    const health = locationHealthData.value[code];
    
    // Create circle marker
    const marker = L.circleMarker([location.lat, location.lng], {
      radius: 12,
      fillColor: color,
      color: '#fff',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.8
    }).addTo(leafletMap!);
    
    // Tooltip content
    const responseTime = health ? `${(health.responseTime / 1000).toFixed(3)}s` : '无数据';
    const status = health ? health.status : '未检测';
    
    marker.bindTooltip(
      `<div style="text-align: center;">
        <strong>${location.name}</strong><br/>
        状态: ${status}<br/>
        响应: ${responseTime}
      </div>`,
      {
        permanent: false,
        direction: 'top',
        offset: [0, -10]
      }
    );
    
    // Add pulsing effect for healthy locations
    if (health && health.status !== '失败') {
      const pulseMarker = L.circleMarker([location.lat, location.lng], {
        radius: 12,
        fillColor: 'transparent',
        color: color,
        weight: 2,
        opacity: 0.6,
        fillOpacity: 0,
        className: 'pulse-marker'
      }).addTo(leafletMap!);
      
      mapMarkers.push(pulseMarker);
    }
    
    mapMarkers.push(marker);
  });
};

// Row click handler - select domain for map view
const rowProps = (row: HealthRecord) => {
  return {
    style: 'cursor: pointer;',
    onClick: () => {
      selectedDomainIdForMap.value = row.id;
      fetchLocationHealth(row.id).then(() => {
        // Refresh map with new data
        setTimeout(() => {
          initMap();
        }, 100);
      });
    }
  };
};

// Row class name - highlight selected row
const rowClassName = (row: HealthRecord) => {
  return selectedDomainIdForMap.value === row.id ? 'selected-map-row' : '';
};

// Reset map view to show all domains
const handleResetMapView = () => {
  selectedDomainIdForMap.value = null;
  fetchLocationHealth(null).then(() => {
    setTimeout(() => {
      initMap();
    }, 100);
  });
};

onMounted(async () => {
  fetchHealthData();
  
  // Fetch location health data then render map
  await fetchLocationHealth();
  setTimeout(() => {
    initMap();
  }, 100);
});

onBeforeUnmount(() => {
  // Clean up map instance
  if (leafletMap) {
    leafletMap.remove();
    leafletMap = null;
  }
  mapMarkers.length = 0;
});
</script>

<style scoped lang="scss">
.health-check-view {
  padding: 0;
  height: calc(100vh - 200px);
}

.map-container {
  height: 100%;
}

.health-legend {
  padding: 16px;
  background: #fafafa;
  border-radius: 4px;
}

:deep(.n-layout-sider) {
  background: transparent !important;
}

:deep(.n-data-table) {
  .n-data-table-th {
    font-weight: 600;
  }
}

// Leaflet map styles
#health-map {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

:deep(.leaflet-container) {
  font-family: inherit;
  background: #e3f2fd;
}

:deep(.leaflet-tooltip) {
  padding: 8px 12px;
  font-size: 12px;
  line-height: 1.5;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

// Pulse animation for map markers
:deep(.pulse-marker) {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 0.6;
  }
  50% {
    transform: scale(1.5);
    opacity: 0.3;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

// Highlight selected row for map
:deep(.selected-map-row) {
  background-color: #e6f7ff !important;
  border-left: 3px solid #1890ff;
}

:deep(.selected-map-row:hover) {
  background-color: #bae7ff !important;
}
</style>
