<template>
  <n-modal
    v-model:show="visible"
    preset="card"
    title="手动扣除"
    :style="{ width: '600px' }"
  >
    <div class="space-y-4">
      <!-- Agent Info Header -->
      <div class="grid grid-cols-3 gap-4 rounded bg-gray-50 p-4">
        <div>
          <span class="text-sm text-gray-600">代理ID:</span>
          <span class="ml-2 font-medium text-gray-600">{{ agentInfo.id }}</span>
        </div>
        <div>
          <span class="text-sm text-gray-600">代理账号:</span>
          <span class="ml-2 font-medium text-gray-600">{{
            agentInfo.username
          }}</span>
        </div>
        <div class="flex items-center justify-between">
          <div>
            <span class="text-sm text-gray-600">代理币种:</span>
            <span class="ml-2 font-medium text-gray-600">{{
              agentInfo.currency
            }}</span>
          </div>
          <n-button size="small" @click="refreshBalance" :loading="loading">
            刷新余额
          </n-button>
        </div>
      </div>

      <!-- Form Fields -->
      <n-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-placement="left"
        label-width="120px"
      >
        <div class="grid grid-cols-2 gap-4">
          <n-form-item label="代理ID">
            <n-input v-model:value="formData.agentId" readonly />
          </n-form-item>

          <n-form-item label="代理名称">
            <n-input v-model:value="formData.agentName" readonly />
          </n-form-item>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <n-form-item label="可用余额">
            <n-input-group>
              <n-input v-model:value="formData.availableBalance" readonly />
              <n-input-group-label>{{
                agentInfo.currency
              }}</n-input-group-label>
            </n-input-group>
          </n-form-item>

          <n-form-item label="冻结余额">
            <n-input-group>
              <n-input v-model:value="formData.frozenBalance" readonly />
              <n-input-group-label>{{
                agentInfo.currency
              }}</n-input-group-label>
            </n-input-group>
          </n-form-item>
        </div>

        <n-form-item label="总余额">
          <n-input-group>
            <n-input v-model:value="formData.totalBalance" readonly />
            <n-input-group-label>{{ agentInfo.currency }}</n-input-group-label>
          </n-input-group>
        </n-form-item>

        <n-form-item label="扣除类型" path="type">
          <n-radio-group v-model:value="formData.type">
            <n-space>
              <n-radio value="manual_debit">手动扣除</n-radio>
              <n-radio value="penalty">违规处罚</n-radio>
              <n-radio value="adjustment">余额调整</n-radio>
            </n-space>
          </n-radio-group>
        </n-form-item>

        <n-form-item label="扣除金额" path="amount">
          <n-input-group>
            <n-input-group-label>{{ agentInfo.currency }}</n-input-group-label>
            <n-input
              v-model:value="formData.amount"
              placeholder="请输入扣除金额"
              type="number"
            />
          </n-input-group>
        </n-form-item>

        <n-form-item label="扣除原因" path="reason">
          <n-input
            v-model:value="formData.reason"
            type="textarea"
            placeholder="请输入扣除原因"
            :maxlength="500"
            show-count
          />
        </n-form-item>

        <n-form-item label="前台备注">
          <n-input
            v-model:value="formData.frontendNotes"
            type="textarea"
            placeholder="请输入显示在客户端的备注"
            :maxlength="500"
            show-count
          />
        </n-form-item>

        <n-form-item label="后台备注">
          <n-input
            v-model:value="formData.backendNotes"
            type="textarea"
            placeholder="请输入后台备注信息"
            :maxlength="500"
            show-count
          />
        </n-form-item>
      </n-form>
    </div>

    <template #action>
      <div class="flex gap-2">
        <n-button @click="visible = false">取消</n-button>
        <n-button type="error" @click="handleSubmit" :loading="submitting">
          确认扣除
        </n-button>
      </div>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue';
import { useMessage, NTag } from 'naive-ui';
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

const rules: FormRules = {
  type: {
    required: true,
    message: '请选择扣除类型',
    trigger: 'change',
  },
  amount: {
    required: true,
    message: '请输入扣除金额',
    trigger: 'blur',
    validator: (rule, value) => {
      if (!value) return new Error('请输入扣除金额');
      if (isNaN(Number(value)) || Number(value) <= 0) {
        return new Error('请输入有效的金额');
      }
      if (Number(value) > formData.availableBalance) {
        return new Error('扣除金额不能超过可用余额');
      }
      return true;
    },
  },
  reason: {
    required: true,
    message: '请输入扣除原因',
    trigger: 'blur',
  },
};

// Watch for agent info changes
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
    // TODO: Implement API call to refresh agent balance
    await new Promise((resolve) => setTimeout(resolve, 1000));
    message.success('余额刷新成功');
  } catch (error) {
    message.error('余额刷新失败');
  } finally {
    loading.value = false;
  }
};

const handleSubmit = async () => {
  try {
    await formRef.value?.validate();
    submitting.value = true;

    // TODO: Implement API call to submit manual debit
    await new Promise((resolve) => setTimeout(resolve, 1000));

    message.success('手动扣除操作成功');
    emit('success');
    emit('update:visible', false);
  } catch (error) {
    console.error('Submit error:', error);
  } finally {
    submitting.value = false;
  }
};

// Computed
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
