import { requestClient } from './request';

// ===================================
// TYPES AND INTERFACES
// ===================================

export interface VIPLevel {
  id: number;
  level: number;
  name: string;
  color: string;
  icon?: string;

  // 晋级条件
  requiredDeposit: number;
  requiredBet: number;
  requiredPoints: number;

  // 奖励设置
  upgradeBonus: number;
  currency: string;
  monthlyRebate: number;
  weeklyTaskValue: number;
  dailyTaskValue: number;

  // 特权设置
  withdrawalLimit?: number;
  withdrawalTimes?: number;
  customerServicePriority: boolean;

  // 状态
  isActive: boolean;
  displayOrder: number;

  // 统计信息
  currentMemberCount: number;
  totalRewards?: number;
  totalUpgrades?: number;

  // 时间戳
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface VIPGlobalSetting {
  id: number;

  // 系统开关
  isEnabled: boolean;
  rewardEnabled: boolean;

  // ===== 每日奖励设置 =====
  dailyRewardEnabled: boolean;
  dailyClaimTime: 'next-day' | 'same-day';
  dailyRepeatableClaim: 'highest-only' | 'repeatable';
  dailyDelayDays: number;
  dailyRewardTime: string;
  dailyRewardAmount: number;
  dailyRewardPlatforms: string[];

  // ===== 每周奖励设置 =====
  weeklyRewardEnabled: boolean;
  weeklyClaimTime: 'next-day' | 'same-day';
  weeklyRepeatableClaim: 'highest-only' | 'repeatable';
  weeklyDelayDays: number;
  weeklyRewardDay: number;
  weeklyRewardTime: string;
  weeklyRewardAmount: number;
  weeklyRewardPlatforms: string[];

  // ===== 每月奖励设置 =====
  monthlyRewardEnabled: boolean;
  monthlyClaimTime: 'next-day' | 'same-day';
  monthlyRepeatableClaim: 'highest-only' | 'repeatable';
  monthlyDelayDays: number;
  monthlyRewardDay: number;
  monthlyRewardTime: string;
  monthlyRewardAmount: number;
  monthlyRewardPlatforms: string[];

  // ===== 生日金奖励设置 =====
  birthdayRewardEnabled: boolean;
  birthdayClaimTime: 'next-day' | 'same-day';
  birthdayRepeatableClaim: 'highest-only' | 'repeatable';
  birthdayDelayDays: number;
  birthdayRewardAmount: number;
  birthdayRewardPlatforms: string[];

  // ===== 玩法奖励设定 =====
  distributionMethod: 'daily-birthday-common' | 'period-only';

  // 晋级奖金设置
  promotionClaimTime: 'next-day' | 'same-day';
  promotionRepeatableClaim: 'highest-only' | 'repeatable';

  // ===== 其他设置 =====
  excludedLevels: string[];
  settlementMultiplier: number;
  platformControl: 'exclude-selected' | 'selected-only' | 'unlimited';
  selectedPlatforms: string[];
  rulesType: 'custom' | 'system';
  rulesContent: string;

  // ===== 展示设置 =====
  displayMethod: 'card' | 'list';
  iconStyle: 'custom' | 'style1' | 'style2' | 'style3' | 'style4';
  badgeVariant: string;

  // ===== 原有字段保留（向后兼容） =====
  // 奖励发放设置
  distributionMethodType:
    | 'BONUS_WALLET'
    | 'CARD_UNLOCK'
    | 'DIRECT_CASH'
    | 'MANUAL_REVIEW';

  // 预设图标设置
  defaultIconSet: string;
  customIcons?: Record<string, any>;

  // 规则说明
  ruleType: 'CUSTOM_RULES' | 'SYSTEM_TEMPLATE';
  customRules?: string;
  systemTemplate?: string;

  // 发放条件
  platformFilter: string[];
  rewardMultiplier: number;

  // 时间戳
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface VIPReward {
  id: number;
  vipLevelId: number;
  userId?: number;
  rewardType:
    | 'BIRTHDAY_REWARD'
    | 'CUSTOM'
    | 'DAILY_REWARD'
    | 'MONTHLY_REWARD'
    | 'REBATE'
    | 'UPGRADE_BONUS'
    | 'WEEKLY_REWARD';
  amount: number;
  currency: string;
  description?: string;
  status: 'CANCELLED' | 'DISTRIBUTED' | 'EXPIRED' | 'FAILED' | 'PENDING';
  scheduledAt?: string;
  distributedAt?: string;
  platform?: string;
  conditionsMet: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;

  // 关联数据
  vipLevel?: {
    color: string;
    id: number;
    level: number;
    name: string;
  };
  user?: {
    account: string;
    id: number;
    name?: string;
  };
}

export interface VIPUpgradeHistory {
  id: number;
  userId: number;
  fromLevelId?: number;
  toLevelId: number;
  upgradeType: 'ADMIN' | 'AUTOMATIC' | 'MANUAL' | 'SYSTEM';
  upgradeReason?: string;
  bonusAmount: number;
  depositAmount: number;
  betAmount: number;
  pointsUsed: number;
  createdAt: string;
  createdBy?: string;

  // 关联数据
  user?: {
    account: string;
    id: number;
    name?: string;
  };
  fromLevel?: {
    color: string;
    id: number;
    level: number;
    name: string;
  };
  toLevel: {
    color: string;
    id: number;
    level: number;
    name: string;
  };
}

export interface VIPStatistics {
  date: string;
  totalMembers: number;
  totalUpgrades: number;
  totalRewards: number;
  totalDeposits: number;
  totalBets: number;
  levels: Array<{
    memberCount: number;
    newUpgrades: number;
    totalBets: number;
    totalDeposits: number;
    totalRewards: number;
    vipLevel: {
      color: string;
      id: number;
      level: number;
      name: string;
    };
  }>;
}

export interface VIPDashboard {
  overview: {
    activeLevels: number;
    pendingRewards: number;
    recentUpgrades: number;
    totalLevels: number;
    totalMembers: number;
  };
  levelDistribution: Array<{
    color: string;
    level: number;
    memberCount: number;
    name: string;
  }>;
}

// ===================================
// REQUEST PARAMETER TYPES
// ===================================

export interface VIPLevelListParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  isActive?: boolean;
  level?: number;
  currency?: string;
  sortBy?: 'createdAt' | 'currentMemberCount' | 'level' | 'name';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateVIPLevelData {
  level: number;
  name: string;
  color: string;
  icon?: string;
  requiredDeposit?: number;
  requiredBet?: number;
  requiredPoints?: number;
  upgradeBonus?: number;
  currency?: string;
  monthlyRebate?: number;
  weeklyTaskValue?: number;
  dailyTaskValue?: number;
  withdrawalLimit?: number;
  withdrawalTimes?: number;
  customerServicePriority?: boolean;
  isActive?: boolean;
  displayOrder?: number;
  // 新增奖励字段
  monthlyDepositRequirement?: number;
  monthlyBetRequirement?: number;
  monthlyLimit?: number;
  weeklyDepositRequirement?: number;
  weeklyBetRequirement?: number;
  weeklyLimit?: number;
  dailyDepositRequirement?: number;
  dailyBetRequirement?: number;
  dailyLimit?: number;
  birthdayBonus?: number;
  vipStyle?: string;
}

export interface UpdateVIPLevelData extends Partial<CreateVIPLevelData> {
  id: number;
}

export interface VIPRewardListParams {
  page?: number;
  pageSize?: number;
  vipLevelId?: number;
  userId?: number;
  rewardType?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'amount' | 'createdAt' | 'distributedAt' | 'scheduledAt';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateVIPRewardData {
  vipLevelId: number;
  userId?: number;
  rewardType: string;
  amount: number;
  currency?: string;
  description?: string;
  scheduledAt?: string;
  platform?: string;
  conditionsMet?: boolean;
}

export interface VIPUpgradeHistoryParams {
  page?: number;
  pageSize?: number;
  userId?: number;
  fromLevelId?: number;
  toLevelId?: number;
  upgradeType?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'betAmount' | 'bonusAmount' | 'createdAt' | 'depositAmount';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateVIPUpgradeData {
  userId: number;
  toLevelId: number;
  upgradeType?: string;
  upgradeReason?: string;
  bonusAmount?: number;
  depositAmount?: number;
  betAmount?: number;
  pointsUsed?: number;
}

export interface VIPStatisticsParams {
  vipLevelId?: number;
  dateFrom?: string;
  dateTo?: string;
  groupBy?: 'day' | 'month' | 'week';
}

// ===================================
// RESPONSE TYPES
// ===================================

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

interface PaginatedResponse<T> {
  list: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// ===================================
// VIP LEVEL API FUNCTIONS
// ===================================

export const getVIPLevels = async (
  params: VIPLevelListParams = {},
): Promise<PaginatedResponse<VIPLevel>> => {
  console.log('🔄 getVIPLevels API call started with params:', params);
  try {
    // Use the VIP levels endpoint
    const response = await requestClient.get<PaginatedResponse<VIPLevel>>(
      '/vip/levels',
      { params },
    );
    console.log('✅ getVIPLevels raw response:', response);
    console.log('📊 Response type:', typeof response);
    console.log(
      '📊 Response keys:',
      response ? Object.keys(response) : 'undefined',
    );
    console.log('📊 Response structure:', response);

    // Handle the response based on its structure
    // Response interceptor returns the full response for success: true format
    let result: PaginatedResponse<VIPLevel>;

    if (
      response &&
      (response as any).success === true &&
      (response as any).data
    ) {
      // Format: {success: true, data: {list: [...], pagination: {...}}}
      result = (response as any).data;
      console.log('🎯 Extracted data from success response:', result);
    } else if (
      response &&
      (response as any).list &&
      (response as any).pagination
    ) {
      // Format: {list: [...], pagination: {...}}
      result = response as PaginatedResponse<VIPLevel>;
      console.log('🎯 Using response as-is:', result);
    } else {
      // Fallback: try to use response directly
      result = response as PaginatedResponse<VIPLevel>;
      console.log('🎯 Using fallback response format:', result);
    }

    console.log('🎯 Final result to return:', result);
    return result;
  } catch (error) {
    console.error('❌ getVIPLevels API call failed:', error);
    console.error('❌ Error details:', {
      name: (error as any).name,
      message: (error as any).message,
      response: (error as any).response,
      status: (error as any).response?.status,
      data: (error as any).response?.data,
    });
    throw error;
  }
};

export const getVIPLevelById = async (id: number): Promise<VIPLevel> => {
  const response = await requestClient.get<ApiResponse<VIPLevel>>(
    `/vip/levels/${id}`,
  );
  return (response as any).data || response; // Handle response format
};

export const createVIPLevel = async (
  data: CreateVIPLevelData,
): Promise<VIPLevel> => {
  const response = await requestClient.post<ApiResponse<VIPLevel>>(
    '/vip/levels',
    data,
  );
  return (response as any).data || response; // Handle response format
};

export const updateVIPLevel = async (
  id: number,
  data: Partial<CreateVIPLevelData>,
): Promise<VIPLevel> => {
  const response = await requestClient.put<ApiResponse<VIPLevel>>(
    `/vip/levels/${id}`,
    data,
  );
  return (response as any).data || response; // Handle response format
};

export const bulkUpdateVIPLevels = async (
  levels: any[],
): Promise<VIPLevel[]> => {
  const response = await requestClient.put<ApiResponse<VIPLevel[]>>(
    '/vip/levels/bulk-update',
    { levels },
  );
  return (response as any).data || response; // Handle response format
};

export const deleteVIPLevel = async (id: number): Promise<void> => {
  await requestClient.delete(`/vip/levels/${id}`);
};

export const bulkDeleteVIPLevels = async (ids: number[]): Promise<void> => {
  await requestClient.post('/vip/levels/bulk-delete', { ids });
};

export const toggleVIPLevelStatus = async (
  id: number,
  isActive: boolean,
): Promise<VIPLevel> => {
  const response = await requestClient.post<ApiResponse<VIPLevel>>(
    '/vip/levels/toggle-status',
    { id, isActive },
  );
  return (response as any).data || response; // Handle response format
};

export const getVIPLevelOptions = async (): Promise<
  Array<{ color: string; id: number; level: number; name: string }>
> => {
  const response = await requestClient.get<
    ApiResponse<
      Array<{ color: string; id: number; level: number; name: string }>
    >
  >('/vip/levels/options');
  return (response as any).data || response; // Handle response format
};

// ===================================
// VIP GLOBAL SETTINGS API FUNCTIONS
// ===================================

export const getVIPGlobalSettings = async (): Promise<VIPGlobalSetting> => {
  console.log('🔄 getVIPGlobalSettings API call started');
  try {
    const response =
      await requestClient.get<ApiResponse<VIPGlobalSetting>>('/vip/settings');
    console.log('✅ getVIPGlobalSettings raw response:', response);
    console.log('📊 Response type:', typeof response);
    console.log(
      '📊 Response keys:',
      response ? Object.keys(response) : 'undefined',
    );
    console.log('📊 Response structure:', response);
    const result = (response as any).data || response; // Handle response format
    console.log('🎯 Final result to return:', result);
    return result;
  } catch (error) {
    console.error('❌ getVIPGlobalSettings API call failed:', error);
    console.error('❌ Error details:', {
      name: (error as any).name,
      message: (error as any).message,
      response: (error as any).response,
      status: (error as any).response?.status,
      data: (error as any).response?.data,
    });
    throw error;
  }
};

export const updateVIPGlobalSettings = async (
  data: Partial<VIPGlobalSetting>,
): Promise<VIPGlobalSetting> => {
  const response = await requestClient.put<ApiResponse<VIPGlobalSetting>>(
    '/vip/settings',
    data,
  );
  return (response as any).data || response; // Handle response format
};

// ===================================
// VIP REWARDS API FUNCTIONS
// ===================================

export const getVIPRewards = async (
  params: VIPRewardListParams = {},
): Promise<PaginatedResponse<VIPReward>> => {
  const response = await requestClient.get<
    ApiResponse<PaginatedResponse<VIPReward>>
  >('/vip/rewards', { params });
  return (response as any).data || response; // Handle response format
};

export const createVIPReward = async (
  data: CreateVIPRewardData,
): Promise<VIPReward> => {
  const response = await requestClient.post<ApiResponse<VIPReward>>(
    '/vip/rewards',
    data,
  );
  return (response as any).data || response; // Handle response format
};

export const updateVIPReward = async (
  id: number,
  data: Partial<CreateVIPRewardData>,
): Promise<VIPReward> => {
  const response = await requestClient.put<ApiResponse<VIPReward>>(
    `/vip/rewards/${id}`,
    data,
  );
  return (response as any).data || response; // Handle response format
};

export const bulkDistributeRewards = async (
  rewardIds: number[],
  distributionMethod?: string,
): Promise<VIPReward[]> => {
  const response = await requestClient.post<ApiResponse<VIPReward[]>>(
    '/vip/rewards/bulk-distribute',
    {
      rewardIds,
      distributionMethod,
    },
  );
  return (response as any).data || response; // Handle response format
};

// ===================================
// VIP UPGRADE HISTORY API FUNCTIONS
// ===================================

export const getVIPUpgradeHistory = async (
  params: VIPUpgradeHistoryParams = {},
): Promise<PaginatedResponse<VIPUpgradeHistory>> => {
  const response = await requestClient.get<
    ApiResponse<PaginatedResponse<VIPUpgradeHistory>>
  >('/vip/upgrades', { params });
  return (response as any).data || response; // Handle response format
};

export const createVIPUpgrade = async (
  data: CreateVIPUpgradeData,
): Promise<VIPUpgradeHistory> => {
  const response = await requestClient.post<ApiResponse<VIPUpgradeHistory>>(
    '/vip/upgrades',
    data,
  );
  return (response as any).data || response; // Handle response format
};

// ===================================
// VIP STATISTICS API FUNCTIONS
// ===================================

export const getVIPStatistics = async (
  params: VIPStatisticsParams = {},
): Promise<{ statistics: VIPStatistics[]; summary: any }> => {
  const response = await requestClient.get<
    ApiResponse<{ statistics: VIPStatistics[]; summary: any }>
  >('/vip/statistics', { params });
  return (response as any).data || response; // Handle response format
};

export const getVIPDashboard = async (): Promise<VIPDashboard> => {
  const response =
    await requestClient.get<ApiResponse<VIPDashboard>>('/vip/dashboard');
  return (response as any).data || response; // Handle response format
};

// Evaluate and sync VIP levels
export const evaluateVIPLevelsApi = async (userId?: number): Promise<any> => {
  const payload = userId ? { userId } : {};
  const response = await requestClient.post<ApiResponse<any>>(
    '/vip/evaluate',
    payload,
  );
  return response; // Response interceptor already unwrapped .data
};

// ===================================
// CONSTANTS AND OPTIONS
// ===================================

export const VIP_DISTRIBUTION_METHODS = [
  { label: '现金直接发放', value: 'DIRECT_CASH' },
  { label: '卡片解锁', value: 'CARD_UNLOCK' },
  { label: '奖金钱包', value: 'BONUS_WALLET' },
  { label: '人工审核', value: 'MANUAL_REVIEW' },
];

export const VIP_RULE_TYPES = [
  { label: '系统模板', value: 'SYSTEM_TEMPLATE' },
  { label: '自定义规则', value: 'CUSTOM_RULES' },
];

export const VIP_REWARD_TYPES = [
  { label: '升级奖金', value: 'UPGRADE_BONUS' },
  { label: '每日奖励', value: 'DAILY_REWARD' },
  { label: '每周奖励', value: 'WEEKLY_REWARD' },
  { label: '每月奖励', value: 'MONTHLY_REWARD' },
  { label: '生日奖励', value: 'BIRTHDAY_REWARD' },
  { label: '返水', value: 'REBATE' },
  { label: '自定义奖励', value: 'CUSTOM' },
];

export const VIP_REWARD_STATUS = [
  { label: '待发放', value: 'PENDING' },
  { label: '已发放', value: 'DISTRIBUTED' },
  { label: '发放失败', value: 'FAILED' },
  { label: '已取消', value: 'CANCELLED' },
  { label: '已过期', value: 'EXPIRED' },
];

export const VIP_UPGRADE_TYPES = [
  { label: '自动升级', value: 'AUTOMATIC' },
  { label: '手动升级', value: 'MANUAL' },
  { label: '系统升级', value: 'SYSTEM' },
  { label: '管理员操作', value: 'ADMIN' },
];

export const CURRENCY_OPTIONS = [
  { label: 'USDT', value: 'USDT' },
  { label: 'BTC', value: 'BTC' },
  { label: 'ETH', value: 'ETH' },
  { label: 'BRL', value: 'BRL' },
];

export const PLATFORM_OPTIONS = [
  { label: 'PC端', value: 'PC' },
  { label: 'H5端', value: 'H5' },
  { label: 'APP端', value: 'APP' },
  { label: '全平台', value: 'ALL' },
];

export const WEEKDAY_OPTIONS = [
  { label: '周一', value: 1 },
  { label: '周二', value: 2 },
  { label: '周三', value: 3 },
  { label: '周四', value: 4 },
  { label: '周五', value: 5 },
  { label: '周六', value: 6 },
  { label: '周日', value: 7 },
];

export const ICON_SETS = [
  { label: '金色主题', value: 'gold' },
  { label: '银色主题', value: 'silver' },
  { label: '钻石主题', value: 'diamond' },
  { label: '彩虹主题', value: 'rainbow' },
  { label: '自定义', value: 'custom' },
];
