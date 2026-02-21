<template>
  <div class="brand-setting">
    <n-card :bordered="false">
      <n-tabs
        v-model:value="activeTab"
        type="card"
        size="large"
        :on-update:value="handleTabChange"
      >
        <n-tab-pane name="logoSetting" tab="LOGO及图片设置">
          <BrandLogoSetting />
        </n-tab-pane>

        <n-tab-pane name="basicSetting" tab="基础设置"> </n-tab-pane>
      </n-tabs>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, defineAsyncComponent } from 'vue';
import { useRoute, useRouter } from 'vue-router';
// ✅ PERFORMANCE FIX: Lazy load tab component - it only loads when tab is opened
const BrandLogoSetting = defineAsyncComponent(
  () => import('./BrandLogoSetting.vue'),
);

const route = useRoute();
const router = useRouter();

const activeTab = ref('logoSetting');

// Handle tab change
const handleTabChange = (value: string) => {
  // Update URL with tab parameter
  router.push({
    path: route.path,
    query: {
      ...route.query,
      activeName: value,
    },
  });
};

// Initialize tab from URL parameter
onMounted(() => {
  const tabFromUrl = route.query.activeName as string;
  if (tabFromUrl) {
    activeTab.value = tabFromUrl;
  }
});
</script>

<style scoped>
.brand-setting {
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

:deep(.n-card) {
  height: 100%;
}

:deep(.n-card__content) {
  height: 100%;
  padding: 0;
}
</style>
