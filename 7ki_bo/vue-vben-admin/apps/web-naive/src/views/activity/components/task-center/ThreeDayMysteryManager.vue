<template>
  <div class="three-day-mystery-manager">
    <n-card>
      <n-empty description="三日神秘任务功能开发中...">
        <template #icon>
          <SparklesOutline size="48" />
        </template>
        <template #extra>
          <n-button size="small" @click="handleComingSoon"> 敬请期待 </n-button>
        </template>
      </n-empty>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { NCard, NEmpty, NButton, useMessage } from 'naive-ui';
import { SparklesOutline } from '@vicons/ionicons5';

const message = useMessage();

const handleComingSoon = () => {
  message.info('三日神秘任务功能即将上线，敬请期待！');
};
</script>

<style scoped>
.three-day-mystery-manager {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.n-card) {
  width: 400px;
  text-align: center;
}
</style>
