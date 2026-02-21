import { requestClient } from '#/api/request';

// ===================================
// TYPESCRIPT INTERFACES
// ===================================

export interface MemberTier {
  id: number;
  tierType: 'auto_upgrade' | 'fixed_tier';
  tierName: string;
  tierCode: string;
  description?: string;
  keyTags: string[];
  sortOrder: number;

  // Upgrade criteria
  minDepositAmount?: number;
  minBetAmount?: number;
  minValidBetAmount?: number;
  minCommissionAmount?: number;
  evaluationPeriodDays?: number;

  // Benefits
  depositBonusRate: number;
  rebateRate: number;
  withdrawLimit: number;
  dailyWithdrawLimit: number;
  monthlyWithdrawLimit: number;
  birthdayBonus: number;
  monthlyBonus: number;
  prioritySupport: boolean;
  exclusivePromotions: boolean;

  // Status
  isActive: boolean;
  isDefault: boolean;
  backgroundColor: string;
  textColor: string;
  iconUrl?: string;

  // Statistics
  currentMemberCount: number;
  totalUpgradeCount: number;
  lastCalculationAmount: number;
  lastCalculatedAt?: string;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface MemberTierListParams {
  page?: number;
  pageSize?: number;
  tierType?: 'auto_upgrade' | 'fixed_tier';
  isActive?: boolean;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface MemberTierListResponse {
  list: MemberTier[];
  pagination: {
    current: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateMemberTierParams {
  tierType: 'auto_upgrade' | 'fixed_tier';
  tierName: string;
  tierCode: string;
  description?: string;
  keyTags?: string[];
  sortOrder?: number;

  // Upgrade criteria
  minDepositAmount?: number;
  minBetAmount?: number;
  minValidBetAmount?: number;
  minCommissionAmount?: number;
  evaluationPeriodDays?: number;

  // Benefits
  depositBonusRate?: number;
  rebateRate?: number;
  withdrawLimit?: number;
  dailyWithdrawLimit?: number;
  monthlyWithdrawLimit?: number;
  birthdayBonus?: number;
  monthlyBonus?: number;
  prioritySupport?: boolean;
  exclusivePromotions?: boolean;

  // Status
  isActive?: boolean;
  isDefault?: boolean;
  backgroundColor?: string;
  textColor?: string;
  iconUrl?: string;
}

export interface UpdateMemberTierParams
  extends Partial<CreateMemberTierParams> {}

export interface TierMember {
  id: number;
  account: string;
  name?: string;
  email: string;
  balance: number;
  createdAt: string;
  lastLogin?: string;
  isVerified: boolean;
  isBanned: boolean;
}

export interface TierMembersParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface TierMembersResponse {
  list: TierMember[];
  pagination: {
    current: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface TierStatistics {
  memberCount: number;
  upgradeCount: number;
}

// ===================================
// REAL-TIME TIER CALCULATION INTERFACES
// ===================================

export interface TierCalculationResult {
  userId: number;
  currentTierId: null | number;
  recommendedTierId: null | number;
  shouldUpgrade: boolean;
  shouldDowngrade: boolean;
  reason: string;
  calculationData: {
    evaluationPeriod: number;
    totalBets: number;
    totalCommission: number;
    totalDeposits: number;
    totalValidBets: number;
  };
}

export interface TierUpgradeLog {
  userId: number;
  fromTierId: null | number;
  toTierId: null | number;
  upgradeType: 'AUTO' | 'MANUAL';
  reason: string;
  calculationData: any;
  upgradedBy?: number;
  upgradedAt: string;
}

export interface BatchUpdateResult {
  processed: number;
  upgraded: number;
  downgraded: number;
  errors: number;
}

// ===================================
// API METHODS
// ===================================

/**
 * Get all member tiers with filtering and pagination
 */
export async function getMemberTiersApi(
  params: MemberTierListParams = {},
): Promise<MemberTierListResponse> {
  try {
    console.log('Making API call to /member-tiers with params:', params);
    const response = await requestClient.get('/member-tiers', { params });
    console.log('Raw API response:', response);
    console.log('Response type:', typeof response);
    console.log('Response keys:', Object.keys(response || {}));

    // The backend returns {code: 0, data: {list: [...], pagination: {...}}}
    // The request interceptor should return response.data when code === 0
    // So response should be {list: [...], pagination: {...}}
    let result = response;

    // If response is still wrapped in a data property, extract it
    if (
      response &&
      response.data &&
      response.data.list &&
      response.data.pagination
    ) {
      result = response.data;
    }

    console.log('Processed result:', result);
    return result;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}

/**
 * Get member tier by ID
 */
export async function getMemberTierByIdApi(id: number): Promise<MemberTier> {
  const response = await requestClient.get(`/member-tiers/${id}`);
  return response.data || response;
}

/**
 * Create new member tier
 */
export async function createMemberTierApi(
  params: CreateMemberTierParams,
): Promise<MemberTier> {
  const response = await requestClient.post('/member-tiers', params);
  return response.data || response;
}

/**
 * Update member tier
 */
export async function updateMemberTierApi(
  id: number,
  params: UpdateMemberTierParams,
): Promise<MemberTier> {
  const response = await requestClient.put(`/member-tiers/${id}`, params);
  return response.data || response;
}

/**
 * Delete member tier
 */
export async function deleteMemberTierApi(id: number): Promise<void> {
  await requestClient.delete(`/member-tiers/${id}`);
}

/**
 * Get users in a specific tier
 */
export async function getTierMembersApi(
  id: number,
  params: TierMembersParams = {},
): Promise<TierMembersResponse> {
  try {
    console.log(
      '🔍 Making API call to /member-tiers/:id/members with params:',
      params,
    );
    const response = await requestClient.get(`/member-tiers/${id}/members`, {
      params,
    });
    console.log('📦 Raw API response:', response);
    console.log('📦 Response type:', typeof response);
    console.log('📦 Response keys:', response ? Object.keys(response) : 'null');

    // Handle different response structures
    let result: TierMembersResponse;

    // Case 1: Response is already unwrapped {list: [...], pagination: {...}}
    if (response && response.list && response.pagination) {
      console.log(
        '✅ Response already unwrapped (has list and pagination at root)',
      );
      result = response;
    }
    // Case 2: Response has data wrapper {data: {list: [...], pagination: {...}}}
    else if (
      response &&
      response.data &&
      response.data.list &&
      response.data.pagination
    ) {
      console.log('✅ Response has data wrapper, extracting...');
      result = response.data;
    }
    // Case 3: Unexpected format
    else {
      console.error('❌ Unexpected response format:', response);
      throw new Error('Invalid response format from getTierMembersApi');
    }

    console.log('✅ Final result:', result);
    console.log('✅ Total members:', result.pagination?.total);
    return result;
  } catch (error) {
    console.error('❌ API call failed:', error);
    throw error;
  }
}

/**
 * Update tier statistics (recalculate member counts)
 */
export async function updateTierStatisticsApi(
  id: number,
): Promise<TierStatistics> {
  const response = await requestClient.post(
    `/member-tiers/${id}/update-statistics`,
  );
  return response.data || response;
}

/**
 * Batch update tier statistics for all tiers
 */
export async function updateAllTierStatisticsApi(): Promise<TierStatistics[]> {
  const response = await requestClient.post(
    '/member-tiers/update-all-statistics',
  );
  return response.data || response;
}

// ===================================
// REAL-TIME TIER CALCULATION API METHODS
// ===================================

/**
 * Calculate tier for a specific user
 */
export async function calculateUserTierApi(
  userId: number,
): Promise<TierCalculationResult> {
  const response = await requestClient.get(
    `/member-tiers/calculate-user/${userId}`,
  );
  return response.data || response;
}

/**
 * Auto-update tier for a specific user
 */
export async function autoUpdateUserTierApi(userId: number): Promise<{
  message: string;
  updated: boolean;
  upgradeLog?: TierUpgradeLog;
}> {
  const response = await requestClient.post(
    `/member-tiers/auto-update-user/${userId}`,
  );
  return response.data || response;
}

/**
 * Batch update all users' tiers
 */
export async function batchUpdateAllUserTiersApi(): Promise<
  BatchUpdateResult & {
    message: string;
  }
> {
  const response = await requestClient.post('/member-tiers/batch-update-all');
  return response.data || response;
}

/**
 * Get tier upgrade history for a user
 */
export async function getUserTierHistoryApi(
  userId: number,
): Promise<TierUpgradeLog[]> {
  const response = await requestClient.get(
    `/member-tiers/user-history/${userId}`,
  );
  return response.data || response;
}

/**
 * Manual tier assignment by admin
 */
export async function manualAssignUserTierApi(
  userId: number,
  tierId: null | number,
  reason: string,
  lockTier: boolean = true,
): Promise<{
  message: string;
  upgradeLog: TierUpgradeLog;
}> {
  const response = await requestClient.post(
    `/member-tiers/manual-assign/${userId}`,
    {
      tierId,
      reason,
      lockTier,
    },
  );
  return response.data || response;
}

/**
 * Get all active member tiers (simplified for dropdowns)
 */
export async function getActiveMemberTiersApi(): Promise<MemberTier[]> {
  try {
    const response = await requestClient.get('/member-tiers', {
      params: {
        isActive: true,
        pageSize: 100,
        sortBy: 'sortOrder',
        sortOrder: 'asc',
      },
    });

    console.log('🔍 Raw API response for member tiers:', response);

    // Extract list from response - handle different response structures
    let tiersList: MemberTier[] = [];

    if (response && response.list) {
      tiersList = response.list;
    } else if (response && response.data && response.data.list) {
      tiersList = response.data.list;
    } else if (Array.isArray(response)) {
      tiersList = response;
    } else {
      console.error('❌ Unexpected response structure:', response);
      tiersList = [];
    }

    console.log('✅ Extracted member tiers:', tiersList);
    return tiersList;
  } catch (error) {
    console.error('❌ Error fetching member tiers:', error);
    return [];
  }
}
