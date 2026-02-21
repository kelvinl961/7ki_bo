<template>
  <n-modal
    v-model:show="modalShow"
    preset="dialog"
    :title="isEditing ? '编辑弹窗' : '新增弹窗'"
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

            <n-form-item label="受众" path="targetAudience">
              <n-select
                v-model:value="formData.targetAudience"
                placeholder="选择受众"
                :options="targetAudienceOptions"
              />
            </n-form-item>
          </div>

          <n-form-item label="弹窗标题" path="title">
            <n-input
              v-model:value="formData.title"
              placeholder="请输入弹窗标题"
              clearable
            />
          </n-form-item>

          <n-form-item label="弹窗图片（可选）" path="imageUrl">
            <MediaLibrarySelector
              v-model="formData.imageUrl"
              category="popups"
              :accept-types="['image']"
              placeholder="从媒体库选择弹窗图片"
              @file-selected="handleImageSelected"
            />

            <!-- 预览区域 -->
            <div v-if="formData.imageUrl" class="mt-2">
              <div class="image-preview">
                <img
                  :src="getImageUrlByEnvironment(formData.imageUrl)"
                  alt="弹窗图片预览"
                  class="preview-image"
                />
              </div>
            </div>
          </n-form-item>

          <n-form-item label="弹窗内容" path="content">
            <div class="rich-text-editor">
              <textarea
                v-model="formData.content"
                placeholder="请输入弹窗内容，支持HTML格式..."
                rows="8"
                style="
                  width: 100%;
                  min-height: 200px;
                  padding: 8px;
                  border: 1px solid #d1d5db;
                  border-radius: 4px;
                  font-family: inherit;
                  resize: vertical;
                "
                @input="handleEditorChange"
              />
              <div class="mt-2 text-xs text-gray-500">
                <p>
                  支持HTML标签，例如：&lt;b&gt;粗体&lt;/b&gt;、&lt;i&gt;斜体&lt;/i&gt;、&lt;br&gt;换行等
                </p>
              </div>
              <div class="editor-footer">
                <span class="text-xs text-gray-500">
                  {{ getCharacterCount() }} 个字符
                </span>
                <span class="text-xs text-gray-500">
                  {{ getCharacterCount() }}/500
                </span>
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
              <p>• 开始时间：弹窗开始显示的时间（必填）</p>
              <p>• 结束时间：弹窗停止显示的时间（可选，不设置则长期有效）</p>
              <p>• 请确保结束时间大于开始时间</p>
            </div>
          </n-alert>
        </n-form>
      </n-tab-pane>

      <!-- 展示设置 -->
      <n-tab-pane name="display" tab="展示设置">
        <n-form
          ref="displayFormRef"
          :model="formData"
          :rules="displayRules"
          label-placement="top"
          label-width="auto"
        >
          <div class="grid grid-cols-2 gap-4">
            <n-form-item label="最大显示次数" path="maxDisplayTimes">
              <n-input-number
                v-model:value="formData.maxDisplayTimes"
                placeholder="输入最大显示次数"
                :min="1"
                :max="999"
              />
            </n-form-item>

            <n-form-item label="显示间隔（小时）" path="displayInterval">
              <n-input-number
                v-model:value="formData.displayInterval"
                placeholder="输入显示间隔"
                :min="1"
                :max="168"
              />
            </n-form-item>
          </div>

          <n-form-item label="展示入口" path="entryPoints">
            <n-checkbox-group v-model:value="formData.entryPoints">
              <n-space vertical>
                <n-checkbox value="login">登录后弹窗</n-checkbox>
                <n-checkbox value="homepage">首页加载</n-checkbox>
                <n-checkbox value="deposit">充值页面</n-checkbox>
                <n-checkbox value="game_lobby">游戏大厅</n-checkbox>
                <n-checkbox value="promotion">活动页面</n-checkbox>
                <n-checkbox value="manual">手动触发</n-checkbox>
              </n-space>
            </n-checkbox-group>
          </n-form-item>

          <n-alert type="info" :show-icon="false">
            <template #header>
              <span class="font-medium">展示说明</span>
            </template>
            <div class="text-sm">
              <p>• 最大显示次数：单个用户最多看到弹窗的次数</p>
              <p>• 显示间隔：两次显示之间的最小间隔时间</p>
              <p>• 展示入口：弹窗在哪些页面或场景下显示</p>
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
            <n-form-item label="跳转类型" path="jumpType">
              <n-select
                v-model:value="formData.jumpType"
                placeholder="选择跳转类型"
                :options="jumpTypeOptions"
              />
            </n-form-item>

            <n-form-item
              v-if="formData.jumpType !== 'none'"
              label="跳转目标"
              path="targetUrl"
            >
              <n-input
                v-model:value="formData.targetUrl"
                placeholder="请输入跳转目标URL或ID"
                clearable
              />
            </n-form-item>
          </div>

          <n-alert type="info" :show-icon="false">
            <template #header>
              <span class="font-medium">跳转说明</span>
            </template>
            <div class="text-sm">
              <p>• 无跳转：点击弹窗无任何响应</p>
              <p>• 外链跳转：跳转到外部网站，需要完整URL</p>
              <p>• 内部功能：跳转到系统内部页面</p>
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
          <n-form-item label="状态" path="status">
            <n-select
              v-model:value="formData.status"
              placeholder="选择状态"
              :options="statusOptions"
            />
          </n-form-item>

          <n-form-item label="是否启用">
            <n-switch
              v-model:value="formData.isActive"
              :checked-value="true"
              :unchecked-value="false"
            >
              <template #checked>启用</template>
              <template #unchecked>停用</template>
            </n-switch>
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
import { ref, computed, watch, nextTick, onMounted } from 'vue';
import {
  NModal,
  NTabs,
  NTabPane,
  NForm,
  NFormItem,
  NInput,
  NInputNumber,
  NSelect,
  NDatePicker,
  NButton,
  NSpace,
  NAlert,
  NImage,
  NCheckboxGroup,
  NCheckbox,
  NSwitch,
  useMessage,
  type FormInst,
  type FormRules,
  type SelectOption,
} from 'naive-ui';
import {
  createPopModal,
  updatePopModal,
  type LobbyPopModal,
  type LobbyPopModalCreateRequest,
} from '#/api/lobbyPopModal';
// ✅ PERFORMANCE FIX: Lazy load components to avoid blocking modal load
import { defineAsyncComponent } from 'vue';
const MediaLibrarySelector = defineAsyncComponent(
  () => import('#/components/MediaLibrarySelector.vue'),
);
import type { MediaFile } from '#/api/mediaLibrary';
import { getImageUrlByEnvironment } from '../../../utils/imageUtils';
// Removed TinyMCE import - using simple textarea instead

// Props
interface Props {
  show: boolean;
  editingItem?: LobbyPopModal | null;
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

// 表单引用
const basicFormRef = ref<FormInst | null>(null);
const timeFormRef = ref<FormInst | null>(null);
const displayFormRef = ref<FormInst | null>(null);
const jumpFormRef = ref<FormInst | null>(null);
const advancedFormRef = ref<FormInst | null>(null);

// 表单数据
const formData = ref<
  LobbyPopModalCreateRequest & {
    startTime: number | null;
    endTime: number | null;
  }
>({
  sortOrder: 0,
  title: '',
  currency: 'BRL',
  language: 'pt',
  imageUrl: '',
  content: '', // Rich text content
  targetAudience: '娱乐位普通会员',
  entryPoints: [],
  jumpType: 'none',
  targetUrl: '', // Always default to empty string
  startTime: null,
  endTime: null,
  status: 'draft',
  isActive: true,
  maxDisplayTimes: 1,
  displayInterval: 24,
  remark: '',
});

// Rich text editor - using formData.content directly

// Simple textarea configuration
const editorLoaded = ref(true); // Always loaded for textarea

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
  resetForm();
  ensureValidFormData();
});

// 计算属性
const isEditing = computed(() => !!props.editingItem);

// Removed API key status - no longer using TinyMCE

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
  { label: '生效中', value: 'active' },
  { label: '已过期', value: 'expired' },
  { label: '草稿', value: 'draft' },
  { label: '已停用', value: 'inactive' },
];

const jumpTypeOptions: SelectOption[] = [
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

const targetAudienceOptions: SelectOption[] = [
  { label: '娱乐位普通会员', value: '娱乐位普通会员' },
  { label: 'VIP会员', value: 'VIP会员' },
  { label: '新注册用户', value: '新注册用户' },
  { label: '活跃用户', value: '活跃用户' },
  { label: '充值用户', value: '充值用户' },
  { label: '未充值用户', value: '未充值用户' },
  { label: '全部用户', value: '全部用户' },
];

// 表单验证规则
const basicRules: FormRules = {
  title: [
    { required: true, message: '请输入弹窗标题', trigger: 'blur' },
    {
      min: 1,
      max: 100,
      message: '弹窗标题长度在1到100个字符',
      trigger: 'blur',
    },
  ],
  imageUrl: [
    { required: false, message: '弹窗图片为可选字段', trigger: 'blur' },
  ],
  language: [{ required: true, message: '请选择语言', trigger: 'change' }],
  currency: [{ required: true, message: '请选择币种', trigger: 'change' }],
  targetAudience: [
    { required: true, message: '请选择受众', trigger: 'change' },
  ],
  sortOrder: [
    {
      type: 'number',
      min: 0,
      max: 9999,
      message: '排序数值在0到9999之间',
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

        return true;
      },
    },
  ],
  endTime: [
    {
      required: false,
      trigger: 'change',
      validator: (rule, value) => {
        // If value is provided, validate it
        if (value !== null && value !== undefined && value !== '') {
          // Check if it's a valid number
          if (isNaN(value) || typeof value !== 'number') {
            return new Error('请选择有效的结束时间');
          }
        }

        return true;
      },
    },
  ],
};

const displayRules: FormRules = {
  maxDisplayTimes: [
    {
      type: 'number',
      min: 1,
      max: 999,
      message: '最大显示次数在1到999之间',
      trigger: 'blur',
    },
  ],
  displayInterval: [
    {
      type: 'number',
      min: 1,
      max: 168,
      message: '显示间隔在1到168小时之间',
      trigger: 'blur',
    },
  ],
  entryPoints: [
    {
      type: 'array',
      min: 1,
      message: '请至少选择一个展示入口',
      trigger: 'change',
    },
  ],
};

const jumpRules: FormRules = {
  jumpType: [{ required: true, message: '请选择跳转类型', trigger: 'change' }],
  targetUrl: [
    {
      validator: (rule, value) => {
        // Target URL is required only if jump type is not 'none'
        if (
          formData.value.jumpType !== 'none' &&
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
    title: '',
    currency: 'BRL',
    language: 'pt',
    imageUrl: '',
    content: '', // Rich text content
    targetAudience: '娱乐位普通会员',
    entryPoints: ['login'],
    jumpType: 'none',
    targetUrl: '', // Always default to empty string
    startTime: null,
    endTime: null,
    status: 'draft',
    isActive: true,
    maxDisplayTimes: 1,
    displayInterval: 24,
    remark: '',
  };
  formData.value.content = '';
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
          return timestamp;
        } catch (error) {
          console.error('Error parsing date:', error, dateStr);
          return null;
        }
      };

      formData.value = {
        sortOrder: newItem.sortOrder,
        title: newItem.title,
        currency: newItem.currency,
        language: newItem.language,
        imageUrl: newItem.imageUrl,
        content: newItem.content || '', // Rich text content
        targetAudience: newItem.targetAudience,
        entryPoints: newItem.entryPoints || [],
        jumpType: newItem.jumpType,
        targetUrl: newItem.targetUrl || '', // Always ensure empty string if undefined
        startTime: formatDateForPicker(newItem.startTime),
        endTime: formatDateForPicker(newItem.endTime),
        status: newItem.status,
        isActive: newItem.isActive,
        maxDisplayTimes: newItem.maxDisplayTimes,
        displayInterval: newItem.displayInterval,
        remark: newItem.remark || '',
      };
      // Content is already set in formData above
      ensureValidFormData();
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
    displayFormRef.value,
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
      if (!timestamp) return new Date('2099-12-31T23:59:59.999Z').toISOString();
      try {
        const date = new Date(timestamp);
        if (isNaN(date.getTime())) {
          console.warn('Invalid timestamp:', timestamp);
          return new Date('2099-12-31T23:59:59.999Z').toISOString();
        }
        return date.toISOString();
      } catch (error) {
        console.error(
          'Error converting timestamp to ISO string:',
          error,
          timestamp,
        );
        return new Date('2099-12-31T23:59:59.999Z').toISOString();
      }
    };

    const submitData = {
      ...formData.value,
      startTime: safeDateToString(formData.value.startTime),
      endTime: safeDateToString(formData.value.endTime),
    };

    console.log('Submitting form data:', submitData);

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
      await updatePopModal(props.editingItem.id, submitData);
      message.success('弹窗更新成功');
    } else {
      await createPopModal(submitData);
      message.success('弹窗创建成功');
    }

    emit('success');
  } catch (error) {
    console.error('Submit error:', error);
    message.error(isEditing.value ? '弹窗更新失败' : '弹窗创建失败');
  } finally {
    submitting.value = false;
  }
};

const handleCancel = () => {
  modalShow.value = false;
};

const handleImageSelected = (file: MediaFile) => {
  formData.value.imageUrl = file.url;
  console.log('Selected popup image:', file.filename, file.url);
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
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5YWFhYSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuW8ueepuuWbvueJhzwvdGV4dD48L3N2Zz4=';

// Rich text editor functions
const handleEditorChange = (event: Event) => {
  const content = (event.target as HTMLTextAreaElement).value;
  console.log('Textarea content changed:', content);
  formData.value.content = content;
  // Update character count
  const plainText = content.replace(/<[^>]*>/g, '');
  characterCount.value = plainText.length;
};

const getCharacterCount = () => {
  return (formData.value.content || '').replace(/<[^>]*>/g, '').length;
};

const handleModalClose = () => {
  resetForm();
  nextTick(() => {
    // 重置表单验证状态
    basicFormRef.value?.restoreValidation();
    timeFormRef.value?.restoreValidation();
    displayFormRef.value?.restoreValidation();
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

.rich-text-editor {
  border-radius: 6px;
  overflow: hidden;
}

.rich-text-editor textarea {
  display: block;
  width: 100%;
  min-height: 200px;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.5;
  resize: vertical;
  background-color: white;
}

.rich-text-editor textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.editor-loading {
  padding: 20px;
  text-align: center;
  background-color: #f9fafb;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  color: #6b7280;
}

.editor-footer {
  display: flex;
  justify-content: space-between;
  padding: 4px 12px;
  background-color: #f9fafb;
  border-top: 1px solid #d1d5db;
  font-size: 0.75rem;
  color: #6b7280;
}

.field-hint {
  margin-top: 4px;
  font-size: 0.75rem;
  color: #6b7280;
}

.image-preview {
  border: 1px solid #d1d5db;
  border-radius: 4px;
  padding: 8px;
  background-color: #f9fafb;
}

.preview-image {
  max-width: 100%;
  max-height: 200px;
  object-fit: contain;
}

.block {
  display: block;
}

.field-hint {
  margin-top: 4px;
  font-size: 12px;
  color: #999;
  line-height: 1.4;
}

/* Image预览样式 */
.image-preview {
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 12px;
  background-color: #fafafa;
  margin-top: 8px;
  display: flex;
  justify-content: center;
}

.preview-image {
  max-width: 200px;
  max-height: 100px;
  object-fit: contain;
  border-radius: 4px;
  border: 1px solid #d9d9d9;
}
</style>
