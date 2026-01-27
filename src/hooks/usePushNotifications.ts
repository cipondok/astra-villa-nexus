import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

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
  push_enabled: boolean;
  email_enabled: boolean;
  quiet_hours_enabled: boolean;
  quiet_start_time: string;
  quiet_end_time: string;
}

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface NotificationHistoryItem {
  id: string;
  title: string;
  body: string;
  icon?: string;
  image?: string;
  action_url?: string;
  notification_type: string;
  metadata: Record<string, any>;
  is_read: boolean;
  created_at: string;
}

const VAPID_PUBLIC_KEY = 'BNbxGYNMhEIi9zrneh7mqB9EzTvB0y3JbYlgDHCvxyHDR8Lf7mWN1oP3Wk7WpMvxjsNFYKK7MvJ0Lg6E_xQA5Qc';

const defaultPreferences: NotificationPreferences = {
  priceDrops: true,
  newMatches: true,
  messageAlerts: true,
  marketUpdates: false,
  dailyDigest: false,
  push_enabled: true,
  email_enabled: true,
  quiet_hours_enabled: false,
  quiet_start_time: '22:00',
  quiet_end_time: '07:00',
};

export const usePushNotifications = () => {
  const { user } = useAuth();
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);
  const [notifications, setNotifications] = useState<NotificationHistoryItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Check browser support
  useEffect(() => {
    const supported = 'serviceWorker' in navigator && 'PushManager' in window;
    setIsSupported(supported);
    
    if (supported) {
      setPermission(Notification.permission);
      checkExistingSubscription();
    }
  }, []);

  // Load user preferences and notifications
  useEffect(() => {
    if (user) {
      loadPreferences();
      loadNotifications();
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
    
    try {
      // Try database first
      const { data } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        setPreferences({
          priceDrops: data.price_changes ?? true,
          newMatches: data.new_listings ?? true,
          messageAlerts: data.messages ?? true,
          marketUpdates: data.promotions ?? false,
          dailyDigest: false,
          push_enabled: data.push_enabled ?? true,
          email_enabled: data.email_enabled ?? true,
          quiet_hours_enabled: data.quiet_hours_enabled ?? false,
          quiet_start_time: data.quiet_start_time || '22:00',
          quiet_end_time: data.quiet_end_time || '07:00',
        });
        return;
      }
    } catch (error) {
      console.error('Error loading preferences from DB:', error);
    }

    // Fallback to localStorage
    const stored = localStorage.getItem(`push_prefs_${user.id}`);
    if (stored) {
      setPreferences({ ...defaultPreferences, ...JSON.parse(stored) });
    }
  };

  const loadNotifications = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notification_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (data) {
        setNotifications(data as unknown as NotificationHistoryItem[]);
        setUnreadCount(data.filter(n => !n.is_read).length);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const updatePreferences = async (newPrefs: Partial<NotificationPreferences>): Promise<boolean> => {
    if (!user) return false;
    
    setIsLoading(true);
    const updatedPrefs = { ...preferences, ...newPrefs };
    setPreferences(updatedPrefs);
    
    try {
      // Save to database
      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          new_listings: updatedPrefs.newMatches,
          price_changes: updatedPrefs.priceDrops,
          booking_updates: true,
          messages: updatedPrefs.messageAlerts,
          promotions: updatedPrefs.marketUpdates,
          system_alerts: true,
          push_enabled: updatedPrefs.push_enabled,
          email_enabled: updatedPrefs.email_enabled,
          quiet_hours_enabled: updatedPrefs.quiet_hours_enabled,
          quiet_start_time: updatedPrefs.quiet_start_time,
          quiet_end_time: updatedPrefs.quiet_end_time,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      
      // Also save to localStorage as backup
      localStorage.setItem(`push_prefs_${user.id}`, JSON.stringify(updatedPrefs));
      toast.success('Preferences saved');
      return true;
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Failed to save preferences');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const savePreferences = async (newPrefs: NotificationPreferences) => {
    await updatePreferences(newPrefs);
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

    setIsLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      
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
        const { error } = await supabase.functions.invoke('push-notifications', {
          body: {
            action: 'subscribe',
            subscription: {
              endpoint: subscription.endpoint,
              keys: {
                p256dh: arrayBufferToBase64(subscription.getKey('p256dh')!),
                auth: arrayBufferToBase64(subscription.getKey('auth')!),
              },
              deviceType: 'web',
              browser: navigator.userAgent,
            },
          },
        });

        if (error) throw error;
      }

      setIsSubscribed(true);
      toast.success('Push notifications enabled!');
      return true;
    } catch (error) {
      console.error('Failed to subscribe:', error);
      toast.error('Failed to enable notifications');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribe = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        
        await supabase.functions.invoke('push-notifications', {
          body: {
            action: 'unsubscribe',
            subscription: { endpoint: subscription.endpoint },
          },
        });
      }

      setIsSubscribed(false);
      toast.success('Push notifications disabled');
      return true;
    } catch (error) {
      console.error('Failed to unsubscribe:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string): Promise<void> => {
    try {
      await supabase
        .from('notification_history')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId);

      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async (): Promise<void> => {
    if (!user) return;

    try {
      await supabase
        .from('notification_history')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('is_read', false);

      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
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
      const { vibrate, actions, ...standardOptions } = options || {};
      await registration.showNotification(title, {
        icon: '/icon-192.png',
        badge: '/icon-192.png',
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
    isLoading,
    permission,
    preferences,
    notifications,
    unreadCount,
    requestPermission,
    subscribe,
    unsubscribe,
    savePreferences,
    updatePreferences,
    loadNotifications,
    markAsRead,
    markAllAsRead,
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
