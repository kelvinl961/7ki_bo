import { requestClient } from '#/api/request';

// Activity Status Types
export interface ActivityStatus {
  window: {
    id?: string;
    type?: string;
    startsAt?: string;
    endsAt?: string;
    globalClaimCap?: number;
    remainingClaims?: number;
  } | null;
  summary: {
    eligible: boolean;
    reason?: string;
    claimedToday: number;
    claimedTotal: number;
    lastClaimAt?: string;
  };
  units: ActivityUnit[];
  nextEligibleAt?: string;
}

export interface ActivityUnit {
  unitKey: string;
  state: 'locked' | 'eligible' | 'claimed';
  progress?: {
    current: number;
    target: number;
    percentage: number;
  };
  reward?: {
    type: string;
    amount: number;
    currency: string;
  };
}

// Claim Types
export interface ClaimRequest {
  unitKey?: string;
}

export interface ClaimResponse {
  claim: {
    id: string;
    amount: number;
    currency: string;
    status: string;
    claimData: any;
  };
  userCaps: {
    claimsToday: number;
    totalClaims: number;
    dailyLimit?: number;
  };
  globalCaps: {
    remainingClaims?: number;
    totalClaimed?: number;
  };
}

// Activity List Types
export interface UserActivity {
  id: string;
  type: string;
  status: string;
  category?: string;
  currency: string;
  startsAt?: string;
  endsAt?: string;
  displayFrom?: string;
  displayTo?: string;
  isVisible: boolean;
  promoUrl?: string;
  locales: Array<{
    locale: string;
    title?: string;
    subtitle?: string;
    description?: string;
  }>;
  userStatus?: ActivityStatus;
}

/**
 * Get active activities for user
 */
export function getActiveActivities(params?: {
  type?: string;
  category?: string;
  currency?: string;
}) {
  return requestClient.get<UserActivity[]>('/api/activities/active', {
    params
  });
}

/**
 * Get activity status for current user
 */
export function getActivityStatus(activityId: string) {
  return requestClient.get<ActivityStatus>(`/api/activities/${activityId}/status`);
}

/**
 * Claim activity reward
 */
export function claimActivityReward(activityId: string, request: ClaimRequest) {
  return requestClient.post<ClaimResponse>(`/api/activities/${activityId}/claim`, request, {
    headers: {
      'Idempotency-Key': `claim_${activityId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
  });
}

/**
 * Get user activity statistics
 */
export function getUserActivityStats() {
  return requestClient.get<{
    totalParticipations: number;
    totalRewards: number;
    totalRewardValue: number;
    recentActivities: any[];
  }>('/api/users/activity-stats');
}

/**
 * Get user's activity history
 */
export function getUserActivityHistory(params?: {
  page?: number;
  limit?: number;
  type?: string;
  status?: string;
}) {
  return requestClient.get<{
    data: any[];
    total: number;
    page: number;
    limit: number;
  }>('/api/users/activity-history', {
    params
  });
}

/**
 * Check activity eligibility before claiming
 */
export function checkActivityEligibility(activityId: string) {
  return requestClient.get<{
    canParticipate: boolean;
    reason?: string;
    eligibility?: any;
  }>(`/api/activities/${activityId}/can-participate`);
}
