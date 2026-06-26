<template>
  <div class="three-day-mystery-manager">
    <n-card>
      <n-empty :description="$t('activity.threeDayMystery.k4e09')">
        <template #icon>
          <SparklesOutline size="48" />
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
import { SparklesOutline } from '@vicons/ionicons5';

const message = useMessage();

const handleComingSoon = () => {
  message.info($t('activity.threeDayMystery.k4e09k656c'));
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
