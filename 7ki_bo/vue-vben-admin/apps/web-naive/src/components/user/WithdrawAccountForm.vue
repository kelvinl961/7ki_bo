<template>
  <n-modal
    v-model:show="visibleModel"
    :mask-closable="false"
    preset="card"
    :title="isEdit ? $t('user.withdrawAccount.editTitle') : $t('user.withdrawAccount.addTitle')"
    style="width: 600px"
    size="large"
    @close="handleClose"
  >
    <n-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-placement="left"
      label-width="120"
      require-mark-placement="right-hanging"
    >
      <n-form-item :label="$t('common.currency')" path="currency">
        <n-select
          v-model:value="formData.currency"
          :placeholder="$t('user.withdrawAccount.selectCurrency')"
          :options="currencyOptions"
          :disabled="isEdit"
        />
      </n-form-item>

      <n-form-item :label="$t('user.withdrawAccount.withdrawMethod')" path="methodType">
        <n-select
          v-model:value="formData.methodType"
          :placeholder="$t('user.withdrawAccount.selectMethod')"
          :options="methodTypeOptions"
          @update:value="handleMethodTypeChange"
        />
      </n-form-item>

      <n-form-item :label="$t('user.withdrawAccount.accountType')" path="accountType">
        <n-select
          v-model:value="formData.accountType"
          :placeholder="$t('user.withdrawAccount.selectAccountType')"
          :options="currentAccountTypeOptions"
        />
      </n-form-item>

      <n-form-item :label="$t('user.withdrawAccount.withdrawAddress')" path="accountValue">
        <n-input
          v-model:value="formData.accountValue"
          :placeholder="accountValuePlaceholder"
          clearable
        />
      </n-form-item>

      <n-form-item :label="$t('user.withdrawAccount.bankHolderName')" path="bankHolderName">
        <n-input
          v-model:value="formData.bankHolderName"
          :placeholder="$t('user.withdrawAccount.enterBankHolder')"
          clearable
        />
      </n-form-item>

      <!-- Bank specific fields -->
      <template v-if="isBankAccountMethod">
        <n-form-item :label="$t('user.withdrawAccount.bankCodeLabel')" path="bankCode">
          <n-input
            v-model:value="formData.bankCode"
            :placeholder="$t('user.withdrawAccount.enterBankCode')"
            clearable
          />
        </n-form-item>

        <n-form-item :label="$t('user.withdrawAccount.bankNameLabel')" path="bankName">
          <n-input
            v-model:value="formData.bankName"
            :placeholder="$t('user.withdrawAccount.enterBankName')"
            clearable
          />
        </n-form-item>

        <n-form-item :label="$t('user.withdrawAccount.bankRouting')" path="bankRouting">
          <n-input
            v-model:value="formData.bankRouting"
            :placeholder="$t('user.withdrawAccount.enterBankRouting')"
            clearable
          />
        </n-form-item>
      </template>

      <n-form-item :label="$t('user.withdrawAccount.backendNote')" path="backendNote">
        <n-input
          v-model:value="formData.backendNote"
          type="textarea"
          :placeholder="$t('user.withdrawAccount.enterBackendNoteOptional')"
          :rows="3"
        />
      </n-form-item>
    </n-form>

    <template #action>
      <div class="flex gap-2">
        <n-button @click="handleClose">{{ $t('common.cancel') }}</n-button>
        <n-button type="primary" :loading="loading" @click="handleSubmit">
          {{ isEdit ? $t('common.submit') : $t('common.create') }}
        </n-button>
      </div>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { $t } from '@vben/locales';

import { ref, computed, reactive, watch } from 'vue';
import {
  NModal,
  NForm,
  NFormItem,
  NInput,
  NSelect,
  NButton,
  useMessage,
  type FormInst,
  type FormRules,
} from 'naive-ui';
import {
  createWithdrawAccountApi,
  updateWithdrawAccountApi,
  type WithdrawAccount,
  type CreateWithdrawAccountParams,
  type UpdateWithdrawAccountParams,
} from '#/api/core/withdrawal-account';

interface Props {
  visible: boolean;
  userId: number;
  editData?: WithdrawAccount | null;
}

interface Emits {
  (event: 'update:visible', value: boolean): void;
  (event: 'success'): void;
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  editData: null,
});

const emit = defineEmits<Emits>();
const message = useMessage();

// Form reference
const formRef = ref<FormInst>();
const loading = ref(false);

// Computed
const visibleModel = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value),
});

const isEdit = computed(() => !!props.editData);

// Form data
const formData = reactive({
  currency: 'BRL',
  methodType: '',
  accountType: '',
  accountValue: '',
  bankCode: '',
  bankName: '',
  bankHolderName: '',
  bankRouting: '',
  backendNote: '',
});

// Options
const currencyOptions = computed(() => [
  { label: $t('user.withdrawAccount.currencyBrl'), value: 'BRL' },
  { label: $t('user.withdrawAccount.currencyUsd'), value: 'USD' },
  { label: $t('user.withdrawAccount.currencyEur'), value: 'EUR' },
]);

const methodTypeOptions = computed(() => [
  { label: 'PIX', value: 'PIX' },
  { label: $t('user.withdrawAccount.bankTransfer'), value: 'BANK_TRANSFER' },
  { label: 'TED', value: 'TED' },
  { label: 'DOC', value: 'DOC' },
]);

const pixAccountTypeOptions = computed(() => [
  { label: $t('user.allMembers.phone'), value: 'PHONE' },
  { label: 'CPF', value: 'CPF' },
  { label: $t('user.contact.email'), value: 'EMAIL' },
  { label: $t('user.withdrawAccount.randomKey'), value: 'RANDOM_KEY' },
]);

const bankAccountTypeOptions = computed(() => [
  { label: $t('user.withdrawAccount.bankAccount'), value: 'BANK_ACCOUNT' },
]);

const currentAccountTypeOptions = computed(() => {
  if (formData.methodType === 'PIX') {
    return pixAccountTypeOptions.value;
  }
  if (['BANK_TRANSFER', 'TED', 'DOC'].includes(formData.methodType)) {
    return bankAccountTypeOptions.value;
  }
  return [];
});

const isBankAccountMethod = computed(() =>
  ['BANK_TRANSFER', 'TED', 'DOC'].includes(formData.methodType),
);

const accountValuePlaceholder = computed(() => {
  switch (formData.accountType) {
    case 'PHONE':
      return $t('user.withdrawAccount.placeholderPhone');
    case 'CPF':
      return $t('user.withdrawAccount.placeholderCpf');
    case 'EMAIL':
      return $t('user.withdrawAccount.placeholderEmail');
    case 'RANDOM_KEY':
      return $t('user.withdrawAccount.placeholderPixKey');
    case 'BANK_ACCOUNT':
      return $t('user.withdrawAccount.placeholderBankAccount');
    default:
      return $t('user.withdrawAccount.placeholderAddress');
  }
});

// Form rules
const formRules = computed<FormRules>(() => ({
  currency: {
    required: true,
    message: $t('user.withdrawAccount.currencyRequired'),
    trigger: 'blur',
  },
  methodType: {
    required: true,
    message: $t('user.withdrawAccount.methodRequired'),
    trigger: 'blur',
  },
  accountType: {
    required: true,
    message: $t('user.withdrawAccount.accountTypeRequired'),
    trigger: 'blur',
  },
  accountValue: {
    required: true,
    message: $t('user.withdrawAccount.addressRequired'),
    trigger: 'blur',
  },
  bankName: {
    required: false,
    validator: (_rule, value) => {
      if (isBankAccountMethod.value && !String(value || '').trim()) {
        return new Error($t('user.withdrawAccount.bankNameRequired'));
      }
      return true;
    },
    trigger: 'blur',
  },
  bankHolderName: {
    required: true,
    validator: (_rule, value) => {
      if (!String(value || '').trim()) {
        return new Error($t('user.withdrawAccount.holderRequired'));
      }
      return true;
    },
    trigger: 'blur',
  },
}));

// Methods
const handleMethodTypeChange = () => {
  formData.accountType = '';
};

const resetForm = () => {
  Object.assign(formData, {
    currency: 'BRL',
    methodType: '',
    accountType: '',
    accountValue: '',
    bankCode: '',
    bankName: '',
    bankHolderName: '',
    bankRouting: '',
    backendNote: '',
  });
};

const loadEditData = () => {
  if (props.editData) {
    Object.assign(formData, {
      currency: props.editData.currency,
      methodType: props.editData.methodType,
      accountType: props.editData.accountType,
      accountValue: props.editData.accountValue,
      bankCode: props.editData.bankCode || '',
      bankName: props.editData.bankName || '',
      bankHolderName: props.editData.bankHolderName || '',
      bankRouting: props.editData.bankRouting || '',
      backendNote: props.editData.backendNote || '',
    });
  } else {
    resetForm();
  }
};

const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    const bankHolderName = formData.bankHolderName.trim();
    const bankName = formData.bankName.trim();
    if (!bankHolderName) {
      message.error($t('user.withdrawAccount.holderRequired'));
      return;
    }

    await formRef.value.validate();
    loading.value = true;

    if (isEdit.value && props.editData) {
      const updateParams: UpdateWithdrawAccountParams = {
        methodType: formData.methodType,
        accountType: formData.accountType,
        accountValue: formData.accountValue,
        bankCode: formData.bankCode || undefined,
        bankName: bankName || undefined,
        bankHolderName,
        bankRouting: formData.bankRouting || undefined,
        backendNote: formData.backendNote || undefined,
      };

      await updateWithdrawAccountApi(props.editData.id, updateParams);
      message.success($t('user.withdrawAccount.updateSuccess'));
    } else {
      const createParams: CreateWithdrawAccountParams = {
        userId: props.userId,
        currency: formData.currency,
        methodType: formData.methodType,
        accountType: formData.accountType,
        accountValue: formData.accountValue,
        bankCode: formData.bankCode || undefined,
        bankName: bankName || undefined,
        bankHolderName,
        bankRouting: formData.bankRouting || undefined,
        backendNote: formData.backendNote || undefined,
      };

      await createWithdrawAccountApi(createParams);
      message.success($t('user.withdrawAccount.createSuccess'));
    }

    emit('success');
    handleClose();
  } catch (error) {
    message.error(
      isEdit.value
        ? $t('user.withdrawAccount.updateFailed')
        : $t('user.withdrawAccount.createFailed'),
    );
    console.error('Submit error:', error);
  } finally {
    loading.value = false;
  }
};

const handleClose = () => {
  emit('update:visible', false);
  resetForm();
};

watch(() => props.editData, loadEditData, { immediate: true });
watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      loadEditData();
    }
  },
);
</script>

<style scoped>
.flex {
  display: flex;
}

.gap-2 {
  gap: 8px;
}
</style>
