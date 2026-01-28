// ASTRA Villa Realty - Main Service Worker
// Handles PWA features, offline support, and push notifications

const CACHE_VERSION = 'v2';
const STATIC_CACHE = `astra-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `astra-dynamic-${CACHE_VERSION}`;
const IMAGE_CACHE = `astra-images-${CACHE_VERSION}`;
const API_CACHE = `astra-api-${CACHE_VERSION}`;

// Assets to cache immediately on install
const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/favicon.ico'
];

// Cache size limits
const CACHE_LIMITS = {
  dynamic: 50,
  images: 100,
  api: 30
};

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
      .catch((error) => {
        console.error('[SW] Failed to cache static assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => {
              return name.startsWith('astra-') && 
                     ![STATIC_CACHE, DYNAMIC_CACHE, IMAGE_CACHE, API_CACHE].includes(name);
            })
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
    ])
  );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith('http')) return;
  
  // Handle API requests
  if (url.pathname.includes('/functions/') || url.pathname.includes('/rest/')) {
    event.respondWith(networkFirst(request, API_CACHE, CACHE_LIMITS.api));
    return;
  }
  
  // Handle images
  if (request.destination === 'image' || url.pathname.match(/\.(png|jpg|jpeg|gif|webp|svg|ico)$/i)) {
    event.respondWith(cacheFirst(request, IMAGE_CACHE, CACHE_LIMITS.images));
    return;
  }
  
  // Handle static assets and pages
  event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE, CACHE_LIMITS.dynamic));
});

// Cache strategies
async function cacheFirst(request, cacheName, limit) {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      await cache.put(request, response.clone());
      await trimCache(cacheName, limit);
    }
    return response;
  } catch (error) {
    return new Response('Image not available offline', { status: 503 });
  }
}

async function networkFirst(request, cacheName, limit) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      await cache.put(request, response.clone());
      await trimCache(cacheName, limit);
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    return new Response(
      JSON.stringify({ error: 'Offline', cached: false }),
      { 
        status: 503, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}

async function staleWhileRevalidate(request, cacheName, limit) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
        trimCache(cacheName, limit);
      }
      return response;
    })
    .catch(() => {
      // Network failed, return cached or offline page
      return cached || caches.match('/offline.html');
    });
  
  return cached || fetchPromise;
}

// Trim cache to limit size
async function trimCache(cacheName, limit) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  
  if (keys.length > limit) {
    const deleteCount = keys.length - limit;
    const keysToDelete = keys.slice(0, deleteCount);
    await Promise.all(keysToDelete.map((key) => cache.delete(key)));
  }
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  let data = {
    title: 'ASTRA Villa Realty',
    body: 'You have a new notification',
    icon: '/icon-192.png',
    badge: '/badge-72.png'
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
      console.error('[SW] Failed to parse push data:', error);
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
    vibrate: [100, 50, 100, 50, 100],
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

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'dismiss') return;
  
  const urlToOpen = event.notification.data?.url || 
                    event.notification.data?.actionUrl || 
                    '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // Focus existing window if available
        for (const client of windowClients) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.postMessage({
              type: 'NOTIFICATION_CLICK',
              data: event.notification.data
            });
            return client.focus();
          }
        }
        // Open new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Notification close (for analytics)
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification closed');
  
  // Could send analytics here
  const data = event.notification.data;
  if (data?.id) {
    // Track dismissal
    fetch('https://zymrajuuyyfkzdmptebl.supabase.co/functions/v1/push-notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5bXJhanV1eXlma3pkbXB0ZWJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxNDM5NjksImV4cCI6MjA2NDcxOTk2OX0.jcdUvzLIWj7b0ay5UvuzJ7RVsAzkSWQQ_-o83kNaYYk'
      },
      body: JSON.stringify({
        action: 'track_interaction',
        notificationId: data.id,
        interactionType: 'dismissed',
        timestamp: Date.now()
      })
    }).catch(() => {});
  }
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'sync-favorites') {
    event.waitUntil(syncFavorites());
  }
  
  if (event.tag === 'sync-searches') {
    event.waitUntil(syncSavedSearches());
  }
});

async function syncFavorites() {
  try {
    const cache = await caches.open('offline-favorites');
    const requests = await cache.keys();
    
    for (const request of requests) {
      const response = await cache.match(request);
      if (response) {
        const data = await response.json();
        
        // Try to sync with server
        await fetch('https://zymrajuuyyfkzdmptebl.supabase.co/rest/v1/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5bXJhanV1eXlma3pkbXB0ZWJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxNDM5NjksImV4cCI6MjA2NDcxOTk2OX0.jcdUvzLIWj7b0ay5UvuzJ7RVsAzkSWQQ_-o83kNaYYk'
          },
          body: JSON.stringify(data)
        });
        
        await cache.delete(request);
      }
    }
  } catch (error) {
    console.error('[SW] Sync favorites failed:', error);
  }
}

async function syncSavedSearches() {
  try {
    const cache = await caches.open('offline-searches');
    const requests = await cache.keys();
    
    for (const request of requests) {
      const response = await cache.match(request);
      if (response) {
        const data = await response.json();
        
        await fetch('https://zymrajuuyyfkzdmptebl.supabase.co/rest/v1/user_searches', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5bXJhanV1eXlma3pkbXB0ZWJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxNDM5NjksImV4cCI6MjA2NDcxOTk2OX0.jcdUvzLIWj7b0ay5UvuzJ7RVsAzkSWQQ_-o83kNaYYk'
          },
          body: JSON.stringify(data)
        });
        
        await cache.delete(request);
      }
    }
  } catch (error) {
    console.error('[SW] Sync searches failed:', error);
  }
}

// Message handling from main thread
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data?.type);
  
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data?.type === 'CACHE_PROPERTY') {
    event.waitUntil(cacheProperty(event.data.property));
  }
  
  if (event.data?.type === 'CLEAR_CACHE') {
    event.waitUntil(clearAllCaches());
  }
});

async function cacheProperty(property) {
  try {
    const cache = await caches.open('offline-properties');
    const key = `/property/${property.id}`;
    await cache.put(key, new Response(JSON.stringify(property)));
    console.log('[SW] Property cached:', property.id);
  } catch (error) {
    console.error('[SW] Failed to cache property:', error);
  }
}

async function clearAllCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames
      .filter((name) => name.startsWith('astra-'))
      .map((name) => caches.delete(name))
  );
  console.log('[SW] All caches cleared');
}

console.log('[SW] Service worker loaded');
