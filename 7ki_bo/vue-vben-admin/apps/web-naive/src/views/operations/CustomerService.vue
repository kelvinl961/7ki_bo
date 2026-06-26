<template>
  <div class="customer-service-management p-6">
    <!-- Header -->
    <div class="mb-6">
      <h2 class="text-2xl font-bold">{{ $t('operations.customerService.title') }}</h2>
      <p class="mt-2 text-gray-500">{{ $t('operations.customerService.description') }}</p>
    </div>

    <!-- Tabs -->
    <n-tabs v-model:value="activeTab" type="line" animated>
      <n-tab-pane name="online" :tab="$t('operations.customerService.tabOnline')">
        <OnlineCustomerServiceTab />
      </n-tab-pane>

      <n-tab-pane name="other" :tab="$t('operations.customerService.tabOther')">
        <OtherCustomerServiceTab />
      </n-tab-pane>

      <n-tab-pane name="faq" :tab="$t('operations.customerService.tabFaq')">
        <FAQTab />
      </n-tab-pane>
    </n-tabs>
  </div>
</template>

<script setup lang="ts">
import { $t } from '@vben/locales';

import { ref, defineAsyncComponent } from 'vue';
import { NTabs, NTabPane } from 'naive-ui';
const OnlineCustomerServiceTab = defineAsyncComponent(
  () => import('./components/OnlineCustomerServiceTab.vue'),
);
const OtherCustomerServiceTab = defineAsyncComponent(
  () => import('./components/OtherCustomerServiceTab.vue'),
);
const FAQTab = defineAsyncComponent(() => import('./components/FAQTab.vue'));

const activeTab = ref('online');
</script>

<style scoped>
.customer-service-management {
  background: white;
  border-radius: 8px;
  min-height: calc(100vh - 120px);
}
</style>
