<template>
  <div class="batch-cache-view">
    <!-- Header Tabs -->
    <n-card size="small" style="margin-bottom: 16px">
      <n-tabs v-model:value="activeTab" type="line">
        <n-tab-pane name="url" :tab="$t('operations.domain.batchCacheExt.urlTab')">
          <!-- URL Clear Cache Content -->
          <div style="padding: 16px 0">
            <n-alert type="warning" style="margin-bottom: 16px" size="small">
              <div style="display: flex; align-items: center; gap: 8px">
                <span style="font-size: 24px">⚠</span>
                <span>{{ $t('operations.domain.batchCacheExt.urlLimitWarning') }}</span>
              </div>
            </n-alert>

            <n-space vertical :size="16">
              <div>
                <div style="margin-bottom: 8px; font-weight: 500">{{ $t('operations.domain.batchCacheExt.urlAddress') }}</div>
                <n-input
                  v-model:value="urlList"
                  type="textarea"
                  :placeholder="$t('operations.domain.batchCacheExt.urlPlaceholder')"
                  :rows="12"
                  :maxlength="50000"
                  show-count
                />
                <div style="margin-top: 8px; font-size: 13px; color: #666">
                  <div>
                    •
                    {{ $t('operations.domain.batchCacheExt.urlHint1') }}
                  </div>
                  <div>• {{ $t('operations.domain.batchCacheExt.urlHint2') }}</div>
                  <div>• {{ $t('operations.domain.batchCacheExt.urlHint3') }}</div>
                </div>
              </div>

              <div>
                <n-space>
                  <n-button
                    type="primary"
                    size="medium"
                    :loading="isRefreshing"
                    :disabled="!urlList.trim()"
                    @click="handleRefresh"
                  >{{ $t('operations.domain.batchCacheExt.refreshNow') }}</n-button>
                  <n-button size="medium" @click="handleClear">{{ $t('operations.domain.batchCacheExt.clear') }}</n-button>
                </n-space>
              </div>

              <!-- Usage Stats -->
              <n-card size="small" style="background: #f5f7fa">
                <n-space :size="24">
                  <div>
                    <span style="color: #666">{{ $t('operations.domain.batchCacheExt.usedToday') }}</span>
                    <span style="font-weight: 600; color: #2080f0">{{
                      urlUsage.used
                    }}</span>
                    <span style="color: #666"> / {{ urlUsage.total }}{{ $t('operations.domain.batchCacheExt.itemsUnit') }}</span>
                  </div>
                  <div>
                    <span style="color: #666">{{ $t('operations.domain.batchCacheExt.remaining') }}</span>
                    <span style="font-weight: 600; color: #18a058">{{
                      urlUsage.total - urlUsage.used
                    }}</span>
                    <span style="color: #666">{{ $t('operations.domain.batchCacheExt.itemsUnit') }}</span>
                  </div>
                </n-space>
              </n-card>
            </n-space>
          </div>
        </n-tab-pane>

        <n-tab-pane name="directory" :tab="$t('operations.domain.batchCacheExt.directoryTab')">
          <!-- Directory Clear Cache Content -->
          <div style="padding: 16px 0">
            <n-alert type="warning" style="margin-bottom: 16px" size="small">
              <div style="display: flex; align-items: center; gap: 8px">
                <span style="font-size: 24px">⚠</span>
                <span>{{ $t('operations.domain.batchCacheExt.directoryLimitWarning') }}</span>
              </div>
            </n-alert>

            <n-space vertical :size="16">
              <div>
                <div style="margin-bottom: 8px; font-weight: 500">{{ $t('operations.domain.batchCacheExt.directoryAddress') }}</div>
                <n-input
                  v-model:value="directoryList"
                  type="textarea"
                  :placeholder="$t('operations.domain.batchCacheExt.directoryPlaceholder')"
                  :rows="12"
                  :maxlength="10000"
                  show-count
                />
                <div style="margin-top: 8px; font-size: 13px; color: #666">
                  <div>
                    •
                    {{ $t('operations.domain.batchCacheExt.dirHint1') }}
                  </div>
                  <div>• {{ $t('operations.domain.batchCacheExt.dirHint2') }}</div>
                  <div>• {{ $t('operations.domain.batchCacheExt.dirHint3') }}</div>
                  <div>• {{ $t('operations.domain.batchCacheExt.dirHint4') }}</div>
                </div>
              </div>

              <div>
                <n-space>
                  <n-button
                    type="primary"
                    size="medium"
                    :loading="isRefreshing"
                    :disabled="!directoryList.trim()"
                    @click="handleRefresh"
                  >{{ $t('operations.domain.batchCacheExt.refreshNow') }}</n-button>
                  <n-button size="medium" @click="handleClear">{{ $t('operations.domain.batchCacheExt.clear') }}</n-button>
                </n-space>
              </div>

              <!-- Usage Stats -->
              <n-card size="small" style="background: #f5f7fa">
                <n-space :size="24">
                  <div>
                    <span style="color: #666">{{ $t('operations.domain.batchCacheExt.usedToday') }}</span>
                    <span style="font-weight: 600; color: #2080f0">{{
                      directoryUsage.used
                    }}</span>
                    <span style="color: #666">
                      / {{ directoryUsage.total }}{{ $t('operations.domain.batchCacheExt.dirsUnit') }}</span
                    >
                  </div>
                  <div>
                    <span style="color: #666">{{ $t('operations.domain.batchCacheExt.remaining') }}</span>
                    <span style="font-weight: 600; color: #18a058">{{
                      directoryUsage.total - directoryUsage.used
                    }}</span>
                    <span style="color: #666">{{ $t('operations.domain.batchCacheExt.dirsUnit') }}</span>
                  </div>
                </n-space>
              </n-card>
            </n-space>
          </div>
        </n-tab-pane>
      </n-tabs>
    </n-card>

    <!-- Refresh History -->
    <n-card size="small">
      <template #header>
        <span style="font-weight: 600">{{ $t('operations.domain.batchCacheExt.refreshHistory') }}</span>
      </template>

      <n-data-table
        :columns="historyColumns"
        :data="historyData"
        :loading="historyLoading"
        :pagination="paginationConfig"
        size="small"
      />
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { $t } from '@vben/locales';

import { ref, reactive, h, onMounted, computed } from 'vue';
import {
  NCard,
  NSpace,
  NInput,
  NButton,
  NDataTable,
  NTabs,
  NTabPane,
  NAlert,
  NTag,
  useMessage,
  type DataTableColumn,
} from 'naive-ui';

const message = useMessage();

interface RefreshHistory {
  id: number;
  type: string;
  count: number;
  status: string;
  createdAt: string;
  completedAt?: string;
  operator: string;
}

// State
const activeTab = ref('url');
const urlList = ref('');
const directoryList = ref('');
const isRefreshing = ref(false);
const historyLoading = ref(false);
const historyData = ref<RefreshHistory[]>([]);

// Usage Statistics
const urlUsage = ref({
  used: 0,
  total: 10000,
});

const directoryUsage = ref({
  used: 0,
  total: 100,
});

// Pagination
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
    fetchHistory();
  },
}));

// History Columns
const historyColumns: DataTableColumn<RefreshHistory>[] = [
  {
    title: $t('operations.domain.batchCacheExt.refreshType'),
    key: 'type',
    width: 120,
    render(row: RefreshHistory) {
      return h(
        NTag,
        {
          type: row.type === 'URL' ? 'info' : 'warning',
          size: 'small',
        },
        {
          default: () => (row.type === 'URL' ? $t('operations.domain.batchCacheExt.urlRefresh') : $t('operations.domain.batchCacheExt.dirRefresh')),
        },
      );
    },
  },
  {
    title: $t('operations.domain.batchCacheExt.refreshCount'),
    key: 'count',
    width: 100,
  },
  {
    title: $t('common.status'),
    key: 'status',
    width: 100,
    render(row: RefreshHistory) {
      const statusMap: Record<string, { text: string; type: any }> = {
        PENDING: { text: $t('operations.domain.batchCacheExt.statusPending'), type: 'default' },
        PROCESSING: { text: $t('operations.domain.batchCacheExt.statusProcessing'), type: 'info' },
        SUCCESS: { text: $t('operations.domain.batchCacheExt.statusSuccess'), type: 'success' },
        FAILED: { text: $t('operations.domain.batchCacheExt.statusFailed'), type: 'error' },
      };
      const status = statusMap[row.status] || {
        text: row.status,
        type: 'default',
      };
      return h(
        NTag,
        { type: status.type as any, size: 'small' },
        { default: () => status.text },
      );
    },
  },
  {
    title: $t('operations.domain.batchCacheExt.submitTime'),
    key: 'createdAt',
    width: 180,
    render(row: RefreshHistory) {
      return new Date(row.createdAt).toLocaleString('zh-CN');
    },
  },
  {
    title: $t('operations.domain.batchCacheExt.completeTime'),
    key: 'completedAt',
    width: 180,
    render(row: RefreshHistory) {
      return row.completedAt
        ? new Date(row.completedAt).toLocaleString('zh-CN')
        : '--';
    },
  },
  {
    title: $t('common.operator'),
    key: 'operator',
    width: 120,
  },
];

// Methods
const handleRefresh = async () => {
  const type = activeTab.value;
  const content = type === 'url' ? urlList.value : directoryList.value;

  if (!content.trim()) {
    message.warning($t('operations.domain.batchCacheExt.enterAddress'));
    return;
  }

  const lines = content
    .trim()
    .split('\n')
    .filter((line) => line.trim());
  const maxCount = type === 'url' ? 1000 : 10;

  if (lines.length > maxCount) {
    message.error(
      $t('operations.domain.batchCacheExt.maxSubmit', [maxCount, type === 'url' ? 'URL' : $t('operations.domain.batchCacheExt.directoryTab')]),
    );
    return;
  }

  // Validate URLs/directories
  const urlPattern = /^https?:\/\/.+/;
  const invalidLines = lines.filter((line) => !urlPattern.test(line.trim()));

  if (invalidLines.length > 0) {
    message.error($t('operations.domain.batchCacheExt.invalidFormat', [invalidLines.length]));
    return;
  }

  // Check directory format
  if (type === 'directory') {
    const invalidDirs = lines.filter((line) => !line.trim().endsWith('/'));
    if (invalidDirs.length > 0) {
      message.error($t('operations.domain.batchCacheExt.dirMustEndSlash'));
      return;
    }
  }

  isRefreshing.value = true;

  try {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    message.success(
      $t('operations.domain.batchCacheExt.submitSuccess', [lines.length, type === 'url' ? $t('operations.domain.batchCacheExt.urlRefresh') : $t('operations.domain.batchCacheExt.dirRefresh')]),
    );

    // Update usage
    if (type === 'url') {
      urlUsage.value.used += lines.length;
      urlList.value = '';
    } else {
      directoryUsage.value.used += lines.length;
      directoryList.value = '';
    }

    // Refresh history
    fetchHistory();
  } catch (error: any) {
    console.error('Refresh error:', error);
    message.error($t('operations.domain.batchCacheExt.submitFailed'));
  } finally {
    isRefreshing.value = false;
  }
};

const handleClear = () => {
  if (activeTab.value === 'url') {
    urlList.value = '';
  } else {
    directoryList.value = '';
  }
  message.success($t('operations.domain.batchCacheExt.cleared'));
};

const fetchHistory = async () => {
  historyLoading.value = true;
  try {
    // Mock data - replace with actual API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    const mockHistory: RefreshHistory[] = [
      {
        id: 1,
        type: 'URL',
        count: 150,
        status: 'SUCCESS',
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        operator: 'admin',
      },
      {
        id: 2,
        type: 'DIRECTORY',
        count: 5,
        status: 'PROCESSING',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        operator: 'admin',
      },
      {
        id: 3,
        type: 'URL',
        count: 500,
        status: 'SUCCESS',
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        completedAt: new Date(Date.now() - 7000000).toISOString(),
        operator: 'admin',
      },
    ];

    historyData.value = mockHistory;
    pagination.itemCount = mockHistory.length;
  } catch (error: any) {
    console.error('Fetch history error:', error);
    message.error($t('operations.domain.batchCacheExt.fetchHistoryFailed'));
  } finally {
    historyLoading.value = false;
  }
};

onMounted(() => {
  fetchHistory();
});
</script>

<style scoped lang="scss">
.batch-cache-view {
  padding: 0;
}

:deep(.n-data-table) {
  .n-data-table-th {
    font-weight: 600;
  }
}
</style>
