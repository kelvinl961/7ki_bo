import { requestClient } from '#/api/request';
import type { LuckyWheelItem, LuckyWheelPublicConfigSnapshot } from '#/views/activity/components/luckyWheelTypes';

export interface LuckyWheelAdminConfig {
  enabled: boolean;
  enabledAt: string | null;
  publicConfig: Record<string, unknown>;
  wheels: LuckyWheelItem[];
  updatedBy?: string | null;
  updatedAt?: string;
}

export interface LuckyWheelPagination {
  current: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export async function getLuckyWheelAdminConfigApi() {
  return requestClient.get<LuckyWheelAdminConfig>(
    '/user-management/lucky-wheel/config',
  ) as Promise<LuckyWheelAdminConfig>;
}

export async function putLuckyWheelAdminPublicConfigApi(
  publicConfig: LuckyWheelPublicConfigSnapshot,
) {
  return requestClient.put<LuckyWheelAdminConfig>(
    '/user-management/lucky-wheel/config/public',
    { publicConfig },
  ) as Promise<LuckyWheelAdminConfig>;
}

export async function putLuckyWheelAdminSwitchApi(enabled: boolean) {
  return requestClient.put<{ enabled: boolean; enabledAt: string | null }>(
    '/user-management/lucky-wheel/config/switch',
    { enabled },
  ) as Promise<{ enabled: boolean; enabledAt: string | null }>;
}

export async function putLuckyWheelItemApi(
  id: string,
  payload: Partial<LuckyWheelItem>,
) {
  return requestClient.put<LuckyWheelItem>(
    `/user-management/lucky-wheel/wheels/${id}`,
    payload,
  ) as Promise<LuckyWheelItem>;
}

export async function putLuckyWheelItemSwitchApi(id: string, enabled: boolean) {
  return requestClient.put<LuckyWheelItem>(
    `/user-management/lucky-wheel/wheels/${id}/switch`,
    { enabled },
  ) as Promise<LuckyWheelItem>;
}

export async function listLuckyWheelLuckyValueRecordsApi(params: {
  page: number;
  pageSize: number;
  memberSearchType?: string;
  memberKeyword?: string;
  changeType?: string;
  from?: string;
  to?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) {
  return requestClient.get<{ list: any[]; pagination: LuckyWheelPagination }>(
    '/user-management/lucky-wheel/lucky-value-records',
    { params },
  ) as Promise<{ list: any[]; pagination: LuckyWheelPagination }>;
}

export async function exportLuckyWheelLuckyValueRecordsApi(params: Record<string, unknown>) {
  return requestClient.get<Blob>(
    '/user-management/lucky-wheel/lucky-value-records/export.csv',
    { params, responseType: 'blob' },
  );
}

export async function listLuckyWheelRemainingLuckyValueApi(params: {
  page: number;
  pageSize: number;
  memberSearchType?: string;
  memberKeyword?: string;
  metric?: string;
  metricMin?: number;
  metricMax?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) {
  return requestClient.get<{ list: any[]; pagination: LuckyWheelPagination }>(
    '/user-management/lucky-wheel/remaining-lucky-value',
    { params },
  ) as Promise<{ list: any[]; pagination: LuckyWheelPagination }>;
}

export async function exportLuckyWheelRemainingLuckyValueApi(params: Record<string, unknown>) {
  return requestClient.get<Blob>(
    '/user-management/lucky-wheel/remaining-lucky-value/export.csv',
    { params, responseType: 'blob' },
  );
}

export async function listLuckyWheelWinningRecordsApi(params: {
  page: number;
  pageSize: number;
  memberSearchType?: string;
  memberKeyword?: string;
  rewardTypes?: string[];
  wheelType?: string;
  from?: string;
  to?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) {
  return requestClient.get<{ list: any[]; pagination: LuckyWheelPagination }>(
    '/user-management/lucky-wheel/winning-records',
    { params },
  ) as Promise<{ list: any[]; pagination: LuckyWheelPagination }>;
}

export async function exportLuckyWheelWinningRecordsApi(params: Record<string, unknown>) {
  return requestClient.get<Blob>(
    '/user-management/lucky-wheel/winning-records/export.csv',
    { params, responseType: 'blob' },
  );
}

export async function listLuckyWheelPhysicalOrdersApi(params: {
  page: number;
  pageSize: number;
  memberSearchType?: string;
  memberKeyword?: string;
  operatorSearchType?: string;
  operatorKeyword?: string;
  status?: string;
  timeField?: string;
  from?: string;
  to?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) {
  return requestClient.get<{ list: any[]; pagination: LuckyWheelPagination }>(
    '/user-management/lucky-wheel/physical-orders',
    { params },
  ) as Promise<{ list: any[]; pagination: LuckyWheelPagination }>;
}

export async function exportLuckyWheelPhysicalOrdersApi(params: Record<string, unknown>) {
  return requestClient.get<Blob>(
    '/user-management/lucky-wheel/physical-orders/export.csv',
    { params, responseType: 'blob' },
  );
}

export async function addLuckyWheelLuckyValueApi(payload: {
  account: string;
  amount: number;
  backendRemark?: string;
}) {
  return requestClient.post('/user-management/lucky-wheel/lucky-value/manual', payload);
}
