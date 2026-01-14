<template>
  <n-modal
    v-model:show="showModal"
    preset="dialog"
    title="CDN切换"
    :style="{ width: '500px' }"
  >
    <n-space vertical>
      <n-alert type="info" :show-icon="true">
        <div v-if="domain">
          <p>域名: {{ domain.domain }}</p>
          <p>当前CDN: {{ domain.cdnProvider }}</p>
        </div>
      </n-alert>
      
      <n-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-placement="left"
        label-width="auto"
      >
        <n-form-item label="新CDN提供商" path="newCdnProvider">
          <n-select
            v-model:value="formData.newCdnProvider"
            :options="cdnProviderOptions"
            placeholder="请选择新的CDN提供商"
          />
        </n-form-item>
        
        <n-form-item label="切换原因" path="reason">
          <n-input
            v-model:value="formData.reason"
            type="textarea"
            placeholder="请输入切换原因"
            :autosize="{ minRows: 3, maxRows: 5 }"
          />
        </n-form-item>
      </n-form>
    </n-space>
    
    <template #action>
      <n-space>
        <n-button @click="showModal = false">取消</n-button>
        <n-button type="primary" @click="handleSubmit" :loading="submitting">
          确定切换
        </n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
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
  set: (val) => emit('update:show', val)
});

const formRef = ref();
const submitting = ref(false);

const formData = ref({
  newCdnProvider: null,
  reason: ''
});

const cdnProviderOptions = [
  { label: 'Cloudflare', value: 'cloudflare' },
  { label: 'AWS CloudFront', value: 'aws' },
  { label: '阿里云', value: 'aliyun' },
  { label: '腾讯云', value: 'tencent' }
];

const rules = {
  newCdnProvider: {
    required: true,
    message: '请选择新的CDN提供商',
    trigger: 'change'
  },
  reason: {
    required: true,
    message: '请输入切换原因',
    trigger: 'blur'
  }
};

const handleSubmit = async () => {
  try {
    await formRef.value?.validate();
    submitting.value = true;
    
    // TODO: Implement API call
    message.success('CDN切换成功');
    emit('success');
    showModal.value = false;
    
    // Reset form
    formData.value = {
      newCdnProvider: null,
      reason: ''
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

