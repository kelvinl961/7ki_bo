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
        <n-form-item :label="$t('activity.rewardReport.k6d3b')">
          <n-input
            v-model:value="filterForm.keyword"
            :placeholder="$t('activity.formModal.k8bf7')"
            clearable
            @keyup.enter="handleSearch"
          />
        </n-form-item>

        <n-form-item :label="$t('activity.detailModal.k6d3b2')">
          <n-select
            v-model:value="filterForm.category"
            :placeholder="$t('activity.activityList.k8bf7')"
            :options="categoryOptions"
            clearable
          />
        </n-form-item>

        <n-form-item :label="$t('activity.luckyWheel.k5e01')">
          <n-select
            v-model:value="filterForm.currencyScope"
            :placeholder="$t('activity.activityList.k8bf73')"
            :options="currencyOptions"
            clearable
          />
        </n-form-item>

        <n-form-item :label="$t('activity.activityList.k64cd')">
          <n-input
            v-model:value="filterForm.lastModifiedBy"
            :placeholder="$t('activity.activityList.k8bf74')"
            clearable
          />
        </n-form-item>

        <n-form-item>
          <n-space>
            <n-button type="primary" @click="handleSearch">{{ $t('activity.rewardReport.k641c') }}</n-button>
            <n-button @click="handleReset">{{ $t('activity.recordModal.k91cd') }}</n-button>
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
              <n-statistic :label="$t('activity.center.k5df2')" :value="closedCount" />
              <n-statistic :label="$t('activity.activityList.k5df2')" :value="endedCount" />
              <n-statistic :label="$t('activity.recordModal.k603b')" :value="totalParticipants" />
              <n-statistic :label="$t('activity.recordModal.k603b2')" :value="totalRewards" />
            </div>

            <div class="flex items-center gap-2">
              <div class="text-sm text-gray-600">
                {{ $t('activity.common.totalRecordsLabel', [paginationReactive.total]) }}
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
import { $t } from '@vben/locales';

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
import { useActiveMemberTiers } from '#/composables/useActiveMemberTiers';
import { formatActivityMemberParticipation } from '#/utils/activityMemberTier';
// ✅ PERFORMANCE FIX: Lazy load modal components - they only load when modals are opened
const ActivityDetailModal = defineAsyncComponent(
  () => import('./ActivityDetailModal.vue'),
);
const ActivityRecordModal = defineAsyncComponent(
  () => import('./ActivityRecordModal.vue'),
);

const message = useMessage();

const { tierOptions: memberTierOptions, load: loadMemberTierOptions } =
  useActiveMemberTiers();

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
    title: $t('activity.detailModal.k6392'),
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
    title: $t('activity.rewardReport.k6d3b'),
    key: 'title',
    width: 200,
    ellipsis: {
      tooltip: true,
    },
  },
  {
    title: $t('activity.detailModal.k6d3b2'),
    key: 'category',
    width: 120,
    render: (row) =>
      h(NTag, { type: 'info', size: 'small' }, { default: () => row.category }),
  },
  {
    title: $t('activity.detailModal.k6d3b3'),
    key: 'type',
    width: 140,
    render: (row) =>
      h(NTag, { type: 'default', size: 'small' }, { default: () => row.type }),
  },
  {
    title: $t('activity.detailModal.k53c2'),
    key: 'memberScope',
    width: 120,
    render: (row) => {
      const config = (row as any).config || {
        memberScope: row.memberScope,
      };
      return formatActivityMemberParticipation(config, memberTierOptions.value);
    },
  },
  {
    title: $t('activity.detailModal.k8d60'),
    key: 'claimLimit',
    width: 120,
    render: (row) => `${row.claimLimit} ${row.currencyScope}`,
  },
  {
    title: $t('activity.activityList.k6d3b6'),
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
    title: $t('activity.activityList.k6d3b3'),
    key: 'startAt',
    width: 200,
    render: (row) =>
      h('div', {}, [
        h('div', {}, $t('activity.common.startLabel', [new Date(row.startAt).toLocaleString()])),
        h('div', {}, $t('activity.common.endLabel', [new Date(row.endAt).toLocaleString()])),
      ]),
  },
  {
    title: $t('activity.activityList.k53c2'),
    key: 'currentParticipants',
    width: 120,
    render: (row) =>
      h('div', {}, [
        h('div', { class: 'text-sm' }, $t('activity.common.participateLabel', [row.currentParticipants])),
        h(
          'div',
          { class: 'text-sm text-gray-500' },
          $t('activity.common.limitLabel', [row.maxParticipants || $t('activity.common.unlimited')]),
        ),
      ]),
  },
  {
    title: $t('activity.activityList.k5956'),
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
    title: $t('activity.activityList.k72b6'),
    key: 'status',
    width: 100,
    render: (row) => {
      const statusConfig = {
        CLOSED: { type: 'error', text: $t('activity.detailModal.k5df23') },
        ENDED: { type: 'default', text: $t('activity.detailModal.k5df22') },
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
    title: $t('activity.activityList.k64cd'),
    key: 'lastModifiedBy',
    width: 120,
    ellipsis: {
      tooltip: true,
    },
  },
  {
    title: $t('activity.detailModal.k66f4'),
    key: 'updatedAt',
    width: 160,
    render: (row) => new Date(row.updatedAt).toLocaleString(),
  },
  {
    title: $t('activity.rewardReport.k64cd'),
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
                    { default: () => $t('activity.activityList.k67e5') },
                  ),
                default: () => $t('activity.activityList.k67e52'),
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
                    { default: () => $t('activity.activityList.k8bb0') },
                  ),
                default: () => $t('activity.activityList.k6d4f'),
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
                    { default: () => $t('activity.activityList.k590d') },
                  ),
                default: () => $t('activity.activityList.k590d2'),
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
    message.error($t('activity.activityList.k83b7'));
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
    const title = $t('activity.common.copyTitle', [item.title]);
    const startAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 明天开始
    const endAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7天后结束

    await cloneActivity(item.id, { title, startAt, endAt });
    message.success($t('activity.activityList.k6d3b4'));
    fetchActivityList();
  } catch (error) {
    message.error($t('activity.activityList.k6d3b5'));
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
  loadMemberTierOptions();
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
