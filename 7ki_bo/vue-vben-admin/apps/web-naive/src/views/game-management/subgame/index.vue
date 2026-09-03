<template>
  <Page :description="$t('game.subgame.desc')" :title="$t('game.subgame.title')">
    
    <div class="mb-4">
      <n-breadcrumb>
        <n-breadcrumb-item>{{ $t('game.breadcrumb') }}</n-breadcrumb-item>
        <n-breadcrumb-item>{{ $t('game.subgame.breadcrumb') }}</n-breadcrumb-item>
      </n-breadcrumb>
    </div>

    
    <n-card class="mb-4">
      <div class="flex flex-wrap items-end gap-4">
        
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium">{{ $t('game.subgame.vendor') }}</label>
          <n-select
            v-model:value="filterForm.vendor"
            :placeholder="$t('game.subgame.selectVendor')"
            clearable
            style="width: 160px"
            :options="vendorOptions"
            @update:value="handleVendorChange"
          />
        </div>

        
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium">{{ $t('game.subgame.gameType') }}</label>
          <n-select
            v-model:value="filterForm.gameType"
            :placeholder="$t('game.subgame.selectGameType')"
            clearable
            style="width: 140px"
            :options="gameTypeFilterOptions"
            @update:value="handleGameTypeChange"
          />
        </div>

        
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium">{{ $t('game.subgame.platformName') }}</label>
          <n-select
            v-model:value="filterForm.platformId"
            :placeholder="$t('game.subgame.selectPlatform')"
            clearable
            style="width: 200px"
            :options="filteredPlatformOptions"
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
          <label class="mb-2 text-sm font-medium">{{ $t('game.subgame.gameStatus') }}</label>
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
          <label class="mb-2 text-sm font-medium">{{ $t('game.subgame.hotTag') }}</label>
          <n-select
            v-model:value="filterForm.hotType"
            :placeholder="$t('game.subgame.selectHotType')"
            clearable
            style="width: 160px"
            :options="hotTypeOptions"
            @update:value="handleFilter"
          />
        </div>

        
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium">{{ $t('common.search') }}</label>
          <div class="flex gap-2">
            <n-input
              v-model:value="filterForm.search"
              :placeholder="$t('game.subgame.searchPlaceholder')"
              style="width: 240px"
              @input="handleSearchInput"
              @keyup.enter="handleFilter"
            />
            <n-button type="primary" @click="handleFilter"> {{ $t('common.search') }} </n-button>
            <n-button @click="resetFilter"> {{ $t('common.reset') }} </n-button>
          </div>
        </div>
      </div>
    </n-card>

    <!-- 🚀 NEW: SmartDataGrid Component -->
    <SmartDataGrid
      :data="tableData"
      :columns="columns"
      :loading="loading"
      :pagination="paginationReactive"
      selectable
      :selected-keys="checkedRowKeys"
      :row-key="(row: GameItem) => Number(row.id)"
      :scroll-x="1320"
      :height="600"
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
              
              <div class="flex gap-2">
                <n-button type="primary" @click="handleImport">{{ $t('game.subgame.importGames') }}</n-button>
                <n-button tertiary type="primary" @click="showApiImport = true">{{ $t('game.subgame.apiImport') }}</n-button>
                <n-button type="success" @click="handleCreate">{{ $t('game.subgame.addGame') }}</n-button>
                <n-button
                  secondary
                  type="primary"
                  :loading="exporting"
                  @click="handleExportCsv"
                >{{ $t('game.subgame.exportCsv') }}</n-button>
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

    
    <GameImportDialog
      v-model:visible="showImportDialog"
      :platform-options="platformOptions"
      @success="handleImportSuccess"
    />

    
    <ApiImportDialog
      v-model="showApiImport"
      :platform-options="platformOptions"
      @success="handleImportSuccess"
    />

    
    <n-modal
      v-model:show="showModal"
      :title="editingGame ? $t('game.subgame.editGame') : $t('game.subgame.addGameTitle')"
      preset="dialog"
      style="width: 700px"
      @after-leave="resetForm"
    >
      <n-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-placement="left"
        label-width="100"
      >
        <n-form-item :label="$t('game.subgame.belongPlatform')" path="platformId">
          <n-select
            v-model:value="formData.platformId"
            :placeholder="$t('game.subgame.selectBelongPlatform')"
            :options="platformOptions"
            :disabled="!!editingGame"
          />
        </n-form-item>

        <n-form-item :label="$t('game.subgame.gameId')" path="gameId">
          <n-input
            v-model:value="formData.gameId"
            :placeholder="$t('game.subgame.enterGameId')"
            :disabled="!!editingGame"
          />
        </n-form-item>

        <n-form-item :label="$t('game.subgame.displayId')" path="gameDisplayId">
          <n-input
            v-model:value="formData.gameDisplayId"
            :placeholder="$t('game.subgame.enterDisplayId')"
          />
        </n-form-item>

        <n-form-item :label="$t('game.subgame.gameNameZh')" path="gameName">
          <n-input
            v-model:value="formData.gameName"
            :placeholder="$t('game.subgame.enterGameNameZh')"
          />
        </n-form-item>

        <n-form-item :label="$t('game.subgame.gameNameEn')" path="gameNameEn">
          <n-input
            v-model:value="formData.gameNameEn"
            :placeholder="$t('game.subgame.enterGameNameEn')"
          />
        </n-form-item>

        <n-form-item :label="$t('game.subgame.vendor')" path="vendor">
          <n-input
            v-model:value="formData.vendor"
            :placeholder="$t('game.subgame.enterVendor')"
          />
        </n-form-item>

        <n-form-item :label="$t('game.betRecords.gameType')" path="gameType">
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

        <n-form-item :label="$t('game.subgame.sortOrder')" path="sortOrder">
          <n-input-number
            v-model:value="formData.sortOrder"
            :placeholder="$t('game.subgame.enterSortOrder')"
            :min="0"
            style="width: 100%"
          />
        </n-form-item>

        
        <div class="image-upload-section">
          <n-form-item :label="$t('game.subgame.iconLabel')">
            
            <div
              class="direct-upload-area"
              @drop="handleIconDrop"
              @dragover.prevent
              @dragenter.prevent
              @click="openIconSelector"
            >
              <div v-if="formData.iconUrl" class="uploaded-icon">
                <n-image
                  :src="getImageUrlByEnvironment(formData.iconUrl)"
                  alt="Game Icon"
                  class="uploaded-icon-img"
                  width="100%"
                  height="120"
                  object-fit="cover"
                  :preview-src="getImageUrlByEnvironment(formData.iconUrl)"
                />
                <div class="icon-overlay">
                  <div class="icon-actions">
                    <n-button size="tiny" @click.stop="openIconSelector"
                      >{{ $t('game.platform.replace') }}</n-button
                    >
                    <n-button size="tiny" type="error" @click.stop="clearIcon"
                      >{{ $t('game.platform.clear') }}</n-button
                    >
                  </div>
                </div>
              </div>
              <div v-else class="upload-placeholder">
                <div class="upload-icon">📁</div>
                <div class="upload-text">{{ $t('game.platform.dragUploadHint') }}</div>
                <div class="upload-hint">{{ $t('game.platform.uploadFormatHint') }}</div>
              </div>
            </div>
          </n-form-item>

          
          <n-form-item :label="$t('game.subgame.iconPreview')">
            <div class="icon-preview">
              <div class="preview-container">
                <div class="game-icon-preview">
                  <n-image
                    v-if="formData.iconUrl"
                    :src="getImageUrlByEnvironment(formData.iconUrl)"
                    alt="Game Icon"
                    class="game-icon-preview-img"
                    width="80"
                    height="80"
                    object-fit="cover"
                    :preview-src="getImageUrlByEnvironment(formData.iconUrl)"
                  />
                  <div v-else class="placeholder-icon">{{ $t('game.subgame.gameIconPlaceholder') }}</div>
                </div>
              </div>
            </div>
          </n-form-item>
        </div>

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
            <n-switch v-model:value="formData.isHot1" />
          </n-form-item>

          <n-form-item :label="$t('game.subgame.hot2')">
            <n-switch v-model:value="formData.isHot2" />
          </n-form-item>

          <n-form-item :label="$t('game.subgame.recommended')">
            <n-switch v-model:value="formData.isRecommended" />
          </n-form-item>

          <n-form-item :label="$t('game.subgame.gameSwitch')">
            <n-switch v-model:value="formData.isEnabled" />
          </n-form-item>

          <n-form-item :label="$t('game.subgame.maintenanceStatus')">
            <n-switch v-model:value="formData.isUnderMaintenance" />
          </n-form-item>

          <n-form-item :label="$t('game.subgame.showToStreamer')">
            <n-switch v-model:value="formData.showToStreamer" />
          </n-form-item>
        </div>
      </n-form>

      <template #action>
        <div class="flex justify-end gap-2">
          <n-button @click="showModal = false">{{ $t('common.cancel') }}</n-button>
          <n-button type="primary" @click="handleSubmit" :loading="submitting">
            {{ editingGame ? $t('common.save') : $t('common.create') }}
          </n-button>
        </div>
      </template>
    </n-modal>
  </Page>
</template>

<script lang="ts" setup>
import { $t } from '@vben/locales';
import { preferences } from '@vben/preferences';

import {
  computed,
  h,
  onMounted,
  onUnmounted,
  reactive,
  ref,
  watch,
  nextTick,
} from 'vue';
import { renderTzDateTime } from '#/components/common/tzDateTimeRender';
import { formatDateTimeInTimezone } from '#/utils/timezoneUtils';
// ✅ PERFORMANCE FIX: Lazy load components to avoid blocking page load
import { defineAsyncComponent } from 'vue';
const SmartDataGrid = defineAsyncComponent(
  () => import('../../../components/smart/SmartDataGrid/index.vue'),
);
import type { DataTableColumns, FormInst, FormRules } from 'naive-ui';
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
  getGameListApi,
  createGameApi,
  updateGameApi,
  deleteGameApi,
  toggleGameApi,
  setGameTopApi,
  bulkDeleteGamesApi,
  type GameItem,
  type GameListParams,
} from '#/api/game/subgame';
import {
  getGamePlatformListApi,
  type GamePlatformItem,
} from '#/api/game/platform';
import { uploadMediaFile } from '#/api/mediaLibrary';
const GameImportDialog = defineAsyncComponent(
  () => import('./GameImportDialog.vue'),
);
const ApiImportDialog = defineAsyncComponent(
  () => import('./ApiImportDialog.vue'),
);
import { getImageUrlByEnvironment } from '../../../utils/imageUtils';
import {
  getGameTypeFilterEnums,
  getGameTypeLabel,
  getGameTypeSelectOptions,
  getLocalizedGameName,
  normalizeGameTypeEnum,
} from '#/utils/gameTypeI18n';


const message = useMessage();
const loading = ref(false);
const exporting = ref(false);
const submitting = ref(false);
const showModal = ref(false);
const showImportDialog = ref(false);
const showApiImport = ref(false);
const tableData = ref<GameItem[]>([]);
const checkedRowKeys = ref<number[]>([]);
const editingGame = ref<GameItem | null>(null);
const formRef = ref<FormInst | null>(null);
const platformOptions = ref<Array<{ label: string; value: number }>>([]);


const platformCache = ref<Array<{ label: string; value: number }>>([]);
const platformLoaded = ref(false);


const searchTimeout = ref<NodeJS.Timeout | null>(null);


const paginationReactive = reactive({
  page: 1,
  pageSize: 20,
  total: 0,
});


const filterForm = reactive({
  gameType: undefined as string | undefined,
  platformId: undefined as number | undefined,
  vendor: undefined as string | undefined,
  currency: undefined as string | undefined,
  isEnabled: undefined as string | undefined,
  hotType: undefined as string | undefined,
  search: undefined as string | undefined,
});


const formData = reactive({
  platformId: undefined as number | undefined,
  gameId: '',
  gameDisplayId: '',
  gameName: '',
  gameNameEn: '',
  vendor: '',
  gameType: '',
  currency: 'BRL',
  isHot1: false,
  isHot2: false,
  isRecommended: false,
  isEnabled: true,
  isUnderMaintenance: false,
  showToStreamer: false,
  sortOrder: 0,
  iconUrl: '',
  remark: '',
});


const iconPreview = ref('');


const currencyOptions = [
  { label: 'BRL', value: 'BRL' },
  { label: 'USD', value: 'USD' },
  { label: 'EUR', value: 'EUR' },
];


const gameTypeOptions = getGameTypeSelectOptions();
const gameTypeFilterOptions = getGameTypeSelectOptions();

const vendorOptions = ref<Array<{ label: string; value: string }>>([]);

const statusOptions = [
  { label: $t('common.enabled'), value: 'true', type: 'option' },
  { label: $t('common.disabled'), value: 'false', type: 'option' },
];

const hotTypeOptions = [
  { label: $t('game.subgame.hotTypeHot1'), value: 'hot1', type: 'option' },
  { label: $t('game.subgame.hotTypeHot2'), value: 'hot2', type: 'option' },
  { label: $t('game.subgame.hotTypeRecommended'), value: 'recommended', type: 'option' },
];


const formRules: FormRules = {
  platformId: [
    {
      trigger: 'submit',
      validator: (_, value) => {
        if (editingGame.value) return Promise.resolve();
        if (!!value) return Promise.resolve();
        return Promise.reject(new Error($t('game.platformExtra.selectPlatformRequired')));
      },
    },
  ],
  gameId: [{ required: true, message: $t('game.subgame.enterGameId'), trigger: 'blur' }],
  gameDisplayId: [
    { max: 50, message: $t('game.platformExtra.displayIdMax'), trigger: 'blur' },
  ],
  gameName: [
    { required: true, message: $t('game.platformExtra.enterGameName'), trigger: 'blur' },
    { min: 2, max: 50, message: $t('game.platformExtra.gameNameZhMax'), trigger: 'blur' },
  ],
  vendor: [{ required: true, message: $t('game.subgame.enterVendor'), trigger: 'blur' }],
  currency: [
    { required: true, message: $t('game.virtualBonusPool.selectCurrencyRequired'), trigger: ['blur', 'change'] },
  ],
};


const columns: DataTableColumns<GameItem> = [
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
  {
    title: $t('game.subgame.platformName'),
    key: 'platform',
    width: 150,
    render(row) {
      return row.platform?.platformName || '-';
    },
  },
  {
    title: $t('game.subgame.vendor'),
    key: 'vendor',
    width: 120,
    render(row) {
      return row.thirdPartyData?.vendor || '-';
    },
  },
  { title: $t('game.subgame.gameId'), key: 'gameId', width: 120 },
  { title: $t('game.subgame.displayId'), key: 'gameDisplayId', width: 120 },
  {
    title: $t('game.subgame.gameNameZh'),
    key: 'gameName',
    width: 180,
    render(row) {
      const primary = getLocalizedGameName(row);
      const secondary =
        preferences.app.locale === 'zh-CN'
          ? row.gameNameEn
          : row.gameName && row.gameName !== primary
            ? row.gameName
            : '';
      return h('div', [
        h('div', { style: 'font-weight: 500' }, primary),
        secondary &&
          h(
            'div',
            { style: 'font-size: 12px; color: #666; margin-top: 2px' },
            secondary,
          ),
      ]);
    },
  },
  {
    title: $t('game.subgame.gameType'),
    key: 'gameType',
    width: 100,
    render(row) {
      return getGameTypeLabel(row.gameType);
    },
  },
  {
    title: $t('game.subgame.iconLabel'),
    key: 'iconUrl',
    width: 80,
    render(row) {
      if (row.iconUrl) {
        return h('div', { class: 'image-container' }, [
          h(NImage, {
            src: getImageUrlByEnvironment(row.iconUrl),
            alt: $t('game.subgame.gameIconPlaceholder'),
            width: 40,
            height: 40,
            objectFit: 'cover',
            class: 'game-icon',
            fallbackSrc: '/placeholder-game.png',
            lazy: true,
            previewSrc: getImageUrlByEnvironment(row.iconUrl),
          }),
        ]);
      }
      return h('span', { class: 'text-gray-400' }, $t('game.virtualBonusPool.noIcon'));
    },
  },
  { title: $t('common.currency'), key: 'currency', width: 80 },
  {
    title: $t('game.subgame.hot1'),
    key: 'isHot1',
    width: 100,
    render(row) {
      return h(NSwitch, {
        value: row.isHot1,
        onUpdateValue: (value) => handleToggle(row, 'isHot1', value),
      });
    },
  },
  {
    title: $t('game.subgame.hot2'),
    key: 'isHot2',
    width: 100,
    render(row) {
      return h(NSwitch, {
        value: row.isHot2,
        onUpdateValue: (value) => handleToggle(row, 'isHot2', value),
      });
    },
  },
  {
    title: $t('game.subgame.recommended'),
    key: 'isRecommended',
    width: 80,
    render(row) {
      return h(NSwitch, {
        value: row.isRecommended,
        onUpdateValue: (value) => handleToggle(row, 'isRecommended', value),
      });
    },
  },
  {
    title: $t('game.subgame.gameSwitch'),
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
    title: $t('game.subgame.maintenanceStatus'),
    key: 'isUnderMaintenance',
    width: 100,
    render(row) {
      return h(
        NTag,
        {
          type: row.isUnderMaintenance ? 'warning' : 'success',
          size: 'small',
        },
        {
          default: () => (row.isUnderMaintenance ? $t('game.virtualBonusPool.underMaintenance') : $t('game.virtualBonusPool.maintenanceNormal')),
        },
      );
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
    title: $t('common.createTime'),
    key: 'createdAt',
    width: 160,
    render(row) {
      return renderTzDateTime(row.createdAt);
    },
  },
  {
    title: $t('common.actions'),
    key: 'actions',
    fixed: 'right',
    width: 150,
    render(row) {
      const actions = [];

      // Edit button
      actions.push(
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
      );

      // Delete button

      return h('div', { class: 'flex gap-2 flex-wrap' }, actions);
    },
  },
];

// Note: paginationConfig removed - SmartDataGrid handles pagination internally


const hasSelectedGames = computed(() => {
  return checkedRowKeys.value.length > 0;
});

// SmartDataGrid event handlers
const handleRowClick = (game: GameItem) => {
  console.log('Game row clicked:', game);
  // Optional: Auto-open edit modal on row click
  // handleEdit(game);
};

const clearSelection = () => {
  checkedRowKeys.value = [];
  message.info($t('game.virtualBonusPool.clearedSelection'));
};

const selectAll = () => {
  checkedRowKeys.value = tableData.value.map((game) => Number(game.id));
  message.info($t('game.virtualBonusPool.selectedAll'));
};


const filteredPlatformOptions = computed(() => {
  
  if (!filterForm.vendor && !filterForm.gameType) {
    return platformOptions.value;
  }

  
  return filteredPlatforms.value;
});


const filteredPlatforms = ref<any[]>([]);


const isLoadingPlatforms = ref(false);


const loadFilteredPlatforms = async () => {
  
  if (isLoadingPlatforms.value) {
    console.log('Platform loading already in progress, skipping...');
    return;
  }

  
  if (!filterForm.vendor && !filterForm.gameType) {
    console.log('🔄 No vendor or game type filters, showing all platforms');
    filteredPlatforms.value = [...platformOptions.value];
    return;
  }

  isLoadingPlatforms.value = true;

  try {
    
    const params: any = {
      page: 1,
      pageSize: 1000, 
      vendor: filterForm.vendor,
    };

    
    if (filterForm.gameType) {
      const enumValues = getGameTypeFilterEnums(filterForm.gameType);
      if (enumValues && enumValues.length > 0) {
        params.gameType = enumValues.join(',');
      }
    }

    console.log('Loading filtered platforms with params:', params);
    console.log('Game type filter:', filterForm.gameType);
    console.log(
      'English enum values:',
      filterForm.gameType
        ? getGameTypeFilterEnums(filterForm.gameType)
        : 'none',
    );

    
    let availablePlatformIds = new Set();

    try {
      
      const gameResponse = await getGameListApi(params);

      console.log('Game API Response for platform filtering:', {
        totalGames: gameResponse.list?.length || 0,
        sampleGame: gameResponse.list?.[0]
          ? {
              id: gameResponse.list[0].id,
              platformId: gameResponse.list[0].platformId,
              platform: gameResponse.list[0].platform,
              gameName: gameResponse.list[0].gameName,
            }
          : null,
      });

      if (gameResponse.list && gameResponse.list.length > 0) {
        
        gameResponse.list.forEach((game: any) => {
          const platformId =
            game.platformId || (game.platform && game.platform.id);
          if (platformId) {
            availablePlatformIds.add(platformId);
          }
        });
        console.log(`Found ${availablePlatformIds.size} platforms from games`);
      }
    } catch (gameError) {
      console.warn('Game API failed, trying platform API:', gameError);
    }

    
    if (availablePlatformIds.size === 0 && filterForm.gameType) {
      try {
        console.log('Trying platform API for game type:', filterForm.gameType);

        
        let platformGameType = filterForm.gameType;
        if (filterForm.gameType === '棋牌游戏') {
          platformGameType = '棋牌'; 
        }

        const platformResponse = await getGamePlatformListApi({
          page: 1,
          pageSize: 1000,
          gameType: platformGameType,
        });

        console.log('Platform API Response:', {
          totalPlatforms: platformResponse.list?.length || 0,
          samplePlatform: platformResponse.list?.[0]
            ? {
                id: platformResponse.list[0].id,
                platformId: platformResponse.list[0].platformId,
                platformName: platformResponse.list[0].platformName,
                gameType: platformResponse.list[0].gameType,
              }
            : null,
        });

        if (platformResponse.list && platformResponse.list.length > 0) {
          
          platformResponse.list.forEach((platform: any) => {
            availablePlatformIds.add(platform.id);
          });
          console.log(
            `Found ${availablePlatformIds.size} platforms from platform API`,
          );
        }
      } catch (platformError) {
        console.warn('Platform API also failed:', platformError);
      }
    }

    if (availablePlatformIds.size > 0) {
      
      const filtered = platformOptions.value.filter((platform) =>
        availablePlatformIds.has(platform.value),
      );

      filteredPlatforms.value = filtered;

      console.log(
        `Platform filtering: Found ${availablePlatformIds.size} unique platforms, showing ${filtered.length} platform options`,
      );
      console.log('Available platform IDs:', Array.from(availablePlatformIds));
      console.log(
        'Filtered platforms:',
        filtered.map((p) => ({ value: p.value, label: p.label })),
      );
    } else {
      
      filteredPlatforms.value = [];
      console.log(
        'No platforms found for current filters, showing 0 platforms',
      );
    }

    
    nextTick(() => {
      handleFilter();
    });
  } catch (error) {
    console.error('Failed to load filtered platforms:', error);
    
    filteredPlatforms.value = platformOptions.value;

    
    nextTick(() => {
      handleFilter();
    });
  } finally {
    
    isLoadingPlatforms.value = false;
  }
};


const handleVendorChange = (value: string | undefined) => {
  console.log('🏭 Vendor changed to:', value);
  console.log(
    '🏭 Filter form before change:',
    JSON.stringify(filterForm, null, 2),
  );

  
  filterForm.vendor = value;
  console.log(
    '🏭 Filter form after vendor update:',
    JSON.stringify(filterForm, null, 2),
  );

  // Add a small delay to ensure the state is properly set
  console.log('🏭 Scheduling filter update...');

  
  if (filterForm.platformId) {
    
    const isCurrentPlatformValid = filteredPlatformOptions.value.some(
      (option) => option.value === filterForm.platformId,
    );

    if (!isCurrentPlatformValid) {
      console.log(
        '🔄 Current platform no longer valid, clearing platform selection',
      );
      filterForm.platformId = undefined;
    }
  }

  
  if (!value) {
    console.log(
      '🔄 Vendor cleared, resetting platform options to all platforms',
    );
    filteredPlatforms.value = [...platformOptions.value];
  }

  
  loadFilteredPlatforms();

  
  nextTick(() => {
    handleFilter();
  });
};


const handleGameTypeChange = (value: string | undefined) => {
  console.log('🎮 Game type changed to:', value);

  
  filterForm.gameType = value;
  console.log(
    '🎮 Filter form after game type update:',
    JSON.stringify(filterForm, null, 2),
  );

  
  if (filterForm.platformId) {
    
    const isCurrentPlatformValid = filteredPlatformOptions.value.some(
      (option) => option.value === filterForm.platformId,
    );

    if (!isCurrentPlatformValid) {
      console.log(
        '🔄 Current platform no longer valid, clearing platform selection',
      );
      filterForm.platformId = undefined;
    }
  }

  
  if (!value) {
    console.log(
      '🔄 Game type cleared, resetting platform options to all platforms',
    );
    filteredPlatforms.value = [...platformOptions.value];
  }

  
  loadFilteredPlatforms();

  
  nextTick(() => {
    handleFilter();
  });
};


const handleFilter = () => {
  paginationReactive.page = 1;
  
  nextTick(() => {
    loadGameList();
  });
};


const handleSearchInput = () => {
  
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value);
  }

  
  if (!filterForm.search || filterForm.search.trim() === '') {
    console.log('🔍 Search cleared, filtering immediately');
    handleFilter();
    return;
  }

  
  searchTimeout.value = setTimeout(() => {
    console.log('🔍 Search input changed, filtering with:', filterForm.search);
    handleFilter();
  }, 500);
};


const resetFilter = () => {
  console.log('🔄 Resetting all filters...');

  
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value);
  }

  
  filterForm.gameType = undefined;
  filterForm.platformId = undefined;
  filterForm.vendor = undefined;
  filterForm.currency = undefined;
  filterForm.isEnabled = undefined;
  filterForm.hotType = undefined;
  filterForm.search = '';

  
  paginationReactive.page = 1;

  
  filteredPlatforms.value = [...platformOptions.value];

  
  checkedRowKeys.value = [];

  console.log('✅ All filters cleared. Loading complete dataset...');
  console.log(
    '🔍 Filter form after reset:',
    JSON.stringify(filterForm, null, 2),
  );
  console.log('🔍 Will fetch all games without any filter conditions');

  
  nextTick(() => {
    loadGameList();
  });
};


const handleRefresh = () => {
  loadGameList();
};


const handleImport = () => {
  showImportDialog.value = true;
};


const handleImportSuccess = () => {
  notification.success({
    content: $t('game.subgame.importSuccess'),
    duration: 3000,
  });
  loadGameList();
};


const handleCreate = () => {
  editingGame.value = null;
  resetForm();
  showModal.value = true;
};


const handleEdit = (record: GameItem) => {
  // ✅ FIX: Log the game being edited for debugging
  console.log('📝 Opening edit form for game:', {
    id: record.id,
    gameDisplayId: record.gameDisplayId,
    gameName: record.gameName,
    gameId: record.gameId,
  });

  // ✅ FIX: Ensure editingGame is set to the correct record
  editingGame.value = { ...record }; // Create a copy to prevent reference issues

  formData.platformId = record.platformId || undefined;
  formData.gameId = record.gameId;
  formData.gameDisplayId = record.gameDisplayId || '';
  formData.gameName = record.gameName;
  formData.gameNameEn = record.gameNameEn || '';
  
  formData.gameType = record.gameType
    ? normalizeGameTypeEnum(record.gameType)
    : '';
  formData.vendor = record.thirdPartyData?.vendor || '';
  formData.currency = record.currency;
  formData.isHot1 = record.isHot1;
  formData.isHot2 = record.isHot2;
  formData.isRecommended = record.isRecommended;
  formData.isEnabled = record.isEnabled;
  formData.isUnderMaintenance = record.isUnderMaintenance;
  formData.showToStreamer = record.showToStreamer;
  formData.sortOrder =
    typeof record.sortOrder === 'string'
      ? parseInt(record.sortOrder)
      : record.sortOrder;
  formData.iconUrl = record.iconUrl || '';
  formData.remark = record.remark || '';

  // Reset preview states for editing
  iconPreview.value = '';

  showModal.value = true;
};


const handleDelete = async (record: GameItem) => {
  try {
    await deleteGameApi(Number(record.id));
    notification.success({
      content: $t('common.deleteSuccess'),
      duration: 3000,
    });
    loadGameList();
  } catch (error) {
    console.error('删除失败:', error);
    notification.error({
      content: $t('common.deleteFailed'),
      duration: 3000,
    });
  }
};


const handleBulkDelete = async (selectedRows: GameItem[]) => {
  if (selectedRows.length === 0) {
    message.warning($t('game.virtualBonusPool.selectGamesToDelete'));
    return;
  }

  try {
    const gameIds = selectedRows.map((game) => Number(game.id));
    await bulkDeleteGamesApi(gameIds);
    message.success($t('game.virtualBonusPool.deletedGamesCount', [selectedRows.length]));
    checkedRowKeys.value = [];
    loadGameList();
  } catch (error) {
    console.error('批量删除失败:', error);
    message.error($t('common.operationFailed'));
  }
};


const handleToggle = async (
  record: GameItem,
  field: string,
  value: boolean,
) => {
  try {
    await toggleGameApi(Number(record.id), { field: field as any, value });
    
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


const handleSetTop = async (record: GameItem) => {
  try {
    await setGameTopApi(Number(record.id));
    notification.success({
      content: $t('game.virtualBonusPool.pinSuccess'),
      duration: 2000,
    });
    loadGameList();
  } catch (error) {
    console.error('置顶失败:', error);
    notification.error({
      content: $t('game.virtualBonusPool.pinFailed'),
      duration: 3000,
    });
  }
};


const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    submitting.value = true;

    const platformId = Number(formData.platformId);
    if (!platformId) {
      throw new Error($t('game.virtualBonusPool.invalidPlatform'));
    }

    const data = {
      platformId,
      gameId: formData.gameId,
      gameDisplayId: formData.gameDisplayId || undefined,
      gameName: formData.gameName,
      vendor: formData.vendor,
      gameNameEn: formData.gameNameEn || undefined,
      
      gameType: normalizeGameTypeEnum(formData.gameType) || formData.gameType,
      currency: formData.currency,
      isHot1: formData.isHot1,
      isHot2: formData.isHot2,
      isRecommended: formData.isRecommended,
      isEnabled: formData.isEnabled,
      isUnderMaintenance: formData.isUnderMaintenance,
      showToStreamer: formData.showToStreamer,
      sortOrder: formData.sortOrder,
      iconUrl: formData.iconUrl || '',
      remark: formData.remark || undefined,
    };

    let gameResult: any;

    if (editingGame.value) {
      // ✅ FIX: Store the editing game ID and key fields before making the API call to prevent race conditions
      const editingGameId = Number(editingGame.value.id);
      const editingGameDisplayId = editingGame.value.gameDisplayId;
      const editingGameName = editingGame.value.gameName;
      const editingGameId_field = editingGame.value.gameId;

      // ✅ FIX: Validate that we're updating the correct game by checking multiple fields match
      // This prevents accidentally updating the wrong game if editingGame.value was changed or formData is polluted
      const validationErrors: string[] = [];

      if (
        data.gameId &&
        editingGameId_field &&
        data.gameId !== editingGameId_field
      ) {
        validationErrors.push(
          `gameId mismatch: editing=${editingGameId_field}, form=${data.gameId}`,
        );
      }

      if (
        data.gameDisplayId &&
        editingGameDisplayId &&
        data.gameDisplayId !== editingGameDisplayId
      ) {
        // Allow gameDisplayId to change (user might be updating it)
        console.log('ℹ️ [INFO] gameDisplayId is being changed:', {
          from: editingGameDisplayId,
          to: data.gameDisplayId,
        });
      }

      if (
        data.gameName &&
        editingGameName &&
        data.gameName !== editingGameName
      ) {
        // Allow gameName to change (user might be updating it)
        console.log('ℹ️ [INFO] gameName is being changed:', {
          from: editingGameName,
          to: data.gameName,
        });
      }

      if (validationErrors.length > 0) {
        console.error(
          '❌ [SAFETY CHECK FAILED] Validation errors:',
          validationErrors,
        );
        console.error('❌ Editing game:', {
          id: editingGameId,
          gameId: editingGameId_field,
          gameDisplayId: editingGameDisplayId,
          gameName: editingGameName,
        });
        console.error('❌ Form data:', data);
        throw new Error(
          $t('game.virtualBonusPool.securityValidationFailed', [validationErrors.join(', ')]),
        );
      }

      console.log('🔄 Updating game:', {
        gameId: editingGameId,
        gameId_field: editingGameId_field,
        gameDisplayId: editingGameDisplayId,
        gameName: editingGameName,
        formGameId: data.gameId,
        formGameDisplayId: data.gameDisplayId,
        formGameName: data.gameName,
      });

      gameResult = await updateGameApi(editingGameId, data);

      // ✅ FIX: Use the stored editingGameId instead of editingGame.value.id to prevent race conditions
      // Immediately update the local table data for instant UI reflection
      const gameIndex = tableData.value.findIndex(
        (game) => game.id === editingGameId,
      );
      if (gameIndex !== -1) {
        // Update the existing game in the table with proper type handling
        const existingGame = tableData.value[gameIndex];

        // ✅ FIX: Only update fields that were actually changed, preserve other fields
        const updatedGame = {
          ...existingGame,
          ...data,
          id: existingGame.id, // ✅ Ensure ID is never changed
          updatedAt: new Date().toISOString(),
        } as GameItem;

        console.log('🔄 Updating local game data:', {
          gameId: editingGameId,
          before: {
            id: existingGame.id,
            gameDisplayId: existingGame.gameDisplayId,
            gameName: existingGame.gameName,
          },
          after: {
            id: updatedGame.id,
            gameDisplayId: updatedGame.gameDisplayId,
            gameName: updatedGame.gameName,
          },
          index: gameIndex,
        });

        tableData.value[gameIndex] = updatedGame;

        // Force Vue reactivity update
        tableData.value = [...tableData.value];

        console.log('✅ Local game data updated successfully');
      } else {
        console.warn(
          '⚠️ Game not found in local table for update:',
          editingGameId,
        );
      }

      notification.success({
        content: $t('game.hotGameExtra.updateSuccess'),
        duration: 3000,
      });
    } else {
      gameResult = await createGameApi(data);

      // Add the new game to the beginning of the table for instant UI reflection
      if (gameResult && gameResult.id) {
        const newGame: GameItem = {
          id: gameResult.id,
          platformId: data.platformId,
          gameId: data.gameId,
          gameDisplayId: data.gameDisplayId,
          gameName: data.gameName,
          gameNameEn: data.gameNameEn,
          gameType: data.gameType,
          currency: data.currency || 'BRL',
          isHot1: data.isHot1 || false,
          isHot2: data.isHot2 || false,
          isRecommended: data.isRecommended || false,
          isEnabled: data.isEnabled !== undefined ? data.isEnabled : true,
          isUnderMaintenance: data.isUnderMaintenance || false,
          showToStreamer: data.showToStreamer || false,
          iconUrl: data.iconUrl || null,
          brandLogoUrl: null, // Not available in formData
          remark: data.remark || null,
          sortOrder: data.sortOrder || 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        tableData.value.unshift(newGame);

        // Update pagination count
        paginationReactive.total += 1;
      }

      notification.success({
        content: $t('game.hotGameExtra.createSuccess'),
        duration: 3000,
      });
    }

    // Images are now handled through MediaLibrarySelector, no separate upload needed

    showModal.value = false;
    // Don't call loadGameList() - it will overwrite our immediate local update with cached data
    // The local data update above ensures the UI shows the correct data immediately
  } catch (error: any) {
    console.error('操作失败:', error);
    notification.error({
      content: error?.message || $t('common.operationFailed'),
      duration: 3000,
    });
  } finally {
    submitting.value = false;
  }
};


const resetForm = () => {
  // ✅ FIX: Clear editingGame FIRST to prevent state pollution
  editingGame.value = null;

  formData.platformId = undefined;
  formData.gameId = '';
  formData.gameDisplayId = '';
  formData.gameName = '';
  formData.gameNameEn = '';
  formData.gameType = '';
  formData.vendor = '';
  formData.currency = 'BRL';
  formData.isHot1 = false;
  formData.isHot2 = false;
  formData.isRecommended = false;
  formData.isEnabled = true;
  formData.isUnderMaintenance = false;
  formData.showToStreamer = false;
  formData.sortOrder = 0;
  formData.iconUrl = '';
  formData.remark = '';

  
  iconPreview.value = '';

  if (formRef.value) {
    formRef.value.restoreValidation();
  }

  console.log('✅ Form reset - editingGame cleared');
};


const handlePageChange = (page: number) => {
  paginationReactive.page = page;
  loadGameList();
};

const handlePageSizeChange = (pageSize: number) => {
  paginationReactive.pageSize = pageSize;
  paginationReactive.page = 1;
  loadGameList();
};


const buildGameListParams = (
  overrides: Partial<Pick<GameListParams, 'page' | 'pageSize'>> = {},
): GameListParams => {
  const params: GameListParams = {
    page: overrides.page ?? paginationReactive.page,
    pageSize: overrides.pageSize ?? paginationReactive.pageSize,
  };

  if (filterForm.platformId) {
    params.platformId = filterForm.platformId;
  }
  if (filterForm.vendor) {
    params.vendor = filterForm.vendor;
  }
  if (filterForm.currency) {
    params.currency = filterForm.currency;
  }
  if (filterForm.search?.trim()) {
    params.search = filterForm.search.trim();
  }
  if (filterForm.gameType) {
    const enumValues = getGameTypeFilterEnums(filterForm.gameType);
    if (enumValues?.length) {
      params.gameType = enumValues.join(',');
    }
  }
  if (filterForm.hotType === 'hot1') {
    params.isHot1 = true;
  } else if (filterForm.hotType === 'hot2') {
    params.isHot2 = true;
  } else if (filterForm.hotType === 'recommended') {
    params.isRecommended = true;
  }
  if (filterForm.isEnabled === 'true') {
    params.isEnabled = true;
  } else if (filterForm.isEnabled === 'false') {
    params.isEnabled = false;
  }
  return params;
};

const csvEscapeCell = (v: unknown) => {
  const s = v == null ? '' : String(v);
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
};


const handleExportCsv = async () => {
  exporting.value = true;
  try {
    const chunkSize = 500;
    const all: GameItem[] = [];
    let page = 1;
    let total = 0;

    for (;;) {
      const response = await getGameListApi({
        ...buildGameListParams(),
        page,
        pageSize: chunkSize,
      });
      total = response.pagination?.total ?? 0;
      const list = response.list ?? [];
      all.push(...list);
      if (list.length === 0 || all.length >= total) {
        break;
      }
      page += 1;
    }

    const headers = [
      'ID',
      $t('game.subgame.platformName'),
      $t('game.subgame.vendor'),
      'GameID',
      $t('game.subgame.displayId'),
      $t('game.subgame.gameNameZh'),
      $t('game.subgame.gameNameEn'),
      $t('game.subgame.gameType'),
      $t('common.currency'),
      $t('common.enabled'),
      $t('game.subgame.hot1'),
      $t('game.subgame.hot2'),
      $t('game.subgame.recommended'),
      $t('game.virtualBonusPool.underMaintenance'),
      $t('game.subgame.showToStreamer'),
      $t('game.subgame.sortOrder'),
      $t('common.remark'),
      $t('common.createTime'),
      $t('common.updateTime'),
    ];

    const rows = all.map((g) => [
      g.id,
      g.platform?.platformName ?? '',
      g.thirdPartyData?.vendor ?? '',
      g.gameId,
      g.gameDisplayId ?? '',
      g.gameName,
      g.gameNameEn ?? '',
      getGameTypeLabel(g.gameType),
      g.currency,
      g.isEnabled ? $t('common.yes') : $t('common.no'),
      g.isHot1 ? $t('common.yes') : $t('common.no'),
      g.isHot2 ? $t('common.yes') : $t('common.no'),
      g.isRecommended ? $t('common.yes') : $t('common.no'),
      g.isUnderMaintenance ? $t('common.yes') : $t('common.no'),
      g.showToStreamer ? $t('common.yes') : $t('common.no'),
      g.sortOrder,
      g.remark ?? '',
      formatDateTimeInTimezone(g.createdAt),
      formatDateTimeInTimezone(g.updatedAt),
    ]);

    const body = [
      headers.map(csvEscapeCell).join(','),
      ...rows.map((r) => r.map(csvEscapeCell).join(',')),
    ].join('\n');

    const blob = new Blob([`\uFEFF${body}`], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${$t('game.subgame.exportFileName', [new Date().toISOString().slice(0, 10)])}`;
    document.body.append(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    notification.success({
      content: $t('game.virtualBonusPool.exportedRecords', [all.length]),
      duration: 3000,
    });
  } catch (e: any) {
    console.error('Export CSV failed:', e);
    notification.error({
      content: e?.message || $t('game.subgame.exportFailed'),
      duration: 3000,
    });
  } finally {
    exporting.value = false;
  }
};


const loadGameList = async () => {
  try {
    loading.value = true;

    const params = buildGameListParams();

    console.log('🚀 Calling API with vendor filter:', params.vendor || 'none');

    const response = await getGameListApi(params);
    console.log('📥 API response received:', response);
    console.log('📊 Response data count:', response?.list?.length || 0);
    console.log(
      '📈 Total games in response:',
      response?.pagination?.total || 0,
    );

    if (response?.list?.length > 0) {
      console.log(
        '🎮 First 3 games vendors:',
        response.list.slice(0, 3).map((game) => ({
          name: game.gameName,
          vendor: game.thirdPartyData?.vendor || 'No vendor',
        })),
      );
    }

    tableData.value = response.list || [];
    paginationReactive.total = response.pagination?.total || 0;
    if (response.pagination) {
      paginationReactive.page = response.pagination.current;
      paginationReactive.pageSize = response.pagination.pageSize;
    }

    // Debug platform filtering
    console.log('Platform debugging:');
    console.log('- Total platforms loaded:', platformOptions.value.length);
    console.log('- Current filter vendor:', filterForm.vendor);
    console.log('- Current filter gameType:', filterForm.gameType);
    console.log('- Games loaded:', tableData.value.length);
    console.log('- Total games available:', response.pagination?.total || 0);

    
    
    const currentPageVendors = Array.from(
      new Set(
        (tableData.value || [])
          .map((g: any) => g?.thirdPartyData?.vendor)
          .filter((v: any) => typeof v === 'string' && v.trim()),
      ),
    );

    
    const existingVendors = vendorOptions.value.map((v) => v.value);
    const newVendors = currentPageVendors.filter(
      (v) => !existingVendors.includes(v),
    );

    if (newVendors.length > 0) {
      const newVendorOptions = newVendors.map((v) => ({ label: v, value: v }));
      vendorOptions.value = [...vendorOptions.value, ...newVendorOptions];
      console.log('Added new vendors:', newVendors);
    }
  } catch (error) {
    console.error('load games failed:', error);
    notification.error({
      content: $t('game.loadFailed'),
      duration: 3000,
    });
  } finally {
    loading.value = false;
  }
};


const loadAllVendors = async () => {
  try {
    console.log('Loading all vendors...');
    
    const response = await getGameListApi({
      page: 1,
      pageSize: 1000, 
      
    });

    if (response.list && response.list.length > 0) {
      const allVendors = Array.from(
        new Set(
          response.list
            .map((g: any) => g?.thirdPartyData?.vendor)
            .filter((v: any) => typeof v === 'string' && v.trim()),
        ),
      );

      vendorOptions.value = allVendors.map((v) => ({ label: v, value: v }));
      console.log(`Loaded ${allVendors.length} vendors:`, allVendors);
    }
  } catch (error) {
    console.error('Failed to load all vendors:', error);
  }
};


const loadPlatformOptions = async () => {
  
  if (platformLoaded.value && platformCache.value.length > 0) {
    platformOptions.value = platformCache.value;
    console.log('Using cached platforms:', platformOptions.value.length);
    
    filteredPlatforms.value = platformCache.value;
    return;
  }

  try {
    console.log('Loading platform options...');
    const response = await getGamePlatformListApi({ pageSize: 1000 }); 
    console.log('Platform API response:', response);

    const options =
      response.list?.map((platform: GamePlatformItem) => ({
        label: `${platform.platformName} (${platform.platformId})`,
        value: platform.id,
      })) || [];

    console.log('Processed platform options:', options.length);
    console.log('Sample platforms:', options.slice(0, 5));

    
    platformCache.value = options;
    platformOptions.value = options;
    platformLoaded.value = true;

    
    filteredPlatforms.value = options;

    console.log('Platforms loaded successfully:', platformOptions.value.length);
  } catch (error) {
    console.error('加载平台选项失败:', error);
  }
};


onMounted(async () => {
  
  await Promise.all([
    loadPlatformOptions(),
    loadAllVendors(), 
    loadGameList(),
  ]);
});


onUnmounted(() => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value);
  }
});

const props = defineProps<{ platformId?: number }>();

watch(
  () => props.platformId,
  (newVal) => {
    if (newVal) {
      filterForm.platformId = newVal;
      paginationReactive.page = 1;
      loadGameList();
    }
  },
);

// ===================================
// MEDIA LIBRARY HANDLERS
// ===================================

// Handle icon selection
const handleIconSelected = (file: any) => {
  formData.iconUrl = file.url || '';
  iconPreview.value = file.url || '';
};

// Remove icon
const removeIcon = () => {
  iconPreview.value = '';
  formData.iconUrl = '';
};

// Handle direct drop
const handleIconDrop = (e: DragEvent) => {
  e.preventDefault();
  const files = e.dataTransfer?.files;
  if (files && files.length > 0) {
    const file = files[0];
    if (file && file.type.startsWith('image/')) {
      // Auto-upload to media library
      uploadIconToMediaLibrary(file);
    } else {
      notification.warning({
        content: $t('game.subgame.dragImageOnly'),
        duration: 3000,
      });
    }
  }
};

// Upload icon to media library
const uploadIconToMediaLibrary = async (file: File) => {
  // ✅ FIX: Log current editing game state before upload to debug state issues
  console.log('📤 [ICON UPLOAD] Starting icon upload:', {
    editingGameId: editingGame.value?.id,
    editingGameDisplayId: editingGame.value?.gameDisplayId,
    editingGameName: editingGame.value?.gameName,
    formGameDisplayId: formData.gameDisplayId,
    formGameName: formData.gameName,
    fileName: file.name,
  });

  try {
    // Upload to media library API using the correct function
    const response = await uploadMediaFile(file, {
      filename: file.name,
      category: 'icons',
      alt: 'Game Icon',
      description: 'Game icon uploaded via drag & drop',
      isPublic: true,
    });

    // Debug: Log the actual response structure
    console.log('🔍 Upload response:', response);
    console.log('🔍 Response type:', typeof response);
    console.log('🔍 Response keys:', response ? Object.keys(response) : 'null');

    // Handle the correct response structure: {success: true, message: string, data: MediaFile}
    if (
      response &&
      typeof response === 'object' &&
      response.success &&
      response.data &&
      response.data.url
    ) {
      // ✅ FIX: Log before updating formData to track state changes
      console.log('✅ [ICON UPLOAD] Updating formData.iconUrl:', {
        before: formData.iconUrl,
        after: response.data.url,
        editingGameId: editingGame.value?.id,
        editingGameDisplayId: editingGame.value?.gameDisplayId,
        editingGameName: editingGame.value?.gameName,
      });

      // Update form with uploaded icon URL
      formData.iconUrl = response.data.url;
      notification.success({
        content: $t('game.subgame.iconUploadSuccess'),
        duration: 3000,
      });
    } else if (response && typeof response === 'object' && 'url' in response) {
      // Fallback: Handle direct MediaFile object (in case requestClient unwrapped it)
      console.log('✅ [ICON UPLOAD] Updating formData.iconUrl (fallback):', {
        before: formData.iconUrl,
        after: (response as any).url,
        editingGameId: editingGame.value?.id,
      });

      formData.iconUrl = (response as any).url;
      notification.success({
        content: $t('game.subgame.iconUploadSuccess'),
        duration: 3000,
      });
    } else {
      console.error('❌ Invalid response structure:', response);
      throw new Error($t('game.subgame.uploadFailed'));
    }
  } catch (error) {
    console.error('Icon upload error:', error);
    notification.error({
      content: error instanceof Error ? error.message : $t('game.subgame.iconUploadFailed'),
      duration: 3000,
    });
  }
};

// Open MediaLibrarySelector for icon selection
const openIconSelector = () => {
  // For now, we'll use a simple file input as fallback
  const input = document.createElement('input');
  input.type = 'file';
  // ✅ FIX: Explicitly include AVIF in accept attribute to allow AVIF file selection
  input.accept = 'image/*,.avif,image/avif';
  input.onchange = (e) => {
    const target = e.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      const file = target.files[0];
      if (file) {
        const fileName = file.name.toLowerCase();
        const fileType = file.type || '';
        const isImage =
          fileType.startsWith('image/') ||
          /\.(jpg|jpeg|png|gif|webp|avif|svg|bmp)$/i.test(fileName);

        if (!isImage) {
          notification.error({
            content: $t('game.subgame.dragImageOnly'),
            duration: 3000,
          });
          return;
        }

        uploadIconToMediaLibrary(file);
      }
    }
  };
  input.click();
};

const clearIcon = () => {
  formData.iconUrl = '';
};
</script>

<style scoped>
/* Table image styling */
.image-container {
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.game-icon {
  border-radius: 4px;
  border: 1px solid #e0e0e0;
  transition: all 0.2s ease;
}

.game-icon:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

/* Image preview modal styling */
:deep(.n-image-preview-toolbar) {
  background-color: rgba(0, 0, 0, 0.8);
}

:deep(.n-image-preview-img) {
  max-width: 90vw;
  max-height: 90vh;
  object-fit: contain;
}

.image-upload-section {
  margin: 16px 0;
}

.upload-container {
  width: 100%;
}

.upload-area {
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  transition: border-color 0.3s ease;
  cursor: pointer;
  position: relative;
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-area:hover {
  border-color: #40a9ff;
}

.icon-area {
  background-color: #f0f8ff;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.upload-icon {
  font-size: 32px;
  opacity: 0.6;
}

.upload-text {
  color: #666;
  font-size: 14px;
}

.image-preview {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-image {
  max-width: 100px;
  max-height: 80px;
  object-fit: contain;
  border-radius: 4px;
}

.image-overlay {
  position: absolute;
  top: 8px;
  right: 8px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.image-preview:hover .image-overlay {
  opacity: 1;
}

.icon-preview {
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 16px;
  background-color: #fafafa;
}

.preview-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 80px;
}

.game-icon-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  padding: 8px;
  background: white;
}

.game-icon-preview-img {
  max-width: 80px;
  max-height: 80px;
  object-fit: contain;
}

.placeholder-icon {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 12px;
  text-align: center;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.grid {
  display: grid;
}

.grid-cols-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.gap-4 {
  gap: 1rem;
}

.flex {
  display: flex;
}

.gap-2 {
  gap: 0.5rem;
}

.justify-end {
  justify-content: flex-end;
}

.mb-4 {
  margin-bottom: 1rem;
}

.image-upload-section {
  margin-bottom: 20px;
}

.direct-upload-area {
  width: 100%;
  min-height: 120px;
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.direct-upload-area:hover {
  border-color: #1890ff;
  background-color: #f0f8ff;
}

.direct-upload-area:active {
  border-color: #096dd9;
  background-color: #e6f7ff;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 120px;
  color: #8c8c8c;
}

.upload-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.upload-text {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
}

.upload-hint {
  font-size: 12px;
  color: #bfbfbf;
}

.uploaded-icon {
  position: relative;
  width: 100%;
  height: 120px;
}

.uploaded-icon-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 6px;
}

.icon-overlay {
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
  transition: opacity 0.3s ease;
}

.uploaded-icon:hover .icon-overlay {
  opacity: 1;
}

.icon-actions {
  display: flex;
  gap: 8px;
}

.icon-preview {
  margin-top: 16px;
}

.preview-container {
  display: flex;
  justify-content: center;
}

.game-icon-preview {
  width: 80px;
  height: 80px;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fafafa;
}

.game-icon-preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.placeholder-icon {
  color: #8c8c8c;
  font-size: 12px;
  text-align: center;
}
</style>
