const SITE_SCOPE_KEY = 'site_scope';
export const SITE_SCOPE_CHANGED_EVENT = 'site-scope-changed';

/** Platform BO: selected site code, or `all` for unrestricted platform super-admin. */
export function getSiteScope(): string {
  if (typeof window === 'undefined') return 'all';
  const value = window.localStorage.getItem(SITE_SCOPE_KEY);
  return value && value.trim() ? value : 'all';
}

export function setSiteScope(value: string) {
  if (typeof window === 'undefined') return;
  const next = value || 'all';
  const previous = getSiteScope();
  window.localStorage.setItem(SITE_SCOPE_KEY, next);
  if (previous !== next) {
    window.dispatchEvent(
      new CustomEvent(SITE_SCOPE_CHANGED_EVENT, { detail: { value: next } }),
    );
  }
}

export function clearSiteScope() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(SITE_SCOPE_KEY);
}

/** Map header site picker to config API scope params. */
export function resolveConfigScopeParams(siteCode = getSiteScope()): {
  scope: string;
  scopeValue: string;
} {
  const code = (siteCode || 'all').trim();
  if (!code || code === 'all') {
    return { scope: 'global', scopeValue: 'default' };
  }
  return { scope: 'site', scopeValue: code };
}
