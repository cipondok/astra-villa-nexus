import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface HealthMonitorConfig {
  id: string;
  key: string;
  value: number;
  description: string;
  updated_at: string;
}

const QUERY_KEY = ['health-monitor-config'];

export function useHealthMonitorConfig() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('health_monitor_config')
        .select('*')
        .order('key', { ascending: true });
      if (error) throw error;
      return (data as any[]).map((row: any) => ({
        ...row,
        value: typeof row.value === 'number' ? row.value : Number(row.value),
      })) as HealthMonitorConfig[];
    },
  });
}

export function useUpdateHealthMonitorConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: number }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await (supabase as any)
        .from('health_monitor_config')
        .update({ value, updated_by: user?.id, updated_at: new Date().toISOString() })
        .eq('key', key);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success('Threshold updated');
    },
    onError: (e: Error) => toast.error('Update failed: ' + e.message),
  });
}
