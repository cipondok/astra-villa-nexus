import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { throwIfEdgeFunctionReturnedError } from '@/lib/supabaseFunctionErrors';

export interface CityPulse {
  city: string;
  total_listings: number;
  avg_price: number;
  avg_investment_score: number;
  avg_demand_score: number;
  views_7d: number;
  views_30d: number;
  inquiries_30d: number;
  new_listings_7d: number;
  momentum_score: number;
  signal: 'hot' | 'warming' | 'stable' | 'cooling';
  dominant_type: string;
}

export interface PriceByType {
  type: string;
  count: number;
  avg_price: number;
  market_share: number;
}

export interface ActivityDay {
  date: string;
  views: number;
  inquiries: number;
  new_listings: number;
}

export interface MarketPulseData {
  market_overview: {
    total_listings: number;
    avg_price: number;
    views_30d: number;
    inquiries_30d: number;
    new_listings_7d: number;
    health_score: number;
    health_label: string;
  };
  city_pulse: CityPulse[];
  price_by_type: PriceByType[];
  activity_trend: ActivityDay[];
  top_momentum_cities: string[];
  generated_at: string;
}

export const useMarketPulse = () => {
  return useQuery({
    queryKey: ['market-pulse'],
    queryFn: async (): Promise<MarketPulseData> => {
      const { data, error } = await supabase.functions.invoke('core-engine', {
        body: { mode: 'market_pulse' },
      });
      if (error) throw error;
      throwIfEdgeFunctionReturnedError(data);
      return data?.data;
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
  });
};
