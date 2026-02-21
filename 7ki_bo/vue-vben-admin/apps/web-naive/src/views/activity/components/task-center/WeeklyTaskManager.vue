<template>
  <div class="weekly-task-manager">
    <n-card>
      <n-empty description="每周任务功能开发中...">
        <template #icon>
          <CalendarOutline size="48" />
        </template>
        <template #extra>
          <n-button size="small" @click="handleComingSoon">
            敬请期待
          </n-button>
        </template>
      </n-empty>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { NCard, NEmpty, NButton, useMessage } from 'naive-ui';
import { CalendarOutline } from '@vicons/ionicons5';

const message = useMessage();

const handleComingSoon = () => {
  message.info('每周任务功能即将上线，敬请期待！');
};
</script>

<style scoped>
.weekly-task-manager {
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