/**
 * Google Authenticator (2FA) API Service
 * Backend endpoints: /api/users/google-auth/*
 */

import { requestClient } from '#/api/request';

/**
 * Response format for all API calls
 */
export interface ApiResponse<T = any> {
  code: number;
  data?: T;
  message?: string;
  success?: boolean;
}

/**
 * Google Auth Setup Response
 */
export interface GoogleAuthSetup {
  secret: string;            // Base32 encoded secret for manual entry
  qrCodeUrl: string;         // otpauth:// URL
  qrCodeDataUrl: string;     // Data URL for QR code image (data:image/png;base64,...)
}

/**
 * Google Auth Verify Response
 */
export interface GoogleAuthVerifyResponse {
  backupCodes: string[];     // 10 backup codes (8-digit)
}

/**
 * Google Auth Status Response
 */
export interface GoogleAuthStatus {
  enabled: boolean;
  enabledAt: string | null;
}

/**
 * GET /api/users/google-auth/setup
 * Generate QR code and secret for Google Authenticator setup
 */
export async function setupGoogleAuthApi(): Promise<ApiResponse<GoogleAuthSetup>> {
  return await requestClient.get('/users/google-auth/setup');
}

/**
 * POST /api/users/google-auth/verify
 * Verify 6-digit code and enable Google Authenticator
 * @param code - 6-digit code from Google Authenticator app
 */
export async function verifyGoogleAuthApi(code: string): Promise<ApiResponse<GoogleAuthVerifyResponse>> {
  return await requestClient.post('/users/google-auth/verify', {
    code
  });
}

/**
 * POST /api/users/google-auth/disable
 * Disable Google Authenticator (requires password or backup code)
 * @param password - User's password (optional if backupCode provided)
 * @param backupCode - 8-digit backup code (optional if password provided)
 */
export async function disableGoogleAuthApi(params: {
  password?: string;
  backupCode?: string;
}): Promise<ApiResponse> {
  return await requestClient.post('/users/google-auth/disable', params);
}

/**
 * GET /api/users/google-auth/status
 * Get current Google Authenticator status
 */
export async function getGoogleAuthStatusApi(): Promise<ApiResponse<GoogleAuthStatus>> {
  return await requestClient.get('/users/google-auth/status');
}

/**
 * POST /api/users/google-auth/regenerate-backup-codes
 * Regenerate backup codes (requires password)
 * @param password - User's password for verification
 */
export async function regenerateBackupCodesApi(password: string): Promise<ApiResponse<GoogleAuthVerifyResponse>> {
  return await requestClient.post('/users/google-auth/regenerate-backup-codes', {
    password
  });
}












