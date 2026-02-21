<template>
  <div class="smart-data-grid-demo">
    <h2 class="mb-6 text-2xl font-bold">SmartDataGrid Demo</h2>

    <!-- Demo 1: Basic Usage -->
    <div class="demo-section mb-8">
      <h3 class="mb-4 text-lg font-semibold">1. Basic Usage</h3>
      <SmartDataGrid
        :data="basicData"
        :columns="basicColumns"
        :loading="loading1"
        :pagination="pagination1"
        @update:page="handlePageChange1"
        @update:page-size="handlePageSizeChange1"
        @refresh="handleRefresh1"
      />
    </div>

    <!-- Demo 2: With Selection -->
    <div class="demo-section mb-8">
      <h3 class="mb-4 text-lg font-semibold">2. With Row Selection</h3>
      <SmartDataGrid
        :data="selectionData"
        :columns="selectionColumns"
        :loading="loading2"
        :pagination="pagination2"
        selectable
        :selected-keys="selectedKeys"
        @update:selected-keys="handleSelectionChange"
        @selection-change="handleSelectionChange2"
        @update:page="handlePageChange2"
        @update:page-size="handlePageSizeChange2"
        @refresh="handleRefresh2"
      >
        <template #actionBar="{ selectedCount, selectedRows }">
          <n-card :bordered="false" class="rounded-16px shadow-sm">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4">
                <span class="text-sm text-gray-600">
                  已选择 {{ selectedCount }} 条数据
                </span>
                <n-button
                  v-if="selectedCount > 0"
                  type="error"
                  size="small"
                  @click="handleBulkDelete(selectedRows)"
                >
                  批量删除
                </n-button>
              </div>
              <div class="flex gap-2">
                <n-button size="small" @click="clearSelection"
                  >清空选择</n-button
                >
                <n-button size="small" @click="selectAll">全选</n-button>
              </div>
            </div>
          </n-card>
        </template>
      </SmartDataGrid>
    </div>

    <!-- Demo 3: With Auto-Refresh -->
    <div class="demo-section mb-8">
      <h3 class="mb-4 text-lg font-semibold">3. With Auto-Refresh</h3>
      <SmartDataGrid
        :data="autoRefreshData"
        :columns="autoRefreshColumns"
        :loading="loading3"
        :pagination="pagination3"
        auto-refresh
        :refresh-intervals="[5, 10, 15, 30]"
        :default-refresh-interval="10"
        @update:page="handlePageChange3"
        @update:page-size="handlePageSizeChange3"
        @refresh="handleRefresh3"
      />
    </div>

    <!-- Demo 4: With Summary -->
    <div class="demo-section mb-8">
      <h3 class="mb-4 text-lg font-semibold">4. With Summary</h3>
      <SmartDataGrid
        :data="summaryData"
        :columns="summaryColumns"
        :loading="loading4"
        :pagination="pagination4"
        show-summary
        :summary="summaryInfo"
        selectable
        @update:page="handlePageChange4"
        @update:page-size="handlePageSizeChange4"
        @refresh="handleRefresh4"
      >
        <template #summary="{ summary }">
          <n-card :bordered="false" class="rounded-16px shadow-sm">
            <div class="grid grid-cols-4 gap-4 text-center">
              <div>
                <div class="text-2xl font-bold text-blue-600">
                  {{ summary.totalCount }}
                </div>
                <div class="text-sm text-gray-600">总记录数</div>
              </div>
              <div>
                <div class="text-2xl font-bold text-green-600">
                  ¥{{ summary.totalAmount?.toLocaleString() }}
                </div>
                <div class="text-sm text-gray-600">总金额</div>
              </div>
              <div>
                <div class="text-2xl font-bold text-orange-600">
                  {{ summary.activeCount }}
                </div>
                <div class="text-sm text-gray-600">活跃用户</div>
              </div>
              <div>
                <div class="text-2xl font-bold text-purple-600">
                  {{ summary.avgAmount?.toFixed(2) }}
                </div>
                <div class="text-sm text-gray-600">平均金额</div>
              </div>
            </div>
          </n-card>
        </template>
      </SmartDataGrid>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, h } from 'vue';
import { NButton, NTag, useMessage } from 'naive-ui';
import SmartDataGrid from './index.vue';
import type { DataTableColumns } from 'naive-ui';

const message = useMessage();

// Demo 1: Basic Usage
const loading1 = ref(false);
const basicData = ref([
  { id: 1, name: '张三', email: 'zhangsan@example.com', status: 'active' },
  { id: 2, name: '李四', email: 'lisi@example.com', status: 'inactive' },
  { id: 3, name: '王五', email: 'wangwu@example.com', status: 'active' },
]);

const pagination1 = reactive({
  page: 1,
  pageSize: 10,
  total: 3,
});

const basicColumns: DataTableColumns = [
  { title: 'ID', key: 'id', width: 80 },
  { title: '姓名', key: 'name', width: 120 },
  { title: '邮箱', key: 'email', width: 200 },
  {
    title: '状态',
    key: 'status',
    width: 100,
    render: (row: any) =>
      h(
        NTag,
        {
          type: row.status === 'active' ? 'success' : 'default',
        },
        { default: () => (row.status === 'active' ? '活跃' : '非活跃') },
      ),
  },
];

// Demo 2: With Selection
const loading2 = ref(false);
const selectedKeys = ref<(string | number)[]>([]);
const selectionData = ref([
  { id: 1, name: '用户A', role: 'admin', lastLogin: '2024-01-15' },
  { id: 2, name: '用户B', role: 'user', lastLogin: '2024-01-14' },
  { id: 3, name: '用户C', role: 'user', lastLogin: '2024-01-13' },
  { id: 4, name: '用户D', role: 'admin', lastLogin: '2024-01-12' },
]);

const pagination2 = reactive({
  page: 1,
  pageSize: 10,
  total: 4,
});

const selectionColumns: DataTableColumns = [
  { title: 'ID', key: 'id', width: 80 },
  { title: '用户名', key: 'name', width: 120 },
  { title: '角色', key: 'role', width: 100 },
  { title: '最后登录', key: 'lastLogin', width: 120 },
  {
    title: '操作',
    key: 'actions',
    width: 150,
    render: (row: any) =>
      h('div', { class: 'flex gap-2' }, [
        h(
          NButton,
          { size: 'small', type: 'primary' },
          { default: () => '编辑' },
        ),
        h(NButton, { size: 'small', type: 'error' }, { default: () => '删除' }),
      ]),
  },
];

// Demo 3: Auto-Refresh
const loading3 = ref(false);
const autoRefreshData = ref([
  {
    id: 1,
    metric: 'CPU使用率',
    value: '45%',
    status: 'normal',
    timestamp: new Date().toLocaleTimeString(),
  },
  {
    id: 2,
    metric: '内存使用率',
    value: '67%',
    status: 'warning',
    timestamp: new Date().toLocaleTimeString(),
  },
  {
    id: 3,
    metric: '磁盘使用率',
    value: '23%',
    status: 'normal',
    timestamp: new Date().toLocaleTimeString(),
  },
]);

const pagination3 = reactive({
  page: 1,
  pageSize: 10,
  total: 3,
});

const autoRefreshColumns: DataTableColumns = [
  { title: 'ID', key: 'id', width: 80 },
  { title: '指标', key: 'metric', width: 120 },
  { title: '数值', key: 'value', width: 100 },
  {
    title: '状态',
    key: 'status',
    width: 100,
    render: (row: any) =>
      h(
        NTag,
        {
          type: row.status === 'normal' ? 'success' : 'warning',
        },
        { default: () => (row.status === 'normal' ? '正常' : '警告') },
      ),
  },
  { title: '更新时间', key: 'timestamp', width: 150 },
];

// Demo 4: With Summary
const loading4 = ref(false);
const summaryData = ref([
  {
    id: 1,
    name: '订单A',
    amount: 1500,
    status: 'completed',
    category: 'electronics',
  },
  {
    id: 2,
    name: '订单B',
    amount: 2300,
    status: 'pending',
    category: 'clothing',
  },
  { id: 3, name: '订单C', amount: 800, status: 'completed', category: 'books' },
  {
    id: 4,
    name: '订单D',
    amount: 3200,
    status: 'completed',
    category: 'electronics',
  },
]);

const pagination4 = reactive({
  page: 1,
  pageSize: 10,
  total: 4,
});

const summaryColumns: DataTableColumns = [
  { title: 'ID', key: 'id', width: 80 },
  { title: '订单名称', key: 'name', width: 120 },
  {
    title: '金额',
    key: 'amount',
    width: 100,
    render: (row: any) => `¥${row.amount}`,
  },
  {
    title: '状态',
    key: 'status',
    width: 100,
    render: (row: any) =>
      h(
        NTag,
        {
          type: row.status === 'completed' ? 'success' : 'warning',
        },
        { default: () => (row.status === 'completed' ? '已完成' : '待处理') },
      ),
  },
  { title: '类别', key: 'category', width: 120 },
];

const summaryInfo = computed(() => {
  const data = summaryData.value;
  const totalAmount = data.reduce((sum, item) => sum + item.amount, 0);
  const activeCount = data.filter((item) => item.status === 'completed').length;
  const avgAmount = totalAmount / data.length;

  return {
    totalCount: data.length,
    totalAmount,
    activeCount,
    avgAmount,
  };
});

// Event handlers
const handlePageChange1 = (page: number) => {
  pagination1.page = page;
  message.info(`Basic Demo: 切换到第 ${page} 页`);
};

const handlePageSizeChange1 = (pageSize: number) => {
  pagination1.pageSize = pageSize;
  pagination1.page = 1;
  message.info(`Basic Demo: 每页显示 ${pageSize} 条`);
};

const handleRefresh1 = () => {
  loading1.value = true;
  setTimeout(() => {
    loading1.value = false;
    message.success('Basic Demo: 数据已刷新');
  }, 1000);
};

const handlePageChange2 = (page: number) => {
  pagination2.page = page;
  message.info(`Selection Demo: 切换到第 ${page} 页`);
};

const handlePageSizeChange2 = (pageSize: number) => {
  pagination2.pageSize = pageSize;
  pagination2.page = 1;
  message.info(`Selection Demo: 每页显示 ${pageSize} 条`);
};

const handleRefresh2 = () => {
  loading2.value = true;
  setTimeout(() => {
    loading2.value = false;
    message.success('Selection Demo: 数据已刷新');
  }, 1000);
};

const handleSelectionChange = (keys: (string | number)[]) => {
  selectedKeys.value = keys;
};

const handleSelectionChange2 = (
  selectedRows: any[],
  keys: (string | number)[],
) => {
  message.info(`选择了 ${selectedRows.length} 条数据`);
};

const handleBulkDelete = (selectedRows: any[]) => {
  message.warning(`批量删除 ${selectedRows.length} 条数据`);
};

const clearSelection = () => {
  selectedKeys.value = [];
  message.info('已清空选择');
};

const selectAll = () => {
  selectedKeys.value = selectionData.value.map((item) => item.id);
  message.info('已全选');
};

const handlePageChange3 = (page: number) => {
  pagination3.page = page;
  message.info(`Auto-Refresh Demo: 切换到第 ${page} 页`);
};

const handlePageSizeChange3 = (pageSize: number) => {
  pagination3.pageSize = pageSize;
  pagination3.page = 1;
  message.info(`Auto-Refresh Demo: 每页显示 ${pageSize} 条`);
};

const handleRefresh3 = () => {
  loading3.value = true;
  // Simulate data update
  autoRefreshData.value = autoRefreshData.value.map((item) => ({
    ...item,
    value: `${Math.floor(Math.random() * 100)}%`,
    timestamp: new Date().toLocaleTimeString(),
  }));

  setTimeout(() => {
    loading3.value = false;
    message.success('Auto-Refresh Demo: 数据已自动刷新');
  }, 500);
};

const handlePageChange4 = (page: number) => {
  pagination4.page = page;
  message.info(`Summary Demo: 切换到第 ${page} 页`);
};

const handlePageSizeChange4 = (pageSize: number) => {
  pagination4.pageSize = pageSize;
  pagination4.page = 1;
  message.info(`Summary Demo: 每页显示 ${pageSize} 条`);
};

const handleRefresh4 = () => {
  loading4.value = true;
  setTimeout(() => {
    loading4.value = false;
    message.success('Summary Demo: 数据已刷新');
  }, 1000);
};
</script>

<style scoped>
.smart-data-grid-demo {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.demo-section {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
  background: #fafafa;
}

.demo-section h3 {
  color: #374151;
  margin-bottom: 16px;
}
</style>
