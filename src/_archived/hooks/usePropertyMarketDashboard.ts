import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { throwIfEdgeFunctionReturnedError } from '@/lib/supabaseFunctionErrors';

export interface CityMarket {
  city: string;
  avg_price_per_m2: number;
  price_growth: number;
  demand_heat_score: number;
  demand_heat_level: 'very_hot' | 'hot' | 'warm' | 'cool';
  total_listings: number;
  new_listings_30d: number;
}

export interface PropertyMarketDashboardData {
  markets: CityMarket[];
  total_cities: number;
  total_properties: number;
  generated_at: string;
}

export const usePropertyMarketDashboard = () => {
  return useQuery({
    queryKey: ['property-market-dashboard'],
    queryFn: async (): Promise<PropertyMarketDashboardData> => {
      const { data, error } = await supabase.functions.invoke('core-engine', {
        body: { mode: 'property_market_dashboard' },
      });
      if (error) throw error;
      throwIfEdgeFunctionReturnedError(data);
      return data?.data;
    },
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};
