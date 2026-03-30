import { requestClient } from '#/api/request';

// Types
export interface RechargeOrder {
  orderId: string;
  memberId: string;
  userId?: number; // Internal database ID for UserDetailModal
  accountName: string;
  vipLevel: string;
  memberTag: string;
  appliedAt: string;
  rechargeAmount: number;
  currency: string;
  actualReceived: number;
  fee: number;
  rechargeChannelInfo: {
    accountNumber?: string;
    bankName?: string;
    channel: string;
    method: string;
    type: string;
  };
  status: string;
  backendNote?: string;
  frontendNote?: string;
  agencyNote?: string;
  confirmTime?: string;
  confirmBy?: string;
  updatedAt?: string;
  // Additional fields for order details
  bonusAmount?: number;
  channelName?: string;
  channelCode?: string;
  auditMultiplier?: number;
  isFirstDeposit?: boolean;
  receivingAccount?: string;
  operator?: string;
  thirdPartyOrderNo?: string;
}

export interface RechargeListParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  startDate?: string;
  endDate?: string;
  status?: null | string; // Allow null for frontend compatibility
  rechargeMethod?: null | string;
  vipLevel?: null | string;
  agentMode?: null | string;
  serviceFilter?: null | string;
  search?: string;
  /** 与会员列表等接口一致的按字段搜索（若后端支持） */
  searchField?: string;
  searchValue?: string;
  searchMode?: 'exact' | 'fuzzy';
  /** 与会员列表等接口一致的综合搜索条件（若后端支持） */
  searchCondition?: string;
  searchConditionValue?: string;
}

export interface RechargeListResponse {
  records: RechargeOrder[];
  total: number;
  summary: {
    confirmedCount: number;
    pendingCount: number;
    rejectedCount: number;
    totalAmount: number;
    totalCount: number;
  };
}

export interface CreateRechargeParams {
  memberId: string;
  amount: number;
  rechargeMethod: string;
  channelInfo: string;
  note?: string;
}

export interface UpdateRechargeParams {
  amount?: number;
  rechargeMethod?: string;
  channelInfo?: string;
  note?: string;
  status?: string;
}

export interface UpdateNoteParams {
  type: 'agency' | 'backend' | 'frontend';
  content: string;
}

export interface Summary {
  totalCount: number;
  totalAmount: number;
  pendingCount: number;
  confirmedCount: number;
  rejectedCount: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// API Client
export const rechargeApi = {
  // Get recharge list with pagination and filtering
  // ✅ FIX: Changed to /wallet/recharges (wallet namespace)
  getList: async (
    params: RechargeListParams,
  ): Promise<RechargeListResponse> => {
    const response = await requestClient.get('/wallet/recharges', { params });
    return response as unknown as RechargeListResponse;
  },

  // Get recharge details by ID
  // ✅ FIX: Changed to /wallet/recharges (wallet namespace)
  getById: async (orderId: string): Promise<ApiResponse<RechargeOrder>> => {
    const response = await requestClient.get(`/wallet/recharges/${orderId}`);
    // ✅ FIX: Backend returns { success: true, data: {...} }, requestClient.get returns response.data
    // So we get { success: true, data: {...} } directly
    return response.data || response;
  },

  // Create new recharge order
  // ✅ FIX: Changed to /wallet/recharges (wallet namespace)
  create: async (
    params: CreateRechargeParams,
  ): Promise<ApiResponse<RechargeOrder>> => {
    const response = await requestClient.post('/wallet/recharges', params);
    return response.data;
  },

  // Update recharge order
  // ✅ FIX: Changed to /wallet/recharges (wallet namespace)
  update: async (
    orderId: string,
    params: UpdateRechargeParams,
  ): Promise<ApiResponse<RechargeOrder>> => {
    const response = await requestClient.put(
      `/wallet/recharges/${orderId}`,
      params,
    );
    return response.data;
  },

  // Delete recharge order
  // ✅ FIX: Changed to /wallet/recharges (wallet namespace)
  delete: async (orderId: string): Promise<ApiResponse<void>> => {
    const response = await requestClient.delete(`/wallet/recharges/${orderId}`);
    return response.data;
  },

  // Update recharge status
  // ✅ FIX: Changed to /wallet/recharges (wallet namespace)
  updateStatus: async (
    orderId: string,
    status: string,
  ): Promise<ApiResponse<RechargeOrder>> => {
    const response = await requestClient.put(
      `/wallet/recharges/${orderId}/status`,
      { status },
    );
    return response.data;
  },

  // Update recharge note
  // ✅ FIX: Changed to /wallet/recharges (wallet namespace)
  updateNote: async (
    orderId: string,
    params: UpdateNoteParams,
  ): Promise<ApiResponse<RechargeOrder>> => {
    const response = await requestClient.put(
      `/wallet/recharges/${orderId}/note`,
      params,
    );
    return response.data;
  },

  // Bulk status update
  // ✅ FIX: Changed to /wallet/recharges (wallet namespace)
  bulkUpdateStatus: async (
    orderIds: string[],
    status: string,
  ): Promise<ApiResponse<void>> => {
    const response = await requestClient.put('/wallet/recharges/bulk-status', {
      orderIds,
      status,
    });
    return response.data;
  },

  // Export data
  // ✅ FIX: Changed to /wallet/recharges (wallet namespace)
  export: async (params: RechargeListParams): Promise<Blob> => {
    const response = await requestClient.get('/wallet/recharges/export', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },

  // Get recharge statistics
  // ✅ FIX: Changed to /wallet/recharges (wallet namespace)
  getStats: async (params: {
    endDate?: string;
    startDate?: string;
  }): Promise<ApiResponse<Summary>> => {
    const response = await requestClient.get('/wallet/recharges/stats', {
      params,
    });
    return response.data;
  },
};
