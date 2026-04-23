<template>
  <Page title="三方埋点" description="管理 Web/App 埋点与三方统计代码接入配置">
    <n-space vertical :size="16">
      <n-alert type="warning" :show-icon="false">
        <template #header>埋点说明</template>
        <div class="leading-6">
          <div>
            三方埋点（Google / Facebook/Meta / TikTok / Kwai）均为 Pixel 接入，存在折损属正常。
          </div>
          <div>
            充值到账类事件依赖 websocket 推送，用户后台运行、断网或关闭 App 时，到账事件可能无法及时上报。
          </div>
          <div>
            广告平台存在归因策略，未通过广告归因进入的转化通常不会计入广告后台。
          </div>
          <div>埋点用于广告优化，不可作为财务结算依据。</div>
        </div>
      </n-alert>

      <n-card>
        <n-tabs
          v-model:value="filters.scope"
          @update:value="handleFilterChange"
        >
          <n-tab-pane name="web" tab="Web埋点" />
          <n-tab-pane name="app" tab="APP埋点" />
          <n-tab-pane name="third_party_code" tab="三方统计代码" />
        </n-tabs>

        <div v-if="filters.scope === 'app'" class="app-tracking-panel">
          <div class="app-tip-row">
            <div class="app-tip-text">
              <span class="app-tip-prefix">重要提示：</span>
              埋点配置有时延，APP埋点需要重新打包，且会受上下架发布周期和设备状态影响。
              <a class="app-tip-link" href="javascript:void(0)">点我介绍</a>
            </div>
            <n-button type="primary" size="small">修改</n-button>
          </div>

          <div class="app-content">
            <div class="app-provider-list">
              <div
                v-for="provider in appGuideProviders"
                :key="provider.key"
                class="app-provider-item"
                :class="{ active: provider.key === appGuideActiveProvider }"
                @click="appGuideActiveProvider = provider.key"
              >
                {{ provider.label }}
              </div>
            </div>

            <div class="app-provider-detail">
              <div class="app-provider-title">
                {{ appGuideActiveProviderMeta?.label }}
                <span class="app-provider-desc">{{ appGuideActiveProviderMeta?.description }}</span>
              </div>
              <div class="app-provider-instruction">
                请在{{ appGuideActiveProviderMeta?.label }}后台创建应用后，下载
                <strong>{{ appGuideActiveProviderMeta?.credentialFile }}</strong>
                ，并将内容复制粘贴到下方输入框。
              </div>

              <div class="app-format-tabs">
                <span
                  v-for="format in appGuideFormats"
                  :key="format"
                  class="app-format-tab"
                  :class="{ active: format === appGuideFormat }"
                  @click="appGuideFormat = format"
                >
                  {{ format }}
                </span>
              </div>

              <pre class="app-code-box">{{ appGuideSnippet }}</pre>
            </div>
          </div>
        </div>

        <template v-else>
          <div class="toolbar">
            <n-space>
              <n-select
                v-model:value="filters.provider"
                clearable
                :options="providerSelectOptions"
                placeholder="平台"
                style="width: 180px"
                @update:value="handleFilterChange"
              />
              <n-select
                v-model:value="filters.isEnabled"
                clearable
                :options="statusOptions"
                placeholder="状态"
                style="width: 120px"
                @update:value="handleFilterChange"
              />
              <n-input
                v-model:value="filters.keyword"
                clearable
                placeholder="搜索渠道名称/备注"
                style="width: 240px"
                @keyup.enter="handleFilterChange"
              />
            </n-space>
            <n-button type="primary" @click="openCreateModal">新增</n-button>
          </div>

          <n-data-table
            :columns="columns"
            :data="listData"
            :loading="loading"
            :pagination="false"
            :row-key="(row) => row.id"
          />

          <div class="mt-4 flex justify-end">
            <n-pagination
              v-model:page="pagination.page"
              v-model:page-size="pagination.pageSize"
              :item-count="pagination.total"
              :page-sizes="[10, 20, 50]"
              show-size-picker
              @update:page="loadList"
              @update:page-size="handlePageSizeChange"
            />
          </div>
        </template>
      </n-card>
    </n-space>

    <n-modal
      v-model:show="modalState.visible"
      preset="card"
      :title="modalState.editingId ? '编辑' : '新增'"
      style="width: 960px"
      :mask-closable="false"
    >
      <n-form
        ref="formRef"
        :model="formState"
        :rules="formRules"
        label-placement="left"
        label-width="160"
      >
        <n-grid :cols="2" :x-gap="16">
          <n-gi :span="2">
            <n-form-item label="推广渠道/代理链接" path="channelName">
              <n-input
                v-model:value="formState.channelName"
                placeholder="请输入推广渠道/代理链接"
              />
            </n-form-item>
          </n-gi>

          <template v-if="formState.scope !== 'third_party_code'">
            <n-gi :span="2">
              <n-form-item label="埋点类型" path="trackingType">
                <n-space>
                  <n-radio-group v-model:value="formState.trackingType">
                    <n-space>
                      <n-radio value="s2s_api">转化API（S2S埋点）</n-radio>
                      <n-radio value="browser">浏览器（Web埋点）</n-radio>
                    </n-space>
                  </n-radio-group>
                </n-space>
            </n-form-item>
            </n-gi>
            <n-gi :span="2">
              <n-form-item label="回传方式配置" path="callbackMode">
                <n-radio-group v-model:value="formState.callbackMode">
                  <n-space>
                    <n-radio value="system">系统推荐（主流方案）</n-radio>
                    <n-radio value="custom">自定义（需专业知识）</n-radio>
                  </n-space>
                </n-radio-group>
              </n-form-item>
            </n-gi>
            
            <n-gi v-if="formState.callbackMode === 'system'" :span="2">
              <n-data-table
                :columns="mappingColumns"
                :data="displayMappings"
                :pagination="false"
                size="small"
                :bordered="true"
              />
              <div class="mt-3 text-xs leading-6 text-[#ff4d4f]">
                <div>提示:</div>
                <div class="text-[#666]">
                  充值事件：包含首充、逻辑为全部充值事件（首充+复充），每次充值成功都会上报1次
                </div>
                <div class="text-[#666]">
                  首充：账号第一次充值，充值成功后，会同时上报 firstrecharge（自定义事件）, StartTrial（标准事件）, deposit（自定义事件）, Purchase（标准事件）
                </div>
                <div class="text-[#666]">
                  复充：不含首充，充值成功后，会同时上报 recharge（复充）, deposit（自定义事件）, Purchase（标准事件）
                </div>
              </div>
            </n-gi>

            <n-gi v-else :span="2">
              <div class="custom-mapping-grid">
                <n-form-item
                  v-for="mapping in displayMappings"
                  :key="mapping.eventKey"
                  :label="mapping.eventName"
                  path="mappings"
                >
                  <n-select
                    v-model:value="mapping.targetEventName"
                    :options="targetEventOptions"
                    placeholder="请选择标准事件"
                    style="width: 340px"
                  />
                </n-form-item>
              </div>
            </n-gi>

            <n-gi :span="2">
              <n-form-item :label="providerPixelIdLabel" path="pixelId">
                <n-input
                  v-model:value="formState.pixelId"
                  :placeholder="`请输入${providerPixelIdLabel}, 例如:1253619738841000`"
                />
              </n-form-item>
            </n-gi>

            <n-gi v-if="formState.trackingType === 's2s_api'" :span="2">
              <n-form-item label="Access_Token" path="accessToken">
                <n-input
                  v-model:value="formState.accessToken"
                  placeholder="请输入Access_Token"
                />
              </n-form-item>
            </n-gi>
          </template>

          <template v-else>
            <n-gi :span="2">
              <n-form-item label="三方统计代码" path="customScript">
                <n-input
                  v-model:value="formState.customScript"
                  type="textarea"
                  :autosize="{ minRows: 8, maxRows: 14 }"
                  placeholder="粘贴 GTM / 统计脚本代码"
                />
              </n-form-item>
            </n-gi>
          </template>

        </n-grid>
      </n-form>

      <template #footer>
        <div class="flex justify-center gap-3">
          <n-button @click="closeModal">取消</n-button>
          <n-button type="primary" :loading="modalState.submitting" @click="submitForm">
            确认
          </n-button>
        </div>
      </template>
    </n-modal>
  </Page>
</template>

<script setup lang="ts">
import { computed, h, onMounted, reactive, ref, watch } from 'vue';
import type { DataTableColumns, FormInst, FormRules } from 'naive-ui';
import {
  NAlert,
  NButton,
  NCard,
  NDataTable,
  NForm,
  NFormItem,
  NGi,
  NGrid,
  NInput,
  NModal,
  NPagination,
  NRadio,
  NRadioGroup,
  NSelect,
  NSpace,
  NTabPane,
  NTabs,
  NTag,
  useDialog,
  useMessage,
} from 'naive-ui';

import { Page } from '@vben/common-ui';

import {
  createThirdPartyTrackingConfigApi,
  deleteThirdPartyTrackingConfigApi,
  getThirdPartyTrackingConfigDetailApi,
  getThirdPartyTrackingConfigsApi,
  getThirdPartyTrackingProvidersApi,
  getThirdPartyTrackingTemplateApi,
  toggleThirdPartyTrackingStatusApi,
  updateThirdPartyTrackingConfigApi,
  type ThirdPartyTrackingConfig,
  type ThirdPartyTrackingMapping,
  type ThirdPartyTrackingProviderDefinition,
  type ThirdPartyTrackingUpsertPayload,
  type TrackingProvider,
  type TrackingScope,
} from '#/api/core/third-party-tracking';

const message = useMessage();
const dialog = useDialog();
const formRef = ref<FormInst | null>(null);

const loading = ref(false);
const listData = ref<ThirdPartyTrackingConfig[]>([]);
const providers = ref<ThirdPartyTrackingProviderDefinition[]>([]);

const filters = reactive<{
  isEnabled: 'disabled' | 'enabled' | null;
  keyword: string;
  provider: null | TrackingProvider;
  scope: TrackingScope;
}>({
  isEnabled: null,
  keyword: '',
  provider: null,
  scope: 'web',
});

const appGuideProviders = [
  {
    key: 'firebase',
    label: 'Firebase',
    description: '（https://firebase.google.com/ Google旗下的一款实时数据分析平台）',
    credentialFile: 'google-services.json',
  },
  {
    key: 'appsflyer',
    label: 'Appsflyer',
    description: '（移动归因与广告效果分析平台）',
    credentialFile: 'appsflyer-dev-key.txt',
  },
  {
    key: 'one_signal',
    label: 'OneSignal',
    description: '（推送触达与行为统计平台）',
    credentialFile: 'onesignal-app-id.txt',
  },
  {
    key: 'facebook_pixel',
    label: 'Facebook pixel',
    description: '（Meta广告转化回传与优化）',
    credentialFile: 'facebook-app-config.json',
  },
  {
    key: 'adjust',
    label: 'Adjust',
    description: '（App归因与反作弊监测平台）',
    credentialFile: 'adjust-app-token.txt',
  },
] as const;

const appGuideActiveProvider = ref<(typeof appGuideProviders)[number]['key']>('firebase');
const appGuideFormats = ['json', 'yaml', 'javascript'] as const;
const appGuideFormat = ref<(typeof appGuideFormats)[number]>('json');

const appGuideActiveProviderMeta = computed(() =>
  appGuideProviders.find((item) => item.key === appGuideActiveProvider.value),
);

const appGuideSnippet = computed(() => {
  const file = appGuideActiveProviderMeta.value?.credentialFile || 'credentials.json';
  if (appGuideFormat.value === 'yaml') {
    return `provider: ${appGuideActiveProvider.value}\ncredentialFile: ${file}\n# paste your credential content here`;
  }
  if (appGuideFormat.value === 'javascript') {
    return `export default {\n  provider: '${appGuideActiveProvider.value}',\n  credentialFile: '${file}',\n  // paste your credential content here\n};`;
  }
  return `{\n  "provider": "${appGuideActiveProvider.value}",\n  "credentialFile": "${file}"\n  // paste your credential content here\n}`;
});

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
});

const modalState = reactive({
  editingId: null as null | number,
  submitting: false,
  visible: false,
});

const formState = reactive<ThirdPartyTrackingUpsertPayload>({
  accessToken: '',
  apiKey: '',
  callbackMode: 'system',
  channelName: '',
  customScript: '',
  isEnabled: true,
  mappings: [],
  pixelId: '',
  provider: 'facebook_meta',
  remark: '',
  scope: 'web',
  timezone: 'UTC',
  trackingType: 'browser',
});

const formRules: FormRules = {
  channelName: [{ message: '请输入渠道名称', required: true, trigger: ['blur', 'input'] }],
  customScript: [
    {
      required: true,
      trigger: ['blur', 'input'],
      validator: (_rule, value: string) => {
        if (formState.scope !== 'third_party_code') {
          return true;
        }
        return Boolean(value && value.trim());
      },
      message: '三方统计代码模式请填写脚本',
    },
  ],
  pixelId: [
    {
      required: true,
      trigger: ['blur', 'input'],
      validator: (_rule, value: string) => {
        if (formState.scope === 'third_party_code') {
          return true;
        }
        return Boolean(value && value.trim());
      },
      message: '请输入 Pixel ID',
    },
  ],
  provider: [
    {
      required: true,
      trigger: ['change'],
      validator: () => {
        if (formState.scope === 'third_party_code') {
          return true;
        }
        return Boolean(formState.provider);
      },
      message: '请选择埋点平台',
    },
  ],
  accessToken: [
    {
      required: true,
      trigger: ['blur', 'input'],
      validator: (_rule, value: string) => {
        if (formState.scope === 'third_party_code' || formState.trackingType !== 's2s_api') {
          return true;
        }
        return Boolean(value && value.trim());
      },
      message: '请输入 Access_Token',
    },
  ],
};

const statusOptions = [
  { label: '启用', value: 'enabled' },
  { label: '停用', value: 'disabled' },
];

const providerLabelMap = computed(() => {
  const map = new Map<string, string>();
  providers.value.forEach((provider) => map.set(provider.key, provider.label));
  return map;
});

const providerSelectOptions = computed(() =>
  providers.value.map((provider) => ({
    label: provider.label,
    value: provider.key,
  })),
);

const activeProviderDefinition = computed(() =>
  providers.value.find((provider) => provider.key === formState.provider),
);

const systemTemplateMappings = ref<ThirdPartyTrackingMapping[]>([]);
const templateEventNameMap = ref<Record<string, string>>({});
const REQUIRED_EVENT_KEYS = ['register', 'rechargeClick', 'firstrecharge', 'deposit'];
const WG_EVENT_NAME_MAP: Record<string, string> = {
  deposit: '充值事件（deposit）',
  deposit_custom: '充值事件（自定义）',
  firstrecharge: '首充到账（firstrecharge）',
  firstrecharge_custom: '首充到账（自定义）',
  rechargeClick: '提交充值/发起结账/点击充值(rechargeClick)',
  recharge_custom: '复充（自定义）',
  register: '注册成功(register)',
};
const FACEBOOK_DEFAULT_SYSTEM_MAPPINGS: ThirdPartyTrackingMapping[] = [
  {
    eventKey: 'register',
    eventName: '注册成功(register)',
    isRequired: true,
    sortOrder: 0,
    targetEventName: 'CompleteRegistration',
  },
  {
    eventKey: 'rechargeClick',
    eventName: '提交充值/发起结账/点击充值(rechargeClick)',
    isRequired: true,
    sortOrder: 1,
    targetEventName: 'InitiateCheckout',
  },
  {
    eventKey: 'firstrecharge',
    eventName: '首充到账（firstrecharge）',
    isRequired: true,
    sortOrder: 2,
    targetEventName: 'StartTrial',
  },
  {
    eventKey: 'deposit',
    eventName: '充值事件（deposit）',
    isRequired: true,
    sortOrder: 3,
    targetEventName: 'Purchase',
  },
  {
    eventKey: 'firstrecharge_custom',
    eventName: '首充到账（自定义）',
    isRequired: false,
    sortOrder: 4,
    targetEventName: 'firstrecharge',
  },
  {
    eventKey: 'recharge_custom',
    eventName: '复充（自定义）',
    isRequired: false,
    sortOrder: 5,
    targetEventName: 'recharge',
  },
  {
    eventKey: 'deposit_custom',
    eventName: '充值事件（自定义）',
    isRequired: false,
    sortOrder: 6,
    targetEventName: 'deposit',
  },
];

const targetEventOptions = computed(() => {
  const availableEvents = activeProviderDefinition.value?.availableEvents || [];
  return availableEvents.map((eventName) => ({
    label: eventName,
    value: eventName,
  }));
});

const providerTableHeaderLabel = computed(() => {
  const label = activeProviderDefinition.value?.label || '平台';
  return label
    .replace('/Meta Pixel', '')
    .replace(' Pixel', '')
    .replace(' Ads', '')
    .trim();
});

const providerPixelIdLabel = computed(() => {
  const label = activeProviderDefinition.value?.label || 'Pixel';
  return `${label} ID`;
});

function getSystemMappings(): ThirdPartyTrackingMapping[] {
  if (systemTemplateMappings.value.length > 0) {
    return systemTemplateMappings.value;
  }

  if (formState.provider === 'facebook_meta') {
    return FACEBOOK_DEFAULT_SYSTEM_MAPPINGS;
  }

  const template = activeProviderDefinition.value?.systemTemplate || [];
  return template.map((mapping, index) => ({
    eventKey: mapping.eventKey,
    eventName: WG_EVENT_NAME_MAP[mapping.eventKey] || mapping.eventKey,
    isRequired: REQUIRED_EVENT_KEYS.includes(mapping.eventKey),
    sortOrder: index,
    targetEventName: mapping.targetEventName,
  }));
}

function normalizeCustomMappings(sourceMappings: ThirdPartyTrackingMapping[] = []) {
  return REQUIRED_EVENT_KEYS.map((eventKey, index) => {
    const source =
      sourceMappings.find((item) => item.eventKey === eventKey) ||
      systemTemplateMappings.value.find((item) => item.eventKey === eventKey);
    return {
      eventKey,
      eventName: templateEventNameMap.value[eventKey] || source?.eventName || eventKey,
      isRequired: true,
      sortOrder: index,
      targetEventName: source?.targetEventName || '',
    };
  });
}

const displayMappings = computed(() => {
  if (formState.scope === 'third_party_code') {
    return [];
  }

  if (formState.callbackMode === 'system') {
    return getSystemMappings();
  }

  return formState.mappings || [];
});

const mappingColumns = computed<DataTableColumns<ThirdPartyTrackingMapping>>(() => {
  return [
    {
      title: 'WG事件',
      key: 'eventName',
      width: 420,
    },
    {
      title: providerTableHeaderLabel.value || '平台',
      key: 'targetEventName',
      render: (row) => row.targetEventName,
    },
  ];
});

const columns = computed<DataTableColumns<ThirdPartyTrackingConfig>>(() => [
  {
    title: '渠道名称',
    key: 'channelName',
    width: 200,
  },
  {
    title: '埋点类型',
    key: 'scope',
    width: 100,
    render: (row) => {
      const scopeLabel: Record<TrackingScope, string> = {
        app: 'APP埋点',
        third_party_code: '三方统计代码',
        web: 'Web埋点',
      };
      return scopeLabel[row.scope] || row.scope;
    },
  },
  {
    title: '埋点方式',
    key: 'provider',
    width: 180,
    render: (row) => providerLabelMap.value.get(row.provider || '') || '-',
  },
  {
    title: '回传配置',
    key: 'callbackMode',
    width: 150,
    render: (row) => (row.callbackMode === 'system' ? '系统推荐' : '自定义'),
  },
  {
    title: 'Pixel ID',
    key: 'pixelId',
    width: 180,
    ellipsis: { tooltip: true },
    render: (row) => row.pixelId || '-',
  },
  {
    title: '状态',
    key: 'isEnabled',
    width: 90,
    render: (row) =>
      h(
        NTag,
        { type: row.isEnabled ? 'success' : 'error', size: 'small' },
        { default: () => (row.isEnabled ? '启用' : '停用') },
      ),
  },
  {
    title: '更新时间',
    key: 'updatedAt',
    width: 180,
    render: (row) => new Date(row.updatedAt).toLocaleString('zh-CN'),
  },
  {
    title: '操作',
    key: 'actions',
    width: 250,
    render: (row) =>
      h('div', { class: 'flex gap-2' }, [
        h(
          NButton,
          {
            size: 'small',
            type: 'primary',
            ghost: true,
            onClick: () => openEditModal(row.id),
          },
          { default: () => '编辑' },
        ),
        h(
          NButton,
          {
            size: 'small',
            onClick: () => handleToggleStatus(row),
          },
          { default: () => (row.isEnabled ? '停用' : '启用') },
        ),
        h(
          NButton,
          {
            size: 'small',
            type: 'error',
            ghost: true,
            onClick: () => handleDelete(row.id),
          },
          { default: () => '删除' },
        ),
      ]),
  },
]);

function resetFormState() {
  formState.accessToken = '';
  formState.apiKey = '';
  formState.callbackMode = 'system';
  formState.channelName = '';
  formState.customScript = '';
  formState.isEnabled = true;
  formState.mappings = [];
  formState.pixelId = '';
  formState.provider = 'facebook_meta';
  formState.remark = '';
  formState.scope = filters.scope;
  formState.timezone = 'UTC';
  formState.trackingType = 'browser';
  systemTemplateMappings.value = [...FACEBOOK_DEFAULT_SYSTEM_MAPPINGS];
}

async function loadProviderDefinitions() {
  const response: any = await getThirdPartyTrackingProvidersApi();
  providers.value = response?.data || [];
}

async function loadTemplate(provider?: TrackingProvider) {
  if (!provider) {
    systemTemplateMappings.value = [];
    return;
  }
  const response: any = await getThirdPartyTrackingTemplateApi(provider);
  const mappings = response?.data?.mappings || [];
  const events = response?.data?.events || [];
  templateEventNameMap.value = Object.fromEntries(
    events.map((event: { eventKey: string; eventName: string }) => [event.eventKey, event.eventName]),
  );
  systemTemplateMappings.value = mappings;

  if (formState.callbackMode === 'custom') {
    formState.mappings = normalizeCustomMappings(
      mappings.map((mapping: ThirdPartyTrackingMapping, index: number) => ({
        ...mapping,
        eventName: templateEventNameMap.value[mapping.eventKey] || mapping.eventName,
        sortOrder: index,
      })),
    );
  }
}

async function loadList() {
  if (filters.scope === 'app') {
    listData.value = [];
    pagination.total = 0;
    return;
  }

  loading.value = true;
  try {
    const response: any = await getThirdPartyTrackingConfigsApi({
      isEnabled:
        filters.isEnabled === null ? undefined : filters.isEnabled === 'enabled',
      keyword: filters.keyword || undefined,
      page: pagination.page,
      pageSize: pagination.pageSize,
      provider: filters.provider || undefined,
      scope: filters.scope,
    });

    listData.value = response?.data?.list || [];
    pagination.total = response?.data?.pagination?.total || 0;
  } catch (error) {
    console.error('Failed to load third-party tracking list:', error);
    message.error('加载三方埋点列表失败');
  } finally {
    loading.value = false;
  }
}

function handleFilterChange() {
  pagination.page = 1;
  loadList();
}

function handlePageSizeChange(pageSize: number) {
  pagination.pageSize = pageSize;
  pagination.page = 1;
  loadList();
}

function openCreateModal() {
  modalState.editingId = null;
  resetFormState();
  modalState.visible = true;
}

async function openEditModal(id: number) {
  try {
    const response: any = await getThirdPartyTrackingConfigDetailApi(id);
    const detail = response?.data;
    if (!detail) {
      message.error('获取配置详情失败');
      return;
    }

    modalState.editingId = id;
    modalState.visible = true;

    formState.accessToken = detail.accessToken || '';
    formState.apiKey = detail.apiKey || '';
    formState.callbackMode = detail.callbackMode;
    formState.channelName = detail.channelName;
    formState.customScript = detail.customScript || '';
    formState.isEnabled = detail.isEnabled;
    formState.mappings = detail.mappings || [];
    formState.pixelId = detail.pixelId || '';
    formState.provider = detail.provider || 'facebook_meta';
    formState.remark = detail.remark || '';
    formState.scope = detail.scope;
    formState.timezone = detail.timezone || 'UTC';
    formState.trackingType = detail.trackingType;

    if (detail.provider) {
      await loadTemplate(detail.provider);
    }

    if (formState.callbackMode === 'custom' && formState.scope !== 'third_party_code') {
      formState.mappings = normalizeCustomMappings(detail.mappings || []);
    }
  } catch (error) {
    console.error('Failed to load detail:', error);
    message.error('加载配置详情失败');
  }
}

function closeModal() {
  modalState.visible = false;
}

function getSubmitMappings(): ThirdPartyTrackingMapping[] {
  if (formState.scope === 'third_party_code') {
    return [];
  }

  if (formState.callbackMode === 'system') {
    return getSystemMappings();
  }

  return normalizeCustomMappings(formState.mappings || []).filter((item) =>
    item.targetEventName?.trim(),
  );
}

async function submitForm() {
  try {
    await formRef.value?.validate();
  } catch {
    return;
  }

  const mappings = getSubmitMappings();
  if (
    formState.callbackMode === 'custom' &&
    formState.scope !== 'third_party_code' &&
    mappings.length !== REQUIRED_EVENT_KEYS.length
  ) {
    message.error('自定义模式请完整选择4个标准事件映射');
    return;
  }

  modalState.submitting = true;
  try {
    const payload: ThirdPartyTrackingUpsertPayload = {
      accessToken: formState.accessToken || null,
      apiKey: formState.apiKey || null,
      callbackMode: formState.callbackMode,
      channelName: formState.channelName.trim(),
      customScript: formState.customScript || null,
      isEnabled: formState.isEnabled,
      mappings,
      pixelId: formState.pixelId || null,
      provider: formState.scope === 'third_party_code' ? 'gtm' : formState.provider,
      remark: formState.remark || null,
      scope: formState.scope,
      timezone: formState.timezone || 'UTC',
      trackingType: formState.trackingType,
    };

    if (modalState.editingId) {
      await updateThirdPartyTrackingConfigApi(modalState.editingId, payload);
      message.success('配置更新成功');
    } else {
      await createThirdPartyTrackingConfigApi(payload);
      message.success('配置创建成功');
    }

    modalState.visible = false;
    loadList();
  } catch (error) {
    console.error('Failed to submit form:', error);
    message.error('保存失败');
  } finally {
    modalState.submitting = false;
  }
}

function handleToggleStatus(row: ThirdPartyTrackingConfig) {
  const nextStatus = !row.isEnabled;
  const label = nextStatus ? '启用' : '停用';
  dialog.warning({
    title: `确认${label}`,
    content: `确认要${label}该埋点配置吗？`,
    positiveText: '确认',
    negativeText: '取消',
    async onPositiveClick() {
      try {
        await toggleThirdPartyTrackingStatusApi(row.id, nextStatus);
        message.success(`${label}成功`);
        loadList();
      } catch (error) {
        console.error('Failed to toggle status:', error);
        message.error(`${label}失败`);
      }
    },
  });
}

function handleDelete(id: number) {
  dialog.error({
    title: '确认删除',
    content: '删除后不可恢复，是否继续？',
    positiveText: '删除',
    negativeText: '取消',
    async onPositiveClick() {
      try {
        await deleteThirdPartyTrackingConfigApi(id);
        message.success('删除成功');
        loadList();
      } catch (error) {
        console.error('Failed to delete config:', error);
        message.error('删除失败');
      }
    },
  });
}

watch(
  () => formState.provider,
  (provider) => {
    if (formState.scope === 'third_party_code') {
      return;
    }
    if (provider) {
      loadTemplate(provider);
    }
  },
  { immediate: false },
);

watch(
  () => formState.callbackMode,
  (mode) => {
    if (formState.scope === 'third_party_code') {
      return;
    }
    if (mode === 'custom') {
      formState.mappings = normalizeCustomMappings(formState.mappings || []);
    }
  },
);

watch(
  () => formState.scope,
  (scope) => {
    if (scope === 'third_party_code') {
      formState.provider = 'gtm';
      formState.callbackMode = 'system';
      formState.trackingType = 'browser';
      formState.mappings = [];
      return;
    }

    if (formState.provider === 'gtm') {
      formState.provider = 'facebook_meta';
    }
  },
);

onMounted(async () => {
  await loadProviderDefinitions();
  await loadTemplate('facebook_meta');
  await loadList();
});
</script>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.app-tracking-panel {
  margin-top: 8px;
  border: 1px solid #f0f0f0;
}

.app-tip-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: #fffbe6;
  border-bottom: 1px solid #f0f0f0;
  gap: 12px;
}

.app-tip-text {
  font-size: 12px;
  color: #8c8c8c;
}

.app-tip-prefix {
  color: #d4380d;
}

.app-tip-link {
  margin-left: 8px;
  color: #1677ff;
  text-decoration: none;
}

.app-content {
  display: grid;
  grid-template-columns: 180px 1fr;
  min-height: 380px;
}

.app-provider-list {
  border-right: 1px solid #f0f0f0;
  background: #fafafa;
}

.app-provider-item {
  padding: 10px 12px;
  font-size: 13px;
  border-bottom: 1px solid #f5f5f5;
  cursor: pointer;
}

.app-provider-item.active {
  color: #1677ff;
  background: #e6f4ff;
  font-weight: 600;
}

.app-provider-detail {
  padding: 12px 16px;
}

.app-provider-title {
  font-size: 14px;
  font-weight: 600;
  color: #262626;
}

.app-provider-desc {
  margin-left: 8px;
  font-size: 12px;
  font-weight: 400;
  color: #8c8c8c;
}

.app-provider-instruction {
  margin-top: 10px;
  margin-bottom: 10px;
  color: #595959;
  font-size: 12px;
}

.app-format-tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 8px;
}

.app-format-tab {
  border: 1px solid #d9d9d9;
  color: #595959;
  font-size: 12px;
  padding: 2px 10px;
  border-radius: 4px;
  cursor: pointer;
}

.app-format-tab.active {
  border-color: #1677ff;
  color: #1677ff;
}

.app-code-box {
  border: 1px solid #f0f0f0;
  background: #fafafa;
  min-height: 260px;
  padding: 12px;
  margin: 0;
  white-space: pre-wrap;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 12px;
  line-height: 1.6;
  color: #262626;
}
</style>
