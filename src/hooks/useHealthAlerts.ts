import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';
import { toast } from 'sonner';

export interface HealthAlert {
  id: string;
  alert_type: string;
  alert_key: string;
  severity: string;
  message: string;
  metadata: Record<string, any>;
  resolved: boolean;
  resolved_at: string | null;
  created_at: string;
}

const QUERY_KEY = ['health-alerts'];

export function useHealthAlerts(showResolved = false) {
  const qc = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('health-alerts-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'health_alert_log' }, () => {
        qc.invalidateQueries({ queryKey: QUERY_KEY });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [qc]);

  return useQuery({
    queryKey: [...QUERY_KEY, showResolved],
    queryFn: async () => {
      let query = (supabase as any)
        .from('health_alert_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (!showResolved) {
        query = query.eq('resolved', false);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as HealthAlert[];
    },
    refetchInterval: 30000,
  });
}

export function useResolveHealthAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from('health_alert_log')
        .update({ resolved: true, resolved_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success('Alert resolved');
    },
    onError: (e: Error) => toast.error('Failed to resolve: ' + e.message),
  });
}

export function useResolveAllHealthAlerts() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { error } = await (supabase as any)
        .from('health_alert_log')
        .update({ resolved: true, resolved_at: new Date().toISOString() })
        .eq('resolved', false);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success('All alerts resolved');
    },
    onError: (e: Error) => toast.error('Failed: ' + e.message),
  });
}

export function useTriggerHealthCheck() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('health-monitor', { body: {} });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      if (data?.alertsDetected > 0) {
        toast.warning(`Health check found ${data.alertsDetected} issue(s)`);
      } else {
        toast.success('Health check passed — no issues detected');
      }
    },
    onError: (e: Error) => toast.error('Health check failed: ' + e.message),
  });
}
