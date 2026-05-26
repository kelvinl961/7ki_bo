/**
 * Color utilities for dynamic brand theming
 * Generates secondary and accent colors from primary colors
 */

import {
  type BrandColorConfig,
  BRAND_COLOR_TEMPLATES,
  BACKEND_SKIN_ID_BY_TEMPLATE_SLUG,
  buildSkinColorOptions,
} from '../constants/brandColorTemplates';

export {
  BRAND_COLOR_TEMPLATES,
  BACKEND_SKIN_ID_BY_TEMPLATE_SLUG,
  TEMPLATE_SLUG_BY_BACKEND_SKIN_ID,
  getBrandColorTemplateByBackendId,
  getBrandColorTemplateBySlug,
} from '../constants/brandColorTemplates';
export type { BrandColorConfig, BrandColorTemplate } from '../constants/brandColorTemplates';

export interface ColorPalette {
  primary: string;
  secondary: string;
  tertiary: string;
  accent: string;
  textPrimary: string;
  textSecondary: string;
  textAccent: string;
  buttonColor: string;
  borderColor: string;
}

export interface ColorClasses {
  bgPrimary: string;
  bgSecondary: string;
  bgAccent: string;
  textPrimary: string;
  textSecondary: string;
  textAccent: string;
  borderPrimary: string;
  borderSecondary: string;
  borderAccent: string;
  borderColor: string;
  buttonColor: string;
}

/** Backend skin color ID + label (derived from `BRAND_COLOR_TEMPLATES`). */
export interface SkinColorOption {
  value: string;
  label: string;
}

export const SKIN_COLOR_OPTIONS: SkinColorOption[] = buildSkinColorOptions();

export function colorConfigToPalette(colors: BrandColorConfig): ColorPalette {
  return {
    primary: colors.primary,
    secondary: colors.secondary,
    tertiary: colors.tertiary,
    accent: colors.accent,
    textPrimary: colors.textPrimary,
    textSecondary: colors.textSecondary,
    textAccent: colors.textAccent,
    buttonColor: colors.buttonColor,
    borderColor: colors.quaternary,
  };
}

function buildBrandColorPalettes(): Record<string, ColorPalette> {
  const palettes: Record<string, ColorPalette> = {};
  for (const template of BRAND_COLOR_TEMPLATES) {
    const backendId = BACKEND_SKIN_ID_BY_TEMPLATE_SLUG[template.id];
    if (backendId) {
      palettes[backendId] = colorConfigToPalette(template.colors);
    }
  }
  return palettes;
}

/**
 * Complete color palettes per backend skin ID (from brand color templates).
 */
export const brandColorPalettes: Record<string, ColorPalette> =
  buildBrandColorPalettes();

/**
 * Brand color definitions with their base colors (kept for backward compatibility)
 */
export const brandColorMap: Record<string, string> = Object.fromEntries(
  Object.entries(brandColorPalettes).map(([id, palette]) => [id, palette.primary]),
);

/**
 * Convert hex color to HSL
 */
function hexToHsl(hex: string): [number, number, number] {
  const r = Number.parseInt(hex.slice(1, 3), 16) / 255;
  const g = Number.parseInt(hex.slice(3, 5), 16) / 255;
  const b = Number.parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case b: {
        h = (r - g) / d + 4;
        break;
      }
      case g: {
        h = (b - r) / d + 2;
        break;
      }
      case r: {
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      }
    }
    h /= 6;
  }

  return [h * 360, s * 100, l * 100];
}

/**
 * Convert HSL to hex color
 */
function hslToHex(h: number, s: number, l: number): string {
  h = h / 360;
  s = s / 100;
  l = l / 100;

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  let b, g, r;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  const toHex = (c: number) => {
    const hex = Math.round(c * 255).toString(16);
    return hex.length === 1 ? `0${hex}` : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Get complete color palette by skin color ID (uses predefined palettes)
 */
export function getColorPaletteById(skinColorId: string): ColorPalette {
  // Check if we have a predefined palette for this skin color ID
  if (brandColorPalettes[skinColorId]) {
    return brandColorPalettes[skinColorId];
  }

  // Fallback to default palette with primary color from brandColorMap
  const primaryColor = getPrimaryColorById(skinColorId);
  return {
    primary: primaryColor,
    secondary: '#6B7280', // Default gray secondary
    tertiary: '#111827', // Default dark tertiary
    accent: '#10B981', // Default green accent
    textPrimary: '#1F2937', // Default dark gray for primary text
    textSecondary: '#6B7280', // Default medium gray for secondary text
    textAccent: '#059669', // Default darker green for accent text
    buttonColor: '#3B82F6', // Default blue for buttons
    borderColor: '#374151', // Default border
  };
}

/**
 * Generate color palette from primary color (legacy function - now uses hardcoded values)
 */
export function generateColorPalette(primaryColor: string): ColorPalette {
  const [h, s, l] = hexToHsl(primaryColor);

  // Generate secondary color: slightly darker and less saturated
  const secondaryH = h;
  const secondaryS = Math.max(s * 0.8, 20); // Reduce saturation by 20%
  const secondaryL = Math.max(l * 0.8, 15); // Reduce lightness by 20%

  // Generate accent color: slightly lighter and more vibrant
  const accentH = (h + 15) % 360; // Shift hue slightly
  const accentS = Math.min(s * 1.1, 90); // Increase saturation by 10%
  const accentL = Math.min(l * 1.15, 85); // Increase lightness by 15%

  // Hardcoded color palette - you can adjust these hex values manually
  return {
    primary: primaryColor,
    secondary: '#6B7280', // Gray secondary - adjust this hex value as needed
    tertiary: '#111827', // Dark tertiary - adjust this hex value as needed
    accent: '#10B981', // Green accent - adjust this hex value as needed
    textPrimary: '#1F2937', // Dark gray for primary text - adjust as needed
    textSecondary: '#6B7280', // Medium gray for secondary text - adjust as needed
    textAccent: '#059669', // Darker green for accent text - adjust as needed
    buttonColor: '#3B82F6', // Blue for buttons - adjust as needed
    borderColor: '#374151', // Border - adjust as needed
  };
}

/**
 * Get primary color by skin color ID
 */
export function getPrimaryColorById(skinColorId: string): string {
  return brandColorMap[skinColorId] || '#3B82F6'; // Default to blue if not found
}

/**
 * Generate CSS custom properties for dynamic theming
 */
export function generateCSSCustomProperties(palette: ColorPalette): string {
  return `
    --color-primary: ${palette.primary};
    --color-secondary: ${palette.secondary};
    --color-accent: ${palette.accent};
    --color-border: ${palette.borderColor};
    
    --color-primary-rgb: ${hexToRgb(palette.primary)};
    --color-secondary-rgb: ${hexToRgb(palette.secondary)};
    --color-accent-rgb: ${hexToRgb(palette.accent)};
  `;
}

/**
 * Convert hex to RGB values
 */
function hexToRgb(hex: string): string {
  const r = Number.parseInt(hex.slice(1, 3), 16);
  const g = Number.parseInt(hex.slice(3, 5), 16);
  const b = Number.parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}

/**
 * Generate Tailwind color classes for dynamic theming
 */
export function generateColorClasses(palette: ColorPalette): ColorClasses {
  return {
    bgPrimary: `bg-[${palette.primary}]`,
    bgSecondary: `bg-[${palette.secondary}]`,
    bgAccent: `bg-[${palette.accent}]`,
    textPrimary: `text-[${palette.textPrimary}]`,
    textSecondary: `text-[${palette.textSecondary}]`,
    textAccent: `text-[${palette.textAccent}]`,
    borderPrimary: `border-[${palette.primary}]`,
    borderSecondary: `border-[${palette.secondary}]`,
    borderAccent: `border-[${palette.accent}]`,
    borderColor: `border-[${palette.borderColor}]`,
    buttonColor: `bg-[${palette.buttonColor}]`,
  };
}

/**
 * Apply color theme to content string
 */
export function applyColorTheme(content: string, skinColorId: string): string {
  const palette = getColorPaletteById(skinColorId);
  const colorClasses = generateColorClasses(palette);

  return content
    .replaceAll('bg-[#D86682]', colorClasses.bgPrimary)
    .replaceAll('bg-[#CC5477]', colorClasses.bgSecondary)
    .replaceAll('bg-[#E06F8B]', colorClasses.bgAccent)
    .replaceAll('text-[#D86682]', colorClasses.textPrimary)
    .replaceAll('text-[#CC5477]', colorClasses.textSecondary)
    .replaceAll('text-[#E06F8B]', colorClasses.textAccent)
    .replaceAll('border-[#D86682]', colorClasses.borderPrimary)
    .replaceAll('border-[#CC5477]', colorClasses.borderSecondary)
    .replaceAll('border-[#E06F8B]', colorClasses.borderAccent)
    .replaceAll('bg-[#3B82F6]', colorClasses.buttonColor); // Add button color replacement
}

/**
 * Get brand color information by skin color ID
 */
export function getBrandColorInfo(skinColorId: string) {
  const colorInfo = SKIN_COLOR_OPTIONS.find(
    (option) => option.value === skinColorId,
  );
  const palette = getColorPaletteById(skinColorId);

  return {
    id: skinColorId,
    label: colorInfo?.label || 'Unknown',
    palette,
    classes: generateColorClasses(palette),
  };
}

/**
 * Generate color preview styles
 */
export function generateColorPreviewStyles(
  skinColorId: string,
): Record<string, string> {
  const palette = getColorPaletteById(skinColorId);

  return {
    '--preview-primary': palette.primary,
    '--preview-secondary': palette.secondary,
    '--preview-accent': palette.accent,
  };
}
