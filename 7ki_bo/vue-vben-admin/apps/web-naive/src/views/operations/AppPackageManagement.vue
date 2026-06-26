<template>
  <Page
    :title="$t('operations.appPackage.title')"
    :description="$t('operations.appPackage.description')"
  >
    <n-space vertical :size="16">
      <n-tabs v-model:value="activeTab">
        <n-tab-pane name="build" :tab="$t('operations.appPackage.tabBuild')" />
        <n-tab-pane name="native" :tab="$t('operations.appPackage.tabNative')" />
      </n-tabs>

      <n-card v-if="activeTab === 'build'">
        <div class="build-header">
          <div class="build-header-left"></div>
          <n-space align="center">
            <a class="guide-link" href="javascript:void(0)">{{ $t('operations.appPackage.guideLink') }}</a>
            <n-button @click="openPublicConfigModal">{{ $t('operations.appPackage.publicConfig') }}</n-button>
            <n-button @click="openSigningModal">{{ $t('operations.appPackage.signingKeys') }}</n-button>
            <n-button type="primary" @click="openGenerateModal('ios')">{{ $t('operations.appPackage.generateIos') }}</n-button>
            <n-button type="primary" @click="openGenerateModal('android')">{{ $t('operations.appPackage.generateAndroid') }}</n-button>
          </n-space>
        </div>

        <div class="build-switches">
          <n-space :size="24" align="center">
            <span>{{ $t('operations.appPackage.rapidAndroidSwitch') }}：{{ publicConfig.rapidAndroidEnabled ? $t('operations.on') : $t('operations.off') }}</span>
            <span>{{ $t('operations.appPackage.nativeAndroidSwitch') }}：{{ publicConfig.nativeAndroidEnabled ? $t('operations.on') : $t('operations.off') }}</span>
            <span>{{ $t('operations.appPackage.rapidIosSwitch') }}：{{ publicConfig.rapidIosEnabled ? $t('operations.on') : $t('operations.off') }}</span>
            <span>{{ $t('operations.appPackage.nativeIosSwitch') }}：{{ publicConfig.nativeIosEnabled ? $t('operations.on') : $t('operations.off') }}</span>
          </n-space>
        </div>

        <n-data-table
          :columns="buildColumns"
          :data="buildPackages"
          :loading="buildLoading"
          :pagination="false"
          :row-key="(row) => row.id"
        />

        <div class="table-count">{{ $t('operations.totalCount', [buildPagination.total]) }}</div>

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
              :placeholder="$t('operations.appPackage.searchPlaceholder')"
              style="width: 260px"
              @keyup.enter="loadNativePackages"
            />
            <n-select
              v-model:value="nativeFilters.packageType"
              clearable
              :placeholder="$t('operations.packageType')"
              :options="packageTypeOptions"
              style="width: 120px"
              @update:value="loadNativePackages"
            />
            <n-select
              v-model:value="nativeFilters.status"
              clearable
              :placeholder="$t('common.status')"
              :options="statusOptions"
              style="width: 140px"
              @update:value="loadNativePackages"
            />
            <n-button @click="loadNativePackages">{{ $t('common.search') }}</n-button>
          </n-space>
          <n-button type="primary" @click="openNativeModal">{{ $t('common.create') }}</n-button>
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

    <n-modal v-model:show="publicConfigModalVisible" preset="card" :title="$t('operations.appPackage.publicConfig')" style="width: 620px">
      <n-form label-placement="left" label-width="180">
        <n-grid :cols="2" :x-gap="16">
          <n-gi>
            <n-form-item :label="$t('operations.appPackage.rapidAndroidApp')">
              <n-switch v-model:value="publicConfigForm.rapidAndroidEnabled" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item :label="$t('operations.appPackage.nativeAndroidApp')">
              <n-switch v-model:value="publicConfigForm.nativeAndroidEnabled" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item :label="$t('operations.appPackage.rapidIosApp')">
              <n-switch v-model:value="publicConfigForm.rapidIosEnabled" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item :label="$t('operations.appPackage.nativeIosApp')">
              <n-switch v-model:value="publicConfigForm.nativeIosEnabled" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item :label="$t('operations.appPackage.completeResource')">
              <n-switch v-model:value="publicConfigForm.completeResourceEnabled" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item :label="$t('operations.appPackage.liteResource')">
              <n-switch v-model:value="publicConfigForm.liteResourceEnabled" />
            </n-form-item>
          </n-gi>
          <n-gi :span="2">
            <n-form-item :label="$t('operations.appPackage.note')">
              <n-input v-model:value="publicConfigForm.note" type="textarea" :autosize="{ minRows: 2, maxRows: 4 }" />
            </n-form-item>
          </n-gi>
        </n-grid>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="publicConfigModalVisible = false">{{ $t('common.cancel') }}</n-button>
          <n-button type="primary" @click="savePublicConfig">{{ $t('common.confirm') }}</n-button>
        </n-space>
      </template>
    </n-modal>

    <n-modal v-model:show="generateModalVisible" preset="card" :title="generateModalTitle" style="width: 560px">
      <n-form label-placement="left" label-width="160">
        <n-form-item :label="$t('operations.appPackage.appType')">
          <n-checkbox-group v-model:value="generateForm.appTypes">
            <n-space>
              <n-checkbox value="pwa">PWA</n-checkbox>
              <n-checkbox value="native">{{ $t('operations.appPackage.appTypeNative') }}</n-checkbox>
              <n-checkbox value="rapid">{{ $t('operations.appPackage.rapidApp') }}</n-checkbox>
              <n-checkbox value="shortcut">{{ $t('operations.appPackage.appTypeShortcut') }}</n-checkbox>
            </n-space>
          </n-checkbox-group>
        </n-form-item>
        <n-form-item :label="$t('operations.appPackage.forceReinstall')">
          <n-input
            v-model:value="generateForm.forceReinstallBelowVersion"
            :placeholder="$t('operations.appPackage.forceReinstallPlaceholder')"
          />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="generateModalVisible = false">{{ $t('common.cancel') }}</n-button>
          <n-button type="primary" :loading="generateSubmitting" @click="submitGenerate">{{ $t('operations.appPackage.confirmGenerate') }}</n-button>
        </n-space>
      </template>
    </n-modal>

    <n-modal v-model:show="signingModalVisible" preset="card" :title="$t('operations.appPackage.signingKeys')" style="width: 620px">
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
        <div>{{ $t('operations.appPackage.signingTips1') }}</div>
        <div>{{ $t('operations.appPackage.signingTips2') }}</div>
      </div>
      <template #footer>
        <n-space justify="end">
          <n-button @click="signingModalVisible = false">{{ $t('common.cancel') }}</n-button>
          <n-button type="primary" :loading="signingSubmitting" @click="saveSigningConfig">{{ $t('common.save') }}</n-button>
        </n-space>
      </template>
    </n-modal>

    <n-modal v-model:show="fingerprintModalVisible" preset="dialog" :title="$t('operations.appPackage.fingerprintTitle')">
      <div class="fingerprint-text">{{ currentFingerprint || '-' }}</div>
    </n-modal>

    <n-modal v-model:show="nativeModalVisible" preset="card" :title="$t('operations.appPackage.addVestPackage')" style="width: 700px">
      <n-form label-placement="left" label-width="160">
        <n-grid :cols="2" :x-gap="16">
          <n-gi>
            <n-form-item :label="$t('operations.brand')">
              <n-select
                v-model:value="nativeForm.brandSettingId"
                clearable
                :options="brandOptions"
                :placeholder="$t('operations.appPackage.selectBrand')"
              />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item :label="$t('operations.packageType')">
              <n-radio-group v-model:value="nativeForm.packageType">
                <n-space>
                  <n-radio value="aab">aab</n-radio>
                  <n-radio value="apk">apk</n-radio>
                </n-space>
              </n-radio-group>
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item :label="$t('operations.channelId')">
              <n-input v-model:value="nativeForm.channelId" :placeholder="$t('operations.appPackage.enterChannelId')" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item :label="$t('operations.channelName')">
              <n-input v-model:value="nativeForm.channelName" :placeholder="$t('operations.appPackage.enterChannelName')" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item :label="$t('operations.appName')">
              <n-input v-model:value="nativeForm.appName" :placeholder="$t('operations.appPackage.appNamePlaceholder')" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item :label="$t('operations.packageName')">
              <n-input v-model:value="nativeForm.packageName" placeholder="com.example.app" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item :label="$t('operations.version')">
              <n-input v-model:value="nativeForm.version" :placeholder="$t('operations.appPackage.versionPlaceholder')" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item :label="$t('operations.applicationUrl')">
              <n-input v-model:value="nativeForm.applicationUrl" :placeholder="$t('operations.appPackage.downloadUrlPlaceholder')" />
            </n-form-item>
          </n-gi>
          <n-gi :span="2">
            <n-form-item label="AppsFlyer Dev Key">
              <n-input v-model:value="nativeForm.appsflyerDevKey" :placeholder="$t('operations.appPackage.appsflyerDevKeyPlaceholder')" />
            </n-form-item>
          </n-gi>
        </n-grid>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="nativeModalVisible = false">{{ $t('common.cancel') }}</n-button>
          <n-button type="primary" :loading="nativeSubmitting" @click="submitNativePackage">{{ $t('common.confirm') }}</n-button>
        </n-space>
      </template>
    </n-modal>
  </Page>
</template>

<script setup lang="ts">
import { $t } from '@vben/locales';

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

const statusOptions = computed(() => [
  { label: $t('operations.appPackage.statusPacking'), value: 'packing' },
  { label: $t('operations.appPackage.statusSuccess'), value: 'success' },
  { label: $t('operations.appPackage.statusFailed'), value: 'failed' },
]);
const packageTypeOptions = computed(() => [
  { label: 'aab', value: 'aab' },
  { label: 'apk', value: 'apk' },
]);

const generateModalTitle = computed(() =>
  $t('operations.appPackage.generateTitle', [
    generateForm.systemType === 'ios' ? 'iOS' : 'Android',
  ]),
);

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
  if (status === 'success') return $t('operations.appPackage.statusSuccess');
  if (status === 'failed') return $t('operations.appPackage.statusFailed');
  return $t('operations.appPackage.statusPacking');
}

function buildApplicationLines(row: AppBuildPackageItem) {
  if (!row.applicationUrl) return [];
  const suffix = row.systemType === 'android' ? '.apk' : '.ipa';
  const base = row.applicationUrl;
  return [
    { canReplace: true, label: $t('operations.appPackage.rapidApp'), size: '6.01M', url: `${base}${suffix}` },
    { canReplace: false, label: $t('operations.appPackage.nativeAppFull'), size: '85.45M', url: `${base}${suffix}` },
    { canReplace: false, label: $t('operations.appPackage.nativeAppLite'), size: '68.24M', url: `${base}${suffix}` },
  ];
}

const buildColumns = computed<DataTableColumns<AppBuildPackageItem>>(() => [
  {
    title: $t('operations.icon'),
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
  { title: $t('operations.system'), key: 'systemType', width: 90 },
  { title: $t('operations.appName'), key: 'appName', minWidth: 130 },
  { title: $t('operations.packageName'), key: 'packageName', minWidth: 180 },
  {
    title: $t('operations.applicationUrl'),
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
              $t('common.download'),
            ),
            line.canReplace
              ? h(
                  'a',
                  { class: 'line-action', href: 'javascript:void(0)' },
                  $t('operations.replace'),
                )
              : null,
          ]),
        ),
      );
    },
  },
  { title: $t('operations.version'), key: 'version', width: 100 },
  {
    title: $t('common.status'),
    key: 'status',
    width: 110,
    render: (row) => h(NTag, { type: statusTagType(row.status), size: 'small' }, () => statusLabel(row.status)),
  },
  {
    title: $t('common.actions'),
    key: 'actions',
    width: 90,
    render: () => '--',
  },
  { title: $t('common.operationTime'), key: 'operatedAt', width: 170 },
  { title: $t('common.operator'), key: 'operator', width: 110 },
]);

const nativeColumns = computed<DataTableColumns<NativeVestPackageItem>>(() => [
  { title: $t('operations.channelId'), key: 'channelId', width: 140 },
  { title: $t('operations.channelName'), key: 'channelName', minWidth: 140 },
  { title: $t('operations.packageType'), key: 'packageType', width: 90 },
  { title: $t('operations.packageName'), key: 'packageName', minWidth: 180 },
  {
    title: $t('operations.applicationUrl'),
    key: 'applicationUrl',
    minWidth: 220,
    render: (row) =>
      row.applicationUrl
        ? h(
            'a',
            { href: row.applicationUrl, target: '_blank', style: 'color:#1677ff;text-decoration:none;' },
            $t('common.download'),
          )
        : '-',
  },
  { title: $t('operations.version'), key: 'version', width: 100 },
  {
    title: $t('common.status'),
    key: 'status',
    width: 110,
    render: (row) => h(NTag, { type: statusTagType(row.status), size: 'small' }, () => statusLabel(row.status)),
  },
  { title: $t('common.operator'), key: 'operator', width: 120 },
  { title: $t('common.operationTime'), key: 'operatedAt', width: 170 },
  {
    title: $t('common.actions'),
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
              message.success($t('operations.appPackage.statusUpdated'));
              loadNativePackages();
            },
          },
          () =>
            row.status === 'success'
              ? $t('operations.appPackage.markFailed')
              : $t('operations.appPackage.markSuccess'),
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
  message.success($t('operations.appPackage.publicConfigSaved'));
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
    message.warning($t('operations.appPackage.selectAppType'));
    return;
  }
  generateSubmitting.value = true;
  try {
    await generateAppBuildPackageApi({
      systemType: generateForm.systemType,
      appTypes: generateForm.appTypes,
      forceReinstallBelowVersion: generateForm.forceReinstallBelowVersion || null,
    });
    message.success($t('operations.appPackage.buildTaskSubmitted'));
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
    message.success(resp?.message || resp?.data?.message || $t('operations.appPackage.signingUpdated'));
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
    message.warning($t('operations.appPackage.fillRequiredFields'));
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
    message.success($t('operations.appPackage.createSuccess'));
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
