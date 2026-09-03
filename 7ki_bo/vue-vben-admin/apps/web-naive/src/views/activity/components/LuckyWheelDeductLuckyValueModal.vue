<template>
  <n-modal
    v-model:show="visible"
    preset="card"
    :title="$t('activity.luckyWheelAddLuckyValue.deductTitle')"
    :style="{ width: '520px', maxWidth: '96vw' }"
    :mask-closable="false"
  >
    <n-form label-placement="left" :label-width="112" size="medium">
      <n-form-item :label="$t('activity.luckyWheelAddLuckyValue.deductMode')" required>
        <n-radio-group v-model:value="form.mode">
          <n-radio value="fixed">{{ $t('activity.luckyWheelAddLuckyValue.deductFixed') }}</n-radio>
          <n-radio value="all">{{ $t('activity.luckyWheelAddLuckyValue.deductAll') }}</n-radio>
        </n-radio-group>
      </n-form-item>
      <n-form-item
        v-if="form.mode === 'fixed'"
        :label="$t('activity.luckyWheelAddLuckyValue.k53d8')"
        required
      >
        <n-input-number
          v-model:value="form.amount"
          :min="1"
          :precision="0"
          :show-button="false"
          style="width: 100%"
        />
      </n-form-item>
      <n-form-item :label="$t('activity.luckyWheelAddLuckyValue.frontRemark')">
        <n-input
          v-model:value="form.frontRemark"
          type="textarea"
          :rows="2"
          :placeholder="$t('activity.luckyWheelAddLuckyValue.k9009')"
        />
      </n-form-item>
      <n-form-item :label="$t('activity.distributeReward.k540e')">
        <n-input
          v-model:value="form.backRemark"
          type="textarea"
          :rows="2"
          :placeholder="$t('activity.luckyWheelAddLuckyValue.k9009')"
        />
      </n-form-item>
    </n-form>
    <template #footer>
      <div class="flex justify-end gap-3">
        <n-button @click="visible = false">{{ $t('activity.activityList.k53d6') }}</n-button>
        <n-button type="primary" :loading="saving" @click="handleSubmit">{{
          $t('activity.luckyWheelAddLuckyValue.deductAction')
        }}</n-button>
      </div>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { $t } from '@vben/locales';

import { reactive, ref, watch } from 'vue';
import {
  NModal,
  NForm,
  NFormItem,
  NInput,
  NInputNumber,
  NButton,
  NRadio,
  NRadioGroup,
  useMessage,
} from 'naive-ui';
import { addLuckyWheelLuckyValueApi } from '#/api/core/lucky-wheel-admin';

const props = withDefaults(
  defineProps<{
    userIds?: number[];
    remainingByUserId?: Record<number, number>;
  }>(),
  { userIds: () => [], remainingByUserId: () => ({}) },
);

const emit = defineEmits<{ saved: [] }>();
const visible = defineModel<boolean>('show', { default: false });
const message = useMessage();
const saving = ref(false);

const form = reactive({
  mode: 'fixed' as 'fixed' | 'all',
  amount: null as number | null,
  frontRemark: '',
  backRemark: '',
});

watch(visible, (show) => {
  if (!show) return;
  form.mode = 'fixed';
  form.amount = null;
  form.frontRemark = '';
  form.backRemark = '';
});

async function handleSubmit() {
  const userIds = [...new Set((props.userIds || []).filter((id) => Number.isInteger(id) && id > 0))];
  if (userIds.length === 0) {
    message.warning($t('activity.luckyWheelAddLuckyValue.memberIds'));
    return;
  }
  saving.value = true;
  try {
    if (form.mode === 'all') {
      for (const userId of userIds) {
        const remaining = Math.max(0, Math.floor(Number(props.remainingByUserId[userId] || 0)));
        if (remaining <= 0) continue;
        await addLuckyWheelLuckyValueApi({
          userIds: [userId],
          deltaValue: remaining,
          frontRemark: form.frontRemark.trim() || undefined,
          backRemark: form.backRemark.trim() || undefined,
          sourceType: 'MANUAL_DEDUCT',
        });
      }
    } else {
      if (form.amount == null || form.amount <= 0) {
        message.warning($t('activity.luckyWheelAddLuckyValue.k8bf72'));
        saving.value = false;
        return;
      }
      await addLuckyWheelLuckyValueApi({
        userIds,
        deltaValue: form.amount,
        frontRemark: form.frontRemark.trim() || undefined,
        backRemark: form.backRemark.trim() || undefined,
        sourceType: 'MANUAL_DEDUCT',
      });
    }
    message.success($t('activity.luckyWheelAddLuckyValue.k64cd'));
    emit('saved');
    visible.value = false;
  } catch {
    message.error($t('activity.luckyWheelAddLuckyValue.k64cdk8bf7APIk5df2'));
  } finally {
    saving.value = false;
  }
}
</script>
