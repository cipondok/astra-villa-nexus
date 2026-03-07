import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { throwIfEdgeFunctionReturnedError } from '@/lib/supabaseFunctionErrors';
import { toast } from 'sonner';

export interface AgentScanLog {
  id: string;
  scan_type: string;
  status: string;
  total_properties_scanned: number;
  total_alerts_created: number;
  total_users_notified: number;
  summary: Record<string, number>;
  duration_ms: number;
  error_message: string | null;
  created_at: string;
}

export interface AgentOpportunity {
  property_id: string;
  title: string;
  city: string;
  price: number;
  property_type: string;
  thumbnail_url: string | null;
  signals: string[];
  deal_score: number;
  message: string;
  metadata: Record<string, any>;
}

export interface AgentScanResult {
  alerts: AgentOpportunity[];
  summary: Record<string, number>;
  alerts_created: number;
  notified_users: number;
  total_properties_scanned: number;
  total_opportunities: number;
  duration_ms: number;
  generated_at: string;
}

/** Fetch scan history */
export function useAgentScanHistory() {
  return useQuery({
    queryKey: ['agent-scan-history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('autonomous_agent_scans')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data || []) as AgentScanLog[];
    },
    staleTime: 60 * 1000,
  });
}

/** Run autonomous agent scan */
export function useRunAgentScan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<AgentScanResult> => {
      const { data, error } = await supabase.functions.invoke('core-engine', {
        body: { mode: 'investor_alerts', scan_type: 'manual' },
      });
      if (error) throw error;
      throwIfEdgeFunctionReturnedError(data);
      return data?.data as AgentScanResult;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['agent-scan-history'] });
      queryClient.invalidateQueries({ queryKey: ['investor-alert-notifications'] });
      const total = data.alerts_created;
      if (total > 0) {
        toast.success(`${total} alert baru untuk ${data.notified_users} investor (${data.total_opportunities} peluang terdeteksi)`);
      } else {
        toast.info(`Scan selesai — ${data.total_properties_scanned} properti, ${data.total_opportunities} peluang terdeteksi`);
      }
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Gagal menjalankan scan');
    },
  });
}
