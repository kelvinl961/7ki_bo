import { requestClient } from '#/api/request';

export interface ProvidentFundAdminConfig {
  enabled: boolean;
  enabledAt: string | null;
  settings: Record<string, unknown>;
  updatedBy?: string | null;
  updatedAt?: string;
}

export async function getProvidentFundAdminConfigApi() {
  return requestClient.get<ProvidentFundAdminConfig>(
    '/user-management/provident-fund/config',
  ) as Promise<ProvidentFundAdminConfig>;
}

export async function putProvidentFundAdminSettingsApi(
  settings: Record<string, unknown>,
) {
  return requestClient.put<ProvidentFundAdminConfig>(
    '/user-management/provident-fund/config/settings',
    { settings },
  ) as Promise<ProvidentFundAdminConfig>;
}

export async function putProvidentFundAdminSwitchApi(enabled: boolean) {
  return requestClient.put<{ enabled: boolean; enabledAt: string | null }>(
    '/user-management/provident-fund/config/switch',
    { enabled },
  ) as Promise<{ enabled: boolean; enabledAt: string | null }>;
}

export interface ProvidentFundPagination {
  current: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export async function listProvidentFundDetailsApi(params: {
  page: number;
  pageSize: number;
  account?: string;
  currency?: string;
  from?: string;
  to?: string;
}) {
  return requestClient.get<{ list: any[]; pagination: ProvidentFundPagination }>(
    '/user-management/provident-fund/details',
    { params },
  ) as Promise<{ list: any[]; pagination: ProvidentFundPagination }>;
}

export async function exportProvidentFundDetailsCsvApi(params: {
  account?: string;
  currency?: string;
  from?: string;
  to?: string;
}) {
  return requestClient.get<Blob>(
    '/user-management/provident-fund/details/export.csv',
    { params, responseType: 'blob' },
  );
}

export async function listProvidentFundWageringApi(params: {
  page: number;
  pageSize: number;
  account?: string;
  currency?: string;
  status?: string;
  from?: string;
  to?: string;
}) {
  return requestClient.get<{ list: any[]; pagination: ProvidentFundPagination }>(
    '/user-management/provident-fund/wagering',
    { params },
  ) as Promise<{ list: any[]; pagination: ProvidentFundPagination }>;
}

export async function forceReleaseProvidentFundWageringApi(id: string) {
  return requestClient.post<{ id: string }>(
    `/user-management/provident-fund/wagering/${id}/force-release`,
    {},
  ) as Promise<{ id: string }>;
}

export async function listProvidentFundWithdrawalsApi(params: {
  page: number;
  pageSize: number;
  account?: string;
  currency?: string;
  from?: string;
  to?: string;
}) {
  return requestClient.get<{ list: any[]; pagination: ProvidentFundPagination }>(
    '/user-management/provident-fund/withdrawals',
    { params },
  ) as Promise<{ list: any[]; pagination: ProvidentFundPagination }>;
}
