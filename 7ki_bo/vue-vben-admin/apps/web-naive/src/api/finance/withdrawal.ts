import { requestClient } from '#/api/request';

// Types
export interface WithdrawOrder {
  orderId: string;
  memberId: string;
  accountName: string;
  vipLevel: string;
  memberTag: string;
  appliedAt: string;
  withdrawAmount: number;
  currency: string;
  estimatedReceived: number;
  fee: number;
  rechargeWithdrawCount: {
    rechargeCount: number;
    withdrawCount: number;
    duplicateIP: number;
  };
  withdrawChannelInfo: {
    method: string;
    name: string;
    address: string;
    type: string;
    cpf: string;
  };
  status: string;
  backendNote?: string;
  frontendNote?: string;
  agencyNote?: string;
  // Lock-related fields
  isLocked?: boolean;
  lockedBy?: string;
  lockedAt?: string;
}

export interface WithdrawListParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  startDate?: string;
  endDate?: string;
  thirdPartyPayment?: string;
  status?: string;
  withdrawMethod?: string;
  vipLevel?: string;
  agentMode?: string;
  serviceFilter?: string;
  search?: string;
}

export interface WithdrawListResponse {
  success: boolean;
  data: {
    records: WithdrawOrder[];
    total: number;
    summary: {
      totalCount: number;
      totalAmount: number;
    };
  };
}

export interface CreateWithdrawParams {
  memberId: string;
  amount: number;
  withdrawMethod: string;
  paymentInfo: string;
  note?: string;
  pin?: string; // ✅ FIX: Add PIN field for withdrawal PIN verification (user withdrawals only)
}

export interface UpdateWithdrawParams {
  amount?: number;
  withdrawMethod?: string;
  paymentInfo?: string;
  note?: string;
  status?: string;
}

export interface UpdateNoteParams {
  frontendNotes?: string;
  backendNotes?: string;
  systemNotes?: string;
}

export interface BatchOperationParams {
  orderIds: string[];
  action: string;
  status?: string;
  reason: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
}

// API Client
export const withdrawalApi = {
  // Get withdrawal list with pagination and filtering
  getList: async (params: WithdrawListParams): Promise<WithdrawListResponse> => {
    const response = await requestClient.get('/wallet/withdrawals', { params });
    // 🚨 FIX: Response interceptor already extracts data, don't access .data again
    return response;
  },

  // Get withdrawal details by ID
  getById: async (orderId: string): Promise<ApiResponse<WithdrawOrder>> => {
    const response = await requestClient.get(`/wallet/withdrawals/${orderId}`);
    return response.data;
  },

  // Create new withdrawal order
  create: async (params: CreateWithdrawParams): Promise<ApiResponse<WithdrawOrder>> => {
    const response = await requestClient.post('/wallet/withdrawals', params);
    return response.data;
  },

  // Update withdrawal order
  update: async (orderId: string, params: UpdateWithdrawParams): Promise<ApiResponse<WithdrawOrder>> => {
    const response = await requestClient.put(`/wallet/withdrawals/${orderId}`, params);
    return response.data;
  },

  // Delete withdrawal order
  delete: async (orderId: string): Promise<ApiResponse> => {
    const response = await requestClient.delete(`/wallet/withdrawals/${orderId}`);
    return response.data;
  },

  // Lock withdrawal order
  lockOrder: async (orderId: string): Promise<ApiResponse> => {
    const response = await requestClient.post(`/wallet/withdrawals/${orderId}/lock`);
    return response.data;
  },

  // Unlock withdrawal order
  unlockOrder: async (orderId: string): Promise<ApiResponse> => {
    const response = await requestClient.post(`/wallet/withdrawals/${orderId}/unlock`);
    return response.data;
  },

  // Toggle lock/unlock withdrawal order
  toggleLock: async (orderId: string, action: 'lock' | 'unlock'): Promise<ApiResponse> => {
    const response = await requestClient.post(`/wallet/withdrawals/${orderId}/lock`, { action });
    return response.data;
  },

  // Update withdrawal status
  updateStatus: async (orderId: string, status: string, reason?: string): Promise<ApiResponse> => {
    const response = await requestClient.put(`/wallet/withdrawals/${orderId}/status`, {
      status,
      reason
    });
    return response.data;
  },

  // Update withdrawal note
  updateNote: async (orderId: string, params: UpdateNoteParams): Promise<ApiResponse> => {
    const response = await requestClient.put(`/wallet/withdrawals/${orderId}/note`, params);
    return response.data;
  },

  // Approve withdrawal
  approve: async (orderId: string, reason?: string): Promise<ApiResponse> => {
    const response = await requestClient.post(`/wallet/withdrawals/${orderId}/approve`, {
      reason
    });
    return response.data;
  },

  // Reject withdrawal
  reject: async (orderId: string, reason: string): Promise<ApiResponse> => {
    const response = await requestClient.post(`/wallet/withdrawals/${orderId}/reject`, {
      reason
    });
    return response.data;
  },

  // Process withdrawal (mark as completed)
  process: async (orderId: string, transactionId?: string): Promise<ApiResponse> => {
    const response = await requestClient.post(`/wallet/withdrawals/${orderId}/process`, {
      transactionId
    });
    return response.data;
  },

  // Batch operations
  batchOperation: async (params: BatchOperationParams): Promise<ApiResponse> => {
    const response = await requestClient.post('/wallet/withdrawals/batch', params);
    return response.data;
  },

  // Batch lock
  batchLock: async (orderIds: string[], reason: string): Promise<ApiResponse> => {
    const response = await requestClient.post('/wallet/withdrawals/batch/lock', {
      orderIds,
      reason
    });
    return response.data;
  },

  // Batch unlock
  batchUnlock: async (orderIds: string[], reason: string): Promise<ApiResponse> => {
    const response = await requestClient.post('/wallet/withdrawals/batch/unlock', {
      orderIds,
      reason
    });
    return response.data;
  },

  // Batch approve
  batchApprove: async (orderIds: string[], reason: string): Promise<ApiResponse> => {
    const response = await requestClient.post('/wallet/withdrawals/batch/approve', {
      orderIds,
      reason
    });
    return response.data;
  },

  // Batch reject
  batchReject: async (orderIds: string[], reason: string): Promise<ApiResponse> => {
    const response = await requestClient.post('/wallet/withdrawals/batch/reject', {
      orderIds,
      reason
    });
    return response.data;
  },

  // Export data
  exportData: async (params: WithdrawListParams): Promise<ApiResponse<Blob>> => {
    const response = await requestClient.get('/wallet/withdrawals/export', {
      params,
      responseType: 'blob'
    });
    return {
      success: true,
      data: response.data
    };
  },

  // Get withdrawal statistics
  getStatistics: async (params: {
    startDate?: string;
    endDate?: string;
    groupBy?: 'day' | 'week' | 'month';
  }): Promise<ApiResponse> => {
    const response = await requestClient.get('/wallet/withdrawals/statistics', { params });
    return response.data;
  },

  // Get withdrawal channels
  getChannels: async (): Promise<ApiResponse> => {
    const response = await requestClient.get('/wallet/withdrawals/channels');
    return response.data;
  },

  // Get withdrawal limits
  getLimits: async (vipLevel?: string): Promise<ApiResponse> => {
    const response = await requestClient.get('/wallet/withdrawals/limits', {
      params: { vipLevel }
    });
    return response.data;
  },

  // Manual create withdrawal order
  createOrder: async (params: {
    memberId: string;
    amount: number;
    currency: string;
    method: string;
    accountInfo: any;
    reason?: string;
  }): Promise<ApiResponse> => {
    const response = await requestClient.post('/wallet/withdrawals', params);
    return response.data;
  },

  // Get audit logs for withdrawal
  getAuditLogs: async (orderId: string): Promise<ApiResponse> => {
    const response = await requestClient.get(`/wallet/withdrawals/${orderId}/audit-logs`);
    return response.data;
  }
};

// Types are already exported above with their declarations 