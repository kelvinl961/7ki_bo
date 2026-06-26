<template>
  <n-modal
    v-model:show="visible"
    preset="card"
    :title="$t('agency.manualDebit.title')"
    :style="{ width: '600px' }"
  >
    <div class="space-y-4">
      <div class="grid grid-cols-3 gap-4 rounded bg-gray-50 p-4">
        <div>
          <span class="text-sm text-gray-600"
            >{{ $t('agency.manualDebit.agentId') }}:</span
          >
          <span class="ml-2 font-medium text-gray-600">{{ agentInfo.id }}</span>
        </div>
        <div>
          <span class="text-sm text-gray-600"
            >{{ $t('agency.manualDebit.agentAccount') }}:</span
          >
          <span class="ml-2 font-medium text-gray-600">{{
            agentInfo.username
          }}</span>
        </div>
        <div class="flex items-center justify-between">
          <div>
            <span class="text-sm text-gray-600"
              >{{ $t('agency.manualDebit.agentCurrency') }}:</span
            >
            <span class="ml-2 font-medium text-gray-600">{{
              agentInfo.currency
            }}</span>
          </div>
          <n-button size="small" @click="refreshBalance" :loading="loading">
            {{ $t('agency.manualDebit.refreshBalance') }}
          </n-button>
        </div>
      </div>

      <n-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-placement="left"
        label-width="120px"
      >
        <div class="grid grid-cols-2 gap-4">
          <n-form-item :label="$t('agency.manualDebit.agentId')">
            <n-input v-model:value="formData.agentId" readonly />
          </n-form-item>

          <n-form-item :label="$t('agency.manualDebit.agentName')">
            <n-input v-model:value="formData.agentName" readonly />
          </n-form-item>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <n-form-item :label="$t('agency.manualDebit.availableBalance')">
            <n-input-group>
              <n-input v-model:value="formData.availableBalance" readonly />
              <n-input-group-label>{{
                agentInfo.currency
              }}</n-input-group-label>
            </n-input-group>
          </n-form-item>

          <n-form-item :label="$t('agency.manualDebit.frozenBalance')">
            <n-input-group>
              <n-input v-model:value="formData.frozenBalance" readonly />
              <n-input-group-label>{{
                agentInfo.currency
              }}</n-input-group-label>
            </n-input-group>
          </n-form-item>
        </div>

        <n-form-item :label="$t('agency.manualDebit.totalBalance')">
          <n-input-group>
            <n-input v-model:value="formData.totalBalance" readonly />
            <n-input-group-label>{{ agentInfo.currency }}</n-input-group-label>
          </n-input-group>
        </n-form-item>

        <n-form-item :label="$t('agency.manualDebit.debitType')" path="type">
          <n-radio-group v-model:value="formData.type">
            <n-space>
              <n-radio value="manual_debit">{{ $t('agency.manualDebit.manualDebit') }}</n-radio>
              <n-radio value="penalty">{{
                $t('agency.manualDebit.penalty')
              }}</n-radio>
              <n-radio value="adjustment">{{
                $t('agency.manualDebit.adjustment')
              }}</n-radio>
            </n-space>
          </n-radio-group>
        </n-form-item>

        <n-form-item :label="$t('agency.manualDebit.debitAmount')" path="amount">
          <n-input-group>
            <n-input-group-label>{{ agentInfo.currency }}</n-input-group-label>
            <n-input
              v-model:value="formData.amount"
              :placeholder="$t('agency.manualDebit.enterAmount')"
              type="number"
            />
          </n-input-group>
        </n-form-item>

        <n-form-item :label="$t('agency.manualDebit.debitReason')" path="reason">
          <n-input
            v-model:value="formData.reason"
            type="textarea"
            :placeholder="$t('agency.manualDebit.enterReason')"
            :maxlength="500"
            show-count
          />
        </n-form-item>

        <n-form-item :label="$t('agency.manualDebit.frontendNote')">
          <n-input
            v-model:value="formData.frontendNotes"
            type="textarea"
            :placeholder="$t('agency.manualDebit.frontendNotePlaceholder')"
            :maxlength="500"
            show-count
          />
        </n-form-item>

        <n-form-item :label="$t('agency.manualDebit.backendNote')">
          <n-input
            v-model:value="formData.backendNotes"
            type="textarea"
            :placeholder="$t('agency.manualDebit.backendNotePlaceholder')"
            :maxlength="500"
            show-count
          />
        </n-form-item>
      </n-form>
    </div>

    <template #action>
      <div class="flex gap-2">
        <n-button @click="visible = false">{{ $t('common.cancel') }}</n-button>
        <n-button type="error" @click="handleSubmit" :loading="submitting">
          {{ $t('agency.manualDebit.confirmDebit') }}
        </n-button>
      </div>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { $t } from '@vben/locales';

import { ref, reactive, watch, computed } from 'vue';
import { useMessage } from 'naive-ui';
import type { FormInst, FormRules } from 'naive-ui';

interface Props {
  visible: boolean;
  agentInfo: {
    id: number;
    username: string;
    currency: string;
    unclaimedCommission: number;
    claimedCommission: number;
  };
}

interface FormData {
  agentId: number;
  agentName: string;
  availableBalance: number;
  frozenBalance: number;
  totalBalance: number;
  type: string;
  amount: string;
  reason: string;
  frontendNotes: string;
  backendNotes: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'update:visible': [value: boolean];
  success: [];
}>();

const message = useMessage();
const formRef = ref<FormInst>();
const loading = ref(false);
const submitting = ref(false);

const formData = reactive<FormData>({
  agentId: 0,
  agentName: '',
  availableBalance: 0,
  frozenBalance: 0,
  totalBalance: 0,
  type: 'manual_debit',
  amount: '',
  reason: '',
  frontendNotes: '',
  backendNotes: '',
});

const rules = computed<FormRules>(() => ({
  type: {
    required: true,
    message: $t('agency.manualDebit.selectType'),
    trigger: 'change',
  },
  amount: {
    required: true,
    message: $t('agency.manualDebit.enterAmount'),
    trigger: 'blur',
    validator: (_rule, value) => {
      if (!value) return new Error($t('agency.manualDebit.enterAmount'));
      if (isNaN(Number(value)) || Number(value) <= 0) {
        return new Error($t('agency.manualDebit.enterValidAmount'));
      }
      if (Number(value) > formData.availableBalance) {
        return new Error($t('agency.manualDebit.amountExceedsBalance'));
      }
      return true;
    },
  },
  reason: {
    required: true,
    message: $t('agency.manualDebit.enterReasonRequired'),
    trigger: 'blur',
  },
}));

watch(
  () => props.agentInfo,
  (newInfo) => {
    if (newInfo) {
      formData.agentId = newInfo.id;
      formData.agentName = newInfo.username;
      formData.availableBalance = newInfo.unclaimedCommission || 0;
      formData.frozenBalance = newInfo.claimedCommission || 0;
      formData.totalBalance =
        (newInfo.unclaimedCommission || 0) + (newInfo.claimedCommission || 0);
    }
  },
  { immediate: true },
);

const refreshBalance = async () => {
  loading.value = true;
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    message.success($t('agency.manualDebit.balanceRefreshed'));
  } catch {
    message.error($t('agency.manualDebit.balanceRefreshFailed'));
  } finally {
    loading.value = false;
  }
};

const handleSubmit = async () => {
  try {
    await formRef.value?.validate();
    submitting.value = true;
    await new Promise((resolve) => setTimeout(resolve, 1000));
    message.success($t('agency.manualDebit.debitSuccess'));
    emit('success');
    emit('update:visible', false);
  } catch (error) {
    console.error('Submit error:', error);
  } finally {
    submitting.value = false;
  }
};

const visible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value),
});
</script>

<style scoped>
.space-y-4 > * + * {
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
  border-radius: 0.375rem;
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

.items-center {
  align-items: center;
}

.justify-between {
  justify-content: space-between;
}
</style>
