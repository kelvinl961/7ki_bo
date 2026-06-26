<template>
  <n-modal
    v-model:show="modalShow"
    preset="dialog"
    :title="isEditing ? $t('operations.form.editPop') : $t('operations.form.addPop')"
    style="width: 900px"
    :mask-closable="false"
    @after-leave="handleModalClose"
  >
    <n-tabs v-model:value="activeTab" type="line" animated>
      <!-- 基本信息 -->
      <n-tab-pane name="basic" :tab="$t('operations.form.tabBasic')">
        <n-form
          ref="basicFormRef"
          :model="formData"
          :rules="basicRules"
          label-placement="top"
          label-width="auto"
        >
          <div class="grid grid-cols-2 gap-4">
            <n-form-item :label="$t('operations.messageSettings.language')" path="language">
              <n-select
                v-model:value="formData.language"
                :placeholder="$t('operations.messageSettings.selectLanguage')"
                :options="languageOptions"
              />
            </n-form-item>

            <n-form-item :label="$t('common.currency')" path="currency">
              <n-select
                v-model:value="formData.currency"
                :placeholder="$t('operations.messageSettings.selectCurrency')"
                :options="currencyOptions"
              />
            </n-form-item>

            <n-form-item :label="$t('operations.form.sortOptional')" path="sortOrder">
              <n-input-number
                v-model:value="formData.sortOrder"
                :placeholder="$t('operations.form.sortPlaceholder')"
                :min="0"
                :max="9999"
              />
            </n-form-item>

            <n-form-item :label="$t('operations.messageSettings.targetAudience')" path="targetAudience">
              <n-select
                v-model:value="formData.targetAudience"
                :placeholder="$t('operations.messageSettings.targetAudience')"
                :options="targetAudienceOptions"
              />
            </n-form-item>
          </div>

          <n-form-item :label="$t('operations.form.popTitle')" path="title">
            <n-input
              v-model:value="formData.title"
              :placeholder="$t('operations.form.popTitlePlaceholder')"
              clearable
            />
          </n-form-item>

          <n-form-item :label="$t('operations.form.popImageOptional')" path="imageUrl">
            <MediaLibrarySelector
              v-model="formData.imageUrl"
              category="popups"
              :accept-types="['image']"
              :placeholder="$t('operations.form.popImagePlaceholder')"
              @file-selected="handleImageSelected"
            />

            <!-- 预览区域 -->
            <div v-if="formData.imageUrl" class="mt-2">
              <div class="image-preview">
                <img
                  :src="getImageUrlByEnvironment(formData.imageUrl)"
                  :alt="$t('operations.form.popImagePreview')"
                  class="preview-image"
                />
              </div>
            </div>
          </n-form-item>

          <n-form-item :label="$t('operations.form.popContent')" path="content">
            <div class="rich-text-editor">
              <textarea
                v-model="formData.content"
                :placeholder="$t('operations.form.popContentPlaceholder')"
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
                  {{ $t('operations.form.htmlHint') }}
                </p>
              </div>
              <div class="editor-footer">
                <span class="text-xs text-gray-500">
                  {{ $t('operations.form.charCount', [getCharacterCount()]) }}
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
      <n-tab-pane name="time" :tab="$t('operations.form.tabTime')">
        <n-form
          ref="timeFormRef"
          :model="formData"
          :rules="timeRules"
          label-placement="top"
          label-width="auto"
        >
          <div class="grid grid-cols-2 gap-4">
            <n-form-item :label="$t('operations.messageSettings.startTime')" path="startTime">
              <n-date-picker
                v-model:value="formData.startTime"
                type="datetime"
                :placeholder="$t('operations.messageSettings.startTime')"
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

            <n-form-item :label="$t('operations.form.endTimeOptional')" path="endTime">
              <n-date-picker
                v-model:value="formData.endTime"
                type="datetime"
                :placeholder="$t('operations.messageSettings.endTime')"
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
            <label class="mb-2 block text-sm font-medium">{{ $t('operations.form.quickSetup') }}</label>
            <n-space>
              <n-button size="small" @click="setTimeRange(1)">{{ $t('operations.form.hour1') }}</n-button>
              <n-button size="small" @click="setTimeRange(6)">{{ $t('operations.form.hour6') }}</n-button>
              <n-button size="small" @click="setTimeRange(24)">{{ $t('operations.form.day1') }}</n-button>
              <n-button size="small" @click="setTimeRange(168)">{{ $t('operations.form.day7') }}</n-button>
              <n-button size="small" @click="setTimeRange(720)">{{ $t('operations.form.day30') }}</n-button>
            </n-space>
          </div>

          <n-alert type="info" :show-icon="false">
            <template #header>
              <span class="font-medium">{{ $t('operations.form.timeHint') }}</span>
            </template>
            <div class="text-sm">
              <p>• {{ $t('operations.form.timeStartHint') }}</p>
              <p>• {{ $t('operations.form.timeEndHint') }}</p>
              <p>• {{ $t('operations.form.timeOrderHint') }}</p>
            </div>
          </n-alert>
        </n-form>
      </n-tab-pane>

      <!-- 展示设置 -->
      <n-tab-pane name="display" :tab="$t('operations.form.tabDisplay')">
        <n-form
          ref="displayFormRef"
          :model="formData"
          :rules="displayRules"
          label-placement="top"
          label-width="auto"
        >
          <div class="grid grid-cols-2 gap-4">
            <n-form-item :label="$t('operations.form.maxDisplayTimes')" path="maxDisplayTimes">
              <n-input-number
                v-model:value="formData.maxDisplayTimes"
                :placeholder="$t('operations.form.maxDisplayPlaceholder')"
                :min="1"
                :max="999"
              />
            </n-form-item>

            <n-form-item :label="$t('operations.form.displayInterval')" path="displayInterval">
              <n-input-number
                v-model:value="formData.displayInterval"
                :placeholder="$t('operations.form.displayIntervalPlaceholder')"
                :min="1"
                :max="168"
              />
            </n-form-item>
          </div>

          <n-form-item :label="$t('operations.form.entryPoints')" path="entryPoints">
            <n-checkbox-group v-model:value="formData.entryPoints">
              <n-space vertical>
                <n-checkbox value="login">{{ $t('operations.form.afterLogin') }}</n-checkbox>
                <n-checkbox value="homepage">{{ $t('operations.form.homepageLoad') }}</n-checkbox>
                <n-checkbox value="deposit">{{ $t('operations.form.depositPage') }}</n-checkbox>
                <n-checkbox value="game_lobby">{{ $t('operations.form.gameLobby') }}</n-checkbox>
                <n-checkbox value="promotion">{{ $t('operations.form.promotionPage') }}</n-checkbox>
                <n-checkbox value="manual">{{ $t('operations.form.manualTrigger') }}</n-checkbox>
              </n-space>
            </n-checkbox-group>
          </n-form-item>

          <n-alert type="info" :show-icon="false">
            <template #header>
              <span class="font-medium">{{ $t('operations.form.displayHint') }}</span>
            </template>
            <div class="text-sm">
              <p>• {{ $t('operations.form.maxDisplayHint') }}</p>
              <p>• {{ $t('operations.form.intervalHint') }}</p>
              <p>• {{ $t('operations.form.entryHint') }}</p>
            </div>
          </n-alert>
        </n-form>
      </n-tab-pane>

      <!-- 跳转设置 -->
      <n-tab-pane name="jump" :tab="$t('operations.form.tabJump')">
        <n-form
          ref="jumpFormRef"
          :model="formData"
          :rules="jumpRules"
          label-placement="top"
          label-width="auto"
        >
          <div class="grid grid-cols-2 gap-4">
            <n-form-item :label="$t('operations.form.jumpType')" path="jumpType">
              <n-select
                v-model:value="formData.jumpType"
                :placeholder="$t('operations.form.jumpType')"
                :options="jumpTypeOptions"
              />
            </n-form-item>

            <n-form-item
              v-if="formData.jumpType !== 'none'"
              :label="$t('operations.messageSettings.jumpTarget')"
              path="targetUrl"
            >
              <n-input
                v-model:value="formData.targetUrl"
                :placeholder="$t('operations.form.jumpTargetPlaceholder')"
                clearable
              />
            </n-form-item>
          </div>

          <n-alert type="info" :show-icon="false">
            <template #header>
              <span class="font-medium">{{ $t('operations.form.jumpHint') }}</span>
            </template>
            <div class="text-sm">
              <p>• {{ $t('operations.form.jumpNoneHint') }}</p>
              <p>• {{ $t('operations.form.jumpExternalHint') }}</p>
              <p>• {{ $t('operations.form.jumpInternalHint') }}</p>
              <p>• {{ $t('operations.form.jumpGameHint') }}</p>
              <p>• {{ $t('operations.form.jumpActivityHint') }}</p>
            </div>
          </n-alert>
        </n-form>
      </n-tab-pane>

      <!-- 高级设置 -->
      <n-tab-pane name="advanced" :tab="$t('operations.form.tabAdvanced')">
        <n-form
          ref="advancedFormRef"
          :model="formData"
          :rules="advancedRules"
          label-placement="top"
          label-width="auto"
        >
          <n-form-item :label="$t('common.status')" path="status">
            <n-select
              v-model:value="formData.status"
              :placeholder="$t('operations.messageSettings.selectStatus')"
              :options="statusOptions"
            />
          </n-form-item>

          <n-form-item :label="$t('operations.form.isEnabled')">
            <n-switch
              v-model:value="formData.isActive"
              :checked-value="true"
              :unchecked-value="false"
            >
              <template #checked>{{ $t('common.enable') }}</template>
              <template #unchecked>{{ $t('common.disable') }}</template>
            </n-switch>
          </n-form-item>

          <n-form-item :label="$t('operations.messageSettings.backendRemark')">
            <n-input
              v-model:value="formData.remark"
              type="textarea"
              :placeholder="$t('operations.messageSettings.backendRemark')"
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
        <n-button @click="handleCancel">{{ $t('common.cancel') }}</n-button>
        <n-button type="primary" @click="handleSubmit" :loading="submitting">
          {{ isEditing ? $t('operations.form.update') : $t('operations.form.create') }}
        </n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { $t } from '@vben/locales';

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
  targetAudience: $t('operations.form.audienceRegular'),
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
  { label: $t('operations.messageSettings.option.langZh'), value: 'zh-CN' },
  { label: $t('operations.messageSettings.option.langEn'), value: 'en' },
  { label: $t('operations.messageSettings.option.langPt'), value: 'pt' },
  { label: $t('operations.messageSettings.option.langEs'), value: 'es' },
  { label: $t('operations.messageSettings.option.langJa'), value: 'ja' },
];

const currencyOptions: SelectOption[] = [
  { label: 'BRL', value: 'BRL' },
  { label: 'CNY', value: 'CNY' },
  { label: 'USD', value: 'USD' },
  { label: 'EUR', value: 'EUR' },
  { label: 'JPY', value: 'JPY' },
];

const statusOptions: SelectOption[] = [
  { label: $t('operations.form.statusActive'), value: 'active' },
  { label: $t('operations.form.statusExpired'), value: 'expired' },
  { label: $t('operations.messageSettings.option.statusDraft'), value: 'draft' },
  { label: $t('operations.form.statusInactive'), value: 'inactive' },
];

const jumpTypeOptions: SelectOption[] = [
  { label: $t('operations.messageSettings.option.jumpNone'), value: 'none' },
  { label: $t('operations.messageSettings.option.jumpExternal'), value: 'external_link' },
  { label: $t('operations.messageSettings.option.jumpActivity'), value: 'activity' },
  { label: $t('operations.messageSettings.option.jumpTask'), value: 'task' },
  { label: $t('operations.layout.deposit'), value: 'recharge' },
  { label: $t('operations.messageSettings.option.jumpRebate'), value: 'rebate' },
  { label: $t('operations.layout.agent'), value: 'agent' },
  { label: 'VIP', value: 'vip' },
  { label: $t('operations.messageSettings.option.jumpInterest'), value: 'interest_treasure' },
  { label: $t('operations.messageSettings.option.jumpPublicFund'), value: 'public_fund' },
  { label: $t('operations.messageSettings.option.jumpGame'), value: 'game' },
  { label: $t('operations.messageSettings.option.jumpBlindBox'), value: 'blind_box_lottery' },
  { label: $t('operations.messageSettings.option.jumpClub'), value: 'club_application' },
];

const targetAudienceOptions: SelectOption[] = [
  { label: $t('operations.form.audienceRegular'), value: 'regular' },
  { label: $t('operations.form.audienceVip'), value: 'vip' },
  { label: $t('operations.form.audienceNewUser'), value: 'new_user' },
  { label: $t('operations.form.audienceActive'), value: 'active' },
  { label: $t('operations.form.audienceDeposit'), value: 'deposit_user' },
  { label: $t('operations.form.audienceNoDeposit'), value: 'no_deposit_user' },
  { label: $t('operations.form.audienceAll'), value: 'all' },
];

// 表单验证规则
const basicRules: FormRules = {
  title: [
    { required: true, message: $t('common.pleaseEnterField', [$t('operations.form.popTitle')]), trigger: 'blur' },
    {
      min: 1,
      max: 100,
      message: $t('operations.form.titleLength'),
      trigger: 'blur',
    },
  ],
  imageUrl: [
    { required: false, message: $t('operations.form.imageOptional'), trigger: 'blur' },
  ],
  language: [{ required: true, message: $t('common.pleaseSelect') + ' ' + $t('operations.language'), trigger: 'change' }],
  currency: [{ required: true, message: $t('common.pleaseSelect') + ' ' + $t('common.currency'), trigger: 'change' }],
  targetAudience: [
    { required: true, message: $t('common.pleaseSelect') + ' ' + $t('operations.messageSettings.targetAudience'), trigger: 'change' },
  ],
  sortOrder: [
    {
      type: 'number',
      min: 0,
      max: 9999,
      message: $t('operations.form.sortRange'),
      trigger: 'blur',
    },
  ],
};

const timeRules: FormRules = {
  startTime: [
    {
      required: true,
      message: $t('common.pleaseSelect') + ' ' + $t('common.startTime'),
      trigger: 'change',
      validator: (rule, value) => {
        // Check for null, undefined, or empty string, but allow 0 as valid
        if (value === null || value === undefined || value === '') {
          return new Error($t('common.pleaseSelect') + ' ' + $t('common.startTime'));
        }

        // Check if it's a valid number
        if (isNaN(value) || typeof value !== 'number') {
          return new Error($t('operations.form.validStartTime'));
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
            return new Error($t('operations.form.validEndTime'));
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
      message: $t('operations.form.displayTimesRange'),
      trigger: 'blur',
    },
  ],
  displayInterval: [
    {
      type: 'number',
      min: 1,
      max: 168,
      message: $t('operations.form.intervalRange'),
      trigger: 'blur',
    },
  ],
  entryPoints: [
    {
      type: 'array',
      min: 1,
      message: $t('operations.form.selectEntry'),
      trigger: 'change',
    },
  ],
};

const jumpRules: FormRules = {
  jumpType: [{ required: true, message: $t('common.pleaseSelect') + ' ' + $t('operations.form.jumpType'), trigger: 'change' }],
  targetUrl: [
    {
      validator: (rule, value) => {
        // Target URL is required only if jump type is not 'none'
        if (
          formData.value.jumpType !== 'none' &&
          (!value || value.trim() === '')
        ) {
          return new Error($t('operations.form.enterJumpTarget'));
        }
        return true;
      },
      trigger: 'blur',
    },
  ],
};

const advancedRules: FormRules = {
  status: [{ required: true, message: $t('common.pleaseSelect') + ' ' + $t('common.status'), trigger: 'change' }],
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
    targetAudience: $t('operations.form.audienceRegular'),
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
    message.error($t('operations.form.checkForm'));
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
        message.error($t('operations.form.endAfterStart'));
        return;
      }
    }

    if (isEditing.value && props.editingItem) {
      await updatePopModal(props.editingItem.id, submitData);
      message.success($t('operations.form.popUpdateSuccess'));
    } else {
      await createPopModal(submitData);
      message.success($t('operations.form.popCreateSuccess'));
    }

    emit('success');
  } catch (error) {
    console.error('Submit error:', error);
    message.error(isEditing.value ? $t('operations.form.popUpdateFailed') : $t('operations.form.popCreateFailed'));
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
