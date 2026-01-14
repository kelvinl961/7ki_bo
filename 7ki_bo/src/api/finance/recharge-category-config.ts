import { requestClient } from '#/api/request';

// ============================================================================
// RECHARGE CATEGORY CONFIGURATION TYPES
// ============================================================================

export interface RechargeCategoryConfig {
  id: number;
  name: string;
  icon?: string;
  displayOrder: number;
  
  // Channel configuration
  supportedCurrencies: string[];
  isActive: boolean;
  frontendEnabled: boolean;
  
  // Merge channel configuration
  enableChannelMerging: boolean;
  mergedChannels?: ThirdPartyChannelInfo[];
  
  // Blacklist configuration
  enableBlacklist: boolean;
  blacklistUsers?: number[];
  
  // Badge configuration
  customBadge?: string;
  showBonusBadge: boolean;
  
  // Recommended amounts configuration
  recommendedAmounts?: RecommendedAmount[];
  
  // Created/Updated info
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface ThirdPartyChannelInfo {
  id: string;
  channelCode: string;
  channelName: string;
  platformName: string;
  currency: string;
  minAmount: number;
  maxAmount: number;
  feeRate: number;
  isActive: boolean;
  memberLevels: string[];
  terminals: string[];
  
  // Statistics
  successRate?: number;
  avgProcessTime?: number;
  last10MinSuccess?: number;
}

export interface RecommendedAmount {
  amount: number;
  bonusType: 'PERCENTAGE' | 'FIXED';
  bonusValue: number;
  description?: string;
}

// Recharge Settings Configuration
export interface RechargeSettings {
  // Frequency limits
  applicationFrequency: {
    enabled: boolean;
    maxApplicationsPerMinute: number;
  };
  
  // Badge display
  showBonusBadge: boolean;
  
  // Concurrent recharge limits
  maxConcurrentRecharges: number; // 0 = unlimited
  
  // Payer wallet address requirement
  requirePayerWalletAddress: boolean;
  
  // Behavior verification
  enableBehaviorVerification: boolean;
  
  // Timeout callback handling
  acceptCallbackAfterTimeout: boolean;
  orderValidityTime: number; // in minutes
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

export interface GetRechargeCategoriesParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

export interface GetRechargeCategoriesResponse {
  data: RechargeCategoryConfig[];
  pagination: {
    current: number;
    pageSize: number;
    total: number;
  };
}

export interface CreateRechargeCategoryParams {
  name: string;
  icon?: string;
  supportedCurrencies: string[];
  displayOrder?: number;
  frontendEnabled?: boolean;
  enableChannelMerging?: boolean;
  enableBlacklist?: boolean;
  customBadge?: string;
  showBonusBadge?: boolean;
}

export interface UpdateRechargeCategoryParams extends Partial<CreateRechargeCategoryParams> {
  id: number;
}

export interface GetChannelsParams {
  page?: number;
  limit?: number;
  search?: string;
  platformName?: string;
  currency?: string;
  isActive?: boolean;
}

export interface GetChannelsResponse {
  data: ThirdPartyChannelInfo[];
  pagination: {
    current: number;
    pageSize: number;
    total: number;
  };
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Get recharge categories with configuration
 */
export function getRechargeCategoriesConfig(params?: GetRechargeCategoriesParams) {
  return requestClient.get<GetRechargeCategoriesResponse>('/recharge/categories/config', {
    params,
  });
}

/**
 * Create new recharge category
 */
export function createRechargeCategory(data: CreateRechargeCategoryParams) {
  return requestClient.post('/recharge/categories', data);
}

/**
 * Update recharge category
 */
export function updateRechargeCategory(data: UpdateRechargeCategoryParams) {
  return requestClient.put(`/recharge/categories/${data.id}`, data);
}

/**
 * Delete recharge category
 */
export function deleteRechargeCategory(id: number) {
  return requestClient.delete(`/recharge/categories/${id}`);
}

/**
 * Toggle recharge category status
 */
export function toggleRechargeCategoryStatus(id: number, isActive: boolean) {
  return requestClient.patch(`/recharge/categories/${id}/status`, { isActive });
}

/**
 * Get available third-party channels
 */
export function getThirdPartyChannels(params?: GetChannelsParams) {
  return requestClient.get<GetChannelsResponse>('/recharge/channels', {
    params,
  });
}

/**
 * Get disabled channels
 */
export function getDisabledChannels(params?: GetChannelsParams) {
  return requestClient.get<GetChannelsResponse>('/recharge/channels/disabled', {
    params,
  });
}

/**
 * Merge recommended amounts for category
 */
export function mergeRecommendedAmounts(categoryId: number, amounts: RecommendedAmount[]) {
  return requestClient.post(`/recharge/categories/${categoryId}/merge-amounts`, {
    recommendedAmounts: amounts,
  });
}

/**
 * Get recharge settings
 */
export function getRechargeSettings() {
  return requestClient.get<RechargeSettings>('/recharge/settings');
}

/**
 * Update recharge settings
 */
export function updateRechargeSettings(data: Partial<RechargeSettings>) {
  return requestClient.put('/recharge/settings', data);
}

/**
 * Get third-party statistics
 */
export function getThirdPartyStatistics(params?: {
  dateRange?: [string, string];
  platformName?: string;
  channelCode?: string;
}) {
  return requestClient.get('/recharge/statistics', {
    params,
  });
}
