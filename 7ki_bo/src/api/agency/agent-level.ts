import { requestClient } from '#/api/request';

export interface AgentLevel {
  id: number;
  level: number;
  name: string;
  promotionCondition: number;
  description: string;
  icon: string;
  iconColor: string;
  isActive: boolean;
  userCount: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface CreateAgentLevelRequest {
  level: number;
  name: string;
  promotionCondition: number;
  description: string;
  icon?: string;
  iconColor?: string;
  isActive?: boolean;
}

export interface UpdateAgentLevelRequest {
  id: number;
  level?: number;
  name?: string;
  promotionCondition?: number;
  description?: string;
  icon?: string;
  iconColor?: string;
  isActive?: boolean;
}

export interface AgentLevelsResponse {
  success: boolean;
  data: AgentLevel[];
  message: string;
}

export interface AgentLevelResponse {
  success: boolean;
  data: AgentLevel;
  message: string;
}

export interface AutoUpgradeResponse {
  success: boolean;
  data: {
    upgradedCount: number;
    upgradedAgents: Array<{
      agentId: number;
      username: string;
      oldLevel: number;
      newLevel: number;
      commission: number;
    }>;
  };
  message: string;
}

/**
 * Get all agent levels with user counts
 */
export async function getAgentLevelsApi(): Promise<AgentLevelsResponse> {
  return requestClient.get('/agent-levels');
}

/**
 * Create new agent level
 */
export async function createAgentLevelApi(data: CreateAgentLevelRequest): Promise<AgentLevelResponse> {
  return requestClient.post('/agent-levels', data);
}

/**
 * Update agent level
 */
export async function updateAgentLevelApi(data: UpdateAgentLevelRequest): Promise<AgentLevelResponse> {
  const { id, ...updateData } = data;
  return requestClient.put(`/agent-levels/${id}`, updateData);
}

/**
 * Batch update agent levels
 */
export async function batchUpdateAgentLevelsApi(levels: UpdateAgentLevelRequest[]): Promise<AgentLevelsResponse> {
  return requestClient.put('/agent-levels/batch', { levels });
}

/**
 * Delete agent level
 */
export async function deleteAgentLevelApi(id: number): Promise<{ success: boolean; message: string }> {
  return requestClient.delete(`/agent-levels/${id}`);
}

/**
 * Auto-upgrade agents based on commission
 */
export async function autoUpgradeAgentsApi(): Promise<AutoUpgradeResponse> {
  return requestClient.post('/agent-levels/auto-upgrade');
}
