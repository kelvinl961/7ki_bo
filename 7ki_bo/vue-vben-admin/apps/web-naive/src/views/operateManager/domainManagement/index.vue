<template>
  <Page title="域名管理" description="CDN域名配置与管理">
    <n-tabs
      v-model:value="activeTab"
      type="line"
      animated
      @update:value="handleTabChange"
    >
      <!-- Tab 1: 域名管理 -->
      <n-tab-pane name="all" tab="域名管理">
        <AllDomainsView />
      </n-tab-pane>

      <!-- Tab 2: Web大厅 -->
      <n-tab-pane name="web-hall" tab="Web大厅">
        <WebHallView />
      </n-tab-pane>

      <!-- Tab 3: 后端加速域名 -->
      <n-tab-pane name="backend-api" tab="后端加速域名">
        <BackendApiView />
      </n-tab-pane>

      <!-- Tab 4: APP更新 -->
      <n-tab-pane name="app-update" tab="APP更新">
        <AppUpdateView />
      </n-tab-pane>

      <!-- Tab 5: OSS加速域名 -->
      <n-tab-pane name="oss-acceleration" tab="OSS加速域名">
        <OssAccelerationView />
      </n-tab-pane>

      <!-- Tab 6: 下载站域名 -->
      <n-tab-pane name="download-site" tab="下载站域名">
        <DownloadSiteView />
      </n-tab-pane>

      <!-- Tab 7: 中转页模板 -->
      <n-tab-pane name="transfer-template" tab="中转页模板">
        <TransferTemplateView />
      </n-tab-pane>

      <!-- Tab 8: 中转网址 -->
      <n-tab-pane name="transfer-url" tab="中转网址">
        <FilteredDomainsView
          title="中转网址"
          :filter="{ useType: 'TRANSFER_PAGE' }"
        />
      </n-tab-pane>

      <!-- Tab 9: 外部白名单域名 -->
      <n-tab-pane name="whitelist" tab="外部白名单域名(含泛域)">
        <WhitelistDomainsView />
      </n-tab-pane>

      <!-- Tab 10: 域名检测 -->
      <n-tab-pane name="health-check" tab="域名检测">
        <HealthCheckView />
      </n-tab-pane>

      <!-- Tab 11: 自定义解析 -->
      <n-tab-pane name="custom-dns" tab="自定义解析">
        <CustomDNSView />
      </n-tab-pane>

      <!-- Tab 12: 流量统计 -->
      <n-tab-pane name="traffic-stats" tab="流量统计">
        <TrafficStatsView />
      </n-tab-pane>

      <!-- Tab 13: 批量清除缓存 -->
      <n-tab-pane name="batch-cache" tab="批量清除缓存">
        <BatchCacheView />
      </n-tab-pane>

      <!-- Tab 14: 证书管理 -->
      <n-tab-pane name="certificates" tab="证书管理">
        <CertificateView />
      </n-tab-pane>
    </n-tabs>
  </Page>
</template>

<script setup lang="ts">
import { ref, onMounted, defineAsyncComponent } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Page } from '@vben/common-ui';
import { NTabs, NTabPane } from 'naive-ui';
// ✅ PERFORMANCE FIX: Lazy load tab components - they only load when their tab is opened (13 tabs!)
const AllDomainsView = defineAsyncComponent(
  () => import('./tabs/AllDomainsView.vue'),
);
const WebHallView = defineAsyncComponent(
  () => import('./tabs/WebHallView.vue'),
);
const BackendApiView = defineAsyncComponent(
  () => import('./tabs/BackendApiView.vue'),
);
const AppUpdateView = defineAsyncComponent(
  () => import('./tabs/AppUpdateView.vue'),
);
const OssAccelerationView = defineAsyncComponent(
  () => import('./tabs/OssAccelerationView.vue'),
);
const DownloadSiteView = defineAsyncComponent(
  () => import('./tabs/DownloadSiteView.vue'),
);
const FilteredDomainsView = defineAsyncComponent(
  () => import('./tabs/FilteredDomainsView.vue'),
);
const TransferTemplateView = defineAsyncComponent(
  () => import('./tabs/TransferTemplateView.vue'),
);
const WhitelistDomainsView = defineAsyncComponent(
  () => import('./tabs/WhitelistDomainsView.vue'),
);
const HealthCheckView = defineAsyncComponent(
  () => import('./tabs/HealthCheckView.vue'),
);
const CustomDNSView = defineAsyncComponent(
  () => import('./tabs/CustomDNSView.vue'),
);
const TrafficStatsView = defineAsyncComponent(
  () => import('./tabs/TrafficStatsView.vue'),
);
const BatchCacheView = defineAsyncComponent(
  () => import('./tabs/BatchCacheView.vue'),
);
const CertificateView = defineAsyncComponent(
  () => import('./tabs/CertificateView.vue'),
);

const route = useRoute();
const router = useRouter();

const activeTab = ref('all');

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
  if (tab) {
    activeTab.value = tab;
  }
});
</script>

<style scoped lang="scss">
.n-tabs {
  margin-top: 16px;
}

:deep(.n-tabs-nav) {
  background-color: transparent;
}

:deep(.n-tabs-pane) {
  padding: 16px 0 0 0;
}
</style>
