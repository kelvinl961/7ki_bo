<template>
  <div class="login-devices-tab">
    <n-card title="登录设备列表" class="mb-4">
      <div class="mb-3 flex items-center justify-between">
        <div class="text-sm text-gray-500">
          共 {{ pagination.itemCount }} 台设备
        </div>
        <div class="flex gap-2">
          <n-button size="small" @click="loadDevices">刷新</n-button>
        </div>
      </div>
      <n-data-table
        :loading="loading"
        :columns="columns"
        :data="devices"
        :pagination="pagination"
        :row-key="(row: LoginDevice) => `${row.ip}-${row.userAgent}`"
        size="small"
        :scroll-x="1200"
        @update:page="handlePageChange"
        @update:page-size="handlePageSizeChange"
      />
    </n-card>

    <n-card title="登录记录" class="mb-4">
      <div class="mb-3 flex items-center justify-between">
        <div class="text-sm text-gray-500">
          共 {{ logsPagination.itemCount }} 条记录
        </div>
        <div class="flex gap-2">
          <n-button size="small" @click="loadLogs">刷新</n-button>
        </div>
      </div>
      <n-data-table
        :loading="logsLoading"
        :columns="logsColumns"
        :data="logs"
        :pagination="logsPagination"
        :row-key="(row: LoginLog) => row.id"
        size="small"
        :scroll-x="800"
        @update:page="handleLogsPageChange"
        @update:page-size="handleLogsPageSizeChange"
      />
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, h } from 'vue';
import { NCard, NButton, NDataTable, NTag } from 'naive-ui';
import {
  getLoginDevices,
  getLoginLogs,
  type LoginDevice,
  type LoginLog,
} from '#/api/core/login-devices';

// Helper function to safely format dates
function formatDate(dateValue: string | Date | null | undefined): string {
  try {
    if (!dateValue) return '-';
    const date =
      typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
    if (isNaN(date.getTime())) {
      return '无效日期';
    }
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'Asia/Shanghai',
    });
  } catch (error) {
    console.error('Error formatting date:', dateValue, error);
    return '日期解析错误';
  }
}

interface Props {
  userId: number;
}
const props = defineProps<Props>();

const loading = ref(false);
const devices = ref<LoginDevice[]>([]);
const pagination = ref({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  showSizePicker: true,
  pageSizes: [10, 20, 50],
});

const logsLoading = ref(false);
const logs = ref<LoginLog[]>([]);
const logsPagination = ref({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  showSizePicker: true,
  pageSizes: [10, 20, 50],
});

const columns = [
  {
    title: '客户端',
    key: 'client',
    width: 140,
    render: (row: LoginDevice) => `${row.platform || ''}`,
  },
  {
    title: '浏览器',
    key: 'browser',
    width: 160,
    render: (row: LoginDevice) =>
      `${row.browserName || ''} ${row.browserVersion || ''}`,
  },
  {
    title: '操作系统',
    key: 'os',
    width: 180,
    render: (row: LoginDevice) =>
      `${row.operatingSystem || ''} ${row.osVersion || ''}`,
  },
  { title: '设备品牌', key: 'deviceBrand', width: 120 },
  { title: '设备型号', key: 'deviceModel', width: 140 },
  {
    title: 'IP/区域',
    key: 'ip',
    width: 260,
    render: (row: any) => `${row.ip || ''} ${row.ipRegion || ''}`,
  },
  {
    title: '首次登录',
    key: 'firstSeen',
    width: 180,
    render: (row: LoginDevice) => formatDate(row.firstSeen),
  },
  {
    title: '最近登录',
    key: 'lastSeen',
    width: 180,
    render: (row: LoginDevice) => formatDate(row.lastSeen),
  },
  {
    title: '登录次数',
    key: 'loginCount',
    width: 100,
    render: (row: LoginDevice) =>
      h(
        NTag,
        { type: 'info', size: 'small' },
        { default: () => row.loginCount },
      ),
  },
];

const logsColumns = [
  {
    title: '时间',
    key: 'createdAt',
    width: 180,
    render: (row: LoginLog) => formatDate(row.createdAt),
  },
  { title: 'IP', key: 'ip', width: 140 },
  { title: 'UA', key: 'userAgent', width: 500 },
];

async function loadDevices() {
  if (!props.userId) return;
  loading.value = true;
  try {
    const res = await getLoginDevices(
      props.userId,
      pagination.value.page,
      pagination.value.pageSize,
    );
    console.log('🔍 Login devices API response:', res);
    console.log('🔍 Response type:', typeof res);
    console.log('🔍 Response keys:', Object.keys(res || {}));

    devices.value = res.list || [];
    pagination.value.itemCount = res.total || 0;

    console.log('🔍 Updated pagination:', {
      itemCount: pagination.value.itemCount,
      page: pagination.value.page,
      pageSize: pagination.value.pageSize,
      totalPages: Math.ceil((res.total || 0) / pagination.value.pageSize),
    });
  } finally {
    loading.value = false;
  }
}

async function loadLogs() {
  if (!props.userId) return;
  logsLoading.value = true;
  try {
    const res = await getLoginLogs(
      props.userId,
      logsPagination.value.page,
      logsPagination.value.pageSize,
    );
    console.log('🔍 Login logs API response:', res);
    console.log('🔍 Response type:', typeof res);
    console.log('🔍 Response keys:', Object.keys(res || {}));

    logs.value = res.list || [];
    logsPagination.value.itemCount = res.total || 0;

    console.log('🔍 Updated logs pagination:', {
      itemCount: logsPagination.value.itemCount,
      page: logsPagination.value.page,
      pageSize: logsPagination.value.pageSize,
      totalPages: Math.ceil((res.total || 0) / logsPagination.value.pageSize),
    });
  } finally {
    logsLoading.value = false;
  }
}

function handlePageChange(page: number) {
  pagination.value.page = page;
  loadDevices();
}
function handlePageSizeChange(size: number) {
  pagination.value.pageSize = size;
  pagination.value.page = 1;
  loadDevices();
}
function handleLogsPageChange(page: number) {
  logsPagination.value.page = page;
  loadLogs();
}
function handleLogsPageSizeChange(size: number) {
  logsPagination.value.pageSize = size;
  logsPagination.value.page = 1;
  loadLogs();
}

onMounted(() => {
  loadDevices();
  loadLogs();
});
</script>

<style scoped>
.login-devices-tab {
  @apply space-y-4;
}
</style>
