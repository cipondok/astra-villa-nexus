import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ListingOptimizationAlerts {
  total_listings: number;
  critical_count: number;
  warning_count: number;
  healthy_count: number;
  avg_deal_score: number;
  avg_seo_score: number;
  insight_message: string;
  priority_action: string;
}

export function useListingOptimizationAlerts(enabled = true) {
  return useQuery({
    queryKey: ['listing-optimization-alerts'],
    queryFn: async (): Promise<ListingOptimizationAlerts> => {
      const { data, error } = await supabase.rpc('get_listing_optimization_alerts');
      if (error) throw error;
      return data as unknown as ListingOptimizationAlerts;
    },
    enabled,
    staleTime: 60_000,
    refetchInterval: 120_000,
  });
}
