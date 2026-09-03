<template>
  <div class="flex items-center gap-2">
    <!-- Timezone Selector Dropdown -->
    <n-dropdown
      :options="timezoneOptions"
      trigger="click"
      @select="handleSelectTimezone"
    >
      <div
        class="flex cursor-pointer items-center gap-2 rounded-md border border-gray-200 bg-gray-100 px-3 py-1.5 transition-colors hover:bg-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
      >
        <n-icon :size="16">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"
            />
          </svg>
        </n-icon>
        <div class="flex flex-col">
          <span class="text-xs text-gray-500 dark:text-gray-400">{{
            currentTimezone?.label || $t('page.header.brazilLocalTime')
          }}</span>
          <span class="text-sm font-medium text-gray-900 dark:text-gray-100">{{
            currentTime
          }}</span>
        </div>
        <n-icon :size="14" class="text-gray-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clip-rule="evenodd"
            />
          </svg>
        </n-icon>
      </div>
    </n-dropdown>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { NDropdown, NIcon } from 'naive-ui';
import { $t } from '@vben/locales';

import { useDisplayTimezone } from '#/composables/useDisplayTimezone';
import { TIMEZONE_KEY_MAP } from '#/utils/timezoneUtils';

const { preferredKey, setTimezoneByKey, timezone } = useDisplayTimezone();

const timezones = [
  {
    labelKey: 'page.header.brazilLocalTime',
    key: 'brazil',
    timezone: TIMEZONE_KEY_MAP.brazil,
    flag: '🇧🇷',
  },
  {
    labelKey: 'page.header.vietnamLocalTime',
    key: 'vietnam',
    timezone: TIMEZONE_KEY_MAP.vietnam,
    flag: '🇻🇳',
  },
  {
    labelKey: 'page.header.chinaLocalTime',
    key: 'china',
    timezone: TIMEZONE_KEY_MAP.china,
    flag: '🇨🇳',
  },
] as const;

const timezoneOptions = computed(() => {
  return timezones.map((tz) => ({
    label: `${tz.flag} ${$t(tz.labelKey)}`,
    key: tz.key,
  }));
});

const selectedTimezoneKey = computed({
  get: () => preferredKey.value,
  set: (key: string) => setTimezoneByKey(key),
});

const currentTimezone = computed(() => {
  const tz =
    timezones.find((item) => item.key === selectedTimezoneKey.value) ||
    timezones[0];
  return {
    ...tz,
    label: $t(tz.labelKey),
  };
});

const currentTime = ref('');
let timeUpdateInterval: number | null = null;

function updateTime() {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('zh-CN', {
    timeZone: timezone.value,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  currentTime.value = formatter.format(now);
}

function handleSelectTimezone(key: string) {
  setTimezoneByKey(key);
  updateTime();
}

// Start time update interval
onMounted(() => {
  updateTime();
  timeUpdateInterval = window.setInterval(() => {
    updateTime();
  }, 1000); // Update every second
});

// Cleanup interval on unmount
onUnmounted(() => {
  if (timeUpdateInterval !== null) {
    clearInterval(timeUpdateInterval);
    timeUpdateInterval = null;
  }
});
</script>

<style scoped>
/* Optional: Add any custom styles here */
</style>
