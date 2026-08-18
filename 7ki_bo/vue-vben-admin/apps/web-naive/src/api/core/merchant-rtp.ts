import { requestClient } from '#/api/request';

export interface MerchantRtpVendorOption {
  id: string;
  label: string;
  templateKey?: 'AG' | 'HG';
  /** false = show in UI but disabled (API not configured) */
  available?: boolean;
  reason?: string | null;
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

export interface MerchantRtpVendorTemplateField {
  key: string;
  required: boolean;
  description: string;
}

export interface MerchantRtpVendorTemplate {
  vendorId: 'AG' | 'HG';
  setRtpPath: string;
  notes: string;
  fields: MerchantRtpVendorTemplateField[];
}

export interface MerchantRtpVendorsPayload {
  platforms: MerchantRtpPlatformRow[];
  vendors: MerchantRtpVendorOption[];
  /** Field contracts for AG and HG */
  templates?: Partial<Record<'AG' | 'HG', MerchantRtpVendorTemplate>>;
}

export async function getMerchantRtpVendorsApi(): Promise<MerchantRtpVendorsPayload> {
  const res = await requestClient.get<MerchantRtpVendorsPayload | MerchantRtpVendorOption[]>(
    '/v1/operator/rtp-vendors',
  );
  if (res && typeof res === 'object' && !Array.isArray(res) && Array.isArray((res as MerchantRtpVendorsPayload).vendors)) {
    const payload = res as MerchantRtpVendorsPayload;
    return {
      platforms: payload.platforms ?? [],
      vendors: payload.vendors ?? [],
      templates: payload.templates ?? {},
    };
  }
  if (Array.isArray(res)) {
    return { platforms: [], vendors: res as MerchantRtpVendorOption[], templates: {} };
  }
  return { platforms: [], vendors: [], templates: {} };
}

