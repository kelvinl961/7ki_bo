import { requestClient } from '#/api/request';

export interface UserDetailInfo {
  // Basic Information
  id: number;
  userId: number;
  userID?: string; // 9-digit random userID
  account: string;
  realName: string;
  email: string;
  phone: string;
  cpf: string;
  currency: string;

  // Account Status
  status:
    | 'ACTIVE'
    | 'BANNED'
    | 'BLACKLIST'
    | 'MANUAL_FREEZE'
    | 'ABNORMAL_FREEZE'
    | 'MARGINAL'
    | 'NORMAL'
    | 'PROHIBIT_BONUS'
    | 'PROHIBIT_GAME_ENTRY'
    | 'PROHIBIT_WITHDRAWAL'
    | 'SUSPENDED';
  accountStatus?: string; // Account status enum
  accountStatusDisplay?: string; // Account status display (Chinese)
  accountStatusReason?: string; // Reason for status change (备注)
  accountType: string;
  selfBanStatus: string;
  isVerified: boolean;
  registrationMethod: string; // 注册方式
  loginMethod: string; // 登录方式
  verificationMethod: string; // 验证方式

  // Financial Information
  balance: number;
  frozenBalance: number;
  rewardWallet: number;
  savingsBalance: number;
  totalSavingsEarned: number;
  totalCommission: number;
  depositWithdrawalDiff: number; // 充提差额

  // Statistics
  totalDeposit: number;
  totalDepositCount: number;
  totalWithdraw: number;
  totalWithdrawCount: number;
  last24HoursDeposit: number;
  maxSingleDeposit: number;
  last24HoursWithdraw: number;
  maxSingleWithdraw: number;
  // Manual transactions (staff adjustments - separate from deposits/withdrawals)
  totalManualDebits?: number; // Staff deductions (should not be mixed with withdrawals)
  totalManualCredits?: number; // Staff credits (already included in deposits)

  // Betting Information
  todayValidBet: number;
  todayTotalBet: number;
  todayWinLoss: number;
  totalValidBet: number;
  totalWinLoss: number;

  // Member Information
  memberLevel: string;
  memberTags: string[];
  memberTier?: {
    id: number;
    tierCode: string;
    tierName: string;
    tierType: string;
  };
  vipLevel: string;
  registrationTime: string;
  loginCount: number;
  rebateSettings: string; // 返水设置
  memberNotes: string; // 会员备注

  // Referral Information
  invitedBy: string;
  invitedByAccount?: string; // ✅ FIX: Parent agent account (for display and search)
  referralCode: string;

  // Activity Information
  activityCount: number;
  activityReward: number;
  activityAbandoned: number;
  totalRebate: number;
  taskReward: number;
  depositBonus: number;
  abandonedReward: number;
  withdrawnProvidentFund: number;

  // Profile Photo
  avatarUrl?: string; // 个人头像
  idPhotoUrl?: string; // ID Photo URL (same as avatarUrl for backward compatibility)

  // VIP Information
  vipRewardsClaimed: number;
  wagerToNextVip: number;
  vipProgression?: null | {
    currentLevel: {
      color: string;
      icon: null | string;
      id: number;
      level: number;
      name: string;
      style: null | string;
    };
    nextLevel: null | {
      color: string;
      icon: null | string;
      id: number;
      level: number;
      name: string;
      requiredBet: number;
      requiredDeposit: number;
      style: null | string;
      upgradeBonus: number;
    };
    progress: {
      betProgress: number;
      depositProgress: number;
      overallProgress: number;
      remainingBet: number;
      remainingDeposit: number;
      totalBets: number;
      totalDeposits: number;
    };
  };

  // Registration Information
  registrationIp: string;
  registrationDomain: string;
  registrationDeviceId: string;
  registrationDeviceInfo?: string; // Parsed device info (e.g., "Android 12.0")
  registrationBrowserInfo?: string; // Parsed browser info (e.g., "Facebook v533.0.0.34.82")
  registrationFingerprint: string;
  registrationSource: string;
  sameRegistrationDeviceCount?: number; // Number of users with same registration device

  // Last Login Information
  lastLoginIp: string;
  lastLoginLocation: string;
  lastLoginTime: null | string;
  lastLoginDomain: string;
  lastLoginDeviceId: string;
  lastLoginFingerprint: string;

  // Third-party Bindings
  thirdPartyBindings: string[]; // List of bound platforms

  // Channels
  depositChannel: string;

  // Security
  passwordCount: number;
  withdrawalPassword: string; // 提现密码 (masked)
  withdrawalAccountCount: number;

  // Security Stats (from separate API call)
  passwordMatchCount?: number; // 同登录密码人数
  sameWithdrawalPinCount?: number; // 同提现密码人数
  sameAccountCount?: number; // 同账号人数
  sameRegIpCount?: number; // 同注册IP人数
  sameRealNameCount?: number; // 同姓名人数
  sameRegistrationDeviceCount?: number; // 同注册设备人数
  sameLastLoginDeviceCount?: number; // 同最后登录设备人数
}

export interface UserFinancialSummary {
  availableBalance: number;
  frozenBalance: number;
  totalBalance: number;

  depositSummary: {
    count: number;
    todayAmount: number;
    total: number;
  };

  withdrawalSummary: {
    count: number;
    todayAmount: number;
    total: number;
  };

  bettingSummary: {
    todayTotal: number;
    todayValid: number;
    todayWinLoss: number;
  };

  activitySummary: {
    depositReward: number;
    taskReward: number;
  };
}

/**
 * Get user detail information - OPTIMIZED SINGLE API CALL
 */
export async function getUserDetailApi(
  userId: number,
  forceRefresh = true,
): Promise<UserDetailInfo> {
  try {
    // Single API call that includes all necessary data (force refresh to get latest VIP progression)
    // 🔧 FIX: Add timestamp to URL to bypass all cache layers (backend + browser + proxy)
    const timestamp = Date.now();
    console.log(
      `📡 Fetching user ${userId} (forceRefresh: ${forceRefresh}, timestamp: ${timestamp})`,
    );

    const response = await requestClient.get(`/users/${userId}`, {
      params: {
        forceRefresh: forceRefresh ? 'true' : 'false',
        _t: forceRefresh ? timestamp : undefined, // Add cache buster to params
      },
    });

    // Handle the response format: {success: true, data: {...}}
    const userData = response.data || response;

    console.log('📦 Raw user data from API:', {
      id: userData?.id,
      memberLevel: userData?.memberLevel,
      memberTier: userData?.memberTier,
    });

    if (!userData) {
      throw new Error('Failed to fetch user data');
    }

    const totalDeposit = Number(userData.totalDeposit) || 0;
    const totalWithdraw = Number(userData.totalWithdraw) || 0;

    return {
      id: userData.id,
      userId: userData.id, // Same as id
      userID: userData.userID, // 🎯 9-digit random userID
      account: userData.account,
      realName: userData.realName || userData.name,
      email: userData.email,
      phone: userData.phone || '',
      cpf: userData.cpf || '',
      currency: userData.currency || 'BRL',

      status: userData.status || (userData.isBanned ? 'BANNED' : 'NORMAL'), // 🎯 Pass through backend status directly
      accountStatus: userData.accountStatus, // 🎯 NEW: Pass through accountStatus
      accountStatusDisplay: userData.accountStatusDisplay, // 🎯 NEW: Pass through Chinese display
      accountStatusReason: userData.accountStatusReason || '', // 🎯 NEW: Pass through status reason
      accountType: userData.accountType || '正常用户',
      selfBanStatus: userData.selfBanStatus || '无',
      isVerified: userData.isVerified || false,
      registrationMethod: userData.registrationMethod || '手机注册',
      loginMethod: userData.loginMethod || '账号密码',
      verificationMethod: userData.verificationMethod || '手机验证',

      balance: Number(userData.balance) || 0,
      frozenBalance: Number(userData.frozenBalance) || 0,
      rewardWallet: Number(userData.rewardWallet) || 0,
      savingsBalance: Number(userData.savingsWallet) || 0,
      totalSavingsEarned: Number(userData.totalSavingsEarned) || 0,
      totalCommission: Number(userData.totalCommission) || 0,
      depositWithdrawalDiff: totalDeposit - totalWithdraw,

      totalDeposit,
      totalDepositCount: Number(userData.totalDepositCount) || 0,
      totalWithdraw,
      totalWithdrawCount: Number(userData.totalWithdrawCount) || 0,
      last24HoursDeposit: Number(userData.last24HoursDeposit) || 0,
      maxSingleDeposit: Number(userData.maxSingleDeposit) || 0,
      last24HoursWithdraw: Number(userData.last24HoursWithdraw) || 0,
      maxSingleWithdraw: Number(userData.maxSingleWithdraw) || 0,

      todayValidBet: Number(userData.todayValidBet) || 0,
      todayTotalBet: Number(userData.todayTotalBet) || 0,
      todayWinLoss: Number(userData.todayWinLoss) || 0,
      totalValidBet: Number(userData.totalValidBet) || 0,
      totalWinLoss: Number(userData.totalWinLoss) || 0,

      memberLevel: userData.memberLevel || '默认层级',
      memberTags: userData.memberTags || ['普通用户'],
      memberTier: userData.memberTier
        ? {
            id: userData.memberTier.id,
            tierName: userData.memberTier.tierName,
            tierCode: userData.memberTier.tierCode,
            tierType: userData.memberTier.tierType,
          }
        : undefined,
      vipLevel: userData.vipLevel || 'VIP0',

      // Profile Photo
      avatarUrl: userData.avatarUrl || '',
      idPhotoUrl: userData.idPhotoUrl || userData.avatarUrl || '',
      registrationTime: userData.registrationTime || userData.createdAt,
      lastLoginTime: userData.lastLoginTime || userData.lastLogin || '',
      loginCount: Number(userData.loginCount) || 0,
      rebateSettings: userData.rebateSettings || '默认返水',
      memberNotes: userData.memberNotes || userData.notes || '',

      invitedBy: userData.invitedBy || '',
      invitedByAccount: userData.invitedByAccount || '', // ✅ FIX: Parent agent account
      referralCode: userData.referralCode || '', // 🎯 9-digit random userID from backend

      activityCount: 0,
      activityReward: Number(userData.activityReward) || 0,
      activityAbandoned: 0,
      totalRebate: Number(userData.totalRebate) || 0,
      taskReward: Number(userData.taskReward) || 0,
      depositBonus: Number(userData.depositBonus) || 0,
      abandonedReward: Number(userData.abandonedReward) || 0,
      withdrawnProvidentFund: Number(userData.withdrawnProvidentFund) || 0,

      vipRewardsClaimed: Number(userData.vipRewardsClaimed) || 0,
      wagerToNextVip: Number(userData.wagerToNextVip) || 0,
      vipProgression: userData.vipProgression || null,

      // Registration Information - directly from backend
      registrationIp: userData.registrationIp || '',
      registrationDomain: userData.registrationDomain || '',
      registrationDeviceId: userData.registrationDeviceId || '',
      registrationDeviceInfo: userData.registrationDeviceInfo || '',
      registrationBrowserInfo: userData.registrationBrowserInfo || '',
      registrationFingerprint: userData.registrationFingerprint || '',
      registrationSource: userData.registrationSource || '',
      sameRegistrationDeviceCount: userData.sameRegistrationDeviceCount || 0,

      // Last Login Information - directly from backend
      lastLoginIp: userData.lastLoginIp || '',
      lastLoginLocation: userData.lastLoginLocation || '',
      lastLoginTime: userData.lastLoginTime || null,
      lastLoginDomain: userData.lastLoginDomain || '',
      lastLoginDeviceId: userData.lastLoginDeviceId || '',
      lastLoginFingerprint: userData.lastLoginFingerprint || '',

      // Third-party Bindings - directly from backend
      thirdPartyBindings: userData.thirdPartyBindings || [],

      depositChannel: userData.depositChannel || '银行转账',

      passwordCount: Number(userData.passwordCount) || 1,
      withdrawalPassword: '******',
      withdrawalAccountCount: Number(userData.withdrawalAccountCount) || 0,
    };
  } catch (error: any) {
    console.error('Failed to fetch user data:', error);
    throw new Error('Failed to fetch user data');
  }
}

/**
 * Update user status
 */
export async function updateUserStatusApi(
  userId: number,
  status: string,
  reason?: string,
) {
  return requestClient.put(`/users/${userId}/status`, { status, reason });
}

/**
 * Manual transaction operation - REAL API
 */
export async function createManualTransactionApi(params: {
  amount: number;
  backendNotes?: string;
  currency?: string;
  description: string;
  frontendNotes?: string;
  multiplier?: number;
  reason?: string;
  subType: string;
  type:
    | 'adjustment'
    | 'bonus_adjustment'
    | 'correction'
    | 'credit'
    | 'debit'
    | 'penalty';
  userId: number;
}) {
  // 🎯 Transform amount to rewardAmount for backend compatibility
  const { amount, ...restParams } = params;
  return requestClient.post('/transactions/manual', {
    ...restParams,
    rewardAmount: amount, // ✅ Backend expects 'rewardAmount' not 'amount'
  });
}

/**
 * Update user login password (admin operation)
 */
export async function updateUserPasswordApi(
  userId: number,
  newPassword: string,
) {
  return requestClient.put(`/users/${userId}/password`, { newPassword });
}

/**
 * Reset user withdrawal PIN (admin operation)
 * @param userId - User ID
 * @param newPin - Optional: If provided, set the PIN to this value. If not, clear the PIN.
 */
export async function resetWithdrawalPinApi(userId: number, newPin?: string) {
  if (newPin) {
    // Set specific PIN value
    return requestClient.post(`/users/${userId}/withdrawal-pin/reset`, {
      newPin,
    });
  } else {
    // Clear PIN (user needs to set new one)
    return requestClient.delete(`/users/${userId}/withdrawal-pin`);
  }
}

export interface TransactionRecord {
  id: number;
  type:
    | 'BETTING'
    | 'BONUS'
    | 'COMMISSION'
    | 'DEPOSIT'
    | 'MANUAL_CREDIT'
    | 'MANUAL_DEBIT'
    | 'WITHDRAWAL';
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  status: 'CANCELLED' | 'COMPLETED' | 'FAILED' | 'PENDING';
  description: string;
  transactionTime: string;
  operator?: string;
  channel?: string;
  referenceId?: string;
}

export interface TransactionListParams {
  userId: number;
  page: number;
  pageSize: number;
  type?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export interface TransactionListResponse {
  list: TransactionRecord[];
  pagination: {
    current: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Get user transaction records - REAL API
 */
export async function getUserTransactionRecordsApi(
  params: TransactionListParams,
): Promise<TransactionListResponse> {
  const queryParams = new URLSearchParams({
    page: params.page.toString(),
    pageSize: params.pageSize.toString(),
  });

  if (params.type) queryParams.append('type', params.type);
  if (params.status) queryParams.append('status', params.status);
  if (params.startDate) queryParams.append('startDate', params.startDate);
  if (params.endDate) queryParams.append('endDate', params.endDate);

  return requestClient.get(
    `/transactions/users/${params.userId}/history?${queryParams}`,
  );
}

// ===================================
// CONTACT INFORMATION TYPES & API
// ===================================

export interface UserContactInfo {
  userId: number;
  email: string;
  phone: string;
  whatsapp: string;
  facebook: string;
  telegram: string;
  line: string;
  twitter: string;
  instagram: string;
  zalo: string;
  threads: string;
}

export interface UpdateContactParams {
  email?: string;
  phone?: string;
  whatsapp?: string;
  facebook?: string;
  telegram?: string;
  line?: string;
  twitter?: string;
  instagram?: string;
  zalo?: string;
  threads?: string;
}

/**
 * Get user contact information
 */
export async function getUserContactsApi(
  userId: number,
): Promise<UserContactInfo> {
  return await requestClient.get(`/users/${userId}/contacts`);
}

/**
 * Update user contact information
 */
export async function updateUserContactsApi(
  userId: number,
  params: UpdateContactParams,
) {
  return await requestClient.put(`/users/${userId}/contacts`, params);
}

// ===================================
// THIRD-PARTY BINDINGS TYPES & API
// ===================================

export interface ThirdPartyBinding {
  id: string;
  userId: number;
  platformName: string;
  thirdPartyId: string;
  boundAt: string;
  isActive: boolean;
  lastUsed?: string;
  metadata?: any;
}

export interface ThirdPartyBindingListParams {
  userId: number;
  page: number;
  pageSize: number;
}

export interface ThirdPartyBindingListResponse {
  list: ThirdPartyBinding[];
  pagination: {
    current: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateThirdPartyBindingParams {
  platformName: string;
  thirdPartyId: string;
  metadata?: any;
}

/**
 * Get user third-party bindings
 */
export async function getUserThirdPartyBindingsApi(
  params: ThirdPartyBindingListParams,
): Promise<ThirdPartyBindingListResponse> {
  const queryParams = new URLSearchParams({
    page: params.page.toString(),
    pageSize: params.pageSize.toString(),
  });

  return await requestClient.get(
    `/users/${params.userId}/third-party-bindings?${queryParams}`,
  );
}

/**
 * Create third-party binding
 */
export async function createThirdPartyBindingApi(
  userId: number,
  params: CreateThirdPartyBindingParams,
) {
  return await requestClient.post(
    `/users/${userId}/third-party-bindings`,
    params,
  );
}

/**
 * Remove third-party binding
 */
export async function removeThirdPartyBindingApi(
  userId: number,
  bindingId: string,
) {
  return await requestClient.delete(
    `/users/${userId}/third-party-bindings/${bindingId}`,
  );
}

// ===================================
// USER PROFILE TYPES & API
// ===================================

export interface UserProfile {
  id: number;
  userId: number;
  name: string;
  idNumber: string;
  nationality: string;
  residence: string;
  occupation: string;
  employer: string;
  gender: '' | '其他' | '女' | '男';
  birthday: string;
  placeOfBirth: string;
  currentAddress: string;
  incomeSource: string;
  idPhotoUrl?: string;
  faceMatchStatus: string;
  faceMatchLogs: any[];
}

export interface UserSecurityStatus {
  memberAccount: string; // Username - only field that returns actual value
  isTelephoneNumberSet: boolean; // Boolean - don't return actual phone number
  isEmailSet: boolean; // Boolean - don't return actual email
  isGoogleAuthenticatorSet: boolean; // Boolean - don't return binding details
  isLoginPasswordSet: boolean; // Boolean - NEVER return actual password
  isWithdrawalPasswordSet: boolean; // Boolean - NEVER return actual password
  isSecurityQuestionSet: boolean; // Boolean - NEVER return actual question
}

export interface UpdateProfileParams {
  name?: string;
  idNumber?: string;
  nationality?: string;
  residence?: string;
  occupation?: string;
  employer?: string;
  gender?: '其他' | '女' | '男';
  birthday?: string;
  placeOfBirth?: string;
  currentAddress?: string;
  incomeSource?: string;
}

/**
 * Get user profile information
 */
export async function getUserProfileApi(userId: number): Promise<UserProfile> {
  return await requestClient.get(`/users/${userId}/profile`);
}

/**
 * Update user profile information
 */
export async function updateUserProfileApi(
  userId: number,
  params: UpdateProfileParams,
) {
  return await requestClient.put(`/users/${userId}/profile`, params);
}

/**
 * Upload ID card photo
 */
export async function uploadIdPhotoApi(userId: number, file: File) {
  const formData = new FormData();
  formData.append('idPhoto', file);

  return await requestClient.post(`/users/${userId}/id-photo`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

/**
 * Get user security status
 * @param userId - Optional user ID (for admins viewing other users)
 */
export async function getUserSecurityStatusApi(
  userId?: number,
): Promise<UserSecurityStatus> {
  if (userId) {
    // Admin viewing another user's security status
    return await requestClient.get(`/users/${userId}/security-status`);
  } else {
    // User viewing their own security status
    return await requestClient.get(`/users/security-status`);
  }
}

/**
 * Get face match logs
 */
export async function getFaceMatchLogsApi(userId: number) {
  return await requestClient.get(`/users/${userId}/face-match-logs`);
}

// ===================================
// USER INFO API - New comprehensive endpoint
// ===================================

export interface UserInfo {
  id: string; // 9-digit userID
  internalId: number; // Internal database ID for admin purposes
  account: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  balance: string;
  rewardWallet: string;
  savingsWallet: string;
  isVerified: boolean;
  isBanned: boolean;
  createdAt: string;
  lastLogin?: string;
  memberTier?: any;
  vipLevelId?: number;

  // VIP progression information
  vipProgression?: null | {
    currentLevel: {
      color: string;
      icon: null | string;
      id: number;
      level: number;
      name: string;
      style: null | string;
    };
    nextLevel: null | {
      color: string;
      icon: null | string;
      id: number;
      level: number;
      name: string;
      requiredBet: number;
      requiredDeposit: number;
      style: null | string;
      upgradeBonus: number;
    };
    progress: {
      betProgress: number;
      depositProgress: number;
      overallProgress: number;
      remainingBet: number;
      remainingDeposit: number;
      totalBets: number;
      totalDeposits: number;
    };
  };

  // Profile information
  displayName: string;
  dateOfBirth?: string;
  avatarUrl: string;
  whatsappId: string;
  facebookId: string;
  telegramId: string;
  lineId: string;
  twitterHandle: string;
  instagramId: string;
  zaloId: string;
  threads: string;
  weChat: string;
}

/**
 * Get comprehensive user info including profile picture (uses token authentication)
 */
export async function getUserInfoApi(forceRefresh = false): Promise<UserInfo> {
  const params = forceRefresh ? { forceRefresh: true } : {};
  return await requestClient.get('/users/info', { params });
}

/**
 * Update user profile picture (uses token authentication)
 */
export async function updateUserProfilePictureApi(file: File) {
  const formData = new FormData();
  formData.append('profilePicture', file);

  return await requestClient.put('/users/profile-picture', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

/**
 * Get user security statistics (same passwords, IPs, accounts)
 */
export interface UserSecurityStats {
  passwordMatchCount: number; // 同登录密码人数
  sameWithdrawalPinCount: number; // 同提现密码人数
  withdrawAccountCount: number; // 提现账号数量
  sameAccountCount: number; // 同账号人数
  sameRegIpCount: number; // 同注册IP人数
  sameRealNameCount: number; // 同姓名人数
  sameRegistrationDeviceCount: number; // 同注册设备人数
  sameLastLoginDeviceCount: number; // 同最后登录设备人数
}

export async function getUserSecurityStatsApi(
  userId: number,
): Promise<UserSecurityStats> {
  const response = await requestClient.get(`/users/${userId}/security-stats`);
  return response.data || response;
}

// ===================================
// VIP PROGRESS API - Separate endpoint for performance
// ===================================

export interface VipLevel {
  id: number;
  level: number;
  name: string;
  color: string;
  icon: string;
  vipStyle: string;
  requiredDeposit: string;
  requiredBet: string;
  upgradeBonus: string;
  monthlyRebate: string;
  weeklyTaskValue: string;
  dailyTaskValue: string;
  withdrawalLimit?: string;
  customerServicePriority: boolean;
}

export interface VipProgress {
  nextLevel?: VipLevel;
  depositProgress: number;
  betProgress: number;
  overallProgress: number;
  remainingDeposit: number;
  remainingBet: number;
}

export interface UserVipData {
  user: {
    account: string;
    id: number;
    lastLogin: string;
    name: string;
    registeredAt: string;
  };
  currentVipLevel: VipLevel;
  userStats: {
    totalBets: number;
    totalBonuses: number;
    totalDeposits: number;
    totalWithdrawals: number;
  };
  progress: VipProgress;
  upgradeHistory?: any[];
  rewardsHistory?: any[];
  monthlyStatistics?: any;
}

/**
 * Get user VIP progress (uses token authentication)
 */
export async function getUserVipProgressApi(options?: {
  includeHistory?: boolean;
  includeRewards?: boolean;
  includeStatistics?: boolean;
}): Promise<UserVipData> {
  const params: any = {};
  if (options?.includeHistory) params.includeHistory = 'true';
  if (options?.includeRewards) params.includeRewards = 'true';
  if (options?.includeStatistics) params.includeStatistics = 'true';

  return await requestClient.get('/vip-user/progress', { params });
}

/**
 * Trigger VIP evaluation for current user
 */
export async function triggerVipEvaluationApi() {
  return await requestClient.post('/vip-user/evaluate');
}

// ===================================
// USER INFO UPDATE API
// ===================================

export interface UpdateUserInfoParams {
  // Basic user info
  name?: string;
  email?: string;
  phone?: string;

  // Profile info
  displayName?: string;
  dateOfBirth?: string; // ISO date string
  whatsappId?: string;
  facebookId?: string;
  telegramId?: string;
  lineId?: string;
  twitterHandle?: string;
  instagramId?: string;
  zaloId?: string;
  threads?: string;
  weChat?: string;
}

/**
 * Update user info (uses token authentication)
 */
export async function updateUserInfoApi(params: UpdateUserInfoParams) {
  return await requestClient.put('/users/info', params);
}

// ===================================
// VIP REWARD CLAIMING API
// ===================================

export interface VipReward {
  id: string;
  activityId: string;
  rewardAmount: number;
  rewardType: 'birthday' | 'daily' | 'monthly' | 'upgrade' | 'weekly' | string;
  description: string;
  metadata: any;
  createdAt: string;
  expiresAt: string;
  daysUntilExpiry: null | number;
}

export interface VipRewardsInfo {
  claimableRewards: VipReward[];
  totalClaimableAmount: number;
  newPendingRewards: VipReward[];
  hasClaimableRewards: boolean;
}

export interface VipRewardClaimResponse {
  rewardId: string;
  amount: number;
  rewardType: string;
  claimedAt: string;
  newBalance: number;
}

/**
 * Claim a VIP reward
 */
export async function claimVipRewardApi(
  rewardId: string,
): Promise<VipRewardClaimResponse> {
  return await requestClient.post('/vip-user/claim-reward', { rewardId });
}

// ===================================
// WALLET TRANSACTION / FUNDING HISTORY API
// ===================================

export interface WalletTransaction {
  id: number;
  type: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  createdAt: string;
  status: string;
  referenceType?: string;
  referenceId?: string;
  metadata?: any;
  subcategoryDetails?: string; // It's a string, not an object!
  provider?: {
    category: string;
    code: string;
    logoUrl: string;
    name: string;
  };
}

export interface WalletTransactionListParams {
  userId: number;
  page?: number;
  pageSize?: number;
  date?: 'all' | 'custom' | 'month' | 'today' | 'week' | 'yesterday';
  category?: string;
  startDate?: string;
  endDate?: string;
  forceRefresh?: boolean;
}

export interface WalletTransactionSummary {
  totalTransactions: number;
  totalDeposits: number;
  totalWithdrawals: number;
  totalIncome: number;
  totalExpense: number;
  netChange: number;
}

export interface WalletTransactionListResponse {
  transactions: WalletTransaction[];
  pagination: {
    current: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  summary: WalletTransactionSummary;
  cached?: boolean;
  cacheSource?: string;
}

/**
 * Get user wallet transactions (funding history) - ADMIN VIEW
 * This shows all wallet transactions including deposits, withdrawals, game transfers, etc.
 */
export async function getUserWalletTransactionsApi(
  params: WalletTransactionListParams,
): Promise<WalletTransactionListResponse> {
  const {
    userId,
    page = 1,
    pageSize = 20,
    date = 'all',
    category = 'all',
    startDate,
    endDate,
    forceRefresh = false,
  } = params;

  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: pageSize.toString(),
    date,
    category,
  });

  if (startDate) queryParams.append('startDate', startDate);
  if (endDate) queryParams.append('endDate', endDate);
  if (forceRefresh) queryParams.append('forceRefresh', 'true');

  const response = await requestClient.get(
    `/user-history/admin/users/${userId}/funding-changes?${queryParams}`,
  );

  // Transform backend response to match our interface
  // Backend structure: { success: true, data: { transactions, pagination, total, summary } }
  const responseData = response.data?.data || response.data || {};
  console.log('🔍 [API] Funding changes response:', {
    total: responseData.total,
    paginationPage: responseData.pagination?.page,
    transactionsCount: responseData.transactions?.length,
  });

  return {
    transactions: responseData.transactions || [],
    pagination: {
      current: responseData.pagination?.page || page,
      pageSize: responseData.pagination?.limit || pageSize,
      total: responseData.total || 0, // 🎯 FIX: Get total from correct path
      totalPages: responseData.pagination?.totalPages || 0,
    },
    summary: responseData.summary || {
      totalTransactions: 0,
      totalDeposits: 0,
      totalWithdrawals: 0,
      totalIncome: 0,
      totalExpense: 0,
      netChange: 0,
    },
    cached: response.cached,
    cacheSource: response.cacheSource,
  };
}
