<template>
  <div class="contact-tab">
    <n-card title="联系方式信息" class="mb-4">
      <div class="py-8 text-center text-gray-500">
        <n-icon size="48" class="mb-4">
          <LockClosedOutline />
        </n-icon>
        <div class="mb-2 text-lg font-medium">需要安全码解密</div>
        <div class="text-sm">
          请联系管理员获取安全码以查看完整的联系方式信息
        </div>
      </div>
    </n-card>

    <!-- Placeholder for decrypted contact info -->
    <n-card title="基本信息" class="mb-4">
      <n-descriptions bordered :column="2" size="small">
        <n-descriptions-item label="代理账号">
          {{ agentDetail?.username || '--' }}
        </n-descriptions-item>
        <n-descriptions-item label="代理ID">
          {{ agentDetail?.id || '--' }}
        </n-descriptions-item>
        <n-descriptions-item label="推荐码">
          {{ agentDetail?.referralCode || '--' }}
        </n-descriptions-item>
        <n-descriptions-item label="币种">
          <n-tag type="info" size="small">{{
            agentDetail?.currency || '--'
          }}</n-tag>
        </n-descriptions-item>
      </n-descriptions>
    </n-card>

    <!-- Security Code Input -->
    <n-card title="安全码验证" class="mb-4">
      <n-form
        :model="securityForm"
        :rules="securityRules"
        ref="securityFormRef"
      >
        <n-form-item label="安全码" path="securityCode">
          <n-input
            v-model:value="securityForm.securityCode"
            type="password"
            placeholder="请输入安全码"
            show-password-on="click"
            style="width: 300px"
          />
        </n-form-item>
        <n-form-item>
          <n-button type="primary" @click="handleDecrypt" :loading="decrypting">
            解密查看
          </n-button>
          <n-button @click="handleReset" class="ml-2"> 重置 </n-button>
        </n-form-item>
      </n-form>
    </n-card>

    <!-- Decrypted Contact Info (Hidden by default) -->
    <n-card v-if="isDecrypted" title="解密后的联系方式" class="mb-4">
      <n-descriptions bordered :column="2" size="small">
        <n-descriptions-item label="真实姓名">
          {{ decryptedInfo.realName || '--' }}
        </n-descriptions-item>
        <n-descriptions-item label="身份证号">
          {{ decryptedInfo.idCard || '--' }}
        </n-descriptions-item>
        <n-descriptions-item label="手机号码">
          {{ decryptedInfo.phone || '--' }}
        </n-descriptions-item>
        <n-descriptions-item label="邮箱地址">
          {{ decryptedInfo.email || '--' }}
        </n-descriptions-item>
        <n-descriptions-item label="居住地址">
          {{ decryptedInfo.address || '--' }}
        </n-descriptions-item>
        <n-descriptions-item label="紧急联系人">
          {{ decryptedInfo.emergencyContact || '--' }}
        </n-descriptions-item>
        <n-descriptions-item label="紧急联系人电话">
          {{ decryptedInfo.emergencyPhone || '--' }}
        </n-descriptions-item>
        <n-descriptions-item label="备注">
          {{ decryptedInfo.notes || '--' }}
        </n-descriptions-item>
      </n-descriptions>
    </n-card>
  </div>
</template>

<script setup lang="ts">
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

// Reactive data
const loading = ref(false);
const agentDetail = ref<AgentContactInfo | null>(null);
const securityFormRef = ref();
const securityForm = reactive<SecurityForm>({
  securityCode: '',
});

const decrypting = ref(false);
const isDecrypted = ref(false);

// Decrypted info from API
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

// Validation rules
const securityRules = {
  securityCode: {
    required: true,
    message: '请输入安全码',
    trigger: 'blur',
  },
};

// Methods
const loadAgentContactInfo = async () => {
  if (!props.agentId) return;

  loading.value = true;
  try {
    const data = await getAgentContactInfoApi(props.agentId);
    agentDetail.value = data;

    // Map API data to decrypted info
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
    message.error('加载代理联系信息失败');
  } finally {
    loading.value = false;
  }
};

const handleDecrypt = async () => {
  try {
    await securityFormRef.value?.validate();
    decrypting.value = true;

    // Simulate API call for security verification
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (securityForm.securityCode === 'admin123') {
      isDecrypted.value = true;
      message.success('解密成功，联系方式信息已显示');
    } else {
      message.error('安全码错误，请重试');
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
  message.info('已重置');
};

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    message.success('已复制到剪贴板');
  } catch (error) {
    message.error('复制失败');
  }
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
