<template>
  <div class="whitelist-domains-view">
    <n-space vertical :size="16">
      <n-alert type="info" :show-icon="true">
        {{ $t('operations.domain.tabs.whitelist') }}
      </n-alert>

      <n-card :title="$t('operations.domain.whitelist.title')" :bordered="false">
        <n-empty :description="$t('operations.domain.whitelist.developing')" />
      </n-card>
    </n-space>
  </div>
</template>

<script setup lang="ts">
import { $t } from '@vben/locales';

// Whitelist Domains View Component
</script>

<style scoped lang="scss">
.whitelist-domains-view {
  padding: 16px;
}
</style>
