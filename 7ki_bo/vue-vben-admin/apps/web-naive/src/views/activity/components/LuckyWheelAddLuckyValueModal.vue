<template>
  <n-modal
    v-model:show="visible"
    preset="card"
    :title="$t('activity.luckyWheelAddLuckyValue.k65b0')"
    :style="{ width: '560px', maxWidth: '96vw' }"
    :mask-closable="false"
  >
    <n-form label-placement="left" :label-width="112" size="medium">
      <n-form-item :label="$t('activity.luckyWheelAddLuckyValue.batchMode')" required>
        <n-radio-group v-model:value="form.batchMode" :disabled="lockedToUser">
          <n-radio value="single">{{ $t('activity.luckyWheelAddLuckyValue.single') }}</n-radio>
          <n-radio value="batch">{{ $t('activity.luckyWheelAddLuckyValue.batch') }}</n-radio>
        </n-radio-group>
      </n-form-item>
      <n-form-item :label="$t('activity.luckyWheelAddLuckyValue.idType')" required>
        <n-radio-group v-model:value="form.idType" :disabled="lockedToUser">
          <n-radio value="account">{{ $t('activity.luckyWheelUi.memberAccount') }}</n-radio>
          <n-radio value="memberId">{{ $t('activity.luckyWheelUi.memberId') }}</n-radio>
        </n-radio-group>
      </n-form-item>
      <n-form-item
        :label="
          form.idType === 'memberId'
            ? $t('activity.luckyWheelAddLuckyValue.memberIds')
            : $t('activity.luckyWheelAddLuckyValue.accounts')
        "
        required
      >
        <n-input
          v-model:value="form.identifiers"
          type="textarea"
          :rows="form.batchMode === 'batch' ? 4 : 2"
          :disabled="lockedToUser"
          :placeholder="
            form.idType === 'memberId'
              ? $t('activity.luckyWheelAddLuckyValue.memberIds')
              : $t('activity.luckyWheelAddLuckyValue.accounts')
          "
        />
      </n-form-item>
      <n-form-item :label="$t('activity.luckyWheelAddLuckyValue.k53d8')" required>
        <n-input-number
          v-model:value="form.amount"
          :min="1"
          :precision="0"
          :show-button="false"
          style="width: 100%"
        />
      </n-form-item>
      <n-form-item :label="$t('activity.luckyWheelAddLuckyValue.effectiveDays')" required>
        <n-space align="center" :size="8">
          <n-input-number
            v-model:value="form.effectiveDays"
            :min="0"
            :max="31"
            :precision="0"
            :show-button="false"
            style="width: 120px"
          />
          <span class="text-xs text-gray-500">{{
            $t('activity.luckyWheelAddLuckyValue.effectiveDaysHint')
          }}</span>
        </n-space>
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
          $t('activity.formModal.k786e')
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
  NSpace,
  useMessage,
} from 'naive-ui';
import { addLuckyWheelLuckyValueApi } from '#/api/core/lucky-wheel-admin';

const props = withDefaults(
  defineProps<{
    initialAccount?: string;
    initialMemberId?: number | string | null;
  }>(),
  { initialAccount: '', initialMemberId: null },
);

const emit = defineEmits<{ saved: [] }>();
const visible = defineModel<boolean>('show', { default: false });
const message = useMessage();
const saving = ref(false);
const lockedToUser = ref(false);

const form = reactive({
  batchMode: 'single' as 'single' | 'batch',
  idType: 'account' as 'account' | 'memberId',
  identifiers: '',
  amount: null as number | null,
  effectiveDays: 0,
  frontRemark: '',
  backRemark: '',
});

function splitIdentifiers(raw: string) {
  return raw
    .split(/[,，\s]+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 200);
}

watch(visible, (show) => {
  if (!show) return;
  const memberId = props.initialMemberId != null ? String(props.initialMemberId) : '';
  const account = props.initialAccount?.trim() || '';
  lockedToUser.value = Boolean(memberId || account);
  form.batchMode = 'single';
  form.amount = null;
  form.effectiveDays = 0;
  form.frontRemark = '';
  form.backRemark = '';
  if (memberId) {
    form.idType = 'memberId';
    form.identifiers = memberId;
  } else if (account) {
    form.idType = 'account';
    form.identifiers = account;
  } else {
    form.idType = 'account';
    form.identifiers = '';
  }
});

async function handleSubmit() {
  const identifiers = splitIdentifiers(form.identifiers);
  if (identifiers.length === 0) {
    message.warning($t('activity.luckyWheelAddLuckyValue.k8bf7'));
    return;
  }
  if (form.batchMode === 'single' && identifiers.length > 1) {
    message.warning($t('activity.luckyWheelAddLuckyValue.k8bf7'));
    return;
  }
  if (form.amount == null || form.amount <= 0) {
    message.warning($t('activity.luckyWheelAddLuckyValue.k8bf72'));
    return;
  }
  const payload =
    form.idType === 'memberId'
      ? {
          userIds: identifiers
            .map((id) => Number(id))
            .filter((id) => Number.isInteger(id) && id > 0),
        }
      : { accounts: identifiers };
  if (form.idType === 'memberId' && (!payload.userIds || payload.userIds.length === 0)) {
    message.warning($t('activity.luckyWheelAddLuckyValue.memberIds'));
    return;
  }
  saving.value = true;
  try {
    await addLuckyWheelLuckyValueApi({
      ...payload,
      deltaValue: form.amount,
      effectiveDays: form.effectiveDays,
      frontRemark: form.frontRemark.trim() || undefined,
      backRemark: form.backRemark.trim() || undefined,
      sourceType: 'MANUAL_ADD',
    });
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
