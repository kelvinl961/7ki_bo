import { requestClient } from '#/api/request';

export interface PaymentStatisticsFilters {
  startDate?: string;
  endDate?: string;
  provider?: string;
  currency?: string;
  memberAccount?: string;
  withdrawalTimes?: string; // 'first' | 'multiple' | 'all'
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaymentStatistic {
  id: string;
  date: string;
  provider: string;
  providerName: string;
  currency: string;
  totalOrders: number;
  successOrders: number;
  failedOrders: number;
  processingOrders: number;
  successRate: number;
  totalAmount: number;
  successAmount: number;
  failedAmount: number;
  avgProcessingTime: string;
  memberStats: {
    firstTime: number;
    multiple: number;
    never: number;
  };
}

export interface PaymentSummary {
  totalOrders: number;
  successOrders: number;
  failedOrders: number;
  successRate: number;
  totalAmount: string;
}

export interface PaymentStatisticsResponse {
  success: boolean;
  data: {
    pagination: {
      limit: number;
      page: number;
      total: number;
      totalPages: number;
    };
    statistics: PaymentStatistic[];
    summary: PaymentSummary;
  };
  message?: string;
}

/**
 * 获取代付统计数据
 */
export function getPaymentStatistics(
  params?: PaymentStatisticsFilters,
): Promise<PaymentStatisticsResponse> {
  console.log('📡 Requesting payment statistics with params:', params);
  return requestClient.get('/wallet/payment-statistics', { params });
}

/**
 * 导出代付统计数据
 */
export function exportPaymentStatistics(
  params?: PaymentStatisticsFilters,
): Promise<any> {
  console.log('📤 Exporting payment statistics with params:', params);
  return requestClient.get('/wallet/payment-statistics/export', {
    params,
    responseType: 'blob',
  });
}
