import { requestClient } from '#/api/request';

// Types for reward status
export interface RewardStatus {
  hasClaimableRewards: boolean;
  totalClaimableRewards: number;
  totalRewardAmount: number;
  currency: string;
  activities: Array<{
    id: string;
    type: string;
    currency: string;
    claimableUnits: number;
    rewardAmount: number;
  }>;
  lastCheckedAt: string;
}

export interface RewardNotification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  actionUrl?: string;
}

export interface ActivitySummary {
  totalParticipations: number;
  totalRewards: number;
  todayClaims: number;
  totalRewardValue: number;
  currency: string;
}

/**
 * Quick check for user's claimable rewards (for badges/indicators)
 * Use this for: Badge counts, notification dots, header indicators
 */
export function getUserRewardStatus() {
  return requestClient.get<RewardStatus>('/api/user/rewards/status');
}

/**
 * Get detailed notification data for frontend display
 * Use this for: Notification dropdown, recent activity feed
 */
export function getUserRewardNotifications() {
  return requestClient.get<{
    notifications: RewardNotification[];
    unreadCount: number;
    stats: {
      todayParticipations: number;
      totalRecentClaims: number;
      pendingClaims: number;
    };
  }>('/api/user/rewards/notifications');
}

/**
 * Get user's activity summary for dashboard
 * Use this for: Profile stats, dashboard widgets
 */
export function getUserActivitySummary() {
  return requestClient.get<ActivitySummary>('/api/user/rewards/summary');
}
