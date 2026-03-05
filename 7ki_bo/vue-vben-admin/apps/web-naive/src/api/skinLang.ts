import { requestClient } from '#/api/request';

export interface BrandSkinLangConfig {
  id: number;
  brandId: string;
  brandCode: string;
  brandName: string;
  brandType: string;
  channelType: string;
  skinStyle: string;
  gameColor: string;
  skinColor: string;
  skinColorRgb?: string;
  skinColorHex?: string;
  // 自动生成的主题色彩
  primaryColor?: string;
  secondaryColor?: string;
  tertiaryColor?: string;
  accentColor?: string;
  colorPalette?: {
    primary: string;
    secondary: string;
    tertiary: string;
    accent: string;
    generated: boolean;
    generatedAt: string;
  };
  // New color fields from ColorPalette
  textPrimary?: string; // Dark text color for headings
  textSecondary?: string; // Light text color for descriptions
  textAccent?: string; // Accent text color
  buttonColor?: string; // Button background color
  // Background image field
  backgroundImage?: string; // URL or path to background image
  skinTemplate: string;
  clientLanguages: string[];
  authMode: string;
  appSetting: string;
  createdAt: string;
  updatedAt: string;
  operator: string;
  backendRemark?: string;
}

export interface BrandSkinLangFilters {
  page?: number;
  pageSize?: number;
  brandId?: string;
  brandCode?: string;
  brandName?: string;
  brandType?: string;
  channelType?: string;
  skinStyle?: string;
  operator?: string;
}

export interface BrandSkinLangCreateRequest {
  brandId: string;
  brandCode: string;
  brandName: string;
  brandType: string;
  channelType: string;
  skinStyle: string;
  gameColor: string;
  skinColor: string;
  skinColorRgb?: string;
  skinColorHex?: string;
  // 自动生成的主题色彩
  primaryColor?: string;
  secondaryColor?: string;
  tertiaryColor?: string;
  accentColor?: string;
  colorPalette?: {
    primary: string;
    secondary: string;
    tertiary: string;
    accent: string;
    generated: boolean;
    generatedAt: string;
  };
  // New color fields from ColorPalette
  textPrimary?: string; // Dark text color for headings
  textSecondary?: string; // Light text color for descriptions
  textAccent?: string; // Accent text color
  buttonColor?: string; // Button background color
  // Background image field
  backgroundImage?: string; // URL or path to background image
  skinTemplate: string;
  clientLanguages: string[];
  authMode: string;
  appSetting: string;
  backendRemark?: string;
  operator?: string;
}

export interface BrandSkinLangUpdateRequest extends BrandSkinLangCreateRequest {
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

export async function getBrandSkinLangConfigs(filters?: BrandSkinLangFilters) {
  try {
    const params = new URLSearchParams();

    // Add pagination parameters
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.pageSize)
      params.append('pageSize', filters.pageSize.toString());

    // Add filter parameters
    if (filters?.brandId) params.append('brandId', filters.brandId);
    if (filters?.brandCode) params.append('brandCode', filters.brandCode);
    if (filters?.brandName) params.append('brandName', filters.brandName);
    if (filters?.brandType) params.append('brandType', filters.brandType);
    if (filters?.channelType) params.append('channelType', filters.channelType);
    if (filters?.skinStyle) params.append('skinStyle', filters.skinStyle);
    if (filters?.operator) params.append('operator', filters.operator);

    const response = await requestClient.get(
      `/brand-skin-lang?${params.toString()}`,
    );
    return response;
  } catch (error) {
    console.error('获取品牌皮肤语言配置失败:', error);
    throw error;
  }
}

export async function getBrandSkinLangConfigById(id: number) {
  try {
    const response = await requestClient.get(`/brand-skin-lang/${id}`);
    return response;
  } catch (error) {
    console.error('获取品牌皮肤语言配置详情失败:', error);
    throw error;
  }
}

export async function createBrandSkinLangConfig(
  data: BrandSkinLangCreateRequest,
) {
  try {
    const response = await requestClient.post('/brand-skin-lang', data);
    return response;
  } catch (error) {
    console.error('创建品牌皮肤语言配置失败:', error);
    throw error;
  }
}

export async function updateBrandSkinLangConfig(
  id: number,
  data: BrandSkinLangCreateRequest,
) {
  try {
    const response = await requestClient.put(`/brand-skin-lang/${id}`, data);
    return response;
  } catch (error) {
    console.error('更新品牌皮肤语言配置失败:', error);
    throw error;
  }
}

export async function deleteBrandSkinLangConfig(id: number) {
  try {
    const response = await requestClient.delete(`/brand-skin-lang/${id}`);
    return response;
  } catch (error) {
    console.error('删除品牌皮肤语言配置失败:', error);
    throw error;
  }
}

export async function bulkDeleteBrandSkinLangConfigs(ids: number[]) {
  try {
    const response = await requestClient.post('/brand-skin-lang/bulk-delete', {
      ids,
    });
    return response;
  } catch (error) {
    console.error('批量删除品牌皮肤语言配置失败:', error);
    throw error;
  }
}
