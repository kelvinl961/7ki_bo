<template>
  <Page
    :title="$t('operations.feedback.title')"
    :description="$t('operations.feedback.description')"
  >
    <div class="feedback-management">
      <n-tabs
        v-model:value="activeTab"
        type="line"
        class="mb-4"
        @update:value="handleTabChange"
      >
        <n-tab-pane name="pending" :tab="$t('operations.feedback.tabPending')">
          <template #tab>
            <span class="flex items-center gap-2">
              {{ $t('operations.feedback.tabPending') }}
              <n-badge
                :value="tabCounts.pending"
                :max="99"
                type="warning"
                v-if="tabCounts.pending > 0"
              />
            </span>
          </template>
        </n-tab-pane>

        <n-tab-pane name="approved" :tab="$t('operations.feedback.tabApproved')">
          <template #tab>
            <span class="flex items-center gap-2">
              {{ $t('operations.feedback.tabApproved') }}
              <n-badge
                :value="tabCounts.approved"
                :max="99"
                type="success"
                v-if="tabCounts.approved > 0"
              />
            </span>
          </template>
        </n-tab-pane>

        <n-tab-pane name="rejected" :tab="$t('operations.feedback.tabRejected')">
          <template #tab>
            <span class="flex items-center gap-2">
              {{ $t('operations.feedback.tabRejected') }}
              <n-badge
                :value="tabCounts.rejected"
                :max="99"
                type="error"
                v-if="tabCounts.rejected > 0"
              />
            </span>
          </template>
        </n-tab-pane>

        <n-tab-pane name="all" :tab="$t('operations.feedback.tabAll')">
          <template #tab>
            <span class="flex items-center gap-2">
              {{ $t('operations.feedback.tabAll') }}
              <n-badge
                :value="tabCounts.all"
                :max="999"
                type="info"
                v-if="tabCounts.all > 0"
              />
            </span>
          </template>
        </n-tab-pane>
      </n-tabs>

      <n-card class="mb-4">
        <div class="flex flex-wrap items-center gap-4">
          <n-select
            v-model:value="filterForm.status"
            :placeholder="$t('operations.feedback.statusPlaceholder')"
            style="width: 140px"
            clearable
            :options="statusOptions"
          />

          <n-input
            v-model:value="filterForm.search"
            :placeholder="$t('operations.feedback.searchPlaceholder')"
            style="width: 300px"
            clearable
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <n-icon :component="SearchOutline" />
            </template>
          </n-input>

          <n-date-picker
            v-model:value="filterForm.dateRange"
            :time-zone="timezone"
            type="datetimerange"
            format="yyyy-MM-dd HH:mm:ss"
            :placeholder="$t('common.selectDateRange')"
            style="width: 400px"
            clearable
          />

          <n-button type="primary" @click="handleSearch">
            <template #icon>
              <n-icon :component="SearchOutline" />
            </template>
            {{ $t('common.query') }}
          </n-button>
          <n-button @click="handleReset">
            <template #icon>
              <n-icon :component="RefreshOutline" />
            </template>
            {{ $t('common.reset') }}
          </n-button>
        </div>
      </n-card>

      <n-card>
        <n-data-table
          ref="tableRef"
          :columns="columns"
          :data="tableData"
          :loading="loading"
          :pagination="pagination"
          :row-key="(row: Feedback) => row.id"
          :scroll-x="1800"
          size="small"
          striped
          remote
          @update:page="handlePageChange"
          @update:page-size="handlePageSizeChange"
        />
      </n-card>

      <n-modal
        v-model:show="showDetailModal"
        preset="card"
        :title="$t('operations.feedback.detailTitle')"
        style="width: 800px"
        :mask-closable="false"
      >
        <div v-if="currentFeedback" class="feedback-detail">
          <n-descriptions :column="2" bordered class="mb-4">
            <n-descriptions-item :label="$t('operations.feedback.feedbackId')">
              {{ currentFeedback.id }}
            </n-descriptions-item>
            <n-descriptions-item :label="$t('operations.feedback.userAccount')">
              {{
                currentFeedback.user?.account || currentFeedback.user?.userID
              }}
            </n-descriptions-item>
            <n-descriptions-item :label="$t('operations.feedback.feedbackType')">
              {{ currentFeedback.feedbackType }}
            </n-descriptions-item>
            <n-descriptions-item :label="$t('operations.feedback.submitTime')">
              <TzDateTime :value="currentFeedback.createdAt" />
            </n-descriptions-item>
            <n-descriptions-item :label="$t('common.status')">
              <n-tag :type="getStatusType(currentFeedback.status)">
                {{ feedbackStatusLabel(currentFeedback.status) }}
              </n-tag>
            </n-descriptions-item>
            <n-descriptions-item
              :label="$t('operations.feedback.rewardAmount')"
              v-if="currentFeedback.reward"
            >
              {{ currentFeedback.reward }} ({{
                currentFeedback.rewardGiven
                  ? $t('operations.rewardGiven')
                  : $t('operations.rewardNotGiven')
              }})
            </n-descriptions-item>
          </n-descriptions>

          <n-card :title="$t('operations.feedback.feedbackContent')" class="mb-4">
            <p class="whitespace-pre-wrap">{{ currentFeedback.content }}</p>
          </n-card>

          <n-card
            :title="$t('operations.feedback.attachments')"
            class="mb-4"
            v-if="currentFeedback.images?.length > 0"
          >
            <n-space>
              <n-image
                v-for="(img, idx) in currentFeedback.images"
                :key="idx"
                :src="img"
                width="150"
                object-fit="cover"
                preview
              />
            </n-space>
          </n-card>

          <n-card
            :title="$t('operations.feedback.adminReply')"
            v-if="currentFeedback.adminReply"
          >
            <p class="whitespace-pre-wrap">{{ currentFeedback.adminReply }}</p>
            <div
              class="mt-2 text-sm text-gray-500"
              v-if="currentFeedback.repliedAt"
            >
              {{ $t('operations.replyTime') }}:
              <TzDateTime :value="currentFeedback.repliedAt" />
            </div>
          </n-card>
        </div>

        <template #footer>
          <div class="flex justify-end">
            <n-button @click="showDetailModal = false">{{ $t('common.close') }}</n-button>
          </div>
        </template>
      </n-modal>

      <n-modal
        v-model:show="showReplyModal"
        preset="card"
        :title="$t('operations.feedback.processTitle')"
        style="width: 600px"
        :mask-closable="false"
      >
        <n-form ref="replyFormRef" :model="replyForm" :rules="replyRules">
          <n-form-item :label="$t('operations.feedback.processStatus')" path="status">
            <n-select
              v-model:value="replyForm.status"
              :options="actionStatusOptions"
              :placeholder="$t('operations.feedback.selectProcessStatus')"
            />
          </n-form-item>

          <n-form-item
            :label="$t('operations.feedback.rewardAmount')"
            path="reward"
            v-if="replyForm.status === 'APPROVED'"
          >
            <n-input-number
              v-model:value="replyForm.reward"
              :placeholder="$t('operations.feedback.rewardPlaceholder')"
              :min="0"
              :step="10"
              style="width: 100%"
            >
              <template #suffix>BRL</template>
            </n-input-number>
          </n-form-item>

          <n-form-item :label="$t('operations.feedback.replyContent')" path="adminReply">
            <n-input
              v-model:value="replyForm.adminReply"
              type="textarea"
              :placeholder="$t('operations.feedback.replyPlaceholder')"
              :rows="4"
              maxlength="500"
              show-count
            />
          </n-form-item>
        </n-form>

        <template #footer>
          <div class="flex justify-end gap-2">
            <n-button @click="showReplyModal = false">{{ $t('common.cancel') }}</n-button>
            <n-button
              type="primary"
              :loading="modalLoading"
              @click="handleSubmitReply"
            >
              {{ $t('common.submit') }}
            </n-button>
          </div>
        </template>
      </n-modal>

      <UserDetailModal
        v-model:visible="showUserDetailModal"
        :user-id="currentUserId"
      />
    </div>
  </Page>
</template>

<script setup lang="ts">
import { $t } from '@vben/locales';

import { ref, reactive, h, onMounted, computed, defineAsyncComponent } from 'vue';
import {
  NCard,
  NDataTable,
  NButton,
  NInput,
  NSelect,
  NDatePicker,
  NIcon,
  NTag,
  NModal,
  NForm,
  NFormItem,
  NInputNumber,
  NDescriptions,
  NDescriptionsItem,
  NImage,
  NSpace,
  NBadge,
  NTabs,
  NTabPane,
  useMessage,
  type DataTableColumns,
  type FormInst,
  type FormRules,
} from 'naive-ui';
import {
  SearchOutline,
  RefreshOutline,
} from '@vicons/ionicons5';
import { Page } from '@vben/common-ui';
import {
  feedbackApi,
  getStatusType,
  type Feedback,
  type FeedbackStatus,
} from '#/api/operations/feedback';
const UserDetailModal = defineAsyncComponent(
  () => import('#/components/user/UserDetailModal.vue'),
);
import { renderTzDateTime } from '#/components/common/tzDateTimeRender';
import TzDateTime from '#/components/common/TzDateTime.vue';
import { useDisplayTimezone } from '#/composables/useDisplayTimezone';

const { timezone } = useDisplayTimezone();
const message = useMessage();

const tableRef = ref();
const replyFormRef = ref<FormInst | null>(null);

const loading = ref(false);
const modalLoading = ref(false);
const showDetailModal = ref(false);
const showReplyModal = ref(false);
const showUserDetailModal = ref(false);
const currentUserId = ref(0);
const tableData = ref<Feedback[]>([]);
const currentFeedback = ref<Feedback | null>(null);
const activeTab = ref('pending');

const tabCounts = reactive({
  pending: 0,
  approved: 0,
  rejected: 0,
  all: 0,
});

const filterForm = reactive({
  status: null as FeedbackStatus | string | null,
  search: '',
  dateRange: null as [number, number] | null,
});

const replyForm = reactive({
  status: '' as FeedbackStatus | '',
  adminReply: '',
  reward: 0,
});

const replyRules = computed<FormRules>(() => ({
  status: [
    {
      required: true,
      message: $t('operations.feedback.rules.selectStatus'),
      trigger: 'change',
    },
  ],
  adminReply: [
    {
      required: true,
      message: $t('operations.feedback.rules.enterReply'),
      trigger: 'blur',
    },
  ],
  reward: [
    {
      required: true,
      type: 'number',
      min: 0,
      message: $t('operations.feedback.rules.enterReward'),
      trigger: 'blur',
    },
  ],
}));

const pagination = reactive({
  page: 1,
  pageSize: 20,
  itemCount: 0,
  pageSizes: [10, 20, 50, 100],
  showSizePicker: true,
  prefix: ({ itemCount }: { itemCount: number }) =>
    $t('operations.totalCount', [itemCount]),
});

function feedbackStatusLabel(status: FeedbackStatus): string {
  return $t(`operations.feedback.status.${status}`);
}

const statusOptions = computed(() => [
  { label: $t('common.all'), value: null },
  { label: $t('operations.feedback.status.PENDING'), value: 'PENDING' },
  { label: $t('operations.feedback.status.IN_REVIEW'), value: 'IN_REVIEW' },
  { label: $t('operations.feedback.status.REPLIED'), value: 'REPLIED' },
  { label: $t('operations.feedback.status.APPROVED'), value: 'APPROVED' },
  { label: $t('operations.feedback.status.REJECTED'), value: 'REJECTED' },
]);

const actionStatusOptions = computed(() => [
  { label: $t('operations.feedback.actionStatus.IN_REVIEW'), value: 'IN_REVIEW' },
  { label: $t('operations.feedback.actionStatus.REPLIED'), value: 'REPLIED' },
  {
    label: $t('operations.feedback.actionStatus.APPROVED'),
    value: 'APPROVED',
  },
  { label: $t('operations.feedback.actionStatus.REJECTED'), value: 'REJECTED' },
]);

const columns = computed<DataTableColumns<Feedback>>(() => [
  {
    title: 'ID',
    key: 'id',
    width: 80,
    fixed: 'left',
  },
  {
    title: $t('operations.feedback.transferType'),
    key: 'feedbackType',
    width: 120,
    render: (row) => {
      return h(
        NTag,
        { type: 'info', size: 'small' },
        { default: () => row.feedbackType },
      );
    },
  },
  {
    title: $t('operations.feedback.sourcePage'),
    key: 'source',
    width: 120,
    render: () => 'H5',
  },
  {
    title: $t('common.currency'),
    key: 'currency',
    width: 80,
    render: () => 'BRL',
  },
  {
    title: $t('operations.feedback.feedbackAccount'),
    key: 'user.account',
    width: 150,
    render: (row) => {
      return h(
        'a',
        {
          class: 'text-blue-500 hover:underline cursor-pointer',
          onClick: () => handleViewUser(row.userId),
        },
        row.user?.account || row.user?.userID || '-',
      );
    },
  },
  {
    title: $t('operations.feedback.feedbackTime'),
    key: 'createdAt',
    width: 180,
    render: (row) => renderTzDateTime(row.createdAt),
  },
  {
    title: $t('operations.feedback.feedbackContent'),
    key: 'content',
    width: 300,
    ellipsis: {
      tooltip: true,
    },
  },
  {
    title: $t('operations.feedback.feedbackType'),
    key: 'feedbackCategory',
    width: 100,
    render: (row) => {
      return row.feedbackType.includes('问题') ||
        row.feedbackType.includes('建议') ||
        row.feedbackType.toLowerCase().includes('issue') ||
        row.feedbackType.toLowerCase().includes('suggest')
        ? $t('operations.withdrawalIssue')
        : $t('operations.otherIssue');
    },
  },
  {
    title: $t('operations.feedback.attachmentCount'),
    key: 'images',
    width: 150,
    render: (row) => {
      if (!row.images || row.images.length === 0) {
        return $t('operations.none');
      }
      const count = row.images.length;
      const firstImage = row.images[0];
      const fileName = firstImage.split('/').pop() || '';
      return h(
        'a',
        {
          class: 'text-blue-500 hover:underline cursor-pointer',
          onClick: () => handleViewDetail(row),
        },
        `${fileName} (${count})`,
      );
    },
  },
  {
    title: $t('common.status'),
    key: 'status',
    width: 100,
    render: (row) => {
      return h(
        NTag,
        { type: getStatusType(row.status) },
        { default: () => feedbackStatusLabel(row.status) },
      );
    },
  },
  {
    title: $t('common.actions'),
    key: 'actions',
    width: 180,
    fixed: 'right',
    render: (row) => {
      return h(
        'div',
        { class: 'flex gap-2' },
        [
          h(
            'a',
            {
              class: 'text-blue-500 hover:underline cursor-pointer text-sm',
              onClick: () => handleViewDetail(row),
            },
            $t('common.detail'),
          ),
          row.status === 'PENDING' || row.status === 'IN_REVIEW'
            ? h(
                'a',
                {
                  class:
                    'text-green-500 hover:underline cursor-pointer text-sm',
                  onClick: () => handleApprove(row),
                },
                $t('operations.feedback.approve'),
              )
            : null,
          h(
            'a',
            {
              class: 'text-blue-500 hover:underline cursor-pointer text-sm',
              onClick: () => handleViewDetail(row),
            },
            $t('common.view'),
          ),
        ].filter(Boolean),
      );
    },
  },
]);

async function loadData() {
  try {
    loading.value = true;
    const params: any = {
      page: pagination.page,
      pageSize: pagination.pageSize,
    };

    if (activeTab.value !== 'all') {
      if (activeTab.value === 'pending') {
        params.status = 'PENDING';
      } else if (activeTab.value === 'approved') {
        params.status = 'APPROVED';
      } else if (activeTab.value === 'rejected') {
        params.status = 'REJECTED';
      }
    }

    if (filterForm.status) {
      params.status = filterForm.status;
    }

    if (filterForm.search) {
      params.search = filterForm.search;
    }

    if (filterForm.dateRange && filterForm.dateRange.length === 2) {
      params.startDate = new Date(filterForm.dateRange[0]).toISOString();
      const endDate = new Date(filterForm.dateRange[1]);
      endDate.setHours(23, 59, 59, 999);
      params.endDate = endDate.toISOString();
    }

    const response = await feedbackApi.getAll(params);

    if (response.success && response.data) {
      tableData.value = response.data.feedbacks;
      pagination.itemCount = response.data.pagination.total;
    } else {
      message.error(response.message || $t('operations.feedback.loadFailed'));
      tableData.value = [];
      pagination.itemCount = 0;
    }
  } catch (error: any) {
    console.error('Load feedback data error:', error);
    message.error(error.message || $t('operations.feedback.loadFailed'));
    tableData.value = [];
    pagination.itemCount = 0;
  } finally {
    loading.value = false;
  }
}

async function loadTabCounts() {
  try {
    const [pendingRes, approvedRes, rejectedRes, allRes] = await Promise.all([
      feedbackApi.getAll({ page: 1, pageSize: 1, status: 'PENDING' }),
      feedbackApi.getAll({ page: 1, pageSize: 1, status: 'APPROVED' }),
      feedbackApi.getAll({ page: 1, pageSize: 1, status: 'REJECTED' }),
      feedbackApi.getAll({ page: 1, pageSize: 1 }),
    ]);

    if (pendingRes.success && pendingRes.data) {
      tabCounts.pending = pendingRes.data.pagination.total;
    }
    if (approvedRes.success && approvedRes.data) {
      tabCounts.approved = approvedRes.data.pagination.total;
    }
    if (rejectedRes.success && rejectedRes.data) {
      tabCounts.rejected = rejectedRes.data.pagination.total;
    }
    if (allRes.success && allRes.data) {
      tabCounts.all = allRes.data.pagination.total;
    }
  } catch (error) {
    console.error('Load tab counts error:', error);
  }
}

function handleTabChange(value: string) {
  activeTab.value = value;
  pagination.page = 1;
  filterForm.status = null;
  loadData();
}

function handleSearch() {
  pagination.page = 1;
  loadData();
}

function handleReset() {
  filterForm.status = null;
  filterForm.search = '';
  filterForm.dateRange = null;
  pagination.page = 1;
  loadData();
}

function handlePageChange(page: number) {
  pagination.page = page;
  loadData();
}

function handlePageSizeChange(pageSize: number) {
  pagination.pageSize = pageSize;
  pagination.page = 1;
  loadData();
}

function handleViewDetail(feedback: Feedback) {
  currentFeedback.value = feedback;
  showDetailModal.value = true;
}

function handleViewUser(userId: number) {
  currentUserId.value = userId;
  showUserDetailModal.value = true;
}

function handleApprove(feedback: Feedback) {
  currentFeedback.value = feedback;
  replyForm.status = 'APPROVED';
  replyForm.adminReply = '';
  replyForm.reward = 50;
  showReplyModal.value = true;
}

async function handleSubmitReply() {
  try {
    await replyFormRef.value?.validate();

    if (!currentFeedback.value) {
      message.error($t('operations.feedback.noFeedbackSelected'));
      return;
    }

    modalLoading.value = true;

    const params: any = {
      status: replyForm.status,
      adminReply: replyForm.adminReply,
    };

    if (replyForm.status === 'APPROVED' && replyForm.reward > 0) {
      params.reward = replyForm.reward;
    }

    const response = await feedbackApi.updateStatus(
      currentFeedback.value.id,
      params,
    );

    if (response.success) {
      message.success($t('operations.feedback.processSuccess'));
      showReplyModal.value = false;
      loadData();
      loadTabCounts();
    } else {
      message.error(response.message || $t('operations.feedback.processFailed'));
    }
  } catch (error: any) {
    if (error.errors) {
      return;
    }
    console.error('Submit reply error:', error);
    message.error(error.message || $t('operations.feedback.processFailed'));
  } finally {
    modalLoading.value = false;
  }
}

onMounted(() => {
  loadData();
  loadTabCounts();
});
</script>

<style scoped>
.feedback-management {
  @apply w-full;
}

.feedback-detail {
  @apply space-y-4;
}

:deep(.n-data-table) {
  font-size: 13px;
}

:deep(.n-data-table th) {
  font-weight: 600;
}

:deep(.n-data-table td) {
  padding: 8px 12px;
}
</style>
