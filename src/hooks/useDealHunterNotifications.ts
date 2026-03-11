import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface DealHunterNotification {
  id: string;
  user_id: string;
  opportunity_id: string;
  property_id: string;
  deal_classification: string;
  deal_tier: string;
  deal_score: number;
  urgency_score: number;
  match_reason: string[];
  title: string;
  message: string;
  property_title: string | null;
  property_city: string | null;
  property_price: number | null;
  thumbnail_url: string | null;
  undervaluation_percent: number;
  estimated_fair_value: number;
  expires_at: string | null;
  is_read: boolean;
  is_dismissed: boolean;
  channel: string;
  email_sent: boolean;
  push_sent: boolean;
  created_at: string;
}

export function useDealHunterNotifications(limit = 20) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['deal-hunter-notifications', user?.id, limit],
    queryFn: async (): Promise<DealHunterNotification[]> => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('deal_hunter_notifications' as any)
        .select('*')
        .eq('user_id', user.id)
        .eq('is_dismissed', false)
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data || []) as unknown as DealHunterNotification[];
    },
    enabled: !!user?.id,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000, // Poll every minute for new alerts
  });
}

export function useDealHunterUnreadCount() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['deal-hunter-unread-count', user?.id],
    queryFn: async (): Promise<number> => {
      if (!user?.id) return 0;
      const { count, error } = await supabase
        .from('deal_hunter_notifications' as any)
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false)
        .eq('is_dismissed', false);
      if (error) return 0;
      return count || 0;
    },
    enabled: !!user?.id,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });
}

export function useMarkDealNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('deal_hunter_notifications' as any)
        .update({ is_read: true } as any)
        .eq('id', notificationId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deal-hunter-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['deal-hunter-unread-count'] });
    },
  });
}

export function useDismissDealNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('deal_hunter_notifications' as any)
        .update({ is_dismissed: true } as any)
        .eq('id', notificationId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deal-hunter-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['deal-hunter-unread-count'] });
    },
  });
}

/** Get time remaining until expiry */
export function getUrgencyCountdown(expiresAt: string | null): { label: string; isExpired: boolean; urgencyLevel: 'critical' | 'warning' | 'normal' } {
  if (!expiresAt) return { label: 'No expiry', isExpired: false, urgencyLevel: 'normal' };
  
  const now = Date.now();
  const exp = new Date(expiresAt).getTime();
  const diff = exp - now;
  
  if (diff <= 0) return { label: 'Expired', isExpired: true, urgencyLevel: 'critical' };
  
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  
  if (days > 3) return { label: `${days}d left`, isExpired: false, urgencyLevel: 'normal' };
  if (days >= 1) return { label: `${days}d ${remainingHours}h left`, isExpired: false, urgencyLevel: 'warning' };
  return { label: `${hours}h left`, isExpired: false, urgencyLevel: 'critical' };
}
