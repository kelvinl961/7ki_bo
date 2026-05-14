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
export type BannerStyleId =
  | 'common'
  | 'small'
  | 'scroll'
  | 'medium'
  | 'large';

export type ScrollSensitivity =
  | 'slow'
  | 'slower'
  | 'medium'
  | 'faster'
  | 'fast';

/** 我的页模板（可继续扩展 profile_v2…；旧库可能仍为 style1 等，前端加载时归一化） */
export type MyPageStyleId = 'profile_v1' | 'profile_v7';

export const MY_PAGE_STYLE_TEMPLATE_IMAGE: Record<MyPageStyleId, string> = {
  profile_v1:
    'https://my-media-bucket-sp-1353364131.cos.sa-saopaulo.myqcloud.com/media/template/profile_v1.avif',
  profile_v7:
    'https://my-media-bucket-sp-1353364131.cos.sa-saopaulo.myqcloud.com/media/template/profile_v7.avif',
};

/** 版式配置实体：前端可阶段性只开放部分项（如「我的页面样式」），其余字段仍应读写以便后续扩展。 */
export interface LayoutConfig {
  id: number;
  skinName: string;
  bannerStyle: BannerStyleId;
  myPageStyle: MyPageStyleId;
  gameCardIcon: 'classic' | 'european';
  /** 平台游戏区卡片样式（与 gameCardIcon 区分时可单独配置） */
  platformCardStyle?: string;
  popupStyle: 'style1' | 'style2' | 'style3' | 'style4';
  /** 列表翻页：自动 / 手动（旧字段） */
  pageStyle: 'auto' | 'manual';
  /** 角标/翻页视觉：推荐、新、火爆 分区样式 */
  badgeRecommendStyle?: string;
  badgeNewStyle?: string;
  badgeHotStyle?: string;
  lobbyButtonStyle: string;
  /** 页面滑动灵敏度（APP） */
  scrollSensitivity?: ScrollSensitivity;
  /** 首页排版（仅综合版1） */
  homeLayoutStyle?: string;
  /** 侧边菜单栏（仅综合版1） */
  sideMenuStyle?: string;
  /** 未绑定 NO 钱包是否展示引导（CNY/INR + 公版） */
  noWalletGuideEnabled?: boolean;
  /** 顶部导航广告图区域是否展示 */
  topNavAdEnabled: boolean;
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
    bannerStyle: BannerStyleId;
    brandCode?: string;
    gameCardIcon: 'classic' | 'european';
    platformCardStyle?: string;
    lobbyButtonStyle: string;
    myPageStyle: MyPageStyleId;
    pageStyle: 'auto' | 'manual';
    popupStyle: 'style1' | 'style2' | 'style3' | 'style4';
    badgeRecommendStyle?: string;
    badgeNewStyle?: string;
    badgeHotStyle?: string;
    scrollSensitivity?: ScrollSensitivity;
    homeLayoutStyle?: string;
    sideMenuStyle?: string;
    noWalletGuideEnabled?: boolean;
    topNavAdEnabled: boolean;
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
  platformCardStyle?: string;
  popupStyle: string;
  pageStyle: string;
  lobbyButtonStyle: string;
  scrollSensitivity?: string;
  badgeRecommendStyle?: string;
  badgeNewStyle?: string;
  badgeHotStyle?: string;
  /** 顶部导航广告图区域是否展示 */
  topNavAdEnabled?: boolean;
  selfPromotionEnabled: boolean;
}

export interface BrandSkinConfig {
  /** 品牌展示名（品牌皮肤配置） */
  brandName?: string;
  brandCode?: string;
  /** 皮肤背景图 URL（品牌皮肤配置） */
  backgroundImage?: string | null;
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
