<template>
  <div class="h-full bg-gray-50 p-6">
    <div class="mb-4">
      <h1 class="mb-2 text-2xl font-semibold text-gray-900">{{ $t('operations.layout.title') }}</h1>
      <p class="text-sm text-gray-600">
        {{ $t('operations.layout.description') }}
        
      </p>
    </div>

    <n-alert type="info" class="mb-4" :bordered="false">
      {{ $t('operations.layout.editHint') }}
    </n-alert>

    <!-- 必须与品牌皮肤同一 brandCode，否则之前会加载「全局最新一条」版式，保存写到错误行 -->
    <div
      v-if="brandSkinSelectOptions.length > 0"
      class="mb-4 flex flex-wrap items-center gap-3 rounded-lg border bg-white p-4 shadow-sm"
    >
      <span class="text-sm font-medium text-gray-700">{{ $t('operations.layout.currentBrand') }}</span>
      <n-select
        v-model:value="selectedBrandCode"
        class="min-w-[280px]"
        :options="brandSkinSelectOptions"
        :placeholder="$t('operations.layout.selectBrand')"
        @update:value="handleBrandCodeChange"
      />
      <span class="text-xs text-gray-500">
        {{ $t('operations.layout.brandHint') }}
      </span>
    </div>

    <!-- Main Content -->
    <div class="flex min-h-[calc(100vh-140px)] gap-6">
      <!-- Left Panel - Configuration -->
      <div class="flex-1 rounded-lg border bg-white shadow-sm">
            <div class="space-y-8 p-6">
              <div
                class="mb-6 flex flex-wrap items-start justify-between gap-4 border-b border-gray-200 pb-4"
              >
                <div class="min-w-0 flex-1 space-y-2">
                  <p class="text-sm text-gray-600">
                    <span class="font-medium text-gray-800">{{ $t('operations.layout.brandNameId') }}</span>
                    <span>{{ brandNameIdDisplay }}</span>
                  </p>
                  <p class="text-sm text-gray-600">
                    <span class="font-medium text-gray-800">{{ $t('operations.layout.skinStyle') }}</span>
                    <span>{{ skinTemplateStyleDisplay }}</span>
                  </p>
                  <p class="text-xs text-gray-500">
                    {{ $t('operations.layout.layoutKey') }}{{ layoutSkinKey }}
                  </p>
                </div>
                <div class="ml-auto shrink-0 self-start pt-0.5">
                  <n-button
                    v-if="!isEditMode"
                    type="primary"
                    size="large"
                    strong
                    class="min-w-[5.5rem] shadow-sm"
                    @click="enterEditMode"
                  >
                    {{ $t('common.modify') }}
                  </n-button>
                  <n-button
                    v-else
                    size="large"
                    quaternary
                    @click="cancelEdit"
                  >
                    {{ $t('operations.layout.exitEdit') }}
                  </n-button>
                </div>
              </div>

              <!-- 顶部导航广告图开关 -->
              <div class="rounded-lg border bg-gray-50 p-6">
                <h4 class="text-md mb-3 font-medium text-gray-900">{{ $t('operations.layout.adBanner') }}</h4>
                <p class="mb-4 text-sm text-gray-600">
                  {{ $t('operations.layout.adBannerDesc') }}
                </p>
                <div
                  v-if="!isEditMode"
                  class="text-sm font-medium text-gray-800"
                >
                  {{ layoutConfig.topNavAdEnabled ? $t('operations.layout.opened') : $t('operations.layout.closed') }}
                </div>
                <div v-else class="flex items-center gap-3">
                  <n-switch v-model:value="layoutConfig.topNavAdEnabled" />
                  <span class="text-sm text-gray-600">{{
                    layoutConfig.topNavAdEnabled ? $t('operations.layout.open') : $t('operations.layout.close')
                  }}</span>
                </div>
              </div>

              <!-- My Page Style Section（其余 layout 字段仍随保存提交） -->
              <div class="rounded-lg border bg-gray-50 p-6">
                <h4 class="text-md mb-4 font-medium text-gray-900">
                  {{ $t('operations.layout.myPageStyle') }}
                  <span v-if="!isEditMode">{{ myPageStyleDisplayName }}</span>
                  <span v-if="isEditMode" class="ml-2 text-blue-500">✓</span>
                </h4>

                <!-- View Mode -->
                <div v-if="!isEditMode" class="rounded-lg border bg-white p-4">
                  <div
                    class="relative mx-auto max-w-[220px] overflow-hidden rounded-lg border-2 border-gray-300 bg-gray-100"
                  >
                    <img
                      :src="currentMyPageTemplateUrl"
                      :alt="$t('operations.layout.myPagePreview')"
                      class="h-auto w-full object-cover object-top"
                    />
                  </div>
                  <p class="mt-2 text-center text-sm text-gray-500">
                    {{ myPageStyleDisplayName }}
                  </p>
                </div>

                <!-- Edit Mode -->
                <div v-if="isEditMode" class="space-y-4">
                  <n-radio-group v-model:value="layoutConfig.myPageStyle">
                    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div
                        v-for="opt in MY_PAGE_STYLE_OPTIONS"
                        :key="opt.value"
                        class="text-center"
                      >
                        <n-radio :value="opt.value" class="mb-2 w-full">
                          <div
                            class="overflow-hidden rounded-lg border-2 bg-white"
                            :class="
                              layoutConfig.myPageStyle === opt.value
                                ? 'border-blue-500 ring-2 ring-blue-200'
                                : 'border-gray-300'
                            "
                          >
                            <img
                              :src="MY_PAGE_STYLE_TEMPLATE_IMAGE[opt.value]"
                              :alt="opt.label"
                              class="max-h-80 w-full object-cover object-top"
                            />
                          </div>
                        </n-radio>
                        <p class="mt-1 text-xs font-medium text-gray-700">
                          {{ opt.label }}
                        </p>
                      </div>
                    </div>
                  </n-radio-group>
                </div>
              </div>

              <!-- Edit Mode Action Buttons -->
              <div
                v-if="isEditMode"
                class="flex flex-wrap justify-center gap-3 border-t pt-6"
              >
                <n-button size="large" @click="cancelEdit">{{ $t('common.cancel') }}</n-button>
                <n-button size="large" type="warning" @click="generatePreview">
                  {{ $t('operations.layout.generatePreview') }}
                </n-button>
                <n-button type="primary" size="large" @click="saveConfig">
                  {{ $t('common.save') }}
                </n-button>
              </div>
            </div>
      </div>

      <!-- Right Panel - Mobile Preview -->
      <div class="w-100 rounded-lg border bg-white p-4 shadow-sm">
        <div class="mb-4 flex flex-col items-center gap-2">
          <h3 class="text-center text-lg font-medium text-gray-900">{{ $t('operations.layout.preview') }}</h3>
          <n-button type="warning" @click="generatePreview">{{ $t('operations.layout.generatePreview') }}</n-button>
          <p class="text-center text-xs text-gray-500">
            {{ $t('operations.layout.previewHint') }}
          </p>
        </div>

        <!-- Mobile Frame -->
        <div
          class="w-200 mx-auto h-[600px] rounded-[2rem] bg-black p-3 shadow-2xl"
        >
          <div
            class="relative h-full w-full overflow-hidden rounded-[1.5rem] bg-white"
          >
            <!-- Mobile Content Preview -->
            <iframe
              ref="previewIframe"
              :src="previewUrl"
              class="h-full w-full border-0"
              @load="handleIframeLoad"
            >
            </iframe>

            <!-- Fallback Preview Content (when iframe not available) -->
            <div v-if="!previewUrl" class="h-full w-full overflow-y-auto">
              <!-- Top Banner -->
              <div
                class="flex h-20 items-center justify-between bg-gradient-to-r from-blue-500 to-purple-600 px-4"
              >
                <div class="text-lg font-bold text-white">JACKPOT</div>
                <div class="flex gap-2">
                  <button
                    class="rounded bg-white bg-opacity-20 px-3 py-1 text-sm text-white"
                  >
                    {{ $t('operations.layout.login') }}
                  </button>
                  <button
                    class="rounded bg-white px-3 py-1 text-sm text-blue-600"
                  >
                    {{ $t('operations.layout.register') }}
                  </button>
                </div>
              </div>

              <!-- Navigation Icons -->
              <div class="grid grid-cols-4 gap-4 bg-gray-50 p-4">
                <div class="text-center">
                  <div
                    class="mx-auto mb-1 flex h-12 w-12 items-center justify-center rounded-lg bg-red-500"
                  >
                    <span class="text-xs text-white">🎁</span>
                  </div>
                  <span class="text-xs text-gray-600">{{ $t('operations.layout.promotion') }}</span>
                </div>
                <div class="text-center">
                  <div
                    class="mx-auto mb-1 flex h-12 w-12 items-center justify-center rounded-lg bg-green-500"
                  >
                    <span class="text-xs text-white">💰</span>
                  </div>
                  <span class="text-xs text-gray-600">{{ $t('operations.layout.deposit') }}</span>
                </div>
                <div class="text-center">
                  <div
                    class="mx-auto mb-1 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500"
                  >
                    <span class="text-xs text-white">👥</span>
                  </div>
                  <span class="text-xs text-gray-600">{{ $t('operations.layout.agent') }}</span>
                </div>
                <div class="text-center">
                  <div
                    class="mx-auto mb-1 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500"
                  >
                    <span class="text-xs text-white">👤</span>
                  </div>
                  <span class="text-xs text-gray-600">{{ $t('operations.layout.profile') }}</span>
                </div>
              </div>

              <!-- Game Cards -->
              <div class="space-y-3 p-4">
                <h4 class="font-medium text-gray-800">{{ $t('operations.layout.hotGames') }}</h4>
                <div class="grid grid-cols-3 gap-3">
                  <div
                    class="flex h-16 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500"
                  >
                    <span class="text-sm font-bold text-white">PG</span>
                  </div>
                  <div
                    class="flex h-16 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500"
                  >
                    <span class="text-sm font-bold text-white">{{ $t('operations.layout.fishing') }}</span>
                  </div>
                  <div
                    class="flex h-16 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-emerald-500"
                  >
                    <span class="text-sm font-bold text-white">{{ $t('operations.layout.sports') }}</span>
                  </div>
                </div>
              </div>

              <!-- Self-promotion Banner (conditional) -->
              <div v-if="selfPromotionEnabled" class="mx-4 mb-4">
                <div
                  class="flex h-16 items-center justify-center rounded-lg bg-gradient-to-r from-green-400 to-blue-500"
                >
                  <span class="text-sm font-medium text-white"
                    >{{ $t('operations.layout.selfPromoBanner') }}</span
                  >
                </div>
              </div>

              <!-- Bottom Navigation -->
              <div
                class="absolute bottom-0 left-0 right-0 h-16 border-t bg-white"
              >
                <div class="flex h-full items-center justify-around px-2">
                  <div
                    v-for="(button, index) in getActiveButtons()"
                    :key="index"
                    class="flex flex-col items-center"
                  >
                    <img
                      v-if="getIconImageUrl(button)"
                      :src="getIconImageUrl(button)"
                      :alt="button.label"
                      class="mx-auto mb-1 h-4 w-4 object-contain"
                    />
                    <div v-else-if="button.icon" class="mb-1 text-xs">
                      {{ getIconDisplay(button.icon) }}
                    </div>
                    <div v-else class="mb-1 h-6 w-6 rounded bg-gray-200"></div>
                    <span class="text-xs text-gray-600">{{
                      button.label || $t('operations.layout.button')
                    }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Preview Info -->
      </div>
    </div>

    <!-- Edit Skin Name Modal -->
    <n-modal
      v-model:show="showEditModal"
      preset="dialog"
      :title="$t('operations.layout.editSkinName')"
    >
      <div class="space-y-4">
        <n-form>
          <n-form-item :label="$t('operations.layout.styleName')">
            <n-input
              v-model:value="editingSkinName"
              :placeholder="$t('operations.layout.styleNamePlaceholder')"
            />
          </n-form-item>
        </n-form>
      </div>
      <template #action>
        <n-space>
          <n-button @click="showEditModal = false">{{ $t('common.cancel') }}</n-button>
          <n-button type="primary" @click="saveSkinName">{{ $t('common.save') }}</n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- Icon Selector Modal -->
    <n-modal
      v-model:show="iconSelectorShow"
      preset="card"
      :title="$t('operations.layout.selectIcon')"
      style="width: 600px; max-height: 70vh"
    >
      <div class="max-h-96 overflow-y-auto">
        <div class="grid grid-cols-6 gap-4 p-4">
          <div
            v-for="iconItem in availableIcons"
            :key="iconItem.key"
            class="cursor-pointer rounded-lg border-2 p-3 text-center transition-all hover:border-blue-400"
            :class="
              selectedIcon === iconItem.key
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200'
            "
            @click="selectIcon(iconItem.key)"
          >
            <img
              v-if="iconItem.imageUrl"
              :src="iconItem.imageUrl"
              :alt="iconItem.label"
              class="mx-auto mb-2 h-8 w-8 object-contain"
            />
            <div v-else class="mb-2 text-2xl">{{ iconItem.display }}</div>
            <div class="text-xs text-gray-600">{{ iconItem.label }}</div>
          </div>
        </div>
      </div>
      <template #footer>
        <n-space justify="end">
          <n-button @click="iconSelectorShow = false">{{ $t('common.cancel') }}</n-button>
          <n-button type="primary" @click="confirmIconSelection">{{ $t('operations.layout.confirm') }}</n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- Icon Upload Modal -->
    <n-modal
      v-model:show="showIconUploadModal"
      preset="card"
      :title="$t('operations.layout.uploadIcon')"
      style="width: 500px"
    >
      <div class="space-y-4">
        <n-form>
          <n-form-item :label="$t('operations.layout.iconKey')">
            <n-input
              v-model:value="uploadForm.iconKey"
              :placeholder="$t('operations.layout.iconKeyPlaceholder')"
            />
          </n-form-item>
          <n-form-item :label="$t('operations.layout.iconName')">
            <n-input
              v-model:value="uploadForm.iconLabel"
              :placeholder="$t('operations.layout.iconNamePlaceholder')"
            />
          </n-form-item>
          <n-form-item :label="$t('operations.layout.category')">
            <n-input
              v-model:value="uploadForm.category"
              :placeholder="$t('operations.layout.categoryPlaceholder')"
            />
          </n-form-item>
          <n-form-item :label="$t('operations.layout.iconFile')">
            <n-upload
              ref="uploadRef"
              :max="1"
              :show-file-list="true"
              :on-change="handleFileChange"
              accept="*/*"
              :default-upload="false"
            >
              <n-button>{{ $t('operations.layout.selectImageFile') }}</n-button>
            </n-upload>
          </n-form-item>
        </n-form>
        <div v-if="uploadPreview" class="text-center">
          <img
            :src="uploadPreview"
            :alt="$t('operations.layout.previewAlt')"
            class="mx-auto h-16 w-16 rounded border object-contain"
          />
          <p class="mt-2 text-xs text-gray-500">{{ $t('operations.layout.iconPreview') }}</p>
        </div>
      </div>
      <template #footer>
        <n-space justify="end">
          <n-button @click="closeUploadModal">{{ $t('common.cancel') }}</n-button>
          <n-button type="primary" @click="uploadIcon" :loading="uploading"
            >{{ $t('common.upload') }}</n-button
          >
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { $t } from '@vben/locales';

/**
 * 阶段一：仅「我的页面样式」提供编辑 UI。
 * `layoutConfig` 与保存请求仍携带完整字段（默认值或接口回填），便于后端落库与后续开放更多项。
 */
import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import {
  NButton,
  NModal,
  NForm,
  NFormItem,
  NInput,
  NSpace,
  NRadio,
  NRadioGroup,
  NUpload,
  NAlert,
  NSwitch,
  NSelect,
  useMessage,
} from 'naive-ui';
import {
  LayoutDesignApi,
  PublicLayoutApi,
  MY_PAGE_STYLE_TEMPLATE_IMAGE,
} from '../../api/layout-design';
import type { MyPageStyleId } from '../../api/layout-design';
import {
  getBrandSkinLangConfigs,
  getLayoutStyleLabel,
  isLayoutStyleValue,
  normalizeSkinStyleForForm,
} from '../../api/skinLang';
import { useSkinColorOptions } from '../../composables/useColorTheme';

const MY_PAGE_STYLE_OPTIONS: { value: MyPageStyleId; label: string }[] = [
  { value: 'profile_v1', label: 'profile_v1' },
  { value: 'profile_v7', label: 'profile_v7' },
];

function normalizeMyPageStyle(raw: string | undefined | null): MyPageStyleId {
  return raw === 'profile_v7' ? 'profile_v7' : 'profile_v1';
}

// Composables
const message = useMessage();
const route = useRoute();

/** 与「品牌皮肤」列表对齐，用于筛选 layout_config.brandCode */
const brandSkinSelectOptions = ref<{ label: string; value: string }[]>([]);
const selectedBrandCode = ref<string | null>(null);
const { getSkinColorLabel } = useSkinColorOptions();

// Reactive data
const currentSkinName = ref('');
const selfPromotionEnabled = ref(false);
const showEditModal = ref(false);
const editingSkinName = ref('');
const previewIframe = ref<HTMLIFrameElement>();
const isEditMode = ref(false);

// Button configuration state
const isButtonEditMode = ref(false);
const iconSelectorShow = ref(false);
const selectedIcon = ref('');
const currentButtonGroup = ref('');
const currentButtonIndex = ref(0);
const showValidationError = ref(false);

// Icon upload state
const showIconUploadModal = ref(false);
const uploading = ref(false);
const uploadPreview = ref('');
const uploadRef = ref();
const uploadForm = reactive({
  iconKey: '',
  iconLabel: '',
  category: '',
  file: null as File | null,
});

// Layout configuration values
const layoutConfig = reactive({
  bannerStyle: 'common' as
    | 'common'
    | 'small'
    | 'scroll'
    | 'medium'
    | 'large',
  myPageStyle: 'profile_v1' as MyPageStyleId,
  gameCardIcon: 'european' as 'european' | 'classic',
  platformCardStyle: 'classic',
  popupStyle: 'style2' as 'style1' | 'style2' | 'style3' | 'style4',
  pageStyle: 'manual' as 'manual' | 'auto',
  badgeRecommendStyle: 'badge1',
  badgeNewStyle: 'badge1',
  badgeHotStyle: 'badge1',
  lobbyButtonStyle: 'style1',
  scrollSensitivity: 'medium' as
    | 'slow'
    | 'slower'
    | 'medium'
    | 'faster'
    | 'fast',
  homeLayoutStyle: 'default',
  sideMenuStyle: 'default',
  noWalletGuideEnabled: false,
  topNavAdEnabled: true,
});

/** 切换品牌且无历史版式行时重置表单，避免沿用上一品牌的草稿 */
function resetLayoutDraftForNewBrand() {
  Object.assign(layoutConfig, {
    bannerStyle: 'common',
    myPageStyle: 'profile_v1',
    gameCardIcon: 'european',
    platformCardStyle: 'classic',
    popupStyle: 'style2',
    pageStyle: 'manual',
    badgeRecommendStyle: 'badge1',
    badgeNewStyle: 'badge1',
    badgeHotStyle: 'badge1',
    lobbyButtonStyle: 'style1',
    scrollSensitivity: 'medium',
    homeLayoutStyle: 'default',
    sideMenuStyle: 'default',
    noWalletGuideEnabled: false,
    topNavAdEnabled: true,
  });
  currentSkinName.value = 'Rollex';
  selfPromotionEnabled.value = false;
  buttonConfig.beforeLogin = Array.from({ length: 5 }, () => ({
    icon: '',
    label: '',
  }));
  buttonConfig.afterLogin = Array.from({ length: 5 }, () => ({
    icon: '',
    label: '',
  }));
}

// Add layoutConfigId to track the current configuration
const layoutConfigId = ref<number | null>(null);
/** 当前版式配置关联的品牌编号，用于拉取 brandSkin */
const layoutBrandCode = ref<string | undefined>(undefined);

type LayoutButtonSlot = { icon: string; label: string; imageUrl?: string };

// Button configuration values
const buttonConfig = reactive({
  beforeLogin: [
    { icon: '', label: '' },
    { icon: '', label: '' },
    { icon: '', label: '' },
    { icon: '', label: '' },
    { icon: '', label: '' },
  ] as LayoutButtonSlot[],
  afterLogin: [
    { icon: '', label: '' },
    { icon: '', label: '' },
    { icon: '', label: '' },
    { icon: '', label: '' },
    { icon: '', label: '' },
  ] as LayoutButtonSlot[],
});

// Available icons list (will be loaded from API)
const availableIcons = ref<
  Array<{
    id: number;
    key: string;
    label: string;
    display: string;
    imageUrl?: string;
    imageType?: string;
    category?: string;
  }>
>([]);

// Backup for cancel functionality
const originalLayoutConfig = ref({});
const originalButtonConfig = ref({});

// Preview URL (can be set to actual preview endpoint when available)
const previewUrl = ref('https://sevenki.118br.com/');

// Brand skin information（含 skinTemplate 用于版式能力判断）
const brandSkinInfo = ref<{
  brandName?: string;
  brandCode?: string;
  skinStyle: string;
  skinColor: string;
  colorName: string;
  skinTemplate: string;
} | null>(null);

const layoutSkinKey = computed(() => {
  const t = brandSkinInfo.value?.skinTemplate?.trim() || '';
  if (isLayoutStyleValue(t)) return t;
  const s = brandSkinInfo.value?.skinStyle?.trim() || '';
  if (isLayoutStyleValue(s)) return s;
  return normalizeSkinStyleForForm(s, t);
});

/** 版式模板中文名（如 comprehensive_v1 → 综合版1）+ 配色名 */
const skinTemplateStyleDisplay = computed(() => {
  const info = brandSkinInfo.value;
  if (!info) return $t('operations.layout.notSet');
  const templateLabel = getLayoutStyleLabel(info.skinStyle, info.skinTemplate);
  const color = info.colorName?.trim();
  if (!templateLabel || templateLabel === '-' || templateLabel === $t('operations.layout.notSet')) {
    return color && color !== $t('operations.layout.unknownColor') ? color : $t('operations.layout.notSet');
  }
  if (color && color !== $t('operations.layout.unknownColor')) {
    return `${templateLabel} · ${color}`;
  }
  return templateLabel;
});

/** 品牌皮肤中的名称与编号；无皮肤数据时回退版式配置里的 skinName */
const brandNameIdDisplay = computed(() => {
  const bs = brandSkinInfo.value;
  if (bs?.brandName?.trim() || bs?.brandCode?.trim()) {
    const name = bs.brandName?.trim();
    const code = bs.brandCode?.trim();
    if (name && code) return `${name}（${code}）`;
    return name || code || '—';
  }
  return currentSkinName.value;
});

// Methods
const editSkinName = () => {
  editingSkinName.value = currentSkinName.value;
  showEditModal.value = true;
};

const saveSkinName = () => {
  if (editingSkinName.value.trim()) {
    currentSkinName.value = editingSkinName.value.trim();
    showEditModal.value = false;
    message.success($t('operations.layout.skinNameUpdated'));
  } else {
    message.error($t('operations.layout.invalidStyleName'));
  }
};

const enterEditMode = () => {
  // Backup current config for cancel functionality
  originalLayoutConfig.value = { ...layoutConfig };
  isEditMode.value = true;
  message.info($t('operations.layout.enterEditMode'));
};

const cancelEdit = () => {
  // Restore original config
  Object.assign(layoutConfig, originalLayoutConfig.value);
  isEditMode.value = false;
  message.info($t('operations.layout.cancelEdit'));
};

const saveConfig = async () => {
  try {
    console.log('🔄 saveConfig called - starting save process...');
    await saveLayoutConfig();
    updatePreview();
    console.log('✅ saveConfig completed successfully');
  } catch (error) {
    console.error('❌ Error saving config:', error);
    message.error($t('operations.layout.saveFailedRetry'));
  }
};

const handleIframeLoad = () => {
  console.log('Preview iframe loaded');
};

const updatePreview = () => {
  // This function would normally send updates to the preview iframe
  // For now, it's just updating the reactive data that controls the fallback preview
  console.log('Updating preview with current settings');
};

// Button configuration methods
const enterButtonEditMode = () => {
  // Backup current config for cancel functionality
  originalButtonConfig.value = JSON.parse(JSON.stringify(buttonConfig));
  isButtonEditMode.value = true;
  showValidationError.value = false;
  message.info($t('operations.layout.enterButtonEdit'));
};

const cancelButtonEdit = () => {
  // Restore original config
  Object.assign(buttonConfig, originalButtonConfig.value);
  isButtonEditMode.value = false;
  showValidationError.value = false;
  message.info($t('operations.layout.cancelEdit'));
};

const openIconSelector = (group: string, index: number) => {
  currentButtonGroup.value = group;
  currentButtonIndex.value = index;
  selectedIcon.value = '';
  iconSelectorShow.value = true;
};

const selectIcon = (iconKey: string) => {
  selectedIcon.value = iconKey;
};

const confirmIconSelection = () => {
  if (selectedIcon.value) {
    const iconData = availableIcons.value.find(
      (icon) => icon.key === selectedIcon.value,
    );
    if (iconData) {
      // Clear the same icon from other buttons in the same group
      if (currentButtonGroup.value === 'beforeLogin') {
        // Clear the same icon from other beforeLogin buttons
        buttonConfig.beforeLogin.forEach((btn, idx) => {
          if (idx !== currentButtonIndex.value && btn.icon === iconData.key) {
            btn.icon = '';
            btn.label = '';
          }
        });

        // Set the icon for the current button
        buttonConfig.beforeLogin[currentButtonIndex.value] = {
          icon: iconData.key,
          label: iconData.label,
          imageUrl: iconData.imageUrl,
        };
      } else {
        // Clear the same icon from other afterLogin buttons
        buttonConfig.afterLogin.forEach((btn, idx) => {
          if (idx !== currentButtonIndex.value && btn.icon === iconData.key) {
            btn.icon = '';
            btn.label = '';
          }
        });

        // Set the icon for the current button
        buttonConfig.afterLogin[currentButtonIndex.value] = {
          icon: iconData.key,
          label: iconData.label,
          imageUrl: iconData.imageUrl,
        };
      }
    }
  }
  iconSelectorShow.value = false;
  showValidationError.value = false;

  // Update preview in real-time
  updatePreview();
};

const getIconDisplay = (iconKey: string) => {
  const iconData = availableIcons.value.find((icon) => icon.key === iconKey);
  return iconData ? iconData.display : '';
};

const getIconImageUrl = (
  iconKeyOrButton: string | { icon: string; imageUrl?: string },
) => {
  // If it's a button object with imageUrl, use it directly
  if (typeof iconKeyOrButton === 'object' && iconKeyOrButton.imageUrl) {
    return iconKeyOrButton.imageUrl;
  }

  // Otherwise, look up by iconKey in available icons
  const iconKey =
    typeof iconKeyOrButton === 'string'
      ? iconKeyOrButton
      : iconKeyOrButton.icon;
  const iconData = availableIcons.value.find((icon) => icon.key === iconKey);
  return iconData ? iconData.imageUrl : '';
};

const validateButtonConfig = () => {
  const beforeLoginValid = buttonConfig.beforeLogin.every(
    (btn) => btn.icon && btn.label,
  );
  const afterLoginValid = buttonConfig.afterLogin.every(
    (btn) => btn.icon && btn.label,
  );
  return beforeLoginValid && afterLoginValid;
};

const generatePreview = () => {
  updatePreview();
  const base = previewUrl.value;
  if (previewIframe.value && base) {
    const sep = base.includes('?') ? '&' : '?';
    previewIframe.value.src = `${base}${sep}_pv=${Date.now()}`;
  }
  message.success($t('operations.layout.previewRefreshed'));
};

const saveButtonConfig = async () => {
  if (!validateButtonConfig()) {
    showValidationError.value = true;
    message.error($t('operations.layout.completeButtonsFirst'));
    return;
  }

  try {
    await saveLayoutConfig();
    showValidationError.value = false;
    updatePreview();
  } catch (error) {
    console.error('Error saving button config:', error);
    message.error($t('operations.layout.saveFailedRetry'));
  }
};

// Helper methods
const getActiveButtons = () => {
  // Return the appropriate button set based on login state
  // For preview purposes, we'll show beforeLogin buttons by default
  // In a real app, this would depend on user authentication state
  const hasConfiguredButtons = buttonConfig.beforeLogin.some((btn) => btn.icon);
  return hasConfiguredButtons
    ? buttonConfig.beforeLogin
    : [
        { icon: 'home', label: $t('operations.layout.home') },
        { icon: 'promotion', label: $t('operations.layout.promotion') },
        { icon: 'deposit', label: $t('operations.layout.deposit') },
        { icon: 'service', label: $t('operations.layout.service') },
        { icon: 'profile', label: $t('operations.layout.profile') },
      ];
};

// Icon Upload Functions
const handleFileChange = (data: any) => {
  console.log('File change event:', data);

  if (data && data.fileList && data.fileList.length > 0) {
    const file = data.fileList[0].file;
    console.log('Selected file:', file);

    if (file instanceof File) {
      uploadForm.file = file;

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        uploadPreview.value = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    } else {
      console.error('Invalid file object:', file);
      message.error($t('operations.layout.invalidFile'));
    }
  } else {
    // No files selected - clear preview and form
    console.log('No files selected - clearing preview');
    uploadForm.file = null;
    uploadPreview.value = '';
  }
};

const uploadIcon = async () => {
  console.log('Upload attempt:', {
    iconKey: uploadForm.iconKey,
    iconLabel: uploadForm.iconLabel,
    file: uploadForm.file
      ? {
          name: uploadForm.file.name,
          size: uploadForm.file.size,
          type: uploadForm.file.type,
        }
      : null,
  });

  if (!uploadForm.iconKey || !uploadForm.iconLabel || !uploadForm.file) {
    message.error($t('operations.layout.completeUploadInfo'));
    return;
  }

  uploading.value = true;

  try {
    const formData = new FormData();
    formData.append('iconImage', uploadForm.file);
    formData.append('iconKey', uploadForm.iconKey);
    formData.append('iconLabel', uploadForm.iconLabel);
    if (uploadForm.category) {
      formData.append('category', uploadForm.category);
    }

    const response = await LayoutDesignApi.uploadIcon(formData);

    if (response.success) {
      message.success($t('operations.layout.iconUploadSuccess'));
      await loadAvailableIcons(); // Reload icons list
      closeUploadModal();
    } else {
      message.error(response.message || $t('operations.layout.uploadFailedRetry'));
    }
  } catch (error) {
    console.error('Upload error:', error);
    message.error($t('operations.layout.uploadFailedRetry'));
  } finally {
    uploading.value = false;
  }
};

const closeUploadModal = () => {
  showIconUploadModal.value = false;
  uploadForm.iconKey = '';
  uploadForm.iconLabel = '';
  uploadForm.category = '';
  uploadForm.file = null;
  uploadPreview.value = '';
  if (uploadRef.value) {
    uploadRef.value.clear();
  }
};

// API Functions
const loadAvailableIcons = async () => {
  try {
    const response = await LayoutDesignApi.getAvailableIcons();
    if (response.success) {
      availableIcons.value = response.data.map((icon) => ({
        id: icon.id,
        key: icon.iconKey,
        label: icon.iconLabel,
        display: icon.iconDisplay || '🔲', // Fallback for old records
        imageUrl: icon.imageUrl,
        imageType: icon.imageType,
        category: icon.category,
      }));
    }
  } catch (error) {
    console.error('Failed to load available icons:', error);
    message.error($t('operations.layout.loadIconsFailed'));
  }
};

async function loadBrandSkinScope() {
  try {
    const resp = await getBrandSkinLangConfigs({ page: 1, pageSize: 100 });
    let rows: any[] = [];
    if (resp && typeof resp === 'object') {
      if (
        'data' in resp &&
        resp.data &&
        Array.isArray((resp as { data: unknown }).data)
      ) {
        rows = (resp as { data: any[] }).data;
      } else if (Array.isArray(resp)) {
        rows = resp as any[];
      }
    }
    brandSkinSelectOptions.value = rows
      .map((r) => ({
        label: `${r.brandName ?? '—'}（${r.brandCode ?? r.brandId ?? ''}）`,
        value: String(r.brandCode ?? '').trim(),
      }))
      .filter((o) => o.value.length > 0);

    const q = route.query.brandCode;
    const fromQuery =
      typeof q === 'string'
        ? q.trim()
        : Array.isArray(q)
          ? String(q[0] ?? '').trim()
          : '';

    if (
      fromQuery &&
      brandSkinSelectOptions.value.some((o) => o.value === fromQuery)
    ) {
      selectedBrandCode.value = fromQuery;
    } else if (brandSkinSelectOptions.value.length > 0) {
      selectedBrandCode.value = brandSkinSelectOptions.value[0]?.value ?? null;
    } else {
      selectedBrandCode.value = null;
    }
  } catch (error) {
    console.error('Failed to load brand list for layout scope:', error);
    brandSkinSelectOptions.value = [];
    selectedBrandCode.value = null;
  }
}

async function handleBrandCodeChange() {
  await loadExistingConfig();
  await loadBrandSkinConfig(selectedBrandCode.value ?? undefined);
}

// Load brand skin configuration（需传当前版式关联的 brandCode，否则服务端不返回 brandSkin）
const loadBrandSkinConfig = async (brandCode?: string) => {
  try {
    const code = (brandCode ?? layoutBrandCode.value)?.trim();
    console.log('🎨 Loading brand skin configuration...', code || '(no brandCode)');

    const response = await PublicLayoutApi.getLayoutTheme(code);

    if (response.success && response.data?.brandSkin) {
      const brandSkin = response.data.brandSkin;

      console.log('🎨 Found brand skin config:', brandSkin);

      const colorName = getSkinColorLabel(brandSkin.skinColor) || $t('operations.layout.unknownColor');

      brandSkinInfo.value = {
        brandName: brandSkin.brandName,
        brandCode: brandSkin.brandCode,
        skinStyle: brandSkin.skinStyle || $t('operations.layout.notSet'),
        skinColor: brandSkin.skinColor || $t('operations.layout.notSet'),
        colorName,
        skinTemplate: brandSkin.skinTemplate || '',
      };

      console.log('✅ Brand skin info loaded:', brandSkinInfo.value);
    } else {
      console.log('ℹ️ No brand skin configuration found');
      brandSkinInfo.value = null;
    }
  } catch (error) {
    console.error('Failed to load brand skin configuration:', error);
    // Don't show error message as this is not critical
  }
};

// Load existing layout configuration
const loadExistingConfig = async () => {
  try {
    console.log('🔍 Loading existing layout configuration...');

    const bc = selectedBrandCode.value?.trim();
    const response = await LayoutDesignApi.getLayoutConfigs(
      bc ? { brandCode: bc, limit: 10, page: 1 } : { limit: 10, page: 1 },
    );

    if (response.success && response.data?.configs?.length > 0) {
      const existingConfig = response.data.configs[0];
      if (!existingConfig) {
        return;
      }
      layoutConfigId.value = existingConfig.id;
      layoutBrandCode.value = existingConfig.brandCode?.trim() || undefined;

      console.log(' Found existing config:', existingConfig);

      // Populate the form with existing data
      currentSkinName.value = existingConfig.skinName || 'Rollex';
      selfPromotionEnabled.value = existingConfig.selfPromotionEnabled || false;

      // Update layout configuration
      Object.assign(layoutConfig, {
        bannerStyle: existingConfig.bannerStyle || 'common',
        myPageStyle: normalizeMyPageStyle(existingConfig.myPageStyle),
        gameCardIcon: existingConfig.gameCardIcon || 'european',
        platformCardStyle: existingConfig.platformCardStyle || 'classic',
        popupStyle: existingConfig.popupStyle || 'style2',
        pageStyle: existingConfig.pageStyle || 'manual',
        badgeRecommendStyle: existingConfig.badgeRecommendStyle || 'badge1',
        badgeNewStyle: existingConfig.badgeNewStyle || 'badge1',
        badgeHotStyle: existingConfig.badgeHotStyle || 'badge1',
        lobbyButtonStyle: existingConfig.lobbyButtonStyle || 'style1',
        scrollSensitivity: existingConfig.scrollSensitivity || 'medium',
        homeLayoutStyle: existingConfig.homeLayoutStyle || 'default',
        sideMenuStyle: existingConfig.sideMenuStyle || 'default',
        noWalletGuideEnabled: existingConfig.noWalletGuideEnabled ?? false,
        topNavAdEnabled: existingConfig.topNavAdEnabled ?? true,
      });

      // Update button configuration if available
      if (
        existingConfig.buttonConfigs &&
        Array.isArray(existingConfig.buttonConfigs)
      ) {
        console.log(
          ' Processing button configs array:',
          existingConfig.buttonConfigs,
        );

        // Transform array format to grouped format
        const beforeLogin = Array.from({ length: 5 }, () => ({
          icon: '',
          label: '',
          imageUrl: '',
        }));
        const afterLogin = Array.from({ length: 5 }, () => ({
          icon: '',
          label: '',
          imageUrl: '',
        }));

        existingConfig.buttonConfigs.forEach((btn: any) => {
          const buttonData = {
            icon: btn.iconKey || '',
            label: btn.iconLabel || '',
            imageUrl: btn.imageUrl || '',
          };

          console.log(
            `🔘 Processing button: ${btn.buttonGroup}[${btn.buttonIndex}] = ${btn.iconKey} (${btn.imageUrl})`,
          );

          if (
            btn.buttonGroup === 'beforeLogin' &&
            btn.buttonIndex >= 0 &&
            btn.buttonIndex < 5
          ) {
            beforeLogin[btn.buttonIndex] = buttonData;
          } else if (
            btn.buttonGroup === 'afterLogin' &&
            btn.buttonIndex >= 0 &&
            btn.buttonIndex < 5
          ) {
            afterLogin[btn.buttonIndex] = buttonData;
          }
        });

        console.log(' Final beforeLogin config:', beforeLogin);
        console.log(' Final afterLogin config:', afterLogin);

        buttonConfig.beforeLogin = beforeLogin;
        buttonConfig.afterLogin = afterLogin;
      } else if (
        existingConfig.buttonConfigs &&
        typeof existingConfig.buttonConfigs === 'object'
      ) {
        // Handle already grouped format (from getLayoutConfig API)
        const { beforeLogin, afterLogin } = existingConfig.buttonConfigs;
        if (beforeLogin) {
          buttonConfig.beforeLogin = beforeLogin;
        }
        if (afterLogin) {
          buttonConfig.afterLogin = afterLogin;
        }
      }

      console.log('✅ Layout configuration loaded successfully');
    } else {
      layoutBrandCode.value = bc || undefined;
      layoutConfigId.value = null;
      if (bc) {
        resetLayoutDraftForNewBrand();
      }
      console.log(
        'ℹ️ No existing configuration found for this brand, will create new one on first save',
      );
    }
  } catch (error) {
    console.error('Failed to load existing configuration:', error);
    // Don't show error message as this is not critical - we can still create new config
  }
};

const saveLayoutConfig = async () => {
  try {
    console.log('📝 saveLayoutConfig - preparing data...');

    const bc =
      selectedBrandCode.value?.trim() ||
      layoutBrandCode.value?.trim() ||
      undefined;

    const requestData = {
      layoutConfig: {
        skinName: currentSkinName.value,
        bannerStyle: layoutConfig.bannerStyle,
        myPageStyle: layoutConfig.myPageStyle,
        gameCardIcon: layoutConfig.gameCardIcon,
        platformCardStyle: layoutConfig.platformCardStyle,
        popupStyle: layoutConfig.popupStyle,
        pageStyle: layoutConfig.pageStyle,
        badgeRecommendStyle: layoutConfig.badgeRecommendStyle,
        badgeNewStyle: layoutConfig.badgeNewStyle,
        badgeHotStyle: layoutConfig.badgeHotStyle,
        lobbyButtonStyle: layoutConfig.lobbyButtonStyle,
        scrollSensitivity: layoutConfig.scrollSensitivity,
        homeLayoutStyle: layoutConfig.homeLayoutStyle,
        sideMenuStyle: layoutConfig.sideMenuStyle,
        noWalletGuideEnabled: layoutConfig.noWalletGuideEnabled,
        topNavAdEnabled: layoutConfig.topNavAdEnabled,
        selfPromotionEnabled: selfPromotionEnabled.value,
        ...(bc ? { brandCode: bc } : {}),
      },
      buttonConfig: {
        beforeLogin: buttonConfig.beforeLogin,
        afterLogin: buttonConfig.afterLogin,
      },
    };

    console.log('📤 Sending request data:', requestData);
    console.log('🆔 Current layout config ID:', layoutConfigId.value);

    let resolvedId = layoutConfigId.value;
    // 页面状态丢失 id 时仍应按品牌走 PUT；服务端 POST 也已支持按 brandCode upsert
    if (!resolvedId && bc) {
      try {
        const listRes = await LayoutDesignApi.getLayoutConfigs({
          brandCode: bc,
          limit: 5,
          page: 1,
        });
        const firstId = listRes.success ? listRes.data?.configs?.[0]?.id : undefined;
        if (firstId != null) {
          resolvedId = firstId;
          layoutConfigId.value = firstId;
          console.log('🔗 Resolved layout config id from API:', resolvedId);
        }
      } catch (e) {
        console.warn('Could not prefetch layout id by brand:', e);
      }
    }

    let response;

    if (resolvedId) {
      console.log('🔄 Updating existing layout configuration...');
      response = await LayoutDesignApi.updateLayoutConfig(resolvedId, requestData);
    } else {
      console.log('🆕 Creating new layout configuration...');
      response = await LayoutDesignApi.createLayoutConfig(requestData);

      if (response.success && response.data?.id) {
        layoutConfigId.value = response.data.id;
        console.log('💾 Stored new layout config ID:', layoutConfigId.value);
      }
    }

    console.log('📥 Received response:', response);

    if (response.success) {
      console.log('✅ Layout config saved successfully!');
      message.success($t('operations.layout.layoutSaveSuccess'));
      isEditMode.value = false;
      isButtonEditMode.value = false;
      await loadExistingConfig();
      await loadBrandSkinConfig(selectedBrandCode.value ?? bc);
    } else {
      console.error('❌ Save failed - response not successful:', response);
      message.error($t('operations.layout.saveFailedUnknown', [response.message || $t('common.operationFailed')]));
    }
  } catch (error) {
    console.error('❌ Failed to save layout config:', error);
    message.error($t('operations.layout.saveFailedRetry'));
  }
};

// Initialize data on component mount
onMounted(async () => {
  console.log('🚀 LayoutDesign component mounted');
  await loadBrandSkinScope();
  await Promise.all([loadAvailableIcons(), loadExistingConfig()]);
  await loadBrandSkinConfig(selectedBrandCode.value ?? undefined);
  console.log(' All configuration data loaded, ready for user interaction');
});

const currentMyPageTemplateUrl = computed(
  () => MY_PAGE_STYLE_TEMPLATE_IMAGE[layoutConfig.myPageStyle],
);

const myPageStyleDisplayName = computed(() => {
  const opt = MY_PAGE_STYLE_OPTIONS.find(
    (o) => o.value === layoutConfig.myPageStyle,
  );
  return opt?.label ?? layoutConfig.myPageStyle;
});

</script>

<style scoped>
/* Custom styles for the layout design page */
.n-tabs :deep(.n-tabs-nav) {
  background-color: #f8fafc;
  border-radius: 0.5rem 0.5rem 0 0;
}

.n-tabs :deep(.n-tabs-tab) {
  font-weight: 500;
}

.n-tabs :deep(.n-tabs-tab--active) {
  background-color: white;
  color: #2563eb;
}

/* Mobile frame styling */
.mobile-frame {
  background: linear-gradient(145deg, #1f1f1f, #2c2c2c);
  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.3),
    inset 0 2px 4px rgba(255, 255, 255, 0.1);
}

/* Scrollbar styling for preview content */
.overflow-y-auto::-webkit-scrollbar {
  width: 2px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 1px;
}

/* Animation for toggle changes */
.transition-all {
  transition: all 0.3s ease;
}
</style>
