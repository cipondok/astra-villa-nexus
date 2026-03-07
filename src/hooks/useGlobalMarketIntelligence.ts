import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { throwIfEdgeFunctionReturnedError } from '@/lib/supabaseFunctionErrors';

export interface GlobalMarket {
  country: string;
  flag: string;
  region: string;
  city: string;
  rental_yield: number;
  price_growth: number;
  avg_price_usd: number;
  entry_price_usd: number;
  tourism_score: number;
  fdi_score: number;
  ease_of_entry: number;
  currency: string;
  risk_level: string;
  investment_score: number;
  grade: string;
  score_breakdown: {
    yield: number;
    growth: number;
    accessibility: number;
    demand: number;
    value: number;
  };
}

export interface RegionSummary {
  region: string;
  markets: number;
  avg_yield: number;
  avg_growth: number;
  avg_score: number;
}

export interface GlobalMarketData {
  markets: GlobalMarket[];
  regions: RegionSummary[];
  summary: {
    total_markets: number;
    top_market: string;
    top_score: number;
    avg_yield: number;
    avg_growth: number;
    budget_filter: string;
    region_filter: string;
  };
  generated_at: string;
}

export const useGlobalMarketIntelligence = (params?: { investment_budget?: number; region?: string }) => {
  return useQuery({
    queryKey: ['global-market-intelligence', params?.investment_budget, params?.region],
    queryFn: async (): Promise<GlobalMarketData> => {
      const { data, error } = await supabase.functions.invoke('core-engine', {
        body: {
          mode: 'global_market_intelligence',
          investment_budget: params?.investment_budget || 0,
          region: params?.region || 'all',
        },
      });
      if (error) throw error;
      throwIfEdgeFunctionReturnedError(data);
      return data?.data;
    },
    staleTime: 15 * 60 * 1000,
  });
};
