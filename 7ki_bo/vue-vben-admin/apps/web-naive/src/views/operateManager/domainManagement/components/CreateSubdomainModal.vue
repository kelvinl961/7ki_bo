<template>
  <n-modal
    v-model:show="showModal"
    preset="card"
    :title="modalTitle"
    style="width: 900px"
    :mask-closable="false"
  >
    <n-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-placement="left"
      label-width="120"
      require-mark-placement="left"
    >
      <!-- Select CDN Node -->
      <n-form-item :label="$t('operations.domain.createSubdomain.selectNode')" path="cdnProvider" required>
        <n-space :size="12">
          <n-button
            v-for="cdn in cdnOptions"
            :key="cdn.value"
            :type="formData.cdnProvider === cdn.value ? 'primary' : 'default'"
            size="large"
            style="min-width: 180px; position: relative"
            @click="handleSelectCDN(cdn.value)"
          >
            <template #icon>
              <n-icon
                v-if="formData.cdnProvider === cdn.value"
                :component="CheckmarkCircleOutline"
              />
            </template>
            <span style="font-size: 16px; font-weight: 500">{{
              cdn.label
            }}</span>
            <n-tag
              v-if="cdn.tag"
              :type="cdn.tagType"
              size="small"
              style="position: absolute; top: 4px; right: 4px"
            >
              {{ cdn.tag }}
            </n-tag>
          </n-button>
        </n-space>
      </n-form-item>

      <!-- Select Domain (Only shows after CDN is selected) -->
      <n-form-item
        v-if="formData.cdnProvider"
        :label="$t('operations.domain.createSubdomain.selectDomain')"
        path="domainName"
        required
      >
        <div style="width: 100%">
          <n-spin :show="loadingDomains">
            <n-space :size="12" v-if="availableDomains.length > 0">
              <n-button
                v-for="domain in availableDomains"
                :key="domain"
                :type="formData.domainName === domain ? 'primary' : 'default'"
                size="medium"
                @click="formData.domainName = domain"
              >
                {{ domain }}
              </n-button>
            </n-space>
            <n-empty
              v-else-if="!loadingDomains"
              :description="$t('operations.domain.createSubdomain.noDomains')"
              style="padding: 20px 0"
            />
          </n-spin>
        </div>
      </n-form-item>

      <!-- Domain Purpose (Read-only, auto-filled) -->
      <n-form-item :label="$t('operations.domain.createSubdomain.domainPurpose')">
        <n-input :value="useTypeLabel" readonly style="background: #f5f5f5" />
        <template #feedback>
          <n-alert
            type="warning"
            :show-icon="false"
            style="margin-top: 8px; padding: 8px 12px"
          >
            <span style="color: #ff4d4f; font-size: 13px">
              {{ $t('operations.domain.createSubdomain.purposeWarning') }}
            </span>
          </n-alert>
        </template>
      </n-form-item>

      <!-- Active Domain (Dynamic List) - Only shows after domain is selected -->
      <n-form-item v-if="formData.domainName" :label="$t('operations.domain.createSubdomain.activeDomain')">
        <div style="width: 100%">
          <div
            v-for="(item, index) in activeDomainList"
            :key="index"
            style="display: flex; align-items: center; margin-bottom: 12px"
          >
            <n-input-group style="flex: 1">
              <n-input
                v-model:value="item.prefix"
                :placeholder="$t('operations.domain.createSubdomain.prefixPlaceholder')"
                style="width: 200px"
              />
              <n-input-group-label>·</n-input-group-label>
              <n-input
                :value="formData.domainName"
                readonly
                style="flex: 1; background: #f5f5f5"
              />
            </n-input-group>

            <n-button
              circle
              type="primary"
              style="margin-left: 8px"
              @click="addActiveDomain"
            >
              <template #icon>
                <span style="font-size: 18px">+</span>
              </template>
            </n-button>

            <n-button
              v-if="activeDomainList.length > 1"
              circle
              style="margin-left: 8px"
              @click="removeActiveDomain(index)"
            >
              <template #icon>
                <span style="font-size: 18px">-</span>
              </template>
            </n-button>
          </div>
        </div>
      </n-form-item>

      <!-- Domain Settings -->
      <n-divider style="margin: 24px 0">{{ $t('operations.domain.createSubdomain.domainSettings') }}/n-divider>

      <!-- Is Promotion Domain -->
      <n-form-item :label="$t('operations.domain.createSubdomain.asPromotion')">
        <n-space vertical :size="8" style="width: 100%">
          <n-checkbox v-model:checked="formData.isPromotionDomain">
            {{ $t('operations.domain.createSubdomain.promotionCheckbox') }}
          </n-checkbox>
          <n-alert
            type="info"
            :show-icon="false"
            style="font-size: 13px; padding: 8px 12px"
          >
            <div style="color: #666">
              <strong>{{ $t('common.prompt') }}:</strong>{{ $t('operations.domain.createSubdomain.promotionRule') }}
            </div>
          </n-alert>
        </n-space>
      </n-form-item>

      <!-- Enabled Entrance -->
      <n-form-item :label="$t('operations.domain.createSubdomain.enabledEntrance')">
        <n-space vertical :size="8" style="width: 100%">
          <n-radio-group v-model:value="formData.enabledEntrance">
            <n-space vertical>
              <n-radio value="ALL">
                <strong>{{ $t('operations.domain.entrance.all') }}</strong> - {{ $t('operations.domain.createSubdomain.entranceAll').split(' - ')[1] || $t('operations.domain.createSubdomain.entranceAll') }}
              </n-radio>
              <n-radio value="APP_ONLY">{{ $t('operations.domain.createSubdomain.entranceAppOnly') }}</n-radio>
              <n-radio value="H5_PWA">{{ $t('operations.domain.createSubdomain.entranceH5Pwa') }}</n-radio>
            </n-space>
          </n-radio-group>
          <n-alert
            type="info"
            :show-icon="false"
            style="font-size: 13px; padding: 8px 12px"
          >
            <div style="color: #666">
              <strong>{{ $t('operations.domain.createSubdomain.entranceCdnSupport') }}</strong> {{ $t('operations.domain.createSubdomain.entranceCdnList') }}
            </div>
          </n-alert>
        </n-space>
      </n-form-item>

      <!-- Device Blocking -->
      <n-form-item :label="$t('operations.domain.createSubdomain.blockedDevice')">
        <n-space vertical :size="8" style="width: 100%">
          <n-radio-group v-model:value="formData.blockedDevice">
            <n-space vertical>
              <n-radio value="NONE">{{ $t('operations.domain.createSubdomain.deviceNone') }}</n-radio>
              <n-radio value="BLOCK_MOBILE">{{ $t('operations.domain.createSubdomain.deviceBlockMobile') }}</n-radio>
              <n-radio value="BLOCK_PC">{{ $t('operations.domain.createSubdomain.deviceBlockPc') }}</n-radio>
            </n-space>
          </n-radio-group>
          <n-alert
            type="info"
            :show-icon="false"
            style="font-size: 13px; padding: 8px 12px"
          >
            <div style="color: #666">
              <strong>{{ $t('operations.domain.createSubdomain.deviceCdnSupport') }}</strong> {{ $t('operations.domain.createSubdomain.entranceCdnList') }}
            </div>
          </n-alert>
        </n-space>
      </n-form-item>

      <!-- Notes -->
      <n-form-item :label="$t('common.remark')">
        <n-input
          v-model:value="formData.notes"
          type="textarea"
          :placeholder="$t('common.pleaseEnterField', [$t('common.remark')])"
          :rows="3"
          :maxlength="200"
          show-count
          clearable
        />
      </n-form-item>

      <!-- Configuration Recommendations -->
      <n-form-item :label="$t('operations.domain.createSubdomain.configAdvice')">
        <div style="width: 100%">
          <div style="margin-bottom: 8px">
            <a href="#" style="color: #2080f0; text-decoration: none"
              >{{ $t('operations.domain.createSubdomain.seeTutorial') }}/a
            >
          </div>

          <n-card size="small" style="background: #fafafa">
            <n-scrollbar style="max-height: 300px">
              <div style="font-size: 13px; line-height: 1.8; color: #666">
                <p style="margin-bottom: 12px">
                  <strong>{{ $t('operations.domain.createSubdomain.tip1Title') }}</strong>{{ $t('operations.domain.createSubdomain.tip1') }}
                </p>

                <p style="margin-bottom: 12px">
                  <strong>{{ $t('operations.domain.createSubdomain.tip2Title') }}</strong>{{ $t('operations.domain.createSubdomain.tip2') }}
                </p>

                <p style="margin-bottom: 12px">
                  <strong>{{ $t('operations.domain.createSubdomain.tip3Title') }}</strong>{{ $t('operations.domain.createSubdomain.tip3') }}
                </p>

                <p style="margin-bottom: 12px">
                  <strong>{{ $t('operations.domain.createSubdomain.tip4Title') }}</strong>{{ $t('operations.domain.createSubdomain.tip4') }}
                </p>

                <p style="margin-bottom: 12px">
                  <strong>{{ $t('operations.domain.createSubdomain.tip5Title') }}</strong>{{ $t('operations.domain.createSubdomain.tip5') }}
                </p>

                <p style="margin-bottom: 0">
                  <strong>{{ $t('operations.domain.createSubdomain.tip6Title') }}</strong>{{ $t('operations.domain.createSubdomain.tip6') }}
                </p>
              </div>
            </n-scrollbar>
          </n-card>
        </div>
      </n-form-item>
    </n-form>

    <template #footer>
      <n-space justify="end">
        <n-button @click="handleCancel">{{ $t('common.cancel') }}</n-button>
        <n-button
          type="primary"
          :loading="submitting"
          :disabled="!formData.cdnProvider || !formData.domainName"
          @click="handleConfirm"
        >{{ $t('common.confirm') }}</n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { $t } from '@vben/locales';

import { ref, reactive, computed, watch } from 'vue';
import {
  NModal,
  NForm,
  NFormItem,
  NInput,
  NInputGroup,
  NInputGroupLabel,
  NButton,
  NSpace,
  NTag,
  NAlert,
  NCard,
  NScrollbar,
  NIcon,
  NSpin,
  NEmpty,
  NCheckbox,
  NRadioGroup,
  NRadio,
  NDivider,
  useMessage,
  type FormInst,
  type FormRules,
} from 'naive-ui';
import { CheckmarkCircleOutline } from '@vicons/ionicons5';
import { domainApi } from '../api/domainApi';

const props = defineProps<{
  show: boolean;
  defaultUseType?: string; // e.g., 'WEB_HALL', 'BACKEND_API'
  useTypeLabel?: string; // e.g., 'Web大厅', '后端加速域名'
  modalTitle?: string; // e.g., '新增Web大厅子域名'
}>();

const emit = defineEmits<{
  (e: 'update:show', show: boolean): void;
  (e: 'success'): void;
}>();

const message = useMessage();

const showModal = computed({
  get: () => props.show,
  set: (val) => emit('update:show', val),
});

// Use prop values or defaults
const useType = computed(() => props.defaultUseType || 'WEB_HALL');
const useTypeLabel = computed(() => props.useTypeLabel || $t('operations.domain.createSubdomain.defaultWebHall'));
const modalTitle = computed(() => props.modalTitle || $t('operations.domain.createSubdomain.defaultModalTitle'));

// CDN Options
const cdnOptions = [
  {
    value: 'CLOUDFLARE',
    label: 'Cloudflare',
    tag: 'Alliance',
    tagType: 'success' as const,
  },
  {
    value: 'AWS',
    label: 'AWS',
    tag: $t('operations.domain.createDomain.badgeGlobal'),
    tagType: 'info' as const,
  },
  {
    value: 'HUAWEI_CLOUD',
    label: $t('operations.domain.cdn.huawei'),
    tag: $t('operations.domain.createDomain.badgeIntl'),
    tagType: 'warning' as const,
  },
];

// Available domains - fetch from API
const availableDomains = ref<string[]>([]);
const loadingDomains = ref(false);

// Fetch available parent domains based on selected CDN
const fetchAvailableDomains = async (cdnProvider: string) => {
  loadingDomains.value = true;
  try {
    const response: any = await domainApi.getDomains({
      cdnProvider: cdnProvider,
      isParentDomain: true,
      page: 1,
      pageSize: 100,
    });

    const actualData = response.data?.data || response.data || response;
    let domainsList: any[] = [];

    if (actualData && actualData.list && Array.isArray(actualData.list)) {
      domainsList = actualData.list;
    } else if (Array.isArray(actualData)) {
      domainsList = actualData;
    }

    const domainNames = domainsList
      .filter((d: any) => d && d.domainName)
      .map((d: any) => d.domainName);

    const uniqueDomains = [...new Set(domainNames)];
    availableDomains.value = uniqueDomains;
  } catch (error: any) {
    console.error('Failed to fetch domains:', error);
    message.warning($t('operations.domain.createSubdomain.fetchDomainsFailed'));
    availableDomains.value = [];
  } finally {
    loadingDomains.value = false;
  }
};

// Form data
const formRef = ref<FormInst | null>(null);
const formData = reactive({
  cdnProvider: '',
  domainName: '',
  notes: '',
  isPromotionDomain: false,
  enabledEntrance: 'ALL', // ALL, APP_ONLY, H5_PWA
  blockedDevice: 'NONE', // NONE, BLOCK_MOBILE, BLOCK_PC
});

// Active Domain List (dynamic subdomain prefixes)
const activeDomainList = ref<Array<{ prefix: string }>>([
  { prefix: '' }, // Default entry - blank for root domain
]);

// Add active domain entry
const addActiveDomain = () => {
  activeDomainList.value.push({ prefix: '' });
};

// Remove active domain entry
const removeActiveDomain = (index: number) => {
  if (activeDomainList.value.length > 1) {
    activeDomainList.value.splice(index, 1);
  }
};

const submitting = ref(false);

// Form rules
const rules: FormRules = {
  cdnProvider: [{ required: true, message: $t('common.pleaseSelect') + ' ' + $t('operations.domain.createSubdomain.selectNode'), trigger: 'change' }],
  domainName: [{ required: true, message: $t('common.pleaseSelect') + ' ' + $t('operations.domain.createSubdomain.selectDomain'), trigger: 'change' }],
};

// Handle CDN selection
const handleSelectCDN = async (cdn: string) => {
  formData.cdnProvider = cdn;
  formData.domainName = '';
  await fetchAvailableDomains(cdn);
};

// Handle confirm
const handleConfirm = async () => {
  try {
    await formRef.value?.validate();

    submitting.value = true;

    // Construct active domains from the list
    let hasRootDomain = false;
    const activeDomains = activeDomainList.value
      .map((item) => {
        const prefix = item.prefix.trim();
        // Empty, "@", or "根域名" all represent root domain
        if (!prefix || prefix === '@' || prefix === $t('operations.domain.createSubdomain.rootDomain')) {
          hasRootDomain = true;
          return formData.domainName; // Include it, backend will handle duplicates
        }
        return `${prefix}.${formData.domainName}`;
      })
      .filter(Boolean)
      .join(',');

    // Warn user if they're trying to create root domain (it should already exist)
    if (hasRootDomain) {
      console.log(
        '⚠️ User included root domain (@) in subdomain creation. Parent domain may already exist.',
      );
    }

    // Prepare domain creation data
    const domainData: any = {
      domainName: formData.domainName,
      cdnProvider: formData.cdnProvider,
      useType: useType.value,
      activeDomain: activeDomains,
      remark: formData.notes || '',
      sslEnabled: true,
      verificationMethod: 'DNS_VALIDATION',
      status: 'NORMAL',
      isPromotionDomain: formData.isPromotionDomain,
      enabledEntrance: formData.enabledEntrance,
      blockedDevice: formData.blockedDevice,
    };

    const response: any = await domainApi.createDomain(domainData);

    console.log('🔍 Full response:', response);

    // Check if operation was successful AND subdomains were actually created
    // Handle both wrapped and unwrapped response structures
    const code = response.code ?? response.data?.code ?? 0;
    const result = response.data || response;
    const subdomains = result.data?.subdomains || result.subdomains || [];
    const errors = result.data?.errors || result.errors || [];

    console.log('📊 Parsed data:', { code, subdomains, errors });

    // Check if user only entered "@" (root domain)
    const onlyRootDomain = activeDomainList.value.every((item) => {
      const prefix = item.prefix.trim();
      return !prefix || prefix === '@' || prefix === $t('operations.domain.createSubdomain.rootDomain');
    });

    if (code === 0 && subdomains.length > 0) {
      // Success: subdomains were created
      if (errors.length > 0) {
        // Partial success
        message.warning(
          $t('operations.domain.createSubdomain.createPartialSuccess', [subdomains.length, errors.length, errors.join('; ')]),
        );
      } else {
        // Full success
        message.success($t('operations.domain.createSubdomain.createSuccess', [subdomains.length]));
      }
      emit('success');
      handleCancel();
    } else if (code === 0 && subdomains.length === 0 && onlyRootDomain) {
      // User only entered "@" and it already exists (parent domain)
      message.warning(
        $t('operations.domain.message.mainDomainExists', [formData.domainName]),
      );
      handleCancel();
    } else if (code === 0 && subdomains.length === 1 && onlyRootDomain) {
      // DNS was successfully updated for root domain
      message.success($t('operations.domain.message.dnsUpdated', [formData.domainName]));
      emit('success');
      handleCancel();
    } else if (errors.length > 0) {
      // All failed with specific errors
      message.error($t('operations.domain.createDomain.createPartial', [0, errors.length, errors.join('; ')]));
    } else {
      // Generic failure
      message.error(response.message || response.data?.message || $t('operations.domain.createDomain.createFailed'));
    }
  } catch (error: any) {
    console.error('Create subdomain error:', error);

    if (error?.errorFields) {
      message.error($t('operations.form.checkForm'));
    } else {
      message.error(error.message || $t('operations.domain.createDomain.createFailed'));
    }
  } finally {
    submitting.value = false;
  }
};

// Handle cancel
const handleCancel = () => {
  formData.cdnProvider = '';
  formData.domainName = '';
  formData.notes = '';
  formData.isPromotionDomain = false;
  formData.enabledEntrance = 'ALL';
  formData.blockedDevice = 'NONE';
  availableDomains.value = [];
  activeDomainList.value = [{ prefix: '' }];
  showModal.value = false;
};

// Reset form when modal closes
watch(showModal, (val) => {
  if (!val) {
    formData.cdnProvider = '';
    formData.domainName = '';
    formData.notes = '';
    availableDomains.value = [];
    activeDomainList.value = [{ prefix: '' }];
  }
});
</script>

<style scoped lang="scss">
:deep(.n-card__content) {
  padding: 20px !important;
}

:deep(.n-form-item-label) {
  font-weight: 500;
}

:deep(.n-button) {
  transition: all 0.3s;
}
</style>
