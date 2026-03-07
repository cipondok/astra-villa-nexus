import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ListingOptimizerAnalysis {
  score: number;
  max_score: number;
  grade: 'excellent' | 'good' | 'needs_improvement' | 'poor';
  suggestions: string[];
}

export interface ListingOptimizerResult {
  overall_score: number;
  overall_grade: string;
  potential_boost_percent: number;
  title_analysis: ListingOptimizerAnalysis & { current_title: string };
  description_analysis: ListingOptimizerAnalysis & { length: number; optimal_range: string };
  photo_analysis: ListingOptimizerAnalysis & { photo_count: number; recommended_minimum: number };
  property_summary: {
    city: string;
    property_type: string;
    listing_type: string;
    bedrooms: number;
    bathrooms: number;
    building_area: number;
    land_area: number;
    features_count: number;
  };
}

export const useListingOptimizer = (propertyId: string | undefined) => {
  return useQuery({
    queryKey: ['listing-optimizer', propertyId],
    queryFn: async (): Promise<ListingOptimizerResult> => {
      const { data, error } = await supabase.functions.invoke('core-engine', {
        body: { mode: 'listing_optimizer', property_id: propertyId },
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
