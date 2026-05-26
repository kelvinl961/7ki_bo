import type { BrandSkinLangConfig, BrandSkinLangCreateRequest } from '#/api/skinLang';
import {
  getBrandSkinLangConfigs,
  updateBrandSkinLangConfig,
} from '#/api/skinLang';
import { getDefaultBackgroundImage } from '#/utils/colorUtils';
import { getSkinColorValues } from '#/composables/useSkinPreview';
import type { ColorPalette } from '#/utils/colorUtils';

/** Payload shape used by BrandSkinSetting.vue */
export interface BrandSkinFormColors {
  skinColorId: string | null;
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
  lobbyBackgroundImageUrl: string;
  brandId: string;
  brandCode: string;
  brandName: string;
  clientLanguages: string[];
  authMode: string;
  appSetting: string;
  backendRemark: string;
}

export function mapRecordToFormColors(
  record: BrandSkinLangConfig,
): Partial<BrandSkinFormColors> {
  const lobbyBackgroundType: BrandSkinFormColors['lobbyBackgroundType'] =
    record.lobbyBackgroundSource === 'custom_image'
      ? 'custom_image'
      : record.lobbyBackgroundSource === 'system'
        ? 'system_config'
        : 'system_default';

  return {
    skinColorId: record.skinColor || null,
    primaryColor: record.primaryColor,
    secondaryColor: record.secondaryColor,
    tertiaryColor: record.tertiaryColor,
    accentColor: record.accentColor,
    textPrimaryColor: record.textPrimary,
    textSecondaryColor: record.textSecondary,
    textAccentColor: record.textAccent,
    buttonColor: record.buttonColor,
    lobbyBackgroundType,
    lobbyBackgroundColor:
      record.patternBackgroundColor || record.primaryColor || '#0a1628',
    lobbyBackgroundImageUrl:
      record.lobbyCustomImageUrl || record.backgroundImage || '',
    brandId: record.brandId,
    brandCode: record.brandCode ?? '',
    brandName: record.brandName,
    clientLanguages: record.clientLanguages ?? ['zh-CN'],
    authMode: record.authMode ?? '',
    appSetting: record.appSetting ?? '',
    backendRemark: record.backendRemark ?? '',
  };
}

export function buildBrandSkinLangUpdatePayload(
  record: BrandSkinLangConfig,
  form: BrandSkinFormColors,
  palette: ColorPalette,
): BrandSkinLangCreateRequest {
  const skinColorId = form.skinColorId || record.skinColor || '15';
  const { rgb, hex } = getSkinColorValues(skinColorId);
  const generatedAt = new Date().toISOString();

  const lobbyBackgroundSource =
    form.lobbyBackgroundType === 'custom_image'
      ? 'custom_image'
      : form.lobbyBackgroundType === 'system_config'
        ? 'system'
        : 'skin_default';

  return {
    brandId: form.brandId || record.brandId,
    brandCode: form.brandCode || record.brandCode,
    brandName: form.brandName || record.brandName,
    brandType: record.brandType,
    channelType: record.channelType,
    skinStyle: record.skinStyle,
    gameColor: record.gameColor,
    skinTemplate: record.skinTemplate,
    clientLanguages: form.clientLanguages.length
      ? form.clientLanguages
      : record.clientLanguages,
    authMode: form.authMode || record.authMode,
    appSetting: form.appSetting || record.appSetting,
    backendRemark: form.backendRemark || record.backendRemark,
    operator: record.operator,
    skinColor: skinColorId,
    skinColorRgb: rgb,
    skinColorHex: hex,
    primaryColor: form.primaryColor || palette.primary,
    secondaryColor: form.secondaryColor || palette.secondary,
    tertiaryColor: form.tertiaryColor || palette.tertiary,
    accentColor: form.accentColor || palette.accent,
    borderColor: palette.borderColor,
    colorPalette: {
      primary: palette.primary,
      secondary: palette.secondary,
      tertiary: palette.tertiary,
      accent: palette.accent,
      borderColor: palette.borderColor,
      generated: true,
      generatedAt,
    },
    textPrimary: form.textPrimaryColor || palette.textPrimary,
    textSecondary: form.textSecondaryColor || palette.textSecondary,
    textAccent: form.textAccentColor || palette.textAccent,
    buttonColor: form.buttonColor || palette.buttonColor,
    backgroundImage:
      form.lobbyBackgroundImageUrl ||
      record.backgroundImage ||
      getDefaultBackgroundImage(skinColorId) ||
      undefined,
    effectiveTimeMode: record.effectiveTimeMode ?? 'immediate',
    effectiveTime: record.effectiveTime ?? null,
    lobbyBackgroundSource,
    lobbyCustomImageUrl:
      form.lobbyBackgroundType === 'custom_image'
        ? form.lobbyBackgroundImageUrl || null
        : record.lobbyCustomImageUrl ?? null,
    patternBackgroundColor:
      form.lobbyBackgroundType === 'system_config'
        ? form.lobbyBackgroundColor
        : record.patternBackgroundColor ?? form.lobbyBackgroundColor,
    lobbyPatternTab: record.lobbyPatternTab,
    lobbyPatternUrl: record.lobbyPatternUrl,
    lobbyPatternId: record.lobbyPatternId,
    templateType: record.templateType,
  };
}

export async function loadPrimaryBrandSkinLangRecord(
  brandCode?: string,
): Promise<BrandSkinLangConfig | null> {
  const response = await getBrandSkinLangConfigs({
    page: 1,
    pageSize: 1,
    brandCode: brandCode || undefined,
  });
  const list = (response as { data?: BrandSkinLangConfig[] })?.data;
  if (!Array.isArray(list) || list.length === 0) return null;
  return list[0] ?? null;
}

/**
 * Push color template to 277br (and other envs) via PUT /brand-skin-lang/:id.
 * This is what feeds layout-design/public/theme for the client site.
 */
export async function syncBrandSkinLangColors(
  recordId: number,
  record: BrandSkinLangConfig,
  form: BrandSkinFormColors,
  palette: ColorPalette,
) {
  const payload = buildBrandSkinLangUpdatePayload(record, form, palette);
  return updateBrandSkinLangConfig(recordId, payload);
}
