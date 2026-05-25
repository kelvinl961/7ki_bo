import { requestClient } from '#/api/request';

export interface LoginDevice {
  ip: string;
  userAgent: string;
  browserName: string;
  browserVersion: string;
  operatingSystem: string;
  osVersion: string;
  platform: string;
  deviceBrand?: string | null;
  deviceModel?: string | null;
  firstSeen: string;
  lastSeen: string;
  loginCount: number;
}

export interface LoginDevicesResponse {
  list: LoginDevice[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface LoginLog {
  id: number;
  ip: string;
  userAgent: string;
  createdAt: string;
  /** When API extends login-log payload */
  acceptLanguage?: string | null;
  clientTimezone?: string | null;
  screenWidth?: number | null;
  screenHeight?: number | null;
  deviceBrand?: string | null;
  deviceModel?: string | null;
}

export interface LoginLogsResponse {
  list: LoginLog[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function getLoginDevices(userId: number, page = 1, pageSize = 20) {
  return requestClient.get<LoginDevicesResponse>(
    `/users/${userId}/login-devices`,
    {
      params: { page, pageSize },
    },
  );
}

export async function getLoginLogs(userId: number, page = 1, pageSize = 20) {
  return requestClient.get<LoginLogsResponse>(`/users/${userId}/login-logs`, {
    params: { page, pageSize },
  });
}
