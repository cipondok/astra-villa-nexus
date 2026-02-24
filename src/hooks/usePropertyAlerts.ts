import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface PropertyAlert {
  id: string;
  user_id: string;
  search_id: string;
  property_id: string;
  search_name: string | null;
  property_title: string | null;
  property_image: string | null;
  property_price: number | null;
  match_reason: string | null;
  is_read: boolean;
  created_at: string;
}

export const usePropertyAlerts = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const queryClient = useQueryClient();

  // Fetch unread alerts count
  const { data: unreadAlerts = 0 } = useQuery({
    queryKey: ['property-alerts-unread', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      const { count, error } = await supabase
        .from('property_alerts')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
      if (error) return 0;
      return count || 0;
    },
    enabled: !!user?.id,
    refetchInterval: 60000, // fallback polling every 60s
  });

  // Fetch recent alerts
  const { data: alerts = [] } = useQuery({
    queryKey: ['property-alerts', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('property_alerts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) return [];
      return (data || []) as unknown as PropertyAlert[];
    },
    enabled: !!user?.id,
  });

  // Realtime subscription — push new alerts as notifications
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('property-alerts-realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'property_alerts',
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        const alert = payload.new as PropertyAlert;
        
        // Push to notification context
        addNotification({
          type: 'info',
          category: 'property',
          title: `New match: ${alert.property_title || 'New Property'}`,
          message: `Matches "${alert.search_name || 'your search'}". ${alert.match_reason || ''}`,
          propertyId: alert.property_id,
          propertyTitle: alert.property_title || undefined,
          propertyImage: alert.property_image || undefined,
        });

        // Show browser notification if permitted
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('🏠 New Property Match!', {
            body: `${alert.property_title || 'New listing'} matches "${alert.search_name}"`,
            icon: alert.property_image || '/favicon.ico',
          });
        }

        // Refresh queries
        queryClient.invalidateQueries({ queryKey: ['property-alerts', user.id] });
        queryClient.invalidateQueries({ queryKey: ['property-alerts-unread', user.id] });
      })
      .subscribe();

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => { supabase.removeChannel(channel); };
  }, [user?.id, addNotification, queryClient]);

  // Mark alerts as read
  const markAlertRead = async (alertId: string) => {
    await supabase
      .from('property_alerts')
      .update({ is_read: true })
      .eq('id', alertId);
    queryClient.invalidateQueries({ queryKey: ['property-alerts', user?.id] });
    queryClient.invalidateQueries({ queryKey: ['property-alerts-unread', user?.id] });
  };

  const markAllAlertsRead = async () => {
    if (!user?.id) return;
    await supabase
      .from('property_alerts')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);
    queryClient.invalidateQueries({ queryKey: ['property-alerts', user?.id] });
    queryClient.invalidateQueries({ queryKey: ['property-alerts-unread', user?.id] });
  };

  return {
    alerts,
    unreadAlerts,
    markAlertRead,
    markAllAlertsRead,
  };
};
