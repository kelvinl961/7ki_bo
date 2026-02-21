import { requestClient } from '#/api/request';

/**
 * Domain Management API
 * Handles domain configuration with CDN providers (AWS, Cloudflare, etc.)
 */

export type CDNProvider =
  | 'ALIYUN'
  | 'AWS'
  | 'CLOUDFLARE'
  | 'HUAWEI_CLOUD'
  | 'OTHER'
  | 'TENCENT_CLOUD';
export type DomainStatus =
  | 'DISABLED'
  | 'EXPIRED'
  | 'EXPIRING_SOON'
  | 'NORMAL'
  | 'VERIFICATION_PENDING';
export type VerificationMethod =
  | 'DNS_VALIDATION'
  | 'EMAIL_VALIDATION'
  | 'HTTP_VALIDATION'
  | 'WHEN_DNS_COMPLETED';

export interface DomainManagement {
  id: number;
  domainName: string;
  cdnProvider: CDNProvider;
  cdnPlatformName?: string;
  status: DomainStatus;
  verificationMethod: VerificationMethod;
  verificationStatus: boolean;
  verificationDate?: string;
  expiryDate?: string;
  certificateExpiryDate?: string;
  usageScenario?: string;
  备注?: string;
  dnsRecords?: any[];
  nameservers?: string[];
  cdnConfiguration?: Record<string, any>;
  sslEnabled: boolean;
  sslCertificate?: string;
  createdBy?: string;
  updatedBy?: string;
  operatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DomainListParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  cdnProvider?: string;
  status?: string;
  search?: string;
  expiryDateFrom?: string;
  expiryDateTo?: string;
  verificationStatus?: string;
}

export interface DomainListResponse {
  list: DomainManagement[];
  pagination: {
    current: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateDomainRequest {
  domainName: string;
  cdnProvider?: CDNProvider;
  cdnPlatformName?: string;
  status?: DomainStatus;
  verificationMethod?: VerificationMethod;
  verificationStatus?: boolean;
  verificationDate?: string;
  expiryDate?: string;
  certificateExpiryDate?: string;
  usageScenario?: string;
  备注?: string;
  dnsRecords?: any[];
  nameservers?: string[];
  cdnConfiguration?: Record<string, any>;
  sslEnabled?: boolean;
  sslCertificate?: string;
  createdBy?: string;
  operatedBy?: string;
}

export interface UpdateDomainRequest extends Partial<CreateDomainRequest> {
  updatedBy?: string;
  operatedBy?: string;
}

export interface DomainStats {
  total: number;
  byProvider: {
    aws: number;
    cloudflare: number;
  };
  byStatus: {
    expiringSoon: number;
    normal: number;
  };
  verified: number;
  unverified: number;
}

/**
 * Get domain list with filters and pagination
 */
export async function getDomainListApi(
  params: DomainListParams = {},
): Promise<DomainListResponse> {
  return requestClient.get<DomainListResponse>('/domain-management', {
    params,
  });
}

/**
 * Get domain by ID
 */
export async function getDomainApi(id: number): Promise<DomainManagement> {
  return requestClient.get<DomainManagement>(`/domain-management/${id}`);
}

/**
 * Create new domain
 */
export async function createDomainApi(
  data: CreateDomainRequest,
): Promise<DomainManagement> {
  return requestClient.post<DomainManagement>('/domain-management', data);
}

/**
 * Update domain
 */
export async function updateDomainApi(
  id: number,
  data: UpdateDomainRequest,
): Promise<DomainManagement> {
  return requestClient.put<DomainManagement>(`/domain-management/${id}`, data);
}

/**
 * Delete domain
 */
export async function deleteDomainApi(id: number): Promise<void> {
  return requestClient.delete<void>(`/domain-management/${id}`);
}

/**
 * Bulk delete domains
 */
export async function bulkDeleteDomainsApi(
  ids: number[],
): Promise<{ deletedCount: number }> {
  return requestClient.post<{ deletedCount: number }>(
    '/domain-management/bulk-delete',
    { ids },
  );
}

/**
 * Get domain statistics
 */
export async function getDomainStatsApi(): Promise<DomainStats> {
  return requestClient.get<DomainStats>('/domain-management/stats');
}
