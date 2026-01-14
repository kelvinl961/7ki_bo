import { requestClient } from '#/api/request';

export interface ThirdPartyChannel {
  id?: string;
  platformName: string;
  gatewayName: string;
  merchantId: string;
  merchantKey?: string;
  domain: string;
  ipAddress: string;
  channelName: string;
  channelCode: string;
  channelCategory: string;
  currency: string;
  minAmount?: number;
  maxAmount?: number;
  channelLimit: {
    min: number;
    max: number;
  };
  bonusRate: number;
  terminal: string[];
  memberLevel: string;
  isActive?: boolean;
  priority?: number;
  dailyLimit?: number;
  monthlyLimit?: number;
  successRate?: number;
  avgProcessTime?: number;
  remark?: string;
  apiConfig?: any;
  webhookUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface ThirdPartyChannelListParams {
  page?: number;
  limit?: number;
  search?: string;
  platformName?: string;
  gatewayName?: string;
  channelName?: string;
  currency?: string;
  memberLevel?: string;
  isActive?: boolean;
}

export interface ThirdPartyChannelListResponse {
  success: boolean;
  data: {
    records: ThirdPartyChannel[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
  message?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/**
 * Get third-party channels list
 */
export async function getThirdPartyChannelList(params: ThirdPartyChannelListParams) {
  return requestClient.get<ThirdPartyChannelListResponse>('/third-party-channels', {
    params,
  });
}

/**
 * Create third-party channel
 */
export async function createThirdPartyChannel(data: ThirdPartyChannel) {
  return requestClient.post<ApiResponse<ThirdPartyChannel>>('/third-party-channels', data);
}

/**
 * Update third-party channel
 */
export async function updateThirdPartyChannel(id: string, data: ThirdPartyChannel) {
  return requestClient.put<ApiResponse<ThirdPartyChannel>>(`/third-party-channels/${id}`, data);
}

/**
 * Delete third-party channel
 */
export async function deleteThirdPartyChannel(id: string) {
  return requestClient.delete<ApiResponse<any>>(`/third-party-channels/${id}`);
}

/**
 * Update bonus rate for channel
 */
export async function updateChannelBonusRate(id: string, bonusRate: number) {
  return requestClient.put<ApiResponse<any>>(`/third-party-channels/${id}/bonus-rate`, {
    bonusRate,
  });
}

/**
 * Get channel statistics
 */
export async function getChannelStatistics(params: ThirdPartyChannelListParams) {
  return requestClient.get<ApiResponse<any>>('/third-party-channels/statistics', {
    params,
  });
}

/**
 * Test channel connection
 */
export async function testChannelConnection(id: string) {
  return requestClient.post<ApiResponse<any>>(`/third-party-channels/${id}/test-connection`);
}

/**
 * Enable/disable channel
 */
export async function toggleChannelStatus(id: string, enabled: boolean) {
  return requestClient.request<ApiResponse<any>>(`/third-party-channels/${id}/toggle-status`, {
    method: 'PATCH',
    data: { enabled },
  });
}

const thirdPartyChannelApi = {
  getList: getThirdPartyChannelList,
  create: createThirdPartyChannel,
  update: updateThirdPartyChannel,
  delete: deleteThirdPartyChannel,
  updateBonusRate: updateChannelBonusRate,
  getStatistics: getChannelStatistics,
  testConnection: testChannelConnection,
  toggleStatus: toggleChannelStatus,
};

export default thirdPartyChannelApi; 