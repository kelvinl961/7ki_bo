import { requestClient } from '#/api/request';
import type {
  Domain,
  HealthCheckResult,
  TrafficStats,
  Certificate,
  BatchOperationResult
} from '../types';

// requestClient already has the base URL configured (e.g., /api or https://api.118br.com/api)
// So we just use the endpoint paths directly without repeating /api

export const domainApi = {
  /**
   * ===== DOMAIN CRUD =====
   */
  // Get domains list
  getDomains(params?: any) {
    return requestClient.get<{ code: number; data: { domains: Domain[]; total: number } }>('/domain-management', { params });
  },

  // Get single domain
  getDomain(id: number) {
    return requestClient.get<{ code: number; data: Domain }>(`/domain-management/${id}`);
  },

  // Create domain
  createDomain(data: Partial<Domain>) {
    return requestClient.post<{ code: number; data: Domain }>('/domain-management', data);
  },

  // Update domain
  updateDomain(id: number, data: Partial<Domain>) {
    return requestClient.put<{ code: number; data: Domain }>(`/domain-management/${id}`, data);
  },

  // Delete domain
  deleteDomain(id: number) {
    return requestClient.delete<{ code: number; message: string }>(`/domain-management/${id}`);
  },

  // Bulk delete domains
  bulkDeleteDomains(ids: number[]) {
    return requestClient.post<{ code: number; message: string }>('/domain-management/bulk-delete', { ids });
  },

  // Toggle domain status (enable/disable)
  toggleDomainStatus(id: number, data: { operatedBy?: string }) {
    return requestClient.post<{ code: number; data: Domain; message: string }>(`/domain-management/${id}/toggle-status`, data);
  },

  // Bind agent to domain
  bindAgent(id: number, data: { agentId: string; operatedBy?: string }) {
    return requestClient.post<{ code: number; data: Domain; message: string }>(`/domain-management/${id}/bind-agent`, data);
  },

  // Unbind agent from domain
  unbindAgent(id: number, data: { operatedBy?: string }) {
    return requestClient.post<{ code: number; data: Domain; message: string }>(`/domain-management/${id}/unbind-agent`, data);
  },

  // Verify domain status from CDN
  verifyDomain(id: number) {
    return requestClient.post<{ code: number; data: any; message: string }>(`/domain-management/${id}/verify`);
  },

  // Get domain statistics
  getDomainStats() {
    return requestClient.get<{ code: number; data: any }>('/domain-management/stats');
  },

  /**
   * ===== HEALTH CHECK =====
   */
  // Single domain health check
  healthCheck(domainId: number) {
    return requestClient.post<{ data: HealthCheckResult }>(`/domains/${domainId}/health-check`);
  },

  // Batch health check
  batchHealthCheck(domainIds: number[]) {
    return requestClient.post<{ data: BatchOperationResult[] }>('/domains/batch-health-check', {
      domainIds
    });
  },

  // Get health history
  getHealthHistory(domainId: number, params?: { limit?: number }) {
    return requestClient.get<{ data: HealthCheckResult[] }>(
      `/domains/${domainId}/health-history`,
      { params }
    );
  },

  // Get latest health status
  getLatestHealth(domainId: number) {
    return requestClient.get<{ data: HealthCheckResult }>(`/domains/${domainId}/health-latest`);
  },

  // Get health stats summary
  getHealthStats() {
    return requestClient.get<{ data: any }>('/domains/health-stats');
  },

  // Get health overview
  getHealthOverview(params?: any) {
    return requestClient.get<{ data: { domains: HealthCheckResult[]; summary: any } }>(
      '/domains/health-overview',
      { params }
    );
  },

  /**
   * ===== TRAFFIC STATISTICS =====
   */
  // Get domain traffic stats
  getDomainTraffic(domainId: number, month: string) {
    return requestClient.get<{ data: TrafficStats }>(
      `/domains/${domainId}/traffic-stats`,
      { params: { month } }
    );
  },

  // Update domain traffic stats
  updateDomainTraffic(domainId: number, data: Partial<TrafficStats>) {
    return requestClient.put<{ data: TrafficStats }>(
      `/domains/${domainId}/traffic-stats`,
      data
    );
  },

  // Get all domains traffic stats
  getAllTraffic(month: string) {
    return requestClient.get<{ data: TrafficStats[] }>(
      '/domains/traffic-stats',
      { params: { month } }
    );
  },

  // Get traffic overview
  getTrafficOverview(month: string) {
    return requestClient.get<{ data: { domains: TrafficStats[]; summary: any } }>(
      '/domains/traffic-overview',
      { params: { month } }
    );
  },

  // Export traffic report
  exportTraffic(month: string, format: string = 'csv') {
    return `/domains/traffic-export?month=${month}&format=${format}`;
  },

  /**
   * ===== BATCH OPERATIONS =====
   */
  // Batch create domains
  batchCreate(data: { domainNames: string[]; cdnProvider: string; useType?: string; createOnCDN?: boolean }) {
    return requestClient.post<{ data: BatchOperationResult[] }>('/domains/batch-create', data);
  },

  // Batch enable domains
  batchEnable(domainIds: number[]) {
    return requestClient.post<{ data: BatchOperationResult[] }>('/domains/batch-enable', {
      domainIds
    });
  },

  // Batch disable domains
  batchDisable(domainIds: number[]) {
    return requestClient.post<{ data: BatchOperationResult[] }>('/domains/batch-disable', {
      domainIds
    });
  },

  // Batch delete domains
  batchDelete(domainIds: number[], deleteFromCDN: boolean = false) {
    return requestClient.post<{ data: BatchOperationResult[] }>('/domains/batch-delete', {
      domainIds,
      deleteFromCDN
    });
  },

  // Batch update domains
  batchUpdate(domainIds: number[], updates: Partial<Domain>) {
    return requestClient.post<{ data: BatchOperationResult[] }>('/domains/batch-update', {
      domainIds,
      updates
    });
  },

  // Batch clear cache
  batchClearCache(domainIds: number[]) {
    return requestClient.post<{ data: BatchOperationResult[] }>('/domains/batch-clear-cache', {
      domainIds
    });
  },

  /**
   * ===== CDN MANAGEMENT =====
   */
  // Switch CDN provider
  switchCDN(domainId: number, data: { targetProvider: string; migrateData?: boolean; updateDNS?: boolean }) {
    return requestClient.post<{ code: number; data: any; message: string }>(`/domain-management/${domainId}/switch-cdn`, data);
  },

  // Get available CDN providers
  getAvailableCDNs(domainId: number) {
    return requestClient.get<{ code: number; data: { providers: string[] } }>(
      `/domain-management/${domainId}/available-cdns`
    );
  },

  // Clear cache for single domain
  clearCache(domainId: number) {
    return requestClient.post<{ code: number; data: any; message: string }>(`/domain-management/${domainId}/clear-cache`);
  },

  /**
   * ===== CERTIFICATE MANAGEMENT =====
   */
  // Get all certificates
  getCertificates() {
    return requestClient.get<{ data: Certificate[] }>('/certificates');
  },

  // Get certificates by domain
  getDomainCertificates(domainId: number) {
    return requestClient.get<{ data: Certificate[] }>(`/certificates/domain/${domainId}`);
  },

  // Get certificate by ID
  getCertificate(id: number) {
    return requestClient.get<{ data: Certificate }>(`/certificates/${id}`);
  },

  // Create certificate
  createCertificate(data: Partial<Certificate>) {
    return requestClient.post<{ data: Certificate }>('/certificates', data);
  },

  // Update certificate
  updateCertificate(id: number, data: Partial<Certificate>) {
    return requestClient.put<{ data: Certificate }>(`/certificates/${id}`, data);
  },

  // Delete certificate
  deleteCertificate(id: number) {
    return requestClient.delete(`/certificates/${id}`);
  },

  // Get expiring certificates
  getExpiringCertificates(days: number = 30) {
    return requestClient.get<{ data: { count: number; certificates: Certificate[] } }>(
      '/certificates/expiring',
      { params: { days } }
    );
  },

  // Bind certificate to domain
  bindCertificate(certificateId: number, domainId: number) {
    return requestClient.post<{ data: any }>(
      `/certificates/${certificateId}/bind/${domainId}`
    );
  }
};

