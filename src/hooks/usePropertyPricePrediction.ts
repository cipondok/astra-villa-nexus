import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PricePredictionIntelligence {
  property_id: string;
  title: string;
  city: string | null;
  property_type: string | null;
  area_sqm: number;
  listed_price: number;
  estimated_fmv: number;
  avg_price_per_sqm: number;
  deviation_pct: number;
  price_position: 'deeply_undervalued' | 'undervalued' | 'fair' | 'overpriced' | 'bubble_risk';
  suggested_price_range: {
    quick_sale: number;
    optimal: number;
    premium: number;
  };
  annual_growth_rate_pct: number;
  trend_direction: 'strong_growth' | 'moderate_growth' | 'stable' | 'decline_risk';
  projections: {
    months: number;
    projected_value: number;
    appreciation_pct: number;
  }[];
  price_elasticity: {
    price_minus_10: number;
    price_minus_5: number;
    current_price: number;
    price_plus_5: number;
    price_plus_10: number;
    sensitivity_rating: 'high' | 'moderate' | 'low';
  };
  negotiation_flexibility: {
    score: number;
    suggested_discount_pct: number;
    buyer_power: 'strong' | 'moderate' | 'weak';
    recommended_offer_range: { low: number; high: number };
  };
  confidence_score: number;
  comparables_used: number;
  top_comparables: {
    id: string;
    title: string;
    price: number;
    price_per_sqm: number;
    city: string | null;
  }[];
  demand_multiplier: number;
  investment_multiplier: number;
  generated_at: string;
}

export const usePropertyPricePrediction = (propertyId: string | undefined, forecastMonths = 36) => {
  return useQuery({
    queryKey: ['property-price-prediction', propertyId, forecastMonths],
    queryFn: async (): Promise<PricePredictionIntelligence> => {
      const { data, error } = await supabase.functions.invoke('predict-property-price', {
        body: { property_id: propertyId, forecast_months: forecastMonths },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      return data.data;
    },
    enabled: !!propertyId,
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};
