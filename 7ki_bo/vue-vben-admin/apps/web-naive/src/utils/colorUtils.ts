/**
 * Color utilities for dynamic brand theming
 * Generates secondary and accent colors from primary colors
 */

export interface ColorPalette {
  primary: string;
  secondary: string;
  tertiary?: string;
  accent: string;
  textPrimary: string;
  textSecondary: string;
  textAccent: string;
  buttonColor: string;
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
  buttonColor: string;
}

/**
 * Complete color palettes for each brand - manually adjusted
 */
export const brandColorPalettes: Record<string, ColorPalette> = {
  // Bvlgari蓝黑
  '15': {
    primary: '#0e131b',
    secondary: '#151d29',
    tertiary: '#182434',
    accent: '#111923',
    textPrimary: '#FFFFFF',
    textSecondary: '#005DFE',
    textAccent: '#0284C7',
    buttonColor: '#005dfe',
  },
  // Tom Ford绿
  '1687419125085335554': {
    primary: '#10B981',
    secondary: '#6B7280',
    accent: '#34D399',
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    textAccent: '#059669',
    buttonColor: '#059669',
  },
  // Ferrari黄
  '1687419804829954050': {
    primary: '#F59E0B',
    secondary: '#78716C',
    accent: '#FBBF24',
    textPrimary: '#1C1917',
    textSecondary: '#78716C',
    textAccent: '#D97706',
    buttonColor: '#D97706',
  },
  // Armani红
  '1687423728032313346': {
    primary: '#DC2626',
    secondary: '#6B7280',
    accent: '#EF4444',
    textPrimary: '#1F2937',
    textSecondary: '#6B7280',
    textAccent: '#B91C1C',
    buttonColor: '#DC2626',
  },
  // Corum蓝
  '1687424061300416513': {
    primary: '#3B82F6',
    secondary: '#64748B',
    accent: '#60A5FA',
    textPrimary: '#1E293B',
    textSecondary: '#64748B',
    textAccent: '#2563EB',
    buttonColor: '#3B82F6',
  },
  // Aston Martin紫
  '1687424270198022145': {
    primary: '#8B5CF6',
    secondary: '#6B7280',
    accent: '#A78BFA',
    textPrimary: '#1F2937',
    textSecondary: '#6B7280',
    textAccent: '#7C3AED',
    buttonColor: '#8B5CF6',
  },
  // Roger Dubuis黑金
  '1692485205460766722': {
    primary: '#F59E0B',
    secondary: '#374151',
    accent: '#FBBF24',
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    textAccent: '#D97706',
    buttonColor: '#F59E0B',
  },
  // Porsche黄绿
  '1692485850558005250': {
    primary: '#84CC16',
    secondary: '#6B7280',
    accent: '#A3E635',
    textPrimary: '#1F2937',
    textSecondary: '#6B7280',
    textAccent: '#65A30D',
    buttonColor: '#84CC16',
  },
  // Cartier红
  '1692486746230812674': {
    primary: '#EF4444',
    secondary: '#6B7280',
    accent: '#F87171',
    textPrimary: '#1F2937',
    textSecondary: '#6B7280',
    textAccent: '#DC2626',
    buttonColor: '#EF4444',
  },
  // Estee Lauder蓝
  '1692488006900928514': {
    primary: '#06B6D4',
    secondary: '#64748B',
    accent: '#22D3EE',
    textPrimary: '#1E293B',
    textSecondary: '#64748B',
    textAccent: '#0891B2',
    buttonColor: '#06B6D4',
  },
  // Burgundy红
  '1692488483161190401': {
    primary: '#7C2D12',
    secondary: '#78716C',
    accent: '#A16207',
    textPrimary: '#1C1917',
    textSecondary: '#78716C',
    textAccent: '#92400E',
    buttonColor: '#7C2D12',
  },
  // IWC蓝
  '1692488808662204418': {
    primary: '#1E40AF',
    secondary: '#64748B',
    accent: '#3B82F6',
    textPrimary: '#1E293B',
    textSecondary: '#64748B',
    textAccent: '#1D4ED8',
    buttonColor: '#1E40AF',
  },
  // Gucci绿金
  '1692489196854333442': {
    primary: '#059669',
    secondary: '#6B7280',
    accent: '#10B981',
    textPrimary: '#1F2937',
    textSecondary: '#6B7280',
    textAccent: '#047857',
    buttonColor: '#059669',
  },
  // Burberry褐
  '1692489501242617857': {
    primary: '#92400E',
    secondary: '#78716C',
    accent: '#C2410C',
    textPrimary: '#1C1917',
    textSecondary: '#78716C',
    textAccent: '#A16207',
    buttonColor: '#92400E',
  },
  // La Mer 绿
  '1692489827560214530': {
    primary: '#047857',
    secondary: '#6B7280',
    accent: '#059669',
    textPrimary: '#1F2937',
    textSecondary: '#6B7280',
    textAccent: '#065F46',
    buttonColor: '#047857',
  },
  // Ebay紫
  '1692490140235583490': {
    primary: '#7C3AED',
    secondary: '#6B7280',
    accent: '#8B5CF6',
    textPrimary: '#1F2937',
    textSecondary: '#6B7280',
    textAccent: '#6D28D9',
    buttonColor: '#7C3AED',
  },
  // Dior克莱因蓝
  '1697159683483983873': {
    primary: '#1E40AF',
    secondary: '#64748B',
    accent: '#3B82F6',
    textPrimary: '#1E293B',
    textSecondary: '#64748B',
    textAccent: '#1D4ED8',
    buttonColor: '#1E40AF',
  },
  // Chivas Regal邦迪蓝
  '1697159980803305474': {
    primary: '#1E3A8A',
    secondary: '#64748B',
    accent: '#2563EB',
    textPrimary: '#1E293B',
    textSecondary: '#64748B',
    textAccent: '#1D4ED8',
    buttonColor: '#1E3A8A',
  },
  // Furla蓝
  '1697160139817517057': {
    primary: '#3B82F6',
    secondary: '#64748B',
    accent: '#60A5FA',
    textPrimary: '#1E293B',
    textSecondary: '#64748B',
    textAccent: '#2563EB',
    buttonColor: '#3B82F6',
  },
  // Bottega Veneta莫兰迪灰
  '1697160330594295810': {
    primary: '#6B7280',
    secondary: '#9CA3AF',
    accent: '#374151',
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    textAccent: '#4B5563',
    buttonColor: '#6B7280',
  },
  // Embraer蓝
  '1697160465763233793': {
    primary: '#1E40AF',
    secondary: '#64748B',
    accent: '#3B82F6',
    textPrimary: '#1E293B',
    textSecondary: '#64748B',
    textAccent: '#1D4ED8',
    buttonColor: '#1E40AF',
  },
  // Bordeaux红
  '1697160834305101825': {
    primary: '#7C2D12',
    secondary: '#78716C',
    accent: '#A16207',
    textPrimary: '#1C1917',
    textSecondary: '#78716C',
    textAccent: '#92400E',
    buttonColor: '#7C2D12',
  },
  // Breguet灰
  '1697160986273185793': {
    primary: '#6B7280',
    secondary: '#9CA3AF',
    accent: '#374151',
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    textAccent: '#4B5563',
    buttonColor: '#6B7280',
  },
  // Hermes橙
  '1697161119648129025': {
    primary: '#EA580C',
    secondary: '#78716C',
    accent: '#F97316',
    textPrimary: '#1C1917',
    textSecondary: '#78716C',
    textAccent: '#C2410C',
    buttonColor: '#EA580C',
  },
  // BVLGARI褐
  '1697161307920756738': {
    primary: '#92400E',
    secondary: '#78716C',
    accent: '#C2410C',
    textPrimary: '#1C1917',
    textSecondary: '#78716C',
    textAccent: '#A16207',
    buttonColor: '#92400E',
  },
  // Hermes棕橙
  '1697161596809916417': {
    primary: '#C2410C',
    secondary: '#78716C',
    accent: '#EA580C',
    textPrimary: '#1C1917',
    textSecondary: '#78716C',
    textAccent: '#A16207',
    buttonColor: '#C2410C',
  },
  // Elsa Schiaparelli粉
  '1697161777339891714': {
    primary: '#EC4899',
    secondary: '#6B7280',
    accent: '#F472B6',
    textPrimary: '#1F2937',
    textSecondary: '#6B7280',
    textAccent: '#DB2777',
    buttonColor: '#EC4899',
  },
  // Lancome水蜜桃色
  '1697161995892490242': {
    primary: '#F97316',
    secondary: '#78716C',
    accent: '#FB923C',
    textPrimary: '#1C1917',
    textSecondary: '#78716C',
    textAccent: '#EA580C',
    buttonColor: '#F97316',
  },
  // Lacoste绿
  '1697162642566025217': {
    primary: '#16A34A',
    secondary: '#6B7280',
    accent: '#22C55E',
    textPrimary: '#1F2937',
    textSecondary: '#6B7280',
    textAccent: '#15803D',
    buttonColor: '#16A34A',
  },
  // Versace黄
  '1697162790520283138': {
    primary: '#EAB308',
    secondary: '#78716C',
    accent: '#FDE047',
    textPrimary: '#1C1917',
    textSecondary: '#78716C',
    textAccent: '#CA8A04',
    buttonColor: '#EAB308',
  },
  // Bvlgari棕
  '1697163109007503361': {
    primary: '#A16207',
    secondary: '#78716C',
    accent: '#D97706',
    textPrimary: '#1C1917',
    textSecondary: '#78716C',
    textAccent: '#92400E',
    buttonColor: '#A16207',
  },
  // Prada黑
  '1697163285008887809': {
    primary: '#111827',
    secondary: '#374151',
    accent: '#6B7280',
    textPrimary: '#F9FAFB',
    textSecondary: '#D1D5DB',
    textAccent: '#9CA3AF',
    buttonColor: '#111827',
  },
  // Victoria Secret红
  '1697163805310021633': {
    primary: '#DC2626',
    secondary: '#6B7280',
    accent: '#EF4444',
    textPrimary: '#1F2937',
    textSecondary: '#6B7280',
    textAccent: '#B91C1C',
    buttonColor: '#DC2626',
  },
  // Anna Sui紫
  '1697163938916524034': {
    primary: '#7C3AED',
    secondary: '#6B7280',
    accent: '#8B5CF6',
    textPrimary: '#1F2937',
    textSecondary: '#6B7280',
    textAccent: '#6D28D9',
    buttonColor: '#7C3AED',
  },
  // Facebook蓝
  '1697164125656219650': {
    primary: '#1877F2',
    secondary: '#64748B',
    accent: '#42A5F5',
    textPrimary: '#1E293B',
    textSecondary: '#64748B',
    textAccent: '#1565C0',
    buttonColor: '#1877F2',
  },
  // Facebook绿
  '1697164281092911105': {
    primary: '#42B883',
    secondary: '#6B7280',
    accent: '#66BB6A',
    textPrimary: '#1F2937',
    textSecondary: '#6B7280',
    textAccent: '#388E3C',
    buttonColor: '#42B883',
  },
  // Twitter蓝
  '1697164409843445761': {
    primary: '#1DA1F2',
    secondary: '#64748B',
    accent: '#42A5F5',
    textPrimary: '#1E293B',
    textSecondary: '#64748B',
    textAccent: '#1976D2',
    buttonColor: '#1DA1F2',
  },
  // USDT绿
  '1697164886393913346': {
    primary: '#26A17B',
    secondary: '#6B7280',
    accent: '#4CAF50',
    textPrimary: '#1F2937',
    textSecondary: '#6B7280',
    textAccent: '#2E7D32',
    buttonColor: '#26A17B',
  },
  // SK-II红
  '1697165024871976962': {
    primary: '#DC2626',
    secondary: '#6B7280',
    accent: '#EF4444',
    textPrimary: '#1F2937',
    textSecondary: '#6B7280',
    textAccent: '#B91C1C',
    buttonColor: '#DC2626',
  },
  // Patek Philippe浅棕
  '1697165145999220737': {
    primary: '#92400E',
    secondary: '#78716C',
    accent: '#C2410C',
    textPrimary: '#1C1917',
    textSecondary: '#78716C',
    textAccent: '#A16207',
    buttonColor: '#92400E',
  },
  // Microsoft红
  '1697165288065609730': {
    primary: '#DC2626',
    secondary: '#6B7280',
    accent: '#EF4444',
    textPrimary: '#1F2937',
    textSecondary: '#6B7280',
    textAccent: '#B91C1C',
    buttonColor: '#DC2626',
  },
  // 3CE提香红
  '1697165446718234626': {
    primary: '#DC2626',
    secondary: '#6B7280',
    accent: '#EF4444',
    textPrimary: '#1F2937',
    textSecondary: '#6B7280',
    textAccent: '#B91C1C',
    buttonColor: '#DC2626',
  },
  // Louis Vuitton棕
  '1697165616248053761': {
    primary: '#92400E',
    secondary: '#78716C',
    accent: '#C2410C',
    textPrimary: '#1C1917',
    textSecondary: '#78716C',
    textAccent: '#A16207',
    buttonColor: '#92400E',
  },
  // Bottega Veneta绿
  '1697165753468780546': {
    primary: '#059669',
    secondary: '#6B7280',
    accent: '#10B981',
    textPrimary: '#1F2937',
    textSecondary: '#6B7280',
    textAccent: '#047857',
    buttonColor: '#059669',
  },
  // Rolex绿
  '1822080907778543618': {
    primary: '#161616',
    secondary: '#1e1e1e',
    accent: '#22C55E',
    textPrimary: '#1F2937',
    textSecondary: '#6B7280',
    textAccent: '#15803D',
    buttonColor: '#78df2c',
  },
  // Guerlain紫
  '1822084756339769345': {
    primary: '#8B5CF6',
    secondary: '#6B7280',
    accent: '#A78BFA',
    textPrimary: '#1F2937',
    textSecondary: '#6B7280',
    textAccent: '#7C3AED',
    buttonColor: '#8B5CF6',
  },
  // Gucci黑
  '1924287844941955073': {
    primary: '#111827',
    secondary: '#374151',
    accent: '#6B7280',
    textPrimary: '#F9FAFB',
    textSecondary: '#D1D5DB',
    textAccent: '#9CA3AF',
    buttonColor: '#111827',
  },
};

/**
 * Brand color definitions with their base colors (kept for backward compatibility)
 */
export const brandColorMap: Record<string, string> = {
  '15': '#0e131b', // Bvlgari蓝黑
  '1687419125085335554': '#10B981', // Tom Ford绿
  '1687419804829954050': '#F59E0B', // Ferrari黄
  '1687423728032313346': '#DC2626', // Armani红
  '1687424061300416513': '#3B82F6', // Corum蓝
  '1687424270198022145': '#8B5CF6', // Aston Martin紫
  '1692485205460766722': '#F59E0B', // Roger Dubuis黑金
  '1692485850558005250': '#84CC16', // Porsche黄绿
  '1692486746230812674': '#EF4444', // Cartier红
  '1692488006900928514': '#06B6D4', // Estee Lauder蓝
  '1692488483161190401': '#7C2D12', // Burgundy红
  '1692488808662204418': '#1E40AF', // IWC蓝
  '1692489196854333442': '#059669', // Gucci绿金
  '1692489501242617857': '#92400E', // Burberry褐
  '1692489827560214530': '#047857', // La Mer 绿
  '1692490140235583490': '#7C3AED', // Ebay紫
  '1697159683483983873': '#1E40AF', // Dior克莱因蓝
  '1697159980803305474': '#1E3A8A', // Chivas Regal邦迪蓝
  '1697160139817517057': '#3B82F6', // Furla蓝
  '1697160330594295810': '#6B7280', // Bottega Veneta莫兰迪灰
  '1697160465763233793': '#1E40AF', // Embraer蓝
  '1697160834305101825': '#7C2D12', // Bordeaux红
  '1697160986273185793': '#6B7280', // Breguet灰
  '1697161119648129025': '#EA580C', // Hermes橙
  '1697161307920756738': '#92400E', // BVLGARI褐
  '1697161596809916417': '#C2410C', // Hermes棕橙
  '1697161777339891714': '#EC4899', // Elsa Schiaparelli粉
  '1697161995892490242': '#F97316', // Lancome水蜜桃色
  '1697162642566025217': '#16A34A', // Lacoste绿
  '1697162790520283138': '#EAB308', // Versace黄
  '1697163109007503361': '#A16207', // Bvlgari棕
  '1697163285008887809': '#111827', // Prada黑
  '1697163805310021633': '#DC2626', // Victoria Secret红
  '1697163938916524034': '#7C3AED', // Anna Sui紫
  '1697164125656219650': '#1877F2', // Facebook蓝
  '1697164281092911105': '#42B883', // Facebook绿
  '1697164409843445761': '#1DA1F2', // Twitter蓝
  '1697164886393913346': '#26A17B', // USDT绿
  '1697165024871976962': '#DC2626', // SK-II红
  '1697165145999220737': '#92400E', // Patek Philippe浅棕
  '1697165288065609730': '#DC2626', // Microsoft红
  '1697165446718234626': '#DC2626', // 3CE提香红
  '1697165616248053761': '#92400E', // Louis Vuitton棕
  '1697165753468780546': '#059669', // Bottega Veneta绿
  '1822080907778543618': '#16A34A', // Rolex绿
  '1822084756339769345': '#8B5CF6', // Guerlain紫
  '1924287844941955073': '#111827', // Gucci黑
};

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
    accent: '#10B981', // Default green accent
    textPrimary: '#1F2937', // Default dark gray for primary text
    textSecondary: '#6B7280', // Default medium gray for secondary text
    textAccent: '#059669', // Default darker green for accent text
    buttonColor: '#3B82F6', // Default blue for buttons
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
    accent: '#10B981', // Green accent - adjust this hex value as needed
    textPrimary: '#1F2937', // Dark gray for primary text - adjust as needed
    textSecondary: '#6B7280', // Medium gray for secondary text - adjust as needed
    textAccent: '#059669', // Darker green for accent text - adjust as needed
    buttonColor: '#3B82F6', // Blue for buttons - adjust as needed
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
  const skinColorOptions = [
    { value: '15', label: 'Bvlgari蓝黑' },
    { value: '1687419125085335554', label: 'Tom Ford绿' },
    { value: '1687419804829954050', label: 'Ferrari黑黄' },
    { value: '1687423728032313346', label: 'Armani黑红' },
    { value: '1687424061300416513', label: 'Corum蓝' },
    { value: '1687424270198022145', label: 'Aston Martin紫' },
    { value: '1692485205460766722', label: 'Roger Dubuis黑金' },
    { value: '1692485850558005250', label: 'Porsche黄绿' },
    { value: '1692486746230812674', label: 'Cartier红' },
    { value: '1692488006900928514', label: 'Estee Lauder蓝' },
    { value: '1692488483161190401', label: 'Burgundy红' },
    { value: '1692488808662204418', label: 'IWC蓝' },
    { value: '1692489196854333442', label: 'Gucci绿金' },
    { value: '1692489501242617857', label: 'Burberry褐' },
    { value: '1692489827560214530', label: 'La Mer 绿' },
    { value: '1692490140235583490', label: 'Ebay紫' },
    { value: '1697159683483983873', label: 'Dior克莱因蓝' },
    { value: '1697159980803305474', label: 'Chivas Regal邦迪蓝' },
    { value: '1697160139817517057', label: 'Furla蓝' },
    { value: '1697160330594295810', label: 'Bottega Veneta莫兰迪灰' },
    { value: '1697160465763233793', label: 'Embraer蓝' },
    { value: '1697160834305101825', label: 'Bordeaux红' },
    { value: '1697160986273185793', label: 'Breguet灰' },
    { value: '1697161119648129025', label: 'Hermes橙' },
    { value: '1697161307920756738', label: 'BVLGARI褐' },
    { value: '1697161596809916417', label: 'Hermes棕橙' },
    { value: '1697161777339891714', label: 'Elsa Schiaparelli粉' },
    { value: '1697161995892490242', label: 'Lancome水蜜桃色' },
    { value: '1697162642566025217', label: 'Lacoste绿' },
    { value: '1697162790520283138', label: 'Versace黄' },
    { value: '1697163109007503361', label: 'Bvlgari棕' },
    { value: '1697163285008887809', label: 'Prada黑' },
    { value: '1697163805310021633', label: 'Victoria Secret红' },
    { value: '1697163938916524034', label: 'Anna Sui紫' },
    { value: '1697164125656219650', label: 'Facebook蓝' },
    { value: '1697164281092911105', label: 'Facebook绿' },
    { value: '1697164409843445761', label: 'Twitter蓝' },
    { value: '1697164886393913346', label: 'USDT绿' },
    { value: '1697165024871976962', label: 'SK-II红' },
    { value: '1697165145999220737', label: 'Patek Philippe浅棕' },
    { value: '1697165288065609730', label: 'Microsoft红' },
    { value: '1697165446718234626', label: '3CE提香红' },
    { value: '1697165616248053761', label: 'Louis Vuitton棕' },
    { value: '1697165753468780546', label: 'Bottega Veneta绿' },
    { value: '1822080907778543618', label: 'Rolex绿' },
    { value: '1822084756339769345', label: 'Guerlain紫' },
    { value: '1924287844941955073', label: 'Gucci黑' },
  ];

  const colorInfo = skinColorOptions.find(
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
