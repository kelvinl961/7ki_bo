<template>
  <div class="lobby-banner-management">
    <!-- 筛选器区域 -->
    <n-card class="mb-4">
      <div class="flex flex-wrap items-end gap-4">
        <!-- Banner名称搜索 -->
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium">Banner名称</label>
          <n-input
            v-model:value="filters.bannerName"
            placeholder="输入Banner名称搜索"
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

        <!-- 跳转方式 -->
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium">跳转方式</label>
          <n-select
            v-model:value="filters.jumpMode"
            placeholder="选择跳转方式"
            clearable
            style="width: 140px"
            :options="jumpModeOptions"
            @update:value="handleFilter"
          />
        </div>

        <!-- 操作人 -->
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium">操作人</label>
          <n-input
            v-model:value="filters.updatedBy"
            placeholder="输入操作人"
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
            type="daterange"
            placeholder="选择时间范围"
            clearable
            style="width: 240px"
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

    <!-- 🚀 NEW: SmartDataGrid Component for Lobby Banners -->
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
                  新增Banner
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
                批量发布 ({{ selectedCount }})
              </n-button>
              <n-button
                v-if="selectedCount > 0"
                type="warning"
                size="small"
                @click="handleBatchToggleStatus('inactive', selectedRows)"
              >
                批量下架 ({{ selectedCount }})
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

          <!-- 统计信息 -->
          <div class="mt-3 flex gap-4 border-t border-gray-200 pt-3 text-sm">
            <span
              >总计: <strong>{{ stats.total }}</strong></span
            >
            <span
              >已发布:
              <strong class="text-green-600">{{ stats.active }}</strong></span
            >
            <span
              >已下架:
              <strong class="text-red-600">{{ stats.inactive }}</strong></span
            >
            <span
              >草稿:
              <strong class="text-orange-600">{{ stats.draft }}</strong></span
            >
          </div>
        </n-card>
      </template>
    </SmartDataGrid>

    <!-- 创建/编辑对话框 -->
    <LobbyBannerFormModal
      v-model:show="showModal"
      :editing-item="editingItem"
      @success="handleModalSuccess"
    />

    <!-- 详情查看对话框 -->
    <n-modal
      v-model:show="showDetailModal"
      title="Banner详情"
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
              {{ getLanguageText(detailData.language) }}
            </div>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-600">币种</label>
            <div class="mt-1 rounded bg-gray-50 p-2">
              {{ detailData.currency }}
            </div>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-600">跳转方式</label>
            <div class="mt-1 rounded bg-gray-50 p-2">
              {{ getJumpModeText(detailData.jumpMode) }}
            </div>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-600">状态</label>
            <div class="mt-1 rounded bg-gray-50 p-2">
              <n-tag :type="getStatusType(detailData.status)">
                {{ getStatusText(detailData.status) }}
              </n-tag>
            </div>
          </div>
        </div>

        <div class="mb-4">
          <label class="text-sm font-medium text-gray-600">Banner名称</label>
          <div class="mt-1 rounded bg-gray-50 p-3">
            {{ detailData.bannerName }}
          </div>
        </div>

        <div class="mb-4">
          <label class="text-sm font-medium text-gray-600">Banner图片</label>
          <div class="mt-1 rounded bg-gray-50 p-3">
            <n-image
              :src="getImageUrlByEnvironment(detailData.bannerImageUrl)"
              :alt="detailData.bannerName"
              width="300"
              height="150"
              object-fit="cover"
              preview-disabled
              @click="showImagePreview(detailData.bannerImageUrl)"
              class="cursor-pointer"
              :fallback-src="placeholderImageUrl"
              @error="handleImageError"
            />
          </div>
        </div>

        <div class="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium text-gray-600">停留时间</label>
            <div class="mt-1 rounded bg-gray-50 p-2">
              {{ detailData.displayDuration }}秒
            </div>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-600">跳转目标</label>
            <div class="mt-1 rounded bg-gray-50 p-2">
              {{ detailData.targetUrl || '无' }}
            </div>
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

        <div class="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium text-gray-600">操作人</label>
            <div class="mt-1 rounded bg-gray-50 p-2">
              {{ detailData.updatedBy || '系统' }}
            </div>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-600">操作时间</label>
            <div class="mt-1 rounded bg-gray-50 p-2">
              {{ formatDate(detailData.updatedAt) }}
            </div>
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
      v-model:show="showImageModal"
      title="图片预览"
      preset="dialog"
      style="width: 80vw; max-width: 800px"
    >
      <div class="text-center">
        <n-image
          :src="getImageUrlByEnvironment(previewImageUrl)"
          :alt="'Banner预览'"
          style="max-width: 100%; max-height: 60vh"
          object-fit="contain"
          :fallback-src="placeholderImageUrl"
          @error="handleImageError"
        />
      </div>

      <template #action>
        <div class="flex justify-end gap-2">
          <n-button @click="showImageModal = false">关闭</n-button>
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
import type {
  DataTableColumns,
  DataTableRowKey,
  DataTableSortState,
} from 'naive-ui';
import {
  NBreadcrumb,
  NBreadcrumbItem,
  NButton,
  NCard,
  NInput,
  NModal,
  NSelect,
  NTag,
  NPopconfirm,
  NImage,
  NDatePicker,
  useMessage,
  type SelectOption,
} from 'naive-ui';
import { notification } from '#/adapter/naive';
import { getImageUrlByEnvironment } from '../../../utils/imageUtils';
const LobbyBannerFormModal = defineAsyncComponent(
  () => import('./LobbyBannerFormModal.vue'),
);
import {
  getBannerList,
  deleteBanner,
  duplicateBanner,
  toggleBannerStatus,
  batchDeleteBanners,
  batchToggleStatus,
  getBannerStats,
  getStatusText,
  getStatusType,
  getJumpModeText,
  type LobbyBanner,
  type LobbyBannerFilters,
  type LobbyBannerStats,
} from '#/api/lobbyBanner';

// 响应式数据
const message = useMessage();
const tableRef = ref();
const loading = ref(false);
const showModal = ref(false);
const showDetailModal = ref(false);
const showImageModal = ref(false);
const editingItem = ref<LobbyBanner | null>(null);
const detailData = ref<LobbyBanner | null>(null);
const previewImageUrl = ref('');

// 表格数据
const tableData = ref<LobbyBanner[]>([]);
const totalCount = ref(0);
const currentPage = ref(1);
const currentPageSize = ref(10);
const selectedRowKeys = ref<DataTableRowKey[]>([]);
const timeRange = ref<[number, number] | null>(null);

// 统计数据
const stats = ref<LobbyBannerStats>({
  total: 0,
  active: 0,
  inactive: 0,
  draft: 0,
});

// 筛选器
const filters = reactive<LobbyBannerFilters>({
  bannerName: '',
  language: undefined,
  currency: undefined,
  status: undefined,
  jumpMode: undefined,
  updatedBy: '',
  startTime: undefined,
  endTime: undefined,
});

// 选项配置
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
  { label: '已发布', value: 'active' },
  { label: '已下架', value: 'inactive' },
  { label: '草稿', value: 'draft' },
];

const jumpModeOptions: SelectOption[] = [
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

// Pagination (simplified for SmartDataGrid)
const paginationReactive = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
});

// 表格列配置
const columns: DataTableColumns<LobbyBanner> = [
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
      return getLanguageText(row.language);
    },
  },
  {
    title: 'Banner名称',
    key: 'bannerName',
    width: 200,
    ellipsis: {
      tooltip: true,
    },
  },
  {
    title: '跳转目标',
    key: 'targetUrl',
    width: 150,
    ellipsis: {
      tooltip: true,
    },
    render(row) {
      return row.targetUrl || '无';
    },
  },
  {
    title: 'Banner图',
    key: 'bannerImageUrl',
    width: 120,
    render(row) {
      return h(NImage, {
        src: getImageUrlByEnvironment(row.bannerImageUrl),
        alt: row.bannerName,
        width: 60,
        height: 30,
        objectFit: 'cover',
        previewDisabled: true,
        onClick: () => showImagePreview(row.bannerImageUrl),
        class: 'cursor-pointer',
        fallbackSrc: placeholderImageUrl,
        onError: (event: Event) => handleImageError(event),
      });
    },
  },
  {
    title: '停留时间',
    key: 'displayDuration',
    width: 100,
    render(row) {
      return `${row.displayDuration}秒`;
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
    title: '跳转',
    key: 'jumpMode',
    width: 120,
    render(row) {
      return getJumpModeText(row.jumpMode);
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
    title: '操作人',
    key: 'updatedBy',
    width: 120,
    render(row) {
      return row.updatedBy || '系统';
    },
  },
  {
    title: '操作时间',
    key: 'updatedAt',
    width: 160,
    render(row) {
      return formatDate(row.updatedAt);
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
            default: () => '确定删除这个Banner吗？',
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

// 方法
const loadData = async () => {
  loading.value = true;
  try {
    const params: LobbyBannerFilters = {
      page: paginationReactive.page,
      pageSize: paginationReactive.pageSize,
      bannerName: filters.bannerName || undefined,
      language: filters.language || undefined,
      currency: filters.currency || undefined,
      status: filters.status || undefined,
      jumpMode: filters.jumpMode || undefined,
      updatedBy: filters.updatedBy || undefined,
      startTime: filters.startTime || undefined,
      endTime: filters.endTime || undefined,
    };

    const response = await getBannerList(params);

    // Handle the actual API response structure: { success: true, data: { list: [...], pagination: {...} } }
    if (response && response.success && response.data) {
      tableData.value = response.data.list || [];
      if (response.data.pagination) {
        paginationReactive.total = response.data.pagination.total;
        paginationReactive.page = response.data.pagination.current;
        paginationReactive.pageSize = response.data.pagination.pageSize;
      }
    } else {
      // Fallback: treat response as error or empty
      console.warn('Unexpected response format:', response);
      tableData.value = [];
      paginationReactive.total = 0;
    }
  } catch (error) {
    console.error('Error loading banners:', error);
    notification.error({
      content: '加载Banner数据失败',
      duration: 3000,
    });
  } finally {
    loading.value = false;
  }
};

const loadStats = async () => {
  try {
    const response = await getBannerStats();
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
    bannerName: '',
    language: undefined,
    currency: undefined,
    status: undefined,
    jumpMode: undefined,
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

const handleEdit = (row: LobbyBanner) => {
  editingItem.value = row;
  showModal.value = true;
};

const handleCopy = async (row: LobbyBanner) => {
  try {
    await duplicateBanner(row.id);
    notification.success({
      content: '复制创建成功',
      duration: 3000,
    });
    loadData();
    loadStats();
  } catch (error) {
    console.error('Error copying banner:', error);
    notification.error({
      content: '复制创建失败',
      duration: 3000,
    });
  }
};

const handleViewDetail = (row: LobbyBanner) => {
  detailData.value = row;
  showDetailModal.value = true;
};

const handleDelete = async (row: LobbyBanner) => {
  try {
    await deleteBanner(row.id);
    notification.success({
      content: '删除成功',
      duration: 3000,
    });
    loadData();
    loadStats();
  } catch (error) {
    console.error('Error deleting banner:', error);
    notification.error({
      content: '删除失败',
      duration: 3000,
    });
  }
};

const handleToggleStatus = async (row: LobbyBanner) => {
  try {
    const newStatus = row.status === 'active' ? 'inactive' : 'active';
    await toggleBannerStatus(row.id, newStatus);
    notification.success({
      content: `${newStatus === 'active' ? '发布' : '下架'}成功`,
      duration: 3000,
    });
    loadData();
    loadStats();
  } catch (error) {
    console.error('Error toggling banner status:', error);
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
  status: 'active' | 'inactive' | 'draft',
  selectedRows?: LobbyBanner[],
) => {
  const bannersToUpdate =
    selectedRows ||
    tableData.value.filter((banner) =>
      selectedRowKeys.value.includes(banner.id),
    );

  if (bannersToUpdate.length === 0) {
    console.log('No banners selected for batch status toggle');
    return;
  }

  try {
    const ids = bannersToUpdate.map((banner) => Number(banner.id));
    await batchToggleStatus({ ids, status });
    notification.success({
      content: `批量${getStatusText(status)}成功`,
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

const handleBatchDelete = async (selectedRows?: LobbyBanner[]) => {
  const bannersToDelete =
    selectedRows ||
    tableData.value.filter((banner) =>
      selectedRowKeys.value.includes(banner.id),
    );

  if (bannersToDelete.length === 0) {
    console.log('No banners selected for batch delete');
    return;
  }

  try {
    const ids = bannersToDelete.map((banner) => Number(banner.id));
    await batchDeleteBanners({ ids });
    notification.success({
      content: `成功删除 ${bannersToDelete.length} 个Banner`,
      duration: 3000,
    });
    selectedRowKeys.value = [];
    loadData();
    loadStats();
  } catch (error) {
    console.error('Error batch deleting banners:', error);
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
const handleRowClick = (banner: LobbyBanner) => {
  console.log('Banner row clicked:', banner);
  // Optional: Auto-open detail modal on row click
  handleViewDetail(banner);
};

const clearSelection = () => {
  selectedRowKeys.value = [];
  console.log('Selection cleared');
};

const selectAll = () => {
  selectedRowKeys.value = tableData.value.map((banner) => banner.id);
  console.log('All selected');
};

const handleSorterChange = (sorter: DataTableSortState) => {
  // Handle sorting logic here if needed
  console.log('Sorter changed:', sorter);
};

const showImagePreview = (imageUrl: string) => {
  previewImageUrl.value = imageUrl;
  showImageModal.value = true;
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

// 创建一个简单的占位符图片数据URL
const placeholderImageUrl =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5YWFhYSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkJhbm5lciBJbWFnZTwvdGV4dD48L3N2Zz4=';

const formatDate = (date: string | Date | null) => {
  if (!date) return '-';
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return '-';
    return dateObj.toLocaleString('zh-CN');
  } catch (error) {
    console.error('Error formatting date:', error, date);
    return '-';
  }
};

const getLanguageText = (language: string): string => {
  const langMap: Record<string, string> = {
    'zh-CN': '中文',
    en: '英文',
    pt: '葡语',
    es: '西班牙语',
    ja: '日语',
  };
  return langMap[language] || language;
};

// 初始化
onMounted(() => {
  loadData();
  loadStats();
});
</script>

<style scoped>
.lobby-banner-management {
  /* Component styles */
}

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

.text-gray-600 {
  color: #6b7280;
}

.text-green-600 {
  color: #059669;
}

.text-red-600 {
  color: #dc2626;
}

.text-orange-600 {
  color: #ea580c;
}

.bg-gray-50 {
  background-color: #f9fafb;
}

.rounded {
  border-radius: 0.25rem;
}

.p-2 {
  padding: 0.5rem;
}

.p-3 {
  padding: 0.75rem;
}

.mt-1 {
  margin-top: 0.25rem;
}

.mb-2 {
  margin-bottom: 0.5rem;
}

.mb-4 {
  margin-bottom: 1rem;
}

.grid {
  display: grid;
}

.grid-cols-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.cursor-pointer {
  cursor: pointer;
}

.text-center {
  text-align: center;
}
</style>
