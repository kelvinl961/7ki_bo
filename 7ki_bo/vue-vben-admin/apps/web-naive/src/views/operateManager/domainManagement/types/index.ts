/**
 * Domain Management Types
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
  | 'NORMAL'
  | 'VERIFICATION_PENDING';

export type DomainUseType =
  | 'APP_HALL'
  | 'APP_UPDATE'
  | 'BACKEND_API'
  | 'DOWNLOAD_SITE'
  | 'OSS_ACCELERATION'
  | 'TRANSFER_PAGE'
  | 'WEB_HALL';

export type SecurityStatus = 'BLOCKED' | 'NORMAL' | 'UNKNOWN';

export type PortType = 'DEFAULT' | 'FIXED';

export type DeviceBlocking = 'BLOCK_MOBILE' | 'BLOCK_PC' | 'NONE';

export type EntranceType = 'ALL' | 'APP_ONLY' | 'H5_PWA';

/**
 * Domain Interface
 */
export interface Domain {
  id: number;
  domainName: string;
  cdnProvider: CDNProvider;
  cdnPlatformName?: string;
  status: DomainStatus;
  verificationMethod: string;
  verificationStatus: boolean;
  verificationDate?: string;
  lastVerificationCheck?: string;
  expiryDate?: string;
  certificateExpiryDate?: string;
  usageScenario?: string;
  备注?: string;

  // Classification
  useType?: DomainUseType;
  isParentDomain: boolean;
  parentDomainId?: number;
  subDomainCount: number;

  // DNS Configuration
  dnsRecords?: any[];
  nameservers?: string[];
  cdnConfiguration?: any;

  // CDN Management
  canChangeCDN: boolean;
  availableCDNNodes?: string[];
  lastCDNSwitch?: string;
  domainRefreshing: number;

  // Security
  isFirewall: SecurityStatus;
  isHijack: SecurityStatus;
  isQqHijack: SecurityStatus;
  isWxHijack: SecurityStatus;
  is360Hijack: SecurityStatus;
  isPutOnRecord: SecurityStatus;
  blockadedArea?: string;

  // Port Management
  portType: PortType;
  customPort?: number;
  portStartDate?: string;
  portAutoRecycle: boolean;

  // Agent & Promotion
  isPromotionDomain: boolean;
  boundAgentId?: string;
  enabledEntrance: EntranceType;
  blockedDevice: DeviceBlocking;

  // SSL
  sslEnabled: boolean;
  sslCertificate?: any;
  certificateType: number;

  // Metadata
  siteCode?: string;
  appId?: string;
  defaultDnsNode: number;
  dnsNodeId?: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Health Check Result
 */
export interface HealthCheckResult {
  id: number;
  domainId: number;
  domainName: string;
  cdnProvider: string;
  healthScore: number;
  status: '优' | '差' | '良';
  responseTime: number;
  testedRegions?: RegionCheckResult[];
  failedRegions?: string[];
  checkType: 'DNS' | 'HTTP';
  checkUrl?: string;
  resolvedIp?: string;
  isDNSPolluted?: boolean;
  rawResults?: any;
  checkTime: string;
  checking?: boolean;
}

export interface RegionCheckResult {
  name: string;
  success: boolean;
  time?: number;
  ip?: string;
  message?: string;
}

/**
 * Traffic Statistics
 */
export interface TrafficStats {
  id: number;
  domainId: number;
  domainName: string;
  cdnProvider: string;
  month: string;

  // Cost
  totalCost: number;
  nodeFee: number;
  excessCost: number;

  // Traffic
  freeTraffic: number;
  usedTraffic: number;
  excessTraffic: number;
  excessUnitPrice: number;

  // Bandwidth
  peakBandwidth: number;
  avgBandwidth: number;

  // Subdomains
  freeSubdomains: number;
  usedSubdomains: number;
  excessSubdomains: number;
  subdomainUnitPrice: number;

  // Requests
  totalRequests: bigint;
  cachedRequests: bigint;
  uncachedRequests: bigint;
  cacheHitRate: number;

  createdAt: string;
  updatedAt: string;
}

/**
 * SSL Certificate
 */
export interface Certificate {
  id: number;
  domainId: number;
  certificateName: string;
  certificateType: string;
  certificateContent?: string;
  privateKey?: string;
  certificateChain?: string;
  domains: string[];
  issuer?: string;
  issueDate?: string;
  expiryDate?: string;
  autoRenew: boolean;
  status: 'active' | 'expired' | 'revoked';
  createdAt: string;
  updatedAt: string;
}

/**
 * Batch Operation Result
 */
export interface BatchOperationResult {
  success: boolean;
  domain: string;
  message?: string;
  error?: string;
  data?: any;
}

/**
 * Form Data Types
 */
export interface DomainFormData {
  domainName: string;
  cdnProvider: CDNProvider;
  useType?: DomainUseType;
  sslEnabled: boolean;
  createOnCDN: boolean;
  备注?: string;
}

export interface CertificateFormData {
  domainId: number;
  certificateName: string;
  certificateContent: string;
  privateKey: string;
  certificateChain?: string;
  domains?: string[];
  autoRenew: boolean;
}

/**
 * Filter Types
 */
export interface DomainFilter {
  cdnProvider?: string;
  status?: string;
  useType?: string;
  search?: string;
  isPromotionDomain?: boolean;
  isParentDomain?: boolean;
}

export interface HealthFilter {
  cdnProvider?: string;
  status?: string;
  minScore?: number;
  maxScore?: number;
}

export interface TrafficFilter {
  month: string;
  cdnProvider?: string;
  minCost?: number;
  maxCost?: number;
}
