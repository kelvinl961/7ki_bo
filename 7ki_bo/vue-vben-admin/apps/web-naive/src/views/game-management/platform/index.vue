<template>
  <Page description="" title="">
    <!-- 面包屑导航 -->
    <!--<div class="mb-4">
      <n-breadcrumb>
        <n-breadcrumb-item>游戏管理</n-breadcrumb-item>
        <n-breadcrumb-item>平台管理</n-breadcrumb-item>
      </n-breadcrumb>
    </div>-->

    <!-- 筛选器区域 -->
    <n-card class="mb-4">
      <div class="flex flex-wrap items-end gap-4">
        <!-- 游戏类型筛选 -->
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium">游戏类型</label>
          <n-select
            v-model:value="filterForm.gameType"
            placeholder="选择游戏类型"
            clearable
            style="width: 160px"
            :options="gameTypeOptions"
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

        <!-- 平台状态筛选 -->
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium">平台状态</label>
          <n-select
            v-model:value="filterForm.isEnabled"
            placeholder="选择状态"
            clearable
            style="width: 140px"
            :options="statusOptions"
            @update:value="handleFilter"
          />
        </div>

        <!-- 搜索框 -->
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium">搜索</label>
          <div class="flex gap-2">
            <n-input
              v-model:value="searchInput"
              placeholder="搜索平台ID、平台名称..."
              style="width: 240px"
              clearable
              @keyup.enter="handleFilter"
            />
            <n-button type="primary" @click="handleFilter"> 搜索 </n-button>
            <n-button @click="resetFilter"> 重置 </n-button>
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
      :row-key="(row: GamePlatformItem) => Number(row.id)"
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
              <!-- 主要操作按钮 -->
              <div class="flex gap-2">
                <n-button type="primary" @click="handleCreate">
                  新增平台
                </n-button>
                <n-button type="info" @click="handleOpenPublicConfig">
                  游戏公共配置
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
              <!-- <n-button 
                v-if="selectedCount > 0" 
                type="error" 
                size="small"
                @click="handleBulkDelete(selectedRows)"
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
    <n-modal
      v-model:show="showModal"
      :title="editingPlatform ? '编辑平台' : '新增平台'"
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
        <n-form-item label="平台ID" path="platformId">
          <n-input
            v-model:value="formData.platformId"
            placeholder="请输入平台ID"
            :disabled="!!editingPlatform"
          />
        </n-form-item>

        <n-form-item label="平台名称" path="platformName">
          <n-input
            v-model:value="formData.platformName"
            placeholder="请输入平台名称"
          />
        </n-form-item>

        <n-form-item label="游戏类型" path="gameType">
          <n-select
            v-model:value="formData.gameType"
            placeholder="选择游戏类型"
            :options="gameTypeOptions"
          />
        </n-form-item>

        <n-form-item label="币种" path="currency">
          <n-select
            v-model:value="formData.currency"
            placeholder="选择币种"
            :options="currencyOptions"
          />
        </n-form-item>

        <n-form-item label="最低准入" path="minEntryAmount">
          <n-input-number
            v-model:value="formData.minEntryAmount"
            placeholder="请输入最低准入金额"
            :min="0"
            :precision="2"
            style="width: 100%"
          />
        </n-form-item>

        <n-form-item label="排序" path="sortOrder">
          <n-input-number
            v-model:value="formData.sortOrder"
            placeholder="请输入排序值"
            :min="0"
            style="width: 100%"
          />
        </n-form-item>

        <n-form-item label="Logo图片">
          <MediaLibrarySelector
            v-model="formData.logoUrl"
            category="platforms"
            :accept-types="['image']"
            placeholder="从媒体库选择或上传平台Logo"
            @file-selected="handleLogoSelected"
          />
        </n-form-item>

        <n-form-item label="平台图片">
          <MediaLibrarySelector
            v-model="formData.imageUrl"
            category="platforms"
            :accept-types="['image']"
            placeholder="从媒体库选择或上传平台图片"
            @file-selected="handleImageSelected"
          />
        </n-form-item>

        <n-form-item label="备注" path="remark">
          <n-input
            v-model:value="formData.remark"
            placeholder="请输入备注"
            type="textarea"
            :rows="3"
          />
        </n-form-item>

        <div class="grid grid-cols-2 gap-4">
          <n-form-item label="热门一">
            <n-switch v-model:value="formData.isHot" />
          </n-form-item>

          <n-form-item label="热门二">
            <n-switch v-model:value="formData.isFeatured" />
          </n-form-item>

          <n-form-item label="平台开关">
            <n-switch v-model:value="formData.isEnabled" />
          </n-form-item>

          <n-form-item label="展示给主播">
            <n-switch v-model:value="formData.showToStreamer" />
          </n-form-item>
        </div>
      </n-form>

      <template #action>
        <div class="flex justify-end gap-2">
          <n-button @click="showModal = false">取消</n-button>
          <n-button type="primary" @click="handleSubmit" :loading="submitting">
            {{ editingPlatform ? '更新' : '创建' }}
          </n-button>
        </div>
      </template>
    </n-modal>

    <!-- Game Public Config Modal -->
    <GamePublicConfigModal v-model:show="showPublicConfigModal" />
  </Page>
</template>

<script lang="ts" setup>
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
const MediaLibrarySelector = defineAsyncComponent(
  () => import('#/components/MediaLibrarySelector.vue'),
);
const GamePublicConfigModal = defineAsyncComponent(
  () => import('./GamePublicConfigModal.vue'),
);

// 响应式数据
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

// 分页信息 (simplified for SmartDataGrid)
const paginationReactive = reactive({
  page: 1,
  pageSize: 20,
  total: 0,
});

// 筛选表单
// 🔍 FIX: Auto-trim search input
const { value: searchInput, trimmed: searchQuery } = useTrimmedSearch('');

const filterForm = reactive({
  gameType: undefined as string | undefined,
  currency: undefined as string | undefined,
  isEnabled: undefined as boolean | undefined,
});

// 表单数据
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
  remark: '',
});

// 选项数据 - 使用英文枚举值，显示中文标签
const gameTypeOptions = [
  { label: '真人', value: 'LIVE' },
  { label: '电子', value: 'SLOT' },
  { label: '体育', value: 'SPORTS' },
  { label: '彩票', value: 'LOTTERY' },
  { label: '棋牌', value: 'CHESS_CARDS' },
  { label: '电竞', value: 'ESPORTS' },
  { label: '捕鱼', value: 'HUNTING' },
  { label: '街机', value: 'ARCADE' },
  { label: '模拟', value: 'SIMULATION' },
  { label: '斗鸡', value: 'COCKFIGHT' },
  { label: '区块链', value: 'BLOCKCHAIN' },
];

const currencyOptions = [
  { label: 'BRL', value: 'BRL' },
  { label: 'USD', value: 'USD' },
  { label: 'EUR', value: 'EUR' },
];

const statusOptions = [
  { label: '启用', value: true },
  { label: '禁用', value: false },
] as const;

// 表单验证规则
const formRules: FormRules = {
  platformId: [
    { required: true, message: '请输入平台ID', trigger: 'blur' },
    { min: 2, max: 20, message: '平台ID长度为2-20个字符', trigger: 'blur' },
  ],
  platformName: [
    { required: true, message: '请输入平台名称', trigger: 'blur' },
    { min: 2, max: 50, message: '平台名称长度为2-50个字符', trigger: 'blur' },
  ],
  gameType: [
    { required: true, message: '请选择游戏类型', trigger: ['blur', 'change'] },
  ],
  currency: [
    { required: true, message: '请选择币种', trigger: ['blur', 'change'] },
  ],
};

// 格式化日期
const formatDate = (date: string | Date | null) => {
  if (!date) return '-';
  return new Date(date).toLocaleString('zh-CN');
};

// 表格列配置
const columns: DataTableColumns<GamePlatformItem> = [
  { type: 'selection' },
  {
    title: '排序',
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
          { default: () => '置顶' },
        ),
      ]);
    },
  },
  { title: '平台ID', key: 'platformId', width: 120 },
  { title: '平台名称', key: 'platformName', width: 180 },
  {
    title: 'Logo',
    key: 'logoUrl',
    width: 80,
    render(row) {
      if (row.logoUrl) {
        return h('div', { class: 'image-container' }, [
          h(NImage, {
            src: row.logoUrl,
            alt: '平台Logo',
            width: 40,
            height: 40,
            objectFit: 'cover',
            class: 'table-logo',
            fallbackSrc: '/placeholder-logo.png',
          }),
        ]);
      }
      return h('span', { class: 'text-gray-400' }, '无Logo');
    },
  },
  {
    title: '游戏类型',
    key: 'gameType',
    width: 100,
    render(row) {
      // Convert English game type to Chinese for display
      const getChineseGameType = (englishType: string) => {
        const typeMap: Record<string, string> = {
          LIVE: '真人',
          SLOT: '电子',
          SPORTS: '体育',
          LOTTERY: '彩票',
          CHESS_CARDS: '棋牌',
          ESPORTS: '电竞',
          HUNTING: '捕鱼',
          ARCADE: '街机',
          SIMULATION: '模拟',
          COCKFIGHT: '斗鸡',
        };
        return typeMap[englishType] || englishType;
      };

      return h(
        NTag,
        { type: 'info', size: 'small' },
        {
          default: () => getChineseGameType(row.gameType),
        },
      );
    },
  },
  { title: '币种', key: 'currency', width: 80 },
  {
    title: '平台图片',
    key: 'imageUrl',
    width: 100,
    render(row) {
      if (row.imageUrl) {
        return h('div', { class: 'image-container' }, [
          h(NImage, {
            src: row.imageUrl,
            alt: '平台图片',
            width: 60,
            height: 40,
            objectFit: 'cover',
            class: 'table-image',
            fallbackSrc: '/placeholder-image.png',
          }),
        ]);
      }
      return h('span', { class: 'text-gray-400' }, '无图片');
    },
  },
  {
    title: '热门一',
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
    title: '热门二',
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
    title: '平台开关',
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
    title: '展示给主播',
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
    title: '子游戏数量',
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
    title: '最低准入',
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
    title: '创建时间',
    key: 'createdAt',
    width: 160,
    render(row) {
      return formatDate(row.createdAt);
    },
  },
  {
    title: '操作',
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
          { default: () => '编辑' },
        ),
        h(
          NButton,
          {
            size: 'small',
            quaternary: true,
            type: 'info',
            onClick: () => handleManageGames(row),
          },
          { default: () => '管理' },
        ),
      ]);
    },
  },
];

// Note: paginationConfig removed - SmartDataGrid handles pagination internally

// 筛选
const handleFilter = () => {
  paginationReactive.page = 1;
  loadPlatformList();
};

// 重置筛选
const resetFilter = () => {
  filterForm.gameType = undefined;
  filterForm.currency = undefined;
  filterForm.isEnabled = undefined;
  searchInput.value = ''; // 🔍 FIX: Reset search input
  paginationReactive.page = 1;
  loadPlatformList();
};

// 刷新
const handleRefresh = () => {
  loadPlatformList();
};

// 新增平台
const handleCreate = () => {
  editingPlatform.value = null;
  resetForm();
  showModal.value = true;
};

// 打开游戏公共配置
const handleOpenPublicConfig = () => {
  showPublicConfigModal.value = true;
};

// 编辑平台
const handleEdit = (record: GamePlatformItem) => {
  editingPlatform.value = record;
  formData.platformId = record.platformId;
  formData.platformName = record.platformName;
  // Convert Chinese game type back to English for form editing
  const getEnglishGameType = (chineseType: string) => {
    const typeMap: Record<string, string> = {
      真人: 'LIVE',
      电子: 'SLOT',
      体育: 'SPORTS',
      彩票: 'LOTTERY',
      棋牌: 'CHESS_CARDS',
      电竞: 'ESPORTS',
      捕鱼: 'HUNTING',
      街机: 'ARCADE',
      模拟: 'SIMULATION',
      斗鸡: 'COCKFIGHT',
    };
    return typeMap[chineseType] || chineseType;
  };

  formData.gameType = getEnglishGameType(record.gameType);
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
  formData.logoUrl = record.logoUrl || '';
  formData.remark = record.remark || '';

  // Reset image upload state for editing
  imagePreview.value = '';

  showModal.value = true;
};

// 删除平台
const handleDelete = async (record: GamePlatformItem) => {
  try {
    await deleteGamePlatformApi(record.id);
    notification.success({
      content: '删除成功',
      duration: 3000,
    });
    loadPlatformList();
  } catch (error) {
    console.error('删除失败:', error);
    notification.error({
      content: '删除失败',
      duration: 3000,
    });
  }
};

// 批量删除
const handleBulkDelete = async (selectedRows: GamePlatformItem[]) => {
  if (selectedRows.length === 0) {
    message.warning('请选择要删除的平台');
    return;
  }

  try {
    const platformIds = selectedRows.map((platform) => Number(platform.id));
    await bulkDeleteGamePlatformsApi(platformIds);
    message.success(`已成功删除 ${selectedRows.length} 个平台`);
    checkedRowKeys.value = [];
    loadPlatformList();
  } catch (error) {
    console.error('批量删除失败:', error);
    message.error('批量删除失败，请重试');
  }
};

// 切换状态
const handleToggle = async (
  record: GamePlatformItem,
  field: string,
  value: boolean,
) => {
  try {
    await toggleGamePlatformApi(record.id, { field: field as any, value });
    // 更新本地数据
    const index = tableData.value.findIndex((item) => item.id === record.id);
    if (index !== -1) {
      (tableData.value[index] as any)[field] = value;
    }
    notification.success({
      content: '状态更新成功',
      duration: 2000,
    });
  } catch (error) {
    console.error('状态更新失败:', error);
    notification.error({
      content: '状态更新失败',
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

// Handle logo selected from MediaLibrarySelector
const handleLogoSelected = (file: any) => {
  if (file) {
    formData.logoUrl = file.url;
  }
};

// 置顶
const handleSetTop = async (record: GamePlatformItem) => {
  try {
    await setGamePlatformTopApi(record.id);
    notification.success({
      content: '置顶成功',
      duration: 2000,
    });
    loadPlatformList();
  } catch (error) {
    console.error('置顶失败:', error);
    notification.error({
      content: '置顶失败',
      duration: 3000,
    });
  }
};

// 管理子游戏
const handleManageGames = (record: GamePlatformItem) => {
  emit('manage-subgames', record.id);
};

// 提交表单
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
      remark: formData.remark || undefined,
    };

    let platformResult: any;

    if (editingPlatform.value) {
      platformResult = await updateGamePlatformApi(
        editingPlatform.value.id,
        data,
      );
      notification.success({
        content: '更新成功',
        duration: 3000,
      });
    } else {
      platformResult = await createGamePlatformApi(data);
      notification.success({
        content: '创建成功',
        duration: 3000,
      });
    }

    // Images are now handled through MediaLibrarySelector, no separate upload needed

    showModal.value = false;
    loadPlatformList();
  } catch (error) {
    console.error('操作失败:', error);
    notification.error({
      content: '操作失败',
      duration: 3000,
    });
  } finally {
    submitting.value = false;
  }
};

// 重置表单
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
  formData.logoUrl = '';
  formData.remark = '';

  // Reset image preview state
  imagePreview.value = '';

  if (formRef.value) {
    formRef.value.restoreValidation();
  }
};

// 分页变化
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
  message.info('已清空选择');
};

const selectAll = () => {
  checkedRowKeys.value = tableData.value.map((platform) => Number(platform.id));
  message.info('已全选');
};

// 加载平台列表
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
      content: '加载数据失败',
      duration: 3000,
    });
  } finally {
    loading.value = false;
  }
};

// 组件挂载时加载数据
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
