import type { ColorClasses, ColorPalette } from '../utils/colorUtils';

import { computed, ref } from 'vue';

import {
  applyColorTheme,
  generateColorClasses,
  generateColorPreviewStyles,
  generateCSSCustomProperties,
  getBrandColorInfo,
  getColorPaletteById,
  SKIN_COLOR_OPTIONS,
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
  const borderColor = computed(() => currentPalette.value?.borderColor || '');

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
    borderColor,

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
  const skinColorOptions = SKIN_COLOR_OPTIONS;

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
