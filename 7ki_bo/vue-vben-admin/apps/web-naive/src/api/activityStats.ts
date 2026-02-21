import { requestClient } from '#/api/request';

/**
 * Activity Statistics API Client
 * Handles all activity statistics related API calls
 */

export interface ActivityStatistics {
  activityId: string;
  activityName: string;
  memberCurrency: string;
  activityTime: string;
  activityType: string;
  activityTypeLabel: string;
  claimedUsers: number;
  claimCount: number;
  eligibleUsers: number;
  claimedAmount: number;
  activityAmount: number;
  status: string;
  startsAt: null | string;
  endsAt: null | string;
}

export interface ActivityOverview {
  totalActivities: number;
  activeActivities: number;
  totalParticipants: number;
  totalRewardsClaimed: number;
  totalRewardsDistributed: number;
  averageParticipationRate: number;
  topPerformingActivity: null | {
    id: string;
    name: string;
    participants: number;
    rewardsClaimed: number;
  };
}

export interface ActivityStatsResponse {
  statistics: ActivityStatistics[];
  pagination: {
    limit: number;
    page: number;
    total: number;
    totalPages: number;
  };
  summary: {
    totalActivities: number;
    totalActivityAmount: number;
    totalClaimCount: number;
    totalClaimedAmount: number;
    totalClaimedUsers: number;
  };
}

export interface ActivityStatsParams {
  startDate?: string;
  endDate?: string;
  activityType?: string;
  status?: string;
  currency?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ActivityStatsByType {
  activityType: string;
  activityTypeLabel: string;
  activityCount: number;
}

export interface ActivityRealTimeMetrics {
  todayActivities: number;
  todayParticipants: number;
  todayRewardsClaimed: number;
  activeActivities: number;
  timestamp: string;
}

export interface ActivityTrends {
  period: string;
  startDate: string;
  endDate: string;
  trends: Array<{
    activitiesCreated: number;
    date: string;
    totalAmountClaimed: number;
    totalParticipations: number;
    totalRewardsClaimed: number;
  }>;
}

/**
 * Get activity statistics with filtering and pagination
 */
export async function getActivityStatistics(params: ActivityStatsParams) {
  try {
    const response = await requestClient.get('/activity-stats', { params });
    console.log('📊 Activity Stats Response:', response);

    if (response.success) {
      return response.data as ActivityStatsResponse;
    } else {
      throw new Error(response.message || 'Failed to get activity statistics');
    }
  } catch (error) {
    console.error('❌ Activity Stats API Error:', error);
    throw error;
  }
}

/**
 * Get activity overview/summary
 */
export async function getActivityOverview(params: {
  currency?: string;
  endDate?: string;
  startDate?: string;
}) {
  try {
    const response = await requestClient.get('/activity-stats/overview', {
      params,
    });
    console.log('📈 Activity Overview Response:', response);

    if (response.success) {
      return response.data as ActivityOverview;
    } else {
      throw new Error(response.message || 'Failed to get activity overview');
    }
  } catch (error) {
    console.error('❌ Activity Overview API Error:', error);
    throw error;
  }
}

/**
 * Get activity statistics by type
 */
export async function getActivityStatsByType(params: {
  currency?: string;
  endDate?: string;
  startDate?: string;
}) {
  const response = await requestClient.get('/api/activity-stats/by-type', {
    params,
  });
  return response.data as ActivityStatsByType[];
}

/**
 * Get real-time activity metrics
 */
export async function getActivityRealTimeMetrics(params: {
  currency?: string;
}) {
  const response = await requestClient.get('/api/activity-stats/realtime', {
    params,
  });
  return response.data as ActivityRealTimeMetrics;
}

/**
 * Get activity performance trends
 */
export async function getActivityTrends(params: {
  activityType?: string;
  currency?: string;
  period: string;
}) {
  const response = await requestClient.get('/api/activity-stats/trends', {
    params,
  });
  return response.data as ActivityTrends;
}

/**
 * Get detailed statistics for a specific activity
 */
export async function getActivityDetailStats(
  activityId: string,
  params: {
    endDate?: string;
    startDate?: string;
  },
) {
  const response = await requestClient.get(`/activity-stats/${activityId}`, {
    params,
  });
  return response.data as ActivityStatistics;
}

/**
 * Export activity statistics to CSV
 */
export function exportActivityStats(params: ActivityStatsParams) {
  // Create download URL with parameters
  const queryString = new URLSearchParams(params as any).toString();
  const url = `/activity-stats/export?${queryString}`;

  // Trigger download
  const link = document.createElement('a');
  link.href = url;
  link.download = `activity_stats_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.append(link);
  link.click();
  link.remove();

  return Promise.resolve();
}
