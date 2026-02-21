import { requestClient } from '#/api/request';

// Types
export interface RechargeStatsParams {
  startDate?: string;
  endDate?: string;
  groupBy?: 'day' | 'month' | 'week';
  paymentMethod?: string;
  status?: string;
  currency?: string;
}

export interface PaymentMethodStats {
  paymentMethod: string;
  paymentGateway: string;
  successAmount: number;
  successCount: number;
  failedAmount: number;
  failedCount: number;
  pendingAmount: number;
  pendingCount: number;
  totalAmount: number;
  totalCount: number;
  successRate: number;
  avgAmount: number;
}

export interface TopUser {
  userId: number;
  accountName: string;
  totalAmount: number;
  orderCount: number;
  avgAmount: number;
  vipLevel: string;
}

export interface DailyTrend {
  hour: number;
  amount: number;
  count: number;
}

export interface TimeSeriesData {
  date: string;
  successAmount: number;
  successCount: number;
  failedCount: number;
  pendingCount: number;
  totalAmount: number;
  totalCount: number;
}

export interface RechargeStatsSummary {
  totalSuccessAmount: number;
  totalSuccessCount: number;
  totalFailedCount: number;
  totalPendingCount: number;
  totalOrders: number;
  successRate: number;
  avgOrderAmount: number;
  uniqueUsers: number;
}

export interface RechargeStatsResponse {
  summary: RechargeStatsSummary;
  timeSeriesData: TimeSeriesData[];
  paymentMethodStats: PaymentMethodStats[];
  topUsers: TopUser[];
  dailyTrends: DailyTrend[];
}

export interface ComparisonParams {
  currentStartDate: string;
  currentEndDate: string;
  previousStartDate: string;
  previousEndDate: string;
  currency?: string;
}

export interface ComparisonData {
  current: {
    amount: number;
    count: number;
  };
  previous: {
    amount: number;
    count: number;
  };
  changes: {
    amountChange: number;
    amountTrend: 'down' | 'up';
    countChange: number;
    countTrend: 'down' | 'up';
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// API Client
export const rechargeStatsApi = {
  // Get recharge statistics
  getStats: async (
    params: RechargeStatsParams,
  ): Promise<RechargeStatsResponse> => {
    const response = await requestClient.get('/recharge-stats', { params });
    return response as unknown as RechargeStatsResponse;
  },

  // Get comparison between periods
  getComparison: async (params: ComparisonParams): Promise<ComparisonData> => {
    const response = await requestClient.get('/recharge-stats/comparison', {
      params,
    });
    return response as unknown as ComparisonData;
  },
};
