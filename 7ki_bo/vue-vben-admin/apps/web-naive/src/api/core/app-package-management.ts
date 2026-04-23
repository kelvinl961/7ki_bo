import { requestClient } from '#/api/request';

export type BuildStatus = 'failed' | 'packing' | 'success';
export type SystemType = 'android' | 'ios';
export type AppType = 'native' | 'pwa' | 'rapid' | 'shortcut';
export type NativePackageType = 'aab' | 'apk';

export interface AppPackagePublicConfig {
  completeResourceEnabled: boolean;
  id: number;
  liteResourceEnabled: boolean;
  nativeAndroidEnabled: boolean;
  nativeIosEnabled: boolean;
  note: null | string;
  rapidAndroidEnabled: boolean;
  rapidIosEnabled: boolean;
}

export interface AppBuildPackageItem {
  appName: string;
  appType: AppType;
  applicationUrl: null | string;
  brandSettingId: null | number;
  buildMessage: null | string;
  certificateFingerprint: null | string;
  createdAt: string;
  forceReinstallBelowVersion: null | string;
  iconUrl: null | string;
  id: number;
  operatedAt: null | string;
  operator: null | string;
  packageName: string;
  status: BuildStatus;
  systemType: SystemType;
  version: string;
}

export interface NativeVestPackageItem {
  appName: null | string;
  applicationUrl: null | string;
  appsflyerDevKey: null | string;
  brandSettingId: null | number;
  channelId: string;
  channelName: string;
  createdAt: string;
  iconUrl: null | string;
  id: number;
  operatedAt: null | string;
  operator: null | string;
  packageName: string;
  packageType: NativePackageType;
  status: BuildStatus;
  version: string;
}

export interface PaginationData<T> {
  list: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface AppPackageFormOptions {
  appTypes: Array<{ label: string; value: AppType }>;
  brands: Array<{ iconUrl: null | string; id: number; name: string }>;
  packageTypes: Array<{ label: string; value: NativePackageType }>;
}

export async function getAppPackagePublicConfigApi() {
  return requestClient.get<{ data: AppPackagePublicConfig; success: boolean }>(
    '/app-package-management/public-config',
  );
}

export async function updateAppPackagePublicConfigApi(payload: Omit<AppPackagePublicConfig, 'id'>) {
  return requestClient.put('/app-package-management/public-config', payload);
}

export async function getAppBuildPackagesApi(params: {
  keyword?: string;
  page: number;
  pageSize: number;
  status?: BuildStatus;
  systemType?: SystemType;
}) {
  return requestClient.get<{ data: PaginationData<AppBuildPackageItem>; success: boolean }>(
    '/app-package-management/build-packages',
    { params },
  );
}

export async function generateAppBuildPackageApi(payload: {
  appTypes: AppType[];
  forceReinstallBelowVersion?: null | string;
  systemType: SystemType;
}) {
  return requestClient.post('/app-package-management/build-packages/generate', payload);
}

export async function updateAppBuildStatusApi(id: number, status: BuildStatus) {
  return requestClient.patch(`/app-package-management/build-packages/${id}/status`, { status });
}

export async function getSigningConfigApi() {
  return requestClient.get<{ data: any; success: boolean }>('/app-package-management/signing-config');
}

export async function updateSigningConfigApi(payload: {
  androidAlias?: null | string;
  androidKeyPassword?: null | string;
  androidKeystorePassword?: null | string;
}) {
  return requestClient.put('/app-package-management/signing-config', payload);
}

export async function getNativeVestPackagesApi(params: {
  keyword?: string;
  packageType?: NativePackageType;
  page: number;
  pageSize: number;
  status?: BuildStatus;
}) {
  return requestClient.get<{ data: PaginationData<NativeVestPackageItem>; success: boolean }>(
    '/app-package-management/native-packages',
    { params },
  );
}

export async function createNativeVestPackageApi(payload: {
  appName?: null | string;
  applicationUrl?: null | string;
  appsflyerDevKey?: null | string;
  brandSettingId?: null | number;
  channelId: string;
  channelName: string;
  packageName: string;
  packageType: NativePackageType;
  version: string;
}) {
  return requestClient.post('/app-package-management/native-packages', payload);
}

export async function updateNativeVestPackageStatusApi(id: number, status: BuildStatus) {
  return requestClient.patch(`/app-package-management/native-packages/${id}/status`, { status });
}

export async function getAppPackageFormOptionsApi() {
  return requestClient.get<{ data: AppPackageFormOptions; success: boolean }>(
    '/app-package-management/form-options',
  );
}
