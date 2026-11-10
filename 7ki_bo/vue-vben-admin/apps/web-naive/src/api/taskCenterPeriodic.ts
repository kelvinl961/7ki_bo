/**
 * Task Center periodic + activity-points API (BO)
 */
import { requestClient } from '#/api/request';

export type PeriodicCategory =
  | 'DAILY_TASK'
  | 'WEEKLY_TASK'
  | 'THREE_DAY_MYSTERY';

export interface LadderTierPayload {
  id?: number;
  threshold: number;
  cashAmount: number;
  cashAmountMin?: number | null;
  cashAmountMax?: number | null;
  expectedAmount?: number | null;
  displayMin?: number | null;
  displayMax?: number | null;
  extraEnabled?: boolean;
  extraType?: string | null;
  extraAmount?: number | null;
  extraValidDays?: number | null;
  sortOrder?: number;
}

export interface PeriodicTaskPayload {
  category: PeriodicCategory;
  title: string;
  description?: string | null;
  currencies: string[];
  startsAt: string;
  endsAt: string;
  goalType: string;
  depositMethods?: string[];
  inviteValidity?: string | null;
  rewardMode?: 'fixed' | 'random';
  doubleRewardSchemeId?: string | null;
  finalRewardCash?: number | null;
  finalRewardExtraType?: string | null;
  finalRewardExtraAmt?: number | null;
  isActive?: boolean;
  sortOrder?: number;
  /** Per-task VIP level gate (VIPLevel ids from /vip/levels) */
  vipEnabled?: boolean;
  vipLevelIds?: Array<number | string>;
  tiers: LadderTierPayload[];
}

export const PERIODIC_GOAL_OPTIONS = [
  { label: '累计充值', value: 'cum_recharge' },
  { label: '单笔充值', value: 'single_recharge' },
  { label: '累计有效投注', value: 'cum_valid_bet' },
  { label: '单笔有效投注', value: 'single_valid_bet' },
  { label: '单笔盈利', value: 'single_profit' },
  { label: '单笔亏损', value: 'single_loss' },
  { label: '累计盈利', value: 'cum_profit' },
  { label: '累计亏损', value: 'cum_loss' },
  { label: '邀请好友', value: 'invite_friends' },
] as const;

export const EXTRA_REWARD_OPTIONS = [
  { label: '活跃度', value: 'activity_points' },
  { label: '幸运值', value: 'luck_value' },
  { label: '积分', value: 'points' },
  { label: '盲盒抽奖次数', value: 'mystery_box' },
  { label: '折扣券', value: 'discount_coupon' },
] as const;

export interface CategorySettingsPayload {
  category: 'DAILY_TASK' | 'WEEKLY_TASK' | 'THREE_DAY_MYSTERY';
  enabled?: boolean;
  settings?: Record<string, unknown>;
}

export const taskCenterPeriodicApi = {
  list: (params?: {
    category?: PeriodicCategory;
    goalType?: string;
    isActive?: boolean;
  }) =>
    requestClient.get('/task-center/admin/periodic', {
      params,
    }),
  getSettings: (category: CategorySettingsPayload['category']) =>
    requestClient.get('/task-center/admin/periodic/settings', {
      params: { category },
    }),
  saveSettings: (body: CategorySettingsPayload) =>
    requestClient.put('/task-center/admin/periodic/settings', body),
  batch: (body: {
    ids: number[];
    action: 'enable' | 'disable' | 'delete';
  }) => requestClient.post('/task-center/admin/periodic/batch', body),
  listDoubleSchemes: () =>
    requestClient.get('/task-center/admin/double-reward-schemes'),
  createDoubleScheme: (body: { name: string; multiplier: number }) =>
    requestClient.post('/task-center/admin/double-reward-schemes', body),
  create: (body: PeriodicTaskPayload) =>
    requestClient.post('/task-center/admin/periodic', body),
  update: (id: number, body: Partial<PeriodicTaskPayload>) =>
    requestClient.put(`/task-center/admin/periodic/${id}`, body),
  setStatus: (id: number, isActive: boolean) =>
    requestClient.put(`/task-center/admin/periodic/${id}/status`, { isActive }),
  listChests: () => requestClient.get('/task-center/admin/chests'),
  createChest: (body: Record<string, unknown>) =>
    requestClient.post('/task-center/admin/chests', body),
  updateChest: (id: number, body: Record<string, unknown>) =>
    requestClient.put(`/task-center/admin/chests/${id}`, body),
  deleteChest: (id: number) =>
    requestClient.delete(`/task-center/admin/chests/${id}`),
  getPointSettings: () =>
    requestClient.get('/task-center/admin/activity-points/settings'),
  updatePointSettings: (body: Record<string, unknown>) =>
    requestClient.put('/task-center/admin/activity-points/settings', body),
  listLedger: (params?: {
    userId?: number;
    keyword?: string;
    source?: string;
    origin?: string;
    from?: string;
    to?: string;
    take?: number;
    skip?: number;
  }) =>
    requestClient.get('/task-center/admin/activity-points/ledger', { params }),
  listBalances: (params?: {
    userId?: number;
    keyword?: string;
    account?: string;
    memberId?: string;
    take?: number;
    skip?: number;
  }) =>
    requestClient.get('/task-center/admin/activity-points/balances', {
      params,
    }),
  grantPoints: (body: {
    accountType: 'account' | 'userID';
    identifiers: string[];
    amount: number;
    validDays: number;
    frontRemark?: string | null;
    backRemark?: string | null;
  }) => requestClient.post('/task-center/admin/activity-points/grant', body),
  importGrantPoints: async (params: {
    file: File;
    accountType: 'account' | 'userID';
    validDays: number;
    frontRemark?: string | null;
    backRemark?: string | null;
  }) => {
    const fd = new FormData();
    fd.append('file', params.file);
    fd.append('accountType', params.accountType);
    fd.append('validDays', String(params.validDays));
    if (params.frontRemark) fd.append('frontRemark', params.frontRemark);
    if (params.backRemark) fd.append('backRemark', params.backRemark);
    return requestClient.post(
      '/task-center/admin/activity-points/grant/import',
      fd,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
  },
  downloadGrantTemplate: async (accountType: 'account' | 'userID') => {
    const res = await requestClient.get(
      '/task-center/admin/activity-points/grant/template',
      {
        params: { accountType },
        responseType: 'blob',
      },
    );
    return res as unknown as Blob;
  },
};
