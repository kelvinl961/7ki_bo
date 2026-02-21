/**
 * Admin Wagering Audit API
 * Handles fetching and managing wagering audit records
 */

import { requestClient } from '#/api/request';

export interface WageringAuditFilters {
  page?: number;
  pageSize?: number;
  startDate?: string;
  endDate?: string;
  userId?: number;
  username?: string;
  sourceType?: string;
  status?: string;
  minRequiredAmount?: number;
  maxRequiredAmount?: number;
}

export interface WageringAuditItem {
  id: string;
  userId: number;
  sourceType: string;
  sourceId: string;
  sourceAmount: number;
  sourceDescription: string | null;
  multiplier: number;
  requiredBetAmount: number;
  currentBetAmount: number;
  remainingBetAmount: number;
  gameContributions: any;
  status: string;
  priority: number;
  createdAt: string;
  activatedAt: string | null;
  completedAt: string | null;
  expiresAt: string | null;
  cancelledAt: string | null;
  cancellationReason: string | null;
  metadata: any;
  auditVersion: number;
  progressPercentage: string;
  user: {
    id: number;
    account: string;
    name: string | null;
    userID: string | null;
    uuid: string | null;
  };
}

export interface WageringAuditListResponse {
  list: WageringAuditItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
  pageTotals: {
    totalSourceAmount: number;
    totalRequiredBet: number;
    totalCurrentBet: number;
    totalRemaining: number;
  };
  overallTotals: {
    totalSourceAmount: number;
    totalRequiredBet: number;
    totalCurrentBet: number;
    totalRemaining: number;
    count: number;
  };
}

export interface WageringAuditStatistics {
  totals: {
    totalSourceAmount: number;
    totalRequiredBet: number;
    totalCurrentBet: number;
    totalRemaining: number;
    count: number;
  };
  byStatus: Array<{
    status: string;
    sourceAmount: number;
    requiredBet: number;
    currentBet: number;
    count: number;
  }>;
  bySourceType: Array<{
    sourceType: string;
    sourceAmount: number;
    requiredBet: number;
    currentBet: number;
    count: number;
  }>;
}

/**
 * Get all wagering audits with filters
 */
export async function getWageringAuditsApi(
  filters: WageringAuditFilters = {}
): Promise<WageringAuditListResponse> {
  return requestClient.get<WageringAuditListResponse>('/admin/wagering-audits', {
    params: filters
  });
}

/**
 * Get wagering audit statistics
 */
export async function getWageringAuditStatisticsApi(
  filters: Partial<WageringAuditFilters> = {}
): Promise<WageringAuditStatistics> {
  return requestClient.get<WageringAuditStatistics>('/admin/wagering-audits/statistics', {
    params: filters
  });
}

/**
 * Get unique source types for filter dropdown
 */
export async function getSourceTypesApi(): Promise<string[]> {
  return requestClient.get<string[]>('/admin/wagering-audits/source-types');
}

/**
 * Get audit statuses for filter dropdown
 */
export async function getAuditStatusesApi(): Promise<string[]> {
  return requestClient.get<string[]>('/admin/wagering-audits/statuses');
}

/**
 * Cancel an audit (admin operation)
 */
export async function cancelAuditApi(auditId: string, reason: string): Promise<{
  success: boolean;
  message: string;
  data?: {
    auditId: string;
    reason: string;
    cancelledAt: string;
  };
}> {
  return requestClient.post(`/admin/audits/${auditId}/cancel`, { reason });
}

/**
 * Force complete an audit (admin operation)
 */
export async function forceCompleteAuditApi(auditId: string, reason: string): Promise<{
  success: boolean;
  message: string;
  data?: {
    auditId: string;
    reason: string;
    completedAt: string;
  };
}> {
  return requestClient.post(`/admin/audits/${auditId}/force-complete`, { reason });
}

