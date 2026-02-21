/**
 * Admin Bet Transactions API
 * Handles fetching and managing bet transaction records
 */

import { requestClient } from '#/api/request';

export interface BetTransactionFilters {
  page?: number;
  pageSize?: number;
  startDate?: string;
  endDate?: string;
  userId?: number;
  username?: string;
  gameProvider?: string;
  gameName?: string;
  gameCategory?: string;
  type?: string;
  minAmount?: number;
  maxAmount?: number;
  status?: string;
  consolidate?: boolean; // Group transactions by round (true/false)
  excludeBetPlaced?: boolean; // Hide bet_placed transactions (default: true)
}

export interface BetTransactionItem {
  id: string;
  userId: number;
  betLogId: null | number;
  gameProvider: string;
  gameCategory: string;
  gameName: string;
  gameId: null | string;
  roundId: null | string;
  type: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  currency: string;
  turnover: number;
  validBet: number;
  odds: null | number;
  description: null | string;
  metadata: any;
  createdAt: string;
  userUuid: null | string;
  sessionId: null | string;
  user: {
    account: string;
    id: number;
    name: null | string;
    userID: null | string;
    uuid: null | string;
  };
  consolidatedData?: {
    betAmount: number;
    netAmount: number;
    originalTransactions: Array<{
      amount: number;
      createdAt: string;
      id: string;
      type: string;
    }>;
    status: 'draw' | 'lost' | 'won';
    transactionCount: number;
    victoryDefeatAmount: number; // Net win/loss
    winAmount: number;
  };
}

export interface BetTransactionListResponse {
  list: BetTransactionItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
  pageTotals: {
    totalAmount: number;
    totalTurnover: number;
    totalValidBet: number;
  };
  overallTotals: {
    count: number;
    totalAmount: number;
    totalTurnover: number;
    totalValidBet: number;
  };
}

export interface BetTransactionStatistics {
  totals: {
    count: number;
    totalAmount: number;
    totalTurnover: number;
    totalValidBet: number;
  };
  byType: Array<{
    amount: number;
    count: number;
    type: string;
    validBet: number;
  }>;
  byProvider: Array<{
    amount: number;
    count: number;
    provider: string;
    validBet: number;
  }>;
  byCategory: Array<{
    amount: number;
    category: string;
    count: number;
    memberWinLoss: number;
    profitRatio: number;
    validBet: number;
  }>;
  byGame: Array<{
    amount: number;
    category: string;
    count: number;
    gameName: string;
    memberWinLoss: number;
    profitRatio: number;
    provider: string;
    validBet: number;
  }>;
  userInfo?: null | {
    account: string;
    currency: string;
    id: number;
    name: null | string;
    userID: null | string;
  };
}

/**
 * Get all bet transactions with filters
 */
export async function getBetTransactionsApi(
  filters: BetTransactionFilters = {},
): Promise<BetTransactionListResponse> {
  return requestClient.get<BetTransactionListResponse>(
    '/admin/bet-transactions',
    {
      params: filters,
    },
  );
}

/**
 * Get bet transaction statistics
 */
export async function getBetTransactionStatisticsApi(
  filters: Partial<BetTransactionFilters> = {},
): Promise<BetTransactionStatistics> {
  return requestClient.get<BetTransactionStatistics>(
    '/admin/bet-transactions/statistics',
    {
      params: filters,
    },
  );
}

/**
 * Get unique game providers for filter dropdown
 */
export async function getGameProvidersApi(): Promise<string[]> {
  return requestClient.get<string[]>('/admin/bet-transactions/providers');
}

/**
 * Get unique game categories for filter dropdown
 */
export async function getGameCategoriesApi(): Promise<string[]> {
  return requestClient.get<string[]>('/admin/bet-transactions/categories');
}

/**
 * Get bet transaction types for filter dropdown
 */
export async function getBetTransactionTypesApi(): Promise<string[]> {
  return requestClient.get<string[]>('/admin/bet-transactions/types');
}
