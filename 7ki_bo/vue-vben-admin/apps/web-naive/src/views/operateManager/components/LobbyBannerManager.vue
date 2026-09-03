<template>
  <div class="lobby-banner-management">
    <!-- 筛选器区域 -->
    <n-card class="mb-4">
      <div class="flex flex-wrap items-end gap-4">
        <!-- Banner名称搜索 -->
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium">{{ $t('operations.messageSettings.bannerName') }}</label>
          <n-input
            v-model:value="filters.bannerName"
            :placeholder="$t('operations.messageSettings.bannerNameSearch')"
            clearable
            style="width: 200px"
            @keyup.enter="handleFilter"
          />
        </div>

        <!-- 语言选择 -->
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium">{{ $t('operations.messageSettings.language') }}</label>
          <n-select
            v-model:value="filters.language"
            :placeholder="$t('operations.messageSettings.selectLanguage')"
            clearable
            style="width: 120px"
            :options="languageOptions"
            @update:value="handleFilter"
          />
        </div>

        <!-- 币种选择 -->
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium">{{ $t('common.currency') }}</label>
          <n-select
            v-model:value="filters.currency"
            :placeholder="$t('operations.messageSettings.selectCurrency')"
            clearable
            style="width: 120px"
            :options="currencyOptions"
            @update:value="handleFilter"
          />
        </div>

        <!-- 状态筛选 -->
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium">{{ $t('common.status') }}</label>
          <n-select
            v-model:value="filters.status"
            :placeholder="$t('operations.messageSettings.selectStatus')"
            clearable
            style="width: 120px"
            :options="statusOptions"
            @update:value="handleFilter"
          />
        </div>

        <!-- 跳转方式 -->
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium">{{ $t('operations.messageSettings.jumpMode') }}</label>
          <n-select
            v-model:value="filters.jumpMode"
            :placeholder="$t('operations.messageSettings.selectJumpMode')"
            clearable
            style="width: 140px"
            :options="jumpModeOptions"
            @update:value="handleFilter"
          />
        </div>

        <!-- 操作人 -->
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium">{{ $t('common.operator') }}</label>
          <n-input
            v-model:value="filters.updatedBy"
            :placeholder="$t('operations.messageSettings.operatorPlaceholder')"
            clearable
            style="width: 120px"
            @keyup.enter="handleFilter"
          />
        </div>

        <!-- 时间范围 -->
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium">{{ $t('operations.messageSettings.timeRange') }}</label>
          <n-date-picker
            v-model:value="timeRange"
            :time-zone="timezone"
            type="daterange"
            :placeholder="$t('common.selectDateRange')"
            clearable
            style="width: 240px"
            @update:value="handleTimeRangeChange"
          />
        </div>

        <!-- 搜索按钮 -->
        <div class="flex gap-2">
          <n-button type="primary" @click="handleFilter"> {{ $t('common.search') }} </n-button>
          <n-button @click="resetFilter"> {{ $t('common.reset') }} </n-button>
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
                  {{ $t('operations.messageSettings.addBanner') }}
                </n-button>
              </div>

              <!-- 选择信息 -->
              <div class="text-sm text-gray-600">
                {{ $t('operations.messageSettings.selectedData', [selectedCount, '']) }}
                {{ $t('operations.domain.modal.recordsCount', [paginationReactive.total]) }}
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
                {{ $t('operations.messageSettings.publish') }} ({{ selectedCount }})
              </n-button>
              <n-button
                v-if="selectedCount > 0"
                type="warning"
                size="small"
                @click="handleBatchToggleStatus('inactive', selectedRows)"
              >
                {{ $t('operations.messageSettings.stop') }} ({{ selectedCount }})
              </n-button>
              <n-button
                v-if="selectedCount > 0"
                type="error"
                size="small"
                @click="handleBatchDelete(selectedRows)"
              >
                {{ $t('operations.messageSettings.batchDelete', [selectedCount]) }}
              </n-button>

              <!-- 选择控制 -->
              <n-button size="small" @click="clearSelection">{{ $t('operations.messageSettings.clearSelection') }}</n-button>
              <n-button size="small" @click="selectAll">{{ $t('common.selectAll') }}</n-button>
            </div>
          </div>

          <!-- 统计信息 -->
          <div class="mt-3 flex gap-4 border-t border-gray-200 pt-3 text-sm">
            <span
              >{{ $t('operations.messageSettings.total') }}: <strong>{{ stats.total }}</strong></span
            >
            <span
              >{{ $t('operations.messageSettings.published') }}:
              <strong class="text-green-600">{{ stats.active }}</strong></span
            >
            <span
              >{{ $t('operations.messageSettings.unpublished') }}:
              <strong class="text-red-600">{{ stats.inactive }}</strong></span
            >
            <span
              >{{ $t('operations.messageSettings.draft') }}:
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
      :title="$t('operations.messageSettings.bannerDetail')"
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
            <label class="text-sm font-medium text-gray-600">{{ $t('operations.messageSettings.sort') }}</label>
            <div class="mt-1 rounded bg-gray-50 p-2">
              {{ detailData.sortOrder }}
            </div>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-600">{{ $t('operations.messageSettings.language') }}</label>
            <div class="mt-1 rounded bg-gray-50 p-2">
              {{ getLanguageText(detailData.language) }}
            </div>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-600">{{ $t('common.currency') }}</label>
            <div class="mt-1 rounded bg-gray-50 p-2">
              {{ detailData.currency }}
            </div>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-600">{{ $t('operations.messageSettings.jumpMode') }}</label>
            <div class="mt-1 rounded bg-gray-50 p-2">
              {{ getJumpModeText(detailData.jumpMode) }}
            </div>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-600">{{ $t('common.status') }}</label>
            <div class="mt-1 rounded bg-gray-50 p-2">
              <n-tag :type="getStatusType(detailData.status)">
                {{ getStatusText(detailData.status) }}
              </n-tag>
            </div>
          </div>
        </div>

        <div class="mb-4">
          <label class="text-sm font-medium text-gray-600">{{ $t('operations.messageSettings.bannerName') }}</label>
          <div class="mt-1 rounded bg-gray-50 p-3">
            {{ detailData.bannerName }}
          </div>
        </div>

        <div class="mb-4">
          <label class="text-sm font-medium text-gray-600">{{ $t('operations.messageSettings.bannerImage') }}</label>
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
            <label class="text-sm font-medium text-gray-600">{{ $t('operations.messageSettings.displayDuration') }}</label>
            <div class="mt-1 rounded bg-gray-50 p-2">
              {{ detailData.displayDuration }}{{ $t('operations.messageSettings.secondsUnit') }}
            </div>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-600">{{ $t('operations.messageSettings.jumpTarget') }}</label>
            <div class="mt-1 rounded bg-gray-50 p-2">
              {{ detailData.targetUrl || $t('operations.messageSettings.none') }}
            </div>
          </div>
        </div>

        <div class="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium text-gray-600">{{ $t('operations.messageSettings.startTime') }}</label>
            <div class="mt-1 rounded bg-gray-50 p-2">
              <TzDateTime :value="detailData.startTime" />
            </div>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-600">{{ $t('operations.messageSettings.endTime') }}</label>
            <div class="mt-1 rounded bg-gray-50 p-2">
              <TzDateTime :value="detailData.endTime" />
            </div>
          </div>
        </div>

        <div class="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium text-gray-600">{{ $t('common.operator') }}</label>
            <div class="mt-1 rounded bg-gray-50 p-2">
              {{ detailData.updatedBy || $t('operations.messageSettings.system') }}
            </div>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-600">{{ $t('common.operationTime') }}</label>
            <div class="mt-1 rounded bg-gray-50 p-2">
              <TzDateTime :value="detailData.updatedAt" />
            </div>
          </div>
        </div>

        <div v-if="detailData.remark" class="mb-4">
          <label class="text-sm font-medium text-gray-600">{{ $t('operations.messageSettings.backendRemark') }}</label>
          <div class="mt-1 rounded bg-gray-50 p-3">{{ detailData.remark }}</div>
        </div>
      </div>

      <template #action>
        <div class="flex justify-end gap-2">
          <n-button @click="showDetailModal = false">{{ $t('common.close') }}</n-button>
        </div>
      </template>
    </n-modal>

    <!-- 图片预览对话框 -->
    <n-modal
      v-model:show="showImageModal"
      :title="$t('operations.messageSettings.imagePreview')"
      preset="dialog"
      style="width: 80vw; max-width: 800px"
    >
      <div class="text-center">
        <n-image
          :src="getImageUrlByEnvironment(previewImageUrl)"
          :alt="$t('operations.form.bannerPreview')"
          style="max-width: 100%; max-height: 60vh"
          object-fit="contain"
          :fallback-src="placeholderImageUrl"
          @error="handleImageError"
        />
      </div>

      <template #action>
        <div class="flex justify-end gap-2">
          <n-button @click="showImageModal = false">{{ $t('common.close') }}</n-button>
        </div>
      </template>
    </n-modal>
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
import { renderTzDateTime } from '#/components/common/tzDateTimeRender';
import TzDateTime from '#/components/common/TzDateTime.vue';
import { useDisplayTimezone } from '#/composables/useDisplayTimezone';
import { getImageUrlByEnvironment } from '../../../utils/imageUtils';

const { timezone } = useDisplayTimezone();
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
  { label: $t('operations.messageSettings.option.langZh'), value: 'zh-CN' },
  { label: $t('operations.messageSettings.option.langEn'), value: 'en' },
  { label: $t('operations.messageSettings.option.langPt'), value: 'pt' },
  { label: $t('operations.messageSettings.option.langEs'), value: 'es' },
  { label: $t('operations.messageSettings.option.langJa'), value: 'ja' },
];

const currencyOptions: SelectOption[] = [
  { label: 'BRL', value: 'BRL' },
  { label: 'CNY', value: 'CNY' },
  { label: 'USD', value: 'USD' },
  { label: 'EUR', value: 'EUR' },
  { label: 'JPY', value: 'JPY' },
];

const statusOptions: SelectOption[] = [
  { label: $t('operations.messageSettings.option.statusPublished'), value: 'active' },
  { label: $t('operations.messageSettings.option.statusUnpublished'), value: 'inactive' },
  { label: $t('operations.messageSettings.option.statusDraft'), value: 'draft' },
];

const jumpModeOptions: SelectOption[] = [
  { label: $t('operations.messageSettings.option.jumpNone'), value: 'none' },
  { label: $t('operations.messageSettings.option.jumpExternal'), value: 'external_link' },
  { label: $t('operations.messageSettings.option.jumpActivity'), value: 'activity' },
  { label: $t('operations.messageSettings.option.jumpTask'), value: 'task' },
  { label: $t('operations.layout.deposit'), value: 'recharge' },
  { label: $t('operations.messageSettings.option.jumpRebate'), value: 'rebate' },
  { label: $t('operations.layout.agent'), value: 'agent' },
  { label: 'VIP', value: 'vip' },
  { label: $t('operations.messageSettings.option.jumpInterest'), value: 'interest_treasure' },
  { label: $t('operations.messageSettings.option.jumpPublicFund'), value: 'public_fund' },
  { label: $t('operations.messageSettings.option.jumpGame'), value: 'game' },
  { label: $t('operations.messageSettings.option.jumpBlindBox'), value: 'blind_box_lottery' },
  { label: $t('operations.messageSettings.option.jumpClub'), value: 'club_application' },
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
    title: $t('operations.messageSettings.sort'),
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
    title: $t('common.currency'),
    key: 'currency',
    width: 80,
  },
  {
    title: $t('operations.messageSettings.language'),
    key: 'language',
    width: 100,
    render(row) {
      return getLanguageText(row.language);
    },
  },
  {
    title: $t('operations.messageSettings.bannerName'),
    key: 'bannerName',
    width: 200,
    ellipsis: {
      tooltip: true,
    },
  },
  {
    title: $t('operations.messageSettings.jumpTarget'),
    key: 'targetUrl',
    width: 150,
    ellipsis: {
      tooltip: true,
    },
    render(row) {
      return row.targetUrl || $t('operations.messageSettings.none');
    },
  },
  {
    title: $t('operations.messageSettings.bannerImage'),
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
    title: $t('operations.messageSettings.displayDuration'),
    key: 'displayDuration',
    width: 100,
    render(row) {
      return `$t('operations.messageSettings.seconds', [row.displayDuration])`;
    },
  },
  {
    title: $t('operations.messageSettings.startTime'),
    key: 'startTime',
    width: 160,
    render(row) {
      return renderTzDateTime(row.startTime);
    },
  },
  {
    title: $t('operations.messageSettings.endTime'),
    key: 'endTime',
    width: 160,
    render(row) {
      return renderTzDateTime(row.endTime);
    },
  },
  {
    title: $t('operations.messageSettings.jumpMode'),
    key: 'jumpMode',
    width: 120,
    render(row) {
      return getJumpModeText(row.jumpMode);
    },
  },
  {
    title: $t('common.status'),
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
    title: $t('common.operator'),
    key: 'updatedBy',
    width: 120,
    render(row) {
      return row.updatedBy || $t('operations.messageSettings.system');
    },
  },
  {
    title: $t('common.operationTime'),
    key: 'updatedAt',
    width: 160,
    render(row) {
      return renderTzDateTime(row.updatedAt);
    },
  },
  {
    title: $t('common.actions'),
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
          { default: () => (row.status === 'active' ? $t('operations.messageSettings.stop') : $t('operations.messageSettings.publish')) },
        ),

        h(
          NButton,
          {
            size: 'small',
            onClick: () => handleCopy(row),
          },
          { default: () => $t('operations.messageSettings.copyCreate') },
        ),

        h(
          NButton,
          {
            size: 'small',
            onClick: () => handleViewDetail(row),
          },
          { default: () => $t('common.detail') },
        ),

        h(
          NButton,
          {
            size: 'small',
            type: 'primary',
            onClick: () => handleEdit(row),
          },
          { default: () => $t('common.edit') },
        ),

        h(
          NPopconfirm,
          {
            onPositiveClick: () => handleDelete(row),
          },
          {
            default: () => $t('operations.messageSettings.confirmDeleteBanner'),
            trigger: () =>
              h(
                NButton,
                {
                  size: 'small',
                  type: 'error',
                },
                { default: () => $t('common.delete') },
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
      content: $t('operations.messageSettings.loadBannerFailed'),
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
      content: $t('operations.messageSettings.copySuccess'),
      duration: 3000,
    });
    loadData();
    loadStats();
  } catch (error) {
    console.error('Error copying banner:', error);
    notification.error({
      content: $t('operations.messageSettings.copyFailed'),
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
      content: $t('common.deleteSuccess'),
      duration: 3000,
    });
    loadData();
    loadStats();
  } catch (error) {
    console.error('Error deleting banner:', error);
    notification.error({
      content: $t('operations.messageSettings.deleteFailed'),
      duration: 3000,
    });
  }
};

const handleToggleStatus = async (row: LobbyBanner) => {
  try {
    const newStatus = row.status === 'active' ? 'inactive' : 'active';
    await toggleBannerStatus(row.id, newStatus);
    notification.success({
      content: $t('operations.messageSettings.toggleSuccess', [newStatus === 'active' ? $t('operations.messageSettings.publish') : $t('operations.messageSettings.stop')]),
      duration: 3000,
    });
    loadData();
    loadStats();
  } catch (error) {
    console.error('Error toggling banner status:', error);
    notification.error({
      content: $t('operations.messageSettings.toggleFailed'),
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
      content: $t('operations.messageSettings.toggleSuccess', [getStatusText(status)]),
      duration: 3000,
    });
    selectedRowKeys.value = [];
    loadData();
    loadStats();
  } catch (error) {
    console.error('Error batch toggling status:', error);
    notification.error({
      content: $t('operations.messageSettings.batchOpFailed'),
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
      content: $t('operations.messageSettings.batchDeleteBannerSuccess', [bannersToDelete.length]),
      duration: 3000,
    });
    selectedRowKeys.value = [];
    loadData();
    loadStats();
  } catch (error) {
    console.error('Error batch deleting banners:', error);
    notification.error({
      content: $t('operations.messageSettings.batchDeleteFailed'),
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

const getLanguageText = (language: string): string => {
  const langMap: Record<string, string> = {
    'zh-CN': $t('operations.messageSettings.option.langZh'),
    en: $t('operations.messageSettings.option.langEn'),
    pt: $t('operations.messageSettings.option.langPt'),
    es: $t('operations.messageSettings.option.langEs'),
    ja: $t('operations.messageSettings.option.langJa'),
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
