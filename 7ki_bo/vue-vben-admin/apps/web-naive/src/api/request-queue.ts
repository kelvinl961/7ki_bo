/**
 * ✅ PERFORMANCE: Request Queue Manager
 * Prevents browser connection limit exhaustion
 *
 * Problem: Browser has 6 connections per domain (HTTP/1.1)
 * When 10+ API calls happen simultaneously, they queue for 5+ seconds
 *
 * Solution: Priority-based request queue with connection pooling
 */

interface QueuedRequest {
  id: string;
  priority: number; // Higher = more important
  execute: () => Promise<any>;
  resolve: (value: any) => void;
  reject: (error: any) => void;
  timestamp: number;
}

class RequestQueue {
  private activeRequests = 0;
  private maxConcurrent = 6; // Browser HTTP/1.1 limit
  private processing = false;
  private queue: QueuedRequest[] = [];

  /**
   * Clear queue
   */
  clear() {
    this.queue.forEach((req) => {
      req.reject(new Error('Request queue cleared'));
    });
    this.queue = [];
  }

  /**
   * Add request to queue
   */
  async enqueue<T>(
    execute: () => Promise<T>,
    priority: number = 0,
    id?: string,
  ): Promise<T> {
    const requestId = id || `req_${Date.now()}_${Math.random()}`;

    return new Promise<T>((resolve, reject) => {
      this.queue.push({
        id: requestId,
        priority,
        execute,
        resolve,
        reject,
        timestamp: Date.now(),
      });

      // Sort by priority (higher first), then by timestamp
      this.queue.sort((a, b) => {
        if (b.priority !== a.priority) {
          return b.priority - a.priority;
        }
        return a.timestamp - b.timestamp;
      });

      this.process();
    });
  }

  /**
   * Get queue status
   */
  getStatus() {
    return {
      queued: this.queue.length,
      active: this.activeRequests,
      maxConcurrent: this.maxConcurrent,
    };
  }

  /**
   * Process queue
   */
  private async process() {
    if (this.processing) return;
    this.processing = true;

    while (this.queue.length > 0 && this.activeRequests < this.maxConcurrent) {
      const request = this.queue.shift();
      if (!request) break;

      this.activeRequests++;

      // Execute request
      request
        .execute()
        .then((result) => {
          request.resolve(result);
        })
        .catch((error) => {
          request.reject(error);
        })
        .finally(() => {
          this.activeRequests--;
          // Continue processing
          if (this.queue.length > 0) {
            this.process();
          } else {
            this.processing = false;
          }
        });
    }

    if (this.queue.length === 0) {
      this.processing = false;
    }
  }
}

// Export singleton
export const requestQueue = new RequestQueue();

// Priority constants
export const REQUEST_PRIORITY = {
  CRITICAL: 100, // Auth, user data
  HIGH: 50, // Main page data
  NORMAL: 0, // Regular API calls
  LOW: -50, // Background updates, analytics
};
