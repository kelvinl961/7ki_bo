import { requestClient } from '#/api/request';

export interface RiskControlFilters {
  startDate?: string;
  endDate?: string;
  memberId?: string;
  memberAccount?: string;
  /** 会员展示 ID（userID） */
  userId?: string;
  /** 提现订单号 */
  orderId?: string;
  applicationTime?: string;
  memberCurrency?: string;
  withdrawalAmount?: string;
  expectedCurrency?: string;
  approvalAmount?: string;
  paymentMethod?: string;
  operator?: string;
  beforeAmount?: string;
  afterAmount?: string;
  assignedToMe?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface WithdrawalRecord {
  id: string;
  orderId: string;
  memberId: string;
  memberAccount: string;
  memberName: string;
  vipLevel: string;
  applicationTime: string;
  memberCurrency: string;
  withdrawalAmount: number;
  expectedCurrency: string;
  approvalAmount: number;
  paymentMethod: string;
  paymentGateway: string;
  bankAccount: string;
  bankName: string;
  accountHolderName: string;
  status: string;
  operator: string;
  beforeAmount: number;
  afterAmount: number;
  createdAt: string;
  updatedAt: string;
  processingTime?: string;
  completedAt?: string;
  rejectionReason?: string;
  description?: string;
  fees: number;
  riskScore?: number;
  riskLevel?: string;
  riskFlags?: string[];
}

export interface RiskAssessment {
  score: number;
  level: 'HIGH' | 'LOW' | 'MEDIUM';
  flags: string[];
}

export interface WithdrawalDetail extends WithdrawalRecord {
  riskAssessment?: RiskAssessment;
  user?: {
    account: string;
    cpf?: string;
    deposits?: any[];
    id: number;
    name?: string;
    vipLevel?: {
      level: number;
      name: string;
    };
    withdrawals?: any[];
  };
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

export interface WithdrawalDetailResponse {
  success: boolean;
  data: {
    bettingStatistics?: {
      today: {
        betAmount: string;
        betCount: number;
        bonus: string;
        deposit: string;
        difference: string;
        period: string;
        profit: string;
        withdrawal: string;
      };
    };
    memberInfo?: {
      account: string;
      balance: number;
      depositCount: number;
      depositWithdrawalDiff: number;
      duplicateIpCount: number;
      id: number;
      memberTier: {
        tierCode: null | string;
        tierName: string;
      };
      name: string;
      registrationDomain: string;
      totalDeposit: number;
      totalWithdrawal: number;
      userID?: string;
      vipLevel: null | {
        level: number;
        name: string;
      };
      withdrawalCount: number;
    };
    riskAssessment: RiskAssessment;
    withdrawal: WithdrawalDetail;
  };
  message?: string;
}

export interface ApprovalRequest {
  confirmedAmount?: number;
  notes?: string;
  operatorId?: string;
}

export interface RejectionRequest {
  reason: string;
  notes?: string;
  operatorId?: string;
}

export interface BulkApprovalRequest {
  withdrawalIds: string[];
  notes?: string;
  operatorId?: string;
}

export interface BulkRejectionRequest {
  withdrawalIds: string[];
  reason: string;
  notes?: string;
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

// API Methods using the correct requestClient pattern
export const riskControlApi = {
  /**
   * Get withdrawals for risk control review
   */
  async getWithdrawalsForReview(
    filters: RiskControlFilters,
  ): Promise<GetWithdrawalsResponse> {
    const response = await requestClient.get('/risk-control/withdrawals', {
      params: filters,
    });
    // Response interceptor returns the whole response object for success: true format
    return response;
  },

  /**
   * Get withdrawal details for review
   */
  async getWithdrawalDetails(
    withdrawalId: string,
  ): Promise<WithdrawalDetailResponse> {
    const response = await requestClient.get(
      `/risk-control/withdrawals/${withdrawalId}`,
    );
    // Response interceptor returns the whole response object for success: true format
    return response;
  },

  /**
   * Approve withdrawal
   */
  async approveWithdrawal(
    withdrawalId: string,
    data: ApprovalRequest,
  ): Promise<OperationResponse> {
    const response = await requestClient.post(
      `/risk-control/withdrawals/${withdrawalId}/approve`,
      data,
    );
    // Response interceptor returns the whole response object for success: true format
    return response;
  },

  /**
   * Reject withdrawal
   */
  async rejectWithdrawal(
    withdrawalId: string,
    data: RejectionRequest,
  ): Promise<OperationResponse> {
    const response = await requestClient.post(
      `/risk-control/withdrawals/${withdrawalId}/reject`,
      data,
    );
    // Response interceptor returns the whole response object for success: true format
    return response;
  },

  /**
   * Lock withdrawal for review
   */
  async lockWithdrawal(withdrawalId: string): Promise<OperationResponse> {
    const response = await requestClient.post(
      `/risk-control/withdrawals/${withdrawalId}/lock`,
    );
    // Response interceptor returns the whole response object for success: true format
    return response;
  },

  /**
   * Unlock withdrawal
   */
  async unlockWithdrawal(withdrawalId: string): Promise<OperationResponse> {
    const response = await requestClient.post(
      `/risk-control/withdrawals/${withdrawalId}/unlock`,
    );
    // Response interceptor returns the whole response object for success: true format
    return response;
  },

  /**
   * Force cancel withdrawal (return funds to user)
   */
  async forceCancelWithdrawal(
    withdrawalId: string,
    data: { backendReason?: string; frontendReason?: string; reason: string },
  ): Promise<OperationResponse> {
    const response = await requestClient.post(
      `/risk-control/withdrawals/${withdrawalId}/force-cancel`,
      data,
    );
    // Response interceptor returns the whole response object for success: true format
    return response;
  },

  /**
   * Bulk approve withdrawals
   */
  async bulkApprove(data: BulkApprovalRequest): Promise<BulkOperationResponse> {
    const response = await requestClient.post(
      '/risk-control/withdrawals/bulk-approve',
      data,
    );
    // Response interceptor returns the whole response object for success: true format
    return response;
  },

  /**
   * Bulk reject withdrawals
   */
  async bulkReject(data: BulkRejectionRequest): Promise<BulkOperationResponse> {
    const response = await requestClient.post(
      '/risk-control/withdrawals/bulk-reject',
      data,
    );
    // Response interceptor returns the whole response object for success: true format
    return response;
  },

  /**
   * Get risk control statistics
   */
  async getRiskControlStats(params?: {
    endDate?: string;
    startDate?: string;
  }): Promise<any> {
    const response = await requestClient.get('/risk-control/statistics', {
      params,
    });
    // Response interceptor returns the whole response object for success: true format
    return response;
  },

  /**
   * Export risk control data
   */
  async exportRiskControlData(filters: RiskControlFilters): Promise<Blob> {
    const response = await requestClient.get('/risk-control/export', {
      params: filters,
      responseType: 'blob',
    });
    // For blob responses, return response.data directly
    return response.data;
  },

  /**
   * Force cancel withdrawal (alias for compatibility)
   */
  async forceCancel(
    withdrawalId: string,
    data: { backendReason: string; frontendReason: string },
  ): Promise<OperationResponse> {
    return this.forceCancelWithdrawal(withdrawalId, {
      reason: data.frontendReason || data.backendReason,
      frontendReason: data.frontendReason,
      backendReason: data.backendReason,
    });
  },

  /**
   * Force reject withdrawal with audit task
   */
  async forceReject(
    withdrawalId: string,
    data: {
      auditTask?: {
        multiplier: number;
        platforms: { [key: string]: boolean };
        selectedPlatform: string;
      };
      backendReason: string;
      frontendReason: string;
      windControlProcess: 'add_audit' | 'deduct_balance' | 'no';
    },
  ): Promise<OperationResponse> {
    const response = await requestClient.post(
      `/risk-control/withdrawals/${withdrawalId}/force-reject`,
      data,
    );
    return response;
  },
};
