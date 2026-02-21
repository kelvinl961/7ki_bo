/**
 * API Cache Helper
 * Provides helper functions to check and use IndexedDB cache before making API calls
 *
 * Benefits:
 * - Faster page loads (instant cache hits)
 * - Reduced server load
 * - Better UX (no loading spinners for cached data)
 * - Offline support (for cached data)
 */

import { indexedDBCache } from './indexedDBCache';

/**
 * Check if cached data exists and is still valid
 */
export async function getCachedResponse<T>(
  url: string,
  method: string = 'GET',
  params?: any,
): Promise<null | T> {
  try {
    return await indexedDBCache.get<T>(url, method, params);
  } catch {
    return null;
  }
}

/**
 * Cache API response
 */
export async function cacheResponse<T>(
  url: string,
  data: T,
  method: string = 'GET',
  params?: any,
  ttl?: number,
): Promise<void> {
  try {
    await indexedDBCache.set(url, data, method, params, ttl);
  } catch {
    // Silently fail
  }
}

/**
 * Wrapper for API calls that checks cache first
 * Usage: const data = await cachedApiCall(() => requestClient.get('/users'), '/users');
 */
export async function cachedApiCall<T>(
  apiCall: () => Promise<T>,
  url: string,
  method: string = 'GET',
  params?: any,
  options?: {
    forceRefresh?: boolean;
    ttl?: number;
    useCache?: boolean;
  },
): Promise<T> {
  const { useCache = true, ttl, forceRefresh = false } = options || {};

  // Check cache first (if enabled and not forcing refresh)
  if (useCache && !forceRefresh) {
    const cached = await getCachedResponse<T>(url, method, params);
    if (cached !== null) {
      return cached;
    }
  }

  // Make API call
  const data = await apiCall();

  // Cache the response (if enabled)
  if (useCache && data) {
    await cacheResponse(url, data, method, params, ttl);
  }

  return data;
}

/**
 * Clear cache for specific URL pattern
 */
export async function clearCachePattern(pattern: string): Promise<void> {
  // This would require iterating through all cache entries
  // For now, just clear all cache (can be optimized later)
  try {
    await indexedDBCache.clearAll();
  } catch {
    // Silently fail
  }
}

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<{
  entryCount: number;
}> {
  try {
    const entryCount = await indexedDBCache.getSize();
    return { entryCount };
  } catch {
    return { entryCount: 0 };
  }
}
