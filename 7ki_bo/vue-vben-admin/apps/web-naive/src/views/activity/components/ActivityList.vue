<template>
  <div class="activity-list">
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

        <n-form-item :label="$t('activity.detailModal.k6d3b4')">
          <n-select
            v-model:value="filterForm.status"
            :placeholder="$t('activity.activityList.k8bf72')"
            :options="statusOptions"
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

    <!-- 🚀 NEW: SmartDataGrid Component for Activities -->
    <SmartDataGrid
      :data="tableData"
      :columns="columns"
      :loading="loading"
      :pagination="paginationReactive"
      selectable
      :selected-keys="checkedRowKeys"
      row-key="id"
      @update:selected-keys="checkedRowKeys = $event"
      @update:page="handlePageChange"
      @update:page-size="handlePageSizeChange"
      @refresh="handleRefresh"
      @row-click="handleRowClick"
    >
      <template #actionBar="{ selectedCount, selectedRows }">
        <n-card :bordered="false" class="rounded-16px shadow-sm">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <!-- 主要操作按钮 -->
              <div class="flex gap-2">
                <n-button type="primary" @click="handleCreate">{{ $t('activity.formModal.k65b05') }}</n-button>
              </div>

              <!-- 选择信息 -->
              <div class="text-sm text-gray-600">
                {{ $t('activity.common.selectedCount', [selectedCount, paginationReactive.total]) }}
              </div>
            </div>

            <div class="flex gap-2">
              <!-- 批量操作 -->
              <n-button
                v-if="selectedCount > 0"
                type="success"
                size="small"
                @click="handleBatchPublish(selectedRows)"
              >
                批量发布 ({{ selectedCount }})
              </n-button>
              <n-button
                v-if="selectedCount > 0"
                type="warning"
                size="small"
                @click="handleBatchClose(selectedRows)"
              >
                批量关闭 ({{ selectedCount }})
              </n-button>
              <n-button
                v-if="selectedCount > 0"
                type="info"
                size="small"
                @click="handleBatchCopy(selectedRows)"
              >
                批量复制 ({{ selectedCount }})
              </n-button>
              <n-button
                v-if="selectedCount > 0"
                type="error"
                size="small"
                @click="handleBatchDelete(selectedRows)"
              >
                {{ $t('activity.labels.batchDelete') }} ({{ selectedCount }})
              </n-button>

              <!-- 选择控制 -->
              <n-button size="small" @click="clearSelection">{{ $t('activity.activityList.k6e05') }}</n-button>
              <n-button size="small" @click="selectAll">{{ $t('activity.formModal.k51683') }}</n-button>
            </div>
          </div>
        </n-card>
      </template>
    </SmartDataGrid>

    <!-- 新增/编辑活动弹窗 -->
    <ActivityFormModal
      v-model:show="showFormModal"
      :editing-item="editingItem"
      @success="handleFormSuccess"
    />

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

    <!-- 派发奖励弹窗 -->
    <DistributeRewardModal
      v-model:show="showDistributeModal"
      :activity="distributeActivity"
      @success="handleFormSuccess"
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
  NPopconfirm,
  NProgress,
  NInputNumber,
  useMessage,
  useDialog,
} from 'naive-ui';

import {
  getActivityList,
  deleteActivity,
  bulkDeleteActivities,
  batchUpdateDisplayOrder,
  updateActivityStatus,
  publishActivity,
  closeActivityDisplay,
  closeActivity,
  pinActivity,
  batchCopyActivities,
  batchUpdateActivityStatus,
  type Activity,
  type ActivityListParams,
  ACTIVITY_STATUS_OPTIONS,
  ACTIVITY_CATEGORIES,
  ACTIVITY_TYPES,
  CURRENCY_OPTIONS,
} from '#/api/activity';
import { useActiveMemberTiers } from '#/composables/useActiveMemberTiers';
import { formatActivityMemberParticipation } from '#/utils/activityMemberTier';
import { renderTzDateTime } from '#/components/common/tzDateTimeRender';
// ✅ PERFORMANCE FIX: Lazy load modal components - they only load when modals are opened
const ActivityFormModal = defineAsyncComponent(
  () => import('./ActivityFormModal.vue'),
);
const ActivityDetailModal = defineAsyncComponent(
  () => import('./ActivityDetailModal.vue'),
);
const ActivityRecordModal = defineAsyncComponent(
  () => import('./ActivityRecordModal.vue'),
);
const DistributeRewardModal = defineAsyncComponent(
  () => import('./DistributeRewardModal.vue'),
);

const message = useMessage();
const dialog = useDialog();

const { tierOptions: memberTierOptions, load: loadMemberTierOptions } =
  useActiveMemberTiers();

// 响应式数据
const loading = ref(false);
const showFormModal = ref(false);
const showDetailModal = ref(false);
const showRecordModal = ref(false);
const showDistributeModal = ref(false);
const editingItem = ref<Activity | null>(null);
const detailActivity = ref<Activity | null>(null);
const recordActivityId = ref<number>(0);
const distributeActivity = ref<Activity | null>(null);
const checkedRowKeys = ref<(string | number)[]>([]);
const tableData = ref<Activity[]>([]);
const tableRef = ref();
const filterFormRef = ref<FormInst>();

// 筛选表单
const filterForm = reactive<ActivityListParams>({
  keyword: '',
  category: '',
  status: '',
  currency: '',
  memberScope: '',
  platforms: '',
});

// Pagination (simplified for SmartDataGrid)
const paginationReactive = reactive({
  page: 1,
  pageSize: 20,
  total: 0,
});

// 选项配置
const statusOptions = ACTIVITY_STATUS_OPTIONS.map((item) => ({
  label: item.label,
  value: item.value,
}));

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
    type: 'selection',
    width: 50,
  },
  {
    title: $t('activity.detailModal.k6392'),
    key: 'displayOrder',
    width: 120,
    sorter: true,
    render: (row) => {
      return h(NInputNumber, {
        value: row.displayOrder,
        min: 0,
        size: 'small',
        style: { width: '100px' },
        onUpdateValue: (value: number | null) => {
          if (value !== null) {
            handleDisplayOrderChange(row, value);
          }
        },
      });
    },
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
    render: (row) => {
      // Map English values to Chinese labels
      const categoryMap: { [key: string]: string } = {
        comprehensive: $t('activity.categories.comprehensive'),
        chess_cards: $t('activity.categories.chess_cards'),
        hunting: $t('activity.categories.hunting'),
        slot: $t('activity.categories.slot'),
        live: $t('activity.categories.live'),
        sports: $t('activity.categories.sports'),
        cockfight: $t('activity.categories.cockfight'),
        lottery: $t('activity.categories.lottery'),
        video: $t('activity.categories.video'),
        esports: $t('activity.categories.esports'),
        table: $t('activity.categories.table'),
        arcade: $t('activity.categories.arcade'),
        simulation: $t('activity.categories.simulation'),
        other: $t('activity.categories.other'),
        recharge: $t('activity.categories.recharge'),
        betting: $t('activity.categories.betting'),
        signin: $t('activity.categories.signin'),
        invite: $t('activity.categories.invite'),
        newuser: $t('activity.categories.newuser'),
        redpacket: $t('activity.categories.redpacket'),
        custom: $t('activity.categories.custom'),
      };
      const chineseLabel =
        categoryMap[row.category] || row.category || $t('activity.statuses.uncategorized');
      return h(
        NTag,
        { type: 'info', size: 'small' },
        { default: () => chineseLabel },
      );
    },
  },
  {
    title: $t('activity.activityList.k6d3b2'),
    key: 'type',
    width: 140,
    render: (row) => {
      // Map English values to Chinese labels
      const typeMap: { [key: string]: string } = {
        recharge: $t('activity.types.recharge'),
        wagering: $t('activity.types.wagering'),
        rescue: $t('activity.types.rescue'),
        checkin: $t('activity.types.checkin'),
        luckyspin: $t('activity.types.luckyspin'),
        luckywager: $t('activity.types.luckywager'),
        redpacket: $t('activity.types.redpacket'),
        investment: $t('activity.types.investment'),
        promotion: $t('activity.types.promotion'),
        agent: $t('activity.types.agent'),
        collect: $t('activity.types.collect'),
        guessing: $t('activity.types.guessing'),
        newbie: $t('activity.types.newbie'),
        referral: $t('activity.types.referral'),
        soft: $t('activity.types.soft'),
        new: $t('activity.types.new'),
        ranking: $t('activity.types.ranking'),
        custom: $t('activity.types.custom'),
      };
      const chineseLabel = typeMap[row.type] || row.type || $t('activity.statuses.unknownType');
      return h(
        NTag,
        { type: 'default', size: 'small' },
        { default: () => chineseLabel },
      );
    },
  },
  {
    title: $t('activity.detailModal.k53c2'),
    key: 'memberScope',
    width: 120,
    render: (row) => {
      const rowConfig = (row as any).config || {};
      return formatActivityMemberParticipation(
        {
          ...rowConfig,
          memberScope: rowConfig.memberScope ?? row.memberScope,
          memberTags: rowConfig.memberTags,
          memberGroups: rowConfig.memberGroups,
        },
        memberTierOptions.value,
      );
    },
  },

  {
    title: $t('activity.activityList.k6d3b3'),
    key: 'startsAt',
    width: 200,
    render: (row) => {
      try {
        // Handle both Date objects and strings
        const startsAt =
          row.startsAt instanceof Date
            ? row.startsAt
            : row.startsAt
              ? new Date(row.startsAt)
              : null;
        const endsAt =
          row.endsAt instanceof Date
            ? row.endsAt
            : row.endsAt
              ? new Date(row.endsAt)
              : null;

        if (
          !startsAt ||
          !endsAt ||
          isNaN(startsAt.getTime()) ||
          isNaN(endsAt.getTime())
        ) {
          return $t('activity.activityList.k672a2');
        }

        return h('div', {}, [
          h('div', {}, [
            $t('activity.common.startLabel', ['']),
            renderTzDateTime(startsAt),
          ]),
          h('div', {}, [
            $t('activity.common.endLabel', ['']),
            renderTzDateTime(endsAt),
          ]),
        ]);
      } catch (error) {
        return $t('activity.activityList.k65f6');
      }
    },
  },

  {
    title: $t('activity.activityList.k72b6'),
    key: 'status',
    width: 100,
    render: (row) => {
      const statusConfig = {
        draft: { type: 'warning', text: $t('activity.detailModal.k8349') },
        active: { type: 'success', text: $t('activity.detailModal.k8fdb') },
        paused: { type: 'error', text: $t('activity.detailModal.k5df24') },
        archived: { type: 'default', text: $t('activity.detailModal.k5df25') },
      };
      const config = statusConfig[row.status as keyof typeof statusConfig] || {
        type: 'default',
        text: $t('activity.activityList.k672a'),
      };
      return h(
        NTag,
        { type: config.type as any, size: 'small' },
        { default: () => config.text },
      );
    },
  },

  {
    title: $t('activity.activityList.k64cd'),
    key: 'createdBy',
    width: 120,
    ellipsis: {
      tooltip: true,
    },
    render: (row) => row.createdBy || $t('activity.statuses.system'),
  },
  {
    title: $t('activity.detailModal.k66f4'),
    key: 'updatedAt',
    width: 160,
    render: (row) => {
      try {
        if (
          row.updatedAt &&
          typeof row.updatedAt === 'object' &&
          Object.keys(row.updatedAt).length > 0
        ) {
          const date = new Date(row.updatedAt);
          if (!isNaN(date.getTime())) {
            return renderTzDateTime(date);
          }
        } else if (row.updatedAt && typeof row.updatedAt === 'string') {
          const date = new Date(row.updatedAt);
          if (!isNaN(date.getTime())) {
            return renderTzDateTime(date);
          }
        }
        return $t('activity.detailModal.k672a');
      } catch (error) {
        return $t('activity.activityList.k65f6');
      }
    },
  },
  {
    title: $t('activity.rewardReport.k64cd'),
    key: 'actions',
    width: 280,
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
                      type: 'info',
                      onClick: () => handleEdit(row),
                    },
                    { default: () => $t('activity.activityList.k7f16') },
                  ),
                default: () => $t('activity.activityList.k7f16'),
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
                      type: 'success',
                      onClick: () => handleDistributeReward(row),
                    },
                    { default: () => $t('activity.activityList.k6d3e') },
                  ),
                default: () => $t('activity.activityList.k624b'),
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
                      onClick: () => handlePin(row),
                    },
                    { default: () => '置顶' },
                  ),
                default: () => '置顶到第一位',
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
                      type: 'success',
                      disabled: row.status === 'active',
                      onClick: () => handlePublish(row),
                    },
                    { default: () => '发布' },
                  ),
                default: () => '发布活动',
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
                      onClick: () => handleCloseDisplay(row),
                    },
                    { default: () => '关闭展示' },
                  ),
                default: () => '关闭客户端展示（活动可继续结算）',
              },
            ),
            h(
              NPopconfirm,
              {
                onPositiveClick: () => handleCloseActivity(row),
              },
              {
                trigger: () =>
                  h(
                    NButton,
                    {
                      size: 'small',
                      type: 'error',
                    },
                    { default: () => '关闭活动' },
                  ),
                default: () => '关闭后客户端不再展示且不可派发/领取奖励',
              },
            ),
            h(
              NPopconfirm,
              {
                onPositiveClick: () => handleStatusToggle(row),
              },
              {
                trigger: () =>
                  h(
                    NButton,
                    {
                      size: 'small',
                      type: row.status === 'active' ? 'error' : 'success',
                      disabled: (row as any)._isUpdating,
                      loading: (row as any)._isUpdating,
                    },
                    {
                      default: () =>
                        row.status === 'active' ? $t('activity.labels.disable') : $t('activity.labels.enable'),
                    },
                  ),
                default: () =>
                  `确定${row.status === 'active' ? $t('activity.labels.disable') : $t('activity.labels.enable')}此活动吗？`,
              },
            ),
            h(
              NPopconfirm,
              {
                onPositiveClick: () => handleDelete(row),
              },
              {
                trigger: () =>
                  h(
                    NButton,
                    {
                      size: 'small',
                      type: 'error',
                    },
                    { default: () => $t('activity.activityList.k52202') },
                  ),
                default: () => $t('activity.activityList.k786e'),
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

    // Transform the data to match table expectations
    const transformedData = response.list.map((activity) => {
      // Handle empty date objects and convert to proper dates
      let startsAt = null;
      let endsAt = null;

      if (
        activity.startsAt &&
        typeof activity.startsAt === 'object' &&
        Object.keys(activity.startsAt).length > 0
      ) {
        startsAt = new Date(activity.startsAt);
      } else if (activity.startsAt && typeof activity.startsAt === 'string') {
        startsAt = new Date(activity.startsAt);
      }

      if (
        activity.endsAt &&
        typeof activity.endsAt === 'object' &&
        Object.keys(activity.endsAt).length > 0
      ) {
        endsAt = new Date(activity.endsAt);
      } else if (activity.endsAt && typeof activity.endsAt === 'string') {
        endsAt = new Date(activity.endsAt);
      }

      const localeTitle =
        activity.locales?.find((l) => l.locale === 'zh-CN')?.title ||
        activity.locales?.find((l) => l.locale === 'pt-BR')?.title ||
        activity.locales?.[0]?.title;
      const configTitle = activity.config?.title;
      const resolvedTitle =
        (localeTitle && localeTitle !== $t('activity.detailModal.k672a2') ? localeTitle : null) ||
        (configTitle && configTitle !== $t('activity.detailModal.k672a2') ? configTitle : null) ||
        localeTitle ||
        configTitle ||
        $t('activity.detailModal.k672a2');

      return {
        ...activity,
        // Extract fields from config (title prefers locales over stale config.title)
        title: resolvedTitle,
        memberScope: activity.config?.memberScope || '全部会员',
        claimLimit: activity.config?.claimLimit || 0,
        platforms: activity.config?.platforms || [],
        startsAt: startsAt,
        endsAt: endsAt,
        description: activity.config?.description || '',
        rules: activity.config?.rules || '',
        imageUrl: activity.config?.imageUrl || '',
        bannerUrl: activity.config?.bannerUrl || '',
        // Display order from database
        displayOrder: activity.displayOrder ?? 0,
      };
    });

    tableData.value = transformedData;
    paginationReactive.total = response.pagination.total;

    // Sort by display order by default
    tableData.value.sort(
      (a, b) => (a.displayOrder || 0) - (b.displayOrder || 0),
    );
  } catch (error) {
    message.error($t('activity.activityList.k83b7'));
    console.error('❌ Error fetching activity list:', error);
    console.error('❌ Error details:', {
      message: error.message,
      response: error.response,
      status: error.response?.status,
      data: error.response?.data,
    });
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
    status: '',
    currency: '',
    memberScope: '',
    platforms: '',
  });
  paginationReactive.page = 1;
  fetchActivityList();
};

const handleRefresh = () => {
  fetchActivityList();
};

const handleCreate = () => {
  editingItem.value = null;
  showFormModal.value = true;
};

const handleEdit = (item: Activity) => {
  // Ensure we create a clean copy to avoid reactivity issues
  editingItem.value = item ? { ...item } : null;
  showFormModal.value = true;
};

const handleView = (item: Activity) => {
  detailActivity.value = item;
  showDetailModal.value = true;
};

const handleViewRecords = (item: Activity) => {
  recordActivityId.value = item.id;
  showRecordModal.value = true;
};

const handleDistributeReward = (item: Activity) => {
  distributeActivity.value = item;
  showDistributeModal.value = true;
};

const handlePin = async (item: Activity) => {
  try {
    await pinActivity(item.id);
    message.success('已置顶');
    await fetchActivityList();
  } catch (error) {
    message.error(error instanceof Error ? error.message : '置顶失败');
  }
};

const handlePublish = async (item: Activity) => {
  try {
    await publishActivity(item.id);
    message.success('发布成功');
    await fetchActivityList();
  } catch (error) {
    message.error(error instanceof Error ? error.message : '发布失败');
  }
};

const handleCloseDisplay = async (item: Activity) => {
  try {
    await closeActivityDisplay(item.id);
    message.success('已关闭展示');
    await fetchActivityList();
  } catch (error) {
    message.error(error instanceof Error ? error.message : '关闭展示失败');
  }
};

const handleCloseActivity = async (item: Activity) => {
  try {
    await closeActivity(item.id);
    message.success('活动已关闭');
    await fetchActivityList();
  } catch (error) {
    message.error(error instanceof Error ? error.message : '关闭活动失败');
  }
};

const handleBatchPublish = async (selectedRows?: Activity[]) => {
  const rows = selectedRows || [];
  if (!rows.length) return;
  try {
    await batchUpdateActivityStatus({
      ids: rows.map((r) => r.id),
      status: 'active',
    });
    message.success('批量发布成功');
    clearSelection();
    await fetchActivityList();
  } catch (error) {
    message.error(error instanceof Error ? error.message : '批量发布失败');
  }
};

const handleBatchClose = async (selectedRows?: Activity[]) => {
  const rows = selectedRows || [];
  if (!rows.length) return;
  try {
    await batchUpdateActivityStatus({
      ids: rows.map((r) => r.id),
      status: 'archived',
    });
    message.success('批量关闭成功');
    clearSelection();
    await fetchActivityList();
  } catch (error) {
    message.error(error instanceof Error ? error.message : '批量关闭失败');
  }
};

const handleBatchCopy = async (selectedRows?: Activity[]) => {
  const rows = selectedRows || [];
  if (!rows.length) return;
  try {
    const res = await batchCopyActivities({ ids: rows.map((r) => r.id) });
    const created = res.data?.created?.length ?? 0;
    const failed = res.data?.failed?.length ?? 0;
    message.success(`复制完成：成功 ${created}，失败 ${failed}`);
    clearSelection();
    await fetchActivityList();
  } catch (error) {
    message.error(error instanceof Error ? error.message : '批量复制失败');
  }
};

const handleDelete = async (item: Activity) => {
  try {
    await deleteActivity(item.id);
    // Optimistic UI update
    tableData.value = tableData.value.filter((row) => row.id !== item.id);
    message.success($t('activity.activityList.k6d3b'));
    // No background refresh needed - optimistic update is sufficient
  } catch (error) {
    message.error($t('activity.activityList.k5220'));
    console.error('Error deleting activity:', error);
  }
};

const handleStatusToggle = async (item: Activity) => {
  try {
    const newStatus = item.status === 'active' ? 'paused' : 'active';

    // Add loading state to prevent double clicks
    const rowIndex = tableData.value.findIndex((row) => row.id === item.id);
    if (rowIndex !== -1) {
      tableData.value[rowIndex] = {
        ...tableData.value[rowIndex],
        _isUpdating: true, // Add loading flag
      };
    }

    // Optimistic UI update FIRST
    if (rowIndex !== -1) {
      tableData.value[rowIndex] = {
        ...tableData.value[rowIndex],
        status: newStatus,
        _isUpdating: true,
      };
    }

    // Then make the API call
    await updateActivityStatus(item.id, { status: newStatus });

    message.success(
      $t('activity.labels.statusUpdated', [newStatus === 'active' ? $t('activity.labels.enable') : $t('activity.activityList.k5df2')]),
    );

    // Remove loading state
    if (rowIndex !== -1) {
      tableData.value[rowIndex] = {
        ...tableData.value[rowIndex],
        _isUpdating: false,
      };
    }

    // No background refresh needed - optimistic update is sufficient
    // The cache invalidation will ensure fresh data on next manual refresh
  } catch (error) {
    // Revert optimistic update on error
    if (rowIndex !== -1) {
      tableData.value[rowIndex] = {
        ...tableData.value[rowIndex],
        status: item.status, // Revert to original status
        _isUpdating: false, // Remove loading state
      };
    }

    message.error($t('activity.activityList.k66f4'));
    console.error('Error updating activity status:', error);
  }
};

const handleBatchDelete = (selectedRows?: Activity[]) => {
  const activitiesToDelete =
    selectedRows ||
    tableData.value.filter((activity) =>
      checkedRowKeys.value.includes(activity.id),
    );

  if (activitiesToDelete.length === 0) {
    message.warning($t('activity.activityList.k8bf75'));
    return;
  }

  dialog.warning({
    title: $t('activity.activityList.k786e2'),
    content: $t('activity.labels.confirmBatchDelete', [activitiesToDelete.length]),
    positiveText: $t('common.confirm'),
    negativeText: $t('common.cancel'),
    onPositiveClick: async () => {
      try {
        const ids = activitiesToDelete.map((activity) => activity.id as number);
        await bulkDeleteActivities({ ids });
        // Optimistic UI update
        tableData.value = tableData.value.filter(
          (row) => !ids.includes(row.id as number),
        );
        message.success($t('activity.activityList.k6279'));
        checkedRowKeys.value = [];
        // No background refresh needed - optimistic update is sufficient
      } catch (error) {
        message.error($t('activity.activityList.k62792'));
        console.error('Error batch deleting activities:', error);
      }
    },
  });
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

// Display order management
const savingDisplayOrder = ref(false);

const handleDisplayOrderChange = async (row: Activity, value: number) => {
  if (savingDisplayOrder.value) {
    return;
  }

  try {
    savingDisplayOrder.value = true;

    const activityId = typeof row.id === 'string' ? parseInt(row.id) : row.id;

    // Update immediately - single activity
    await batchUpdateDisplayOrder([{ id: activityId, displayOrder: value }]);

    // Update the local table data for UI responsiveness
    const activity = tableData.value.find((a) => a.id === row.id);
    if (activity) {
      activity.displayOrder = value;
    }

    // Sort the table data by displayOrder to reflect the changes immediately
    tableData.value.sort(
      (a, b) => (a.displayOrder || 0) - (b.displayOrder || 0),
    );

    message.success($t('activity.labels.sortUpdated', [activityId, value]));
  } catch (error) {
    message.error($t('activity.activityList.k66f42'));
    console.error('Error updating display order:', error);
  } finally {
    savingDisplayOrder.value = false;
  }
};

// SmartDataGrid event handlers
const handleRowClick = (activity: Activity) => {
  console.log('Activity row clicked:', activity);
  // Optional: Auto-open detail modal on row click
  handleView(activity);
};

const clearSelection = () => {
  checkedRowKeys.value = [];
  console.log('Selection cleared');
};

const selectAll = () => {
  checkedRowKeys.value = tableData.value.map((activity) => activity.id);
  console.log('All selected');
};

const handleSorterChange = (sorter: any) => {
  // 处理排序逻辑
  console.log('Sorter changed:', sorter);
  fetchActivityList();
};

const handleFormSuccess = () => {
  fetchActivityList();
};

// 初始化
onMounted(() => {
  loadMemberTierOptions();
  fetchActivityList();
});
</script>

<style scoped>
.activity-list {
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
</style>
