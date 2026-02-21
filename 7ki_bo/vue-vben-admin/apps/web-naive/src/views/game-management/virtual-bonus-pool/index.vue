<template>
  <div class="min-h-full bg-gray-50 p-6">
    <!-- Page Header -->
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="mb-2 text-2xl font-semibold text-gray-900">虚拟彩金池</h1>
          <p class="text-gray-600">管理各个游戏或区域的虚拟彩金池配置</p>
        </div>
        <div class="flex gap-3">
          <n-button type="primary" @click="handleAdd"> 新增 </n-button>
          <n-button
            type="default"
            @click="handleBulkConfig"
            :disabled="!hasSelectedRows"
          >
            批量修改配置
          </n-button>
        </div>
      </div>
    </div>

    <!-- Filter Section -->
    <n-card class="mb-4">
      <div class="flex flex-wrap items-end gap-4">
        <!-- 虚拟彩金池ID -->
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium">虚拟彩金池ID</label>
          <n-input
            v-model:value="filterForm.poolId"
            placeholder="输入虚拟彩金池ID"
            clearable
            style="width: 180px"
            @keyup.enter="handleFilter"
          />
        </div>

        <!-- 展示形式 -->
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium">展示形式</label>
          <n-select
            v-model:value="filterForm.displayType"
            placeholder="选择展示形式"
            clearable
            style="width: 160px"
            :options="displayTypeOptions"
            @update:value="handleFilter"
          />
        </div>

        <!-- 状态 -->
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium">状态</label>
          <n-select
            v-model:value="filterForm.status"
            placeholder="选择状态"
            clearable
            style="width: 120px"
            :options="statusOptions"
            @update:value="handleFilter"
          />
        </div>

        <!-- 操作按钮 -->
        <div class="flex gap-2">
          <n-button type="primary" @click="handleFilter"> 搜索 </n-button>
          <n-button @click="handleReset"> 重置 </n-button>
        </div>
      </div>
    </n-card>

    <!-- Table Section -->
    <n-card>
      <!-- Bulk Operations -->
      <div
        v-if="hasSelectedRows"
        class="mb-4 flex items-center justify-between rounded-lg bg-blue-50 p-3"
      >
        <div class="flex items-center gap-2">
          <n-checkbox
            :checked="isAllSelected"
            :indeterminate="isIndeterminate"
            @update:checked="handleSelectAll"
          >
            全选当前页
          </n-checkbox>
          <span class="text-sm text-gray-600"
            >已选择 {{ selectedRows.length }} 项</span
          >
        </div>
        <n-dropdown :options="bulkActions" @select="handleBulkAction">
          <n-button size="small"> 批量操作 </n-button>
        </n-dropdown>
      </div>

      <!-- Data Table -->
      <n-data-table
        ref="tableRef"
        :columns="columns"
        :data="tableData"
        :loading="loading"
        :pagination="paginationReactive"
        :row-key="(row: VirtualBonusPool) => row.id"
        :checked-row-keys="selectedRowKeys"
        @update:checked-row-keys="handleCheck"
        @update:sorter="handleSorterChange"
        striped
        remote
      />
    </n-card>

    <!-- Add/Edit Dialog -->
    <n-modal
      v-model:show="showModal"
      preset="dialog"
      :title="modalTitle"
      style="width: 900px; max-width: 95vw"
    >
      <VirtualBonusPoolForm
        :data="editingItem"
        :mode="modalMode"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
    </n-modal>

    <!-- Detail Modal -->
    <n-modal
      v-model:show="showDetailModal"
      preset="card"
      title="虚拟彩金池详情"
      size="large"
      :bordered="false"
      :segmented="{ content: 'soft', footer: 'soft' }"
      style="width: 700px"
    >
      <VirtualBonusPoolDetail :data="detailData" />
      <template #footer>
        <div class="flex justify-end">
          <n-button @click="showDetailModal = false">关闭</n-button>
        </div>
      </template>
    </n-modal>

    <!-- Bulk Config Modal -->
    <n-modal
      v-model:show="showBulkModal"
      preset="card"
      title="批量修改配置"
      size="large"
      :bordered="false"
      :segmented="{ content: 'soft', footer: 'soft' }"
      style="width: 600px"
    >
      <VirtualBonusPoolBulkForm
        :selected-items="selectedItems"
        @submit="handleBulkSubmit"
        @cancel="showBulkModal = false"
      />
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, h } from 'vue';
import {
  NCard,
  NButton,
  NInput,
  NSelect,
  NDataTable,
  NModal,
  NCheckbox,
  NDropdown,
  NSwitch,
  NTag,
  NSpace,
  useMessage,
  type DataTableColumns,
  type DataTableSortState,
  type PaginationProps,
} from 'naive-ui';

// ✅ PERFORMANCE FIX: Lazy load modal components - they only load when modals are opened
import { defineAsyncComponent } from 'vue';
const VirtualBonusPoolForm = defineAsyncComponent(
  () => import('./components/VirtualBonusPoolForm.vue'),
);
const VirtualBonusPoolDetail = defineAsyncComponent(
  () => import('./components/VirtualBonusPoolDetail.vue'),
);
const VirtualBonusPoolBulkForm = defineAsyncComponent(
  () => import('./components/VirtualBonusPoolBulkForm.vue'),
);
import {
  getVirtualBonusPools,
  createVirtualBonusPool,
  updateVirtualBonusPool,
  deleteVirtualBonusPool,
  toggleVirtualBonusPoolStatus,
  bulkDeleteVirtualBonusPools,
  bulkUpdateVirtualBonusPools,
  type VirtualBonusPool,
} from '#/api/virtualBonusPool';

// Types (VirtualBonusPool is imported from API)

// Message instance
const message = useMessage();

// Reactive data
const loading = ref(false);
const tableData = ref<VirtualBonusPool[]>([]);
const selectedRowKeys = ref<number[]>([]);
const showModal = ref(false);
const showDetailModal = ref(false);
const showBulkModal = ref(false);
const editingItem = ref<VirtualBonusPool | null>(null);
const detailData = ref<VirtualBonusPool | null>(null);
const modalMode = ref<'add' | 'edit'>('add');

// Filter form
const filterForm = reactive({
  poolId: '',
  displayType: '',
  status: undefined as string | undefined,
});

// Pagination
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
});

const paginationReactive = computed<PaginationProps>(() => ({
  ...pagination,
  showSizePicker: true,
  pageSizes: [10, 20, 50, 100],
  onChange: (page: number) => {
    pagination.page = page;
    loadData();
  },
  onUpdatePageSize: (pageSize: number) => {
    pagination.pageSize = pageSize;
    pagination.page = 1;
    loadData();
  },
}));

// Options
const displayTypeOptions = [
  { label: '单独模块', value: 'single' },
  { label: '多个馆馆', value: 'multiple' },
];

const statusOptions = [
  { label: '启用', value: 'true' },
  { label: '禁用', value: 'false' },
];

const numberStyleOptions = [
  { label: '样式一', value: 'style1' },
  { label: '样式二', value: 'style2' },
  { label: '样式三', value: 'style3' },
];

const backgroundStyleOptions = [
  { label: '样式一', value: 'style1' },
  { label: '样式二', value: 'style2' },
  { label: '样式三', value: 'style3' },
];

// Computed
const selectedRows = computed(() =>
  tableData.value.filter((item) => selectedRowKeys.value.includes(item.id)),
);

const selectedItems = computed(() => selectedRows.value);

const hasSelectedRows = computed(() => selectedRowKeys.value.length > 0);

const isAllSelected = computed(
  () =>
    tableData.value.length > 0 &&
    selectedRowKeys.value.length === tableData.value.length,
);

const isIndeterminate = computed(
  () =>
    selectedRowKeys.value.length > 0 &&
    selectedRowKeys.value.length < tableData.value.length,
);

const modalTitle = computed(() =>
  modalMode.value === 'add' ? '新增' : '修改',
);

// Bulk actions
const bulkActions = [
  {
    label: '批量启用',
    key: 'enable',
  },
  {
    label: '批量禁用',
    key: 'disable',
  },
  {
    label: '批量删除',
    key: 'delete',
  },
];

// Table columns
const columns: DataTableColumns<VirtualBonusPool> = [
  {
    type: 'selection',
    width: 50,
  },
  {
    title: 'ID',
    key: 'id',
    width: 80,
    sorter: true,
  },
  {
    title: '币种',
    key: 'currency',
    width: 100,
    render: (row) =>
      h(NTag, { type: 'info', size: 'small' }, { default: () => row.currency }),
  },
  {
    title: '展示形式',
    key: 'displayType',
    width: 120,
    render: (row) => {
      const option = displayTypeOptions.find(
        (opt) => opt.value === row.displayType,
      );
      return option?.label || row.displayType;
    },
  },
  {
    title: '展示位置',
    key: 'displayPosition',
    width: 120,
    render: (row) => {
      if (
        typeof row.displayPosition === 'object' &&
        row.displayPosition !== null
      ) {
        // If it's an object, try to extract meaningful values
        const pos = row.displayPosition as any;
        if (pos.x !== undefined && pos.y !== undefined) {
          return `x:${pos.x}, y:${pos.y}`;
        }
        return JSON.stringify(pos);
      }
      return row.displayPosition || '-';
    },
  },
  {
    title: '点击跳转位置',
    key: 'clickTarget',
    width: 140,
    ellipsis: {
      tooltip: true,
    },
  },
  {
    title: '最大展示金额',
    key: 'maxAmount',
    width: 130,
    render: (row) => {
      try {
        // Handle Prisma Decimal objects
        const amount =
          typeof row.maxAmount === 'object' && row.maxAmount !== null
            ? parseFloat((row.maxAmount as any).toString())
            : parseFloat(String(row.maxAmount));
        return isNaN(amount) ? '-' : amount.toLocaleString();
      } catch (error) {
        console.warn('Error formatting maxAmount:', row.maxAmount, error);
        return row.maxAmount?.toString() || '-';
      }
    },
    sorter: true,
  },
  {
    title: '最小展示金额',
    key: 'minAmount',
    width: 130,
    render: (row) => {
      try {
        // Handle Prisma Decimal objects
        const amount =
          typeof row.minAmount === 'object' && row.minAmount !== null
            ? parseFloat((row.minAmount as any).toString())
            : parseFloat(String(row.minAmount));
        return isNaN(amount) ? '-' : amount.toLocaleString();
      } catch (error) {
        console.warn('Error formatting minAmount:', row.minAmount, error);
        return row.minAmount?.toString() || '-';
      }
    },
    sorter: true,
  },
  {
    title: '小数点位数',
    key: 'decimalPlaces',
    width: 110,
    align: 'center',
  },
  {
    title: '金额数字样式',
    key: 'numberStyle',
    width: 130,
    render: (row) => {
      if (!row.numberStyle) return '-';

      // Check if it's a URL (image)
      if (row.numberStyle.startsWith('http') || row.numberStyle.includes('/')) {
        return h('div', { class: 'flex items-center justify-center' }, [
          h('img', {
            src: row.numberStyle,
            alt: '数字样式',
            class: 'w-12 h-8 object-cover rounded border',
            style: 'max-width: 48px; max-height: 32px;',
            onError: (e: Event) => {
              const target = e.target as HTMLImageElement;
              if (target) {
                target.style.display = 'none';
                const nextElement = target.nextElementSibling as HTMLElement;
                if (nextElement) {
                  nextElement.style.display = 'inline';
                }
              }
            },
          }),
          h(
            'span',
            {
              style: 'display: none;',
              class: 'text-xs text-gray-500',
            },
            '加载失败',
          ),
        ]);
      }

      // Check if it's a preset style
      const option = numberStyleOptions.find(
        (opt) => opt.value === row.numberStyle,
      );
      return option?.label || row.numberStyle;
    },
  },
  {
    title: '背景风格',
    key: 'backgroundStyle',
    width: 100,
    render: (row) => {
      if (!row.backgroundStyle) return '-';

      // Check if it's a URL (image)
      if (
        row.backgroundStyle.startsWith('http') ||
        row.backgroundStyle.includes('/')
      ) {
        return h('div', { class: 'flex items-center justify-center' }, [
          h('img', {
            src: row.backgroundStyle,
            alt: '背景风格',
            class: 'w-16 h-10 object-cover rounded border',
            style: 'max-width: 64px; max-height: 40px;',
            onError: (e: Event) => {
              const target = e.target as HTMLImageElement;
              if (target) {
                target.style.display = 'none';
                const nextElement = target.nextElementSibling as HTMLElement;
                if (nextElement) {
                  nextElement.style.display = 'inline';
                }
              }
            },
          }),
          h(
            'span',
            {
              style: 'display: none;',
              class: 'text-xs text-gray-500',
            },
            '加载失败',
          ),
        ]);
      }

      // Check if it's a preset style
      const option = backgroundStyleOptions.find(
        (opt) => opt.value === row.backgroundStyle,
      );
      return option?.label || row.backgroundStyle;
    },
  },
  {
    title: '状态',
    key: 'status',
    width: 80,
    align: 'center',
    render: (row) =>
      h(NSwitch, {
        value: row.status,
        onUpdateValue: (value: boolean) => handleStatusChange(row.id, value),
      }),
  },
  {
    title: '备注',
    key: 'remark',
    width: 150,
    ellipsis: {
      tooltip: true,
    },
  },
  {
    title: '操作人',
    key: 'operator',
    width: 100,
  },
  {
    title: '操作时间',
    key: 'operationTime',
    width: 160,
    render: (row) => new Date(row.operationTime).toLocaleString('zh-CN'),
    sorter: true,
  },
  {
    title: '操作',
    key: 'actions',
    width: 200,
    align: 'center',
    fixed: 'right',
    render: (row) =>
      h(
        NSpace,
        { size: 'small' },
        {
          default: () => [
            h(
              NButton,
              {
                size: 'small',
                type: 'primary',
                secondary: true,
                onClick: () => handleEdit(row),
              },
              { default: () => '修改' },
            ),
            h(
              NButton,
              {
                size: 'small',
                type: 'info',
                secondary: true,
                onClick: () => handleDetail(row),
              },
              { default: () => '详情' },
            ),
            h(
              NButton,
              {
                size: 'small',
                type: 'error',
                secondary: true,
                onClick: () => handleDelete(row),
              },
              { default: () => '删除' },
            ),
          ],
        },
      ),
  },
];

// Methods
const loadData = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      poolId: filterForm.poolId || undefined,
      displayType: filterForm.displayType || undefined,
      status:
        filterForm.status === 'true'
          ? true
          : filterForm.status === 'false'
            ? false
            : undefined,
    };

    const response = await getVirtualBonusPools(params);
    console.log('API Response:', response);

    // Handle both old and new API response formats
    if (response.data && Array.isArray(response.data)) {
      // New format: {success: true, data: [...], total: number, page: number, pageSize: number}
      tableData.value = response.data;
      pagination.total = response.total || 0;
    } else if (response && Array.isArray(response)) {
      // Old format: direct array response
      tableData.value = response;
      pagination.total = response.length;
    } else {
      // Fallback
      tableData.value = [];
      pagination.total = 0;
    }

    console.log('Table data set to:', tableData.value);
    console.log('Pagination total set to:', pagination.total);
  } catch (error) {
    message.error('加载数据失败');
    console.error('Failed to load data:', error);
    tableData.value = [];
    pagination.total = 0;
  } finally {
    loading.value = false;
  }
};

const handleFilter = () => {
  pagination.page = 1;
  loadData();
};

const handleReset = () => {
  Object.assign(filterForm, {
    poolId: '',
    displayType: '',
    status: undefined as string | undefined,
  });
  handleFilter();
};

const handleCheck = (rowKeys: (string | number)[]) => {
  selectedRowKeys.value = rowKeys.map((key) =>
    typeof key === 'string' ? parseInt(key) : key,
  );
};

const handleSelectAll = (checked: boolean) => {
  if (checked) {
    selectedRowKeys.value = tableData.value.map((row) => row.id);
  } else {
    selectedRowKeys.value = [];
  }
};

const handleSorterChange = (sorter: DataTableSortState) => {
  console.log('Sort changed:', sorter);
  // Implement sorting logic here
};

const handleAdd = () => {
  modalMode.value = 'add';
  editingItem.value = null;
  showModal.value = true;
};

const handleEdit = (row: VirtualBonusPool) => {
  modalMode.value = 'edit';
  editingItem.value = { ...row };
  showModal.value = true;
};

const handleDetail = (row: VirtualBonusPool) => {
  detailData.value = row;
  showDetailModal.value = true;
};

const handleDelete = async (row: VirtualBonusPool) => {
  const dialog = window.confirm(`确认删除虚拟彩金池 "${row.id}" 吗？`);
  if (dialog) {
    try {
      await deleteVirtualBonusPool(row.id);
      message.success('删除成功');
      loadData(); // Refresh the data
    } catch (error) {
      message.error('删除失败');
      console.error('Delete error:', error);
    }
  }
};

const handleStatusChange = async (id: number, status: boolean) => {
  try {
    await toggleVirtualBonusPoolStatus(id);
    // Update local data
    const item = tableData.value.find((item) => item.id === id);
    if (item) {
      item.status = status;
    }
    message.success(`${status ? '启用' : '禁用'}成功`);
  } catch (error) {
    message.error('状态更新失败');
    console.error('Status change error:', error);
    // Revert the status change
    const item = tableData.value.find((item) => item.id === id);
    if (item) {
      item.status = !status;
    }
  }
};

const handleSubmit = async (data: any) => {
  try {
    if (modalMode.value === 'add') {
      await createVirtualBonusPool(data);
      message.success('新增成功');
    } else {
      await updateVirtualBonusPool(editingItem.value!.id, data);
      message.success('修改成功');
    }
    showModal.value = false;
    loadData(); // Refresh the data
  } catch (error) {
    message.error(modalMode.value === 'add' ? '新增失败' : '修改失败');
    console.error('Submit error:', error);
  }
};

const handleCancel = () => {
  showModal.value = false;
  editingItem.value = null;
};

const handleBulkConfig = () => {
  showBulkModal.value = true;
};

const handleBulkAction = async (key: string) => {
  console.log('Bulk action:', key, selectedRows.value);
  try {
    switch (key) {
      case 'enable':
        await bulkUpdateVirtualBonusPools({
          ids: selectedRowKeys.value,
          updates: { status: true },
        });
        message.success('批量启用成功');
        break;
      case 'disable':
        await bulkUpdateVirtualBonusPools({
          ids: selectedRowKeys.value,
          updates: { status: false },
        });
        message.success('批量禁用成功');
        break;
      case 'delete':
        const confirmed = window.confirm(
          `确认删除选中的 ${selectedRows.value.length} 项吗？`,
        );
        if (confirmed) {
          await bulkDeleteVirtualBonusPools(selectedRowKeys.value);
          message.success('批量删除成功');
          selectedRowKeys.value = [];
        }
        break;
    }
    loadData(); // Refresh the data
  } catch (error) {
    message.error('批量操作失败');
    console.error('Bulk action error:', error);
  }
};

const handleBulkSubmit = async (data: any) => {
  try {
    await bulkUpdateVirtualBonusPools({
      ids: selectedRowKeys.value,
      updates: data,
    });
    message.success('批量修改成功');
    showBulkModal.value = false;
    selectedRowKeys.value = [];
    loadData(); // Refresh the data
  } catch (error) {
    message.error('批量修改失败');
    console.error('Bulk submit error:', error);
  }
};

// Lifecycle
onMounted(() => {
  loadData();
});
</script>

<style scoped>
.n-data-table :deep(.n-data-table-th) {
  background-color: #fafafa;
  font-weight: 600;
}

.n-data-table :deep(.n-data-table-td) {
  border-bottom: 1px solid #f0f0f0;
}

/* Status switch styling */
.n-switch {
  --n-rail-height: 20px;
  --n-rail-width: 40px;
  --n-button-width: 16px;
  --n-button-height: 16px;
}
</style>
