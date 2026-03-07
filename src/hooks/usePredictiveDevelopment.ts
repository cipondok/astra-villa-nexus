import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { throwIfEdgeFunctionReturnedError } from '@/lib/supabaseFunctionErrors';

export interface DevOpportunity {
  city: string;
  development_type: 'villa_project' | 'apartment_project' | 'commercial_project';
  growth_score: number;
  reason: string;
  metrics: {
    total_listings: number;
    avg_price: number;
    avg_land_price_sqm: number;
    avg_demand_score: number;
    avg_investment_score: number;
    avg_rental_yield: number;
    buyer_activity_30d: number;
    new_listings_30d: number;
    price_changes_90d: number;
  };
  score_breakdown: {
    buyer_activity: number;
    demand_heat: number;
    supply_gap: number;
    price_trend: number;
  };
}

export interface PredictiveDevData {
  development_opportunities: DevOpportunity[];
  summary: {
    total_cities_analyzed: number;
    top_opportunity: string;
    avg_growth_score: number;
    type_distribution: {
      villa_project: number;
      apartment_project: number;
      commercial_project: number;
    };
  };
  generated_at: string;
}

export const usePredictiveDevelopment = () => {
  return useQuery({
    queryKey: ['predictive-development'],
    queryFn: async (): Promise<PredictiveDevData> => {
      const { data, error } = await supabase.functions.invoke('core-engine', {
        body: { mode: 'predictive_development' },
      });
      if (error) throw error;
      throwIfEdgeFunctionReturnedError(data);
      return data?.data;
    },
    staleTime: 10 * 60 * 1000,
  });
};
