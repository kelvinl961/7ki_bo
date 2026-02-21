/**
 * Get the full image URL by appending API domain to relative URLs
 * @param imageUrl - The image URL (can be relative or absolute)
 * @returns The full image URL
 */
export function getImageUrl(imageUrl: string | null | undefined): string {
  if (!imageUrl) return '';
  
  // If it's already an absolute URL (starts with http:// or https://), return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // If it's a relative URL (starts with /), prefix with API domain
  if (imageUrl.startsWith('/')) {
    return `http://localhost:5000${imageUrl}`;
  }
  
  // If it doesn't start with /, assume it's relative to the API domain
  return `http://localhost:5000/${imageUrl}`;
}

/**
 * Get the full image URL for production environment
 * @param imageUrl - The image URL (can be relative or absolute)
 * @returns The full image URL
 */
export function getProductionImageUrl(imageUrl: string | null | undefined): string {
  if (!imageUrl) return '';
  
  // If it's already an absolute URL, return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // For production, use the Railway URL
  const baseUrl = 'https://api.pangu6688.com';
  
  // If it's a relative URL (starts with /), prefix with production domain
  if (imageUrl.startsWith('/')) {
    return `${baseUrl}${imageUrl}`;
  }
  
  // If it doesn't start with /, assume it's relative to the API domain
  return `${baseUrl}/${imageUrl}`;
}

/**
 * Get the appropriate image URL based on environment
 * @param imageUrl - The image URL (can be relative or absolute)
 * @returns The full image URL
 */
export function getImageUrlByEnvironment(imageUrl: string | null | undefined): string {
  if (!imageUrl) return '';
  
  // If it's already an absolute URL, return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // Check if we're in development or production
  const isDevelopment = import.meta.env.DEV;
  
  if (isDevelopment) {
    return getImageUrl(imageUrl);
  } else {
    return getProductionImageUrl(imageUrl);
  }
}

/**
 * Format file size in human readable format
 * @param bytes - File size in bytes
 * @returns Formatted file size string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get image dimensions from URL (placeholder - would need actual image processing)
 * @param imageUrl - The image URL
 * @returns Promise with image dimensions
 */
export async function getImageDimensions(imageUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = () => {
      resolve({ width: 0, height: 0 });
    };
    img.src = getImageUrlByEnvironment(imageUrl);
  });
}

/**
 * Validate image file
 * @param file - File object
 * @returns Validation result
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'File must be an image' };
  }
  
  // Check file size (20MB limit)
  const maxSize = 20 * 1024 * 1024; // 20MB
  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 20MB' };
  }
  
  // Check file extension
  const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (!extension || !allowedExtensions.includes(extension)) {
    return { valid: false, error: 'File type not supported' };
  }
  
  return { valid: true };
}

/**
 * Create a preview URL for an image file
 * @param file - File object
 * @returns Preview URL
 */
export function createImagePreview(file: File): string {
  return URL.createObjectURL(file);
}

/**
 * Clean up preview URL
 * @param previewUrl - Preview URL to revoke
 */
export function cleanupImagePreview(previewUrl: string): void {
  URL.revokeObjectURL(previewUrl);
} 