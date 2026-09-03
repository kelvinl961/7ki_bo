<template>
  <div class="login-devices-tab">
    <n-card :title="$t('user.loginDevices.deviceList')" class="mb-4">
      <div class="mb-3 flex items-center justify-between">
        <div class="text-sm text-gray-500">
          {{ $t('user.loginDevices.deviceCount', [pagination.itemCount]) }}
        </div>
        <div class="flex gap-2">
          <n-button size="small" @click="loadDevices">{{ $t('common.refresh') }}</n-button>
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

    <n-card :title="$t('user.loginDevices.loginRecords')" class="mb-4">
      <div class="mb-3 flex items-center justify-between">
        <div class="text-sm text-gray-500">
          {{ $t('user.loginDevices.recordCount', [logsPagination.itemCount]) }}
        </div>
        <div class="flex gap-2">
          <n-button size="small" @click="loadLogs">{{ $t('common.refresh') }}</n-button>
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
import { $t } from '@vben/locales';

import { ref, computed, onMounted, h } from 'vue';
import { NCard, NButton, NDataTable, NTag } from 'naive-ui';
import {
  getLoginDevices,
  getLoginLogs,
  type LoginDevice,
  type LoginLog,
} from '#/api/core/login-devices';
import { renderTzDateTime } from '#/components/common/tzDateTimeRender';

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

const columns = computed(() => [
  {
    title: $t('user.loginDevices.client'),
    key: 'client',
    width: 140,
    render: (row: LoginDevice) => `${row.platform || ''}`,
  },
  {
    title: $t('user.loginDevices.browser'),
    key: 'browser',
    width: 160,
    render: (row: LoginDevice) =>
      `${row.browserName || ''} ${row.browserVersion || ''}`,
  },
  {
    title: $t('user.loginDevices.operatingSystem'),
    key: 'os',
    width: 180,
    render: (row: LoginDevice) =>
      `${row.operatingSystem || ''} ${row.osVersion || ''}`,
  },
  { title: $t('user.loginDevices.deviceBrand'), key: 'deviceBrand', width: 120 },
  { title: $t('user.loginDevices.deviceModel'), key: 'deviceModel', width: 140 },
  {
    title: $t('user.loginDevices.ipRegion'),
    key: 'ip',
    width: 260,
    render: (row: LoginDevice) => `${row.ip || ''} ${row.ipRegion || ''}`,
  },
  {
    title: $t('user.loginDevices.firstLogin'),
    key: 'firstSeen',
    width: 180,
    render: (row: LoginDevice) => renderTzDateTime(row.firstSeen),
  },
  {
    title: $t('user.loginDevices.lastLogin'),
    key: 'lastSeen',
    width: 180,
    render: (row: LoginDevice) => renderTzDateTime(row.lastSeen),
  },
  {
    title: $t('user.loginDevices.loginCount'),
    key: 'loginCount',
    width: 100,
    render: (row: LoginDevice) =>
      h(
        NTag,
        { type: 'info', size: 'small' },
        { default: () => row.loginCount },
      ),
  },
]);

const logsColumns = computed(() => [
  {
    title: $t('common.time'),
    key: 'createdAt',
    width: 180,
    render: (row: LoginLog) => renderTzDateTime(row.createdAt),
  },
  { title: 'IP', key: 'ip', width: 140 },
  { title: 'UA', key: 'userAgent', width: 500 },
]);

async function loadDevices() {
  if (!props.userId) return;
  loading.value = true;
  try {
    const res = await getLoginDevices(
      props.userId,
      pagination.value.page,
      pagination.value.pageSize,
    );

    devices.value = res.list || [];
    pagination.value.itemCount = res.total || 0;
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

    logs.value = res.list || [];
    logsPagination.value.itemCount = res.total || 0;
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
