import { requestClient } from '#/api/request';

/** Statuses that mean "已完成操作", excluded from 财务出款 list when unlockedOnly. 付款失败(payment_failed)不在此列，允许参与 备注/取消/拒绝/审核出款/人工出款/回调/代付 等批量操作 */
const COMPLETED_STATUSES = [
  'completed',
  'approved',
  'success',
  'rejected',
  'failed',
  'cancelled',
  'canceled',
  'force_withdrawn',
] as const;

export function isCompletedWithdrawalStatus(status: string): boolean {
  return COMPLETED_STATUSES.includes(status as (typeof COMPLETED_STATUSES)[number]);
}

export interface FinanceWithdrawalFilters {
  startDate?: string;
  endDate?: string;
  memberAccount?: string;
  /** 会员展示 ID（userID） */
  userId?: string;
  /** 提现订单号 */
  orderId?: string;
  thirdPartyPayment?: string;
  amount?: string;
  withdrawalMethod?: string;
  approvalStatus?: string;
  operator?: string;
  assignedToMe?: boolean;
  /** 仅返回未锁定的订单（财务出款用） */
  unlockedOnly?: boolean;
  /** 排除已完成的订单（财务出款用） */
  excludeCompleted?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface WithdrawalRecord {
  id: string;
  orderId: string;
  memberAccount: string;
  memberName: string;
  vipLevel: string;
  applicationTime: string;
  currency: string;
  amount: number;
  paymentMethod: string;
  paymentGateway: string;
  accountNumber: string;
  bankName: string;
  accountHolderName: string;
  status: string;
  operator: string;
  fees: number;
  notes: string;
  processingTime?: string;
  completedAt?: string;
  rejectionReason?: string;
  assignedProcessor?: string;
  thirdPartyOrderNo?: string;
  merchantOrderNo?: string;
  providerStatus?: string;
}

export interface GetWithdrawalsResponse {
  success: boolean;
  data: {
    pagination: {
      current: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
    withdrawals: WithdrawalRecord[];
  };
  message?: string;
}

export interface ProcessRequest {
  action: 'confirm' | 'reject';
  notes?: string;
  operatorId?: string;
}

export interface AssignRequest {
  operatorId?: string;
}

export interface BulkProcessRequest {
  withdrawalIds: string[];
  action: 'confirm' | 'reject';
  notes?: string;
  operatorId?: string;
}

export interface BulkAssignRequest {
  withdrawalIds: string[];
  operatorId?: string;
}

export interface BulkOperationResponse {
  success: boolean;
  message: string;
  data: {
    results: Array<{
      id: string;
      message: string;
      success: boolean;
    }>;
  };
}

export interface OperationResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface ForceCancelRequest {
  frontendReason: string;
  backendReason: string;
}

export interface ForceRejectRequest {
  windControlProcess: 'add_audit' | 'deduct_balance' | 'no';
  auditTask?: {
    multiplier: number;
    platforms: { [key: string]: boolean };
    selectedPlatform: string;
  };
  frontendReason: string;
  backendReason: string;
}

// API Methods
export const financeWithdrawalApi = {
  /**
   * Get withdrawals for finance processing
   */
  async getWithdrawalsForProcessing(
    filters: FinanceWithdrawalFilters,
  ): Promise<GetWithdrawalsResponse> {
    const response = await requestClient.get(
      '/wallet/finance-withdrawal/withdrawals',
      { params: filters },
    );
    // Response interceptor returns the whole response object for success: true format
    return response;
  },

  /**
   * Lock or unlock withdrawal order
   */
  async lockWithdrawal(
    withdrawalId: string,
    action: 'lock' | 'unlock',
  ): Promise<OperationResponse> {
    const response = await requestClient.post(
      `/wallet/finance-withdrawal/withdrawals/${withdrawalId}/lock`,
      { action },
    );
    // Response interceptor returns the whole response object for success: true format
    return response;
  },

  /**
   * Process withdrawal (confirm or reject)
   */
  async processWithdrawal(
    withdrawalId: string,
    data: ProcessRequest,
  ): Promise<OperationResponse> {
    const response = await requestClient.post(
      `/wallet/finance-withdrawal/withdrawals/${withdrawalId}/process`,
      data,
    );
    // Response interceptor returns the whole response object for success: true format
    return response;
  },

  /**
   * Assign withdrawal to processor
   */
  async assignWithdrawal(
    withdrawalId: string,
    data: AssignRequest,
  ): Promise<OperationResponse> {
    const response = await requestClient.post(
      `/wallet/finance-withdrawal/withdrawals/${withdrawalId}/assign`,
      data,
    );
    // Response interceptor returns the whole response object for success: true format
    return response;
  },

  /**
   * Bulk process withdrawals
   */
  async bulkProcess(data: BulkProcessRequest): Promise<BulkOperationResponse> {
    const response = await requestClient.post(
      '/wallet/finance-withdrawal/withdrawals/bulk-process',
      data,
    );
    // Response interceptor returns the whole response object for success: true format
    return response;
  },

  /**
   * Bulk assign withdrawals
   */
  async bulkAssign(data: BulkAssignRequest): Promise<BulkOperationResponse> {
    const response = await requestClient.post(
      '/wallet/finance-withdrawal/withdrawals/bulk-assign',
      data,
    );
    // Response interceptor returns the whole response object for success: true format
    return response;
  },

  /**
   * Get finance withdrawal statistics
   */
  async getFinanceWithdrawalStats(params?: {
    endDate?: string;
    startDate?: string;
  }): Promise<any> {
    const response = await requestClient.get(
      '/wallet/finance-withdrawal/statistics',
      { params },
    );
    // Response interceptor returns the whole response object for success: true format
    return response;
  },

  /**
   * Export finance withdrawal data
   */
  async exportFinanceWithdrawalData(
    filters: FinanceWithdrawalFilters,
  ): Promise<Blob> {
    const response = await requestClient.get(
      '/wallet/finance-withdrawal/export',
      {
        params: filters,
        responseType: 'blob',
      },
    );
    // For blob responses, return response.data directly
    return response.data;
  },

  /**
   * Force cancel withdrawal
   */
  async forceCancel(
    withdrawalId: string,
    data: ForceCancelRequest,
  ): Promise<OperationResponse> {
    const response = await requestClient.post(
      `/wallet/finance-withdrawal/withdrawals/${withdrawalId}/force-cancel`,
      data,
    );
    return response;
  },

  /**
   * Force reject withdrawal with optional audit task
   */
  async forceReject(
    withdrawalId: string,
    data: ForceRejectRequest,
  ): Promise<OperationResponse> {
    const response = await requestClient.post(
      `/wallet/finance-withdrawal/withdrawals/${withdrawalId}/force-reject`,
      data,
    );
    return response;
  },

  /**
   * Approve withdrawal for processing
   */
  async approveWithdrawal(withdrawalId: string): Promise<OperationResponse> {
    const response = await requestClient.post(
      `/wallet/finance-withdrawal/withdrawals/${withdrawalId}/approve`,
    );
    return response;
  },

  /**
   * Manual withdrawal (mark as completed without third-party payment)
   */
  async manualWithdrawal(withdrawalId: string): Promise<OperationResponse> {
    const response = await requestClient.post(
      `/wallet/finance-withdrawal/withdrawals/${withdrawalId}/manual-withdrawal`,
    );
    return response;
  },

  /**
   * Get tab counts for notification badges
   */
  async getTabCounts(): Promise<{
    data: {
      autoApprovalCount: number;
      financeCount: number;
      myRiskCount: number;
      myWithdrawalCount: number;
      riskReviewCount: number;
    };
    message?: string;
    success: boolean;
  }> {
    const response = await requestClient.get(
      '/wallet/finance-withdrawal/tab-counts',
    );
    return response;
  },

  /**
   * Update withdrawal notes
   */
  async updateNote(
    withdrawalId: string,
    data: {
      backendNotes?: string;
      frontendNotes?: string;
      systemNotes?: string;
    },
  ): Promise<OperationResponse> {
    const response = await requestClient.put(
      `/wallet/withdrawals/${withdrawalId}/note`,
      data,
    );
    return response;
  },
};
