<template>
  <Page
    description="子游戏管理页面"
    title="子游戏管理"
  >
    <!-- 面包屑导航 -->
    <div class="mb-4">
      <n-breadcrumb>
        <n-breadcrumb-item>游戏管理</n-breadcrumb-item>
        <n-breadcrumb-item>子游戏管理</n-breadcrumb-item>
      </n-breadcrumb>
    </div>

    <!-- 筛选器区域 -->
    <n-card class="mb-4">
      <div class="flex flex-wrap gap-4 items-end">
        <!-- 游戏厂商筛选 -->
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium">游戏厂商</label>
          <n-select
            v-model:value="filterForm.vendor"
            placeholder="选择游戏厂商"
            clearable
            style="width: 160px"
            :options="vendorOptions"
            @update:value="handleVendorChange"
          />
        </div>

        <!-- 游戏类型筛选 -->
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium">游戏类型</label>
          <n-select
            v-model:value="filterForm.gameType"
            placeholder="选择游戏类型"
            clearable
            style="width: 140px"
            :options="gameTypeFilterOptions"
            @update:value="handleGameTypeChange"
          />
        </div>

        <!-- 平台筛选 -->
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium">平台名称</label>
          <n-select
            v-model:value="filterForm.platformId"
            placeholder="选择平台"
            clearable
            style="width: 200px"
            :options="filteredPlatformOptions"
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

        <!-- 游戏状态筛选 -->
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium">游戏状态</label>
          <n-select
            v-model:value="filterForm.isEnabled"
            placeholder="选择状态"
            clearable
            style="width: 140px"
            :options="statusOptions"
            @update:value="handleFilter"
          />
        </div>

        <!-- 热门筛选 -->
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium">热门标识</label>
          <n-select
            v-model:value="filterForm.hotType"
            placeholder="选择热门类型"
            clearable
            style="width: 160px"
            :options="hotTypeOptions"
            @update:value="handleFilter"
          />
        </div>

        <!-- 搜索框 -->
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium">搜索</label>
          <div class="flex gap-2">
            <n-input
              v-model:value="filterForm.search"
              placeholder="搜索游戏ID、游戏名称..."
              style="width: 240px"
              @input="handleSearchInput"
              @keyup.enter="handleFilter"
            />
            <n-button type="primary" @click="handleFilter">
              搜索
            </n-button>
            <n-button @click="resetFilter">
              重置
            </n-button>
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
          <div class="flex justify-between items-center">
            <div class="flex items-center gap-4">
              <!-- 主要操作按钮 -->
              <div class="flex gap-2">
                <n-button type="primary" @click="handleImport">
                  导入游戏
                </n-button>
                <n-button tertiary type="primary" @click="showApiImport = true">
                  接口导入
                </n-button>
                <n-button type="success" @click="handleCreate">
                  新增游戏
                </n-button>
              </div>
              
              <!-- 选择信息 -->
              <div class="text-sm text-gray-600">
                已选择 {{ selectedCount }} 条数据，共 {{ paginationReactive.total }} 条
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

    <!-- 导入对话框 -->
    <GameImportDialog
      v-model:visible="showImportDialog"
      :platform-options="platformOptions"
      @success="handleImportSuccess"
    />

    <!-- 接口导入对话框 -->
    <ApiImportDialog
      v-model="showApiImport"
      :platform-options="platformOptions"
      @success="handleImportSuccess"
    />

    <!-- 创建/编辑对话框 -->
    <n-modal
      v-model:show="showModal"
      :title="editingGame ? '编辑游戏' : '新增游戏'"
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
        <n-form-item label="所属平台" path="platformId">
          <n-select
            v-model:value="formData.platformId"
            placeholder="选择所属平台"
            :options="platformOptions"
            :disabled="!!editingGame"
          />
        </n-form-item>

        <n-form-item label="游戏ID" path="gameId">
          <n-input
            v-model:value="formData.gameId"
            placeholder="请输入游戏ID"
            :disabled="!!editingGame"
          />
        </n-form-item>
        
        <n-form-item label="显示ID" path="gameDisplayId">
          <n-input
            v-model:value="formData.gameDisplayId"
            placeholder="请输入显示ID"
          />
        </n-form-item>
        
        <n-form-item label="游戏名称(中文)" path="gameName">
          <n-input
            v-model:value="formData.gameName"
            placeholder="请输入游戏名称(中文)"
          />
        </n-form-item>
        
        <n-form-item label="游戏名称(英文)" path="gameNameEn">
          <n-input
            v-model:value="formData.gameNameEn"
            placeholder="请输入游戏名称(英文)"
          />
        </n-form-item>

        <n-form-item label="游戏厂商" path="vendor">
          <n-input
            v-model:value="formData.vendor"
            placeholder="请输入游戏厂商，如 PG Soft / CQ9 / JILI"
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

        <n-form-item label="排序" path="sortOrder">
          <n-input-number
            v-model:value="formData.sortOrder"
            placeholder="请输入排序值"
            :min="0"
            style="width: 100%"
          />
        </n-form-item>

        <!-- 图标上传区域 -->
        <div class="image-upload-section">
          <n-form-item label="icon图标">
            <!-- 直接拖拽上传区域 -->
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
                    <n-button size="tiny" @click.stop="openIconSelector">更换</n-button>
                    <n-button size="tiny" type="error" @click.stop="clearIcon">清除</n-button>
                  </div>
                </div>
              </div>
              <div v-else class="upload-placeholder">
                <div class="upload-icon">📁</div>
                <div class="upload-text">拖拽图片到此处或点击选择</div>
                <div class="upload-hint">支持 JPG, PNG, GIF 格式</div>
              </div>
            </div>
          </n-form-item>

          <!-- 图标预览 -->
          <n-form-item label="图标预览">
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
                  <div v-else class="placeholder-icon">游戏图标</div>
                </div>
              </div>
            </div>
          </n-form-item>
        </div>

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
            <n-switch v-model:value="formData.isHot1" />
          </n-form-item>
          
          <n-form-item label="热门二">
            <n-switch v-model:value="formData.isHot2" />
          </n-form-item>
          
          <n-form-item label="推荐">
            <n-switch v-model:value="formData.isRecommended" />
          </n-form-item>
          
          <n-form-item label="游戏开关">
            <n-switch v-model:value="formData.isEnabled" />
          </n-form-item>
          
          <n-form-item label="维护状态">
            <n-switch v-model:value="formData.isUnderMaintenance" />
          </n-form-item>
          
          <n-form-item label="展示给主播">
            <n-switch v-model:value="formData.showToStreamer" />
          </n-form-item>
        </div>
      </n-form>
      
      <template #action>
        <div class="flex gap-2 justify-end">
          <n-button @click="showModal = false">取消</n-button>
          <n-button type="primary" @click="handleSubmit" :loading="submitting">
            {{ editingGame ? '更新' : '创建' }}
          </n-button>
        </div>
      </template>
    </n-modal>
  </Page>
</template>

<script lang="ts" setup>
import { computed, h, onMounted, onUnmounted, reactive, ref, watch, nextTick } from 'vue';
// ✅ PERFORMANCE FIX: Lazy load components to avoid blocking page load
import { defineAsyncComponent } from 'vue';
const SmartDataGrid = defineAsyncComponent(() => import('../../../components/smart/SmartDataGrid/index.vue'));
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
  useMessage
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
  type GameItem 
} from '#/api/game/subgame';
import { getGamePlatformListApi, type GamePlatformItem } from '#/api/game/platform';
import { uploadMediaFile } from '#/api/mediaLibrary';
const GameImportDialog = defineAsyncComponent(() => import('./GameImportDialog.vue'));
const ApiImportDialog = defineAsyncComponent(() => import('./ApiImportDialog.vue'));
import { getImageUrlByEnvironment } from '../../../utils/imageUtils';

// 响应式数据
const message = useMessage();
const loading = ref(false);
const submitting = ref(false);
const showModal = ref(false);
const showImportDialog = ref(false);
const showApiImport = ref(false);
const tableData = ref<GameItem[]>([]);
const checkedRowKeys = ref<number[]>([]);
const editingGame = ref<GameItem | null>(null);
const formRef = ref<FormInst | null>(null);
const platformOptions = ref<Array<{ label: string; value: number }>>([]);

// 性能优化：平台数据缓存
const platformCache = ref<Array<{ label: string; value: number }>>([]);
const platformLoaded = ref(false);

// 防抖搜索
const searchTimeout = ref<NodeJS.Timeout | null>(null);

// 分页信息 (simplified for SmartDataGrid)
const paginationReactive = reactive({
  page: 1,
  pageSize: 20,
  total: 0,
});

// 筛选表单
const filterForm = reactive({
  gameType: undefined as string | undefined,
  platformId: undefined as number | undefined,
  vendor: undefined as string | undefined,
  currency: undefined as string | undefined,
  isEnabled: undefined as string | undefined,
  hotType: undefined as string | undefined,
  search: undefined as string | undefined,
});

// 表单数据
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

// 文件预览相关
const iconPreview = ref('');

// 选项数据
const currencyOptions = [
  { label: 'BRL', value: 'BRL' },
  { label: 'USD', value: 'USD' },
  { label: 'EUR', value: 'EUR' },
];

// 游戏类型多语言映射 - 使用实际的数据库枚举值和文本值
const gameTypeMapping = {
  // 数据库枚举值 -> 中文显示映射
  'VIDEO': '电子游戏',
  'LIVE': '真人游戏', 
  'SLOT': '电子游戏',
  'LOTTERY': '彩票游戏',
  'SPORTS': '体育游戏',
  'ESPORTS': '体育游戏',
  'HUNTING': '捕鱼游戏',
  'CHESS_CARDS': '棋牌游戏',
  'TABLE': '棋牌游戏',
  'ARCADE': '街机游戏',
  'SIMULATION': '电子游戏',
  'COCKFIGHT': '斗鸡游戏',
  'BLOCKCHAIN': '区块链游戏',
  'OTHER': '电子游戏',
  // 添加文本字段的映射
  'CHESS_CARD': '棋牌游戏',  // 注意：数据库中是单数形式
  'CHESS': '棋牌游戏',
  'CARDS': '棋牌游戏'
} as const;

// 反向映射：中文 -> 数据库枚举值数组
const reverseGameTypeMapping = Object.entries(gameTypeMapping).reduce((acc, [enumValue, chinese]) => {
  if (!acc[chinese]) {
    acc[chinese] = [];
  }
  acc[chinese].push(enumValue);
  return acc;
}, {} as Record<string, string[]>);

// 手动确保棋牌游戏有正确的映射
reverseGameTypeMapping['棋牌游戏'] = ['CHESS_CARDS', 'TABLE', 'CHESS_CARD'];
reverseGameTypeMapping['棋牌'] = ['CHESS_CARDS', 'TABLE', 'CHESS_CARD'];

// 调试：显示反向映射结构
console.log('Reverse Game Type Mapping:', reverseGameTypeMapping);

// 将中文游戏类型转换为数据库枚举值和文本值进行筛选（返回数组，用于过滤）
const getEnglishGameTypesForFiltering = (chineseType: string) => {
  const enumValues = reverseGameTypeMapping[chineseType];
  if (enumValues && enumValues.length > 0) {
    console.log(`Game type conversion for filtering: ${chineseType} -> ${enumValues.join(', ')}`);
    return enumValues;
  }
  // 如果没有找到映射，直接返回原值
  return [chineseType];
};

// 将中文游戏类型转换为数据库枚举值（返回单个值，用于表单）
const getEnglishGameTypes = (chineseType: string) => {
  const enumValues = reverseGameTypeMapping[chineseType];
  if (enumValues && enumValues.length > 0) {
    // 对于有多个枚举值的中文类型，返回第一个（通常是最主要的）
    const result = enumValues[0];
    console.log(`Game type conversion for form: ${chineseType} -> ${result}`);
    return result;
  }
  // 如果没有找到映射，直接返回原值
  return chineseType;
};

const gameTypeOptions = [
  { label: '电子游戏', value: '电子游戏' },
  { label: '真人游戏', value: '真人游戏' },
  { label: '体育游戏', value: '体育游戏' },
  { label: '彩票游戏', value: '彩票游戏' },
  { label: '捕鱼游戏', value: '捕鱼游戏' },
  { label: '棋牌游戏', value: '棋牌游戏' },
  { label: '棋牌', value: '棋牌' },
  { label: '街机游戏', value: '街机游戏' },
  { label: '斗鸡游戏', value: '斗鸡游戏' },
  { label: '区块链游戏', value: '区块链游戏' },
];

// 游戏类型筛选选项（用于筛选器）
const gameTypeFilterOptions = [
  { label: '电子游戏', value: '电子游戏' },
  { label: '真人游戏', value: '真人游戏' },
  { label: '体育游戏', value: '体育游戏' },
  { label: '彩票游戏', value: '彩票游戏' },
  { label: '捕鱼游戏', value: '捕鱼游戏' },
  { label: '棋牌游戏', value: '棋牌游戏' },
  { label: '棋牌', value: '棋牌' },
  { label: '街机游戏', value: '街机游戏' },
  { label: '斗鸡游戏', value: '斗鸡游戏' },
  { label: '区块链游戏', value: '区块链游戏' },
];

// 游戏厂商筛选选项（动态从列表提取）
const vendorOptions = ref<Array<{ label: string; value: string }>>([]);

// 将数据库枚举值转换为中文显示
const getChineseGameType = (englishType: string | null | undefined) => {
  if (!englishType) return '-';
  return gameTypeMapping[englishType as keyof typeof gameTypeMapping] || englishType;
};

const statusOptions = [
  { label: '启用', value: 'true', type: 'option' },
  { label: '禁用', value: 'false', type: 'option' },
];

const hotTypeOptions = [
  { label: '热门一', value: 'hot1', type: 'option' },
  { label: '热门二', value: 'hot2', type: 'option' },
  { label: '推荐', value: 'recommended', type: 'option' },
];

// 表单验证规则
const formRules: FormRules = {
  platformId: [
  {
    trigger: 'submit',
    validator: (_, value) => {
      if (editingGame.value) return Promise.resolve();
      if (!!value) return Promise.resolve();
      return Promise.reject(new Error('请选择所属平台'));
    }
  }
],
  gameId: [
    { required: true, message: '请输入游戏ID', trigger: 'blur' },
  ],
  gameDisplayId: [
    { max: 50, message: '显示ID长度不能超过50个字符', trigger: 'blur' },
  ],
  gameName: [
    { required: true, message: '请输入游戏名称', trigger: 'blur' },
    { min: 2, max: 50, message: '游戏名称长度为2-50个字符', trigger: 'blur' },
  ],
  vendor: [
    { required: true, message: '请输入游戏厂商', trigger: 'blur' },
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
const columns: DataTableColumns<GameItem> = [
  { type: 'selection' },
  { 
    title: '排序', 
    key: 'sortOrder', 
    width: 80,
    render(row) {
      return h('div', { class: 'flex items-center gap-1' }, [
        h('span', row.sortOrder),
        h(NButton, { 
          size: 'tiny', 
          quaternary: true,
          type: 'primary',
          onClick: () => handleSetTop(row) 
        }, { default: () => '置顶' }),
      ]);
    },
  },
  { 
    title: '平台名称', 
    key: 'platform', 
    width: 150,
    render(row) {
      return row.platform?.platformName || '-';
    },
  },
  { 
    title: '游戏厂商', 
    key: 'vendor', 
    width: 120,
    render(row) {
      return row.thirdPartyData?.vendor || '-';
    },
  },
  { title: '游戏ID', key: 'gameId', width: 120 },
  { title: '显示ID', key: 'gameDisplayId', width: 120 },
  { 
    title: '游戏名称', 
    key: 'gameName', 
    width: 180,
    render(row) {
      return h('div', [
        h('div', { style: 'font-weight: 500' }, row.gameName),
        row.gameNameEn && h('div', { style: 'font-size: 12px; color: #666; margin-top: 2px' }, row.gameNameEn),
      ]);
    },
  },
  { 
    title: '游戏类型', 
    key: 'gameType', 
    width: 100,
    render(row) {
      return getChineseGameType(row.gameType);
    },
  },
  { 
    title: '游戏图标', 
    key: 'iconUrl', 
    width: 80,
    render(row) {
      if (row.iconUrl) {
        return h('div', { class: 'image-container' }, [
          h(NImage, { 
            src: getImageUrlByEnvironment(row.iconUrl),
            alt: '游戏图标',
            width: 40,
            height: 40,
            objectFit: 'cover',
            class: 'game-icon',
            fallbackSrc: '/placeholder-game.png',
            lazy: true,
            previewSrc: getImageUrlByEnvironment(row.iconUrl)
          })
        ]);
      }
      return h('span', { class: 'text-gray-400' }, '无图标');
    },
  },
  { title: '币种', key: 'currency', width: 80 },
  {
    title: '热门一',
    key: 'isHot1',
    width: 100,
    render(row) {
      return h(NSwitch, { 
        value: row.isHot1,
        onUpdateValue: (value) => handleToggle(row, 'isHot1', value)
      });
    },
  },
  {
    title: '热门二',
    key: 'isHot2',
    width: 100,
    render(row) {
      return h(NSwitch, { 
        value: row.isHot2,
        onUpdateValue: (value) => handleToggle(row, 'isHot2', value)
      });
    },
  },
  {
    title: '推荐',
    key: 'isRecommended',
    width: 80,
    render(row) {
      return h(NSwitch, { 
        value: row.isRecommended,
        onUpdateValue: (value) => handleToggle(row, 'isRecommended', value)
      });
    },
  },
  {
    title: '游戏开关',
    key: 'isEnabled',
    width: 100,
    render(row) {
      return h(NSwitch, { 
        value: row.isEnabled,
        onUpdateValue: (value) => handleToggle(row, 'isEnabled', value)
      });
    },
  },
  {
    title: '维护状态',
    key: 'isUnderMaintenance',
    width: 100,
    render(row) {
      return h(NTag, { 
        type: row.isUnderMaintenance ? 'warning' : 'success',
        size: 'small'
      }, { 
        default: () => row.isUnderMaintenance ? '维护中' : '正常' 
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
        onUpdateValue: (value) => handleToggle(row, 'showToStreamer', value)
      });
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
    width: 150,
    render(row) {
      const actions = [];
      
      // Edit button
      actions.push(
        h(NButton, { 
          size: 'small', 
          quaternary: true, 
          type: 'primary',
          onClick: () => handleEdit(row) 
        }, { default: () => '编辑' })
      );
      
      // Delete button
     
      
      return h('div', { class: 'flex gap-2 flex-wrap' }, actions);
    },
  },
];

// Note: paginationConfig removed - SmartDataGrid handles pagination internally

// 检查是否有选中的游戏
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
  message.info('已清空选择');
};

const selectAll = () => {
  checkedRowKeys.value = tableData.value.map(game => Number(game.id));
  message.info('已全选');
};

// 根据选中的厂商和游戏类型过滤平台选项 - 智能过滤版本
const filteredPlatformOptions = computed(() => {
  // 如果没有选择厂商或游戏类型，显示所有平台
  if (!filterForm.vendor && !filterForm.gameType) {
    return platformOptions.value;
  }
  
  // 如果有厂商或游戏类型选择，使用过滤后的平台数据
  return filteredPlatforms.value;
});

// 过滤后的平台数据（基于实际有游戏的平台）
const filteredPlatforms = ref<any[]>([]);

// 防止重复加载平台的标志
const isLoadingPlatforms = ref(false);

// 加载过滤后的平台选项
const loadFilteredPlatforms = async () => {
  // 防止重复调用
  if (isLoadingPlatforms.value) {
    console.log('Platform loading already in progress, skipping...');
    return;
  }
  
  // 如果没有任何筛选条件，显示所有平台
  if (!filterForm.vendor && !filterForm.gameType) {
    console.log('🔄 No vendor or game type filters, showing all platforms');
    filteredPlatforms.value = [...platformOptions.value];
    return;
  }
  
  isLoadingPlatforms.value = true;

  try {
    // 构建查询参数来获取可用的平台
    const params: any = {
      page: 1,
      pageSize: 1000, // 获取所有游戏来统计平台
      vendor: filterForm.vendor,
    };

    // 处理游戏类型筛选
    if (filterForm.gameType) {
      const enumValues = getEnglishGameTypesForFiltering(filterForm.gameType);
      if (enumValues && enumValues.length > 0) {
        params.gameType = enumValues.join(',');
      }
    }

    console.log('Loading filtered platforms with params:', params);
    console.log('Game type filter:', filterForm.gameType);
    console.log('English enum values:', filterForm.gameType ? getEnglishGameTypesForFiltering(filterForm.gameType) : 'none');
    
    // 策略1: 先尝试通过游戏数据找到平台
    let availablePlatformIds = new Set();
    
    try {
      // 调用API获取游戏数据
      const gameResponse = await getGameListApi(params);
      
      console.log('Game API Response for platform filtering:', {
        totalGames: gameResponse.list?.length || 0,
        sampleGame: gameResponse.list?.[0] ? {
          id: gameResponse.list[0].id,
          platformId: gameResponse.list[0].platformId,
          platform: gameResponse.list[0].platform,
          gameName: gameResponse.list[0].gameName
        } : null
      });
      
      if (gameResponse.list && gameResponse.list.length > 0) {
        // 从游戏结果中提取平台ID
        gameResponse.list.forEach((game: any) => {
          const platformId = game.platformId || (game.platform && game.platform.id);
          if (platformId) {
            availablePlatformIds.add(platformId);
          }
        });
        console.log(`Found ${availablePlatformIds.size} platforms from games`);
      }
    } catch (gameError) {
      console.warn('Game API failed, trying platform API:', gameError);
    }
    
    // 策略2: 如果游戏API没有返回结果，尝试直接查询平台
    if (availablePlatformIds.size === 0 && filterForm.gameType) {
      try {
        console.log('Trying platform API for game type:', filterForm.gameType);
        
        // 将中文游戏类型转换为平台API可用的值
        let platformGameType = filterForm.gameType;
        if (filterForm.gameType === '棋牌游戏') {
          platformGameType = '棋牌'; // 平台使用"棋牌"，不是"棋牌游戏"
        }
        
        const platformResponse = await getGamePlatformListApi({
          page: 1,
          pageSize: 1000,
          gameType: platformGameType
        });
        
        console.log('Platform API Response:', {
          totalPlatforms: platformResponse.list?.length || 0,
          samplePlatform: platformResponse.list?.[0] ? {
            id: platformResponse.list[0].id,
            platformId: platformResponse.list[0].platformId,
            platformName: platformResponse.list[0].platformName,
            gameType: platformResponse.list[0].gameType
          } : null
        });
        
        if (platformResponse.list && platformResponse.list.length > 0) {
          // 从平台结果中提取平台ID
          platformResponse.list.forEach((platform: any) => {
            availablePlatformIds.add(platform.id);
          });
          console.log(`Found ${availablePlatformIds.size} platforms from platform API`);
        }
      } catch (platformError) {
        console.warn('Platform API also failed:', platformError);
      }
    }
    
    if (availablePlatformIds.size > 0) {
      // 过滤平台选项
      const filtered = platformOptions.value.filter(platform => 
        availablePlatformIds.has(platform.value)
      );
      
      filteredPlatforms.value = filtered;
      
      console.log(`Platform filtering: Found ${availablePlatformIds.size} unique platforms, showing ${filtered.length} platform options`);
      console.log('Available platform IDs:', Array.from(availablePlatformIds));
      console.log('Filtered platforms:', filtered.map(p => ({ value: p.value, label: p.label })));
    } else {
      // 如果没有找到平台，显示空数组
      filteredPlatforms.value = [];
      console.log('No platforms found for current filters, showing 0 platforms');
    }
    
    // 触发数据筛选
    nextTick(() => {
      handleFilter();
    });
  } catch (error) {
    console.error('Failed to load filtered platforms:', error);
    // 出错时显示所有平台
    filteredPlatforms.value = platformOptions.value;
    
    // 出错时也要触发数据筛选
    nextTick(() => {
      handleFilter();
    });
  } finally {
    // 无论成功还是失败，都要重置加载标志
    isLoadingPlatforms.value = false;
  }
};

// 厂商变化处理
const handleVendorChange = (value: string | undefined) => {
  console.log('🏭 Vendor changed to:', value);
  console.log('🏭 Filter form before change:', JSON.stringify(filterForm, null, 2));
  
  // 确保 filterForm.vendor 立即更新（防止 v-model 延迟）
  filterForm.vendor = value;
  console.log('🏭 Filter form after vendor update:', JSON.stringify(filterForm, null, 2));
  
  // Add a small delay to ensure the state is properly set
  console.log('🏭 Scheduling filter update...');
  
  // 当厂商改变时，需要重新筛选平台选项
  if (filterForm.platformId) {
    // 检查当前选中的平台是否还在过滤后的选项中
    const isCurrentPlatformValid = filteredPlatformOptions.value.some(
      option => option.value === filterForm.platformId
    );
    
    if (!isCurrentPlatformValid) {
      console.log('🔄 Current platform no longer valid, clearing platform selection');
      filterForm.platformId = undefined;
    }
  }
  
  // 如果厂商被清空，重置平台选项为所有平台
  if (!value) {
    console.log('🔄 Vendor cleared, resetting platform options to all platforms');
    filteredPlatforms.value = [...platformOptions.value];
  }
  
  // 加载过滤后的平台选项
  loadFilteredPlatforms();
  
  // 触发筛选
  nextTick(() => {
    handleFilter();
  });
};

// 游戏类型变化处理
const handleGameTypeChange = (value: string | undefined) => {
  console.log('🎮 Game type changed to:', value);
  
  // 确保 filterForm.gameType 立即更新（防止 v-model 延迟）
  filterForm.gameType = value;
  console.log('🎮 Filter form after game type update:', JSON.stringify(filterForm, null, 2));
  
  // 当游戏类型改变时，需要重新筛选平台选项
  if (filterForm.platformId) {
    // 检查当前选中的平台是否还在过滤后的选项中
    const isCurrentPlatformValid = filteredPlatformOptions.value.some(
      option => option.value === filterForm.platformId
    );
    
    if (!isCurrentPlatformValid) {
      console.log('🔄 Current platform no longer valid, clearing platform selection');
      filterForm.platformId = undefined;
    }
  }
  
  // 如果游戏类型被清空，重置平台选项为所有平台
  if (!value) {
    console.log('🔄 Game type cleared, resetting platform options to all platforms');
    filteredPlatforms.value = [...platformOptions.value];
  }
  
  // 加载过滤后的平台选项
  loadFilteredPlatforms();
  
  // 触发筛选
  nextTick(() => {
    handleFilter();
  });
};

// 筛选 - 性能优化版本
const handleFilter = () => {
  paginationReactive.page = 1;
  // 使用 nextTick 确保状态更新后再加载数据
  nextTick(() => {
    loadGameList();
  });
};

// 防抖搜索处理
const handleSearchInput = () => {
  // 清除之前的定时器
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value);
  }
  
  // 如果搜索框为空，立即触发筛选以显示所有结果
  if (!filterForm.search || filterForm.search.trim() === '') {
    console.log('🔍 Search cleared, filtering immediately');
    handleFilter();
    return;
  }
  
  // 设置新的定时器，500ms 后执行搜索
  searchTimeout.value = setTimeout(() => {
    console.log('🔍 Search input changed, filtering with:', filterForm.search);
    handleFilter();
  }, 500);
};

// 重置筛选
const resetFilter = () => {
  console.log('🔄 Resetting all filters...');
  
  // 清除搜索定时器
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value);
  }
  
  // 重置所有筛选表单字段为 undefined/null
  filterForm.gameType = undefined;
  filterForm.platformId = undefined;
  filterForm.vendor = undefined;
  filterForm.currency = undefined;
  filterForm.isEnabled = undefined;
  filterForm.hotType = undefined;
  filterForm.search = '';
  
  // 重置分页到第一页
  paginationReactive.page = 1;
  
  // 重置过滤后的平台为所有平台
  filteredPlatforms.value = [...platformOptions.value];
  
  // 清空选中的行
  checkedRowKeys.value = [];
  
  console.log('✅ All filters cleared. Loading complete dataset...');
  console.log('🔍 Filter form after reset:', JSON.stringify(filterForm, null, 2));
  console.log('🔍 Will fetch all games without any filter conditions');
  
  // 使用 nextTick 确保所有状态都已重置
  nextTick(() => {
    loadGameList();
  });
};

// 刷新
const handleRefresh = () => {
  loadGameList();
};

// 导入游戏
const handleImport = () => {
  showImportDialog.value = true;
};

// 导入成功回调
const handleImportSuccess = () => {
  notification.success({
    content: '游戏导入成功',
    duration: 3000,
  });
  loadGameList();
};

// 新增游戏
const handleCreate = () => {
  editingGame.value = null;
  resetForm();
  showModal.value = true;
};

// 编辑游戏
const handleEdit = (record: GameItem) => {
  // ✅ FIX: Log the game being edited for debugging
  console.log('📝 Opening edit form for game:', {
    id: record.id,
    gameDisplayId: record.gameDisplayId,
    gameName: record.gameName,
    gameId: record.gameId
  });
  
  // ✅ FIX: Ensure editingGame is set to the correct record
  editingGame.value = { ...record }; // Create a copy to prevent reference issues
  
  formData.platformId = record.platformId || undefined;
  formData.gameId = record.gameId;
  formData.gameDisplayId = record.gameDisplayId || '';
  formData.gameName = record.gameName;
  formData.gameNameEn = record.gameNameEn || '';
  // 将数据库枚举值转换为中文标签用于表单显示
  formData.gameType = record.gameType ? getChineseGameType(record.gameType) : '';
  formData.vendor = record.thirdPartyData?.vendor || '';
  formData.currency = record.currency;
  formData.isHot1 = record.isHot1;
  formData.isHot2 = record.isHot2;
  formData.isRecommended = record.isRecommended;
  formData.isEnabled = record.isEnabled;
  formData.isUnderMaintenance = record.isUnderMaintenance;
  formData.showToStreamer = record.showToStreamer;
  formData.sortOrder = typeof record.sortOrder === 'string' ? parseInt(record.sortOrder) : record.sortOrder;
  formData.iconUrl = record.iconUrl || '';
  formData.remark = record.remark || '';

  // Reset preview states for editing
  iconPreview.value = '';
  
  showModal.value = true;
};

// 删除游戏
const handleDelete = async (record: GameItem) => {
  try {
    await deleteGameApi(Number(record.id));
    notification.success({
      content: '删除成功',
      duration: 3000,
    });
    loadGameList();
  } catch (error) {
    console.error('删除失败:', error);
    notification.error({
      content: '删除失败',
      duration: 3000,
    });
  }
};

// 批量删除
const handleBulkDelete = async (selectedRows: GameItem[]) => {
  if (selectedRows.length === 0) {
    message.warning('请选择要删除的游戏');
    return;
  }

  try {
    const gameIds = selectedRows.map(game => Number(game.id));
    await bulkDeleteGamesApi(gameIds);
    message.success(`已成功删除 ${selectedRows.length} 个游戏`);
    checkedRowKeys.value = [];
    loadGameList();
  } catch (error) {
    console.error('批量删除失败:', error);
    message.error('批量删除失败，请重试');
  }
};

// 切换状态
const handleToggle = async (record: GameItem, field: string, value: boolean) => {
  try {
    await toggleGameApi(Number(record.id), { field: field as any, value });
    // 更新本地数据
    const index = tableData.value.findIndex(item => item.id === record.id);
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

// 置顶
const handleSetTop = async (record: GameItem) => {
  try {
    await setGameTopApi(Number(record.id));
    notification.success({
      content: '置顶成功',
      duration: 2000,
    });
    loadGameList();
  } catch (error) {
    console.error('置顶失败:', error);
    notification.error({
      content: '置顶失败',
      duration: 3000,
    });
  }
};



// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    submitting.value = true;

    const platformId = Number(formData.platformId);
    if (!platformId) {
      throw new Error('所属平台无效，请重新选择');
    }

    const data = {
      platformId,
      gameId: formData.gameId,
      gameDisplayId: formData.gameDisplayId || undefined,
      gameName: formData.gameName,
      vendor: formData.vendor,
      gameNameEn: formData.gameNameEn || undefined,
      // 将中文游戏类型转换为数据库枚举值
      gameType: getEnglishGameTypes(formData.gameType),
      currency: formData.currency,
      isHot1: formData.isHot1,
      isHot2: formData.isHot2,
      isRecommended: formData.isRecommended,
      isEnabled: formData.isEnabled,
      isUnderMaintenance: formData.isUnderMaintenance,
      showToStreamer: formData.showToStreamer,
      sortOrder: formData.sortOrder,
      iconUrl: formData.iconUrl || "",
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
      
      if (data.gameId && editingGameId_field && data.gameId !== editingGameId_field) {
        validationErrors.push(`gameId mismatch: editing=${editingGameId_field}, form=${data.gameId}`);
      }
      
      if (data.gameDisplayId && editingGameDisplayId && data.gameDisplayId !== editingGameDisplayId) {
        // Allow gameDisplayId to change (user might be updating it)
        console.log('ℹ️ [INFO] gameDisplayId is being changed:', {
          from: editingGameDisplayId,
          to: data.gameDisplayId
        });
      }
      
      if (data.gameName && editingGameName && data.gameName !== editingGameName) {
        // Allow gameName to change (user might be updating it)
        console.log('ℹ️ [INFO] gameName is being changed:', {
          from: editingGameName,
          to: data.gameName
        });
      }
      
      if (validationErrors.length > 0) {
        console.error('❌ [SAFETY CHECK FAILED] Validation errors:', validationErrors);
        console.error('❌ Editing game:', {
          id: editingGameId,
          gameId: editingGameId_field,
          gameDisplayId: editingGameDisplayId,
          gameName: editingGameName
        });
        console.error('❌ Form data:', data);
        throw new Error(`安全验证失败: 表单数据与正在编辑的游戏不匹配。请刷新页面后重试。\n错误: ${validationErrors.join(', ')}`);
      }
      
      console.log('🔄 Updating game:', {
        gameId: editingGameId,
        gameId_field: editingGameId_field,
        gameDisplayId: editingGameDisplayId,
        gameName: editingGameName,
        formGameId: data.gameId,
        formGameDisplayId: data.gameDisplayId,
        formGameName: data.gameName
      });
      
      gameResult = await updateGameApi(editingGameId, data);
      
      // ✅ FIX: Use the stored editingGameId instead of editingGame.value.id to prevent race conditions
      // Immediately update the local table data for instant UI reflection
      const gameIndex = tableData.value.findIndex(game => game.id === editingGameId);
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
          before: { id: existingGame.id, gameDisplayId: existingGame.gameDisplayId, gameName: existingGame.gameName },
          after: { id: updatedGame.id, gameDisplayId: updatedGame.gameDisplayId, gameName: updatedGame.gameName },
          index: gameIndex
        });
        
        tableData.value[gameIndex] = updatedGame;
        
        // Force Vue reactivity update
        tableData.value = [...tableData.value];
        
        console.log('✅ Local game data updated successfully');
      } else {
        console.warn('⚠️ Game not found in local table for update:', editingGameId);
      }
      
      notification.success({
        content: '更新成功',
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
        content: '创建成功',
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
      content: error?.message || '操作失败',
      duration: 3000,
    });
  } finally {
    submitting.value = false;
  }
};


// 重置表单
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
  
  // 重置文件预览状态
  iconPreview.value = '';
  
  if (formRef.value) {
    formRef.value.restoreValidation();
  }
  
  console.log('✅ Form reset - editingGame cleared');
};

// 分页变化
const handlePageChange = (page: number) => {
  paginationReactive.page = page;
  loadGameList();
};

const handlePageSizeChange = (pageSize: number) => {
  paginationReactive.pageSize = pageSize;
  paginationReactive.page = 1;
  loadGameList();
};

// 加载游戏列表 - 性能优化版本
const loadGameList = async () => {
  try {
    loading.value = true;
    
    // 构建参数对象，只包含有值的筛选条件
    const params: any = {
      page: paginationReactive.page,
      pageSize: paginationReactive.pageSize,
    };

    // 只添加有值的筛选条件到参数中
    if (filterForm.platformId) {
      params.platformId = filterForm.platformId;
    }
    
    if (filterForm.vendor) {
      params.vendor = filterForm.vendor;
      console.log('✅ Vendor parameter added to params:', filterForm.vendor);
    } else {
      console.log('❌ No vendor in filterForm, vendor param not added');
    }
    
    if (filterForm.currency) {
      params.currency = filterForm.currency;
    }
    
    if (filterForm.search && filterForm.search.trim()) {
      params.search = filterForm.search.trim();
    }

    // 处理游戏类型筛选 - 支持多语言映射
    if (filterForm.gameType) {
      const enumValues = getEnglishGameTypesForFiltering(filterForm.gameType);
      if (enumValues && enumValues.length > 0) {
        // 发送所有游戏类型作为逗号分隔的字符串，后端会处理多个类型
        params.gameType = enumValues.join(',');
        console.log(`Sending game types for ${filterForm.gameType}: ${enumValues.join(', ')}`);
      }
    }

    // 处理热门类型筛选
    if (filterForm.hotType === 'hot1') {
      params.isHot1 = true;
    } else if (filterForm.hotType === 'hot2') {
      params.isHot2 = true;
    } else if (filterForm.hotType === 'recommended') {
      params.isRecommended = true;
    }

    // 处理游戏状态筛选
    if (filterForm.isEnabled === 'true') {
      params.isEnabled = true;
    } else if (filterForm.isEnabled === 'false') {
      params.isEnabled = false;
    }

    console.log('🚀 Calling API with vendor filter:', params.vendor || 'none');

    const response = await getGameListApi(params);
    console.log('📥 API response received:', response);
    console.log('📊 Response data count:', response?.list?.length || 0);
    console.log('📈 Total games in response:', response?.pagination?.total || 0);
    
    if (response?.list?.length > 0) {
      console.log('🎮 First 3 games vendors:', response.list.slice(0, 3).map(game => ({
        name: game.gameName,
        vendor: game.thirdPartyData?.vendor || 'No vendor'
      })));
    }
    
    tableData.value = response.list || [];
    paginationReactive.total = response.pagination?.total || 0;
    
    // Debug platform filtering
    console.log('Platform debugging:');
    console.log('- Total platforms loaded:', platformOptions.value.length);
    console.log('- Current filter vendor:', filterForm.vendor);
    console.log('- Current filter gameType:', filterForm.gameType);
    console.log('- Games loaded:', tableData.value.length);
    console.log('- Total games available:', response.pagination?.total || 0);
    
    // 动态生成厂商选项（取 thirdPartyData.vendor 去重）
    // 注意：这里只更新当前页的厂商，完整厂商列表在 loadAllVendors 中加载
    const currentPageVendors = Array.from(new Set((tableData.value || [])
      .map((g: any) => g?.thirdPartyData?.vendor)
      .filter((v: any) => typeof v === 'string' && v.trim())));
    
    // 合并现有厂商和新发现的厂商，避免丢失
    const existingVendors = vendorOptions.value.map(v => v.value);
    const newVendors = currentPageVendors.filter(v => !existingVendors.includes(v));
    
    if (newVendors.length > 0) {
      const newVendorOptions = newVendors.map(v => ({ label: v, value: v }));
      vendorOptions.value = [...vendorOptions.value, ...newVendorOptions];
      console.log('Added new vendors:', newVendors);
    }
  } catch (error) {
    console.error('加载游戏列表失败:', error);
    notification.error({
      content: '加载数据失败',
      duration: 3000,
    });
  } finally {
    loading.value = false;
  }
};

// 加载所有厂商选项 - 独立加载，不受筛选影响
const loadAllVendors = async () => {
  try {
    console.log('Loading all vendors...');
    // 获取所有游戏的厂商信息，不受筛选限制
    const response = await getGameListApi({ 
      page: 1, 
      pageSize: 1000, // 获取足够多的数据来提取所有厂商
      // 不添加其他筛选条件，确保获取所有厂商
    });
    
    if (response.list && response.list.length > 0) {
      const allVendors = Array.from(new Set(
        response.list
          .map((g: any) => g?.thirdPartyData?.vendor)
          .filter((v: any) => typeof v === 'string' && v.trim())
      ));
      
      vendorOptions.value = allVendors.map(v => ({ label: v, value: v }));
      console.log(`Loaded ${allVendors.length} vendors:`, allVendors);
    }
  } catch (error) {
    console.error('Failed to load all vendors:', error);
  }
};

// 加载平台选项 - 性能优化版本
const loadPlatformOptions = async () => {
  // 如果已经加载过，直接使用缓存
  if (platformLoaded.value && platformCache.value.length > 0) {
    platformOptions.value = platformCache.value;
    console.log('Using cached platforms:', platformOptions.value.length);
    // 初始化过滤后的平台
    filteredPlatforms.value = platformCache.value;
    return;
  }

  try {
    console.log('Loading platform options...');
    const response = await getGamePlatformListApi({ pageSize: 1000 }); // 获取所有平台
    console.log('Platform API response:', response);
    
    const options = response.list?.map((platform: GamePlatformItem) => ({
      label: platform.platformName,
      value: platform.id,
    })) || [];
    
    console.log('Processed platform options:', options.length);
    console.log('Sample platforms:', options.slice(0, 5));
    
    // 缓存平台数据
    platformCache.value = options;
    platformOptions.value = options;
    platformLoaded.value = true;
    
    // 初始化过滤后的平台
    filteredPlatforms.value = options;
    
    console.log('Platforms loaded successfully:', platformOptions.value.length);
  } catch (error) {
    console.error('加载平台选项失败:', error);
  }
};

// 组件挂载时加载数据 - 性能优化版本
onMounted(async () => {
  // 并行加载数据，而不是串行
  await Promise.all([
    loadPlatformOptions(),
    loadAllVendors(), // 独立加载所有厂商
    loadGameList()
  ]);
});

// 组件卸载时清理定时器
onUnmounted(() => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value);
  }
});

const props = defineProps<{ platformId?: number }>();

watch(() => props.platformId, (newVal) => {
  if (newVal) {
    filterForm.platformId = newVal;
    paginationReactive.page = 1;
    loadGameList();
  }
});

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
        content: '请拖拽图片文件',
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
    fileName: file.name
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
    if (response && typeof response === 'object' && response.success && response.data && response.data.url) {
      // ✅ FIX: Log before updating formData to track state changes
      console.log('✅ [ICON UPLOAD] Updating formData.iconUrl:', {
        before: formData.iconUrl,
        after: response.data.url,
        editingGameId: editingGame.value?.id,
        editingGameDisplayId: editingGame.value?.gameDisplayId,
        editingGameName: editingGame.value?.gameName
      });
      
      // Update form with uploaded icon URL
      formData.iconUrl = response.data.url;
      notification.success({
        content: '图标上传成功',
        duration: 3000,
      });
    } else if (response && typeof response === 'object' && 'url' in response) {
      // Fallback: Handle direct MediaFile object (in case requestClient unwrapped it)
      console.log('✅ [ICON UPLOAD] Updating formData.iconUrl (fallback):', {
        before: formData.iconUrl,
        after: (response as any).url,
        editingGameId: editingGame.value?.id
      });
      
      formData.iconUrl = (response as any).url;
      notification.success({
        content: '图标上传成功',
        duration: 3000,
      });
    } else {
      console.error('❌ Invalid response structure:', response);
      throw new Error('上传失败');
    }
  } catch (error) {
    console.error('Icon upload error:', error);
    notification.error({
      content: error instanceof Error ? error.message : '图标上传失败',
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
        // ✅ FIX: Validate file type - allow AVIF even if browser doesn't recognize it
        const fileName = file.name.toLowerCase();
        const fileType = file.type || '';
        const isImage = fileType.startsWith('image/') || 
                       /\.(jpg|jpeg|png|gif|webp|avif|svg|bmp)$/i.test(fileName);
        
        if (!isImage) {
          notification.error({
            content: '请选择图片文件（支持 JPG, PNG, GIF, WebP, AVIF, SVG, BMP）',
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

// Clear icon
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