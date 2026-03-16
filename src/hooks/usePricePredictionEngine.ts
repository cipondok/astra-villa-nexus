import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PricePredictionStats {
  total_predicted: number;
  total_active: number;
  coverage_pct: number;
  avg_confidence: number;
  avg_gap_pct: number;
  deeply_undervalued: number;
  slightly_undervalued: number;
  fairly_priced: number;
  overpriced: number;
  bubble_risk: number;
  strong_growth: number;
  moderate_growth: number;
  stable: number;
  decline_risk: number;
  flip_opportunities: number;
  hold_candidates: number;
  risk_zones: number;
}

export type ValuationLabel = 'Deeply Undervalued' | 'Slightly Undervalued' | 'Fairly Priced' | 'Overpriced' | 'High Bubble Risk' | 'unknown';
export type PriceTrendSignal = 'Strong Growth' | 'Moderate Growth' | 'Stable' | 'Decline Risk';

export function usePricePredictionStats() {
  return useQuery({
    queryKey: ['price-prediction-stats'],
    queryFn: async (): Promise<PricePredictionStats> => {
      const { data, error } = await supabase.rpc('get_price_prediction_stats' as any);
      if (error) throw error;
      return data as unknown as PricePredictionStats;
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useComputePricePredictions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (limit: number = 100) => {
      const { data, error } = await supabase.rpc('compute_price_predictions' as any, { p_limit: limit });
      if (error) throw error;
      return data as unknown as { properties_predicted: number; duration_ms: number; timestamp: string };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['price-prediction-stats'] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['investment-leaderboard'] });
      toast.success(`Predicted ${data.properties_predicted} properties in ${Math.round(data.duration_ms)}ms`);
    },
    onError: (err: Error) => toast.error(err.message || 'Prediction failed'),
  });
}

export const VALUATION_CONFIG: Record<string, { color: string; icon: string; bg: string }> = {
  'Deeply Undervalued': { color: 'text-chart-1', icon: '💎', bg: 'bg-chart-1/10' },
  'Slightly Undervalued': { color: 'text-primary', icon: '📉', bg: 'bg-primary/10' },
  'Fairly Priced': { color: 'text-foreground', icon: '⚖️', bg: 'bg-muted/20' },
  'Overpriced': { color: 'text-chart-4', icon: '📈', bg: 'bg-chart-4/10' },
  'High Bubble Risk': { color: 'text-destructive', icon: '🫧', bg: 'bg-destructive/10' },
  'unknown': { color: 'text-muted-foreground', icon: '❓', bg: 'bg-muted/10' },
};

export const TREND_CONFIG: Record<string, { color: string; icon: string }> = {
  'Strong Growth': { color: 'text-chart-1', icon: '🚀' },
  'Moderate Growth': { color: 'text-primary', icon: '📈' },
  'Stable': { color: 'text-chart-4', icon: '➡️' },
  'Decline Risk': { color: 'text-destructive', icon: '📉' },
};

export const HINT_CONFIG: Record<string, { color: string; icon: string }> = {
  'Potential flip opportunity': { color: 'text-chart-1', icon: '🎯' },
  'Strong acquisition candidate': { color: 'text-primary', icon: '✅' },
  'Long-term hold candidate': { color: 'text-chart-2', icon: '🏠' },
  'Fair entry point': { color: 'text-foreground', icon: '⚖️' },
  'Wait for price correction': { color: 'text-chart-4', icon: '⏳' },
  'Short-term risk zone': { color: 'text-destructive', icon: '⚠️' },
};
