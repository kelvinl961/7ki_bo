<template>
  <Page :title="$t('game.hotGame.title')" :description="$t('game.hotGame.desc')">
    <div class="mb-4">
      <n-breadcrumb>
        <n-breadcrumb-item>{{ $t('game.breadcrumb') }}</n-breadcrumb-item>
        <n-breadcrumb-item>{{ $t('game.hotGame.breadcrumb') }}</n-breadcrumb-item>
      </n-breadcrumb>
    </div>

    <n-tabs
      v-model:value="activeTab"
      type="line"
      animated
      @update:value="handleTabChange"
    >
      <n-tab-pane name="third" :tab="$t('game.hotGame.hotManage1')">
        <HotGameList />
      </n-tab-pane>

      <n-tab-pane name="hot2" :tab="$t('game.hotGame.hotManage2')">
        <n-card>
          <n-empty :description="$t('game.hotGame.hotManage2Developing')">
            <template #extra>
              <n-button size="small" @click="handleComingSoon">
                {{ $t('game.comingSoon') }}
              </n-button>
            </template>
          </n-empty>
        </n-card>
      </n-tab-pane>

      <n-tab-pane name="recommended" :tab="$t('game.hotGame.recommendedManage')">
        <n-card>
          <n-empty :description="$t('game.hotGame.recommendedDeveloping')">
            <template #extra>
              <n-button size="small" @click="handleComingSoon">
                {{ $t('game.comingSoon') }}
              </n-button>
            </template>
          </n-empty>
        </n-card>
      </n-tab-pane>
    </n-tabs>
  </Page>
</template>

<script setup lang="ts">
import { $t } from '@vben/locales';

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
const HotGameList = defineAsyncComponent(() => import('./HotGameList.vue'));

const route = useRoute();
const router = useRouter();

const activeTab = ref('third');

const handleTabChange = (value: string) => {
  router.push({
    path: route.path,
    query: {
      ...route.query,
      activeName: value,
    },
  });
};

const handleComingSoon = () => {
  notification.info({
    content: $t('game.comingSoonMessage'),
    duration: 3000,
  });
};

onMounted(() => {
  const activeName = route.query.activeName as string;
  if (activeName) {
    activeTab.value = activeName;
  }
});
</script>
