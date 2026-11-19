/**
 * BO Google Authenticator (TOTP) — /api/auth/admin/totp/*
 * Spec: 7ki_api Docs/specs/bo-totp.md
 */
import { requestClient } from '#/api/request';

export interface BoTotpSetup {
  secret: string;
  qrCodeUrl: string;
  qrCodeDataUrl: string;
  username?: string;
}

export interface BoTotpStatus {
  totpEnabled: boolean;
  totpEnabledAt?: null | string;
  totpRequired: boolean;
  enrollOnly?: boolean;
  moneyRequiresTotp?: boolean;
  sponsorRequiredForEnable?: boolean;
  enrolledAdminCount?: number;
}

export interface BoTotpEnableResult {
  totpEnabled: boolean;
  backupCodes: string[];
  note?: string;
}

export async function boTotpSetupApi() {
  return requestClient.get<BoTotpSetup>('/auth/admin/totp/setup');
}

export async function boTotpEnableApi(params: {
  sponsorAdminId?: number;
  sponsorTotpCode?: string;
  totpCode: string;
}) {
  return requestClient.post<BoTotpEnableResult>('/auth/admin/totp/enable', params);
}

export async function boTotpStatusApi() {
  return requestClient.get<BoTotpStatus>('/auth/admin/totp/status');
}

export async function boTotpDisableApi(params: {
  targetAdminId?: number;
  totpCode: string;
}) {
  return requestClient.post('/auth/admin/totp/disable', params);
}
