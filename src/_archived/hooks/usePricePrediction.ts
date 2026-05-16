import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PricePredictionResult {
  property_id: string;
  city: string | null;
  current_price: number;
  price_1y: number;
  price_3y: number;
  price_5y: number;
  forecast_price: number;
  growth_rate: number;
  forecast_years: number;
  demand_heat_score: number;
  investment_score: number;
  confidence: number;
  yearly_projection: { year: number; price: number; appreciation: number }[];
  generated_at: string;
}

export const usePricePrediction = (propertyId: string | undefined, forecastYears = 5) => {
  return useQuery({
    queryKey: ['price-prediction', propertyId, forecastYears],
    queryFn: async (): Promise<PricePredictionResult> => {
      const { data, error } = await supabase.functions.invoke('deal-engine', {
        body: { mode: 'price_forecast', property_id: propertyId, forecast_years: forecastYears },
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
