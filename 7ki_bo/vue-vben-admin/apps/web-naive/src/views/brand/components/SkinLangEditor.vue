<template>
  <n-modal
    v-model:show="visible"
    preset="dialog"
    :title="editingItem ? '编辑皮肤语言配置' : '新增皮肤语言配置'"
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
                <n-radio-group v-model:value="formModel.templateType">
                  <n-radio value="main-site">主站</n-radio>
                  <n-radio value="skin-template">皮肤模板</n-radio>
                </n-radio-group>
              </n-form-item>

              <n-form-item label="品牌皮肤" path="skinStyle">
                <n-select
                  v-model:value="formModel.skinStyle"
                  :options="skinStyleOptions"
                  placeholder="选择皮肤风格"
                />
              </n-form-item>
            </div>

            <!-- Brand Icons Section -->
            <div class="form-section">
              <h4 class="section-title">品牌图标</h4>

              <n-form-item label="玩法颜色" path="gameColor">
                <n-radio-group v-model:value="formModel.gameColor">
                  <n-radio value="有底色">有底色</n-radio>
                  <n-radio value="无底色">无底色</n-radio>
                </n-radio-group>
              </n-form-item>

              <n-form-item label="皮肤颜色" path="skinColor">
                <n-radio-group
                  v-model:value="formModel.skinColor"
                  class="skin-color-group"
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
                />
              </n-form-item>

              <n-form-item label="APP配置" path="appSetting">
                <n-input
                  v-model:value="formModel.appSetting"
                  placeholder="输入APP配置"
                />
              </n-form-item>

              <n-form-item label="备注信息" path="backendRemark">
                <n-input
                  v-model:value="formModel.backendRemark"
                  type="textarea"
                  :rows="3"
                  placeholder="输入备注信息"
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
        <n-button @click="handleCancel">取消</n-button>
        <n-button type="primary" @click="handleSubmit" :loading="submitting">
          {{ editingItem ? '保存修改' : '创建配置' }}
        </n-button>
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
import { notification } from '#/adapter/naive';
import type {
  BrandSkinLangConfig,
  BrandSkinLangCreateRequest,
} from '#/api/skinLang';

interface Props {
  show: boolean;
  editingItem?: BrandSkinLangConfig | null;
}

interface Emits {
  (e: 'update:show', value: boolean): void;
  (e: 'submit', data: BrandSkinLangCreateRequest): void;
}

const props = withDefaults(defineProps<Props>(), {
  editingItem: null,
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

// Skin color options from the HTML source
const skinColorOptions = [
  { value: '15', label: 'Bvlgari蓝黑' },
  { value: '1687419125085335554', label: 'Tom Ford绿' },
  { value: '1687419804829954050', label: 'Ferrari黑黄' },
  { value: '1687423728032313346', label: 'Armani黑红' },
  { value: '1687424061300416513', label: 'Corum蓝' },
  { value: '1687424270198022145', label: 'Aston Martin紫' },
  { value: '1692485205460766722', label: 'Roger Dubuis黑金' },
  { value: '1692485850558005250', label: 'Porsche黄绿' },
  { value: '1692486746230812674', label: 'Cartier红' },
  { value: '1692488006900928514', label: 'Estee Lauder蓝' },
  { value: '1692488483161190401', label: 'Burgundy红' },
  { value: '1692488808662204418', label: 'IWC蓝' },
  { value: '1692489196854333442', label: 'Gucci绿金' },
  { value: '1692489501242617857', label: 'Burberry褐' },
  { value: '1692489827560214530', label: 'La Mer 绿' },
  { value: '1692490140235583490', label: 'Ebay紫' },
  { value: '1697159683483983873', label: 'Dior克莱因蓝' },
  { value: '1697159980803305474', label: 'Chivas Regal邦迪蓝' },
  { value: '1697160139817517057', label: 'Furla蓝' },
  { value: '1697160330594295810', label: 'Bottega Veneta莫兰迪灰' },
  { value: '1697160465763233793', label: 'Embraer蓝' },
  { value: '1697160834305101825', label: 'Bordeaux红' },
  { value: '1697160986273185793', label: 'Breguet灰' },
  { value: '1697161119648129025', label: 'Hermes橙' },
  { value: '1697161307920756738', label: 'BVLGARI褐' },
  { value: '1697161596809916417', label: 'Hermes棕橙' },
  { value: '1697161777339891714', label: 'Elsa Schiaparelli粉' },
  { value: '1697161995892490242', label: 'Lancome水蜜桃色' },
  { value: '1697162642566025217', label: 'Lacoste绿' },
  { value: '1697162790520283138', label: 'Versace黄' },
  { value: '1697163109007503361', label: 'Bvlgari棕' },
  { value: '1697163285008887809', label: 'Prada黑' },
  { value: '1697163805310021633', label: 'Victoria Secret红' },
  { value: '1697163938916524034', label: 'Anna Sui紫' },
  { value: '1697164125656219650', label: 'Facebook蓝' },
  { value: '1697164281092911105', label: 'Facebook绿' },
  { value: '1697164409843445761', label: 'Twitter蓝' },
  { value: '1697164886393913346', label: 'USDT绿' },
  { value: '1697165024871976962', label: 'SK-II红' },
  { value: '1697165145999220737', label: 'Patek Philippe浅棕' },
  { value: '1697165288065609730', label: 'Microsoft红' },
  { value: '1697165446718234626', label: '3CE提香红' },
  { value: '1697165616248053761', label: 'Louis Vuitton棕' },
  { value: '1697165753468780546', label: 'Bottega Veneta绿' },
  { value: '1822080907778543618', label: 'Rolex绿' },
  { value: '1822084756339769345', label: 'Guerlain紫' },
  { value: '1924287844941955073', label: 'Gucci黑' },
];

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
      formModel.skinColorRgb = colorValues.rgb;
      formModel.skinColorHex = colorValues.hex;
    }
  },
  { immediate: true },
);
// Watch for editing item changes
watch(
  () => props.editingItem,
  (newItem) => {
    if (newItem) {
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
      });
    } else {
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
