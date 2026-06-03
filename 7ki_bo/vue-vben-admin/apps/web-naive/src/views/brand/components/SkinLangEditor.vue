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

              <n-form-item label="品牌名称" path="brandName">
                <n-input
                  v-if="!detailMode"
                  v-model:value="formModel.brandName"
                  placeholder="输入品牌名称"
                  maxlength="128"
                  show-count
                />
                <n-text v-else>{{ formModel.brandName }}</n-text>
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

              <n-form-item label="模板底色" path="gameColor">
                <n-radio-group v-model:value="formModel.gameColor" :disabled="detailMode">
                  <n-radio value="有底色">有底色</n-radio>
                  <n-radio value="无底色">无底色</n-radio>
                </n-radio-group>
              </n-form-item>

              <n-form-item label="版式风格" path="skinStyle">
                <n-select
                  v-model:value="formModel.skinStyle"
                  :options="layoutStyleSelectOptions"
                  placeholder="选择版式风格"
                  filterable
                  :disabled="detailMode"
                />
              </n-form-item>
            </div>

            <!-- Brand Icons Section -->
            <div class="form-section">
              <h4 class="section-title">品牌图标</h4>

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

            <!-- 生效时间（放在语言设置之后，时间说明在底部） -->
            <div class="form-section effective-time-section">
              <h4 class="section-title">生效时间</h4>
              <p class="effective-time-intro">
                选择本次皮肤配置何时生效；若选自定义时间，请在下方选择具体日期与时间。
              </p>

              <n-form-item label="生效方式" path="effectiveTimeMode">
                <n-radio-group
                  v-model:value="formModel.effectiveTimeMode"
                  :disabled="detailMode"
                >
                  <n-radio value="custom">自定义时间</n-radio>
                  <n-radio value="immediate">立即生效</n-radio>
                </n-radio-group>
              </n-form-item>

              <n-form-item
                v-if="formModel.effectiveTimeMode === 'custom'"
                label="计划时间"
                path="effectiveAtTs"
              >
                <n-date-picker
                  v-model:value="formModel.effectiveAtTs"
                  type="datetime"
                  clearable
                  style="width: 100%"
                  placeholder="点击选择日期与时间"
                  :disabled="detailMode"
                />
              </n-form-item>

              <div class="last-skin-change-hint">
                <n-text depth="3">
                  上一次更换皮肤时间为
                  {{
                    formModel.lastSkinChangeAt
                      ? formatDate(formModel.lastSkinChangeAt)
                      : '暂无记录'
                  }}
                </n-text>
              </div>
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
  NDatePicker,
  NColorPicker,
  type FormInst,
  type FormRules,
} from 'naive-ui';
import {
  useSkinPreview,
  getSkinColorRGB,
  getSkinColorValues,
} from '#/composables/useSkinPreview';
import { getColorPaletteById, getDefaultBackgroundImage } from '../../../utils/colorUtils';
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

function generateBrandId(): string {
  const c = globalThis.crypto;
  if (c?.randomUUID) return c.randomUUID();
  return `brand-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

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
    brandIcon?: string;
    /** 仅展示，提交时不回写服务端时间字段 */
    lastSkinChangeAt?: string | null;
    /** 自定义生效时间（时间戳，仅表单；提交转 effectiveTime ISO） */
    effectiveAtTs?: number | null;
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
  skinTemplate: 'rolex',
  effectiveTimeMode: 'custom',
  effectiveAtTs: null,
  lastSkinChangeAt: null,
  lobbyBackgroundSource: 'system',
  lobbyCustomImageUrl: '',
  patternBackgroundColor: '#1a1a1a',
  lobbyPatternTab: 'dark',
  lobbyPatternUrl: '',
  clientLanguages: {
    desktop: ['zh-CN'],
    h5: ['zh-CN'],
    ios: ['zh-CN'],
    android: ['zh-CN'],
  },
  brandIcon: 'rolex',
  operator: '当前用户',
  updatedAt: new Date().toISOString(),
  backgroundImage: '',
});

const lobbyBlackPatternTiles = LOBBY_BLACK_PATTERN_TILES;
const lobbyWhitePatternTiles = LOBBY_WHITE_PATTERN_TILES;

function selectLobbyPattern(tab: 'light' | 'dark', url: string) {
  formModel.lobbyPatternTab = tab;
  formModel.lobbyPatternUrl = url;
}

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

/** 版式风格下拉：含当前值（兼容旧数据中的自定义 skinStyle） */
const layoutStyleSelectOptions = computed(() => {
  const v = formModel.skinStyle;
  if (!v || LAYOUT_STYLE_OPTIONS.some((o) => o.value === v)) {
    return LAYOUT_STYLE_OPTIONS;
  }
  return [{ label: `${v}（历史）`, value: v }, ...LAYOUT_STYLE_OPTIONS];
});

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
  brandName: [{ required: true, message: '品牌名称不能为空' }],
  templateType: [{ required: true, message: '请选择模板类型' }],
  skinStyle: [{ required: true, message: '请选择版式风格' }],
  skinTemplate: [{ required: true, message: '请选择模板' }],
  gameColor: [{ required: true, message: '请选择模板底色' }],
  skinColor: [{ required: true, message: '请选择皮肤颜色' }],
  effectiveTimeMode: [{ required: true, message: '请选择生效方式' }],
  effectiveAtTs: [
    {
      validator: (_rule, value: number | null | undefined) => {
        if (formModel.effectiveTimeMode !== 'custom') return true;
        return value != null && !Number.isNaN(value);
      },
      message: '自定义生效须选择计划时间',
      trigger: ['change', 'blur'],
    },
  ],
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
      formModel.skinColorRgb = colorValues.rgb;
      formModel.skinColorHex = colorValues.hex;
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

watch(
  () => formModel.effectiveTimeMode,
  (mode) => {
    if (mode === 'immediate') {
      formModel.effectiveAtTs = null;
    }
  },
);

// Watch for editing item changes
watch(
  () => props.editingItem,
  (newItem) => {
    if (newItem) {
      const layoutKey = normalizeSkinStyleForForm(
        newItem.skinStyle,
        newItem.skinTemplate,
      );
      const apiTpl = (newItem.skinTemplate ?? '').trim();
      const luxurySkinTemplate = isLayoutStyleValue(apiTpl)
        ? 'rolex'
        : apiTpl || 'rolex';
      Object.assign(formModel, {
        ...newItem,
        templateType: newItem.templateType ?? 'main-site',
        brandCode: newItem.brandCode ?? '',
        skinStyle: layoutKey,
        skinTemplate: luxurySkinTemplate,
        clientLanguages: {
          desktop: newItem.clientLanguages || ['zh-CN'],
          h5: newItem.clientLanguages || ['zh-CN'],
          ios: newItem.clientLanguages || ['zh-CN'],
          android: newItem.clientLanguages || ['zh-CN'],
        },
        brandIcon: luxurySkinTemplate,
        skinColor: newItem.skinColor || '15',
        skinColorRgb:
          newItem.skinColorRgb ||
          getSkinColorValues(newItem.skinColor || '15').rgb,
        skinColorHex:
          newItem.skinColorHex ||
          getSkinColorValues(newItem.skinColor || '15').hex,
        backgroundImage:
          newItem.backgroundImage ??
          getDefaultBackgroundImage(newItem.skinColor || '') ??
          '',
        effectiveTimeMode: newItem.effectiveTimeMode ?? 'custom',
        effectiveAtTs: (() => {
          const raw = newItem.effectiveTime;
          if (!raw) return null;
          const t = new Date(raw).getTime();
          return Number.isNaN(t) ? null : t;
        })(),
        lastSkinChangeAt: newItem.lastSkinChangeAt ?? null,
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
      // Reset form for new item
      Object.assign(formModel, {
        brandId: generateBrandId(),
        brandCode: '',
        brandName: '新品牌',
        brandType: '主站点',
        channelType: '通用',
        templateType: 'main-site',
        skinStyle: 'comprehensive_v1',
        gameColor: '有底色',
        skinColor: '15',
        skinColorRgb: 'rgb(5, 65, 70)',
        skinColorHex: '#054146', // Default hex
        skinTemplate: 'rolex',
        effectiveTimeMode: 'custom',
        effectiveAtTs: null,
        lastSkinChangeAt: null,
        lobbyBackgroundSource: 'system',
        lobbyCustomImageUrl: '',
        patternBackgroundColor: '#1a1a1a',
        lobbyPatternTab: 'dark',
        lobbyPatternUrl: '',
        clientLanguages: {
          desktop: ['zh-CN'],
          h5: ['zh-CN'],
          ios: ['zh-CN'],
          android: ['zh-CN'],
        },
        brandIcon: 'rolex',
        operator: '当前用户',
        updatedAt: new Date().toISOString(),
        backgroundImage: '',
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
const formatDate = (date: string | undefined | null) => {
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

    // Derive full color palette for the selected skin color
    const palette = getColorPaletteById(formModel.skinColor || '15');
    const generatedAt = new Date().toISOString();

    const submitData: BrandSkinLangCreateRequest = {
      brandId: formModel.brandId,
      brandCode: formModel.brandCode?.trim() || '',
      brandName: formModel.brandName,
      brandType: formModel.brandType,
      channelType: formModel.channelType,
      skinStyle: formModel.skinStyle,
      gameColor: formModel.gameColor,
      skinTemplate: resolveSkinTemplateForSave(
        formModel.skinStyle,
        formModel.skinTemplate,
      ),
      templateType: formModel.templateType,
      effectiveTimeMode: formModel.effectiveTimeMode,
      effectiveTime:
        formModel.effectiveTimeMode === 'immediate' || formModel.effectiveAtTs == null
          ? null
          : new Date(formModel.effectiveAtTs).toISOString(),
      lobbyBackgroundSource: formModel.lobbyBackgroundSource,
      lobbyCustomImageUrl:
        formModel.lobbyBackgroundSource === 'custom_image'
          ? formModel.lobbyCustomImageUrl?.trim() || ''
          : '',
      patternBackgroundColor: formModel.patternBackgroundColor,
      lobbyPatternTab: formModel.lobbyPatternTab,
      lobbyPatternUrl: formModel.lobbyPatternUrl?.trim() || '',
      clientLanguages: uniqueLanguages,
      authMode: '',
      appSetting: '',
      operator: formModel.operator,
      skinColor: formModel.skinColor,
      skinColorRgb: formModel.skinColorRgb,
      skinColorHex: formModel.skinColorHex,
      // Persist full theme palette so layout/config APIs can reuse it
      primaryColor: palette.primary,
      secondaryColor: palette.secondary,
      tertiaryColor: palette.tertiary,
      accentColor: palette.accent,
      borderColor: palette.borderColor,
      colorPalette: {
        primary: palette.primary,
        secondary: palette.secondary,
        tertiary: palette.tertiary,
        accent: palette.accent,
        borderColor: palette.borderColor,
        generated: true,
        generatedAt,
      },
      textPrimary: palette.textPrimary,
      textSecondary: palette.textSecondary,
      textAccent: palette.textAccent,
      buttonColor: palette.buttonColor,
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

.effective-time-section .effective-time-intro {
  margin: 0 0 14px 0;
  font-size: 13px;
  line-height: 1.5;
  color: var(--n-text-color-3);
}

.last-skin-change-hint {
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid var(--n-border-color);
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

/* 灰底托盘：横向铺满表单项，不再挤在左侧一条 */
.lobby-pattern-panel {
  width: 100%;
  max-width: 100%;
  margin-top: 4px;
  padding: 8px 10px;
  box-sizing: border-box;
  /* 略加深 + !important：避免暗色主题或 Naive 表单把背景“冲掉”看不见 */
  background-color: #d0d0d0 !important;
  border: 1px solid #a8a8a8 !important;
  border-radius: 6px;
}

.lobby-pattern-panel--empty {
  width: 100%;
  padding: 8px 10px;
}

/* 能摆几列摆几列：随表单宽度变宽，格子仍 44px */
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
  /* 透明 AVIF 的衬底：图案透明处会露出这块灰，而不是“没颜色” */
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
</style>
