<script lang="ts" setup>
import type { NotificationItem } from '@vben/layouts';

import { computed, ref, watch, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

import { AuthenticationLoginExpiredModal } from '@vben/common-ui';
import { useWatermark } from '@vben/hooks';
import { Bell } from '@vben/icons';
import { BasicLayout, LockScreen, UserDropdown } from '@vben/layouts';
import { preferences } from '@vben/preferences';
import { $t } from '@vben/locales';
import { useAccessStore, useUserStore } from '@vben/stores';
import { useAuthStore } from '#/store';
import LoginForm from '#/views/_core/authentication/login.vue';
import AdminNotificationService from '../services/adminNotificationService';
import { requestClient } from '#/api/request';
import { useIdleTimeout } from '#/composables/useIdleTimeout';
import { useDialog } from 'naive-ui';
import TimezoneDisplay from '#/components/timezone/TimezoneDisplay.vue';
import { useSmartPolling } from '#/composables/useSmartPolling';

// Real-time notifications state
// Real-time notifications state
const notifications = ref<NotificationItem[]>([]);
const notificationCount = ref(0);
const showNotificationPopup = ref(false);
let eventSource: EventSource | null = null;

// Notification categories with counts
const notificationCategories = ref({
  onlineRechargeError: 0,
  transferPendingReview: 0,
  orderPendingReview: 0,
  withdrawalPendingPayment: 0,
  gameQuotaLost: 0,
  riskControlPendingReview: 0,
  activityDistributionReview: 0,
  activityApplicationReview: 0,
  loanApplicationReview: 0,
  prizeDistributionMonitoringReview: 0,
});

// Calculate total notification count
const totalNotificationCount = computed(() => {
  return Object.values(notificationCategories.value).reduce(
    (sum, count) => sum + count,
    0,
  );
});

// Previous notification count for detecting new notifications
const previousNotificationCount = ref(0);

// Audio context for notification sound
let audioContext: AudioContext | null = null;

// Initialize notification sound using Web Audio API
function initNotificationSound() {
  try {
    // Create audio context (will be used when needed)
    audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
    console.log('🔊 Audio context initialized for notifications');
  } catch (error) {
    console.error('Failed to initialize audio context:', error);
  }
}

// Play notification sound using Web Audio API (generates a pleasant bell tone)
function playNotificationSound() {
  try {
    if (!audioContext) {
      console.warn('Audio context not initialized');
      return;
    }

    // Create oscillator for notification sound
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    // Connect nodes
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Configure pleasant notification sound (bell-like tone)
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime); // Higher pitch
    oscillator.frequency.exponentialRampToValueAtTime(
      600,
      audioContext.currentTime + 0.1,
    );

    // Configure volume envelope (fade in/out)
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01); // Quick attack
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 0.5,
    ); // Decay

    // Play sound
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);

    console.log('🔔 Notification sound played');
  } catch (error) {
    console.error('Error playing notification sound:', error);
  }
}

// Check for new notifications and play sound
function checkForNewNotifications(newCount: number) {
  // Only play sound if count increased (new notifications)
  if (
    newCount > previousNotificationCount.value &&
    previousNotificationCount.value > 0
  ) {
    const difference = newCount - previousNotificationCount.value;
    console.log(`🔔 New notifications detected: +${difference}`);
    playNotificationSound();

    // Optional: Show browser notification if permission granted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('新通知', {
        body: `您有 ${difference} 个新的待处理通知`,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'admin-notification',
      });
    }
  }
  previousNotificationCount.value = newCount;
}

// Online users state
const onlineUsersCount = ref(0);
const showOnlineUsersDropdown = ref(false);
const onlineUsersDetails = ref({
  guestOnline: 0,
  suspectedBots: 2,
  lobbyOnline: 0,
  selfOperatedOnline: 0,
  thirdPartyOnline: 0,
});
const onlineUsersButtonRef = ref<HTMLElement | null>(null);

// Calculate online users dropdown position
const dropdownStyle = computed(() => {
  if (!onlineUsersButtonRef.value) {
    return { top: '0px', left: '0px' };
  }

  const rect = onlineUsersButtonRef.value.getBoundingClientRect();
  return {
    top: `${rect.bottom + 8}px`,
    left: `${rect.right - 200}px`, // Align right edge
  };
});

// Notification button ref and position
const notificationButtonRef = ref<HTMLElement | null>(null);

// Router instance for navigation
const router = useRouter();

// Calculate notification dropdown position
const notificationDropdownStyle = computed(() => {
  if (!notificationButtonRef.value) {
    return { top: '0px', left: '0px' };
  }

  const rect = notificationButtonRef.value.getBoundingClientRect();
  return {
    top: `${rect.bottom + 8}px`,
    left: `${rect.right - 300}px`, // Align right edge (300px width)
  };
});

const userStore = useUserStore();
const authStore = useAuthStore();
const accessStore = useAccessStore();
const { destroyWatermark, updateWatermark } = useWatermark();
const dialog = useDialog();

// 🕐 Setup 4-hour idle timeout with 5-minute warning
const { isWarning: isIdleWarning } = useIdleTimeout({
  timeout: 4 * 60 * 60 * 1000, // 4 hours
  showWarning: true,
  warningDuration: 5 * 60 * 1000, // 5 minutes warning before logout
  onWarning: () => {
    // Show warning dialog
    dialog.warning({
      title: '⚠️ 非活动会话警告',
      content:
        '您已经 3 小时 55 分钟没有活动。如果未检测到任何活动，您将在 5 分钟后自动退出登录。',
      positiveText: '我还在这里',
      onPositiveClick: () => {
        console.log('✅ 用户确认了空闲警告');
      },
    });
  },
  onTimeout: () => {
    console.log('⏰ User logged out due to 4-hour inactivity');
  },
});

// Computed properties for notifications
const unreadCount = computed(
  () => notifications.value.filter((item) => !item.isRead).length,
);

const menus = computed(() => [
  // Removed unwanted menu items (文档, GitHub, 问题帮助)
]);

const avatar = computed(() => {
  return userStore.userInfo?.avatar ?? preferences.app.defaultAvatar;
});

async function handleLogout() {
  await authStore.logout(false);
}

function handleNoticeClear() {
  notifications.value = [];
  notificationCount.value = 0;
}

function handleMakeAll() {
  notifications.value.forEach((item) => (item.isRead = true));
  notificationCount.value = 0;
}

async function handleNotificationClick(category: string) {
  console.log('🔔 Clicked notification category:', category);

  // Close the dropdown
  showNotificationPopup.value = false;

  try {
    let targetRoute = '';

    switch (category) {
      case 'onlineRechargeError':
        // 在线充值错误 -> Go to online recharge page with error filter
        targetRoute = '/finance/online-recharge';
        break;
      case 'transferPendingReview':
        // 转账待审核 -> Go to finance management (placeholder)
        targetRoute = '/finance/recharge-management';
        break;
      case 'orderPendingReview':
        // 补单待审核 -> Go to recharge management for manual review
        targetRoute = '/finance/recharge-management';
        break;
      case 'withdrawalPendingPayment':
        // 提现待出款 -> Go to withdrawal management (finance withdrawal tab)
        targetRoute = '/finance/withdraw-management';
        break;
      case 'gameQuotaLost':
        // 游戏额度丢失 -> Go to game management
        targetRoute = '/game-management';
        break;
      case 'riskControlPendingReview':
        // 待风控审核 -> Go to withdrawal management (risk review tab)
        targetRoute = '/finance/withdraw-management';
        break;
      case 'activityDistributionReview':
        // 活动派发审核 -> Placeholder
        targetRoute = '/finance/recharge-management';
        break;
      case 'activityApplicationReview':
        // 活动申请审核 -> Placeholder
        targetRoute = '/finance/recharge-management';
        break;
      case 'loanApplicationReview':
        // 借款申请审核 -> Placeholder
        targetRoute = '/finance/recharge-management';
        break;
      case 'prizeDistributionMonitoringReview':
        // 派奖监控审核 -> Placeholder
        targetRoute = '/finance/recharge-management';
        break;
      default:
        console.log('⚠️ Unknown category:', category);
        return;
    }

    // Navigate to the target page
    console.log('📍 Navigating to:', targetRoute);
    await router.push(targetRoute);

    // Refresh notification counts after navigation to update the UI
    setTimeout(() => {
      fetchNotificationCounts();
    }, 1000);
  } catch (error) {
    console.error('❌ Error navigating:', error);
  }
}

function handleViewAll() {
  showNotificationPopup.value = false;
  // Navigate to notifications page if needed
}

// Close notification popup when clicking outside
function handleClickOutside(event: Event) {
  const target = event.target as Element;
  const popup = document.querySelector('.notification-popup');
  const button = document.querySelector('.bell-button');

  if (popup && button && !popup.contains(target) && !button.contains(target)) {
    showNotificationPopup.value = false;
  }
}

// Real-time notification system - DISABLED for admin panel
function setupNotificationStream() {
  // 🚫 DISABLED: Admin doesn't need real-time notifications for manual operations
  console.log(
    '📡 Admin notification stream disabled - manual refresh preferred',
  );
  return;

  /* DISABLED SSE CODE - Can be re-enabled if needed
  if (eventSource) {
    eventSource.close();
  }

  try {
    // Get token from access store or localStorage fallback
    const token = accessStore.accessToken || 
                  localStorage.getItem('token') || 
                  localStorage.getItem('accessToken') || 
                  localStorage.getItem('authToken');
    
    if (!token) {
      console.warn('📡 No authentication token found, skipping notification stream setup');
      return;
    }
    
    console.log('📡 Setting up notification stream with token:', token ? 'present' : 'missing');
    eventSource = new EventSource(`/api/admin/deposit-updates/stream?token=${encodeURIComponent(token)}`);
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Skip heartbeat and connection messages
        if (data.type === 'heartbeat' || data.type === 'connection_established') {
          return;
        }
        
        console.log('📡 Notification received:', data);
        
        // Filter notifications based on requirements
        // Only show: deposit_created, withdrawal_created
        // Don't show: deposit_force_processed, deposit_force_cancelled
        const allowedTypes = ['deposit_created', 'withdrawal_created'];
        
        if (allowedTypes.includes(data.type)) {
          addNotification(data);
        }
      } catch (error) {
        console.error('Error parsing notification:', error);
      }
    };
    
    eventSource.onerror = (error) => {
      console.warn('Notification stream error:', error);
      // Reconnect after 5 seconds
      setTimeout(() => {
        setupNotificationStream();
      }, 5000);
    };
    
    console.log('📡 Notification stream connected');
  } catch (error) {
    console.error('Failed to setup notification stream:', error);
  }
  */
}

// Notification functions removed - system is disabled for admin panel

function cleanupNotificationStream() {
  if (eventSource) {
    eventSource.close();
    eventSource = null;
    console.log('📡 Notification stream disconnected');
  }
}

// Fetch online users count
async function fetchOnlineUsersCount() {
  try {
    console.log('🔄 Fetching online users stats from API...');
    const result = await requestClient.get('/online-users/stats');
    console.log('📦 API Response data:', result);

    if (result && result.totalOnline !== undefined) {
      onlineUsersCount.value = result.totalOnline;
      onlineUsersDetails.value = {
        guestOnline: result.guestOnline,
        suspectedBots: result.suspectedBots,
        lobbyOnline: result.lobbyOnline,
        selfOperatedOnline: result.selfOperatedOnline,
        thirdPartyOnline: result.thirdPartyOnline,
      };

      console.log('✅ Online users stats updated:', {
        total: onlineUsersCount.value,
        details: onlineUsersDetails.value,
      });
    } else {
      throw new Error('Invalid response format');
    }
  } catch (error) {
    console.error(
      '❌ FAILED to fetch online users - using fallback mock data:',
      error,
    );
    // Fallback to 0 initially to show API isn't working
    onlineUsersCount.value = 0;
    onlineUsersDetails.value = {
      guestOnline: 0,
      suspectedBots: 0,
      lobbyOnline: 0,
      selfOperatedOnline: 0,
      thirdPartyOnline: 0,
    };
  }
}

// Online users hover state and timing
let onlineUsersHoverTimeout: NodeJS.Timeout | null = null;
const ONLINE_USERS_HOVER_DELAY = 200; // 200ms delay before closing

function handleOnlineUsersMouseEnter() {
  // Clear any pending close timeout
  if (onlineUsersHoverTimeout) {
    clearTimeout(onlineUsersHoverTimeout);
    onlineUsersHoverTimeout = null;
  }
  showOnlineUsersDropdown.value = true;
}

function handleOnlineUsersMouseLeave() {
  // Set a delay before closing to allow moving cursor to dropdown
  onlineUsersHoverTimeout = setTimeout(() => {
    showOnlineUsersDropdown.value = false;
    onlineUsersHoverTimeout = null;
  }, ONLINE_USERS_HOVER_DELAY);
}

// Notification hover state and timing
let notificationHoverTimeout: NodeJS.Timeout | null = null;
const NOTIFICATION_HOVER_DELAY = 200; // 200ms delay before closing

function handleNotificationMouseEnter() {
  // Clear any pending close timeout
  if (notificationHoverTimeout) {
    clearTimeout(notificationHoverTimeout);
    notificationHoverTimeout = null;
  }
  showNotificationPopup.value = true;
}

function handleNotificationMouseLeave() {
  // Set a delay before closing to allow moving cursor to dropdown
  notificationHoverTimeout = setTimeout(() => {
    showNotificationPopup.value = false;
    notificationHoverTimeout = null;
  }, NOTIFICATION_HOVER_DELAY);
}

// Fetch notification counts from backend
async function fetchNotificationCounts() {
  try {
    console.log('🔄 Fetching notification counts from API...');
    const result = await requestClient.get('/notifications/counts');
    console.log('📦 Notification API Response data:', result);

    if (result && result.onlineRechargeError !== undefined) {
      notificationCategories.value = {
        onlineRechargeError: result.onlineRechargeError || 0,
        transferPendingReview: result.transferPendingReview || 0,
        orderPendingReview: result.orderPendingReview || 0,
        withdrawalPendingPayment: result.withdrawalPendingPayment || 0,
        gameQuotaLost: result.gameQuotaLost || 0,
        riskControlPendingReview: result.riskControlPendingReview || 0,
        activityDistributionReview: result.activityDistributionReview || 0,
        activityApplicationReview: result.activityApplicationReview || 0,
        loanApplicationReview: result.loanApplicationReview || 0,
        prizeDistributionMonitoringReview:
          result.prizeDistributionMonitoringReview || 0,
      };

      console.log(
        '✅ Notification counts updated:',
        notificationCategories.value,
      );

      // Check for new notifications and play sound if needed
      const newTotalCount = Object.values(notificationCategories.value).reduce(
        (sum, count) => sum + count,
        0,
      );
      checkForNewNotifications(newTotalCount);
    } else {
      throw new Error('Invalid notification response format');
    }
  } catch (error) {
    console.error(
      '❌ FAILED to fetch notification counts - using fallback data:',
      error,
    );
    // Keep current values (all 0) as fallback
  }
}

// Store interval IDs for cleanup (legacy, now using useSmartPolling)
let onlineUsersInterval: NodeJS.Timeout | null = null;
let notificationInterval: NodeJS.Timeout | null = null;

// ✅ PERFORMANCE: Smart polling with adaptive intervals
// - Starts at 60 seconds (less frequent, was 30s)
// - Increases to 2-5 minutes if response > 1s
// - Pauses when tab is hidden (saves resources)
// - Resumes when tab becomes visible
const { start: startOnlineUsersPolling, stop: stopOnlineUsersPolling } =
  useSmartPolling(fetchOnlineUsersCount, {
    initialInterval: 60000, // Start at 60 seconds (was 30s)
    minInterval: 30000, // Minimum 30 seconds
    maxInterval: 300000, // Maximum 5 minutes (if slow)
    pauseOnHidden: true, // Pause when tab hidden
    adaptive: true, // Adjust based on response time
  });

const { start: startNotificationPolling, stop: stopNotificationPolling } =
  useSmartPolling(fetchNotificationCounts, {
    initialInterval: 60000, // Start at 60 seconds (was 30s)
    minInterval: 30000, // Minimum 30 seconds
    maxInterval: 300000, // Maximum 5 minutes (if slow)
    pauseOnHidden: true, // Pause when tab hidden
    adaptive: true, // Adjust based on response time
  });

// Initialize notification system
onMounted(async () => {
  console.log('🎯🎯🎯 [basic.vue] onMounted START');

  // Initialize notification service
  console.log(
    '🎯 [basic.vue] About to call AdminNotificationService.initialize()...',
  );
  try {
    await AdminNotificationService.initialize();
    console.log(
      '✅ [basic.vue] AdminNotificationService.initialize() completed',
    );
  } catch (error) {
    console.error(
      '❌ [basic.vue] AdminNotificationService.initialize() failed:',
      error,
    );
  }

  // Initialize notification sound
  initNotificationSound();

  // Request browser notification permission
  if ('Notification' in window && Notification.permission === 'default') {
    try {
      const permission = await Notification.requestPermission();
      console.log('📱 Notification permission:', permission);
    } catch (error) {
      console.error('Failed to request notification permission:', error);
    }
  }

  // Setup real-time notification stream
  setupNotificationStream();

  // Fetch initial data (useSmartPolling will handle periodic updates)
  await fetchOnlineUsersCount();
  await fetchNotificationCounts();

  // Note: useSmartPolling automatically starts polling on mount
  // No need to manually start - it's already running

  // Retry setup if no token initially (user might not be logged in yet)
  if (!accessStore.accessToken) {
    const retrySetup = () => {
      if (accessStore.accessToken) {
        console.log(
          '📡 Token became available, setting up notification stream',
        );
        setupNotificationStream();
      } else {
        setTimeout(retrySetup, 2000); // Retry every 2 seconds
      }
    };
    setTimeout(retrySetup, 1000); // Initial retry after 1 second
  }

  // Add click outside listener
  document.addEventListener('click', handleClickOutside);
});

// Cleanup on unmount - register BEFORE any await statements
onUnmounted(() => {
  cleanupNotificationStream();
  document.removeEventListener('click', handleClickOutside);

  // ✅ Cleanup smart polling
  if (typeof stopOnlineUsersPolling === 'function') stopOnlineUsersPolling();
  if (typeof stopNotificationPolling === 'function') stopNotificationPolling();

  // Legacy cleanup (for compatibility)
  if (onlineUsersInterval) {
    clearInterval(onlineUsersInterval);
    onlineUsersInterval = null;
  }
  if (notificationInterval) {
    clearInterval(notificationInterval);
    notificationInterval = null;
  }

  // Clear hover timeouts
  if (notificationHoverTimeout) {
    clearTimeout(notificationHoverTimeout);
    notificationHoverTimeout = null;
  }
  if (onlineUsersHoverTimeout) {
    clearTimeout(onlineUsersHoverTimeout);
    onlineUsersHoverTimeout = null;
  }
});

watch(
  () => preferences.app.watermark,
  async (enable) => {
    if (enable) {
      await updateWatermark({
        content: `${userStore.userInfo?.username} - ${userStore.userInfo?.realName}`,
      });
    } else {
      destroyWatermark();
    }
  },
  {
    immediate: true,
  },
);
</script>

<template>
  <BasicLayout @clear-preferences-and-logout="handleLogout">
    <template #user-dropdown>
      <UserDropdown
        :avatar
        :menus
        :text="userStore.userInfo?.realName"
        :description="
          userStore.userInfo?.email ||
          userStore.userInfo?.username ||
          userStore.userInfo?.realName ||
          'User'
        "
        tag-text="Pro"
        @logout="handleLogout"
      />
    </template>
    <template #header-online-users>
      <div class="flex-center mr-2 h-full gap-2">
        <!-- Timezone Display -->
        <TimezoneDisplay />

        <!-- Online Users Badge -->
        <div
          ref="onlineUsersButtonRef"
          class="relative flex cursor-pointer items-center gap-2 rounded-full border border-blue-200 bg-blue-100 px-3 py-1 transition-colors hover:bg-blue-200 dark:border-blue-700 dark:bg-blue-900/30 dark:hover:bg-blue-900/50"
          @mouseenter="handleOnlineUsersMouseEnter"
          @mouseleave="handleOnlineUsersMouseLeave"
        >
          <div class="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
          <span class="text-sm font-medium text-blue-800 dark:text-blue-200">{{
            $t('page.header.online')
          }}</span>
          <span class="text-sm font-bold text-blue-900 dark:text-blue-100">{{
            onlineUsersCount
          }}</span>
        </div>

        <!-- Online Users Dropdown - using Teleport and fixed positioning to break out of stacking context -->
        <Teleport to="body">
          <div
            v-if="showOnlineUsersDropdown"
            class="fixed w-[200px] rounded-lg border border-gray-200 bg-white p-3 shadow-xl dark:border-gray-700 dark:bg-gray-800"
            :style="dropdownStyle"
            style="z-index: 99999"
            @mouseenter="handleOnlineUsersMouseEnter"
            @mouseleave="handleOnlineUsersMouseLeave"
          >
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span
                  class="text-gray-600 text-gray-700 dark:text-gray-300 dark:text-gray-400"
                  >{{ $t('page.header.guestOnline') }}:</span
                >
                <span
                  class="font-medium text-gray-700 text-gray-900 dark:text-gray-100 dark:text-gray-300"
                  >{{ onlineUsersDetails.guestOnline }}</span
                >
              </div>
              <div class="flex items-center justify-between">
                <span
                  class="text-gray-600 text-gray-700 dark:text-gray-300 dark:text-gray-400"
                  >{{ $t('page.header.suspectedBots') }}:</span
                >
                <span
                  class="font-medium text-gray-700 text-gray-900 dark:text-gray-100 dark:text-gray-300"
                  >{{ onlineUsersDetails.suspectedBots }}</span
                >
              </div>
              <div class="flex items-center justify-between">
                <span
                  class="text-gray-600 text-gray-700 dark:text-gray-300 dark:text-gray-400"
                  >{{ $t('page.header.lobbyOnline') }}:</span
                >
                <span
                  class="font-medium text-gray-700 text-gray-900 dark:text-gray-100 dark:text-gray-300"
                  >{{ onlineUsersDetails.lobbyOnline }}</span
                >
              </div>
              <div class="flex items-center justify-between">
                <span
                  class="text-gray-600 text-gray-700 dark:text-gray-300 dark:text-gray-400"
                  >{{ $t('page.header.selfOperatedOnline') }}:</span
                >
                <span
                  class="font-medium text-gray-700 text-gray-900 dark:text-gray-100 dark:text-gray-300"
                  >{{ onlineUsersDetails.selfOperatedOnline }}</span
                >
              </div>
              <div class="flex items-center justify-between">
                <span
                  class="text-gray-600 text-gray-700 dark:text-gray-300 dark:text-gray-400"
                  >{{ $t('page.header.thirdPartyOnline') }}:</span
                >
                <span
                  class="font-medium text-gray-700 text-gray-900 dark:text-gray-100 dark:text-gray-300"
                  >{{ onlineUsersDetails.thirdPartyOnline }}</span
                >
              </div>
            </div>
          </div>
        </Teleport>
      </div>
    </template>
    <template #notification>
      <div class="flex-center mr-2 h-full">
        <button
          ref="notificationButtonRef"
          class="bell-button text-foreground relative rounded-full p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
          @mouseenter="handleNotificationMouseEnter"
          @mouseleave="handleNotificationMouseLeave"
        >
          <!-- Show count badge instead of just dot -->
          <span
            v-if="totalNotificationCount > 0"
            class="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-xs font-medium text-white"
          >
            {{ totalNotificationCount > 99 ? '99+' : totalNotificationCount }}
          </span>
          <Bell class="size-4" />
        </button>

        <!-- Custom notification popup - using Teleport and fixed positioning -->
        <Teleport to="body">
          <div
            v-if="showNotificationPopup"
            class="notification-popup fixed w-[300px] rounded-lg border border-gray-200 bg-white text-gray-900 shadow-xl dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            :style="notificationDropdownStyle"
            style="z-index: 99999"
            @mouseenter="handleNotificationMouseEnter"
            @mouseleave="handleNotificationMouseLeave"
          >
            <!-- Header -->
            <div
              class="border-b border-gray-200 py-3 text-center dark:border-gray-700"
            >
              <div class="text-lg font-medium text-gray-900 dark:text-gray-100">
                消息
              </div>
            </div>

            <!-- Notification Categories -->
            <div class="py-2">
              <div
                class="cursor-pointer px-4 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                @click="handleNotificationClick('onlineRechargeError')"
              >
                🔊 {{ $t('page.header.onlineRechargeError') }}:
                {{ notificationCategories.onlineRechargeError }}
              </div>
              <div
                class="cursor-pointer px-4 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                @click="handleNotificationClick('transferPendingReview')"
              >
                🔊 转账待审核:
                {{ notificationCategories.transferPendingReview }}
              </div>
              <div
                class="cursor-pointer px-4 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                @click="handleNotificationClick('orderPendingReview')"
              >
                🔊 补单待审核: {{ notificationCategories.orderPendingReview }}
              </div>
              <div
                class="cursor-pointer px-4 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                @click="handleNotificationClick('withdrawalPendingPayment')"
              >
                🔊 提现待出款:
                {{ notificationCategories.withdrawalPendingPayment }}
              </div>
              <div
                class="cursor-pointer px-4 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                @click="handleNotificationClick('gameQuotaLost')"
              >
                🔊 游戏额度丢失: {{ notificationCategories.gameQuotaLost }}
              </div>
              <div
                class="cursor-pointer px-4 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                @click="handleNotificationClick('riskControlPendingReview')"
              >
                🔊 待风控审核:
                {{ notificationCategories.riskControlPendingReview }}
              </div>
              <div
                class="cursor-pointer px-4 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                @click="handleNotificationClick('activityDistributionReview')"
              >
                🔊 活动派发审核:
                {{ notificationCategories.activityDistributionReview }}
              </div>
              <div
                class="cursor-pointer px-4 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                @click="handleNotificationClick('activityApplicationReview')"
              >
                🔊 活动申请审核:
                {{ notificationCategories.activityApplicationReview }}
              </div>
              <div
                class="cursor-pointer px-4 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                @click="handleNotificationClick('loanApplicationReview')"
              >
                🔊 借款申请审核:
                {{ notificationCategories.loanApplicationReview }}
              </div>
              <div
                class="cursor-pointer px-4 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                @click="
                  handleNotificationClick('prizeDistributionMonitoringReview')
                "
              >
                🔊 派奖监控审核:
                {{ notificationCategories.prizeDistributionMonitoringReview }}
              </div>
            </div>
          </div>
        </Teleport>
      </div>
    </template>
    <template #extra>
      <AuthenticationLoginExpiredModal
        v-model:open="accessStore.loginExpired"
        :avatar
      >
        <LoginForm />
      </AuthenticationLoginExpiredModal>
    </template>
    <template #lock-screen>
      <LockScreen :avatar @to-login="handleLogout" />
    </template>
  </BasicLayout>
</template>
