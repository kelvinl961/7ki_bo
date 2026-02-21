<template>
  <div class="single-member-report">
    <n-card title="单个会员报表" class="mb-4">
      <div class="mb-4">
        <n-form inline>
          <n-form-item label="会员账号">
            <n-input
              v-model:value="memberAccount"
              placeholder="请输入会员账号"
              style="width: 200px"
            />
          </n-form-item>
          <n-form-item label="开始日期">
            <n-date-picker
              v-model:value="startDate"
              type="date"
              placeholder="选择开始日期"
              format="yyyy-MM-dd"
              clearable
            />
          </n-form-item>
          <n-form-item label="结束日期">
            <n-date-picker
              v-model:value="endDate"
              type="date"
              placeholder="选择结束日期"
              format="yyyy-MM-dd"
              clearable
            />
          </n-form-item>
          <n-form-item>
            <n-button type="primary" @click="fetchData" :loading="loading">
              查询
            </n-button>
          </n-form-item>
        </n-form>
      </div>

      <div v-if="reportData" class="py-8 text-center">
        <n-alert type="info" title="单个会员报表功能开发中" />
        <p class="mt-4">此功能正在开发中，敬请期待...</p>
      </div>

      <div v-else-if="loading" class="py-8 text-center">
        <n-spin size="large" />
        <p class="mt-4">正在加载数据...</p>
      </div>

      <div v-else-if="error" class="py-8 text-center">
        <n-alert type="error" :title="error" />
      </div>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {
  NCard,
  NForm,
  NFormItem,
  NInput,
  NDatePicker,
  NButton,
  NSpin,
  NAlert,
} from 'naive-ui';
import { useMessage } from 'naive-ui';

const message = useMessage();

const loading = ref(false);
const error = ref('');
const reportData = ref(null);

const memberAccount = ref('');
// ✅ Fix: Use timestamp (number) for date picker v-model
const startDate = ref<number | null>(null);
const endDate = ref<number | null>(null);

const fetchData = async () => {
  if (!memberAccount.value) {
    message.warning('请输入会员账号');
    return;
  }
  if (!startDate.value || !endDate.value) {
    message.warning('请选择开始日期和结束日期');
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    // Format dates for API call
    const startDateStr = new Date(startDate.value).toISOString().split('T')[0];
    const endDateStr = new Date(endDate.value).toISOString().split('T')[0];

    // TODO: Implement single member report API
    reportData.value = { placeholder: true };
    message.success('数据加载成功');
  } catch (err) {
    error.value = err instanceof Error ? err.message : '获取数据时发生错误';
    message.error(error.value);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  // ✅ Fix: Use timestamps instead of strings
  startDate.value = lastWeek.getTime();
  endDate.value = today.getTime();
});
</script>

<style scoped>
.single-member-report {
  padding: 16px;
}
</style>
