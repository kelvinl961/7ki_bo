import { requestClient } from '#/api/request';

// Admin routes (require authentication)
export namespace LayoutDesignApi {
  // Get all layout configurations (admin)
  export function getLayoutConfigs(params?: {
    brandCode?: string;
    limit?: number;
    page?: number;
  }) {
    return requestClient.get<{
      data: {
        configs: LayoutConfig[];
        pagination: {
          limit: number;
          page: number;
          pages: number;
          total: number;
        };
      };
      success: boolean;
    }>('/layout-design/configs', { params });
  }

  // Get layout configuration by ID (admin)
  export function getLayoutConfig(id: number | string) {
    return requestClient.get<{
      data: LayoutConfig;
      success: boolean;
    }>(`/layout-design/configs/${id}`);
  }

  // Create layout configuration (admin)
  export function createLayoutConfig(data: LayoutConfigCreateRequest) {
    return requestClient.post<{
      data: LayoutConfig;
      message: string;
      success: boolean;
    }>('/layout-design/configs', data);
  }

  // Update layout configuration (admin)
  export function updateLayoutConfig(
    id: number | string,
    data: LayoutConfigCreateRequest,
  ) {
    return requestClient.put<{
      data: LayoutConfig;
      message: string;
      success: boolean;
    }>(`/layout-design/configs/${id}`, data);
  }

  // Delete layout configuration (admin)
  export function deleteLayoutConfig(id: number | string) {
    return requestClient.delete<{
      message: string;
      success: boolean;
    }>(`/layout-design/configs/${id}`);
  }

  // Get available icons (admin)
  export function getAvailableIcons(category?: string) {
    return requestClient.get<{
      data: AvailableIcon[];
      success: boolean;
    }>('/layout-design/icons', { params: { category } });
  }

  // Upload icon (admin)
  export function uploadIcon(formData: FormData) {
    return requestClient.post<{
      data: AvailableIcon;
      message: string;
      success: boolean;
    }>('/layout-design/icons/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
}

// Public routes (no authentication required)
export namespace PublicLayoutApi {
  // Get active layout configuration for current brand
  export function getActiveLayoutConfig(params?: {
    brandCode?: string;
    domain?: string;
  }) {
    return requestClient.get<{
      data: LayoutConfig;
      source: 'brand' | 'default';
      success: boolean;
    }>('/layout-design/public/active-config', { params });
  }

  // Get layout theme information
  export function getLayoutTheme(brandCode?: string) {
    return requestClient.get<{
      data: {
        brandSkin: BrandSkinConfig | null;
        layout: LayoutTheme;
      };
      success: boolean;
    }>('/layout-design/public/theme', {
      params: brandCode ? { brandCode } : undefined,
    });
  }

  // Get public available icons
  export function getPublicAvailableIcons(category?: string) {
    return requestClient.get<{
      data: PublicIcon[];
      success: boolean;
    }>('/layout-design/public/icons', { params: { category } });
  }
}

// Type definitions
export interface LayoutConfig {
  id: number;
  skinName: string;
  bannerStyle: 'common' | 'large' | 'scroll' | 'small';
  myPageStyle: 'style1' | 'style2' | 'style3' | 'style4' | 'style5';
  gameCardIcon: 'classic' | 'european';
  popupStyle: 'style1' | 'style2' | 'style3';
  pageStyle: 'auto' | 'manual';
  lobbyButtonStyle: 'style1' | 'style2' | 'style3';
  selfPromotionEnabled: boolean;
  brandCode?: string;
  isActive: boolean;
  operator: string;
  createdAt: string;
  updatedAt: string;
  buttonConfigs: {
    afterLogin: ButtonConfig[];
    beforeLogin: ButtonConfig[];
  };
}

export interface ButtonConfig {
  icon: string;
  label: string;
  display?: string;
}

export interface LayoutConfigCreateRequest {
  layoutConfig: {
    bannerStyle: 'common' | 'large' | 'scroll' | 'small';
    brandCode?: string;
    gameCardIcon: 'classic' | 'european';
    lobbyButtonStyle: 'style1' | 'style2' | 'style3';
    myPageStyle: 'style1' | 'style2' | 'style3' | 'style4' | 'style5';
    pageStyle: 'auto' | 'manual';
    popupStyle: 'style1' | 'style2' | 'style3';
    selfPromotionEnabled: boolean;
    skinName: string;
  };
  buttonConfig: {
    afterLogin: Array<{
      icon?: string;
      label?: string;
    }>;
    beforeLogin: Array<{
      icon?: string;
      label?: string;
    }>;
  };
}

export interface AvailableIcon {
  id: number;
  iconKey: string;
  iconLabel: string;
  iconDisplay?: string; // For backward compatibility
  imageUrl?: string;
  imagePath?: string;
  imageType?: string;
  category?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface PublicIcon {
  iconKey: string;
  iconLabel: string;
  iconDisplay: string;
  category?: string;
}

export interface LayoutTheme {
  skinName: string;
  bannerStyle: string;
  myPageStyle: string;
  gameCardIcon: string;
  popupStyle: string;
  pageStyle: string;
  lobbyButtonStyle: string;
  selfPromotionEnabled: boolean;
}

export interface BrandSkinConfig {
  skinStyle: string;
  gameColor: string;
  skinColor: string;
  skinColorRgb?: string;
  skinColorHex?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  colorPalette?: any;
  skinTemplate: string;
}
