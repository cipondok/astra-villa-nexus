import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ListingOptimizationRec {
  listing_id: string;
  title: string;
  city: string;
  optimization_type: 'PRICE_OPTIMIZATION' | 'SEO_VISIBILITY' | 'MARKETING_BOOST' | 'LISTING_PAUSE';
  priority_level: 'Immediate Action' | 'Strategic Improvement' | 'Monitor Performance';
  metrics: Record<string, number>;
  recommended_action: string;
  expected_impact: string;
}

export interface ListingOptimizationResult {
  recommendations: ListingOptimizationRec[];
  total_recommendations: number;
  immediate_count: number;
  strategic_count: number;
  monitor_count: number;
  scanned_at: string;
}

export function useListingPerformanceOptimizer(limit = 15, enabled = true) {
  return useQuery({
    queryKey: ['listing-performance-optimizer', limit],
    queryFn: async (): Promise<ListingOptimizationResult> => {
      const { data, error } = await supabase.rpc('detect_listing_optimizations', { p_limit: limit });
      if (error) throw error;
      return data as unknown as ListingOptimizationResult;
    },
    enabled,
    staleTime: 60_000,
    refetchInterval: 180_000,
  });
}
