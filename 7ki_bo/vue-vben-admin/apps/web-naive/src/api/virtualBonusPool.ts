import { requestClient } from '#/api/request';

export interface VirtualBonusPool {
  id: number;
  currency: string;
  displayType: string;
  displayPosition: string;
  clickTarget: string;
  maxAmount: number;
  minAmount: number;
  decimalPlaces: number;
  numberStyle: string;
  backgroundStyle: string;
  status: boolean;
  remark: string;
  operator: string;
  operationTime: string;
}

export interface BackgroundImage {
  id: string;
  url: string;
  name: string;
  uploadDate: string;
}

export interface CreateVirtualBonusPoolData {
  currency: string;
  displayType: string;
  displayPosition: string;
  clickTarget: string;
  maxAmount: number;
  minAmount: number;
  decimalPlaces: number;
  numberStyle: string;
  backgroundStyle: string;
  status: boolean;
  remark: string;
}

// Virtual Bonus Pool CRUD operations
export async function getVirtualBonusPools(params?: any) {
  return requestClient.get<{
    data: VirtualBonusPool[];
    total: number;
    page: number;
    pageSize: number;
  }>('/virtual-bonus-pools', { params });
}

export async function getVirtualBonusPool(id: number) {
  return requestClient.get<{ data: VirtualBonusPool }>(`/virtual-bonus-pools/${id}`);
}

export async function createVirtualBonusPool(data: CreateVirtualBonusPoolData) {
  return requestClient.post<{ data: VirtualBonusPool }>('/virtual-bonus-pools', data);
}

export async function updateVirtualBonusPool(id: number, data: Partial<CreateVirtualBonusPoolData>) {
  return requestClient.put<{ data: VirtualBonusPool }>(`/virtual-bonus-pools/${id}`, data);
}

export async function deleteVirtualBonusPool(id: number) {
  return requestClient.delete(`/virtual-bonus-pools/${id}`);
}

export async function toggleVirtualBonusPoolStatus(id: number) {
  return requestClient.put(`/virtual-bonus-pools/${id}/toggle-status`);
}

// Bulk operations
export async function bulkUpdateVirtualBonusPools(data: { ids: number[]; updates: Partial<CreateVirtualBonusPoolData> }) {
  return requestClient.post('/virtual-bonus-pools/bulk-update', data);
}

export async function bulkDeleteVirtualBonusPools(ids: number[]) {
  return requestClient.post('/virtual-bonus-pools/bulk-delete', { ids });
}

// Background image operations
export async function getBackgroundImages() {
  return requestClient.get<{ data: BackgroundImage[] }>('/virtual-bonus-pools/background-images');
}

export async function uploadBackgroundImage(file: File) {
  const formData = new FormData();
  formData.append('image', file);
  
  return requestClient.post<{ 
    data: { 
      url: string; 
      filename: string; 
      originalName: string; 
    } 
  }>('/virtual-bonus-pools/upload-background', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

export async function deleteBackgroundImage(id: string) {
  return requestClient.delete(`/virtual-bonus-pools/background-images/${id}`);
} 