const MERCHANT_SCOPE_KEY = 'merchant_scope';

export function getMerchantScope(): string {
  if (typeof window === 'undefined') return 'all';
  const value = window.localStorage.getItem(MERCHANT_SCOPE_KEY);
  return value && value.trim() ? value : 'all';
}

export function setMerchantScope(value: string) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(MERCHANT_SCOPE_KEY, value || 'all');
}

export function clearMerchantScope() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(MERCHANT_SCOPE_KEY);
}
