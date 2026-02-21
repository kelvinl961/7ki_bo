/**
 * 🕐 Idle Timeout Composable
 *
 * Monitors user activity and logs out users after a period of inactivity.
 * This helps maintain security by ensuring inactive sessions are terminated.
 */

import { onMounted, onUnmounted, ref } from 'vue';

import { useAuthStore } from '#/store';

export interface UseIdleTimeoutOptions {
  /**
   * Idle timeout duration in milliseconds
   * @default 14400000 (4 hours)
   */
  timeout?: number;

  /**
   * Events to listen for user activity
   * @default ['mousedown', 'keydown', 'scroll', 'touchstart', 'click']
   */
  events?: string[];

  /**
   * Whether to show a warning before logout
   * @default true
   */
  showWarning?: boolean;

  /**
   * Warning duration in milliseconds (shown before actual logout)
   * @default 300000 (5 minutes)
   */
  warningDuration?: number;

  /**
   * Callback when user is about to be logged out (warning phase)
   */
  onWarning?: () => void;

  /**
   * Callback when user is logged out due to inactivity
   */
  onTimeout?: () => void;
}

/**
 * Hook to handle user idle timeout
 */
export function useIdleTimeout(options: UseIdleTimeoutOptions = {}) {
  const {
    timeout = 4 * 60 * 60 * 1000, // 4 hours in milliseconds
    events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'],
    showWarning = true,
    warningDuration = 5 * 60 * 1000, // 5 minutes
    onWarning,
    onTimeout,
  } = options;

  const authStore = useAuthStore();

  const isWarning = ref(false);
  const lastActivityTime = ref(Date.now());

  let idleTimer: null | ReturnType<typeof setTimeout> = null;
  let warningTimer: null | ReturnType<typeof setTimeout> = null;

  /**
   * Clear all timers
   */
  const clearTimers = () => {
    if (idleTimer) {
      clearTimeout(idleTimer);
      idleTimer = null;
    }
    if (warningTimer) {
      clearTimeout(warningTimer);
      warningTimer = null;
    }
  };

  /**
   * Handle user logout due to inactivity
   */
  const handleTimeout = async () => {
    console.log('⏰ User idle timeout - logging out');

    try {
      if (onTimeout) {
        onTimeout();
      }

      // Logout user
      await authStore.logout();
    } catch (error) {
      console.error('Failed to logout on idle timeout:', error);
    }
  };

  /**
   * Show warning to user before logout
   */
  const handleWarning = () => {
    isWarning.value = true;
    console.log('⚠️ User idle warning - will logout soon');

    if (onWarning) {
      onWarning();
    }

    // Set final timeout for actual logout
    idleTimer = setTimeout(handleTimeout, warningDuration);
  };

  /**
   * Reset idle timers on user activity
   */
  const resetTimer = () => {
    const now = Date.now();
    lastActivityTime.value = now;

    // Clear existing timers
    clearTimers();

    // Reset warning state
    if (isWarning.value) {
      isWarning.value = false;
      console.log('✅ User activity detected - warning cleared');
    }

    // Set warning timer if enabled
    if (showWarning) {
      warningTimer = setTimeout(handleWarning, timeout - warningDuration);
    } else {
      // Set direct timeout without warning
      idleTimer = setTimeout(handleTimeout, timeout);
    }
  };

  /**
   * Handle user activity
   */
  const handleActivity = () => {
    resetTimer();
  };

  /**
   * Start monitoring user activity
   */
  const start = () => {
    if (typeof window === 'undefined') {
      return;
    }

    console.log(
      `🕐 Starting idle timeout monitor (${timeout / 1000 / 60} minutes)`,
    );

    // Add event listeners for user activity
    events.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Start initial timer
    resetTimer();
  };

  /**
   * Stop monitoring user activity
   */
  const stop = () => {
    if (typeof window === 'undefined') {
      return;
    }

    console.log('🛑 Stopping idle timeout monitor');

    // Remove event listeners
    events.forEach((event) => {
      window.removeEventListener(event, handleActivity);
    });

    // Clear timers
    clearTimers();
  };

  /**
   * Manually reset the idle timer (useful for programmatic activity)
   */
  const reset = () => {
    resetTimer();
  };

  // Auto-start on mount
  onMounted(() => {
    start();
  });

  // Auto-cleanup on unmount
  onUnmounted(() => {
    stop();
  });

  return {
    isWarning,
    lastActivityTime,
    reset,
    start,
    stop,
  };
}
