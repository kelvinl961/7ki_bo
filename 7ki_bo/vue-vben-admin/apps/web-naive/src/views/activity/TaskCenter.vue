<template>
  <div class="task-center">
    <Page
      title="任务中心"
      description="管理新人福利、每日任务、每周任务等各类任务的配置和设置"
    >
      <!-- 面包屑导航 -->
      <div class="mb-4">
        <n-breadcrumb>
          <n-breadcrumb-item>优惠活动</n-breadcrumb-item>
          <n-breadcrumb-item>任务中心</n-breadcrumb-item>
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
        <n-tab-pane name="novice_welfare" tab="新人福利">
          <NoviceWelfareManager />
        </n-tab-pane>

        <!-- 每日任务 -->
        <n-tab-pane name="daily_task" tab="每日任务">
          <DailyTaskManager />
        </n-tab-pane>

        <!-- 每周任务 -->
        <n-tab-pane name="weekly_task" tab="每周任务">
          <WeeklyTaskManager />
        </n-tab-pane>

        <!-- 三日神秘任务 -->
        <n-tab-pane name="three_day_mystery" tab="三日神秘任务">
          <ThreeDayMysteryManager />
        </n-tab-pane>

        <!-- 活跃度设置 -->
        <n-tab-pane name="activity_setting" tab="活跃度设置">
          <ActivitySettingManager />
        </n-tab-pane>
      </n-tabs>
    </Page>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, defineAsyncComponent } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { NBreadcrumb, NBreadcrumbItem, NTabs, NTabPane } from 'naive-ui';
import { Page } from '@vben/common-ui';
// ✅ PERFORMANCE FIX: Lazy load tab components - they only load when their tab is opened
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

const route = useRoute();
const router = useRouter();

// 当前激活的标签页 - 默认显示新人福利
const activeTab = ref('novice_welfare');

// 处理标签页切换
const handleTabChange = (value: string) => {
  router.push({
    path: route.path,
    query: {
      ...route.query,
      activeName: value,
    },
  });
};

// 从URL参数初始化标签页
onMounted(() => {
  console.log('🚀 TaskCenter page mounted');
  console.log('📍 Current route:', route.path);
  console.log('🔗 Query params:', route.query);

  const tabFromUrl = route.query.activeName as string;
  if (
    tabFromUrl &&
    [
      'novice_welfare',
      'daily_task',
      'weekly_task',
      'three_day_mystery',
      'activity_setting',
    ].includes(tabFromUrl)
  ) {
    activeTab.value = tabFromUrl;
  }

  console.log(' Active tab:', activeTab.value);
});
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
