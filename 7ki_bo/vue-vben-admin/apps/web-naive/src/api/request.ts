/**
 * 该文件可自行根据业务逻辑进行调整
 */
import type { RequestClientOptions } from '@vben/request';

import { useAppConfig } from '@vben/hooks';
import { preferences } from '@vben/preferences';
import { authenticateResponseInterceptor, RequestClient } from '@vben/request';
import { resetAllStores, useAccessStore } from '@vben/stores';

import { message } from '#/adapter/naive';
import { getDeviceId } from '#/utils/deviceId';
import { indexedDBCache } from '#/utils/indexedDBCache';

import { refreshTokenApi } from './core';

// Get API URL from app config (uses VITE_GLOB_API_URL from .env files)
const { apiURL } = useAppConfig(import.meta.env, import.meta.env.PROD);

const HMAC_SECRET = import.meta.env.VITE_HMAC_SECRET as string | undefined;

function bytesToHex(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function hmacSha256Hex(secret: string, payload: string): Promise<string> {
  // WebCrypto HMAC-SHA256
  if (!globalThis.crypto?.subtle) {
    throw new Error('WebCrypto crypto.subtle is not available');
  }
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(payload));
  return bytesToHex(sig);
}

function shouldSignWithHmac(fullPath: string, method?: string): boolean {
  const m = (method || 'GET').toUpperCase();
  // Note: fullPath here should start with "/api"
  if (fullPath.startsWith('/api/admin/')) return true;

  if (fullPath.startsWith('/api/transactions/manual')) return true;
  if (fullPath.startsWith('/api/transactions/deposits')) return true;
  if (fullPath.startsWith('/api/transactions/withdrawals')) return true;

  // Selective signing for finance withdrawal force actions
  if (fullPath.startsWith('/api/wallet/finance-withdrawal') && m === 'POST') {
    return fullPath.includes('/force-cancel') || fullPath.includes('/force-reject');
  }

  return false;
}

function paramsToQueryString(params: any): string {
  if (!params || typeof params !== 'object') return '';

  const usp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      for (const v of value) usp.append(key, String(v));
    } else {
      usp.append(key, String(value));
    }
  }

  const qs = usp.toString();
  return qs ? `?${qs}` : '';
}

function createRequestClient(baseURL: string, options?: RequestClientOptions) {
  const client = new RequestClient({
    ...options,
    baseURL,
    withCredentials: true, // 🍪 CRITICAL: Always send cookies with requests for refresh token support
  });

  /**
   * 重新认证逻辑
   * When token refresh fails, properly logout the user
   */
  async function doReAuthenticate() {
    const accessStore = useAccessStore();

    // Clear the invalid token immediately to prevent refresh loops
    accessStore.setAccessToken(null);

    // 🔧 FIX: Try to call logout API using baseRequestClient (no interceptors)
    // But don't let it block or cause errors - we'll clear local state anyway
    baseRequestClient
      .post(
        '/auth/logout',
        {},
        {
          withCredentials: true,
        },
      )
      .catch(() => {
        // Ignore logout errors - we're already clearing local state
      });

    // Clear all stores immediately
    resetAllStores();
    accessStore.setLoginExpired(false);

    // 🔧 FIX: Use window.location to redirect (bypasses Vue router and prevents interceptor loops)
    const { LOGIN_PATH } = await import('@vben/constants');
    window.location.href = LOGIN_PATH;

    // Show notification to user (if still on page)
    message.warning('会话已过期，请重新登录', {
      duration: 3000,
    });
  }

  /**
   * 刷新token逻辑
   */
  async function doRefreshToken() {
    const accessStore = useAccessStore();
    try {
      const resp = await refreshTokenApi();
      // Backend returns { code: 0, data: token, status: 200 }
      // Axios wraps it as resp.data = { code: 0, data: token, status: 200 }
      const newToken = (resp as any)?.data?.data || (resp as any)?.data || resp;
      accessStore.setAccessToken(newToken);
      return newToken;
    } catch (error) {
      throw error;
    }
  }

  function formatToken(token: null | string) {
    // 🔧 FIX: Handle string "null" or "undefined" as actual null
    if (
      !token ||
      token === 'null' ||
      token === 'undefined' ||
      token.trim() === ''
    ) {
      return null;
    }
    return `Bearer ${token}`;
  }

  // 请求头处理
  client.addRequestInterceptor({
    fulfilled: async (config) => {
      const accessStore = useAccessStore();

      // Skip auth for domain management endpoints (public access)
      const isDomainManagement =
        config.url?.includes('/domain-management') ||
        config.url?.includes('/domains') ||
        config.url?.includes('/certificates');

      if (!isDomainManagement) {
        // Only send Authorization when we have a real token (from login).
        // Don't send a fake dev token when no token - it causes 401 → redirect loop on backoffice load.
        const token = accessStore.accessToken;
        config.headers.Authorization = token ? formatToken(token) : null;
      }

      config.headers['Accept-Language'] = preferences.app.locale;

      // 📱 Add device-id header for device tracking
      config.headers['device-id'] = getDeviceId();

      // HMAC signing for protected finance/admin endpoints
      try {
        const method = (config.method || 'GET').toUpperCase();

        // Normalize api base path to "/api" form (no scheme/host)
        const apiPath = baseURL.replace(/^https?:\/\/[^/]+/, '');
        const apiRoot = apiPath.replace(/\/$/, '');
        const reqPath = config.url?.startsWith('/') ? config.url : `/${config.url || ''}`;
        const queryString = paramsToQueryString((config as any).params);
        const fullPath = `${apiRoot}${reqPath}${queryString}`;

        if (HMAC_SECRET && shouldSignWithHmac(fullPath, method)) {
          const timestamp = Date.now().toString();
          const bodyRaw = (config as any).data ?? (config as any).body ?? {};
          const bodyObj = bodyRaw === null || bodyRaw === undefined ? {} : bodyRaw;
          const bodyString = JSON.stringify(bodyObj);

          // IMPORTANT: match backend middleware: method + url + timestamp + JSON.stringify(body)
          const payloadToSign = method + fullPath + timestamp + bodyString;
          const signature = await hmacSha256Hex(HMAC_SECRET, payloadToSign);

          config.headers['x-signature'] = signature;
          config.headers['x-timestamp'] = timestamp;
        } else if (shouldSignWithHmac(fullPath, method) && !HMAC_SECRET) {
          console.warn('HMAC signing skipped: VITE_HMAC_SECRET missing');
        }
      } catch (e) {
        console.error('HMAC signing failed, request will likely be rejected:', e);
      }

      // ✅ IndexedDB Cache: Store cache check in config for response interceptor
      if (
        config.method?.toUpperCase() === 'GET' &&
        !config.params?.forceRefresh
      ) {
        (config as any).__checkCache = true;
      }

      return config;
    },
  });

  // 处理返回的响应数据格式
  // ✅ FIX: Removed excessive console.log statements that slow down every request
  client.addResponseInterceptor({
    fulfilled: async (response) => {
      const data = response.data;
      const config =
        (response as any).config || (response as any).request?.config;

      // ✅ IndexedDB Cache: Cache successful GET responses
      if (
        config?.__checkCache &&
        config?.method?.toUpperCase() === 'GET' &&
        data
      ) {
        // Determine TTL based on endpoint type
        let ttl = 5 * 60 * 1000; // Default 5 minutes

        const url = config.url || '';
        if (url.includes('/users/') && !url.includes('/users/list')) {
          ttl = 2 * 60 * 1000; // User details: 2 minutes
        } else if (
          url.includes('/reports/') ||
          url.includes('/statistics/') ||
          url.includes('/operations-statistics/')
        ) {
          ttl = 10 * 60 * 1000; // Reports: 10 minutes
        } else if (url.includes('/list') || url.includes('/search')) {
          ttl = 3 * 60 * 1000; // Lists: 3 minutes
        }

        // Cache in background (don't block response)
        indexedDBCache
          .set(url, data, config.method || 'GET', config.params, ttl)
          .catch(() => {
            // Silently fail caching
          });
      }

      // Handle different response formats:
      // 1. Auth endpoints: {code: 0, data: ...}
      // 2. Other endpoints: {success: true, data: ...}
      // 3. PMD endpoints: {data: [...], total: number, page: number, pageSize: number}
      // 4. Direct object responses (like PMD create/update)

      if (data && typeof data === 'object') {
        // Format 1: {code: 0, data: ...}
        if (data.code === 0) {
          // Special handling for RTP APIs which need the full response with code field
          if (data.data && (data.data.AppId || data.data.PidList)) {
            return data; // Return the whole response including code field
          }
          // Special handling for RTP history API which includes pagination
          if (data.data && Array.isArray(data.data) && data.pagination) {
            return data; // Return the whole response including pagination
          }
          // Merchant/sub-merchant RTP set API: backend returns { code: 0, data: { message, changedRtpValue, configuration } }
          // Component checks response.code === 0, so return full response to preserve code
          if (
            data.data &&
            typeof data.data === 'object' &&
            data.data.changedRtpValue !== undefined &&
            data.data.message
          ) {
            return data;
          }
          return data.data;
        }

        // Format 2: {success: true, data: ...}
        if (data.success === true) {
          return data; // Return the whole response including success flag
        }

        // Format 3: {data: [...], total: number, page: number, pageSize: number}
        if (data.data && typeof data.total === 'number') {
          return data; // Return the whole object including pagination
        }

        // Format 4: Activities API format {list: [...], pagination: {...}, summary: {...}}
        if (data.list && data.pagination && data.summary) {
          return data; // Return the whole object including pagination
        }

        // Format 4b: Bet Transactions API format {list: [...], pagination: {...}, pageTotals: {...}, overallTotals: {...}}
        if (
          data.list &&
          data.pagination &&
          (data.pageTotals || data.overallTotals)
        ) {
          return data; // Return the whole object including pagination
        }

        // Format 5: Direct object responses (like PMD create/update)
        // Check if it's a direct object response (has id, content, etc.)
        if (data.id !== undefined || data.content !== undefined) {
          return data; // Return the object as is
        }

        // Handle error responses - only reject if explicitly marked as error
        if (data.success === false) {
          throw new Error(data.message || 'Request failed');
        }
      }

      // Default: return as is
      return data;
    },
    rejected: (error) => {
      // Don't treat 201 Created as an error
      if (error?.response?.status === 201) {
        return error.response.data;
      }
      return Promise.reject(error);
    },
  });

  // token过期的处理 - RE-ENABLED TO FIX 401 ISSUES
  client.addResponseInterceptor(
    authenticateResponseInterceptor({
      client,
      doReAuthenticate,
      doRefreshToken,
      enableRefreshToken: preferences.app.enableRefreshToken,
      formatToken,
    }),
  );

  // 通用的错误处理 - TEMPORARILY DISABLED FOR DEBUGGING
  /*
  client.addResponseInterceptor(
    errorMessageResponseInterceptor((msg: string, error) => {
      // 这里可以根据业务进行定制,你可以拿到 error 内的信息进行定制化处理，根据不同的 code 做不同的提示，而不是直接使用 message.error 提示 msg
      // 当前mock接口返回的错误字段是 error 或者 message
      const responseData = error?.response?.data ?? {};
      const errorMessage = responseData?.error ?? responseData?.message ?? '';
      // 如果没有错误信息，则会根据状态码进行提示
      message.error(errorMessage || msg);
    }),
  );
  */

  return client;
}

export const requestClient = createRequestClient(apiURL, {
  // responseReturn: 'data', // DISABLED - Using custom response interceptor instead
  timeout: 600_000, // 10 minutes for large file imports
});

export const baseRequestClient = new RequestClient({
  baseURL: apiURL,
  withCredentials: true, // 🍪 CRITICAL: Send cookies for logout/refresh operations
});
