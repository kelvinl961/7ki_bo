import { requestClient } from '#/api/request';

export interface MerchantItem {
  id: string;
  merchantId: string;
  merchantKey?: string;
  name: string;
  secretKey?: string;
  status: string;
  webhookUrl?: null | string;
  config?: any;
  createdAt: string;
}

export async function getMerchantScopeOptionsApi() {
  return requestClient.get('/merchants/scope-options');
}

export async function getMerchantsApi(params?: Record<string, any>) {
  return requestClient.get('/merchants', { params });
}

export async function createMerchantApi(payload: Partial<MerchantItem>) {
  return requestClient.post('/merchants', payload);
}

export async function updateMerchantApi(id: string, payload: Partial<MerchantItem>) {
  return requestClient.put(`/merchants/${id}`, payload);
}

export async function deleteMerchantApi(id: string) {
  return requestClient.delete(`/merchants/${id}`);
}
