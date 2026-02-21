<template>
  <Page title="" description="">
    <div class="operations-statistics">
      <!-- Tab Navigation - Now OUTSIDE the card -->
      <n-tabs
        v-model:value="activeTab"
        type="line"
        class="mb-6 tab-outside"
        pane-class="p-0"
      >
        <n-tab-pane name="daily-report" tab="日运营报表" :lazy="true">
          <template #tab>
            <span class="flex items-center gap-2">
              <n-icon size="18"><CalendarOutline /></n-icon>
              日运营报表
            </span>
          </template>
          <div class="tab-content">
            <DailyOperationsReport />
          </div>
        </n-tab-pane>

        <n-tab-pane name="member-total-report" tab="会员总报表" :lazy="true">
          <template #tab>
            <span class="flex items-center gap-2">
              <n-icon size="18"><PersonOutline /></n-icon>
              会员总报表
            </span>
          </template>
          <div class="tab-content">
            <MemberTotalReport />
          </div>
        </n-tab-pane>

        <n-tab-pane name="single-member-report" tab="单个会员报表" :lazy="true">
          <template #tab>
            <span class="flex items-center gap-2">
              <n-icon size="18"><PersonAddOutline /></n-icon>
              单个会员报表
            </span>
          </template>
          <div class="tab-content">
            <SingleMemberReport />
          </div>
        </n-tab-pane>

        <n-tab-pane name="activity-charts" tab="活跃图表" :lazy="true">
          <template #tab>
            <span class="flex items-center gap-2">
              <n-icon size="18"><BarChartOutline /></n-icon>
              活跃图表
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
import { ref } from 'vue';
import {
  NCard,
  NTabs,
  NTabPane,
  NIcon,
} from 'naive-ui';
import {
  CalendarOutline,
  PersonOutline,
  PersonAddOutline,
  BarChartOutline,
} from '@vicons/ionicons5';
import { Page } from '@vben/common-ui';

// ✅ PERFORMANCE FIX: Lazy load tab components - they only load when their tab is opened
import { defineAsyncComponent } from 'vue';
const DailyOperationsReport = defineAsyncComponent(() => import('./DailyOperationsReport.vue'));
const MemberTotalReport = defineAsyncComponent(() => import('./MemberTotalReport.vue'));
const SingleMemberReport = defineAsyncComponent(() => import('./SingleMemberReport.vue'));
const ActivityCharts = defineAsyncComponent(() => import('./ActivityCharts.vue'));

const activeTab = ref('daily-report');
</script>

<style scoped>
.operations-statistics {
  padding: 16px;
}

.tab-outside {
  /* Makes the tab line look nicer when outside */
  border-bottom: 1px solid #e8e8e8;
}

/* Remove default padding from tab pane so card can control it */
.tab-content {
  padding: 0;
}

.content-card {
  min-height: 400px;
  margin-top: 0;
  border-top: none; /* removes the top border to visually connect with tabs */
  border-top-left-radius: 0;
  border-top-right-radius: 0;
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