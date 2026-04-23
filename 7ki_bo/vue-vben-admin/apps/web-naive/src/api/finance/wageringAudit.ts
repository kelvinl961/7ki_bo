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
  sourceDescription: null | string;
  multiplier: number;
  requiredBetAmount: number;
  currentBetAmount: number;
  remainingBetAmount: number;
  gameContributions: any;
  status: string;
  priority: number;
  createdAt: string;
  activatedAt: null | string;
  completedAt: null | string;
  expiresAt: null | string;
  cancelledAt: null | string;
  cancellationReason: null | string;
  metadata: any;
  auditVersion: number;
  progressPercentage: string;
  user: {
    account: string;
    id: number;
    name: null | string;
    userID: null | string;
    uuid: null | string;
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
    totalCurrentBet: number;
    totalRemaining: number;
    totalRequiredBet: number;
    totalSourceAmount: number;
  };
  overallTotals: {
    count: number;
    totalCurrentBet: number;
    totalRemaining: number;
    totalRequiredBet: number;
    totalSourceAmount: number;
  };
}

export interface WageringAuditStatistics {
  totals: {
    count: number;
    totalCurrentBet: number;
    totalRemaining: number;
    totalRequiredBet: number;
    totalSourceAmount: number;
  };
  byStatus: Array<{
    count: number;
    currentBet: number;
    requiredBet: number;
    sourceAmount: number;
    status: string;
  }>;
  bySourceType: Array<{
    count: number;
    currentBet: number;
    requiredBet: number;
    sourceAmount: number;
    sourceType: string;
  }>;
}

/**
 * Get all wagering audits with filters
 */
export async function getWageringAuditsApi(
  filters: WageringAuditFilters = {},
): Promise<WageringAuditListResponse> {
  return requestClient.get<WageringAuditListResponse>(
    '/admin/wagering-audits',
    {
      params: filters,
    },
  );
}

/**
 * Get wagering audit statistics
 */
export async function getWageringAuditStatisticsApi(
  filters: Partial<WageringAuditFilters> = {},
): Promise<WageringAuditStatistics> {
  return requestClient.get<WageringAuditStatistics>(
    '/admin/wagering-audits/statistics',
    {
      params: filters,
    },
  );
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

export interface AutomaticReleaseSettings {
  currency: string;
  thresholdAmount: number;
  min: number;
  max: number;
}

/**
 * Global automatic release threshold (e.g. BRL). 0 = disabled.
 */
export async function getAutomaticReleaseSettingsApi(
  currency = 'BRL',
): Promise<AutomaticReleaseSettings> {
  return requestClient.get<AutomaticReleaseSettings>(
    '/admin/wagering-audits/automatic-release-settings',
    { params: { currency } },
  );
}

export async function updateAutomaticReleaseSettingsApi(body: {
  currency?: string;
  thresholdAmount: number;
}): Promise<{ currency: string; thresholdAmount: number; updatedAt: string }> {
  return requestClient.put(
    '/admin/wagering-audits/automatic-release-settings',
    body,
  );
}

/**
 * Get single wagering audit detail by id (optional; backend may extend with eligiblePlatforms etc.)
 */
export async function getWageringAuditDetailApi(
  auditId: string,
): Promise<WageringAuditItem> {
  return requestClient.get<WageringAuditItem>(
    `/admin/wagering-audits/${auditId}`,
  );
}

/**
 * Cancel an audit (admin operation)
 */
export async function cancelAuditApi(
  auditId: string,
  reason: string,
): Promise<{
  data?: {
    auditId: string;
    cancelledAt: string;
    reason: string;
  };
  message: string;
  success: boolean;
}> {
  return requestClient.post(`/admin/audits/${auditId}/cancel`, { reason });
}

/**
 * Force complete an audit (admin operation)
 */
export async function forceCompleteAuditApi(
  auditId: string,
  reason: string,
): Promise<{
  data?: {
    auditId: string;
    completedAt: string;
    reason: string;
  };
  message: string;
  success: boolean;
}> {
  return requestClient.post(`/admin/audits/${auditId}/force-complete`, {
    reason,
  });
}
