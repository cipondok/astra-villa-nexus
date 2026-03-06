import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface DealAlert {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
  property_id: string | null;
  metadata: {
    deal_score_percent?: number;
    fair_market_value?: number;
    alert_id?: string;
    alert_name?: string;
  } | null;
}

export function useDealAlerts() {
  const { user } = useAuth();

  const alerts = useQuery({
    queryKey: ['deal-alerts', user?.id],
    queryFn: async (): Promise<DealAlert[]> => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('in_app_notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'deal_alert')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data || []) as DealAlert[];
    },
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000,
  });

  const unreadCount = (alerts.data || []).filter(a => !a.is_read).length;

  return { ...alerts, unreadCount };
}

export function useMarkDealAlertRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from('in_app_notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', alertId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deal-alerts'] });
    },
  });
}

export function useRunDealAlertsScan() {
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('core-engine', {
        body: { mode: 'deal_alerts' },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data?.data as {
        alerts_created: number;
        notified_users: number;
        deals_found: number;
        top_deals: Array<{
          id: string;
          title: string;
          city: string;
          deal_score_percent: number;
          fair_market_value: number;
        }>;
      };
    },
    onSuccess: (data) => {
      if (data.alerts_created > 0) {
        toast.success(`Found ${data.deals_found} deals, created ${data.alerts_created} alerts for ${data.notified_users} users`);
      } else {
        toast.info(`Scanned listings: ${data.deals_found} deals found, no new alerts needed`);
      }
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Deal scan failed');
    },
  });
}
