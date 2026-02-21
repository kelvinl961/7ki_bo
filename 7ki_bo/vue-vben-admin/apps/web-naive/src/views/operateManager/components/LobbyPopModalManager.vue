<template>
  <div class="popup-modal-management">
    <!-- 统计卡片 -->
    <div class="mb-4 grid grid-cols-5 gap-4">
      <n-card>
        <n-statistic label="总数" :value="stats.total" />
      </n-card>
      <n-card>
        <n-statistic label="生效中" :value="stats.active" />
      </n-card>
      <n-card>
        <n-statistic label="已过期" :value="stats.expired" />
      </n-card>
      <n-card>
        <n-statistic label="草稿" :value="stats.draft" />
      </n-card>
      <n-card>
        <n-statistic label="已停用" :value="stats.inactive" />
      </n-card>
    </div>

    <!-- 筛选器区域 -->
    <n-card class="mb-4">
      <div class="flex flex-wrap items-end gap-4">
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

        <!-- 跳转类型 -->
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium">跳转类型</label>
          <n-select
            v-model:value="filters.jumpType"
            placeholder="选择跳转类型"
            clearable
            style="width: 140px"
            :options="jumpTypeOptions"
            @update:value="handleFilter"
          />
        </div>

        <!-- 展示入口 -->
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium">展示入口</label>
          <n-select
            v-model:value="filters.entryPoints"
            placeholder="选择展示入口"
            clearable
            style="width: 140px"
            :options="entryPointOptions"
            @update:value="handleFilter"
          />
        </div>

        <!-- 受众 -->
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium">受众</label>
          <n-input
            v-model:value="filters.targetAudience"
            placeholder="输入受众搜索"
            clearable
            style="width: 150px"
            @keyup.enter="handleFilter"
          />
        </div>

        <!-- 操作人 -->
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium">操作人</label>
          <n-input
            v-model:value="filters.updatedBy"
            placeholder="输入操作人搜索"
            clearable
            style="width: 120px"
            @keyup.enter="handleFilter"
          />
        </div>

        <!-- 时间范围 -->
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium">时间范围</label>
          <n-date-picker
            v-model:value="timeRange"
            type="datetimerange"
            placeholder="选择时间范围"
            style="width: 300px"
            @update:value="handleTimeRangeChange"
          />
        </div>

        <!-- 搜索按钮 -->
        <div class="flex gap-2">
          <n-button type="primary" @click="handleFilter"> 搜索 </n-button>
          <n-button @click="resetFilter"> 重置 </n-button>
        </div>
      </div>
    </n-card>

    <!-- 🚀 NEW: SmartDataGrid Component for Lobby Pop Modals -->
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
                  新增弹窗
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
                @click="handleBatchToggleStatus('active', selectedRows)"
              >
                批量启用 ({{ selectedCount }})
              </n-button>
              <n-button
                v-if="selectedCount > 0"
                type="warning"
                size="small"
                @click="handleBatchToggleStatus('inactive', selectedRows)"
              >
                批量停用 ({{ selectedCount }})
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
              <n-button size="small" @click="clearSelection">清空选择</n-button>
              <n-button size="small" @click="selectAll">全选</n-button>
            </div>
          </div>
        </n-card>
      </template>
    </SmartDataGrid>

    <!-- 创建/编辑对话框 -->
    <LobbyPopModalFormModal
      v-model:show="showModal"
      :editing-item="editingItem"
      @success="handleModalSuccess"
    />

    <!-- 详情查看对话框 -->
    <n-modal
      v-model:show="showDetailModal"
      title="弹窗详情"
      preset="dialog"
      style="width: 800px"
    >
      <div v-if="detailData" class="detail-content">
        <div class="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium text-gray-600">ID</label>
            <div class="mt-1 rounded bg-gray-50 p-2">{{ detailData.id }}</div>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-600">排序</label>
            <div class="mt-1 rounded bg-gray-50 p-2">
              {{ detailData.sortOrder }}
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
            <label class="text-sm font-medium text-gray-600">受众</label>
            <div class="mt-1 rounded bg-gray-50 p-2">
              {{ detailData.targetAudience }}
            </div>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-600">跳转类型</label>
            <div class="mt-1 rounded bg-gray-50 p-2">
              {{ getJumpTypeText(detailData.jumpType) }}
            </div>
          </div>
        </div>

        <div class="mb-4">
          <label class="text-sm font-medium text-gray-600">标题</label>
          <div class="mt-1 rounded bg-gray-50 p-3">{{ detailData.title }}</div>
        </div>

        <div class="mb-4">
          <label class="text-sm font-medium text-gray-600">弹窗图片</label>
          <div class="mt-1">
            <n-image
              :src="detailData.imageUrl"
              alt="弹窗图片"
              width="200"
              height="100"
              object-fit="cover"
              :fallback-src="placeholderImageUrl"
              @error="handleImageError"
            />
          </div>
        </div>

        <div class="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium text-gray-600">开始时间</label>
            <div class="mt-1 rounded bg-gray-50 p-2">
              {{ formatDate(detailData.startTime) }}
            </div>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-600">结束时间</label>
            <div class="mt-1 rounded bg-gray-50 p-2">
              {{ formatDate(detailData.endTime) }}
            </div>
          </div>
        </div>

        <div class="mb-4">
          <label class="text-sm font-medium text-gray-600">展示入口</label>
          <div class="mt-1 rounded bg-gray-50 p-2">
            <n-space>
              <n-tag
                v-for="point in detailData.entryPoints"
                :key="point"
                size="small"
              >
                {{ getEntryPointText(point) }}
              </n-tag>
            </n-space>
          </div>
        </div>

        <div class="mb-4 grid grid-cols-3 gap-4">
          <div>
            <label class="text-sm font-medium text-gray-600"
              >最大显示次数</label
            >
            <div class="mt-1 rounded bg-gray-50 p-2">
              {{ detailData.maxDisplayTimes }}次
            </div>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-600">显示间隔</label>
            <div class="mt-1 rounded bg-gray-50 p-2">
              {{ detailData.displayInterval }}小时
            </div>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-600">状态</label>
            <div class="mt-1 rounded bg-gray-50 p-2">
              <n-tag :type="getStatusType(detailData.status)" size="small">
                {{ getStatusText(detailData.status) }}
              </n-tag>
            </div>
          </div>
        </div>

        <div class="mb-4 grid grid-cols-3 gap-4">
          <div>
            <label class="text-sm font-medium text-gray-600">总浏览量</label>
            <div class="mt-1 rounded bg-gray-50 p-2">
              {{ detailData.totalViews }}
            </div>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-600">总点击量</label>
            <div class="mt-1 rounded bg-gray-50 p-2">
              {{ detailData.totalClicks }}
            </div>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-600">点击率</label>
            <div class="mt-1 rounded bg-gray-50 p-2">
              {{ (detailData.clickRate * 100).toFixed(2) }}%
            </div>
          </div>
        </div>

        <div v-if="detailData.targetUrl" class="mb-4">
          <label class="text-sm font-medium text-gray-600">跳转目标</label>
          <div class="mt-1 rounded bg-gray-50 p-3">
            {{ detailData.targetUrl }}
          </div>
        </div>

        <div v-if="detailData.remark" class="mb-4">
          <label class="text-sm font-medium text-gray-600">后台备注</label>
          <div class="mt-1 rounded bg-gray-50 p-3">{{ detailData.remark }}</div>
        </div>
      </div>

      <template #action>
        <div class="flex justify-end gap-2">
          <n-button @click="showDetailModal = false">关闭</n-button>
        </div>
      </template>
    </n-modal>

    <!-- 图片预览对话框 -->
    <n-modal
      v-model:show="showImagePreview"
      title="图片预览"
      preset="dialog"
      style="width: 80vw; max-width: 1000px"
    >
      <div class="text-center">
        <n-image
          :src="previewImageUrl"
          alt="弹窗图片预览"
          style="max-width: 100%; max-height: 70vh"
          :fallback-src="placeholderImageUrl"
          @error="handleImageError"
        />
      </div>

      <template #action>
        <div class="flex justify-end gap-2">
          <n-button @click="showImagePreview = false">关闭</n-button>
        </div>
      </template>
    </n-modal>
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
import type { DataTableColumns, DataTableRowKey } from 'naive-ui';
import {
  NButton,
  NCard,
  NInput,
  NModal,
  NSelect,
  NDatePicker,
  NTag,
  NPopconfirm,
  NImage,
  NSpace,
  NStatistic,
  type SelectOption,
} from 'naive-ui';
import { notification } from '#/adapter/naive';
const LobbyPopModalFormModal = defineAsyncComponent(
  () => import('./LobbyPopModalFormModal.vue'),
);
import {
  getPopModalList,
  deletePopModal,
  duplicatePopModal,
  togglePopModalStatus,
  batchDeletePopModals,
  batchToggleStatus,
  getPopModalStats,
  getStatusText,
  getStatusType,
  getJumpTypeText,
  getEntryPointText,
  type LobbyPopModal,
  type LobbyPopModalFilters,
  type LobbyPopModalStats,
} from '#/api/lobbyPopModal';

// Reactive data
const tableRef = ref();
const loading = ref(false);
const showModal = ref(false);
const showDetailModal = ref(false);
const showImagePreview = ref(false);
const editingItem = ref<LobbyPopModal | null>(null);
const detailData = ref<LobbyPopModal | null>(null);
const previewImageUrl = ref('');

// Table data
const tableData = ref<LobbyPopModal[]>([]);
const totalCount = ref(0);
const currentPage = ref(1);
const currentPageSize = ref(20);
const selectedRowKeys = ref<DataTableRowKey[]>([]);

// Statistics
const stats = ref<LobbyPopModalStats>({
  total: 0,
  active: 0,
  expired: 0,
  draft: 0,
  inactive: 0,
});

// Filters
const filters = reactive<LobbyPopModalFilters>({
  title: '',
  language: undefined,
  currency: undefined,
  status: undefined,
  jumpType: undefined,
  targetAudience: '',
  entryPoints: undefined,
  updatedBy: '',
  startTime: undefined,
  endTime: undefined,
});

const timeRange = ref<[number, number] | null>(null);

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

const statusOptions: SelectOption[] = [
  { label: '生效中', value: 'active' },
  { label: '已过期', value: 'expired' },
  { label: '草稿', value: 'draft' },
  { label: '已停用', value: 'inactive' },
];

const jumpTypeOptions: SelectOption[] = [
  { label: '无', value: 'none' },
  { label: '外部链接', value: 'external_link' },
  { label: '活动', value: 'activity' },
  { label: '任务', value: 'task' },
  { label: '充值', value: 'recharge' },
  { label: '返水', value: 'rebate' },
  { label: '代理', value: 'agent' },
  { label: 'VIP', value: 'vip' },
  { label: '利息宝', value: 'interest_treasure' },
  { label: '公积金', value: 'public_fund' },
  { label: '游戏', value: 'game' },
  { label: '盲盒抽奖', value: 'blind_box_lottery' },
  { label: '俱乐部申请（合作联营）', value: 'club_application' },
];

const entryPointOptions: SelectOption[] = [
  { label: '登录后弹窗', value: 'login' },
  { label: '首页加载', value: 'homepage' },
  { label: '充值页面', value: 'deposit' },
  { label: '游戏大厅', value: 'game_lobby' },
  { label: '活动页面', value: 'promotion' },
  { label: '手动触发', value: 'manual' },
];

// Pagination (simplified for SmartDataGrid)
const paginationReactive = reactive({
  page: 1,
  pageSize: 20,
  total: 0,
});

// Table columns
const columns: DataTableColumns<LobbyPopModal> = [
  {
    type: 'selection',
    width: 50,
  },
  {
    title: '排序',
    key: 'sortOrder',
    width: 80,
    sorter: true,
  },
  {
    title: 'ID',
    key: 'id',
    width: 80,
  },
  {
    title: '币种',
    key: 'currency',
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
    title: '标题',
    key: 'title',
    width: 200,
    ellipsis: {
      tooltip: true,
    },
  },
  {
    title: '弹窗图片预览',
    key: 'imageUrl',
    width: 120,
    render(row) {
      return h(NImage, {
        src: row.imageUrl,
        alt: row.title,
        width: 60,
        height: 30,
        objectFit: 'cover',
        previewDisabled: true,
        onClick: () => openImagePreview(row.imageUrl),
        class: 'cursor-pointer',
        fallbackSrc: placeholderImageUrl,
        onError: (event: Event) => handleImageError(event),
      });
    },
  },
  {
    title: '受众',
    key: 'targetAudience',
    width: 150,
    ellipsis: {
      tooltip: true,
    },
  },
  {
    title: '展示入口',
    key: 'entryPoints',
    width: 150,
    render(row) {
      return h(
        NSpace,
        { size: 'small' },
        {
          default: () =>
            row.entryPoints
              .slice(0, 2)
              .map((point) =>
                h(
                  NTag,
                  { size: 'small' },
                  { default: () => getEntryPointText(point) },
                ),
              )
              .concat(
                row.entryPoints.length > 2
                  ? [
                      h(
                        NTag,
                        { size: 'small' },
                        { default: () => `+${row.entryPoints.length - 2}` },
                      ),
                    ]
                  : [],
              ),
        },
      );
    },
  },
  {
    title: '跳转',
    key: 'jumpType',
    width: 120,
    render(row) {
      return getJumpTypeText(row.jumpType);
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
    title: '状态',
    key: 'status',
    width: 100,
    render(row) {
      return h(
        NTag,
        {
          type: getStatusType(row.status),
          size: 'small',
        },
        { default: () => getStatusText(row.status) },
      );
    },
  },
  {
    title: '操作',
    key: 'actions',
    width: 280,
    fixed: 'right',
    render(row) {
      return h('div', { class: 'flex gap-1' }, [
        h(
          NButton,
          {
            size: 'small',
            type: row.status === 'active' ? 'warning' : 'success',
            onClick: () => handleToggleStatus(row),
          },
          { default: () => (row.status === 'active' ? '停止' : '发布') },
        ),

        h(
          NButton,
          {
            size: 'small',
            onClick: () => handleCopy(row),
          },
          { default: () => '复制创建' },
        ),

        h(
          NButton,
          {
            size: 'small',
            onClick: () => handleViewDetail(row),
          },
          { default: () => '详情' },
        ),

        h(
          NButton,
          {
            size: 'small',
            type: 'primary',
            onClick: () => handleEdit(row),
          },
          { default: () => '编辑' },
        ),

        h(
          NPopconfirm,
          {
            onPositiveClick: () => handleDelete(row),
          },
          {
            default: () => '确定删除这个弹窗吗？',
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
    const params: LobbyPopModalFilters = {
      page: paginationReactive.page,
      pageSize: paginationReactive.pageSize,
      title: filters.title || undefined,
      language: filters.language || undefined,
      currency: filters.currency || undefined,
      status: filters.status || undefined,
      jumpType: filters.jumpType || undefined,
      targetAudience: filters.targetAudience || undefined,
      entryPoints: filters.entryPoints || undefined,
      updatedBy: filters.updatedBy || undefined,
      startTime: filters.startTime || undefined,
      endTime: filters.endTime || undefined,
    };

    const response = await getPopModalList(params);
    tableData.value = response.list;
    paginationReactive.total = response.pagination.total;
    currentPage.value = response.pagination.current;
    currentPageSize.value = response.pagination.pageSize;
  } catch (error) {
    console.error('Error loading popup modals:', error);
    notification.error({
      content: '加载弹窗数据失败',
      duration: 3000,
    });
  } finally {
    loading.value = false;
  }
};

const loadStats = async () => {
  try {
    const response = await getPopModalStats();
    stats.value = response;
  } catch (error) {
    console.error('Error loading stats:', error);
  }
};

const handleFilter = () => {
  paginationReactive.page = 1;
  loadData();
};

const resetFilter = () => {
  Object.assign(filters, {
    title: '',
    language: undefined,
    currency: undefined,
    status: undefined,
    jumpType: undefined,
    targetAudience: '',
    entryPoints: undefined,
    updatedBy: '',
    startTime: undefined,
    endTime: undefined,
  });
  timeRange.value = null;
  paginationReactive.page = 1;
  loadData();
};

const handleTimeRangeChange = (value: [number, number] | null) => {
  if (value) {
    filters.startTime = new Date(value[0]).toISOString();
    const endTime = new Date(value[1]);
    endTime.setHours(23, 59, 59, 999);
    filters.endTime = endTime.toISOString();
  } else {
    filters.startTime = undefined;
    filters.endTime = undefined;
  }
};

const handleRefresh = () => {
  loadData();
  loadStats();
};

const handleCreate = () => {
  editingItem.value = null;
  showModal.value = true;
};

const handleEdit = (row: LobbyPopModal) => {
  editingItem.value = row;
  showModal.value = true;
};

const handleCopy = async (row: LobbyPopModal) => {
  try {
    await duplicatePopModal(row.id);
    notification.success({
      content: '复制成功',
      duration: 3000,
    });
    loadData();
    loadStats();
  } catch (error) {
    console.error('Error copying popup modal:', error);
    notification.error({
      content: '复制失败',
      duration: 3000,
    });
  }
};

const handleViewDetail = (row: LobbyPopModal) => {
  detailData.value = row;
  showDetailModal.value = true;
};

const handleDelete = async (row: LobbyPopModal) => {
  try {
    await deletePopModal(row.id);

    notification.success({
      content: '删除成功',
      duration: 3000,
    });
    loadData();
    loadStats();
  } catch (error) {
    console.error('Error deleting popup modal:', error);
    notification.error({
      content: '删除失败',
      duration: 3000,
    });
  }
};

const handleToggleStatus = async (row: LobbyPopModal) => {
  try {
    const newStatus = row.status === 'active' ? 'inactive' : 'active';
    await togglePopModalStatus(row.id, newStatus);

    notification.success({
      content: `${newStatus === 'active' ? '启用' : '停用'}成功`,
      duration: 3000,
    });
    loadData();
    loadStats();
  } catch (error) {
    console.error('Error toggling popup modal status:', error);
    notification.error({
      content: '状态切换失败',
      duration: 3000,
    });
  }
};

const handleSelectionChange = (keys: DataTableRowKey[]) => {
  selectedRowKeys.value = keys;
};

const handleBatchToggleStatus = async (
  status: 'active' | 'inactive',
  selectedRows?: LobbyPopModal[],
) => {
  const modalsToUpdate =
    selectedRows ||
    tableData.value.filter((modal) => selectedRowKeys.value.includes(modal.id));

  if (modalsToUpdate.length === 0) {
    console.log('No modals selected for batch status toggle');
    return;
  }

  try {
    const ids = modalsToUpdate.map((modal) => Number(modal.id));
    await batchToggleStatus({ ids, status });

    notification.success({
      content: `批量${status === 'active' ? '启用' : '停用'}成功`,
      duration: 3000,
    });
    selectedRowKeys.value = [];
    loadData();
    loadStats();
  } catch (error) {
    console.error('Error batch toggling status:', error);
    notification.error({
      content: '批量操作失败',
      duration: 3000,
    });
  }
};

const handleBatchDelete = async (selectedRows?: LobbyPopModal[]) => {
  const modalsToDelete =
    selectedRows ||
    tableData.value.filter((modal) => selectedRowKeys.value.includes(modal.id));

  if (modalsToDelete.length === 0) {
    console.log('No modals selected for batch delete');
    return;
  }

  try {
    const ids = modalsToDelete.map((modal) => Number(modal.id));
    await batchDeletePopModals({ ids });

    notification.success({
      content: `成功删除 ${modalsToDelete.length} 个弹窗`,
      duration: 3000,
    });
    selectedRowKeys.value = [];
    loadData();
    loadStats();
  } catch (error) {
    console.error('Error batch deleting popup modals:', error);
    notification.error({
      content: '批量删除失败',
      duration: 3000,
    });
  }
};

const handleModalSuccess = () => {
  showModal.value = false;
  loadData();
  loadStats();
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
const handleRowClick = (popModal: LobbyPopModal) => {
  console.log('Pop modal row clicked:', popModal);
  // Optional: Auto-open detail modal on row click
  handleView(popModal);
};

const clearSelection = () => {
  selectedRowKeys.value = [];
  console.log('Selection cleared');
};

const selectAll = () => {
  selectedRowKeys.value = tableData.value.map((modal) => modal.id);
  console.log('All selected');
};

const openImagePreview = (imageUrl: string) => {
  previewImageUrl.value = imageUrl;
  showImagePreview.value = true;
};

const handleImageError = (event: Event) => {
  console.error('Image loading error:', event);
  // Set the image source to the placeholder when there's an error
  const target = event.target as HTMLImageElement;
  if (target) {
    // Prevent infinite loop by checking if we're already using the placeholder
    if (target.src !== placeholderImageUrl) {
      target.src = placeholderImageUrl;
    }
  }
};

const formatDate = (date: string | Date | null) => {
  if (!date) return '-';
  try {
    return new Date(date).toLocaleString('zh-CN');
  } catch (error) {
    console.error('Date formatting error:', error);
    return '-';
  }
};

// 创建一个简单的占位符图片数据URL
const placeholderImageUrl =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5YWFhYSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuW8ueepuuWbvueJhzwvdGV4dD48L3N2Zz4=';

// Initialize
onMounted(() => {
  loadData();
  loadStats();
});
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

.gap-1 {
  gap: 0.25rem;
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

.text-gray-600 {
  color: #4b5563;
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

.grid-cols-5 {
  grid-template-columns: repeat(5, minmax(0, 1fr));
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

.p-2 {
  padding: 0.5rem;
}

.p-3 {
  padding: 0.75rem;
}

.mb-4 {
  margin-bottom: 1rem;
}

.cursor-pointer {
  cursor: pointer;
}
</style>
