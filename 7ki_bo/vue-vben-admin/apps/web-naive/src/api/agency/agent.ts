import { requestClient } from '#/api/request';

export interface AgentRecord {
  id: number;
  agentId?: string;
  username: string;
  level: number;
  referralCode: string;
  invitedByCode?: string;
  invitedByUsername?: string;
  topAgentCode?: string;
  topAgentUsername?: string;
  hierarchyLevel: number;
  mode: 'MANUAL' | 'REFERRAL';
  registrationSource: string;
  assignedAt?: string;
  commissionTotal: number;
  claimedCommission: number;
  unclaimedCommission: number;
  currency: string;
  referralUrl?: string;
  otherCount: number;
  memberCount?: number;
  downlineCount?: number;
  secondGenerationCount?: number;
  visitCount?: number;
  commissionMode: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  userID?: string; // User's 9-digit userID (used for invitedBy filtering)
}

export interface AgentListParams {
  page?: number;
  pageSize?: number;
  username?: string;
  level?: number;
  isActive?: boolean;
  referralCode?: string;
  dateRange?: [string, string];
}

export interface AgentListResponse {
  list: AgentRecord[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  summary?: {
    totalCommission: number;
    totalClaimed: number;
    totalUnclaimed: number;
    totalMembers: number;
    totalDownlines: number;
  };
}

export interface CreateAgentParams {
  agentId?: string;
  username: string;
  level?: number; // defaults to 1
  referralCode: string;
  invitedByCode?: string;
  topAgentCode?: string;
  hierarchyLevel?: number; // defaults to 1
  mode?: 'MANUAL' | 'REFERRAL';
  registrationSource?: string; // defaults to 推广注册
  assignedAt?: string; // ISO datetime
  currency?: string; // defaults to BRL
  referralUrl?: string;
  otherCount?: number; // defaults to 0
  visitCount?: number; // defaults to 0
  commissionMode?: string; // defaults to 不限制
  isActive?: boolean; // defaults to true
}

export interface UpdateAgentParams {
  username?: string;
  level?: number;
  referralCode?: string;
  invitedByCode?: string;
  topAgentCode?: string;
  hierarchyLevel?: number;
  mode?: 'MANUAL' | 'REFERRAL';
  registrationSource?: string;
  assignedAt?: string;
  currency?: string;
  referralUrl?: string;
  otherCount?: number;
  commissionMode?: string;
  commissionTotal?: number;
  claimedCommission?: number;
  unclaimedCommission?: number;
  isActive?: boolean;
}

export interface AgentSummary {
  totalAgents: number;
  activeAgents: number;
  inactiveAgents: number;
  suspendedAgents: number;
  totalCommission: number;
  currentMonthCommission: number;
  totalDeposit: number;
  totalWithdraw: number;
}

/**
 * Get agent list with pagination and filtering
 */
export async function getAgentList(params?: AgentListParams): Promise<AgentListResponse> {
  return requestClient.get('/agents', { params });
}

/**
 * Get agent by ID
 */
export async function getAgentByIdApi(id: number): Promise<AgentRecord> {
  return requestClient.get(`/agents/${id}`);
}

/**
 * Update agent status
 */
export async function updateAgentStatusApi(id: number, data: { isActive: boolean; remark?: string }): Promise<void> {
  return requestClient.put(`/agents/${id}/status`, data);
}

/**
 * Get agent by ID
 */
export async function getAgentById(id: number): Promise<AgentRecord> {
  return requestClient.get(`/agents/${id}`);
}

/**
 * Create new agent
 */
export async function createAgent(data: CreateAgentParams): Promise<AgentRecord> {
  return requestClient.post('/agents', data);
}

/**
 * Update agent
 */
export async function updateAgent(id: number, data: UpdateAgentParams): Promise<AgentRecord> {
  return requestClient.put(`/agents/${id}`, data);
}

/**
 * Delete agent
 */
export async function deleteAgent(id: number): Promise<void> {
  return requestClient.delete(`/agents/${id}`);
}

/**
 * Bulk delete agents
 */
export async function bulkDeleteAgents(ids: number[]): Promise<void> {
  return requestClient.post('/agents/bulk-delete', { ids });
}

/**
 * Get agent summary statistics
 */
export async function getAgentSummary(): Promise<AgentSummary> {
  return requestClient.get('/agents/summary');
}

export const formatCommission = (amount: number | null | undefined) => {
  if (amount === null || amount === undefined || isNaN(Number(amount))) return 'R$ 0.00';
  const numAmount = Number(amount);
  return `R$ ${numAmount.toFixed(2)}`;
};

export const formatCurrency = (amount: number | null | undefined) => {
  if (amount === null || amount === undefined || isNaN(Number(amount))) return 'R$ 0.00';
  const numAmount = Number(amount);
  return `R$ ${numAmount.toFixed(2)}`;
}; 