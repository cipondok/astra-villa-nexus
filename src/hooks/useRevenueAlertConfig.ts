import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface RevenueAlertConfig {
  id: number;
  daily_revenue_min: number;
  daily_commission_max: number;
  rental_revenue_min: number;
  alert_cooldown_hours: number;
  is_enabled: boolean;
  updated_at: string;
}

export function useRevenueAlertConfig() {
  const queryClient = useQueryClient();

  const config = useQuery({
    queryKey: ['revenue-alert-config'],
    queryFn: async (): Promise<RevenueAlertConfig> => {
      const { data, error } = await supabase
        .from('revenue_alert_config')
        .select('*')
        .eq('id', 1)
        .single();
      if (error) throw error;
      return data as RevenueAlertConfig;
    },
    staleTime: 60_000,
  });

  const updateConfig = useMutation({
    mutationFn: async (updates: Partial<Omit<RevenueAlertConfig, 'id' | 'updated_at'>>) => {
      const { error } = await supabase
        .from('revenue_alert_config')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', 1);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['revenue-alert-config'] });
      toast.success('Revenue alert settings saved');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to save settings');
    },
  });

  return { config, updateConfig };
}

export interface RevenueAlert {
  id: string;
  type: string;
  title: string;
  message: string;
  priority: string;
  is_read: boolean;
  created_at: string;
  metadata: Record<string, any> | null;
}

const REVENUE_ALERT_TYPES = ['revenue_drop', 'commission_overbudget', 'rental_revenue_low'];

export function useRevenueAlerts() {
  return useQuery({
    queryKey: ['revenue-alerts'],
    queryFn: async (): Promise<RevenueAlert[]> => {
      const { data, error } = await supabase
        .from('admin_alerts')
        .select('id, type, title, message, priority, is_read, created_at, metadata')
        .in('type', REVENUE_ALERT_TYPES)
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data || []) as RevenueAlert[];
    },
    staleTime: 30_000,
    refetchInterval: 30_000,
  });
}
