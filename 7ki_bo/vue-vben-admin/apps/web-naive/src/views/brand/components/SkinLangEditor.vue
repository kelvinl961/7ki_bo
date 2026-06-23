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
                  placeholder="选择版式风格"
                  filterable
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

            <!-- 大厅背景（紧跟品牌图标） -->
            <div class="form-section">
              <h4 class="section-title">大厅背景</h4>

              <n-form-item label="大厅背景" path="lobbyBackgroundSource">
                <n-radio-group
                  v-model:value="formModel.lobbyBackgroundSource"
                  :disabled="detailMode"
                >
                  <n-radio value="system">系统配置</n-radio>
                  <n-radio value="custom_image">自定义图片背景</n-radio>
                  <n-radio value="skin_default">皮肤默认</n-radio>
                </n-radio-group>
              </n-form-item>

              <n-form-item
                v-if="formModel.lobbyBackgroundSource === 'custom_image'"
                label="背景图地址"
                path="lobbyCustomImageUrl"
              >
                <n-input
                  v-model:value="formModel.lobbyCustomImageUrl"
                  placeholder="请输入图片 URL"
                  :readonly="detailMode"
                />
              </n-form-item>

              <n-form-item label="底纹背景色" path="patternBackgroundColor">
                <n-color-picker
                  v-model:value="formModel.patternBackgroundColor"
                  :modes="['hex']"
                  :show-alpha="false"
                  :disabled="detailMode"
                />
              </n-form-item>

              <n-form-item label="底纹样式" path="lobbyPatternUrl">
                <div class="lobby-pattern-tabs-root">
                  <n-tabs
                    v-model:value="formModel.lobbyPatternTab"
                    class="lobby-pattern-tabs"
                    type="line"
                    :disabled="detailMode"
                  >
                    <n-tab-pane name="light" tab="白色底纹">
                      <div class="lobby-pattern-panel">
                        <div class="lobby-pattern-grid">
                          <button
                            v-for="(p, idx) in lobbyWhitePatternTiles"
                            :key="p.url || `light-none-${idx}`"
                            type="button"
                            class="lobby-pattern-cell"
                            :class="[
                              {
                                'is-active':
                                  formModel.lobbyPatternTab === 'light' &&
                                  formModel.lobbyPatternUrl === p.url,
                              },
                              !p.url ? 'lobby-pattern-cell--none' : '',
                            ]"
                            :title="p.title"
                            :disabled="detailMode"
                            @click="selectLobbyPattern('light', p.url)"
                          >
                            <img
                              v-if="p.url"
                              :src="p.url"
                              class="lobby-pattern-img"
                              alt=""
                              loading="lazy"
                            />
                            <span v-else class="lobby-pattern-none-label">无底纹</span>
                          </button>
                        </div>
                      </div>
                    </n-tab-pane>
                    <n-tab-pane name="dark" tab="深色底纹">
                      <div class="lobby-pattern-panel">
                        <div class="lobby-pattern-grid">
                          <button
                            v-for="(p, idx) in lobbyBlackPatternTiles"
                            :key="p.url || `none-${idx}`"
                            type="button"
                            class="lobby-pattern-cell"
                            :class="[
                              {
                                'is-active':
                                  formModel.lobbyPatternTab === 'dark' &&
                                  formModel.lobbyPatternUrl === p.url,
                              },
                              !p.url ? 'lobby-pattern-cell--none' : '',
                            ]"
                            :title="p.title"
                            :disabled="detailMode"
                            @click="selectLobbyPattern('dark', p.url)"
                          >
                            <img
                              v-if="p.url"
                              :src="p.url"
                              class="lobby-pattern-img"
                              alt=""
                              loading="lazy"
                            />
                            <span v-else class="lobby-pattern-none-label">无底纹</span>
                          </button>
                        </div>
                      </div>
                    </n-tab-pane>
                  </n-tabs>
                </div>
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
                :style="previewImageContainerStyle"
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
                  getLayoutStyleLabel(formModel.skinStyle, formModel.skinTemplate)
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
import {
  LAYOUT_STYLE_OPTIONS,
  isLayoutStyleValue,
  normalizeSkinStyleForForm,
  resolveBrandIconForPreview,
  resolveSkinTemplateForForm,
  resolveSkinTemplateForSave,
  getLayoutStyleLabel,
  type BrandSkinLangConfig,
  type BrandSkinLangCreateRequest,
} from '#/api/skinLang';
import {
  LOBBY_BLACK_PATTERN_TILES,
  LOBBY_WHITE_PATTERN_TILES,
  inferLobbyPatternTabFromUrl,
  resolveLobbyPatternUrlFromRecord,
} from '#/constants/lobbyPatterns';

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
  skinStyle: 'comprehensive_v1',
  gameColor: '有底色',
  skinColor: '15',
  skinColorRgb: 'rgb(5, 65, 70)',
  skinColorHex: '#054146', // Default hex
  skinTemplate: 'comprehensive_v1',
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
  lobbyBackgroundSource: 'system',
  lobbyCustomImageUrl: '',
  patternBackgroundColor: '#1a1a1a',
  lobbyPatternTab: 'dark',
  lobbyPatternUrl: '',
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
  brandIcon: computed(() =>
    resolveBrandIconForPreview(formModel.brandIcon || formModel.skinTemplate),
  ),
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

const lobbyBlackPatternTiles = LOBBY_BLACK_PATTERN_TILES;
const lobbyWhitePatternTiles = LOBBY_WHITE_PATTERN_TILES;

function selectLobbyPattern(tab: 'light' | 'dark', url: string) {
  formModel.lobbyPatternTab = tab;
  formModel.lobbyPatternUrl = url;
}

/** 将底纹背景色叠在皮肤色上（半透明），两者都可见 */
function patternColorWashCss(colorInput: string, alpha = 0.62): string {
  const raw = colorInput.trim();
  const rgbMatch = raw.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (rgbMatch) {
    return `rgba(${rgbMatch[1]}, ${rgbMatch[2]}, ${rgbMatch[3]}, ${alpha})`;
  }
  let h = raw.replace('#', '').trim();
  if (h.length === 3) {
    h = [...h].map((c) => c + c).join('');
  }
  if (!/^[0-9a-fA-F]{6}$/u.test(h)) {
    return `rgba(26, 26, 26, ${alpha})`;
  }
  const r = Number.parseInt(h.slice(0, 2), 16);
  const g = Number.parseInt(h.slice(2, 4), 16);
  const b = Number.parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** 预览：底层皮肤色 → 半透明底纹背景色 → 最上为自定义图 / 平铺底纹 / 皮肤背景图 */
const previewImageContainerStyle = computed(() => {
  const skinTint = getSkinColorRGB(formModel.skinColor || '15');
  const lobbyUrl =
    formModel.lobbyBackgroundSource === 'custom_image'
      ? formModel.lobbyCustomImageUrl?.trim()
      : '';
  const skinBgUrl = formModel.backgroundImage?.trim() || '';
  const patternColor =
    formModel.patternBackgroundColor?.trim() || '#1a1a1a';
  const patternUrl = formModel.lobbyPatternUrl?.trim() || '';
  const wash = `linear-gradient(${patternColorWashCss(patternColor)}, ${patternColorWashCss(patternColor)})`;

  if (lobbyUrl) {
    return {
      backgroundColor: skinTint,
      backgroundImage: `url(${lobbyUrl}), ${wash}`,
      backgroundSize: 'cover, 100% 100%',
      backgroundPosition: 'center, 0 0',
      backgroundRepeat: 'no-repeat, no-repeat',
    };
  }

  if (patternUrl) {
    return {
      backgroundColor: skinTint,
      backgroundImage: `url(${patternUrl}), ${wash}`,
      backgroundRepeat: 'repeat, no-repeat',
      backgroundSize: '44px 44px, 100% 100%',
      backgroundPosition: '0 0, 0 0',
    };
  }

  if (skinBgUrl) {
    return {
      backgroundColor: skinTint,
      backgroundImage: `url(${skinBgUrl}), ${wash}`,
      backgroundSize: 'cover, 100% 100%',
      backgroundPosition: 'center, 0 0',
      backgroundRepeat: 'no-repeat, no-repeat',
    };
  }

  return {
    backgroundColor: skinTint,
    backgroundImage: wash,
    backgroundRepeat: 'no-repeat',
    backgroundSize: '100% 100%',
  };
});

// Options — same list as BrandLogoSetting filter / skinLang API
const skinStyleOptions = LAYOUT_STYLE_OPTIONS;

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
  lobbyBackgroundSource: [{ required: true, message: '请选择大厅背景' }],
  lobbyCustomImageUrl: [
    {
      validator: () => {
        if (formModel.lobbyBackgroundSource !== 'custom_image') return true;
        return !!(formModel.lobbyCustomImageUrl && formModel.lobbyCustomImageUrl.trim());
      },
      message: '请填写背景图地址',
      trigger: ['input', 'blur'],
    },
  ],
  patternBackgroundColor: [{ required: true, message: '请选择底纹背景色' }],
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
      const layoutStyle = normalizeSkinStyleForForm(
        newItem.skinStyle,
        newItem.skinTemplate,
      );
      const layoutTemplate = resolveSkinTemplateForForm(
        newItem.skinStyle,
        newItem.skinTemplate,
      );
      const palette = getColorPaletteById(newItem.skinColor || '15');
      Object.assign(formModel, {
        ...newItem,
        skinStyle: layoutStyle,
        skinTemplate: layoutTemplate,
        templateType: 'main-site',
        clientLanguages: {
          desktop: newItem.clientLanguages || ['zh-CN'],
          h5: newItem.clientLanguages || ['zh-CN'],
          ios: newItem.clientLanguages || ['zh-CN'],
          android: newItem.clientLanguages || ['zh-CN'],
        },
        brandIcon: resolveBrandIconForPreview(newItem.skinTemplate),
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
        lobbyBackgroundSource: newItem.lobbyBackgroundSource ?? 'system',
        lobbyCustomImageUrl: newItem.lobbyCustomImageUrl ?? '',
        patternBackgroundColor: newItem.patternBackgroundColor ?? '#1a1a1a',
        ...(() => {
          const lobbyPatternUrl = resolveLobbyPatternUrlFromRecord(newItem);
          const tab =
            inferLobbyPatternTabFromUrl(lobbyPatternUrl) ??
            newItem.lobbyPatternTab ??
            'dark';
          return { lobbyPatternTab: tab, lobbyPatternUrl };
        })(),
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
        skinStyle: 'comprehensive_v1',
        gameColor: '有底色',
        skinColor: '15',
        skinColorRgb: 'rgb(5, 65, 70)',
        skinColorHex: '#054146', // Default hex
        skinTemplate: 'comprehensive_v1',
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
        lobbyBackgroundSource: 'system',
        lobbyCustomImageUrl: '',
        patternBackgroundColor: '#1a1a1a',
        lobbyPatternTab: 'dark',
        lobbyPatternUrl: '',
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

watch(
  () => formModel.skinStyle,
  (style) => {
    if (isLayoutStyleValue(style)) {
      formModel.skinTemplate = style;
    }
  },
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
      skinTemplate: resolveSkinTemplateForSave(
        formModel.skinStyle,
        formModel.skinTemplate,
      ),
      clientLanguages: uniqueLanguages,
      authMode: formModel.authMode,
      appSetting: formModel.appSetting,
      backendRemark: formModel.backendRemark,
      operator: formModel.operator,
      lobbyBackgroundSource: formModel.lobbyBackgroundSource,
      lobbyCustomImageUrl:
        formModel.lobbyBackgroundSource === 'custom_image'
          ? formModel.lobbyCustomImageUrl?.trim() || ''
          : '',
      patternBackgroundColor: formModel.patternBackgroundColor,
      lobbyPatternTab: formModel.lobbyPatternTab,
      lobbyPatternUrl: formModel.lobbyPatternUrl?.trim() || '',
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

.lobby-pattern-tabs-root {
  width: 100%;
  min-width: 0;
}

.lobby-pattern-tabs {
  width: 100%;
}

.lobby-pattern-tabs :deep(.n-tab-pane) {
  width: 100%;
}

.lobby-pattern-panel {
  width: 100%;
  max-width: 100%;
  margin-top: 4px;
  padding: 8px 10px;
  box-sizing: border-box;
  background-color: #d0d0d0 !important;
  border: 1px solid #a8a8a8 !important;
  border-radius: 6px;
}

.lobby-pattern-grid {
  display: grid;
  width: 100%;
  grid-template-columns: repeat(auto-fill, 44px);
  grid-auto-rows: 44px;
  justify-content: start;
  gap: 5px;
  max-height: min(420px, 52vh);
  min-height: 220px;
  overflow-y: auto;
  overflow-x: hidden;
}

.lobby-pattern-cell {
  position: relative;
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  border: 1px solid #b8b8b8;
  border-radius: 4px;
  cursor: pointer;
  padding: 0;
  background-color: #a8a8a8;
  background-clip: padding-box;
  overflow: hidden;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.08);
}

.lobby-pattern-cell--none {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
}

.lobby-pattern-cell:hover:not(:disabled) {
  border-color: #2080f0;
}

.lobby-pattern-cell.is-active {
  border: 2px solid #2080f0;
  box-shadow: 0 0 0 1px rgba(32, 128, 240, 0.35);
  z-index: 1;
}

.lobby-pattern-cell:disabled {
  cursor: not-allowed;
  opacity: 0.75;
}

.lobby-pattern-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  vertical-align: top;
  background-color: #a8a8a8;
}

.lobby-pattern-none-label {
  font-size: 10px;
  line-height: 1.15;
  text-align: center;
  color: #555;
  padding: 2px;
}

.preview-panel {
  width: 300px;
  display: flex;
  flex-direction: column;
  border-left: 1px solid #e0e0e0;
  padding-left: 24px;
}
</style>
