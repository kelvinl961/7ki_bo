<template>
  <Page :title="$t('brand.logoSettingTitle')" :description="$t('brand.logoSettingDesc')">
    <div class="mb-4">
      <n-breadcrumb>
        <n-breadcrumb-item>{{ $t('brand.management') }}</n-breadcrumb-item>
        <n-breadcrumb-item>{{ $t('brand.logoSettingBreadcrumb') }}</n-breadcrumb-item>
      </n-breadcrumb>
    </div>

    
    <n-tabs 
      v-model:value="activeTab" 
      type="line" 
      animated
      @update:value="handleTabChange"
    >
      <n-tab-pane name="logo-settings" :tab="$t('brand.logoAndImageSetting')">
        <n-card class="mb-4">
          <div class="flex flex-wrap gap-4 items-end">
            <div class="flex flex-col">
              <label class="mb-2 text-sm font-medium">{{ $t('brand.logoType') }}</label>
              <n-select
                v-model:value="filters.logoType"
                :placeholder="$t('brand.selectLogoType')"
                clearable
                style="width: 160px"
                :options="logoTypeOptions"
                @update:value="handleFilter"
              />
            </div>

            <div class="flex flex-col">
              <label class="mb-2 text-sm font-medium">{{ $t('brand.enableStatus') }}</label>
              <n-select
                v-model:value="filters.isEnabled"
                :placeholder="$t('brand.selectEnableStatus')"
                clearable
                style="width: 140px"
                :options="statusOptions"
                @update:value="handleFilter"
              />
            </div>

            
            <div class="flex flex-col">
              <label class="mb-2 text-sm font-medium">{{ $t('common.operator') }}</label>
              <n-input
                v-model:value="filters.operator"
                :placeholder="$t('brand.enterOperator')"
                clearable
                style="width: 140px"
                @keyup.enter="handleFilter"
              />
            </div>

            
            <div class="flex gap-2">
              <n-button type="primary" @click="handleFilter">
                {{ $t('common.search') }}
              </n-button>
              <n-button @click="resetFilter">
                {{ $t('common.reset') }}
              </n-button>
            </div>
          </div>
        </n-card>

        <!-- 🚀 NEW: SmartDataGrid Component for LOGO Settings -->
        <SmartDataGrid
          :data="tableData"
          :columns="columns"
          :loading="loading"
          :pagination="paginationReactive"
          row-key="id"
          @update:page="handlePageChange"
          @update:page-size="handlePageSizeChange"
          @refresh="handleRefresh"
          @row-click="handleRowClick"
        >
          <template #actionBar>
            <n-card :bordered="false" class="rounded-16px shadow-sm">
              <div class="flex justify-between items-center">
                <div class="flex items-center gap-4">
                  
                  <div class="flex gap-2">
                    <n-button type="primary" @click="handleCreate">
                      {{ $t('brand.addSetting') }}
                    </n-button>
                    <n-button @click="handleDownloadTemplate">
                      {{ $t('brand.downloadTemplate') }}
                    </n-button>
                    <n-button @click="handleClearCache">
                      {{ $t('brand.clearCache') }}
                    </n-button>
                  </div>
                  
                  <div class="text-sm text-gray-600">
                    {{ $t('brand.totalRecords', [paginationReactive.total]) }}
                  </div>
                </div>
              </div>
            </n-card>
          </template>
        </SmartDataGrid>
      </n-tab-pane>

      <n-tab-pane name="website-info" :tab="$t('brand.websiteInfoSeo')">
        <n-card>
          <n-empty :description="$t('brand.websiteInfoDeveloping')" size="large">
            <template #extra>
              <n-button type="primary" @click="handleComingSoon($t('brand.websiteInfoSeo'))">
                {{ $t('game.comingSoon') }}
              </n-button>
            </template>
          </n-empty>
        </n-card>
      </n-tab-pane>

      <n-tab-pane name="about-us" :tab="$t('brand.aboutUs')">
        <n-card>
          <n-empty :description="$t('brand.aboutUsDeveloping')" size="large">
            <template #extra>
              <n-button type="primary" @click="handleComingSoon($t('brand.aboutUs'))">
                {{ $t('game.comingSoon') }}
              </n-button>
            </template>
          </n-empty>
        </n-card>
      </n-tab-pane>

      <n-tab-pane name="footer-config" :tab="$t('brand.footerConfig')">
        <n-card>
          <n-empty :description="$t('brand.footerConfigDeveloping')" size="large">
            <template #extra>
              <n-button type="primary" @click="handleComingSoon($t('brand.footerConfig'))">
                {{ $t('game.comingSoon') }}
              </n-button>
            </template>
          </n-empty>
        </n-card>
      </n-tab-pane>

      <n-tab-pane name="official-channels" :tab="$t('brand.officialChannels')">
        <n-card>
          <n-empty :description="$t('brand.officialChannelsDeveloping')" size="large">
            <template #extra>
              <n-button type="primary" @click="handleComingSoon($t('brand.officialChannels'))">
                {{ $t('game.comingSoon') }}
              </n-button>
            </template>
          </n-empty>
        </n-card>
      </n-tab-pane>

      <n-tab-pane name="find-us" :tab="$t('brand.findUs')">
        <n-card>
          <n-empty :description="$t('brand.findUsDeveloping')" size="large">
            <template #extra>
              <n-button type="primary" @click="handleComingSoon($t('brand.findUs'))">
                {{ $t('game.comingSoon') }}
              </n-button>
            </template>
          </n-empty>
        </n-card>
      </n-tab-pane>

      <n-tab-pane name="app-config" :tab="$t('brand.appConfig')">
        <n-card>
          <n-empty :description="$t('brand.appConfigDeveloping')" size="large">
            <template #extra>
              <n-button type="primary" @click="handleComingSoon($t('brand.appConfig'))">
                {{ $t('game.comingSoon') }}
              </n-button>
            </template>
          </n-empty>
        </n-card>
      </n-tab-pane>

      <n-tab-pane name="color-theme-demo" :tab="$t('brand.colorThemeDemo')">
        <ColorThemeDemo />
      </n-tab-pane>

      <n-tab-pane name="skin-language" :tab="$t('brand.skinLanguageConfig')">
        <n-card class="mb-4">
          <div class="flex flex-wrap gap-4 items-end">
            <div class="flex flex-col">
              <label class="mb-2 text-sm font-medium">{{ $t('brand.brandId') }}</label>
              <n-input
                v-model:value="skinLangFilters.brandId"
                :placeholder="$t('brand.enterBrandId')"
                clearable
                style="width: 140px"
                @keyup.enter="handleSkinLangFilter"
              />
            </div>

            <div class="flex flex-col">
              <label class="mb-2 text-sm font-medium">{{ $t('brand.brandName') }}</label>
              <n-input
                v-model:value="skinLangFilters.brandName"
                :placeholder="$t('brand.enterBrandName')"
                clearable
                style="width: 160px"
                @keyup.enter="handleSkinLangFilter"
              />
            </div>

            <div class="flex flex-col">
              <label class="mb-2 text-sm font-medium">{{ $t('brand.brandType') }}</label>
              <n-select
                v-model:value="skinLangFilters.brandType"
                :placeholder="$t('brand.selectBrandType')"
                clearable
                style="width: 140px"
                :options="brandTypeOptions"
                @update:value="handleSkinLangFilter"
              />
            </div>

            <div class="flex flex-col">
              <label class="mb-2 text-sm font-medium">{{ $t('brand.channelType') }}</label>
              <n-select
                v-model:value="skinLangFilters.channelType"
                :placeholder="$t('brand.selectChannelType')"
                clearable
                style="width: 140px"
                :options="channelTypeOptions"
                @update:value="handleSkinLangFilter"
              />
            </div>

            <div class="flex flex-col">
              <label class="mb-2 text-sm font-medium">{{ $t('brand.layoutStyle') }}</label>
              <n-select
                v-model:value="skinLangFilters.skinStyle"
                :placeholder="$t('brand.selectLayoutStyle')"
                clearable
                filterable
                style="width: 180px"
                :options="layoutStyleFilterOptions"
                @update:value="handleSkinLangFilter"
              />
            </div>

            <div class="flex gap-2">
              <n-button type="primary" @click="handleSkinLangFilter">
                {{ $t('common.search') }}
              </n-button>
              <n-button @click="resetSkinLangFilter">
                {{ $t('common.reset') }}
              </n-button>
            </div>
          </div>
        </n-card>

        <!-- 🚀 NEW: SmartDataGrid Component for Skin Language Config -->
        <SmartDataGrid
          :data="skinLangTableData"
          :columns="skinLangColumns"
          :loading="skinLangLoading"
          :pagination="skinLangPaginationReactive"
          row-key="id"
          @update:page="handleSkinLangPageChange"
          @update:page-size="handleSkinLangPageSizeChange"
          @refresh="handleSkinLangRefresh"
          @row-click="handleSkinLangRowClick"
        >
          <template #actionBar>
            <n-card :bordered="false" class="rounded-16px shadow-sm">
              <div class="flex justify-between items-center">
                <div class="flex items-center gap-4">
                  
                  <div class="flex gap-2">
                    <n-button type="primary" @click="handleSkinLangCreate">
                      {{ $t('brand.addConfig') }}
                    </n-button>
                  </div>
                  <div class="text-sm text-gray-600">
                    {{ $t('brand.totalRecords', [skinLangPaginationReactive.total]) }}
                  </div>
                </div>
              </div>
            </n-card>
          </template>
        </SmartDataGrid>

        <n-alert type="info" class="mt-3">
          {{ $t('brand.skinLangEditHint') }}
        </n-alert>
      </n-tab-pane>
    </n-tabs>

    <!-- Skin Language Editor Dialog -->
    <SkinLangEditor
      v-model:show="showSkinLangModal"
      :editing-item="editingSkinLangItem"
      :detail-mode="skinLangDetailMode"
      @submit="handleSkinLangSubmit"
    />

    <n-modal
      v-model:show="showModal"
      :title="editingItem ? $t('brand.editLogoSetting') : $t('brand.addLogoSetting')"
      preset="dialog"
      style="width: 800px"
      @after-leave="resetForm"
    >
      <n-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-placement="left"
        label-width="120"
      >
            <n-form-item :label="$t('brand.logoType')" path="logoType">
              <n-select
                v-model:value="formData.logoType"
                :placeholder="$t('brand.selectLogoType')"
                :options="logoTypeOptions"
              />
            </n-form-item>

            <n-form-item :label="$t('brand.brandNameSite')" path="brandName">
              <n-input v-model:value="formData.brandName" :placeholder="$t('brand.enterBrandNameMax30')" />
            </n-form-item>

            <n-form-item :label="$t('brand.webTitle')" path="webTitle">
              <n-input v-model:value="formData.webTitle" :placeholder="$t('brand.enterWebTitle')" />
            </n-form-item>

            <n-form-item :label="$t('brand.logoClickRedirect')" path="logoClickType">
              <div class="flex items-center gap-2">
                <n-select 
                  v-model:value="formData.logoClickType" 
                  :options="logoClickOptions"
                  style="width: 140px"
                />
                <n-input 
                  v-if="formData.logoClickType === 'custom'" 
                  v-model:value="formData.logoClickUrl" 
                  :placeholder="$t('brand.enterRedirectUrl')" 
                  style="flex:1"
                />
              </div>
            </n-form-item>
        
        <n-form-item :label="$t('brand.enableStatus')">
          <n-switch v-model:value="formData.isEnabled" />
        </n-form-item>

        <div class="image-upload-section">
          <h4 class="mb-4 text-base font-medium">{{ $t('brand.imageSettings') }}</h4>
          
          <div class="grid grid-cols-2 gap-4">
            <n-form-item :label="$t('brand.loadingSkeleton')">
              <MediaLibrarySelector 
                v-model="formData.skeletonImageFileUrl" 
                :accept-types="['image']"
                :placeholder="$t('brand.skeletonPlaceholder')"
              />
            </n-form-item>

            <n-form-item :label="$t('brand.lobbyLogo')">
              <MediaLibrarySelector 
                v-model="formData.lobbyLogoFileUrl" 
                :accept-types="['image']"
                :placeholder="$t('brand.lobbyLogoPlaceholder')"
              />
            </n-form-item>

            <n-form-item :label="$t('brand.webFavicon')">
              <MediaLibrarySelector 
                v-model="formData.webFaviconFileUrl" 
                :accept-types="['image']"
                :placeholder="$t('brand.webFaviconPlaceholder')"
              />
            </n-form-item>

            <n-form-item :label="$t('brand.webLogo')">
              <MediaLibrarySelector 
                v-model="formData.webLogoFileUrl" 
                :accept-types="['image']"
                :placeholder="$t('brand.webLogoPlaceholder')"
              />
            </n-form-item>
          </div>
        </div>

        <n-form-item :label="$t('brand.restrictedContent')" path="restrictedContent">
          <n-input
            v-model:value="formData.restrictedContent"
            type="textarea"
            :placeholder="$t('brand.enterRestrictedContent')"
            :rows="3"
          />
        </n-form-item>

        <n-form-item :label="$t('common.remark')" path="remark">
          <n-input
            v-model:value="formData.remark"
            type="textarea"
            :placeholder="$t('brand.enterRemarkInfo')"
            :rows="2"
          />
        </n-form-item>
      </n-form>
      
      <template #action>
        <div class="flex gap-2 justify-end">
          <n-button @click="showModal = false">{{ $t('common.cancel') }}</n-button>
          <n-button type="primary" @click="handleSubmit" :loading="submitting">
            {{ editingItem ? $t('common.save') : $t('common.create') }}
          </n-button>
        </div>
      </template>
    </n-modal>

    <n-modal
      v-model:show="showDetailModal"
      :title="$t('brand.logoSettingDetail')"
      preset="dialog"
      style="width: 900px"
    >
      <div v-if="detailData" class="detail-content">
        <div class="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label class="text-sm font-medium text-gray-600">{{ $t('brand.logoType') }}</label>
            <div class="mt-1">
              <n-tag :type="detailData.logoType === '自定义图片' ? 'primary' : 'default'">
                {{ getLogoTypeLabel(detailData.logoType) }}
              </n-tag>
            </div>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-600">{{ $t('brand.enableStatus') }}</label>
            <div class="mt-1">
              <n-tag :type="detailData.isEnabled ? 'success' : 'error'">
                {{ detailData.isEnabled ? $t('common.enabled') : $t('common.disabled') }}
              </n-tag>
            </div>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-600">{{ $t('common.operator') }}</label>
            <div class="mt-1">{{ detailData.operator }}</div>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-600">{{ $t('common.operationTime') }}</label>
            <div class="mt-1"><TzDateTime :value="detailData.updatedAt" /></div>
          </div>
        </div>

        <div class="mb-6">
          <h4 class="text-base font-medium mb-4">{{ $t('brand.imagePreview') }}</h4>
          <div class="grid grid-cols-3 gap-4">
            <div v-if="detailData.loginImage" class="text-center">
              <label class="text-sm font-medium text-gray-600">{{ $t('brand.loginPageImage') }}</label>
              <div class="mt-2">
                <n-image 
                  :src="getImageUrl(detailData.loginImage)" 
                  :alt="$t('brand.loginPageImage')"
                  width="120"
                  height="80"
                  object-fit="cover"
                  class="border rounded"
                />
              </div>
            </div>
            <div v-if="detailData.appStoreImage" class="text-center">
              <label class="text-sm font-medium text-gray-600">{{ $t('brand.appStoreIcon') }}</label>
              <div class="mt-2">
                <n-image 
                  :src="getImageUrl(detailData.appStoreImage)" 
                  :alt="$t('brand.appStoreIcon')"
                  width="60"
                  height="60"
                  object-fit="cover"
                  class="border rounded"
                />
              </div>
            </div>
            <div v-if="detailData.appInternalLogo" class="text-center">
              <label class="text-sm font-medium text-gray-600">{{ $t('brand.appInternalLogo') }}</label>
              <div class="mt-2">
                <n-image 
                  :src="getImageUrl(detailData.appInternalLogo)" 
                  :alt="$t('brand.appInternalLogo')"
                  width="100"
                  height: 40
                  object-fit="cover"
                  class="border rounded"
                />
              </div>
            </div>
            <div v-if="detailData.lobbyLogo" class="text-center">
              <label class="text-sm font-medium text-gray-600">{{ $t('brand.lobbyLogo') }}</label>
              <div class="mt-2">
                <n-image 
                  :src="getImageUrl(detailData.lobbyLogo)" 
                  :alt="$t('brand.lobbyLogo')"
                  width="80"
                  height="32"
                  object-fit="cover"
                  class="border rounded"
                />
              </div>
            </div>
            <div v-if="detailData.webFavicon" class="text-center">
              <label class="text-sm font-medium text-gray-600">{{ $t('brand.webFavicon') }}</label>
              <div class="mt-2">
                <n-image 
                  :src="getImageUrl(detailData.webFavicon)" 
                  :alt="$t('brand.webFavicon')"
                  width="32"
                  height="32"
                  object-fit="cover"
                  class="border rounded"
                />
              </div>
            </div>
            <div v-if="detailData.webLogo" class="text-center">
              <label class="text-sm font-medium text-gray-600">{{ $t('brand.webLogo') }}</label>
              <div class="mt-2">
                <n-image 
                  :src="getImageUrl(detailData.webLogo)" 
                  :alt="$t('brand.webLogo')"
                  width="80"
                  height="24"
                  object-fit="cover"
                  class="border rounded"
                />
              </div>
            </div>
          </div>
        </div>

        <div v-if="detailData.restrictedContent" class="mb-4">
          <label class="text-sm font-medium text-gray-600">{{ $t('brand.restrictedContent') }}</label>
          <div class="mt-1 p-3 bg-gray-50 rounded">{{ detailData.restrictedContent }}</div>
        </div>

        <div v-if="detailData.remark" class="mb-4">
          <label class="text-sm font-medium text-gray-600">{{ $t('common.remark') }}</label>
          <div class="mt-1 p-3 bg-gray-50 rounded">{{ detailData.remark }}</div>
        </div>
      </div>
      
      <template #action>
        <div class="flex gap-2 justify-end">
          <n-button @click="showDetailModal = false">{{ $t('common.close') }}</n-button>
        </div>
      </template>
    </n-modal>
  </Page>
</template>

<script setup lang="ts">
import { $t } from '@vben/locales';

import { ref, reactive, computed, onMounted, h, watch, defineAsyncComponent } from 'vue';
// ✅ PERFORMANCE FIX: Lazy load components to avoid blocking page load
const SmartDataGrid = defineAsyncComponent(() => import('../../components/smart/SmartDataGrid/index.vue'));
import { useRoute } from 'vue-router';
import type { FormInst, DataTableColumns, UploadFileInfo, FormRules } from 'naive-ui';
import {
  getBrandLogoSettings,
  getBrandLogoSettingById,
  createBrandLogoSetting,
  updateBrandLogoSetting,
  deleteBrandLogoSetting,
  toggleBrandLogoSetting,
  type BrandLogoSetting,
  type BrandLogoSettingCreateRequest
} from '#/api/brandLogo';
import { renderTzDateTime } from '#/components/common/tzDateTimeRender';
import TzDateTime from '#/components/common/TzDateTime.vue';
import {
  getBrandSkinLangConfigs,
  getBrandSkinLangConfigById,
  createBrandSkinLangConfig,
  updateBrandSkinLangConfig,
  deleteBrandSkinLangConfig,
  getLayoutStyleLabel,
  getSkinTemplateDisplayLabel,
  LAYOUT_STYLE_OPTIONS,
  type BrandSkinLangConfig,
  type BrandSkinLangFilters,
  type BrandSkinLangCreateRequest,
} from '#/api/skinLang';
import {
  NBreadcrumb,
  NBreadcrumbItem,
  NButton,
  NCard,
  NAlert,
  NDataTable,
  NEmpty,
  NForm,
  NFormItem,
  NInput,
  NModal,
  NSelect,
  NSwitch,
  NTag,
  NTabs,
  NTabPane,
  NUpload,
  NUploadDragger,
  NImage,
  NPopconfirm,
  type UploadCustomRequestOptions
} from 'naive-ui';
import { Page } from '@vben/common-ui';
import { notification } from '#/adapter/naive';
const SkinLangEditor = defineAsyncComponent(() => import('./components/SkinLangEditor.vue'));
const ColorThemeDemo = defineAsyncComponent(() => import('./components/ColorThemeDemo.vue'));
import { useSkinPreview, getSkinColorValues } from '../../composables/useSkinPreview';
import { useImagePreloader } from '../../composables/useImagePreloader';
import { useServiceWorker } from '../../composables/useServiceWorker';
import { useColorTheme, useSkinColorOptions } from '../../composables/useColorTheme';
import { getColorPaletteById, getPrimaryColorById } from '../../utils/colorUtils';
import { getImageUrl } from '../../utils/imageUtils';
const MediaLibrarySelector = defineAsyncComponent(() => import('../../components/MediaLibrarySelector.vue'));

const route = useRoute();
const { preloadTableImages } = useImagePreloader();
const { clearCache } = useServiceWorker();
const { getColorInfo, generateColorPreview, getPreviewStyles } = useColorTheme();
const { getSkinColorLabel } = useSkinColorOptions();

// Form data type
interface FormData extends BrandLogoSettingCreateRequest {
  id?: number;
}

// Reactive data
const tableRef = ref();
const formRef = ref<FormInst>();
const loading = ref(false);
const submitting = ref(false);
const showModal = ref(false);
const showDetailModal = ref(false);
const editingItem = ref<BrandLogoSetting | null>(null);
const detailData = ref<BrandLogoSetting | null>(null);

// Tab management
const activeTab = ref('logo-settings');

// Skin Language Settings Data
const skinLangTableRef = ref();
const skinLangLoading = ref(false);
const skinLangTableData = ref<BrandSkinLangConfig[]>([]);
const skinLangTotalCount = ref(0);
const skinLangCurrentPage = ref(1);
const skinLangCurrentPageSize = ref(10);
const showSkinLangModal = ref(false);
const editingSkinLangItem = ref<BrandSkinLangConfig | null>(null);

const skinLangDetailMode = ref(false);

// Skin Language Filters
const skinLangFilters = reactive({
  brandId: '',
  brandName: '',
  brandType: '',
  channelType: '',
  skinStyle: '',
  operator: '',
});

// Filters
const filters = reactive({
  logoType: '',
  isEnabled: undefined as boolean | undefined,
  operator: '',
});

// Form data
const formData = reactive<FormData>({
  logoType: '自定义图片',
  isEnabled: true,
  brandName: '',
  webTitle: '',
  logoClickType: 'homepage',
  logoClickUrl: '',
  loginImage: '',
  appStoreImage: '',
  appInternalLogo: '',
  lobbyLogo: '',
  webFavicon: '',
  webLogo: '',
  loginImageFileUrl: '',
  appStoreImageFileUrl: '',
  appInternalLogoFileUrl: '',
  lobbyLogoFileUrl: '',
  webFaviconFileUrl: '',
  webLogoFileUrl: '',
  skeletonImageFileUrl: '',
  restrictedContent: '',
  remark: '',
  operator: '当前用户',
});

// Image previews
const loginImagePreview = ref('');
const appStoreImagePreview = ref('');
const appInternalLogoPreview = ref('');
const lobbyLogoPreview = ref('');
const webFaviconPreview = ref('');
const webLogoPreview = ref('');

// Image upload handlers
const handleLoginImageChange = (options: { fileList: UploadFileInfo[] }) => {
  const file = options.fileList[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      loginImagePreview.value = e.target?.result as string;
      formData.loginImage = e.target?.result as string;
    };
    reader.readAsDataURL(file.file as File);
  }
};

const handleAppStoreImageChange = (options: { fileList: UploadFileInfo[] }) => {
  const file = options.fileList[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      appStoreImagePreview.value = e.target?.result as string;
      formData.appStoreImage = e.target?.result as string;
    };
    reader.readAsDataURL(file.file as File);
  }
};

const handleAppInternalLogoChange = (options: { fileList: UploadFileInfo[] }) => {
  const file = options.fileList[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      appInternalLogoPreview.value = e.target?.result as string;
      formData.appInternalLogo = e.target?.result as string;
    };
    reader.readAsDataURL(file.file as File);
  }
};

const handleLobbyLogoChange = (options: { fileList: UploadFileInfo[] }) => {
  const file = options.fileList[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      lobbyLogoPreview.value = e.target?.result as string;
      formData.lobbyLogo = e.target?.result as string;
    };
    reader.readAsDataURL(file.file as File);
  }
};

const handleWebFaviconChange = (options: { fileList: UploadFileInfo[] }) => {
  const file = options.fileList[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      webFaviconPreview.value = e.target?.result as string;
      formData.webFavicon = e.target?.result as string;
    };
    reader.readAsDataURL(file.file as File);
  }
};

const handleWebLogoChange = (options: { fileList: UploadFileInfo[] }) => {
  const file = options.fileList[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      webLogoPreview.value = e.target?.result as string;
      formData.webLogo = e.target?.result as string;
    };
    reader.readAsDataURL(file.file as File);
  }
};

// Clear image functions
const clearLoginImage = () => {
  loginImagePreview.value = '';
  formData.loginImage = '';
};

const clearAppStoreImage = () => {
  appStoreImagePreview.value = '';
  formData.appStoreImage = '';
};

const clearAppInternalLogo = () => {
  appInternalLogoPreview.value = '';
  formData.appInternalLogo = '';
};

const clearLobbyLogo = () => {
  lobbyLogoPreview.value = '';
  formData.lobbyLogo = '';
};

const clearWebFavicon = () => {
  webFaviconPreview.value = '';
  formData.webFavicon = '';
};

const clearWebLogo = () => {
  webLogoPreview.value = '';
  formData.webLogo = '';
};

// Options
const logoTypeOptions = computed(() => [
  { label: $t('brand.logoTypeSkeleton'), value: '加载骨架屏' },
  { label: $t('brand.logoTypeIcon'), value: '图标' },
  { label: $t('brand.logoTypeCustomText'), value: '自定义文字' },
  { label: $t('brand.logoTypeCustomImage'), value: '自定义图片' },
]);

const statusOptions = computed(() => [
  { label: $t('common.enabled'), value: true },
  { label: $t('common.disabled'), value: false },
]);

const brandTypeOptions = computed(() => [
  { label: $t('brand.brandTypeMainSite'), value: '主站点' },
  { label: $t('brand.brandTypeSubSite'), value: '子站点' },
]);

const channelTypeOptions = computed(() => [
  { label: $t('brand.channelTypeGeneral'), value: '通用' },
  { label: $t('brand.channelTypeMobile'), value: '移动端' },
  { label: $t('brand.channelTypeDesktop'), value: '桌面端' },
]);

const layoutStyleFilterOptions = computed(() => LAYOUT_STYLE_OPTIONS);

const logoClickOptions = computed(() => [
  { label: $t('brand.homepage'), value: 'homepage' },
  { label: $t('common.custom'), value: 'custom' },
]);

function getLogoTypeLabel(type: string) {
  return logoTypeOptions.value.find((o) => o.value === type)?.label ?? type;
}

const formRules = computed<FormRules>(() => ({
  logoType: [
    { required: true, message: $t('brand.selectLogoTypeRequired'), trigger: 'change' }
  ],
}));

const tableData = ref<BrandLogoSetting[]>([]);
const totalCount = ref(0);
const currentPage = ref(1);
const currentPageSize = ref(10);

// Pagination (simplified for SmartDataGrid)
const paginationReactive = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
});

// Skin Language Pagination (simplified for SmartDataGrid)
const skinLangPaginationReactive = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
});

// Table columns
const columns = computed<DataTableColumns<BrandLogoSetting>>(() => [
  {
    title: $t('brand.logoType'),
    key: 'logoType',
    width: 120,
    render(row) {
      return h(NTag, {
        type: row.logoType === '自定义图片' ? 'primary' : 'default',
        size: 'small'
      }, { default: () => row.logoType });
    },
  },
  {
    title: $t('brand.manageSwitch'),
    key: 'isEnabled',
    width: 100,
    render(row) {
      return h(NSwitch, {
        value: row.isEnabled,
        onUpdateValue: (value) => handleToggle(row, value)
      });
    },
  },
  {
    title: $t('brand.loginPageImageEntry'),
    key: 'loginImage',
    width: 140,
    render(row) {
      if (row.loginImage) {
        return h('div', { class: 'image-container' }, [
          h(NImage, {
            src: getImageUrl(row.loginImage),
            alt: $t('brand.loginPageImage'),
            width: 60,
            height: 40,
            objectFit: 'cover',
            class: 'table-image'
          })
        ]);
      }
      return h('span', { class: 'text-gray-400' }, $t('brand.noImage'));
    },
  },
  {
    title: $t('brand.appStoreIcon'),
    key: 'appStoreImage',
    width: 120,
    render(row) {
      if (row.appStoreImage) {
        return h('div', { class: 'image-container' }, [
          h(NImage, {
            src: getImageUrl(row.appStoreImage),
            alt: $t('brand.appStoreIcon'),
            width: 35,
            height: 35,
            objectFit: 'cover',
            class: 'table-image'
          })
        ]);
      }
      return h('span', { class: 'text-gray-400' }, $t('brand.noImage'));
    },
  },
  {
    title: $t('brand.appInternalLogo'),
    key: 'appInternalLogo',
    width: 120,
    render(row) {
      if (row.appInternalLogo) {
        return h('div', { class: 'image-container' }, [
          h(NImage, {
            src: getImageUrl(row.appInternalLogo),
            alt: $t('brand.appInternalLogo'),
            width: 50,
            height: 20,
            objectFit: 'cover',
            class: 'table-image'
          })
        ]);
      }
      return h('span', { class: 'text-gray-400' }, $t('brand.noImage'));
    },
  },
  {
    title: $t('brand.lobbyLogo'),
    key: 'lobbyLogo',
    width: 100,
    render(row) {
      if (row.lobbyLogo) {
        return h('div', { class: 'image-container' }, [
          h(NImage, {
            src: getImageUrl(row.lobbyLogo),
            alt: $t('brand.lobbyLogo'),
            width: 40,
            height: 16,
            objectFit: 'cover',
            class: 'table-image'
          })
        ]);
      }
      return h('span', { class: 'text-gray-400' }, $t('brand.noImage'));
    },
  },
  {
    title: $t('brand.webFavicon'),
    key: 'webFavicon',
    width: 100,
    render(row) {
      if (row.webFavicon) {
        return h('div', { class: 'image-container' }, [
          h(NImage, {
            src: getImageUrl(row.webFavicon),
            alt: $t('brand.webFavicon'),
            width: 20,
            height: 20,
            objectFit: 'cover',
            class: 'table-image'
          })
        ]);
      }
      return h('span', { class: 'text-gray-400' }, $t('brand.noImage'));
    },
  },
  {
    title: $t('brand.webLogo'),
    key: 'webLogo',
    width: 100,
    render(row) {
      if (row.webLogo) {
        return h('div', { class: 'image-container' }, [
          h(NImage, {
            src: getImageUrl(row.webLogo),
            alt: $t('brand.webLogo'),
            width: 40,
            height: 12,
            objectFit: 'cover',
            class: 'table-image'
          })
        ]);
      }
      return h('span', { class: 'text-gray-400' }, $t('brand.noImage'));
    },
  },
  {
    title: $t('brand.restrictedPageContent'),
    key: 'restrictedContent',
    width: 200,
    ellipsis: {
      tooltip: true,
    },
  },
  {
    title: $t('brand.backendRemark'),
    key: 'remark',
    width: 150,
    ellipsis: {
      tooltip: true,
    },
  },
  {
    title: $t('common.operator'),
    key: 'operator',
    width: 100,
  },
  {
    title: $t('common.operationTime'),
    key: 'updatedAt',
    width: 160,
    render(row) {
      return renderTzDateTime(row.updatedAt);
    },
  },
  {
    title: $t('common.actions'),
    key: 'actions',
    fixed: 'right',
    width: 160,
    render(row) {
      return h('div', { class: 'flex gap-2' }, [
        h(NButton, {
          size: 'small',
          quaternary: true,
          type: 'primary',
          onClick: () => handleEdit(row)
        }, { default: () => $t('common.edit') }),
        h(NButton, {
          size: 'small',
          quaternary: true,
          type: 'info',
          onClick: () => handleViewDetail(row)
        }, { default: () => $t('common.detail') }),
        h(NPopconfirm, { onPositiveClick: () => handleDelete(row) }, {
          trigger: () => h(NButton, {
            size: 'small',
            quaternary: true,
            type: 'error'
          }, { default: () => $t('common.delete') }),
          default: () => $t('brand.confirmDeleteSetting'),
        }),
      ]);
    },
  },
]);

// Skin Language Table Columns
const skinLangColumns = computed<DataTableColumns<BrandSkinLangConfig>>(() => [
  {
    title: $t('brand.brandId'),
    key: 'brandId',
    width: 100,
    sorter: true,
    render(row) {
      return h('span', { style: { fontFamily: 'monospace' } }, row.brandId);
    },
  },
  {
    title: $t('brand.brandName'),
    key: 'brandName',
    width: 140,
    render(row) {
      return h('span', { class: 'font-medium' }, row.brandName);
    },
  },
  {
    title: $t('brand.brandType'),
    key: 'brandType',
    width: 100,
    render(row) {
      return h(NTag, {
        type: row.brandType === '主站点' ? 'primary' : 'info',
        size: 'small'
      }, { default: () => row.brandType });
    },
  },
  {
    title: $t('brand.channelType'),
    key: 'channelType',
    width: 100,
    render(row) {
      return h(NTag, {
        type: 'default',
        size: 'small'
      }, { default: () => row.channelType });
    },
  },
  {
    title: $t('brand.layoutStyle'),
    key: 'skinStyle',
    width: 120,
    render(row) {
      return h(NTag, {
        type: 'warning',
        size: 'small'
      }, { default: () => getLayoutStyleLabel(row.skinStyle, row.skinTemplate) });
    },
  },
  {
    title: $t('brand.templateBaseColor'),
    key: 'gameColor',
    width: 100,
    render(row) {
      return h('span', row.gameColor);
    },
  },
  {
    title: $t('brand.skinColor'),
    key: 'skinColor',
    width: 200,
    render(row) {
      if (!row.skinColor) {
        return h('span', { class: 'text-gray-400' }, '-');
      }
      
      const colorInfo = getColorInfo(row.skinColor);
      const previewStyles = getPreviewStyles(row.skinColor);
      
             return h('div', { class: 'flex items-center gap-2' }, [
         // Color palette preview
         h('div', { 
           class: 'color-preview-container',
           onClick: () => previewColorTheme(row.skinColor)
         }, [
           h('div', { 
             class: 'color-swatch primary',
             style: { backgroundColor: colorInfo.palette.primary },
             title: `${$t('brand.primaryColorLabel')}: ${colorInfo.palette.primary} - ${$t('brand.clickToPreview')}`
           }),
           h('div', { 
             class: 'color-swatch secondary',
             style: { backgroundColor: colorInfo.palette.secondary },
             title: `${$t('brand.secondaryColorLabel')}: ${colorInfo.palette.secondary} - ${$t('brand.clickToPreview')}`
           }),
           h('div', { 
             class: 'color-swatch accent',
             style: { backgroundColor: colorInfo.palette.accent },
             title: `${$t('brand.accentColorLabel')}: ${colorInfo.palette.accent} - ${$t('brand.clickToPreview')}`
           }),
         ]),
         // Color label
         h('div', { class: 'color-label' }, [
           h(NTag, {
             type: 'primary',
             size: 'small'
           }, { default: () => colorInfo.label })
         ])
       ]);
    },
  },
  {
    title: $t('brand.skinTemplate'),
    key: 'skinTemplate',
    width: 120,
    render(row) {
      return h(
        'span',
        { class: 'font-medium' },
        getSkinTemplateDisplayLabel(row.skinTemplate, row.skinStyle),
      );
    },
  },
  {
    title: $t('brand.clientLanguages'),
    key: 'clientLanguages',
    width: 200,
    render(row) {
      return h('div', { class: 'flex flex-wrap gap-1' }, 
        row.clientLanguages.map(lang => 
          h(NTag, {
            type: 'success',
            size: 'small',
            key: lang
          }, { default: () => lang })
        )
      );
    },
  },
  {
    title: $t('common.createTime'),
    key: 'createdAt',
    width: 160,
    sorter: true,
    render(row) {
      return renderTzDateTime(row.createdAt);
    },
  },
  {
    title: $t('common.operator'),
    key: 'operator',
    width: 100,
    render(row) {
      return h('span', { style: { fontFamily: 'monospace' } }, row.operator);
    },
  },
  {
    title: $t('common.operationTime'),
    key: 'updatedAt',
    width: 160,
    sorter: true,
    render(row) {
      return renderTzDateTime(row.updatedAt);
    },
  },
  {
    title: $t('common.actions'),
    key: 'actions',
    fixed: 'right',
    width: 120,
    render(row) {
      return h('div', { class: 'flex gap-2' }, [
        h(NButton, {
          size: 'small',
          quaternary: true,
          type: 'info',
          onClick: () => handleSkinLangViewDetail(row)
        }, { default: () => $t('common.detail') }),
        h(NButton, {
          size: 'small',
          quaternary: true,
          type: 'primary',
          onClick: () => handleSkinLangEdit(row)
        }, { default: () => $t('common.modify') }),
      ]);
    },
  },
]);


const handleTabChange = (value: string) => {
  if (value === 'logo-settings') {
    loadData();
  } else if (value === 'skin-language') {
    loadSkinLangData();
  }
};

const handleComingSoon = (featureName: string) => {
  notification.info({
    content: $t('brand.comingSoonMessage', [featureName]),
    duration: 3000
  });
};

const loadData = async () => {
  loading.value = true;
  try {
    const params = {
      page: paginationReactive.page,
      pageSize: paginationReactive.pageSize,
      logoType: filters.logoType || undefined,
      isEnabled: filters.isEnabled,
      operator: filters.operator || undefined,
    };

    const response = await getBrandLogoSettings(params);
    
    // The response interceptor returns the whole object for {success: true, data: [...], pagination: {...}}
    if (response && typeof response === 'object') {
      if (response.data && Array.isArray(response.data)) {
        // Expected format: {data: [...], pagination: {...}}
        tableData.value = response.data;
        if (response.pagination) {
          paginationReactive.total = response.pagination.total;
          paginationReactive.page = response.pagination.page;
          paginationReactive.pageSize = response.pagination.pageSize;
        }
      } else if (Array.isArray(response)) {
        // Fallback: direct array response
        tableData.value = response;
        totalCount.value = response.length;
      } else {
        throw new Error($t('brand.invalidResponseDataNotArray'));
      }
            } else {
          throw new Error($t('brand.invalidResponseFormat'));
        }
        
        // Preload table images for faster display
        if (tableData.value.length > 0) {
          preloadTableImages(tableData.value).catch(error => {
            console.warn('Failed to preload table images:', error);
          });
        }
      } catch (error) {
        console.error('Error loading brand logo settings:', error);
    notification.error({
      content: error instanceof Error ? error.message : $t('brand.loadDataFailed'),
      duration: 3000
    });
  } finally {
    loading.value = false;
  }
};

const loadSkinLangData = async () => {
  skinLangLoading.value = true;
  try {
    const params = {
      page: skinLangPaginationReactive.page,
      pageSize: skinLangPaginationReactive.pageSize,
      brandId: skinLangFilters.brandId || undefined,
      brandName: skinLangFilters.brandName || undefined,
      brandType: skinLangFilters.brandType || undefined,
      channelType: skinLangFilters.channelType || undefined,
      skinStyle: skinLangFilters.skinStyle || undefined,
      operator: skinLangFilters.operator || undefined,
    };

    const response = await getBrandSkinLangConfigs(params);
    
    if (response && typeof response === 'object') {
      if (response.data && Array.isArray(response.data)) {
        skinLangTableData.value = response.data;
        if (response.pagination) {
          skinLangPaginationReactive.total = response.pagination.total;
          skinLangPaginationReactive.page = response.pagination.page;
          skinLangPaginationReactive.pageSize = response.pagination.pageSize;
        }
      } else if (Array.isArray(response)) {
        skinLangTableData.value = response;
        skinLangTotalCount.value = response.length;
      } else {
        throw new Error($t('brand.invalidResponseDataNotArray'));
      }
    } else {
      throw new Error($t('brand.invalidResponseFormat'));
    }
  } catch (error) {
    console.error('Error loading skin lang configs:', error);
    notification.error({
      content: error instanceof Error ? error.message : $t('brand.loadSkinLangFailed'),
      duration: 3000
    });
  } finally {
    skinLangLoading.value = false;
  }
};

const handleFilter = () => {
  paginationReactive.page = 1; // Reset to first page when filtering
  loadData();
};

const resetFilter = () => {
  Object.assign(filters, {
    logoType: '',
    isEnabled: undefined,
    operator: '',
  });
  currentPage.value = 1;
  loadData();
};

const handleSkinLangFilter = () => {
  skinLangPaginationReactive.page = 1; // Reset to first page when filtering
  loadSkinLangData();
};

const resetSkinLangFilter = () => {
  Object.assign(skinLangFilters, {
    skinName: '',
    language: '',
    isActive: undefined,
  });
  skinLangPaginationReactive.page = 1;
  loadSkinLangData();
};

const handleSkinLangCreate = () => {
  skinLangDetailMode.value = false;
  editingSkinLangItem.value = null;
  showSkinLangModal.value = true;
};

const handleSkinLangRefresh = () => {
  loadSkinLangData();
};

const handleSkinLangViewDetail = (row: BrandSkinLangConfig) => {
  editingSkinLangItem.value = { ...row };
  skinLangDetailMode.value = true;
  showSkinLangModal.value = true;
};

const handleSkinLangEdit = (row: BrandSkinLangConfig) => {
  skinLangDetailMode.value = false;
  editingSkinLangItem.value = { ...row };
  showSkinLangModal.value = true;
};


watch(showSkinLangModal, (visible) => {
  if (!visible) skinLangDetailMode.value = false;
});

const handleSkinLangSubmit = async (data: BrandSkinLangCreateRequest) => {
  try {
    if (editingSkinLangItem.value?.id) {
      // Update existing skin lang config
      await updateBrandSkinLangConfig(editingSkinLangItem.value.id, data);
      notification.success({ content: $t('brand.skinLangUpdateSuccess') });
    } else {
      await createBrandSkinLangConfig(data);
      notification.success({ content: $t('brand.skinLangCreateSuccess') });
    }
    
    showSkinLangModal.value = false;
    editingSkinLangItem.value = null;
    skinLangDetailMode.value = false;
    loadSkinLangData(); // Refresh the data
  } catch (error) {
    console.error('Error submitting skin lang config:', error);
    notification.error({
      content: error instanceof Error ? error.message : $t('brand.operationRetry')
    });
  }
};

const handleRefresh = () => {
  loadData();
};

// Clear image cache when needed
const handleClearCache = async () => {
  try {
    await clearCache();
    notification.success({
      content: $t('brand.imageCacheCleared'),
      duration: 3000
    });
  } catch (error) {
    console.error('Failed to clear cache:', error);
    notification.error({
      content: $t('brand.clearCacheFailed'),
      duration: 3000
    });
  }
};

const handleCreate = () => {
  editingItem.value = null;
  resetForm();
  showModal.value = true;
};

const handleEdit = (row: BrandLogoSetting) => {
  editingItem.value = row;
  Object.assign(formData, row);
  showModal.value = true;
};

const handleViewDetail = (row: BrandLogoSetting) => {
  detailData.value = row;
  showDetailModal.value = true;
};

const handleDelete = async (row: BrandLogoSetting) => {
  try {
    const response = await deleteBrandLogoSetting(row.id);
    
    // Handle the response from the interceptor
    // For successful operations, the interceptor handles the response extraction
    notification.success({
      content: $t('common.deleteSuccess'),
      duration: 3000
    });
    loadData(); // Reload data after deletion
  } catch (error) {
    console.error('Error deleting brand logo setting:', error);
    notification.error({
      content: error instanceof Error ? error.message : $t('common.operationFailed'),
      duration: 3000
    });
  }
};

const handleToggle = async (row: BrandLogoSetting, value: boolean) => {
  try {
    const response = await toggleBrandLogoSetting(row.id, value);
    
    // Handle the response from the interceptor
    row.isEnabled = value;
    // Update timestamp if available
    if (response && response.updatedAt) {
      row.updatedAt = response.updatedAt;
    }
    notification.success({
      content: value ? $t('brand.enableSuccess') : $t('brand.disableSuccess'),
      duration: 3000
    });
  } catch (error) {
    console.error('Error toggling brand logo setting:', error);
    notification.error({
      content: error instanceof Error ? error.message : $t('common.operationFailed'),
      duration: 3000
    });
  }
};

const handleSubmit = async () => {
  if (!formRef.value) return;
  
  try {
    await formRef.value.validate();
    submitting.value = true;
    
    const submitData = {
      logoType: formData.logoType,
      isEnabled: formData.isEnabled,
      brandName: formData.brandName,
      webTitle: formData.webTitle,
      logoClickType: formData.logoClickType,
      logoClickUrl: formData.logoClickUrl,
      enableSkeleton: formData.enableSkeleton,
      loginImage: formData.loginImage,
      appStoreImage: formData.appStoreImage,
      appInternalLogo: formData.appInternalLogo,
      lobbyLogo: formData.lobbyLogo,
      webFavicon: formData.webFavicon,
      webLogo: formData.webLogo,
      // Preferred Media Library URLs
      loginImageFileUrl: formData.loginImageFileUrl,
      appStoreImageFileUrl: formData.appStoreImageFileUrl,
      appInternalLogoFileUrl: formData.appInternalLogoFileUrl,
      lobbyLogoFileUrl: formData.lobbyLogoFileUrl,
      webFaviconFileUrl: formData.webFaviconFileUrl,
      webLogoFileUrl: formData.webLogoFileUrl,
      skeletonImageFileUrl: formData.skeletonImageFileUrl,
      restrictedContent: formData.restrictedContent,
      remark: formData.remark,
      operator: formData.operator || '当前用户',
    };
    
    let response;
    if (editingItem.value) {
      response = await updateBrandLogoSetting(editingItem.value.id, submitData);
    } else {
      response = await createBrandLogoSetting(submitData);
    }
    
    // Handle the response from the interceptor
    notification.success({
      content: editingItem.value ? $t('common.saveSuccess') : $t('common.operationSuccess'),
      duration: 3000
    });
    showModal.value = false;
    loadData(); // Reload data after create/update
  } catch (error) {
    console.error('Error submitting brand logo setting:', error);
    notification.error({
      content: error instanceof Error ? error.message : $t('brand.submitFailed'),
      duration: 3000
    });
  } finally {
    submitting.value = false;
  }
};

const handleDownloadTemplate = () => {
  const link = document.createElement('a');
  link.href = `data:text/plain;charset=utf-8,${encodeURIComponent($t('brand.logoTemplateFile'))}`;
  link.download = 'brand-logo-template.psd';
  link.click();
  notification.success({
    content: $t('brand.templateDownloading'),
    duration: 3000
  });
};

const resetForm = () => {
  Object.assign(formData, {
    logoType: '自定义图片',
    isEnabled: true,
    brandName: '',
    webTitle: '',
    logoClickType: 'homepage',
    logoClickUrl: '',
    loginImage: '',
    appStoreImage: '',
    appInternalLogo: '',
    lobbyLogo: '',
    webFavicon: '',
    webLogo: '',
    loginImageFileUrl: '',
    appStoreImageFileUrl: '',
    appInternalLogoFileUrl: '',
    lobbyLogoFileUrl: '',
    webFaviconFileUrl: '',
    webLogoFileUrl: '',
    restrictedContent: '',
    remark: '',
    operator: '当前用户',
  });
  
  // Clear previews
  loginImagePreview.value = '';
  appStoreImagePreview.value = '';
  appInternalLogoPreview.value = '';
  lobbyLogoPreview.value = '';
  webFaviconPreview.value = '';
  webLogoPreview.value = '';
};

const handlePageChange = (page: number) => {
  paginationReactive.page = page;
  loadData();
};

const handlePageSizeChange = (pageSize: number) => {
  paginationReactive.pageSize = pageSize;
  paginationReactive.page = 1; // Reset to first page when changing page size
  loadData();
};

// SmartDataGrid event handlers for LOGO Settings
const handleRowClick = (logoSetting: BrandLogoSetting) => {
  console.log('Logo setting row clicked:', logoSetting);
  // Optional: Auto-open edit modal on row click
  handleEdit(logoSetting);
};

// SmartDataGrid event handlers for Skin Language Config
const handleSkinLangRowClick = (skinLangConfig: BrandSkinLangConfig) => {
  console.log('Skin language config row clicked:', skinLangConfig);
  // Optional: Auto-open edit modal on row click
  handleSkinLangEdit(skinLangConfig);
};

const handleSkinLangPageChange = (page: number) => {
  skinLangPaginationReactive.page = page;
  loadSkinLangData();
};

const handleSkinLangPageSizeChange = (pageSize: number) => {
  skinLangPaginationReactive.pageSize = pageSize;
  skinLangPaginationReactive.page = 1;
  loadSkinLangData();
};

// Color Theme Helper Methods
const previewColorTheme = (skinColorId: string) => {
  if (!skinColorId) return;
  
  const colorInfo = getColorInfo(skinColorId);
  
  notification.info({
    content: $t('brand.previewTheme', [colorInfo.label]),
    meta: `${$t('brand.primaryColorLabel')}: ${colorInfo.palette.primary} | ${$t('brand.secondaryColorLabel')}: ${colorInfo.palette.secondary} | ${$t('brand.accentColorLabel')}: ${colorInfo.palette.accent}`,
    duration: 5000
  });
};

const applyBrandColorTheme = (content: string, skinColorId: string): string => {
  const palette = getColorPaletteById(skinColorId);
  
  return content
    .replace(/bg-\[#D86682\]/g, `bg-[${palette.primary}]`)
    .replace(/bg-\[#CC5477\]/g, `bg-[${palette.secondary}]`)
    .replace(/bg-\[#E06F8B\]/g, `bg-[${palette.accent}]`)
    .replace(/text-\[#D86682\]/g, `text-[${palette.textPrimary}]`)
    .replace(/text-\[#CC5477\]/g, `text-[${palette.textSecondary}]`)
    .replace(/text-\[#E06F8B\]/g, `text-[${palette.textAccent}]`)
    .replace(/border-\[#D86682\]/g, `border-[${palette.primary}]`)
    .replace(/border-\[#CC5477\]/g, `border-[${palette.secondary}]`)
    .replace(/border-\[#E06F8B\]/g, `border-[${palette.accent}]`)
    .replace(/bg-\[#3B82F6\]/g, `bg-[${palette.buttonColor}]`);
};

// Lifecycle
onMounted(() => {
  // Initialize tab from URL query parameter
  const tab = route.query.tab as string;
  if (tab && ['logo-settings', 'website-info', 'about-us', 'footer-config', 'official-channels', 'find-us', 'app-config', 'color-theme-demo', 'skin-language'].includes(tab)) {
    activeTab.value = tab;
  }
  
  // Load data based on active tab
  if (activeTab.value === 'logo-settings') {
    loadData();
  } else if (activeTab.value === 'skin-language') {
    loadSkinLangData();
  }
});
</script>

<style scoped>
/* Following game-management styling patterns */
.mb-4 {
  margin-bottom: 1rem;
}

.flex {
  display: flex;
}

.flex-wrap {
  flex-wrap: wrap;
}

.flex-col {
  flex-direction: column;
}

.gap-2 {
  gap: 0.5rem;
}

.gap-4 {
  gap: 1rem;
}

.items-end {
  align-items: flex-end;
}

.items-center {
  align-items: center;
}

.justify-between {
  justify-content: space-between;
}

.justify-end {
  justify-content: flex-end;
}

.text-sm {
  font-size: 0.875rem;
}

.font-medium {
  font-weight: 500;
}

.text-gray-400 {
  color: #9ca3af;
}

.text-gray-600 {
  color: #4b5563;
}

.grid {
  display: grid;
}

.grid-cols-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.grid-cols-3 {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

/* Image upload styling */
.image-upload-section {
  margin: 16px 0;
}

.upload-container {
  width: 100%;
}

.upload-area {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 120px;
  padding: 20px;
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.3s ease;
}

.upload-area:hover {
  border-color: #40a9ff;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.upload-icon {
  font-size: 32px;
  opacity: 0.6;
}

.upload-text {
  font-size: 14px;
  font-weight: 500;
  color: #666;
}

.upload-hint {
  font-size: 12px;
  color: #999;
}

.image-preview {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.preview-image-container {
  position: relative;
  overflow: hidden;
  border-radius: 4px;
}

.preview-image {
  border-radius: 4px;
  border: 1px solid #e0e0e0;
}

.image-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  background: rgb(0 0 0 / 50%);
  transition: opacity 0.3s;
}

.image-preview:hover .image-overlay {
  opacity: 1;
}

/* Table image styling */
.image-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.table-image {
  border-radius: 4px;
  border: 1px solid #e0e0e0;
}

/* Detail content styling */
.detail-content {
  padding: 16px 0;
}

.bg-gray-50 {
  background-color: #f9fafb;
}

.rounded {
  border-radius: 0.375rem;
}

.border {
  border: 1px solid #e5e7eb;
}

.text-center {
  text-align: center;
}

.mt-1 {
  margin-top: 0.25rem;
}

.mt-2 {
  margin-top: 0.5rem;
}

.p-3 {
  padding: 0.75rem;
}

.text-base {
  font-size: 1rem;
}

.mb-6 {
  margin-bottom: 1.5rem;
}

/* Empty state styling */
:deep(.n-empty) {
  padding: 48px 0;
}

:deep(.n-empty .n-empty__description) {
  margin-bottom: 16px;
  font-size: 16px;
  color: #6b7280;
}

:deep(.n-empty .n-empty__extra) {
  margin-top: 16px;
}

/* Color preview styling */
.color-preview-container {
  display: flex;
  gap: 2px;
  align-items: center;
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.color-preview-container:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.color-swatch {
  width: 16px;
  height: 16px;
  border-radius: 2px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s ease;
}

.color-swatch:hover {
  transform: scale(1.2);
  z-index: 10;
  position: relative;
}

.color-swatch.primary {
  border-width: 2px;
  border-color: rgba(0, 0, 0, 0.2);
}

.color-label {
  flex: 1;
  min-width: 0;
}

.items-center {
  align-items: center;
}

.gap-2 {
  gap: 0.5rem;
}
</style> 