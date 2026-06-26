<template>
  <n-modal
    v-model:show="visible"
    preset="card"
    :title="$t('user.manualCredit.addTitle')"
    :style="{ width: '600px' }"
  >
    <div class="space-y-4">
      <!-- User Info Header -->
      <div class="grid grid-cols-3 gap-4 rounded bg-gray-50 p-4">
        <div>
          <span class="text-sm text-gray-600">{{ $t('user.manualDebit.memberId') }}:</span>
          <span class="ml-2 font-medium text-gray-600">{{ userInfo.id }}</span>
        </div>
        <div>
          <span class="text-sm text-gray-600">{{ $t('user.manualDebit.memberAccount') }}:</span>
          <span class="ml-2 font-medium text-gray-600">{{
            userInfo.account
          }}</span>
        </div>
        <div class="flex items-center justify-between">
          <div>
            <span class="text-sm text-gray-600">{{ $t('user.manualDebit.memberCurrency') }}:</span>
            <span class="ml-2 font-medium text-gray-600">{{
              userInfo.currency
            }}</span>
          </div>
          <n-button size="small" @click="refreshBalance" :loading="loading">
            {{ $t('user.manualCredit.refreshBalance') }}
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
          <n-form-item :label="$t('user.manualDebit.memberId')">
            <n-input v-model:value="formData.memberId" readonly />
          </n-form-item>

          <n-form-item :label="$t('user.userDetail.realName')">
            <n-input v-model:value="formData.realName" readonly />
          </n-form-item>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <n-form-item :label="$t('user.advancedSearch.accountBalance')">
            <n-input-group>
              <n-input v-model:value="formData.accountBalance" readonly />
              <n-input-group-label>{{ userInfo.currency }}</n-input-group-label>
            </n-input-group>
          </n-form-item>

          <n-form-item :label="$t('user.manualCredit.interestBalance')">
            <n-input-group>
              <n-input v-model:value="formData.interestBalance" readonly />
              <n-input-group-label>{{ userInfo.currency }}</n-input-group-label>
            </n-input-group>
          </n-form-item>
        </div>

        <n-form-item :label="$t('user.manualCredit.accountingTotalBalance')">
          <n-input-group>
            <n-input v-model:value="formData.totalBalance" readonly />
            <n-input-group-label>{{ userInfo.currency }}</n-input-group-label>
          </n-input-group>
        </n-form-item>

        <n-form-item :label="$t('common.type')" path="type">
          <n-radio-group v-model:value="formData.type">
            <n-space>
              <n-radio value="manual_credit">{{ $t('user.manualCredit.manualAddOrder') }}</n-radio>
              <n-radio value="manual_add">{{ $t('user.manualCredit.manualAdd') }}</n-radio>
            </n-space>
          </n-radio-group>
        </n-form-item>

        <n-form-item :label="$t('user.manualCredit.orderAmount')" path="amount">
          <n-input-group>
            <n-input-group-label>{{ userInfo.currency }}</n-input-group-label>
            <n-input
              v-model:value="formData.amount"
              :placeholder="$t('user.manualCredit.enterOrderAmount')"
              type="number"
            />
          </n-input-group>
        </n-form-item>

        <n-form-item :label="$t('user.manualCredit.multiplier')">
          <n-input-number
            v-model:value="formData.multiplier"
            :min="1"
            :step="0.1"
            placeholder="1.00"
          />
        </n-form-item>

        <n-form-item :label="$t('user.manualCredit.adjustmentDescription')" path="description">
          <n-input
            v-model:value="formData.description"
            type="textarea"
            :placeholder="$t('user.manualCredit.enterAdjustmentDescription')"
            :maxlength="1000"
            show-count
          />
        </n-form-item>

        <n-form-item :label="$t('user.manualCredit.frontendNote')">
          <n-input
            v-model:value="formData.frontendNotes"
            type="textarea"
            :placeholder="$t('user.manualCredit.frontendNotePlaceholder')"
            :maxlength="1000"
            show-count
          />
        </n-form-item>

        <n-form-item :label="$t('user.manualCredit.backendNote')">
          <n-input
            v-model:value="formData.backendNotes"
            type="textarea"
            :placeholder="$t('user.manualCredit.backendNotePlaceholder')"
            :maxlength="1000"
            show-count
          />
        </n-form-item>
      </n-form>
    </div>

    <template #footer>
      <div class="flex justify-end gap-3">
        <n-button @click="handleCancel">{{ $t('common.cancel') }}</n-button>
        <n-button type="primary" :loading="loading" @click="handleConfirm"
          >{{ $t('common.confirm') }}</n-button
        >
      </div>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { $t } from '@vben/locales';

import { ref, reactive, computed } from 'vue';
import {
  NModal,
  NForm,
  NFormItem,
  NInput,
  NInputGroup,
  NInputGroupLabel,
  NInputNumber,
  NRadioGroup,
  NRadio,
  NButton,
  NSpace,
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
  type: 'manual_credit',
  amount: '',
  multiplier: 1.0,
  description: '',
  frontendNotes: '',
  backendNotes: '',
});

// Form rules
const rules = computed(() => ({
  type: {
    required: true,
    message: $t('user.manualCredit.selectTypeRequired'),
    trigger: 'change',
  },
  amount: {
    required: true,
    message: $t('user.manualCredit.enterOrderAmount'),
    trigger: 'blur',
  },
  description: {
    required: true,
    message: $t('user.manualCredit.enterOrderDescriptionRequired'),
    trigger: 'blur',
  },
}));

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

const refreshBalance = async () => {
  try {
    if (!props.user?.id) return;

    const response = await requestClient.get(`/users/${props.user.id}`);
    const userData = response.data || response;

    if (userData && (userData.id || userData.balance !== undefined)) {
      formData.accountBalance = Number(userData.balance || 0).toFixed(2);
      formData.interestBalance = Number(userData.savingsWallet || 0).toFixed(2);
      formData.totalBalance = (
        Number(userData.balance || 0) + Number(userData.savingsWallet || 0)
      ).toFixed(2);
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

    const apiData = {
      userId: props.user?.id,
      type: 'credit',
      subType: formData.type,
      amount: parseFloat(formData.amount),
      multiplier: formData.multiplier,
      description: formData.description,
      frontendNotes: formData.frontendNotes,
      backendNotes: formData.backendNotes,
      currency: userInfo.value.currency,
    };

    const response = await requestClient.post('/transactions/manual', apiData);
    handleTransactionSuccess(response, 'credit');
  } catch (error) {
    console.error('Manual credit error:', error);

    if (error && typeof error === 'object' && error.success === true) {
      handleTransactionSuccess(error, 'credit');
      return;
    }

    notification.error({
      content: $t('common.operationFailed'),
      duration: 3000,
    });
  } finally {
    loading.value = false;
  }
};

const handleTransactionSuccess = (response: any, transactionType: string) => {
  visible.value = false;
  resetForm();

  notification.success({
    content: $t('user.manualCredit.creditSuccess'),
    duration: 3000,
  });

  const transactionData = {
    type: transactionType,
    subType: formData.type,
    amount: parseFloat(formData.amount) * formData.multiplier,
    currency: userInfo.value.currency,
    userId: props.user?.id,
    result: response,
  };

  emit('success', transactionData);
};

const resetForm = () => {
  formData.type = 'manual_credit';
  formData.amount = '';
  formData.multiplier = 1.0;
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
