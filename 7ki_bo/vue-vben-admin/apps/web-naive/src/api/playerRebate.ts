/**
 * Player 会员返水 admin API
 */
import { requestClient } from '#/api/request';

export type PlayerRebateSettings = {
  id: number;
  isEnabled: boolean;
  settleMode: 'none' | 'daily' | 'weekly' | 'monthly';
  settleHour: number;
  settleWeekday: number;
  settleMonthDay: number;
  distributeMode: 'self_auto' | 'self_void' | 'system_auto';
  claimTiming: 'next_day' | 'realtime';
  expiryDays: number;
};

export type PlayerRebateRateRow = {
  id?: number;
  sortOrder?: number;
  thresholdMin?: number | null;
  thresholdMax?: number | null;
  vipLevel?: number | null;
  platformRates: Record<string, number>;
};

export type PlayerRebateRule = {
  id: number;
  currency: string;
  name?: string | null;
  isActive: boolean;
  auditMultiplier: number;
  auditPlatformMode: string;
  auditPlatforms: string[];
  rateMode: 'ladder' | 'vip';
  memberTierIds: number[];
  rateRows: PlayerRebateRateRow[];
  updatedAt?: string;
};

export const playerRebateApi = {
  getSettings: () => requestClient.get('/player-rebate/settings'),
  updateSettings: (body: Partial<PlayerRebateSettings>) =>
    requestClient.put('/player-rebate/settings', body),
  listRules: (currency?: string) =>
    requestClient.get('/player-rebate/rules', {
      params: currency ? { currency } : undefined,
    }),
  getRule: (id: number) => requestClient.get(`/player-rebate/rules/${id}`),
  createRule: (body: Record<string, unknown>) =>
    requestClient.post('/player-rebate/rules', body),
  updateRule: (id: number, body: Record<string, unknown>) =>
    requestClient.put(`/player-rebate/rules/${id}`, body),
  setRuleStatus: (id: number, isActive: boolean) =>
    requestClient.put(`/player-rebate/rules/${id}/status`, { isActive }),
  deleteRule: (id: number) =>
    requestClient.delete(`/player-rebate/rules/${id}`),
};
