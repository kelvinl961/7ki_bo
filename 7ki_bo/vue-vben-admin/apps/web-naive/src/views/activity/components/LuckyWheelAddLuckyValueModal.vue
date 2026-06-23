<template>
  <n-modal
    v-model:show="visible"
    preset="card"
    title="新增幸运值"
    :style="{ width: '480px', maxWidth: '96vw' }"
    :mask-closable="false"
  >
    <n-form label-placement="left" :label-width="96" size="medium">
      <n-form-item label="会员账号" required>
        <n-input v-model:value="form.account" placeholder="请输入会员账号" clearable />
      </n-form-item>
      <n-form-item label="变动幸运值" required>
        <n-input-number
          v-model:value="form.amount"
          :precision="0"
          :show-button="false"
          placeholder="正数为增加，负数为扣除"
          style="width: 100%"
        />
      </n-form-item>
      <n-form-item label="后台备注">
        <n-input
          v-model:value="form.backendRemark"
          type="textarea"
          :rows="3"
          placeholder="选填"
        />
      </n-form-item>
    </n-form>
    <template #footer>
      <div class="flex justify-end gap-3">
        <n-button @click="visible = false">取消</n-button>
        <n-button type="primary" :loading="saving" @click="handleSubmit">确定</n-button>
      </div>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
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
    message.warning('请输入会员账号');
    return;
  }
  if (form.amount === null || form.amount === 0) {
    message.warning('请填写变动幸运值');
    return;
  }
  saving.value = true;
  try {
    await addLuckyWheelLuckyValueApi({
      account: form.account.trim(),
      amount: form.amount,
      backendRemark: form.backendRemark.trim() || undefined,
    });
    message.success('操作成功');
    form.account = '';
    form.amount = null;
    form.backendRemark = '';
    emit('saved');
    visible.value = false;
  } catch {
    message.error('操作失败，请确认 API 已接入');
  } finally {
    saving.value = false;
  }
}
</script>
