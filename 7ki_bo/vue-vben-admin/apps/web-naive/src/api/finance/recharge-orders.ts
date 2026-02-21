import { requestClient } from '#/api/request';

export interface RechargeOrder {
  id: string;
  orderId: string;
  memberId: number;
  memberAccount: string;
  memberName: string;
  vipLevel: string;
  rechargeAmount: number;
  currency: string;
  // Transaction-specific fields (need new columns):
  channelCurrency?: string;        // Channel currency for this transaction
  channelAmount?: number;          // Amount in channel currency for this transaction
  exchangeRate?: number;           // Exchange rate used for this transaction
  conversionRatio?: number;        // Conversion ratio used for this transaction

  channelFeeRate?: number;         // Channel fee rate at time of transaction (audit trail)
  errorDetails?: string;           // Transaction-specific error details
  errorCode?: string;              // Transaction-specific error code
  thirdPartyPayment: string;
  channelName: string;
  channelCode: string;
  merchantId: string;
  orderType: 'NORMAL' | 'PRESET' | 'SUPPLEMENT';
  status: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'TIMEOUT' | 'REFUNDED';
  submitTime: string;
  paymentTime?: string;
  completeTime?: string;
  notifyTime?: string;
  balanceBefore: number;
  balanceAfter?: number;
  actualAmount?: number;
  bonusAmount: number;
  fees: number;
  remark?: string;
  paymentUrl?: string;
  thirdPartyOrderId?: string;
  callbackData?: any;
  createdAt: string;
  updatedAt: string;
  // Relations (retrieved via JOINs):
  user?: {
    id: number;
    userID?: string;                // Add userID field
    account: string;
    name: string;
    balance: number;
    email: string;
    currency?: string;              // Member currency from User table
    vipLevel?: {
      id: number;
      name: string;
    };
    memberTier?: {
      id: number;
      tierName: string;
      tierCode: string;
      // Member tier info can include conversion ratios, currency preferences, etc.
    };
  };
  channel?: {
    id: string;
    channelCode: string;
    channelName: string;
    currency: string;               // Channel's native currency
    feeRate: number;               // Platform fee rate
    channelFeeRate: number;        // Channel-specific fee rate 
    bonusRate: number;             // Basic bonus percentage (from JOIN)
    bonusConfig?: any;             // Advanced bonus configuration (JSON from JOIN)
    // Other channel info...
  };
}

export interface RechargeOrderListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  orderType?: string;
  thirdPartyPayment?: string;
  channelName?: string;
  channel?: string;                // Add channel filter
  currency?: string;
  vipLevel?: string;
  startDate?: string;
  endDate?: string;
}

export interface RechargeOrderListResponse {
  success: boolean;
  data: {
    orders: RechargeOrder[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
    statistics: {
      totalOrders: number;
      totalRechargeAmount: number;
      totalActualAmount: number;
      totalBonusAmount: number;
      totalFees: number;
    };
  };
}

export interface CreateRechargeOrderData {
  memberId: number;
  memberAccount: string;
  memberName: string;
  vipLevel?: string;
  rechargeAmount: number;
  currency?: string;
  thirdPartyPayment: string;
  channelName: string;
  channelCode: string;
  merchantId: string;
  orderType?: 'NORMAL' | 'PRESET' | 'SUPPLEMENT';
  balanceBefore: number;
  bonusAmount?: number;
  fees?: number;
  remark?: string;
}

export interface UpdateRechargeOrderData {
  status?: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'TIMEOUT' | 'REFUNDED';
  actualAmount?: number;
  balanceAfter?: number;
  paymentTime?: string;
  completeTime?: string;
  notifyTime?: string;
  paymentUrl?: string;
  thirdPartyOrderId?: string;
  remark?: string;
  callbackData?: any;
}

// 获取充值订单列表 (Combined: RechargeOrder + Deposit records)
export function getRechargeOrderList(params: RechargeOrderListParams = {}) {
  return requestClient.get<RechargeOrderListResponse>('/wallet/finance/online-recharge/orders', {
    params,
  });
}

// 获取单个充值订单
export function getRechargeOrder(id: string) {
  return requestClient.get<{ success: boolean; data: RechargeOrder }>(`/recharge-orders/${id}`);
}

// 创建充值订单
export function createRechargeOrder(data: CreateRechargeOrderData) {
  return requestClient.post<{ success: boolean; data: RechargeOrder; message: string }>('/recharge-orders', data);
}

// 更新充值订单
export function updateRechargeOrder(id: string, data: UpdateRechargeOrderData) {
  return requestClient.put<{ success: boolean; data: RechargeOrder; message: string }>(`/recharge-orders/${id}`, data);
}

// 删除充值订单
export function deleteRechargeOrder(id: string) {
  return requestClient.delete<{ success: boolean; message: string }>(`/recharge-orders/${id}`);
}

// 获取充值统计数据
export function getRechargeStatistics(params?: { startDate?: string; endDate?: string }) {
  return requestClient.get<{
    success: boolean;
    data: {
      statusStats: Array<{
        status: string;
        _count: number;
        _sum: {
          rechargeAmount: number;
          actualAmount: number;
        };
      }>;
      platformStats: Array<{
        thirdPartyPayment: string;
        _count: number;
        _sum: {
          rechargeAmount: number;
          actualAmount: number;
        };
      }>;
      dailyStats: Array<{
        date: string;
        totalOrders: number;
        totalAmount: number;
        actualAmount: number;
      }>;
    };
  }>('/recharge-orders/statistics', {
    params,
  });
}

// 导出充值订单数据
export function exportRechargeOrders(params: RechargeOrderListParams = {}) {
  return requestClient.get<{ success: boolean; data: RechargeOrder[]; message: string }>('/recharge-orders/export', {
    params,
  });
} 