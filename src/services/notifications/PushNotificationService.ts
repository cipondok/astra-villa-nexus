/**
 * Push Notification Service
 * Handles FCM/Web Push notifications with subscription management
 */

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, any>;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

export interface PushSubscriptionData {
  endpoint: string;
  p256dh: string;
  auth: string;
  deviceType: 'web' | 'android' | 'ios';
  deviceName: string;
}

export interface NotificationPreferences {
  priceDrops: boolean;
  newMatches: boolean;
  messages: boolean;
  marketUpdates: boolean;
  systemAlerts: boolean;
  weeklyDigest: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
}

class PushNotificationService {
  private vapidPublicKey: string | null = null;
  private swRegistration: ServiceWorkerRegistration | null = null;
  private initialized = false;

  async initialize(): Promise<boolean> {
    if (this.initialized) return true;

    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push notifications not supported');
      return false;
    }

    try {
      this.swRegistration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;
      this.vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY || 'BNvqbVKWNxDG6YxWVf0mxNKKPk4_ByVXYjVGHvzZRKXoKHIYE9E-X2GCvBzqG7eY4VpYRjvXKp3xXKHV7qXYFqI';
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize push service:', error);
      return false;
    }
  }

  async requestPermission(): Promise<NotificationPermission> {
    return await Notification.requestPermission();
  }

  async subscribe(userId: string, deviceName?: string): Promise<PushSubscriptionData | null> {
    if (!this.initialized) {
      await this.initialize();
    }

    if (!this.swRegistration || !this.vapidPublicKey) {
      throw new Error('Push service not initialized');
    }

    try {
      const permission = await this.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Notification permission denied');
      }

      let pushSubscription = await this.swRegistration.pushManager.getSubscription();
      
      if (!pushSubscription) {
        const keyBytes = this.urlBase64ToUint8Array(this.vapidPublicKey);
        pushSubscription = await this.swRegistration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: keyBytes.buffer as ArrayBuffer
        });
      }

      const rawKey = pushSubscription.getKey('p256dh');
      const rawAuth = pushSubscription.getKey('auth');
      
      if (!rawKey || !rawAuth) {
        throw new Error('Failed to get subscription keys');
      }

      const subscriptionData: PushSubscriptionData = {
        endpoint: pushSubscription.endpoint,
        p256dh: this.arrayBufferToBase64(rawKey),
        auth: this.arrayBufferToBase64(rawAuth),
        deviceType: this.getDeviceType(),
        deviceName: deviceName || this.getDeviceName()
      };

      // Store in localStorage for now (database table needs to be created)
      localStorage.setItem(`push_subscription_${userId}`, JSON.stringify(subscriptionData));
      
      console.log('Push subscription created:', subscriptionData);
      return subscriptionData;
    } catch (error) {
      console.error('Failed to subscribe to push:', error);
      throw error;
    }
  }

  async unsubscribe(userId: string): Promise<boolean> {
    if (!this.swRegistration) return false;

    try {
      const subscription = await this.swRegistration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        localStorage.removeItem(`push_subscription_${userId}`);
      }
      return true;
    } catch (error) {
      console.error('Failed to unsubscribe:', error);
      return false;
    }
  }

  async getSubscriptionStatus(userId: string): Promise<{ isSubscribed: boolean; subscription?: PushSubscriptionData }> {
    if (!this.swRegistration) {
      return { isSubscribed: false };
    }

    try {
      const subscription = await this.swRegistration.pushManager.getSubscription();
      if (!subscription) {
        return { isSubscribed: false };
      }

      const stored = localStorage.getItem(`push_subscription_${userId}`);
      return {
        isSubscribed: !!stored,
        subscription: stored ? JSON.parse(stored) : undefined
      };
    } catch (error) {
      console.error('Failed to get subscription status:', error);
      return { isSubscribed: false };
    }
  }

  getPreferences(userId: string): NotificationPreferences {
    const stored = localStorage.getItem(`notification_prefs_${userId}`);
    return stored ? JSON.parse(stored) : {
      priceDrops: true,
      newMatches: true,
      messages: true,
      marketUpdates: false,
      systemAlerts: true,
      weeklyDigest: false
    };
  }

  updatePreferences(userId: string, prefs: Partial<NotificationPreferences>): void {
    const current = this.getPreferences(userId);
    const updated = { ...current, ...prefs };
    localStorage.setItem(`notification_prefs_${userId}`, JSON.stringify(updated));
  }

  async showLocalNotification(payload: NotificationPayload): Promise<void> {
    if (!this.swRegistration) {
      await this.initialize();
    }

    if (!this.swRegistration) {
      if (Notification.permission === 'granted') {
        new Notification(payload.title, {
          body: payload.body,
          icon: payload.icon || '/icon-192x192.png',
          badge: payload.badge,
          tag: payload.tag,
          data: payload.data
        });
      }
      return;
    }

    await this.swRegistration.showNotification(payload.title, {
      body: payload.body,
      icon: payload.icon || '/icon-192x192.png',
      badge: payload.badge || '/badge-72x72.png',
      tag: payload.tag,
      data: payload.data
    });
  }

  async notifyPriceDrop(propertyTitle: string, oldPrice: number, newPrice: number, propertyId: string): Promise<void> {
    const savings = oldPrice - newPrice;
    const percentage = Math.round((savings / oldPrice) * 100);
    
    await this.showLocalNotification({
      title: '📉 Price Drop Alert!',
      body: `${propertyTitle} dropped ${percentage}%! Now ${this.formatPrice(newPrice)}`,
      tag: `price_drop_${propertyId}`,
      data: { type: 'price_drop', propertyId, url: `/property/${propertyId}` }
    });
  }

  async notifyNewMatch(matchCount: number, criteria: string): Promise<void> {
    await this.showLocalNotification({
      title: '🏠 New Properties Found!',
      body: `${matchCount} new ${matchCount === 1 ? 'property matches' : 'properties match'} "${criteria}"`,
      tag: 'new_matches',
      data: { type: 'new_matches', url: '/search' }
    });
  }

  async notifyMessage(senderName: string, preview: string, conversationId: string): Promise<void> {
    await this.showLocalNotification({
      title: `💬 Message from ${senderName}`,
      body: preview.length > 100 ? preview.slice(0, 100) + '...' : preview,
      tag: `message_${conversationId}`,
      data: { type: 'message', conversationId, url: `/messages/${conversationId}` }
    });
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  private getDeviceType(): 'web' | 'android' | 'ios' {
    const ua = navigator.userAgent;
    if (/android/i.test(ua)) return 'android';
    if (/iPad|iPhone|iPod/.test(ua)) return 'ios';
    return 'web';
  }

  private getDeviceName(): string {
    const ua = navigator.userAgent;
    const browser = this.getBrowserName(ua);
    const os = this.getOSName(ua);
    return `${browser} on ${os}`;
  }

  private getBrowserName(ua: string): string {
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    return 'Browser';
  }

  private getOSName(ua: string): string {
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Mac')) return 'macOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iOS')) return 'iOS';
    return 'Unknown';
  }

  private formatPrice(price: number): string {
    if (price >= 1_000_000_000) {
      return `Rp ${(price / 1_000_000_000).toFixed(1)}M`;
    }
    if (price >= 1_000_000) {
      return `Rp ${Math.round(price / 1_000_000)}jt`;
    }
    return `Rp ${price.toLocaleString('id-ID')}`;
  }
}

export const pushNotificationService = new PushNotificationService();
export default pushNotificationService;
