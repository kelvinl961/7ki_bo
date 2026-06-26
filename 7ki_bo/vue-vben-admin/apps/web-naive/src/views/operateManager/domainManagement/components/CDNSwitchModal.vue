<template>
  <n-modal
    v-model:show="showModal"
    preset="dialog"
    :title="$t('operations.domain.cdnSwitch.title')"
    :style="{ width: '500px' }"
  >
    <n-space vertical>
      <n-alert type="info" :show-icon="true">
        <div v-if="domain">
          <p>{{ $t('operations.domain.column.domain') }}: {{ domain.domain }}</p>
          <p>{{ $t('operations.domain.modal.currentCdn') }}: {{ domain.cdnProvider }}</p>
        </div>
      </n-alert>

      <n-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-placement="left"
        label-width="auto"
      >
        <n-form-item :label="$t('operations.domain.cdnSwitch.newProvider')" path="newCdnProvider">
          <n-select
            v-model:value="formData.newCdnProvider"
            :options="cdnProviderOptions"
            :placeholder="$t('operations.domain.cdnSwitch.selectNewProvider')"
          />
        </n-form-item>

        <n-form-item :label="$t('operations.domain.cdnSwitch.reason')" path="reason">
          <n-input
            v-model:value="formData.reason"
            type="textarea"
            :placeholder="$t('operations.domain.cdnSwitch.reasonPlaceholder')"
            :autosize="{ minRows: 3, maxRows: 5 }"
          />
        </n-form-item>
      </n-form>
    </n-space>

    <template #action>
      <n-space>
        <n-button @click="showModal = false">{{ $t('common.cancel') }}</n-button>
        <n-button type="primary" @click="handleSubmit" :loading="submitting">
          {{ $t('operations.domain.cdnSwitch.confirmSwitch') }}
        </n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { $t } from '@vben/locales';

import { ref, computed } from 'vue';
import { useMessage } from 'naive-ui';

interface Domain {
  id: number;
  domain: string;
  cdnProvider: string;
}

const props = defineProps<{
  show: boolean;
  domain: Domain | null;
}>();

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void;
  (e: 'success'): void;
}>();

const message = useMessage();
const showModal = computed({
  get: () => props.show,
  set: (val) => emit('update:show', val),
});

const formRef = ref();
const submitting = ref(false);

const formData = ref({
  newCdnProvider: null,
  reason: '',
});

const cdnProviderOptions = [
  { label: 'Cloudflare', value: 'cloudflare' },
  { label: 'AWS CloudFront', value: 'aws' },
  { label: 'Aliyun', value: 'aliyun' },
  { label: 'Tencent Cloud', value: 'tencent' },
];

const rules = {
  newCdnProvider: {
    required: true,
    message: $t('operations.domain.cdnSwitch.selectNewProvider'),
    trigger: 'change',
  },
  reason: {
    required: true,
    message: $t('common.pleaseEnterField', [$t('operations.domain.cdnSwitch.reason')]),
    trigger: 'blur',
  },
};

const handleSubmit = async () => {
  try {
    await formRef.value?.validate();
    submitting.value = true;

    // TODO: Implement API call
    message.success($t('operations.domain.message.cdnSwitchSuccess'));
    emit('success');
    showModal.value = false;

    // Reset form
    formData.value = {
      newCdnProvider: null,
      reason: '',
    };
  } catch (error) {
    console.error('Form validation failed:', error);
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped lang="scss">
// Add any custom styles here
</style>
