import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface RentalYieldResult {
  property_id: string;
  title: string;
  city: string | null;
  property_type: string | null;
  bedrooms: number;
  building_area: number;
  property_price: number;
  monthly_rent_estimate: number;
  annual_rent: number;
  rental_yield_percent: number;
  occupancy_rate: number;
  effective_annual_rent: number;
  effective_yield_percent: number;
  net_annual_rent: number;
  net_yield_percent: number;
  yield_rating: 'excellent' | 'good' | 'average' | 'below_average';
  rent_source: string;
  demand_heat_score: number;
  investment_score: number;
  is_tourist_city: boolean;
  comparables_count: number;
  top_comparables: {
    id: string;
    title: string;
    monthly_rent: number;
    bedrooms: number;
    city: string;
  }[];
  generated_at: string;
}

export const useRentalYieldPredictor = (propertyId: string | undefined) => {
  return useQuery({
    queryKey: ['rental-yield-predictor', propertyId],
    queryFn: async (): Promise<RentalYieldResult> => {
      const { data, error } = await supabase.functions.invoke('core-engine', {
        body: { mode: 'rental_yield_predictor', property_id: propertyId },
      });
      if (error) throw new Error(error.message);
      return data?.data;
    },
    enabled: !!propertyId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};
