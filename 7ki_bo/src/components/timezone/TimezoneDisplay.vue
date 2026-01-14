<template>
  <div class="flex items-center gap-2">
    <!-- Timezone Selector Dropdown -->
    <n-dropdown
      :options="timezoneOptions"
      trigger="click"
      @select="handleSelectTimezone"
    >
      <div 
        class="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      >
        <n-icon :size="16">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
          </svg>
        </n-icon>
        <div class="flex flex-col">
          <span class="text-xs text-gray-500 dark:text-gray-400">{{ currentTimezone?.label || $t('page.header.brazilLocalTime') }}</span>
          <span class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ currentTime }}</span>
        </div>
        <n-icon :size="14" class="text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
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

interface TimezoneOption {
  labelKey: string;
  key: string;
  timezone: string;
  flag: string;
}

const timezones = [
  {
    labelKey: 'page.header.brazilLocalTime',
    key: 'brazil',
    timezone: 'America/Sao_Paulo', // Brazil/Brasília time
    flag: '🇧🇷'
  },
  {
    labelKey: 'page.header.vietnamLocalTime',
    key: 'vietnam',
    timezone: 'Asia/Ho_Chi_Minh', // Vietnam time
    flag: '🇻🇳'
  },
  {
    labelKey: 'page.header.chinaLocalTime',
    key: 'china',
    timezone: 'Asia/Shanghai', // China/Beijing time
    flag: '🇨🇳'
  }
] as const;

// Create dropdown options
const timezoneOptions = computed(() => {
  return timezones.map(tz => ({
    label: `${tz.flag} ${$t(tz.labelKey)}`,
    key: tz.key
  }));
});

// Current selected timezone (default to Brazil since this is a Brazilian platform)
const selectedTimezoneKey = ref('brazil');

// Get saved timezone from localStorage on mount
onMounted(() => {
  const saved = localStorage.getItem('preferred_timezone');
  if (saved && timezones.some(tz => tz.key === saved)) {
    selectedTimezoneKey.value = saved;
  }
});

const currentTimezone = computed(() => {
  const tz = timezones.find(tz => tz.key === selectedTimezoneKey.value) || timezones[0];
  return {
    ...tz,
    label: $t(tz.labelKey)
  };
});

// Current time in selected timezone
const currentTime = ref('');
let timeUpdateInterval: number | null = null;

function updateTime() {
  const now = new Date();
  const timezone = currentTimezone.value;
  if (!timezone) return;
  
  // Use Intl.DateTimeFormat for timezone conversion (built-in, no dependencies)
  const formatter = new Intl.DateTimeFormat('zh-CN', {
    timeZone: timezone.timezone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  currentTime.value = formatter.format(now);
}

// Handle timezone selection
function handleSelectTimezone(key: string) {
  selectedTimezoneKey.value = key;
  // Save preference
  localStorage.setItem('preferred_timezone', key);
  // Update time immediately
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

