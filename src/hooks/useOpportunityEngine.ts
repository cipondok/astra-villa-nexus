import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface OpportunityScoreStats {
  total_scored: number;
  total_active: number;
  avg_score: number;
  median_score: number;
  elite_count: number;
  strong_count: number;
  moderate_count: number;
  weak_count: number;
  unscored_count: number;
  risk_distribution: { low: number; medium: number; high: number };
  trend_distribution: { hot: number; stable: number; cooling: number };
  avg_luxury_index: number;
  avg_forecast_3m: number;
  last_batch_run: string | null;
  coverage_pct: number;
}

/** Fetch scoring engine stats */
export function useOpportunityScoreStats() {
  return useQuery({
    queryKey: ['opportunity-score-stats'],
    queryFn: async (): Promise<OpportunityScoreStats> => {
      const { data, error } = await supabase.rpc('get_opportunity_score_stats' as any);
      if (error) throw error;
      return data as unknown as OpportunityScoreStats;
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}

/** Compute score for a single property */
export function useComputePropertyScore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (propertyId: string) => {
      const { data, error } = await supabase.rpc('compute_opportunity_score' as any, {
        p_property_id: propertyId,
      });
      if (error) throw error;
      return data as number;
    },
    onSuccess: (score, propertyId) => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['opportunity-score-stats'] });
      queryClient.invalidateQueries({ queryKey: ['investment-leaderboard'] });
      toast.success(`Score computed: ${score}/100`);
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to compute score');
    },
  });
}

/** Batch refresh opportunity scores */
export function useBatchRefreshScores() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (limit = 200) => {
      const { data, error } = await supabase.rpc('batch_refresh_opportunity_scores' as any, {
        p_limit: limit,
      });
      if (error) throw error;
      return data as { updated: number; duration_ms: number; timestamp: string };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['opportunity-score-stats'] });
      queryClient.invalidateQueries({ queryKey: ['investment-leaderboard'] });
      queryClient.invalidateQueries({ queryKey: ['market-heat-zones'] });
      queryClient.invalidateQueries({ queryKey: ['investment-ranking'] });
      if (data?.updated > 0) {
        toast.success(`Scored ${data.updated} properties in ${Math.round(data.duration_ms)}ms`);
      } else {
        toast.info('No properties needed scoring');
      }
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Batch refresh failed');
    },
  });
}

/** Score tier helpers */
export const SCORE_TIERS = {
  elite: { min: 85, label: 'Elite', color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/30' },
  strong: { min: 65, label: 'Strong', color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/30' },
  moderate: { min: 40, label: 'Moderate', color: 'text-primary', bg: 'bg-primary/10 border-primary/30' },
  weak: { min: 0, label: 'Weak', color: 'text-muted-foreground', bg: 'bg-muted/20 border-border/30' },
} as const;

export function getScoreTier(score: number) {
  if (score >= 85) return SCORE_TIERS.elite;
  if (score >= 65) return SCORE_TIERS.strong;
  if (score >= 40) return SCORE_TIERS.moderate;
  return SCORE_TIERS.weak;
}

export const RISK_LABELS = {
  low: { label: 'Low Risk', color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/30' },
  medium: { label: 'Medium', color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/30' },
  high: { label: 'High Risk', color: 'text-destructive', bg: 'bg-destructive/10 border-destructive/30' },
} as const;

export const DEMAND_LABELS = {
  hot: { label: 'Hot', icon: '🔥', color: 'text-orange-500', bg: 'bg-orange-500/10 border-orange-500/30' },
  stable: { label: 'Stable', icon: '⚖️', color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/30' },
  cooling: { label: 'Cooling', icon: '❄️', color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/30' },
} as const;
