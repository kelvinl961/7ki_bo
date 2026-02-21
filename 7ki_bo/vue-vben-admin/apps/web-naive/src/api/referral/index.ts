import { requestClient } from '#/api/request';

export interface ReferralValidationResult {
  valid: boolean;
  agent?: {
    agentId: string;
    username: string;
    referralCode: string;
    isActive: boolean;
    currency: string;
  };
}

export interface ReferralStats {
  agent: {
    agentId: string;
    username: string;
    referralCode: string;
    isActive: boolean;
  };
  referredUsers: Array<{
    id: number;
    name: string;
    email: string;
    account: string;
    createdAt: string;
  }>;
  referralRegistrations: Array<{
    id: number;
    registeredUserId?: number;
    registeredUserEmail?: string;
    registeredUserPhone?: string;
    visitorIp: string;
    registeredAt: string;
  }>;
  statistics: {
    totalReferredUsers: number;
    totalVisits: number;
    totalUniqueVisitors: number;
    totalRegistrations: number;
    conversionRate: string;
  };
}

export interface RegistrationData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  cpf?: string;
  account: string;
  referralCode?: string;
  [key: string]: any;
}

/**
 * Validate referral code before registration
 */
export async function validateReferralCode(referralCode: string): Promise<ReferralValidationResult> {
  const response = await requestClient.get(`/referral/validate/${referralCode}`);
  return response.data;
}

/**
 * Register user with referral code
 */
export async function registerWithReferral(data: RegistrationData): Promise<any> {
  const response = await requestClient.post('/users/register', data);
  return response.data;
}

/**
 * Get agent referral statistics
 */
export async function getAgentReferralStats(agentId: string): Promise<ReferralStats> {
  const response = await requestClient.get(`/referral/agent/${agentId}/stats`);
  return response.data;
}

/**
 * Track referral visit (for analytics)
 */
export async function trackReferralVisit(referralCode: string): Promise<void> {
  // This returns a 1x1 pixel, so we don't need to handle the response
  await fetch(`/api/referral/visit/${referralCode}`);
}

/**
 * Get referral statistics for a specific referral code
 */
export async function getReferralStats(referralCode: string, days: number = 30): Promise<any> {
  const response = await requestClient.get(`/referral/stats/${referralCode}`, {
    params: { days }
  });
  return response.data;
}

/**
 * Extract referral code from URL parameters
 */
export function extractReferralCodeFromUrl(): string | null {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('ref');
}

/**
 * Store referral code in localStorage for later use
 */
export function storeReferralCode(referralCode: string): void {
  if (referralCode && referralCode.match(/^7KI[A-Z0-9]+$/)) {
    localStorage.setItem('referralCode', referralCode);
    // Set expiration (7 days)
    const expiration = Date.now() + (7 * 24 * 60 * 60 * 1000);
    localStorage.setItem('referralCodeExpiration', expiration.toString());
  }
}

/**
 * Get stored referral code from localStorage
 */
export function getStoredReferralCode(): string | null {
  const referralCode = localStorage.getItem('referralCode');
  const expiration = localStorage.getItem('referralCodeExpiration');
  
  if (!referralCode || !expiration) {
    return null;
  }
  
  // Check if expired
  if (Date.now() > parseInt(expiration)) {
    localStorage.removeItem('referralCode');
    localStorage.removeItem('referralCodeExpiration');
    return null;
  }
  
  return referralCode;
}

/**
 * Clear stored referral code
 */
export function clearStoredReferralCode(): void {
  localStorage.removeItem('referralCode');
  localStorage.removeItem('referralCodeExpiration');
}

/**
 * Generate referral link for an agent
 */
export function generateReferralLink(referralCode: string, baseUrl: string = 'https://sevenki.118br.com'): string {
  return `${baseUrl}/?ref=${referralCode}`;
}

/**
 * Auto-detect and store referral code on page load
 */
export function autoDetectReferralCode(): string | null {
  const urlReferralCode = extractReferralCodeFromUrl();
  
  if (urlReferralCode) {
    storeReferralCode(urlReferralCode);
    return urlReferralCode;
  }
  
  return getStoredReferralCode();
}
