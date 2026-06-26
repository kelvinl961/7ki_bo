<template>
  <div class="contact-tab">
    <n-card :title="$t('agency.contact.title')" class="mb-4">
      <div class="py-8 text-center text-gray-500">
        <n-icon size="48" class="mb-4">
          <LockClosedOutline />
        </n-icon>
        <div class="mb-2 text-lg font-medium">
          {{ $t('agency.contact.securityRequired') }}
        </div>
        <div class="text-sm">{{ $t('agency.contact.contactAdmin') }}</div>
      </div>
    </n-card>

    <n-card :title="$t('agency.contact.basicInfo')" class="mb-4">
      <n-descriptions bordered :column="2" size="small">
        <n-descriptions-item :label="$t('agency.profile.agentAccount')">
          {{ agentDetail?.username || '--' }}
        </n-descriptions-item>
        <n-descriptions-item :label="$t('agency.profile.agentId')">
          {{ agentDetail?.id || '--' }}
        </n-descriptions-item>
        <n-descriptions-item :label="$t('agency.profile.referralCode')">
          {{ agentDetail?.referralCode || '--' }}
        </n-descriptions-item>
        <n-descriptions-item :label="$t('common.currency')">
          <n-tag type="info" size="small">{{
            agentDetail?.currency || '--'
          }}</n-tag>
        </n-descriptions-item>
      </n-descriptions>
    </n-card>

    <n-card :title="$t('agency.contact.securityVerification')" class="mb-4">
      <n-form
        :model="securityForm"
        :rules="securityRules"
        ref="securityFormRef"
      >
        <n-form-item :label="$t('agency.contact.securityCode')" path="securityCode">
          <n-input
            v-model:value="securityForm.securityCode"
            type="password"
            :placeholder="$t('agency.contact.enterSecurityCode')"
            show-password-on="click"
            style="width: 300px"
          />
        </n-form-item>
        <n-form-item>
          <n-button type="primary" @click="handleDecrypt" :loading="decrypting">
            {{ $t('agency.contact.decryptView') }}
          </n-button>
          <n-button @click="handleReset" class="ml-2">
            {{ $t('common.reset') }}
          </n-button>
        </n-form-item>
      </n-form>
    </n-card>

    <n-card
      v-if="isDecrypted"
      :title="$t('agency.contact.decryptedContact')"
      class="mb-4"
    >
      <n-descriptions bordered :column="2" size="small">
        <n-descriptions-item :label="$t('agency.contact.realName')">
          {{ decryptedInfo.realName || '--' }}
        </n-descriptions-item>
        <n-descriptions-item :label="$t('agency.contact.idNumber')">
          {{ decryptedInfo.idCard || '--' }}
        </n-descriptions-item>
        <n-descriptions-item :label="$t('agency.contact.phone')">
          {{ decryptedInfo.phone || '--' }}
        </n-descriptions-item>
        <n-descriptions-item :label="$t('agency.contact.email')">
          {{ decryptedInfo.email || '--' }}
        </n-descriptions-item>
        <n-descriptions-item :label="$t('agency.contact.address')">
          {{ decryptedInfo.address || '--' }}
        </n-descriptions-item>
        <n-descriptions-item :label="$t('agency.contact.emergencyContact')">
          {{ decryptedInfo.emergencyContact || '--' }}
        </n-descriptions-item>
        <n-descriptions-item :label="$t('agency.contact.emergencyPhone')">
          {{ decryptedInfo.emergencyPhone || '--' }}
        </n-descriptions-item>
        <n-descriptions-item :label="$t('common.remark')">
          {{ decryptedInfo.notes || '--' }}
        </n-descriptions-item>
      </n-descriptions>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { $t } from '@vben/locales';

import { ref, reactive, computed, onMounted } from 'vue';
import {
  NCard,
  NDescriptions,
  NDescriptionsItem,
  NForm,
  NFormItem,
  NInput,
  NButton,
  NTag,
  NIcon,
  useMessage,
} from 'naive-ui';
import { LockClosedOutline } from '@vicons/ionicons5';
import {
  getAgentContactInfoApi,
  type AgentContactInfo,
} from '#/api/agency/agent-details';

interface Props {
  agentId?: number;
}

interface SecurityForm {
  securityCode: string;
}

interface DecryptedInfo {
  realName: string;
  idCard: string;
  phone: string;
  email: string;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  notes: string;
}

const props = withDefaults(defineProps<Props>(), {
  agentId: 0,
});

const message = useMessage();

const loading = ref(false);
const agentDetail = ref<AgentContactInfo | null>(null);
const securityFormRef = ref();
const securityForm = reactive<SecurityForm>({
  securityCode: '',
});

const decrypting = ref(false);
const isDecrypted = ref(false);

const decryptedInfo = ref<DecryptedInfo>({
  realName: '',
  idCard: '',
  phone: '',
  email: '',
  address: '',
  emergencyContact: '',
  emergencyPhone: '',
  notes: '',
});

const securityRules = computed(() => ({
  securityCode: {
    required: true,
    message: $t('agency.contact.enterCodeRequired'),
    trigger: 'blur',
  },
}));

const loadAgentContactInfo = async () => {
  if (!props.agentId) return;

  loading.value = true;
  try {
    const data = await getAgentContactInfoApi(props.agentId);
    agentDetail.value = data;
    decryptedInfo.value = {
      realName: data.realName || '',
      idCard: data.idCard || '',
      phone: data.phone || '',
      email: data.email || '',
      address: data.address || '',
      emergencyContact: data.emergencyContact || '',
      emergencyPhone: data.emergencyPhone || '',
      notes: data.notes || '',
    };
  } catch (error) {
    console.error('Failed to load agent contact info:', error);
    message.error($t('agency.contact.loadFailed'));
  } finally {
    loading.value = false;
  }
};

const handleDecrypt = async () => {
  try {
    await securityFormRef.value?.validate();
    decrypting.value = true;
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (securityForm.securityCode === 'admin123') {
      isDecrypted.value = true;
      message.success($t('agency.contact.decryptSuccess'));
    } else {
      message.error($t('agency.contact.wrongCode'));
    }
  } catch (error) {
    console.error('Decryption error:', error);
  } finally {
    decrypting.value = false;
  }
};

const handleReset = () => {
  securityForm.securityCode = '';
  isDecrypted.value = false;
  message.info($t('agency.contact.resetDone'));
};

onMounted(() => {
  if (props.agentId) {
    loadAgentContactInfo();
  }
});
</script>

<style scoped>
.contact-tab {
  padding: 16px;
}

.mb-4 {
  margin-bottom: 1rem;
}

.mb-2 {
  margin-bottom: 0.5rem;
}

.ml-2 {
  margin-left: 0.5rem;
}

.py-8 {
  padding-top: 2rem;
  padding-bottom: 2rem;
}

.text-center {
  text-align: center;
}

.text-gray-500 {
  color: #6b7280;
}

.text-lg {
  font-size: 1.125rem;
}

.text-sm {
  font-size: 0.875rem;
}

.font-medium {
  font-weight: 500;
}
</style>
