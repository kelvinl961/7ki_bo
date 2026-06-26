<template>
  <div class="daily-task-manager">
    <n-card>
      <n-empty :description="$t('activity.dailyTask.k6bcf')">
        <template #icon>
          <CalendarOutline size="48" />
        </template>
        <template #extra>
          <n-button size="small" @click="handleComingSoon">{{ $t('activity.shareManagement.k656c') }}</n-button>
        </template>
      </n-empty>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { $t } from '@vben/locales';

import { NCard, NEmpty, NButton, useMessage } from 'naive-ui';
import { CalendarOutline } from '@vicons/ionicons5';

const message = useMessage();

const handleComingSoon = () => {
  message.info($t('activity.dailyTask.k6bcfk656c'));
};
</script>

<style scoped>
.daily-task-manager {
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
