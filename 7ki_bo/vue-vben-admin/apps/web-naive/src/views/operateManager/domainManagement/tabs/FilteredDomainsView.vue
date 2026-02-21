<template>
  <div class="filtered-domains-view">
    <AllDomainsView :initial-filter="filter" :title="title" />
  </div>
</template>

<script setup lang="ts">
// ✅ PERFORMANCE FIX: Lazy load components to avoid blocking page load
import { defineAsyncComponent } from 'vue';
const AllDomainsView = defineAsyncComponent(
  () => import('./AllDomainsView.vue'),
);

interface Props {
  title?: string;
  filter: {
    useType?: string;
    cdnProvider?: string;
    status?: string;
  };
}

const props = withDefaults(defineProps<Props>(), {
  title: '域名列表',
});
</script>

<style scoped lang="scss">
.filtered-domains-view {
  width: 100%;
  height: 100%;
}
</style>
