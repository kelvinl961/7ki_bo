import { requestClient } from '#/api/request';

// Admin routes (require authentication)
export namespace LayoutDesignApi {
  // Get all layout configurations (admin)
  export function getLayoutConfigs(params?: {
    page?: number;
    limit?: number;
    brandCode?: string;
  }) {
    return requestClient.get<{
      success: boolean;
      data: {
        configs: LayoutConfig[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          pages: number;
        };
      };
    }>('/layout-design/configs', { params });
  }

  // Get layout configuration by ID (admin)
  export function getLayoutConfig(id: string | number) {
    return requestClient.get<{
      success: boolean;
      data: LayoutConfig;
    }>(`/layout-design/configs/${id}`);
  }

  // Create layout configuration (admin)
  export function createLayoutConfig(data: LayoutConfigCreateRequest) {
    return requestClient.post<{
      success: boolean;
      message: string;
      data: LayoutConfig;
    }>('/layout-design/configs', data);
  }

  // Update layout configuration (admin)
  export function updateLayoutConfig(id: string | number, data: LayoutConfigCreateRequest) {
    return requestClient.put<{
      success: boolean;
      message: string;
      data: LayoutConfig;
    }>(`/layout-design/configs/${id}`, data);
  }

  // Delete layout configuration (admin)
  export function deleteLayoutConfig(id: string | number) {
    return requestClient.delete<{
      success: boolean;
      message: string;
    }>(`/layout-design/configs/${id}`);
  }

  // Get available icons (admin)
  export function getAvailableIcons(category?: string) {
    return requestClient.get<{
      success: boolean;
      data: AvailableIcon[];
    }>('/layout-design/icons', { params: { category } });
  }

  // Upload icon (admin)
  export function uploadIcon(formData: FormData) {
    return requestClient.post<{
      success: boolean;
      message: string;
      data: AvailableIcon;
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
      success: boolean;
      data: LayoutConfig;
      source: 'brand' | 'default';
    }>('/layout-design/public/active-config', { params });
  }

  // Get layout theme information
  export function getLayoutTheme(brandCode?: string) {
    return requestClient.get<{
      success: boolean;
      data: {
        layout: LayoutTheme;
        brandSkin: BrandSkinConfig | null;
      };
    }>('/layout-design/public/theme', { 
      params: brandCode ? { brandCode } : undefined 
    });
  }

  // Get public available icons
  export function getPublicAvailableIcons(category?: string) {
    return requestClient.get<{
      success: boolean;
      data: PublicIcon[];
    }>('/layout-design/public/icons', { params: { category } });
  }
}

// Type definitions
export interface LayoutConfig {
  id: number;
  skinName: string;
  bannerStyle: 'common' | 'small' | 'scroll' | 'large';
  myPageStyle: 'style1' | 'style2' | 'style3' | 'style4' | 'style5';
  gameCardIcon: 'european' | 'classic';
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
    beforeLogin: ButtonConfig[];
    afterLogin: ButtonConfig[];
  };
}

export interface ButtonConfig {
  icon: string;
  label: string;
  display?: string;
}

export interface LayoutConfigCreateRequest {
  layoutConfig: {
    skinName: string;
    bannerStyle: 'common' | 'small' | 'scroll' | 'large';
    myPageStyle: 'style1' | 'style2' | 'style3' | 'style4' | 'style5';
    gameCardIcon: 'european' | 'classic';
    popupStyle: 'style1' | 'style2' | 'style3';
    pageStyle: 'auto' | 'manual';
    lobbyButtonStyle: 'style1' | 'style2' | 'style3';
    selfPromotionEnabled: boolean;
    brandCode?: string;
  };
  buttonConfig: {
    beforeLogin: Array<{
      icon?: string;
      label?: string;
    }>;
    afterLogin: Array<{
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