import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DealAnalysis {
  id: string;
  property_id: string;
  deal_score: number;
  estimated_value: number;
  listing_price: number;
  undervaluation_percent: number;
  deal_tag: string;
  roi_forecast_gap: number;
  location_growth_score: number;
  demand_signal_score: number;
  rental_yield_estimate: number;
  price_per_sqm: number;
  city_avg_price_per_sqm: number;
  analyzed_at: string;
}

export function useDealAnalysis(propertyId: string | undefined) {
  return useQuery({
    queryKey: ['deal-analysis', propertyId],
    queryFn: async (): Promise<DealAnalysis | null> => {
      if (!propertyId) return null;
      const { data, error } = await (supabase as any)
        .from('property_deal_analysis')
        .select('*')
        .eq('property_id', propertyId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!propertyId,
    staleTime: 10 * 60 * 1000,
  });
}

export function useTopDeals(limit = 20) {
  return useQuery({
    queryKey: ['top-deals', limit],
    queryFn: async (): Promise<DealAnalysis[]> => {
      const { data, error } = await (supabase as any)
        .from('property_deal_analysis')
        .select('*')
        .gte('deal_score', 50)
        .order('deal_score', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });
}
