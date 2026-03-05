<template>
  <Page title="品牌皮肤设置" description="品牌皮肤、大厅背景与生效时间配置">
    <div class="mb-4">
      <n-breadcrumb>
        <n-breadcrumb-item>品牌管理</n-breadcrumb-item>
        <n-breadcrumb-item>品牌皮肤设置</n-breadcrumb-item>
      </n-breadcrumb>
    </div>

    <div class="brand-skin-setting grid grid-cols-1 gap-6 lg:grid-cols-3">
      <!-- 左侧：表单 -->
      <div class="lg:col-span-1 space-y-6">
        <n-card title="皮肤颜色" class="rounded-16px shadow-sm">
          <n-form
            ref="formRef"
            :model="formData"
            :rules="formRules"
            label-placement="top"
            require-mark-placement="right-hanging"
          >
            <n-form-item label="选择皮肤预设" path="skinColorId">
              <n-select
                v-model:value="formData.skinColorId"
                placeholder="选择皮肤颜色（可选，选择后自动填充下方色值）"
                :options="skinColorOptionsWithPreview"
                clearable
                style="width: 100%"
                @update:value="onSkinColorChange"
              >
                <template #render-label="{ option }">
                  <div class="flex items-center gap-2">
                    <div
                      class="color-dot rounded-full border border-gray-300"
                      :style="{
                        backgroundColor: getPrimaryColor(option.value),
                        width: '14px',
                        height: '14px',
                      }"
                    />
                    <span>{{ option.label }}</span>
                  </div>
                </template>
              </n-select>
            </n-form-item>
            <n-form-item label="主色" path="primaryColor">
              <n-color-picker
                v-model:value="formData.primaryColor"
                :show-alpha="false"
                style="width: 100%"
              />
            </n-form-item>
            <n-form-item label="次色" path="secondaryColor">
              <n-color-picker
                v-model:value="formData.secondaryColor"
                :show-alpha="false"
                style="width: 100%"
              />
            </n-form-item>
            <n-form-item label="强调色" path="accentColor">
              <n-color-picker
                v-model:value="formData.accentColor"
                :show-alpha="false"
                style="width: 100%"
              />
            </n-form-item>
            <n-form-item label="第三色" path="tertiaryColor">
              <n-color-picker
                v-model:value="formData.tertiaryColor"
                :show-alpha="false"
                style="width: 100%"
              />
            </n-form-item>
            <n-form-item label="主文字色" path="textPrimaryColor">
              <n-color-picker
                v-model:value="formData.textPrimaryColor"
                :show-alpha="false"
                style="width: 100%"
              />
            </n-form-item>
            <n-form-item label="次文字色" path="textSecondaryColor">
              <n-color-picker
                v-model:value="formData.textSecondaryColor"
                :show-alpha="false"
                style="width: 100%"
              />
            </n-form-item>
            <n-form-item label="强调文字色" path="textAccentColor">
              <n-color-picker
                v-model:value="formData.textAccentColor"
                :show-alpha="false"
                style="width: 100%"
              />
            </n-form-item>
            <n-form-item label="按钮色" path="buttonColor">
              <n-color-picker
                v-model:value="formData.buttonColor"
                :show-alpha="false"
                style="width: 100%"
              />
            </n-form-item>
          </n-form>
        </n-card>

        <n-card title="大厅背景" class="rounded-16px shadow-sm">
          <n-form-item label="背景类型" path="lobbyBackgroundType">
            <n-radio-group
              v-model:value="formData.lobbyBackgroundType"
              class="flex flex-col gap-2"
            >
              <n-radio value="system_default">系统默认</n-radio>
              <n-radio value="system_config">系统配置（颜色）</n-radio>
              <n-radio value="custom_image">自定义图片背景</n-radio>
            </n-radio-group>
          </n-form-item>
          <n-form-item label="背景颜色" path="lobbyBackgroundColor">
            <n-color-picker
              v-model:value="formData.lobbyBackgroundColor"
              :show-alpha="false"
              style="width: 100%"
            />
            <template v-if="formData.lobbyBackgroundType !== 'system_config'">
              <div class="mt-1 text-xs text-gray-400">选「系统配置」时生效</div>
            </template>
          </n-form-item>
          <n-form-item label="背景图片" path="lobbyBackgroundImageUrl">
            <MediaLibrarySelector
              v-model="formData.lobbyBackgroundImageUrl"
              :accept-types="['image']"
              placeholder="从媒体库选择或上传大厅背景图"
            />
            <template v-if="formData.lobbyBackgroundType !== 'custom_image'">
              <div class="mt-1 text-xs text-gray-400">选「自定义图片背景」时生效</div>
            </template>
          </n-form-item>
        </n-card>

        <n-card title="生效时间" class="rounded-16px shadow-sm">
          <n-form-item label="开始时间" path="effectiveStartTime">
            <n-date-picker
              v-model:value="formData.effectiveStartTime"
              type="datetime"
              placeholder="选择开始时间"
              style="width: 100%"
              clearable
            />
          </n-form-item>
          <n-form-item label="结束时间" path="effectiveEndTime">
            <n-date-picker
              v-model:value="formData.effectiveEndTime"
              type="datetime"
              placeholder="选择结束时间（可选）"
              style="width: 100%"
              clearable
            />
          </n-form-item>
          <n-alert type="info" :show-icon="true" class="mt-2">
            不设置结束时间表示长期有效
          </n-alert>
        </n-card>

        <div class="flex flex-col gap-2">
          <div class="flex gap-2">
            <n-button type="primary" :loading="saving" @click="handleSave">
              保存配置
            </n-button>
            <n-button @click="handleReset">重置</n-button>
          </div>
          <p class="text-xs text-gray-500">
            保存后，用户端前端需请求 <code class="rounded bg-gray-100 px-1">GET /brand-skin-config</code> 并应用主题（如注入 CSS 变量），界面才会更新。
          </p>
        </div>
      </div>

      <!-- 右侧：预览与详情 -->
      <div class="lg:col-span-2 space-y-6">
        <n-card title="详情（当前所有设置）" class="rounded-16px shadow-sm">
          <div class="detail-grid grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
            <div class="detail-item">
              <span class="text-gray-500">皮肤预设</span>
              <div class="mt-1 font-medium">
                {{ skinColorLabel || '—' }}
              </div>
            </div>
            <div class="detail-item">
              <span class="text-gray-500">主色</span>
              <div class="mt-1 flex items-center gap-2">
                <span
                  class="inline-block h-4 w-4 shrink-0 rounded border border-gray-300"
                  :style="{ backgroundColor: formData.primaryColor }"
                />
                <span class="font-mono font-medium">{{ formData.primaryColor }}</span>
              </div>
            </div>
            <div class="detail-item">
              <span class="text-gray-500">次色</span>
              <div class="mt-1 flex items-center gap-2">
                <span
                  class="inline-block h-4 w-4 shrink-0 rounded border border-gray-300"
                  :style="{ backgroundColor: formData.secondaryColor }"
                />
                <span class="font-mono font-medium">{{ formData.secondaryColor }}</span>
              </div>
            </div>
            <div class="detail-item">
              <span class="text-gray-500">强调色</span>
              <div class="mt-1 flex items-center gap-2">
                <span
                  class="inline-block h-4 w-4 shrink-0 rounded border border-gray-300"
                  :style="{ backgroundColor: formData.accentColor }"
                />
                <span class="font-mono font-medium">{{ formData.accentColor }}</span>
              </div>
            </div>
            <div class="detail-item">
              <span class="text-gray-500">第三色</span>
              <div class="mt-1 flex items-center gap-2">
                <span
                  class="inline-block h-4 w-4 shrink-0 rounded border border-gray-300"
                  :style="{ backgroundColor: formData.tertiaryColor }"
                />
                <span class="font-mono font-medium">{{ formData.tertiaryColor }}</span>
              </div>
            </div>
            <div class="detail-item">
              <span class="text-gray-500">主文字色</span>
              <div class="mt-1 flex items-center gap-2">
                <span
                  class="inline-block h-4 w-4 shrink-0 rounded border border-gray-300"
                  :style="{ backgroundColor: formData.textPrimaryColor }"
                />
                <span class="font-mono font-medium">{{ formData.textPrimaryColor }}</span>
              </div>
            </div>
            <div class="detail-item">
              <span class="text-gray-500">次文字色</span>
              <div class="mt-1 flex items-center gap-2">
                <span
                  class="inline-block h-4 w-4 shrink-0 rounded border border-gray-300"
                  :style="{ backgroundColor: formData.textSecondaryColor }"
                />
                <span class="font-mono font-medium">{{ formData.textSecondaryColor }}</span>
              </div>
            </div>
            <div class="detail-item">
              <span class="text-gray-500">强调文字色</span>
              <div class="mt-1 flex items-center gap-2">
                <span
                  class="inline-block h-4 w-4 shrink-0 rounded border border-gray-300"
                  :style="{ backgroundColor: formData.textAccentColor }"
                />
                <span class="font-mono font-medium">{{ formData.textAccentColor }}</span>
              </div>
            </div>
            <div class="detail-item">
              <span class="text-gray-500">按钮色</span>
              <div class="mt-1 flex items-center gap-2">
                <span
                  class="inline-block h-4 w-4 shrink-0 rounded border border-gray-300"
                  :style="{ backgroundColor: formData.buttonColor }"
                />
                <span class="font-mono font-medium">{{ formData.buttonColor }}</span>
              </div>
            </div>
            <div class="detail-item">
              <span class="text-gray-500">大厅背景类型</span>
              <div class="mt-1 font-medium">
                {{ lobbyBackgroundTypeLabel }}
              </div>
            </div>
            <div class="detail-item">
              <span class="text-gray-500">背景颜色</span>
              <div class="mt-1 flex items-center gap-2">
                <span
                  class="inline-block h-4 w-4 shrink-0 rounded border border-gray-300"
                  :style="{ backgroundColor: formData.lobbyBackgroundColor }"
                />
                <span class="font-mono font-medium">{{ formData.lobbyBackgroundColor }}</span>
              </div>
            </div>
            <div class="detail-item">
              <span class="text-gray-500">背景图片</span>
              <div class="mt-1 font-medium truncate" :title="formData.lobbyBackgroundImageUrl || '—'">
                {{ formData.lobbyBackgroundImageUrl ? '已设置' : '—' }}
              </div>
            </div>
            <div class="detail-item">
              <span class="text-gray-500">生效开始</span>
              <div class="mt-1 font-medium">
                {{ formatTime(formData.effectiveStartTime) || '—' }}
              </div>
            </div>
            <div class="detail-item">
              <span class="text-gray-500">生效结束</span>
              <div class="mt-1 font-medium">
                {{ formatTime(formData.effectiveEndTime) || '长期有效' }}
              </div>
            </div>
          </div>
        </n-card>

        <n-card title="模板与皮肤预览" class="rounded-16px shadow-sm">
          <div class="preview-toolbar mb-2 flex items-center justify-between">
            <span class="text-sm text-gray-600">预览</span>
            <n-button size="small" type="primary">移动端预览（电话格式）</n-button>
          </div>
          <!-- 电话格式：手机外框 + 圆角屏幕 -->
          <div class="phone-format-wrapper flex justify-center p-4">
            <div class="phone-frame">
              <div class="phone-notch" />
              <div class="phone-screen mobile-preview-frame flex flex-col">
            <!-- 顶栏：Logo、余额、充值 -->
            <div
              class="preview-header flex shrink-0 items-center justify-between px-3 py-2"
              :style="{ backgroundColor: formData.secondaryColor, color: formData.textPrimaryColor }"
            >
              <div class="flex items-center gap-1 text-xs">
                <span class="opacity-90">☰</span>
                <span class="font-medium">GAMING</span>
              </div>
              <span class="text-xs font-mono">123.456.789.90</span>
              <button
                type="button"
                class="rounded px-2 py-0.5 text-xs font-medium text-white"
                :style="{ backgroundColor: formData.buttonColor }"
              >
                充值
              </button>
            </div>
            <!-- 横幅区：使用真实大厅 Banner -->
            <div class="banner-preview shrink-0 overflow-hidden rounded-b">
              <img
                v-if="previewBannerUrl"
                :src="previewBannerUrl"
                alt="Banner"
                class="h-full w-full object-cover"
              />
              <div
                v-else
                class="px-3 py-4 text-center text-xs text-white"
                :style="{ backgroundColor: formData.secondaryColor }"
              >
                全球首款 高清2K 让您享顶级至尊服务
              </div>
            </div>
            <!-- 公告条 -->
            <div
              class="shrink-0 flex items-center gap-1 px-3 py-1.5 text-xs"
              :style="{ backgroundColor: formData.primaryColor, color: formData.textPrimaryColor }"
            >
              <span>🔔</span>
              <span>恭喜玩家在<span :style="{ color: formData.textAccentColor }">龙虎斗</span>游戏中级场房间赢得<span :style="{ color: formData.textAccentColor }">18,888</span>奖后</span>
            </div>
            <!-- 分类标签：选中用主文字色+强调文字色下划线，未选中用次文字色 -->
            <div
              class="preview-tabs shrink-0 flex gap-2 border-b px-3 py-0.5 text-xs"
              :style="{ backgroundColor: formData.primaryColor, borderColor: formData.tertiaryColor }"
            >
              <span class="font-medium" :style="{ color: formData.textPrimaryColor, borderBottom: `2px solid ${formData.textAccentColor}`, paddingBottom: '2px' }">热门</span>
              <span :style="{ color: formData.textSecondaryColor }">棋牌</span>
              <span :style="{ color: formData.textSecondaryColor }">捕鱼</span>
              <span :style="{ color: formData.textSecondaryColor }">真人</span>
            </div>
            <!-- 游戏区（大厅背景：颜色/图片/默认），可滚动确保全部显示 -->
            <div
              class="lobby-preview flex-1 overflow-y-auto px-3 py-3 transition-colors duration-200"
              :style="lobbyPreviewStyle"
            >
              <div class="mb-2 flex items-center gap-1 text-xs" :style="{ color: formData.textPrimaryColor }">
                <span>🔥</span>
                <span>热门游戏</span>
              </div>
              <div class="grid grid-cols-3 gap-2">
                <div
                  v-for="(game, idx) in previewGames"
                  :key="game.id ?? idx"
                  class="text-center"
                >
                  <!-- 图片区域：宽度满格，照片带圆角 -->
                  <div
                    class="game-thumb mb-1 flex items-center justify-center overflow-hidden"
                    :style="{ backgroundColor: formData.primaryColor }"
                  >
                    <img
                      v-if="game.iconUrl"
                      :src="getPreviewGameImageUrl(game.iconUrl)"
                      :alt="game.gameName"
                      class="game-thumb-img h-full w-full object-contain"
                    />
                    <span v-else class="text-[10px] text-white/70">PG</span>
                  </div>
                  <div class="text-[10px] truncate" :style="{ color: formData.textPrimaryColor }">{{ game.gameName || `游戏${idx + 1}` }}</div>
                </div>
              </div>
            </div>
            <!-- 底部导航 -->
            <div
              class="preview-footer shrink-0 flex items-center justify-around py-2 text-xs"
              :style="{ backgroundColor: formData.secondaryColor, color: formData.textPrimaryColor }"
            >
              <span class="font-medium">首页</span>
              <span class="opacity-80">优惠</span>
              <span class="opacity-80">充值</span>
              <span class="opacity-80">提现</span>
              <span class="opacity-80">我的</span>
              </div>
            </div>
          </div>
          </div>
          <!-- 当前皮肤标签 -->
          <div class="mt-3 flex flex-wrap gap-2">
            <n-tag size="small" :bordered="false">rolex</n-tag>
            <n-tag size="small" :bordered="false">有底色</n-tag>
            <n-tag
              size="small"
              :bordered="false"
              :color="{ color: formData.primaryColor, textColor: '#fff' }"
            >
              {{ skinColorLabel || 'Bvlgari蓝黑' }}
            </n-tag>
          </div>
          <p class="mt-2 text-xs text-gray-500">
            移动端以电话格式展示，主色/次色/强调色与大厅背景会实时反映在顶栏、横幅、游戏区与底部导航。
          </p>
        </n-card>
      </div>
    </div>
  </Page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, defineAsyncComponent } from 'vue';
import {
  NCard,
  NForm,
  NFormItem,
  NSelect,
  NRadioGroup,
  NRadio,
  NColorPicker,
  NDatePicker,
  NButton,
  NAlert,
  NTag,
  NBreadcrumb,
  NBreadcrumbItem,
  useMessage,
  type FormInst,
  type FormRules,
} from 'naive-ui';
import { Page } from '@vben/common-ui';
import { useSkinColorOptions } from '#/composables/useColorTheme';
import { getColorPaletteById, getPrimaryColorById } from '#/utils/colorUtils';
import type { ColorPalette } from '#/utils/colorUtils';
import { getGameListApi } from '#/api/game/subgame';
import type { GameItem } from '#/api/game/subgame';
import { getBannerList } from '#/api/lobbyBanner';
import {
  getBrandSkinConfigApi,
  saveBrandSkinConfigApi,
} from '#/api/brand/brandSkin';
import { getImageUrlByEnvironment } from '#/utils/imageUtils';

const MediaLibrarySelector = defineAsyncComponent(
  () => import('#/components/MediaLibrarySelector.vue'),
);

const message = useMessage();
const formRef = ref<FormInst | null>(null);
const saving = ref(false);

/** 预览区展示的子游戏列表（来自子游戏管理接口，最多 6 个） */
const previewGames = ref<GameItem[]>([]);
/** 预览区使用的真实 Banner 图（来自大厅 Banner 接口，取第一条启用） */
const previewBannerUrl = ref<string>('');

interface FormModel {
  skinColorId: string | null;
  primaryColor: string;
  secondaryColor: string;
  tertiaryColor: string;
  accentColor: string;
  textPrimaryColor: string;
  textSecondaryColor: string;
  textAccentColor: string;
  buttonColor: string;
  lobbyBackgroundType: 'system_default' | 'system_config' | 'custom_image';
  lobbyBackgroundColor: string;
  lobbyBackgroundImageUrl: string;
  effectiveStartTime: number | null;
  effectiveEndTime: number | null;
}

/** 默认使用 Bvlgari蓝黑 '15' 色板 */
const defaultFormData: FormModel = {
  skinColorId: '15',
  primaryColor: '#0e131b',
  secondaryColor: '#151d29',
  tertiaryColor: '#182434',
  accentColor: '#111923',
  textPrimaryColor: '#FFFFFF',
  textSecondaryColor: '#005DFE',
  textAccentColor: '#0284C7',
  buttonColor: '#005dfe',
  lobbyBackgroundType: 'system_default',
  lobbyBackgroundColor: '#0e131b',
  lobbyBackgroundImageUrl: '',
  effectiveStartTime: null,
  effectiveEndTime: null,
};

const formData = ref<FormModel>({ ...defaultFormData });

const formRules: FormRules = {
  skinColorId: [],
  primaryColor: [],
  secondaryColor: [],
  tertiaryColor: [],
  accentColor: [],
  textPrimaryColor: [],
  textSecondaryColor: [],
  textAccentColor: [],
  buttonColor: [],
  lobbyBackgroundType: [],
  lobbyBackgroundColor: [],
  lobbyBackgroundImageUrl: [],
  effectiveStartTime: [],
  effectiveEndTime: [],
};

const { skinColorOptions, getSkinColorLabel } = useSkinColorOptions();

const skinColorOptionsWithPreview = computed(() =>
  skinColorOptions.map((opt) => ({ label: opt.label, value: opt.value })),
);

/** 当前用于预览的色板（来自表单颜色选择器） */
const currentPalette = computed<ColorPalette | null>(() => {
  const d = formData.value;
  return {
    primary: d.primaryColor,
    secondary: d.secondaryColor,
    tertiary: d.tertiaryColor,
    accent: d.accentColor,
    textPrimary: d.textPrimaryColor,
    textSecondary: d.textSecondaryColor,
    textAccent: d.textAccentColor,
    buttonColor: d.buttonColor,
  };
});

const skinColorLabel = computed(() => {
  const id = formData.value.skinColorId;
  return id ? getSkinColorLabel(id) : '自定义颜色';
});

const lobbyBackgroundTypeLabel = computed(() => {
  const t = formData.value.lobbyBackgroundType;
  if (t === 'system_default') return '系统默认';
  if (t === 'system_config')
    return `系统配置（${formData.value.lobbyBackgroundColor}）`;
  if (t === 'custom_image')
    return formData.value.lobbyBackgroundImageUrl
      ? '自定义图片'
      : '自定义图片（未设置）';
  return '—';
});

const lobbyPreviewStyle = computed(() => {
  const t = formData.value.lobbyBackgroundType;
  if (t === 'system_config') {
    return {
      backgroundColor: formData.value.lobbyBackgroundColor,
    };
  }
  if (t === 'custom_image' && formData.value.lobbyBackgroundImageUrl) {
    return {
      backgroundImage: `url(${formData.value.lobbyBackgroundImageUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };
  }
  return {
    backgroundColor: formData.value.primaryColor,
  };
});

function getPrimaryColor(skinColorId: string) {
  return getPrimaryColorById(skinColorId);
}

function getPreviewGameImageUrl(iconUrl: string | null | undefined): string {
  return getImageUrlByEnvironment(iconUrl) || '';
}

function onSkinColorChange(skinColorId: string | null) {
  if (!skinColorId) return;
  const palette = getColorPaletteById(skinColorId);
  formData.value.primaryColor = palette.primary;
  formData.value.secondaryColor = palette.secondary;
  formData.value.tertiaryColor = palette.tertiary ?? palette.secondary;
  formData.value.accentColor = palette.accent;
  formData.value.textPrimaryColor = palette.textPrimary;
  formData.value.textSecondaryColor = palette.textSecondary;
  formData.value.textAccentColor = palette.textAccent;
  formData.value.buttonColor = palette.buttonColor;
}

function formatTime(timestamp: number | null): string {
  if (timestamp == null) return '';
  const d = new Date(timestamp);
  return d.toLocaleString('zh-CN');
}

function handleSave() {
  formRef.value?.validate(async (err) => {
    if (err) return;
    saving.value = true;
    try {
      await saveBrandSkinConfigApi({
        skinColorId: formData.value.skinColorId,
        primaryColor: formData.value.primaryColor,
        secondaryColor: formData.value.secondaryColor,
        tertiaryColor: formData.value.tertiaryColor,
        accentColor: formData.value.accentColor,
        textPrimaryColor: formData.value.textPrimaryColor,
        textSecondaryColor: formData.value.textSecondaryColor,
        textAccentColor: formData.value.textAccentColor,
        buttonColor: formData.value.buttonColor,
        lobbyBackgroundType: formData.value.lobbyBackgroundType,
        lobbyBackgroundColor: formData.value.lobbyBackgroundColor,
        lobbyBackgroundImageUrl: formData.value.lobbyBackgroundImageUrl,
        effectiveStartTime: formData.value.effectiveStartTime,
        effectiveEndTime: formData.value.effectiveEndTime,
      });
      message.success('配置已保存，前端在请求并应用品牌皮肤配置后会更新展示');
    } catch (e) {
      message.error('保存失败，请确认后端已提供 /brand-skin-config 接口');
    } finally {
      saving.value = false;
    }
  });
}

function handleReset() {
  formData.value = { ...defaultFormData };
  message.info('已重置为默认');
}

onMounted(async () => {
  try {
    const saved = await getBrandSkinConfigApi();
    if (saved) {
      formData.value.skinColorId = saved.skinColorId ?? formData.value.skinColorId;
      formData.value.primaryColor = saved.primaryColor ?? formData.value.primaryColor;
      formData.value.secondaryColor = saved.secondaryColor ?? formData.value.secondaryColor;
      formData.value.tertiaryColor = saved.tertiaryColor ?? formData.value.tertiaryColor;
      formData.value.accentColor = saved.accentColor ?? formData.value.accentColor;
      formData.value.textPrimaryColor = saved.textPrimaryColor ?? formData.value.textPrimaryColor;
      formData.value.textSecondaryColor = saved.textSecondaryColor ?? formData.value.textSecondaryColor;
      formData.value.textAccentColor = saved.textAccentColor ?? formData.value.textAccentColor;
      formData.value.buttonColor = saved.buttonColor ?? formData.value.buttonColor;
      formData.value.lobbyBackgroundType = saved.lobbyBackgroundType ?? formData.value.lobbyBackgroundType;
      formData.value.lobbyBackgroundColor = saved.lobbyBackgroundColor ?? formData.value.lobbyBackgroundColor;
      formData.value.lobbyBackgroundImageUrl = saved.lobbyBackgroundImageUrl ?? formData.value.lobbyBackgroundImageUrl;
      formData.value.effectiveStartTime = saved.effectiveStartTime ?? formData.value.effectiveStartTime;
      formData.value.effectiveEndTime = saved.effectiveEndTime ?? formData.value.effectiveEndTime;
    }
  } catch {
    // 接口未实现或失败时使用默认
  }
  try {
    const res = await getGameListApi({ pageSize: 6, isEnabled: true, sortBy: 'sortOrder', sortOrder: 'asc' });
    const list = res?.list ?? [];
    previewGames.value = list.slice(0, 6);
    if (previewGames.value.length < 6) {
      const placeholders: GameItem[] = Array.from({ length: 6 - previewGames.value.length }, (_, i) => ({
        id: `preview-${i}`,
        platformId: null,
        gameId: '',
        gameName: `游戏${previewGames.value.length + i + 1}`,
        currency: '',
        isHot1: false,
        isHot2: false,
        isRecommended: false,
        isEnabled: true,
        isUnderMaintenance: false,
        showToStreamer: false,
        iconUrl: null,
        brandLogoUrl: null,
        remark: null,
        sortOrder: 0,
        createdAt: '',
        updatedAt: '',
      }));
      previewGames.value = [...previewGames.value, ...placeholders];
    }
  } catch {
    previewGames.value = Array.from({ length: 6 }, (_, i) => ({
      id: `preview-${i}`,
      platformId: null,
      gameId: '',
      gameName: `游戏${i + 1}`,
      currency: '',
      isHot1: false,
      isHot2: false,
      isRecommended: false,
      isEnabled: true,
      isUnderMaintenance: false,
      showToStreamer: false,
      iconUrl: null,
      brandLogoUrl: null,
      remark: null,
      sortOrder: 0,
      createdAt: '',
      updatedAt: '',
    }));
  }
  // 拉取真实大厅 Banner 用于预览
  try {
    const bannerRes = await getBannerList({ pageSize: 1, status: 'active', sortBy: 'sortOrder', sortOrder: 'asc' });
    const banner = bannerRes?.data?.list?.[0];
    if (banner?.bannerImageUrl) {
      previewBannerUrl.value = getImageUrlByEnvironment(banner.bannerImageUrl) || '';
    }
  } catch {
    previewBannerUrl.value = '';
  }
});
</script>

<style scoped>
.brand-skin-setting {
  padding-bottom: 24px;
}

.color-dot {
  flex-shrink: 0;
}

.detail-item {
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.detail-item:last-child,
.detail-item:nth-last-child(2) {
  border-bottom: none;
}

.lobby-preview {
  background-color: #f1f5f9;
  min-height: 0;
}

/* 移动端电话格式：手机外框 + 圆角屏幕 */
.phone-format-wrapper {
  background: linear-gradient(145deg, #e8e8e8 0%, #c0c0c0 100%);
  border-radius: 2.5rem;
  padding: 12px;
}

.phone-frame {
  width: 100%;
  max-width: 320px;
  margin: 0 auto;
  background: #1a1a1a;
  border-radius: 2.25rem;
  padding: 10px;
  box-shadow:
    0 0 0 2px #333,
    0 20px 40px rgba(0, 0, 0, 0.3),
    inset 0 0 0 1px rgba(255, 255, 255, 0.05);
  position: relative;
}

.phone-notch {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100px;
  height: 22px;
  background: #1a1a1a;
  border-radius: 0 0 14px 14px;
  z-index: 10;
}

.phone-screen.mobile-preview-frame {
  border-radius: 1.5rem;
  overflow: hidden;
  min-height: 620px;
  height: 620px;
  position: relative;
  background: #0a0a0a;
}

.banner-preview {
  flex-shrink: 0;
  height: 100px;
  background: #2a2a2a;
}

.banner-preview img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 游戏图：宽度直接满格，方形，照片带圆角 */
.game-thumb {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 10px;
  overflow: hidden;
}

.game-thumb-img {
  width: 100%;
  height: 100%;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 10px;
}
</style>
