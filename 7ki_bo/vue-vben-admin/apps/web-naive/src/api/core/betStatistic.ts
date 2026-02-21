import { requestClient } from '#/api/request';

// ===================================
// INTERFACES
// ===================================

export interface BetStatisticSummary {
  totalBetCount: number; // 总注单量
  totalBetAmount: number; // 总投注金额
  totalValidBetAmount: number; // 总有效投注
  memberCount: number; // 会员数量
  subordinateBetCount: number; // 占单量
  profitRatio: number; // 获利比
}

export interface BetGameDetail {
  gameProvider: string; // 平台
  gameCategory: string; // 类别
  gameName: string; // 游戏名称
  betCount: number; // 注单数量
  betAmount: number; // 投注金额
  validBetAmount: number; // 有效投注
  profitLoss: number; // 盈亏
  memberCount: number; // 会员数量
}

export interface BetStatisticRequest {
  userId: number;
  startDate?: string;
  endDate?: string;
}

export interface BetStatisticResponse {
  summary: BetStatisticSummary;
  gameDetails: BetGameDetail[];
}

// ===================================
// API METHODS
// ===================================

/**
 * 获取投注统计总览
 */
export function getBetStatisticSummary(params: BetStatisticRequest) {
  return requestClient.get<BetStatisticSummary>('/bet-statistics/summary', {
    params,
  });
}

/**
 * 获取投注游戏明细
 */
export function getBetGameDetail(params: BetStatisticRequest) {
  return requestClient.get<BetGameDetail[]>('/bet-statistics/game-detail', {
    params,
  });
}

/**
 * 获取完整投注统计数据（总览 + 明细）
 */
export function getBetStatisticData(params: BetStatisticRequest) {
  return requestClient.get<BetStatisticResponse>('/bet-statistics/full', {
    params,
  });
}
