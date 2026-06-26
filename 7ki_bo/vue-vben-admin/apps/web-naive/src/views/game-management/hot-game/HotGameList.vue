<template>
  <div class="hot-game-list">
    
    <n-card class="mb-4">
      <div class="flex flex-wrap items-end gap-4">
        
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium">{{ $t('common.search') }}</label>
          <div class="flex gap-2">
            <n-input
              v-model:value="filterForm.search"
              :placeholder="$t('game.subgame.searchPlaceholder')"
              style="width: 280px"
              @keyup.enter="handleFilter"
            />
            <n-button type="primary" @click="handleFilter"> {{ $t('common.search') }} </n-button>
          </div>
        </div>

        
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium">{{ $t('common.platform') }}</label>
          <n-select
            v-model:value="filterForm.platformId"
            :placeholder="$t('game.subgame.selectPlatform')"
            clearable
            style="width: 160px"
            :options="platformOptions"
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

        
        <n-button @click="resetFilter"> {{ $t('common.reset') }} </n-button>
      </div>

      
      <div class="mt-4 flex justify-end">
        <div class="flex items-center gap-2">
          <span class="text-sm">{{ $t('game.hotGameExtra.enabledOnly', 'Show enabled only') }}</span>
          <n-switch
            v-model:value="filterForm.isEnabled"
            @update:value="handleFilter"
          />
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
              
              <div class="text-sm text-gray-600">{{ $t('game.hotGameExtra.showAllHot', 'Shows all games marked as hot') }}</div>

              
              <div class="text-sm text-gray-600">
                {{ $t('game.selectedData', [selectedCount, paginationReactive.total]) }}
              </div>
            </div>

            <div class="flex gap-2">
              
              <n-button
                v-if="selectedCount > 0"
                type="error"
                size="small"
                @click="handleBulkRemove(selectedRows)"
              >
                <template #icon>
                  <n-icon>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path
                        d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c0 1 1 2 2 2v2"
                      />
                    </svg>
                  </n-icon>
                </template>
                {{ $t('game.hotGameExtra.batchRemove', [selectedCount]) }}
              </n-button>

              
              <n-button size="small" @click="clearSelection">{{ $t('game.clearSelection') }}</n-button>
              <n-button size="small" @click="selectAll">{{ $t('common.selectAll') }}</n-button>
            </div>
          </div>
        </n-card>
      </template>
    </SmartDataGrid>
  </div>
</template>

<script setup lang="ts">
import { $t } from '@vben/locales';

import { h, onMounted, reactive, ref, defineAsyncComponent } from 'vue';
// ✅ PERFORMANCE FIX: Lazy load components to avoid blocking page load
const SmartDataGrid = defineAsyncComponent(
  () => import('../../../components/smart/SmartDataGrid/index.vue'),
);
import type { DataTableColumns, DataTableSortState } from 'naive-ui';
import {
  NButton,
  NCard,
  NIcon,
  NInput,
  NInputNumber,
  NPopconfirm,
  NSelect,
  NSwitch,
  NTag,
  useMessage,
} from 'naive-ui';
import { notification } from '#/adapter/naive';
import {
  getGameListApi,
  toggleGameApi,
  updateGameApi,
  type GameItem,
  type GameListParams,
} from '#/api/game/subgame';
import { getGamePlatformListApi } from '#/api/game/platform';


const message = useMessage();
const loading = ref(false);
const tableData = ref<GameItem[]>([]);
const checkedRowKeys = ref<(string | number)[]>([]);
const platformOptions = ref<Array<{ label: string; value: number }>>([]);


const editingSortOrder = ref<{ id: number; value: number } | null>(null);


const paginationReactive = reactive({
  page: 1,
  pageSize: 20, 
  total: 0,
});


const sortState = ref<DataTableSortState | null>(null);


const filterForm = reactive({
  search: undefined as string | undefined,
  platformId: undefined as number | undefined,
  currency: undefined as string | undefined,
  isEnabled: undefined as boolean | undefined,
});


const currencyOptions = [
  { label: 'BRL', value: 'BRL' },
  { label: 'USD', value: 'USD' },
  { label: 'EUR', value: 'EUR' },
  { label: 'CNY', value: 'CNY' },
];


const columns: DataTableColumns<GameItem> = [
  { type: 'selection' },
  {
    title: $t('game.subgame.sortOrder'),
    key: 'sortOrder',
    width: 160, 
    sorter: true,
    defaultSortOrder: 'ascend', 
    render(row) {
      
      const isEditing = editingSortOrder.value?.id === Number(row.id);

      if (isEditing) {
        return h('div', { class: 'flex items-center gap-1' }, [
          h(NInputNumber, {
            value: editingSortOrder.value?.value,
            size: 'medium', 
            min: 0,
            max: 9999,
            style: 'width: 100px', 
            autofocus: true,
            showButton: false, 
            'onUpdate:value': (val: number | null) => {
              if (editingSortOrder.value) {
                editingSortOrder.value.value = val ?? 0;
              }
            },
            onKeyup: (e: KeyboardEvent) => {
              if (e.key === 'Enter') {
                handleSaveSortOrder(row);
              } else if (e.key === 'Escape') {
                editingSortOrder.value = null;
              }
            },
          }),
          h(
            NButton,
            {
              size: 'tiny',
              type: 'primary',
              onClick: () => handleSaveSortOrder(row),
            },
            { default: () => '✓' },
          ),
          h(
            NButton,
            {
              size: 'tiny',
              onClick: () => {
                editingSortOrder.value = null;
              },
            },
            { default: () => '✕' },
          ),
        ]);
      }

      return h(
        'div',
        {
          class:
            'flex items-center gap-2 cursor-pointer hover:bg-blue-50 px-3 py-2 rounded border border-transparent hover:border-blue-200 transition-all',
          onClick: () => {
            editingSortOrder.value = {
              id: Number(row.id),
              value: row.sortOrder ?? 0,
            };
          },
        },
        [
          h(
            'span',
            { class: 'font-mono text-md text-blue-600 min-w-[40px]' },
            row.sortOrder ?? 0,
          ),
          h('span', { class: 'text-xs text-gray-400' }, ''),
        ],
      );
    },
  },

  {
    title: $t('game.subgame.iconLabel'),
    key: 'iconUrl',
    width: 80,
    render(row) {
      return h(
        'div',
        {
          class: 'flex justify-center items-center h-10',
        },
        [
          row.iconUrl
            ? h('img', {
                src: row.iconUrl,
                alt: row.gameName,
                class: 'w-10 h-10 object-cover rounded',
                style: 'max-width: 40px; max-height: 40px;',
              })
            : h(
                'div',
                {
                  class:
                    'w-10 h-10 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500',
                },
                $t('game.hotGameExtra.noImage'),
              ),
        ],
      );
    },
  },

  {
    title: $t('game.subgame.gameType'),
    key: 'gameType',
    width: 120,
    render(row) {
      return h(
        NTag,
        {
          type: 'info',
          size: 'small',
        },
        { default: () => row.gameType || row.platform?.gameType || '-' },
      );
    },
  },
  {
    title: $t('game.subgame.platformName'),
    key: 'platformName',
    width: 150,
    render(row) {
      return row.platform?.platformName || '-';
    },
  },
  {
    title: $t('game.subgame.gameNameZh'),
    key: 'gameName',
    width: 200,
    ellipsis: {
      tooltip: true,
    },
  },
  {
    title: $t('game.subgame.displayId'),
    key: 'gameDisplayId',
    width: 120,
  },
  {
    title: $t('common.currency'),
    key: 'currency',
    width: 80,
    render(row) {
      return h(
        NTag,
        {
          type: 'default',
          size: 'small',
        },
        { default: () => row.currency },
      );
    },
  },
  {
    title: $t('common.status'),
    key: 'isEnabled',
    width: 80,
    render(row) {
      return h(
        NTag,
        {
          type: row.isEnabled ? 'success' : 'error',
          size: 'small',
        },
        { default: () => (row.isEnabled ? $t('common.enabled') : $t('common.disabled')) },
      );
    },
  },
  {
    title: $t('game.subgame.recommended'),
    key: 'isRecommended',
    width: 80,
    render(row) {
      
      return h(NSwitch, {
        value: row.isRecommended,
        size: 'small',
        loading: false,
        'onUpdate:value': async (val: boolean) => {
          await handleToggleRecommended(row, val);
        },
      });
    },
  },
  {
    title: $t('common.actions'),
    key: 'actions',
    width: 120,
    render(row) {
      return h('div', { class: 'flex gap-1' }, [
        h(
          NPopconfirm,
          {
            onPositiveClick: () => handleRemove(row),
          },
          {
            trigger: () =>
              h(
                NButton,
                {
                  size: 'small',
                  type: 'error',
                  quaternary: true,
                },
                { default: () => $t('game.hotGameExtra.remove') },
              ),
            default: () => $t('game.hotGameExtra.confirmRemove'),
          },
        ),
      ]);
    },
  },

  {
    title: $t('common.createTime'),
    key: 'createdAt',
    width: 180,
    render(row) {
      return new Date(row.createdAt).toLocaleString('zh-CN');
    },
  },
  {
    title: $t('common.updateTime'),
    key: 'updatedAt',
    width: 180,
    render(row) {
      return new Date(row.updatedAt).toLocaleString('zh-CN');
    },
  },
];

// Note: paginationConfig removed - SmartDataGrid handles pagination internally


const handleFilter = () => {
  paginationReactive.page = 1;
  loadHotGameList();
};


const resetFilter = () => {
  filterForm.search = undefined;
  filterForm.platformId = undefined;
  filterForm.currency = undefined;
  filterForm.isEnabled = undefined;
  paginationReactive.page = 1;
  loadHotGameList();
};


const handleRefresh = () => {
  loadHotGameList(true);
};

const handleRemove = async (record: GameItem) => {
  try {
    await toggleGameApi(Number(record.id), { field: 'isHot1', value: false });
    notification.success({
      content: $t('game.hotGameExtra.removedFromHot'),
      duration: 3000,
    });
    loadHotGameList(true);
  } catch (error: any) {
    console.error('移除失败:', error);
    notification.error({
      content: error?.message || $t('game.hotGameExtra.removeFailed'),
      duration: 3000,
    });
    loadHotGameList(true);
  }
};


const handleBulkRemove = async (selectedRows: GameItem[]) => {
  if (selectedRows.length === 0) {
    message.warning($t('game.hotGameExtra.selectHotToRemove'));
    return;
  }

  try {
    await Promise.all(
      selectedRows.map((game) =>
        toggleGameApi(Number(game.id), { field: 'isHot1', value: false }),
      ),
    );
    message.success($t('game.hotGameExtra.batchRemoveSuccess', [selectedRows.length]));
    checkedRowKeys.value = [];
    loadHotGameList(true);
  } catch (error: any) {
    console.error('批量移除失败:', error);
    message.error(error?.message || $t('game.hotGameExtra.batchRemoveFailed'));
  }
};


const handleSaveSortOrder = async (row: GameItem) => {
  if (!editingSortOrder.value) return;

  const newSortOrder = editingSortOrder.value.value;
  const oldSortOrder = row.sortOrder;

  
  editingSortOrder.value = null;

  try {
    
    const index = tableData.value.findIndex((g) => g.id === row.id);
    if (index !== -1 && tableData.value[index]) {
      tableData.value[index].sortOrder = newSortOrder;
    }

    
    tableData.value = [...tableData.value].sort((a, b) => {
      const aOrder = a.sortOrder ?? 9999;
      const bOrder = b.sortOrder ?? 9999;
      return aOrder - bOrder; 
    });

    
    console.log(
      `🔄 [HOT_GAME] Updating sortOrder for game ${row.id}: ${oldSortOrder} → ${newSortOrder}`,
    );
    const response = await updateGameApi(Number(row.id), {
      sortOrder: newSortOrder,
    });
    console.log(`✅ [HOT_GAME] Update response:`, response);

    // ✅ FIX: Verify the response contains the updated sortOrder and preserve iconUrl
    if (response?.data) {
      const savedSortOrder = response.data.sortOrder;
      const savedIconUrl = response.data.iconUrl;
      const savedBrandLogoUrl = response.data.brandLogoUrl;

      console.log(
        `✅ [HOT_GAME] Server confirmed sortOrder: ${savedSortOrder} (expected: ${newSortOrder})`,
      );
      console.log(
        `✅ [HOT_GAME] Server iconUrl: ${savedIconUrl || 'null/empty'}`,
      );

      if (savedSortOrder !== newSortOrder) {
        console.warn(
          `⚠️ [HOT_GAME] SortOrder mismatch! Expected ${newSortOrder}, got ${savedSortOrder}`,
        );
      }

      // ✅ FIX: Update local data with server response to ensure iconUrl is preserved
      const index = tableData.value.findIndex((g) => g.id === row.id);
      if (index !== -1 && tableData.value[index]) {
        // Only update iconUrl if server returned it (preserve existing if server didn't send it)
        if (savedIconUrl !== undefined) {
          tableData.value[index].iconUrl = savedIconUrl;
          console.log(
            `✅ [HOT_GAME] Updated local iconUrl from server: ${savedIconUrl || 'null'}`,
          );
        }
        if (savedBrandLogoUrl !== undefined) {
          tableData.value[index].brandLogoUrl = savedBrandLogoUrl;
        }
        // Ensure sortOrder matches server
        tableData.value[index].sortOrder = savedSortOrder;
      }
    }

    message.success($t('game.hotGameExtra.sortUpdated', [oldSortOrder, newSortOrder]));

    console.log(`🔄 [HOT_GAME] Reloading list to reflect updated sortOrder`);
    loadHotGameList(true);
  } catch (error: any) {
    console.error('❌ [HOT_GAME] 更新排序失败:', error);
    message.error(error?.message || $t('game.hotGameExtra.sortUpdateFailed'));

    
    loadHotGameList(true);
  }
};


const handleToggleRecommended = async (row: GameItem, value: boolean) => {
  try {
    await toggleGameApi(Number(row.id), { field: 'isRecommended', value });

    
    const index = tableData.value.findIndex((g) => g.id === row.id);
    if (index !== -1 && tableData.value[index]) {
      tableData.value[index].isRecommended = value;
    }

    message.success(value ? $t('game.hotGameExtra.setRecommended') : $t('game.hotGameExtra.unsetRecommended'));
  } catch (error: any) {
    console.error('切换推荐状态失败:', error);
    message.error(error?.message || $t('game.hotGameExtra.toggleRecommendedFailed'));
    
    loadHotGameList(true);
  }
};


const handlePageChange = (page: number) => {
  paginationReactive.page = page;
  loadHotGameList();
};

const handlePageSizeChange = (pageSize: number) => {
  paginationReactive.pageSize = pageSize;
  paginationReactive.page = 1;
  loadHotGameList();
};

// SmartDataGrid event handlers
const handleRowClick = (game: GameItem) => {
  console.log('Hot game row clicked:', game);
  // Optional: Auto-open edit modal on row click
};

const clearSelection = () => {
  checkedRowKeys.value = [];
  message.info($t('game.virtualBonusPool.clearedSelection'));
};

const selectAll = () => {
  checkedRowKeys.value = tableData.value.map((game) => Number(game.id));
  message.info($t('game.virtualBonusPool.selectedAll'));
};

const loadHotGameList = async (forceRefresh = false) => {
  try {
    loading.value = true;
    const params: GameListParams = {
      page: paginationReactive.page,
      pageSize: paginationReactive.pageSize,
      search: filterForm.search,
      platformId: filterForm.platformId,
      currency: filterForm.currency,
      isEnabled: filterForm.isEnabled,
      isHot1: true, 
    };
    if (forceRefresh) params.forceRefresh = true;

    
    if (sortState.value) {
      params.sortBy = sortState.value.columnKey as string;
      params.sortOrder = sortState.value.order === 'ascend' ? 'asc' : 'desc';
    } else {
      
      params.sortBy = 'sortOrder';
      params.sortOrder = 'asc';
    }

    const response = await getGameListApi(params);
    tableData.value = response.list || [];
    paginationReactive.total = response.pagination?.total || 0;

    console.log(
      `✅ 加载热门游戏: ${tableData.value.length} 条, 总数: ${paginationReactive.total}`,
    );
  } catch (error: any) {
    console.error('加载热门游戏列表失败:', error);
    notification.error({
      content: error?.message || $t('game.loadFailed'),
      duration: 3000,
    });
  } finally {
    loading.value = false;
  }
};


const loadOptions = async () => {
  try {
    
    const platformResponse = await getGamePlatformListApi({ pageSize: 1000 });
    platformOptions.value =
      platformResponse.list?.map((platform) => ({
        label: platform.platformName,
        value: platform.id,
      })) || [];
  } catch (error) {
    console.error('加载选项失败:', error);
  }
};


onMounted(() => {
  loadOptions();
  loadHotGameList();
});
</script>

<style scoped>
.hot-game-list {
  padding: 0;
}

:deep(.n-data-table-th) {
  background-color: #f5f5f5;
  font-weight: 600;
  color: #333;
}

:deep(.n-data-table-td) {
  border-bottom: 1px solid #e8e8e8;
}

:deep(.n-data-table-tr:hover .n-data-table-td) {
  background-color: #f8f9fa;
}
</style>