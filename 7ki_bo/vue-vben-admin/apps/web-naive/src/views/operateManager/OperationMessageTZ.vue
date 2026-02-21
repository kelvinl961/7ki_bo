<template>
  <Page title="消息设置" description="管理系统消息通知和推送">
    <!-- 面包屑导航 -->
    <div class="mb-4">
      <n-breadcrumb>
        <n-breadcrumb-item>运营管理</n-breadcrumb-item>
        <n-breadcrumb-item>消息设置</n-breadcrumb-item>
      </n-breadcrumb>
    </div>

    <!-- 标签页 -->
    <n-tabs
      v-model:value="activeTab"
      type="line"
      animated
      @update:value="handleTabChange"
    >
      <n-tab-pane name="operation_message_tz" tab="活动通知中心">
        <div class="tab-content">
          <!-- 筛选器区域 -->
          <n-card class="mb-4">
            <div class="flex flex-wrap items-end gap-4">
              <!-- 语言选择 -->
              <div class="flex flex-col">
                <label class="mb-2 text-sm font-medium">语言</label>
                <n-select
                  v-model:value="filters.language"
                  placeholder="选择语言"
                  clearable
                  style="width: 120px"
                  :options="languageOptions"
                  @update:value="handleFilter"
                />
              </div>

              <!-- 币种选择 -->
              <div class="flex flex-col">
                <label class="mb-2 text-sm font-medium">币种</label>
                <n-select
                  v-model:value="filters.currency"
                  placeholder="选择币种"
                  clearable
                  style="width: 120px"
                  :options="currencyOptions"
                  @update:value="handleFilter"
                />
              </div>

              <!-- 收件人类型 -->
              <div class="flex flex-col">
                <label class="mb-2 text-sm font-medium">收件人类型</label>
                <n-select
                  v-model:value="filters.receiverType"
                  placeholder="选择收件人类型"
                  clearable
                  style="width: 140px"
                  :options="receiverTypeOptions"
                  @update:value="handleFilter"
                />
              </div>

              <!-- 标题搜索 -->
              <div class="flex flex-col">
                <label class="mb-2 text-sm font-medium">标题</label>
                <n-input
                  v-model:value="filters.title"
                  placeholder="输入标题搜索"
                  clearable
                  style="width: 200px"
                  @keyup.enter="handleFilter"
                />
              </div>

              <!-- 状态筛选 -->
              <div class="flex flex-col">
                <label class="mb-2 text-sm font-medium">状态</label>
                <n-select
                  v-model:value="filters.status"
                  placeholder="选择状态"
                  clearable
                  style="width: 120px"
                  :options="statusOptions"
                  @update:value="handleFilter"
                />
              </div>

              <!-- 触发条件 -->
              <div class="flex flex-col">
                <label class="mb-2 text-sm font-medium">触发条件</label>
                <n-select
                  v-model:value="filters.triggerCondition"
                  placeholder="选择触发条件"
                  clearable
                  style="width: 140px"
                  :options="triggerConditionOptions"
                  @update:value="handleFilter"
                />
              </div>

              <!-- 弹窗入口 -->
              <div class="flex flex-col">
                <label class="mb-2 text-sm font-medium">弹窗入口</label>
                <n-switch
                  v-model:value="filters.popupEntrance"
                  @update:value="handleFilter"
                />
              </div>

              <!-- 视频推送 -->
              <div class="flex flex-col">
                <label class="mb-2 text-sm font-medium">视频推送</label>
                <n-switch
                  v-model:value="filters.videoPush"
                  @update:value="handleFilter"
                />
              </div>

              <!-- 搜索按钮 -->
              <div class="flex gap-2">
                <n-button type="primary" @click="handleFilter"> 搜索 </n-button>
                <n-button @click="resetFilter"> 重置 </n-button>
              </div>
            </div>
          </n-card>

          <!-- 🚀 NEW: SmartDataGrid Component for Activity Notifications -->
          <SmartDataGrid
            :data="tableData"
            :columns="columns"
            :loading="loading"
            :pagination="paginationReactive"
            selectable
            :selected-keys="selectedRowKeys"
            row-key="id"
            @update:selected-keys="selectedRowKeys = $event"
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
                      <n-button type="primary" @click="handleCreate">
                        新增通知
                      </n-button>
                    </div>

                    <!-- 选择信息 -->
                    <div class="text-sm text-gray-600">
                      已选择 {{ selectedCount }} 条数据，共
                      {{ paginationReactive.total }} 条
                    </div>
                  </div>

                  <div class="flex gap-2">
                    <!-- 批量操作 -->
                    <n-button
                      v-if="selectedCount > 0"
                      type="success"
                      size="small"
                      @click="handleBatchSend(selectedRows)"
                    >
                      批量发送 ({{ selectedCount }})
                    </n-button>
                    <n-button
                      v-if="selectedCount > 0"
                      type="error"
                      size="small"
                      @click="handleBatchDelete(selectedRows)"
                    >
                      批量删除 ({{ selectedCount }})
                    </n-button>

                    <!-- 选择控制 -->
                    <n-button size="small" @click="clearSelection"
                      >清空选择</n-button
                    >
                    <n-button size="small" @click="selectAll">全选</n-button>
                  </div>
                </div>
              </n-card>
            </template>
          </SmartDataGrid>

          <!-- 创建/编辑对话框 -->
          <OperationMessageFormModal
            v-model:show="showModal"
            :editing-item="editingItem"
            @success="handleModalSuccess"
          />

          <!-- 详情查看对话框 -->
          <n-modal
            v-model:show="showDetailModal"
            title="通知详情"
            preset="dialog"
            style="width: 700px"
          >
            <div v-if="detailData" class="detail-content">
              <div class="mb-4 grid grid-cols-2 gap-4">
                <div>
                  <label class="text-sm font-medium text-gray-600">ID</label>
                  <div class="mt-1 rounded bg-gray-50 p-2">
                    {{ detailData.id }}
                  </div>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-600">语言</label>
                  <div class="mt-1 rounded bg-gray-50 p-2">
                    {{ detailData.language }}
                  </div>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-600">币种</label>
                  <div class="mt-1 rounded bg-gray-50 p-2">
                    {{ detailData.currency }}
                  </div>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-600"
                    >收件人</label
                  >
                  <div class="mt-1 rounded bg-gray-50 p-2">
                    {{ detailData.receiverType }}
                  </div>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-600"
                    >触发条件</label
                  >
                  <div class="mt-1 rounded bg-gray-50 p-2">
                    {{ detailData.triggerCondition }}
                  </div>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-600">状态</label>
                  <div class="mt-1 rounded bg-gray-50 p-2">
                    <n-tag
                      :type="
                        detailData.status === '已启用' ? 'success' : 'error'
                      "
                    >
                      {{ detailData.status }}
                    </n-tag>
                  </div>
                </div>
              </div>

              <div class="mb-4">
                <label class="text-sm font-medium text-gray-600">标题</label>
                <div class="mt-1 rounded bg-gray-50 p-3">
                  {{ detailData.title }}
                </div>
              </div>

              <div class="mb-4 grid grid-cols-2 gap-4">
                <div>
                  <label class="text-sm font-medium text-gray-600"
                    >开始时间</label
                  >
                  <div class="mt-1 rounded bg-gray-50 p-2">
                    {{ formatDate(detailData.startTime) }}
                  </div>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-600"
                    >结束时间</label
                  >
                  <div class="mt-1 rounded bg-gray-50 p-2">
                    {{ formatDate(detailData.endTime) }}
                  </div>
                </div>
              </div>

              <div class="mb-4 grid grid-cols-3 gap-4">
                <div>
                  <label class="text-sm font-medium text-gray-600"
                    >弹窗入口</label
                  >
                  <div class="mt-1 rounded bg-gray-50 p-2">
                    {{ detailData.popupEntrance ? '是' : '否' }}
                  </div>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-600"
                    >视频推送</label
                  >
                  <div class="mt-1 rounded bg-gray-50 p-2">
                    {{ detailData.videoPush ? '是' : '否' }}
                  </div>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-600"
                    >已读/发送</label
                  >
                  <div class="mt-1 rounded bg-gray-50 p-2">
                    {{ detailData.readOrSent ? '是' : '否' }}
                  </div>
                </div>
              </div>

              <div v-if="detailData.remark" class="mb-4">
                <label class="text-sm font-medium text-gray-600"
                  >后台备注</label
                >
                <div class="mt-1 rounded bg-gray-50 p-3">
                  {{ detailData.remark }}
                </div>
              </div>
            </div>

            <template #action>
              <div class="flex justify-end gap-2">
                <n-button @click="showDetailModal = false">关闭</n-button>
              </div>
            </template>
          </n-modal>
        </div>
      </n-tab-pane>

      <n-tab-pane name="operation_message_pmd" tab="跑马灯">
        <Suspense>
          <template #default>
            <div v-if="activeTab === 'operation_message_pmd'">
              <OperationMessagePMD />
            </div>
          </template>
          <template #fallback>
            <div class="loading-placeholder">加载中...</div>
          </template>
        </Suspense>
      </n-tab-pane>

      <n-tab-pane name="operation_message_gg" tab="系统公告">
        <Suspense>
          <template #default>
            <div v-if="activeTab === 'operation_message_gg'">
              <OperationMessageGG />
            </div>
          </template>
          <template #fallback>
            <div class="loading-placeholder">加载中...</div>
          </template>
        </Suspense>
      </n-tab-pane>

      <n-tab-pane name="lobby_banner" tab="大厅 Banner">
        <Suspense>
          <template #default>
            <div v-if="activeTab === 'lobby_banner'">
              <LobbyBannerManager />
            </div>
          </template>
          <template #fallback>
            <div class="loading-placeholder">加载中...</div>
          </template>
        </Suspense>
      </n-tab-pane>

      <n-tab-pane name="lobby_pop" tab="大厅浮窗弹窗">
        <Suspense>
          <template #default>
            <div v-if="activeTab === 'lobby_pop'">
              <LobbyPopModalManager />
            </div>
          </template>
          <template #fallback>
            <div class="loading-placeholder">加载中...</div>
          </template>
        </Suspense>
      </n-tab-pane>
    </n-tabs>
  </Page>
</template>

<script setup lang="ts">
import {
  ref,
  reactive,
  computed,
  onMounted,
  watch,
  h,
  defineAsyncComponent,
} from 'vue';
// ✅ PERFORMANCE FIX: Lazy load components - SmartDataGrid is used in main view, keep it but make others async
const SmartDataGrid = defineAsyncComponent(
  () => import('../../components/smart/SmartDataGrid/index.vue'),
);
import { useRoute, useRouter } from 'vue-router';
import type { DataTableColumns, DataTableRowKey } from 'naive-ui';
import {
  NBreadcrumb,
  NBreadcrumbItem,
  NButton,
  NCard,
  NInput,
  NModal,
  NSelect,
  NSwitch,
  NTag,
  NPopconfirm,
  NTabs,
  NTabPane,
  type SelectOption,
} from 'naive-ui';
import { Page } from '@vben/common-ui';
import { notification } from '#/adapter/naive';
// ✅ PERFORMANCE FIX: Tab components are already wrapped in Suspense, but make them async for better code splitting
const OperationMessageFormModal = defineAsyncComponent(
  () => import('./components/OperationMessageFormModal.vue'),
);
const OperationMessagePMD = defineAsyncComponent(
  () => import('./components/OperationMessagePMD.vue'),
);
const OperationMessageGG = defineAsyncComponent(
  () => import('./components/OperationMessageGG.vue'),
);
const LobbyBannerManager = defineAsyncComponent(
  () => import('./components/LobbyBannerManager.vue'),
);
const LobbyPopModalManager = defineAsyncComponent(
  () => import('./components/LobbyPopModalManager.vue'),
);
import {
  getOperationMessages,
  deleteOperationMessage,
  batchSendOperationMessages,
  batchDeleteOperationMessages,
  type OperationMessage as APIOperationMessage,
  type OperationMessageFilters as APIOperationMessageFilters,
} from '#/api/operationMessage';

// 临时接口定义 (稍后会创建正式的API)
interface OperationMessage {
  id: number;
  language: string;
  currency: string;
  receiverType: string;
  title: string;
  popupEntrance: boolean;
  startTime: string;
  endTime: string;
  readOrSent: boolean;
  videoPush: boolean;
  triggerCondition: string;
  status: string;
  remark: string;
  createdAt: string;
  updatedAt: string;
}

interface OperationMessageFilters {
  language?: string;
  currency?: string;
  receiverType?: string;
  title?: string;
  status?: string;
  triggerCondition?: string;
  popupEntrance?: boolean;
  videoPush?: boolean;
}

// Router
const route = useRoute();
const router = useRouter();

// Tab state
const activeTab = ref('operation_message_tz');

// Reactive data
const tableRef = ref();
const loading = ref(false);
const showModal = ref(false);
const showDetailModal = ref(false);
const editingItem = ref<OperationMessage | null>(null);
const detailData = ref<OperationMessage | null>(null);

// Table data
const tableData = ref<OperationMessage[]>([]);
const totalCount = ref(0);
const currentPage = ref(1);
const currentPageSize = ref(10);
const selectedRowKeys = ref<DataTableRowKey[]>([]);

// Filters
const filters = reactive<OperationMessageFilters>({
  language: undefined,
  currency: undefined,
  receiverType: undefined,
  title: '',
  status: undefined,
  triggerCondition: undefined,
  popupEntrance: undefined,
  videoPush: undefined,
});

// Options
const languageOptions: SelectOption[] = [
  { label: '中文', value: 'zh-CN' },
  { label: '英文', value: 'en' },
  { label: '葡语', value: 'pt' },
  { label: '西班牙语', value: 'es' },
  { label: '日语', value: 'ja' },
];

const currencyOptions: SelectOption[] = [
  { label: 'BRL', value: 'BRL' },
  { label: 'CNY', value: 'CNY' },
  { label: 'USD', value: 'USD' },
  { label: 'EUR', value: 'EUR' },
  { label: 'JPY', value: 'JPY' },
];

const receiverTypeOptions: SelectOption[] = [
  { label: '全部用户', value: 'all' },
  { label: 'VIP用户', value: 'vip' },
  { label: '新用户', value: 'new' },
  { label: '活跃用户', value: 'active' },
  { label: '自定义', value: 'custom' },
];

const statusOptions: SelectOption[] = [
  { label: '已启用', value: 'enabled' },
  { label: '已停用', value: 'disabled' },
  { label: '草稿', value: 'draft' },
];

const triggerConditionOptions: SelectOption[] = [
  { label: '登录成功', value: 'login_success' },
  { label: '充值成功', value: 'deposit_success' },
  { label: '首次充值', value: 'first_deposit' },
  { label: '投注成功', value: 'bet_success' },
  { label: '定时发送', value: 'scheduled' },
  { label: '手动触发', value: 'manual' },
];

// Pagination (simplified for SmartDataGrid)
const paginationReactive = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
});

// Table columns
const columns: DataTableColumns<OperationMessage> = [
  {
    type: 'selection',
    width: 50,
  },
  {
    title: 'ID',
    key: 'id',
    width: 80,
  },
  {
    title: '语言',
    key: 'language',
    width: 100,
    render(row) {
      const langMap: Record<string, string> = {
        'zh-CN': '中文',
        en: '英文',
        pt: '葡语',
        es: '西班牙语',
        ja: '日语',
      };
      return langMap[row.language] || row.language;
    },
  },
  {
    title: '币种',
    key: 'currency',
    width: 80,
  },
  {
    title: '收件人',
    key: 'receiverType',
    width: 100,
    render(row) {
      const receiverMap: Record<string, string> = {
        all: '全部用户',
        vip: 'VIP用户',
        new: '新用户',
        active: '活跃用户',
        custom: '自定义',
      };
      return receiverMap[row.receiverType] || row.receiverType;
    },
  },
  {
    title: '标题',
    key: 'title',
    width: 200,
    ellipsis: {
      tooltip: true,
    },
  },
  {
    title: '弹窗入口',
    key: 'popupEntrance',
    width: 100,
    render(row) {
      return h(
        NTag,
        {
          type: row.popupEntrance ? 'success' : 'default',
          size: 'small',
        },
        { default: () => (row.popupEntrance ? '是' : '否') },
      );
    },
  },
  {
    title: '视频推送',
    key: 'videoPush',
    width: 100,
    render(row) {
      return h(
        NTag,
        {
          type: row.videoPush ? 'success' : 'default',
          size: 'small',
        },
        { default: () => (row.videoPush ? '是' : '否') },
      );
    },
  },
  {
    title: '开始时间',
    key: 'startTime',
    width: 160,
    render(row) {
      return formatDate(row.startTime);
    },
  },
  {
    title: '结束时间',
    key: 'endTime',
    width: 160,
    render(row) {
      return formatDate(row.endTime);
    },
  },
  {
    title: '触发条件',
    key: 'triggerCondition',
    width: 120,
    render(row) {
      const triggerMap: Record<string, string> = {
        login_success: '登录成功',
        deposit_success: '充值成功',
        first_deposit: '首次充值',
        bet_success: '投注成功',
        scheduled: '定时发送',
        manual: '手动触发',
      };
      return triggerMap[row.triggerCondition] || row.triggerCondition;
    },
  },
  {
    title: '状态',
    key: 'status',
    width: 100,
    render(row) {
      const statusMap: Record<
        string,
        { label: string; type: 'success' | 'error' | 'warning' }
      > = {
        enabled: { label: '已启用', type: 'success' },
        disabled: { label: '已停用', type: 'error' },
        draft: { label: '草稿', type: 'warning' },
      };
      const status = statusMap[row.status] || {
        label: row.status,
        type: 'error',
      };
      return h(
        NTag,
        {
          type: status.type,
          size: 'small',
        },
        { default: () => status.label },
      );
    },
  },
  {
    title: '已读/发送',
    key: 'readOrSent',
    width: 100,
    render(row) {
      return h(
        NTag,
        {
          type: row.readOrSent ? 'success' : 'default',
          size: 'small',
        },
        { default: () => (row.readOrSent ? '是' : '否') },
      );
    },
  },
  {
    title: '操作',
    key: 'actions',
    width: 200,
    render(row) {
      return h('div', { class: 'flex gap-2' }, [
        h(
          NButton,
          {
            size: 'small',
            type: 'primary',
            onClick: () => handleViewDetail(row),
          },
          { default: () => '详情' },
        ),
        h(
          NButton,
          {
            size: 'small',
            onClick: () => handleEdit(row),
          },
          { default: () => '编辑' },
        ),
        h(
          NButton,
          {
            size: 'small',
            onClick: () => handleCopy(row),
          },
          { default: () => '复制' },
        ),
        h(
          NPopconfirm,
          {
            onPositiveClick: () => handleDelete(row),
          },
          {
            default: () => '确定删除这条通知吗？',
            trigger: () =>
              h(
                NButton,
                {
                  size: 'small',
                  type: 'error',
                },
                { default: () => '删除' },
              ),
          },
        ),
      ]);
    },
  },
];

// Methods
const loadData = async () => {
  loading.value = true;
  try {
    const params: APIOperationMessageFilters = {
      page: paginationReactive.page,
      pageSize: paginationReactive.pageSize,
      language: filters.language || undefined,
      currency: filters.currency || undefined,
      receiverType: filters.receiverType || undefined,
      title: filters.title || undefined,
      status: filters.status || undefined,
      triggerCondition: filters.triggerCondition || undefined,
      popupEntrance: filters.popupEntrance,
      videoPush: filters.videoPush,
    };

    const response = await getOperationMessages(params);

    // Handle the response from the interceptor
    if (response && typeof response === 'object') {
      if (response.data && Array.isArray(response.data)) {
        // Expected format: {data: [...], pagination: {...}}
        tableData.value = response.data;
        if (response.pagination) {
          paginationReactive.total = response.pagination.total;
          paginationReactive.page = response.pagination.page;
          paginationReactive.pageSize = response.pagination.pageSize;
        }
      } else if (Array.isArray(response)) {
        // Fallback: direct array response
        tableData.value = response;
        totalCount.value = response.length;
      } else {
        throw new Error('无效的响应格式：data 字段不是数组');
      }
    } else {
      throw new Error('无效的响应格式');
    }
  } catch (error) {
    console.error('Error loading operation messages:', error);
    notification.error({
      content: '加载通知数据失败',
      duration: 3000,
    });
  } finally {
    loading.value = false;
  }
};

const handleFilter = () => {
  paginationReactive.page = 1;
  loadData();
};

const resetFilter = () => {
  Object.assign(filters, {
    language: undefined,
    currency: undefined,
    receiverType: undefined,
    title: '',
    status: undefined,
    triggerCondition: undefined,
    popupEntrance: undefined,
    videoPush: undefined,
  });
  paginationReactive.page = 1;
  loadData();
};

const handleRefresh = () => {
  loadData();
};

const handleCreate = () => {
  editingItem.value = null;
  showModal.value = true;
};

const handleEdit = (row: OperationMessage) => {
  editingItem.value = row;
  showModal.value = true;
};

const handleCopy = (row: OperationMessage) => {
  // Create a copy without the ID
  const copyData = { ...row };
  delete (copyData as any).id;
  copyData.title = `${copyData.title} (复制)`;
  editingItem.value = copyData as OperationMessage;
  showModal.value = true;
};

const handleViewDetail = (row: OperationMessage) => {
  detailData.value = row;
  showDetailModal.value = true;
};

const handleDelete = async (row: OperationMessage) => {
  try {
    await deleteOperationMessage(row.id);

    notification.success({
      content: '删除成功',
      duration: 3000,
    });
    loadData();
  } catch (error) {
    console.error('Error deleting operation message:', error);
    notification.error({
      content: '删除失败',
      duration: 3000,
    });
  }
};

const handleSelectionChange = (keys: DataTableRowKey[]) => {
  selectedRowKeys.value = keys;
};

const handleBatchSend = async (selectedRows?: OperationMessage[]) => {
  const messagesToSend =
    selectedRows ||
    tableData.value.filter((message) =>
      selectedRowKeys.value.includes(message.id),
    );

  if (messagesToSend.length === 0) {
    console.log('No messages selected for batch send');
    return;
  }

  try {
    const ids = messagesToSend.map((message) => Number(message.id));
    await batchSendOperationMessages({ ids });

    notification.success({
      content: `成功发送 ${messagesToSend.length} 条通知`,
      duration: 3000,
    });
    selectedRowKeys.value = [];
    loadData();
  } catch (error) {
    console.error('Error sending operation messages:', error);
    notification.error({
      content: '批量发送失败',
      duration: 3000,
    });
  }
};

const handleBatchDelete = async (selectedRows?: OperationMessage[]) => {
  const messagesToDelete =
    selectedRows ||
    tableData.value.filter((message) =>
      selectedRowKeys.value.includes(message.id),
    );

  if (messagesToDelete.length === 0) {
    console.log('No messages selected for batch delete');
    return;
  }

  try {
    const ids = messagesToDelete.map((message) => Number(message.id));
    await batchDeleteOperationMessages({ ids });

    notification.success({
      content: `成功删除 ${messagesToDelete.length} 条通知`,
      duration: 3000,
    });
    selectedRowKeys.value = [];
    loadData();
  } catch (error) {
    console.error('Error deleting operation messages:', error);
    notification.error({
      content: '批量删除失败',
      duration: 3000,
    });
  }
};

const handleModalSuccess = () => {
  showModal.value = false;
  loadData();
};

const handlePageChange = (page: number) => {
  paginationReactive.page = page;
  loadData();
};

const handlePageSizeChange = (pageSize: number) => {
  paginationReactive.pageSize = pageSize;
  paginationReactive.page = 1;
  loadData();
};

// SmartDataGrid event handlers
const handleRowClick = (message: OperationMessage) => {
  console.log('Message row clicked:', message);
  // Optional: Auto-open detail modal on row click
  // handleView(message); // Commented out as handleView is not defined
};

const clearSelection = () => {
  selectedRowKeys.value = [];
  console.log('Selection cleared');
};

const selectAll = () => {
  selectedRowKeys.value = tableData.value.map((message) => message.id);
  console.log('All selected');
};

const formatDate = (date: string | Date | null) => {
  if (!date) return '-';
  return new Date(date).toLocaleString('zh-CN');
};

// Tab handling
const handleTabChange = (value: string) => {
  console.log('🔄 Tab changed to:', value);

  // Prevent rapid tab changes that could cause unmounting issues
  if (activeTab.value === value) {
    return;
  }

  try {
    // Update local state first
    activeTab.value = value;

    // Then update router
    router
      .push({
        path: route.path,
        query: {
          ...route.query,
          activeName: value,
        },
      })
      .catch((error) => {
        console.error('Router navigation error:', error);
        // Router failed, but local state is already updated
      });
  } catch (error) {
    console.error('Tab change error:', error);
    // Ensure local state is updated even if router fails
    activeTab.value = value;
  }
};

// Initialize tab from URL
const initializeTab = () => {
  const activeName = route.query.activeName as string;
  if (
    activeName &&
    [
      'operation_message_tz',
      'operation_message_pmd',
      'operation_message_gg',
      'lobby_banner',
      'lobby_pop',
    ].includes(activeName)
  ) {
    activeTab.value = activeName;
  }
};

// Watch for route changes
watch(
  () => route.query.activeName,
  (newActiveName) => {
    try {
      if (
        newActiveName &&
        [
          'operation_message_tz',
          'operation_message_pmd',
          'operation_message_gg',
          'lobby_banner',
          'lobby_pop',
        ].includes(newActiveName as string)
      ) {
        activeTab.value = newActiveName as string;
      }
    } catch (error) {
      console.error('Route watch error:', error);
      // Set default tab if route parsing fails
      activeTab.value = 'operation_message_tz';
    }
  },
  { immediate: true },
);

// Initialize
onMounted(() => {
  try {
    initializeTab();
    loadData();
  } catch (error) {
    console.error('Component initialization error:', error);
    // Set a default tab if initialization fails
    activeTab.value = 'operation_message_tz';
  }
});

// Add error boundary for component unmounting
const handleComponentError = (error: Error, instance: any, info: string) => {
  console.error('Component error:', error, info);
  // Prevent the error from crashing the entire app
  return false;
};
</script>

<style scoped>
.flex {
  display: flex;
}

.flex-wrap {
  flex-wrap: wrap;
}

.flex-col {
  flex-direction: column;
}

.gap-2 {
  gap: 0.5rem;
}

.gap-4 {
  gap: 1rem;
}

.items-end {
  align-items: flex-end;
}

.items-center {
  align-items: center;
}

.justify-between {
  justify-content: space-between;
}

.justify-end {
  justify-content: flex-end;
}

.text-sm {
  font-size: 0.875rem;
}

.font-medium {
  font-weight: 500;
}

.text-gray-400 {
  color: #9ca3af;
}

.text-gray-600 {
  color: #4b5563;
}

.loading-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #666;
  font-size: 14px;
}

.grid {
  display: grid;
}

.grid-cols-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.grid-cols-3 {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.detail-content {
  padding: 16px 0;
}

.bg-gray-50 {
  background-color: #f9fafb;
}

.rounded {
  border-radius: 0.375rem;
}

.text-center {
  text-align: center;
}

.mt-1 {
  margin-top: 0.25rem;
}

.mt-2 {
  margin-top: 0.5rem;
}

.p-2 {
  padding: 0.5rem;
}

.p-3 {
  padding: 0.75rem;
}

.text-base {
  font-size: 1rem;
}

.mb-4 {
  margin-bottom: 1rem;
}

.mb-6 {
  margin-bottom: 1.5rem;
}
</style>
