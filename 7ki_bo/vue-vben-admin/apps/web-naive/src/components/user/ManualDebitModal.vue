<template>
  <n-modal
    v-model:show="visible"
    preset="card"
    title="新增手动扣款"
    :style="{ width: '600px' }"
  >
    <div class="space-y-4">
      <!-- User Info Header -->
      <div class="grid grid-cols-3 gap-4 rounded bg-gray-50 p-4">
        <div>
          <span class="text-sm text-gray-600">会员ID:</span>
          <span class="ml-2 font-medium">{{ userInfo.id }}</span>
        </div>
        <div>
          <span class="text-sm text-gray-600">会员账号:</span>
          <span class="ml-2 font-medium">{{ userInfo.account }}</span>
        </div>
        <div class="flex items-center justify-between">
          <div>
            <span class="text-sm text-gray-600">会员币种:</span>
            <span class="ml-2 font-medium">{{ userInfo.currency }}</span>
          </div>
          <n-button size="small" @click="refreshBalance" :loading="loading">
            刷新余额
          </n-button>
        </div>
      </div>

      <!-- Form Fields -->
      <n-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-placement="left"
        label-width="120px"
      >
        <div class="grid grid-cols-2 gap-4">
          <n-form-item label="会员ID">
            <n-input v-model:value="formData.memberId" readonly />
          </n-form-item>

          <n-form-item label="真实姓名">
            <n-input v-model:value="formData.realName" readonly />
          </n-form-item>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <n-form-item label="账户余额">
            <n-input-group>
              <n-input v-model:value="formData.accountBalance" readonly />
              <n-input-group-label>{{ userInfo.currency }}</n-input-group-label>
            </n-input-group>
          </n-form-item>

          <n-form-item label="利息宝余额">
            <n-input-group>
              <n-input v-model:value="formData.interestBalance" readonly />
              <n-input-group-label>{{ userInfo.currency }}</n-input-group-label>
            </n-input-group>
          </n-form-item>
        </div>

        <n-form-item label="会计总余额">
          <n-input-group>
            <n-input v-model:value="formData.totalBalance" readonly />
            <n-input-group-label>{{ userInfo.currency }}</n-input-group-label>
          </n-input-group>
        </n-form-item>

        <n-form-item label="类型" path="type">
          <n-radio-group v-model:value="formData.type">
            <n-space direction="vertical">
              <n-radio value="manual_deduct">
                <div>
                  <div class="font-medium">手动扣除</div>
                  <div class="text-sm text-gray-500">
                    (先扣余额，不足时扣利息宝余额)
                  </div>
                </div>
              </n-radio>
              <n-radio value="deduct_all_assets">
                <div>
                  <div class="font-medium">扣除全部资产</div>
                  <div class="text-sm text-gray-500">
                    (即余额和利息宝余额清0)
                  </div>
                </div>
              </n-radio>
              <n-radio value="recovery_deduct">
                <div>
                  <div class="font-medium">追偿扣除</div>
                  <div class="text-sm text-gray-500">
                    (扣除全部资产后，再额外扣除或者添加负值金额)
                  </div>
                </div>
              </n-radio>
            </n-space>
          </n-radio-group>
        </n-form-item>

        <n-form-item label="扣除金额" path="amount">
          <n-input-group>
            <n-input-group-label>{{ userInfo.currency }}</n-input-group-label>
            <n-input
              v-model:value="formData.amount"
              placeholder="请输入扣除金额"
              type="number"
            />
          </n-input-group>
        </n-form-item>

        <n-form-item label="补单说明" path="description">
          <n-input
            v-model:value="formData.description"
            type="textarea"
            placeholder="请输入补单事件说明"
            :maxlength="1000"
            show-count
          />
        </n-form-item>

        <n-form-item label="前台备注">
          <n-input
            v-model:value="formData.frontendNotes"
            type="textarea"
            placeholder="请输入显示在客户端的备注"
            :maxlength="1000"
            show-count
          />
        </n-form-item>

        <n-form-item label="后台备注">
          <n-input
            v-model:value="formData.backendNotes"
            type="textarea"
            placeholder="请输入显示在管理后台的备注"
            :maxlength="1000"
            show-count
          />
        </n-form-item>
      </n-form>
    </div>

    <template #footer>
      <div class="flex justify-end gap-3">
        <n-button @click="handleCancel">取消</n-button>
        <n-button type="primary" :loading="loading" @click="handleConfirm"
          >确认</n-button
        >
      </div>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import {
  NModal,
  NForm,
  NFormItem,
  NInput,
  NInputGroup,
  NInputGroupLabel,
  NRadioGroup,
  NRadio,
  NSpace,
  NButton,
} from 'naive-ui';
import { notification } from '#/adapter/naive';
import { requestClient } from '#/api/request';

// Props
const props = defineProps<{
  user?: any;
}>();

// Emits
const emit = defineEmits<{
  success: [transactionData: any];
}>();

// State
const visible = ref(false);
const loading = ref(false);
const formRef = ref();

// User info computed
const userInfo = computed(() => ({
  id: props.user?.id || '',
  account: props.user?.account || '',
  currency: props.user?.currency || 'BRL',
  balance: props.user?.balance || 0,
  interestBalance: props.user?.savingsWallet || 0,
}));

// Form data
const formData = reactive({
  memberId: '',
  realName: '',
  accountBalance: '',
  interestBalance: '',
  totalBalance: '',
  type: 'manual_deduct',
  amount: '',
  description: '',
  frontendNotes: '',
  backendNotes: '',
});

// Form rules
const rules = {
  type: {
    required: true,
    message: '请选择类型',
    trigger: 'change',
  },
  amount: {
    required: true,
    message: '请输入扣除金额',
    trigger: 'blur',
  },
  description: {
    required: true,
    message: '请输入补单说明',
    trigger: 'blur',
  },
};

// Methods
const initFormData = () => {
  if (props.user) {
    formData.memberId = props.user.id?.toString() || '';
    formData.realName = props.user.realName || '';
    formData.accountBalance = props.user.balance?.toFixed(2) || '0.00';
    formData.interestBalance = props.user.savingsWallet?.toFixed(2) || '0.00';
    formData.totalBalance = (
      (props.user.balance || 0) + (props.user.savingsWallet || 0)
    ).toFixed(2);
  }
};

// Refresh balance data from API
const refreshBalance = async () => {
  try {
    if (!props.user?.id) return;

    console.log('Refreshing balance data for user:', props.user.id);

    // Call API to get fresh user data
    const response = await requestClient.get(`/users/${props.user.id}`);

    console.log('Balance refresh API response:', response);

    // Check if we have data - requestClient might unwrap the response automatically
    const userData = response.data || response;

    if (userData && (userData.id || userData.balance !== undefined)) {
      // Update form with fresh balance data
      formData.accountBalance = Number(userData.balance || 0).toFixed(2);
      formData.interestBalance = Number(userData.savingsWallet || 0).toFixed(2);
      formData.totalBalance = (
        Number(userData.balance || 0) + Number(userData.savingsWallet || 0)
      ).toFixed(2);

      console.log('Balance refreshed successfully');
    } else {
      throw new Error('No user data in response');
    }
  } catch (error) {
    console.error('Failed to refresh balance:', error);
  }
};

const handleCancel = () => {
  visible.value = false;
  resetForm();
};

const handleConfirm = async () => {
  try {
    await formRef.value?.validate();
    loading.value = true;

    // Prepare API data
    const apiData = {
      userId: props.user?.id,
      type: 'debit',
      subType: formData.type,
      amount: parseFloat(formData.amount),
      description: formData.description,
      frontendNotes: formData.frontendNotes,
      backendNotes: formData.backendNotes,
      currency: userInfo.value.currency,
    };

    console.log('🚀 Submitting manual debit transaction:', apiData);

    // Submit to backend API
    const response = await requestClient.post('/transactions/manual', apiData);

    console.log('💰 Manual debit API response:', response);

    // Handle successful response
    handleTransactionSuccess(response, 'debit');
  } catch (error) {
    console.error('Manual debit error:', error);

    // Check if this is actually a successful response being thrown as an error
    if (error && typeof error === 'object' && error.success === true) {
      console.log(
        '🔧 Detected successful response in error - treating as success',
      );
      handleTransactionSuccess(error, 'debit');
      return;
    }

    // Show error notification only for real errors
    notification.error({
      content: '操作失败，请重试',
      duration: 3000,
    });
  } finally {
    loading.value = false;
  }
};

// Helper function to handle successful transactions
const handleTransactionSuccess = (response, transactionType) => {
  console.log('💰 Processing successful transaction:', response);

  // Immediately close modal
  visible.value = false;
  resetForm();

  // Show success notification
  notification.success({
    content: '手动扣款操作成功',
    duration: 3000,
  });

  // Emit transaction data for immediate balance update
  const transactionData = {
    type: transactionType,
    subType: formData.type,
    amount: parseFloat(formData.amount),
    currency: userInfo.value.currency,
    userId: props.user?.id,
    result: response,
  };

  console.log('📤 Emitting success event with data:', transactionData);

  // Emit success event to trigger immediate refresh
  emit('success', transactionData);
};

const resetForm = () => {
  formData.type = 'manual_deduct';
  formData.amount = '';
  formData.description = '';
  formData.frontendNotes = '';
  formData.backendNotes = '';
};

const open = () => {
  visible.value = true;
  initFormData();
};

const close = () => {
  visible.value = false;
  resetForm();
};

// Expose methods
defineExpose({
  open,
  close,
});
</script>

<style scoped>
.space-y-4 > :not([hidden]) ~ :not([hidden]) {
  margin-top: 1rem;
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

.gap-3 {
  gap: 0.75rem;
}

.gap-4 {
  gap: 1rem;
}

.p-4 {
  padding: 1rem;
}

.bg-gray-50 {
  background-color: #f9fafb;
}

.rounded {
  border-radius: 0.25rem;
}

.text-sm {
  font-size: 0.875rem;
}

.text-gray-600 {
  color: #4b5563;
}

.text-gray-500 {
  color: #6b7280;
}

.font-medium {
  font-weight: 500;
}

.ml-2 {
  margin-left: 0.5rem;
}

.flex {
  display: flex;
}

.justify-end {
  justify-content: flex-end;
}
</style>
