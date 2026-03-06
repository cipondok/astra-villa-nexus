import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SuperEngineValuation {
  estimated_value: number;
  listed_price: number;
  avg_price_per_sqm: number;
  confidence: number;
  price_position: 'undervalued' | 'fair_price' | 'overpriced';
  deviation_percent: number;
  comparables_count: number;
}

export interface SuperEngineRentalYield {
  monthly_rent_estimate: number;
  annual_rent: number;
  rental_yield_percent: number;
  occupancy_rate: number;
  effective_annual_rent: number;
  net_yield_percent: number;
  yield_rating: string;
  rent_source: string;
  comparables_count: number;
}

export interface SuperEngineDeal {
  deal_score_percent: number;
  deal_rating: string;
  estimated_value: number;
  listed_price: number;
  potential_savings: number;
}

export interface SuperEngineMarketTrend {
  city: string;
  price_growth_forecast: number;
  demand_heat_score: number;
  buyer_activity_score: number;
  market_status: string;
  price_changes_90d: number;
}

export interface SuperEngineRecommendation {
  id: string;
  title: string;
  price: number;
  city: string;
  property_type: string;
  bedrooms: number;
  investment_score: number;
  demand_heat_score: number;
  thumbnail_url: string | null;
  similarity_score: number;
}

export interface SuperEngineResult {
  property_id: string;
  title: string;
  city: string;
  property_type: string;
  thumbnail_url: string | null;
  overall_score: number;
  investment_grade: string;
  valuation: SuperEngineValuation;
  rental_yield: SuperEngineRentalYield;
  deal_rating: SuperEngineDeal;
  market_trend: SuperEngineMarketTrend;
  recommendations: SuperEngineRecommendation[];
  generated_at: string;
}

export const useSuperEngine = (propertyId: string | undefined) => {
  return useQuery({
    queryKey: ['super-engine', propertyId],
    queryFn: async (): Promise<SuperEngineResult> => {
      const { data, error } = await supabase.functions.invoke('core-engine', {
        body: { mode: 'super_engine', property_id: propertyId },
      });
      if (error) throw new Error(error.message);
      return data?.data;
    },
    enabled: !!propertyId,
    staleTime: 3 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};
