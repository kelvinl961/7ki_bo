<template>
  <div class="smart-data-grid" :class="props.class">
    <!-- Header Slot -->
    <div v-if="$slots.header" class="smart-data-grid__header mb-4">
      <slot name="header" />
    </div>

    <!-- Action Bar -->
    <div
      v-if="$slots.actionBar || showDefaultActionBar"
      class="smart-data-grid__action-bar mb-4"
    >
      <n-card
        v-if="showDefaultActionBar && !$slots.actionBar"
        :bordered="false"
        class="rounded-16px shadow-sm"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <!-- Selection Info -->
            <div v-if="props.selectable" class="text-sm text-gray-600">
              已选择 {{ selectedKeys.length }} 条数据，共
              {{ paginationConfig.total }} 条
            </div>

            <!-- Summary Info -->
            <div
              v-if="props.showSummary && props.summary"
              class="flex items-center gap-4 text-sm"
            >
              <span v-if="props.summary.totalCount" class="text-gray-600">
                总计: {{ props.summary.totalCount }} 条
              </span>
              <span v-if="props.summary.totalAmount" class="text-blue-600">
                金额: {{ formatCurrency(props.summary.totalAmount) }}
              </span>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <!-- Auto Refresh -->
            <SmartAutoRefresh
              v-if="props.autoRefresh"
              v-model="autoRefreshEnabled"
              :intervals="props.refreshIntervals"
              :default-interval="props.defaultRefreshInterval"
              :on-refresh="handleRefresh"
              @interval-change="handleRefreshIntervalChange"
            />

            <!-- Manual Refresh -->
            <n-button
              v-if="!props.autoRefresh"
              @click="handleRefresh"
              :loading="props.loading"
            >
              <template #icon>
                <n-icon><ReloadOutline /></n-icon>
              </template>
              刷新
            </n-button>
          </div>
        </div>
      </n-card>

      <!-- Custom Action Bar Slot -->
      <slot
        v-if="$slots.actionBar"
        name="actionBar"
        :selected-count="selectedKeys.length"
        :selected-rows="getSelectedRows()"
      />
    </div>

    <!-- Data Table：横向滚动容器限制在视口内，无需拉到页面最底部即可左右滑动 -->
    <div class="smart-data-grid__scroll-container">
      <n-card
        :bordered="false"
        class="smart-data-grid__table rounded-16px shadow-sm"
      >
        <n-data-table
        ref="tableRef"
        :columns="props.columns"
        :data="props.data"
        :loading="props.loading"
        :pagination="false"
        :row-key="computedRowKey"
        :checked-row-keys="selectedKeys"
        :scroll-x="props.scrollX"
        :striped="props.striped"
        :remote="props.remote"
        :size="props.size"
        :style="tableStyle"
        @update:checked-row-keys="handleSelectionChange"
        @update:page="handlePageChange"
        @update:page-size="handlePageSizeChange"
        @row-click="handleRowClick"
        @row-dblclick="handleRowDblclick"
      >
        <!-- Empty Slot -->
        <template v-if="$slots.empty" #empty>
          <slot name="empty" />
        </template>

        <!-- Loading Slot -->
        <template v-if="$slots.loading" #loading>
          <slot name="loading" />
        </template>
      </n-data-table>
    </n-card>
    </div>
    <div
      class="smart-data-grid__pagination sticky bottom-0 z-10 mt-4 flex justify-end border-t border-gray-100 bg-white py-2"
    >
      <n-pagination v-bind="paginationConfig" />
    </div>
    <!-- Summary Slot -->
    <div
      v-if="$slots.summary && props.showSummary"
      class="smart-data-grid__summary mt-4"
    >
      <slot name="summary" :summary="props.summary || {}" />
    </div>

    <!-- Footer Slot -->
    <div v-if="$slots.footer" class="smart-data-grid__footer mt-4">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts" generic="T extends Record<string, any>">
import { ref, computed, watch, defineExpose, h } from 'vue';
import {
  NCard,
  NDataTable,
  NButton,
  NIcon,
  NPagination,
  useMessage,
} from 'naive-ui';
import { ReloadOutline } from '@vicons/ionicons5';
import SmartAutoRefresh from '../SmartAutoRefresh/index.vue';
import type {
  SmartDataGridProps,
  SmartDataGridEmits,
  SmartDataGridExpose,
  SmartPaginationConfig,
} from './types';
import { DEFAULT_PAGINATION, DEFAULT_PROPS } from './types';

// Props with defaults
const props = withDefaults(defineProps<SmartDataGridProps<T>>(), {
  ...DEFAULT_PROPS,
  pagination: () => ({ ...DEFAULT_PAGINATION }),
});

// Emits
const emit = defineEmits<SmartDataGridEmits<T>>();

// Refs
const tableRef = ref();
const message = useMessage();

// Auto-refresh state
const autoRefreshEnabled = ref(false);

// Internal selected keys state
const selectedKeys = ref<(string | number)[]>([]);

// Watch for external selectedKeys changes
watch(
  () => props.selectedKeys,
  (newKeys) => {
    if (
      newKeys &&
      JSON.stringify(newKeys) !== JSON.stringify(selectedKeys.value)
    ) {
      selectedKeys.value = [...newKeys];
    }
  },
  { immediate: true, deep: true },
);

// Computed pagination config
const paginationConfig = computed(() => {
  const config = {
    ...DEFAULT_PAGINATION,
    ...props.pagination,
  };

  return {
    ...config,
    itemCount: config.total, // Map total to itemCount for Naive UI
    onUpdatePage: (page: number) => handlePageChange(page),
    onUpdatePageSize: (pageSize: number) => handlePageSizeChange(pageSize),
  };
});

// Computed table style
const tableStyle = computed(() => {
  const style: Record<string, any> = {};

  return style;
});

const showDefaultActionBar = computed(() => {
  return props.autoRefresh || props.selectable || props.showSummary;
});

const computedRowKey = computed(() => {
  if (typeof props.rowKey === 'string') {
    return (row: any) => row[props.rowKey as string];
  }
  return props.rowKey;
});

const handlePageChange = (page: number) => {
  emit('update:page', page);
};

const handlePageSizeChange = (pageSize: number) => {
  emit('update:pageSize', pageSize);
};

const handleSelectionChange = (keys: (string | number)[]) => {
  selectedKeys.value = keys;
  emit('update:selectedKeys', keys);
  emit('selectionChange', getSelectedRows(), keys);
};

const handleRowClick = (row: T, index: number) => {
  emit('rowClick', row, index);
};

const handleRowDblclick = (row: T, index: number) => {
  emit('rowDblclick', row, index);
};

const handleRefresh = () => {
  emit('refresh');
};

const handleRefreshIntervalChange = (newInterval: number) => {
  console.log(
    'SmartDataGrid: Refresh interval changed to',
    newInterval,
    'seconds',
  );
};

// Utility functions
const getSelectedRows = (): T[] => {
  if (!props.data || !selectedKeys.value.length) return [];

  const keyField = typeof props.rowKey === 'string' ? props.rowKey : 'id';
  return props.data.filter((row) => {
    const rowKeyValue =
      typeof props.rowKey === 'function' ? props.rowKey(row) : row[keyField];
    return selectedKeys.value.includes(rowKeyValue);
  });
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(amount);
};

// Exposed methods
const refresh = () => {
  handleRefresh();
};

const clearSelection = () => {
  selectedKeys.value = [];
  emit('update:selectedKeys', []);
  emit('selectionChange', [], []);
};

const selectAll = () => {
  if (!props.data) return;

  const allKeys = props.data.map((row) => {
    return typeof props.rowKey === 'function'
      ? props.rowKey(row)
      : row[typeof props.rowKey === 'string' ? props.rowKey : 'id'];
  });

  selectedKeys.value = allKeys;
  emit('update:selectedKeys', allKeys);
  emit('selectionChange', props.data, allKeys);
};

const getSelectedKeys = (): (string | number)[] => {
  return [...selectedKeys.value];
};

const scrollToTop = () => {
  if (tableRef.value) {
    tableRef.value.scrollTo({ top: 0 });
  }
};

const getTableRef = () => {
  return tableRef.value;
};

// Expose methods
const exposedMethods: SmartDataGridExpose<T> = {
  refresh,
  clearSelection,
  selectAll,
  getSelectedRows,
  getSelectedKeys,
  scrollToTop,
  getTableRef,
};

defineExpose(exposedMethods);
</script>

<style scoped>
.smart-data-grid {
  width: 100%;
}

.smart-data-grid__header,
.smart-data-grid__action-bar,
.smart-data-grid__summary,
.smart-data-grid__footer {
  width: 100%;
}

/* 表格+横向滚动限制在视口内，横向滚动条紧贴表格下方，无需滚到页面最底 */
.smart-data-grid__scroll-container {
  width: 100%;
  max-height: min(75vh, 900px);
  overflow: auto;
}

.smart-data-grid__table {
  width: 100%;
  min-width: min-content;
}

/* Ensure table responsiveness */
.smart-data-grid__table :deep(.n-data-table) {
  width: 100%;
}

/* Custom scrollbar for better UX */
.smart-data-grid__table :deep(.n-data-table-wrapper) {
  max-height: calc(
    100vh - 450px
  ); /* adjust 320px based on your header/filters height */
  overflow: auto;

  /* existing scrollbar styles */
  scrollbar-width: thin;
  scrollbar-color: #d1d5db #f3f4f6;
}

.smart-data-grid__table :deep(.n-data-table-wrapper)::-webkit-scrollbar {
  height: 8px;
  width: 8px;
}

.smart-data-grid__table :deep(.n-data-table-wrapper)::-webkit-scrollbar-track {
  background: #f3f4f6;
  border-radius: 4px;
}

.smart-data-grid__table :deep(.n-data-table-wrapper)::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 4px;
}

.smart-data-grid__table
  :deep(.n-data-table-wrapper)::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>
