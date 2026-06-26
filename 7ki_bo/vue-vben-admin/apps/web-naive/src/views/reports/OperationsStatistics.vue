<template>
  <Page title="" description="">
    <div class="operations-statistics">
      <n-tabs
        v-model:value="activeTab"
        type="line"
        class="tab-outside mb-6"
        pane-class="p-0"
      >
        <n-tab-pane name="daily-report" :tab="$t('reports.dailyOperationsReport')" :lazy="true">
          <template #tab>
            <span class="flex items-center gap-2">
              <n-icon size="18"><CalendarOutline /></n-icon>
              {{ $t('reports.dailyOperationsReport') }}
            </span>
          </template>
          <div class="tab-content">
            <DailyOperationsReport />
          </div>
        </n-tab-pane>

        <n-tab-pane name="member-total-report" :tab="$t('reports.memberTotalReport')" :lazy="true">
          <template #tab>
            <span class="flex items-center gap-2">
              <n-icon size="18"><PersonOutline /></n-icon>
              {{ $t('reports.memberTotalReport') }}
            </span>
          </template>
          <div class="tab-content">
            <MemberTotalReport />
          </div>
        </n-tab-pane>

        <n-tab-pane name="single-member-report" :tab="$t('reports.singleMemberReport')" :lazy="true">
          <template #tab>
            <span class="flex items-center gap-2">
              <n-icon size="18"><PersonAddOutline /></n-icon>
              {{ $t('reports.singleMemberReport') }}
            </span>
          </template>
          <div class="tab-content">
            <SingleMemberReport />
          </div>
        </n-tab-pane>

        <n-tab-pane name="activity-charts" :tab="$t('reports.activityCharts')" :lazy="true">
          <template #tab>
            <span class="flex items-center gap-2">
              <n-icon size="18"><BarChartOutline /></n-icon>
              {{ $t('reports.activityCharts') }}
            </span>
          </template>
          <div class="tab-content">
            <ActivityCharts />
          </div>
        </n-tab-pane>
      </n-tabs>
    </div>
  </Page>
</template>

<script setup lang="ts">
import { ref, defineAsyncComponent } from 'vue';
import { NTabs, NTabPane, NIcon } from 'naive-ui';
import {
  CalendarOutline,
  PersonOutline,
  PersonAddOutline,
  BarChartOutline,
} from '@vicons/ionicons5';
import { Page } from '@vben/common-ui';

const DailyOperationsReport = defineAsyncComponent(
  () => import('./DailyOperationsReport.vue'),
);
const MemberTotalReport = defineAsyncComponent(
  () => import('./MemberTotalReport.vue'),
);
const SingleMemberReport = defineAsyncComponent(
  () => import('./SingleMemberReport.vue'),
);
const ActivityCharts = defineAsyncComponent(
  () => import('./ActivityCharts.vue'),
);

const activeTab = ref('daily-report');
</script>

<style scoped>
.operations-statistics {
  padding: 16px;
}

.tab-outside {
  border-bottom: 1px solid #e8e8e8;
}

.tab-content {
  padding: 0;
}

.flex {
  display: flex;
}
.items-center {
  align-items: center;
}
.gap-2 {
  gap: 0.5rem;
}
</style>
