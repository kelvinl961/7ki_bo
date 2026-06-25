/**
 * Live 7ki client iframe preview (multi-tenant domain layout).
 *
 * Typical tenant layout (277br example):
 *   Client app  → https://277br.com
 *   Backoffice  → https://277br.118br.com
 *   API         → https://277br.pangu6688.com/api/
 *
 * Preview base URL resolution (first match wins):
 * 1. `VITE_GLOB_CLIENT_PREVIEW_URL` — explicit override
 * 2. Tenant pattern from API or backoffice host:
 *    `277br.pangu6688.com` or `277br.118br.com` → `https://277br.com`
 *    (suffix configurable via `VITE_GLOB_CLIENT_PREVIEW_DOMAIN_SUFFIX`, default `.com`)
 * 3. API origin with `/api` stripped (same-host deployments only)
 * 4. `window.location.origin`
 *
 * Client: `?preview=1&template=` overrides API skinTemplate (no build flag required).
 */

import {
  resolveComprehensiveHomeTemplateId,
} from '#/constants/comprehensiveHomeTemplates';

export const CLIENT_PREVIEW_READY_MESSAGE = '7ki-admin-preview-ready';

/** Parent → iframe live color sync (no reload). */
export const CLIENT_PREVIEW_COLORS_MESSAGE = '7ki-admin-preview-colors';

/**
 * Shared / test API host → client lobby origin.
 * test-api.pangu6688.com does not follow `{tenant}.pangu6688.com` → `{tenant}.com`.
 */
const KNOWN_API_HOST_TO_CLIENT_ORIGIN: Record<string, string> = {
  'test-api.pangu6688.com': 'https://cheshi8899.com',
};

const DEV_CLIENT_PREVIEW_ORIGIN_STORAGE_KEY = '7ki_dev_client_preview_origin';

export type DevClientPreviewOriginOption = {
  id: 'local' | 'staging';
  label: string;
  url: string;
};

/** Dev-only: quick switch between local Vite and staging client. */
export function getDevClientPreviewOriginOptions(): DevClientPreviewOriginOption[] {
  const local =
    deriveLocalDevClientPreviewOrigin() || 'http://localhost:5173';
  const staging =
    deriveClientPreviewFromKnownApiHost(readConfiguredApiUrl()) ||
    'https://cheshi8899.com';
  return [
    { id: 'local', label: 'localhost', url: local },
    { id: 'staging', label: 'cheshi8899.com', url: staging },
  ];
}

export function getDevClientPreviewOriginOverride(): string {
  if (!import.meta.env.DEV || typeof window === 'undefined') return '';
  try {
    const stored = localStorage
      .getItem(DEV_CLIENT_PREVIEW_ORIGIN_STORAGE_KEY)
      ?.trim();
    if (!stored) return '';
    const allowed = getDevClientPreviewOriginOptions().map((o) => o.url);
    return allowed.includes(stored.replace(/\/+$/, ''))
      ? stored.replace(/\/+$/, '')
      : '';
  } catch {
    return '';
  }
}

export function setDevClientPreviewOriginOverride(origin: string): void {
  if (!import.meta.env.DEV || typeof window === 'undefined') return;
  const normalized = origin.trim().replace(/\/+$/, '');
  if (!normalized) return;
  try {
    localStorage.setItem(DEV_CLIENT_PREVIEW_ORIGIN_STORAGE_KEY, normalized);
  } catch {
    /* noop */
  }
}

export function clearDevClientPreviewOriginOverride(): void {
  if (!import.meta.env.DEV || typeof window === 'undefined') return;
  try {
    localStorage.removeItem(DEV_CLIENT_PREVIEW_ORIGIN_STORAGE_KEY);
  } catch {
    /* noop */
  }
}

export type ClientPreviewParams = {
  skinTemplate: string;
  brandCode?: string;
  primaryColor?: string;
  accentColor?: string;
  buttonColor?: string;
  textPrimary?: string;
  textSecondary?: string;
  textAccent?: string;
};

/** Resolve client origin from known API host map (test/staging). */
export function deriveClientPreviewFromKnownApiHost(apiUrl: string): string {
  const trimmed = apiUrl.trim();
  if (!trimmed || trimmed.startsWith('/')) return '';
  try {
    const host = new URL(trimmed).hostname.toLowerCase();
    return KNOWN_API_HOST_TO_CLIENT_ORIGIN[host] || '';
  } catch {
    return '';
  }
}

function readConfiguredApiUrl(): string {
  const fromEnv = (import.meta.env.VITE_GLOB_API_URL as string | undefined)?.trim();
  if (fromEnv) return fromEnv;

  if (typeof window !== 'undefined') {
    const runtime = window._VBEN_ADMIN_PRO_APP_CONF_?.VITE_GLOB_API_URL?.trim();
    if (runtime) return runtime;
  }

  return '';
}

function readClientDomainSuffix(): string {
  const raw = (
    import.meta.env.VITE_GLOB_CLIENT_PREVIEW_DOMAIN_SUFFIX as string | undefined
  )?.trim();
  if (!raw) return '.com';
  return raw.startsWith('.') ? raw : `.${raw}`;
}

/**
 * Extract tenant slug from known hosts.
 * - 277br.pangu6688.com → 277br
 * - 277br.118br.com → 277br
 * - 277br.com → 277br
 */
export function extractTenantSlugFromHost(hostname: string): string | null {
  const host = hostname.trim().toLowerCase();
  if (!host) return null;

  if (host.endsWith('.pangu6688.com')) {
    const slug = host.replace(/\.pangu6688\.com$/i, '').split('.')[0];
    return slug || null;
  }

  if (host.endsWith('.118br.com')) {
    const slug = host.replace(/\.118br\.com$/i, '').split('.')[0];
    return slug || null;
  }

  const parts = host.split('.');
  if (parts.length === 2 && parts[0]) {
    return parts[0];
  }

  return null;
}

/** Build client lobby origin from tenant slug, e.g. 277br → https://277br.com */
export function buildClientPreviewOriginFromTenantSlug(slug: string): string {
  const tenant = slug.trim();
  if (!tenant) return '';
  const suffix = readClientDomainSuffix();
  return `https://${tenant}${suffix}`;
}

/** Map API/backoffice host to client app origin. */
export function deriveClientPreviewOriginFromTenantPattern(
  apiUrl?: string,
  browserHostname?: string,
): string {
  const candidates: string[] = [];

  const resolvedApiUrl = (apiUrl ?? readConfiguredApiUrl()).trim();
  if (resolvedApiUrl && !resolvedApiUrl.startsWith('/')) {
    try {
      candidates.push(new URL(resolvedApiUrl).hostname);
    } catch {
      /* noop */
    }
  }

  if (browserHostname?.trim()) {
    candidates.push(browserHostname.trim());
  } else if (typeof window !== 'undefined') {
    candidates.push(window.location.hostname);
  }

  for (const host of candidates) {
    const slug = extractTenantSlugFromHost(host);
    if (slug) {
      const origin = buildClientPreviewOriginFromTenantSlug(slug);
      if (origin) return origin;
    }
  }

  return '';
}

/** Strip `/api` suffix and return site origin (same-host deployments). */
export function deriveClientPreviewOriginFromApiUrl(apiUrl: string): string {
  const trimmed = apiUrl.trim();
  if (!trimmed) return '';

  if (trimmed.startsWith('/')) {
    return '';
  }

  try {
    const url = new URL(trimmed);
    url.pathname = url.pathname
      .replace(/\/api\/?$/i, '')
      .replace(/\/+$/, '');
    return url.origin;
  } catch {
    return '';
  }
}

/** Local dev: backoffice localhost:5888 → client vite localhost:5173 */
function deriveLocalDevClientPreviewOrigin(): string {
  if (!import.meta.env.DEV || typeof window === 'undefined') return '';

  const explicit = (
    import.meta.env.VITE_GLOB_CLIENT_PREVIEW_URL as string | undefined
  )?.trim();
  if (explicit) return explicit.replace(/\/+$/, '');

  const { hostname } = window.location;
  if (hostname !== 'localhost' && hostname !== '127.0.0.1') return '';

  const clientPort = (
    import.meta.env.VITE_GLOB_CLIENT_PREVIEW_DEV_PORT as string | undefined
  )?.trim() || '5173';

  return `http://${hostname}:${clientPort}`;
}

/** Base URL of deployed 7ki client (no trailing slash). */
export function getClientPreviewBaseUrl(): string {
  if (import.meta.env.DEV) {
    const devOverride = getDevClientPreviewOriginOverride();
    if (devOverride) return devOverride;
  }

  const fromLocalDev = deriveLocalDevClientPreviewOrigin();
  if (fromLocalDev) return fromLocalDev;

  const explicit = (
    import.meta.env.VITE_GLOB_CLIENT_PREVIEW_URL as string | undefined
  )?.trim();
  if (explicit) return explicit.replace(/\/+$/, '');

  const fromKnownApi = deriveClientPreviewFromKnownApiHost(readConfiguredApiUrl());
  if (fromKnownApi) return fromKnownApi;

  const fromTenant = deriveClientPreviewOriginFromTenantPattern();
  if (fromTenant) return fromTenant;

  const fromApi = deriveClientPreviewOriginFromApiUrl(readConfiguredApiUrl());
  if (fromApi) return fromApi;

  if (typeof window !== 'undefined') {
    return window.location.origin.replace(/\/+$/, '');
  }

  return '';
}

export function isClientLivePreviewEnabled(): boolean {
  return getClientPreviewBaseUrl().length > 0;
}

/** Human-readable preview host for UI hints. */
export function getClientPreviewHostLabel(): string {
  const base = getClientPreviewBaseUrl();
  if (!base) return '';
  try {
    return new URL(base).host;
  } catch {
    return base;
  }
}

/** Full lobby URL for iframe `src`. */
export function buildClientPreviewUrl(
  params: ClientPreviewParams,
  cacheBust?: number,
): string {
  const base = getClientPreviewBaseUrl();
  if (!base) return '';

  const q = new URLSearchParams();
  q.set('preview', '1');
  q.set(
    'template',
    resolveComprehensiveHomeTemplateId(params.skinTemplate || 'comprehensive_v1'),
  );

  const brandCode = params.brandCode?.trim();
  if (brandCode) q.set('brandCode', brandCode);

  const colorKeys: (keyof ClientPreviewParams)[] = [
    'primaryColor',
    'accentColor',
    'buttonColor',
    'textPrimary',
    'textSecondary',
    'textAccent',
  ];
  for (const key of colorKeys) {
    const value = params[key]?.trim();
    if (value) q.set(key, value);
  }

  q.set('_t', String(cacheBust ?? Date.now()));

  return `${base}/?${q.toString()}`;
}
