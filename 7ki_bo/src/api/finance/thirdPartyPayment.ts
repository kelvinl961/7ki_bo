import { requestClient } from '#/api/request';

// Interface for third-party withdrawal/payout provider (代付商户)
export interface ThirdPartyWithdrawalProvider {
  id?: string;
  currency: string; // 代付币种 (BTC, BRL, etc.)
  providerId: string; // 三方代付选择
  providerName: string; // 三方代付名称
  platformName: string; // 三方代付平台名
  merchantId: string; // 三方商户号
  merchantKey?: string; // 三方商户密钥
  successFlag: string; // 回调成功标识
  orderUrl: string; // 三方下单地址
  queryUrl: string; // 查询地址
  balanceQueryUrl?: string; // 余额查询地址
  callbackIp: string; // 三方回调IP
  withdrawalMethods?: string[]; // 提现方式
  minLimit: string; // 代付最小限额
  maxLimit: string; // 代付最大限额
  remarks?: string; // 备注
  enabled: boolean; // 启用状态
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any[];
}

const thirdPartyWithdrawalApi = {
  /**
   * Get third-party withdrawal providers list (代付商户列表)
   */
  getProviders: async (params?: any): Promise<ApiResponse<{ records: ThirdPartyWithdrawalProvider[]; total: number }>> => {
    const response = await requestClient.get('/withdrawal-providers', { params });
    return response;
  },

  /**
   * Create new third-party withdrawal provider (新增代付商户)
   */
  createProvider: async (data: ThirdPartyWithdrawalProvider): Promise<ApiResponse<ThirdPartyWithdrawalProvider>> => {
    const response = await requestClient.post('/withdrawal-providers', data);
    return response;
  },

  /**
   * Update third-party withdrawal provider (修改代付商户)
   */
  updateProvider: async (id: string, data: ThirdPartyWithdrawalProvider): Promise<ApiResponse<ThirdPartyWithdrawalProvider>> => {
    const response = await requestClient.put(`/withdrawal-providers/${id}`, data);
    return response;
  },

  /**
   * Delete third-party withdrawal provider (删除代付商户)
   */
  deleteProvider: async (id: string): Promise<ApiResponse> => {
    const response = await requestClient.delete(`/withdrawal-providers/${id}`);
    return response;
  },

  /**
   * Toggle provider status (切换启用状态)
   */
  toggleStatus: async (id: string): Promise<ApiResponse> => {
    const response = await requestClient.put(`/withdrawal-providers/${id}/toggle-status`);
    return response;
  },

  /**
   * Test provider connection (测试连接)
   */
  testConnection: async (id: string): Promise<ApiResponse> => {
    const response = await requestClient.post(`/withdrawal-providers/${id}/test-connection`);
    return response;
  },

  /**
   * Query account balance from Flex Payment API (查询三方商户余额)
   */
  queryAccountBalance: async (merchantNo?: string): Promise<ApiResponse<{
    balance: number;
    unsettledBalance: number;
    frozenAmount: number;
    currency: string;
  }>> => {
    const params = merchantNo ? { merchantNo } : {};
    const response = await requestClient.get('/flex-payment/balance', { params });
    return response;
  },

  /**
   * Get withdrawal categories for dropdown (获取提现大类选项)
   */
  getWithdrawalCategories: async (): Promise<ApiResponse<Array<{ label: string; value: string }>>> => {
    const response = await requestClient.get('/withdrawal-providers/categories');
    return response;
  }
};

export { thirdPartyWithdrawalApi };
