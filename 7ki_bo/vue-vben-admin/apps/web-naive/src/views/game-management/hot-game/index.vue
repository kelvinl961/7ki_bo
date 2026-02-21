<template>
  <Page title="游戏管理" description="热门游戏管理与配置">
    <!-- 面包屑导航 -->
    <div class="mb-4">
      <n-breadcrumb>
        <n-breadcrumb-item>游戏管理</n-breadcrumb-item>
        <n-breadcrumb-item>热门管理</n-breadcrumb-item>
      </n-breadcrumb>
    </div>

    <!-- 主要内容区域 -->
    <n-tabs
      v-model:value="activeTab"
      type="line"
      animated
      @update:value="handleTabChange"
    >
      <!-- 热门管理一 -->
      <n-tab-pane name="third" tab="热门管理一">
        <HotGameList />
      </n-tab-pane>

      <!-- 热门管理二 (预留) -->
      <n-tab-pane name="hot2" tab="热门管理二">
        <n-card>
          <n-empty description="热门管理二功能开发中...">
            <template #extra>
              <n-button size="small" @click="handleComingSoon">
                敬请期待
              </n-button>
            </template>
          </n-empty>
        </n-card>
      </n-tab-pane>

      <!-- 推荐管理 (预留) -->
      <n-tab-pane name="recommended" tab="推荐管理">
        <n-card>
          <n-empty description="推荐管理功能开发中...">
            <template #extra>
              <n-button size="small" @click="handleComingSoon">
                敬请期待
              </n-button>
            </template>
          </n-empty>
        </n-card>
      </n-tab-pane>
    </n-tabs>
  </Page>
</template>

<script setup lang="ts">
import { ref, onMounted, defineAsyncComponent } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  NBreadcrumb,
  NBreadcrumbItem,
  NButton,
  NCard,
  NEmpty,
  NTabPane,
  NTabs,
} from 'naive-ui';
import { Page } from '@vben/common-ui';
import { notification } from '#/adapter/naive';
// ✅ PERFORMANCE FIX: Lazy load tab component
const HotGameList = defineAsyncComponent(() => import('./HotGameList.vue'));

const route = useRoute();
const router = useRouter();

// 当前激活的标签页
const activeTab = ref('third');

// 处理标签页切换
const handleTabChange = (value: string) => {
  // 更新 URL 查询参数
  router.push({
    path: route.path,
    query: {
      ...route.query,
      activeName: value,
    },
  });
};

// 处理即将推出功能
const handleComingSoon = () => {
  notification.info({
    content: '该功能正在开发中，敬请期待！',
    duration: 3000,
  });
};

// 组件挂载时初始化
onMounted(() => {
  // 从 URL 查询参数中获取激活的标签页
  const activeName = route.query.activeName as string;
  if (activeName) {
    activeTab.value = activeName;
  }
});
</script>

<style scoped>
/* 自定义样式 */
:deep(.n-tabs-nav) {
  background-color: #f5f5f5;
  border-radius: 8px 8px 0 0;
  border-bottom: 1px solid #e8e8e8;
}

:deep(.n-tabs-tab) {
  font-weight: 500;
  color: #666;
}

:deep(.n-tabs-tab--active) {
  font-weight: 600;
  color: #333;
}

:deep(.n-tabs-pane) {
  padding: 0;
}

:deep(.n-card) {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

:deep(.n-empty) {
  padding: 80px 0;
}
</style>
