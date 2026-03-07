import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SellerIntelligenceResult {
  recommended_price: number;
  market_price_range: { low: number; high: number };
  predicted_days_to_sell: number;
  demand_level: 'low' | 'moderate' | 'high' | 'very_high';
  price_per_sqm: number;
  market_median_price_per_sqm: number;
  price_competitiveness: string;
  competition_level: string;
  comparables_count: number;
  listing_price: number;
  confidence: number;
  insights: string[];
}

export const useSellerIntelligence = (propertyId: string | undefined) => {
  return useQuery({
    queryKey: ['seller-intelligence', propertyId],
    queryFn: async (): Promise<SellerIntelligenceResult> => {
      const { data, error } = await supabase.functions.invoke('core-engine', {
        body: { mode: 'seller_intelligence', property_id: propertyId },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      return data?.data;
    },
    enabled: !!propertyId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};
