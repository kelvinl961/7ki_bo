<template>
  <div class="smart-auto-refresh" :class="props.class">
    <!-- Debug info (temporary) -->
    <div v-if="false" style="font-size: 10px; color: #999; margin-bottom: 4px;">
      Debug: enabled={{ isEnabled }}, interval={{ currentInterval }}, countdown={{ countdown }}, options={{ intervalOptions.length }}
    </div>
    
    <!-- Auto-refresh toggle switch -->
    <n-switch
      :value="isEnabled"
      :size="props.size"
      @update:value="handleToggle"
    >
      <template #checked>{{ labels.enabled }}</template>
      <template #unchecked>{{ labels.disabled }}</template>
    </n-switch>
    
    <!-- Interval selection dropdown - show when enabled -->
    <n-select
      v-if="isEnabled"
      :value="currentInterval"
      :placeholder="labels.placeholder"
      :size="props.size"
      style="width: 100px; margin-left: 8px;"
      :options="intervalOptions"
      @update:value="handleIntervalChange"
    />
    
    <!-- Countdown timer display -->
    <n-tag 
      v-if="isEnabled && countdown > 0 && !pausedByInteraction" 
      type="info" 
      :size="props.size"
      style="margin-left: 8px;"
    >
      {{ countdown }}s
    </n-tag>
    
    <!-- Paused indicator -->
    <n-tag 
      v-if="isEnabled && pausedByInteraction" 
      type="warning" 
      :size="props.size"
      style="margin-left: 8px;"
    >
      已暂停
    </n-tag>
    
    <!-- Refreshing indicator -->
    <n-tag 
      v-if="isRefreshing" 
      type="info" 
      :size="props.size"
      style="margin-left: 8px;"
    >
      <template #icon>
        <n-icon>
          <Refresh />
        </n-icon>
      </template>
      刷新中...
    </n-tag>
  </div>
</template>

<script setup lang="ts">
import { computed, watch, defineExpose } from 'vue';
import { NSwitch, NSelect, NTag, NIcon } from 'naive-ui';
import { Refresh } from '@vicons/ionicons5';
import { useAutoRefresh } from '../../../composables/useAutoRefresh';
import type { SmartAutoRefreshProps, SmartAutoRefreshEmits, SmartAutoRefreshExpose } from './types';

// Props with defaults
const props = withDefaults(defineProps<SmartAutoRefreshProps>(), {
  modelValue: false,
  intervals: () => [15, 30, 60, 120],
  defaultInterval: 30,
  size: 'small',
  labels: () => ({
    enabled: '自动更新',
    disabled: '不自动更新',
    placeholder: '刷新间隔'
  }),
  showMessages: true,
  pauseOnInteraction: false,
  class: ''
});

// Emits
const emit = defineEmits<SmartAutoRefreshEmits>();

// Computed labels with defaults
const labels = computed(() => ({
  enabled: '自动更新',
  disabled: '不自动更新',
  placeholder: '刷新间隔',
  ...props.labels
}));

// Use the auto-refresh composable
const {
  isEnabled,
  currentInterval,
  countdown,
  isRefreshing,
  pausedByInteraction,
  intervalOptions,
  start,
  stop,
  toggle,
  setInterval,
  triggerRefresh,
  restart
} = useAutoRefresh(props.onRefresh, {
  defaultInterval: props.defaultInterval,
  intervals: props.intervals,
  showMessages: props.showMessages,
  pauseOnInteraction: props.pauseOnInteraction
});

// Handle toggle from UI
const handleToggle = (enabled: boolean) => {
  toggle(enabled);
  emit('update:modelValue', enabled);
  
  if (enabled) {
    emit('refresh');
  }
};

// Handle interval change from UI
const handleIntervalChange = (newInterval: number) => {
  setInterval(newInterval);
  emit('intervalChange', newInterval);
};

// Watch for external modelValue changes
watch(() => props.modelValue, (newValue) => {
  if (newValue !== isEnabled.value) {
    toggle(newValue);
  }
}, { immediate: true });

// Initialize with default interval from props
watch(() => props.defaultInterval, (newInterval) => {
  if (newInterval && newInterval !== currentInterval.value) {
    setInterval(newInterval);
  }
}, { immediate: true });

// Expose methods for parent component
const exposedMethods: SmartAutoRefreshExpose = {
  start,
  stop,
  restart,
  getCountdown: () => countdown.value,
  getInterval: () => currentInterval.value,
  triggerRefresh
};

defineExpose(exposedMethods);
</script>

<style scoped>
.smart-auto-refresh {
  display: flex;
  align-items: center;
  gap: 8px;
}

.smart-auto-refresh .n-tag {
  user-select: none;
}

/* Animation for countdown */
.smart-auto-refresh .n-tag {
  transition: all 0.3s ease;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .smart-auto-refresh {
    flex-wrap: wrap;
    gap: 4px;
  }
}
</style>
