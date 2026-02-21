<template>
  <n-modal
    v-model:show="visibleModel"
    :mask-closable="false"
    preset="card"
    :title="isEdit ? '编辑提现账号' : '添加提现账号'"
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
      <n-form-item label="币种" path="currency">
        <n-select
          v-model:value="formData.currency"
          placeholder="选择币种"
          :options="currencyOptions"
          :disabled="isEdit"
        />
      </n-form-item>

      <n-form-item label="提现方式" path="methodType">
        <n-select
          v-model:value="formData.methodType"
          placeholder="选择提现方式"
          :options="methodTypeOptions"
          @update:value="handleMethodTypeChange"
        />
      </n-form-item>

      <n-form-item label="账户类型" path="accountType">
        <n-select
          v-model:value="formData.accountType"
          placeholder="选择账户类型"
          :options="currentAccountTypeOptions"
        />
      </n-form-item>

      <n-form-item label="提现账号/地址" path="accountValue">
        <n-input
          v-model:value="formData.accountValue"
          :placeholder="getAccountValuePlaceholder()"
          clearable
        />
      </n-form-item>

      <!-- Bank specific fields -->
      <template v-if="formData.methodType === 'BANK_TRANSFER'">
        <n-form-item label="银行代码" path="bankCode">
          <n-input
            v-model:value="formData.bankCode"
            placeholder="输入银行代码（可选）"
            clearable
          />
        </n-form-item>

        <n-form-item label="银行名称" path="bankName">
          <n-input
            v-model:value="formData.bankName"
            placeholder="输入银行名称"
            clearable
          />
        </n-form-item>

        <n-form-item label="银行户名" path="bankHolderName">
          <n-input
            v-model:value="formData.bankHolderName"
            placeholder="输入银行户名"
            clearable
          />
        </n-form-item>

        <n-form-item label="用户行号/SC码" path="bankRouting">
          <n-input
            v-model:value="formData.bankRouting"
            placeholder="输入银行路由代码（可选）"
            clearable
          />
        </n-form-item>
      </template>

      <n-form-item label="后台备注" path="backendNote">
        <n-input
          v-model:value="formData.backendNote"
          type="textarea"
          placeholder="输入后台备注（可选）"
          :rows="3"
        />
      </n-form-item>
    </n-form>

    <template #action>
      <div class="flex gap-2">
        <n-button @click="handleClose">取消</n-button>
        <n-button type="primary" :loading="loading" @click="handleSubmit">
          {{ isEdit ? '更新' : '创建' }}
        </n-button>
      </div>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
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
const currencyOptions = [
  { label: 'BRL (巴西雷亚尔)', value: 'BRL' },
  { label: 'USD (美元)', value: 'USD' },
  { label: 'EUR (欧元)', value: 'EUR' },
];

const methodTypeOptions = [
  { label: 'PIX', value: 'PIX' },
  { label: '银行转账', value: 'BANK_TRANSFER' },
  { label: 'TED', value: 'TED' },
  { label: 'DOC', value: 'DOC' },
];

const accountTypeOptionsMap = {
  PIX: [
    { label: '手机号', value: 'PHONE' },
    { label: 'CPF', value: 'CPF' },
    { label: '邮箱', value: 'EMAIL' },
    { label: '随机密钥', value: 'RANDOM_KEY' },
  ],
  BANK_TRANSFER: [{ label: '银行账户', value: 'BANK_ACCOUNT' }],
  TED: [{ label: '银行账户', value: 'BANK_ACCOUNT' }],
  DOC: [{ label: '银行账户', value: 'BANK_ACCOUNT' }],
};

const currentAccountTypeOptions = computed(() => {
  return (
    accountTypeOptionsMap[
      formData.methodType as keyof typeof accountTypeOptionsMap
    ] || []
  );
});

// Form rules
const formRules: FormRules = {
  currency: {
    required: true,
    message: '请选择币种',
    trigger: 'blur',
  },
  methodType: {
    required: true,
    message: '请选择提现方式',
    trigger: 'blur',
  },
  accountType: {
    required: true,
    message: '请选择账户类型',
    trigger: 'blur',
  },
  accountValue: {
    required: true,
    message: '请输入提现账号/地址',
    trigger: 'blur',
  },
  bankName: {
    required: false,
    validator: (rule, value) => {
      if (formData.methodType === 'BANK_TRANSFER' && !value) {
        return new Error('银行转账时银行名称为必填项');
      }
      return true;
    },
    trigger: 'blur',
  },
  bankHolderName: {
    required: false,
    validator: (rule, value) => {
      if (formData.methodType === 'BANK_TRANSFER' && !value) {
        return new Error('银行转账时银行户名为必填项');
      }
      return true;
    },
    trigger: 'blur',
  },
};

// Methods
const handleMethodTypeChange = () => {
  // Reset account type when method type changes
  formData.accountType = '';
};

const getAccountValuePlaceholder = () => {
  switch (formData.accountType) {
    case 'PHONE':
      return '输入手机号码，如: +5511999999999';
    case 'CPF':
      return '输入CPF号码，如: 123.456.789-00';
    case 'EMAIL':
      return '输入邮箱地址，如: user@example.com';
    case 'RANDOM_KEY':
      return '输入PIX随机密钥';
    case 'BANK_ACCOUNT':
      return '输入银行账户号码';
    default:
      return '输入提现账号/地址';
  }
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
    await formRef.value.validate();
    loading.value = true;

    if (isEdit.value && props.editData) {
      // Update existing account
      const updateParams: UpdateWithdrawAccountParams = {
        methodType: formData.methodType,
        accountType: formData.accountType,
        accountValue: formData.accountValue,
        bankCode: formData.bankCode || undefined,
        bankName: formData.bankName || undefined,
        bankHolderName: formData.bankHolderName || undefined,
        bankRouting: formData.bankRouting || undefined,
        backendNote: formData.backendNote || undefined,
      };

      await updateWithdrawAccountApi(props.editData.id, updateParams);
      message.success('提现账号更新成功');
    } else {
      // Create new account
      const createParams: CreateWithdrawAccountParams = {
        userId: props.userId,
        currency: formData.currency,
        methodType: formData.methodType,
        accountType: formData.accountType,
        accountValue: formData.accountValue,
        bankCode: formData.bankCode || undefined,
        bankName: formData.bankName || undefined,
        bankHolderName: formData.bankHolderName || undefined,
        bankRouting: formData.bankRouting || undefined,
        backendNote: formData.backendNote || undefined,
      };

      await createWithdrawAccountApi(createParams);
      message.success('提现账号创建成功');
    }

    emit('success');
    handleClose();
  } catch (error) {
    message.error(isEdit.value ? '提现账号更新失败' : '提现账号创建失败');
    console.error('Submit error:', error);
  } finally {
    loading.value = false;
  }
};

const handleClose = () => {
  emit('update:visible', false);
  resetForm();
};

// Watch for edit data changes
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
