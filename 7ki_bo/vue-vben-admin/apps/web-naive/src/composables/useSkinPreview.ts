import { computed, ref, watch } from 'vue';
import { getColorPaletteById } from '../utils/colorUtils';

export interface SkinPreviewConfig {
  template: string;
  brandIcon: string;
  gameColor: string;
  skinColor: string;
  language: string;
  clientType: string;
}

export interface PreviewDevice {
  name: string;
  width: number;
  height: number;
  scale: number;
}

export const PREVIEW_DEVICES: Record<string, PreviewDevice> = {
  mobile: {
    name: '移动端',
    width: 310,
    height: 550,
    scale: 1
  },
  desktop: {
    name: '桌面版',
    width: 350,
    height: 500,
    scale: 1
  },
  h5: {
    name: 'H5',
    width: 350,
    height: 600,
    scale: 1
  },
  ios: {
    name: 'iOS',
    width: 350,
    height: 600,
    scale: 1
  },
  android: {
    name: 'Android',
    width: 350,
    height: 600,
    scale: 1
  }
};

// Template mapping for URL generation
const TEMPLATE_MAPPING: Record<string, string> = {
  'rolex': '2-1',
  'tomford': '2-2',
  'burberry': '2-3',
  'cartier': '2-4',
  'omega': '2-5',
  'tag-heuer': '2-6'
};

// Language mapping for URL generation
const LANGUAGE_MAPPING: Record<string, string> = {
  'zh-CN': 'zh',
  'en-US': 'en',
  'pt-BR': 'pt',
  'zh-TW': 'tw',
  'ko-KR': 'ko',
  'ja-JP': 'ja',
  'th-TH': 'th',
  'vi-VN': 'vi'
};

// Color mapping for URL generation
const COLOR_MAPPING: Record<string, string> = {
  '有底色': 'dark',
  '无底色': 'light'
};

// Skin color mapping for URL generation (maps skin color IDs to URL parameters)
const SKIN_COLOR_MAPPING: Record<string, string> = {
  '15': 'bvlgari-blue-black',
  '1687419125085335554': 'tomford-green',
  '1687419804829954050': 'ferrari-black-yellow',
  '1687423728032313346': 'armani-black-red',
  '1687424061300416513': 'corum-blue',
  '1687424270198022145': 'aston-martin-purple',
  '1692485205460766722': 'roger-dubuis-black-gold',
  '1692485850558005250': 'porsche-yellow-green',
  '1692486746230812674': 'cartier-red',
  '1692488006900928514': 'estee-lauder-blue',
  '1692488483161190401': 'burgundy-red',
  '1692488808662204418': 'iwc-blue',
  '1692489196854333442': 'gucci-green-gold',
  '1692489501242617857': 'burberry-brown',
  '1692489827560214530': 'lamer-green',
  '1692490140235583490': 'ebay-purple',
  '1697159683483983873': 'dior-klein-blue',
  '1697159980803305474': 'chivas-regal-blue',
  '1697160139817517057': 'furla-blue',
  '1697160330594295810': 'bottega-veneta-gray',
  '1697160465763233793': 'embraer-blue',
  '1697160834305101825': 'bordeaux-red',
  '1697160986273185793': 'breguet-gray',
  '1697161119648129025': 'hermes-orange',
  '1697161307920756738': 'bvlgari-brown',
  '1697161596809916417': 'hermes-brown-orange',
  '1697161777339891714': 'elsa-schiaparelli-pink',
  '1697161995892490242': 'lancome-peach',
  '1697162642566025217': 'lacoste-green',
  '1697162790520283138': 'versace-yellow',
  '1697163109007503361': 'bvlgari-brown-alt',
  '1697163285008887809': 'prada-black',
  '1697163805310021633': 'victoria-secret-red',
  '1697163938916524034': 'anna-sui-purple',
  '1697164125656219650': 'facebook-blue',
  '1697164281092911105': 'facebook-green',
  '1697164409843445761': 'twitter-blue',
  '1697164886393913346': 'usdt-green',
  '1697165024871976962': 'sk2-red',
  '1697165145999220737': 'patek-philippe-brown',
  '1697165288065609730': 'microsoft-red',
  '1697165446718234626': '3ce-red',
  '1697165616248053761': 'louis-vuitton-brown',
  '1697165753468780546': 'bottega-veneta-green',
  '1822080907778543618': 'rolex-green',
  '1822084756339769345': 'guerlain-purple',
  '1924287844941955073': 'gucci-black'
};

// Skin color ID to RGB mapping for background overlay
const SKIN_COLOR_RGB_MAPPING: Record<string, string> = {
  '15': 'rgb(5, 65, 70)', // bvlgari-blue-black
  '1687419125085335554': 'rgb(34, 139, 34)', // tomford-green
  '1687419804829954050': 'rgb(255, 165, 0)', // ferrari-black-yellow
  '1687423728032313346': 'rgb(220, 20, 60)', // armani-black-red
  '1687424061300416513': 'rgb(70, 130, 180)', // corum-blue
  '1687424270198022145': 'rgb(128, 0, 128)', // aston-martin-purple
  '1692485205460766722': 'rgb(255, 215, 0)', // roger-dubuis-black-gold
  '1692485850558005250': 'rgb(154, 205, 50)', // porsche-yellow-green
  '1692486746230812674': 'rgb(220, 20, 60)', // cartier-red
  '1692488006900928514': 'rgb(30, 144, 255)', // estee-lauder-blue
  '1692488483161190401': 'rgb(128, 0, 32)', // burgundy-red
  '1692488808662204418': 'rgb(70, 130, 180)', // iwc-blue
  '1692489196854333442': 'rgb(255, 215, 0)', // gucci-green-gold
  '1692489501242617857': 'rgb(139, 69, 19)', // burberry-brown
  '1692489827560214530': 'rgb(32, 178, 170)', // lamer-green
  '1692490140235583490': 'rgb(102, 51, 153)', // ebay-purple
  '1697159683483983873': 'rgb(0, 191, 255)', // dior-klein-blue
  '1697159980803305474': 'rgb(70, 130, 180)', // chivas-regal-blue
  '1697160139817517057': 'rgb(135, 206, 235)', // furla-blue
  '1697160330594295810': 'rgb(128, 128, 128)', // bottega-veneta-gray
  '1697160465763233793': 'rgb(70, 130, 180)', // embraer-blue
  '1697160834305101825': 'rgb(128, 0, 0)', // bordeaux-red
  '1697160986273185793': 'rgb(169, 169, 169)', // breguet-gray
  '1697161119648129025': 'rgb(255, 69, 0)', // hermes-orange
  '1697161307920756738': 'rgb(139, 69, 19)', // bvlgari-brown
  '1697161596809916417': 'rgb(255, 140, 0)', // hermes-brown-orange
  '1697161777339891714': 'rgb(255, 20, 147)', // elsa-schiaparelli-pink
  '1697161995892490242': 'rgb(255, 218, 185)', // lancome-peach
  '1697162642566025217': 'rgb(124, 252, 0)', // lacoste-green
  '1697162790520283138': 'rgb(255, 255, 0)', // versace-yellow
  '1697163109007503361': 'rgb(160, 82, 45)', // bvlgari-brown-alt
  '1697163285008887809': 'rgb(0, 0, 0)', // prada-black
  '1697163805310021633': 'rgb(255, 20, 147)', // victoria-secret-red
  '1697163938916524034': 'rgb(153, 51, 255)', // anna-sui-purple
  '1697164125656219650': 'rgb(59, 89, 152)', // facebook-blue
  '1697164281092911105': 'rgb(34, 139, 34)', // facebook-green
  '1697164409843445761': 'rgb(29, 161, 242)', // twitter-blue
  '1697164886393913346': 'rgb(34, 139, 34)', // usdt-green
  '1697165024871976962': 'rgb(220, 20, 60)', // sk2-red
  '1697165145999220737': 'rgb(139, 69, 19)', // patek-philippe-brown
  '1697165288065609730': 'rgb(255, 0, 0)', // microsoft-red
  '1697165446718234626': 'rgb(255, 20, 147)', // 3ce-red
  '1697165616248053761': 'rgb(139, 69, 19)', // louis-vuitton-brown
  '1697165753468780546': 'rgb(34, 139, 34)', // bottega-veneta-green
  '1822080907778543618': 'rgb(22, 22, 22)', // rolex-green - using custom primary color #161616
  '1822084756339769345': 'rgb(128, 0, 128)', // guerlain-purple
  '1924287844941955073': 'rgb(0, 0, 0)' // gucci-black
};

// Export function to get RGB color for skin color ID - now uses dynamic color palette
export function getSkinColorRGB(skinColorId: string): string {
  try {
    const palette = getColorPaletteById(skinColorId);
    // Convert hex to rgb
    const hex = palette.primary.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return `rgb(${r}, ${g}, ${b})`;
  } catch (error) {
    // Fallback to default if skin color ID not found
    return 'rgb(22, 22, 22)';
  }
}

// Convert RGB string to hex
export function rgbToHex(rgb: string): string {
  const rgbMatch = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (!rgbMatch || rgbMatch.length < 4) return '#054146'; // Default hex value
  
  const r = parseInt(rgbMatch[1]!);
  const g = parseInt(rgbMatch[2]!);
  const b = parseInt(rgbMatch[3]!);
  
  const toHex = (n: number) => {
    const hex = n.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return '#' + toHex(r) + toHex(g) + toHex(b);
}

// Get both RGB and hex values for a skin color ID
export function getSkinColorValues(skinColorId: string): { rgb: string; hex: string } {
  const rgb = getSkinColorRGB(skinColorId);
  const hex = rgbToHex(rgb);
  return { rgb, hex };
}

export function useSkinPreview(config: SkinPreviewConfig) {
  const activePreviewDevice = ref<string>('mobile');
  const isLoading = ref(false);
  const previewError = ref<string | null>(null);

  // Generate real preview image URL based on current configuration
  const previewImageUrl = computed(() => {
    const templateCode = TEMPLATE_MAPPING[config.template] || '2-1';
    const langCode = LANGUAGE_MAPPING[config.language] || 'zh';
    const colorCode = COLOR_MAPPING[config.gameColor] || 'dark';
    const skinColorCode = SKIN_COLOR_MAPPING[config.skinColor] || 'bvlgari-blue-black';
    
    // Generate timestamp for cache busting
    const now = new Date();
    const timestamp = now.getFullYear() + '-' + 
                     String(now.getMonth() + 1).padStart(2, '0') + '-' + 
                     String(now.getDate()).padStart(2, '0') + '-' + 
                     String(now.getHours()).padStart(2, '0');
    
    // Build URL with template, language, and color parameters
    // The skin color now influences the template selection
    const templateWithColor = `${templateCode}_${langCode}_${skinColorCode}_${colorCode}`;
    const baseUrl = `https://sweykpro.pubs3static.com/siteadmin/template/${templateWithColor}`;
    const params = new URLSearchParams({
      brand: config.brandIcon,
      device: activePreviewDevice.value,
      t: timestamp
    });
    
    console.log('Generated preview URL:', `${baseUrl}.png?${params.toString()}`);
    return `${baseUrl}.png?${params.toString()}`;
  });

  // Fallback to mock images if real URL fails
  const mockPreviewImages: Record<string, string> = {
    'rolex-有底色-mobile': 'https://sweykpro.pubs3static.com/siteadmin/template/2-28_zh.png?2025-07-14-12',
    'rolex-无底色-mobile': 'https://sweykpro.pubs3static.com/siteadmin/template/2-72_zh.png?2025-07-14-12',
    'tomford-有底色-mobile': 'https://images.unsplash.com/photo-1592450191688-73c2556511b8?w=250&h=400&fit=crop',
    'tomford-无底色-mobile': 'https://images.unsplash.com/photo-1551721434-8b94ddff0e6d?w=250&h=400&fit=crop',
    'burberry-有底色-mobile': 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=250&h=400&fit=crop',
    'burberry-无底色-mobile': 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=250&h=400&fit=crop',
    'cartier-有底色-mobile': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=250&h=400&fit=crop',
    'cartier-无底色-mobile': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=250&h=400&fit=crop',
    'omega-有底色-mobile': 'https://images.unsplash.com/photo-1524805444973-af331f73afbc?w=250&h=400&fit=crop',
    'omega-无底色-mobile': 'https://images.unsplash.com/photo-1524805444973-af331f73afbc?w=250&h=400&fit=crop',
    'tag-heuer-有底色-mobile': 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=250&h=400&fit=crop',
    'tag-heuer-无底色-mobile': 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=250&h=400&fit=crop',
    };

  // Get mock preview image URL as fallback
  const mockPreviewUrl = computed(() => {
    // Create a key that includes skin color for better variety
    const skinColorCode = SKIN_COLOR_MAPPING[config.skinColor] || 'bvlgari-blue-black';
    const key = `${config.brandIcon}-${config.gameColor}-${activePreviewDevice.value}`;
    const baseUrl = mockPreviewImages[key] || mockPreviewImages['rolex-有底色-mobile'];
    
    // Add skin color as a query parameter to create variety in mock images
    const colorParam = skinColorCode.includes('blue') ? 'blue' : 
                      skinColorCode.includes('green') ? 'green' :
                      skinColorCode.includes('red') ? 'red' :
                      skinColorCode.includes('yellow') ? 'yellow' :
                      skinColorCode.includes('purple') ? 'purple' :
                      skinColorCode.includes('orange') ? 'orange' :
                      skinColorCode.includes('brown') ? 'brown' : 'default';
    
    return `${baseUrl}&color=${colorParam}`;
  });

  // Current device configuration
  const currentDevice = computed(() => {
    const device = PREVIEW_DEVICES[activePreviewDevice.value];
    return device || PREVIEW_DEVICES.mobile;
  });

  // Preview container styles
  const previewContainerStyle = computed(() => {
    const deviceKey = activePreviewDevice.value in PREVIEW_DEVICES ? activePreviewDevice.value : 'mobile';
    const device = PREVIEW_DEVICES[deviceKey]!;
    return {
      width: `${device.width}px`,
      height: `${device.height}px`,
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      overflow: 'hidden',
      backgroundColor: '#f5f5f5'
    };
  });

  // Watch for config changes and update preview
  watch(
    () => [config.template, config.brandIcon, config.gameColor, config.skinColor, config.language, activePreviewDevice.value],
    () => {
      console.log('Preview config changed:', {
        template: config.template,
        brandIcon: config.brandIcon,
        gameColor: config.gameColor,
        skinColor: config.skinColor,
        language: config.language,
        device: activePreviewDevice.value
      });
      isLoading.value = true;
      previewError.value = null;
      
      // Simulate loading time for better UX
      setTimeout(() => {
        isLoading.value = false;
      }, 500);
    },
    { deep: true, immediate: true }
  );

  // Set active preview device
  const setPreviewDevice = (device: string) => {
    if (PREVIEW_DEVICES[device]) {
      activePreviewDevice.value = device;
    }
  };

  // Handle image load error - fallback to mock
  const handleImageError = (event: Event) => {
    const img = event.target as HTMLImageElement;
    const key = `${config.brandIcon}-${config.gameColor}-${activePreviewDevice.value}`;
    const fallbackUrl = mockPreviewImages[key] || mockPreviewImages['rolex-有底色-mobile'] || '';
    
    if (img && img.src !== fallbackUrl && fallbackUrl) {
      img.src = fallbackUrl;
    } else {
      previewError.value = '预览图片加载失败';
    }
  };

  // Handle image load success
  const handleImageLoad = () => {
    previewError.value = null;
    isLoading.value = false;
  };

  // Start loading
  const startLoading = () => {
    isLoading.value = true;
    previewError.value = null;
  };

  return {
    // State
    activePreviewDevice,
    isLoading,
    previewError,
    
    // Computed
    previewImageUrl,
    mockPreviewUrl,
    currentDevice,
    previewContainerStyle,
    
    // Methods
    setPreviewDevice,
    handleImageError,
    handleImageLoad,
    startLoading
  };
} 