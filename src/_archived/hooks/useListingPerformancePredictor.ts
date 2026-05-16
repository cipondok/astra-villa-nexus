import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ListingPerformancePrediction {
  property_id: string;
  predicted_days_to_sell: number;
  predicted_monthly_views: number;
  buyer_interest: 'very_high' | 'high' | 'moderate' | 'low';
  performance_score: number;
  performance_grade: string;
  factors: {
    price_competitiveness: number;
    price_position: string;
    location_demand: number;
    competition_level: string;
    competition_count: number;
    investment_score: number;
  };
  speed_category: string;
  confidence_score: number;
  tips: string[];
}

export const useListingPerformancePredictor = (propertyId?: string) => {
  return useQuery({
    queryKey: ['listing-performance', propertyId],
    queryFn: async (): Promise<ListingPerformancePrediction> => {
      const { data, error } = await supabase.functions.invoke('core-engine', {
        body: { mode: 'listing_performance_predictor', property_id: propertyId },
      });
      if (error) throw error;
      if (data?.data?.error) throw new Error(data.data.error);
      return data.data;
    },
    enabled: !!propertyId,
    staleTime: 10 * 60 * 1000,
  });
};
