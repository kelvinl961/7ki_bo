import { ref } from 'vue';

export function useImagePreloader() {
  const preloadedImages = ref(new Set<string>());

  // Simple image preloader using browser-native preloading
  const preloadImage = async (url: string): Promise<void> => {
    if (!url || preloadedImages.value.has(url)) {
      return;
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        preloadedImages.value.add(url);
        resolve();
      };
      
      img.onerror = () => {
        console.warn('Failed to preload image:', url);
        reject(new Error(`Failed to preload image: ${url}`));
      };
      
      img.src = url;
    });
  };

  // Preload multiple images
  const preloadImages = async (urls: string[]): Promise<void> => {
    const validUrls = urls.filter(url => url && !preloadedImages.value.has(url));
    
    if (validUrls.length === 0) {
      return;
    }

    try {
      await Promise.all(validUrls.map(url => preloadImage(url)));
      console.log(`Preloaded ${validUrls.length} images`);
    } catch (error) {
      console.warn('Some images failed to preload:', error);
    }
  };

  // Extract and preload images from brand logo data
  const preloadBrandLogoImages = async (brandLogo: any): Promise<void> => {
    if (!brandLogo) return;

    const imageTypes = [
      'loginImage',
      'appStoreImage',
      'appInternalLogo',
      'lobbyLogo',
      'webFavicon',
      'webLogo'
    ];

    const imageUrls = imageTypes
      .map(type => brandLogo[type])
      .filter(url => url && typeof url === 'string');

    if (imageUrls.length > 0) {
      await preloadImages(imageUrls);
    }
  };

  // Preload images from table data
  const preloadTableImages = async (tableData: any[]): Promise<void> => {
    if (!Array.isArray(tableData) || tableData.length === 0) {
      return;
    }

    const imageTypes = [
      'loginImage',
      'appStoreImage',
      'appInternalLogo',
      'lobbyLogo',
      'webFavicon',
      'webLogo'
    ];

    const allImageUrls = tableData.flatMap(item => 
      imageTypes
        .map(type => item[type])
        .filter(url => url && typeof url === 'string')
    );

    if (allImageUrls.length > 0) {
      await preloadImages(allImageUrls);
    }
  };

  // Check if an image is preloaded
  const isImagePreloaded = (url: string): boolean => {
    return preloadedImages.value.has(url);
  };

  // Clear preloaded images
  const clearPreloadedImages = (): void => {
    preloadedImages.value.clear();
  };

  return {
    preloadImage,
    preloadImages,
    preloadBrandLogoImages,
    preloadTableImages,
    isImagePreloaded,
    clearPreloadedImages
  };
} 