<template>
  <div class="batch-cache-view">
    <!-- Header Tabs -->
    <n-card size="small" style="margin-bottom: 16px">
      <n-tabs v-model:value="activeTab" type="line">
        <n-tab-pane name="url" tab="URL清理缓存">
          <!-- URL Clear Cache Content -->
          <div style="padding: 16px 0">
            <n-alert type="warning" style="margin-bottom: 16px" size="small">
              <div style="display: flex; align-items: center; gap: 8px">
                <span style="font-size: 24px">⚠</span>
                <span
                  >默认情况下，每一个账号每日可刷新 URL 10000 条，每次最多可提交
                  1000 条</span
                >
              </div>
            </n-alert>

            <n-space vertical :size="16">
              <div>
                <div style="margin-bottom: 8px; font-weight: 500">URL地址</div>
                <n-input
                  v-model:value="urlList"
                  type="textarea"
                  placeholder="请输入待刷新的URL，每行输入一个URL"
                  :rows="12"
                  :maxlength="50000"
                  show-count
                />
                <div style="margin-top: 8px; font-size: 13px; color: #666">
                  <div>
                    •
                    每行输入一个完整URL，例如：https://www.example.com/image/logo.png
                  </div>
                  <div>• 支持HTTP和HTTPS协议</div>
                  <div>• 每次最多提交1000条URL</div>
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
                  >
                    立即刷新
                  </n-button>
                  <n-button size="medium" @click="handleClear"> 清空 </n-button>
                </n-space>
              </div>

              <!-- Usage Stats -->
              <n-card size="small" style="background: #f5f7fa">
                <n-space :size="24">
                  <div>
                    <span style="color: #666">今日已使用：</span>
                    <span style="font-weight: 600; color: #2080f0">{{
                      urlUsage.used
                    }}</span>
                    <span style="color: #666"> / {{ urlUsage.total }} 条</span>
                  </div>
                  <div>
                    <span style="color: #666">剩余额度：</span>
                    <span style="font-weight: 600; color: #18a058">{{
                      urlUsage.total - urlUsage.used
                    }}</span>
                    <span style="color: #666"> 条</span>
                  </div>
                </n-space>
              </n-card>
            </n-space>
          </div>
        </n-tab-pane>

        <n-tab-pane name="directory" tab="目录清理缓存">
          <!-- Directory Clear Cache Content -->
          <div style="padding: 16px 0">
            <n-alert type="warning" style="margin-bottom: 16px" size="small">
              <div style="display: flex; align-items: center; gap: 8px">
                <span style="font-size: 24px">⚠</span>
                <span
                  >默认情况下，每一个账号每日可刷新目录 100 个，每次最多可提交
                  10 个</span
                >
              </div>
            </n-alert>

            <n-space vertical :size="16">
              <div>
                <div style="margin-bottom: 8px; font-weight: 500">目录地址</div>
                <n-input
                  v-model:value="directoryList"
                  type="textarea"
                  placeholder="请输入待刷新的目录路径，每行输入一个目录"
                  :rows="12"
                  :maxlength="10000"
                  show-count
                />
                <div style="margin-top: 8px; font-size: 13px; color: #666">
                  <div>
                    •
                    每行输入一个完整目录路径，例如：https://www.example.com/images/
                  </div>
                  <div>• 目录路径必须以 / 结尾</div>
                  <div>• 将清除该目录下的所有资源缓存</div>
                  <div>• 每次最多提交10个目录</div>
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
                  >
                    立即刷新
                  </n-button>
                  <n-button size="medium" @click="handleClear"> 清空 </n-button>
                </n-space>
              </div>

              <!-- Usage Stats -->
              <n-card size="small" style="background: #f5f7fa">
                <n-space :size="24">
                  <div>
                    <span style="color: #666">今日已使用：</span>
                    <span style="font-weight: 600; color: #2080f0">{{
                      directoryUsage.used
                    }}</span>
                    <span style="color: #666">
                      / {{ directoryUsage.total }} 个</span
                    >
                  </div>
                  <div>
                    <span style="color: #666">剩余额度：</span>
                    <span style="font-weight: 600; color: #18a058">{{
                      directoryUsage.total - directoryUsage.used
                    }}</span>
                    <span style="color: #666"> 个</span>
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
        <span style="font-weight: 600">刷新记录</span>
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
    title: '刷新类型',
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
          default: () => (row.type === 'URL' ? 'URL刷新' : '目录刷新'),
        },
      );
    },
  },
  {
    title: '刷新数量',
    key: 'count',
    width: 100,
  },
  {
    title: '状态',
    key: 'status',
    width: 100,
    render(row: RefreshHistory) {
      const statusMap: Record<string, { text: string; type: any }> = {
        PENDING: { text: '等待中', type: 'default' },
        PROCESSING: { text: '处理中', type: 'info' },
        SUCCESS: { text: '成功', type: 'success' },
        FAILED: { text: '失败', type: 'error' },
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
    title: '提交时间',
    key: 'createdAt',
    width: 180,
    render(row: RefreshHistory) {
      return new Date(row.createdAt).toLocaleString('zh-CN');
    },
  },
  {
    title: '完成时间',
    key: 'completedAt',
    width: 180,
    render(row: RefreshHistory) {
      return row.completedAt
        ? new Date(row.completedAt).toLocaleString('zh-CN')
        : '--';
    },
  },
  {
    title: '操作人',
    key: 'operator',
    width: 120,
  },
];

// Methods
const handleRefresh = async () => {
  const type = activeTab.value;
  const content = type === 'url' ? urlList.value : directoryList.value;

  if (!content.trim()) {
    message.warning('请输入要刷新的地址');
    return;
  }

  const lines = content
    .trim()
    .split('\n')
    .filter((line) => line.trim());
  const maxCount = type === 'url' ? 1000 : 10;

  if (lines.length > maxCount) {
    message.error(
      `每次最多提交 ${maxCount} 条${type === 'url' ? 'URL' : '目录'}`,
    );
    return;
  }

  // Validate URLs/directories
  const urlPattern = /^https?:\/\/.+/;
  const invalidLines = lines.filter((line) => !urlPattern.test(line.trim()));

  if (invalidLines.length > 0) {
    message.error(`发现 ${invalidLines.length} 条无效的地址格式`);
    return;
  }

  // Check directory format
  if (type === 'directory') {
    const invalidDirs = lines.filter((line) => !line.trim().endsWith('/'));
    if (invalidDirs.length > 0) {
      message.error('目录路径必须以 / 结尾');
      return;
    }
  }

  isRefreshing.value = true;

  try {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    message.success(
      `成功提交 ${lines.length} 条${type === 'url' ? 'URL' : '目录'}刷新任务`,
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
    message.error('刷新任务提交失败');
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
  message.success('已清空');
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
    message.error('获取刷新记录失败');
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
