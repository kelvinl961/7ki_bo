<template>
  <div class="whitelist-domains-view">
    <n-space vertical :size="16">
      <n-alert type="info" :show-icon="true">
        外部白名单域名管理（含泛域）
      </n-alert>

      <n-card title="白名单域名" :bordered="false">
        <n-empty description="该功能正在开发中" />
      </n-card>
    </n-space>
  </div>
</template>

<script setup lang="ts">
// Whitelist Domains View Component
</script>

<style scoped lang="scss">
.whitelist-domains-view {
  padding: 16px;
}
</style>
