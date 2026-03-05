import { requestClient } from '#/api/request';

/**
 * 品牌皮肤配置（与 BrandSkinSetting 表单一致）
 * 后端需提供 GET/PUT 或 GET/POST 接口持久化；
 * 前端（用户端）需在首屏请求此配置并注入 CSS 变量或 theme，界面才会更新。
 */
export interface BrandSkinConfig {
  skinColorId?: string | null;
  primaryColor: string;
  secondaryColor: string;
  tertiaryColor: string;
  accentColor: string;
  textPrimaryColor: string;
  textSecondaryColor: string;
  textAccentColor: string;
  buttonColor: string;
  lobbyBackgroundType: 'system_default' | 'system_config' | 'custom_image';
  lobbyBackgroundColor: string;
  lobbyBackgroundImageUrl?: string;
  effectiveStartTime?: number | null;
  effectiveEndTime?: number | null;
}

/**
 * 获取当前品牌皮肤配置
 * - 管理端：进入页面时加载，用于编辑
 * - 前端（用户端）：首屏或主题初始化时请求，得到后注入 :root CSS 变量或 theme，界面即按新配置展示
 */
export async function getBrandSkinConfigApi(): Promise<BrandSkinConfig | null> {
  try {
    const res = await requestClient.get<BrandSkinConfig | null>(
      '/brand-skin-config',
    );
    return res ?? null;
  } catch {
    return null;
  }
}

/**
 * 保存品牌皮肤配置
 * 保存成功后，若前端（用户端）有轮询或 WebSocket 拉取配置，会拿到新数据并更新主题；
 * 或用户下次进入页面时通过 getBrandSkinConfigApi 拿到最新配置，前端即会更新。
 */
export async function saveBrandSkinConfigApi(
  data: BrandSkinConfig,
): Promise<BrandSkinConfig> {
  return requestClient.put<BrandSkinConfig>('/brand-skin-config', data);
}
