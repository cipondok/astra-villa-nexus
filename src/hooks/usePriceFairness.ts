import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type PriceStatus = 'undervalued' | 'fair_price' | 'slightly_expensive' | 'overpriced';

export interface PriceFairnessResult {
  property_id: string;
  current_price: number;
  market_price: number;
  price_difference_percent: number;
  price_status: PriceStatus;
  property_price_per_sqm: number;
  market_price_per_sqm: number;
  comparable_count: number;
  confidence_score: number;
  demand_multiplier: number;
  expected_days_on_market: number;
  reasoning: string[];
}

export const usePriceFairness = (propertyId?: string) => {
  return useQuery({
    queryKey: ['price-fairness', propertyId],
    queryFn: async (): Promise<PriceFairnessResult> => {
      const { data, error } = await supabase.functions.invoke('core-engine', {
        body: { mode: 'price_fairness', property_id: propertyId },
      });
      if (error) throw error;
      if (data?.data?.error) throw new Error(data.data.error);
      return data.data;
    },
    enabled: !!propertyId,
    staleTime: 10 * 60 * 1000,
  });
};
