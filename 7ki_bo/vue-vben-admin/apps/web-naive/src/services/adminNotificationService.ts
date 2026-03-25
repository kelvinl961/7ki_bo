import { requestClient } from '#/api/request';

import { notification } from '../adapter/naive';

export interface AdminNotification {
  id?: number;
  type:
    | 'deposit_created'
    | 'deposit_force_cancelled'
    | 'deposit_force_processed'
    | 'system_alert'
    | 'withdrawal_created';
  title: string;
  content: string;
  orderId?: string;
  merchantOrderNo?: string;
  amount?: number;
  currency?: string;
  userId?: number;
  priority: 'high' | 'low' | 'medium' | 'urgent';
  sound?: boolean;
  timestamp: string;
  metadata?: any;
}

export class AdminNotificationService {
  private static notificationAudio: HTMLAudioElement | null = null;
  private static soundEnabled = true;

  /**
   * Check for pending withdrawals and play sound
   * 🎯 This checks for ANY pending withdrawals (old or new) and plays sound on login
   */
  static async checkPendingWithdrawals(): Promise<void> {
    console.log(
      '🔍 [AdminNotificationService] checkPendingWithdrawals() called',
    );
    console.log(
      '🔍 [AdminNotificationService] requestClient available:',
      typeof requestClient,
      requestClient,
    );

    try {
      // ✅ Safety check: Ensure requestClient is available
      if (!requestClient || typeof requestClient.get !== 'function') {
        console.error(
          '❌ [AdminNotificationService] requestClient is not available - skipping',
        );
        return;
      }

      // Ensure audio context is initialized first
      this.initAudioContext();
      console.log('🔊 [AdminNotificationService] Audio context initialized');

      // ✅ FIX: Use authenticated requestClient instead of raw fetch()
      console.log(
        '📡 [AdminNotificationService] Fetching /notifications/counts...',
      );
      const response = await requestClient.get('/notifications/counts');
      console.log(
        '📦 [AdminNotificationService] Got notification counts response:',
        response,
      );

      // ✅ Response interceptor unwraps data, so response IS the data object
      if (response) {
        const pendingCount =
          (response.withdrawalPendingPayment || 0) +
          (response.riskControlPendingReview || 0);

        console.log(
          `📊 [AdminNotificationService] Pending count: ${pendingCount}`,
        );

        if (pendingCount > 0) {
          console.log(
            `🔔 Found ${pendingCount} pending withdrawals on login (old + new)`,
          );
          console.log(
            `   - 财务待出款: ${response.withdrawalPendingPayment || 0}`,
          );
          console.log(
            `   - 风控待审核: ${response.riskControlPendingReview || 0}`,
          );

          // Play notification sound for ANY pending withdrawal
          console.log(
            '🎵 [AdminNotificationService] Playing notification sound...',
          );
          await this.playNotificationSound('medium');
          console.log(
            '✅ [AdminNotificationService] Sound played successfully',
          );
        } else {
          console.log('✅ No pending withdrawals on login - no sound played');
        }
      } else {
        console.warn('⚠️ [AdminNotificationService] No data in response');
      }
    } catch (error: any) {
      console.error(
        '❌ [AdminNotificationService] Failed to check pending withdrawals:',
      );
      console.error('  Error type:', typeof error);
      console.error('  Error object:', error);
      console.error('  Error message:', error?.message || 'No message');
      console.error('  Error stack:', error?.stack || 'No stack');
      if (error?.response) {
        console.error('  API Response:', error.response);
      }
    }
  }

  /**
   * Handle deposit created notification
   */
  static handleDepositCreated(data: AdminNotification): void {
    const enhancedData = {
      ...data,
      title: '💰 新充值订单',
      content: `${data.content}\n点击查看详情`,
    };

    this.showNotification(enhancedData);
  }

  /**
   * Handle force cancel notification
   */
  static handleForceCancelDeposit(data: AdminNotification): void {
    const enhancedData = {
      ...data,
      title: '❌ 订单已取消',
      content: `${data.content}`,
    };

    this.showNotification(enhancedData);
  }

  /**
   * Handle force deposit processed notification
   */
  static handleForceDepositProcessed(data: AdminNotification): void {
    const enhancedData = {
      ...data,
      title: '✅ 强制入款成功',
      content: `${data.content}\n用户余额已更新`,
    };

    this.showNotification(enhancedData);
  }

  /**
   * Initialize notification service
   */
  static async initialize(): Promise<void> {
    console.log('='.repeat(80));
    console.log(
      '🚀🚀🚀 [AdminNotificationService] initialize() CALLED - START',
    );
    console.log('='.repeat(80));

    // Restore sound preference
    this.soundEnabled = this.isSoundEnabled();
    console.log(
      `🔊 [AdminNotificationService] Sound enabled: ${this.soundEnabled}`,
    );

    // Request notification permission
    await this.requestNotificationPermission();

    // 🎯 IMPORTANT: Initialize audio context immediately (browsers allow this now)
    if (typeof window !== 'undefined') {
      this.initAudioContext();
      console.log('🔊 [AdminNotificationService] Audio context initialized');

      // Also re-init on user interaction for older browsers
      const initAudio = () => {
        this.initAudioContext();
        document.removeEventListener('click', initAudio);
        document.removeEventListener('keydown', initAudio);
      };

      document.addEventListener('click', initAudio, { once: true });
      document.addEventListener('keydown', initAudio, { once: true });

      // 🎯 Check for ANY pending withdrawals (old or new) and play sound on login
      console.log(
        '⏰ [AdminNotificationService] Setting timeout to check withdrawals in 3 seconds...',
      );
      setTimeout(() => {
        console.log(
          '⏰ [AdminNotificationService] Timeout triggered, calling checkPendingWithdrawals...',
        );
        this.checkPendingWithdrawals().catch((error) => {
          console.error(
            '❌ [AdminNotificationService] checkPendingWithdrawals failed:',
            error,
          );
        });
      }, 3000); // Wait 3 seconds to ensure auth token is set
    }
  }

  /**
   * Get sound enabled status
   */
  static isSoundEnabled(): boolean {
    const stored = localStorage.getItem('admin-notifications-sound');
    return stored === null ? true : stored === 'true';
  }

  /**
   * Request notification permission
   */
  static async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  /**
   * Enable/disable sound notifications
   */
  static setSoundEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
    localStorage.setItem('admin-notifications-sound', enabled.toString());
  }

  /**
   * Show notification with sound
   */
  static showNotification(data: AdminNotification): void {
    try {
      // Play sound if enabled
      if (data.sound) {
        this.playNotificationSound(data.priority);
      }

      // Determine notification type and duration based on priority
      const typeMap = {
        low: 'info',
        medium: 'info',
        high: 'warning',
        urgent: 'error',
      } as const;

      const durationMap = {
        low: 3000,
        medium: 4000,
        high: 6000,
        urgent: 8000,
      };

      const notificationType = typeMap[data.priority] || 'info';
      const duration = durationMap[data.priority] || 4000;

      // Show notification
      notification[notificationType]({
        title: data.title,
        content: data.content,
        duration,
        closable: true,
        meta: data.timestamp,
      });

      // Store in browser notification history if supported
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(data.title, {
          body: data.content,
          icon: '/favicon.ico',
          tag: data.orderId || 'admin-notification',
          requireInteraction: data.priority === 'urgent',
        });
      }
    } catch (error) {
      console.error('Failed to show notification:', error);
    }
  }

  /**
   * Initialize notification audio
   */
  private static initAudioContext(): void {
    if (!this.notificationAudio && typeof window !== 'undefined') {
      try {
        const audioUrl = `${import.meta.env.BASE_URL}sounds/withdrawal-notification.mp3`;
        this.notificationAudio = new Audio(audioUrl);
        this.notificationAudio.volume = 0.7; // 70% volume
        this.notificationAudio.preload = 'auto'; // Preload the audio

        console.log('🔊 Admin notification audio initialized:', audioUrl);
      } catch (error) {
        console.warn('Failed to initialize notification audio:', error);
      }
    }
  }

  /**
   * Play notification sound
   */
  private static async playNotificationSound(
    priority: string = 'medium',
  ): Promise<void> {
    if (!this.soundEnabled || typeof window === 'undefined') return;

    try {
      this.initAudioContext();
      if (!this.notificationAudio) return;

      // Adjust volume based on priority
      const volumeLevels = {
        low: 0.5,
        medium: 0.7,
        high: 0.85,
        urgent: 1,
      };

      this.notificationAudio.volume =
        volumeLevels[priority as keyof typeof volumeLevels] || 0.7;

      // Reset audio to start if it's already playing
      this.notificationAudio.currentTime = 0;

      // Play the audio
      await this.notificationAudio.play();

      console.log(`🔔 Notification sound played (priority: ${priority})`);
    } catch (error) {
      console.warn('Failed to play notification sound:', error);
    }
  }
}

export default AdminNotificationService;
