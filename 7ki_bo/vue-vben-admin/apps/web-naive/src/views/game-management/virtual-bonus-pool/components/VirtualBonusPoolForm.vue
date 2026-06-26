<template>
  <div class="virtual-bonus-pool-form">
    <n-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-placement="left"
      label-width="120px"
      size="medium"
      :show-require-mark="false"
    >
      
      <n-form-item label="ID">
        <n-input
          :value="formData.id ? formData.id.toString() : $t('game.virtualBonusPool.autoGenerate')"
          disabled
          :placeholder="$t('game.virtualBonusPool.autoGenerate')"
        />
      </n-form-item>

      
      <n-form-item :label="$t('common.currency')" path="currency">
        <n-select
          v-model:value="formData.currency"
          :placeholder="$t('game.virtualBonusPool.selectCurrencyRequired')"
          :options="currencyOptions"
        />
      </n-form-item>

      
      <n-form-item :label="$t('game.virtualBonusPool.displayMethod')" path="displayType">
        <n-radio-group v-model:value="formData.displayType" name="displayType">
          <n-space>
            <n-radio value="single">{{ $t('game.virtualBonusPool.displaySingle') }}</n-radio>
            <n-radio value="multiple">{{ $t('game.virtualBonusPool.displayMultiple') }}</n-radio>
          </n-space>
        </n-radio-group>
      </n-form-item>

      
      <n-form-item :label="$t('game.virtualBonusPool.displayPosition')" path="displayPosition">
        <n-select
          v-model:value="formData.displayPosition"
          :placeholder="$t('game.virtualBonusPool.selectDisplayPositionRequired')"
          :options="displayPositionOptions"
        />
      </n-form-item>

      
      <n-form-item :label="$t('game.virtualBonusPool.clickTarget')" path="clickTarget">
        <n-select
          v-model:value="formData.clickTarget"
          :placeholder="$t('game.virtualBonusPool.selectClickTargetRequired')"
          :options="clickTargetOptions"
        />
      </n-form-item>

      
      <n-form-item :label="$t('game.virtualBonusPool.maxAmount')" path="maxAmount">
        <n-input-number
          v-model:value="formData.maxAmount"
          :placeholder="$t('game.virtualBonusPool.enterMaxAmount')"
          style="width: 100%"
          :min="0"
          :precision="2"
          :default-value="0"
          show-button
          clearable
        />
      </n-form-item>

      
      <n-form-item :label="$t('game.virtualBonusPool.minAmount')" path="minAmount">
        <n-input-number
          v-model:value="formData.minAmount"
          :placeholder="$t('game.virtualBonusPool.enterMinAmount')"
          style="width: 100%"
          :min="0"
          :precision="2"
          :default-value="0"
          show-button
          clearable
        />
      </n-form-item>

      
      <n-form-item :label="$t('game.virtualBonusPool.decimalPlaces')" path="decimalPlaces">
        <n-input-number
          v-model:value="formData.decimalPlaces"
          :placeholder="$t('game.virtualBonusPool.enterDecimalPlaces')"
          style="width: 100%"
          :min="0"
          :max="8"
          :precision="0"
          :default-value="2"
          show-button
          clearable
        />
      </n-form-item>

      
      <n-form-item :label="$t('game.virtualBonusPool.numberStyle')" path="numberStyle">
        <div class="w-full">
          <!-- Media Library Selector -->
          <MediaLibrarySelector
            v-model="formData.numberStyle"
            category="icons"
            :accept-types="['image']"
            :placeholder="$t('game.virtualBonusPool.selectNumberStyle')"
            @file-selected="handleNumberStyleSelected"
          />

          <!-- Preview -->
          <div v-if="formData.numberStyle" class="mt-3">
            <div class="mb-2 text-sm text-gray-600">{{ $t('game.virtualBonusPool.preview') }}:</div>

            <!-- Image Preview (if it's a URL) -->
            <div
              v-if="isImageUrl(formData.numberStyle)"
              class="h-24 w-24 overflow-hidden rounded-lg border"
            >
              <img
                :src="formData.numberStyle"
                :alt="'Number Style Preview'"
                class="h-full w-full object-cover"
                @error="
                  console.error('❌ Image load error:', formData.numberStyle)
                "
                @load="
                  console.log(
                    '✅ Image loaded successfully:',
                    formData.numberStyle,
                  )
                "
              />
              <div class="mt-1 text-xs text-gray-500">
                URL: {{ formData.numberStyle }}
              </div>
            </div>

            <!-- Preset Style Preview (if it's a preset) -->
            <div
              v-else
              class="flex h-24 w-24 items-center justify-center overflow-hidden rounded-lg border bg-gray-100"
            >
              <div class="text-center">
                <div
                  class="text-lg font-bold"
                  :style="getPresetNumberStyle(formData.numberStyle)"
                >
                  Aa
                </div>
                <div class="mt-1 text-xs text-gray-500">
                  {{ $t('game.virtualBonusPool.presetStyle') }}: {{ formData.numberStyle }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </n-form-item>

      
      <n-form-item :label="$t('game.virtualBonusPool.backgroundStyle')" path="backgroundStyle">
        <div class="w-full">
          <!-- Media Library Selector -->
          <MediaLibrarySelector
            v-model="formData.backgroundStyle"
            category="backgrounds"
            :accept-types="['image']"
            :placeholder="$t('game.virtualBonusPool.selectBgStyle')"
            @file-selected="handleBackgroundStyleSelected"
          />

          <!-- Preview -->
          <div v-if="formData.backgroundStyle" class="mt-3">
            <div class="mb-2 text-sm text-gray-600">{{ $t('game.virtualBonusPool.preview') }}:</div>

            <!-- Image Preview (if it's a URL) -->
            <div
              v-if="isImageUrl(formData.backgroundStyle)"
              class="h-20 w-32 overflow-hidden rounded-lg border"
            >
              <img
                :src="formData.backgroundStyle"
                :alt="'Background Style Preview'"
                class="h-full w-full object-cover"
                @error="
                  console.error(
                    '❌ Background image load error:',
                    formData.backgroundStyle,
                  )
                "
                @load="
                  console.log(
                    '✅ Background image loaded successfully:',
                    formData.backgroundStyle,
                  )
                "
              />
              <div class="mt-1 text-xs text-gray-500">
                URL: {{ formData.backgroundStyle }}
              </div>
            </div>

            <!-- Preset Style Preview (if it's a preset) -->
            <div
              v-else
              class="flex h-20 w-32 items-center justify-center overflow-hidden rounded-lg border"
              :style="getPresetBackgroundStyle(formData.backgroundStyle)"
            >
              <div class="text-center text-white">
                <div class="text-sm font-bold">{{ $t('game.virtualBonusPool.bgStyleLabel') }}</div>
                <div class="mt-1 text-xs opacity-75">
                  {{ $t('game.virtualBonusPool.preset') }}: {{ formData.backgroundStyle }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </n-form-item>
      
      <n-form-item :label="$t('game.virtualBonusPool.livePreview')">
        <div class="live-preview-section">
          <div class="preview-container">
            <div
              class="bonus-pool-preview"
              :class="`number-${formData.numberStyle}`"
              :style="getBackgroundStyle()"
            >
              <div class="pool-amount">
                <div class="amount-with-style" :style="getNumberStyleText()">
                  <span class="currency">{{
                    getCurrencySymbol(formData.currency)
                  }}</span>
                  <span class="amount" ref="amountRef">{{
                    displayAmount
                  }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="preview-controls">
            <n-button size="small" @click="startCountAnimation">{{ $t('game.virtualBonusPool.playAnimation') }}</n-button>
            <n-button size="small" @click="resetAnimation"> {{ $t('common.reset') }} </n-button>
          </div>
        </div>
      </n-form-item>

      
      <n-form-item :label="$t('common.status')" path="status">
        <n-switch v-model:value="formData.status">
          <template #checked>{{ $t('common.enable') }}</template>
          <template #unchecked>{{ $t('common.disabled') }}</template>
        </n-switch>
      </n-form-item>

      
      <n-form-item :label="$t('common.remark')" path="remark">
        <n-input
          v-model:value="formData.remark"
          type="textarea"
          :placeholder="$t('game.virtualBonusPool.enterRemarkMax200')"
          :maxlength="200"
          show-count
          :autosize="{ minRows: 3, maxRows: 6 }"
        />
      </n-form-item>
    </n-form>

    
    <div class="form-footer">
      <n-space justify="center" :size="16">
        <n-button @click="handleCancel" size="medium">{{ $t('common.cancel') }}</n-button>
        <n-button
          type="primary"
          @click="handleSubmit"
          :loading="submitting"
          size="medium"
        >{{ $t('game.virtualBonusPool.confirm') }}</n-button>
      </n-space>
    </div>
  </div>
</template>

<script setup lang="ts">
import { $t } from '@vben/locales';

import { ref, reactive, watch, onMounted } from 'vue';
import {
  NForm,
  NFormItem,
  NInput,
  NInputNumber,
  NSelect,
  NRadioGroup,
  NRadio,
  NSwitch,
  NButton,
  NSpace,
  NTabs,
  NTabPane,
  NSpin,
  useMessage,
  type FormInst,
  type FormRules,
} from 'naive-ui';
// ✅ PERFORMANCE FIX: Lazy load components to avoid blocking modal load
import { defineAsyncComponent } from 'vue';
const MediaLibrarySelector = defineAsyncComponent(
  () => import('#/components/MediaLibrarySelector.vue'),
);
import { getMediaFiles, type MediaFile } from '#/api/mediaLibrary';
import { getImageUrlByEnvironment } from '../../../../utils/imageUtils';

// Props
interface Props {
  data?: any;
  mode: 'add' | 'edit';
}

const props = withDefaults(defineProps<Props>(), {
  data: null,
});

// Emits
const emit = defineEmits<{
  submit: [data: any];
  cancel: [];
}>();

// Message
const message = useMessage();

// Form ref
const formRef = ref<FormInst>();
const submitting = ref(false);
// Removed unused variables - now using MediaLibrarySelector directly
const amountRef = ref<HTMLElement>();
const displayAmount = ref('0.00');
const isAnimating = ref(false);

// Form data
const formData = reactive({
  id: null as number | null,
  currency: '',
  displayType: 'single',
  displayPosition: '',
  clickTarget: '',
  maxAmount: 0,
  minAmount: 0,
  decimalPlaces: 2,
  numberStyle: 'style1',
  numberStyleType: 'default',
  backgroundStyle: 'style1',
  status: true,
  remark: '',
});

// Options
const currencyOptions = [
  { label: $t('game.virtualBonusPool.currencyBrl'), value: 'BRL' },
  { label: $t('game.virtualBonusPool.currencyUsd'), value: 'USD' },
  { label: $t('game.virtualBonusPool.currencyEur'), value: 'EUR' },
  { label: $t('game.virtualBonusPool.currencyCny'), value: 'CNY' },
  { label: $t('game.virtualBonusPool.currencyJpy'), value: 'JPY' },
];

const displayPositionOptions = [
  { label: $t('game.virtualBonusPool.posHotAbove'), value: '热门上方' },
  { label: $t('game.virtualBonusPool.posHotBelow'), value: '热门下方' },
  { label: $t('game.virtualBonusPool.posHomeTop'), value: '首页顶部' },
  { label: $t('game.virtualBonusPool.posGameLobby'), value: '游戏大厅' },
  { label: $t('game.virtualBonusPool.posProfile'), value: '个人中心' },
];

const clickTargetOptions = [
  { label: $t('game.virtualBonusPool.posGameLobby'), value: '/games' },
  { label: $t('game.virtualBonusPool.targetRecharge'), value: '/recharge' },
  { label: $t('game.virtualBonusPool.targetActivities'), value: '/activities' },
  { label: $t('game.virtualBonusPool.posProfile'), value: '/profile' },
  { label: $t('game.virtualBonusPool.targetNone'), value: '' },
];

const numberStyleOptions = [
  {
    label: $t('game.virtualBonusPool.style1'),
    value: 'style1',
    previewStyle: {
      color: '#ff6b35',
      fontSize: '18px',
      fontWeight: 'bold',
      fontFamily: 'Arial, sans-serif',
    },
  },
  {
    label: $t('game.virtualBonusPool.style2'),
    value: 'style2',
    previewStyle: {
      color: '#4ecdc4',
      fontSize: '18px',
      fontWeight: 'bold',
      fontFamily: 'Arial, sans-serif',
    },
  },
  {
    label: $t('game.virtualBonusPool.style3'),
    value: 'style3',
    previewStyle: {
      color: '#45b7d1',
      fontSize: '18px',
      fontWeight: 'bold',
      fontFamily: 'Arial, sans-serif',
    },
  },
  {
    label: $t('game.virtualBonusPool.style4'),
    value: 'style4',
    previewStyle: {
      color: '#f39c12',
      fontSize: '18px',
      fontWeight: 'bold',
      fontFamily: 'Arial, sans-serif',
    },
  },
  {
    label: $t('game.virtualBonusPool.style5'),
    value: 'style5',
    previewStyle: {
      color: '#e74c3c',
      fontSize: '18px',
      fontWeight: 'bold',
      fontFamily: 'Arial, sans-serif',
    },
  },
];

const backgroundStyleOptions = [
  {
    label: $t('game.virtualBonusPool.style1'),
    value: 'style1',
    previewStyle: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
    },
  },
  {
    label: $t('game.virtualBonusPool.style2'),
    value: 'style2',
    previewStyle: {
      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      color: 'white',
    },
  },
  {
    label: $t('game.virtualBonusPool.style3'),
    value: 'style3',
    previewStyle: {
      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      color: 'white',
    },
  },
  {
    label: $t('game.virtualBonusPool.style4'),
    value: 'style4',
    previewStyle: {
      background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      color: 'white',
    },
  },
  {
    label: $t('game.virtualBonusPool.style5'),
    value: 'style5',
    previewStyle: {
      background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      color: 'white',
    },
  },
];

// Validation rules
const rules: FormRules = {
  currency: [
    { required: true, message: $t('game.virtualBonusPool.selectCurrencyRequired'), trigger: ['blur', 'change'] },
  ],
  displayType: [
    { required: true, message: $t('game.virtualBonusPool.selectDisplayMethodRequired'), trigger: ['blur', 'change'] },
  ],
  displayPosition: [
    { required: true, message: $t('game.virtualBonusPool.selectDisplayPositionRequired'), trigger: ['blur', 'change'] },
  ],
  clickTarget: [
    {
      validator: (rule: any, value: any) => {
        return value !== null && value !== undefined;
      },
      message: $t('game.virtualBonusPool.selectClickTargetRequired'),
      trigger: ['blur', 'change'],
    },
  ],
  maxAmount: [
    {
      required: true,
      type: 'number',
      message: $t('game.virtualBonusPool.enterMaxAmountRequired'),
      trigger: ['blur', 'change'],
    },
  ],
  minAmount: [
    {
      required: true,
      type: 'number',
      message: $t('game.virtualBonusPool.enterMinAmountRequired'),
      trigger: ['blur', 'change'],
    },
  ],
  decimalPlaces: [
    {
      required: true,
      type: 'number',
      message: $t('game.virtualBonusPool.enterDecimalRequired'),
      trigger: ['blur', 'change'],
    },
  ],
};

// Methods
const handleSubmit = async () => {
  try {
    await formRef.value?.validate();

    // Validate amount range
    const minAmount = Number(formData.minAmount);
    const maxAmount = Number(formData.maxAmount);

    if (minAmount >= maxAmount) {
      message.error($t('game.virtualBonusPool.minLessThanMax'));
      return;
    }

    submitting.value = true;

    
    const { id, ...submitDataWithoutId } = formData;
    const submitData = {
      ...submitDataWithoutId,
      maxAmount: Number(formData.maxAmount),
      minAmount: Number(formData.minAmount),
      decimalPlaces: Number(formData.decimalPlaces),
    };

    emit('submit', submitData);
  } catch (error) {
    console.error('Form validation failed:', error);
    message.error($t('game.virtualBonusPool.checkFormContent'));
  } finally {
    submitting.value = false;
  }
};

const handleCancel = () => {
  emit('cancel');
};

// Removed unused functions - now using MediaLibrarySelector directly

const selectTemplate = (template: MediaFile) => {
  formData.backgroundStyle = template.url;
  message.success($t('game.virtualBonusPool.templateSelected', [template.filename]));
};

const handleBackgroundStyleSelected = (file: MediaFile) => {
  console.log('🎯 Background style selected:', file);
  formData.backgroundStyle = file.url;
  message.success($t('game.virtualBonusPool.bgStyleSelected', [file.filename]));
};

// Helper functions for preview
const isImageUrl = (value: string): boolean => {
  return (
    value &&
    (value.startsWith('http') ||
      value.startsWith('/') ||
      value.startsWith('data:'))
  );
};

const getPresetNumberStyle = (style: string) => {
  const presetStyle = numberStyleOptions.find((opt) => opt.value === style);
  return presetStyle ? presetStyle.previewStyle : {};
};

const getPresetBackgroundStyle = (style: string) => {
  const presetStyle = backgroundStyleOptions.find((opt) => opt.value === style);
  return presetStyle ? presetStyle.previewStyle : {};
};

const selectNumberStyle = (numberStyle: MediaFile) => {
  formData.numberStyle = numberStyle.url;
  message.success($t('game.virtualBonusPool.numberStyleSelected', [numberStyle.filename]));
};

const handleNumberStyleSelected = (file: MediaFile) => {
  console.log('🎯 Number style selected:', file);
  formData.numberStyle = file.url;
  message.success($t('game.virtualBonusPool.numberStyleSelected', [file.filename]));
};

const handleNewTemplateSelected = (file: MediaFile) => {
  // When a new template is uploaded, select it
  formData.backgroundStyle = file.url;
  message.success($t('game.virtualBonusPool.templateSelected', [file.filename]));
};

const openMediaLibrary = () => {
  // This could open a new tab or modal to the media library
  window.open('/media-library/management', '_blank');
};

const getBackgroundStyle = () => {
  // If backgroundStyle is a URL (from media library), use it as background image
  if (
    (formData.backgroundStyle && formData.backgroundStyle.startsWith('http')) ||
    formData.backgroundStyle.startsWith('/')
  ) {
    return {
      backgroundImage: `url(${formData.backgroundStyle})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    };
  }

  // Fallback to preset styles if needed
  const presetStyle = backgroundStyleOptions.find(
    (style) => style.value === formData.backgroundStyle,
  );
  return presetStyle ? presetStyle.previewStyle : {};
};

const getNumberStyleText = () => {
  // If numberStyle is a URL (from media library), use it to style the text
  if (
    formData.numberStyle &&
    (formData.numberStyle.startsWith('http') ||
      formData.numberStyle.startsWith('/'))
  ) {
    return {
      // Method 1: Use background-clip to create text with image pattern
      backgroundImage: `url(${formData.numberStyle})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      color: 'transparent',
      WebkitTextFillColor: 'transparent',
      // Fallback for browsers that don't support background-clip: text
      filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))',
    };
  }

  return {
    // Default styling when no number style is selected
    color: 'white',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
  };
};

const getCurrencySymbol = (currency: string) => {
  const currencyMap: Record<string, string> = {
    BRL: 'R$',
    USD: '$',
    EUR: '€',
    CNY: '¥',
    JPY: '¥',
  };
  return currencyMap[currency] || '$';
};

const getDisplayTypeLabel = (displayType: string) => {
  const typeMap: Record<string, string> = {
    single: $t('game.virtualBonusPool.displaySingle'),
    multiple: $t('game.virtualBonusPool.displayMultiple'),
    fixed: $t('game.virtualBonusPool.fixedAmount'),
    random: $t('game.virtualBonusPool.randomAmount'),
    realtime: $t('game.virtualBonusPool.realtimeUpdate'),
    increment: $t('game.virtualBonusPool.incrementAmount'),
  };
  return typeMap[displayType] || displayType;
};

const startCountAnimation = () => {
  if (isAnimating.value) return;

  isAnimating.value = true;
  const targetAmount = formData.maxAmount || 88888.88;
  const startAmount = 0;
  const duration = 2000; // 2 seconds
  const startTime = Date.now();

  const animate = () => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Easing function for smooth animation
    const easeOutQuart = 1 - Math.pow(1 - progress, 4);
    const currentAmount =
      startAmount + (targetAmount - startAmount) * easeOutQuart;

    displayAmount.value = currentAmount.toFixed(formData.decimalPlaces || 2);

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      isAnimating.value = false;
    }
  };

  animate();
};

const resetAnimation = () => {
  displayAmount.value = '0.00';
  isAnimating.value = false;
};

// Watch for props changes
watch(
  () => props.data,
  (newData) => {
    if (newData) {
      
      Object.assign(formData, {
        ...newData,
        maxAmount:
          typeof newData.maxAmount === 'number'
            ? newData.maxAmount
            : Number(newData.maxAmount) || 0,
        minAmount:
          typeof newData.minAmount === 'number'
            ? newData.minAmount
            : Number(newData.minAmount) || 0,
        decimalPlaces:
          typeof newData.decimalPlaces === 'number'
            ? newData.decimalPlaces
            : Number(newData.decimalPlaces) || 2,
      });
    }
  },
  { immediate: true },
);

// Watch for amount changes to update display
watch(
  () => formData.maxAmount,
  (newAmount) => {
    if (!isAnimating.value) {
      displayAmount.value = (newAmount || 0).toFixed(
        formData.decimalPlaces || 2,
      );
    }
  },
  { immediate: true },
);

// Initialize display amount when component mounts
onMounted(() => {
  // Initialize display amount
  displayAmount.value = (formData.maxAmount || 0).toFixed(
    formData.decimalPlaces || 2,
  );
});
</script>

<style scoped>
.virtual-bonus-pool-form {
  padding: 0;
}

.virtual-bonus-pool-form :deep(.n-form-item) {
  margin-bottom: 24px;
}

.virtual-bonus-pool-form :deep(.n-form-item-label) {
  font-weight: 500;
  color: #333;
}


.number-style-section {
  width: 100%;
}

.number-styles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
  max-height: 400px;
  overflow-y: auto;
  padding: 8px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.number-style-template-item {
  cursor: pointer;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  position: relative;
  background: white;
}

.number-style-template-item:hover {
  border-color: #1890ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.number-style-template-item.active {
  border-color: #1890ff;
  box-shadow: 0 0 0 3px rgba(24, 144, 255, 0.2);
}

.style-preview {
  position: relative;
  height: 60px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
}

.style-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.style-info {
  padding: 8px;
  text-align: center;
}

.style-desc {
  font-size: 12px;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.preview-box {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border-radius: 4px;
  margin-bottom: 8px;
}

.preview-number {
  font-size: 16px;
  font-weight: bold;
}

.style-name {
  font-size: 12px;
  color: #666;
  font-weight: 500;
}


.background-section {
  width: 100%;
}

.background-templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
  max-height: 400px;
  overflow-y: auto;
  padding: 8px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.custom-background-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.background-template-item {
  cursor: pointer;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  position: relative;
  background: white;
}

.background-template-item:hover {
  border-color: #1890ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.background-template-item.active {
  border-color: #1890ff;
  box-shadow: 0 0 0 3px rgba(24, 144, 255, 0.2);
}

.template-preview {
  position: relative;
  height: 70px;
  overflow: hidden;
}

.template-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #f5f5f5;
}

.custom-preview {
  position: relative;
  overflow: hidden;
}

.custom-preview img {
  width: 100%;
  height: 60px;
  object-fit: cover;
}

.template-preview .preview-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.background-template-item:hover .preview-overlay {
  opacity: 1;
}

.template-info {
  padding: 12px;
  text-align: center;
}

.template-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.template-desc {
  font-size: 12px;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.template-preview .preview-text {
  font-size: 16px;
  font-weight: bold;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  color: white;
  margin-bottom: 8px;
}

.template-preview .preview-amount {
  font-size: 18px;
  font-weight: bold;
  color: #ffd700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.custom-bg-item:hover .preview-overlay {
  opacity: 1;
}

.custom-actions {
  position: absolute;
  top: 4px;
  right: 4px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.custom-bg-item:hover .custom-actions {
  opacity: 1;
}


.upload-item {
  position: relative;
}

.upload-area {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.upload-area:hover {
  border-color: #1890ff;
  background: #f0f8ff;
}

.upload-preview img {
  width: 100%;
  height: 60px;
  object-fit: cover;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.upload-text {
  font-size: 24px;
  color: #ccc;
  margin-bottom: 4px;
}

.upload-desc {
  font-size: 12px;
  color: #999;
}

.upload-note {
  font-size: 10px;
  color: #999;
  margin-top: 4px;
  line-height: 1.2;
}


.form-footer {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #f0f0f0;
}


@media (max-width: 768px) {
  .number-style-preview-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .background-style-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .custom-background-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .background-style-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .custom-background-grid {
    grid-template-columns: repeat(1, 1fr);
  }
}
</style>
