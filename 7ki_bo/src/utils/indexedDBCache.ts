/**
 * IndexedDB Cache Service for API Responses
 * 
 * Benefits:
 * - Store large API responses (user lists, reports, transaction history)
 * - Faster pagination (cache previous pages)
 * - Offline support
 * - Better performance for large datasets
 * - No localStorage size limits (5-10MB vs unlimited)
 */

interface CacheEntry<T = any> {
  key: string;
  data: T;
  timestamp: number;
  expiry: number;
  url: string;
  method: string;
}

const DB_NAME = 'api_cache_db';
const DB_VERSION = 1;
const STORE_NAME = 'api_responses';
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes default TTL

class IndexedDBCache {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  /**
   * Initialize IndexedDB
   */
  private async init(): Promise<void> {
    if (this.db) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'key' });
          // Create indexes for faster queries
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('expiry', 'expiry', { unique: false });
          store.createIndex('url', 'url', { unique: false });
        }
      };
    });

    return this.initPromise;
  }

  /**
   * Generate cache key from URL and params
   */
  private generateKey(url: string, method: string = 'GET', params?: any): string {
    const paramsStr = params ? JSON.stringify(params) : '';
    return `${method}:${url}:${paramsStr}`;
  }

  /**
   * Get cached response
   */
  async get<T>(url: string, method: string = 'GET', params?: any): Promise<T | null> {
    await this.init();
    if (!this.db) return null;

    const key = this.generateKey(url, method, params);

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(key);

      request.onsuccess = () => {
        const entry: CacheEntry<T> | undefined = request.result;
        
        if (!entry) {
          resolve(null);
          return;
        }

        // Check if expired
        if (Date.now() > entry.expiry) {
          // Delete expired entry
          this.delete(key);
          resolve(null);
          return;
        }

        resolve(entry.data);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * Set cached response
   */
  async set<T>(
    url: string,
    data: T,
    method: string = 'GET',
    params?: any,
    ttl: number = DEFAULT_TTL
  ): Promise<void> {
    await this.init();
    if (!this.db) return;

    const key = this.generateKey(url, method, params);
    const entry: CacheEntry<T> = {
      key,
      data,
      timestamp: Date.now(),
      expiry: Date.now() + ttl,
      url,
      method,
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(entry);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * Delete cached entry
   */
  async delete(key: string): Promise<void> {
    await this.init();
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(key);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * Clear all expired entries
   */
  async clearExpired(): Promise<number> {
    await this.init();
    if (!this.db) return 0;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('expiry');
      const range = IDBKeyRange.upperBound(Date.now());
      const request = index.openCursor(range);
      let deletedCount = 0;

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          cursor.delete();
          deletedCount++;
          cursor.continue();
        } else {
          resolve(deletedCount);
        }
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * Clear all cache
   */
  async clearAll(): Promise<void> {
    await this.init();
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * Get cache size (approximate)
   */
  async getSize(): Promise<number> {
    await this.init();
    if (!this.db) return 0;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.count();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }
}

// Export singleton instance
export const indexedDBCache = new IndexedDBCache();

// Auto-cleanup expired entries every 10 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    indexedDBCache.clearExpired().catch(() => {
      // Silently fail cleanup
    });
  }, 10 * 60 * 1000);
}






