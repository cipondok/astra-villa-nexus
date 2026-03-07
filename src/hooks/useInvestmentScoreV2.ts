import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ScoreBreakdownItem {
  score: number;
  max: number;
  [key: string]: any;
}

export interface InvestmentScoreV2 {
  property_id: string;
  title: string;
  city: string;
  property_type: string;
  price: number;
  area_sqm: number;
  price_per_sqm: number;
  investment_score: number;
  grade: string;
  recommendation: string;
  breakdown: {
    location_demand: ScoreBreakdownItem & { views_30d: number; saves_30d: number };
    price_fairness: ScoreBreakdownItem & { price_per_sqm: number; city_avg_per_sqm: number; city_median_per_sqm: number; price_ratio: number; comparables_count: number };
    rental_yield: ScoreBreakdownItem & { monthly_rent: number; annual_rent: number; gross_yield_percent: number };
    market_growth: ScoreBreakdownItem & { growth_rate_percent: number; recent_avg_psm: number; older_avg_psm: number };
    liquidity: ScoreBreakdownItem & { similar_active_listings: number; supply_demand_ratio: number };
  };
  generated_at: string;
}

export const useInvestmentScoreV2 = (propertyId: string | undefined) => {
  return useQuery({
    queryKey: ['investment-score-v2', propertyId],
    queryFn: async (): Promise<InvestmentScoreV2> => {
      const { data, error } = await supabase.functions.invoke('core-engine', {
        body: { mode: 'investment_score_v2', property_id: propertyId },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data?.data;
    },
    enabled: !!propertyId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};
