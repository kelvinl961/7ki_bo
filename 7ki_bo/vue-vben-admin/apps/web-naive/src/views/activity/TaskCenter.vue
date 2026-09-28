<template>
  <div class="task-center">
    <Page
      :title="$t('activity.taskCenter.k4efb')"
      :description="$t('activity.taskCenter.k7ba1k6bcfk6bcf')"
    >
      <!-- 面包屑导航 -->
      <div class="mb-4">
        <n-breadcrumb>
          <n-breadcrumb-item>{{ $t('activity.center.k4f182') }}</n-breadcrumb-item>
          <n-breadcrumb-item>{{ $t('activity.taskCenter.k4efb') }}</n-breadcrumb-item>
        </n-breadcrumb>
      </div>

      <!-- 主要内容区域 -->
      <n-tabs
        v-model:value="activeTab"
        type="line"
        size="large"
        animated
        @update:value="handleTabChange"
      >
        <!-- 新人福利 -->
        <n-tab-pane name="novice_welfare" :tab="$t('activity.rewardReport.k65b0')">
          <NoviceWelfareManager />
        </n-tab-pane>

        <!-- 每日任务 -->
        <n-tab-pane name="daily_task" :tab="$t('activity.taskDetail.k6bcf4')">
          <DailyTaskManager />
        </n-tab-pane>

        <!-- 每周任务 -->
        <n-tab-pane name="weekly_task" :tab="$t('activity.taskDetail.k6bcf5')">
          <WeeklyTaskManager />
        </n-tab-pane>

        <!-- 三日神秘任务 -->
        <n-tab-pane name="three_day_mystery" :tab="$t('activity.taskDetail.k4e09')">
          <ThreeDayMysteryManager />
        </n-tab-pane>

        <!-- 活跃度宝箱 -->
        <n-tab-pane name="activity_setting" tab="活跃度宝箱">
          <ActivitySettingManager />
        </n-tab-pane>

        <!-- 活跃度记录 -->
        <n-tab-pane name="activity_ledger" tab="活跃度记录">
          <ActivityLedgerManager />
        </n-tab-pane>

        <!-- 剩余活跃度 -->
        <n-tab-pane name="activity_balance" tab="剩余活跃度">
          <ActivityBalanceManager />
        </n-tab-pane>
      </n-tabs>
    </Page>
  </div>
</template>

<script setup lang="ts">
import { $t } from '@vben/locales';

import { ref, onMounted, watch, defineAsyncComponent } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { NBreadcrumb, NBreadcrumbItem, NTabs, NTabPane } from 'naive-ui';
import { Page } from '@vben/common-ui';
const NoviceWelfareManager = defineAsyncComponent(
  () => import('./components/task-center/NoviceWelfareManager.vue'),
);
const DailyTaskManager = defineAsyncComponent(
  () => import('./components/task-center/DailyTaskManager.vue'),
);
const WeeklyTaskManager = defineAsyncComponent(
  () => import('./components/task-center/WeeklyTaskManager.vue'),
);
const ThreeDayMysteryManager = defineAsyncComponent(
  () => import('./components/task-center/ThreeDayMysteryManager.vue'),
);
const ActivitySettingManager = defineAsyncComponent(
  () => import('./components/task-center/ActivitySettingManager.vue'),
);
const ActivityLedgerManager = defineAsyncComponent(
  () => import('./components/task-center/ActivityLedgerManager.vue'),
);
const ActivityBalanceManager = defineAsyncComponent(
  () => import('./components/task-center/ActivityBalanceManager.vue'),
);

const route = useRoute();
const router = useRouter();

const TAB_NAMES = [
  'novice_welfare',
  'daily_task',
  'weekly_task',
  'three_day_mystery',
  'activity_setting',
  'activity_ledger',
  'activity_balance',
] as const;

const activeTab = ref<string>('novice_welfare');

const syncTabFromQuery = () => {
  const tabFromUrl = route.query.activeName as string;
  if (tabFromUrl && (TAB_NAMES as readonly string[]).includes(tabFromUrl)) {
    activeTab.value = tabFromUrl;
  }
};

const handleTabChange = (value: string) => {
  activeTab.value = value;
  router.replace({
    path: route.path,
    query: {
      ...route.query,
      activeName: value,
    },
  });
};

onMounted(syncTabFromQuery);
watch(() => route.query.activeName, syncTabFromQuery);
</script>

<style scoped>
.task-center {
  height: 100%;
}

:deep(.n-tabs) {
  height: 100%;
}

:deep(.n-tabs-content) {
  height: calc(100% - 48px);
}

:deep(.n-tab-pane) {
  height: 100%;
  overflow-y: auto;
}
</style>
