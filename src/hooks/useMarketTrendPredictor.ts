import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface MonthlyForecast {
  month: number;
  price_index: number;
  demand_index: number;
}

export interface MarketTrendResult {
  city: string;
  total_properties: number;
  median_price: number;
  avg_investment_score: number;
  avg_demand_heat: number;
  price_growth_forecast: number;
  demand_growth_forecast: number;
  market_status: 'booming' | 'growing' | 'stable' | 'declining' | 'insufficient_data';
  buyer_activity_score: number;
  buyer_activity_trend: 'increasing' | 'stable' | 'decreasing';
  investor_interest_score: number;
  supply_trend: 'increasing' | 'stable' | 'decreasing';
  recent_listings_30d: number;
  property_type_distribution: Record<string, number>;
  monthly_forecasts: MonthlyForecast[];
  price_changes_90d: number;
  generated_at: string;
  message?: string;
}

export const useMarketTrendPredictor = (city: string | undefined) => {
  return useQuery({
    queryKey: ['market-trend-predictor', city],
    queryFn: async (): Promise<MarketTrendResult> => {
      const { data, error } = await supabase.functions.invoke('core-engine', {
        body: { mode: 'market_trend_predictor', city },
      });
      if (error) throw new Error(error.message);
      return data?.data;
    },
    enabled: !!city,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};
