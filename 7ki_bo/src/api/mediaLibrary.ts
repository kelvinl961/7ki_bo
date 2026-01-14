import { requestClient } from './request';

// Types
export interface MediaFile {
  id: number;
  filename: string;
  storedName: string;
  url: string;
  category: string;
  type: 'image' | 'video' | 'audio' | 'document';
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  alt?: string;
  description?: string;
  tags?: string[];
  isPublic: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
  uploader?: {
    id: number;
    username: string;
  };
}

export interface MediaCategory {
  name: string;
  count: number;
}

export interface MediaFilesResponse {
  success: boolean;
  data: MediaFile[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface MediaCategoriesResponse {
  success: boolean;
  data: MediaCategory[];
}

export interface MediaFileResponse {
  success?: boolean;
  data?: MediaFile;
  message?: string;
  id?: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Constants
export const MEDIA_CATEGORIES = [
  'backgrounds',
  'banners', 
  'icons',
  'logos',
  'templates',
  'avatars',
  'documents',
  'videos',
  'audio',
  'other'
] as const;

// Utility functions
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getFileTypeIcon(mimeType: string): string {
  if (mimeType.startsWith('image/')) return '🖼️';
  if (mimeType.startsWith('video/')) return '🎥';
  if (mimeType.startsWith('audio/')) return '🎵';
  if (mimeType.includes('pdf')) return '📄';
  if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return '📈';
  return '📁';
}

// API functions
export async function getMediaFiles(params: {
  page?: number;
  pageSize?: number;
  category?: string;
  type?: string;
  search?: string;
  sortBy?: 'createdAt' | 'filename' | 'size' | 'usageCount';
  sortOrder?: 'asc' | 'desc';
}): Promise<MediaFilesResponse> {
  const response = await requestClient.get('/media-library', { params });
  return response;
}

export async function getMediaCategories(): Promise<MediaCategoriesResponse> {
  const response = await requestClient.get('/media-library/categories');
  return response;
}

export async function getMediaFile(id: number): Promise<MediaFileResponse> {
  const response = await requestClient.get(`/media-library/${id}`);
  return response;
}

export async function uploadMediaFile(
  file: File, 
  metadata: {
    filename: string;
    category: string;
    alt?: string;
    description?: string;
    tags?: string[];
    isPublic?: boolean;
  }
): Promise<MediaFileResponse> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('filename', metadata.filename);
  formData.append('category', metadata.category);
  
  if (metadata.alt) {
    formData.append('alt', metadata.alt);
  }
  if (metadata.description) {
    formData.append('description', metadata.description);
  }
  if (metadata.tags && metadata.tags.length > 0) {
    formData.append('tags', JSON.stringify(metadata.tags));
  }
  if (metadata.isPublic !== undefined) {
    formData.append('isPublic', metadata.isPublic.toString());
  }

  const response = await requestClient.post('/media-library/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response;
}

export async function uploadMediaFiles(
  formData: FormData
): Promise<MediaFileResponse> {
  const response = await requestClient.post('/media-library/batch-upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response;
}

export async function updateMediaFile(
  id: number, 
  updates: {
    filename?: string;
    category?: string;
    alt?: string;
    description?: string;
    tags?: string[];
    isPublic?: boolean;
  }
): Promise<MediaFileResponse> {
  const response = await requestClient.put(`/media-library/${id}`, updates);
  return response;
}

export async function deleteMediaFile(id: number): Promise<ApiResponse> {
  const response = await requestClient.delete(`/media-library/${id}`);
  return response;
}

export async function bulkDeleteMediaFiles(ids: number[]): Promise<ApiResponse> {
  const response = await requestClient.delete('/media-library/bulk', {
    data: { ids }
  });
  return response;
}

export async function getMediaFileUsage(id: number): Promise<ApiResponse<{
  usageCount: number;
  lastUsed?: string;
  usageHistory: Array<{
    page: string;
    timestamp: string;
    user?: string;
  }>;
}>> {
  const response = await requestClient.get(`/media-library/${id}/usage`);
  return response;
} 