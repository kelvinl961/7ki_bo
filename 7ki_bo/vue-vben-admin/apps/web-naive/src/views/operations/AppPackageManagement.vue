<template>
  <Page title="APP包管理" description="管理打包APP与原生马甲包">
    <n-space vertical :size="16">
      <n-tabs v-model:value="activeTab">
        <n-tab-pane name="build" tab="打包APP" />
        <n-tab-pane name="native" tab="原生马甲包" />
      </n-tabs>

      <n-card v-if="activeTab === 'build'">
        <div class="build-header">
          <div class="build-header-left"></div>
          <n-space align="center">
            <a class="guide-link" href="javascript:void(0)">操作教程</a>
            <n-button @click="openPublicConfigModal">公共配置</n-button>
            <n-button @click="openSigningModal">证书密钥</n-button>
            <n-button type="primary" @click="openGenerateModal('ios')">生成iOS包</n-button>
            <n-button type="primary" @click="openGenerateModal('android')">生成Android包</n-button>
          </n-space>
        </div>

        <div class="build-switches">
          <n-space :size="24" align="center">
            <span>极速安卓开关：{{ publicConfig.rapidAndroidEnabled ? '开' : '关' }}</span>
            <span>原生安卓开关：{{ publicConfig.nativeAndroidEnabled ? '开' : '关' }}</span>
            <span>极速iOS开关：{{ publicConfig.rapidIosEnabled ? '开' : '关' }}</span>
            <span>原生iOS开关：{{ publicConfig.nativeIosEnabled ? '开' : '关' }}</span>
          </n-space>
        </div>

        <n-data-table
          :columns="buildColumns"
          :data="buildPackages"
          :loading="buildLoading"
          :pagination="false"
          :row-key="(row) => row.id"
        />

        <div class="table-count">共 {{ buildPagination.total }} 条</div>

        <div class="mt-4 flex justify-end">
          <n-pagination
            v-model:page="buildPagination.page"
            v-model:page-size="buildPagination.pageSize"
            :item-count="buildPagination.total"
            :page-sizes="[10, 20, 50]"
            show-size-picker
            @update:page="loadBuildPackages"
            @update:page-size="loadBuildPackages"
          />
        </div>
      </n-card>

      <n-card v-else>
        <n-space justify="space-between" align="center" style="margin-bottom: 12px">
          <n-space>
            <n-input
              v-model:value="nativeFilters.keyword"
              clearable
              placeholder="搜索渠道ID/渠道名称/包名"
              style="width: 260px"
              @keyup.enter="loadNativePackages"
            />
            <n-select
              v-model:value="nativeFilters.packageType"
              clearable
              placeholder="包类型"
              :options="packageTypeOptions"
              style="width: 120px"
              @update:value="loadNativePackages"
            />
            <n-select
              v-model:value="nativeFilters.status"
              clearable
              placeholder="状态"
              :options="statusOptions"
              style="width: 140px"
              @update:value="loadNativePackages"
            />
            <n-button @click="loadNativePackages">搜索</n-button>
          </n-space>
          <n-button type="primary" @click="openNativeModal">新增</n-button>
        </n-space>

        <n-data-table
          :columns="nativeColumns"
          :data="nativePackages"
          :loading="nativeLoading"
          :pagination="false"
          :row-key="(row) => row.id"
        />

        <div class="mt-4 flex justify-end">
          <n-pagination
            v-model:page="nativePagination.page"
            v-model:page-size="nativePagination.pageSize"
            :item-count="nativePagination.total"
            :page-sizes="[10, 20, 50]"
            show-size-picker
            @update:page="loadNativePackages"
            @update:page-size="loadNativePackages"
          />
        </div>
      </n-card>
    </n-space>

    <n-modal v-model:show="publicConfigModalVisible" preset="card" title="公共配置" style="width: 620px">
      <n-form label-placement="left" label-width="180">
        <n-grid :cols="2" :x-gap="16">
          <n-gi>
            <n-form-item label="极速AndroidAPP">
              <n-switch v-model:value="publicConfigForm.rapidAndroidEnabled" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="原生AndroidAPP">
              <n-switch v-model:value="publicConfigForm.nativeAndroidEnabled" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="极速iOSAPP">
              <n-switch v-model:value="publicConfigForm.rapidIosEnabled" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="原生iOSAPP">
              <n-switch v-model:value="publicConfigForm.nativeIosEnabled" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="完整APP资源">
              <n-switch v-model:value="publicConfigForm.completeResourceEnabled" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="轻量资源APP">
              <n-switch v-model:value="publicConfigForm.liteResourceEnabled" />
            </n-form-item>
          </n-gi>
          <n-gi :span="2">
            <n-form-item label="备注说明">
              <n-input v-model:value="publicConfigForm.note" type="textarea" :autosize="{ minRows: 2, maxRows: 4 }" />
            </n-form-item>
          </n-gi>
        </n-grid>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="publicConfigModalVisible = false">取消</n-button>
          <n-button type="primary" @click="savePublicConfig">确认</n-button>
        </n-space>
      </template>
    </n-modal>

    <n-modal v-model:show="generateModalVisible" preset="card" :title="`生成${generateForm.systemType === 'ios' ? 'iOS' : 'Android'}包`" style="width: 560px">
      <n-form label-placement="left" label-width="160">
        <n-form-item label="APP类型">
          <n-checkbox-group v-model:value="generateForm.appTypes">
            <n-space>
              <n-checkbox value="pwa">PWA</n-checkbox>
              <n-checkbox value="native">原生</n-checkbox>
              <n-checkbox value="rapid">极速</n-checkbox>
              <n-checkbox value="shortcut">桌面快捷方式</n-checkbox>
            </n-space>
          </n-checkbox-group>
        </n-form-item>
        <n-form-item label="强制重装低版本">
          <n-input
            v-model:value="generateForm.forceReinstallBelowVersion"
            placeholder="例如 1.0.52（低于该版本会提示重装）"
          />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="generateModalVisible = false">取消</n-button>
          <n-button type="primary" :loading="generateSubmitting" @click="submitGenerate">确认生成</n-button>
        </n-space>
      </template>
    </n-modal>

    <n-modal v-model:show="signingModalVisible" preset="card" title="证书密钥" style="width: 620px">
      <n-form label-placement="left" label-width="180">
        <n-form-item label="Android Alias">
          <n-input v-model:value="signingForm.androidAlias" />
        </n-form-item>
        <n-form-item label="Keystore Password">
          <n-input v-model:value="signingForm.androidKeystorePassword" type="password" show-password-on="click" />
        </n-form-item>
        <n-form-item label="Key Password">
          <n-input v-model:value="signingForm.androidKeyPassword" type="password" show-password-on="click" />
        </n-form-item>
      </n-form>
      <div class="tips">
        <div>修改 Android 签名后，会影响谷歌快捷登录，仅需替换 Google 平台 SHA-1 证书指纹。</div>
        <div>新签名仅对新打包生效，老包仍可继续使用。</div>
      </div>
      <template #footer>
        <n-space justify="end">
          <n-button @click="signingModalVisible = false">取消</n-button>
          <n-button type="primary" :loading="signingSubmitting" @click="saveSigningConfig">保存</n-button>
        </n-space>
      </template>
    </n-modal>

    <n-modal v-model:show="fingerprintModalVisible" preset="dialog" title="证书指纹">
      <div class="fingerprint-text">{{ currentFingerprint || '-' }}</div>
    </n-modal>

    <n-modal v-model:show="nativeModalVisible" preset="card" title="新增马甲包" style="width: 700px">
      <n-form label-placement="left" label-width="160">
        <n-grid :cols="2" :x-gap="16">
          <n-gi>
            <n-form-item label="品牌">
              <n-select
                v-model:value="nativeForm.brandSettingId"
                clearable
                :options="brandOptions"
                placeholder="选择品牌"
              />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="包类型">
              <n-radio-group v-model:value="nativeForm.packageType">
                <n-space>
                  <n-radio value="aab">aab</n-radio>
                  <n-radio value="apk">apk</n-radio>
                </n-space>
              </n-radio-group>
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="渠道ID">
              <n-input v-model:value="nativeForm.channelId" placeholder="请输入渠道ID" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="渠道名称">
              <n-input v-model:value="nativeForm.channelName" placeholder="请输入渠道名称" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="APP名称">
              <n-input v-model:value="nativeForm.appName" placeholder="例如 024APP2" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="包名">
              <n-input v-model:value="nativeForm.packageName" placeholder="com.example.app" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="版本号">
              <n-input v-model:value="nativeForm.version" placeholder="例如 1.0.0" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="应用地址">
              <n-input v-model:value="nativeForm.applicationUrl" placeholder="下载地址" />
            </n-form-item>
          </n-gi>
          <n-gi :span="2">
            <n-form-item label="AppsFlyer Dev Key">
              <n-input v-model:value="nativeForm.appsflyerDevKey" placeholder="请输入 AppsFlyer Dev Key" />
            </n-form-item>
          </n-gi>
        </n-grid>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="nativeModalVisible = false">取消</n-button>
          <n-button type="primary" :loading="nativeSubmitting" @click="submitNativePackage">确认</n-button>
        </n-space>
      </template>
    </n-modal>
  </Page>
</template>

<script setup lang="ts">
import { computed, h, onMounted, reactive, ref } from 'vue';
import type { DataTableColumns } from 'naive-ui';
import {
  NButton,
  NCard,
  NCheckbox,
  NCheckboxGroup,
  NDataTable,
  NForm,
  NFormItem,
  NGi,
  NGrid,
  NImage,
  NInput,
  NModal,
  NPagination,
  NRadio,
  NRadioGroup,
  NSelect,
  NSpace,
  NSwitch,
  NTabPane,
  NTabs,
  NTag,
  useMessage,
} from 'naive-ui';
import { Page } from '@vben/common-ui';
import {
  createNativeVestPackageApi,
  generateAppBuildPackageApi,
  getAppBuildPackagesApi,
  getAppPackageFormOptionsApi,
  getAppPackagePublicConfigApi,
  getNativeVestPackagesApi,
  getSigningConfigApi,
  updateAppBuildStatusApi,
  updateAppPackagePublicConfigApi,
  updateNativeVestPackageStatusApi,
  updateSigningConfigApi,
  type AppBuildPackageItem,
  type AppPackagePublicConfig,
  type BuildStatus,
  type NativeVestPackageItem,
  type SystemType,
} from '#/api/core/app-package-management';

const message = useMessage();
const activeTab = ref<'build' | 'native'>('build');

const statusOptions = [
  { label: '打包中', value: 'packing' },
  { label: '打包成功', value: 'success' },
  { label: '打包失败', value: 'failed' },
];
const packageTypeOptions = [
  { label: 'aab', value: 'aab' },
  { label: 'apk', value: 'apk' },
];
const systemTypeOptions = [
  { label: 'Android', value: 'android' },
  { label: 'iOS', value: 'ios' },
];

const publicConfig = reactive<AppPackagePublicConfig>({
  id: 0,
  rapidAndroidEnabled: true,
  nativeAndroidEnabled: true,
  rapidIosEnabled: true,
  nativeIosEnabled: true,
  completeResourceEnabled: true,
  liteResourceEnabled: true,
  note: '',
});
const publicConfigForm = reactive<Omit<AppPackagePublicConfig, 'id'>>({
  rapidAndroidEnabled: true,
  nativeAndroidEnabled: true,
  rapidIosEnabled: true,
  nativeIosEnabled: true,
  completeResourceEnabled: true,
  liteResourceEnabled: true,
  note: '',
});

const publicConfigModalVisible = ref(false);
const signingModalVisible = ref(false);
const signingSubmitting = ref(false);
const fingerprintModalVisible = ref(false);
const currentFingerprint = ref('');

const signingForm = reactive({
  androidAlias: '',
  androidKeystorePassword: '',
  androidKeyPassword: '',
});

const buildLoading = ref(false);
const buildPackages = ref<AppBuildPackageItem[]>([]);
const buildPagination = reactive({ page: 1, pageSize: 10, total: 0 });
const buildFilters = reactive<{
  keyword: string;
  status: BuildStatus | null;
  systemType: SystemType | null;
}>({
  keyword: '',
  status: null,
  systemType: null,
});

const generateModalVisible = ref(false);
const generateSubmitting = ref(false);
const generateForm = reactive<{
  appTypes: Array<'native' | 'pwa' | 'rapid' | 'shortcut'>;
  forceReinstallBelowVersion: string;
  systemType: SystemType;
}>({
  appTypes: ['rapid', 'native'],
  forceReinstallBelowVersion: '',
  systemType: 'android',
});

const nativeLoading = ref(false);
const nativePackages = ref<NativeVestPackageItem[]>([]);
const nativePagination = reactive({ page: 1, pageSize: 10, total: 0 });
const nativeFilters = reactive<{
  keyword: string;
  packageType: 'aab' | 'apk' | null;
  status: BuildStatus | null;
}>({
  keyword: '',
  packageType: null,
  status: null,
});

const formOptions = ref<{ brands: Array<{ iconUrl: null | string; id: number; name: string }> }>({
  brands: [],
});
const nativeModalVisible = ref(false);
const nativeSubmitting = ref(false);
const nativeForm = reactive({
  brandSettingId: null as null | number,
  channelId: '',
  channelName: '',
  packageType: 'aab' as 'aab' | 'apk',
  packageName: '',
  appName: '',
  applicationUrl: '',
  version: '',
  appsflyerDevKey: '',
});

const brandOptions = computed(() =>
  formOptions.value.brands.map((item) => ({
    label: item.name,
    value: item.id,
  })),
);

function statusTagType(status: BuildStatus) {
  if (status === 'success') return 'success';
  if (status === 'failed') return 'error';
  return 'warning';
}

function statusLabel(status: BuildStatus) {
  if (status === 'success') return '打包成功';
  if (status === 'failed') return '打包失败';
  return '打包中';
}

function buildApplicationLines(row: AppBuildPackageItem) {
  if (!row.applicationUrl) return [];
  const suffix = row.systemType === 'android' ? '.apk' : '.ipa';
  const base = row.applicationUrl;
  return [
    { canReplace: true, label: '极速APP', size: '6.01M', url: `${base}${suffix}` },
    { canReplace: false, label: '原生APP(完整资源)', size: '85.45M', url: `${base}${suffix}` },
    { canReplace: false, label: '原生APP(轻量资源)', size: '68.24M', url: `${base}${suffix}` },
  ];
}

const buildColumns = computed<DataTableColumns<AppBuildPackageItem>>(() => [
  {
    title: '图标',
    key: 'icon',
    width: 70,
    render: (row) =>
      h(NImage, {
        fallbackSrc:
          'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2240%22 height=%2240%22%3E%3Crect width=%2240%22 height=%2240%22 fill=%22%23f0f0f0%22/%3E%3C/svg%3E',
        height: 36,
        src: row.iconUrl || '',
        width: 36,
      }),
  },
  { title: '系统', key: 'systemType', width: 90 },
  { title: 'APP名称', key: 'appName', minWidth: 130 },
  { title: 'APP包名', key: 'packageName', minWidth: 180 },
  {
    title: '应用地址',
    key: 'applicationUrl',
    minWidth: 360,
    render: (row) => {
      const lines = buildApplicationLines(row);
      if (lines.length === 0) return '-';
      return h(
        'div',
        { class: 'app-link-lines' },
        lines.map((line) =>
          h('div', { class: 'app-link-line' }, [
            h('span', { class: 'line-label' }, `${line.label}：`),
            h(
              'a',
              { class: 'line-url', href: line.url, target: '_blank' },
              line.url,
            ),
            h('span', { class: 'line-size' }, line.size),
            h(
              'a',
              { class: 'line-action', href: line.url, target: '_blank' },
              '下载',
            ),
            line.canReplace
              ? h(
                  'a',
                  { class: 'line-action', href: 'javascript:void(0)' },
                  '替换',
                )
              : null,
          ]),
        ),
      );
    },
  },
  { title: '版本号', key: 'version', width: 100 },
  {
    title: '状态',
    key: 'status',
    width: 110,
    render: (row) => h(NTag, { type: statusTagType(row.status), size: 'small' }, () => statusLabel(row.status)),
  },
  {
    title: '操作',
    key: 'actions',
    width: 90,
    render: () => '--',
  },
  { title: '操作时间', key: 'operatedAt', width: 170 },
  { title: '操作人', key: 'operator', width: 110 },
]);

const nativeColumns = computed<DataTableColumns<NativeVestPackageItem>>(() => [
  { title: '渠道ID', key: 'channelId', width: 140 },
  { title: '渠道名称', key: 'channelName', minWidth: 140 },
  { title: '包类型', key: 'packageType', width: 90 },
  { title: '包名', key: 'packageName', minWidth: 180 },
  {
    title: '应用地址',
    key: 'applicationUrl',
    minWidth: 220,
    render: (row) =>
      row.applicationUrl
        ? h(
            'a',
            { href: row.applicationUrl, target: '_blank', style: 'color:#1677ff;text-decoration:none;' },
            '下载',
          )
        : '-',
  },
  { title: '版本号', key: 'version', width: 100 },
  {
    title: '状态',
    key: 'status',
    width: 110,
    render: (row) => h(NTag, { type: statusTagType(row.status), size: 'small' }, () => statusLabel(row.status)),
  },
  { title: '操作人', key: 'operator', width: 120 },
  { title: '操作时间', key: 'operatedAt', width: 170 },
  {
    title: '操作',
    key: 'actions',
    width: 150,
    render: (row) =>
      h(NSpace, { size: 8 }, () => [
        h(
          NButton,
          {
            size: 'small',
            onClick: async () => {
              await updateNativeVestPackageStatusApi(row.id, row.status === 'success' ? 'failed' : 'success');
              message.success('状态已更新');
              loadNativePackages();
            },
          },
          () => (row.status === 'success' ? '标记失败' : '标记成功'),
        ),
      ]),
  },
]);

async function loadPublicConfig() {
  const resp: any = await getAppPackagePublicConfigApi();
  const cfg = resp?.data || resp?.data?.data;
  if (!cfg) return;
  Object.assign(publicConfig, cfg);
  Object.assign(publicConfigForm, {
    rapidAndroidEnabled: cfg.rapidAndroidEnabled,
    nativeAndroidEnabled: cfg.nativeAndroidEnabled,
    rapidIosEnabled: cfg.rapidIosEnabled,
    nativeIosEnabled: cfg.nativeIosEnabled,
    completeResourceEnabled: cfg.completeResourceEnabled,
    liteResourceEnabled: cfg.liteResourceEnabled,
    note: cfg.note || '',
  });
}

async function savePublicConfig() {
  await updateAppPackagePublicConfigApi(publicConfigForm);
  message.success('公共配置已保存');
  publicConfigModalVisible.value = false;
  await loadPublicConfig();
}

async function loadBuildPackages() {
  buildLoading.value = true;
  try {
    const resp: any = await getAppBuildPackagesApi({
      page: buildPagination.page,
      pageSize: buildPagination.pageSize,
      keyword: buildFilters.keyword || undefined,
      status: buildFilters.status || undefined,
      systemType: buildFilters.systemType || undefined,
    });
    const payload = resp?.data || resp?.data?.data;
    buildPackages.value = payload?.list || [];
    buildPagination.total = payload?.pagination?.total || 0;
  } finally {
    buildLoading.value = false;
  }
}

function openGenerateModal(systemType: SystemType) {
  generateForm.systemType = systemType;
  generateForm.appTypes = ['rapid', 'native'];
  generateForm.forceReinstallBelowVersion = '';
  generateModalVisible.value = true;
}

async function submitGenerate() {
  if (generateForm.appTypes.length === 0) {
    message.warning('请至少选择一个APP类型');
    return;
  }
  generateSubmitting.value = true;
  try {
    await generateAppBuildPackageApi({
      systemType: generateForm.systemType,
      appTypes: generateForm.appTypes,
      forceReinstallBelowVersion: generateForm.forceReinstallBelowVersion || null,
    });
    message.success('打包任务已提交');
    generateModalVisible.value = false;
    loadBuildPackages();
  } finally {
    generateSubmitting.value = false;
  }
}

function openPublicConfigModal() {
  Object.assign(publicConfigForm, {
    rapidAndroidEnabled: publicConfig.rapidAndroidEnabled,
    nativeAndroidEnabled: publicConfig.nativeAndroidEnabled,
    rapidIosEnabled: publicConfig.rapidIosEnabled,
    nativeIosEnabled: publicConfig.nativeIosEnabled,
    completeResourceEnabled: publicConfig.completeResourceEnabled,
    liteResourceEnabled: publicConfig.liteResourceEnabled,
    note: publicConfig.note || '',
  });
  publicConfigModalVisible.value = true;
}

async function openSigningModal() {
  const resp: any = await getSigningConfigApi();
  const data = resp?.data || resp?.data?.data;
  signingForm.androidAlias = data?.androidAlias || '';
  signingForm.androidKeystorePassword = data?.androidKeystorePassword || '';
  signingForm.androidKeyPassword = data?.androidKeyPassword || '';
  signingModalVisible.value = true;
}

async function saveSigningConfig() {
  signingSubmitting.value = true;
  try {
    const resp: any = await updateSigningConfigApi({
      androidAlias: signingForm.androidAlias || null,
      androidKeystorePassword: signingForm.androidKeystorePassword || null,
      androidKeyPassword: signingForm.androidKeyPassword || null,
    });
    message.success(resp?.message || resp?.data?.message || '签名配置更新成功');
    currentFingerprint.value =
      resp?.data?.certificateFingerprint || resp?.data?.data?.certificateFingerprint || '';
    fingerprintModalVisible.value = true;
    signingModalVisible.value = false;
  } finally {
    signingSubmitting.value = false;
  }
}

async function loadNativePackages() {
  nativeLoading.value = true;
  try {
    const resp: any = await getNativeVestPackagesApi({
      page: nativePagination.page,
      pageSize: nativePagination.pageSize,
      keyword: nativeFilters.keyword || undefined,
      packageType: nativeFilters.packageType || undefined,
      status: nativeFilters.status || undefined,
    });
    const payload = resp?.data || resp?.data?.data;
    nativePackages.value = payload?.list || [];
    nativePagination.total = payload?.pagination?.total || 0;
  } finally {
    nativeLoading.value = false;
  }
}

async function loadFormOptions() {
  const resp: any = await getAppPackageFormOptionsApi();
  const payload = resp?.data || resp?.data?.data;
  formOptions.value.brands = payload?.brands || [];
}

function openNativeModal() {
  nativeForm.brandSettingId = null;
  nativeForm.channelId = '';
  nativeForm.channelName = '';
  nativeForm.packageType = 'aab';
  nativeForm.packageName = '';
  nativeForm.appName = '';
  nativeForm.applicationUrl = '';
  nativeForm.version = '';
  nativeForm.appsflyerDevKey = '';
  nativeModalVisible.value = true;
}

async function submitNativePackage() {
  if (!nativeForm.channelId || !nativeForm.channelName || !nativeForm.packageName || !nativeForm.version) {
    message.warning('请填写渠道ID、渠道名称、包名和版本号');
    return;
  }
  nativeSubmitting.value = true;
  try {
    await createNativeVestPackageApi({
      brandSettingId: nativeForm.brandSettingId,
      channelId: nativeForm.channelId.trim(),
      channelName: nativeForm.channelName.trim(),
      packageType: nativeForm.packageType,
      packageName: nativeForm.packageName.trim(),
      appName: nativeForm.appName.trim() || null,
      applicationUrl: nativeForm.applicationUrl.trim() || null,
      version: nativeForm.version.trim(),
      appsflyerDevKey: nativeForm.appsflyerDevKey.trim() || null,
    });
    message.success('新增成功');
    nativeModalVisible.value = false;
    loadNativePackages();
  } finally {
    nativeSubmitting.value = false;
  }
}

onMounted(async () => {
  await Promise.all([loadPublicConfig(), loadBuildPackages(), loadNativePackages(), loadFormOptions()]);
});
</script>

<style scoped>
.build-switches {
  margin-bottom: 12px;
  padding: 10px 12px;
  background: #fafafa;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  color: #595959;
  font-size: 13px;
}

.build-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.guide-link {
  color: #1677ff;
  font-size: 13px;
  text-decoration: none;
}

.table-count {
  margin-top: 8px;
  color: #8c8c8c;
  font-size: 12px;
}

.app-link-lines {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.app-link-line {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  line-height: 1.5;
}

.line-label {
  color: #595959;
  min-width: 108px;
}

.line-url {
  color: #8c8c8c;
  text-decoration: none;
  max-width: 170px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.line-size {
  color: #595959;
}

.line-action {
  color: #1677ff;
  text-decoration: none;
}

.tips {
  margin-top: 8px;
  padding: 8px 10px;
  background: #fffbe6;
  color: #8c6d1f;
  font-size: 12px;
  line-height: 1.8;
}

.fingerprint-text {
  word-break: break-all;
  line-height: 1.7;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}
</style>
