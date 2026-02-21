<template>
  <div class="custom-dns-view">
    <n-space vertical :size="16">
      <n-alert type="info" :show-icon="true"> 自定义DNS解析管理功能 </n-alert>

      <n-card title="自定义解析" :bordered="false">
        <n-empty description="该功能正在开发中" />
      </n-card>
    </n-space>
  </div>
</template>

<script setup lang="ts">
// Custom DNS View Component
</script>

<style scoped lang="scss">
.custom-dns-view {
  padding: 16px;
}
</style>
