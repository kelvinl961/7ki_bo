const SITE_SCOPE_KEY = 'site_scope';

/** Platform BO: selected site code, or `all` for unrestricted platform super-admin. */
export function getSiteScope(): string {
  if (typeof window === 'undefined') return 'all';
  const value = window.localStorage.getItem(SITE_SCOPE_KEY);
  return value && value.trim() ? value : 'all';
}

export function setSiteScope(value: string) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(SITE_SCOPE_KEY, value || 'all');
}

export function clearSiteScope() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(SITE_SCOPE_KEY);
}
