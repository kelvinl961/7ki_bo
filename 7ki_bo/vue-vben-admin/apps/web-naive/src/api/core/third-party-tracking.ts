import { requestClient } from '#/api/request';

export type TrackingScope = 'app' | 'third_party_code' | 'web';
export type TrackingProvider = 'facebook_meta' | 'google' | 'gtm' | 'kwai' | 'tiktok';
export type TrackingType = 'browser' | 's2s_api';
export type CallbackMode = 'custom' | 'system';

export interface ThirdPartyTrackingMapping {
  eventKey: string;
  eventName: string;
  id?: number;
  isRequired?: boolean;
  sortOrder?: number;
  targetEventName: string;
}

export interface ThirdPartyTrackingConfig {
  accessToken?: null | string;
  apiKey?: null | string;
  callbackMode: CallbackMode;
  channelName: string;
  createdAt: string;
  createdBy?: null | number;
  customScript?: null | string;
  id: number;
  isEnabled: boolean;
  mappings: ThirdPartyTrackingMapping[];
  pixelId?: null | string;
  provider?: null | TrackingProvider;
  remark?: null | string;
  scope: TrackingScope;
  timezone: string;
  trackingType: TrackingType;
  updatedAt: string;
  updatedBy?: null | number;
}

export interface ThirdPartyTrackingProviderDefinition {
  availableEvents: string[];
  key: TrackingProvider;
  label: string;
  systemTemplate: Array<{
    eventKey: string;
    targetEventName: string;
  }>;
}

export interface ThirdPartyTrackingUpsertPayload {
  accessToken?: null | string;
  apiKey?: null | string;
  callbackMode: CallbackMode;
  channelName: string;
  customScript?: null | string;
  isEnabled: boolean;
  mappings?: ThirdPartyTrackingMapping[];
  pixelId?: null | string;
  provider?: null | TrackingProvider;
  remark?: null | string;
  scope: TrackingScope;
  timezone?: string;
  trackingType: TrackingType;
}

export interface ThirdPartyTrackingListParams {
  isEnabled?: boolean;
  keyword?: string;
  page?: number;
  pageSize?: number;
  provider?: TrackingProvider;
  scope?: TrackingScope;
}

export async function getThirdPartyTrackingProvidersApi() {
  return requestClient.get<{
    data: ThirdPartyTrackingProviderDefinition[];
    success: boolean;
  }>('/third-party-tracking/providers');
}

export async function getThirdPartyTrackingTemplateApi(provider?: TrackingProvider) {
  return requestClient.get<{
    data: {
      events: Array<{ eventKey: string; eventName: string; isRequired: boolean }>;
      mappings: ThirdPartyTrackingMapping[];
      provider?: string;
    };
    success: boolean;
  }>('/third-party-tracking/event-template', {
    params: provider ? { provider } : undefined,
  });
}

export async function getThirdPartyTrackingConfigsApi(
  params: ThirdPartyTrackingListParams,
) {
  return requestClient.get<{
    data: {
      list: ThirdPartyTrackingConfig[];
      pagination: {
        page: number;
        pageSize: number;
        total: number;
      };
    };
    success: boolean;
  }>('/third-party-tracking/configs', { params });
}

export async function getThirdPartyTrackingConfigDetailApi(id: number) {
  return requestClient.get<{
    data: ThirdPartyTrackingConfig;
    success: boolean;
  }>(`/third-party-tracking/configs/${id}`);
}

export async function createThirdPartyTrackingConfigApi(
  payload: ThirdPartyTrackingUpsertPayload,
) {
  return requestClient.post<{
    data: ThirdPartyTrackingConfig;
    message: string;
    success: boolean;
  }>('/third-party-tracking/configs', payload);
}

export async function updateThirdPartyTrackingConfigApi(
  id: number,
  payload: ThirdPartyTrackingUpsertPayload,
) {
  return requestClient.put<{
    data: ThirdPartyTrackingConfig;
    message: string;
    success: boolean;
  }>(`/third-party-tracking/configs/${id}`, payload);
}

export async function toggleThirdPartyTrackingStatusApi(
  id: number,
  isEnabled: boolean,
) {
  return requestClient.patch<{
    data: ThirdPartyTrackingConfig;
    message: string;
    success: boolean;
  }>(`/third-party-tracking/configs/${id}/status`, { isEnabled });
}

export async function deleteThirdPartyTrackingConfigApi(id: number) {
  return requestClient.delete<{
    message: string;
    success: boolean;
  }>(`/third-party-tracking/configs/${id}`);
}
