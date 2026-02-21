import { requestClient } from '#/api/request';

// Types
export interface AgentModeDTO {
  id: number;
  currency: string;
  name: string;
  source: '系统自带' | '自定义';
  settlementCycle: '周结' | '日结' | '月结';
  commissionBasis: '净盈利' | '有效投注' | '组合指标';
  calcLevels: '最多三级' | '最多二级' | '只算一级' | '无级数';
  overflowSummary: string;
  isDefault: boolean;
  isEnabled: boolean;
  lastCycleClosedDate: null | string;
  usedCount: number;
  remark: string;
  operator: string;
  operatedAt: string;
}

export interface AgentModeTier {
  id?: number;
  levelNo: number;
  metricType: 'COMPOSITE' | 'DEPOSIT' | 'NET_PROFIT' | 'RECHARGE' | 'VALID_BET';
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
  source?: 'CUSTOM' | 'SYSTEM';
  settlementCycle?: 'DAILY' | 'MONTHLY' | 'WEEKLY';
  commissionBasis?: 'COMPOSITE' | 'NET_PROFIT' | 'VALID_BET';
  calcLevels?: 'LEVEL_ONE' | 'MAX_THREE' | 'MAX_TWO' | 'UNLIMITED';
  overflowRule?: {
    rate?: number;
    text?: string;
    threshold?: number;
  };
  isDefault?: boolean;
  isEnabled?: boolean;
  remark?: string;
}

export interface UpdateAgentModeRequest {
  name?: string;
  currency?: string;
  source?: 'CUSTOM' | 'SYSTEM';
  settlementCycle?: 'DAILY' | 'MONTHLY' | 'WEEKLY';
  commissionBasis?: 'COMPOSITE' | 'NET_PROFIT' | 'VALID_BET';
  calcLevels?: 'LEVEL_ONE' | 'MAX_THREE' | 'MAX_TWO' | 'UNLIMITED';
  overflowRule?: {
    rate?: number;
    text?: string;
    threshold?: number;
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
  source?: 'CUSTOM' | 'SYSTEM';
  isEnabled?: boolean;
  isDefault?: boolean;
  settlementCycle?: 'DAILY' | 'MONTHLY' | 'WEEKLY';
}

export interface AgentModeListResponse {
  success: boolean;
  data: {
    list: AgentModeDTO[];
    page: number;
    pageSize: number;
    total: number;
  };
}

export interface AgentModeSummary {
  usedCount: number;
  lastCycleClosedDate: null | string;
  enabled: boolean;
  isDefault: boolean;
}

// API functions
export const agentModeApi = {
  // Get paginated list of agent modes with filtering
  getAgentModeList: (
    params?: AgentModeQueryParams,
  ): Promise<AgentModeListResponse> => {
    return requestClient.get('/agent-modes', { params });
  },

  // Create new agent mode
  createAgentMode: (
    data: CreateAgentModeRequest,
  ): Promise<{ data: AgentModeDTO; message: string; success: boolean }> => {
    return requestClient.post('/agent-modes', data);
  },

  // Update agent mode
  updateAgentMode: (
    id: number,
    data: UpdateAgentModeRequest,
  ): Promise<{ data: AgentModeDTO; message: string; success: boolean }> => {
    return requestClient.put(`/agent-modes/${id}`, data);
  },

  // Update agent mode enabled status
  updateAgentModeStatus: (
    id: number,
    isEnabled: boolean,
  ): Promise<{ data: AgentModeDTO; message: string; success: boolean }> => {
    return requestClient.put(`/agent-modes/${id}/enable`, { isEnabled });
  },

  // Set agent mode as default
  setAgentModeDefault: (
    id: number,
    isDefault: boolean,
  ): Promise<{ data: AgentModeDTO; message: string; success: boolean }> => {
    return requestClient.put(`/agent-modes/${id}/default`, { isDefault });
  },

  // Update settlement cycle
  updateSettlementCycle: (
    id: number,
    settlementCycle: 'DAILY' | 'MONTHLY' | 'WEEKLY',
  ): Promise<{ data: AgentModeDTO; message: string; success: boolean }> => {
    return requestClient.put(`/agent-modes/${id}/cycle`, { settlementCycle });
  },

  // Get agent mode tiers
  getAgentModeTiers: (
    id: number,
  ): Promise<{ data: AgentModeTier[]; success: boolean }> => {
    return requestClient.get(`/agent-modes/${id}/tiers`);
  },

  // Update agent mode tiers
  updateAgentModeTiers: (
    id: number,
    tiers: AgentModeTier[],
  ): Promise<{ data: AgentModeTier[]; message: string; success: boolean }> => {
    return requestClient.put(`/agent-modes/${id}/tiers`, tiers);
  },

  // Get agents using this mode
  getAgentModeAgents: (
    id: number,
    page?: number,
    pageSize?: number,
  ): Promise<{
    data: {
      list: AgentProfile[];
      page: number;
      pageSize: number;
      total: number;
    };
    success: boolean;
  }> => {
    return requestClient.get(`/agent-modes/${id}/agents`, {
      params: { page, pageSize },
    });
  },

  // Batch switch agents to this mode
  batchSwitchAgents: (
    id: number,
    agentUids: string[],
  ): Promise<{
    data: { affected: number; agentUids: string[] };
    message: string;
    success: boolean;
  }> => {
    return requestClient.post(`/agent-modes/${id}/batch-switch`, { agentUids });
  },

  // Get agent mode summary
  getAgentModeSummary: (
    id: number,
  ): Promise<{ data: AgentModeSummary; success: boolean }> => {
    return requestClient.get(`/agent-modes/${id}/summary`);
  },

  // Delete agent mode
  deleteAgentMode: (
    id: number,
  ): Promise<{ message: string; success: boolean }> => {
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
  gameCategory:
    | 'ARCADE'
    | 'BLOCKCHAIN'
    | 'CHESS_CARDS'
    | 'COCKFIGHT'
    | 'HUNTING'
    | 'LIVE'
    | 'LOTTERY'
    | 'SLOT'
    | 'SPORTS';
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
  gameCategory:
    | 'ARCADE'
    | 'BLOCKCHAIN'
    | 'CHESS_CARDS'
    | 'COCKFIGHT'
    | 'HUNTING'
    | 'LIVE'
    | 'LOTTERY'
    | 'SLOT'
    | 'SPORTS';
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
    calculation?: {
      betAmount: number;
      rebateAmount: number;
      rebatePercentage: number;
      validUserCount: number;
    };
    commission: number;
    reason: string;
    rebateConfig: GameRebateConfig;
  };
}

// Add to agentModeApi object
export const gameRebateApi = {
  // Get game rebate configurations for an agent mode
  getGameRebateConfigs: (
    modeId: number,
  ): Promise<{ data: GameRebateConfig[]; success: boolean }> => {
    return requestClient.get(`/agent-modes/${modeId}/game-rebate-configs`);
  },

  // Update game rebate configurations for an agent mode
  updateGameRebateConfigs: (
    modeId: number,
    configs: GameRebateConfigRequest[],
  ): Promise<{
    data: GameRebateConfig[];
    message: string;
    success: boolean;
  }> => {
    return requestClient.put(
      `/agent-modes/${modeId}/game-rebate-configs`,
      configs,
    );
  },

  // Calculate commission for an agent
  calculateCommission: (
    request: CommissionCalculationRequest,
  ): Promise<CommissionCalculationResponse> => {
    return requestClient.post('/agent-modes/calculate-commission', request);
  },
};

// Export default
export default agentModeApi;
