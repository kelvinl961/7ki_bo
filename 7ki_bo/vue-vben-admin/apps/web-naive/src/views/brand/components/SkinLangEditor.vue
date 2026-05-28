<template>
  <n-modal
    v-model:show="visible"
    preset="dialog"
    :title="computedModalTitle"
    style="width: 1200px; height: 800px"
    @after-leave="handleClose"
  >
    <div class="skin-lang-editor">
      <div class="editor-content">
        <!-- Left Panel - Form -->
        <div class="form-panel">
          <n-form
            ref="formRef"
            :model="formModel"
            :rules="formRules"
            label-placement="left"
            label-width="120px"
            require-mark-placement="right-hanging"
            class="editor-form"
          >
            <!-- Basic Info Section -->
            <div class="form-section">
              <h4 class="section-title">基本信息</h4>

              <n-form-item label="品牌ID" path="brandId">
                <n-input v-model:value="formModel.brandId" readonly />
              </n-form-item>

              <n-form-item label="品牌编号" path="brandCode">
                <n-input v-model:value="formModel.brandCode" readonly />
              </n-form-item>

              <n-form-item label="品牌名称" path="brandName">
                <n-text>{{ formModel.brandName }}</n-text>
              </n-form-item>
            </div>

            <!-- Template Configuration -->
            <div class="form-section">
              <h4 class="section-title">模板配置</h4>

              <n-form-item label="模板类型" path="templateType">
                <n-radio-group v-model:value="formModel.templateType" :disabled="detailMode">
                  <n-radio value="main-site">主站</n-radio>
                  <n-radio value="skin-template">皮肤模板</n-radio>
                </n-radio-group>
              </n-form-item>

              <n-form-item label="品牌皮肤" path="skinStyle">
                <n-select
                  v-model:value="formModel.skinStyle"
                  :options="skinStyleOptions"
                  placeholder="选择皮肤风格"
                  :disabled="detailMode"
                />
              </n-form-item>
            </div>

            <!-- Brand Icons Section -->
            <div class="form-section">
              <h4 class="section-title">品牌图标</h4>

              <n-form-item label="玩法颜色" path="gameColor">
                <n-radio-group v-model:value="formModel.gameColor" :disabled="detailMode">
                  <n-radio value="有底色">有底色</n-radio>
                  <n-radio value="无底色">无底色</n-radio>
                </n-radio-group>
              </n-form-item>

              <n-form-item label="皮肤颜色" path="skinColor">
                <n-radio-group
                  v-model:value="formModel.skinColor"
                  class="skin-color-group"
                  :disabled="detailMode"
                >
                  <div class="skin-color-grid">
                    <n-radio
                      v-for="color in skinColorOptions"
                      :key="color.value"
                      :value="color.value"
                      :label="color.label"
                      class="skin-color-radio"
                    />
                  </div>
                </n-radio-group>
              </n-form-item>

              <div class="quick-color-block">
                <div class="quick-color-title">快捷改色</div>
                <div class="quick-color-grid">
                <n-form-item label="主色" path="primaryColor">
                  <n-color-picker
                    v-model:value="formModel.primaryColor"
                    :show-alpha="false"
                    :disabled="detailMode"
                  />
                </n-form-item>
                <n-form-item label="强调色" path="accentColor">
                  <n-color-picker
                    v-model:value="formModel.accentColor"
                    :show-alpha="false"
                    :disabled="detailMode"
                  />
                </n-form-item>
                <n-form-item label="按钮色" path="buttonColor">
                  <n-color-picker
                    v-model:value="formModel.buttonColor"
                    :show-alpha="false"
                    :disabled="detailMode"
                  />
                </n-form-item>
                <n-form-item label="主文字" path="textPrimary">
                  <n-color-picker
                    v-model:value="formModel.textPrimary"
                    :show-alpha="false"
                    :disabled="detailMode"
                  />
                </n-form-item>
                <n-form-item label="次文字" path="textSecondary">
                  <n-color-picker
                    v-model:value="formModel.textSecondary"
                    :show-alpha="false"
                    :disabled="detailMode"
                  />
                </n-form-item>
                <n-form-item label="点缀文字" path="textAccent">
                  <n-color-picker
                    v-model:value="formModel.textAccent"
                    :show-alpha="false"
                    :disabled="detailMode"
                  />
                </n-form-item>
                </div>
              </div>
            </div>

            <!-- Language Settings -->
            <div class="form-section">
              <h4 class="section-title">语言设置</h4>

              <div class="language-section">
                <div
                  v-for="clientType in clientTypes"
                  :key="clientType.key"
                  class="client-type-group"
                >
                  <h5 class="client-type-title">{{ clientType.label }}</h5>
                  <n-checkbox-group
                    v-model:value="formModel.clientLanguages[clientType.key]"
                    :disabled="detailMode"
                  >
                    <div class="language-checkboxes">
                      <n-checkbox
                        v-for="lang in availableLanguages"
                        :key="lang.value"
                        :value="lang.value"
                        :label="lang.label"
                      />
                    </div>
                  </n-checkbox-group>
                </div>
              </div>
            </div>

            <!-- Additional Settings -->
            <div class="form-section">
              <h4 class="section-title">其他设置</h4>

              <n-form-item label="请求认证模式" path="authMode">
                <n-select
                  v-model:value="formModel.authMode"
                  :options="authModeOptions"
                  placeholder="选择认证模式"
                  :disabled="detailMode"
                />
              </n-form-item>

              <n-form-item label="APP配置" path="appSetting">
                <n-input
                  v-model:value="formModel.appSetting"
                  placeholder="输入APP配置"
                  :readonly="detailMode"
                />
              </n-form-item>

              <n-form-item label="备注信息" path="backendRemark">
                <n-input
                  v-model:value="formModel.backendRemark"
                  type="textarea"
                  :rows="3"
                  placeholder="输入备注信息"
                  :readonly="detailMode"
                />
              </n-form-item>
            </div>

            <!-- Timestamps -->
            <div class="form-section">
              <n-form-item label="上次更新时间">
                <n-text depth="3">{{ formatDate(formModel.updatedAt) }}</n-text>
              </n-form-item>
              <n-form-item label="下次预览更新时间">
                <n-text depth="3">{{ formatDate(nextUpdateTime) }}</n-text>
              </n-form-item>
            </div>
          </n-form>
        </div>

        <!-- Right Panel - Preview -->
        <div class="preview-panel">
          <div class="preview-header">
            <h4>预览</h4>
            <div class="preview-device-info">
              <n-tag size="small" type="info">移动端预览</n-tag>
            </div>
          </div>

          <div class="preview-container">
            <div class="device-frame" :style="previewContainerStyle">
              <div v-if="isLoading" class="preview-loading">
                <n-spin />
                <div>正在生成预览...</div>
              </div>

              <div v-else-if="previewError" class="preview-error">
                <n-icon size="24" color="#f56565">
                  <svg viewBox="0 0 24 24">
                    <path
                      d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                    />
                  </svg>
                </n-icon>
                <div>{{ previewError }}</div>
              </div>

              <div
                v-else
                class="image-container"
                :style="{
                  background: getSkinColorRGB(formModel.skinColor || '15'),
                }"
              >
                <img
                  :src="previewImageUrl"
                  alt="皮肤预览"
                  class="image-preview"
                  @load="handleImageLoad"
                  @error="handleImageError"
                />
              </div>
            </div>

            <div class="preview-info">
              <div class="preview-meta">
                <n-tag size="small" type="success">{{
                  formModel.skinTemplate
                }}</n-tag>
                <n-tag size="small" type="warning">{{
                  formModel.gameColor
                }}</n-tag>
                <n-tag size="small" type="primary">{{
                  getSkinColorLabel(formModel.skinColor)
                }}</n-tag>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #action>
      <div class="dialog-actions">
        <template v-if="detailMode">
          <n-button type="primary" @click="handleCancel">关闭</n-button>
        </template>
        <template v-else>
          <n-button @click="handleCancel">取消</n-button>
          <n-button type="primary" @click="handleSubmit" :loading="submitting">
            {{ editingItem ? '保存修改' : '创建配置' }}
          </n-button>
        </template>
      </div>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick } from 'vue';
import {
  NModal,
  NForm,
  NFormItem,
  NInput,
  NSelect,
  NColorPicker,
  NRadio,
  NRadioGroup,
  NCheckbox,
  NCheckboxGroup,
  NButton,
  NText,
  NTag,
  NTabs,
  NTabPane,
  NSpin,
  NIcon,
  type FormInst,
  type FormRules,
} from 'naive-ui';
import {
  useSkinPreview,
  getSkinColorRGB,
  getSkinColorValues,
} from '#/composables/useSkinPreview';
import {
  getColorPaletteById,
  getDefaultBackgroundImage,
  SKIN_COLOR_OPTIONS,
} from '../../../utils/colorUtils';
import { notification } from '#/adapter/naive';
import type {
  BrandSkinLangConfig,
  BrandSkinLangCreateRequest,
} from '#/api/skinLang';

interface Props {
  show: boolean;
  editingItem?: BrandSkinLangConfig | null;
  /** 详情模式：只读展示 + 预览，仅显示关闭按钮 */
  detailMode?: boolean;
}

interface Emits {
  (e: 'update:show', value: boolean): void;
  (e: 'submit', data: BrandSkinLangCreateRequest): void;
}

const props = withDefaults(defineProps<Props>(), {
  editingItem: null,
  detailMode: false,
});

const emit = defineEmits<Emits>();

// Form management
const formRef = ref<FormInst>();
const submitting = ref(false);
const visible = computed({
  get: () => props.show,
  set: (value) => emit('update:show', value),
});

// Form model
const formModel = reactive<
  BrandSkinLangCreateRequest & {
    updatedAt?: string;
    skinColor?: string;
    skinColorRgb?: string;
    skinColorHex?: string;
  }
>({
  brandId: '',
  brandCode: '',
  brandName: '',
  brandType: '主站点',
  channelType: '通用',
  templateType: 'main-site',
  skinStyle: '欧风风',
  gameColor: '有底色',
  skinColor: '15',
  skinColorRgb: 'rgb(5, 65, 70)',
  skinColorHex: '#054146', // Default hex
  skinTemplate: 'rolex',
  clientLanguages: {
    desktop: ['zh-CN'],
    h5: ['zh-CN'],
    ios: ['zh-CN'],
    android: ['zh-CN'],
  },
  authMode: '系统默认认证',
  appSetting: '标准',
  backendRemark: '',
  brandIcon: 'rolex',
  operator: '当前用户',
  updatedAt: new Date().toISOString(),
  backgroundImage: '',
  primaryColor: '#0a1628',
  secondaryColor: '#111f35',
  tertiaryColor: '#162a45',
  accentColor: '#2b6cb0',
  borderColor: '#1e3a5f',
  textPrimary: '#ffffff',
  textSecondary: '#63b3ed',
  textAccent: '#90cdf4',
  buttonColor: '#3182ce',
});

// Preview setup - mobile only
const previewConfig = reactive({
  template: computed(() => formModel.skinTemplate),
  brandIcon: computed(() => formModel.brandIcon),
  gameColor: computed(() => formModel.gameColor),
  skinColor: computed(() => formModel.skinColor || '15'),
  language: computed(() => formModel.clientLanguages.desktop[0] || 'zh-CN'),
  clientType: computed(() => 'mobile'),
});

const {
  activePreviewDevice,
  isLoading,
  previewError,
  previewImageUrl,
  currentDevice,
  previewContainerStyle,
  setPreviewDevice,
  handleImageError,
  handleImageLoad,
} = useSkinPreview(previewConfig);

// Options
const skinStyleOptions = [
  { label: '欧风风', value: '欧风风' },
  { label: '现代风', value: '现代风' },
  { label: '经典风', value: '经典风' },
  { label: '简约风', value: '简约风' },
];

const templateOptions = [
  {
    value: 'rolex',
    label: 'Rolex',
    preview:
      'https://images.unsplash.com/photo-1587836374616-b92fd5b67b79?w=100&h=60&fit=crop',
  },
  {
    value: 'tomford',
    label: 'Tom Ford',
    preview:
      'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=60&fit=crop',
  },
  {
    value: 'burberry',
    label: 'Burberry',
    preview:
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=100&h=60&fit=crop',
  },
  {
    value: 'cartier',
    label: 'Cartier',
    preview:
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&h=60&fit=crop',
  },
];

const brandIconOptions = [
  {
    value: 'rolex',
    label: 'Rolex',
    logo: 'https://images.unsplash.com/photo-1587836374616-b92fd5b67b79?w=60&h=40&fit=crop',
  },
  {
    value: 'tomford',
    label: 'Tom Ford',
    logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=60&h=40&fit=crop',
  },
  {
    value: 'burberry',
    label: 'Burberry',
    logo: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=60&h=40&fit=crop',
  },
  {
    value: 'cartier',
    label: 'Cartier',
    logo: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=60&h=40&fit=crop',
  },
  {
    value: 'omega',
    label: 'Omega',
    logo: 'https://images.unsplash.com/photo-1524805444973-af331f73afbc?w=60&h=40&fit=crop',
  },
  {
    value: 'tag-heuer',
    label: 'TAG Heuer',
    logo: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=60&h=40&fit=crop',
  },
];

const clientTypes = [{ key: 'desktop', label: '普通客户端' }];

const availableLanguages = [
  { value: 'zh-CN', label: '简体中文' },
  { value: 'pt-BR', label: '葡萄牙语' },
  { value: 'en-US', label: '英文' },
  { value: 'zh-TW', label: '繁体中文' },
  { value: 'ko-KR', label: '韩语' },
  { value: 'ja-JP', label: '日语' },
  { value: 'th-TH', label: '泰语' },
  { value: 'vi-VN', label: '越南语' },
];

const authModeOptions = [
  { label: '系统默认认证', value: '系统默认认证' },
  { label: '双重认证', value: '双重认证' },
  { label: '生物识别认证', value: '生物识别认证' },
  { label: '短信验证', value: '短信验证' },
];

const skinColorOptions = SKIN_COLOR_OPTIONS;

// Form validation rules
const formRules: FormRules = {
  brandId: [{ required: true, message: '品牌ID不能为空' }],
  brandCode: [{ required: true, message: '品牌编号不能为空' }],
  brandName: [{ required: true, message: '品牌名称不能为空' }],
  templateType: [{ required: true, message: '请选择模板类型' }],
  skinStyle: [{ required: true, message: '请选择品牌皮肤' }],
  skinTemplate: [{ required: true, message: '请选择模板' }],
  gameColor: [{ required: true, message: '请选择玩法颜色' }],
  skinColor: [{ required: true, message: '请选择皮肤颜色' }],
  authMode: [{ required: true, message: '请选择认证模式' }],
};

// Computed
const computedModalTitle = computed(() => {
  if (props.detailMode) return '皮肤语言配置详情';
  return props.editingItem ? '编辑皮肤语言配置' : '新增皮肤语言配置';
});

const nextUpdateTime = computed(() => {
  const now = new Date();
  now.setHours(now.getHours() + 1);
  return now.toISOString();
});

// Watch for skin color changes and auto-update RGB/hex values
watch(
  () => formModel.skinColor,
  (newSkinColor) => {
    if (newSkinColor) {
      const colorValues = getSkinColorValues(newSkinColor);
      const palette = getColorPaletteById(newSkinColor);
      formModel.skinColorRgb = colorValues.rgb;
      formModel.skinColorHex = colorValues.hex;
      formModel.primaryColor = palette.primary;
      formModel.secondaryColor = palette.secondary;
      formModel.tertiaryColor = palette.tertiary;
      formModel.accentColor = palette.accent;
      formModel.borderColor = palette.borderColor;
      formModel.textPrimary = palette.textPrimary;
      formModel.textSecondary = palette.textSecondary;
      formModel.textAccent = palette.textAccent;
      formModel.buttonColor = palette.buttonColor;
    }
  },
  { immediate: true },
);

// When user selects a skin, prefill default background image for that skin if we have one and field is empty
watch(
  () => formModel.skinColor,
  (skinColor) => {
    if (!skinColor) return;
    const defaultBg = getDefaultBackgroundImage(skinColor);
    if (defaultBg && !formModel.backgroundImage) {
      formModel.backgroundImage = defaultBg;
    }
  },
);

// Watch for editing item changes
watch(
  () => props.editingItem,
  (newItem) => {
    if (newItem) {
      const palette = getColorPaletteById(newItem.skinColor || '15');
      Object.assign(formModel, {
        ...newItem,
        templateType: 'main-site',
        clientLanguages: {
          desktop: newItem.clientLanguages || ['zh-CN'],
          h5: newItem.clientLanguages || ['zh-CN'],
          ios: newItem.clientLanguages || ['zh-CN'],
          android: newItem.clientLanguages || ['zh-CN'],
        },
        brandIcon: newItem.skinTemplate || 'rolex',
        skinColor: newItem.skinColor || '15',
        skinColorRgb:
          newItem.skinColorRgb ||
          getSkinColorValues(newItem.skinColor || '15').rgb,
        skinColorHex:
          newItem.skinColorHex ||
          getSkinColorValues(newItem.skinColor || '15').hex,
        primaryColor: newItem.primaryColor ?? palette.primary,
        secondaryColor: newItem.secondaryColor ?? palette.secondary,
        tertiaryColor: newItem.tertiaryColor ?? palette.tertiary,
        accentColor: newItem.accentColor ?? palette.accent,
        borderColor: newItem.borderColor ?? palette.borderColor,
        textPrimary: newItem.textPrimary ?? palette.textPrimary,
        textSecondary: newItem.textSecondary ?? palette.textSecondary,
        textAccent: newItem.textAccent ?? palette.textAccent,
        buttonColor: newItem.buttonColor ?? palette.buttonColor,
        backgroundImage:
          newItem.backgroundImage ??
          getDefaultBackgroundImage(newItem.skinColor || '') ??
          '',
      });
    } else {
      const palette = getColorPaletteById('15');
      // Reset form for new item
      Object.assign(formModel, {
        brandId: 'BR' + Date.now().toString().slice(-6),
        brandCode: 'BRAND' + Date.now().toString().slice(-6),
        brandName: '新品牌',
        brandType: '主站点',
        channelType: '通用',
        templateType: 'main-site',
        skinStyle: '欧风风',
        gameColor: '有底色',
        skinColor: '15',
        skinColorRgb: 'rgb(5, 65, 70)',
        skinColorHex: '#054146', // Default hex
        skinTemplate: 'rolex',
        clientLanguages: {
          desktop: ['zh-CN'],
          h5: ['zh-CN'],
          ios: ['zh-CN'],
          android: ['zh-CN'],
        },
        authMode: '系统默认认证',
        appSetting: '标准',
        backendRemark: '',
        brandIcon: 'rolex',
        operator: '当前用户',
        updatedAt: new Date().toISOString(),
        backgroundImage: '',
        primaryColor: palette.primary,
        secondaryColor: palette.secondary,
        tertiaryColor: palette.tertiary,
        accentColor: palette.accent,
        borderColor: palette.borderColor,
        textPrimary: palette.textPrimary,
        textSecondary: palette.textSecondary,
        textAccent: palette.textAccent,
        buttonColor: palette.buttonColor,
      });
    }
  },
  { immediate: true },
);

// Watch for form changes to update preview
watch(
  () => [
    formModel.skinTemplate,
    formModel.brandIcon,
    formModel.gameColor,
    formModel.skinColor,
    formModel.clientLanguages.desktop,
  ],
  () => {
    // Preview will automatically update via reactive previewConfig
  },
  { deep: true },
);

// Helper function to get skin color label
const getSkinColorLabel = (value: string) => {
  const color = skinColorOptions.find((option) => option.value === value);
  return color ? color.label : '';
};

// Methods
const formatDate = (date: string | undefined) => {
  if (!date) return '-';
  return new Date(date).toLocaleString('zh-CN');
};

const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    submitting.value = true;

    // Flatten client languages
    const allLanguages = [
      ...formModel.clientLanguages.desktop,
      ...formModel.clientLanguages.h5,
      ...formModel.clientLanguages.ios,
      ...formModel.clientLanguages.android,
    ];
    const uniqueLanguages = [...new Set(allLanguages)];

    // Use manual edited colors first; fallback to selected skin palette
    const palette = getColorPaletteById(formModel.skinColor || '15');
    const generatedAt = new Date().toISOString();

    const submitData: BrandSkinLangCreateRequest = {
      brandId: formModel.brandId,
      brandCode: formModel.brandCode,
      brandName: formModel.brandName,
      brandType: formModel.brandType,
      channelType: formModel.channelType,
      skinStyle: formModel.skinStyle,
      gameColor: formModel.gameColor,
      skinTemplate: formModel.skinTemplate,
      clientLanguages: uniqueLanguages,
      authMode: formModel.authMode,
      appSetting: formModel.appSetting,
      backendRemark: formModel.backendRemark,
      operator: formModel.operator,
      skinColor: formModel.skinColor,
      skinColorRgb: formModel.skinColorRgb,
      skinColorHex: formModel.skinColorHex,
      // Persist full theme palette so layout/config APIs can reuse it
      primaryColor: formModel.primaryColor || palette.primary,
      secondaryColor: formModel.secondaryColor || palette.secondary,
      tertiaryColor: formModel.tertiaryColor || palette.tertiary,
      accentColor: formModel.accentColor || palette.accent,
      borderColor: formModel.borderColor || palette.borderColor,
      colorPalette: {
        primary: formModel.primaryColor || palette.primary,
        secondary: formModel.secondaryColor || palette.secondary,
        tertiary: formModel.tertiaryColor || palette.tertiary,
        accent: formModel.accentColor || palette.accent,
        borderColor: formModel.borderColor || palette.borderColor,
        generated: true,
        generatedAt,
      },
      textPrimary: formModel.textPrimary || palette.textPrimary,
      textSecondary: formModel.textSecondary || palette.textSecondary,
      textAccent: formModel.textAccent || palette.textAccent,
      buttonColor: formModel.buttonColor || palette.buttonColor,
      // Persist background image (use default for Rolex绿 when empty)
      backgroundImage:
        formModel.backgroundImage ||
        getDefaultBackgroundImage(formModel.skinColor || '') ||
        undefined,
    };

    await nextTick();
    emit('submit', submitData);

    notification.success({
      content: props.editingItem ? '配置更新成功' : '配置创建成功',
      duration: 3000,
    });

    visible.value = false;
  } catch (error) {
    console.error('Form validation failed:', error);
  } finally {
    submitting.value = false;
  }
};

const handleCancel = () => {
  visible.value = false;
};

const handleClose = () => {
  formRef.value?.restoreValidation();
};
</script>

<style scoped>
.skin-lang-editor {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.editor-content {
  display: flex;
  height: 700px;
  gap: 24px;
}

.form-panel {
  flex: 1;
  overflow-y: auto;
  padding-right: 12px;
}

.preview-panel {
  width: 450px;
  display: flex;
  flex-direction: column;
  border-left: 1px solid #e0e0e0;
  padding-left: 24px;
}

.form-section {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.form-section:last-child {
  border-bottom: none;
}

.section-title {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.template-radio-group {
  width: 100%;
}

.template-options {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
}

.template-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.template-option:hover {
  border-color: #40a9ff;
}

.template-option.active {
  border-color: #1890ff;
  background-color: #f6ffed;
}

.template-preview {
  width: 80px;
  height: 48px;
  margin-bottom: 8px;
  border-radius: 4px;
  overflow: hidden;
}

.template-preview img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.template-label {
  font-size: 12px;
  font-weight: 500;
  text-align: center;
}

.brand-icon-selection {
  width: 100%;
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 12px;
}

.icon-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.icon-option:hover {
  border-color: #40a9ff;
}

.icon-option.active {
  border-color: #1890ff;
  background-color: #f6ffed;
}

.icon-preview {
  width: 50px;
  height: 30px;
  margin-bottom: 8px;
  border-radius: 4px;
  overflow: hidden;
}

.icon-preview img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.language-section {
  margin-top: 12px;
}

.client-type-group {
  margin-bottom: 16px;
  padding: 12px;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  background-color: #fafafa;
}

.client-type-title {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #666;
}

.quick-color-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px 16px;
}

.quick-color-block {
  margin-top: 12px;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  padding: 10px 12px 0;
  background-color: #fafafa;
}

.quick-color-title {
  margin-bottom: 6px;
  font-size: 13px;
  color: #666;
}

.language-checkboxes {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 8px;
}

.preview-header {
  margin-bottom: 16px;
}

.preview-header h4 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
}

.preview-device-info {
  margin-top: 8px;
}

.preview-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.device-frame {
  position: relative;
  background: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 16px;
  border-radius: 8px;
  overflow: hidden;
}

.preview-loading,
.preview-error {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  color: #666;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  border-radius: 8px;
}

.image-container {
  padding: 8px;
  border-radius: 8px;
  background-color: #f5f5f5; /* fallback background */
  position: relative;
  width: 100%;
  height: 100%;
}

.image-preview {
  border-radius: 4px;
  max-width: 100%;
  max-height: 100%;
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  border-radius: 8px;
}

position: absolute;
top: 0;
left: 0;
width: 100%;
height: 100%;
opacity: 0.6;
mix-blend-mode: multiply;
background-blend-mode: overlay;
border-radius: 8px;
pointer-events: none;

.preview-info {
  width: 100%;
}

.preview-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.dialog-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

/* Scrollbar */
.form-panel::-webkit-scrollbar {
  width: 6px;
}

.form-panel::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.form-panel::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.form-panel::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.skin-color-group {
  width: 100%;
}

.skin-color-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 8px;
  max-height: 300px;
  overflow-y: auto;
  padding: 8px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background-color: #fafafa;
}

.skin-color-radio {
  margin: 4px 0;
  font-size: 13px;
}

.skin-color-radio :deep(.n-radio__label) {
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.preview-panel {
  width: 300px;
  display: flex;
  flex-direction: column;
  border-left: 1px solid #e0e0e0;
  padding-left: 24px;
}
</style>
