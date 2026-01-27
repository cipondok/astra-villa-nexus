import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Push Notification Strategy Hook
 * Handles:
 * - Price drops on saved properties
 * - New property matches based on search criteria
 * - Message/inquiry alerts
 * - Market updates and insights
 */

export interface NotificationPreferences {
  priceDrops: boolean;
  newMatches: boolean;
  messageAlerts: boolean;
  marketUpdates: boolean;
  dailyDigest: boolean;
}

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

const VAPID_PUBLIC_KEY = 'YOUR_VAPID_PUBLIC_KEY'; // Replace with actual key from secrets

export const usePushNotifications = () => {
  const { user } = useAuth();
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    priceDrops: true,
    newMatches: true,
    messageAlerts: true,
    marketUpdates: false,
    dailyDigest: false,
  });

  // Check browser support
  useEffect(() => {
    const supported = 'serviceWorker' in navigator && 'PushManager' in window;
    setIsSupported(supported);
    
    if (supported) {
      setPermission(Notification.permission);
      checkExistingSubscription();
    }
  }, []);

  // Load user preferences from storage/database
  useEffect(() => {
    if (user) {
      loadPreferences();
    }
  }, [user]);

  const checkExistingSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error('Failed to check subscription:', error);
    }
  };

  const loadPreferences = async () => {
    if (!user) return;
    
    const stored = localStorage.getItem(`push_prefs_${user.id}`);
    if (stored) {
      setPreferences(JSON.parse(stored));
    }
  };

  const savePreferences = async (newPrefs: NotificationPreferences) => {
    if (!user) return;
    
    setPreferences(newPrefs);
    localStorage.setItem(`push_prefs_${user.id}`, JSON.stringify(newPrefs));
    
    // Optionally sync to server for cross-device preferences
  };

  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported) return false;

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch (error) {
      console.error('Failed to request permission:', error);
      return false;
    }
  };

  const subscribe = async (): Promise<boolean> => {
    if (!isSupported || permission !== 'granted') {
      const granted = await requestPermission();
      if (!granted) return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Check for existing subscription
      let subscription = await registration.pushManager.getSubscription();
      
      if (!subscription) {
      const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey.buffer as ArrayBuffer,
      });
    }

      // Save subscription to server
      if (user && subscription) {
        const subscriptionData: PushSubscriptionData = {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: arrayBufferToBase64(subscription.getKey('p256dh')!),
            auth: arrayBufferToBase64(subscription.getKey('auth')!),
          },
        };

        // Store in database (you'd create an edge function for this)
        console.log('Push subscription:', subscriptionData);
      }

      setIsSubscribed(true);
      return true;
    } catch (error) {
      console.error('Failed to subscribe:', error);
      return false;
    }
  };

  const unsubscribe = async (): Promise<boolean> => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        // Remove from server database
      }

      setIsSubscribed(false);
      return true;
    } catch (error) {
      console.error('Failed to unsubscribe:', error);
      return false;
    }
  };

  // Trigger local notification (for testing/immediate feedback)
  const showLocalNotification = useCallback(async (
    title: string,
    options?: NotificationOptions & { vibrate?: number[]; actions?: { action: string; title: string }[] }
  ) => {
    if (!isSupported || permission !== 'granted') return;

    try {
      const registration = await navigator.serviceWorker.ready;
      // Filter out non-standard options for TypeScript
      const { vibrate, actions, ...standardOptions } = options || {};
      await registration.showNotification(title, {
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        ...standardOptions,
      } as NotificationOptions);
    } catch (error) {
      console.error('Failed to show notification:', error);
    }
  }, [isSupported, permission]);

  // Notification type handlers
  const notifyPriceDrop = useCallback((
    propertyTitle: string,
    oldPrice: number,
    newPrice: number,
    propertyId: string
  ) => {
    if (!preferences.priceDrops) return;
    
    const savings = oldPrice - newPrice;
    const percentage = Math.round((savings / oldPrice) * 100);
    
    showLocalNotification('Price Drop Alert! 📉', {
      body: `${propertyTitle} dropped ${percentage}%! Now ${formatPrice(newPrice)}`,
      tag: `price_drop_${propertyId}`,
      data: { type: 'price_drop', propertyId },
    });
  }, [preferences.priceDrops, showLocalNotification]);

  const notifyNewMatch = useCallback((
    matchCount: number,
    searchCriteria: string
  ) => {
    if (!preferences.newMatches) return;
    
    showLocalNotification('New Matches Found! 🏠', {
      body: `${matchCount} new properties match your search: ${searchCriteria}`,
      tag: 'new_matches',
      data: { type: 'new_match' },
    });
  }, [preferences.newMatches, showLocalNotification]);

  const notifyMessage = useCallback((
    senderName: string,
    preview: string,
    messageId: string
  ) => {
    if (!preferences.messageAlerts) return;
    
    showLocalNotification(`Message from ${senderName}`, {
      body: preview.length > 50 ? preview.slice(0, 50) + '...' : preview,
      tag: `message_${messageId}`,
      data: { type: 'message', messageId },
    });
  }, [preferences.messageAlerts, showLocalNotification]);

  const notifyMarketUpdate = useCallback((
    title: string,
    summary: string
  ) => {
    if (!preferences.marketUpdates) return;
    
    showLocalNotification(`Market Update: ${title}`, {
      body: summary,
      tag: 'market_update',
      data: { type: 'market_update' },
    });
  }, [preferences.marketUpdates, showLocalNotification]);

  return {
    isSupported,
    isSubscribed,
    permission,
    preferences,
    requestPermission,
    subscribe,
    unsubscribe,
    savePreferences,
    showLocalNotification,
    notifyPriceDrop,
    notifyNewMatch,
    notifyMessage,
    notifyMarketUpdate,
  };
};

// Utility functions
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function formatPrice(price: number): string {
  if (price >= 1_000_000_000) {
    return `Rp ${(price / 1_000_000_000).toFixed(1)}M`;
  }
  if (price >= 1_000_000) {
    return `Rp ${(price / 1_000_000).toFixed(0)}jt`;
  }
  return `Rp ${price.toLocaleString('id-ID')}`;
}

export default usePushNotifications;
