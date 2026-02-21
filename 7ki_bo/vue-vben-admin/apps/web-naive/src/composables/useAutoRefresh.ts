/**
 * useAutoRefresh Composable
 *
 * Extracted from RechargeOrderList.vue auto-refresh logic
 * Provides reusable auto-refresh functionality with countdown timer
 */

import { onUnmounted, ref, watch } from 'vue';

import { useMessage } from 'naive-ui';

export interface UseAutoRefreshOptions {
  /** Default refresh interval in seconds */
  defaultInterval?: number;

  /** Available refresh intervals */
  intervals?: number[];

  /** Show success/info messages */
  showMessages?: boolean;

  /** Pause on user interaction */
  pauseOnInteraction?: boolean;

  /** Custom labels for messages */
  labels?: {
    disabled?: string;
    enabled?: string;
    intervalChanged?: string;
  };
}

export function useAutoRefresh(
  refreshCallback: () => Promise<void> | void,
  options: UseAutoRefreshOptions = {},
) {
  const {
    defaultInterval = 30,
    intervals = [15, 30, 60, 120],
    showMessages = true,
    pauseOnInteraction = true,
    labels = {
      enabled: '已启用自动更新',
      disabled: '已关闭自动更新',
      intervalChanged: '刷新间隔已更改',
    },
  } = options;

  const message = useMessage();

  // Reactive state
  const isEnabled = ref(false);
  const currentInterval = ref(defaultInterval);
  const countdown = ref(0);
  const isRefreshing = ref(false);

  // Timers
  let refreshTimer: NodeJS.Timeout | null = null;
  let countdownTimer: NodeJS.Timeout | null = null;
  let interactionTimer: NodeJS.Timeout | null = null;

  // Available interval options for UI
  const intervalOptions = intervals.map((value) => ({
    label: value < 60 ? `${value}秒` : `${value / 60}分钟`,
    value,
  }));

  /**
   * Execute the refresh callback
   */
  const executeRefresh = async () => {
    if (isRefreshing.value) return;

    try {
      isRefreshing.value = true;
      await refreshCallback();
    } catch (error) {
      console.error('Auto-refresh failed:', error);
    } finally {
      isRefreshing.value = false;
    }
  };

  /**
   * Start countdown timer
   */
  const startCountdown = () => {
    // Safety check: clear any existing countdown timer first
    if (countdownTimer) {
      clearInterval(countdownTimer);
      countdownTimer = null;
    }

    countdown.value = currentInterval.value;

    countdownTimer = setInterval(() => {
      countdown.value--;
      if (countdown.value <= 0) {
        executeRefresh();
        countdown.value = currentInterval.value; // Reset countdown
      }
    }, 1000); // Update every second
  };

  /**
   * Stop all timers
   */
  const stopAllTimers = () => {
    if (refreshTimer) {
      clearInterval(refreshTimer);
      refreshTimer = null;
    }
    if (countdownTimer) {
      clearInterval(countdownTimer);
      countdownTimer = null;
    }
    if (interactionTimer) {
      clearTimeout(interactionTimer);
      interactionTimer = null;
    }
    countdown.value = 0;
    pausedByInteraction.value = false;
  };

  /**
   * Start auto-refresh
   */
  const start = () => {
    if (isEnabled.value) return; // Already running

    isEnabled.value = true;
    startCountdown();

    if (showMessages) {
      message.success(
        `${labels.enabled}，每${currentInterval.value}秒刷新一次`,
      );
    }
  };

  /**
   * Stop auto-refresh
   */
  const stop = () => {
    if (!isEnabled.value) return; // Already stopped

    isEnabled.value = false;
    stopAllTimers();

    if (showMessages) {
      message.success(labels.disabled);
    }
  };

  /**
   * Toggle auto-refresh
   */
  const toggle = (enabled?: boolean) => {
    const newState = enabled === undefined ? !isEnabled.value : enabled;

    if (newState) {
      start();
    } else {
      stop();
    }
  };

  /**
   * Change refresh interval
   */
  const setRefreshInterval = (newInterval: number) => {
    const oldInterval = currentInterval.value;
    currentInterval.value = newInterval;

    if (isEnabled.value) {
      // Clear any pause timers first
      if (interactionTimer) {
        clearTimeout(interactionTimer);
        interactionTimer = null;
      }
      pausedByInteraction.value = false;

      // Restart timers with new interval
      stopAllTimers();
      startCountdown();

      if (showMessages) {
        message.success(`${labels.intervalChanged}为${newInterval}秒`);
      }
    }
  };

  /**
   * Manually trigger refresh
   */
  const triggerRefresh = async () => {
    await executeRefresh();

    // Reset countdown if auto-refresh is enabled
    if (isEnabled.value) {
      countdown.value = currentInterval.value;
    }
  };

  /**
   * Restart with current settings
   */
  const restart = () => {
    if (isEnabled.value) {
      stopAllTimers();
      startCountdown();
    }
  };

  // Pause on user interaction (optional)
  const pausedByInteraction = ref(false);

  const handleUserInteraction = () => {
    if (!pauseOnInteraction || !isEnabled.value || pausedByInteraction.value)
      return;

    // Only pause if we're not already paused and not currently refreshing
    if (!isRefreshing.value) {
      pausedByInteraction.value = true;
      stopAllTimers();

      // Clear existing timer
      if (interactionTimer) {
        clearTimeout(interactionTimer);
      }

      // Resume after 3 seconds of inactivity (reduced from 5)
      interactionTimer = setTimeout(() => {
        if (pausedByInteraction.value && isEnabled.value) {
          pausedByInteraction.value = false;
          startCountdown();
        }
      }, 3000);
    }
  };

  // Watch for interval changes to update countdown
  watch(currentInterval, (newInterval) => {
    if (isEnabled.value && countdown.value > newInterval) {
      countdown.value = newInterval;
    }
  });

  // Cleanup on unmount
  onUnmounted(() => {
    stopAllTimers();
    if (interactionTimer) {
      clearTimeout(interactionTimer);
    }
  });

  // Setup interaction listeners if enabled
  if (pauseOnInteraction && typeof window !== 'undefined') {
    ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach((event) => {
      document.addEventListener(event, handleUserInteraction, {
        passive: true,
      });
    });

    onUnmounted(() => {
      ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach((event) => {
        document.removeEventListener(event, handleUserInteraction);
      });
    });
  }

  return {
    // State
    isEnabled,
    currentInterval,
    countdown,
    isRefreshing,
    pausedByInteraction,
    intervalOptions,

    // Methods
    start,
    stop,
    toggle,
    setInterval: setRefreshInterval,
    triggerRefresh,
    restart,

    // Utilities
    executeRefresh,
  };
}
