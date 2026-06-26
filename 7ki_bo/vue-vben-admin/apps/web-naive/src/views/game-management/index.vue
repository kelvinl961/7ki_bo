<template>
  <Page :title="$t('game.title')" :description="$t('game.desc')">
    <n-tabs
      v-model:value="activeTab"
      type="line"
      animated
      @update:value="handleTabChange"
    >
      <n-tab-pane name="platform" :tab="$t('game.platformTab')">
        <PlatformTable @manage-subgames="handleManageSubgames" />
      </n-tab-pane>
      <n-tab-pane name="subgame" :tab="$t('game.subgameTab')">
        <SubgameTable :platform-id="selectedPlatformId" />
      </n-tab-pane>
      <n-tab-pane name="hot-game" :tab="$t('game.hotGameTab')">
        <HotGameTable />
      </n-tab-pane>
      <n-tab-pane name="virtual-bonus-pool" :tab="$t('game.virtualBonusPoolTab')">
        <VirtualBonusPoolTable />
      </n-tab-pane>
    </n-tabs>
  </Page>
</template>

<script setup lang="ts">
import { $t } from '@vben/locales';

import { ref, onMounted, defineAsyncComponent } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Page } from '@vben/common-ui';
import { NTabs, NTabPane } from 'naive-ui';
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

const handleTabChange = (value: string) => {
  router.push({
    path: route.path,
    query: {
      ...route.query,
      tab: value,
    },
  });
};

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
