<template>
  <Page description="" title="">
    <n-card class="mb-4">
      <div class="flex flex-wrap items-end gap-4">
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium">{{ $t('game.subgame.gameType') }}</label>
          <n-select
            v-model:value="filterForm.gameType"
            :placeholder="$t('game.subgame.selectGameType')"
            clearable
            style="width: 160px"
            :options="gameTypeOptions"
            @update:value="handleFilter"
          />
        </div>

        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium">{{ $t('common.currency') }}</label>
          <n-select
            v-model:value="filterForm.currency"
            :placeholder="$t('game.subgame.selectCurrency')"
            clearable
            style="width: 120px"
            :options="currencyOptions"
            @update:value="handleFilter"
          />
        </div>

        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium">{{ $t('game.platform.platformStatus') }}</label>
          <n-select
            v-model:value="filterForm.isEnabled"
            :placeholder="$t('game.subgame.selectStatus')"
            clearable
            style="width: 140px"
            :options="statusOptions"
            @update:value="handleFilter"
          />
        </div>

        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium">{{ $t('common.search') }}</label>
          <div class="flex gap-2">
            <n-input
              v-model:value="searchInput"
              :placeholder="$t('game.platform.searchPlaceholder')"
              style="width: 240px"
              clearable
              @keyup.enter="handleFilter"
            />
            <n-button type="primary" @click="handleFilter">{{ $t('common.search') }}</n-button>
            <n-button @click="resetFilter">{{ $t('common.reset') }}</n-button>
          </div>
        </div>
      </div>
    </n-card>

    <SmartDataGrid
      :data="tableData"
      :columns="columns"
      :loading="loading"
      :pagination="paginationReactive"
      selectable
      :selected-keys="checkedRowKeys"
      :row-key="(row: GamePlatformItem) => Number(row.id)"
      @update:selected-keys="checkedRowKeys = $event"
      @update:page="handlePageChange"
      @update:page-size="handlePageSizeChange"
      @refresh="handleRefresh"
      @row-click="handleRowClick"
    >
      <template #actionBar="{ selectedCount }">
        <n-card :bordered="false" class="rounded-16px shadow-sm">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div class="flex gap-2">
                <n-button type="primary" @click="handleCreate">
                  {{ $t('game.platform.addPlatform') }}
                </n-button>
                <n-button type="info" @click="handleOpenPublicConfig">
                  {{ $t('game.platform.publicConfig') }}
                </n-button>
              </div>
              <div class="text-sm text-gray-600">
                {{ $t('game.selectedData', [selectedCount, paginationReactive.total]) }}
              </div>
            </div>

            <div class="flex gap-2">
              <n-button size="small" @click="clearSelection">{{ $t('game.clearSelection') }}</n-button>
              <n-button size="small" @click="selectAll">{{ $t('common.selectAll') }}</n-button>
            </div>
          </div>
        </n-card>
      </template>
    </SmartDataGrid>

    <n-modal
      v-model:show="showModal"
      :title="editingPlatform ? $t('game.platform.editPlatform') : $t('game.platform.addPlatformTitle')"
      preset="dialog"
      style="width: 600px"
      @after-leave="resetForm"
    >
      <n-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-placement="left"
        label-width="100"
      >
        <n-form-item :label="$t('game.platform.platformId')" path="platformId">
          <n-input
            v-model:value="formData.platformId"
            :placeholder="$t('game.platform.enterPlatformId')"
            :disabled="!!editingPlatform"
          />
        </n-form-item>

        <n-form-item :label="$t('game.platform.platformName')" path="platformName">
          <n-input
            v-model:value="formData.platformName"
            :placeholder="$t('game.platform.enterPlatformName')"
          />
        </n-form-item>

        <n-form-item :label="$t('game.subgame.gameType')" path="gameType">
          <n-select
            v-model:value="formData.gameType"
            :placeholder="$t('game.subgame.selectGameType')"
            :options="gameTypeOptions"
          />
        </n-form-item>

        <n-form-item :label="$t('common.currency')" path="currency">
          <n-select
            v-model:value="formData.currency"
            :placeholder="$t('game.subgame.selectCurrency')"
            :options="currencyOptions"
          />
        </n-form-item>

        <n-form-item :label="$t('game.platformExtra.minEntry')" path="minEntryAmount">
          <n-input-number
            v-model:value="formData.minEntryAmount"
            :placeholder="$t('game.platformExtra.enterMinEntry')"
            :min="0"
            :precision="2"
            style="width: 100%"
          />
        </n-form-item>

        <n-form-item :label="$t('game.platform.sortOrder')" path="sortOrder">
          <n-input-number
            v-model:value="formData.sortOrder"
            :placeholder="$t('game.platform.enterSortOrder')"
            :min="0"
            style="width: 100%"
          />
        </n-form-item>

        <n-form-item :label="$t('game.platformExtra.logoImage')">
          <MediaLibrarySelector
            v-model="formData.logoUrl"
            category="platforms"
            :accept-types="['image']"
            :placeholder="$t('game.platformExtra.logoPlaceholder')"
            @file-selected="handleLogoSelected"
          />
        </n-form-item>

        <n-form-item :label="$t('game.platformExtra2.platformImage')">
          <MediaLibrarySelector
            v-model="formData.imageUrl"
            category="platforms"
            :accept-types="['image']"
            :placeholder="$t('game.platformExtra.logoPlaceholder')"
            @file-selected="handleImageSelected"
          />
        </n-form-item>

        <n-form-item :label="$t('game.platformExtra2.platformImage') + ' (H)'">
          <MediaLibrarySelector
            v-model="formData.imageHorizontalUrl"
            category="platforms"
            :accept-types="['image']"
            :placeholder="$t('game.platformExtra.logoPlaceholder')"
            @file-selected="handleHorizontalImageSelected"
          />
        </n-form-item>

        <n-form-item :label="$t('common.remark')" path="remark">
          <n-input
            v-model:value="formData.remark"
            :placeholder="$t('common.pleaseEnter')"
            type="textarea"
            :rows="3"
          />
        </n-form-item>

        <div class="grid grid-cols-2 gap-4">
          <n-form-item :label="$t('game.subgame.hot1')">
            <n-switch v-model:value="formData.isHot" />
          </n-form-item>

          <n-form-item :label="$t('game.subgame.hot2')">
            <n-switch v-model:value="formData.isFeatured" />
          </n-form-item>

          <n-form-item :label="$t('game.platformExtra2.platformSwitch')">
            <n-switch v-model:value="formData.isEnabled" />
          </n-form-item>

          <n-form-item :label="$t('game.platform.showToStreamer')">
            <n-switch v-model:value="formData.showToStreamer" />
          </n-form-item>
        </div>
      </n-form>

      <template #action>
        <div class="flex justify-end gap-2">
          <n-button @click="showModal = false">{{ $t('common.cancel') }}</n-button>
          <n-button type="primary" :loading="submitting" @click="handleSubmit">
            {{ editingPlatform ? $t('common.modify') : $t('common.create') }}
          </n-button>
        </div>
      </template>
    </n-modal>

    <GamePublicConfigModal v-model:show="showPublicConfigModal" />
  </Page>
</template>

<script lang="ts" setup>
import { $t } from '@vben/locales';

import {
  h,
  onMounted,
  reactive,
  ref,
  defineEmits,
  defineAsyncComponent,
} from 'vue';
// ✅ PERFORMANCE FIX: Lazy load components to avoid blocking page load
const SmartDataGrid = defineAsyncComponent(
  () => import('../../../components/smart/SmartDataGrid/index.vue'),
);
import type { DataTableColumns, FormInst, FormRules } from 'naive-ui';
import { useTrimmedSearch } from '#/composables/useFormHelpers';
import {
  NBreadcrumb,
  NBreadcrumbItem,
  NButton,
  NCard,
  NForm,
  NFormItem,
  NInput,
  NInputNumber,
  NModal,
  NPopconfirm,
  NSelect,
  NSwitch,
  NTag,
  NImage,
  useMessage,
} from 'naive-ui';
import { Page } from '@vben/common-ui';
import { notification } from '#/adapter/naive';
import {
  getGamePlatformListApi,
  createGamePlatformApi,
  updateGamePlatformApi,
  deleteGamePlatformApi,
  toggleGamePlatformApi,
  setGamePlatformTopApi,
  bulkDeleteGamePlatformsApi,
  type GamePlatformItem,
} from '#/api/game/platform';
import {
  getGameTypeLabel,
  normalizeGameTypeEnum,
} from '#/utils/gameTypeI18n';
const MediaLibrarySelector = defineAsyncComponent(
  () => import('#/components/MediaLibrarySelector.vue'),
);
const GamePublicConfigModal = defineAsyncComponent(
  () => import('./GamePublicConfigModal.vue'),
);


const message = useMessage();
const loading = ref(false);
const submitting = ref(false);
const showModal = ref(false);
const showPublicConfigModal = ref(false);
const tableData = ref<GamePlatformItem[]>([]);
const checkedRowKeys = ref<number[]>([]);
const editingPlatform = ref<GamePlatformItem | null>(null);
const formRef = ref<FormInst | null>(null);
const imagePreview = ref('');


const paginationReactive = reactive({
  page: 1,
  pageSize: 20,
  total: 0,
});


// 🔍 FIX: Auto-trim search input
const { value: searchInput, trimmed: searchQuery } = useTrimmedSearch('');

const filterForm = reactive({
  gameType: undefined as string | undefined,
  currency: undefined as string | undefined,
  isEnabled: undefined as boolean | undefined,
});


const formData = reactive({
  platformId: '',
  platformName: '',
  gameType: '',
  currency: 'BRL',
  isHot: false,
  isFeatured: false,
  isEnabled: true,
  showToStreamer: false,
  minEntryAmount: 0,
  sortOrder: 0,
  logoUrl: '',
  imageUrl: '',
  imageHorizontalUrl: '',
  remark: '',
});


const gameTypeOptions = [
  { label: $t('game.statisticsExtra.typeLiveShort'), value: 'LIVE' },
  { label: $t('game.statisticsExtra.typeSlotShort'), value: 'SLOT' },
  { label: $t('game.statisticsExtra.typeSportsShort'), value: 'SPORTS' },
  { label: $t('game.statisticsExtra.typeLotteryShort'), value: 'LOTTERY' },
  { label: $t('game.statisticsExtra.typeChessShort'), value: 'CHESS_CARDS' },
  { label: $t('game.platformExtra2.typeEsports'), value: 'ESPORTS' },
  { label: $t('game.statisticsExtra.typeHuntingShort'), value: 'HUNTING' },
  { label: $t('game.statisticsExtra.typeArcadeShort'), value: 'ARCADE' },
  { label: $t('game.platformExtra2.typeSimulation'), value: 'SIMULATION' },
  { label: $t('game.statisticsExtra.typeCockfightShort'), value: 'COCKFIGHT' },
  { label: $t('game.statisticsExtra.typeBlockchainShort'), value: 'BLOCKCHAIN' },
];

const currencyOptions = [
  { label: 'BRL', value: 'BRL' },
  { label: 'USD', value: 'USD' },
  { label: 'EUR', value: 'EUR' },
];

const statusOptions = [
  { label: $t('common.enabled'), value: true },
  { label: $t('common.disabled'), value: false },
] as const;


const formRules: FormRules = {
  platformId: [
    { required: true, message: $t('game.platform.enterPlatformId'), trigger: 'blur' },
    { min: 2, max: 20, message: $t('game.platformExtra2.platformIdLength'), trigger: 'blur' },
  ],
  platformName: [
    { required: true, message: $t('game.platform.enterPlatformName'), trigger: 'blur' },
    { min: 2, max: 50, message: $t('game.platformExtra2.platformNameLength'), trigger: 'blur' },
  ],
  gameType: [
    { required: true, message: $t('game.hotGameExtra.selectGameTypeRequired'), trigger: ['blur', 'change'] },
  ],
  currency: [
    { required: true, message: $t('game.virtualBonusPool.selectCurrencyRequired'), trigger: ['blur', 'change'] },
  ],
};


const formatDate = (date: string | Date | null) => {
  if (!date) return '-';
  return new Date(date).toLocaleString('zh-CN');
};


const columns: DataTableColumns<GamePlatformItem> = [
  { type: 'selection' },
  {
    title: $t('game.subgame.sortOrder'),
    key: 'sortOrder',
    width: 80,
    render(row) {
      return h('div', { class: 'flex items-center gap-1' }, [
        h('span', row.sortOrder),
        h(
          NButton,
          {
            size: 'tiny',
            quaternary: true,
            type: 'primary',
            onClick: () => handleSetTop(row),
          },
          { default: () => $t('game.virtualBonusPool.pinToTop') },
        ),
      ]);
    },
  },
  { title: $t('game.platform.platformId'), key: 'platformId', width: 120 },
  { title: $t('game.subgame.platformName'), key: 'platformName', width: 180 },
  {
    title: $t('game.platformExtra2.logoColumn'),
    key: 'logoUrl',
    width: 80,
    render(row) {
      if (row.logoUrl) {
        return h('div', { class: 'image-container' }, [
          h(NImage, {
            src: row.logoUrl,
            alt: $t('game.platform.platformIcon'),
            width: 40,
            height: 40,
            objectFit: 'cover',
            class: 'table-logo',
            fallbackSrc: '/placeholder-logo.png',
          }),
        ]);
      }
      return h('span', { class: 'text-gray-400' }, $t('game.platformExtra2.noLogo'));
    },
  },
  {
    title: $t('game.subgame.gameType'),
    key: 'gameType',
    width: 100,
    render(row) {
      return h(
        NTag,
        { type: 'info', size: 'small' },
        {
          default: () => getGameTypeLabel(row.gameType),
        },
      );
    },
  },
  { title: $t('common.currency'), key: 'currency', width: 80 },
  {
    title: $t('game.platformExtra2.platformImage'),
    key: 'imageUrl',
    width: 100,
    render(row) {
      if (row.imageUrl) {
        return h('div', { class: 'image-container' }, [
          h(NImage, {
            src: row.imageUrl,
            alt: $t('game.platformExtra2.platformImage'),
            width: 60,
            height: 40,
            objectFit: 'cover',
            class: 'table-image',
            fallbackSrc: '/placeholder-image.png',
          }),
        ]);
      }
      return h('span', { class: 'text-gray-400' }, $t('game.platformExtra2.noImage'));
    },
  },
  {
    title: $t('game.subgame.hot1'),
    key: 'isHot',
    width: 100,
    render(row) {
      return h(NSwitch, {
        value: row.isHot,
        onUpdateValue: (value) => handleToggle(row, 'isHot', value),
      });
    },
  },
  {
    title: $t('game.subgame.hot2'),
    key: 'isFeatured',
    width: 100,
    render(row) {
      return h(NSwitch, {
        value: row.isFeatured,
        onUpdateValue: (value) => handleToggle(row, 'isFeatured', value),
      });
    },
  },
  {
    title: $t('game.platformExtra2.platformSwitch'),
    key: 'isEnabled',
    width: 100,
    render(row) {
      return h(NSwitch, {
        value: row.isEnabled,
        onUpdateValue: (value) => handleToggle(row, 'isEnabled', value),
      });
    },
  },
  {
    title: $t('game.subgame.showToStreamer'),
    key: 'showToStreamer',
    width: 120,
    render(row) {
      return h(NSwitch, {
        value: row.showToStreamer,
        onUpdateValue: (value) => handleToggle(row, 'showToStreamer', value),
      });
    },
  },
  {
    title: $t('game.platformExtra2.subgameCount'),
    key: 'subGameCount',
    width: 100,
    render(row) {
      return h(
        'span',
        { class: 'text-blue-600 font-medium' },
        row.subGameCount,
      );
    },
  },
  {
    title: $t('game.platformExtra.minEntry'),
    key: 'minEntryAmount',
    width: 100,
    render(row) {
      let amount = 0;
      if (typeof row.minEntryAmount === 'string') {
        amount = parseFloat(row.minEntryAmount);
      } else if (typeof row.minEntryAmount === 'number') {
        amount = row.minEntryAmount;
      } else if (
        row.minEntryAmount &&
        typeof row.minEntryAmount === 'object' &&
        row.minEntryAmount.d
      ) {
        // Handle Prisma Decimal object: {s: 1, e: -1, d: [2000000]}
        const decimal = row.minEntryAmount;
        amount = decimal.d[0] * Math.pow(10, decimal.e);
      }
      return `R$ ${(amount || 0).toFixed(2)}`;
    },
  },
  {
    title: $t('common.createTime'),
    key: 'createdAt',
    width: 160,
    render(row) {
      return formatDate(row.createdAt);
    },
  },
  {
    title: $t('common.actions'),
    key: 'actions',
    fixed: 'right',
    width: 200,
    render(row) {
      return h('div', { class: 'flex gap-2' }, [
        h(
          NButton,
          {
            size: 'small',
            quaternary: true,
            type: 'primary',
            onClick: () => handleEdit(row),
          },
          { default: () => $t('common.edit') },
        ),
        h(
          NButton,
          {
            size: 'small',
            quaternary: true,
            type: 'info',
            onClick: () => handleManageGames(row),
          },
          { default: () => $t('game.platformExtra2.manage') },
        ),
      ]);
    },
  },
];

// Note: paginationConfig removed - SmartDataGrid handles pagination internally


const handleFilter = () => {
  paginationReactive.page = 1;
  loadPlatformList();
};


const resetFilter = () => {
  filterForm.gameType = undefined;
  filterForm.currency = undefined;
  filterForm.isEnabled = undefined;
  searchInput.value = ''; // 🔍 FIX: Reset search input
  paginationReactive.page = 1;
  loadPlatformList();
};


const handleRefresh = () => {
  loadPlatformList();
};


const handleCreate = () => {
  editingPlatform.value = null;
  resetForm();
  showModal.value = true;
};


const handleOpenPublicConfig = () => {
  showPublicConfigModal.value = true;
};


const handleEdit = (record: GamePlatformItem) => {
  editingPlatform.value = record;
  formData.platformId = record.platformId;
  formData.platformName = record.platformName;
  formData.gameType = normalizeGameTypeEnum(record.gameType) || record.gameType;
  formData.currency = record.currency;
  formData.isHot = record.isHot;
  formData.isFeatured = record.isFeatured;
  formData.isEnabled = record.isEnabled;
  formData.showToStreamer = record.showToStreamer;
  formData.minEntryAmount =
    typeof record.minEntryAmount === 'string'
      ? parseFloat(record.minEntryAmount)
      : record.minEntryAmount;
  formData.sortOrder =
    typeof record.sortOrder === 'string'
      ? parseInt(record.sortOrder)
      : record.sortOrder;
  formData.imageUrl = record.imageUrl || '';
  formData.imageHorizontalUrl = record.imageHorizontalUrl || '';
  formData.logoUrl = record.logoUrl || '';
  formData.remark = record.remark || '';

  // Reset image upload state for editing
  imagePreview.value = '';

  showModal.value = true;
};


const handleDelete = async (record: GamePlatformItem) => {
  try {
    await deleteGamePlatformApi(record.id);
    notification.success({
      content: $t('common.deleteSuccess'),
      duration: 3000,
    });
    loadPlatformList();
  } catch (error) {
    console.error('删除失败:', error);
    notification.error({
      content: $t('common.deleteFailed'),
      duration: 3000,
    });
  }
};


const handleBulkDelete = async (selectedRows: GamePlatformItem[]) => {
  if (selectedRows.length === 0) {
    message.warning($t('game.platformExtra2.selectPlatformsToDelete'));
    return;
  }

  try {
    const platformIds = selectedRows.map((platform) => Number(platform.id));
    await bulkDeleteGamePlatformsApi(platformIds);
    message.success($t('game.platformExtra2.deletedPlatformsCount', [selectedRows.length]));
    checkedRowKeys.value = [];
    loadPlatformList();
  } catch (error) {
    console.error('批量删除失败:', error);
    message.error($t('common.operationFailed'));
  }
};


const handleToggle = async (
  record: GamePlatformItem,
  field: string,
  value: boolean,
) => {
  try {
    await toggleGamePlatformApi(record.id, { field: field as any, value });
    
    const index = tableData.value.findIndex((item) => item.id === record.id);
    if (index !== -1) {
      (tableData.value[index] as any)[field] = value;
    }
    notification.success({
      content: $t('game.virtualBonusPool.statusUpdateSuccess'),
      duration: 2000,
    });
  } catch (error) {
    console.error('状态更新失败:', error);
    notification.error({
      content: $t('game.virtualBonusPool.statusUpdateFailed'),
      duration: 3000,
    });
  }
};

// Handle image selected from MediaLibrarySelector
const handleImageSelected = (file: any) => {
  if (file) {
    formData.imageUrl = file.url;
    imagePreview.value = file.url;
  }
};

const handleHorizontalImageSelected = (file: any) => {
  if (file) {
    formData.imageHorizontalUrl = file.url;
  }
};

// Handle logo selected from MediaLibrarySelector
const handleLogoSelected = (file: any) => {
  if (file) {
    formData.logoUrl = file.url;
  }
};


const handleSetTop = async (record: GamePlatformItem) => {
  try {
    await setGamePlatformTopApi(record.id);
    notification.success({
      content: $t('game.virtualBonusPool.pinSuccess'),
      duration: 2000,
    });
    loadPlatformList();
  } catch (error) {
    console.error('置顶失败:', error);
    notification.error({
      content: $t('game.virtualBonusPool.pinFailed'),
      duration: 3000,
    });
  }
};


const handleManageGames = (record: GamePlatformItem) => {
  emit('manage-subgames', record.id);
};


const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    submitting.value = true;

    const data = {
      platformId: formData.platformId,
      platformName: formData.platformName,
      gameType: formData.gameType,
      currency: formData.currency,
      isHot: formData.isHot,
      isFeatured: formData.isFeatured,
      isEnabled: formData.isEnabled,
      showToStreamer: formData.showToStreamer,
      minEntryAmount: formData.minEntryAmount,
      sortOrder: formData.sortOrder,
      logoUrl: formData.logoUrl || '',
      imageUrl: formData.imageUrl || '',
      imageHorizontalUrl: formData.imageHorizontalUrl || '',
      remark: formData.remark || undefined,
    };

    let platformResult: any;

    if (editingPlatform.value) {
      platformResult = await updateGamePlatformApi(
        editingPlatform.value.id,
        data,
      );
      notification.success({
        content: $t('game.hotGameExtra.updateSuccess'),
        duration: 3000,
      });
    } else {
      platformResult = await createGamePlatformApi(data);
      notification.success({
        content: $t('game.hotGameExtra.createSuccess'),
        duration: 3000,
      });
    }

    // Images are now handled through MediaLibrarySelector, no separate upload needed

    showModal.value = false;
    loadPlatformList();
  } catch (error) {
    console.error('操作失败:', error);
    notification.error({
      content: $t('common.operationFailed'),
      duration: 3000,
    });
  } finally {
    submitting.value = false;
  }
};


const resetForm = () => {
  formData.platformId = '';
  formData.platformName = '';
  formData.gameType = '';
  formData.currency = 'BRL';
  formData.isHot = false;
  formData.isFeatured = false;
  formData.isEnabled = true;
  formData.showToStreamer = false;
  formData.minEntryAmount = 0;
  formData.sortOrder = 0;
  formData.imageUrl = '';
  formData.imageHorizontalUrl = '';
  formData.logoUrl = '';
  formData.remark = '';

  // Reset image preview state
  imagePreview.value = '';

  if (formRef.value) {
    formRef.value.restoreValidation();
  }
};


const handlePageChange = (page: number) => {
  paginationReactive.page = page;
  loadPlatformList();
};

const handlePageSizeChange = (pageSize: number) => {
  paginationReactive.pageSize = pageSize;
  paginationReactive.page = 1;
  loadPlatformList();
};

// SmartDataGrid event handlers
const handleRowClick = (platform: GamePlatformItem) => {
  console.log('Platform row clicked:', platform);
  // Optional: Auto-open edit modal on row click
  // handleEdit(platform);
};

const clearSelection = () => {
  checkedRowKeys.value = [];
  message.info($t('game.virtualBonusPool.clearedSelection'));
};

const selectAll = () => {
  checkedRowKeys.value = tableData.value.map((platform) => Number(platform.id));
  message.info($t('game.virtualBonusPool.selectedAll'));
};


const loadPlatformList = async () => {
  try {
    loading.value = true;
    const params = {
      page: paginationReactive.page,
      pageSize: paginationReactive.pageSize,
      gameType: filterForm.gameType,
      currency: filterForm.currency,
      isEnabled: filterForm.isEnabled,
      search: searchQuery.value, // 🔍 FIX: Use auto-trimmed search
    };

    const response = await getGamePlatformListApi(params);
    tableData.value = response.list || [];
    paginationReactive.total = response.pagination?.total || 0;
  } catch (error) {
    console.error('加载平台列表失败:', error);
    notification.error({
      content: $t('game.loadFailed'),
      duration: 3000,
    });
  } finally {
    loading.value = false;
  }
};


onMounted(() => {
  loadPlatformList();
});

const emit = defineEmits(['manage-subgames']);
</script>

<style scoped>
.upload-container {
  width: 100%;
}

.upload-area {
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.image-preview {
  position: relative;
  display: inline-block;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.image-preview:hover .image-overlay {
  opacity: 1;
}

.upload-placeholder {
  text-align: center;
  color: #999;
}

.upload-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.upload-text {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
}

.upload-hint {
  font-size: 12px;
  color: #666;
}

/* Table image styling */
.image-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.table-image {
  border-radius: 4px;
  border: 1px solid #e0e0e0;
  width: 60px !important;
  height: 40px !important;
  object-fit: cover;
}

/* Preview image styling */
.preview-image-container {
  width: 200px;
  height: 120px;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
}

.preview-image {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover;
  border-radius: 0;
  border: none;
}
</style>
