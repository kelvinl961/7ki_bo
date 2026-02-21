import { requestClient } from '#/api/request';

// ===================================
// TYPE DEFINITIONS
// ===================================

export interface RechargeActivitySettings {
  hasActiveActivity: boolean;
  activityId?: number;
  activityTitle?: string;
  activityDescription?: string;
  eventTime: {
    endsAt: null | string;
    startsAt: null | string;
  };
  rechargeSettings: {
    afterLoginPopup?: boolean;
    beforeLoginPopup?: boolean;
    bonusMethod?: 'fixed' | 'percentage';
    claimTime?: string;
    condition:
      | 'accumulate_recharge'
      | 'first_deposit'
      | 'recharge_count'
      | 'single_recharge'
      | null;
    cycleMethod?:
      | 'daily_cumulative'
      | 'monthly_cumulative'
      | 'weekly_cumulative'
      | null;
    directPopupAfterRecharge?: boolean;
    distributionMethod?:
      | 'auto_claim'
      | 'player_claim_auto_after_expire'
      | 'player_claim_expires';
    participationMethod?: string; // Legacy
    rechargeAmounts: Array<{
      amount: number;
      betAmount?: number;
      bonus: number;
      rewardAmount?: number;
    }>;
    rechargeMethods?: string[];
    rewardExpirationDays?: null | number;
  };
}

export interface RechargeActivityProgress {
  userId: number;
  activityId: number;
  activityTitle: string;
  activityDescription: string;
  eventTime: {
    endsAt: null | string;
    startsAt: null | string;
  };
  taskTitle: string;
  taskDescription: string;
  condition: string;
  currentAmount: number;
  targetAmount: number;
  progressPercentage: number;
  progressText: string;
  bonusAmount: number;
  bonusMethod: 'fixed' | 'percentage';
  isCompleted: boolean;
  canClaim: boolean;
  isClaimed: boolean;
  claimStatus: 'claimed' | 'eligible' | 'expired' | 'not_eligible';
  pendingReward: null | {
    amount: number;
    canClaimNow: boolean;
    expiresAt: null | string;
    id: null | string;
    status: 'available' | 'claimed' | 'expired' | 'pending';
  };
  lastDepositTime: null | string;
  depositCount: number;
  rechargeMethods?: string[];
  isEligible: boolean;
}

export interface RechargeTier {
  amount: number;
  bonus: number;
  currentProgress: number;
  targetAmount: number;
  isCompleted: boolean;
  canClaim: boolean;
  isClaimed: boolean;
  progressText: string;
  progressPercentage: number;
}

export interface RechargeActivityData {
  settings: RechargeActivitySettings;
  progress: RechargeActivityProgress;
  tiers: RechargeTier[];
  resetTime?: string; // Time until reset (for cycle-based activities)
  cycleType?: 'daily' | 'monthly' | 'weekly';
}

// ===================================
// API METHODS
// ===================================

/**
 * Get recharge activity settings (auto-discovery)
 * GET /api/recharge/settings
 */
export async function getRechargeActivitySettings(): Promise<{
  data: RechargeActivitySettings;
  success: boolean;
}> {
  return requestClient.get('/recharge/settings');
}

/**
 * Get recharge activity settings by activity ID
 * GET /api/recharge-activities/:activityId/settings
 */
export async function getRechargeActivitySettingsById(
  activityId: number,
): Promise<{ data: RechargeActivitySettings; success: boolean }> {
  return requestClient.get(`/recharge-activities/${activityId}/settings`);
}

/**
 * Get user's recharge progress (auto-discovery)
 * GET /api/recharge/progress
 */
export async function getRechargeActivityProgress(): Promise<{
  data: RechargeActivityProgress;
  success: boolean;
}> {
  return requestClient.get('/recharge/progress');
}

/**
 * Get user's recharge progress by activity ID
 * GET /api/recharge-activities/:activityId/progress
 */
export async function getRechargeActivityProgressById(
  activityId: number,
): Promise<{ data: RechargeActivityProgress; success: boolean }> {
  return requestClient.get(`/recharge-activities/${activityId}/progress`);
}

/**
 * Claim recharge reward
 * POST /api/recharge/claim
 */
export async function claimRechargeReward(
  activityId?: number,
): Promise<{ data?: any; message: string; success: boolean }> {
  return requestClient.post('/recharge/claim', { activityId });
}

/**
 * Claim recharge reward by activity ID
 * POST /api/recharge-activities/:activityId/claim
 */
export async function claimRechargeRewardById(
  activityId: number,
): Promise<{ data?: any; message: string; success: boolean }> {
  return requestClient.post(`/recharge-activities/${activityId}/claim`);
}

/**
 * Get combined recharge activity data (settings + progress + tiers)
 * This is a convenience method that combines settings and progress
 */
export async function getRechargeActivityData(
  activityId?: number,
): Promise<null | RechargeActivityData> {
  try {
    // Get settings
    const settingsResponse = activityId
      ? await getRechargeActivitySettingsById(activityId)
      : await getRechargeActivitySettings();

    if (!settingsResponse.success || !settingsResponse.data.hasActiveActivity) {
      return null;
    }

    const settings = settingsResponse.data;
    const targetActivityId = activityId || settings.activityId;

    if (!targetActivityId) {
      return null;
    }

    // Get progress
    const progressResponse = activityId
      ? await getRechargeActivityProgressById(targetActivityId)
      : await getRechargeActivityProgress();

    if (!progressResponse.success) {
      return null;
    }

    const progress = progressResponse.data;
    const rechargeAmounts = settings.rechargeSettings.rechargeAmounts || [];

    // Build tiers with progress
    const tiers: RechargeTier[] = rechargeAmounts.map((tier, index) => {
      const tierAmount = tier.amount || tier.betAmount || 0;
      const tierBonus = tier.bonus || tier.rewardAmount || 0;

      // For accumulate_recharge, use currentAmount; for recharge_count, use depositCount
      const currentProgress = progress.condition.includes('次数')
        ? progress.depositCount
        : progress.currentAmount;

      const isCompleted = currentProgress >= tierAmount;
      const canClaim = isCompleted && progress.canClaim && !progress.isClaimed;

      return {
        amount: tierAmount,
        bonus: tierBonus,
        currentProgress,
        targetAmount: tierAmount,
        isCompleted,
        canClaim,
        isClaimed: progress.isClaimed,
        progressText: `${currentProgress}/${tierAmount}`,
        progressPercentage:
          tierAmount > 0
            ? Math.min(100, Math.round((currentProgress / tierAmount) * 100))
            : 0,
      };
    });

    // Calculate reset time for cycle-based activities
    let resetTime: string | undefined;
    let cycleType: 'daily' | 'monthly' | 'weekly' | undefined;

    if (
      settings.rechargeSettings.condition === 'accumulate_recharge' &&
      settings.rechargeSettings.cycleMethod
    ) {
      const cycleMethod = settings.rechargeSettings.cycleMethod;
      const now = new Date();
      let resetDate: Date;

      if (cycleMethod === 'daily_cumulative') {
        cycleType = 'daily';
        resetDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() + 1,
        );
      } else if (cycleMethod === 'weekly_cumulative') {
        cycleType = 'weekly';
        const dayOfWeek = now.getDay();
        const daysToMonday = dayOfWeek === 0 ? 7 : 8 - dayOfWeek;
        resetDate = new Date(now);
        resetDate.setDate(now.getDate() + daysToMonday);
        resetDate.setHours(0, 0, 0, 0);
      } else {
        cycleType = 'monthly';
        resetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      }

      const diffMs = resetDate.getTime() - now.getTime();
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

      resetTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    return {
      settings,
      progress,
      tiers,
      resetTime,
      cycleType,
    };
  } catch (error) {
    console.error('Error getting recharge activity data:', error);
    return null;
  }
}
