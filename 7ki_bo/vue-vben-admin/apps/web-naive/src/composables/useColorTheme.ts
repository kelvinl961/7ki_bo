import type { ColorClasses, ColorPalette } from '../utils/colorUtils';

import { computed, ref } from 'vue';

import {
  applyColorTheme,
  generateColorClasses,
  generateColorPreviewStyles,
  generateCSSCustomProperties,
  getBrandColorInfo,
  getColorPaletteById,
} from '../utils/colorUtils';

/**
 * Composable for dynamic color theming based on skin color selections
 */
export function useColorTheme() {
  const currentSkinColorId = ref<string>('');
  const currentPalette = ref<ColorPalette | null>(null);
  const currentColorClasses = ref<ColorClasses | null>(null);

  /**
   * Set the current skin color theme
   */
  const setSkinColor = (skinColorId: string) => {
    currentSkinColorId.value = skinColorId;
    currentPalette.value = getColorPaletteById(skinColorId);
    currentColorClasses.value = generateColorClasses(currentPalette.value);

    // Apply CSS custom properties to document root
    applyCSSCustomProperties();
  };

  /**
   * Apply CSS custom properties to document root
   */
  const applyCSSCustomProperties = () => {
    if (!currentPalette.value) return;

    const customProperties = generateCSSCustomProperties(currentPalette.value);
    const style = document.createElement('style');
    style.textContent = `:root { ${customProperties} }`;

    // Remove existing theme styles
    const existingStyle = document.querySelector('#dynamic-theme-styles');
    if (existingStyle) {
      existingStyle.remove();
    }

    style.id = 'dynamic-theme-styles';
    document.head.append(style);
  };

  /**
   * Apply color theme to content string
   */
  const applyThemeToContent = (content: string, skinColorId?: string) => {
    const targetSkinColorId = skinColorId || currentSkinColorId.value;
    if (!targetSkinColorId) return content;

    return applyColorTheme(content, targetSkinColorId);
  };

  /**
   * Get color information for a specific skin color
   */
  const getColorInfo = (skinColorId: string) => {
    return getBrandColorInfo(skinColorId);
  };

  /**
   * Get color preview styles for inline styling
   */
  const getPreviewStyles = (skinColorId: string) => {
    return generateColorPreviewStyles(skinColorId);
  };

  /**
   * Generate color palette preview component data
   */
  const generateColorPreview = (skinColorId: string) => {
    const colorInfo = getBrandColorInfo(skinColorId);
    return {
      id: skinColorId,
      label: colorInfo.label,
      primary: colorInfo.palette.primary,
      secondary: colorInfo.palette.secondary,
      accent: colorInfo.palette.accent,
      classes: colorInfo.classes,
    };
  };

  /**
   * Computed properties
   */
  const isThemeActive = computed(() => !!currentSkinColorId.value);
  const primaryColor = computed(() => currentPalette.value?.primary || '');
  const secondaryColor = computed(() => currentPalette.value?.secondary || '');
  const accentColor = computed(() => currentPalette.value?.accent || '');

  return {
    // State
    currentSkinColorId,
    currentPalette,
    currentColorClasses,

    // Computed
    isThemeActive,
    primaryColor,
    secondaryColor,
    accentColor,

    // Methods
    setSkinColor,
    applyThemeToContent,
    getColorInfo,
    getPreviewStyles,
    generateColorPreview,
    applyCSSCustomProperties,
  };
}

/**
 * Reactive skin color options with integrated color information
 */
export function useSkinColorOptions() {
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

  const { getColorInfo } = useColorTheme();

  /**
   * Enhanced skin color options with color information
   */
  const enhancedSkinColorOptions = computed(() => {
    return skinColorOptions.map((option) => ({
      ...option,
      colorInfo: getColorInfo(option.value),
    }));
  });

  /**
   * Get skin color option by value
   */
  const getSkinColorOption = (value: string) => {
    return enhancedSkinColorOptions.value.find(
      (option) => option.value === value,
    );
  };

  /**
   * Get skin color label by value
   */
  const getSkinColorLabel = (value: string) => {
    const option = getSkinColorOption(value);
    return option ? option.label : value || '-';
  };

  return {
    skinColorOptions,
    enhancedSkinColorOptions,
    getSkinColorOption,
    getSkinColorLabel,
  };
}
