<template>
  <div class="online-customer-service-tab p-4">
    <n-spin :show="loading">
      <n-space justify="end" class="mb-4">
        <n-button v-if="!isEditing" type="primary" @click="enableEdit">
          {{ $t('operations.customerService.edit') }}
        </n-button>
        <n-space v-else>
          <n-button @click="cancelEdit"> {{ $t('common.cancel') }} </n-button>
          <n-button type="primary" :loading="saving" @click="saveConfig">
            {{ $t('common.save') }}
          </n-button>
        </n-space>
      </n-space>

      <n-card :title="$t('operations.customerService.basicSettings')" class="mb-4">
        <n-space vertical :size="20">
          <n-space align="center" justify="space-between">
            <div>
              <div class="font-semibold">{{ $t('operations.customerService.skipMessageCenter') }}</div>
              <div class="text-sm text-gray-500">
                {{ $t('operations.customerService.skipMessageCenterDesc') }}
              </div>
            </div>
            <n-switch
              v-model:value="formData.skipMessageCenter"
              :disabled="!isEditing"
            />
          </n-space>

          <n-space align="center" justify="space-between">
            <div>
              <div class="font-semibold">{{ $t('operations.customerService.onlineServiceToggle') }}</div>
              <div class="text-sm text-gray-500">
                {{ $t('operations.customerService.onlineServiceToggleDesc') }}
              </div>
            </div>
            <n-switch
              v-model:value="formData.onlineServiceEnabled"
              :disabled="!isEditing"
            />
          </n-space>
        </n-space>
      </n-card>

      <n-card :title="$t('operations.customerService.serviceLinkSettings')" class="mb-4">
        <n-form :model="formData" label-placement="top">
          <n-form-item :label="$t('operations.customerService.brandSelect')">
            <n-input
              v-model:value="formData.brandId"
              :placeholder="$t('operations.customerService.brandIdPlaceholder')"
              :disabled="!isEditing"
            />
          </n-form-item>

          <n-form-item :label="$t('operations.customerService.serviceLinkH5App')">
            <n-space vertical class="w-full" :size="12">
              <n-alert type="info" :show-icon="false" style="margin-bottom: 8px">
                {{ $t('operations.customerService.serviceLinkNote') }}
              </n-alert>

              <div
                v-for="(link, index) in serviceLinkList"
                :key="index"
                class="w-full"
              >
                <n-space align="center" :size="8" :wrap="false">
                  <n-select
                    v-model:value="link.language"
                    :options="languageOptions"
                    :placeholder="$t('operations.language')"
                    style="width: 140px"
                    :disabled="!isEditing"
                  />
                  <n-input
                    v-model:value="link.serviceName"
                    :placeholder="$t('operations.customerService.serviceName')"
                    :disabled="!isEditing"
                    style="width: 150px"
                  />
                  <n-select
                    v-model:value="link.openMethod"
                    :options="openMethodOptions"
                    :placeholder="$t('operations.customerService.openMethod')"
                    style="width: 160px"
                    :disabled="!isEditing"
                  />
                  <n-input
                    v-model:value="link.url"
                    :placeholder="$t('operations.customerService.lineUrlPlaceholder')"
                    :disabled="!isEditing"
                    style="flex: 1; min-width: 250px"
                  />
                  <n-button
                    v-if="isEditing"
                    @click="addServiceLink"
                    type="primary"
                    circle
                  >
                    <template #icon>
                      <span>+</span>
                    </template>
                  </n-button>
                  <n-button
                    v-if="isEditing && serviceLinkList.length > 1"
                    @click="removeServiceLink(index)"
                    type="error"
                    circle
                  >
                    <template #icon>
                      <span>-</span>
                    </template>
                  </n-button>
                </n-space>
              </div>

              <div
                v-if="serviceLinkList.length === 0 && !isEditing"
                class="py-4 text-center text-sm text-gray-400"
              >
                {{ $t('operations.customerService.noServiceLinks') }}
              </div>
            </n-space>
          </n-form-item>
        </n-form>
      </n-card>

      <n-card :title="$t('operations.customerService.h5FloatingSettings')" class="mb-4">
        <n-space vertical :size="16">
          <n-form :model="formData" label-placement="top">
            <n-form-item :label="$t('operations.customerService.h5Floating')">
              <n-switch
                v-model:value="formData.h5FloatingEnabled"
                :disabled="!isEditing"
              />
            </n-form-item>

            <template v-if="formData.h5FloatingEnabled">
              <n-form-item :label="$t('operations.customerService.serviceSystem')">
                <n-radio-group
                  v-model:value="formData.h5ServiceSystem"
                  :disabled="!isEditing"
                >
                  <n-space>
                    <n-radio value="LIVECHAT">Livechat</n-radio>
                    <n-radio value="OTHER_SYSTEM">{{ $t('operations.customerService.otherSystem') }}</n-radio>
                  </n-space>
                </n-radio-group>
              </n-form-item>

              <n-form-item :label="$t('operations.customerService.displayMode')">
                <n-radio-group
                  v-model:value="formData.h5DisplayLocation"
                  :disabled="!isEditing"
                >
                  <n-space>
                    <n-radio value="HOME_ONLY">{{ $t('operations.customerService.homeOnly') }}</n-radio>
                    <n-radio value="ALL_PAGES">{{ $t('operations.customerService.allPages') }}</n-radio>
                  </n-space>
                </n-radio-group>
              </n-form-item>

              <n-form-item
                v-if="formData.h5ServiceSystem !== 'OTHER_SYSTEM'"
                :label="$t('operations.customerService.embedCode')"
              >
                <n-space vertical class="w-full" :size="8">
                  <n-alert type="info" :show-icon="false">
                    {{ $t('operations.customerService.embedCodeNote') }}
                  </n-alert>
                  <n-input
                    v-model:value="formData.h5EmbedCode"
                    :placeholder="$t('operations.customerService.embedCodePlaceholder')"
                    type="textarea"
                    :autosize="{ minRows: 4, maxRows: 8 }"
                    :disabled="!isEditing"
                  />
                </n-space>
              </n-form-item>

              <template v-else>
                <n-form-item :label="$t('operations.customerService.serviceOpenMethod')">
                  <n-radio-group
                    v-model:value="formData.h5OpenMethod"
                    :disabled="!isEditing"
                  >
                    <n-space>
                      <n-radio value="APP_INTERNAL">{{ $t('operations.customerService.appInternal') }}</n-radio>
                      <n-radio value="EXTERNAL_BROWSER">{{ $t('operations.customerService.externalBrowser') }}</n-radio>
                    </n-space>
                  </n-radio-group>
                </n-form-item>

                <n-form-item :label="$t('operations.customerService.serviceIcon')">
                  <n-space vertical class="w-full" :size="8">
                    <n-alert type="info" :show-icon="false">
                      {{ $t('operations.customerService.serviceIconNote') }}
                    </n-alert>
                    <MediaLibrarySelector
                      v-model="formData.h5IconUrl"
                      category="icons"
                      :accept-types="['image']"
                      :placeholder="$t('operations.customerService.selectServiceIcon')"
                    />
                  </n-space>
                </n-form-item>

                <n-form-item :label="$t('operations.customerService.serviceLink')">
                  <n-input
                    v-model:value="formData.h5LinkUrl"
                    :placeholder="$t('operations.customerService.enterServiceLink')"
                    :disabled="!isEditing"
                  />
                </n-form-item>
              </template>
            </template>
          </n-form>
        </n-space>
      </n-card>

      <n-card :title="$t('operations.customerService.livechatSdkConfig')" class="mb-4">
        <n-alert type="info" class="mb-4">
          {{ $t('operations.customerService.livechatSdkNote') }}
        </n-alert>

        <n-form :model="formData" label-placement="top">
          <n-form-item :label="$t('operations.customerService.enableLivechatSdk')">
            <n-switch
              v-model:value="formData.livechatEnabled"
              :disabled="!isEditing"
            />
          </n-form-item>

          <template v-if="formData.livechatEnabled">
            <n-form-item :label="$t('operations.customerService.brandIds')">
              <n-input
                v-model:value="brandIdsInput"
                :placeholder="$t('operations.customerService.brandIdsPlaceholder')"
                @blur="updateBrandIds"
                :disabled="!isEditing"
              />
            </n-form-item>

            <n-form-item :label="$t('operations.customerService.displayLocation')">
              <n-radio-group
                v-model:value="formData.livechatDisplayLocation"
                :disabled="!isEditing"
              >
                <n-space>
                  <n-radio value="HOME_ONLY">{{ $t('operations.customerService.homeOnly') }}</n-radio>
                  <n-radio value="ALL_PAGES">{{ $t('operations.customerService.allPages') }}</n-radio>
                </n-space>
              </n-radio-group>
            </n-form-item>

            <n-form-item :label="$t('operations.customerService.groupId')">
              <n-space vertical class="w-full" :size="8">
                <n-alert type="warning" :show-icon="false">
                  {{ $t('operations.customerService.groupIdWarning') }}
                </n-alert>
                <n-input
                  v-model:value="formData.livechatGroupId"
                  :placeholder="$t('operations.customerService.groupIdPlaceholder')"
                  :disabled="!isEditing"
                />
              </n-space>
            </n-form-item>

            <n-form-item :label="$t('operations.customerService.licenseId')">
              <n-space vertical class="w-full" :size="8">
                <n-alert type="info" :show-icon="false">
                  {{ $t('operations.customerService.licenseIdNote') }}
                </n-alert>
                <n-input
                  v-model:value="formData.livechatLicenseId"
                  :placeholder="$t('operations.customerService.licenseIdPlaceholder')"
                  :disabled="!isEditing"
                />
              </n-space>
            </n-form-item>
          </template>
        </n-form>
      </n-card>

      <div style="display: none">
        <n-space justify="end" class="mt-4">
          <n-button @click="resetForm">{{ $t('common.reset') }}</n-button>
          <n-button type="primary" @click="saveConfig" :loading="saving">
            {{ $t('common.save') }}
          </n-button>
        </n-space>
      </div>
    </n-spin>

    <n-modal
      v-model:show="showLanguageModal"
      preset="card"
      :title="$t('operations.customerService.languageSettings')"
      style="width: 600px"
    >
      <n-form :model="languageForm">
        <n-form-item :label="$t('operations.language')">
          <n-select
            v-model:value="languageForm.language"
            :options="languageOptions"
            :placeholder="$t('operations.customerService.selectLanguage')"
          />
        </n-form-item>

        <n-form-item :label="$t('operations.customerService.serviceName')">
          <n-input
            v-model:value="languageForm.serviceName"
            :placeholder="$t('operations.customerService.enterServiceName')"
          />
        </n-form-item>
      </n-form>

      <template #footer>
        <n-space justify="end">
          <n-button @click="showLanguageModal = false">{{ $t('common.cancel') }}</n-button>
          <n-button type="primary" @click="addLanguageConfig"> {{ $t('common.confirm') }} </n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { $t } from '@vben/locales';

import { ref, onMounted, computed, defineAsyncComponent } from 'vue';
import {
  NCard,
  NSpace,
  NSwitch,
  NForm,
  NFormItem,
  NInput,
  NInputGroup,
  NButton,
  NRadioGroup,
  NRadio,
  NSpin,
  NAlert,
  NModal,
  NSelect,
  NTag,
  useMessage,
} from 'naive-ui';
import {
  getOnlineCustomerServiceConfig,
  updateOnlineCustomerServiceConfig,
  type OnlineCustomerServiceConfig,
  type LanguageConfig,
} from '#/api/operations/customerService';

const message = useMessage();
const MediaLibrarySelector = defineAsyncComponent(
  () => import('#/components/MediaLibrarySelector.vue'),
);

// Loading states
const loading = ref(false);
const saving = ref(false);
const isEditing = ref(false);

// Store original data for cancel
const originalData = ref<OnlineCustomerServiceConfig | null>(null);

// Form data
const formData = ref<OnlineCustomerServiceConfig>({
  brandId: '',
  skipMessageCenter: false,
  onlineServiceEnabled: true,
  serviceLinkUrl: '',
  openMethod: 'APP_INTERNAL',
  languageConfigs: [],
  h5FloatingEnabled: false,
  h5DisplayLocation: 'ALL_PAGES',
  h5EmbedCode: '',
  h5ServiceSystem: 'LIVECHAT',
  h5OpenMethod: 'APP_INTERNAL',
  h5IconUrl: '',
  h5LinkUrl: '',
  livechatEnabled: false,
  livechatBrandIds: [],
  livechatDisplayLocation: 'ALL_PAGES',
  livechatGroupId: '',
  livechatLicenseId: '',
});

// Service link list (for multiple links with language info)
const serviceLinkList = ref<
  Array<{
    language: string;
    serviceName: string;
    openMethod: string;
    url: string;
  }>
>([]);

// Open method options
const openMethodOptions = computed(() => [
  { label: $t('operations.customerService.openMethodAppInternal'), value: 'APP_INTERNAL' },
  { label: $t('operations.customerService.openMethodExternal'), value: 'EXTERNAL_BROWSER' },
]);

// Brand IDs input (for easier management)
const brandIdsInput = ref('');

// Language configuration modal
const showLanguageModal = ref(false);
const languageForm = ref<LanguageConfig>({
  language: '',
  serviceName: '',
});

const languageOptions = computed(() => [
  { label: `${$t('operations.faq.languages.zh-CN')} (zh-CN)`, value: 'zh-CN' },
  { label: `${$t('operations.faq.languages.zh-TW')} (zh-TW)`, value: 'zh-TW' },
  { label: `${$t('operations.faq.languages.en')} (en)`, value: 'en' },
  { label: `${$t('operations.faq.languages.pt-BR')} (pt-BR)`, value: 'pt-BR' },
  { label: `${$t('operations.faq.languages.es')} (es)`, value: 'es' },
  { label: `${$t('operations.faq.languages.th')} (th)`, value: 'th' },
  { label: `${$t('operations.faq.languages.vi')} (vi)`, value: 'vi' },
]);

// Load configuration
const loadConfig = async () => {
  loading.value = true;
  try {
    const response = await getOnlineCustomerServiceConfig();
    // Handle both response formats and null data
    if (response) {
      if (response.success && response.data) {
        formData.value = {
          ...formData.value,
          ...response.data,
        };
      } else if (response.data) {
        // Fallback for direct data
        formData.value = {
          ...formData.value,
          ...response.data,
        };
      } else if (response.code === 0 && response.data) {
        // Old format
        formData.value = {
          ...formData.value,
          ...response.data,
        };
      }

      // Parse service links from serviceLinkUrl and combine with languageConfigs
      if (formData.value.serviceLinkUrl && formData.value.languageConfigs) {
        const links = formData.value.serviceLinkUrl
          .split('\n')
          .filter((url) => url.trim());
        const configs = formData.value.languageConfigs || [];

        serviceLinkList.value = links.map((url, index) => {
          // Parse format: "openMethod|url" or just "url"
          const parts = url.trim().split('|');
          const openMethod = parts.length === 2 ? parts[0] : 'EXTERNAL_BROWSER';
          const urlValue = parts.length === 2 ? parts[1] : url.trim();

          // Match with language config by index
          const langConfig = configs[index] || {
            language: 'zh-CN',
            serviceName: '',
          };

          return {
            language: langConfig.language,
            serviceName: langConfig.serviceName,
            openMethod: openMethod,
            url: urlValue,
          };
        });
      } else if (
        formData.value.languageConfigs &&
        formData.value.languageConfigs.length > 0
      ) {
        // Only language configs exist, no URLs yet
        serviceLinkList.value = formData.value.languageConfigs.map(
          (config) => ({
            language: config.language,
            serviceName: config.serviceName,
            openMethod: 'EXTERNAL_BROWSER',
            url: '',
          }),
        );
      } else {
        serviceLinkList.value = [];
      }

      // If no links exist, add a default empty one
      if (serviceLinkList.value.length === 0) {
        serviceLinkList.value = [
          {
            language: 'zh-CN',
            serviceName: '',
            openMethod: 'EXTERNAL_BROWSER',
            url: '',
          },
        ];
      }

      // Update brand IDs input
      if (
        formData.value.livechatBrandIds &&
        formData.value.livechatBrandIds.length > 0
      ) {
        brandIdsInput.value = formData.value.livechatBrandIds.join(', ');
      }
    }
  } catch (error: any) {
    console.error('Load config error:', error);
    message.warning($t('operations.customerService.noConfigData'));
  } finally {
    loading.value = false;
  }
};

// Enable edit mode
const enableEdit = () => {
  originalData.value = JSON.parse(JSON.stringify(formData.value));
  isEditing.value = true;
};

// Cancel edit mode
const cancelEdit = () => {
  if (originalData.value) {
    formData.value = JSON.parse(JSON.stringify(originalData.value));

    // Restore service links with language configs
    if (formData.value.serviceLinkUrl && formData.value.languageConfigs) {
      const links = formData.value.serviceLinkUrl
        .split('\n')
        .filter((url) => url.trim());
      const configs = formData.value.languageConfigs || [];

      serviceLinkList.value = links.map((url, index) => {
        const parts = url.trim().split('|');
        const openMethod = parts.length === 2 ? parts[0] : 'EXTERNAL_BROWSER';
        const urlValue = parts.length === 2 ? parts[1] : url.trim();
        const langConfig = configs[index] || {
          language: 'zh-CN',
          serviceName: '',
        };

        return {
          language: langConfig.language,
          serviceName: langConfig.serviceName,
          openMethod: openMethod,
          url: urlValue,
        };
      });
    } else {
      serviceLinkList.value = [
        {
          language: 'zh-CN',
          serviceName: '',
          openMethod: 'EXTERNAL_BROWSER',
          url: '',
        },
      ];
    }
  }
  isEditing.value = false;
};

// Save configuration
const saveConfig = async () => {
  saving.value = true;
  try {
    if (
      formData.value.h5FloatingEnabled &&
      formData.value.h5ServiceSystem === 'OTHER_SYSTEM' &&
      !formData.value.h5LinkUrl?.trim()
    ) {
      message.warning($t('operations.customerService.serviceLinkRequired'));
      return;
    }

    // Extract language configs and service links
    formData.value.languageConfigs = serviceLinkList.value
      .filter((link) => link.language && link.serviceName)
      .map((link) => ({
        language: link.language,
        serviceName: link.serviceName,
      }));

    // Combine service links into serviceLinkUrl with format: "openMethod|url"
    const linksText = serviceLinkList.value
      .filter((link) => link.url.trim())
      .map((link) => `${link.openMethod}|${link.url.trim()}`)
      .join('\n');

    formData.value.serviceLinkUrl = linksText;

    await updateOnlineCustomerServiceConfig(formData.value);
    message.success($t('operations.customerService.configSaved'));
    isEditing.value = false;
    await loadConfig();
  } catch (error: any) {
    message.error(error.message || $t('operations.customerService.saveConfigFailed'));
  } finally {
    saving.value = false;
  }
};

// Reset form
const resetForm = () => {
  loadConfig();
};

// Add service link
const addServiceLink = () => {
  serviceLinkList.value.push({
    language: 'zh-CN',
    serviceName: '',
    openMethod: 'EXTERNAL_BROWSER',
    url: '',
  });
};

// Remove service link
const removeServiceLink = (index: number) => {
  serviceLinkList.value.splice(index, 1);
};

// Add language configuration
const addLanguageConfig = () => {
  if (!languageForm.value.language || !languageForm.value.serviceName) {
    message.warning($t('operations.customerService.fillLanguageConfig'));
    return;
  }

  if (!formData.value.languageConfigs) {
    formData.value.languageConfigs = [];
  }

  // Check if language already exists
  const exists = formData.value.languageConfigs.some(
    (config) => config.language === languageForm.value.language,
  );

  if (exists) {
    message.warning($t('operations.customerService.languageExists'));
    return;
  }

  formData.value.languageConfigs.push({ ...languageForm.value });
  languageForm.value = { language: '', serviceName: '' };
  showLanguageModal.value = false;
  message.success($t('operations.customerService.languageConfigAdded'));
};

// Remove language configuration
const removeLanguageConfig = (index: number) => {
  formData.value.languageConfigs?.splice(index, 1);
};

// Update brand IDs from input
const updateBrandIds = () => {
  if (brandIdsInput.value) {
    const ids = brandIdsInput.value
      .split(',')
      .map((id) => id.trim())
      .filter((id) => id);
    formData.value.livechatBrandIds = ids;
  } else {
    formData.value.livechatBrandIds = [];
  }
};

onMounted(() => {
  loadConfig();
});
</script>

<style scoped>
.online-customer-service-tab {
  max-width: 1200px;
}
</style>
