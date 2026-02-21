import { ref, computed, onMounted, readonly } from 'vue';
import { PublicLayoutApi } from '../api/layout-design';
import type { LayoutConfig, LayoutTheme, BrandSkinConfig } from '../api/layout-design';

// Global layout configuration store
const layoutConfig = ref<LayoutConfig | null>(null);
const layoutTheme = ref<LayoutTheme | null>(null);
const brandSkinConfig = ref<BrandSkinConfig | null>(null);
const isLoading = ref(false);
const error = ref<string | null>(null);

export function useLayoutConfig(brandCode?: string) {
  // Load layout configuration from API
  const loadLayoutConfig = async (brandCodeParam?: string) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const params = {
        brandCode: brandCodeParam || brandCode,
        domain: window.location.hostname,
      };

      const [configResponse, themeResponse] = await Promise.all([
        PublicLayoutApi.getActiveLayoutConfig(params),
        PublicLayoutApi.getLayoutTheme(params.brandCode),
      ]);

      if (configResponse.success) {
        layoutConfig.value = configResponse.data;
      }

      if (themeResponse.success) {
        layoutTheme.value = themeResponse.data.layout;
        brandSkinConfig.value = themeResponse.data.brandSkin;
      }

      return {
        config: layoutConfig.value,
        theme: layoutTheme.value,
        brandSkin: brandSkinConfig.value,
      };
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load layout configuration';
      console.error('Error loading layout config:', err);
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  // Computed properties for easy access
  const bannerStyle = computed(() => layoutTheme.value?.bannerStyle || 'common');
  const myPageStyle = computed(() => layoutTheme.value?.myPageStyle || 'style1');
  const gameCardIcon = computed(() => layoutTheme.value?.gameCardIcon || 'european');
  const selfPromotionEnabled = computed(() => layoutTheme.value?.selfPromotionEnabled || false);
  
  const beforeLoginButtons = computed(() => {
    return layoutConfig.value?.buttonConfigs?.beforeLogin || [
      { icon: 'home', label: '首页', display: '🏠' },
      { icon: 'promotion', label: '优惠', display: '🎁' },
      { icon: 'login', label: '登录', display: '🔐' },
      { icon: 'register', label: '注册', display: '📝' },
      { icon: 'service', label: '客服', display: '👥' },
    ];
  });

  const afterLoginButtons = computed(() => {
    return layoutConfig.value?.buttonConfigs?.afterLogin || [
      { icon: 'home', label: '首页', display: '🏠' },
      { icon: 'deposit', label: '充值', display: '💰' },
      { icon: 'withdraw', label: '提现', display: '💸' },
      { icon: 'profile', label: '我的', display: '👤' },
      { icon: 'service', label: '客服', display: '👥' },
    ];
  });

  // Get buttons based on login state
  const getActiveButtons = (isLoggedIn: boolean = false) => {
    return isLoggedIn ? afterLoginButtons.value : beforeLoginButtons.value;
  };

  // Apply theme colors and styles
  const applyThemeStyles = () => {
    if (!brandSkinConfig.value) return;

    const root = document.documentElement;
    
    // Apply CSS custom properties for dynamic theming
    if (brandSkinConfig.value.primaryColor) {
      root.style.setProperty('--theme-primary', brandSkinConfig.value.primaryColor);
    }
    
    if (brandSkinConfig.value.secondaryColor) {
      root.style.setProperty('--theme-secondary', brandSkinConfig.value.secondaryColor);
    }
    
    if (brandSkinConfig.value.accentColor) {
      root.style.setProperty('--theme-accent', brandSkinConfig.value.accentColor);
    }

    if (brandSkinConfig.value.skinColorHex) {
      root.style.setProperty('--theme-skin-color', brandSkinConfig.value.skinColorHex);
    }

    // Apply color palette if available
    if (brandSkinConfig.value.colorPalette) {
      try {
        const palette = typeof brandSkinConfig.value.colorPalette === 'string' 
          ? JSON.parse(brandSkinConfig.value.colorPalette)
          : brandSkinConfig.value.colorPalette;
        
        Object.entries(palette).forEach(([key, value]) => {
          root.style.setProperty(`--theme-${key}`, value as string);
        });
      } catch (err) {
        console.warn('Failed to parse color palette:', err);
      }
    }
  };

  // Banner style configurations
  const bannerConfig = computed(() => {
    const style = bannerStyle.value;
    
    return {
      height: style === 'small' ? '60px' : style === 'large' ? '120px' : '80px',
      type: style === 'scroll' ? 'carousel' : 'static',
      className: `banner-${style}`,
    };
  });

  // Game card configurations
  const gameCardConfig = computed(() => {
    const iconStyle = gameCardIcon.value;
    
    return {
      iconStyle,
      className: `game-card-${iconStyle}`,
      borderRadius: iconStyle === 'european' ? '12px' : '8px',
    };
  });

  // My page style configurations
  const myPageConfig = computed(() => {
    const style = myPageStyle.value;
    
    return {
      style,
      className: `my-page-${style}`,
      layout: style.includes('1') ? 'grid' : 'list',
    };
  });

  // Refresh configuration (useful for live updates)
  const refresh = () => loadLayoutConfig();

  return {
    // State
    layoutConfig: readonly(layoutConfig),
    layoutTheme: readonly(layoutTheme),
    brandSkinConfig: readonly(brandSkinConfig),
    isLoading: readonly(isLoading),
    error: readonly(error),
    
    // Computed properties
    bannerStyle,
    myPageStyle,
    gameCardIcon,
    selfPromotionEnabled,
    beforeLoginButtons,
    afterLoginButtons,
    bannerConfig,
    gameCardConfig,
    myPageConfig,
    
    // Methods
    loadLayoutConfig,
    getActiveButtons,
    applyThemeStyles,
    refresh,
  };
}

// Auto-load layout config on app initialization
export function initializeLayoutConfig(brandCode?: string) {
  const { loadLayoutConfig, applyThemeStyles } = useLayoutConfig(brandCode);
  
  onMounted(async () => {
    await loadLayoutConfig();
    applyThemeStyles();
  });
  
  return { loadLayoutConfig, applyThemeStyles };
} 