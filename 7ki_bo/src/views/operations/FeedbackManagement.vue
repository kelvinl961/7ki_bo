<template>
  <Page title="有奖反馈管理" description="管理用户提交的反馈和建议">
    <div class="feedback-management">
      <!-- Tab Navigation -->
      <n-tabs v-model:value="activeTab" type="line" class="mb-4" @update:value="handleTabChange">
        <n-tab-pane name="pending" tab="待处理">
          <template #tab>
            <span class="flex items-center gap-2">
              待处理
              <n-badge :value="tabCounts.pending" :max="99" type="warning" v-if="tabCounts.pending > 0" />
            </span>
          </template>
        </n-tab-pane>
        
        <n-tab-pane name="approved" tab="已采纳">
          <template #tab>
            <span class="flex items-center gap-2">
              已采纳
              <n-badge :value="tabCounts.approved" :max="99" type="success" v-if="tabCounts.approved > 0" />
            </span>
          </template>
        </n-tab-pane>
        
        <n-tab-pane name="rejected" tab="已忽略">
          <template #tab>
            <span class="flex items-center gap-2">
              已忽略
              <n-badge :value="tabCounts.rejected" :max="99" type="error" v-if="tabCounts.rejected > 0" />
            </span>
          </template>
        </n-tab-pane>
        
        <n-tab-pane name="all" tab="全部反馈">
          <template #tab>
            <span class="flex items-center gap-2">
              全部反馈
              <n-badge :value="tabCounts.all" :max="999" type="info" v-if="tabCounts.all > 0" />
            </span>
          </template>
        </n-tab-pane>
      </n-tabs>

      <!-- Filter Section -->
      <n-card class="mb-4">
        <div class="flex flex-wrap items-center gap-4">
          <!-- Status Filter -->
          <n-select
            v-model:value="filterForm.status"
            placeholder="反馈状态"
            style="width: 140px"
            clearable
            :options="statusOptions"
          />
          
          <!-- Search -->
          <n-input
            v-model:value="filterForm.search"
            placeholder="搜索用户账号/反馈内容/反馈类型"
            style="width: 300px"
            clearable
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <n-icon :component="SearchOutline" />
            </template>
          </n-input>

          <!-- Date Range -->
          <n-date-picker
            v-model:value="filterForm.dateRange"
            type="datetimerange"
            format="yyyy-MM-dd HH:mm:ss"
            placeholder="选择时间范围"
            style="width: 400px"
            clearable
          />

          <!-- Actions -->
          <n-button type="primary" @click="handleSearch">
            <template #icon>
              <n-icon :component="SearchOutline" />
            </template>
            查询
          </n-button>
          <n-button @click="handleReset">
            <template #icon>
              <n-icon :component="RefreshOutline" />
            </template>
            重置
          </n-button>
        </div>
      </n-card>

      <!-- Data Table -->
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

      <!-- Detail Modal -->
      <n-modal
        v-model:show="showDetailModal"
        preset="card"
        title="反馈详情"
        style="width: 800px"
        :mask-closable="false"
      >
        <div v-if="currentFeedback" class="feedback-detail">
          <!-- User Info -->
          <n-descriptions :column="2" bordered class="mb-4">
            <n-descriptions-item label="反馈ID">
              {{ currentFeedback.id }}
            </n-descriptions-item>
            <n-descriptions-item label="用户账号">
              {{ currentFeedback.user?.account || currentFeedback.user?.userID }}
            </n-descriptions-item>
            <n-descriptions-item label="反馈类型">
              {{ currentFeedback.feedbackType }}
            </n-descriptions-item>
            <n-descriptions-item label="提交时间">
              {{ formatDateTime(currentFeedback.createdAt) }}
            </n-descriptions-item>
            <n-descriptions-item label="状态">
              <n-tag :type="getStatusType(currentFeedback.status)">
                {{ getStatusLabel(currentFeedback.status) }}
              </n-tag>
            </n-descriptions-item>
            <n-descriptions-item label="奖励金额" v-if="currentFeedback.reward">
              {{ currentFeedback.reward }} ({{ currentFeedback.rewardGiven ? '已发放' : '未发放' }})
            </n-descriptions-item>
          </n-descriptions>

          <!-- Feedback Content -->
          <n-card title="反馈内容" class="mb-4">
            <p class="whitespace-pre-wrap">{{ currentFeedback.content }}</p>
          </n-card>

          <!-- Attachments -->
          <n-card title="附件" class="mb-4" v-if="currentFeedback.images?.length > 0">
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

          <!-- Admin Reply -->
          <n-card title="管理员回复" v-if="currentFeedback.adminReply">
            <p class="whitespace-pre-wrap">{{ currentFeedback.adminReply }}</p>
            <div class="mt-2 text-sm text-gray-500" v-if="currentFeedback.repliedAt">
              回复时间: {{ formatDateTime(currentFeedback.repliedAt) }}
            </div>
          </n-card>
        </div>

        <template #footer>
          <div class="flex justify-end">
            <n-button @click="showDetailModal = false">关闭</n-button>
          </div>
        </template>
      </n-modal>

      <!-- Reply Modal -->
      <n-modal
        v-model:show="showReplyModal"
        preset="card"
        title="处理反馈"
        style="width: 600px"
        :mask-closable="false"
      >
        <n-form ref="replyFormRef" :model="replyForm" :rules="replyRules">
          <n-form-item label="处理状态" path="status">
            <n-select
              v-model:value="replyForm.status"
              :options="actionStatusOptions"
              placeholder="选择处理状态"
            />
          </n-form-item>

          <n-form-item label="奖励金额" path="reward" v-if="replyForm.status === 'APPROVED'">
            <n-input-number
              v-model:value="replyForm.reward"
              placeholder="输入奖励金额"
              :min="0"
              :step="10"
              style="width: 100%"
            >
              <template #suffix>BRL</template>
            </n-input-number>
          </n-form-item>

          <n-form-item label="回复内容" path="adminReply">
            <n-input
              v-model:value="replyForm.adminReply"
              type="textarea"
              placeholder="输入回复内容"
              :rows="4"
              maxlength="500"
              show-count
            />
          </n-form-item>
        </n-form>

        <template #footer>
          <div class="flex justify-end gap-2">
            <n-button @click="showReplyModal = false">取消</n-button>
            <n-button type="primary" :loading="modalLoading" @click="handleSubmitReply">
              提交
            </n-button>
          </div>
        </template>
      </n-modal>

      <!-- User Detail Modal -->
      <UserDetailModal
        v-model:show="showUserDetailModal"
        :user-id="currentUserId"
      />
    </div>
  </Page>
</template>

<script setup lang="ts">
import { ref, reactive, h, onMounted } from 'vue';
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
import { SearchOutline, RefreshOutline, EyeOutline, CheckmarkCircleOutline, CloseCircleOutline } from '@vicons/ionicons5';
import { Page } from '@vben/common-ui';
import { feedbackApi, getStatusLabel, getStatusType, type Feedback, type FeedbackStatus } from '#/api/operations/feedback';
// ✅ PERFORMANCE FIX: Lazy load components to avoid blocking page load
import { defineAsyncComponent } from 'vue';
const UserDetailModal = defineAsyncComponent(() => import('#/components/user/UserDetailModal.vue'));
import { formatDateTime } from '#/utils/format';

// Message
const message = useMessage();

// Refs
const tableRef = ref();
const replyFormRef = ref<FormInst | null>(null);

// State
const loading = ref(false);
const modalLoading = ref(false);
const showDetailModal = ref(false);
const showReplyModal = ref(false);
const showUserDetailModal = ref(false);
const currentUserId = ref(0);
const tableData = ref<Feedback[]>([]);
const currentFeedback = ref<Feedback | null>(null);
const activeTab = ref('pending'); // Default to pending tab

// Tab counts
const tabCounts = reactive({
  pending: 0,
  approved: 0,
  rejected: 0,
  all: 0,
});

// Filter Form
const filterForm = reactive({
  status: null as FeedbackStatus | string | null,
  search: '',
  dateRange: null as [number, number] | null,
});

// Reply Form
const replyForm = reactive({
  status: '' as FeedbackStatus | '',
  adminReply: '',
  reward: 0,
});

const replyRules: FormRules = {
  status: [{ required: true, message: '请选择处理状态', trigger: 'change' }],
  adminReply: [{ required: true, message: '请输入回复内容', trigger: 'blur' }],
  reward: [
    {
      required: true,
      type: 'number',
      min: 0,
      message: '请输入有效的奖励金额',
      trigger: 'blur',
    },
  ],
};

// Pagination
const pagination = reactive({
  page: 1,
  pageSize: 20,
  itemCount: 0,
  pageSizes: [10, 20, 50, 100],
  showSizePicker: true,
  prefix: ({ itemCount }: { itemCount: number }) => `共 ${itemCount} 条`,
});

// Options
const statusOptions = [
  { label: '全部', value: null },
  { label: '待处理', value: 'PENDING' },
  { label: '审核中', value: 'IN_REVIEW' },
  { label: '已回复', value: 'REPLIED' },
  { label: '已采纳', value: 'APPROVED' },
  { label: '已拒绝', value: 'REJECTED' },
];

const actionStatusOptions = [
  { label: '审核中', value: 'IN_REVIEW' },
  { label: '回复', value: 'REPLIED' },
  { label: '采纳并奖励', value: 'APPROVED' },
  { label: '拒绝', value: 'REJECTED' },
];

// Columns
const columns: DataTableColumns<Feedback> = [
  {
    title: 'ID',
    key: 'id',
    width: 80,
    fixed: 'left',
  },
  {
    title: '转号类型',
    key: 'feedbackType',
    width: 120,
    render: (row) => {
      return h(NTag, { type: 'info', size: 'small' }, { default: () => row.feedbackType });
    },
  },
  {
    title: '来源页面',
    key: 'source',
    width: 120,
    render: () => 'H5', // From the screenshot, all show 'H5'
  },
  {
    title: '币种',
    key: 'currency',
    width: 80,
    render: () => 'BRL', // Default currency
  },
  {
    title: '反馈账号',
    key: 'user.account',
    width: 150,
    render: (row) => {
      return h(
        'a',
        {
          class: 'text-blue-500 hover:underline cursor-pointer',
          onClick: () => handleViewUser(row.userId),
        },
        row.user?.account || row.user?.userID || '-'
      );
    },
  },
  {
    title: '反馈时间',
    key: 'createdAt',
    width: 180,
    render: (row) => formatDateTime(row.createdAt),
  },
  {
    title: '反馈内容',
    key: 'content',
    width: 300,
    ellipsis: {
      tooltip: true,
    },
  },
  {
    title: '反馈类型',
    key: 'feedbackCategory',
    width: 100,
    render: (row) => {
      // Categorize based on content or type
      return row.feedbackType.includes('问题') || row.feedbackType.includes('建议') ? '提现问题' : '其他问题';
    },
  },
  {
    title: '附件(数量)',
    key: 'images',
    width: 150,
    render: (row) => {
      if (!row.images || row.images.length === 0) {
        return '无';
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
        `${fileName} (${count})`
      );
    },
  },
  {
    title: '状态',
    key: 'status',
    width: 100,
    render: (row) => {
      return h(
        NTag,
        { type: getStatusType(row.status) },
        { default: () => getStatusLabel(row.status) }
      );
    },
  },
  {
    title: '操作',
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
            '详情'
          ),
          row.status === 'PENDING' || row.status === 'IN_REVIEW'
            ? h(
                'a',
                {
                  class: 'text-green-500 hover:underline cursor-pointer text-sm',
                  onClick: () => handleApprove(row),
                },
                '采纳'
              )
            : null,
          h(
            'a',
            {
              class: 'text-blue-500 hover:underline cursor-pointer text-sm',
              onClick: () => handleViewDetail(row),
            },
            '查看'
          ),
        ].filter(Boolean)
      );
    },
  },
];

// Methods
async function loadData() {
  try {
    loading.value = true;
    const params: any = {
      page: pagination.page,
      pageSize: pagination.pageSize,
    };

    // Set status based on active tab
    if (activeTab.value !== 'all') {
      if (activeTab.value === 'pending') {
        params.status = 'PENDING';
      } else if (activeTab.value === 'approved') {
        params.status = 'APPROVED';
      } else if (activeTab.value === 'rejected') {
        params.status = 'REJECTED';
      }
    }

    // Override with manual filter if set
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
      message.error(response.message || '获取反馈列表失败');
      tableData.value = [];
      pagination.itemCount = 0;
    }
  } catch (error: any) {
    console.error('Load feedback data error:', error);
    message.error(error.message || '获取反馈列表失败');
    tableData.value = [];
    pagination.itemCount = 0;
  } finally {
    loading.value = false;
  }
}

async function loadTabCounts() {
  try {
    // Load counts for each tab
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
  filterForm.status = null; // Clear manual filter when switching tabs
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
  replyForm.reward = 50; // Default reward
  showReplyModal.value = true;
}

async function handleSubmitReply() {
  try {
    await replyFormRef.value?.validate();

    if (!currentFeedback.value) {
      message.error('未选择反馈');
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

    const response = await feedbackApi.updateStatus(currentFeedback.value.id, params);

    if (response.success) {
      message.success('处理成功');
      showReplyModal.value = false;
      loadData(); // Reload data
      loadTabCounts(); // Reload tab counts
    } else {
      message.error(response.message || '处理失败');
    }
  } catch (error: any) {
    if (error.errors) {
      // Form validation error
      return;
    }
    console.error('Submit reply error:', error);
    message.error(error.message || '处理失败');
  } finally {
    modalLoading.value = false;
  }
}

// Lifecycle
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

