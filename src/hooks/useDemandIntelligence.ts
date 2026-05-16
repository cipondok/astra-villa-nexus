import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CityHotspot {
  city: string;
  growth_rate: number;
  buyer_activity_score: number;
  investor_interest_score: number;
  composite_score: number;
  investment_rating: string;
  market_class: 'very_hot' | 'hot' | 'growing' | 'stable';
  avg_price: number;
  median_heat_score: number;
  avg_investment_score: number;
  property_count: number;
  active_listings: number;
  new_listings_30d: number;
  unique_buyers_30d: number;
  saves_30d: number;
  property_types: string[];
}

export interface DemandIntelligenceResult {
  hotspots: CityHotspot[];
  summary: { very_hot: number; hot: number; growing: number; stable: number };
  total_cities: number;
  total_properties_analyzed: number;
  generated_at: string;
}

export function useDemandIntelligence() {
  return useQuery({
    queryKey: ['demand-intelligence'],
    queryFn: async (): Promise<DemandIntelligenceResult> => {
      const { data, error } = await supabase.functions.invoke('core-engine', {
        body: { mode: 'demand_intelligence' },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data?.data as DemandIntelligenceResult;
    },
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
