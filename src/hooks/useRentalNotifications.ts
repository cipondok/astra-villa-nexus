import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface RentalNotificationSettings {
  id: string;
  user_id: string;
  payment_due_reminder: boolean;
  payment_due_days_before: number;
  payment_overdue_alert: boolean;
  lease_expiry_reminder: boolean;
  lease_expiry_days_before: number;
  maintenance_status_update: boolean;
  maintenance_new_request: boolean;
  inspection_scheduled: boolean;
  inspection_days_before: number;
  deposit_status_change: boolean;
  chat_messages: boolean;
  document_uploads: boolean;
  booking_status_change: boolean;
  notify_in_app: boolean;
  notify_email: boolean;
  notify_push: boolean;
  quiet_hours_enabled: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
}

export interface RentalNotificationLog {
  id: string;
  user_id: string;
  notification_type: string;
  reference_id: string | null;
  reference_type: string | null;
  title: string;
  message: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

const defaultSettings: Omit<RentalNotificationSettings, 'id' | 'user_id'> = {
  payment_due_reminder: true,
  payment_due_days_before: 3,
  payment_overdue_alert: true,
  lease_expiry_reminder: true,
  lease_expiry_days_before: 30,
  maintenance_status_update: true,
  maintenance_new_request: true,
  inspection_scheduled: true,
  inspection_days_before: 2,
  deposit_status_change: true,
  chat_messages: true,
  document_uploads: true,
  booking_status_change: true,
  notify_in_app: true,
  notify_email: false,
  notify_push: false,
  quiet_hours_enabled: false,
  quiet_hours_start: '22:00',
  quiet_hours_end: '07:00',
};

export function useRentalNotificationSettings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['rental-notification-settings', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('rental_notification_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) throw error;
      return data as RentalNotificationSettings | null;
    },
    enabled: !!user,
  });

  const updateSettings = useMutation({
    mutationFn: async (updates: Partial<RentalNotificationSettings>) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('rental_notification_settings')
        .upsert({
          user_id: user.id,
          ...defaultSettings,
          ...settings,
          ...updates,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rental-notification-settings'] });
      toast.success('Pengaturan notifikasi disimpan');
    },
    onError: () => {
      toast.error('Gagal menyimpan pengaturan');
    },
  });

  return {
    settings: settings || (defaultSettings as any),
    isLoading,
    updateSettings: updateSettings.mutate,
    isSaving: updateSettings.isPending,
  };
}

export function useRentalNotificationLog() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['rental-notification-log', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('rental_notification_log')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as RentalNotificationLog[];
    },
    enabled: !!user,
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAsRead = useCallback(async (notificationId: string) => {
    await supabase
      .from('rental_notification_log')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', notificationId);
    queryClient.invalidateQueries({ queryKey: ['rental-notification-log'] });
  }, [queryClient]);

  const markAllAsRead = useCallback(async () => {
    if (!user) return;
    await supabase
      .from('rental_notification_log')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('is_read', false);
    queryClient.invalidateQueries({ queryKey: ['rental-notification-log'] });
    toast.success('Semua notifikasi ditandai terbaca');
  }, [user, queryClient]);

  return { notifications, unreadCount, isLoading, markAsRead, markAllAsRead };
}
