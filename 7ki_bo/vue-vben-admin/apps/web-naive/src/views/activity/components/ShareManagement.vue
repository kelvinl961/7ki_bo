<template>
  <div class="share-management">
    <n-card>
      <n-empty :description="$t('activity.shareManagement.k5206')" size="large">
        <template #extra>
          <n-button type="primary" @click="handleComingSoon">{{ $t('activity.shareManagement.k656c') }}</n-button>
        </template>
      </n-empty>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { $t } from '@vben/locales';

import { NCard, NEmpty, NButton, useMessage } from 'naive-ui';

const message = useMessage();

const handleComingSoon = () => {
  message.info($t('activity.shareManagement.k5206k656c'));
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
