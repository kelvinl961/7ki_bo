import { requestClient } from '#/api/request';

export interface BrandSetting {
  id: number;
  name?: string;
  brandCode?: string;
  siteUrl?: string;
  showHomeEntry: boolean;
  logoType?: string;
  appLogoUrl?: string;
  appBackground?: string;
  lobbyLogoUrl?: string;
  webLogoUrl?: string;
  blockedMessage?: string;
  remark?: string;
  updatedBy?: string;
  updatedAt?: string;
  createdAt?: string;
}

export interface BrandSettingListParams {
  page?: number;
  pageSize?: number;
  logoType?: string;
  siteUrl?: string;
}

export interface BrandSettingListResponse {
  list: BrandSetting[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateBrandSettingRequest {
  name?: string;
  brandCode?: string;
  siteUrl?: string;
  logoType?: string;
  showHomeEntry?: boolean;
  appLogoUrl?: string;
  appBackground?: string;
  lobbyLogoUrl?: string;
  webLogoUrl?: string;
  blockedMessage?: string;
  remark?: string;
}

export interface UpdateBrandSettingRequest
  extends Partial<CreateBrandSettingRequest> {}

/**
 * Get brand settings list
 */
export async function getBrandSettingsApi(
  params: BrandSettingListParams = {},
): Promise<BrandSettingListResponse> {
  return requestClient.get<BrandSettingListResponse>('/brand-settings', {
    params,
  });
}

/**
 * Get brand setting by ID
 */
export async function getBrandSettingApi(id: number): Promise<BrandSetting> {
  return requestClient.get<BrandSetting>(`/brand-settings/${id}`);
}

/**
 * Create brand setting
 */
export async function createBrandSettingApi(
  data: CreateBrandSettingRequest,
): Promise<BrandSetting> {
  return requestClient.post<BrandSetting>('/brand-settings', data);
}

/**
 * Update brand setting
 */
export async function updateBrandSettingApi(
  id: number,
  data: UpdateBrandSettingRequest,
): Promise<BrandSetting> {
  return requestClient.put<BrandSetting>(`/brand-settings/${id}`, data);
}

/**
 * Delete brand setting
 */
export async function deleteBrandSettingApi(id: number): Promise<void> {
  return requestClient.delete<void>(`/brand-settings/${id}`);
}

/**
 * Upload image
 */
export async function uploadImageApi(file: File): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append('file', file);

  return requestClient.post<{ url: string }>('/upload/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}
