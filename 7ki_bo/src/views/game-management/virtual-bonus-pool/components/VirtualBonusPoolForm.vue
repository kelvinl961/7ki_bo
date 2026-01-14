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
      <!-- ID（仅显示） -->
      <n-form-item label="ID">
        <n-input 
          :value="formData.id ? formData.id.toString() : '自动生成'"
          disabled
          placeholder="自动生成"
        />
      </n-form-item>

      <!-- 币种 -->
      <n-form-item label="币种" path="currency">
        <n-select
          v-model:value="formData.currency"
          placeholder="请选择币种"
          :options="currencyOptions"
        />
      </n-form-item>

      <!-- 展示方式 -->
      <n-form-item label="展示方式" path="displayType">
        <n-radio-group v-model:value="formData.displayType" name="displayType">
          <n-space>
            <n-radio value="single">单独模块</n-radio>
            <n-radio value="multiple">多个馆馆</n-radio>
          </n-space>
        </n-radio-group>
      </n-form-item>

      <!-- 展示位置 -->
      <n-form-item label="展示位置" path="displayPosition">
        <n-select
          v-model:value="formData.displayPosition"
          placeholder="请选择展示位置"
          :options="displayPositionOptions"
        />
      </n-form-item>

      <!-- 点击跳转位置 -->
      <n-form-item label="点击跳转位置" path="clickTarget">
        <n-select
          v-model:value="formData.clickTarget"
          placeholder="请选择跳转位置"
          :options="clickTargetOptions"
        />
      </n-form-item>

      <!-- 最大显示金额 -->
      <n-form-item label="最大显示金额" path="maxAmount">
        <n-input-number
          v-model:value="formData.maxAmount"
          placeholder="请输入最大显示金额"
          style="width: 100%"
          :min="0"
          :precision="2"
          :default-value="0"
          show-button
          clearable
        />
      </n-form-item>

      <!-- 最小显示金额 -->
      <n-form-item label="最小显示金额" path="minAmount">
        <n-input-number
          v-model:value="formData.minAmount"
          placeholder="请输入最小显示金额"
          style="width: 100%"
          :min="0"
          :precision="2"
          :default-value="0"
          show-button
          clearable
        />
      </n-form-item>

      <!-- 小数点位数 -->
      <n-form-item label="小数点位数" path="decimalPlaces">
        <n-input-number
          v-model:value="formData.decimalPlaces"
          placeholder="请输入小数点位数"
          style="width: 100%"
          :min="0"
          :max="8"
          :precision="0"
          :default-value="2"
          show-button
          clearable
        />
      </n-form-item>

      <!-- 金额数字样式 -->
      <n-form-item label="金额数字样式" path="numberStyle">
        <div class="w-full">
          <!-- Media Library Selector -->
          <MediaLibrarySelector
            v-model="formData.numberStyle"
            category="icons"
            :accept-types="['image']"
            placeholder="选择数字样式图片"
            @file-selected="handleNumberStyleSelected"
          />
          
          <!-- Preview -->
          <div v-if="formData.numberStyle" class="mt-3">
            <div class="text-sm text-gray-600 mb-2">预览:</div>
            
            <!-- Image Preview (if it's a URL) -->
            <div v-if="isImageUrl(formData.numberStyle)" class="w-24 h-24 border rounded-lg overflow-hidden">
              <img 
                :src="formData.numberStyle" 
                :alt="'Number Style Preview'"
                class="w-full h-full object-cover"
                @error="console.error('❌ Image load error:', formData.numberStyle)"
                @load="console.log('✅ Image loaded successfully:', formData.numberStyle)"
              />
              <div class="text-xs text-gray-500 mt-1">URL: {{ formData.numberStyle }}</div>
            </div>
            
            <!-- Preset Style Preview (if it's a preset) -->
            <div v-else class="w-24 h-24 border rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
              <div class="text-center">
                <div class="text-lg font-bold" :style="getPresetNumberStyle(formData.numberStyle)">
                  Aa
                </div>
                <div class="text-xs text-gray-500 mt-1">预设样式: {{ formData.numberStyle }}</div>
              </div>
            </div>
          </div>
        </div>
      </n-form-item>

      <!-- 背景风格 -->
      <n-form-item label="背景风格" path="backgroundStyle">
        <div class="w-full">
          <!-- Media Library Selector -->
          <MediaLibrarySelector
            v-model="formData.backgroundStyle"
            category="backgrounds"
            :accept-types="['image']"
            placeholder="选择背景风格图片"
            @file-selected="handleBackgroundStyleSelected"
          />
          
          <!-- Preview -->
          <div v-if="formData.backgroundStyle" class="mt-3">
            <div class="text-sm text-gray-600 mb-2">预览:</div>
            
            <!-- Image Preview (if it's a URL) -->
            <div v-if="isImageUrl(formData.backgroundStyle)" class="w-32 h-20 border rounded-lg overflow-hidden">
              <img 
                :src="formData.backgroundStyle" 
                :alt="'Background Style Preview'"
                class="w-full h-full object-cover"
                @error="console.error('❌ Background image load error:', formData.backgroundStyle)"
                @load="console.log('✅ Background image loaded successfully:', formData.backgroundStyle)"
              />
              <div class="text-xs text-gray-500 mt-1">URL: {{ formData.backgroundStyle }}</div>
            </div>
            
            <!-- Preset Style Preview (if it's a preset) -->
            <div v-else class="w-32 h-20 border rounded-lg overflow-hidden flex items-center justify-center" :style="getPresetBackgroundStyle(formData.backgroundStyle)">
              <div class="text-center text-white">
                <div class="text-sm font-bold">背景样式</div>
                <div class="text-xs opacity-75 mt-1">预设: {{ formData.backgroundStyle }}</div>
              </div>
            </div>
          </div>
        </div>
      </n-form-item>
      <!-- 实时预览 -->
      <n-form-item label="实时预览">
        <div class="live-preview-section">
          <div class="preview-container">
            <div 
              class="bonus-pool-preview"
              :class="`number-${formData.numberStyle}`"
              :style="getBackgroundStyle()"
            >
              
                            <div class="pool-amount">
                <div class="amount-with-style" :style="getNumberStyleText()">
                  <span class="currency">{{ getCurrencySymbol(formData.currency) }}</span>
                  <span class="amount" ref="amountRef">{{ displayAmount }}</span>
                </div>
              </div>
              
            </div>
          </div>
          
          <div class="preview-controls">
            <n-button size="small" @click="startCountAnimation">
              播放动画
            </n-button>
            <n-button size="small" @click="resetAnimation">
              重置
            </n-button>
          </div>
        </div>
      </n-form-item>


      <!-- 状态 -->
      <n-form-item label="状态" path="status">
        <n-switch v-model:value="formData.status">
          <template #checked>启用</template>
          <template #unchecked>禁用</template>
        </n-switch>
      </n-form-item>

      
      <!-- 备注 -->
      <n-form-item label="备注" path="remark">
        <n-input
          v-model:value="formData.remark"
          type="textarea"
          placeholder="请输入备注信息（最多200字）"
          :maxlength="200"
          show-count
          :autosize="{ minRows: 3, maxRows: 6 }"
        />
      </n-form-item>
    </n-form>

    <!-- 底部按钮组 -->
    <div class="form-footer">
      <n-space justify="center" :size="16">
        <n-button @click="handleCancel" size="medium">取消</n-button>
        <n-button type="primary" @click="handleSubmit" :loading="submitting" size="medium">
          确认
        </n-button>
      </n-space>
    </div>
  </div>
</template>

<script setup lang="ts">
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
const MediaLibrarySelector = defineAsyncComponent(() => import('#/components/MediaLibrarySelector.vue'));
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
  { label: '巴西雷亚尔(BRL)', value: 'BRL' },
  { label: '美元(USD)', value: 'USD' },
  { label: '欧元(EUR)', value: 'EUR' },
  { label: '人民币(CNY)', value: 'CNY' },
  { label: '日元(JPY)', value: 'JPY' },
];

const displayPositionOptions = [
  { label: '热门上方', value: '热门上方' },
  { label: '热门下方', value: '热门下方' },
  { label: '首页顶部', value: '首页顶部' },
  { label: '游戏大厅', value: '游戏大厅' },
  { label: '个人中心', value: '个人中心' },
];

const clickTargetOptions = [
  { label: '游戏大厅', value: '/games' },
  { label: '充值页面', value: '/recharge' },
  { label: '活动页面', value: '/activities' },
  { label: '个人中心', value: '/profile' },
  { label: '不跳转', value: '' },
];

const numberStyleOptions = [
  {
    label: '样式一',
    value: 'style1',
    previewStyle: {
      color: '#ff6b35',
      fontSize: '18px',
      fontWeight: 'bold',
      fontFamily: 'Arial, sans-serif'
    }
  },
  {
    label: '样式二',
    value: 'style2',
    previewStyle: {
      color: '#4ecdc4',
      fontSize: '18px',
      fontWeight: 'bold',
      fontFamily: 'Arial, sans-serif'
    }
  },
  {
    label: '样式三',
    value: 'style3',
    previewStyle: {
      color: '#45b7d1',
      fontSize: '18px',
      fontWeight: 'bold',
      fontFamily: 'Arial, sans-serif'
    }
  },
  {
    label: '样式四',
    value: 'style4',
    previewStyle: {
      color: '#f39c12',
      fontSize: '18px',
      fontWeight: 'bold',
      fontFamily: 'Arial, sans-serif'
    }
  },
  {
    label: '样式五',
    value: 'style5',
    previewStyle: {
      color: '#e74c3c',
      fontSize: '18px',
      fontWeight: 'bold',
      fontFamily: 'Arial, sans-serif'
    }
  },
];

const backgroundStyleOptions = [
  {
    label: '样式一',
    value: 'style1',
    previewStyle: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white'
    }
  },
  {
    label: '样式二',
    value: 'style2',
    previewStyle: {
      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      color: 'white'
    }
  },
  {
    label: '样式三',
    value: 'style3',
    previewStyle: {
      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      color: 'white'
    }
  },
  {
    label: '样式四',
    value: 'style4',
    previewStyle: {
      background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      color: 'white'
    }
  },
  {
    label: '样式五',
    value: 'style5',
    previewStyle: {
      background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      color: 'white'
    }
  },
];

// Validation rules
const rules: FormRules = {
  currency: [
    { required: true, message: '请选择币种', trigger: ['blur', 'change'] }
  ],
  displayType: [
    { required: true, message: '请选择展示方式', trigger: ['blur', 'change'] }
  ],
  displayPosition: [
    { required: true, message: '请选择展示位置', trigger: ['blur', 'change'] }
  ],
  clickTarget: [
    { 
      validator: (rule: any, value: any) => {
        return value !== null && value !== undefined;
      },
      message: '请选择点击跳转位置', 
      trigger: ['blur', 'change'] 
    }
  ],
  maxAmount: [
    {
      required: true,
      type: 'number',
      message: '请输入最大显示金额',
      trigger: ['blur', 'change']
    }
  ],
  minAmount: [
    {
      required: true,
      type: 'number',
      message: '请输入最小显示金额',
      trigger: ['blur', 'change']
    }
  ],
  decimalPlaces: [
    {
      required: true,
      type: 'number',
      message: '请输入小数点位数',
      trigger: ['blur', 'change']
    }
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
      message.error('最小显示金额必须小于最大显示金额');
      return;
    }
    
    submitting.value = true;
    
    // 确保提交的数据类型正确，并排除id字段（创建时不需要）
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
    message.error('请检查表单内容是否正确填写');
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
  message.success(`已选择模板: ${template.filename}`);
};

const handleBackgroundStyleSelected = (file: MediaFile) => {
  console.log('🎯 Background style selected:', file);
  formData.backgroundStyle = file.url;
  message.success(`已选择背景风格: ${file.filename}`);
};

// Helper functions for preview
const isImageUrl = (value: string): boolean => {
  return value && (value.startsWith('http') || value.startsWith('/') || value.startsWith('data:'));
};

const getPresetNumberStyle = (style: string) => {
  const presetStyle = numberStyleOptions.find(opt => opt.value === style);
  return presetStyle ? presetStyle.previewStyle : {};
};

const getPresetBackgroundStyle = (style: string) => {
  const presetStyle = backgroundStyleOptions.find(opt => opt.value === style);
  return presetStyle ? presetStyle.previewStyle : {};
};



const selectNumberStyle = (numberStyle: MediaFile) => {
  formData.numberStyle = numberStyle.url;
  message.success(`已选择数字样式: ${numberStyle.filename}`);
};

const handleNumberStyleSelected = (file: MediaFile) => {
  console.log('🎯 Number style selected:', file);
  formData.numberStyle = file.url;
  message.success(`已选择数字样式: ${file.filename}`);
};

const handleNewTemplateSelected = (file: MediaFile) => {
  // When a new template is uploaded, select it
  formData.backgroundStyle = file.url;
  message.success(`已选择新模板: ${file.filename}`);
};

const openMediaLibrary = () => {
  // This could open a new tab or modal to the media library
  window.open('/media-library/management', '_blank');
};

const getBackgroundStyle = () => {
  // If backgroundStyle is a URL (from media library), use it as background image
  if (formData.backgroundStyle && formData.backgroundStyle.startsWith('http') || formData.backgroundStyle.startsWith('/')) {
    return {
      backgroundImage: `url(${formData.backgroundStyle})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    };
  }
  
  // Fallback to preset styles if needed
  const presetStyle = backgroundStyleOptions.find(style => style.value === formData.backgroundStyle);
  return presetStyle ? presetStyle.previewStyle : {};
};

const getNumberStyleText = () => {
  // If numberStyle is a URL (from media library), use it to style the text
  if (formData.numberStyle && (formData.numberStyle.startsWith('http') || formData.numberStyle.startsWith('/'))) {
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
    'BRL': 'R$',
    'USD': '$',
    'EUR': '€',
    'CNY': '¥',
    'JPY': '¥',
  };
  return currencyMap[currency] || '$';
};

const getDisplayTypeLabel = (displayType: string) => {
  const typeMap: Record<string, string> = {
    'single': '单独模块',
    'multiple': '多个馆馆',
    'fixed': '固定金额',
    'random': '随机金额',
    'realtime': '实时更新',
    'increment': '递增金额',
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
    const currentAmount = startAmount + (targetAmount - startAmount) * easeOutQuart;
    
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
watch(() => props.data, (newData) => {
  if (newData) {
    // 确保数字字段正确转换
    Object.assign(formData, {
      ...newData,
      maxAmount: typeof newData.maxAmount === 'number' ? newData.maxAmount : Number(newData.maxAmount) || 0,
      minAmount: typeof newData.minAmount === 'number' ? newData.minAmount : Number(newData.minAmount) || 0,
      decimalPlaces: typeof newData.decimalPlaces === 'number' ? newData.decimalPlaces : Number(newData.decimalPlaces) || 2,
    });
  }
}, { immediate: true });

// Watch for amount changes to update display
watch(() => formData.maxAmount, (newAmount) => {
  if (!isAnimating.value) {
    displayAmount.value = (newAmount || 0).toFixed(formData.decimalPlaces || 2);
  }
}, { immediate: true });

// Initialize display amount when component mounts
onMounted(() => {
  // Initialize display amount
  displayAmount.value = (formData.maxAmount || 0).toFixed(formData.decimalPlaces || 2);
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

/* 数字样式预览网格 */
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

/* 背景样式预览网格 */
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

/* 上传区域 */
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

/* Current background preview */
.current-background-preview {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
}

.background-preview-card {
  position: relative;
  height: 120px;
  overflow: hidden;
}

.preview-background-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.background-preview-card .preview-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
}

.background-preview-card .preview-text {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 8px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.background-preview-card .preview-amount {
  font-size: 24px;
  font-weight: bold;
  color: #ffd700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

/* Live Preview Section */
.live-preview-section {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  background: #f8f9fa;
}

.preview-container {
  display: flex;
  justify-content: center;
  padding: 1rem;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.bonus-pool-preview {
  width: 380px;
  height: 90px;
  padding: 0.75rem;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  position: relative;
  overflow: hidden;
  color: white;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}

.pool-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  opacity: 0.9;
}

.pool-title {
  font-weight: 600;
  font-size: 1rem;
}

.pool-position {
  font-size: 0.8rem;
  opacity: 0.8;
}

.pool-amount {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 18px;
  position: relative;
  min-height: 50px;
  padding: 8px 16px;
  border-radius: 8px;
  width: 70%;
}

.amount-with-style {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: bold;
  font-size: 1.5rem;
  font-family: 'Monaco', 'Consolas', monospace;
}

.currency {
  font-size: inherit;
  font-weight: inherit;
}

.amount {
  font-size: inherit;
  font-weight: inherit;
  font-family: inherit;
}

.pool-footer {
  margin-top: 1rem;
  font-size: 0.8rem;
  opacity: 0.8;
}

.pool-type {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
}

/* Number Style Classes */
.number-style1 .amount {
  color: #ff6b35;
  text-shadow: 0 2px 4px rgba(255, 107, 53, 0.3);
}

.number-style2 .amount {
  color: #4ecdc4;
  text-shadow: 0 2px 4px rgba(78, 205, 196, 0.3);
}

.number-style3 .amount {
  color: #45b7d1;
  text-shadow: 0 2px 4px rgba(69, 183, 209, 0.3);
}

.number-style4 .amount {
  color: #f39c12;
  text-shadow: 0 2px 4px rgba(243, 156, 18, 0.3);
}

.number-style5 .amount {
  color: #e74c3c;
  text-shadow: 0 2px 4px rgba(231, 76, 60, 0.3);
}

.preview-controls {
  display: flex;
  justify-content: center;
  gap: 12px;
  padding: 12px;
  background: white;
  border-top: 1px solid #e0e0e0;
}

/* 底部按钮区域 */
.form-footer {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #f0f0f0;
}

/* 响应式调整 */
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