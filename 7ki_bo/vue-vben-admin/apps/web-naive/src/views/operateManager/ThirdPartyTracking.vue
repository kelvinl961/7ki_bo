<template>
  <Page :title="$t('operations.tracking.title')" :description="$t('operations.tracking.description')">
    <n-space vertical :size="16">
      <n-alert type="warning" :show-icon="false">
        <template #header>{{ $t('operations.tracking.noticeTitle') }}</template>
        <div class="leading-6">
          <div>
            {{ $t('operations.tracking.notice1') }}
          </div>
          <div>
            {{ $t('operations.tracking.notice2') }}
          </div>
          <div>
            {{ $t('operations.tracking.notice3') }}
          </div>
          <div>{{ $t('operations.tracking.notice4') }}</div>
        </div>
      </n-alert>

      <n-card>
        <n-tabs
          v-model:value="filters.scope"
          @update:value="handleFilterChange"
        >
          <n-tab-pane name="web" :tab="$t('operations.tracking.tabWeb')" />
          <n-tab-pane name="app" :tab="$t('operations.tracking.tabApp')" />
          <n-tab-pane name="third_party_code" :tab="$t('operations.tracking.tabThirdPartyCode')" />
        </n-tabs>

        <div v-if="filters.scope === 'app'" class="app-tracking-panel">
          <div class="app-tip-row">
            <div class="app-tip-text">
              <span class="app-tip-prefix">{{ $t('operations.tracking.appTipPrefix') }}</span>
              {{ $t('operations.tracking.appTip') }}
              <a class="app-tip-link" href="javascript:void(0)">{{ $t('operations.tracking.appTipLink') }}</a>
            </div>
            <n-button type="primary" size="small">{{ $t('common.modify') }}</n-button>
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
                {{ $t('operations.tracking.appInstruction', [appGuideActiveProviderMeta?.label || '', '']) }}
                <strong>{{ appGuideActiveProviderMeta?.credentialFile }}</strong>
                
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
                :placeholder="$t('operations.tracking.platform')"
                style="width: 180px"
                @update:value="handleFilterChange"
              />
              <n-select
                v-model:value="filters.isEnabled"
                clearable
                :options="statusOptions"
                :placeholder="$t('common.status')"
                style="width: 120px"
                @update:value="handleFilterChange"
              />
              <n-input
                v-model:value="filters.keyword"
                clearable
                :placeholder="$t('operations.tracking.searchChannel')"
                style="width: 240px"
                @keyup.enter="handleFilterChange"
              />
            </n-space>
            <n-button type="primary" @click="openCreateModal">{{ $t('common.create') }}</n-button>
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
      :title="modalState.editingId ? $t('operations.tracking.edit') : $t('operations.tracking.create')"
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
            <n-form-item :label="$t('operations.tracking.channelAgentLink')" path="channelName">
              <n-input
                v-model:value="formState.channelName"
                :placeholder="$t('operations.tracking.channelAgentLinkPlaceholder')"
              />
            </n-form-item>
          </n-gi>

          <template v-if="formState.scope !== 'third_party_code'">
            <n-gi :span="2">
              <n-form-item :label="$t('operations.tracking.trackingType')" path="trackingType">
                <n-space>
                  <n-radio-group v-model:value="formState.trackingType">
                    <n-space>
                      <n-radio value="s2s_api">{{ $t('operations.tracking.s2sApi') }}</n-radio>
                      <n-radio value="browser">{{ $t('operations.tracking.browserWeb') }}</n-radio>
                    </n-space>
                  </n-radio-group>
                </n-space>
            </n-form-item>
            </n-gi>
            <n-gi :span="2">
              <n-form-item :label="$t('operations.tracking.callbackConfig')" path="callbackMode">
                <n-radio-group v-model:value="formState.callbackMode">
                  <n-space>
                    <n-radio value="system">{{ $t('operations.tracking.systemRecommend') }}</n-radio>
                    <n-radio value="custom">{{ $t('operations.tracking.customExpert') }}</n-radio>
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
                <div>{{ $t('operations.tracking.tip') }}</div>
                <div class="text-[#666]">
                  {{ $t('operations.tracking.depositEventTip') }}
                </div>
                <div class="text-[#666]">
                  {{ $t('operations.tracking.firstDepositTip') }}
                </div>
                <div class="text-[#666]">
                  {{ $t('operations.tracking.repeatDepositTip') }}
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
                    :placeholder="$t('operations.tracking.selectStandardEvent')"
                    style="width: 340px"
                  />
                </n-form-item>
              </div>
            </n-gi>

            <n-gi :span="2">
              <n-form-item :label="providerPixelIdLabel" path="pixelId">
                <n-input
                  v-model:value="formState.pixelId"
                  :placeholder="$t('operations.tracking.pixelIdPlaceholder', [providerPixelIdLabel])"
                />
              </n-form-item>
            </n-gi>

            <n-gi v-if="formState.trackingType === 's2s_api'" :span="2">
              <n-form-item label="Access_Token" path="accessToken">
                <n-input
                  v-model:value="formState.accessToken"
                  :placeholder="$t('operations.tracking.accessTokenPlaceholder')"
                />
              </n-form-item>
            </n-gi>
          </template>

          <template v-else>
            <n-gi :span="2">
              <n-form-item :label="$t('operations.tracking.thirdPartyScript')" path="customScript">
                <n-input
                  v-model:value="formState.customScript"
                  type="textarea"
                  :autosize="{ minRows: 8, maxRows: 14 }"
                  :placeholder="$t('operations.tracking.scriptPlaceholder')"
                />
              </n-form-item>
            </n-gi>
          </template>

        </n-grid>
      </n-form>

      <template #footer>
        <div class="flex justify-center gap-3">
          <n-button @click="closeModal">{{ $t('common.cancel') }}</n-button>
          <n-button type="primary" :loading="modalState.submitting" @click="submitForm">
            {{ $t('common.confirm') }}
          </n-button>
        </div>
      </template>
    </n-modal>
  </Page>
</template>

<script setup lang="ts">
import { $t } from '@vben/locales';

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
    description: $t('operations.tracking.providerDescFirebase'),
    credentialFile: 'google-services.json',
  },
  {
    key: 'appsflyer',
    label: 'Appsflyer',
    description: $t('operations.tracking.providerDescAppsflyer'),
    credentialFile: 'appsflyer-dev-key.txt',
  },
  {
    key: 'one_signal',
    label: 'OneSignal',
    description: $t('operations.tracking.providerDescOneSignal'),
    credentialFile: 'onesignal-app-id.txt',
  },
  {
    key: 'facebook_pixel',
    label: 'Facebook pixel',
    description: $t('operations.tracking.providerDescFacebook'),
    credentialFile: 'facebook-app-config.json',
  },
  {
    key: 'adjust',
    label: 'Adjust',
    description: $t('operations.tracking.providerDescAdjust'),
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
  channelName: [{ message: $t('operations.tracking.validateChannelName'), required: true, trigger: ['blur', 'input'] }],
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
      message: $t('operations.tracking.validateScript'),
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
      message: $t('operations.tracking.validatePixelId'),
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
      message: $t('operations.tracking.validateProvider'),
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
      message: $t('operations.tracking.validateAccessToken'),
    },
  ],
};

const statusOptions = [
  { label: $t('common.enable'), value: 'enabled' },
  { label: $t('common.disable'), value: 'disabled' },
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
  deposit: $t('operations.tracking.eventDeposit'),
  deposit_custom: $t('operations.tracking.eventDepositCustom'),
  firstrecharge: $t('operations.tracking.eventFirstRecharge'),
  firstrecharge_custom: $t('operations.tracking.eventFirstRechargeCustom'),
  rechargeClick: $t('operations.tracking.eventRechargeClick'),
  recharge_custom: $t('operations.tracking.eventRechargeCustom'),
  register: $t('operations.tracking.eventRegister'),
};
const FACEBOOK_DEFAULT_SYSTEM_MAPPINGS: ThirdPartyTrackingMapping[] = [
  {
    eventKey: 'register',
    eventName: $t('operations.tracking.eventRegister'),
    isRequired: true,
    sortOrder: 0,
    targetEventName: 'CompleteRegistration',
  },
  {
    eventKey: 'rechargeClick',
    eventName: $t('operations.tracking.eventRechargeClick'),
    isRequired: true,
    sortOrder: 1,
    targetEventName: 'InitiateCheckout',
  },
  {
    eventKey: 'firstrecharge',
    eventName: $t('operations.tracking.eventFirstRecharge'),
    isRequired: true,
    sortOrder: 2,
    targetEventName: 'StartTrial',
  },
  {
    eventKey: 'deposit',
    eventName: $t('operations.tracking.eventDeposit'),
    isRequired: true,
    sortOrder: 3,
    targetEventName: 'Purchase',
  },
  {
    eventKey: 'firstrecharge_custom',
    eventName: $t('operations.tracking.eventFirstRechargeCustom'),
    isRequired: false,
    sortOrder: 4,
    targetEventName: 'firstrecharge',
  },
  {
    eventKey: 'recharge_custom',
    eventName: $t('operations.tracking.eventRechargeCustom'),
    isRequired: false,
    sortOrder: 5,
    targetEventName: 'recharge',
  },
  {
    eventKey: 'deposit_custom',
    eventName: $t('operations.tracking.eventDepositCustom'),
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
  const label = activeProviderDefinition.value?.label || $t('operations.tracking.platform');
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
      title: $t('operations.tracking.wgEvent'),
      key: 'eventName',
      width: 420,
    },
    {
      title: providerTableHeaderLabel.value || $t('operations.tracking.platform'),
      key: 'targetEventName',
      render: (row) => row.targetEventName,
    },
  ];
});

const columns = computed<DataTableColumns<ThirdPartyTrackingConfig>>(() => [
  {
    title: $t('operations.tracking.channelName'),
    key: 'channelName',
    width: 200,
  },
  {
    title: $t('operations.tracking.trackingScope'),
    key: 'scope',
    width: 100,
    render: (row) => {
      const scopeLabel: Record<TrackingScope, string> = {
        app: $t('operations.tracking.scopeApp'),
        third_party_code: $t('operations.tracking.scopeThirdParty'),
        web: $t('operations.tracking.scopeWeb'),
      };
      return scopeLabel[row.scope] || row.scope;
    },
  },
  {
    title: $t('operations.tracking.trackingMethod'),
    key: 'provider',
    width: 180,
    render: (row) => providerLabelMap.value.get(row.provider || '') || '-',
  },
  {
    title: $t('operations.tracking.callbackMode'),
    key: 'callbackMode',
    width: 150,
    render: (row) => (row.callbackMode === 'system' ? $t('operations.tracking.systemMode') : $t('operations.tracking.customMode')),
  },
  {
    title: 'Pixel ID',
    key: 'pixelId',
    width: 180,
    ellipsis: { tooltip: true },
    render: (row) => row.pixelId || '-',
  },
  {
    title: $t('common.status'),
    key: 'isEnabled',
    width: 90,
    render: (row) =>
      h(
        NTag,
        { type: row.isEnabled ? 'success' : 'error', size: 'small' },
        { default: () => (row.isEnabled ? $t('common.enable') : $t('common.disable')) },
      ),
  },
  {
    title: $t('operations.tracking.updatedAt'),
    key: 'updatedAt',
    width: 180,
    render: (row) => new Date(row.updatedAt).toLocaleString('zh-CN'),
  },
  {
    title: $t('common.actions'),
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
          { default: () => $t('common.edit') },
        ),
        h(
          NButton,
          {
            size: 'small',
            onClick: () => handleToggleStatus(row),
          },
          { default: () => (row.isEnabled ? $t('common.disable') : $t('common.enable')) },
        ),
        h(
          NButton,
          {
            size: 'small',
            type: 'error',
            ghost: true,
            onClick: () => handleDelete(row.id),
          },
          { default: () => $t('common.delete') },
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
    message.error($t('operations.tracking.loadListFailed'));
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
      message.error($t('operations.tracking.fetchDetailFailed'));
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
    message.error($t('operations.tracking.loadDetailFailed'));
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
    message.error($t('operations.tracking.customMappingRequired'));
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
      message.success($t('operations.tracking.updateSuccess'));
    } else {
      await createThirdPartyTrackingConfigApi(payload);
      message.success($t('operations.tracking.createSuccess'));
    }

    modalState.visible = false;
    loadList();
  } catch (error) {
    console.error('Failed to submit form:', error);
    message.error($t('operations.tracking.saveFailed'));
  } finally {
    modalState.submitting = false;
  }
}

function handleToggleStatus(row: ThirdPartyTrackingConfig) {
  const nextStatus = !row.isEnabled;
  const label = nextStatus ? $t('common.enable') : $t('common.disable');
  dialog.warning({
    title: $t('operations.tracking.confirmToggle', [label]),
    content: $t('operations.tracking.confirmToggleContent', [label]),
    positiveText: $t('common.confirm'),
    negativeText: $t('common.cancel'),
    async onPositiveClick() {
      try {
        await toggleThirdPartyTrackingStatusApi(row.id, nextStatus);
        message.success($t('operations.tracking.toggleSuccess', [label]));
        loadList();
      } catch (error) {
        console.error('Failed to toggle status:', error);
        message.error($t('operations.tracking.toggleFailed', [label]));
      }
    },
  });
}

function handleDelete(id: number) {
  dialog.error({
    title: $t('operations.tracking.confirmDelete'),
    content: $t('operations.tracking.deleteIrreversible'),
    positiveText: $t('common.delete'),
    negativeText: $t('common.cancel'),
    async onPositiveClick() {
      try {
        await deleteThirdPartyTrackingConfigApi(id);
        message.success($t('common.deleteSuccess'));
        loadList();
      } catch (error) {
        console.error('Failed to delete config:', error);
        message.error($t('operations.domain.message.deleteFailed'));
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
