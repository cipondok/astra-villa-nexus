import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface InvestmentReport {
  property_id: string;
  title: string;
  price: number;
  city: string;
  property_type: string;
  bedrooms: number;
  bathrooms: number;
  land_size: number;
  building_size: number;
  avg_area_price: number;
  price_vs_market: number;
  estimated_rental_yield: number;
  estimated_cap_rate: number;
  investment_score: number;
  ai_opportunity_score: number;
  similar_properties_count: number;
  market_trend: 'undervalued' | 'fair_value' | 'premium';
}

export function useInvestmentReport(propertyId: string | undefined) {
  return useQuery({
    queryKey: ['investment-report', propertyId],
    queryFn: async (): Promise<InvestmentReport | null> => {
      if (!propertyId) return null;
      const { data, error } = await supabase.rpc('get_property_investment_report', {
        p_property_id: propertyId,
      });
      if (error) throw error;
      return data as unknown as InvestmentReport;
    },
    enabled: !!propertyId,
    staleTime: 60_000,
  });
}
