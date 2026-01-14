<template>
  <div class="member-total-report">
    <n-card title="会员总报表" class="mb-4">
      <div class="mb-4">
        <n-form inline>
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

      <div v-if="reportData" class="text-center py-8">
        <n-alert type="info" title="会员总报表功能开发中" />
        <p class="mt-4">此功能正在开发中，敬请期待...</p>
      </div>

      <div v-else-if="loading" class="text-center py-8">
        <n-spin size="large" />
        <p class="mt-4">正在加载数据...</p>
      </div>

      <div v-else-if="error" class="text-center py-8">
        <n-alert type="error" :title="error" />
      </div>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { NCard, NForm, NFormItem, NDatePicker, NButton, NSpin, NAlert } from 'naive-ui';
import { useMessage } from 'naive-ui';

const message = useMessage();

const loading = ref(false);
const error = ref('');
const reportData = ref(null);

// ✅ Fix: Use timestamp (number) for date picker v-model
const startDate = ref<number | null>(null);
const endDate = ref<number | null>(null);

const fetchData = async () => {
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
    
    // TODO: Implement member total report API
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
.member-total-report {
  padding: 16px;
}
</style>
