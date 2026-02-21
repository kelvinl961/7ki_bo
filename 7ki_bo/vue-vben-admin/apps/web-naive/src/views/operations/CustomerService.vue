<template>
  <div class="customer-service-management p-6">
    <!-- Header -->
    <div class="mb-6">
      <h2 class="text-2xl font-bold">客服管理</h2>
      <p class="mt-2 text-gray-500">管理在线客服、IM客服和常见问题</p>
    </div>

    <!-- Tabs -->
    <n-tabs v-model:value="activeTab" type="line" animated>
      <!-- Tab 1: Online Customer Service -->
      <n-tab-pane name="online" tab="在线客服">
        <OnlineCustomerServiceTab />
      </n-tab-pane>

      <!-- Tab 2: Other Customer Services (IM) -->
      <n-tab-pane name="other" tab="其他客服">
        <OtherCustomerServiceTab />
      </n-tab-pane>

      <!-- Tab 3: FAQ -->
      <n-tab-pane name="faq" tab="常见问题">
        <FAQTab />
      </n-tab-pane>
    </n-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, defineAsyncComponent } from 'vue';
import { NTabs, NTabPane } from 'naive-ui';
// ✅ PERFORMANCE FIX: Lazy load tab components - they only load when their tab is opened
const OnlineCustomerServiceTab = defineAsyncComponent(
  () => import('./components/OnlineCustomerServiceTab.vue'),
);
const OtherCustomerServiceTab = defineAsyncComponent(
  () => import('./components/OtherCustomerServiceTab.vue'),
);
const FAQTab = defineAsyncComponent(() => import('./components/FAQTab.vue'));

// Active tab
const activeTab = ref('online');
</script>

<style scoped>
.customer-service-management {
  background: white;
  border-radius: 8px;
  min-height: calc(100vh - 120px);
}
</style>
