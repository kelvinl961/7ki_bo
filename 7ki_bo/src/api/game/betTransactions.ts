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
  betLogId: number | null;
  gameProvider: string;
  gameCategory: string;
  gameName: string;
  gameId: string | null;
  roundId: string | null;
  type: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  currency: string;
  turnover: number;
  validBet: number;
  odds: number | null;
  description: string | null;
  metadata: any;
  createdAt: string;
  userUuid: string | null;
  sessionId: string | null;
  user: {
    id: number;
    account: string;
    name: string | null;
    userID: string | null;
    uuid: string | null;
  };
  consolidatedData?: {
    betAmount: number;
    winAmount: number;
    victoryDefeatAmount: number; // Net win/loss
    netAmount: number;
    transactionCount: number;
    status: 'won' | 'lost' | 'draw';
    originalTransactions: Array<{
      id: string;
      type: string;
      amount: number;
      createdAt: string;
    }>;
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
    totalValidBet: number;
    totalTurnover: number;
  };
  overallTotals: {
    totalAmount: number;
    totalValidBet: number;
    totalTurnover: number;
    count: number;
  };
}

export interface BetTransactionStatistics {
  totals: {
    totalAmount: number;
    totalValidBet: number;
    totalTurnover: number;
    count: number;
  };
  byType: Array<{
    type: string;
    amount: number;
    validBet: number;
    count: number;
  }>;
  byProvider: Array<{
    provider: string;
    amount: number;
    validBet: number;
    count: number;
  }>;
  byCategory: Array<{
    category: string;
    amount: number;
    validBet: number;
    count: number;
    memberWinLoss: number;
    profitRatio: number;
  }>;
  byGame: Array<{
    provider: string;
    category: string;
    gameName: string;
    amount: number;
    validBet: number;
    count: number;
    memberWinLoss: number;
    profitRatio: number;
  }>;
  userInfo?: {
    id: number;
    account: string;
    userID: string | null;
    name: string | null;
    currency: string;
  } | null;
}

/**
 * Get all bet transactions with filters
 */
export async function getBetTransactionsApi(
  filters: BetTransactionFilters = {}
): Promise<BetTransactionListResponse> {
  return requestClient.get<BetTransactionListResponse>('/admin/bet-transactions', {
    params: filters
  });
}

/**
 * Get bet transaction statistics
 */
export async function getBetTransactionStatisticsApi(
  filters: Partial<BetTransactionFilters> = {}
): Promise<BetTransactionStatistics> {
  return requestClient.get<BetTransactionStatistics>('/admin/bet-transactions/statistics', {
    params: filters
  });
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

