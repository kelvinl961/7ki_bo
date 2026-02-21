<template>
  <n-modal
    v-model:show="modalShow"
    preset="dialog"
    :title="isEditing ? '编辑Banner' : '新增Banner'"
    style="width: 900px"
    :mask-closable="false"
    @after-leave="handleModalClose"
  >
    <n-tabs v-model:value="activeTab" type="line" animated>
      <!-- 基本信息 -->
      <n-tab-pane name="basic" tab="基本信息">
        <n-form
          ref="basicFormRef"
          :model="formData"
          :rules="basicRules"
          label-placement="top"
          label-width="auto"
        >
          <div class="grid grid-cols-2 gap-4">
            <n-form-item label="语言" path="language">
              <n-select
                v-model:value="formData.language"
                placeholder="选择语言"
                :options="languageOptions"
              />
            </n-form-item>

            <n-form-item label="币种" path="currency">
              <n-select
                v-model:value="formData.currency"
                placeholder="选择币种"
                :options="currencyOptions"
              />
            </n-form-item>

            <n-form-item label="排序（可选）" path="sortOrder">
              <n-input-number
                v-model:value="formData.sortOrder"
                placeholder="输入排序数值"
                :min="0"
                :max="9999"
              />
            </n-form-item>

            <n-form-item label="停留时间(秒)（可选）" path="displayDuration">
              <n-input-number
                v-model:value="formData.displayDuration"
                placeholder="输入停留时间"
                :min="1"
                :max="300"
              />
            </n-form-item>
          </div>

          <n-form-item label="Banner名称" path="bannerName">
            <n-input
              v-model:value="formData.bannerName"
              placeholder="请输入Banner名称"
              clearable
            />
          </n-form-item>

          <n-form-item label="Banner图片" path="bannerImageUrl">
            <MediaLibrarySelector
              v-model="formData.bannerImageUrl"
              category="banners"
              :accept-types="['image']"
              placeholder="从媒体库选择或上传Banner图片"
              @file-selected="handleBannerImageSelected"
            />

            <!-- 预览区域 -->
            <div v-if="formData.bannerImageUrl" class="mt-2">
              <div class="banner-preview">
                <img
                  :src="getImageUrlByEnvironment(formData.bannerImageUrl)"
                  alt="Banner预览"
                  class="banner-preview-image"
                />
              </div>
            </div>
          </n-form-item>
        </n-form>
      </n-tab-pane>

      <!-- 时间设置 -->
      <n-tab-pane name="time" tab="时间设置">
        <n-form
          ref="timeFormRef"
          :model="formData"
          :rules="timeRules"
          label-placement="top"
          label-width="auto"
        >
          <div class="grid grid-cols-2 gap-4">
            <n-form-item label="开始时间" path="startTime">
              <n-date-picker
                v-model:value="formData.startTime"
                type="datetime"
                placeholder="选择开始时间"
                style="width: 100%"
                clearable
                :value-format="'timestamp'"
                :default-value="null"
                :show-icon="true"
                :disabled-date="
                  (timestamp) => timestamp < Date.now() - 24 * 60 * 60 * 1000
                "
                @update:value="handleStartTimeChange"
                @error="(error) => console.error('Date picker error:', error)"
              />
            </n-form-item>

            <n-form-item label="结束时间（可选）" path="endTime">
              <n-date-picker
                v-model:value="formData.endTime"
                type="datetime"
                placeholder="选择结束时间"
                style="width: 100%"
                clearable
                :value-format="'timestamp'"
                :default-value="null"
                :show-icon="true"
                :disabled-date="
                  (timestamp) => timestamp < Date.now() - 24 * 60 * 60 * 1000
                "
                @update:value="handleEndTimeChange"
                @error="(error) => console.error('Date picker error:', error)"
              />
            </n-form-item>
          </div>

          <!-- 时间预设选项 -->
          <div class="mb-4">
            <label class="mb-2 block text-sm font-medium">快速设置</label>
            <n-space>
              <n-button size="small" @click="setTimeRange(1)">1小时</n-button>
              <n-button size="small" @click="setTimeRange(6)">6小时</n-button>
              <n-button size="small" @click="setTimeRange(24)">1天</n-button>
              <n-button size="small" @click="setTimeRange(168)">7天</n-button>
              <n-button size="small" @click="setTimeRange(720)">30天</n-button>
            </n-space>
          </div>

          <n-alert type="info" :show-icon="false">
            <template #header>
              <span class="font-medium">时间说明</span>
            </template>
            <div class="text-sm">
              <p>• 开始时间：Banner开始显示的时间（必填）</p>
              <p>• 结束时间：Banner停止显示的时间（可选）</p>
              <p>• 如果不设置结束时间，将持续显示直到手动停止</p>
            </div>
          </n-alert>
        </n-form>
      </n-tab-pane>

      <!-- 跳转设置 -->
      <n-tab-pane name="jump" tab="跳转设置">
        <n-form
          ref="jumpFormRef"
          :model="formData"
          :rules="jumpRules"
          label-placement="top"
          label-width="auto"
        >
          <div class="grid grid-cols-2 gap-4">
            <n-form-item label="跳转方式" path="jumpMode">
              <n-select
                v-model:value="formData.jumpMode"
                placeholder="选择跳转方式"
                :options="jumpModeOptions"
                @update:value="handleJumpModeChange"
              />
            </n-form-item>

            <!-- Dynamic activity dropdown when 活动 is selected -->
            <n-form-item
              v-if="formData.jumpMode === 'activity'"
              label="选择活动"
              path="selectedActivityId"
            >
              <n-select
                v-model:value="formData.selectedActivityId"
                placeholder="请选择活动"
                :options="activityOptions"
                :loading="loadingActivities"
                @update:value="handleActivitySelection"
                clearable
              />
            </n-form-item>

            <!-- Dynamic task dropdown when 任务 is selected -->
            <n-form-item
              v-if="formData.jumpMode === 'task'"
              label="选择任务"
              path="selectedTaskId"
            >
              <n-select
                v-model:value="formData.selectedTaskId"
                placeholder="请选择任务"
                :options="taskOptions"
                :loading="loadingTasks"
                @update:value="handleTaskSelection"
                clearable
              />
            </n-form-item>

            <!-- Dynamic game platform dropdown when 游戏 is selected -->
            <n-form-item
              v-if="formData.jumpMode === 'game'"
              label="选择游戏平台"
              path="selectedGamePlatformId"
            >
              <n-select
                v-model:value="formData.selectedGamePlatformId"
                placeholder="请选择游戏平台"
                :options="gamePlatformOptions"
                :loading="loadingGamePlatforms"
                @update:value="handleGamePlatformSelection"
                clearable
              />
            </n-form-item>

            <!-- Regular target URL for other jump modes - HIDDEN FOR NOW -->
            <!-- <n-form-item 
              v-if="formData.jumpMode !== 'none' && formData.jumpMode !== 'activity' && formData.jumpMode !== 'task' && formData.jumpMode !== 'game'" 
              label="跳转目标" 
              path="targetUrl"
            >
              <n-input
                v-model:value="formData.targetUrl"
                placeholder="请输入跳转目标URL或ID"
                clearable
              />
            </n-form-item> -->
          </div>

          <n-alert type="info" :show-icon="false">
            <template #header>
              <span class="font-medium">跳转说明</span>
            </template>
            <div class="text-sm">
              <p>• 无跳转：点击Banner无任何响应</p>
              <p>• 外链：跳转到外部网站，需要完整URL</p>
              <p>• 内部页面：跳转到系统内部页面</p>
              <p>• 游戏：跳转到指定游戏</p>
              <p>• 活动页面：跳转到活动详情页</p>
            </div>
          </n-alert>
        </n-form>
      </n-tab-pane>

      <!-- 高级设置 -->
      <n-tab-pane name="advanced" tab="高级设置">
        <n-form
          ref="advancedFormRef"
          :model="formData"
          :rules="advancedRules"
          label-placement="top"
          label-width="auto"
        >
          <n-form-item label="状态">
            <n-select
              v-model:value="formData.status"
              placeholder="选择状态"
              :options="statusOptions"
            />
          </n-form-item>

          <n-form-item label="后台备注">
            <n-input
              v-model:value="formData.remark"
              type="textarea"
              placeholder="输入后台备注信息"
              :autosize="{ minRows: 2, maxRows: 4 }"
              maxlength="500"
              show-count
            />
          </n-form-item>
        </n-form>
      </n-tab-pane>
    </n-tabs>

    <template #action>
      <n-space>
        <n-button @click="handleCancel">取消</n-button>
        <n-button type="primary" @click="handleSubmit" :loading="submitting">
          {{ isEditing ? '更新' : '创建' }}
        </n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch, h, nextTick } from 'vue';
import type { FormInst, FormRules, UploadFileInfo } from 'naive-ui';
import {
  NButton,
  NCard,
  NForm,
  NFormItem,
  NInput,
  NModal,
  NSelect,
  NSwitch,
  NTabs,
  NTabPane,
  NDatePicker,
  NAlert,
  NSpace,
  NUpload,
  NUploadDragger,
  NImage,
  useMessage,
  type SelectOption,
} from 'naive-ui';
import { notification } from '#/adapter/naive';
// ✅ PERFORMANCE FIX: Lazy load components to avoid blocking modal load
import { defineAsyncComponent } from 'vue';
const MediaLibrarySelector = defineAsyncComponent(
  () => import('#/components/MediaLibrarySelector.vue'),
);
import { getImageUrlByEnvironment } from '../../../utils/imageUtils';
import {
  createBanner,
  updateBanner,
  type LobbyBanner,
} from '#/api/lobbyBanner';
import { getActivityList, type Activity } from '#/api/activity';
import { getTaskCenterList, type TaskCenter } from '#/api/taskCenter';
import {
  getGamePlatformListApi,
  type GamePlatformItem,
} from '#/api/game/platform';

// Props
interface Props {
  show: boolean;
  editingItem?: LobbyBanner | null;
}

// Emits
interface Emits {
  (e: 'update:show', value: boolean): void;
  (e: 'success'): void;
}

const props = withDefaults(defineProps<Props>(), {
  show: false,
  editingItem: null,
});

const emit = defineEmits<Emits>();

// 响应式数据
const modalShow = computed({
  get: () => props.show,
  set: (val) => emit('update:show', val),
});

const activeTab = ref('basic');
const submitting = ref(false);
const message = useMessage();
const fileList = ref<UploadFileInfo[]>([]);
// const uploading = ref(false); // Removed - not needed for base64 storage

// 表单引用
const basicFormRef = ref<FormInst | null>(null);
const timeFormRef = ref<FormInst | null>(null);
const jumpFormRef = ref<FormInst | null>(null);
const advancedFormRef = ref<FormInst | null>(null);

// 表单数据
const formData = ref<{
  sortOrder: number;
  bannerName: string;
  currency: string;
  language: string;
  targetUrl: string;
  bannerImageUrl: string;
  displayDuration: number;
  startTime: number | null;
  endTime: number | null;
  jumpMode: string;
  status: string;
  remark: string;
  selectedActivityId?: number;
  selectedTaskId?: number;
  selectedGamePlatformId?: number;
}>({
  sortOrder: 0,
  bannerName: '',
  currency: 'BRL',
  language: 'pt',
  targetUrl: '', // Always default to empty string
  bannerImageUrl: '', // 保持兼容性
  displayDuration: 5,
  startTime: null,
  endTime: null,
  jumpMode: 'none',
  status: 'draft',
  remark: '',
  selectedActivityId: undefined,
  selectedTaskId: undefined,
  selectedGamePlatformId: undefined,
});

// Activity-related reactive data
const activityOptions = ref<Array<{ label: string; value: number }>>([]);
const loadingActivities = ref(false);

// Task-related reactive data
const taskOptions = ref<Array<{ label: string; value: number }>>([]);
const loadingTasks = ref(false);

// Game platform-related reactive data
const gamePlatformOptions = ref<Array<{ label: string; value: number }>>([]);
const loadingGamePlatforms = ref(false);

// Handle jump mode change
const handleJumpModeChange = (value: string) => {
  // Clear selections when jump mode changes
  if (value !== 'activity' && value !== 'task' && value !== 'game') {
    formData.value.selectedActivityId = undefined;
    formData.value.selectedTaskId = undefined;
    formData.value.selectedGamePlatformId = undefined;
    formData.value.targetUrl = '';
  }

  // Load activities when 活动 is selected
  if (value === 'activity') {
    loadActivities();
  }

  // Load tasks when 任务 is selected
  if (value === 'task') {
    loadTasks();
  }

  // Load game platforms when 游戏 is selected
  if (value === 'game') {
    loadGamePlatforms();
  }
};

// Handle activity selection
const handleActivitySelection = (activityId: number) => {
  if (activityId) {
    // Set the target URL to the activity ID
    formData.value.targetUrl = `activity:${activityId}`;
  } else {
    formData.value.targetUrl = '';
  }
};

// Handle task selection
const handleTaskSelection = (taskId: number) => {
  if (taskId) {
    // Set the target URL to the task ID
    formData.value.targetUrl = `task:${taskId}`;
  } else {
    formData.value.targetUrl = '';
  }
};

// Handle game platform selection
const handleGamePlatformSelection = (platformId: number) => {
  if (platformId) {
    // Set the target URL to the game platform ID
    formData.value.targetUrl = `game-platform:${platformId}`;
  } else {
    formData.value.targetUrl = '';
  }
};

// Load activities from API
const loadActivities = async () => {
  try {
    loadingActivities.value = true;
    console.log('🔄 Loading activities for banner form...');

    const response = await getActivityList({
      page: 1,
      pageSize: 100,
      // Removed status filter to show all activities
    });

    console.log('✅ Activities response:', response);

    if (response.list && response.list.length > 0) {
      console.log(' Raw activities:', response.list);

      // Extract title from config or use fallback
      activityOptions.value = response.list.map((activity: Activity) => {
        console.log(`🔍 Processing activity:`, activity);
        console.log(`   ID: ${activity.id}`);
        console.log(`   Type: ${activity.type}`);
        console.log(`   Category: ${activity.category}`);
        console.log(`   Config:`, activity.config);
        console.log(`   Config title: ${activity.config?.title}`);
        console.log(`   Direct title: ${activity.title}`);

        const title =
          activity.config?.title || activity.title || `Activity ${activity.id}`;
        console.log(` Final title for ${activity.id}: ${title}`);

        return {
          label: title,
          value: activity.id,
        };
      });

      console.log('✅ Final activity options:', activityOptions.value);
    } else {
      console.log('⚠️ No activities found in response');
      console.log('⚠️ Response structure:', response);
      activityOptions.value = [];
    }
  } catch (error) {
    console.error('❌ Failed to load activities:', error);
    message.error('加载活动列表失败');
    activityOptions.value = [];
  } finally {
    loadingActivities.value = false;
  }
};

// Load tasks from API
const loadTasks = async () => {
  try {
    loadingTasks.value = true;
    const response = await getTaskCenterList({
      page: 1,
      limit: 100,
      isActive: true,
    });

    if (response.data && response.data.length > 0) {
      taskOptions.value = response.data.map((task: TaskCenter) => ({
        label: task.title || `Task ${task.id}`,
        value: task.id,
      }));
    }
  } catch (error) {
    console.error('Failed to load tasks:', error);
    message.error('加载任务列表失败');
  } finally {
    loadingTasks.value = false;
  }
};

// Load game platforms from API
const loadGamePlatforms = async () => {
  try {
    loadingGamePlatforms.value = true;
    const response = await getGamePlatformListApi({
      page: 1,
      pageSize: 1000, // Get all platforms to show game counts
    });

    if (response.list && response.list.length > 0) {
      gamePlatformOptions.value = response.list.map(
        (platform: GamePlatformItem) => ({
          label: `${platform.platformName} (${platform.subGameCount} 游戏)`,
          value: platform.id,
        }),
      );
    }
  } catch (error) {
    console.error('Failed to load game platforms:', error);
    message.error('加载游戏平台列表失败');
  } finally {
    loadingGamePlatforms.value = false;
  }
};

// Ensure form data is always properly initialized
const ensureValidFormData = () => {
  // Validate startTime
  if (
    formData.value.startTime !== null &&
    formData.value.startTime !== undefined
  ) {
    const startTime = Number(formData.value.startTime);
    if (isNaN(startTime)) {
      console.warn('Invalid startTime value:', formData.value.startTime);
      formData.value.startTime = null;
    } else {
      formData.value.startTime = startTime;
    }
  }

  // Validate endTime
  if (formData.value.endTime !== null && formData.value.endTime !== undefined) {
    const endTime = Number(formData.value.endTime);
    if (isNaN(endTime)) {
      console.warn('Invalid endTime value:', formData.value.endTime);
      formData.value.endTime = null;
    } else {
      formData.value.endTime = endTime;
    }
  }
};

// Initialize form when component mounts
onMounted(() => {
  // Reset form to ensure proper initialization
  resetForm();
  ensureValidFormData();
  console.log('Form initialized with startTime:', formData.value.startTime);

  // Add a small delay to ensure the date picker is properly initialized
  setTimeout(() => {
    ensureValidFormData(); // Double-check after a delay
    console.log('Form data after initialization:', formData.value);
  }, 100);
});

// 计算属性
const isEditing = computed(() => !!props.editingItem);

// 选项配置
const languageOptions: SelectOption[] = [
  { label: '中文', value: 'zh-CN' },
  { label: '英文', value: 'en' },
  { label: '葡语', value: 'pt' },
  { label: '西班牙语', value: 'es' },
  { label: '日语', value: 'ja' },
];

const currencyOptions: SelectOption[] = [
  { label: 'BRL', value: 'BRL' },
  { label: 'CNY', value: 'CNY' },
  { label: 'USD', value: 'USD' },
  { label: 'EUR', value: 'EUR' },
  { label: 'JPY', value: 'JPY' },
];

const statusOptions: SelectOption[] = [
  { label: '已发布', value: 'active' },
  { label: '已下架', value: 'inactive' },
  { label: '草稿', value: 'draft' },
];

const jumpModeOptions: SelectOption[] = [
  { label: '无', value: 'none' },
  { label: '外部链接', value: 'external_link' },
  { label: '活动', value: 'activity' },
  { label: '任务', value: 'task' },
  { label: '充值', value: 'recharge' },
  { label: '返水', value: 'rebate' },
  { label: '代理', value: 'agent' },
  { label: 'VIP', value: 'vip' },
  { label: '利息宝', value: 'interest_treasure' },
  { label: '公积金', value: 'public_fund' },
  { label: '游戏', value: 'game' },
  { label: '盲盒抽奖', value: 'blind_box_lottery' },
  { label: '俱乐部申请（合作联营）', value: 'club_application' },
];

// 表单验证规则
const basicRules: FormRules = {
  bannerName: [
    { required: true, message: '请输入Banner名称', trigger: 'blur' },
    {
      min: 1,
      max: 100,
      message: 'Banner名称长度在1到100个字符',
      trigger: 'blur',
    },
  ],
  bannerImageUrl: [
    { required: true, message: '请上传Banner图片', trigger: 'blur' },
  ],
  language: [{ required: true, message: '请选择语言', trigger: 'change' }],
  currency: [{ required: true, message: '请选择币种', trigger: 'change' }],
  sortOrder: [
    {
      type: 'number',
      min: 0,
      max: 9999,
      message: '排序数值在0到9999之间',
      trigger: 'blur',
    },
  ],
  displayDuration: [
    {
      type: 'number',
      min: 1,
      max: 300,
      message: '停留时间在1到300秒之间',
      trigger: 'blur',
    },
  ],
};

const timeRules: FormRules = {
  startTime: [
    {
      required: true,
      message: '请选择开始时间',
      trigger: 'change',
      validator: (rule, value) => {
        // Check for null, undefined, or empty string, but allow 0 as valid
        if (value === null || value === undefined || value === '') {
          return new Error('请选择开始时间');
        }

        // Check if it's a valid number
        if (isNaN(value) || typeof value !== 'number') {
          return new Error('请选择有效的开始时间');
        }

        // Check if it's a reasonable timestamp (within 1 year from now)
        const now = Date.now();
        const oneYearFromNow = now + 365 * 24 * 60 * 60 * 1000;
        const oneYearAgo = now - 365 * 24 * 60 * 60 * 1000;

        if (value < oneYearAgo || value > oneYearFromNow) {
          return new Error('开始时间应在合理范围内');
        }

        return true;
      },
    },
  ],
};

const jumpRules: FormRules = {
  jumpMode: [{ required: true, message: '请选择跳转方式', trigger: 'change' }],
  targetUrl: [
    {
      validator: (rule, value) => {
        // Target URL is required only if jump mode is not 'none'
        if (
          formData.value.jumpMode !== 'none' &&
          (!value || value.trim() === '')
        ) {
          return new Error('请输入跳转目标');
        }
        return true;
      },
      trigger: 'blur',
    },
  ],
};

const advancedRules: FormRules = {
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
};

// 方法
const resetForm = () => {
  formData.value = {
    sortOrder: 0,
    bannerName: '',
    currency: 'BRL',
    language: 'pt',
    targetUrl: '', // Always default to empty string
    bannerImageUrl: '',
    displayDuration: 5,
    startTime: null,
    endTime: null,
    jumpMode: 'none',
    status: 'draft',
    remark: '',
    selectedActivityId: undefined,
    selectedTaskId: undefined,
    selectedGamePlatformId: undefined,
  };
  fileList.value = [];
  activeTab.value = 'basic';
  ensureValidFormData();
};

// 监听编辑项变化
watch(
  () => props.editingItem,
  (newItem) => {
    if (newItem) {
      // 安全地处理日期值
      const formatDateForPicker = (dateStr: string | null | undefined) => {
        if (!dateStr) return null;
        try {
          const date = new Date(dateStr);
          const timestamp = date.getTime();
          // Check if the date is valid and reasonable
          if (isNaN(timestamp)) {
            console.warn('Invalid date value:', dateStr);
            return null;
          }
          // Additional check for reasonable date range
          const now = Date.now();
          const oneYearAgo = now - 365 * 24 * 60 * 60 * 1000;
          const oneYearFromNow = now + 365 * 24 * 60 * 60 * 1000;
          if (timestamp < oneYearAgo || timestamp > oneYearFromNow) {
            console.warn('Date out of reasonable range:', dateStr);
            return null;
          }
          return timestamp;
        } catch (error) {
          console.error('Error parsing date:', error, dateStr);
          return null;
        }
      };

      formData.value = {
        sortOrder: newItem.sortOrder,
        bannerName: newItem.bannerName,
        currency: newItem.currency,
        language: newItem.language,
        targetUrl: newItem.targetUrl || '', // Always ensure empty string if undefined
        bannerImageUrl: newItem.bannerImageUrl,
        displayDuration: newItem.displayDuration,
        startTime: formatDateForPicker(newItem.startTime),
        endTime: formatDateForPicker(newItem.endTime),
        jumpMode: newItem.jumpMode,
        status: newItem.status,
        remark: newItem.remark || '',
        selectedActivityId: undefined, // Will be set based on targetUrl if it's an activity
      };

      // If jumpMode is 'activity' and targetUrl contains activity ID, set selectedActivityId
      if (
        newItem.jumpMode === 'activity' &&
        newItem.targetUrl &&
        typeof newItem.targetUrl === 'string'
      ) {
        const activityMatch = newItem.targetUrl.match(/activity:(\d+)/);
        if (activityMatch) {
          formData.value.selectedActivityId = parseInt(activityMatch[1]);
          // Load activities to populate the dropdown
          loadActivities();
        }
      }

      // If jumpMode is 'task' and targetUrl contains task ID, set selectedTaskId
      if (
        newItem.jumpMode === 'task' &&
        newItem.targetUrl &&
        typeof newItem.targetUrl === 'string'
      ) {
        const taskMatch = newItem.targetUrl.match(/task:(\d+)/);
        if (taskMatch) {
          formData.value.selectedTaskId = parseInt(taskMatch[1]);
          // Load tasks to populate the dropdown
          loadTasks();
        }
      }

      // If jumpMode is 'game' and targetUrl contains game platform ID, set selectedGamePlatformId
      if (
        newItem.jumpMode === 'game' &&
        newItem.targetUrl &&
        typeof newItem.targetUrl === 'string'
      ) {
        const gamePlatformMatch =
          newItem.targetUrl.match(/game-platform:(\d+)/);
        if (gamePlatformMatch) {
          formData.value.selectedGamePlatformId = parseInt(
            gamePlatformMatch[1],
          );
          // Load game platforms to populate the dropdown
          loadGamePlatforms();
        }
      }
      ensureValidFormData();
      console.log('Form data set for editing:', formData.value);
      // Reset file list when editing (since we're using existing image URL)
      fileList.value = [];
    } else {
      resetForm();
    }
  },
  { immediate: true },
);

const setTimeRange = (hours: number) => {
  const now = new Date();
  const endTime = new Date(now.getTime() + hours * 60 * 60 * 1000);

  formData.value.startTime = now.getTime();
  formData.value.endTime = endTime.getTime();
};

const validateAllForms = async (): Promise<boolean> => {
  const forms = [
    basicFormRef.value,
    timeFormRef.value,
    jumpFormRef.value,
    advancedFormRef.value,
  ];

  try {
    await Promise.all(forms.map((form) => form?.validate()));
    return true;
  } catch (error) {
    console.error('Form validation error:', error);
    return false;
  }
};

const handleSubmit = async () => {
  const isValid = await validateAllForms();
  if (!isValid) {
    message.error('请检查表单填写');
    return;
  }

  submitting.value = true;
  try {
    // 安全地转换时间戳为ISO字符串
    const safeDateToString = (timestamp: number | null): string => {
      if (!timestamp) {
        // Return current time if no timestamp provided
        return new Date().toISOString();
      }
      try {
        const date = new Date(timestamp);
        if (isNaN(date.getTime())) {
          console.warn('Invalid timestamp:', timestamp);
          // Return current time as fallback
          return new Date().toISOString();
        }
        return date.toISOString();
      } catch (error) {
        console.error(
          'Error converting timestamp to ISO string:',
          error,
          timestamp,
        );
        // Return current time as fallback
        return new Date().toISOString();
      }
    };

    // Prepare submit data with default endTime if not provided
    const getEndTimeValue = () => {
      const endTimeValue = safeDateToString(formData.value.endTime);
      if (endTimeValue && endTimeValue !== null && endTimeValue !== '') {
        return endTimeValue;
      }
      // If endTime is not set, use a far future date (year 2099)
      const farFutureDate = new Date('2099-12-31T23:59:59.999Z');
      return farFutureDate.toISOString();
    };

    // Clean up the form data before submission
    const submitData: any = {
      ...formData.value,
      startTime: safeDateToString(formData.value.startTime),
      endTime: getEndTimeValue(),
      // Convert string IDs to numbers if they exist
      selectedActivityId: formData.value.selectedActivityId
        ? Number(formData.value.selectedActivityId)
        : undefined,
      selectedTaskId: formData.value.selectedTaskId
        ? Number(formData.value.selectedTaskId)
        : undefined,
      selectedGamePlatformId: formData.value.selectedGamePlatformId
        ? Number(formData.value.selectedGamePlatformId)
        : undefined,
    };

    console.log('Submitting form data:', submitData);
    console.log('Jump mode:', submitData.jumpMode);
    console.log('Target URL:', submitData.targetUrl);
    console.log('Status:', submitData.status);
    console.log(
      'Selected Activity ID:',
      submitData.selectedActivityId,
      'Type:',
      typeof submitData.selectedActivityId,
    );
    console.log(
      'Selected Task ID:',
      submitData.selectedTaskId,
      'Type:',
      typeof submitData.selectedTaskId,
    );
    console.log(
      'Selected Game Platform ID:',
      submitData.selectedGamePlatformId,
      'Type:',
      typeof submitData.selectedGamePlatformId,
    );

    // 验证时间逻辑 - only if both times are provided
    if (submitData.startTime && submitData.endTime) {
      const startDate = new Date(submitData.startTime);
      const endDate = new Date(submitData.endTime);
      if (startDate >= endDate) {
        message.error('结束时间必须大于开始时间');
        return;
      }
    }

    if (isEditing.value && props.editingItem) {
      await updateBanner(props.editingItem.id, submitData);
      message.success('Banner更新成功');
    } else {
      await createBanner(submitData);
      message.success('Banner创建成功');
    }

    emit('success');
  } catch (error) {
    console.error('Submit error:', error);
    message.error(isEditing.value ? 'Banner更新失败' : 'Banner创建失败');
  } finally {
    submitting.value = false;
  }
};

const handleCancel = () => {
  modalShow.value = false;
};

// 处理媒体库图片选择
const handleBannerImageSelected = (file: any) => {
  formData.value.bannerImageUrl = file.url || '';
  message.success('Banner图片已选择');
};

// File upload handlers (保持兼容性)
const handleFileChange = (options: { fileList: UploadFileInfo[] }) => {
  const { fileList: newFileList } = options;
  if (newFileList.length > 0) {
    const file = newFileList[0];
    if (file.file) {
      // Convert file to base64 data URL for storage
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          formData.value.bannerImageUrl = e.target.result as string;
          message.success('图片已选择');
        }
      };
      reader.readAsDataURL(file.file);
    }
  }
};

const removeImage = () => {
  formData.value.bannerImageUrl = '';
  formData.value.bannerImageId = undefined;
  fileList.value = [];
  message.success('图片已删除');
};

const handleStartTimeChange = (value: number | null) => {
  console.log('Start time changed:', value, typeof value);
  // Ensure we always store a number (timestamp) or null
  if (value && typeof value === 'number' && !isNaN(value)) {
    formData.value.startTime = value;
  } else {
    formData.value.startTime = null;
  }
  ensureValidFormData();
};

const handleEndTimeChange = (value: number | null) => {
  console.log('End time changed:', value, typeof value);
  // Ensure we always store a number (timestamp) or null
  if (value && typeof value === 'number' && !isNaN(value)) {
    formData.value.endTime = value;
  } else {
    formData.value.endTime = null;
  }
  ensureValidFormData();
};

// 创建一个简单的占位符图片数据URL
const placeholderImageUrl =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5YWFhYSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkJhbm5lciBJbWFnZTwvdGV4dD48L3N2Zz4=';

const handleModalClose = () => {
  resetForm();
  nextTick(() => {
    // 重置表单验证状态
    basicFormRef.value?.restoreValidation();
    timeFormRef.value?.restoreValidation();
    jumpFormRef.value?.restoreValidation();
    advancedFormRef.value?.restoreValidation();
  });
};
</script>

<style scoped>
.grid {
  display: grid;
}

.grid-cols-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.gap-4 {
  gap: 1rem;
}

.text-sm {
  font-size: 0.875rem;
}

.font-medium {
  font-weight: 500;
}

.mb-2 {
  margin-bottom: 0.5rem;
}

.mb-4 {
  margin-bottom: 1rem;
}

.mt-2 {
  margin-top: 0.5rem;
}

.block {
  display: block;
}

.upload-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.image-preview {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 200px;
  height: 100px;
  background-color: #f5f5f5;
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
  overflow: hidden;
}

.image-preview .n-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-preview .image-actions {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  gap: 0.5rem;
  padding: 0.25rem;
  background-color: rgba(0, 0, 0, 0.5);
  border-bottom-left-radius: 4px;
}

.image-preview .image-actions .n-button {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  line-height: 1;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.image-preview .image-actions .n-button:hover {
  background-color: rgba(255, 255, 255, 0.3);
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 200px;
  height: 100px;
  background-color: #f5f5f5;
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
  color: #888;
  text-align: center;
  padding: 1rem;
}

.upload-placeholder .upload-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.upload-placeholder .upload-text {
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.upload-placeholder .upload-hint {
  font-size: 0.75rem;
  color: #666;
}

/* Banner预览样式 */
.banner-preview {
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 12px;
  background-color: #fafafa;
  margin-top: 8px;
}

.banner-preview-image {
  max-width: 100%;
  max-height: 150px;
  object-fit: contain;
  border-radius: 4px;
  border: 1px solid #d9d9d9;
}

.banner-preview-placeholder {
  width: 100%;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 14px;
  background-color: #f5f5f5;
  border-radius: 4px;
  border: 1px dashed #d9d9d9;
}
</style>
