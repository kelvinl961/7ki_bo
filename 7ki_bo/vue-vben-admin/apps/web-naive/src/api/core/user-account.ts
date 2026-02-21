import { requestClient } from '#/api/request';

export interface BackofficeAccount {
  id: number;
  username: string;
  role: string;
  status: string;
  isSuspended: boolean;
  createdDate: string;
  lastLoginDate?: string;
  lastLoginIp?: string;
  failedLoginAttempt: number;
}

export interface BackofficeAccountListParams {
  page: number;
  pageSize: number;
  search?: string;
  role?: string;
  status?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface BackofficeAccountListResponse {
  list: BackofficeAccount[];
  pagination: {
    current: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateBackofficeAccountParams {
  username: string;
  password: string;
  role: string;
  status?: number;
}

export interface UpdateBackofficeAccountParams {
  username?: string;
  password?: string;
  role?: string;
  status?: number;
  isSuspended?: boolean;
}

/**
 * Get backoffice accounts list
 */
export async function getBackofficeAccountsApi(
  params: BackofficeAccountListParams,
) {
  return requestClient.get<BackofficeAccountListResponse>('/user-accounts', {
    params,
  });
}

/**
 * Get backoffice account by ID
 */
export async function getBackofficeAccountByIdApi(id: number) {
  return requestClient.get<BackofficeAccount>(`/user-accounts/${id}`);
}

/**
 * Create new backoffice account
 */
export async function createBackofficeAccountApi(
  params: CreateBackofficeAccountParams,
) {
  return requestClient.post<BackofficeAccount>('/user-accounts', params);
}

/**
 * Update backoffice account
 */
export async function updateBackofficeAccountApi(
  id: number,
  params: UpdateBackofficeAccountParams,
) {
  return requestClient.put<BackofficeAccount>(`/user-accounts/${id}`, params);
}

/**
 * Delete backoffice account
 */
export async function deleteBackofficeAccountApi(id: number) {
  return requestClient.delete(`/user-accounts/${id}`);
}

/**
 * Toggle account status (suspended/active)
 */
export async function toggleAccountStatusApi(id: number, isSuspended: boolean) {
  return requestClient.put<BackofficeAccount>(`/user-accounts/${id}`, {
    isSuspended,
  });
}
