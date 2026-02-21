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
  channelCurrency?: string; // Channel currency for this transaction
  channelAmount?: number; // Amount in channel currency for this transaction
  exchangeRate?: number; // Exchange rate used for this transaction
  conversionRatio?: number; // Conversion ratio used for this transaction

  channelFeeRate?: number; // Channel fee rate at time of transaction (audit trail)
  errorDetails?: string; // Transaction-specific error details
  errorCode?: string; // Transaction-specific error code
  thirdPartyPayment: string;
  channelName: string;
  channelCode: string;
  merchantId: string;
  orderType: 'NORMAL' | 'PRESET' | 'SUPPLEMENT';
  status:
    | 'CANCELLED'
    | 'FAILED'
    | 'PENDING'
    | 'PROCESSING'
    | 'REFUNDED'
    | 'SUCCESS'
    | 'TIMEOUT';
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
    account: string;
    balance: number;
    currency?: string; // Member currency from User table
    email: string;
    id: number;
    memberTier?: {
      id: number;
      tierCode: string;
      tierName: string;
      // Member tier info can include conversion ratios, currency preferences, etc.
    };
    name: string;
    userID?: string; // Add userID field
    vipLevel?: {
      id: number;
      name: string;
    };
  };
  channel?: {
    bonusConfig?: any; // Advanced bonus configuration (JSON from JOIN)
    bonusRate: number; // Basic bonus percentage (from JOIN)
    channelCode: string;
    channelFeeRate: number; // Channel-specific fee rate
    channelName: string;
    currency: string; // Channel's native currency
    feeRate: number; // Platform fee rate
    id: string;
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
  channel?: string; // Add channel filter
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
      limit: number;
      page: number;
      total: number;
      totalPages: number;
    };
    statistics: {
      totalActualAmount: number;
      totalBonusAmount: number;
      totalFees: number;
      totalOrders: number;
      totalRechargeAmount: number;
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
  status?:
    | 'CANCELLED'
    | 'FAILED'
    | 'PENDING'
    | 'PROCESSING'
    | 'REFUNDED'
    | 'SUCCESS'
    | 'TIMEOUT';
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
  return requestClient.get<RechargeOrderListResponse>(
    '/wallet/finance/online-recharge/orders',
    {
      params,
    },
  );
}

// 获取单个充值订单
export function getRechargeOrder(id: string) {
  return requestClient.get<{ data: RechargeOrder; success: boolean }>(
    `/recharge-orders/${id}`,
  );
}

// 创建充值订单
export function createRechargeOrder(data: CreateRechargeOrderData) {
  return requestClient.post<{
    data: RechargeOrder;
    message: string;
    success: boolean;
  }>('/recharge-orders', data);
}

// 更新充值订单
export function updateRechargeOrder(id: string, data: UpdateRechargeOrderData) {
  return requestClient.put<{
    data: RechargeOrder;
    message: string;
    success: boolean;
  }>(`/recharge-orders/${id}`, data);
}

// 删除充值订单
export function deleteRechargeOrder(id: string) {
  return requestClient.delete<{ message: string; success: boolean }>(
    `/recharge-orders/${id}`,
  );
}

// 获取充值统计数据
export function getRechargeStatistics(params?: {
  endDate?: string;
  startDate?: string;
}) {
  return requestClient.get<{
    data: {
      dailyStats: Array<{
        actualAmount: number;
        date: string;
        totalAmount: number;
        totalOrders: number;
      }>;
      platformStats: Array<{
        _count: number;
        _sum: {
          actualAmount: number;
          rechargeAmount: number;
        };
        thirdPartyPayment: string;
      }>;
      statusStats: Array<{
        _count: number;
        _sum: {
          actualAmount: number;
          rechargeAmount: number;
        };
        status: string;
      }>;
    };
    success: boolean;
  }>('/recharge-orders/statistics', {
    params,
  });
}

// 导出充值订单数据
export function exportRechargeOrders(params: RechargeOrderListParams = {}) {
  return requestClient.get<{
    data: RechargeOrder[];
    message: string;
    success: boolean;
  }>('/recharge-orders/export', {
    params,
  });
}
