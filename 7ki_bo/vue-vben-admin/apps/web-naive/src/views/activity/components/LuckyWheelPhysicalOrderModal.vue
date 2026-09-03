<template>
  <n-modal
    v-model:show="visible"
    preset="card"
    :title="$t('activity.luckyWheel.k5b9e')"
    :style="{ width: '720px', maxWidth: '96vw' }"
    :mask-closable="false"
  >
    <n-form label-placement="left" :label-width="140" size="medium">
      <n-form-item :label="$t('activity.luckyWheel.k8ba22')">
        <n-select v-model:value="form.status" :options="statusOptions" />
      </n-form-item>
      <n-form-item :label="$t('activity.luckyWheel.k6536')">
        <n-input v-model:value="form.recipientName" clearable />
      </n-form-item>
      <n-form-item :label="$t('activity.luckyWheel.k8054')">
        <n-input v-model:value="form.phone" clearable />
      </n-form-item>
      <n-form-item :label="$t('activity.luckyWheel.k65362')">
        <n-input v-model:value="form.addressLine1" clearable />
      </n-form-item>
      <n-form-item label="Address Line 2">
        <n-input v-model:value="form.addressLine2" clearable />
      </n-form-item>
      <n-form-item label="City">
        <n-input v-model:value="form.city" clearable />
      </n-form-item>
      <n-form-item label="State">
        <n-input v-model:value="form.state" clearable />
      </n-form-item>
      <n-form-item label="Postal Code">
        <n-input v-model:value="form.postalCode" clearable />
      </n-form-item>
      <n-form-item label="Country">
        <n-input v-model:value="form.country" clearable />
      </n-form-item>
      <n-form-item :label="$t('activity.luckyWheel.k5feb2')">
        <n-input v-model:value="form.courierCompany" clearable />
      </n-form-item>
      <n-form-item :label="$t('activity.luckyWheel.k5feb')">
        <n-input v-model:value="form.trackingNumber" clearable />
      </n-form-item>
      <n-form-item label="Cancel Reason" v-if="form.status === 'CANCELLED'">
        <n-input v-model:value="form.cancelReason" type="textarea" :rows="2" />
      </n-form-item>
      <n-form-item :label="$t('activity.distributeReward.k540e')">
        <n-input v-model:value="form.remark" type="textarea" :rows="3" />
      </n-form-item>
    </n-form>
    <template #footer>
      <div class="flex justify-end gap-3">
        <n-button @click="visible = false">{{ $t('activity.activityList.k53d6') }}</n-button>
        <n-button type="primary" :loading="saving" @click="handleSubmit">
          {{ $t('activity.formModal.k786e') }}
        </n-button>
      </div>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { $t } from '@vben/locales';

import { reactive, ref, watch } from 'vue';
import { NModal, NForm, NFormItem, NInput, NButton, NSelect, useMessage } from 'naive-ui';
import { putLuckyWheelPhysicalOrderApi } from '#/api/core/lucky-wheel-admin';

const props = defineProps<{
  order: Record<string, any> | null;
}>();

const emit = defineEmits<{ saved: [] }>();
const visible = defineModel<boolean>('show', { default: false });
const message = useMessage();
const saving = ref(false);

const statusOptions = [
  { label: 'PENDING', value: 'PENDING' },
  { label: 'SHIPPED', value: 'SHIPPED' },
  { label: 'RECEIVED', value: 'RECEIVED' },
  { label: 'CANCELLED', value: 'CANCELLED' },
];

const form = reactive({
  id: '',
  status: 'PENDING',
  recipientName: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
  country: '',
  courierCompany: '',
  trackingNumber: '',
  cancelReason: '',
  remark: '',
});

function applyOrder(order: Record<string, any> | null) {
  form.id = String(order?.id ?? '');
  form.status = String(order?.status ?? 'PENDING');
  form.recipientName = String(order?.receiverName ?? '');
  form.phone = String(order?.receiverPhone ?? '');
  form.addressLine1 = String(order?.addressLine1 ?? order?.receiverAddress ?? '');
  form.addressLine2 = String(order?.addressLine2 ?? '');
  form.city = String(order?.city ?? '');
  form.state = String(order?.state ?? '');
  form.postalCode = String(order?.postalCode ?? '');
  form.country = String(order?.country ?? '');
  form.courierCompany = String(order?.courierCompany ?? '');
  form.trackingNumber = String(order?.trackingNo ?? '');
  form.cancelReason = String(order?.cancelReason ?? '');
  form.remark = String(order?.backendRemark ?? '');
}

watch(
  () => [visible.value, props.order],
  ([show]) => {
    if (show) applyOrder(props.order);
  },
  { immediate: true },
);

async function handleSubmit() {
  if (!form.id) return;
  saving.value = true;
  try {
    await putLuckyWheelPhysicalOrderApi(form.id, {
      status: form.status,
      recipientName: form.recipientName || null,
      phone: form.phone || null,
      addressLine1: form.addressLine1 || null,
      addressLine2: form.addressLine2 || null,
      city: form.city || null,
      state: form.state || null,
      postalCode: form.postalCode || null,
      country: form.country || null,
      courierCompany: form.courierCompany || null,
      trackingNumber: form.trackingNumber || null,
      cancelReason: form.cancelReason || null,
      remark: form.remark || null,
    });
    message.success($t('activity.luckyWheelEdit.k4fdd2'));
    emit('saved');
    visible.value = false;
  } catch (error) {
    console.error(error);
    message.error($t('activity.luckyWheelEdit.k4fdd3'));
  } finally {
    saving.value = false;
  }
}
</script>
