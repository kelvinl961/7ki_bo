/**
 * ✅ PERFORMANCE: Smart Polling with Adaptive Intervals
 *
 * Features:
 * - Adaptive interval based on response time
 * - Pause when tab is hidden (saves resources)
 * - Exponential backoff on slow responses
 * - Configurable min/max intervals
 */

import { onMounted, onUnmounted, ref } from 'vue';

interface SmartPollingOptions {
  /**
   * Minimum interval (ms) - fastest polling rate
   * Default: 30 seconds
   */
  minInterval?: number;

  /**
   * Maximum interval (ms) - slowest polling rate
   * Default: 5 minutes
   */
  maxInterval?: number;

  /**
   * Initial interval (ms)
   * Default: 60 seconds
   */
  initialInterval?: number;

  /**
   * Pause when tab is hidden?
   * Default: true
   */
  pauseOnHidden?: boolean;

  /**
   * Adaptive interval based on response time?
   * If response > 1s, increase interval
   * Default: true
   */
  adaptive?: boolean;
}

/**
 * Smart polling composable
 */
export function useSmartPolling(
  callback: () => Promise<void>,
  options: SmartPollingOptions = {},
) {
  const {
    minInterval = 30_000, // 30 seconds minimum
    maxInterval = 300_000, // 5 minutes maximum
    initialInterval = 60_000, // 1 minute initial
    pauseOnHidden = true,
    adaptive = true,
  } = options;

  const currentInterval = ref(initialInterval);
  const isPaused = ref(false);
  const isRunning = ref(false);
  let intervalId: NodeJS.Timeout | null = null;
  let lastResponseTime = 0;

  /**
   * Execute callback and measure response time
   */
  const execute = async () => {
    if (isPaused.value || isRunning.value) return;

    isRunning.value = true;
    const startTime = Date.now();

    try {
      await callback();
      lastResponseTime = Date.now() - startTime;

      // ✅ Adaptive: If response > 1s, increase interval
      if (adaptive && lastResponseTime > 1000) {
        // Increase interval by 50% (capped at maxInterval)
        currentInterval.value = Math.min(
          Math.floor(currentInterval.value * 1.5),
          maxInterval,
        );
        console.log(
          `⏱️ Response took ${lastResponseTime}ms, increasing interval to ${currentInterval.value}ms`,
        );
      } else if (
        adaptive &&
        lastResponseTime < 500 &&
        currentInterval.value > minInterval
      ) {
        // If response < 500ms, decrease interval (capped at minInterval)
        currentInterval.value = Math.max(
          Math.floor(currentInterval.value * 0.8),
          minInterval,
        );
        console.log(
          `⚡ Response took ${lastResponseTime}ms, decreasing interval to ${currentInterval.value}ms`,
        );
      }
    } catch (error) {
      console.error('Polling error:', error);
      // On error, increase interval (exponential backoff)
      currentInterval.value = Math.min(
        Math.floor(currentInterval.value * 2),
        maxInterval,
      );
    } finally {
      isRunning.value = false;

      // Schedule next execution
      if (!isPaused.value) {
        scheduleNext();
      }
    }
  };

  /**
   * Schedule next execution
   */
  const scheduleNext = () => {
    if (intervalId) {
      clearTimeout(intervalId);
    }

    intervalId = setTimeout(() => {
      execute();
    }, currentInterval.value);
  };

  /**
   * Start polling
   */
  const start = () => {
    if (isPaused.value) {
      isPaused.value = false;
      execute();
    }
  };

  /**
   * Pause polling
   */
  const pause = () => {
    isPaused.value = true;
    if (intervalId) {
      clearTimeout(intervalId);
      intervalId = null;
    }
  };

  /**
   * Stop polling
   */
  const stop = () => {
    pause();
    isRunning.value = false;
  };

  /**
   * Reset interval to initial value
   */
  const reset = () => {
    currentInterval.value = initialInterval;
  };

  /**
   * Handle visibility change
   */
  const handleVisibilityChange = () => {
    if (pauseOnHidden) {
      if (document.hidden) {
        pause();
        console.log('⏸️ Tab hidden, pausing polling');
      } else {
        start();
        console.log('▶️ Tab visible, resuming polling');
      }
    }
  };

  // Setup visibility listener
  if (pauseOnHidden && typeof document !== 'undefined') {
    onMounted(() => {
      document.addEventListener('visibilitychange', handleVisibilityChange);
      // Start polling
      execute();
    });

    onUnmounted(() => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      stop();
    });
  } else {
    onMounted(() => {
      execute();
    });

    onUnmounted(() => {
      stop();
    });
  }

  return {
    start,
    pause,
    stop,
    reset,
    currentInterval,
    isPaused,
    isRunning,
    lastResponseTime,
  };
}
