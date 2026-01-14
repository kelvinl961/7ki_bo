import { requestClient } from '#/api/request';

export interface RePaymentFilters {
  startDate?: string;
  endDate?: string;
  memberAccount?: string;
  thirdPartyPayment?: string;
  amount?: string;
  callbackStatus?: string;
  rePaymentType?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface RePaymentRecord {
  id: string;
  orderId: string;
  memberAccount: string;
  memberName: string;
  vipLevel: string;
  applicationTime: string;
  currency: string;
  amount: number;
  paymentMethod: string;
  paymentChannel: string;
  accountNumber: string;
  bankName: string;
  accountHolderName: string;
  status: string;
  callbackStatus: string;
  callbackError: string;
  retryCount: number;
  lastRetryTime: string;
  thirdPartyOrderNo: string;
  operator: string;
  notes: string;
  callbackLogs: Array<{
    timestamp: string;
    message: string;
    status: string;
  }>;
}

export interface GetCallbackExceptionsResponse {
  success: boolean;
  data: {
    withdrawals: RePaymentRecord[];
    statistics: {
      pendingRepayment: number;
      repaymentSuccess: number;
      repaymentFailed: number;
    };
    pagination: {
      current: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
  };
  message?: string;
}

export interface RePaymentRequest {
  paymentChannel: string;
  notes?: string;
  operatorId?: string;
}

export interface BulkRePaymentRequest {
  withdrawalIds: string[];
  paymentChannel: string;
  notes?: string;
  operatorId?: string;
}

export interface ManualProcessRequest {
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

export interface RePaymentStatistics {
  success: boolean;
  data: {
    totalExceptions: number;
    pendingRepayment: number;
    repaymentSuccess: number;
    repaymentFailed: number;
    repaymentRate: string;
  };
}

// API Methods
export const rePaymentApi = {
  /**
   * Get withdrawals with callback exceptions
   */
  async getCallbackExceptionWithdrawals(filters: RePaymentFilters): Promise<GetCallbackExceptionsResponse> {
    const response = await requestClient.get('/re-payment/callback-exceptions', { params: filters });
    return response.data;
  },

  /**
   * Initiate re-payment for single withdrawal
   */
  async initiateRePayment(withdrawalId: string, data: RePaymentRequest): Promise<OperationResponse> {
    const response = await requestClient.post(`/re-payment/withdrawals/${withdrawalId}/repayment`, data);
    return response.data;
  },

  /**
   * Bulk re-payment for multiple withdrawals
   */
  async bulkRePayment(data: BulkRePaymentRequest): Promise<BulkOperationResponse> {
    const response = await requestClient.post('/re-payment/withdrawals/bulk-repayment', data);
    return response.data;
  },

  /**
   * Mark withdrawal as manually processed
   */
  async markAsManuallyProcessed(withdrawalId: string, data: ManualProcessRequest): Promise<OperationResponse> {
    const response = await requestClient.post(`/re-payment/withdrawals/${withdrawalId}/manual-process`, data);
    return response.data;
  },

  /**
   * Get re-payment statistics
   */
  async getRePaymentStatistics(params?: { startDate?: string; endDate?: string }): Promise<RePaymentStatistics> {
    const response = await requestClient.get('/re-payment/statistics', { params });
    return response.data;
  },

  /**
   * Export re-payment data
   */
  async exportRePaymentData(filters: RePaymentFilters): Promise<Blob> {
    const response = await requestClient.get('/re-payment/export', { 
      params: filters,
      responseType: 'blob' 
    });
    return response.data;
  }
};
