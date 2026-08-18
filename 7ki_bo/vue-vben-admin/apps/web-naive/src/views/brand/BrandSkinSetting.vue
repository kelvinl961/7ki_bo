<template>
  <Page :title="$t('brand.skinSettingTitle')" :description="$t('brand.skinSettingDesc')">
    <div class="mb-4">
      <n-breadcrumb>
        <n-breadcrumb-item>{{ $t('brand.management') }}</n-breadcrumb-item>
        <n-breadcrumb-item>{{ $t('brand.skinSettingBreadcrumb') }}</n-breadcrumb-item>
      </n-breadcrumb>
    </div>

    <div class="brand-skin-setting grid grid-cols-1 gap-6 lg:grid-cols-3">
      
      <div class="lg:col-span-1 space-y-6">
        <n-form
          ref="formRef"
          :model="formData"
          :rules="formRules"
          label-placement="top"
          require-mark-placement="right-hanging"
        >
          <n-card :title="$t('brand.skin.basicInfo')" class="rounded-16px shadow-sm">
            <n-form-item :label="$t('brand.brandId')" path="brandId" required>
              <n-input v-model:value="formData.brandId" :placeholder="$t('brand.brandId')" clearable />
            </n-form-item>
            <n-form-item :label="$t('brand.skin.brandCode')" path="brandCode" required>
              <n-input v-model:value="formData.brandCode" :placeholder="$t('brand.skin.brandCode')" clearable />
            </n-form-item>
            <n-form-item :label="$t('brand.brandName')" path="brandName" required>
              <n-input v-model:value="formData.brandName" :placeholder="$t('brand.brandName')" clearable />
            </n-form-item>
          </n-card>

          <n-card :title="$t('brand.skin.skinColorSection')" class="rounded-16px shadow-sm">
            <n-form-item :label="$t('brand.skin.selectSkinPreset')" path="skinColorId">
              <n-select
                v-model:value="formData.skinColorId"
                :placeholder="$t('brand.skin.selectSkinColorHint')"
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
            <n-form-item :label="$t('brand.skin.primaryColor')" path="primaryColor">
              <n-color-picker
                v-model:value="formData.primaryColor"
                :show-alpha="false"
                style="width: 100%"
              />
            </n-form-item>
            <n-form-item :label="$t('brand.skin.secondaryColor')" path="secondaryColor">
              <n-color-picker
                v-model:value="formData.secondaryColor"
                :show-alpha="false"
                style="width: 100%"
              />
            </n-form-item>
            <n-form-item :label="$t('brand.skin.accentColor')" path="accentColor">
              <n-color-picker
                v-model:value="formData.accentColor"
                :show-alpha="false"
                style="width: 100%"
              />
            </n-form-item>
            <n-form-item :label="$t('brand.skin.tertiaryColor')" path="tertiaryColor">
              <n-color-picker
                v-model:value="formData.tertiaryColor"
                :show-alpha="false"
                style="width: 100%"
              />
            </n-form-item>
            <n-form-item :label="$t('brand.skin.textPrimaryColor')" path="textPrimaryColor">
              <n-color-picker
                v-model:value="formData.textPrimaryColor"
                :show-alpha="false"
                style="width: 100%"
              />
            </n-form-item>
            <n-form-item :label="$t('brand.skin.textSecondaryColor')" path="textSecondaryColor">
              <n-color-picker
                v-model:value="formData.textSecondaryColor"
                :show-alpha="false"
                style="width: 100%"
              />
            </n-form-item>
            <n-form-item :label="$t('brand.skin.textAccentColor')" path="textAccentColor">
              <n-color-picker
                v-model:value="formData.textAccentColor"
                :show-alpha="false"
                style="width: 100%"
              />
            </n-form-item>
            <n-form-item :label="$t('brand.skin.buttonColor')" path="buttonColor">
              <n-color-picker
                v-model:value="formData.buttonColor"
                :show-alpha="false"
                style="width: 100%"
              />
            </n-form-item>
          </n-card>

          <n-card :title="$t('brand.skin.lobbyBackgroundSection')" class="rounded-16px shadow-sm">
          <n-form-item :label="$t('brand.skin.backgroundType')" path="lobbyBackgroundType">
            <n-radio-group
              v-model:value="formData.lobbyBackgroundType"
              class="flex flex-col gap-2"
            >
              <n-radio value="system_default">{{ $t('brand.skin.systemDefault') }}</n-radio>
              <n-radio value="system_config">{{ $t('brand.skin.systemConfigColor') }}</n-radio>
              <n-radio value="custom_image">{{ $t('brand.skin.customImageBg') }}</n-radio>
            </n-radio-group>
          </n-form-item>
          <n-form-item :label="$t('brand.skin.backgroundColor')" path="lobbyBackgroundColor">
            <n-color-picker
              v-model:value="formData.lobbyBackgroundColor"
              :show-alpha="false"
              style="width: 100%"
            />
            <template v-if="formData.lobbyBackgroundType !== 'system_config'">
              <div class="mt-1 text-xs text-gray-400">{{ $t('brand.skin.systemConfigHint') }}</div>
            </template>
          </n-form-item>
          <n-form-item :label="$t('brand.skin.backgroundImage')" path="lobbyBackgroundImageUrl">
            <MediaLibrarySelector
              v-model="formData.lobbyBackgroundImageUrl"
              :accept-types="['image']"
              :placeholder="$t('brand.skin.lobbyBgPlaceholder')"
            />
            <template v-if="formData.lobbyBackgroundType !== 'custom_image'">
              <div class="mt-1 text-xs text-gray-400">{{ $t('brand.skin.customImageHint') }}</div>
            </template>
          </n-form-item>
          </n-card>

          <n-card :title="$t('brand.skin.effectiveTime')" class="rounded-16px shadow-sm">
          <n-form-item :label="$t('common.startTime')" path="effectiveStartTime">
            <n-date-picker
              v-model:value="formData.effectiveStartTime"
              type="datetime"
              :placeholder="$t('brand.skin.selectStartTime')"
              style="width: 100%"
              clearable
            />
          </n-form-item>
          <n-form-item :label="$t('common.endTime')" path="effectiveEndTime">
            <n-date-picker
              v-model:value="formData.effectiveEndTime"
              type="datetime"
              :placeholder="$t('brand.skin.selectEndTime')"
              style="width: 100%"
              clearable
            />
          </n-form-item>
          <n-alert type="info" :show-icon="true" class="mt-2">
            {{ $t('brand.skin.noEndTimeHint') }}
          </n-alert>
          </n-card>

          <n-card :title="$t('brand.skin.languageSettings')" class="rounded-16px shadow-sm">
          <div
            v-for="clientType in clientTypes"
            :key="clientType.key"
            class="mb-4 last:mb-0"
          >
            <h5 class="client-type-title mb-2 text-sm font-medium text-gray-600">
              {{ clientType.label }}
            </h5>
            <n-checkbox-group v-model:value="formData.clientLanguages[clientType.key]">
              <div class="language-checkboxes flex flex-wrap gap-x-4 gap-y-1">
                <n-checkbox
                  v-for="lang in availableLanguages"
                  :key="lang.value"
                  :value="lang.value"
                  :label="lang.label"
                />
              </div>
            </n-checkbox-group>
          </div>
          </n-card>

          <n-card :title="$t('brand.skin.otherSettings')" class="rounded-16px shadow-sm">
            <n-form-item :label="$t('brand.skin.authMode')" path="authMode" required>
              <n-select
                v-model:value="formData.authMode"
                :options="authModeOptions"
                :placeholder="$t('brand.skin.selectAuthMode')"
                clearable
                style="width: 100%"
              />
            </n-form-item>
            <n-form-item :label="$t('brand.skin.appConfig')" path="appSetting">
              <n-input v-model:value="formData.appSetting" :placeholder="$t('brand.skin.enterAppConfig')" clearable />
            </n-form-item>
            <n-form-item :label="$t('brand.skin.remarkInfo')" path="backendRemark">
              <n-input
                v-model:value="formData.backendRemark"
                type="textarea"
                :rows="3"
                :placeholder="$t('brand.skin.enterRemarkInfo')"
                clearable
              />
            </n-form-item>
          </n-card>
        </n-form>

        <div class="flex flex-col gap-2">
          <div class="flex gap-2">
            <n-button type="primary" :loading="saving || syncing" @click="handleSave">{{ $t('brand.skin.saveAndSyncApi') }}</n-button>
            <n-button @click="handleReset">{{ $t('common.reset') }}</n-button>
          </div>
          <p class="text-xs text-gray-500">
            {{ $t('brand.skin.devProxyHint') }}
            <a
              href="https://277br.pangu6688.com"
              target="_blank"
              rel="noopener noreferrer"
              class="text-primary"
            >277br</a>{{ $t('brand.skin.devProxyHint2') }}
            <code class="rounded bg-gray-100 px-1">PUT /brand-skin-lang/:id</code>；
            {{ $t('brand.skin.devProxyHint3') }}
            <code class="rounded bg-gray-100 px-1">GET /layout-design/public/theme</code>
            {{ $t('brand.skin.devProxyHint4') }}
          </p>
          <n-alert
            v-if="!brandSkinLangRecord"
            type="warning"
            :show-icon="true"
            class="mt-2"
          >
            {{ $t('brand.skin.noSkinLangRecordHint') }}
          </n-alert>
        </div>
      </div>

      
      <div class="lg:col-span-2 space-y-6">
        <n-card :title="$t('brand.skin.templatePreview')" class="rounded-16px shadow-sm">
          <div class="preview-toolbar mb-2 flex items-center justify-between">
            <span class="text-sm text-gray-600">{{ $t('brand.skinLang.preview') }}</span>
            <n-button size="small" type="primary">{{ $t('brand.skin.mobilePreviewPhone') }}</n-button>
          </div>
          
          <div class="preview-container flex justify-center p-2">
            <div class="phone-bezel">
              <div class="phone-screen mobile-preview-frame flex flex-col">
            
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
              >{{ $t('brand.skin.recharge') }}</button>
            </div>
            
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
                {{ $t('brand.skin.bannerPlaceholder') }}
              </div>
            </div>
            
            <div
              class="shrink-0 flex items-center gap-1 px-3 py-1.5 text-xs"
              :style="{ backgroundColor: formData.primaryColor, color: formData.textPrimaryColor }"
            >
              <span>🔔</span>
              <span>{{ $t('brand.skin.announcementSample', ['18,888', $t('brand.skin.announcementGame')]) }}</span>
            </div>
            
            <div
              class="preview-tabs shrink-0 flex gap-2 border-b px-3 py-0.5 text-xs"
              :style="{ backgroundColor: formData.primaryColor, borderColor: formData.tertiaryColor }"
            >
              <span class="font-medium" :style="{ color: formData.textPrimaryColor, borderBottom: `2px solid ${formData.textAccentColor}`, paddingBottom: '2px' }">{{ $t('brand.skin.hot') }}</span>
              <span :style="{ color: formData.textSecondaryColor }">{{ $t('brand.skin.chess') }}</span>
              <span :style="{ color: formData.textSecondaryColor }">{{ $t('brand.skin.fishing') }}</span>
              <span :style="{ color: formData.textSecondaryColor }">{{ $t('brand.skin.live') }}</span>
            </div>
            
            <div
              class="lobby-preview flex-1 overflow-y-auto px-3 py-3 transition-colors duration-200"
              :style="lobbyPreviewStyle"
            >
              <div class="mb-2 flex items-center gap-1 text-xs" :style="{ color: formData.textPrimaryColor }">
                <span>🔥</span>
                <span>{{ $t('brand.skin.hotGames') }}</span>
              </div>
              <div class="grid grid-cols-3 gap-2">
                <div
                  v-for="(game, idx) in previewGames"
                  :key="game.id ?? idx"
                  class="text-center"
                >
                  
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
                  <div class="text-[10px] truncate" :style="{ color: formData.textPrimaryColor }">{{ game.gameName || $t('brand.skin.gamePlaceholder', [idx + 1]) }}</div>
                </div>
              </div>
            </div>
            
            <div
              class="preview-footer shrink-0 flex items-center justify-around py-2 text-xs"
              :style="{ backgroundColor: formData.secondaryColor, color: formData.textPrimaryColor }"
            >
              <span class="font-medium">{{ $t('brand.skin.home') }}</span>
              <span class="opacity-80">{{ $t('brand.skin.promotions') }}</span>
              <span class="opacity-80">{{ $t('brand.skin.recharge') }}</span>
              <span class="opacity-80">{{ $t('brand.skin.withdraw') }}</span>
              <span class="opacity-80">{{ $t('brand.skin.profile') }}</span>
              </div>
            </div>
          </div>
          </div>
          
          <div class="mt-3 flex flex-wrap gap-2">
            <n-tag size="small" :bordered="false">rolex</n-tag>
            <n-tag size="small" :bordered="false">{{ $t('brand.skin.withBackgroundTag') }}</n-tag>
            <n-tag
              size="small"
              :bordered="false"
              :color="{ color: formData.primaryColor, textColor: '#fff' }"
            >
              {{ skinColorLabel || $t('brand.skin.customColor') }}
            </n-tag>
          </div>
          <p class="mt-2 text-xs text-gray-500">
            {{ $t('brand.skin.previewHint') }}
          </p>
        </n-card>

        <n-card :title="$t('brand.skin.detailAllSettings')" class="rounded-16px shadow-sm">
          <div class="detail-grid grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
            <div class="detail-item">
              <span class="text-gray-500">{{ $t('brand.skin.skinPreset') }}</span>
              <div class="mt-1 font-medium">
                {{ skinColorLabel || '—' }}
              </div>
            </div>
            <div class="detail-item">
              <span class="text-gray-500">{{ $t('brand.skin.primaryColor') }}</span>
              <div class="mt-1 flex items-center gap-2">
                <span
                  class="inline-block h-4 w-4 shrink-0 rounded border border-gray-300"
                  :style="{ backgroundColor: formData.primaryColor }"
                />
                <span class="font-mono font-medium">{{ formData.primaryColor }}</span>
              </div>
            </div>
            <div class="detail-item">
              <span class="text-gray-500">{{ $t('brand.skin.secondaryColor') }}</span>
              <div class="mt-1 flex items-center gap-2">
                <span
                  class="inline-block h-4 w-4 shrink-0 rounded border border-gray-300"
                  :style="{ backgroundColor: formData.secondaryColor }"
                />
                <span class="font-mono font-medium">{{ formData.secondaryColor }}</span>
              </div>
            </div>
            <div class="detail-item">
              <span class="text-gray-500">{{ $t('brand.skin.accentColor') }}</span>
              <div class="mt-1 flex items-center gap-2">
                <span
                  class="inline-block h-4 w-4 shrink-0 rounded border border-gray-300"
                  :style="{ backgroundColor: formData.accentColor }"
                />
                <span class="font-mono font-medium">{{ formData.accentColor }}</span>
              </div>
            </div>
            <div class="detail-item">
              <span class="text-gray-500">{{ $t('brand.skin.tertiaryColor') }}</span>
              <div class="mt-1 flex items-center gap-2">
                <span
                  class="inline-block h-4 w-4 shrink-0 rounded border border-gray-300"
                  :style="{ backgroundColor: formData.tertiaryColor }"
                />
                <span class="font-mono font-medium">{{ formData.tertiaryColor }}</span>
              </div>
            </div>
            <div class="detail-item">
              <span class="text-gray-500">{{ $t('brand.skin.textPrimaryColor') }}</span>
              <div class="mt-1 flex items-center gap-2">
                <span
                  class="inline-block h-4 w-4 shrink-0 rounded border border-gray-300"
                  :style="{ backgroundColor: formData.textPrimaryColor }"
                />
                <span class="font-mono font-medium">{{ formData.textPrimaryColor }}</span>
              </div>
            </div>
            <div class="detail-item">
              <span class="text-gray-500">{{ $t('brand.skin.textSecondaryColor') }}</span>
              <div class="mt-1 flex items-center gap-2">
                <span
                  class="inline-block h-4 w-4 shrink-0 rounded border border-gray-300"
                  :style="{ backgroundColor: formData.textSecondaryColor }"
                />
                <span class="font-mono font-medium">{{ formData.textSecondaryColor }}</span>
              </div>
            </div>
            <div class="detail-item">
              <span class="text-gray-500">{{ $t('brand.skin.textAccentColor') }}</span>
              <div class="mt-1 flex items-center gap-2">
                <span
                  class="inline-block h-4 w-4 shrink-0 rounded border border-gray-300"
                  :style="{ backgroundColor: formData.textAccentColor }"
                />
                <span class="font-mono font-medium">{{ formData.textAccentColor }}</span>
              </div>
            </div>
            <div class="detail-item">
              <span class="text-gray-500">{{ $t('brand.skin.buttonColor') }}</span>
              <div class="mt-1 flex items-center gap-2">
                <span
                  class="inline-block h-4 w-4 shrink-0 rounded border border-gray-300"
                  :style="{ backgroundColor: formData.buttonColor }"
                />
                <span class="font-mono font-medium">{{ formData.buttonColor }}</span>
              </div>
            </div>
            <div class="detail-item">
              <span class="text-gray-500">{{ $t('brand.skin.lobbyBgType') }}</span>
              <div class="mt-1 font-medium">
                {{ lobbyBackgroundTypeLabel }}
              </div>
            </div>
            <div class="detail-item">
              <span class="text-gray-500">{{ $t('brand.skin.backgroundColor') }}</span>
              <div class="mt-1 flex items-center gap-2">
                <span
                  class="inline-block h-4 w-4 shrink-0 rounded border border-gray-300"
                  :style="{ backgroundColor: formData.lobbyBackgroundColor }"
                />
                <span class="font-mono font-medium">{{ formData.lobbyBackgroundColor }}</span>
              </div>
            </div>
            <div class="detail-item">
              <span class="text-gray-500">{{ $t('brand.skin.backgroundImage') }}</span>
              <div class="mt-1 font-medium truncate" :title="formData.lobbyBackgroundImageUrl || '—'">
                {{ formData.lobbyBackgroundImageUrl ? $t('brand.skin.bgImageSet') : '—' }}
              </div>
            </div>
            <div class="detail-item">
              <span class="text-gray-500">{{ $t('brand.skin.effectiveStart') }}</span>
              <div class="mt-1 font-medium">
                {{ formatTime(formData.effectiveStartTime) || '—' }}
              </div>
            </div>
            <div class="detail-item">
              <span class="text-gray-500">{{ $t('brand.skin.effectiveEnd') }}</span>
              <div class="mt-1 font-medium">
                {{ formatTime(formData.effectiveEndTime) || $t('brand.skin.permanentlyEffective') }}
              </div>
            </div>
            
            <div class="detail-item col-span-2">
              <span class="section-label text-base font-medium text-gray-700">{{ $t('brand.skin.basicInfo') }}</span>
            </div>
            <div class="detail-item">
              <span class="text-gray-500">{{ $t('brand.brandId') }}</span>
              <div class="mt-1 font-medium">{{ formData.brandId || '—' }}</div>
            </div>
            <div class="detail-item">
              <span class="text-gray-500">{{ $t('brand.skin.brandCode') }}</span>
              <div class="mt-1 font-medium">{{ formData.brandCode || '—' }}</div>
            </div>
            <div class="detail-item">
              <span class="text-gray-500">{{ $t('brand.brandName') }}</span>
              <div class="mt-1 font-medium">{{ formData.brandName || '—' }}</div>
            </div>
            
            <div class="detail-item col-span-2">
              <span class="section-label text-base font-medium text-gray-700">{{ $t('brand.skin.languageSettings') }}</span>
            </div>
            <div class="detail-item col-span-2">
              <span class="text-gray-500">{{ $t('brand.skin.selectedLanguages') }}</span>
              <div class="mt-1 font-medium">
                {{ clientLanguagesDetailText || '—' }}
              </div>
            </div>
            
            <div class="detail-item col-span-2">
              <span class="section-label text-base font-medium text-gray-700">{{ $t('brand.skin.otherSettings') }}</span>
            </div>
            <div class="detail-item">
              <span class="text-gray-500">{{ $t('brand.skin.authMode') }}</span>
              <div class="mt-1 font-medium">{{ formData.authMode || '—' }}</div>
            </div>
            <div class="detail-item">
              <span class="text-gray-500">{{ $t('brand.skin.appConfig') }}</span>
              <div class="mt-1 font-medium">{{ formData.appSetting || '—' }}</div>
            </div>
            <div class="detail-item">
              <span class="text-gray-500">{{ $t('brand.skin.remarkInfo') }}</span>
              <div class="mt-1 font-medium break-words">{{ formData.backendRemark || '—' }}</div>
            </div>
          </div>
        </n-card>
      </div>
    </div>
  </Page>
</template>

<script setup lang="ts">
import { $t } from '@vben/locales';

import { ref, computed, onMounted, defineAsyncComponent } from 'vue';
import {
  NCard,
  NForm,
  NFormItem,
  NInput,
  NSelect,
  NCheckbox,
  NCheckboxGroup,
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
import type { ClientLanguagesMap as ApiClientLanguagesMap } from '#/api/brand/brandSkin';
import {
  getBrandSkinConfigApi,
  saveBrandSkinConfigApi,
} from '#/api/brand/brandSkin';
import type { BrandSkinLangConfig } from '#/api/skinLang';
import {
  loadPrimaryBrandSkinLangRecord,
  mapRecordToFormColors,
  syncBrandSkinLangColors,
  type BrandSkinFormColors,
} from '#/api/brand/brandSkinSync';
import { getImageUrlByEnvironment } from '#/utils/imageUtils';

const MediaLibrarySelector = defineAsyncComponent(
  () => import('#/components/MediaLibrarySelector.vue'),
);

const message = useMessage();
const formRef = ref<FormInst | null>(null);
const saving = ref(false);
const syncing = ref(false);

const brandSkinLangRecord = ref<BrandSkinLangConfig | null>(null);


const autoSaveOnTemplatePick =
  import.meta.env.DEV && import.meta.env.VITE_BRAND_SKIN_AUTO_SAVE !== 'false';


const previewGames = ref<GameItem[]>([]);

const previewBannerUrl = ref<string>('');


interface ClientLanguagesMap {
  desktop: string[];
  h5: string[];
  ios: string[];
  android: string[];
}

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
  brandId: string;
  brandCode: string;
  brandName: string;
  clientLanguages: ClientLanguagesMap;
  authMode: string;
  appSetting: string;
  backendRemark: string;
}


const defaultBvlgariPalette = getColorPaletteById('15');
const defaultFormData: FormModel = {
  skinColorId: '15',
  primaryColor: defaultBvlgariPalette.primary,
  secondaryColor: defaultBvlgariPalette.secondary,
  tertiaryColor: defaultBvlgariPalette.tertiary,
  accentColor: defaultBvlgariPalette.accent,
  textPrimaryColor: defaultBvlgariPalette.textPrimary,
  textSecondaryColor: defaultBvlgariPalette.textSecondary,
  textAccentColor: defaultBvlgariPalette.textAccent,
  buttonColor: defaultBvlgariPalette.buttonColor,
  lobbyBackgroundType: 'system_default',
  lobbyBackgroundColor: defaultBvlgariPalette.primary,
  lobbyBackgroundImageUrl: '',
  effectiveStartTime: null,
  effectiveEndTime: null,
  brandId: '',
  brandCode: '',
  brandName: '',
  clientLanguages: {
    desktop: ['zh-CN'],
    h5: ['zh-CN'],
    ios: ['zh-CN'],
    android: ['zh-CN'],
  },
  authMode: $t('brand.skinLang.authSystemDefault'),
  appSetting: '',
  backendRemark: '',
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
  brandId: [{ required: true, message: $t('brand.skin.brandIdRequired'), trigger: 'blur' }],
  brandCode: [{ required: true, message: $t('brand.skin.brandCodeRequired'), trigger: 'blur' }],
  brandName: [{ required: true, message: $t('brand.skin.brandNameRequired'), trigger: 'blur' }],
  authMode: [{ required: true, message: $t('brand.skin.selectAuthModeRequired'), trigger: ['blur', 'change'] }],
  appSetting: [],
  backendRemark: [],
};

const clientTypes = [{ key: 'desktop', label: $t('brand.skinLang.desktopClient') }];
const availableLanguages = [
  { value: 'zh-CN', label: $t('brand.skinLang.langZhCN') },
  { value: 'pt-BR', label: $t('brand.skinLang.langPtBR') },
  { value: 'en-US', label: $t('brand.skinLang.langEnUS') },
  { value: 'zh-TW', label: $t('brand.skinLang.langZhTW') },
  { value: 'ko-KR', label: $t('brand.skinLang.langKoKR') },
  { value: 'ja-JP', label: $t('brand.skinLang.langJaJP') },
  { value: 'th-TH', label: $t('brand.skinLang.langThTH') },
  { value: 'vi-VN', label: $t('brand.skinLang.langViVN') },
];
const authModeOptions = [
  { label: $t('brand.skinLang.authSystemDefault'), value: '系统默认认证' },
  { label: $t('brand.skinLang.authTwoFactor'), value: '双重认证' },
  { label: $t('brand.skinLang.authBiometric'), value: '生物识别认证' },
  { label: $t('brand.skinLang.authSms'), value: '短信验证' },
];

const { skinColorOptions, getSkinColorLabel } = useSkinColorOptions();

const skinColorOptionsWithPreview = computed(() =>
  skinColorOptions.map((opt) => ({ label: opt.label, value: opt.value })),
);


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
  return id ? getSkinColorLabel(id) : $t('brand.skin.customColor');
});

const lobbyBackgroundTypeLabel = computed(() => {
  const t = formData.value.lobbyBackgroundType;
  if (t === 'system_default') return $t('brand.skin.systemDefault');
  if (t === 'system_config')
    return `${$t('brand.skin.systemConfigColor').replace(/（颜色）|\(Color\)/, '')} (${formData.value.lobbyBackgroundColor})`;
  if (t === 'custom_image')
    return formData.value.lobbyBackgroundImageUrl
      ? $t('brand.skin.customImage')
      : $t('brand.skin.customImageNotSet');
  return '—';
});


const clientLanguagesDetailText = computed(() => {
  const map = formData.value.clientLanguages;
  if (!map) return '—';
  const all = [
    ...(map.desktop ?? []),
    ...(map.h5 ?? []),
    ...(map.ios ?? []),
    ...(map.android ?? []),
  ];
  const unique = [...new Set(all)];
  if (unique.length === 0) return '—';
  return unique
    .map((code) => availableLanguages.find((l) => l.value === code)?.label ?? code)
    .join('、');
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

function applyPaletteToForm(skinColorId: string): ColorPalette {
  const palette = getColorPaletteById(skinColorId);
  formData.value.primaryColor = palette.primary;
  formData.value.secondaryColor = palette.secondary;
  formData.value.tertiaryColor = palette.tertiary ?? palette.secondary;
  formData.value.accentColor = palette.accent;
  formData.value.textPrimaryColor = palette.textPrimary;
  formData.value.textSecondaryColor = palette.textSecondary;
  formData.value.textAccentColor = palette.textAccent;
  formData.value.buttonColor = palette.buttonColor;
  formData.value.lobbyBackgroundColor = palette.primary;
  return palette;
}

function buildFormSnapshot(): BrandSkinFormColors {
  return {
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
    brandId: formData.value.brandId,
    brandCode: formData.value.brandCode,
    brandName: formData.value.brandName,
    clientLanguages: flattenClientLanguages(formData.value.clientLanguages),
    authMode: formData.value.authMode,
    appSetting: formData.value.appSetting,
    backendRemark: formData.value.backendRemark,
  };
}

async function syncColorsToBrandSkinLangApi(
  successMessage = $t('brand.skin.colorsSynced'),
) {
  const record = brandSkinLangRecord.value;
  if (!record?.id) {
    message.warning($t('brand.skin.skinLangNotFound'));
    return false;
  }
  const skinColorId = formData.value.skinColorId || record.skinColor || '15';
  const palette = getColorPaletteById(skinColorId);
  syncing.value = true;
  try {
    await syncBrandSkinLangColors(
      record.id,
      record,
      buildFormSnapshot(),
      palette,
    );
    message.success(successMessage);
    return true;
  } catch {
    message.error($t('brand.skin.syncFailed'));
    return false;
  } finally {
    syncing.value = false;
  }
}

async function onSkinColorChange(skinColorId: string | null) {
  if (!skinColorId) return;
  applyPaletteToForm(skinColorId);
  if (autoSaveOnTemplatePick) {
    await syncColorsToBrandSkinLangApi(
      $t('brand.skin.appliedAndSynced', [getSkinColorLabel(skinColorId)]),
    );
  }
}

function formatTime(timestamp: number | null): string {
  if (timestamp == null) return '';
  const d = new Date(timestamp);
  return d.toLocaleString('zh-CN');
}

function flattenClientLanguages(map: ClientLanguagesMap): string[] {
  const all = [
    ...(map.desktop ?? []),
    ...(map.h5 ?? []),
    ...(map.ios ?? []),
    ...(map.android ?? []),
  ];
  return [...new Set(all)];
}

function handleSave() {
  formRef.value?.validate(async (err) => {
    if (err) return;
    saving.value = true;
    try {
      if (brandSkinLangRecord.value?.id) {
        const ok = await syncColorsToBrandSkinLangApi();
        if (!ok) return;
      } else {
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
          brandId: formData.value.brandId || undefined,
          brandCode: formData.value.brandCode || undefined,
          brandName: formData.value.brandName || undefined,
          clientLanguages: flattenClientLanguages(formData.value.clientLanguages),
          authMode: formData.value.authMode || undefined,
          appSetting: formData.value.appSetting || undefined,
          backendRemark: formData.value.backendRemark || undefined,
        });
        message.success($t('brand.skin.configSaved'));
      }
    } catch {
      message.error($t('brand.skin.saveFailed'));
    } finally {
      saving.value = false;
    }
  });
}

function handleReset() {
  formData.value = { ...defaultFormData };
  message.info($t('brand.skin.resetToDefault'));
}

function normalizeClientLanguages(
  raw: string[] | ApiClientLanguagesMap | undefined,
): ClientLanguagesMap {
  if (!raw) return defaultFormData.clientLanguages;
  if (Array.isArray(raw)) {
    return {
      desktop: raw.length ? [...raw] : ['zh-CN'],
      h5: raw.length ? [...raw] : ['zh-CN'],
      ios: raw.length ? [...raw] : ['zh-CN'],
      android: raw.length ? [...raw] : ['zh-CN'],
    };
  }
  return {
    desktop: raw.desktop ?? ['zh-CN'],
    h5: raw.h5 ?? ['zh-CN'],
    ios: raw.ios ?? ['zh-CN'],
    android: raw.android ?? ['zh-CN'],
  };
}

onMounted(async () => {
  try {
    const langRecord = await loadPrimaryBrandSkinLangRecord();
    if (langRecord) {
      brandSkinLangRecord.value = langRecord;
      const mapped = mapRecordToFormColors(langRecord);
      if (mapped.skinColorId) formData.value.skinColorId = mapped.skinColorId;
      if (mapped.primaryColor) formData.value.primaryColor = mapped.primaryColor;
      if (mapped.secondaryColor) formData.value.secondaryColor = mapped.secondaryColor;
      if (mapped.tertiaryColor) formData.value.tertiaryColor = mapped.tertiaryColor;
      if (mapped.accentColor) formData.value.accentColor = mapped.accentColor;
      if (mapped.textPrimaryColor) formData.value.textPrimaryColor = mapped.textPrimaryColor;
      if (mapped.textSecondaryColor) {
        formData.value.textSecondaryColor = mapped.textSecondaryColor;
      }
      if (mapped.textAccentColor) formData.value.textAccentColor = mapped.textAccentColor;
      if (mapped.buttonColor) formData.value.buttonColor = mapped.buttonColor;
      if (mapped.lobbyBackgroundType) {
        formData.value.lobbyBackgroundType = mapped.lobbyBackgroundType;
      }
      if (mapped.lobbyBackgroundColor) {
        formData.value.lobbyBackgroundColor = mapped.lobbyBackgroundColor;
      }
      if (mapped.lobbyBackgroundImageUrl) {
        formData.value.lobbyBackgroundImageUrl = mapped.lobbyBackgroundImageUrl;
      }
      if (mapped.brandId) formData.value.brandId = mapped.brandId;
      if (mapped.brandCode) formData.value.brandCode = mapped.brandCode;
      if (mapped.brandName) formData.value.brandName = mapped.brandName;
      if (mapped.authMode != null) formData.value.authMode = mapped.authMode;
      if (mapped.appSetting != null) formData.value.appSetting = mapped.appSetting;
      if (mapped.backendRemark != null) {
        formData.value.backendRemark = mapped.backendRemark;
      }
      if (mapped.clientLanguages?.length) {
        const langs = mapped.clientLanguages;
        formData.value.clientLanguages = {
          desktop: [...langs],
          h5: [...langs],
          ios: [...langs],
          android: [...langs],
        };
      }
    }
  } catch {
    
  }

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
      if (saved.brandId != null) formData.value.brandId = saved.brandId;
      if (saved.brandCode != null) formData.value.brandCode = saved.brandCode;
      if (saved.brandName != null) formData.value.brandName = saved.brandName;
      formData.value.clientLanguages = normalizeClientLanguages(saved.clientLanguages);
      if (saved.authMode != null) formData.value.authMode = saved.authMode;
      if (saved.appSetting != null) formData.value.appSetting = saved.appSetting;
      if (saved.backendRemark != null) formData.value.backendRemark = saved.backendRemark;
    }
  } catch {
    
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
        gameName: $t('brand.skin.gamePlaceholder', [previewGames.value.length + i + 1]),
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
      gameName: $t('brand.skin.gamePlaceholder', [i + 1]),
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

.preview-container {
  width: 100%;
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

.phone-screen.mobile-preview-frame {
  width: 300px;
  aspect-ratio: 390 / 844;
  max-height: 640px;
  border-radius: 18px;
  overflow: hidden;
  position: relative;
  background: #0e131b;
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
