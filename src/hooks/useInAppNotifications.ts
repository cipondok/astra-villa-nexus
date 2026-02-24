import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface InAppNotification {
  id: string;
  user_id: string;
  type: 'new_match' | 'price_drop' | 'message' | 'appointment' | 'market_insight' | 'system' | 'favorite';
  title: string;
  message: string;
  property_id?: string;
  metadata?: Record<string, unknown>;
  is_read: boolean;
  read_at?: string;
  created_at: string;
  property?: {
    id: string;
    title: string;
    images?: string[];
  };
}

export interface NotificationPreferences {
  id?: string;
  user_id?: string;
  new_listings: boolean;
  price_changes: boolean;
  messages: boolean;
  booking_updates: boolean;
  system_alerts: boolean;
  promotions: boolean;
  email_enabled: boolean;
  push_enabled: boolean;
  sms_enabled: boolean;
  quiet_hours_enabled: boolean;
  quiet_start_time?: string | null;
  quiet_end_time?: string | null;
}

const defaultPreferences: NotificationPreferences = {
  new_listings: true,
  price_changes: true,
  messages: true,
  booking_updates: true,
  system_alerts: true,
  promotions: false,
  email_enabled: true,
  push_enabled: false,
  sms_enabled: false,
  quiet_hours_enabled: false,
  quiet_start_time: null,
  quiet_end_time: null,
};

// Check if notification should be shown based on preferences and quiet hours
const shouldShowNotification = (type: string, prefs: NotificationPreferences): boolean => {
  if (prefs.quiet_hours_enabled && prefs.quiet_start_time && prefs.quiet_end_time) {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    if (prefs.quiet_start_time <= prefs.quiet_end_time) {
      if (currentTime >= prefs.quiet_start_time && currentTime <= prefs.quiet_end_time) return false;
    } else {
      if (currentTime >= prefs.quiet_start_time || currentTime <= prefs.quiet_end_time) return false;
    }
  }

  switch (type) {
    case 'new_match': return prefs.new_listings;
    case 'price_drop': return prefs.price_changes;
    case 'message': return prefs.messages;
    case 'appointment': return prefs.booking_updates;
    case 'system': return prefs.system_alerts;
    default: return true;
  }
};

// Show browser notification if permitted
const showBrowserNotification = (title: string, body: string, icon?: string) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body, icon: icon || '/favicon.ico' });
  }
};

export const useInAppNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('in_app_notifications')
        .select(`*, property:properties(id, title, images)`)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      const typedData = (data || []).map(item => ({
        ...item,
        type: item.type as InAppNotification['type'],
        metadata: item.metadata as Record<string, unknown> | undefined,
      }));
      setNotifications(typedData);
      setUnreadCount(typedData.filter(n => !n.is_read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, [user]);

  // Fetch preferences
  const fetchPreferences = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (error) {
        if (error.code === 'PGRST116') await createDefaultPreferences();
        else throw error;
      } else if (data) {
        setPreferences({
          id: data.id, user_id: data.user_id,
          new_listings: data.new_listings, price_changes: data.price_changes,
          messages: data.messages, booking_updates: data.booking_updates,
          system_alerts: data.system_alerts, promotions: data.promotions,
          email_enabled: data.email_enabled, push_enabled: data.push_enabled,
          sms_enabled: data.sms_enabled, quiet_hours_enabled: data.quiet_hours_enabled,
          quiet_start_time: data.quiet_start_time, quiet_end_time: data.quiet_end_time,
        });
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    }
  }, [user]);

  const createDefaultPreferences = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .insert({
          user_id: user.id,
          ...defaultPreferences,
        })
        .select()
        .single();
      if (error) throw error;
      if (data) {
        setPreferences({
          id: data.id, user_id: data.user_id,
          new_listings: data.new_listings, price_changes: data.price_changes,
          messages: data.messages, booking_updates: data.booking_updates,
          system_alerts: data.system_alerts, promotions: data.promotions,
          email_enabled: data.email_enabled, push_enabled: data.push_enabled,
          sms_enabled: data.sms_enabled, quiet_hours_enabled: data.quiet_hours_enabled,
          quiet_start_time: data.quiet_start_time, quiet_end_time: data.quiet_end_time,
        });
      }
    } catch (error) {
      console.error('Error creating default preferences:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('in_app_notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId)
        .eq('user_id', user.id);
      if (error) throw error;
      setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, is_read: true, read_at: new Date().toISOString() } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('in_app_notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('is_read', false);
      if (error) throw error;
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    if (!user) return;
    try {
      const notification = notifications.find(n => n.id === notificationId);
      const { error } = await supabase
        .from('in_app_notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', user.id);
      if (error) throw error;
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      if (notification && !notification.is_read) setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const bulkDelete = async (ids: string[]) => {
    if (!user || ids.length === 0) return;
    try {
      const { error } = await supabase
        .from('in_app_notifications')
        .delete()
        .in('id', ids)
        .eq('user_id', user.id);
      if (error) throw error;
      const deletedUnread = notifications.filter(n => ids.includes(n.id) && !n.is_read).length;
      setNotifications(prev => prev.filter(n => !ids.includes(n.id)));
      setUnreadCount(prev => Math.max(0, prev - deletedUnread));
    } catch (error) {
      console.error('Error bulk deleting notifications:', error);
    }
  };

  const clearAllNotifications = async () => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('in_app_notifications')
        .delete()
        .eq('user_id', user.id);
      if (error) throw error;
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  const updatePreferences = async (updates: Partial<NotificationPreferences>) => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();
      if (error) throw error;
      if (data) {
        setPreferences({
          id: data.id, user_id: data.user_id,
          new_listings: data.new_listings, price_changes: data.price_changes,
          messages: data.messages, booking_updates: data.booking_updates,
          system_alerts: data.system_alerts, promotions: data.promotions,
          email_enabled: data.email_enabled, push_enabled: data.push_enabled,
          sms_enabled: data.sms_enabled, quiet_hours_enabled: data.quiet_hours_enabled,
          quiet_start_time: data.quiet_start_time, quiet_end_time: data.quiet_end_time,
        });
      }
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  };

  // Initial load
  useEffect(() => {
    if (user) {
      setIsLoading(true);
      Promise.all([fetchNotifications(), fetchPreferences()]).finally(() => setIsLoading(false));
    } else {
      setNotifications([]);
      setPreferences(defaultPreferences);
      setUnreadCount(0);
      setIsLoading(false);
    }
  }, [user, fetchNotifications, fetchPreferences]);

  // Real-time subscription with toast + browser notifications
  useEffect(() => {
    if (!user) return;

    // Request browser notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const channel = supabase
      .channel('in_app_notifications_realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'in_app_notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const n = payload.new as InAppNotification;

          // Check preferences
          if (!shouldShowNotification(n.type, preferences)) return;

          // Add to state
          setNotifications(prev => [n, ...prev.slice(0, 49)]);
          setUnreadCount(prev => prev + 1);

          // In-app toast notification
          const toastIcon = {
            price_drop: '💰',
            new_match: '🏠',
            appointment: '📅',
            message: '💬',
            system: '🔔',
            market_insight: '📊',
            favorite: '⭐',
          }[n.type] || '🔔';

          toast(n.title, {
            description: n.message,
            icon: toastIcon,
            duration: 6000,
            action: n.property_id ? {
              label: 'View',
              onClick: () => {
                window.location.href = `/properties/${n.property_id}`;
              },
            } : undefined,
          });

          // Browser push notification
          if (preferences.push_enabled) {
            showBrowserNotification(n.title, n.message);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, preferences]);

  return {
    notifications,
    preferences,
    isLoading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    bulkDelete,
    clearAllNotifications,
    updatePreferences,
    refetch: fetchNotifications,
  };
};
