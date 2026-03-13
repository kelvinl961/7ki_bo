<template>
  <div class="hot-game-list">
    <!-- 搜索和筛选区域 -->
    <n-card class="mb-4">
      <div class="flex flex-wrap items-end gap-4">
        <!-- 关键词搜索 -->
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium">关键词搜索</label>
          <div class="flex gap-2">
            <n-input
              v-model:value="filterForm.search"
              placeholder="搜索游戏名称..."
              style="width: 280px"
              @keyup.enter="handleFilter"
            />
            <n-button type="primary" @click="handleFilter"> 搜索 </n-button>
          </div>
        </div>

        <!-- 平台筛选 -->
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium">平台</label>
          <n-select
            v-model:value="filterForm.platformId"
            placeholder="选择平台"
            clearable
            style="width: 160px"
            :options="platformOptions"
            @update:value="handleFilter"
          />
        </div>

        <!-- 币种筛选 -->
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium">币种</label>
          <n-select
            v-model:value="filterForm.currency"
            placeholder="选择币种"
            clearable
            style="width: 120px"
            :options="currencyOptions"
            @update:value="handleFilter"
          />
        </div>

        <!-- 重置按钮 -->
        <n-button @click="resetFilter"> 重置 </n-button>
      </div>

      <!-- 是否启用筛选开关 -->
      <div class="mt-4 flex justify-end">
        <div class="flex items-center gap-2">
          <span class="text-sm">仅显示启用的游戏</span>
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
              <!-- 描述信息 -->
              <div class="text-sm text-gray-600">显示所有设置为热门的游戏</div>

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
                批量移除 ({{ selectedCount }})
              </n-button>

              <!-- 选择控制 -->
              <n-button size="small" @click="clearSelection">清空选择</n-button>
              <n-button size="small" @click="selectAll">全选</n-button>
            </div>
          </div>
        </n-card>
      </template>
    </SmartDataGrid>
  </div>
</template>

<script setup lang="ts">
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

// 响应式数据
const message = useMessage();
const loading = ref(false);
const tableData = ref<GameItem[]>([]);
const checkedRowKeys = ref<(string | number)[]>([]);
const platformOptions = ref<Array<{ label: string; value: number }>>([]);

// 正在编辑的排序值
const editingSortOrder = ref<{ id: number; value: number } | null>(null);

// 分页信息 (simplified for SmartDataGrid) - 使用较小的pageSize以正确显示分页
const paginationReactive = reactive({
  page: 1,
  pageSize: 20, // ✅ 修复：使用20而不是100，这样17条记录会显示1页
  total: 0,
});

// 排序信息 - 默认按sortOrder升序 (不设置初始值，在loadHotGameList中处理默认排序)
const sortState = ref<DataTableSortState | null>(null);

// 筛选表单
const filterForm = reactive({
  search: undefined as string | undefined,
  platformId: undefined as number | undefined,
  currency: undefined as string | undefined,
  isEnabled: undefined as boolean | undefined,
});

// 币种选项
const currencyOptions = [
  { label: 'BRL', value: 'BRL' },
  { label: 'USD', value: 'USD' },
  { label: 'EUR', value: 'EUR' },
  { label: 'CNY', value: 'CNY' },
];

// 表格列定义
const columns: DataTableColumns<GameItem> = [
  { type: 'selection' },
  {
    title: '排序',
    key: 'sortOrder',
    width: 160, // ✅ 加宽列
    sorter: true,
    defaultSortOrder: 'ascend', // ✅ 默认升序排序
    render(row) {
      // ✅ 可编辑的排序列
      const isEditing = editingSortOrder.value?.id === Number(row.id);

      if (isEditing) {
        return h('div', { class: 'flex items-center gap-1' }, [
          h(NInputNumber, {
            value: editingSortOrder.value?.value,
            size: 'medium', // ✅ 更大的输入框
            min: 0,
            max: 9999,
            style: 'width: 100px', // ✅ 更宽的输入框
            autofocus: true,
            showButton: false, // ✅ 隐藏 +/- 按钮，更简洁
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
    title: '游戏图标',
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
                '无图片',
              ),
        ],
      );
    },
  },

  {
    title: '游戏类型',
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
    title: '平台名称',
    key: 'platformName',
    width: 150,
    render(row) {
      return row.platform?.platformName || '-';
    },
  },
  {
    title: '游戏名称',
    key: 'gameName',
    width: 200,
    ellipsis: {
      tooltip: true,
    },
  },
  {
    title: '显示ID',
    key: 'gameDisplayId',
    width: 120,
  },
  {
    title: '币种',
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
    title: '状态',
    key: 'isEnabled',
    width: 80,
    render(row) {
      return h(
        NTag,
        {
          type: row.isEnabled ? 'success' : 'error',
          size: 'small',
        },
        { default: () => (row.isEnabled ? '启用' : '禁用') },
      );
    },
  },
  {
    title: '推荐',
    key: 'isRecommended',
    width: 80,
    render(row) {
      // ✅ 推荐开关
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
    title: '操作',
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
                { default: () => '移除' },
              ),
            default: () => '确定要将此游戏从热门中移除吗？',
          },
        ),
      ]);
    },
  },

  {
    title: '创建时间',
    key: 'createdAt',
    width: 180,
    render(row) {
      return new Date(row.createdAt).toLocaleString('zh-CN');
    },
  },
  {
    title: '更新时间',
    key: 'updatedAt',
    width: 180,
    render(row) {
      return new Date(row.updatedAt).toLocaleString('zh-CN');
    },
  },
];

// Note: paginationConfig removed - SmartDataGrid handles pagination internally

// 筛选
const handleFilter = () => {
  paginationReactive.page = 1;
  loadHotGameList();
};

// 重置筛选
const resetFilter = () => {
  filterForm.search = undefined;
  filterForm.platformId = undefined;
  filterForm.currency = undefined;
  filterForm.isEnabled = undefined;
  paginationReactive.page = 1;
  loadHotGameList();
};

// 刷新
const handleRefresh = () => {
  loadHotGameList(true);
};

const handleRemove = async (record: GameItem) => {
  try {
    await toggleGameApi(Number(record.id), { field: 'isHot1', value: false });
    notification.success({
      content: '已从热门中移除',
      duration: 3000,
    });
    loadHotGameList(true);
  } catch (error: any) {
    console.error('移除失败:', error);
    notification.error({
      content: error?.message || '移除失败',
      duration: 3000,
    });
    loadHotGameList(true);
  }
};

// 批量移除
const handleBulkRemove = async (selectedRows: GameItem[]) => {
  if (selectedRows.length === 0) {
    message.warning('请选择要移除的热门游戏');
    return;
  }

  try {
    await Promise.all(
      selectedRows.map((game) =>
        toggleGameApi(Number(game.id), { field: 'isHot1', value: false }),
      ),
    );
    message.success(`成功移除 ${selectedRows.length} 个热门游戏`);
    checkedRowKeys.value = [];
    loadHotGameList(true);
  } catch (error: any) {
    console.error('批量移除失败:', error);
    message.error(error?.message || '批量移除失败');
  }
};

// ✅ 保存排序值 - 即时重新排序
const handleSaveSortOrder = async (row: GameItem) => {
  if (!editingSortOrder.value) return;

  const newSortOrder = editingSortOrder.value.value;
  const oldSortOrder = row.sortOrder;

  // 立即关闭编辑状态
  editingSortOrder.value = null;

  try {
    // 先更新本地数据
    const index = tableData.value.findIndex((g) => g.id === row.id);
    if (index !== -1 && tableData.value[index]) {
      tableData.value[index].sortOrder = newSortOrder;
    }

    // ✅ 即时重新排序本地数据 (升序)
    tableData.value = [...tableData.value].sort((a, b) => {
      const aOrder = a.sortOrder ?? 9999;
      const bOrder = b.sortOrder ?? 9999;
      return aOrder - bOrder; // 升序
    });

    // 调用API保存到服务器
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

    message.success(`排序已更新: ${oldSortOrder} → ${newSortOrder}`);

    console.log(`🔄 [HOT_GAME] Reloading list to reflect updated sortOrder`);
    loadHotGameList(true);
  } catch (error: any) {
    console.error('❌ [HOT_GAME] 更新排序失败:', error);
    message.error(error?.message || '更新排序失败');

    // 如果API失败，恢复原值并重新加载
    loadHotGameList(true);
  }
};

// ✅ 切换推荐状态
const handleToggleRecommended = async (row: GameItem, value: boolean) => {
  try {
    await toggleGameApi(Number(row.id), { field: 'isRecommended', value });

    // 更新本地数据
    const index = tableData.value.findIndex((g) => g.id === row.id);
    if (index !== -1 && tableData.value[index]) {
      tableData.value[index].isRecommended = value;
    }

    message.success(value ? '已设为推荐' : '已取消推荐');
  } catch (error: any) {
    console.error('切换推荐状态失败:', error);
    message.error(error?.message || '切换推荐状态失败');
    // 刷新以恢复原状态
    loadHotGameList(true);
  }
};

// 分页处理
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
  message.info('已清空选择');
};

const selectAll = () => {
  checkedRowKeys.value = tableData.value.map((game) => Number(game.id));
  message.info('已全选');
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
      isHot1: true, // 只显示热门游戏
    };
    if (forceRefresh) params.forceRefresh = true;

    // ✅ 添加排序参数 - 默认按sortOrder升序
    if (sortState.value) {
      params.sortBy = sortState.value.columnKey as string;
      params.sortOrder = sortState.value.order === 'ascend' ? 'asc' : 'desc';
    } else {
      // 默认排序
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
      content: error?.message || '加载数据失败',
      duration: 3000,
    });
  } finally {
    loading.value = false;
  }
};

// 加载选项数据
const loadOptions = async () => {
  try {
    // 加载平台选项
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

// 组件挂载时加载数据
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