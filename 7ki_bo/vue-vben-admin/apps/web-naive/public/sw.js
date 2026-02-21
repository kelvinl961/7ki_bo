// Brand Logo Image Cache Service Worker - Fixed Version
const CACHE_NAME = 'brand-logo-images-v2';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Only handle brand logo images, not development URLs
  if (shouldCacheRequest(request)) {
    event.respondWith(handleImageRequest(request));
  }
});

// More specific check for brand logo images only
function shouldCacheRequest(request) {
  const url = new URL(request.url);
  
  // Skip development URLs and Vite URLs
  if (url.pathname.includes('@fs') || 
      url.pathname.includes('?import') || 
      url.pathname.includes('node_modules') ||
      url.pathname.includes('packages/icons')) {
    return false;
  }
  
  // Only cache actual uploaded brand logo images
  return (
    url.pathname.includes('/uploads/brand-logos/') ||
    url.pathname.includes('/uploads/images/') ||
    (url.pathname.includes('/uploads/') && 
     ['jpg', 'jpeg', 'png', 'gif', 'webp'].some(ext => url.pathname.includes(`.${ext}`)))
  );
}

// Fixed image request handler
async function handleImageRequest(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    // Check if cached response is still fresh
    const cachedTime = cachedResponse.headers.get('x-cached-time');
    if (cachedTime && Date.now() - Number.parseInt(cachedTime) < CACHE_DURATION) {
      console.log('Serving from cache:', request.url);
      return cachedResponse;
    }
  }

  try {
    // Fetch the image
    const response = await fetch(request);

    if (response.ok) {
      // Create a new response with custom headers (don't modify the original)
      const responseHeaders = new Headers(response.headers);
      responseHeaders.set('x-cached-time', Date.now().toString());
      responseHeaders.set('Cache-Control', 'max-age=31536000, immutable');
      
      const responseToCache = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders
      });
      
      // Cache the response (clone it first since we're returning it)
      await cache.put(request, responseToCache.clone());
      console.log('Cached image:', request.url);
      
      return responseToCache;
    }
  } catch (error) {
    console.error('Failed to fetch image:', request.url, error);
  }

  // Return cached response if available, even if stale
  if (cachedResponse) {
    console.log('Serving stale cache:', request.url);
    return cachedResponse;
  }

  // Let the browser handle the request normally
  return fetch(request);
}

// Simple cache management
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.delete(CACHE_NAME).then(() => {
        console.log('Cache cleared');
      })
    );
  }
}); 