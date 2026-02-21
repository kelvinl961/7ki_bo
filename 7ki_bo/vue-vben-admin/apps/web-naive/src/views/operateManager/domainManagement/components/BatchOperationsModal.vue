<template>
  <n-modal
    v-model:show="showModal"
    preset="dialog"
    title="批量操作"
    :style="{ width: '500px' }"
  >
    <n-space vertical>
      <n-alert type="info" :show-icon="true">
        已选择 {{ selectedIds.length }} 个域名
      </n-alert>

      <n-form
        ref="formRef"
        :model="formData"
        label-placement="left"
        label-width="auto"
      >
        <n-form-item label="操作类型" path="operationType">
          <n-select
            v-model:value="formData.operationType"
            :options="operationOptions"
            placeholder="请选择操作类型"
          />
        </n-form-item>

        <n-form-item
          v-if="formData.operationType === 'status'"
          label="状态"
          path="status"
        >
          <n-select
            v-model:value="formData.status"
            :options="statusOptions"
            placeholder="请选择状态"
          />
        </n-form-item>

        <n-form-item
          v-if="formData.operationType === 'cdn'"
          label="CDN提供商"
          path="cdnProvider"
        >
          <n-select
            v-model:value="formData.cdnProvider"
            :options="cdnProviderOptions"
            placeholder="请选择CDN提供商"
          />
        </n-form-item>
      </n-form>
    </n-space>

    <template #action>
      <n-space>
        <n-button @click="showModal = false">取消</n-button>
        <n-button type="primary" @click="handleSubmit" :loading="submitting">
          确定
        </n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
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
  { label: '修改状态', value: 'status' },
  { label: '切换CDN', value: 'cdn' },
  { label: '删除', value: 'delete' },
];

const statusOptions = [
  { label: '启用', value: 'active' },
  { label: '禁用', value: 'inactive' },
];

const cdnProviderOptions = [
  { label: 'Cloudflare', value: 'cloudflare' },
  { label: 'AWS CloudFront', value: 'aws' },
  { label: '阿里云', value: 'aliyun' },
  { label: '腾讯云', value: 'tencent' },
];

const handleSubmit = async () => {
  try {
    submitting.value = true;

    // TODO: Implement API call
    message.success('批量操作成功');
    emit('success');
    showModal.value = false;
  } catch (error) {
    message.error('批量操作失败');
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped lang="scss">
// Add any custom styles here
</style>
