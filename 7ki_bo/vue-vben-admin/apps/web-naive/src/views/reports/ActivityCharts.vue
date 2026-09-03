<template>
  <div class="activity-charts">
    <n-card :title="$t('reports.activityCharts')" class="mb-4">
      <div class="mb-4">
        <n-form inline>
          <n-form-item :label="$t('reports.startDate')">
            <n-date-picker
              v-model:value="startDate"
              :time-zone="timezone"
              type="date"
              :placeholder="$t('reports.selectStartDate')"
              format="yyyy-MM-dd"
              clearable
            />
          </n-form-item>
          <n-form-item :label="$t('reports.endDate')">
            <n-date-picker
              v-model:value="endDate"
              :time-zone="timezone"
              type="date"
              :placeholder="$t('reports.selectEndDate')"
              format="yyyy-MM-dd"
              clearable
            />
          </n-form-item>
          <n-form-item :label="$t('reports.chartType')">
            <n-select
              v-model:value="chartType"
              :options="chartTypeOptions"
              :placeholder="$t('reports.selectChartType')"
              style="width: 150px"
            />
          </n-form-item>
          <n-form-item>
            <n-button type="primary" @click="fetchData" :loading="loading">
              {{ $t('common.query') }}
            </n-button>
          </n-form-item>
        </n-form>
      </div>

      <div v-if="reportData" class="py-8 text-center">
        <n-alert type="info" :title="$t('reports.activityChartsDev')" />
        <p class="mt-4">{{ $t('reports.featureComingSoon') }}</p>
      </div>

      <div v-else-if="loading" class="py-8 text-center">
        <n-spin size="large" />
        <p class="mt-4">{{ $t('reports.loadingData') }}</p>
      </div>

      <div v-else-if="error" class="py-8 text-center">
        <n-alert type="error" :title="error" />
      </div>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { $t } from '@vben/locales';

import { ref, onMounted, computed } from 'vue';
import {
  NCard,
  NForm,
  NFormItem,
  NDatePicker,
  NSelect,
  NButton,
  NSpin,
  NAlert,
} from 'naive-ui';
import { useMessage } from 'naive-ui';
import { useDisplayTimezone } from '#/composables/useDisplayTimezone';

const { timezone } = useDisplayTimezone();
const message = useMessage();

const loading = ref(false);
const error = ref('');
const reportData = ref(null);

const startDate = ref<number | null>(null);
const endDate = ref<number | null>(null);
const chartType = ref('daily');

const chartTypeOptions = computed(() => [
  { label: $t('reports.chartTypeDaily'), value: 'daily' },
  { label: $t('reports.chartTypeWeekly'), value: 'weekly' },
]);

const fetchData = async () => {
  if (!startDate.value || !endDate.value) {
    message.warning($t('reports.selectStartAndEndDate'));
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    reportData.value = { placeholder: true };
    message.success($t('reports.dataLoadedSuccess'));
  } catch (err) {
    error.value =
      err instanceof Error ? err.message : $t('reports.fetchDataError');
    message.error(error.value);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  startDate.value = lastWeek.getTime();
  endDate.value = today.getTime();
});
</script>

<style scoped>
.activity-charts {
  padding: 16px;
}
</style>
