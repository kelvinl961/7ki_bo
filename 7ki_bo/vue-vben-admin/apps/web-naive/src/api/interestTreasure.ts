/**
 * 利息宝 admin API
 */
import { requestClient } from '#/api/request';

export type InterestTreasureConfig = {
  id: number;
  currency: string;
  isEnabled: boolean;
  showTooltip: boolean;
  annualRatePercent: number;
  minDeposit: number;
  auditMode: 'interest' | 'interest_principal';
  auditMultiplier: number;
  auditPlatformMode: string;
  auditPlatforms: string[];
  settleCycleMinutes: number;
  claimTiming: 'next_day' | 'realtime';
  interestCapCycles: number;
  ruleMode: string;
  ruleText?: string | null;
  ruleI18n?: Record<string, string>;
  memberTierIds: number[];
  memberTierLabel?: string;
  updatedAt?: string;
};

export type InterestTreasureLedgerRow = {
  id: number;
  orderNo: string;
  userId: number;
  memberAccount: string;
  currency: string;
  changeType: string;
  balanceBefore: number;
  amount: number;
  balanceAfter: number;
  createdAt: string;
  hasClaimDetail: boolean;
};

export const interestTreasureApi = {
  listConfigs: (params?: Record<string, unknown>) =>
    requestClient.get('/interest-treasure/configs', { params }),
  getConfig: (id: number) =>
    requestClient.get(`/interest-treasure/configs/${id}`),
  updateConfig: (id: number, body: Record<string, unknown>) =>
    requestClient.put(`/interest-treasure/configs/${id}`, body),
  updateStatus: (id: number, body: Record<string, unknown>) =>
    requestClient.put(`/interest-treasure/configs/${id}/status`, body),
  listLedger: (params?: Record<string, unknown>) =>
    requestClient.get('/interest-treasure/ledger', { params }),
  getClaimDetail: (id: number) =>
    requestClient.get(`/interest-treasure/ledger/${id}/claim-detail`),
};
