<template>
  <div class="custom-dns-view">
    <n-space vertical :size="16">
      <n-alert type="info" :show-icon="true">{{ $t('operations.domain.customDns.feature') }}</n-alert>

      <n-card :title="$t('operations.domain.tabs.customDns')" :bordered="false">
        <n-empty :description="$t('operations.domain.whitelist.developing')" />
      </n-card>
    </n-space>
  </div>
</template>

<script setup lang="ts">
import { $t } from '@vben/locales';

// Custom DNS View Component
</script>

<style scoped lang="scss">
.custom-dns-view {
  padding: 16px;
}
</style>
