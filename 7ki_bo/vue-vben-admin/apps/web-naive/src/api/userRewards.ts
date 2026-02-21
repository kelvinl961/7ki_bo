import { requestClient } from '#/api/request';

// Types for reward status
export interface RewardStatus {
  hasClaimableRewards: boolean;
  totalClaimableRewards: number;
  totalRewardAmount: number;
  currency: string;
  activities: Array<{
    claimableUnits: number;
    currency: string;
    id: string;
    rewardAmount: number;
    type: string;
  }>;
  lastCheckedAt: string;
}

export interface RewardNotification {
  id: string;
  type: 'error' | 'info' | 'success' | 'warning';
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
    stats: {
      pendingClaims: number;
      todayParticipations: number;
      totalRecentClaims: number;
    };
    unreadCount: number;
  }>('/api/user/rewards/notifications');
}

/**
 * Get user's activity summary for dashboard
 * Use this for: Profile stats, dashboard widgets
 */
export function getUserActivitySummary() {
  return requestClient.get<ActivitySummary>('/api/user/rewards/summary');
}
