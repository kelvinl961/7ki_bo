import { requestClient } from './request';

export interface DailyReportParams {
  startDate: string;
  endDate: string;
  currency?: string;
  granularity?: 'day' | 'month' | 'week';
  forceRefresh?: string;
}

export interface DailyReportResponse {
  success: boolean;
  data: any[];
  total?: any;
  message?: string;
}

/**
 * Get daily operations report
 */
export async function getDailyOperationsReport(
  params: DailyReportParams,
): Promise<DailyReportResponse> {
  return requestClient.get('/operations-statistics/daily-report', {
    params,
  });
}

/**
 * Clear operations statistics cache
 */
export async function clearOperationsCache(): Promise<{
  message: string;
  success: boolean;
}> {
  return requestClient.post('/operations-statistics/clear-cache');
}

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<any> {
  return requestClient.get('/operations-statistics/cache-stats');
}
