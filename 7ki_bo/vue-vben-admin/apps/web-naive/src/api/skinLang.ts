import { requestClient } from '#/api/request';

/** 版式风格（存 skinStyle 字段，提交给后端为英文 key） */
export const LAYOUT_STYLE_OPTIONS: { label: string; value: string }[] = [
  { label: '综合版1', value: 'comprehensive_v1' },
  { label: '综合版2', value: 'comprehensive_v2' },
  { label: '综合版3', value: 'comprehensive_v3' },
  { label: '综合版4', value: 'comprehensive_v4' },
  { label: '综合版5', value: 'comprehensive_v5' },
  { label: '综合版6', value: 'comprehensive_v6' },
  { label: '综合版7', value: 'comprehensive_v7' },
  { label: '综合版8', value: 'comprehensive_v8' },
  { label: '综合版9', value: 'comprehensive_v9' },
  { label: '综合版10', value: 'comprehensive_v10' },
  { label: '综合版11', value: 'comprehensive_v11' },
  { label: '电子版1', value: 'electronic_v1' },
  { label: '体育版1', value: 'sports_v1' },
  { label: '体育版2', value: 'sports_v2' },
  { label: '体育版3', value: 'sports_v3' },
  { label: 'U版1', value: 'u_v1' },
  { label: 'U版3', value: 'u_v3' },
  { label: 'U版4', value: 'u_v4' },
  { label: '真人版1', value: 'live_v1' },
  { label: '真人版2', value: 'live_v2' },
  { label: '俱乐部版1', value: 'club_v1' },
];

const LAYOUT_STYLE_VALUES = new Set(LAYOUT_STYLE_OPTIONS.map((o) => o.value));

/** Prisma / 历史库默认；与客户端默认 comprehensive_v1 对齐 */
const LEGACY_SKIN_STYLE_TO_KEY: Record<string, string> = {
  欧风风: 'comprehensive_v1',
};

function mapLayoutLabelToKey(label: string): string | null {
  const hit = LAYOUT_STYLE_OPTIONS.find((o) => o.label === label);
  return hit ? hit.value : null;
}

/**
 * 版式风格：库中 skinStyle 可能仍是中文默认「欧风风」，而实际版式在 skinTemplate（comprehensive_v2 等）。
 * 读表单时归一成 LAYOUT_STYLE_OPTIONS 的英文 value。
 */
export function isLayoutStyleValue(v: string | undefined | null): boolean {
  if (v == null || v === '') return false;
  return LAYOUT_STYLE_VALUES.has(String(v).trim());
}

export function normalizeSkinStyleForForm(
  skinStyle: string | undefined | null,
  skinTemplate: string | undefined | null,
): string {
  const raw = (skinStyle ?? '').trim();
  const tpl = (skinTemplate ?? '').trim();

  if (raw && LAYOUT_STYLE_VALUES.has(raw)) return raw;
  if (tpl && LAYOUT_STYLE_VALUES.has(tpl)) return tpl;
  const fromLabel = raw ? mapLayoutLabelToKey(raw) : null;
  if (fromLabel) return fromLabel;
  if (raw && LEGACY_SKIN_STYLE_TO_KEY[raw]) {
    return LEGACY_SKIN_STYLE_TO_KEY[raw]!;
  }

  return raw || 'comprehensive_v1';
}

export function getLayoutStyleLabel(
  value: string | undefined,
  skinTemplate?: string | undefined,
): string {
  if (!value && !skinTemplate) return '-';
  const key = normalizeSkinStyleForForm(value ?? '', skinTemplate);
  const hit = LAYOUT_STYLE_OPTIONS.find((o) => o.value === key);
  if (hit) return hit.label;
  return value?.trim() || key || '-';
}

export interface BrandSkinLangConfig {
  id: number;
  brandId: string;
  brandCode?: string;
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
  borderColor?: string;
  colorPalette?: {
    primary: string;
    secondary: string;
    tertiary: string;
    accent: string;
    borderColor?: string;
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
  /** 主站 / 皮肤模板 */
  templateType?: string;
  /** 生效时间：custom = 自定义时间；immediate = 立即生效 */
  effectiveTimeMode?: 'custom' | 'immediate';
  /** 自定义生效时间（ISO 8601 或后端约定格式） */
  effectiveTime?: string | null;
  /** 上一次更换皮肤时间（服务端返回，展示用） */
  lastSkinChangeAt?: string | null;
  /** 大厅背景：system | custom_image | skin_default */
  lobbyBackgroundSource?: 'system' | 'custom_image' | 'skin_default';
  /** 自定义大厅背景图 URL（lobbyBackgroundSource=custom_image 时） */
  lobbyCustomImageUrl?: string;
  /** 底纹背景色（hex） */
  patternBackgroundColor?: string;
  /** 底纹 tab：light=白色底纹，dark=深色底纹 */
  lobbyPatternTab?: 'light' | 'dark';
  /** 选中底纹图完整 URL；空字符串表示无底纹 */
  lobbyPatternUrl?: string | null;
  /** @deprecated 旧版底纹 id，仅用于兼容读取；新数据请用 lobbyPatternUrl */
  lobbyPatternId?: string;
  clientLanguages: string[];
  authMode?: string;
  appSetting?: string;
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
  /** 可选；新建可不传，由前端置空字符串 */
  brandCode?: string;
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
  borderColor?: string;
  colorPalette?: {
    primary: string;
    secondary: string;
    tertiary: string;
    accent: string;
    borderColor?: string;
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
  templateType?: string;
  effectiveTimeMode?: 'custom' | 'immediate';
  effectiveTime?: string | null;
  lobbyBackgroundSource?: 'system' | 'custom_image' | 'skin_default';
  lobbyCustomImageUrl?: string;
  patternBackgroundColor?: string;
  lobbyPatternTab?: 'light' | 'dark';
  lobbyPatternUrl?: string | null;
  /** @deprecated 旧版；提交以 lobbyPatternUrl 为准 */
  lobbyPatternId?: string;
  clientLanguages: string[];
  authMode?: string;
  appSetting?: string;
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
