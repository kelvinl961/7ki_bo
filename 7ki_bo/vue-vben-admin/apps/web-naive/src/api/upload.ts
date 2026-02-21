import { requestClient } from './request';

export interface UploadedFile {
  id?: number;
  filename: string;
  originalName: string;
  path: string;
  url: string;
  thumbnailUrl?: string;
  mediumUrl?: string;
  size: number;
  width: number;
  height: number;
  format: string;
  mimeType: string;
  category?: string;
  alt?: string;
  description?: string;
  tags?: string[];
  isPublic?: boolean;
  uploadedBy?: number;
  createdAt?: Date;
}

export interface UploadResponse {
  success: boolean;
  data: UploadedFile | UploadedFile[];
  message?: string;
}

export interface UploadOptions {
  category?: string;
  alt?: string;
  description?: string;
  tags?: string[];
  isPublic?: boolean;
}

/**
 * Upload single image
 */
export async function uploadSingleImage(file: File, options: UploadOptions = {}): Promise<UploadedFile> {
  const formData = new FormData();
  formData.append('image', file);
  
  // Add options to form data
  if (options.category) formData.append('category', options.category);
  if (options.alt) formData.append('alt', options.alt);
  if (options.description) formData.append('description', options.description);
  if (options.tags) formData.append('tags', JSON.stringify(options.tags));
  if (options.isPublic !== undefined) formData.append('isPublic', options.isPublic.toString());

  const response = await requestClient.post<UploadResponse>('/api/enhanced-upload/single', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data as UploadedFile;
}

/**
 * Upload multiple images
 */
export async function uploadMultipleImages(files: File[], options: UploadOptions = {}): Promise<UploadedFile[]> {
  const formData = new FormData();
  
  // Add files to form data
  files.forEach((file, index) => {
    formData.append('images', file);
  });
  
  // Add options to form data
  if (options.category) formData.append('category', options.category);
  if (options.alt) formData.append('alt', options.alt);
  if (options.description) formData.append('description', options.description);
  if (options.tags) formData.append('tags', JSON.stringify(options.tags));
  if (options.isPublic !== undefined) formData.append('isPublic', options.isPublic.toString());

  const response = await requestClient.post<UploadResponse>('/api/enhanced-upload/multiple', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data as UploadedFile[];
}

/**
 * Delete uploaded file
 */
export async function deleteUploadedFile(fileId: number): Promise<boolean> {
  const response = await requestClient.delete(`/api/enhanced-upload/file/${fileId}`);
  return response.success;
}

/**
 * Get uploaded file by ID
 */
export async function getUploadedFile(fileId: number): Promise<UploadedFile | null> {
  try {
    const response = await requestClient.get<{ success: boolean; data: UploadedFile }>(`/api/enhanced-upload/file/${fileId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to get uploaded file:', error);
    return null;
  }
}

/**
 * Get all uploaded files with pagination
 */
export async function getUploadedFiles(params: {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
} = {}): Promise<{
  files: UploadedFile[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}> {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.category) queryParams.append('category', params.category);
  if (params.search) queryParams.append('search', params.search);

  const response = await requestClient.get<{
    success: boolean;
    data: {
      files: UploadedFile[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    };
  }>(`/api/enhanced-upload/files?${queryParams.toString()}`);

  return response.data;
} 