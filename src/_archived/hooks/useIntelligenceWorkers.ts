import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface WorkerStatus {
  worker_name: string;
  last_status: string;
  last_rows_affected: number;
  last_duration_ms: number;
  last_run_at: string;
}

export interface IntelligenceCronResponse {
  success: boolean;
  workers_executed: number;
  results: Array<{
    worker: string;
    status: 'success' | 'error';
    rows_affected: number;
    duration_ms: number;
    error?: string;
  }>;
  timestamp: string;
}

export function useWorkerStatus() {
  return useQuery({
    queryKey: ['intelligence-worker-status'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_intelligence_worker_status' as any);
      if (error) throw error;
      return (data ?? []) as unknown as WorkerStatus[];
    },
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export function useMarketClusters() {
  return useQuery({
    queryKey: ['market-clusters'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('market_clusters')
        .select('*')
        .order('market_heat_score', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
    staleTime: 60_000,
  });
}

export function useRunIntelligenceCron() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (params?: { workers?: string[]; batch_size?: number }): Promise<IntelligenceCronResponse> => {
      const { data, error } = await supabase.functions.invoke('intelligence-cron', {
        body: params ?? {},
      });
      if (error) throw error;
      return data as IntelligenceCronResponse;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['intelligence-worker-status'] });
      qc.invalidateQueries({ queryKey: ['market-clusters'] });
      qc.invalidateQueries({ queryKey: ['properties'] });
      qc.invalidateQueries({ queryKey: ['autopilot-status'] });

      const ok = data.results.filter(r => r.status === 'success').length;
      const totalRows = data.results.reduce((s, r) => s + r.rows_affected, 0);
      toast.success(`Intelligence cron: ${ok}/${data.workers_executed} workers — ${totalRows} rows processed`);
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Intelligence cron failed');
    },
  });
}

export const INTELLIGENCE_WORKERS = {
  opportunity_scoring: { label: 'Opportunity Scoring', desc: 'Weighted formula recalculation' },
  deal_alerts: { label: 'Deal Alerts', desc: 'Scan & generate deal signals' },
  market_clusters: { label: 'Market Clusters', desc: 'Geo-aggregate cluster intelligence' },
  demand_heat_sync: { label: 'Demand Heat Sync', desc: 'Sync cluster heat to properties' },
  portfolio_snapshots: { label: 'Portfolio Snapshots', desc: 'Investor analytics refresh' },
} as const;
