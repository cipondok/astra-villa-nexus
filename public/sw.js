/**
 * ASTRA Villa PWA Service Worker v3.0
 * Comprehensive offline-first caching with background sync
 */

const CACHE_VERSION = 'v3.0.0';
const STATIC_CACHE = `astra-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `astra-dynamic-${CACHE_VERSION}`;
const IMAGE_CACHE = `astra-images-${CACHE_VERSION}`;
const API_CACHE = `astra-api-${CACHE_VERSION}`;
const PROPERTY_CACHE = `astra-properties-${CACHE_VERSION}`;

// Cache size limits
const CACHE_LIMITS = {
  static: 30,
  dynamic: 50,
  images: 100,
  api: 30,
  properties: 50
};

// Cache durations (in milliseconds)
const CACHE_DURATION = {
  api: 5 * 60 * 1000,        // 5 minutes
  properties: 30 * 60 * 1000, // 30 minutes
  images: 7 * 24 * 60 * 60 * 1000, // 7 days
  profile: 60 * 60 * 1000     // 1 hour
};

// Static assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// API patterns for caching
const CACHEABLE_API_PATTERNS = [
  { pattern: /\/rest\/v1\/properties/, cache: PROPERTY_CACHE, duration: CACHE_DURATION.properties },
  { pattern: /\/rest\/v1\/profiles/, cache: API_CACHE, duration: CACHE_DURATION.profile },
  { pattern: /\/rest\/v1\/favorites/, cache: API_CACHE, duration: CACHE_DURATION.api },
  { pattern: /\/rest\/v1\/saved_searches/, cache: API_CACHE, duration: CACHE_DURATION.api },
  { pattern: /\/rest\/v1\/property_images/, cache: IMAGE_CACHE, duration: CACHE_DURATION.images }
];

// Background sync tags
const SYNC_TAGS = {
  FAVORITES: 'sync-favorites',
  SEARCHES: 'sync-saved-searches',
  MESSAGES: 'sync-messages',
  FORMS: 'sync-forms',
  INQUIRIES: 'sync-inquiries'
};

// IndexedDB configuration
const DB_NAME = 'astra-sync-queue';
const DB_VERSION = 2;
const SYNC_STORE = 'pending-requests';

// Supabase configuration
const SUPABASE_URL = 'https://zymrajuuyyfkzdmptebl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5bXJhanV1eXlma3pkbXB0ZWJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxNDM5NjksImV4cCI6MjA2NDcxOTk2OX0.jcdUvzLIWj7b0ay5UvuzJ7RVsAzkSWQQ_-o83kNaYYk';

// ============================================
// INSTALL EVENT
// ============================================
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker v3.0...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Static assets cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Failed to cache static assets:', error);
      })
  );
});

// ============================================
// ACTIVATE EVENT
// ============================================
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker v3.0...');
  
  event.waitUntil(
    Promise.all([
      // Clean old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName.startsWith('astra-') && 
                     ![STATIC_CACHE, DYNAMIC_CACHE, IMAGE_CACHE, API_CACHE, PROPERTY_CACHE].includes(cacheName);
            })
            .map((cacheName) => {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      }),
      // Take control of all clients
      self.clients.claim()
    ])
  );
});

// ============================================
// FETCH EVENT
// ============================================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-http(s) requests
  if (!url.protocol.startsWith('http')) return;

  // Handle non-GET requests (queue for offline sync)
  if (request.method !== 'GET') {
    event.respondWith(handleMutationRequest(request));
    return;
  }

  // Determine caching strategy based on request type
  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
  } else if (isPropertyImage(url)) {
    event.respondWith(cacheFirstWithExpiry(request, IMAGE_CACHE, CACHE_DURATION.images));
  } else if (isPropertyApi(url)) {
    event.respondWith(networkFirstWithCache(request, PROPERTY_CACHE, CACHE_DURATION.properties));
  } else if (isApiRequest(url)) {
    event.respondWith(networkFirstWithCache(request, API_CACHE, CACHE_DURATION.api));
  } else if (isNavigationRequest(request)) {
    event.respondWith(networkFirstWithOfflineFallback(request));
  } else {
    event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE));
  }
});

// ============================================
// BACKGROUND SYNC
// ============================================
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);

  switch (event.tag) {
    case SYNC_TAGS.FAVORITES:
      event.waitUntil(processSyncQueue(SYNC_TAGS.FAVORITES));
      break;
    case SYNC_TAGS.SEARCHES:
      event.waitUntil(processSyncQueue(SYNC_TAGS.SEARCHES));
      break;
    case SYNC_TAGS.MESSAGES:
      event.waitUntil(processSyncQueue(SYNC_TAGS.MESSAGES));
      break;
    case SYNC_TAGS.FORMS:
      event.waitUntil(processSyncQueue(SYNC_TAGS.FORMS));
      break;
    case SYNC_TAGS.INQUIRIES:
      event.waitUntil(processSyncQueue(SYNC_TAGS.INQUIRIES));
      break;
  }
});

// ============================================
// PUSH NOTIFICATIONS
// ============================================
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  let data = {
    title: 'ASTRA Villa Realty',
    body: 'You have a new notification',
    icon: '/icon-192.png',
    badge: '/icon-192.png'
  };
  
  if (event.data) {
    try {
      const payload = event.data.json();
      data = {
        ...data,
        title: payload.title || data.title,
        body: payload.body || payload.message || data.body,
        icon: payload.icon || data.icon,
        image: payload.image,
        tag: payload.tag || `push-${Date.now()}`,
        data: payload.data || payload
      };
    } catch (error) {
      data.body = event.data.text();
    }
  }
  
  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    image: data.image,
    tag: data.tag,
    data: data.data,
    vibrate: [100, 50, 100],
    requireInteraction: data.data?.type === 'viewing' || data.data?.type === 'price_drop',
    actions: [
      { action: 'view', title: 'View' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'dismiss') return;
  
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        for (const client of windowClients) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.postMessage({
              type: 'NOTIFICATION_CLICK',
              data: event.notification.data
            });
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// ============================================
// MESSAGE HANDLING
// ============================================
self.addEventListener('message', (event) => {
  const { type, payload } = event.data || {};
  console.log('[SW] Message received:', type);

  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'CACHE_PROPERTY':
      event.waitUntil(cacheProperty(payload));
      break;
      
    case 'CACHE_URLS':
      event.waitUntil(cacheUrls(payload.urls, payload.cacheName || DYNAMIC_CACHE));
      break;
      
    case 'CLEAR_CACHE':
      event.waitUntil(clearCache(payload?.cacheName));
      break;
      
    case 'GET_CACHE_SIZE':
      getCacheSize().then((size) => {
        event.ports?.[0]?.postMessage({ type: 'CACHE_SIZE', size });
      });
      break;
      
    case 'QUEUE_SYNC':
      event.waitUntil(queueSyncRequest(payload));
      break;
      
    case 'PRECACHE_FAVORITES':
      event.waitUntil(precacheFavorites(payload));
      break;
      
    case 'CLEANUP_OLD_CACHES':
      event.waitUntil(cleanupOldCaches());
      break;
  }
});

// ============================================
// CACHING STRATEGIES
// ============================================

/**
 * Cache First - For static assets
 */
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.error('[SW] Cache first fetch failed:', error);
    return caches.match('/offline.html');
  }
}

/**
 * Cache First with Expiry - For images
 */
async function cacheFirstWithExpiry(request, cacheName, maxAge) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  if (cached) {
    const cachedDate = cached.headers.get('sw-cached-date');
    if (cachedDate && (Date.now() - new Date(cachedDate).getTime()) < maxAge) {
      return cached;
    }
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      const clonedResponse = response.clone();
      const headers = new Headers(clonedResponse.headers);
      headers.set('sw-cached-date', new Date().toISOString());
      
      const body = await clonedResponse.blob();
      const newResponse = new Response(body, {
        status: clonedResponse.status,
        statusText: clonedResponse.statusText,
        headers
      });
      
      await trimCache(cacheName, CACHE_LIMITS.images - 1);
      cache.put(request, newResponse);
    }
    return response;
  } catch (error) {
    if (cached) return cached;
    return createOfflinePlaceholder();
  }
}

/**
 * Network First with Cache Fallback - For API requests
 */
async function networkFirstWithCache(request, cacheName, maxAge) {
  const cache = await caches.open(cacheName);

  try {
    const response = await fetch(request);
    if (response.ok) {
      const clonedResponse = response.clone();
      const headers = new Headers(clonedResponse.headers);
      headers.set('sw-cached-date', new Date().toISOString());
      
      const body = await clonedResponse.text();
      const newResponse = new Response(body, {
        status: clonedResponse.status,
        statusText: clonedResponse.statusText,
        headers
      });
      
      cache.put(request, newResponse);
    }
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) {
      const cachedDate = cached.headers.get('sw-cached-date');
      // Return cached even if expired when offline
      if (cachedDate) {
        console.log('[SW] Serving from cache (offline):', request.url);
        return cached;
      }
    }
    return new Response(
      JSON.stringify({ error: 'Offline', cached: false, message: 'No cached data available' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Network First with Offline Fallback - For navigation
 */
async function networkFirstWithOfflineFallback(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) return cached;
    return caches.match('/offline.html');
  }
}

/**
 * Stale While Revalidate - For dynamic content
 */
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request)
    .then(async (response) => {
      if (response.ok) {
        await trimCache(cacheName, CACHE_LIMITS.dynamic - 1);
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => cached || caches.match('/offline.html'));

  return cached || fetchPromise;
}

/**
 * Handle mutation requests (POST, PUT, DELETE) - queue for offline sync
 */
async function handleMutationRequest(request) {
  try {
    return await fetch(request);
  } catch (error) {
    // Queue for background sync if offline
    if (shouldQueueRequest(request)) {
      const body = await request.clone().text();
      await queueSyncRequest({
        url: request.url,
        method: request.method,
        headers: Object.fromEntries(request.headers.entries()),
        body,
        tag: getSyncTagForUrl(request.url),
        timestamp: Date.now()
      });
      
      // Notify clients about queued request
      const clients = await self.clients.matchAll();
      clients.forEach(client => {
        client.postMessage({
          type: 'REQUEST_QUEUED',
          url: request.url,
          method: request.method
        });
      });
      
      return new Response(
        JSON.stringify({ queued: true, message: 'Request queued for sync when online' }),
        { status: 202, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ error: 'Offline', message: 'Request cannot be processed offline' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function isStaticAsset(url) {
  return STATIC_ASSETS.some(asset => url.pathname === asset) ||
         /\.(css|js|woff2?|ttf|eot)$/i.test(url.pathname);
}

function isPropertyImage(url) {
  return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url.pathname) ||
         (url.hostname.includes('supabase') && url.pathname.includes('/storage/'));
}

function isPropertyApi(url) {
  return url.pathname.includes('/rest/v1/properties');
}

function isApiRequest(url) {
  return url.pathname.includes('/rest/v1/') || 
         url.pathname.includes('/functions/v1/');
}

function isNavigationRequest(request) {
  return request.mode === 'navigate' || 
         (request.method === 'GET' && request.headers.get('accept')?.includes('text/html'));
}

function shouldQueueRequest(request) {
  const url = new URL(request.url);
  return ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method) &&
         (url.pathname.includes('/rest/v1/') || url.pathname.includes('/functions/v1/'));
}

function getSyncTagForUrl(url) {
  if (url.includes('favorites')) return SYNC_TAGS.FAVORITES;
  if (url.includes('saved_searches') || url.includes('user_searches')) return SYNC_TAGS.SEARCHES;
  if (url.includes('messages') || url.includes('chat')) return SYNC_TAGS.MESSAGES;
  if (url.includes('inquiries') || url.includes('contact')) return SYNC_TAGS.INQUIRIES;
  return SYNC_TAGS.FORMS;
}

/**
 * Trim cache to maximum size
 */
async function trimCache(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  
  if (keys.length > maxItems) {
    const deleteCount = keys.length - maxItems;
    await Promise.all(
      keys.slice(0, deleteCount).map(key => cache.delete(key))
    );
  }
}

/**
 * Cache specific URLs
 */
async function cacheUrls(urls, cacheName) {
  const cache = await caches.open(cacheName);
  return Promise.all(
    urls.map(url => 
      fetch(url)
        .then(response => {
          if (response.ok) cache.put(url, response);
        })
        .catch(error => console.warn('[SW] Failed to cache:', url))
    )
  );
}

/**
 * Cache a property for offline access
 */
async function cacheProperty(property) {
  try {
    const cache = await caches.open(PROPERTY_CACHE);
    const key = `/api/property/${property.id}`;
    const response = new Response(JSON.stringify(property), {
      headers: { 
        'Content-Type': 'application/json',
        'sw-cached-date': new Date().toISOString()
      }
    });
    await cache.put(key, response);
    
    // Cache property images
    if (property.images?.length) {
      const imageCache = await caches.open(IMAGE_CACHE);
      for (const img of property.images.slice(0, 5)) {
        try {
          const imageUrl = img.url || img;
          const imageResponse = await fetch(imageUrl);
          if (imageResponse.ok) {
            imageCache.put(imageUrl, imageResponse);
          }
        } catch (e) {
          console.warn('[SW] Failed to cache property image');
        }
      }
    }
    
    console.log('[SW] Property cached:', property.id);
  } catch (error) {
    console.error('[SW] Failed to cache property:', error);
  }
}

/**
 * Precache user's favorite properties
 */
async function precacheFavorites(favorites) {
  console.log('[SW] Precaching favorites:', favorites?.length);
  for (const property of favorites || []) {
    await cacheProperty(property);
  }
}

/**
 * Clear specific or all caches
 */
async function clearCache(cacheName) {
  if (cacheName) {
    return caches.delete(cacheName);
  }
  
  const names = await caches.keys();
  return Promise.all(
    names.filter(name => name.startsWith('astra-')).map(name => caches.delete(name))
  );
}

/**
 * Cleanup old/expired cache entries
 */
async function cleanupOldCaches() {
  const now = Date.now();
  const cacheConfigs = [
    { name: API_CACHE, maxAge: CACHE_DURATION.api },
    { name: PROPERTY_CACHE, maxAge: CACHE_DURATION.properties },
    { name: IMAGE_CACHE, maxAge: CACHE_DURATION.images }
  ];
  
  for (const config of cacheConfigs) {
    try {
      const cache = await caches.open(config.name);
      const keys = await cache.keys();
      
      for (const request of keys) {
        const response = await cache.match(request);
        const cachedDate = response?.headers.get('sw-cached-date');
        
        if (cachedDate && (now - new Date(cachedDate).getTime()) > config.maxAge) {
          await cache.delete(request);
          console.log('[SW] Deleted expired cache entry:', request.url);
        }
      }
    } catch (error) {
      console.error('[SW] Cleanup error for', config.name, error);
    }
  }
  
  console.log('[SW] Cache cleanup completed');
}

/**
 * Get total cache size
 */
async function getCacheSize() {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    return {
      used: estimate.usage || 0,
      quota: estimate.quota || 0,
      usedMB: Math.round((estimate.usage || 0) / (1024 * 1024) * 100) / 100,
      quotaMB: Math.round((estimate.quota || 0) / (1024 * 1024) * 100) / 100,
      percentUsed: Math.round(((estimate.usage || 0) / (estimate.quota || 1)) * 100)
    };
  }
  return null;
}

/**
 * Create offline placeholder for images
 */
function createOfflinePlaceholder() {
  const svg = `
    <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#1e293b"/>
      <text x="50%" y="45%" text-anchor="middle" fill="#64748b" font-family="system-ui" font-size="16">
        Image unavailable offline
      </text>
      <text x="50%" y="55%" text-anchor="middle" fill="#475569" font-family="system-ui" font-size="12">
        Connect to view this image
      </text>
    </svg>
  `;
  return new Response(svg, {
    headers: { 'Content-Type': 'image/svg+xml' }
  });
}

// ============================================
// BACKGROUND SYNC - IndexedDB Operations
// ============================================

function openSyncDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains(SYNC_STORE)) {
        const store = db.createObjectStore(SYNC_STORE, { keyPath: 'id', autoIncrement: true });
        store.createIndex('tag', 'tag', { unique: false });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

async function queueSyncRequest(payload) {
  try {
    const db = await openSyncDB();
    const tx = db.transaction(SYNC_STORE, 'readwrite');
    const store = tx.objectStore(SYNC_STORE);
    
    store.add({
      ...payload,
      retries: 0,
      createdAt: Date.now()
    });
    
    await new Promise((resolve, reject) => {
      tx.oncomplete = resolve;
      tx.onerror = reject;
    });
    
    // Register sync if supported
    if ('sync' in self.registration) {
      await self.registration.sync.register(payload.tag || SYNC_TAGS.FORMS);
    }
    
    console.log('[SW] Request queued for sync:', payload.tag);
  } catch (error) {
    console.error('[SW] Failed to queue sync request:', error);
  }
}

async function processSyncQueue(tag) {
  console.log('[SW] Processing sync queue for:', tag);
  
  try {
    const db = await openSyncDB();
    const tx = db.transaction(SYNC_STORE, 'readwrite');
    const store = tx.objectStore(SYNC_STORE);
    const index = store.index('tag');
    const request = index.getAll(tag);
    
    return new Promise((resolve, reject) => {
      request.onsuccess = async () => {
        const items = request.result;
        let successCount = 0;
        let failCount = 0;
        
        for (const item of items) {
          try {
            const response = await fetch(item.url, {
              method: item.method,
              headers: item.headers,
              body: item.body
            });
            
            if (response.ok) {
              // Delete from queue on success
              const deleteTx = db.transaction(SYNC_STORE, 'readwrite');
              deleteTx.objectStore(SYNC_STORE).delete(item.id);
              successCount++;
            } else if (item.retries < 3) {
              // Retry later
              const updateTx = db.transaction(SYNC_STORE, 'readwrite');
              updateTx.objectStore(SYNC_STORE).put({ ...item, retries: item.retries + 1 });
              failCount++;
            } else {
              // Give up after 3 retries
              const deleteTx = db.transaction(SYNC_STORE, 'readwrite');
              deleteTx.objectStore(SYNC_STORE).delete(item.id);
              failCount++;
            }
          } catch (error) {
            if (item.retries < 3) {
              const updateTx = db.transaction(SYNC_STORE, 'readwrite');
              updateTx.objectStore(SYNC_STORE).put({ ...item, retries: item.retries + 1 });
            }
            failCount++;
          }
        }
        
        // Notify clients of sync completion
        const allClients = await self.clients.matchAll();
        allClients.forEach(client => {
          client.postMessage({
            type: 'SYNC_COMPLETE',
            tag,
            total: items.length,
            success: successCount,
            failed: failCount
          });
        });
        
        console.log(`[SW] Sync complete: ${successCount} succeeded, ${failCount} failed`);
        resolve(successCount);
      };
      request.onerror = reject;
    });
  } catch (error) {
    console.error('[SW] Sync queue processing failed:', error);
    throw error;
  }
}

// ============================================
// PERIODIC BACKGROUND SYNC (if supported)
// ============================================
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'cleanup-caches') {
    event.waitUntil(cleanupOldCaches());
  }
});

console.log('[SW] Service worker v3.0 loaded');
