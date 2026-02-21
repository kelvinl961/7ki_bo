import { requestClient } from './request';

export interface GameStatisticsParams {
  startDate: string;
  endDate: string;
  currency?: string;
  gameType?: string;
  granularity?: 'day' | 'month' | 'week';
  forceRefresh?: boolean;
}

export interface GameStatisticsResponse {
  success: boolean;
  data: any[];
  total: any;
  cached?: boolean;
  startDate: string;
  endDate: string;
  currency: string;
  granularity: string;
  message?: string;
}

export interface GameTypeOption {
  value: string;
  label: string;
}

export interface GameTypesResponse {
  success: boolean;
  data: GameTypeOption[];
}

/**
 * Get game statistics report
 */
export async function getGameStatistics(
  params: GameStatisticsParams,
): Promise<GameStatisticsResponse> {
  return requestClient.get('/game-statistics/report', { params });
}

/**
 * Get list of game types
 */
export async function getGameTypes(): Promise<GameTypesResponse> {
  return requestClient.get('/game-statistics/game-types');
}

/**
 * Export game statistics
 */
export async function exportGameStatistics(
  params: GameStatisticsParams,
): Promise<GameStatisticsResponse> {
  return requestClient.get('/game-statistics/export', { params });
}

/**
 * Clear game statistics cache
 */
export async function clearGameStatisticsCache(): Promise<{
  message: string;
  success: boolean;
}> {
  return requestClient.post('/game-statistics/clear-cache');
}
