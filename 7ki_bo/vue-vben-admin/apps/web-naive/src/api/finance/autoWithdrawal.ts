import { requestClient } from '#/api/request';

export interface AutoWithdrawalFilters {
  startDate?: string;
  endDate?: string;
  memberAccount?: string;
  thirdPartyPayment?: string;
  amount?: string;
  withdrawalMethod?: string;
  autoRule?: string;
  vipLevel?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AutoWithdrawalRecord {
  id: string;
  orderId: string;
  memberAccount: string;
  memberName: string;
  vipLevel: string;
  applicationTime: string;
  currency: string;
  amount: number;
  withdrawalMethod: string;
  paymentChannel: string;
  accountNumber: string;
  bankName: string;
  accountHolderName: string;
  status: string;
  autoRule: string;
  accountAge: number;
  depositCount: number;
  daysSinceLastLogin: number;
  operator: string;
  notes: string;
  todayWithdrawalAmount: number;
  eligibilityScore: number;
}

export interface AutoWithdrawalRules {
  minVipLevel: string;
  vipMaxAmount: number;
  minAccountAge: number;
  maxLastLoginDays: number;
  minDepositCount: number;
  depositWithdrawRatio: number;
  maxSingleAmount: number;
  dailyMaxAmount: number;
  enableVipAuto: boolean;
  enableSmallAmountAuto: boolean;
  enableOldUserAuto: boolean;
  enableFrequentUserAuto: boolean;
}

export interface GetAutoEligibleResponse {
  success: boolean;
  data: {
    withdrawals: AutoWithdrawalRecord[];
    statistics: {
      autoApprovalEligible: number;
      todayAutoProcessed: number;
      totalAmount: number;
    };
    autoRules: AutoWithdrawalRules;
    pagination: {
      current: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
  };
  message?: string;
}

export interface AutoApprovalRequest {
  notes?: string;
  operatorId?: string;
}

export interface BulkAutoApprovalRequest {
  withdrawalIds: string[];
  notes?: string;
  operatorId?: string;
}

export interface BulkOperationResponse {
  success: boolean;
  message: string;
  data: {
    results: Array<{
      id: string;
      success: boolean;
      message: string;
    }>;
  };
}

export interface OperationResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface AutoWithdrawalStatistics {
  success: boolean;
  data: {
    totalAutoApproved: number;
    todayAutoApproved: number;
    autoApprovalRate: string;
    avgProcessingTime: string;
    autoRulesActive: number;
  };
}

export interface AutoRulesResponse {
  success: boolean;
  data: AutoWithdrawalRules;
}

// API Methods
export const autoWithdrawalApi = {
  /**
   * Get withdrawals eligible for auto-approval
   */
  async getAutoEligibleWithdrawals(filters: AutoWithdrawalFilters): Promise<GetAutoEligibleResponse> {
    const response = await requestClient.get('/wallet/auto-withdrawal/eligible-withdrawals', { params: filters });
    return response; // Return full response with success flag
  },

  /**
   * Process auto-approval for single withdrawal
   */
  async processAutoApproval(withdrawalId: string, data: AutoApprovalRequest): Promise<OperationResponse> {
    const response = await requestClient.post(`/wallet/auto-withdrawal/withdrawals/${withdrawalId}/auto-approve`, data);
    return response; // Return full response with success flag
  },

  /**
   * Bulk auto-approval for multiple withdrawals
   */
  async bulkAutoApproval(data: BulkAutoApprovalRequest): Promise<BulkOperationResponse> {
    const response = await requestClient.post('/wallet/auto-withdrawal/withdrawals/bulk-auto-approve', data);
    return response; // Return full response with success flag
  },

  /**
   * Get auto-approval rules
   */
  async getAutoApprovalRules(): Promise<AutoRulesResponse> {
    const response = await requestClient.get('/wallet/auto-withdrawal/rules');
    return response; // Return full response with success flag
  },

  /**
   * Update auto-approval rules
   */
  async updateAutoApprovalRules(rules: AutoWithdrawalRules): Promise<OperationResponse> {
    const response = await requestClient.put('/wallet/auto-withdrawal/rules', rules);
    return response; // Return full response with success flag
  },

  /**
   * Get auto-withdrawal statistics
   */
  async getAutoWithdrawalStatistics(params?: { startDate?: string; endDate?: string }): Promise<AutoWithdrawalStatistics> {
    const response = await requestClient.get('/wallet/auto-withdrawal/statistics', { params });
    return response; // Return full response with success flag
  },

  /**
   * Export auto-withdrawal data
   */
  async exportAutoWithdrawalData(filters: AutoWithdrawalFilters): Promise<Blob> {
    const response = await requestClient.get('/wallet/auto-withdrawal/export', { 
      params: filters,
      responseType: 'blob' 
    });
    return response.data; // Blob data doesn't need success flag
  }
};
