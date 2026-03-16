import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface WorkerRunResult {
  worker: string;
  status: 'success' | 'error';
  items_processed: number;
  duration_ms: number;
  error?: string;
}

export interface AutopilotWorkerResponse {
  success: boolean;
  workers_executed: number;
  results: WorkerRunResult[];
  timestamp: string;
}

export interface WorkerRun {
  worker_name: string;
  status: string;
  items_processed: number;
  duration_ms: number;
  started_at: string;
  completed_at: string | null;
  error_message: string | null;
}

export interface AutopilotStatus {
  workers: WorkerRun[] | null;
  property_stats: {
    total_active: number;
    scored: number;
    predicted: number;
    heat_mapped: number;
  };
  cluster_count: number;
  deal_alerts_24h: number;
  portfolio_snapshots: number;
  timestamp: string;
}

export function useAutopilotStatus() {
  return useQuery({
    queryKey: ['autopilot-status'],
    queryFn: async (): Promise<AutopilotStatus> => {
      const { data, error } = await supabase.rpc('get_autopilot_status' as any);
      if (error) throw error;
      return data as unknown as AutopilotStatus;
    },
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export function useRunAutopilotWorkers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params?: { workers?: string[]; batch_size?: number }): Promise<AutopilotWorkerResponse> => {
      const { data, error } = await supabase.functions.invoke('autopilot-worker', {
        body: params ?? {},
      });
      if (error) throw error;
      return data as AutopilotWorkerResponse;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['autopilot-status'] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['opportunity-score-stats'] });
      queryClient.invalidateQueries({ queryKey: ['price-prediction-stats'] });
      queryClient.invalidateQueries({ queryKey: ['market-heat-zones'] });
      queryClient.invalidateQueries({ queryKey: ['investment-ranking'] });
      queryClient.invalidateQueries({ queryKey: ['ai-command-center-batch'] });

      const succeeded = data.results.filter(r => r.status === 'success').length;
      const failed = data.results.filter(r => r.status === 'error').length;
      const totalItems = data.results.reduce((s, r) => s + r.items_processed, 0);

      if (failed === 0) {
        toast.success(`Autopilot: ${succeeded} workers completed — ${totalItems} items processed`);
      } else {
        toast.warning(`Autopilot: ${succeeded} succeeded, ${failed} failed — ${totalItems} items`);
      }
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Autopilot worker execution failed');
    },
  });
}

export const WORKER_NAMES: Record<string, { label: string; description: string }> = {
  opportunity_scoring: { label: 'Opportunity Scoring', description: 'Batch refresh property opportunity scores' },
  price_prediction: { label: 'Price Prediction', description: 'Compute AI valuations and forecasts' },
  heat_clusters: { label: 'Heat Clusters', description: 'Aggregate geo-market cluster intelligence' },
  risk_levels: { label: 'Risk Assessment', description: 'Compute investment risk classifications' },
  heat_sync: { label: 'Heat Sync', description: 'Sync cluster heat scores to properties' },
  deal_alerts: { label: 'Deal Alerts', description: 'Generate intelligent deal notifications' },
};
