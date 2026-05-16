import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AIValuationResult {
  property_id: string;
  title: string;
  city: string | null;
  property_type: string | null;
  building_area: number;
  land_area: number;
  listed_price: number;
  estimated_value: number;
  avg_price_per_sqm: number;
  confidence: number;
  price_position: 'undervalued' | 'fair_price' | 'overpriced';
  deviation_percent: number;
  demand_heat_score: number;
  investment_score: number;
  demand_multiplier: number;
  investment_multiplier: number;
  comparables_count: number;
  top_comparables: {
    id: string;
    title: string;
    price: number;
    area: number;
    price_per_sqm: number;
    city: string;
  }[];
  generated_at: string;
  message?: string;
}

export const useAIPropertyValuation = (propertyId: string | undefined) => {
  return useQuery({
    queryKey: ['ai-property-valuation', propertyId],
    queryFn: async (): Promise<AIValuationResult> => {
      const { data, error } = await supabase.functions.invoke('core-engine', {
        body: { mode: 'property_valuation', property_id: propertyId },
      });
      if (error) throw new Error(error.message);
      return data?.data;
    },
    enabled: !!propertyId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};
