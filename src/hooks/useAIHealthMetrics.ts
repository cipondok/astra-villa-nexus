import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AIHealthMetrics {
  total_properties: number;
  pct_scored: number;
  pct_roi: number;
  pct_deal: number;
  pct_insight: number;
  pending_jobs: number;
  running_jobs: number;
  avg_latency_sec: number;
  alert_freq_24h: number;
  stale_items: { type: string; property_id: string; last_computed: string; freshness: number }[];
}

export interface AIReadinessScore {
  readiness_score: number;
  coverage_scored: number;
  coverage_roi: number;
  coverage_deal: number;
  coverage_insight: number;
  freshness_avg: number;
  alert_health: number;
  job_success_rate: number;
  total_properties: number;
}

export function useAIHealthMetrics() {
  return useQuery({
    queryKey: ['ai-health-metrics'],
    queryFn: async (): Promise<AIHealthMetrics> => {
      const { data, error } = await supabase.rpc('get_ai_health_metrics');
      if (error) throw error;
      return data as unknown as AIHealthMetrics;
    },
    refetchInterval: 30_000,
    staleTime: 15_000,
  });
}

export function useAIReadinessScore() {
  return useQuery({
    queryKey: ['ai-readiness-score'],
    queryFn: async (): Promise<AIReadinessScore> => {
      const { data, error } = await supabase.rpc('compute_ai_readiness');
      if (error) throw error;
      return data as unknown as AIReadinessScore;
    },
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}

export function useReadinessHistory() {
  return useQuery({
    queryKey: ['ai-readiness-history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_readiness_snapshots')
        .select('readiness_score, computed_at, component_scores')
        .order('computed_at', { ascending: false })
        .limit(30);
      if (error) throw error;
      return (data || []).reverse();
    },
    staleTime: 60_000,
  });
}
