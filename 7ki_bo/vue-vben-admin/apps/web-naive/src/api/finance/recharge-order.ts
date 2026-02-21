import { requestClient } from '#/api/request';

export interface RechargeOrder {
  orderId: string;
  memberId: string;
  accountName: string;
  nickname: string;
  createdAt: string;
  successAt: string;
  updatedAt: string;
  vipLevel: string;
  memberTag: string;
  rechargeAmount: number;
  currency: string;
  orderAmount: number;
  bonusAmount: number;
  fee: number;
  totalCredited: number;
  thirdParty: string;
  channel: string;
}

export interface RechargeOrderListParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  dateRange?: [string, string];
  search?: string;
  rechargeAmount?: string;
  currency?: string;
  vipLevel?: string;
  thirdParty?: string;
  channel?: string;
  status?: string;
}

export interface RechargeOrderListResponse {
  code: number;
  data: {
    records: RechargeOrder[];
    total: number;
    totals: {
      rechargeAmount: number;
      orderAmount: number;
      bonusAmount: number;
      fee: number;
      totalCredited: number;
    };
  };
  message?: string;
}

export interface ApiResponse<T> {
  code: number;
  data: T;
  message?: string;
}

/**
 * Get recharge order list (Combined: RechargeOrder + Deposit records)
 */
export async function getRechargeOrderList(params: RechargeOrderListParams) {
  return requestClient.get<RechargeOrderListResponse>('/wallet/finance/online-recharge/orders', {
    params,
  });
}

/**
 * Create preset order
 */
export async function createPresetOrder(data: any) {
  return requestClient.post<ApiResponse<any>>('/recharge-orders/preset', data);
}

/**
 * Create supplement order
 */
export async function createSupplementOrder(data: any) {
  return requestClient.post<ApiResponse<any>>('/recharge-orders/supplement', data);
}

/**
 * Export recharge orders
 */
export async function exportRechargeOrders(params: RechargeOrderListParams) {
  return requestClient.get<Blob>('/recharge-orders/export', {
    params,
    responseType: 'blob',
  });
}

/**
 * Bulk process orders
 */
export async function bulkProcessOrders(orderIds: string[]) {
  return requestClient.post<ApiResponse<any>>('/recharge-orders/bulk-process', {
    orderIds,
  });
}

/**
 * Bulk cancel orders
 */
export async function bulkCancelOrders(orderIds: string[]) {
  return requestClient.post<ApiResponse<any>>('/recharge-orders/bulk-cancel', {
    orderIds,
  });
}

/**
 * Get order statistics
 */
export async function getOrderStatistics(params: RechargeOrderListParams) {
  return requestClient.get<ApiResponse<any>>('/recharge-orders/statistics', {
    params,
  });
}

const rechargeOrderApi = {
  getList: getRechargeOrderList,
  createPreset: createPresetOrder,
  createSupplement: createSupplementOrder,
  export: exportRechargeOrders,
  bulkProcess: bulkProcessOrders,
  bulkCancel: bulkCancelOrders,
  getStatistics: getOrderStatistics,
};

export default rechargeOrderApi; 