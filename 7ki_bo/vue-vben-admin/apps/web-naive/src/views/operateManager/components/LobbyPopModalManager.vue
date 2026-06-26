<template>
  <div class="popup-modal-management">
    <!-- 统计卡片 -->
    <div class="mb-4 grid grid-cols-5 gap-4">
      <n-card>
        <n-statistic :label="$t('operations.messageSettings.total')" :value="stats.total" />
      </n-card>
      <n-card>
        <n-statistic :label="$t('operations.form.statusActive')" :value="stats.active" />
      </n-card>
      <n-card>
        <n-statistic :label="$t('operations.form.statusExpired')" :value="stats.expired" />
      </n-card>
      <n-card>
        <n-statistic :label="$t('operations.messageSettings.draft')" :value="stats.draft" />
      </n-card>
      <n-card>
        <n-statistic :label="$t('operations.messageSettings.option.statusDisabled')" :value="stats.inactive" />
      </n-card>
    </div>

    <!-- 筛选器区域 -->
    <n-card class="mb-4">
      <div class="flex flex-wrap items-end gap-4">
        <!-- 标题搜索 -->
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium">{{ $t('operations.messageSettings.titleLabel') }}</label>
          <n-input
            v-model:value="filters.title"
            :placeholder="$t('operations.messageSettings.titleSearch')"
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

        <!-- 跳转类型 -->
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium">{{ $t('operations.form.jumpType') }}</label>
          <n-select
            v-model:value="filters.jumpType"
            :placeholder="$t('operations.form.jumpType')"
            clearable
            style="width: 140px"
            :options="jumpTypeOptions"
            @update:value="handleFilter"
          />
        </div>

        <!-- 展示入口 -->
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium">{{ $t('operations.form.entryPoints') }}</label>
          <n-select
            v-model:value="filters.entryPoints"
            :placeholder="$t('operations.form.entryPoints')"
            clearable
            style="width: 140px"
            :options="entryPointOptions"
            @update:value="handleFilter"
          />
        </div>

        <!-- 受众 -->
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium">{{ $t('operations.messageSettings.targetAudience') }}</label>
          <n-input
            v-model:value="filters.targetAudience"
            :placeholder="$t('operations.messageSettings.targetAudience')"
            clearable
            style="width: 150px"
            @keyup.enter="handleFilter"
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
            type="datetimerange"
            :placeholder="$t('common.selectDateRange')"
            style="width: 300px"
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
                <n-button type="primary" @click="handleCreate">{{ $t('operations.messageSettings.addPop') }}</n-button>
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
              >{{ $t('common.enable') }} ({{ selectedCount }})
              </n-button>
              <n-button
                v-if="selectedCount > 0"
                type="warning"
                size="small"
                @click="handleBatchToggleStatus('inactive', selectedRows)"
              >{{ $t('common.disable') }} ({{ selectedCount }})
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
      :title="$t('operations.messageSettings.popDetail')"
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
              {{ detailData.language }}
            </div>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-600">{{ $t('common.currency') }}</label>
            <div class="mt-1 rounded bg-gray-50 p-2">
              {{ detailData.currency }}
            </div>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-600">{{ $t('operations.messageSettings.targetAudience') }}</label>
            <div class="mt-1 rounded bg-gray-50 p-2">
              {{ detailData.targetAudience }}
            </div>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-600">{{ $t('operations.form.jumpType') }}</label>
            <div class="mt-1 rounded bg-gray-50 p-2">
              {{ getJumpTypeText(detailData.jumpType) }}
            </div>
          </div>
        </div>

        <div class="mb-4">
          <label class="text-sm font-medium text-gray-600">{{ $t('operations.messageSettings.titleLabel') }}</label>
          <div class="mt-1 rounded bg-gray-50 p-3">{{ detailData.title }}</div>
        </div>

        <div class="mb-4">
          <label class="text-sm font-medium text-gray-600">{{ $t('operations.messageSettings.popImage') }}</label>
          <div class="mt-1">
            <n-image
              :src="detailData.imageUrl"
              :alt="$t('operations.messageSettings.popImage')"
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
            <label class="text-sm font-medium text-gray-600">{{ $t('operations.messageSettings.startTime') }}</label>
            <div class="mt-1 rounded bg-gray-50 p-2">
              {{ formatDate(detailData.startTime) }}
            </div>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-600">{{ $t('operations.messageSettings.endTime') }}</label>
            <div class="mt-1 rounded bg-gray-50 p-2">
              {{ formatDate(detailData.endTime) }}
            </div>
          </div>
        </div>

        <div class="mb-4">
          <label class="text-sm font-medium text-gray-600">{{ $t('operations.form.entryPoints') }}</label>
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
              >{{ $t('operations.form.maxDisplayTimes') }}</label
            >
            <div class="mt-1 rounded bg-gray-50 p-2">
              {{ detailData.maxDisplayTimes }}{{ $t('operations.messageSettings.timesUnit') }}
            </div>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-600">{{ $t('operations.form.displayInterval') }}</label>
            <div class="mt-1 rounded bg-gray-50 p-2">
              {{ detailData.displayInterval }}{{ $t('operations.messageSettings.hoursUnit') }}
            </div>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-600">{{ $t('common.status') }}</label>
            <div class="mt-1 rounded bg-gray-50 p-2">
              <n-tag :type="getStatusType(detailData.status)" size="small">
                {{ getStatusText(detailData.status) }}
              </n-tag>
            </div>
          </div>
        </div>

        <div class="mb-4 grid grid-cols-3 gap-4">
          <div>
            <label class="text-sm font-medium text-gray-600">{{ $t('operations.messageSettings.totalViews') }}</label>
            <div class="mt-1 rounded bg-gray-50 p-2">
              {{ detailData.totalViews }}
            </div>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-600">{{ $t('operations.messageSettings.totalClicks') }}</label>
            <div class="mt-1 rounded bg-gray-50 p-2">
              {{ detailData.totalClicks }}
            </div>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-600">{{ $t('operations.messageSettings.clickRate') }}</label>
            <div class="mt-1 rounded bg-gray-50 p-2">
              {{ (detailData.clickRate * 100).toFixed(2) }}%
            </div>
          </div>
        </div>

        <div v-if="detailData.targetUrl" class="mb-4">
          <label class="text-sm font-medium text-gray-600">{{ $t('operations.messageSettings.jumpTarget') }}</label>
          <div class="mt-1 rounded bg-gray-50 p-3">
            {{ detailData.targetUrl }}
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
      v-model:show="showImagePreview"
      :title="$t('operations.messageSettings.imagePreview')"
      preset="dialog"
      style="width: 80vw; max-width: 1000px"
    >
      <div class="text-center">
        <n-image
          :src="previewImageUrl"
          :alt="$t('operations.form.popImagePreview')"
          style="max-width: 100%; max-height: 70vh"
          :fallback-src="placeholderImageUrl"
          @error="handleImageError"
        />
      </div>

      <template #action>
        <div class="flex justify-end gap-2">
          <n-button @click="showImagePreview = false">{{ $t('common.close') }}</n-button>
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
  { label: $t('operations.form.statusActive'), value: 'active' },
  { label: $t('operations.form.statusExpired'), value: 'expired' },
  { label: $t('operations.messageSettings.option.statusDraft'), value: 'draft' },
  { label: $t('operations.form.statusInactive'), value: 'inactive' },
];

const jumpTypeOptions: SelectOption[] = [
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

const entryPointOptions: SelectOption[] = [
  { label: $t('operations.form.afterLogin'), value: 'login' },
  { label: $t('operations.form.homepageLoad'), value: 'homepage' },
  { label: $t('operations.form.depositPage'), value: 'deposit' },
  { label: $t('operations.form.gameLobby'), value: 'game_lobby' },
  { label: $t('operations.form.promotionPage'), value: 'promotion' },
  { label: $t('operations.messageSettings.option.triggerManual'), value: 'manual' },
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
      const langMap: Record<string, string> = {
        'zh-CN': $t('operations.messageSettings.option.langZh'),
        en: $t('operations.messageSettings.option.langEn'),
        pt: $t('operations.messageSettings.option.langPt'),
        es: $t('operations.messageSettings.option.langEs'),
        ja: $t('operations.messageSettings.option.langJa'),
      };
      return langMap[row.language] || row.language;
    },
  },
  {
    title: $t('operations.messageSettings.titleLabel'),
    key: 'title',
    width: 200,
    ellipsis: {
      tooltip: true,
    },
  },
  {
    title: $t('operations.form.popImagePreview'),
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
    title: $t('operations.messageSettings.targetAudience'),
    key: 'targetAudience',
    width: 150,
    ellipsis: {
      tooltip: true,
    },
  },
  {
    title: $t('operations.form.entryPoints'),
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
    title: $t('operations.messageSettings.jumpMode'),
    key: 'jumpType',
    width: 120,
    render(row) {
      return getJumpTypeText(row.jumpType);
    },
  },
  {
    title: $t('operations.messageSettings.startTime'),
    key: 'startTime',
    width: 160,
    render(row) {
      return formatDate(row.startTime);
    },
  },
  {
    title: $t('operations.messageSettings.endTime'),
    key: 'endTime',
    width: 160,
    render(row) {
      return formatDate(row.endTime);
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
            default: () => $t('operations.messageSettings.confirmDeletePop'),
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
      content: $t('operations.messageSettings.loadPopFailed'),
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
      content: $t('operations.messageSettings.copySuccess'),
      duration: 3000,
    });
    loadData();
    loadStats();
  } catch (error) {
    console.error('Error copying popup modal:', error);
    notification.error({
      content: $t('operations.messageSettings.copyFailed'),
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
      content: $t('common.deleteSuccess'),
      duration: 3000,
    });
    loadData();
    loadStats();
  } catch (error) {
    console.error('Error deleting popup modal:', error);
    notification.error({
      content: $t('operations.messageSettings.deleteFailed'),
      duration: 3000,
    });
  }
};

const handleToggleStatus = async (row: LobbyPopModal) => {
  try {
    const newStatus = row.status === 'active' ? 'inactive' : 'active';
    await togglePopModalStatus(row.id, newStatus);

    notification.success({
      content: newStatus === 'active' ? $t('operations.messageSettings.toggleSuccess', [$t('common.enable')]) : $t('operations.messageSettings.toggleSuccess', [$t('common.disable')]),
      duration: 3000,
    });
    loadData();
    loadStats();
  } catch (error) {
    console.error('Error toggling popup modal status:', error);
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
      content: $t('operations.messageSettings.batchToggleSuccess', [status === 'active' ? $t('common.enable') : $t('common.disable')]),
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
      content: $t('operations.messageSettings.batchDeletePopSuccess', [modalsToDelete.length]),
      duration: 3000,
    });
    selectedRowKeys.value = [];
    loadData();
    loadStats();
  } catch (error) {
    console.error('Error batch deleting popup modals:', error);
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
