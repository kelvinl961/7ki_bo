import { requestClient } from '#/api/request';

export interface ReferralValidationResult {
  valid: boolean;
  agent?: {
    agentId: string;
    currency: string;
    isActive: boolean;
    referralCode: string;
    username: string;
  };
}

export interface ReferralStats {
  agent: {
    agentId: string;
    isActive: boolean;
    referralCode: string;
    username: string;
  };
  referredUsers: Array<{
    account: string;
    createdAt: string;
    email: string;
    id: number;
    name: string;
  }>;
  referralRegistrations: Array<{
    id: number;
    registeredAt: string;
    registeredUserEmail?: string;
    registeredUserId?: number;
    registeredUserPhone?: string;
    visitorIp: string;
  }>;
  statistics: {
    conversionRate: string;
    totalReferredUsers: number;
    totalRegistrations: number;
    totalUniqueVisitors: number;
    totalVisits: number;
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
export async function validateReferralCode(
  referralCode: string,
): Promise<ReferralValidationResult> {
  const response = await requestClient.get(
    `/referral/validate/${referralCode}`,
  );
  return response.data;
}

/**
 * Register user with referral code
 */
export async function registerWithReferral(
  data: RegistrationData,
): Promise<any> {
  const response = await requestClient.post('/users/register', data);
  return response.data;
}

/**
 * Get agent referral statistics
 */
export async function getAgentReferralStats(
  agentId: string,
): Promise<ReferralStats> {
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
export async function getReferralStats(
  referralCode: string,
  days: number = 30,
): Promise<any> {
  const response = await requestClient.get(`/referral/stats/${referralCode}`, {
    params: { days },
  });
  return response.data;
}

/**
 * Extract referral code from URL parameters
 */
export function extractReferralCodeFromUrl(): null | string {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('ref');
}

/**
 * Store referral code in localStorage for later use
 */
export function storeReferralCode(referralCode: string): void {
  if (referralCode && /^7KI[A-Z0-9]+$/.test(referralCode)) {
    localStorage.setItem('referralCode', referralCode);
    // Set expiration (7 days)
    const expiration = Date.now() + 7 * 24 * 60 * 60 * 1000;
    localStorage.setItem('referralCodeExpiration', expiration.toString());
  }
}

/**
 * Get stored referral code from localStorage
 */
export function getStoredReferralCode(): null | string {
  const referralCode = localStorage.getItem('referralCode');
  const expiration = localStorage.getItem('referralCodeExpiration');

  if (!referralCode || !expiration) {
    return null;
  }

  // Check if expired
  if (Date.now() > Number.parseInt(expiration)) {
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
export function generateReferralLink(
  referralCode: string,
  baseUrl: string = 'https://sevenki.118br.com',
): string {
  return `${baseUrl}/?ref=${referralCode}`;
}

/**
 * Auto-detect and store referral code on page load
 */
export function autoDetectReferralCode(): null | string {
  const urlReferralCode = extractReferralCodeFromUrl();

  if (urlReferralCode) {
    storeReferralCode(urlReferralCode);
    return urlReferralCode;
  }

  return getStoredReferralCode();
}
