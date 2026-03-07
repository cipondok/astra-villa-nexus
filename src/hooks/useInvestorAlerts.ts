import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { throwIfEdgeFunctionReturnedError } from '@/lib/supabaseFunctionErrors';
import { toast } from 'sonner';

export type InvestorAlertType = 'price_drop' | 'high_rental_yield' | 'undervalued_property' | 'high_market_growth';

export interface InvestorAlert {
  user_id: string;
  property_id: string;
  alert_type: InvestorAlertType;
  message: string;
  property_title: string;
  city: string;
  score: number;
  metadata: Record<string, any>;
}

export interface InvestorAlertsSummary {
  price_drop: number;
  high_rental_yield: number;
  undervalued_property: number;
  high_market_growth: number;
}

export interface InvestorAlertsResult {
  alerts: InvestorAlert[];
  summary: InvestorAlertsSummary;
  alerts_created: number;
  notified_users: number;
  total_properties_scanned: number;
  generated_at: string;
}

/** Fetch investor alert notifications for the current user */
export function useInvestorAlertNotifications() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['investor-alert-notifications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('in_app_notifications')
        .select('*')
        .eq('user_id', user.id)
        .in('type', ['investor_price_drop', 'investor_high_rental_yield', 'investor_undervalued_property', 'investor_high_market_growth', 'investor_high_deal_score', 'investor_high_investment_score'])
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000,
  });
}

/** Run the investor alerts scan (admin/manual trigger) */
export function useRunInvestorAlertsScan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<InvestorAlertsResult> => {
      const { data, error } = await supabase.functions.invoke('core-engine', {
        body: { mode: 'investor_alerts' },
      });
      if (error) throw error;
      throwIfEdgeFunctionReturnedError(data);
      return data?.data as InvestorAlertsResult;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['investor-alert-notifications'] });
      const total = data.alerts_created;
      if (total > 0) {
        toast.success(`${total} alert baru dibuat untuk ${data.notified_users} investor`);
      } else {
        toast.info(`Scan selesai — ${data.total_properties_scanned} properti dianalisis, tidak ada alert baru`);
      }
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Gagal menjalankan scan investor alerts');
    },
  });
}

/** Mark an investor alert as read */
export function useMarkInvestorAlertRead() {
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
      queryClient.invalidateQueries({ queryKey: ['investor-alert-notifications'] });
    },
  });
}
