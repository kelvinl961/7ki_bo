import { requestClient } from '#/api/request';

// Types
export interface RebateConfig {
  id?: string;
  gameCategory: string;
  sortOrder: number;
  validUserThreshold: number;
  validBetThreshold: number;
  rebateAmountPer10k: number;
  remarks?: string;
  type?: 'validBet' | 'netProfit';
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface RebateSettingsQuery {
  type: 'validBet' | 'netProfit';
  page?: number;
  pageSize?: number;
  gameCategory?: string;
  search?: string;
}

export interface RebateSettingsResponse {
  success: boolean;
  data: RebateConfig[];
  pagination?: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export interface BatchImportData {
  file: File;
  type: 'validBet' | 'netProfit';
}

// API Functions

/**
 * Get rebate settings list
 */
export async function getRebateSettings(params: RebateSettingsQuery): Promise<RebateSettingsResponse> {
  const response = await requestClient.get('/rebate-settings', { params });
  console.log('Rebate settings API response:', response);
  return response;
}

/**
 * Get rebate setting by ID
 */
export async function getRebateSettingById(id: string): Promise<RebateConfig> {
  return requestClient.get(`/rebate-settings/${id}`);
}

/**
 * Create new rebate setting
 */
export async function createRebateSetting(data: Omit<RebateConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<RebateConfig> {
  return requestClient.post('/rebate-settings', data);
}

/**
 * Update rebate setting
 */
export async function updateRebateSetting(id: string, data: Partial<RebateConfig>): Promise<RebateConfig> {
  return requestClient.put(`/rebate-settings/${id}`, data);
}

/**
 * Delete rebate setting
 */
export async function deleteRebateSetting(id: string): Promise<void> {
  return requestClient.delete(`/rebate-settings/${id}`);
}

/**
 * Batch delete rebate settings
 */
export async function batchDeleteRebateSettings(ids: string[]): Promise<void> {
  return requestClient.post('/rebate-settings/batch-delete', { ids });
}

/**
 * Batch update rebate settings
 */
export async function batchUpdateRebateSettings(data: { ids: string[]; updates: Partial<RebateConfig> }): Promise<void> {
  return requestClient.post('/rebate-settings/batch-update', data);
}

/**
 * Download template file
 */
export async function downloadRebateTemplate(type: 'validBet' | 'netProfit'): Promise<Blob> {
  return requestClient.get(`/rebate-settings/template/${type}`, {
    responseType: 'blob'
  });
}

/**
 * Batch import rebate settings
 */
export async function batchImportRebateSettings(data: BatchImportData): Promise<{
  success: number;
  failed: number;
  errors?: string[];
}> {
  const formData = new FormData();
  formData.append('file', data.file);
  formData.append('type', data.type);
  
  return requestClient.post('/rebate-settings/batch-import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}

/**
 * Get rebate statistics
 */
export async function getRebateStatistics(type: 'validBet' | 'netProfit'): Promise<{
  totalConfigs: number;
  totalGameCategories: number;
  averageRebateRate: number;
  lastUpdated: string;
}> {
  return requestClient.get(`/rebate-settings/statistics/${type}`);
}

/**
 * Validate rebate configuration
 */
export async function validateRebateConfig(data: Omit<RebateConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<{
  valid: boolean;
  errors?: string[];
  warnings?: string[];
}> {
  return requestClient.post('/rebate-settings/validate', data);
}

/**
 * Get game categories
 */
export async function getGameCategories(): Promise<Array<{
  value: string;
  label: string;
  description?: string;
}>> {
  const response = await requestClient.get('/rebate-settings/game-categories');
  // The response interceptor returns the whole object for success responses
  // So we need to extract the data from the response
  console.log('Game categories API response:', response);
  if (response && response.data) {
    return response.data;
  }
  return [];
} 