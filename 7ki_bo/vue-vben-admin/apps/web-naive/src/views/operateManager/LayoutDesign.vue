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
                  <n-switch
                    :value="layoutConfig.topNavAdEnabled"
                    @update:value="onTopNavAdToggle"
                  />
                  <span class="text-sm text-gray-600">{{
                    layoutConfig.topNavAdEnabled ? $t('operations.layout.open') : $t('operations.layout.close')
                  }}</span>
                </div>
              </div>

              <!-- 大奖记录 / Grandes prêmios -->
              <div class="rounded-lg border bg-gray-50 p-6">
                <h4 class="text-md mb-3 font-medium text-gray-900">{{ $t('operations.layout.grandesPremios') }}</h4>
                <p class="mb-4 text-sm text-gray-600">
                  {{ $t('operations.layout.grandesPremiosDesc') }}
                </p>
                <div
                  v-if="!isEditMode"
                  class="text-sm font-medium text-gray-800"
                >
                  {{ layoutConfig.grandesPremiosEnabled ? $t('operations.layout.opened') : $t('operations.layout.closed') }}
                </div>
                <div v-else class="flex items-center gap-3">
                  <n-switch
                    :value="layoutConfig.grandesPremiosEnabled"
                    @update:value="onGrandesPremiosToggle"
                  />
                  <span class="text-sm text-gray-600">{{
                    layoutConfig.grandesPremiosEnabled ? $t('operations.layout.open') : $t('operations.layout.close')
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
                  <n-radio-group
                    :value="layoutConfig.myPageStyle"
                    @update:value="onMyPageStyleChange"
                  >
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
                <n-button type="primary" size="large" @click="saveConfig">
                  {{ $t('common.save') }}
                </n-button>
              </div>
            </div>
      </div>

      <!-- Right Panel - Scaled iPhone preview (LIVE_PREVIEW_DEVICE) -->
      <div class="w-[380px] shrink-0 rounded-lg border bg-white p-4 shadow-sm">
        <div class="mb-3 flex flex-col items-center gap-2">
          <h3 class="text-center text-lg font-medium text-gray-900">
            {{ $t('operations.layout.preview') }}
          </h3>
          <div
            v-if="clientLivePreviewAvailable"
            class="flex items-center gap-2"
          >
            <n-switch
              :value="useRealClientPreview"
              @update:value="onRealClientPreviewToggle"
            />
            <span class="text-xs text-gray-600">{{
              $t('operations.layout.realPreview')
            }}</span>
          </div>
          <n-radio-group
            v-model:value="previewTab"
            size="small"
            name="layout-preview-tab"
            @update:value="onPreviewTabChange"
          >
            <n-radio-button value="lobby">
              {{ $t('operations.layout.previewLobby') }}
            </n-radio-button>
            <n-radio-button value="profile">
              {{ $t('operations.layout.previewProfile') }}
            </n-radio-button>
          </n-radio-group>
          <p class="text-center text-xs text-gray-500">
            {{
              useRealClientPreview && !iframePreviewBlocked
                ? $t('operations.layout.realPreviewHint')
                : $t('operations.layout.previewHint')
            }}
          </p>
          <p
            v-if="useRealClientPreview && previewHostLabel"
            class="text-center text-[10px] text-gray-400"
          >
            {{ previewHostLabel }}
          </p>
        </div>

        <div class="preview-container flex justify-center">
          <div class="phone-bezel">
            <div class="device-frame-scaler" :style="previewScalerStyle">
              <!-- Real client iframe: transform on iframe itself; viewport stays 390×844 -->
              <template
                v-if="
                  useRealClientPreview && livePreviewUrl && !iframePreviewBlocked
                "
              >
                <div
                  v-if="iframePreviewLoading"
                  class="preview-loading"
                >
                  <n-spin size="small" />
                  <span>{{ $t('operations.layout.loadingRealPreview') }}</span>
                </div>
                <iframe
                  ref="livePreviewIframeRef"
                  :key="livePreviewIframeKey"
                  :src="livePreviewUrl"
                  class="preview-iframe"
                  :width="previewLayout.frameW"
                  :height="previewLayout.frameH"
                  :style="liveIframeStyle"
                  :title="$t('operations.layout.realPreview')"
                  @load="handleLivePreviewLoad"
                />
              </template>

              <!-- Schematic fallback -->
              <div
                v-else
                class="device-frame"
                :style="deviceFrameStyle"
              >
                  <div
                    v-if="useRealClientPreview && iframePreviewBlocked"
                    class="schematic-blocked-banner"
                  >
                    <span>{{ $t('operations.layout.iframeBlocked') }}</span>
                    <a
                      class="ml-1 underline"
                      :href="livePreviewUrl"
                      target="_blank"
                      rel="noopener noreferrer"
                      >{{ $t('operations.layout.openPreviewNewWindow') }}</a
                    >
                  </div>
                  <!-- Lobby schematic -->
                  <div
                    v-show="previewTab === 'lobby'"
                    class="schematic-screen relative flex h-full min-h-0 flex-col bg-slate-900 text-white"
                  >
                    <div
                      class="flex shrink-0 items-center justify-between bg-gradient-to-r from-indigo-600 to-violet-600 px-3 py-2"
                    >
                      <span class="text-sm font-bold">JACKPOT</span>
                      <div class="flex gap-1">
                        <span
                          class="rounded bg-white/20 px-2 py-0.5 text-[10px]"
                          >{{ $t('operations.layout.login') }}</span
                        >
                        <span
                          class="rounded bg-white px-2 py-0.5 text-[10px] text-indigo-700"
                          >{{ $t('operations.layout.register') }}</span
                        >
                      </div>
                    </div>

                    <div class="min-h-0 flex-1 overflow-y-auto pb-14">
                      <Transition name="preview-fade">
                        <div
                          v-if="layoutConfig.topNavAdEnabled"
                          class="border-b border-white/10 bg-slate-800/80 px-2 py-2"
                        >
                          <p class="mb-1.5 text-center text-[10px] text-slate-400">
                            {{ $t('operations.layout.previewAdArea') }}
                          </p>
                          <div class="grid grid-cols-4 gap-1.5">
                            <div
                              v-for="item in previewQuickNavItems"
                              :key="item.label"
                              class="text-center"
                            >
                              <div
                                class="mx-auto mb-0.5 flex h-9 w-9 items-center justify-center rounded-lg text-sm"
                                :style="{ background: item.gradient }"
                              >
                                {{ item.icon }}
                              </div>
                              <span
                                class="block truncate text-[9px] text-slate-300"
                                >{{ item.label }}</span
                              >
                            </div>
                          </div>
                        </div>
                      </Transition>

                      <div
                        class="mx-2 mt-2 h-20 overflow-hidden rounded-lg bg-gradient-to-br from-amber-500/80 to-rose-600/80"
                      >
                        <div
                          class="flex h-full items-center justify-center text-xs font-medium text-white/90"
                        >
                          Banner
                        </div>
                      </div>

                      <Transition name="preview-fade">
                        <div
                          v-if="layoutConfig.grandesPremiosEnabled"
                          class="mx-2 mt-2 rounded-lg border border-amber-500/30 bg-slate-800/90 px-2 py-2"
                        >
                          <p
                            class="mb-1.5 text-center text-[10px] font-medium text-amber-300"
                          >
                            ★ {{ $t('operations.layout.previewGrandesArea') }} ★
                          </p>
                          <div class="flex gap-1.5 overflow-hidden">
                            <div
                              v-for="n in 3"
                              :key="n"
                              class="flex min-w-[72px] flex-1 flex-col items-center rounded bg-slate-700/80 p-1.5"
                            >
                              <div
                                class="mb-1 h-8 w-8 rounded bg-gradient-to-br from-yellow-400 to-orange-500"
                              />
                              <span class="text-[8px] text-slate-400"
                                >1***{{ 100 + n }}</span
                              >
                              <span
                                class="text-[9px] font-semibold text-amber-300"
                                >R$ {{ (n * 120).toFixed(0) }}</span
                              >
                            </div>
                          </div>
                        </div>
                      </Transition>

                      <div class="space-y-2 p-2">
                        <h4 class="text-[11px] font-medium text-slate-300">
                          {{ $t('operations.layout.hotGames') }}
                        </h4>
                        <div class="grid grid-cols-3 gap-1.5">
                          <div
                            class="flex h-14 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 text-xs font-bold"
                          >
                            PG
                          </div>
                          <div
                            class="flex h-14 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-[10px] font-bold"
                          >
                            {{ $t('operations.layout.fishing') }}
                          </div>
                          <div
                            class="flex h-14 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 text-[10px] font-bold"
                          >
                            {{ $t('operations.layout.sports') }}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div
                      class="absolute bottom-0 left-0 right-0 flex h-12 items-center justify-around border-t border-white/10 bg-slate-950 px-1"
                    >
                      <div
                        v-for="(button, index) in getActiveButtons()"
                        :key="index"
                        class="flex flex-col items-center"
                      >
                        <img
                          v-if="getIconImageUrl(button)"
                          :src="getIconImageUrl(button)"
                          :alt="button.label"
                          class="mb-0.5 h-3.5 w-3.5 object-contain"
                        />
                        <div v-else-if="button.icon" class="mb-0.5 text-[10px]">
                          {{ getIconDisplay(button.icon) }}
                        </div>
                        <div
                          v-else
                          class="mb-0.5 h-3.5 w-3.5 rounded bg-slate-600"
                        />
                        <span
                          class="max-w-[48px] truncate text-[8px] text-slate-400"
                          >{{
                            button.label || $t('operations.layout.button')
                          }}</span
                        >
                      </div>
                    </div>
                  </div>

                  <!-- Profile schematic -->
                  <div
                    v-show="previewTab === 'profile'"
                    class="schematic-screen flex h-full min-h-0 flex-col bg-slate-100"
                  >
                    <div class="min-h-0 flex-1 overflow-y-auto">
                      <img
                        :src="currentMyPageTemplateUrl"
                        :alt="$t('operations.layout.myPagePreview')"
                        class="block w-full object-cover object-top"
                      />
                    </div>
                    <p
                      class="shrink-0 border-t bg-white py-1.5 text-center text-xs font-medium text-gray-700"
                    >
                      {{ myPageStyleDisplayName }}
                    </p>
                  </div>
              </div>
            </div>
          </div>
        </div>
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
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import {
  NButton,
  NModal,
  NForm,
  NFormItem,
  NInput,
  NSpace,
  NRadio,
  NRadioButton,
  NRadioGroup,
  NUpload,
  NAlert,
  NSwitch,
  NSelect,
  NSpin,
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
import {
  buildClientPreviewUrl,
  CLIENT_PREVIEW_LAYOUT_MESSAGE,
  CLIENT_PREVIEW_READY_MESSAGE,
  getClientPreviewHostLabel,
  isClientLivePreviewEnabled,
} from '#/utils/clientPreviewUrl';
import { LIVE_PREVIEW_DEVICE } from '#/constants/livePreviewDevice';

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
const isEditMode = ref(false);
/** Live mock preview tab: lobby shows ad/grandes; profile shows myPageStyle template */
const previewTab = ref<'lobby' | 'profile'>('lobby');

/** Real client iframe preview (same protocol as brand skin) */
const clientLivePreviewAvailable = computed(() => isClientLivePreviewEnabled());
const useRealClientPreview = ref(false);
const livePreviewIframeRef = ref<HTMLIFrameElement | null>(null);
const livePreviewUrl = ref('');
const livePreviewIframeKey = ref(0);
const iframePreviewLoading = ref(false);
const iframePreviewReady = ref(false);
const iframePreviewBlocked = ref(false);
/** Client reported supportsLayoutPreview in ready message */
const iframeSupportsLayoutPreview = ref(false);
let iframePreviewTimeoutId: ReturnType<typeof setTimeout> | undefined;
let layoutPostDebounceId: ReturnType<typeof setTimeout> | undefined;

const previewHostLabel = computed(() => getClientPreviewHostLabel());

/** Fit iPhone 13 Pro (390×844) into the right panel without letterboxing. */
const PREVIEW_AVAIL_W = 340;
const PREVIEW_AVAIL_H = 640;

const previewLayout = computed(() => {
  const frameW = LIVE_PREVIEW_DEVICE.width;
  const frameH = LIVE_PREVIEW_DEVICE.height;
  const scaleW = PREVIEW_AVAIL_W / frameW;
  const scaleH = PREVIEW_AVAIL_H / frameH;
  const rawScale = Math.min(scaleW, scaleH, 1);
  const scaledW = Math.floor(frameW * rawScale);
  const scaledH = Math.floor(frameH * rawScale);
  const scale = scaledW / frameW;
  return { scale, scaledW, scaledH, frameW, frameH };
});

const previewScalerStyle = computed(() => {
  const { scaledW, scaledH } = previewLayout.value;
  return {
    width: `${scaledW}px`,
    height: `${scaledH}px`,
    flexShrink: 0,
  };
});

const deviceFrameStyle = computed(() => {
  const { scale, frameW, frameH } = previewLayout.value;
  return {
    width: `${frameW}px`,
    height: `${frameH}px`,
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
  };
});

/** Transform on the iframe so its layout viewport stays 390×844 (mobile). */
const liveIframeStyle = computed(() => {
  const { scale, frameW, frameH } = previewLayout.value;
  return {
    width: `${frameW}px`,
    height: `${frameH}px`,
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
    border: '0',
    display: 'block',
    background: '#0e131b',
  };
});

const previewQuickNavItems = computed(() => [
  {
    icon: '🎁',
    label: $t('operations.layout.promotion'),
    gradient: 'linear-gradient(145deg, #e879f9 0%, #a855f7 100%)',
  },
  {
    icon: '💰',
    label: $t('operations.layout.deposit'),
    gradient: 'linear-gradient(145deg, #fb923c 0%, #fbbf24 100%)',
  },
  {
    icon: '👥',
    label: $t('operations.layout.agent'),
    gradient: 'linear-gradient(145deg, #38bdf8 0%, #6366f1 100%)',
  },
  {
    icon: '👤',
    label: $t('operations.layout.profile'),
    gradient: 'linear-gradient(145deg, #f472b6 0%, #a78bfa 100%)',
  },
]);

function clearIframePreviewTimeout() {
  if (iframePreviewTimeoutId !== undefined) {
    clearTimeout(iframePreviewTimeoutId);
    iframePreviewTimeoutId = undefined;
  }
}

function buildLayoutPreviewParams() {
  return {
    skinTemplate: layoutSkinKey.value || 'comprehensive_v1',
    brandCode: selectedBrandCode.value || undefined,
    topNavAdEnabled: layoutConfig.topNavAdEnabled,
    grandesPremiosEnabled: layoutConfig.grandesPremiosEnabled,
    myPageStyle: layoutConfig.myPageStyle,
    previewPage:
      previewTab.value === 'profile'
        ? ('profile' as const)
        : ('home' as const),
  };
}

function syncLivePreviewUrl() {
  if (!useRealClientPreview.value) {
    livePreviewUrl.value = '';
    return;
  }
  livePreviewUrl.value = buildClientPreviewUrl(
    buildLayoutPreviewParams(),
    Date.now(),
  );
}

function refreshLivePreview() {
  if (!useRealClientPreview.value) return;
  iframePreviewLoading.value = true;
  iframePreviewReady.value = false;
  iframePreviewBlocked.value = false;
  clearIframePreviewTimeout();
  syncLivePreviewUrl();
  livePreviewIframeKey.value += 1;
}

function postLayoutToIframe() {
  if (!useRealClientPreview.value || iframePreviewBlocked.value) return;
  const win = livePreviewIframeRef.value?.contentWindow;
  if (!win) return;
  win.postMessage(
    {
      type: CLIENT_PREVIEW_LAYOUT_MESSAGE,
      layout: {
        topNavAdEnabled: layoutConfig.topNavAdEnabled,
        grandesPremiosEnabled: layoutConfig.grandesPremiosEnabled,
        myPageStyle: layoutConfig.myPageStyle,
        previewPage: previewTab.value === 'profile' ? 'profile' : 'home',
      },
    },
    '*',
  );
}

/** Prefer live postMessage; reload iframe only when the client lacks the layout channel. */
function scheduleLayoutPreviewSync() {
  if (!useRealClientPreview.value) return;
  if (layoutPostDebounceId !== undefined) clearTimeout(layoutPostDebounceId);
  layoutPostDebounceId = setTimeout(() => {
    layoutPostDebounceId = undefined;
    // Solid path: postMessage only (no full lobby reload / init).
    if (iframeSupportsLayoutPreview.value && iframePreviewReady.value) {
      postLayoutToIframe();
      return;
    }
    if (iframePreviewReady.value) {
      postLayoutToIframe();
    }
    // Old / staging clients without supportsLayoutPreview: bake flags into URL.
    refreshLivePreview();
  }, 180);
}

function onRealClientPreviewToggle(value: boolean) {
  useRealClientPreview.value = value;
  if (value) {
    iframeSupportsLayoutPreview.value = false;
    refreshLivePreview();
  } else {
    clearIframePreviewTimeout();
    iframePreviewLoading.value = false;
    iframePreviewReady.value = false;
    iframePreviewBlocked.value = false;
    iframeSupportsLayoutPreview.value = false;
    livePreviewUrl.value = '';
  }
}

function handleLivePreviewReadyMessage(event: MessageEvent) {
  if (event.data?.type !== CLIENT_PREVIEW_READY_MESSAGE) return;
  iframePreviewReady.value = true;
  iframePreviewBlocked.value = false;
  iframePreviewLoading.value = false;
  iframeSupportsLayoutPreview.value =
    event.data?.supportsLayoutPreview === true;
  clearIframePreviewTimeout();
  postLayoutToIframe();
}

function handleLivePreviewLoad() {
  iframePreviewLoading.value = false;
  if (iframePreviewReady.value) {
    iframePreviewBlocked.value = false;
    postLayoutToIframe();
    return;
  }
  clearIframePreviewTimeout();
  iframePreviewTimeoutId = setTimeout(() => {
    if (!iframePreviewReady.value) {
      iframePreviewBlocked.value = true;
      iframePreviewLoading.value = false;
    }
  }, 8000);
}

function focusLobbyPreview() {
  previewTab.value = 'lobby';
  scheduleLayoutPreviewSync();
}

function focusProfilePreview() {
  previewTab.value = 'profile';
  scheduleLayoutPreviewSync();
}

function onPreviewTabChange(value: string | number) {
  previewTab.value = value === 'profile' ? 'profile' : 'lobby';
  scheduleLayoutPreviewSync();
}

function onTopNavAdToggle(value: boolean) {
  layoutConfig.topNavAdEnabled = value;
  focusLobbyPreview();
}

function onGrandesPremiosToggle(value: boolean) {
  layoutConfig.grandesPremiosEnabled = value;
  focusLobbyPreview();
}

function onMyPageStyleChange(value: string | number | boolean | null) {
  layoutConfig.myPageStyle = normalizeMyPageStyle(String(value ?? ''));
  focusProfilePreview();
}

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
  grandesPremiosEnabled: true,
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
    grandesPremiosEnabled: true,
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
    console.log('✅ saveConfig completed successfully');
  } catch (error) {
    console.error('❌ Error saving config:', error);
    message.error($t('operations.layout.saveFailedRetry'));
  }
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

const saveButtonConfig = async () => {
  if (!validateButtonConfig()) {
    showValidationError.value = true;
    message.error($t('operations.layout.completeButtonsFirst'));
    return;
  }

  try {
    await saveLayoutConfig();
    showValidationError.value = false;
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
        grandesPremiosEnabled: existingConfig.grandesPremiosEnabled ?? true,
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
        grandesPremiosEnabled: layoutConfig.grandesPremiosEnabled,
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
  window.addEventListener('message', handleLivePreviewReadyMessage);
  await loadBrandSkinScope();
  await Promise.all([loadAvailableIcons(), loadExistingConfig()]);
  await loadBrandSkinConfig(selectedBrandCode.value ?? undefined);
  console.log(' All configuration data loaded, ready for user interaction');
});

onUnmounted(() => {
  window.removeEventListener('message', handleLivePreviewReadyMessage);
  clearIframePreviewTimeout();
  if (layoutPostDebounceId !== undefined) clearTimeout(layoutPostDebounceId);
});

watch(
  () => [
    layoutConfig.topNavAdEnabled,
    layoutConfig.grandesPremiosEnabled,
    layoutConfig.myPageStyle,
    previewTab.value,
  ],
  () => {
    scheduleLayoutPreviewSync();
  },
);

watch(
  () => [selectedBrandCode.value, layoutSkinKey.value, useRealClientPreview.value],
  () => {
    if (useRealClientPreview.value) {
      refreshLivePreview();
    }
  },
);

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

.preview-container {
  width: 100%;
  min-height: 0;
}

.phone-bezel {
  display: inline-block;
  padding: 10px;
  border-radius: 28px;
  background: linear-gradient(160deg, #3a3a3a 0%, #1a1a1a 45%, #0d0d0d 100%);
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.08),
    0 18px 40px rgba(0, 0, 0, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.12);
}

.device-frame-scaler {
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
  line-height: 0;
  border-radius: 18px;
  background: #0e131b;
}

.device-frame {
  position: absolute;
  top: 0;
  left: 0;
  overflow: hidden;
  background: #0e131b;
  border-radius: 18px;
  will-change: transform;
}

.preview-iframe {
  position: absolute;
  top: 0;
  left: 0;
  margin: 0;
  padding: 0;
  border: 0;
  background: #0e131b;
}

.preview-loading {
  position: absolute;
  inset: 0;
  z-index: 3;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: rgba(14, 19, 27, 0.92);
  font-size: 12px;
  color: #e2e8f0;
}

.schematic-screen {
  width: 100%;
  height: 100%;
}

.schematic-blocked-banner {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  z-index: 20;
  border-bottom: 1px solid rgba(245, 158, 11, 0.4);
  background: rgba(69, 26, 3, 0.95);
  padding: 6px 8px;
  text-align: center;
  font-size: 10px;
  color: #fef3c7;
}

.preview-fade-enter-active,
.preview-fade-leave-active {
  transition:
    opacity 0.25s ease,
    max-height 0.25s ease,
    margin 0.25s ease,
    padding 0.25s ease;
  overflow: hidden;
}

.preview-fade-enter-from,
.preview-fade-leave-to {
  opacity: 0;
  max-height: 0;
  margin-top: 0 !important;
  margin-bottom: 0 !important;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
}

.preview-fade-enter-to,
.preview-fade-leave-from {
  opacity: 1;
  max-height: 160px;
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
</style>
