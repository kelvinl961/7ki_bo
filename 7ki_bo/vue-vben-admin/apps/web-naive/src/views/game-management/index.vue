<template>
  <Page title="游戏管理" description="平台与子游戏管理">
    <n-tabs
      v-model:value="activeTab"
      type="line"
      animated
      @update:value="handleTabChange"
    >
      <n-tab-pane name="platform" tab="平台管理">
        <PlatformTable @manage-subgames="handleManageSubgames" />
      </n-tab-pane>
      <n-tab-pane name="subgame" tab="子游戏管理">
        <SubgameTable :platform-id="selectedPlatformId" />
      </n-tab-pane>
      <n-tab-pane name="hot-game" tab="热门管理">
        <HotGameTable />
      </n-tab-pane>
      <n-tab-pane name="virtual-bonus-pool" tab="虚拟彩金池">
        <VirtualBonusPoolTable />
      </n-tab-pane>
    </n-tabs>
  </Page>
</template>

<script setup lang="ts">
import { ref, onMounted, defineAsyncComponent } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Page } from '@vben/common-ui';
import { NTabs, NTabPane } from 'naive-ui';
// ✅ PERFORMANCE FIX: Lazy load tab components - they only load when their tab is opened
const PlatformTable = defineAsyncComponent(
  () => import('./platform/index.vue'),
);
const SubgameTable = defineAsyncComponent(() => import('./subgame/index.vue'));
const HotGameTable = defineAsyncComponent(() => import('./hot-game/index.vue'));
const VirtualBonusPoolTable = defineAsyncComponent(
  () => import('./virtual-bonus-pool/index.vue'),
);

const route = useRoute();
const router = useRouter();

const activeTab = ref('platform');
const selectedPlatformId = ref<number | undefined>(undefined);

function handleManageSubgames(platformId: number) {
  selectedPlatformId.value = platformId;
  activeTab.value = 'subgame';
}

// Handle tab change with URL query parameter
const handleTabChange = (value: string) => {
  router.push({
    path: route.path,
    query: {
      ...route.query,
      tab: value,
    },
  });
};

// Initialize tab from URL query parameter
onMounted(() => {
  const tab = route.query.tab as string;
  if (
    tab &&
    ['platform', 'subgame', 'hot-game', 'virtual-bonus-pool'].includes(tab)
  ) {
    activeTab.value = tab;
  }
});
</script>
