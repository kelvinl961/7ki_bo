import { requestClient } from '#/api/request';

export interface AgentRebateSummary {
  agentId: number;
  totalCommission: number; // 累计佣金
  claimedCommission: number; // 累计领取
  unclaimedCommission: number; // 未领取
  recordCount: number;
}

export interface AgentRebateSummariesResponse {
  success: boolean;
  data: Record<number, AgentRebateSummary>;
  message: string;
}

/**
 * Get rebate summaries for all agents
 */
export async function getAgentRebateSummariesApi(): Promise<AgentRebateSummariesResponse> {
  return requestClient.get('/rebates/agents/summaries');
}

/**
 * Get agent rebate history
 */
export async function getAgentRebateHistoryApi(
  agentId: number,
  params?: {
    endDate?: string;
    startDate?: string;
  },
) {
  const query = new URLSearchParams();
  if (params?.startDate) query.append('startDate', params.startDate);
  if (params?.endDate) query.append('endDate', params.endDate);

  const queryString = query.toString();
  const url = `/rebates/agents/${agentId}/history${queryString ? `?${queryString}` : ''}`;

  return requestClient.get(url);
}

/**
 * Get rebate dashboard statistics
 */
export async function getRebateDashboardApi() {
  return requestClient.get('/rebates/dashboard');
}

/**
 * Get rebate system health status
 */
export async function getRebateHealthApi() {
  return requestClient.get('/rebates/health');
}

/**
 * Manually trigger rebate calculation
 */
export async function triggerRebateCalculationApi(date?: string) {
  return requestClient.post('/rebates/calculate', { date });
}

/**
 * Manually trigger rebate distribution
 */
export async function triggerRebateDistributionApi(maxRecords?: number) {
  return requestClient.post('/rebates/distribute', { maxRecords });
}
