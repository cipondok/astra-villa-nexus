import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface NegotiationResult {
  suggested_offer_price: number;
  negotiation_margin_percent: number;
  negotiation_confidence: number;
  explanation: string;
  context: {
    listing_price: number;
    fair_market_value: number;
    days_on_market: number;
    demand_heat_score: number;
    investment_score: number;
    comparable_count: number;
  };
}

export const useNegotiationAssistant = (propertyId: string | undefined) => {
  return useQuery({
    queryKey: ['negotiation-assist', propertyId],
    queryFn: async (): Promise<NegotiationResult> => {
      const { data, error } = await supabase.functions.invoke('deal-engine', {
        body: { mode: 'negotiation_assist', property_id: propertyId },
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
