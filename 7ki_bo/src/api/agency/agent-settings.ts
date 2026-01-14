import { requestClient } from '#/api/request';

// Net Profit Settings Interface
export interface AgentNetProfitSettings {
  id: number;
  currency: string;
  excludePromotions: boolean;  // 排除优惠和活动
  excludeGameCosts: boolean;   // 三方游戏统一成本
  excludeDepositFees: boolean; // 充值手续费
  excludeWithdrawFees: boolean; // 提现手续费
  excludePreviousBalance: boolean; // 上期结余
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface UpdateNetProfitSettingsRequest {
  currency?: string;
  excludePromotions?: boolean;
  excludeGameCosts?: boolean;
  excludeDepositFees?: boolean;
  excludeWithdrawFees?: boolean;
  excludePreviousBalance?: boolean;
}

// Public Agent Settings Interfaces
export interface AgentPublicSettingsRebateTable {
  id?: number;
  sequence: number;
  performance: number;
  rebateRate: number;
}

export interface AgentPublicSettings {
  id: number;
  currency: string;
  defaultAgentMode: string;
  displayFormat: string;
  settlementTime: string;
  settlementStartTime?: string;
  settlementEndTime?: string;
  commissionMultiplier: string;
  multiplierValue: number;
  validMemberCalculation: number;
  subordinateValidBet: number;
  dailyLimit: number;
  weeklyLimit: number;
  monthlyLimit: number;
  isActive: boolean;
  rebateTable: AgentPublicSettingsRebateTable[];
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface UpdatePublicSettingsRequest {
  currency?: string;
  defaultAgentMode?: string;
  displayFormat?: string;
  settlementTime?: string;
  settlementStartTime?: string;
  settlementEndTime?: string;
  commissionMultiplier?: string;
  multiplierValue?: number;
  validMemberCalculation?: number;
  subordinateValidBet?: number;
  dailyLimit?: number;
  weeklyLimit?: number;
  monthlyLimit?: number;
  rebateTable: AgentPublicSettingsRebateTable[];
}

// Net Profit Settings API
export function getNetProfitSettingsApi(currency: string = 'BRL') {
  return requestClient.get<{ data: AgentNetProfitSettings }>(`/agent-settings/net-profit/${currency}`);
}

export function updateNetProfitSettingsApi(currency: string = 'BRL', data: UpdateNetProfitSettingsRequest) {
  return requestClient.put<{ data: AgentNetProfitSettings }>(`/agent-settings/net-profit/${currency}`, data);
}

// Public Agent Settings API
export function getPublicSettingsApi(currency: string = 'BRL') {
  return requestClient.get<{ data: AgentPublicSettings }>(`/agent-settings/public/${currency}`);
}

export function updatePublicSettingsApi(currency: string = 'BRL', data: UpdatePublicSettingsRequest) {
  return requestClient.put<{ data: AgentPublicSettings }>(`/agent-settings/public/${currency}`, data);
}
