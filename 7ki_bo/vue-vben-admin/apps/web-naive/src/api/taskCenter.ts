import { requestClient } from '#/api/request';

// Task Center Types
export interface TaskCenter {
  id: number;
  title: string;
  description?: string;
  category:
    | 'DAILY_TASK'
    | 'NOVICE_WELFARE'
    | 'THREE_DAY_RANKING'
    | 'WEEKLY_TASK';
  taskType: string;
  sortOrder: number;
  rewardType:
    | 'BONUS'
    | 'CASH'
    | 'CUSTOM'
    | 'DISCOUNT'
    | 'FREE_SPINS'
    | 'POINTS';
  rewardAmount: number;
  rewardCurrency: string;
  isActive: boolean;
  activityLevel?: number; // 🎯 NEW: Activity level field
  ruleDescription?: string;
  taskConditions: any;
  triggerConditions?: any;
  claimRestrictions?: any;
  memberGroups: string[];

  // 🎯 NEW: Enhanced settings from Screenshot 2
  taskValidity?: 'limited_time' | 'long_term';
  claimMethod?: 'AUTOMATIC' | 'MANUAL' | string;
  claimTimeType?: 'NEXT_DAY' | 'REAL_TIME' | string;

  // 🎯 NEW: Claim Entries
  claimEntries?: {
    androidApp: boolean;
    androidH5: boolean;
    deviceBindingOnce: boolean;
    h5: boolean;
    iosApp: boolean;
    iosH5: boolean;
    iosWeb: boolean;
    pcWeb: boolean;
    pwa: boolean;
    sameDeviceOnce: boolean;
    webLoginOnce: boolean;
  };

  // 🎯 NEW: Restrictions
  restrictions?: string[];

  // 🎯 CRITICAL: Audit Settings (稽核倍数设置)
  auditSettings?: {
    auditManualReviewRequired: boolean;
    auditMultiplier: number;
    auditRequired: boolean;
  };

  // 🎯 NEW: Login Redirect Methods
  loginRedirectMethod?: {
    afterLogin: 'custom' | 'high_frequency';
    beforeLogin: 'custom' | 'high_frequency';
    directAfterRecharge: boolean;
  };

  // 🎯 NEW: Reward Rules
  rewardRules?: {
    customText: string;
    explanationType: 'custom' | 'default';
  };

  // Legacy fields (backward compatibility)
  platformAndroid: boolean;
  platformIOS: boolean;
  platformH5: boolean;
  platformPC: boolean;
  validationMethod: string;
  validationStartTime?: string;
  validationEndTime?: string;
  claimAndroidApp: boolean;
  claimIOSApp: boolean;
  claimH5: boolean;
  claimPC: boolean;
  requireEmailVerification: boolean;
  requirePhoneVerification: boolean;
  requireBankBinding: boolean;
  requireRealNameAuth: boolean;
  loginAdditionMethod?: string;
  loginDiversionMethod?: string;
  rewardMultiplier: number;
  startTime?: string;
  endTime?: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface TaskCenterCreateRequest {
  // Basic Information
  title: string;
  description?: string;
  category:
    | 'DAILY_TASK'
    | 'NOVICE_WELFARE'
    | 'THREE_DAY_RANKING'
    | 'WEEKLY_TASK';
  taskType: string;
  sortOrder?: number;
  rewardType:
    | 'BONUS'
    | 'CASH'
    | 'CUSTOM'
    | 'DISCOUNT'
    | 'FREE_SPINS'
    | 'POINTS';
  rewardAmount: number;
  rewardCurrency?: string;
  isActive?: boolean;
  activityLevel?: number; // 🎯 NEW: Activity level field
  ruleDescription?: string;

  // Task Conditions
  taskConditions: any;
  triggerConditions?: any;
  claimRestrictions?: any;
  memberGroups?: string[];

  // 🎯 NEW: Enhanced settings from Screenshot 2
  taskValidity?: 'limited_time' | 'long_term';
  claimMethod?: 'AUTOMATIC' | 'MANUAL';
  claimTimeType?: 'NEXT_DAY' | 'REAL_TIME';

  // 🎯 NEW: Claim Entries
  claimEntries?: {
    androidApp: boolean;
    androidH5: boolean;
    deviceBindingOnce: boolean;
    h5: boolean;
    iosApp: boolean;
    iosH5: boolean;
    iosWeb: boolean;
    pcWeb: boolean;
    pwa: boolean;
    sameDeviceOnce: boolean;
    webLoginOnce: boolean;
  };

  // 🎯 NEW: Restrictions
  restrictions?: string[];

  // 🎯 CRITICAL: Audit Settings (稽核倍数设置)
  auditSettings?: {
    auditManualReviewRequired: boolean;
    auditMultiplier: number;
    auditRequired: boolean;
  };

  // 🎯 NEW: Login Redirect Methods
  loginRedirectMethod?: {
    afterLogin: 'custom' | 'high_frequency';
    beforeLogin: 'custom' | 'high_frequency';
    directAfterRecharge: boolean;
  };

  // 🎯 NEW: Reward Rules
  rewardRules?: {
    customText: string;
    explanationType: 'custom' | 'default';
  };

  // Legacy Platform selection (backward compatibility)
  platformAndroid?: boolean;
  platformIOS?: boolean;
  platformH5?: boolean;
  platformPC?: boolean;
  validationMethod?: string;
  validationStartTime?: string;
  validationEndTime?: string;
  claimAndroidApp?: boolean;
  claimIOSApp?: boolean;
  claimH5?: boolean;
  claimPC?: boolean;
  requireEmailVerification?: boolean;
  requirePhoneVerification?: boolean;
  requireBankBinding?: boolean;
  requireRealNameAuth?: boolean;
  loginAdditionMethod?: string;
  loginDiversionMethod?: string;
  rewardMultiplier?: number;
  startTime?: string;
  endTime?: string;
}

export interface TaskCenterListParams {
  page?: number;
  limit?: number;
  category?: string;
  taskType?: string;
  isActive?: boolean;
  search?: string;
  rewardType?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface TaskCenterListResponse {
  success: boolean;
  data: TaskCenter[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TaskCenterStatsResponse {
  success: boolean;
  data: {
    active: number;
    byCategory: Record<string, number>;
    byRewardType: Record<string, number>;
    inactive: number;
    total: number;
    totalRewardAmount: number;
  };
}

export interface GlobalSettings {
  // Core enable flags
  noviceWelfareEnabled: boolean;
  dailyTaskEnabled: boolean;
  weeklyTaskEnabled: boolean;
  threeDayMysteryEnabled: boolean;

  // Global novice welfare restriction / entry flags (mirror backend NoviceWelfareSettings)
  claimAndroidApp?: boolean;
  claimIOSApp?: boolean;
  claimTGApp?: boolean;
  claimOriginalApp?: boolean;
  claimPolarApp?: boolean;
  claimMarketBag?: boolean;
  claimPWAFastApp?: boolean;
  claimIOSRedirect?: boolean;
  claimSameDeviceOnce?: boolean;
  claimPCWeb?: boolean;
  claimAndroidH5?: boolean;
  claimIOSH5?: boolean;
  claimSameDeviceBindingOnce?: boolean;

  // Stored selection data
  memberGroups?: string[];
  auditMultiplier?: number | string;

  // Other restriction flags used in modal
  requireFirstRecharge?: boolean;
  [key: string]: any;
}

// Task Category enum
export enum TaskCategory {
  DAILY_TASK = 'DAILY_TASK',
  NOVICE_WELFARE = 'NOVICE_WELFARE',
  THREE_DAY_RANKING = 'THREE_DAY_RANKING',
  WEEKLY_TASK = 'WEEKLY_TASK',
}

// Helper functions for labels
export function getTaskTypeLabel(taskType: string): string {
  const taskTypeLabels: Record<string, string> = {
    REGISTRATION: '注册任务',
    LOGIN: '登录任务',
    DEPOSIT: '充值任务',
    BETTING: '投注任务',
    WITHDRAWAL: '提现任务',
    REFERRAL: '推荐任务',
    PROFILE_COMPLETION: '完善资料',
    EMAIL_VERIFICATION: '邮箱验证',
    PHONE_VERIFICATION: '手机验证',
    BANK_BINDING: '银行卡绑定',
    REAL_NAME_AUTH: '实名认证',
    FIRST_DEPOSIT: '首充任务',
    DAILY_LOGIN: '每日登录',
    WEEKLY_LOGIN: '每周登录',
    CUSTOM: '自定义任务',
  };
  return taskTypeLabels[taskType] || taskType;
}

export function getRewardTypeLabel(rewardType: string): string {
  const rewardTypeLabels: Record<string, string> = {
    CASH: '现金奖励',
    POINTS: '积分奖励',
    BONUS: '奖金奖励',
    FREE_SPINS: '免费旋转',
    DISCOUNT: '折扣优惠',
    CUSTOM: '自定义奖励',
  };
  return rewardTypeLabels[rewardType] || rewardType;
}

// 任务类型选项
export const taskTypeOptions = [
  { label: '注册任务', value: 'REGISTRATION' },
  { label: '首充任务', value: 'FIRST_DEPOSIT' },
  { label: '每日签到', value: 'DAILY_CHECKIN' },
  { label: '每日投注', value: 'DAILY_BET' },
  { label: '邀请好友', value: 'INVITE_FRIENDS' },
  { label: '游戏体验', value: 'GAME_PLAY' },
  { label: '完善资料', value: 'PROFILE_COMPLETE' },
  { label: '银行卡绑定', value: 'BANK_BINDING' },
  { label: '手机验证', value: 'PHONE_VERIFICATION' },
  { label: '邮箱验证', value: 'EMAIL_VERIFICATION' },
  { label: '自定义任务', value: 'CUSTOM' },
];

// 奖励类型选项
export const taskRewardTypeOptions = [
  { label: '现金奖励', value: 'CASH' },
  { label: '奖金奖励', value: 'BONUS' },
  { label: '积分奖励', value: 'POINTS' },
  { label: '免费旋转', value: 'FREE_SPINS' },
  { label: '折扣优惠', value: 'DISCOUNT' },
  { label: '自定义奖励', value: 'CUSTOM' },
];

// 获取分类标签
export function getCategoryLabel(category: string): string {
  const categoryMap: Record<string, string> = {
    NOVICE_WELFARE: '新人福利',
    DAILY_TASK: '每日任务',
    WEEKLY_TASK: '每周任务',
    THREE_DAY_RANKING: '三日神秘任务',
  };
  return categoryMap[category] || category;
}

// API Functions

/**
 * Get task center list with pagination and filters
 */
export function getTaskCenterList(params: TaskCenterListParams = {}) {
  return requestClient.get<TaskCenterListResponse>('/novice-welfare/tasks', {
    params: {
      page: 1,
      limit: 20,
      ...params,
    },
  });
}

/**
 * Get task center by ID - NOT SUPPORTED IN NEW SYSTEM
 * Tasks are hard-coded and read-only
 */
export function getTaskCenterById(id: number) {
  // Tasks are now hard-coded, get from list instead
  return requestClient.get<{ data: TaskCenter; success: boolean }>(
    `/novice-welfare/tasks`,
  );
}

/**
 * Create/Save task center settings - Redirected to settings endpoint
 * Instead of creating tasks, save form data as versioned settings
 */
export function createTaskCenter(data: TaskCenterCreateRequest) {
  console.log('🔄 Redirecting task creation to settings save with versioning');
  return requestClient.post<{
    data: any;
    message: string;
    success: boolean;
    version: number;
  }>('/novice-welfare-settings', data);
}

/**
 * Update task center - Updates individual task in database
 * This updates the actual noviceWelfareTask record, not settings
 */
export function updateTaskCenter(
  id: number,
  data: Partial<TaskCenterCreateRequest>,
) {
  console.log(`🔄 Updating task ${id} with data:`, data);
  return requestClient.put<{ data: any; message: string; success: boolean }>(
    `/novice-welfare/tasks/${id}`,
    data,
  );
}

/**
 * Delete task center - NOT SUPPORTED IN NEW SYSTEM
 * Tasks are hard-coded and cannot be deleted
 */
export function deleteTaskCenter(id: number) {
  console.warn(
    '⚠️ deleteTaskCenter: Tasks are hard-coded and cannot be deleted',
  );
  return Promise.reject(
    new Error('Task deletion not supported - tasks are hard-coded'),
  );
}

/**
 * Bulk update task centers - NOT SUPPORTED IN NEW SYSTEM
 * Tasks are hard-coded and cannot be bulk updated
 */
export function bulkUpdateTaskCenters(
  ids: number[],
  data: Partial<TaskCenter>,
) {
  console.warn(
    '⚠️ bulkUpdateTaskCenters: Tasks are hard-coded and cannot be bulk updated',
  );
  return Promise.reject(
    new Error('Bulk task updates not supported - tasks are hard-coded'),
  );
}

/**
 * Bulk delete task centers - NOT SUPPORTED IN NEW SYSTEM
 * Tasks are hard-coded and cannot be deleted
 */
export function bulkDeleteTaskCenters(ids: number[]) {
  console.warn(
    '⚠️ bulkDeleteTaskCenters: Tasks are hard-coded and cannot be deleted',
  );
  return Promise.reject(
    new Error('Bulk task deletion not supported - tasks are hard-coded'),
  );
}

/**
 * Get task center statistics
 */
export function getTaskCenterStats() {
  return requestClient.get<TaskCenterStatsResponse>(
    '/novice-welfare-settings/summary',
  );
}

/**
 * Update task sort order - NOT SUPPORTED IN NEW SYSTEM
 * Tasks have predefined sort order
 */
export function updateTaskSortOrder(
  tasks: Array<{ id: number; sortOrder: number }>,
) {
  console.warn(
    '⚠️ updateTaskSortOrder: Tasks have predefined sort order and cannot be reordered',
  );
  return Promise.reject(
    new Error('Task reordering not supported - tasks have predefined order'),
  );
}

/**
 * Toggle task active status - Updated for new system
 * Now supports individual task status updates
 */
export function toggleTaskStatus(id: number, isActive: boolean) {
  return requestClient.put<{ data: any; message: string; success: boolean }>(
    `/novice-welfare/tasks/${id}/status`,
    {
      isActive,
    },
  );
}

/**
 * Get global task settings
 */
export function getGlobalTaskSettings() {
  return requestClient.get<{ data: GlobalSettings; success: boolean }>(
    '/novice-welfare-settings',
  );
}

/**
 * Update global task settings
 */
export function updateGlobalTaskSettings(settings: Partial<GlobalSettings>) {
  return requestClient.post<{ data: GlobalSettings; success: boolean }>(
    '/novice-welfare-settings',
    settings,
  );
}
