import { requestClient } from '../request';

export interface RechargeCategory {
  id: number;
  name: string;
  icon?: string;
  blacklistStatus: 'ENABLED' | 'DISABLED';
  isActive: 'ENABLED' | 'DISABLED';
  badge?: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface CreateRechargeCategoryData {
  name: string;
  icon?: string;
  blacklistStatus: 'ENABLED' | 'DISABLED';
  isActive: 'ENABLED' | 'DISABLED';
  badge?: string;
  displayOrder?: number;
}

export interface UpdateRechargeCategoryData extends Partial<CreateRechargeCategoryData> {}

export interface RechargeCategoryQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  isActive?: string;
  blacklistStatus?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface RechargeCategoryResponse {
  success: boolean;
  data: {
    list: RechargeCategory[];
    pagination: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
  };
  message?: string;
}

export interface RechargeCategoryOptionsResponse {
  success: boolean;
  data: Array<{
    label: string;
    value: number;
    icon?: string;
  }>;
  message?: string;
}

// Get recharge categories list
export async function getRechargeCategories(params: RechargeCategoryQueryParams = {}): Promise<RechargeCategoryResponse> {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
  if (params.search) queryParams.append('search', params.search);
  if (params.isActive) queryParams.append('isActive', params.isActive);
  if (params.blacklistStatus) queryParams.append('blacklistStatus', params.blacklistStatus);
  if (params.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

  const response = await requestClient.get(`/wallet/recharge-categories?${queryParams.toString()}`);
  return response;
}

// Get recharge category by ID
export async function getRechargeCategoryById(id: number): Promise<{ success: boolean; data: RechargeCategory; message?: string }> {
  const response = await requestClient.get(`/wallet/recharge-categories/${id}`);
  return response;
}

// Create new recharge category
export async function createRechargeCategory(data: CreateRechargeCategoryData): Promise<{ success: boolean; data: RechargeCategory; message?: string }> {
  const response = await requestClient.post('/wallet/recharge-categories', data);
  return response;
}

// Update recharge category
export async function updateRechargeCategory(id: number, data: UpdateRechargeCategoryData): Promise<{ success: boolean; data: RechargeCategory; message?: string }> {
  const response = await requestClient.put(`/wallet/recharge-categories/${id}`, data);
  return response;
}

// Delete recharge category
export async function deleteRechargeCategory(id: number): Promise<{ success: boolean; message?: string }> {
  const response = await requestClient.delete(`/wallet/recharge-categories/${id}`);
  return response;
}

// Toggle recharge category status
export async function toggleRechargeCategoryStatus(id: number): Promise<{ success: boolean; data: RechargeCategory; message?: string }> {
  const response = await requestClient.patch(`/wallet/recharge-categories/${id}/toggle-status`);
  return response;
}

// Get recharge category options (for dropdowns)
export async function getRechargeCategoryOptions(): Promise<RechargeCategoryOptionsResponse> {
  const response = await requestClient.get('/wallet/recharge-categories/options');
  return response;
}
