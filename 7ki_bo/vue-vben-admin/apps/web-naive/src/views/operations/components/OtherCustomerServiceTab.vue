<template>
  <div class="other-customer-service-tab p-4">
    <n-space vertical :size="16">
      <!-- Action Buttons -->
      <n-space justify="end">
        <n-button type="primary" @click="showEditModal(null)">
          <template #icon>
            <span>+</span>
          </template>
          {{ $t('operations.customerService.addService') }}
        </n-button>
      </n-space>

      <!-- Customer Service List -->
      <n-spin :show="loading">
        <n-data-table
          :columns="columns"
          :data="customerServiceList"
          :pagination="false"
          :bordered="false"
        />
      </n-spin>
    </n-space>

    <!-- Edit/Create Modal -->
    <n-modal
      v-model:show="showModal"
      preset="card"
      :title="editingId ? $t('operations.customerService.editService') : $t('operations.customerService.addService')"
      style="width: 800px"
      :mask-closable="false"
    >
      <n-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-placement="top"
      >
        <n-form-item :label="$t('operations.customerService.currencies')" path="currencies">
          <n-select
            v-model:value="formData.currencies"
            multiple
            :options="currencyOptions"
            :placeholder="$t('operations.customerService.selectCurrency')"
          />
        </n-form-item>

        <n-form-item :label="$t('operations.customerService.imSelect')" path="imType">
          <n-space vertical style="width: 100%">
            <n-radio-group v-model:value="formData.imType">
              <n-space>
                <n-radio value="LINE">
                  <n-space align="center" :size="8">
                    <n-avatar
                      size="small"
                      :src="imIconUrls.LINE"
                      fallback-src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Ctext y='18' font-size='18'%3E💬%3C/text%3E%3C/svg%3E"
                    />
                    <span>LINE</span>
                  </n-space>
                </n-radio>
                <n-radio value="TELEGRAM">
                  <n-space align="center" :size="8">
                    <n-avatar
                      size="small"
                      :src="imIconUrls.TELEGRAM"
                      fallback-src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Ctext y='18' font-size='18'%3E✈️%3C/text%3E%3C/svg%3E"
                    />
                    <span>Telegram</span>
                  </n-space>
                </n-radio>
                <n-radio value="WECHAT">
                  <n-space align="center" :size="8">
                    <n-avatar
                      size="small"
                      :src="imIconUrls.WECHAT"
                      fallback-src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Ctext y='18' font-size='18'%3E💬%3C/text%3E%3C/svg%3E"
                    />
                    <span>WeChat</span>
                  </n-space>
                </n-radio>
                <n-radio value="WHATSAPP">
                  <n-space align="center" :size="8">
                    <n-avatar
                      size="small"
                      :src="imIconUrls.WHATSAPP"
                      fallback-src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Ctext y='18' font-size='18'%3E📱%3C/text%3E%3C/svg%3E"
                    />
                    <span>WhatsApp</span>
                  </n-space>
                </n-radio>
                <n-radio value="SKYPE">
                  <n-space align="center" :size="8">
                    <n-avatar
                      size="small"
                      :src="imIconUrls.SKYPE"
                      fallback-src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Ctext y='18' font-size='18'%3ES%3C/text%3E%3C/svg%3E"
                    />
                    <span>Skype</span>
                  </n-space>
                </n-radio>
                <n-radio value="FACEBOOK">
                  <n-space align="center" :size="8">
                    <n-avatar
                      size="small"
                      :src="imIconUrls.FACEBOOK"
                      fallback-src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Ctext y='18' font-size='18'%3EF%3C/text%3E%3C/svg%3E"
                    />
                    <span>Facebook</span>
                  </n-space>
                </n-radio>
                <n-radio value="CUSTOM">
                  <n-space align="center" :size="8">
                    <n-button size="small">+ {{ $t('operations.customerService.customIm') }}</n-button>
                  </n-space>
                </n-radio>
              </n-space>
            </n-radio-group>

            <n-upload
              v-if="formData.imType === 'CUSTOM'"
              :max="1"
              list-type="image-card"
              accept="image/*"
              @before-upload="handleUpload"
            >
              {{ $t('operations.customerService.uploadCustomIcon') }}
            </n-upload>
          </n-space>
        </n-form-item>

        <n-form-item :label="$t('operations.customerService.serviceNickname')" path="serviceName">
          <n-input
            v-model:value="formData.serviceName"
            :placeholder="$t('operations.customerService.nicknamePlaceholder')"
            maxlength="255"
          />
        </n-form-item>

        <n-form-item :label="$t('operations.customerService.serviceAccount')" path="serviceAccount">
          <n-input
            v-model:value="formData.serviceAccount"
            :placeholder="$t('operations.customerService.accountPlaceholder')"
            maxlength="255"
          />
          <div class="mt-2 text-sm text-gray-500">
            {{ imTypeDescription }}
          </div>
        </n-form-item>

        <n-form-item :label="$t('operations.customerService.autoGenerateLink')" v-if="formData.imType !== 'CUSTOM'">
          <n-input
            :value="generatedLink"
            disabled
            :placeholder="$t('operations.customerService.linkAutoGenerate')"
          />
        </n-form-item>

        <template v-if="formData.imType === 'CUSTOM'">
          <n-form-item :label="$t('operations.customerService.androidLink')" path="androidLink">
            <n-input
              v-model:value="formData.androidLink"
              :placeholder="$t('operations.customerService.enterAndroidLink')"
            />
          </n-form-item>

          <n-form-item :label="$t('operations.customerService.iosLink')" path="iosLink">
            <n-input
              v-model:value="formData.iosLink"
              :placeholder="$t('operations.customerService.enterIosLink')"
            />
          </n-form-item>

          <n-form-item :label="$t('operations.customerService.pcLink')" path="pcLink">
            <n-input v-model:value="formData.pcLink" :placeholder="$t('operations.customerService.enterPcLink')" />
          </n-form-item>
        </template>

        <n-form-item :label="$t('operations.customerService.memberLevels')" path="memberLevels">
          <n-spin :show="loadingMemberTiers">
            <n-checkbox-group
              v-model:value="formData.memberLevels"
              @update:value="handleMemberTierChange"
            >
              <n-space vertical>
                <n-checkbox value="ALL">{{ $t('operations.customerService.allLevels') }}</n-checkbox>
                <n-space wrap>
                  <n-checkbox
                    v-for="tier in memberTierOptions"
                    :key="tier.value"
                    :value="tier.value"
                  >
                    {{ tier.label }}
                  </n-checkbox>
                </n-space>
              </n-space>
            </n-checkbox-group>
          </n-spin>
        </n-form-item>

        <n-form-item :label="$t('operations.customerService.isEnabled')">
          <n-switch v-model:value="formData.isEnabled" />
        </n-form-item>
      </n-form>

      <template #footer>
        <n-space justify="end">
          <n-button @click="showModal = false">{{ $t('common.cancel') }}</n-button>
          <n-button type="primary" @click="submitForm" :loading="saving">
            {{ $t('common.confirm') }}
          </n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { $t } from '@vben/locales';

import { ref, computed, h, onMounted, nextTick } from 'vue';
import {
  NSpace,
  NButton,
  NDataTable,
  NSpin,
  NModal,
  NForm,
  NFormItem,
  NInput,
  NSelect,
  NRadioGroup,
  NRadio,
  NCheckboxGroup,
  NCheckbox,
  NSwitch,
  NInputNumber,
  NAvatar,
  NUpload,
  NTag,
  NPopconfirm,
  useMessage,
  type DataTableColumns,
} from 'naive-ui';
import {
  getCustomerServiceIMConfigs,
  createCustomerServiceIMConfig,
  updateCustomerServiceIMConfig,
  deleteCustomerServiceIMConfig,
  type CustomerServiceIMConfig,
} from '#/api/operations/customerService';
import { getActiveMemberTiersApi } from '#/api/core/memberTier';

const message = useMessage();

// Loading states
const loading = ref(false);
const saving = ref(false);
const loadingMemberTiers = ref(false);

// Modal state
const showModal = ref(false);
const editingId = ref<number | null>(null);

// Form reference
const formRef = ref();

// Customer service list
const customerServiceList = ref<CustomerServiceIMConfig[]>([]);

// Member tiers
const memberTierOptions = ref<Array<{ label: string; value: string }>>([]);

// Flag to prevent recursive updates
const isUpdatingMemberTiers = ref(false);

// IM Icon URLs
const imIconUrls = {
  LINE: 'https://9dmu7h-6909-ppp.s3.sa-east-1.amazonaws.com/siteadmin/upload/img/LINE.png',
  TELEGRAM:
    'https://9dmu7h-6909-ppp.s3.sa-east-1.amazonaws.com/siteadmin/upload/img/telegram.png',
  WECHAT:
    'https://9dmu7h-6909-ppp.s3.sa-east-1.amazonaws.com/siteadmin/upload/img/WeChat.png',
  WHATSAPP:
    'https://9dmu7h-6909-ppp.s3.sa-east-1.amazonaws.com/siteadmin/upload/img/WhtasApp.png',
  SKYPE:
    'https://9dmu7h-6909-ppp.s3.sa-east-1.amazonaws.com/siteadmin/upload/img/Skype.png',
  FACEBOOK:
    'https://9dmu7h-6909-ppp.s3.sa-east-1.amazonaws.com/siteadmin/upload/img/Facebook.png',
};

// Form data
const formData = ref<CustomerServiceIMConfig>({
  currencies: [],
  memberLevels: [],
  imType: 'TELEGRAM',
  serviceName: '',
  serviceAccount: '',
  androidLink: '',
  iosLink: '',
  pcLink: '',
  displayOrder: 0, // Keep for backend compatibility but don't show in UI
  isEnabled: true,
});

// Form validation rules
const formRules = computed(() => ({
  imType: { required: true, message: $t('common.pleaseSelect') },
  serviceName: { required: true, message: $t('operations.customerService.nicknamePlaceholder') },
  serviceAccount: { required: true, message: $t('operations.customerService.accountPlaceholder') },
}));

const currencyOptions = computed(() => [
  { label: $t('operations.customerService.brazilianReal'), value: 'BRL' },
]);

// IM type description
const imTypeDescription = computed(() => {
  if (formData.value.imType === 'CUSTOM') {
    return $t('operations.customerService.customImLink');
  }
  return $t('operations.customerService.imAutoLink');
});

// Computed property for auto-generated link
const generatedLink = computed(() => {
  const account = formData.value.serviceAccount || '';
  if (!account) return '';

  switch (formData.value.imType) {
    case 'LINE':
      return `https://line.me/R/ti/p/${account}`;
    case 'TELEGRAM':
      return `https://telegram.me/${account}`;
    case 'WHATSAPP':
      return `https://api.whatsapp.com/send?phone=${account}`;
    case 'WECHAT':
      return `weixin://${account}`;
    case 'SKYPE':
      return `skype:?chat${account}`;
    case 'FACEBOOK':
      return `https://www.facebook.com/${account}`;
    default:
      return '';
  }
});

// Table columns
const columns = computed<DataTableColumns<CustomerServiceIMConfig>>(() => [
  {
    title: 'IM',
    key: 'imType',
    width: 120,
    render: (row) => {
      const iconUrl = imIconUrls[row.imType as keyof typeof imIconUrls];
      return h(NSpace, { align: 'center', size: 8 }, () => [
        iconUrl
          ? h(NAvatar, {
              size: 'small',
              src: iconUrl,
              fallbackSrc:
                'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"%3E%3Ctext y="18" font-size="18"%3E💬%3C/text%3E%3C/svg%3E',
            })
          : null,
        h('span', row.imType),
      ]);
    },
  },
  {
    title: $t('operations.customerService.nickname'),
    key: 'serviceName',
    width: 150,
  },
  {
    title: $t('operations.customerService.account'),
    key: 'serviceAccount',
    width: 200,
  },
  {
    title: $t('common.currency'),
    key: 'currencies',
    width: 150,
    render: (row) => {
      if (!row.currencies || row.currencies.length === 0) {
        return $t('common.all');
      }
      return row.currencies.join(', ');
    },
  },
  {
    title: $t('operations.customerService.memberLevels'),
    key: 'memberLevels',
    width: 200,
    render: (row) => {
      if (!row.memberLevels || row.memberLevels.length === 0) {
        return $t('operations.customerService.allLevels');
      }
      if (row.memberLevels.includes('ALL')) {
        return $t('operations.customerService.allLevels');
      }
      const tierNames = row.memberLevels.map((tierId: string) => {
        if (tierId === 'ALL') return $t('operations.customerService.allLevels');
        const tier = memberTierOptions.value.find(
          (t) => t.value === String(tierId),
        );
        return tier ? tier.label : `Tier ${tierId}`;
      });
      return tierNames.join(', ');
    },
  },
  {
    title: $t('common.status'),
    key: 'isEnabled',
    width: 100,
    render: (row) => {
      return h(NTag, { type: row.isEnabled ? 'success' : 'error' }, () =>
        row.isEnabled ? $t('common.enable') : $t('common.disable'),
      );
    },
  },
  {
    title: $t('common.actions'),
    key: 'actions',
    width: 200,
    render: (row) => {
      return h(NSpace, {}, () => [
        h(
          NButton,
          {
            size: 'small',
            onClick: () => showEditModal(row.id!),
          },
          () => $t('common.modify'),
        ),
        h(
          NPopconfirm,
          {
            onPositiveClick: () => handleDelete(row.id!),
          },
          {
            trigger: () =>
              h(NButton, { size: 'small', type: 'error' }, () => $t('common.delete')),
            default: () => $t('operations.customerService.confirmDeleteService'),
          },
        ),
      ]);
    },
  },
]);

// Load member tiers
const loadMemberTiers = async () => {
  loadingMemberTiers.value = true;
  try {
    const tiers = await getActiveMemberTiersApi();
    // Sort by ID
    const sorted = tiers.sort((a: any, b: any) => {
      return Number(a.id) - Number(b.id);
    });
    memberTierOptions.value = sorted.map((tier) => ({
      label: tier.tierName || tier.tierCode || `Tier ${tier.id}`,
      value: String(tier.id),
    }));
  } catch (error: any) {
    console.error('Failed to load member tiers:', error);
    message.warning($t('operations.customerService.loadMemberTiersFailed'));
  } finally {
    loadingMemberTiers.value = false;
  }
};

// Load customer service list
const loadList = async () => {
  loading.value = true;
  try {
    const response = await getCustomerServiceIMConfigs();
    // Request interceptor behavior:
    // - For code: 0 → returns data.data (array)
    // - For success: true → returns whole response object
    if (Array.isArray(response)) {
      // Interceptor extracted the array directly
      customerServiceList.value = response;
    } else if (response && response.success && Array.isArray(response.data)) {
      // success: true format
      customerServiceList.value = response.data;
    } else if (response && response.data && Array.isArray(response.data)) {
      // Fallback: direct data property
      customerServiceList.value = response.data;
    } else {
      customerServiceList.value = [];
    }
  } catch (error: any) {
    message.error(error.message || $t('operations.customerService.loadListFailed'));
    customerServiceList.value = [];
  } finally {
    loading.value = false;
  }
};

// Show edit modal
const showEditModal = async (id: number | null) => {
  editingId.value = id;

  // Ensure member tiers are loaded
  if (memberTierOptions.value.length === 0) {
    await loadMemberTiers();
  }

  if (id) {
    const config = customerServiceList.value.find((c) => c.id === id);
    if (config) {
      formData.value = {
        ...config,
        // Ensure memberLevels is an array
        memberLevels: Array.isArray(config.memberLevels)
          ? config.memberLevels
          : [],
        // Ensure currencies is an array
        currencies: Array.isArray(config.currencies) ? config.currencies : [],
      };
    }
  } else {
    formData.value = {
      currencies: [],
      memberLevels: [],
      imType: 'TELEGRAM',
      serviceName: '',
      serviceAccount: '',
      androidLink: '',
      iosLink: '',
      pcLink: '',
      displayOrder: 0, // Keep for backend compatibility
      isEnabled: true,
    };
  }

  showModal.value = true;
};

// Submit form
const submitForm = async () => {
  try {
    await formRef.value?.validate();
  } catch {
    return;
  }

  saving.value = true;
  try {
    if (editingId.value) {
      await updateCustomerServiceIMConfig(editingId.value, formData.value);
    } else {
      await createCustomerServiceIMConfig(formData.value);
    }

    message.success(
      editingId.value
        ? $t('operations.customerService.updateSuccess')
        : $t('operations.customerService.createSuccess'),
    );
    showModal.value = false;
    await loadList();
  } catch (error: any) {
    message.error(error.message || $t('common.operationFailed'));
  } finally {
    saving.value = false;
  }
};

// Handle delete
const handleDelete = async (id: number) => {
  try {
    await deleteCustomerServiceIMConfig(id);
    message.success($t('common.deleteSuccess'));
    await loadList();
  } catch (error: any) {
    message.error(error.message || $t('common.operationFailed'));
  }
};

// Handle member tier change - SIMPLE VERSION
const handleMemberTierChange = (value: string[]) => {
  if (isUpdatingMemberTiers.value) return;

  const previousValue = formData.value.memberLevels || [];
  const currentValue = value || [];
  const hadAll = previousValue.includes('ALL');
  const hasAll = currentValue.includes('ALL');
  const allTierIds = memberTierOptions.value.map((t) => t.value);

  // User clicked "ALL" checkbox directly
  if (hadAll !== hasAll) {
    if (hasAll) {
      // Checked "ALL" - select all tiers
      formData.value.memberLevels = ['ALL', ...allTierIds];
    } else {
      // Unchecked "ALL" - clear all
      formData.value.memberLevels = [];
    }
    return;
  }

  // User clicked individual tier checkboxes
  const valueWithoutAll = currentValue.filter((v) => v !== 'ALL');
  const allTiersSelected =
    allTierIds.length > 0 &&
    allTierIds.every((id) => valueWithoutAll.includes(id));

  if (allTiersSelected) {
    // All individual tiers selected - add "ALL"
    formData.value.memberLevels = ['ALL', ...allTierIds];
  } else {
    // Not all selected - remove "ALL" if present
    formData.value.memberLevels = valueWithoutAll;
  }
};

// Handle upload
const handleUpload = (options: any) => {
  // Implement upload logic here
  message.info($t('operations.customerService.uploadPending'));
  return false;
};

onMounted(() => {
  loadList();
  loadMemberTiers();
});
</script>

<style scoped>
.other-customer-service-tab {
  max-width: 1400px;
}
.cursor-move {
  cursor: move;
}
</style>
