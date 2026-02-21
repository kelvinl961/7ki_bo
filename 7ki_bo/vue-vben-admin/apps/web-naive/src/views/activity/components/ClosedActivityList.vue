<template>
  <div class="closed-activity-list">
    <!-- 筛选和操作栏 -->
    <n-card class="mb-4">
      <n-form
        ref="filterFormRef"
        inline
        :model="filterForm"
        label-placement="left"
        label-width="auto"
        class="mb-4"
      >
        <n-form-item label="活动名称">
          <n-input
            v-model:value="filterForm.keyword"
            placeholder="请输入活动名称"
            clearable
            @keyup.enter="handleSearch"
          />
        </n-form-item>

        <n-form-item label="活动分类">
          <n-select
            v-model:value="filterForm.category"
            placeholder="请选择活动分类"
            :options="categoryOptions"
            clearable
          />
        </n-form-item>

        <n-form-item label="币种">
          <n-select
            v-model:value="filterForm.currencyScope"
            placeholder="请选择币种"
            :options="currencyOptions"
            clearable
          />
        </n-form-item>

        <n-form-item label="操作人">
          <n-input
            v-model:value="filterForm.lastModifiedBy"
            placeholder="请输入操作人"
            clearable
          />
        </n-form-item>

        <n-form-item>
          <n-space>
            <n-button type="primary" @click="handleSearch"> 搜索 </n-button>
            <n-button @click="handleReset"> 重置 </n-button>
          </n-space>
        </n-form-item>
      </n-form>
    </n-card>

    <!-- 🚀 NEW: SmartDataGrid Component for Closed Activities -->
    <SmartDataGrid
      :data="tableData"
      :columns="columns"
      :loading="loading"
      :pagination="paginationReactive"
      row-key="id"
      @update:page="handlePageChange"
      @update:page-size="handlePageSizeChange"
      @refresh="handleRefresh"
      @row-click="handleRowClick"
    >
      <template #actionBar>
        <n-card :bordered="false" class="rounded-16px shadow-sm">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <!-- 统计信息 -->
              <n-statistic label="已关闭活动" :value="closedCount" />
              <n-statistic label="已结束活动" :value="endedCount" />
              <n-statistic label="总参与人数" :value="totalParticipants" />
              <n-statistic label="总奖励金额" :value="totalRewards" />
            </div>

            <div class="flex items-center gap-2">
              <div class="text-sm text-gray-600">
                共 {{ paginationReactive.total }} 条记录
              </div>
            </div>
          </div>
        </n-card>
      </template>
    </SmartDataGrid>

    <!-- 活动详情弹窗 -->
    <ActivityDetailModal
      v-model:show="showDetailModal"
      :activity="detailActivity"
    />

    <!-- 活动记录弹窗 -->
    <ActivityRecordModal
      v-model:show="showRecordModal"
      :activity-id="recordActivityId"
    />
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  reactive,
  computed,
  onMounted,
  h,
  defineAsyncComponent,
} from 'vue';
// ✅ PERFORMANCE FIX: Lazy load components to avoid blocking page load
const SmartDataGrid = defineAsyncComponent(
  () => import('../../../components/smart/SmartDataGrid/index.vue'),
);
import type { DataTableColumns, FormInst } from 'naive-ui';
import {
  NCard,
  NForm,
  NFormItem,
  NInput,
  NSelect,
  NButton,
  NSpace,
  NTag,
  NText,
  NTooltip,
  NStatistic,
  NProgress,
  useMessage,
} from 'naive-ui';

import {
  getActivityList,
  cloneActivity,
  type Activity,
  type ActivityListParams,
  ACTIVITY_CATEGORIES,
  CURRENCY_OPTIONS,
} from '#/api/activity';
// ✅ PERFORMANCE FIX: Lazy load modal components - they only load when modals are opened
const ActivityDetailModal = defineAsyncComponent(
  () => import('./ActivityDetailModal.vue'),
);
const ActivityRecordModal = defineAsyncComponent(
  () => import('./ActivityRecordModal.vue'),
);

const message = useMessage();

// 响应式数据
const loading = ref(false);
const showDetailModal = ref(false);
const showRecordModal = ref(false);
const detailActivity = ref<Activity | null>(null);
const recordActivityId = ref<number>(0);
const tableData = ref<Activity[]>([]);
const tableRef = ref();
const filterFormRef = ref<FormInst>();

// 筛选表单
const filterForm = reactive<ActivityListParams>({
  keyword: '',
  category: '',
  currencyScope: '',
  lastModifiedBy: '',
  status: 'CLOSED', // 默认只显示已关闭的活动
});

// Pagination (simplified for SmartDataGrid)
const paginationReactive = reactive({
  page: 1,
  pageSize: 20,
  total: 0,
});

// 统计数据
const closedCount = computed(
  () => tableData.value.filter((item) => item.status === 'CLOSED').length,
);

const endedCount = computed(
  () => tableData.value.filter((item) => item.status === 'ENDED').length,
);

const totalParticipants = computed(() =>
  tableData.value.reduce((sum, item) => sum + item.currentParticipants, 0),
);

const totalRewards = computed(() =>
  tableData.value.reduce(
    (sum, item) => sum + item.currentParticipants * item.claimLimit,
    0,
  ),
);

// 选项配置
const categoryOptions = ACTIVITY_CATEGORIES.map((item) => ({
  label: item.label,
  value: item.value,
}));

const currencyOptions = CURRENCY_OPTIONS.map((item) => ({
  label: item.label,
  value: item.value,
}));

// 表格列配置
const columns = computed<DataTableColumns<Activity>>(() => [
  {
    title: '排序',
    key: 'displayOrder',
    width: 80,
    sorter: true,
  },
  {
    title: 'ID',
    key: 'id',
    width: 80,
  },
  {
    title: '活动名称',
    key: 'title',
    width: 200,
    ellipsis: {
      tooltip: true,
    },
  },
  {
    title: '活动分类',
    key: 'category',
    width: 120,
    render: (row) =>
      h(NTag, { type: 'info', size: 'small' }, { default: () => row.category }),
  },
  {
    title: '活动子种类',
    key: 'type',
    width: 140,
    render: (row) =>
      h(NTag, { type: 'default', size: 'small' }, { default: () => row.type }),
  },
  {
    title: '参与会员',
    key: 'memberScope',
    width: 120,
    render: (row) => {
      // ✅ Map member scope values to Chinese labels (same as ActivityList)
      const memberScopeMap: Record<string, string> = {
        all: '全部会员',
        five_yuan: '五元玩家',
        ten_yuan: '十元玩家',
        thirty_yuan: '三十元玩家',
        fifty_yuan: '五十元玩家',
        hundred_yuan: '一百元玩家',
        three_hundred: '三百元玩家',
        three_thousand: '三千元玩家',
        five_thousand: '五千元玩家',
        ten_thousand: '十万元玩家',
        hundred_thousand: '百万土豪',
        default: '默认等级',
        user: '备用等级',
        suspicion: '可疑玩家',
        high_win: '高胜率',
        test_user: '测试专用',
        manual_add: '手动出款',
        全部会员: '全部会员', // Already in Chinese
        VIP会员: 'VIP会员',
        新用户: '新用户',
        老用户: '老用户',
      };

      const memberScope = row.memberScope;

      // Handle empty/null/undefined
      if (!memberScope) {
        return '全部会员';
      }

      // Handle string values
      if (typeof memberScope === 'string') {
        // Check if it's already in Chinese
        if (memberScopeMap[memberScope]) {
          return memberScopeMap[memberScope];
        }

        // Handle comma-separated values (multiple tags)
        if (memberScope.includes(',')) {
          const tags = memberScope.split(',').map((tag) => tag.trim());
          const translatedTags = tags.map((tag) => memberScopeMap[tag] || tag);
          return translatedTags.join(', ');
        }

        // Return as-is if not found in map
        return memberScope;
      }

      // Handle arrays
      if (Array.isArray(memberScope)) {
        if (memberScope.length === 0) {
          return '全部会员';
        }
        const translatedTags = memberScope.map(
          (tag) => memberScopeMap[tag] || tag,
        );
        return translatedTags.join(', ');
      }

      // Fallback
      return '全部会员';
    },
  },
  {
    title: '赠送金额',
    key: 'claimLimit',
    width: 120,
    render: (row) => `${row.claimLimit} ${row.currencyScope}`,
  },
  {
    title: '活动参与端',
    key: 'platforms',
    width: 140,
    render: (row) =>
      h(
        NSpace,
        { size: 'small' },
        {
          default: () =>
            row.platforms.map((platform) =>
              h(
                NTag,
                { type: 'success', size: 'small' },
                { default: () => platform },
              ),
            ),
        },
      ),
  },
  {
    title: '活动时间',
    key: 'startAt',
    width: 200,
    render: (row) =>
      h('div', {}, [
        h('div', {}, `开始：${new Date(row.startAt).toLocaleString()}`),
        h('div', {}, `结束：${new Date(row.endAt).toLocaleString()}`),
      ]),
  },
  {
    title: '参与统计',
    key: 'currentParticipants',
    width: 120,
    render: (row) =>
      h('div', {}, [
        h('div', { class: 'text-sm' }, `参与：${row.currentParticipants}`),
        h(
          'div',
          { class: 'text-sm text-gray-500' },
          `限制：${row.maxParticipants || '无限制'}`,
        ),
      ]),
  },
  {
    title: '奖励统计',
    key: 'totalReward',
    width: 120,
    render: (row) =>
      h('div', {}, [
        h(
          'div',
          { class: 'text-sm font-medium text-green-600' },
          `${(row.currentParticipants * row.claimLimit).toFixed(2)}`,
        ),
        h('div', { class: 'text-xs text-gray-500' }, `${row.currencyScope}`),
      ]),
  },
  {
    title: '状态',
    key: 'status',
    width: 100,
    render: (row) => {
      const statusConfig = {
        CLOSED: { type: 'error', text: '已关闭' },
        ENDED: { type: 'default', text: '已结束' },
      };
      const config = statusConfig[row.status as keyof typeof statusConfig];
      return h(
        NTag,
        { type: config.type as any, size: 'small' },
        { default: () => config.text },
      );
    },
  },
  {
    title: '操作人',
    key: 'lastModifiedBy',
    width: 120,
    ellipsis: {
      tooltip: true,
    },
  },
  {
    title: '更新时间',
    key: 'updatedAt',
    width: 160,
    render: (row) => new Date(row.updatedAt).toLocaleString(),
  },
  {
    title: '操作',
    key: 'actions',
    width: 180,
    fixed: 'right',
    render: (row) =>
      h(
        NSpace,
        { size: 'small' },
        {
          default: () => [
            h(
              NTooltip,
              {},
              {
                trigger: () =>
                  h(
                    NButton,
                    {
                      size: 'small',
                      type: 'primary',
                      onClick: () => handleView(row),
                    },
                    { default: () => '查看' },
                  ),
                default: () => '查看详情',
              },
            ),
            h(
              NTooltip,
              {},
              {
                trigger: () =>
                  h(
                    NButton,
                    {
                      size: 'small',
                      type: 'warning',
                      onClick: () => handleViewRecords(row),
                    },
                    { default: () => '记录' },
                  ),
                default: () => '浏览记录',
              },
            ),
            h(
              NTooltip,
              {},
              {
                trigger: () =>
                  h(
                    NButton,
                    {
                      size: 'small',
                      type: 'info',
                      onClick: () => handleClone(row),
                    },
                    { default: () => '复制' },
                  ),
                default: () => '复制活动',
              },
            ),
          ],
        },
      ),
  },
]);

// 获取活动列表
const fetchActivityList = async () => {
  loading.value = true;
  try {
    const params: ActivityListParams = {
      page: paginationReactive.page,
      pageSize: paginationReactive.pageSize,
      ...filterForm,
    };

    const response = await getActivityList(params);
    // 过滤只显示已关闭或已结束的活动
    tableData.value = response.list.filter(
      (item) => item.status === 'CLOSED' || item.status === 'ENDED',
    );
    paginationReactive.total = response.pagination.total;
  } catch (error) {
    message.error('获取活动列表失败');
    console.error('Error fetching activity list:', error);
  } finally {
    loading.value = false;
  }
};

// 事件处理
const handleSearch = () => {
  paginationReactive.page = 1;
  fetchActivityList();
};

const handleReset = () => {
  filterFormRef.value?.restoreValidation();
  Object.assign(filterForm, {
    keyword: '',
    category: '',
    currencyScope: '',
    lastModifiedBy: '',
    status: 'CLOSED',
  });
  paginationReactive.page = 1;
  fetchActivityList();
};

const handleRefresh = () => {
  fetchActivityList();
};

const handleView = (item: Activity) => {
  detailActivity.value = item;
  showDetailModal.value = true;
};

const handleViewRecords = (item: Activity) => {
  recordActivityId.value = item.id;
  showRecordModal.value = true;
};

const handleClone = async (item: Activity) => {
  try {
    const title = `${item.title} - 复制`;
    const startAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 明天开始
    const endAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7天后结束

    await cloneActivity(item.id, { title, startAt, endAt });
    message.success('活动复制成功');
    fetchActivityList();
  } catch (error) {
    message.error('活动复制失败');
    console.error('Error cloning activity:', error);
  }
};

const handlePageChange = (page: number) => {
  paginationReactive.page = page;
  fetchActivityList();
};

const handlePageSizeChange = (pageSize: number) => {
  paginationReactive.pageSize = pageSize;
  paginationReactive.page = 1;
  fetchActivityList();
};

// SmartDataGrid event handlers
const handleRowClick = (activity: Activity) => {
  console.log('Closed activity row clicked:', activity);
  // Optional: Auto-open detail modal on row click
  handleView(activity);
};

const handleSorterChange = (sorter: any) => {
  // 处理排序逻辑
  console.log('Sorter changed:', sorter);
  fetchActivityList();
};

// 初始化
onMounted(() => {
  fetchActivityList();
});
</script>

<style scoped>
.closed-activity-list {
  height: 100%;
}

:deep(.n-data-table) {
  height: 100%;
}

:deep(.n-data-table-thead) {
  background-color: #fafafa;
}

:deep(.n-data-table-tbody .n-data-table-tr:hover) {
  background-color: #f5f5f5;
}

:deep(.n-statistic-label) {
  font-size: 12px;
  color: #666;
}

:deep(.n-statistic-value) {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}
</style>
