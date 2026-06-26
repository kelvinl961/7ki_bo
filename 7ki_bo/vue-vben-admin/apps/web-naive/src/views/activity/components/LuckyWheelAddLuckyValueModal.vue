<template>
  <n-modal
    v-model:show="visible"
    preset="card"
    :title="$t('activity.luckyWheelAddLuckyValue.k65b0')"
    :style="{ width: '480px', maxWidth: '96vw' }"
    :mask-closable="false"
  >
    <n-form label-placement="left" :label-width="96" size="medium">
      <n-form-item :label="$t('activity.rewardReport.k4f1a3')" required>
        <n-input v-model:value="form.account" :placeholder="$t('activity.luckyWheelAddLuckyValue.k8bf7')" clearable />
      </n-form-item>
      <n-form-item :label="$t('activity.luckyWheelAddLuckyValue.k53d8')" required>
        <n-input-number
          v-model:value="form.amount"
          :precision="0"
          :show-button="false"
          :placeholder="$t('activity.luckyWheelAddLuckyValue.k6b63k8d1f')"
          style="width: 100%"
        />
      </n-form-item>
      <n-form-item :label="$t('activity.distributeReward.k540e')">
        <n-input
          v-model:value="form.backendRemark"
          type="textarea"
          :rows="3"
          :placeholder="$t('activity.luckyWheelAddLuckyValue.k9009')"
        />
      </n-form-item>
    </n-form>
    <template #footer>
      <div class="flex justify-end gap-3">
        <n-button @click="visible = false">{{ $t('activity.activityList.k53d6') }}</n-button>
        <n-button type="primary" :loading="saving" @click="handleSubmit">{{ $t('activity.formModal.k786e') }}</n-button>
      </div>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { $t } from '@vben/locales';

import { reactive, ref } from 'vue';
import {
  NModal,
  NForm,
  NFormItem,
  NInput,
  NInputNumber,
  NButton,
  useMessage,
} from 'naive-ui';
import { addLuckyWheelLuckyValueApi } from '#/api/core/lucky-wheel-admin';

const emit = defineEmits<{ saved: [] }>();
const visible = defineModel<boolean>('show', { default: false });
const message = useMessage();
const saving = ref(false);

const form = reactive({
  account: '',
  amount: null as number | null,
  backendRemark: '',
});

async function handleSubmit() {
  if (!form.account.trim()) {
    message.warning($t('activity.luckyWheelAddLuckyValue.k8bf7'));
    return;
  }
  if (form.amount === null || form.amount === 0) {
    message.warning($t('activity.luckyWheelAddLuckyValue.k8bf72'));
    return;
  }
  saving.value = true;
  try {
    await addLuckyWheelLuckyValueApi({
      account: form.account.trim(),
      amount: form.amount,
      backendRemark: form.backendRemark.trim() || undefined,
    });
    message.success($t('activity.luckyWheelAddLuckyValue.k64cd'));
    form.account = '';
    form.amount = null;
    form.backendRemark = '';
    emit('saved');
    visible.value = false;
  } catch {
    message.error($t('activity.luckyWheelAddLuckyValue.k64cdk8bf7APIk5df2'));
  } finally {
    saving.value = false;
  }
}
</script>
