import { requestClient } from '#/api/request';

// Activity Status Types
export interface ActivityStatus {
  window: null | {
    endsAt?: string;
    globalClaimCap?: number;
    id?: string;
    remainingClaims?: number;
    startsAt?: string;
    type?: string;
  };
  summary: {
    claimedToday: number;
    claimedTotal: number;
    eligible: boolean;
    lastClaimAt?: string;
    reason?: string;
  };
  units: ActivityUnit[];
  nextEligibleAt?: string;
}

export interface ActivityUnit {
  unitKey: string;
  state: 'claimed' | 'eligible' | 'locked';
  progress?: {
    current: number;
    percentage: number;
    target: number;
  };
  reward?: {
    amount: number;
    currency: string;
    type: string;
  };
}

// Claim Types
export interface ClaimRequest {
  unitKey?: string;
}

export interface ClaimResponse {
  claim: {
    amount: number;
    claimData: any;
    currency: string;
    id: string;
    status: string;
  };
  userCaps: {
    claimsToday: number;
    dailyLimit?: number;
    totalClaims: number;
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
    description?: string;
    locale: string;
    subtitle?: string;
    title?: string;
  }>;
  userStatus?: ActivityStatus;
}

/**
 * Get active activities for user
 */
export function getActiveActivities(params?: {
  category?: string;
  currency?: string;
  type?: string;
}) {
  return requestClient.get<UserActivity[]>('/api/activities/active', {
    params,
  });
}

/**
 * Get activity status for current user
 */
export function getActivityStatus(activityId: string) {
  return requestClient.get<ActivityStatus>(
    `/api/activities/${activityId}/status`,
  );
}

/**
 * Claim activity reward
 */
export function claimActivityReward(activityId: string, request: ClaimRequest) {
  return requestClient.post<ClaimResponse>(
    `/api/activities/${activityId}/claim`,
    request,
    {
      headers: {
        'Idempotency-Key': `claim_${activityId}_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
      },
    },
  );
}

/**
 * Get user activity statistics
 */
export function getUserActivityStats() {
  return requestClient.get<{
    recentActivities: any[];
    totalParticipations: number;
    totalRewards: number;
    totalRewardValue: number;
  }>('/api/users/activity-stats');
}

/**
 * Get user's activity history
 */
export function getUserActivityHistory(params?: {
  limit?: number;
  page?: number;
  status?: string;
  type?: string;
}) {
  return requestClient.get<{
    data: any[];
    limit: number;
    page: number;
    total: number;
  }>('/api/users/activity-history', {
    params,
  });
}

/**
 * Check activity eligibility before claiming
 */
export function checkActivityEligibility(activityId: string) {
  return requestClient.get<{
    canParticipate: boolean;
    eligibility?: any;
    reason?: string;
  }>(`/api/activities/${activityId}/can-participate`);
}
