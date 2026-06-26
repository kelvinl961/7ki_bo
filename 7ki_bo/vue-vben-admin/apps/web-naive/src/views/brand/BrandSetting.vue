<template>
  <div class="brand-setting">
    <n-card :bordered="false">
      <n-tabs
        v-model:value="activeTab"
        type="card"
        size="large"
        :on-update:value="handleTabChange"
      >
        <n-tab-pane name="logoSetting" :tab="$t('brand.logoAndImageSetting')">
          <BrandLogoSetting />
        </n-tab-pane>

        <n-tab-pane name="basicSetting" :tab="$t('brand.basicSetting')"> </n-tab-pane>
      </n-tabs>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { $t } from '@vben/locales';

import { ref, onMounted, defineAsyncComponent } from 'vue';
import { useRoute, useRouter } from 'vue-router';
const BrandLogoSetting = defineAsyncComponent(
  () => import('./BrandLogoSetting.vue'),
);

const route = useRoute();
const router = useRouter();

const activeTab = ref('logoSetting');

const handleTabChange = (value: string) => {
  router.push({
    path: route.path,
    query: {
      ...route.query,
      activeName: value,
    },
  });
};

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
