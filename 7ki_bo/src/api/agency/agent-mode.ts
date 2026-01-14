import { requestClient } from '#/api/request';

// Types
export interface AgentModeDTO {
  id: number;
  currency: string;
  name: string;
  source: '系统自带' | '自定义';
  settlementCycle: '日结' | '周结' | '月结';
  commissionBasis: '有效投注' | '净盈利' | '组合指标';
  calcLevels: '只算一级' | '最多二级' | '最多三级' | '无级数';
  overflowSummary: string;
  isDefault: boolean;
  isEnabled: boolean;
  lastCycleClosedDate: string | null;
  usedCount: number;
  remark: string;
  operator: string;
  operatedAt: string;
}

export interface AgentModeTier {
  id?: number;
  levelNo: number;
  metricType: 'VALID_BET' | 'NET_PROFIT' | 'DEPOSIT' | 'RECHARGE' | 'COMPOSITE';
  rangeMin?: number;
  rangeMax?: number;
  ratePercent?: number;
  capAmount?: number;
  extraRate?: number;
  ruleJson?: any;
}

export interface AgentProfile {
  id: number;
  agentUid: string;
  currency: string;
  boundAt: string;
}

export interface CreateAgentModeRequest {
  name: string;
  currency: string;
  source?: 'SYSTEM' | 'CUSTOM';
  settlementCycle?: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  commissionBasis?: 'VALID_BET' | 'NET_PROFIT' | 'COMPOSITE';
  calcLevels?: 'LEVEL_ONE' | 'MAX_TWO' | 'MAX_THREE' | 'UNLIMITED';
  overflowRule?: {
    text?: string;
    threshold?: number;
    rate?: number;
  };
  isDefault?: boolean;
  isEnabled?: boolean;
  remark?: string;
}

export interface UpdateAgentModeRequest {
  name?: string;
  currency?: string;
  source?: 'SYSTEM' | 'CUSTOM';
  settlementCycle?: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  commissionBasis?: 'VALID_BET' | 'NET_PROFIT' | 'COMPOSITE';
  calcLevels?: 'LEVEL_ONE' | 'MAX_TWO' | 'MAX_THREE' | 'UNLIMITED';
  overflowRule?: {
    text?: string;
    threshold?: number;
    rate?: number;
  };
  remark?: string;
}

export interface AgentModeQueryParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  name?: string;
  currency?: string;
  source?: 'SYSTEM' | 'CUSTOM';
  isEnabled?: boolean;
  isDefault?: boolean;
  settlementCycle?: 'DAILY' | 'WEEKLY' | 'MONTHLY';
}

export interface AgentModeListResponse {
  success: boolean;
  data: {
    list: AgentModeDTO[];
    total: number;
    page: number;
    pageSize: number;
  };
}

export interface AgentModeSummary {
  usedCount: number;
  lastCycleClosedDate: string | null;
  enabled: boolean;
  isDefault: boolean;
}

// API functions
export const agentModeApi = {
  // Get paginated list of agent modes with filtering
  getAgentModeList: (params?: AgentModeQueryParams): Promise<AgentModeListResponse> => {
    return requestClient.get('/agent-modes', { params });
  },

  // Create new agent mode
  createAgentMode: (data: CreateAgentModeRequest): Promise<{ success: boolean; data: AgentModeDTO; message: string }> => {
    return requestClient.post('/agent-modes', data);
  },

  // Update agent mode
  updateAgentMode: (id: number, data: UpdateAgentModeRequest): Promise<{ success: boolean; data: AgentModeDTO; message: string }> => {
    return requestClient.put(`/agent-modes/${id}`, data);
  },

  // Update agent mode enabled status
  updateAgentModeStatus: (id: number, isEnabled: boolean): Promise<{ success: boolean; data: AgentModeDTO; message: string }> => {
    return requestClient.put(`/agent-modes/${id}/enable`, { isEnabled });
  },

  // Set agent mode as default
  setAgentModeDefault: (id: number, isDefault: boolean): Promise<{ success: boolean; data: AgentModeDTO; message: string }> => {
    return requestClient.put(`/agent-modes/${id}/default`, { isDefault });
  },

  // Update settlement cycle
  updateSettlementCycle: (id: number, settlementCycle: 'DAILY' | 'WEEKLY' | 'MONTHLY'): Promise<{ success: boolean; data: AgentModeDTO; message: string }> => {
    return requestClient.put(`/agent-modes/${id}/cycle`, { settlementCycle });
  },

  // Get agent mode tiers
  getAgentModeTiers: (id: number): Promise<{ success: boolean; data: AgentModeTier[] }> => {
    return requestClient.get(`/agent-modes/${id}/tiers`);
  },

  // Update agent mode tiers
  updateAgentModeTiers: (id: number, tiers: AgentModeTier[]): Promise<{ success: boolean; data: AgentModeTier[]; message: string }> => {
    return requestClient.put(`/agent-modes/${id}/tiers`, tiers);
  },

  // Get agents using this mode
  getAgentModeAgents: (id: number, page?: number, pageSize?: number): Promise<{ success: boolean; data: { list: AgentProfile[]; total: number; page: number; pageSize: number } }> => {
    return requestClient.get(`/agent-modes/${id}/agents`, { params: { page, pageSize } });
  },

  // Batch switch agents to this mode
  batchSwitchAgents: (id: number, agentUids: string[]): Promise<{ success: boolean; data: { affected: number; agentUids: string[] }; message: string }> => {
    return requestClient.post(`/agent-modes/${id}/batch-switch`, { agentUids });
  },

  // Get agent mode summary
  getAgentModeSummary: (id: number): Promise<{ success: boolean; data: AgentModeSummary }> => {
    return requestClient.get(`/agent-modes/${id}/summary`);
  },

  // Delete agent mode
  deleteAgentMode: (id: number): Promise<{ success: boolean; message: string }> => {
    return requestClient.delete(`/agent-modes/${id}`);
  },

  // Test endpoint
  testConnection: (): Promise<{ message: string; timestamp: string }> => {
    return requestClient.get('/agent-modes/test');
  },
};

// Game Rebate Configuration Types
export interface GameRebateConfig {
  id?: number;
  modeId: number;
  gameCategory: 'ARCADE' | 'BLOCKCHAIN' | 'CHESS_CARDS' | 'COCKFIGHT' | 'HUNTING' | 'LIVE' | 'LOTTERY' | 'SLOT' | 'SPORTS';
  gameCategoryDisplay: string;
  tierLevel: number; // New field for tier level
  minValidUsers: number;
  minValidBetAmount: number;
  rebatePercentage: number;
  rebateAmount: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface GameRebateConfigRequest {
  gameCategory: 'ARCADE' | 'BLOCKCHAIN' | 'CHESS_CARDS' | 'COCKFIGHT' | 'HUNTING' | 'LIVE' | 'LOTTERY' | 'SLOT' | 'SPORTS';
  tierLevel: number; // New field for tier level
  minValidUsers: number;
  minValidBetAmount: number;
  rebatePercentage: number;
  rebateAmount: number;
  isActive: boolean;
}

export interface CommissionCalculationRequest {
  agentId: string;
  gameCategory: string;
  betAmount: number;
  validUserCount?: number;
}

export interface CommissionCalculationResponse {
  success: boolean;
  data: {
    commission: number;
    reason: string;
    calculation?: {
      betAmount: number;
      rebatePercentage: number;
      rebateAmount: number;
      validUserCount: number;
    };
    rebateConfig: GameRebateConfig;
  };
}

// Add to agentModeApi object
export const gameRebateApi = {
  // Get game rebate configurations for an agent mode
  getGameRebateConfigs: (modeId: number): Promise<{ success: boolean; data: GameRebateConfig[] }> => {
    return requestClient.get(`/agent-modes/${modeId}/game-rebate-configs`);
  },

  // Update game rebate configurations for an agent mode
  updateGameRebateConfigs: (modeId: number, configs: GameRebateConfigRequest[]): Promise<{ success: boolean; data: GameRebateConfig[]; message: string }> => {
    return requestClient.put(`/agent-modes/${modeId}/game-rebate-configs`, configs);
  },

  // Calculate commission for an agent
  calculateCommission: (request: CommissionCalculationRequest): Promise<CommissionCalculationResponse> => {
    return requestClient.post('/agent-modes/calculate-commission', request);
  },
};

// Export default
export default agentModeApi;
