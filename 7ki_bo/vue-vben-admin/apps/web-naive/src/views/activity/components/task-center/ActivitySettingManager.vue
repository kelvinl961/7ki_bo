<template>
  <div class="activity-setting-manager">
    <n-card>
      <n-empty :description="$t('activity.activitySetting.k6d3b')">
        <template #icon>
          <SettingsOutline size="48" />
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
import { SettingsOutline } from '@vicons/ionicons5';

const message = useMessage();

const handleComingSoon = () => {
  message.info($t('activity.activitySetting.k6d3bk656c'));
};
</script>

<style scoped>
.activity-setting-manager {
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
