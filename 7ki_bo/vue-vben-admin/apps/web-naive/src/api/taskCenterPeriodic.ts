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
  tiers: LadderTierPayload[];
}

export const taskCenterPeriodicApi = {
  list: (category?: PeriodicCategory) =>
    requestClient.get('/task-center/admin/periodic', {
      params: category ? { category } : undefined,
    }),
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
    source?: string;
    take?: number;
    skip?: number;
  }) =>
    requestClient.get('/task-center/admin/activity-points/ledger', { params }),
  listBalances: (params?: {
    userId?: number;
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
