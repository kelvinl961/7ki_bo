import { requestClient } from '#/api/request';

export interface BrandLogoSetting {
  id: number;
  logoType: string;
  isEnabled: boolean;
  brandName?: string;
  webTitle?: string;
  logoClickType?: 'homepage' | 'custom';
  logoClickUrl?: string;
  enableSkeleton?: boolean;
  loginImage?: string;
  appStoreImage?: string;
  appInternalLogo?: string;
  lobbyLogo?: string;
  webFavicon?: string;
  webLogo?: string;
  // File URL versions (preferred)
  loginImageFileUrl?: string;
  appStoreImageFileUrl?: string;
  appInternalLogoFileUrl?: string;
  lobbyLogoFileUrl?: string;
  webFaviconFileUrl?: string;
  webLogoFileUrl?: string;
  skeletonImage?: string;
  skeletonImageFileUrl?: string;
  restrictedContent?: string;
  remark?: string;
  operator: string;
  createdAt: string;
  updatedAt: string;
}

export interface BrandLogoSettingFilters {
  page?: number;
  pageSize?: number;
  logoType?: string;
  isEnabled?: boolean;
  operator?: string;
}

export interface BrandLogoSettingCreateRequest {
  logoType: string;
  isEnabled?: boolean;
  brandName?: string;
  webTitle?: string;
  logoClickType?: 'homepage' | 'custom';
  logoClickUrl?: string;
  enableSkeleton?: boolean;
  loginImage?: string;
  appStoreImage?: string;
  appInternalLogo?: string;
  lobbyLogo?: string;
  webFavicon?: string;
  webLogo?: string;
  // File URL versions (preferred)
  loginImageFileUrl?: string;
  appStoreImageFileUrl?: string;
  appInternalLogoFileUrl?: string;
  lobbyLogoFileUrl?: string;
  webFaviconFileUrl?: string;
  webLogoFileUrl?: string;
  skeletonImage?: string;
  skeletonImageFileUrl?: string;
  restrictedContent?: string;
  remark?: string;
  operator?: string;
}

export interface BrandLogoSettingUpdateRequest extends BrandLogoSettingCreateRequest {
  id: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// Get all brand logo settings with pagination and filtering
export async function getBrandLogoSettings(filters?: BrandLogoSettingFilters) {
  return requestClient.get<ApiResponse<BrandLogoSetting[]>>('/brand-logo', {
    params: filters,
  });
}

// Get a specific brand logo setting by ID
export async function getBrandLogoSettingById(id: number) {
  return requestClient.get<ApiResponse<BrandLogoSetting>>(`/brand-logo/${id}`);
}

// Create a new brand logo setting
export async function createBrandLogoSetting(data: BrandLogoSettingCreateRequest) {
  return requestClient.post<ApiResponse<BrandLogoSetting>>('/brand-logo', data);
}

// Update a brand logo setting
export async function updateBrandLogoSetting(id: number, data: BrandLogoSettingCreateRequest) {
  return requestClient.put<ApiResponse<BrandLogoSetting>>(`/brand-logo/${id}`, data);
}

// Toggle brand logo setting enabled status
export async function toggleBrandLogoSetting(id: number, isEnabled: boolean) {
  //@ts-ignore
  return requestClient.patch<ApiResponse<BrandLogoSetting>>(`/brand-logo/${id}/toggle`, { isEnabled });
}

// Delete a brand logo setting
export async function deleteBrandLogoSetting(id: number) {
  return requestClient.delete<ApiResponse<null>>(`/brand-logo/${id}`);
}

// Bulk delete brand logo settings
export async function bulkDeleteBrandLogoSettings(ids: number[]) {
  return requestClient.delete<ApiResponse<null>>('/brand-logo/bulk', { data: { ids } });
} 