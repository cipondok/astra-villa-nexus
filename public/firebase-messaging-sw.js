// Firebase Cloud Messaging Service Worker
// This service worker handles push notifications from Firebase

importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// Initialize Firebase with project config
// Note: These are public keys, safe to include in client-side code
const firebaseConfig = {
  apiKey: "AIzaSyDqMkT-1234567890", // Replace with actual Firebase config
  authDomain: "astra-villa-realty.firebaseapp.com",
  projectId: "astra-villa-realty",
  storageBucket: "astra-villa-realty.appspot.com",
  messagingSenderId: "103953800507",
  appId: "1:103953800507:web:abc123def456"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Retrieve Firebase Messaging instance
const messaging = firebase.messaging();

// Cache names
const CACHE_NAME = 'astra-notifications-v1';
const NOTIFICATION_CACHE = 'notification-data-v1';

// Notification type icons
const NOTIFICATION_ICONS = {
  'price_drop': '/icons/price-drop.png',
  'new_match': '/icons/new-match.png',
  'message': '/icons/message.png',
  'viewing': '/icons/calendar.png',
  'market': '/icons/chart.png',
  'default': '/icon-192.png'
};

// Notification colors by type
const NOTIFICATION_COLORS = {
  'price_drop': '#10b981', // Green
  'new_match': '#3b82f6', // Blue
  'message': '#8b5cf6', // Purple
  'viewing': '#f59e0b', // Amber
  'market': '#06b6d4', // Cyan
  'default': '#1e40af'
};

// Handle background messages from Firebase
messaging.onBackgroundMessage((payload) => {
  console.log('[FCM SW] Received background message:', payload);

  const { title, body, icon, image, data } = payload.notification || {};
  const notificationType = data?.type || 'default';
  
  const notificationOptions = {
    body: body || payload.data?.body || 'You have a new notification',
    icon: icon || NOTIFICATION_ICONS[notificationType] || NOTIFICATION_ICONS.default,
    badge: '/badge-72.png',
    image: image || payload.data?.image,
    tag: `astra-${notificationType}-${Date.now()}`,
    renotify: true,
    requireInteraction: notificationType === 'viewing' || notificationType === 'price_drop',
    vibrate: [100, 50, 100, 50, 100],
    data: {
      ...payload.data,
      url: payload.data?.actionUrl || payload.data?.url || '/',
      timestamp: Date.now(),
      type: notificationType
    },
    actions: getNotificationActions(notificationType)
  };

  // Cache notification for analytics
  cacheNotificationData({
    id: `notif-${Date.now()}`,
    title: title || payload.data?.title || 'ASTRA Notification',
    type: notificationType,
    timestamp: Date.now(),
    displayed: true
  });

  return self.registration.showNotification(
    title || payload.data?.title || 'ASTRA Villa Realty',
    notificationOptions
  );
});

// Get notification actions based on type
function getNotificationActions(type) {
  const actions = {
    'price_drop': [
      { action: 'view', title: '🏠 View Property', icon: '/icons/view.png' },
      { action: 'save', title: '💾 Save for Later', icon: '/icons/save.png' }
    ],
    'new_match': [
      { action: 'view', title: '👀 View Matches', icon: '/icons/view.png' },
      { action: 'search', title: '🔍 Refine Search', icon: '/icons/search.png' }
    ],
    'message': [
      { action: 'reply', title: '💬 Reply', icon: '/icons/reply.png' },
      { action: 'view', title: '📖 Read', icon: '/icons/view.png' }
    ],
    'viewing': [
      { action: 'confirm', title: '✓ Confirm', icon: '/icons/confirm.png' },
      { action: 'reschedule', title: '📅 Reschedule', icon: '/icons/calendar.png' }
    ],
    'market': [
      { action: 'view', title: '📊 View Report', icon: '/icons/chart.png' },
      { action: 'dismiss', title: '✕ Dismiss', icon: '/icons/close.png' }
    ]
  };

  return actions[type] || [
    { action: 'view', title: 'View', icon: '/icons/view.png' },
    { action: 'dismiss', title: 'Dismiss', icon: '/icons/close.png' }
  ];
}

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[FCM SW] Notification clicked:', event);
  
  event.notification.close();
  
  const { data, action } = event;
  const notificationData = event.notification.data || {};
  const url = notificationData.url || '/';
  const type = notificationData.type || 'default';

  // Track click for analytics
  trackNotificationInteraction({
    notificationId: notificationData.id,
    type,
    action: action || 'click',
    timestamp: Date.now()
  });

  // Handle specific actions
  let targetUrl = url;
  
  switch (action) {
    case 'view':
      targetUrl = notificationData.propertyUrl || notificationData.url || '/';
      break;
    case 'save':
      targetUrl = `/favorites?add=${notificationData.propertyId}`;
      break;
    case 'reply':
      targetUrl = `/messages?reply=${notificationData.messageId}`;
      break;
    case 'search':
      targetUrl = '/properties';
      break;
    case 'confirm':
      targetUrl = `/bookings/${notificationData.bookingId}/confirm`;
      break;
    case 'reschedule':
      targetUrl = `/bookings/${notificationData.bookingId}/reschedule`;
      break;
    case 'dismiss':
      return;
    default:
      targetUrl = url;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Check if app is already open
      for (let client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.postMessage({
            type: 'NOTIFICATION_CLICK',
            data: notificationData,
            action,
            targetUrl
          });
          return client.focus();
        }
      }
      // Open new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// Handle notification close (for analytics)
self.addEventListener('notificationclose', (event) => {
  const notificationData = event.notification.data || {};
  
  trackNotificationInteraction({
    notificationId: notificationData.id,
    type: notificationData.type,
    action: 'dismiss',
    timestamp: Date.now()
  });
});

// Cache notification data for analytics
async function cacheNotificationData(data) {
  try {
    const cache = await caches.open(NOTIFICATION_CACHE);
    const cacheKey = `/notification-data/${data.id}`;
    await cache.put(cacheKey, new Response(JSON.stringify(data)));
  } catch (error) {
    console.error('[FCM SW] Failed to cache notification:', error);
  }
}

// Track notification interactions
async function trackNotificationInteraction(data) {
  try {
    // Send to analytics endpoint
    const response = await fetch('https://zymrajuuyyfkzdmptebl.supabase.co/functions/v1/push-notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5bXJhanV1eXlma3pkbXB0ZWJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxNDM5NjksImV4cCI6MjA2NDcxOTk2OX0.jcdUvzLIWj7b0ay5UvuzJ7RVsAzkSWQQ_-o83kNaYYk'
      },
      body: JSON.stringify({
        action: 'track_interaction',
        ...data
      })
    });
    console.log('[FCM SW] Tracked interaction:', response.ok);
  } catch (error) {
    console.error('[FCM SW] Failed to track interaction:', error);
  }
}

// Handle push event (fallback for non-FCM pushes)
self.addEventListener('push', (event) => {
  console.log('[FCM SW] Push event received');
  
  if (event.data) {
    try {
      const data = event.data.json();
      
      // If this is handled by FCM, skip
      if (data.firebase) return;
      
      const { title, body, icon, image, type, ...rest } = data;
      
      const options = {
        body: body || 'You have a new notification',
        icon: icon || NOTIFICATION_ICONS[type] || NOTIFICATION_ICONS.default,
        badge: '/badge-72.png',
        image,
        tag: `push-${type || 'general'}-${Date.now()}`,
        vibrate: [200, 100, 200],
        data: {
          ...rest,
          type,
          timestamp: Date.now()
        },
        actions: getNotificationActions(type || 'default')
      };

      event.waitUntil(
        self.registration.showNotification(title || 'ASTRA Notification', options)
      );
    } catch (error) {
      console.error('[FCM SW] Error processing push:', error);
    }
  }
});

// Service worker install
self.addEventListener('install', (event) => {
  console.log('[FCM SW] Installing...');
  self.skipWaiting();
});

// Service worker activate
self.addEventListener('activate', (event) => {
  console.log('[FCM SW] Activating...');
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      // Clean old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name.startsWith('astra-') && name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        );
      })
    ])
  );
});

// Handle messages from main thread
self.addEventListener('message', (event) => {
  console.log('[FCM SW] Message received:', event.data);
  
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data.type === 'GET_NOTIFICATION_DATA') {
    event.waitUntil(
      caches.open(NOTIFICATION_CACHE).then((cache) => {
        return cache.match('/notification-data/latest').then((response) => {
          if (response) {
            return response.json();
          }
          return null;
        });
      }).then((data) => {
        event.ports[0].postMessage({ data });
      })
    );
  }
});

console.log('[FCM SW] Firebase Messaging Service Worker loaded');
