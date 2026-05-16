import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ROIForecastResult {
  property_id: string;
  expected_roi: number;
  rental_yield: number;
  price_growth_forecast: number;
  market_risk: 'low' | 'medium' | 'high';
  confidence_score: number;
  comparable_count: number;
  forecast_data: {
    price_per_sqm: number;
    avg_comp_price_sqm: number | null;
    city_premium: number;
    base_yield: number;
    price_variance: number;
    projections: {
      year: number;
      predicted_value: number;
      cumulative_rental: number;
      total_return: number;
      roi_percent: number;
    }[];
  };
}

export function useROIForecast(propertyId: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Load stored forecast
  const { data: storedForecast, isLoading: isLoadingStored } = useQuery({
    queryKey: ['roi-forecast-stored', propertyId],
    queryFn: async () => {
      const { data } = await supabase
        .from('property_roi_forecast' as any)
        .select('*')
        .eq('property_id', propertyId)
        .maybeSingle();
      return data as any;
    },
    enabled: !!propertyId,
    staleTime: 5 * 60 * 1000,
  });

  // Calculate new forecast
  const { mutateAsync: calculate, isPending: isCalculating, data: liveResult } = useMutation({
    mutationFn: async (): Promise<ROIForecastResult> => {
      const { data, error } = await supabase.functions.invoke('calculate-roi-forecast', {
        body: { property_id: propertyId },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roi-forecast-stored', propertyId] });
      toast({ title: 'ROI Forecast Updated', description: 'Investment analysis recalculated.' });
    },
    onError: (err: any) => {
      toast({ title: 'Forecast Error', description: err?.message || 'Failed to calculate', variant: 'destructive' });
    },
  });

  // Merge live or stored
  const forecast: ROIForecastResult | null = liveResult || (storedForecast ? {
    property_id: storedForecast.property_id,
    expected_roi: storedForecast.expected_roi,
    rental_yield: storedForecast.rental_yield,
    price_growth_forecast: storedForecast.price_growth_forecast,
    market_risk: storedForecast.market_risk,
    confidence_score: storedForecast.confidence_score,
    comparable_count: storedForecast.comparable_count,
    forecast_data: storedForecast.forecast_data,
  } : null);

  return { forecast, isLoadingStored, isCalculating, calculate };
}
