import { requestClient } from '#/api/request';

export interface MerchantRtpVendorOption {
  id: string;
  label: string;
}

/** Enabled game platform row from GET /v1/operator/rtp-vendors */
export interface MerchantRtpPlatformRow {
  platformId: string;
  platformName: string;
  gameType: string;
  imageUrl: string | null;
  sortOrder: number;
  rtpIntegration: 'ag' | 'hg' | 'none';
  merchantRtpSupported: boolean;
  apiConfigured: boolean;
}

export interface MerchantRtpVendorsPayload {
  platforms: MerchantRtpPlatformRow[];
  vendors: MerchantRtpVendorOption[];
}

export async function getMerchantRtpVendorsApi(): Promise<MerchantRtpVendorsPayload> {
  const res = await requestClient.get<MerchantRtpVendorsPayload | MerchantRtpVendorOption[]>(
    '/v1/operator/rtp-vendors',
  );
  if (res && typeof res === 'object' && !Array.isArray(res) && Array.isArray((res as MerchantRtpVendorsPayload).vendors)) {
    return res as MerchantRtpVendorsPayload;
  }
  if (Array.isArray(res)) {
    return { platforms: [], vendors: res as MerchantRtpVendorOption[] };
  }
  return { platforms: [], vendors: [] };
}
