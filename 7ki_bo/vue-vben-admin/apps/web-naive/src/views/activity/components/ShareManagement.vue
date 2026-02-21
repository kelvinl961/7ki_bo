<template>
  <div class="share-management">
    <n-card>
      <n-empty 
        description="分享管理功能正在开发中..."
        size="large"
      >
        <template #extra>
          <n-button type="primary" @click="handleComingSoon">
            敬请期待
          </n-button>
        </template>
      </n-empty>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { NCard, NEmpty, NButton, useMessage } from 'naive-ui';

const message = useMessage();

const handleComingSoon = () => {
  message.info('分享管理功能正在积极开发中，敬请期待！');
};
</script>

<style scoped>
.share-management {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.n-card) {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style> 