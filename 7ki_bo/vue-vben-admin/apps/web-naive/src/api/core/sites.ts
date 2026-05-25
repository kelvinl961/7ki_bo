import { requestClient } from '#/api/request';

export interface SiteRecord {
  id: string;
  siteCode: string;
  brandCode?: string | null;
  displayName: string;
  status: string;
  domainCount?: number;
  databaseEndpoints?: Array<{
    id: string;
    domain: string;
    url: string;
    poolLimit?: number | null;
  }>;
  createdAt?: string;
  updatedAt?: string;
}

export interface SiteScopeOption {
  siteId: string;
  siteCode: string;
  brandCode?: string | null;
  displayName: string;
  status: string;
  label: string;
  value: string;
}

export async function getSiteScopeOptionsApi() {
  return requestClient.get<{ success: boolean; data: SiteScopeOption[] }>(
    '/sites/scope-options',
  );
}

export async function listSitesApi() {
  return requestClient.get<{ success: boolean; data: SiteRecord[] }>('/sites');
}

export async function getSiteByIdApi(id: string) {
  return requestClient.get<{ success: boolean; data: SiteRecord }>(`/sites/${id}`);
}

export async function createSiteApi(payload: {
  siteCode: string;
  displayName: string;
  brandCode?: string;
  status?: string;
  endpoints?: Array<{ domain: string; url: string; poolLimit?: number }>;
}) {
  return requestClient.post('/sites', payload);
}

export async function updateSiteApi(
  id: string,
  payload: { displayName?: string; brandCode?: string; status?: string },
) {
  return requestClient.put(`/sites/${id}`, payload);
}

export async function putSiteEndpointsApi(
  id: string,
  endpoints: Array<{ domain: string; url: string; poolLimit?: number }>,
) {
  return requestClient.put(`/sites/${id}/endpoints`, { endpoints });
}

export async function publishSiteApi(id: string) {
  return requestClient.post(`/sites/${id}/publish`);
}

export async function getSiteEndpointDomainsApi() {
  return requestClient.get<{ success: boolean; data: string[] }>(
    '/sites/endpoint-domains',
  );
}
