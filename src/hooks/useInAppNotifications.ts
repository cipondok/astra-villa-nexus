import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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
  // Joined property data
  property?: {
    id: string;
    title: string;
    images?: string[];
  };
}

// Uses existing notification_preferences table schema
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
        .select(`
          *,
          property:properties(id, title, images)
        `)
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

  // Fetch preferences from existing table
  const fetchPreferences = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No preferences found, create defaults
          await createDefaultPreferences();
        } else {
          throw error;
        }
      } else if (data) {
        setPreferences({
          id: data.id,
          user_id: data.user_id,
          new_listings: data.new_listings,
          price_changes: data.price_changes,
          messages: data.messages,
          booking_updates: data.booking_updates,
          system_alerts: data.system_alerts,
          promotions: data.promotions,
          email_enabled: data.email_enabled,
          push_enabled: data.push_enabled,
          sms_enabled: data.sms_enabled,
          quiet_hours_enabled: data.quiet_hours_enabled,
          quiet_start_time: data.quiet_start_time,
          quiet_end_time: data.quiet_end_time,
        });
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    }
  }, [user]);

  // Create default preferences
  const createDefaultPreferences = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .insert({ 
          user_id: user.id,
          new_listings: defaultPreferences.new_listings,
          price_changes: defaultPreferences.price_changes,
          messages: defaultPreferences.messages,
          booking_updates: defaultPreferences.booking_updates,
          system_alerts: defaultPreferences.system_alerts,
          promotions: defaultPreferences.promotions,
          email_enabled: defaultPreferences.email_enabled,
          push_enabled: defaultPreferences.push_enabled,
          sms_enabled: defaultPreferences.sms_enabled,
          quiet_hours_enabled: defaultPreferences.quiet_hours_enabled,
        })
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setPreferences({
          id: data.id,
          user_id: data.user_id,
          new_listings: data.new_listings,
          price_changes: data.price_changes,
          messages: data.messages,
          booking_updates: data.booking_updates,
          system_alerts: data.system_alerts,
          promotions: data.promotions,
          email_enabled: data.email_enabled,
          push_enabled: data.push_enabled,
          sms_enabled: data.sms_enabled,
          quiet_hours_enabled: data.quiet_hours_enabled,
          quiet_start_time: data.quiet_start_time,
          quiet_end_time: data.quiet_end_time,
        });
      }
    } catch (error) {
      console.error('Error creating default preferences:', error);
    }
  };

  // Mark single notification as read
  const markAsRead = async (notificationId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('in_app_notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true, read_at: new Date().toISOString() } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
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

  // Delete notification
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
      if (notification && !notification.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Clear all notifications
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

  // Update preferences
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
          id: data.id,
          user_id: data.user_id,
          new_listings: data.new_listings,
          price_changes: data.price_changes,
          messages: data.messages,
          booking_updates: data.booking_updates,
          system_alerts: data.system_alerts,
          promotions: data.promotions,
          email_enabled: data.email_enabled,
          push_enabled: data.push_enabled,
          sms_enabled: data.sms_enabled,
          quiet_hours_enabled: data.quiet_hours_enabled,
          quiet_start_time: data.quiet_start_time,
          quiet_end_time: data.quiet_end_time,
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
      Promise.all([fetchNotifications(), fetchPreferences()]).finally(() => {
        setIsLoading(false);
      });
    } else {
      setNotifications([]);
      setPreferences(defaultPreferences);
      setUnreadCount(0);
      setIsLoading(false);
    }
  }, [user, fetchNotifications, fetchPreferences]);

  // Real-time subscription for new notifications
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('in_app_notifications_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'in_app_notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotification = payload.new as InAppNotification;
          setNotifications(prev => [newNotification, ...prev.slice(0, 49)]);
          setUnreadCount(prev => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    notifications,
    preferences,
    isLoading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    updatePreferences,
    refetch: fetchNotifications,
  };
};
