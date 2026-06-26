<template>
  <n-modal
    v-model:show="showModal"
    preset="dialog"
    :title="$t('common.batchOperation')"
    :style="{ width: '500px' }"
  >
    <n-space vertical>
      <n-alert type="info" :show-icon="true">
        {{ $t('operations.domain.selectedCount', [selectedIds.length]) }}
      </n-alert>

      <n-form
        ref="formRef"
        :model="formData"
        label-placement="left"
        label-width="auto"
      >
        <n-form-item :label="$t('operations.domain.batchOps.operationType')" path="operationType">
          <n-select
            v-model:value="formData.operationType"
            :options="operationOptions"
            :placeholder="$t('operations.domain.batchOps.selectOperation')"
          />
        </n-form-item>

        <n-form-item
          v-if="formData.operationType === 'status'"
          :label="$t('common.status')"
          path="status"
        >
          <n-select
            v-model:value="formData.status"
            :options="statusOptions"
            :placeholder="$t('common.pleaseSelect') + ' ' + $t('common.status')"
          />
        </n-form-item>

        <n-form-item
          v-if="formData.operationType === 'cdn'"
          :label="$t('operations.domain.column.cdnProvider')"
          path="cdnProvider"
        >
          <n-select
            v-model:value="formData.cdnProvider"
            :options="cdnProviderOptions"
            :placeholder="$t('operations.domain.batchOps.selectCdn')"
          />
        </n-form-item>
      </n-form>
    </n-space>

    <template #action>
      <n-space>
        <n-button @click="showModal = false">{{ $t('common.cancel') }}</n-button>
        <n-button type="primary" @click="handleSubmit" :loading="submitting">
          {{ $t('operations.layout.confirm') }}
        </n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { $t } from '@vben/locales';

import { ref, computed } from 'vue';
import { useMessage } from 'naive-ui';

const props = defineProps<{
  show: boolean;
  selectedIds: number[];
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
  operationType: null,
  status: null,
  cdnProvider: null,
});

const operationOptions = [
  { label: $t('operations.domain.batchOps.modifyStatus'), value: 'status' },
  { label: $t('operations.domain.action.switchCdn'), value: 'cdn' },
  { label: $t('common.delete'), value: 'delete' },
];

const statusOptions = [
  { label: $t('common.enable'), value: 'active' },
  { label: $t('common.disable'), value: 'inactive' },
];

const cdnProviderOptions = [
  { label: 'Cloudflare', value: 'cloudflare' },
  { label: 'AWS CloudFront', value: 'aws' },
  { label: 'Aliyun', value: 'aliyun' },
  { label: 'Tencent Cloud', value: 'tencent' },
];

const handleSubmit = async () => {
  try {
    submitting.value = true;

    // TODO: Implement API call
    message.success($t('operations.domain.message.bulkActionSuccess', [$t('common.batchOperation')]));
    emit('success');
    showModal.value = false;
  } catch (error) {
    message.error($t('operations.domain.message.bulkActionFailed', [$t('common.batchOperation')]));
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped lang="scss">
// Add any custom styles here
</style>
