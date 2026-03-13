<template>
  <Page title="品牌LOGO设置" description="品牌标识和图片资源管理">
    <!-- 面包屑导航 -->
    <div class="mb-4">
      <n-breadcrumb>
        <n-breadcrumb-item>品牌管理</n-breadcrumb-item>
        <n-breadcrumb-item>品牌LOGO设置</n-breadcrumb-item>
      </n-breadcrumb>
    </div>

    <!-- 主要内容区域 -->
    <n-tabs 
      v-model:value="activeTab" 
      type="line" 
      animated
      @update:value="handleTabChange"
    >
      <!-- LOGO及图片设置 -->
      <n-tab-pane name="logo-settings" tab="LOGO及图片设置">
        <!-- 筛选器区域 -->
        <n-card class="mb-4">
          <div class="flex flex-wrap gap-4 items-end">
            <!-- LOGO类型筛选 -->
            <div class="flex flex-col">
              <label class="mb-2 text-sm font-medium">LOGO类型</label>
              <n-select
                v-model:value="filters.logoType"
                placeholder="选择LOGO类型"
                clearable
                style="width: 160px"
                :options="logoTypeOptions"
                @update:value="handleFilter"
              />
            </div>

            <!-- 启用状态筛选 -->
            <div class="flex flex-col">
              <label class="mb-2 text-sm font-medium">启用状态</label>
              <n-select
                v-model:value="filters.isEnabled"
                placeholder="选择状态"
                clearable
                style="width: 140px"
                :options="statusOptions"
                @update:value="handleFilter"
              />
            </div>

            <!-- 操作人筛选 -->
            <div class="flex flex-col">
              <label class="mb-2 text-sm font-medium">操作人</label>
              <n-input
                v-model:value="filters.operator"
                placeholder="输入操作人"
                clearable
                style="width: 140px"
                @keyup.enter="handleFilter"
              />
            </div>

            <!-- 搜索按钮 -->
            <div class="flex gap-2">
              <n-button type="primary" @click="handleFilter">
                搜索
              </n-button>
              <n-button @click="resetFilter">
                重置
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
                  <!-- 主要操作按钮 -->
                  <div class="flex gap-2">
                    <n-button type="primary" @click="handleCreate">
                      新增设置
                    </n-button>
                    <n-button @click="handleDownloadTemplate">
                      下载模板
                    </n-button>
                    <n-button @click="handleClearCache">
                      清除缓存
                    </n-button>
                  </div>
                  
                  <!-- 选择信息 -->
                  <div class="text-sm text-gray-600">
                    共 {{ paginationReactive.total }} 条记录
                  </div>
                </div>
              </div>
            </n-card>
          </template>
        </SmartDataGrid>
      </n-tab-pane>

      <!-- 网页信息（含SEO） -->
      <n-tab-pane name="website-info" tab="网页信息（含SEO）">
        <n-card>
          <n-empty description="网页信息（含SEO）功能开发中..." size="large">
            <template #extra>
              <n-button type="primary" @click="handleComingSoon('网页信息（含SEO）')">
                敬请期待
              </n-button>
            </template>
          </n-empty>
        </n-card>
      </n-tab-pane>

      <!-- 关于我们 -->
      <n-tab-pane name="about-us" tab="关于我们">
        <n-card>
          <n-empty description="关于我们功能开发中..." size="large">
            <template #extra>
              <n-button type="primary" @click="handleComingSoon('关于我们')">
                敬请期待
              </n-button>
            </template>
          </n-empty>
        </n-card>
      </n-tab-pane>

      <!-- 页脚配置 -->
      <n-tab-pane name="footer-config" tab="页脚配置">
        <n-card>
          <n-empty description="页脚配置功能开发中..." size="large">
            <template #extra>
              <n-button type="primary" @click="handleComingSoon('页脚配置')">
                敬请期待
              </n-button>
            </template>
          </n-empty>
        </n-card>
      </n-tab-pane>

      <!-- 官方频道或社区 -->
      <n-tab-pane name="official-channels" tab="官方频道或社区">
        <n-card>
          <n-empty description="官方频道或社区功能开发中..." size="large">
            <template #extra>
              <n-button type="primary" @click="handleComingSoon('官方频道或社区')">
                敬请期待
              </n-button>
            </template>
          </n-empty>
        </n-card>
      </n-tab-pane>

      <!-- 设置找到我们 -->
      <n-tab-pane name="find-us" tab="设置找到我们">
        <n-card>
          <n-empty description="设置找到我们功能开发中..." size="large">
            <template #extra>
              <n-button type="primary" @click="handleComingSoon('设置找到我们')">
                敬请期待
              </n-button>
            </template>
          </n-empty>
        </n-card>
      </n-tab-pane>

      <!-- APP配置 -->
      <n-tab-pane name="app-config" tab="APP配置">
        <n-card>
          <n-empty description="APP配置功能开发中..." size="large">
            <template #extra>
              <n-button type="primary" @click="handleComingSoon('APP配置')">
                敬请期待
              </n-button>
            </template>
          </n-empty>
        </n-card>
      </n-tab-pane>

      <!-- 颜色主题演示 -->
      <n-tab-pane name="color-theme-demo" tab="颜色主题演示">
        <ColorThemeDemo />
      </n-tab-pane>

      <!-- 皮肤语言配置新 -->
      <n-tab-pane name="skin-language" tab="皮肤语言配置新">
        <!-- 筛选器区域 -->
        <n-card class="mb-4">
          <div class="flex flex-wrap gap-4 items-end">
            <!-- 品牌ID筛选 -->
            <div class="flex flex-col">
              <label class="mb-2 text-sm font-medium">品牌ID</label>
              <n-input
                v-model:value="skinLangFilters.brandId"
                placeholder="输入品牌ID"
                clearable
                style="width: 140px"
                @keyup.enter="handleSkinLangFilter"
              />
            </div>

            <!-- 品牌名称筛选 -->
            <div class="flex flex-col">
              <label class="mb-2 text-sm font-medium">品牌名称</label>
              <n-input
                v-model:value="skinLangFilters.brandName"
                placeholder="输入品牌名称"
                clearable
                style="width: 160px"
                @keyup.enter="handleSkinLangFilter"
              />
            </div>

            <!-- 品牌类型筛选 -->
            <div class="flex flex-col">
              <label class="mb-2 text-sm font-medium">品牌类型</label>
              <n-select
                v-model:value="skinLangFilters.brandType"
                placeholder="选择品牌类型"
                clearable
                style="width: 140px"
                :options="brandTypeOptions"
                @update:value="handleSkinLangFilter"
              />
            </div>

            <!-- 渠道类型筛选 -->
            <div class="flex flex-col">
              <label class="mb-2 text-sm font-medium">渠道类型</label>
              <n-select
                v-model:value="skinLangFilters.channelType"
                placeholder="选择渠道类型"
                clearable
                style="width: 140px"
                :options="channelTypeOptions"
                @update:value="handleSkinLangFilter"
              />
            </div>

            <!-- 皮肤风格筛选 -->
            <div class="flex flex-col">
              <label class="mb-2 text-sm font-medium">皮肤风格</label>
              <n-select
                v-model:value="skinLangFilters.skinStyle"
                placeholder="选择皮肤风格"
                clearable
                style="width: 140px"
                :options="skinStyleOptions"
                @update:value="handleSkinLangFilter"
              />
            </div>

            <!-- 搜索按钮 -->
            <div class="flex gap-2">
              <n-button type="primary" @click="handleSkinLangFilter">
                搜索
              </n-button>
              <n-button @click="resetSkinLangFilter">
                重置
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
                  <!-- 主要操作按钮 -->
                  <div class="flex gap-2">
                    <n-button type="primary" @click="handleSkinLangCreate">
                      新增配置
                    </n-button>
                  </div>
                  
                  <!-- 选择信息 -->
                  <div class="text-sm text-gray-600">
                    共 {{ skinLangPaginationReactive.total }} 条记录
                  </div>
                </div>
              </div>
            </n-card>
          </template>
        </SmartDataGrid>
      </n-tab-pane>
    </n-tabs>

    <!-- Skin Language Editor Dialog -->
    <SkinLangEditor
      v-model:show="showSkinLangModal"
      :editing-item="editingSkinLangItem"
      :detail-mode="skinLangDetailMode"
      @submit="handleSkinLangSubmit"
    />

    <!-- 创建/编辑对话框 -->
    <n-modal
      v-model:show="showModal"
      :title="editingItem ? '编辑LOGO设置' : '新增LOGO设置'"
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
            <n-form-item label="LOGO类型" path="logoType">
              <n-select
                v-model:value="formData.logoType"
                placeholder="选择LOGO类型"
                :options="logoTypeOptions"
              />
            </n-form-item>
            
            <!-- 品牌名称（站点品牌） -->
            <n-form-item label="品牌名称（站点品牌）" path="brandName">
              <n-input v-model:value="formData.brandName" placeholder="输入品牌名称，最多30字" />
            </n-form-item>
            
            <!-- 网页标题 -->
            <n-form-item label="网页标题" path="webTitle">
              <n-input v-model:value="formData.webTitle" placeholder="输入网页标题" />
            </n-form-item>
            
            <!-- 点击logo跳转 -->
            <n-form-item label="点击logo跳转" path="logoClickType">
              <div class="flex items-center gap-2">
                <n-select 
                  v-model:value="formData.logoClickType" 
                  :options="[
                    { label: '首页', value: 'homepage' },
                    { label: '自定义', value: 'custom' }
                  ]"
                  style="width: 140px"
                />
                <n-input 
                  v-if="formData.logoClickType === 'custom'" 
                  v-model:value="formData.logoClickUrl" 
                  placeholder="输入跳转链接，如 https://www.example.com" 
                  style="flex:1"
                />
              </div>
            </n-form-item>
        
        <n-form-item label="启用状态">
          <n-switch v-model:value="formData.isEnabled" />
        </n-form-item>

        <!-- 图片上传区域 -->
        <div class="image-upload-section">
          <h4 class="mb-4 text-base font-medium">图片设置</h4>
          
          <div class="grid grid-cols-2 gap-4">
            <!-- 加载骨架屏（Loading Image） -->
            <n-form-item label="加载骨架屏">
              <MediaLibrarySelector 
                v-model="formData.skeletonImageFileUrl" 
                :accept-types="['image']"
                placeholder="从媒体库选择或上传骨架屏（建议1600x900，≤1MB）"
              />
            </n-form-item>
            <!-- 登录页入口图 -->
            <!--<n-form-item label="登录页入口图">
              <MediaLibrarySelector 
                v-model="formData.loginImageFileUrl" 
                :accept-types="['image']"
                placeholder="从媒体库选择或上传（建议1920x1080，≤3MB）"
              />
            </n-form-item>-->

            <!-- APP商店图标 -->
            <!--<n-form-item label="APP商店图标">
              <MediaLibrarySelector 
                v-model="formData.appStoreImageFileUrl" 
                :accept-types="['image']"
                placeholder="从媒体库选择或上传（建议1024x1024，≤1MB）"
              />
            </n-form-item>

            <!-- APP内部LOGO -->
            <!--<n-form-item label="APP内部LOGO">
              <MediaLibrarySelector 
                v-model="formData.appInternalLogoFileUrl" 
                :accept-types="['image']"
                placeholder="从媒体库选择或上传（建议200x80，≤500KB）"
              />
            </n-form-item>-->

            <!-- 大厅LOGO -->
            <n-form-item label="大厅LOGO">
              <MediaLibrarySelector 
                v-model="formData.lobbyLogoFileUrl" 
                :accept-types="['image']"
                placeholder="从媒体库选择或上传（建议160x64，≤300KB）"
              />
            </n-form-item>

            <!-- 网页端图标 -->
            <n-form-item label="网页端图标">
              <MediaLibrarySelector 
                v-model="formData.webFaviconFileUrl" 
                :accept-types="['image']"
                placeholder="从媒体库选择或上传（建议32x32，≤100KB）"
              />
            </n-form-item>

            <!-- 网页LOGO -->
            <n-form-item label="网页LOGO">
              <MediaLibrarySelector 
                v-model="formData.webLogoFileUrl" 
                :accept-types="['image']"
                placeholder="从媒体库选择或上传（建议160x48，≤200KB）"
              />
            </n-form-item>
          </div>
        </div>

        <n-form-item label="限制展示内容" path="restrictedContent">
          <n-input
            v-model:value="formData.restrictedContent"
            type="textarea"
            placeholder="请输入限制展示内容"
            :rows="3"
          />
        </n-form-item>

        <n-form-item label="备注" path="remark">
          <n-input
            v-model:value="formData.remark"
            type="textarea"
            placeholder="请输入备注信息"
            :rows="2"
          />
        </n-form-item>
      </n-form>
      
      <template #action>
        <div class="flex gap-2 justify-end">
          <n-button @click="showModal = false">取消</n-button>
          <n-button type="primary" @click="handleSubmit" :loading="submitting">
            {{ editingItem ? '更新' : '创建' }}
          </n-button>
        </div>
      </template>
    </n-modal>

    <!-- 详情对话框 -->
    <n-modal
      v-model:show="showDetailModal"
      title="LOGO设置详情"
      preset="dialog"
      style="width: 900px"
    >
      <div v-if="detailData" class="detail-content">
        <div class="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label class="text-sm font-medium text-gray-600">LOGO类型</label>
            <div class="mt-1">
              <n-tag :type="detailData.logoType === '自定义图片' ? 'primary' : 'default'">
                {{ detailData.logoType }}
              </n-tag>
            </div>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-600">启用状态</label>
            <div class="mt-1">
              <n-tag :type="detailData.isEnabled ? 'success' : 'error'">
                {{ detailData.isEnabled ? '启用' : '禁用' }}
              </n-tag>
            </div>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-600">操作人</label>
            <div class="mt-1">{{ detailData.operator }}</div>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-600">操作时间</label>
            <div class="mt-1">{{ formatDate(detailData.updatedAt) }}</div>
          </div>
        </div>

        <div class="mb-6">
          <h4 class="text-base font-medium mb-4">图片预览</h4>
          <div class="grid grid-cols-3 gap-4">
            <div v-if="detailData.loginImage" class="text-center">
              <label class="text-sm font-medium text-gray-600">登录页入口图</label>
              <div class="mt-2">
                <n-image 
                  :src="getImageUrl(detailData.loginImage)" 
                  alt="登录页入口图"
                  width="120"
                  height="80"
                  object-fit="cover"
                  class="border rounded"
                />
              </div>
            </div>
            <div v-if="detailData.appStoreImage" class="text-center">
              <label class="text-sm font-medium text-gray-600">APP商店图标</label>
              <div class="mt-2">
                <n-image 
                  :src="getImageUrl(detailData.appStoreImage)" 
                  alt="APP商店图标"
                  width="60"
                  height="60"
                  object-fit="cover"
                  class="border rounded"
                />
              </div>
            </div>
            <div v-if="detailData.appInternalLogo" class="text-center">
              <label class="text-sm font-medium text-gray-600">APP内部LOGO</label>
              <div class="mt-2">
                <n-image 
                  :src="getImageUrl(detailData.appInternalLogo)" 
                  alt="APP内部LOGO"
                  width="100"
                  height: 40
                  object-fit="cover"
                  class="border rounded"
                />
              </div>
            </div>
            <div v-if="detailData.lobbyLogo" class="text-center">
              <label class="text-sm font-medium text-gray-600">大厅LOGO</label>
              <div class="mt-2">
                <n-image 
                  :src="getImageUrl(detailData.lobbyLogo)" 
                  alt="大厅LOGO"
                  width="80"
                  height="32"
                  object-fit="cover"
                  class="border rounded"
                />
              </div>
            </div>
            <div v-if="detailData.webFavicon" class="text-center">
              <label class="text-sm font-medium text-gray-600">网页端图标</label>
              <div class="mt-2">
                <n-image 
                  :src="getImageUrl(detailData.webFavicon)" 
                  alt="网页端图标"
                  width="32"
                  height="32"
                  object-fit="cover"
                  class="border rounded"
                />
              </div>
            </div>
            <div v-if="detailData.webLogo" class="text-center">
              <label class="text-sm font-medium text-gray-600">网页LOGO</label>
              <div class="mt-2">
                <n-image 
                  :src="getImageUrl(detailData.webLogo)" 
                  alt="网页LOGO"
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
          <label class="text-sm font-medium text-gray-600">限制展示内容</label>
          <div class="mt-1 p-3 bg-gray-50 rounded">{{ detailData.restrictedContent }}</div>
        </div>

        <div v-if="detailData.remark" class="mb-4">
          <label class="text-sm font-medium text-gray-600">备注</label>
          <div class="mt-1 p-3 bg-gray-50 rounded">{{ detailData.remark }}</div>
        </div>
      </div>
      
      <template #action>
        <div class="flex gap-2 justify-end">
          <n-button @click="showDetailModal = false">关闭</n-button>
        </div>
      </template>
    </n-modal>
  </Page>
</template>

<script setup lang="ts">
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
import {
  getBrandSkinLangConfigs,
  getBrandSkinLangConfigById,
  createBrandSkinLangConfig,
  updateBrandSkinLangConfig,
  deleteBrandSkinLangConfig,
  type BrandSkinLangConfig,
  type BrandSkinLangFilters,
  type BrandSkinLangCreateRequest
} from '#/api/skinLang';
import {
  NBreadcrumb,
  NBreadcrumbItem,
  NButton,
  NCard,
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
/** 皮肤语言配置弹窗是否为详情模式（只读+预览，仅关闭按钮） */
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
const logoTypeOptions = [
  { label: '加载骨架屏', value: '加载骨架屏' },
  { label: '图标', value: '图标' },
  { label: '自定义文字', value: '自定义文字' },
  { label: '自定义图片', value: '自定义图片' },
];

const statusOptions = [
  { label: '启用', value: true },
  { label: '禁用', value: false },
];

// Skin Language Options
const brandTypeOptions = [
  { label: '主站点', value: '主站点' },
  { label: '子站点', value: '子站点' },
];

const channelTypeOptions = [
  { label: '通用', value: '通用' },
  { label: '移动端', value: '移动端' },
  { label: '桌面端', value: '桌面端' },
];

const skinStyleOptions = [
  { label: '欧风风', value: '欧风风' },
  { label: '现代风', value: '现代风' },
  { label: '经典风', value: '经典风' },
];

// Form rules
const formRules: FormRules = {
  logoType: [
    { required: true, message: '请选择LOGO类型', trigger: 'change' }
  ],
};

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
const columns: DataTableColumns<BrandLogoSetting> = [
  {
    title: 'LOGO类型',
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
    title: '管理开关',
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
    title: '登录页面图片入口',
    key: 'loginImage',
    width: 140,
    render(row) {
      if (row.loginImage) {
        return h('div', { class: 'image-container' }, [
          h(NImage, {
            src: getImageUrl(row.loginImage),
            alt: '登录页入口图',
            width: 60,
            height: 40,
            objectFit: 'cover',
            class: 'table-image'
          })
        ]);
      }
      return h('span', { class: 'text-gray-400' }, '无图片');
    },
  },
  {
    title: 'APP商店图标',
    key: 'appStoreImage',
    width: 120,
    render(row) {
      if (row.appStoreImage) {
        return h('div', { class: 'image-container' }, [
          h(NImage, {
            src: getImageUrl(row.appStoreImage),
            alt: 'APP商店图标',
            width: 35,
            height: 35,
            objectFit: 'cover',
            class: 'table-image'
          })
        ]);
      }
      return h('span', { class: 'text-gray-400' }, '无图片');
    },
  },
  {
    title: 'APP内部LOGO',
    key: 'appInternalLogo',
    width: 120,
    render(row) {
      if (row.appInternalLogo) {
        return h('div', { class: 'image-container' }, [
          h(NImage, {
            src: getImageUrl(row.appInternalLogo),
            alt: 'APP内部LOGO',
            width: 50,
            height: 20,
            objectFit: 'cover',
            class: 'table-image'
          })
        ]);
      }
      return h('span', { class: 'text-gray-400' }, '无图片');
    },
  },
  {
    title: '大厅LOGO',
    key: 'lobbyLogo',
    width: 100,
    render(row) {
      if (row.lobbyLogo) {
        return h('div', { class: 'image-container' }, [
          h(NImage, {
            src: getImageUrl(row.lobbyLogo),
            alt: '大厅LOGO',
            width: 40,
            height: 16,
            objectFit: 'cover',
            class: 'table-image'
          })
        ]);
      }
      return h('span', { class: 'text-gray-400' }, '无图片');
    },
  },
  {
    title: '网页端图标',
    key: 'webFavicon',
    width: 100,
    render(row) {
      if (row.webFavicon) {
        return h('div', { class: 'image-container' }, [
          h(NImage, {
            src: getImageUrl(row.webFavicon),
            alt: '网页端图标',
            width: 20,
            height: 20,
            objectFit: 'cover',
            class: 'table-image'
          })
        ]);
      }
      return h('span', { class: 'text-gray-400' }, '无图片');
    },
  },
  {
    title: '网页LOGO',
    key: 'webLogo',
    width: 100,
    render(row) {
      if (row.webLogo) {
        return h('div', { class: 'image-container' }, [
          h(NImage, {
            src: getImageUrl(row.webLogo),
            alt: '网页LOGO',
            width: 40,
            height: 12,
            objectFit: 'cover',
            class: 'table-image'
          })
        ]);
      }
      return h('span', { class: 'text-gray-400' }, '无图片');
    },
  },
  {
    title: '限制页面内容',
    key: 'restrictedContent',
    width: 200,
    ellipsis: {
      tooltip: true,
    },
  },
  {
    title: '后台备注',
    key: 'remark',
    width: 150,
    ellipsis: {
      tooltip: true,
    },
  },
  {
    title: '操作人',
    key: 'operator',
    width: 100,
  },
  {
    title: '操作时间',
    key: 'updatedAt',
    width: 160,
    render(row) {
      return formatDate(row.updatedAt);
    },
  },
  {
    title: '操作',
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
        }, { default: () => '编辑' }),
        h(NButton, {
          size: 'small',
          quaternary: true,
          type: 'info',
          onClick: () => handleViewDetail(row)
        }, { default: () => '详情' }),
        h(NPopconfirm, { onPositiveClick: () => handleDelete(row) }, {
          trigger: () => h(NButton, {
            size: 'small',
            quaternary: true,
            type: 'error'
          }, { default: () => '删除' }),
          default: () => '确定要删除这个设置吗？',
        }),
      ]);
    },
  },
];

// Skin Language Table Columns
const skinLangColumns: DataTableColumns<BrandSkinLangConfig> = [
  {
    title: '品牌ID',
    key: 'brandId',
    width: 100,
    sorter: true,
    render(row) {
      return h('span', { style: { fontFamily: 'monospace' } }, row.brandId);
    },
  },
  {
    title: '品牌编号',
    key: 'brandCode',
    width: 120,
    render(row) {
      return h('span', { style: { fontFamily: 'monospace' } }, row.brandCode);
    },
  },
  {
    title: '品牌名称',
    key: 'brandName',
    width: 140,
    render(row) {
      return h('span', { class: 'font-medium' }, row.brandName);
    },
  },
  {
    title: '品牌类型',
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
    title: '渠道类型',
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
    title: '皮肤风格',
    key: 'skinStyle',
    width: 100,
    render(row) {
      return h(NTag, {
        type: 'warning',
        size: 'small'
      }, { default: () => row.skinStyle });
    },
  },
  {
    title: '玩法颜色',
    key: 'gameColor',
    width: 100,
    render(row) {
      return h('span', row.gameColor);
    },
  },
  {
    title: '皮肤颜色',
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
             title: `主色: ${colorInfo.palette.primary} - 点击预览主题`
           }),
           h('div', { 
             class: 'color-swatch secondary',
             style: { backgroundColor: colorInfo.palette.secondary },
             title: `次色: ${colorInfo.palette.secondary} - 点击预览主题`
           }),
           h('div', { 
             class: 'color-swatch accent',
             style: { backgroundColor: colorInfo.palette.accent },
             title: `强调色: ${colorInfo.palette.accent} - 点击预览主题`
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
    title: '皮肤模版',
    key: 'skinTemplate',
    width: 120,
    render(row) {
      return h('span', { class: 'font-medium' }, row.skinTemplate);
    },
  },
  {
    title: '客户端语言',
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
    title: '请求认证模式',
    key: 'authMode',
    width: 140,
    render(row) {
      return h('span', { class: 'text-sm' }, row.authMode);
    },
  },
  {
    title: 'APP配置',
    key: 'appSetting',
    width: 100,
    render(row) {
      return h('span', row.appSetting);
    },
  },
  {
    title: '创建时间',
    key: 'createdAt',
    width: 160,
    sorter: true,
    render(row) {
      return h('span', { class: 'text-sm' }, formatDate(row.createdAt));
    },
  },
  {
    title: '操作人',
    key: 'operator',
    width: 100,
    render(row) {
      return h('span', { style: { fontFamily: 'monospace' } }, row.operator);
    },
  },
  {
    title: '操作时间',
    key: 'updatedAt',
    width: 160,
    sorter: true,
    render(row) {
      return h('span', { class: 'text-sm' }, formatDate(row.updatedAt));
    },
  },
  {
    title: '后台备注',
    key: 'backendRemark',
    width: 150,
    ellipsis: {
      tooltip: true,
    },
    render(row) {
      return h('span', { class: 'text-sm text-gray-600' }, row.backendRemark || '-');
    },
  },
  {
    title: '操作',
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
        }, { default: () => '详情' }),
        h(NButton, {
          size: 'small',
          quaternary: true,
          type: 'primary',
          onClick: () => handleSkinLangEdit(row)
        }, { default: () => '修改' }),
      ]);
    },
  },
];

// Methods：子 tab 切换只改本地状态，不调用路由，避免顶部多开「品牌LOGO设置」标签页
const handleTabChange = (value: string) => {
  if (value === 'logo-settings') {
    loadData();
  } else if (value === 'skin-language') {
    loadSkinLangData();
  }
};

const handleComingSoon = (featureName: string) => {
  notification.info({
    content: `${featureName}功能正在积极开发中，敬请期待！`,
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
        throw new Error('无效的响应格式：data 字段不是数组');
      }
            } else {
          throw new Error('无效的响应格式');
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
      content: error instanceof Error ? error.message : '获取数据失败',
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
        throw new Error('无效的响应格式：data 字段不是数组');
      }
    } else {
      throw new Error('无效的响应格式');
    }
  } catch (error) {
    console.error('Error loading skin lang configs:', error);
    notification.error({
      content: error instanceof Error ? error.message : '获取皮肤语言配置失败',
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

// 皮肤语言弹窗关闭时重置详情模式
watch(showSkinLangModal, (visible) => {
  if (!visible) skinLangDetailMode.value = false;
});

const handleSkinLangSubmit = async (data: BrandSkinLangCreateRequest) => {
  try {
    if (editingSkinLangItem.value?.id) {
      // Update existing skin lang config
      await updateBrandSkinLangConfig(editingSkinLangItem.value.id, data);
      notification.success({ content: '皮肤语言配置更新成功' });
    } else {
      // Create new skin lang config
      await createBrandSkinLangConfig(data);
      notification.success({ content: '皮肤语言配置创建成功' });
    }
    
    showSkinLangModal.value = false;
    editingSkinLangItem.value = null;
    skinLangDetailMode.value = false;
    loadSkinLangData(); // Refresh the data
  } catch (error) {
    console.error('Error submitting skin lang config:', error);
    notification.error({
      content: error instanceof Error ? error.message : '操作失败，请重试'
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
      content: '图片缓存已清除',
      duration: 3000
    });
  } catch (error) {
    console.error('Failed to clear cache:', error);
    notification.error({
      content: '清除缓存失败',
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
      content: '删除成功',
      duration: 3000
    });
    loadData(); // Reload data after deletion
  } catch (error) {
    console.error('Error deleting brand logo setting:', error);
    notification.error({
      content: error instanceof Error ? error.message : '删除失败',
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
      content: value ? '启用成功' : '禁用成功',
      duration: 3000
    });
  } catch (error) {
    console.error('Error toggling brand logo setting:', error);
    notification.error({
      content: error instanceof Error ? error.message : '操作失败',
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
      content: editingItem.value ? '更新成功' : '创建成功',
      duration: 3000
    });
    showModal.value = false;
    loadData(); // Reload data after create/update
  } catch (error) {
    console.error('Error submitting brand logo setting:', error);
    notification.error({
      content: error instanceof Error ? error.message : '提交失败',
      duration: 3000
    });
  } finally {
    submitting.value = false;
  }
};

const handleDownloadTemplate = () => {
  const link = document.createElement('a');
  link.href = 'data:text/plain;charset=utf-8,品牌LOGO设计模板文件';
  link.download = 'brand-logo-template.psd';
  link.click();
  notification.success({
    content: '设计模板下载中...',
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

const formatDate = (date: string | Date | null) => {
  if (!date) return '-';
  return new Date(date).toLocaleString('zh-CN');
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
    content: `预览 ${colorInfo.label} 主题色彩`,
    meta: `主色: ${colorInfo.palette.primary} | 次色: ${colorInfo.palette.secondary} | 强调色: ${colorInfo.palette.accent}`,
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