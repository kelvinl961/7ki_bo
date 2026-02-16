/**
 * ✅ PERFORMANCE: Shared Game Platform Cache
 * Prevents duplicate API calls and reduces queueing delays
 * 
 * Problem: Multiple components call getGamePlatformListApi simultaneously
 * Solution: Single source of truth with caching and request deduplication
 */

import { ref, computed } from 'vue';
import type { GamePlatformItem, GamePlatformListResponse } from '#/api/game/platform';
import { getGamePlatformListApi } from '#/api/game/platform';

interface GamePlatformCache {
  data: GamePlatformItem[];
  timestamp: number;
  loading: boolean;
  promise: Promise<GamePlatformListResponse> | null;
}

// Shared cache state
const cache = ref<GamePlatformCache>({
  data: [],
  timestamp: 0,
  loading: false,
  promise: null,
});

// Cache TTL: 5 minutes
const CACHE_TTL = 5 * 60 * 1000;

/**
 * Check if cache is valid
 */
const isCacheValid = (): boolean => {
  if (cache.value.data.length === 0) return false;
  const age = Date.now() - cache.value.timestamp;
  return age < CACHE_TTL;
};

/**
 * Get game platforms with caching and request deduplication
 */
export function useGamePlatformCache() {
  /**
   * Load game platforms (with deduplication)
   */
  const loadGamePlatforms = async (
    params: { pageSize?: number; isEnabled?: boolean; search?: string } = {},
    forceRefresh = false
  ): Promise<GamePlatformListResponse> => {
    // Return cached data if valid and not forcing refresh
    if (!forceRefresh && isCacheValid()) {
      return {
        list: cache.value.data,
        pagination: {
          total: cache.value.data.length,
          page: 1,
          pageSize: cache.value.data.length,
        },
      };
    }

    // If already loading, return the existing promise (deduplication)
    if (cache.value.loading && cache.value.promise) {
      return cache.value.promise;
    }

    // Start new request
    cache.value.loading = true;
    const requestPromise = getGamePlatformListApi({
      pageSize: params.pageSize || 1000,
      isEnabled: params.isEnabled,
      search: params.search,
    })
      .then((response) => {
        // Update cache
        cache.value.data = response.list || [];
        cache.value.timestamp = Date.now();
        cache.value.loading = false;
        cache.value.promise = null;
        return response;
      })
      .catch((error) => {
        cache.value.loading = false;
        cache.value.promise = null;
        throw error;
      });

    cache.value.promise = requestPromise;
    return requestPromise;
  };

  /**
   * Get cached platforms (synchronous, returns immediately)
   */
  const getCachedPlatforms = (): GamePlatformItem[] => {
    return cache.value.data;
  };

  /**
   * Clear cache
   */
  const clearCache = () => {
    cache.value.data = [];
    cache.value.timestamp = 0;
    cache.value.promise = null;
  };

  /**
   * Check if data is loading
   */
  const isLoading = computed(() => cache.value.loading);

  /**
   * Check if cache has data
   */
  const hasData = computed(() => cache.value.data.length > 0);

  return {
    loadGamePlatforms,
    getCachedPlatforms,
    clearCache,
    isLoading,
    hasData,
  };
}
