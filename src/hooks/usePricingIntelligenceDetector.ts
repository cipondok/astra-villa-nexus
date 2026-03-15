import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PricingSignal {
  listing_id: string;
  title: string;
  city: string;
  price: number;
  pricing_signal: 'REDUCE_PRICE' | 'INCREASE_PRICE' | 'HOLD_PRICE';
  adjustment_range: string;
  confidence_level: 'HIGH' | 'MEDIUM' | 'LOW';
  expected_market_impact: string;
  metrics: {
    deal_score: number;
    demand_signal: number;
    liquidity_score: number;
    underval_pct: number;
    market_growth: number;
  };
}

export interface PricingIntelligenceResult {
  signals: PricingSignal[];
  total_signals: number;
  reduce_count: number;
  increase_count: number;
  hold_count: number;
  scanned_at: string;
}

export function usePricingIntelligenceDetector(limit = 15, enabled = true) {
  return useQuery({
    queryKey: ['pricing-intelligence-detector', limit],
    queryFn: async (): Promise<PricingIntelligenceResult> => {
      const { data, error } = await supabase.rpc('detect_pricing_intelligence', { p_limit: limit });
      if (error) throw error;
      return data as unknown as PricingIntelligenceResult;
    },
    enabled,
    staleTime: 60_000,
    refetchInterval: 180_000,
  });
}
