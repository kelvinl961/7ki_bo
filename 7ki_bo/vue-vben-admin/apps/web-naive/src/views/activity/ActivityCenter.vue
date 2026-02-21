<template>
  <div class="activity-center">
    <Page title="活动中心" description="管理所有活动的创建、编辑、监控和统计">
      <!-- 面包屑导航 -->
      <div class="mb-4">
        <n-breadcrumb>
          <n-breadcrumb-item>优惠活动</n-breadcrumb-item>
          <n-breadcrumb-item>活动中心</n-breadcrumb-item>
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
        <!-- 活动列表 -->
        <n-tab-pane name="first" tab="活动列表">
          <ActivityList />
        </n-tab-pane>

        <!-- 已关闭活动 -->
        <n-tab-pane name="closed" tab="已关闭活动">
          <ClosedActivityList />
        </n-tab-pane>

        <!-- 优惠统计 -->
        <n-tab-pane name="statistics" tab="优惠统计">
          <ActivityStatistics />
        </n-tab-pane>

        <!-- 分享管理 -->
        <n-tab-pane name="share" tab="分享管理">
          <ShareManagement />
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
const ActivityList = defineAsyncComponent(
  () => import('./components/ActivityList.vue'),
);
const ClosedActivityList = defineAsyncComponent(
  () => import('./components/ClosedActivityList.vue'),
);
const ActivityStatistics = defineAsyncComponent(
  () => import('./components/ActivityStatistics.vue'),
);
const ShareManagement = defineAsyncComponent(
  () => import('./components/ShareManagement.vue'),
);
const UserActivityDashboard = defineAsyncComponent(
  () => import('../user/ActivityDashboard.vue'),
);

const route = useRoute();
const router = useRouter();

// 当前激活的标签页
const activeTab = ref('first');

// 处理标签页切换
const handleTabChange = (value: string) => {
  // 更新URL参数
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
  const tabFromUrl = route.query.activeName as string;
  if (
    tabFromUrl &&
    ['first', 'closed', 'statistics', 'share', 'user-activities'].includes(
      tabFromUrl,
    )
  ) {
    activeTab.value = tabFromUrl;
  }
});
</script>

<style scoped>
.activity-center {
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
