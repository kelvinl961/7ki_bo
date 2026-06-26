<script setup lang="ts">
import { $t } from '@vben/locales';

import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Page } from '@vben/common-ui';
import SiteBillDetailPanel from './SiteBillDetailPanel.vue';

const route = useRoute();
const router = useRouter();

const billId = computed(() => String(route.params.billId || ''));

const pageTitle = computed(() =>
  $t('system.siteBill.detailTitle', [billId.value]),
);
</script>

<template>
  <Page :title="pageTitle">
    <SiteBillDetailPanel
      v-if="billId"
      :bill-id="billId"
      show-back
      @back="router.push({ name: 'SiteManagement' })"
    />
  </Page>
</template>
