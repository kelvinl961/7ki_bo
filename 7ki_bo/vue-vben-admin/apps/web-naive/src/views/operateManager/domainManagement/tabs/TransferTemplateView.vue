<template>
  <div class="transfer-template-view">
    <n-space vertical :size="16">
      <n-alert type="info" :show-icon="true">{{ $t('operations.domain.transferTemplate.feature') }}</n-alert>

      <n-card :title="$t('operations.domain.tabs.transferTemplate')" :bordered="false">
        <n-empty :description="$t('operations.domain.whitelist.developing')" />
      </n-card>
    </n-space>
  </div>
</template>

<script setup lang="ts">
import { $t } from '@vben/locales';

// Transfer Template View Component
</script>

<style scoped lang="scss">
.transfer-template-view {
  padding: 16px;
}
</style>
