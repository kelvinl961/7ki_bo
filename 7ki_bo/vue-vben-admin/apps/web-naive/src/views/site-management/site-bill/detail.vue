<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Page } from '@vben/common-ui';
import SiteBillDetailPanel from './SiteBillDetailPanel.vue';

const route = useRoute();
const router = useRouter();

const billId = computed(() => String(route.params.billId || ''));
</script>

<template>
  <Page :title="`站点账单详情 · ${billId}`">
    <SiteBillDetailPanel
      v-if="billId"
      :bill-id="billId"
      show-back
      @back="router.push({ name: 'SiteManagement' })"
    />
  </Page>
</template>
