import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { throwIfEdgeFunctionReturnedError } from '@/lib/supabaseFunctionErrors';

export interface AreaIntelligence {
  city: string;
  area: string;
  avg_price_per_m2: number;
  rental_yield: number;
  price_growth: number;
  demand_heat_score: number;
  demand_heat_level: 'very_hot' | 'hot' | 'warm' | 'cool';
  investment_score: number;
  total_listings: number;
  views_30d: number;
  saves_30d: number;
}

export interface LocationIntelligenceData {
  areas: AreaIntelligence[];
  total_areas: number;
  total_properties: number;
  generated_at: string;
}

export const useLocationIntelligence = () => {
  return useQuery({
    queryKey: ['location-intelligence'],
    queryFn: async (): Promise<LocationIntelligenceData> => {
      const { data, error } = await supabase.functions.invoke('core-engine', {
        body: { mode: 'location_intelligence' },
      });
      if (error) throw error;
      throwIfEdgeFunctionReturnedError(data);
      return data?.data;
    },
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};
