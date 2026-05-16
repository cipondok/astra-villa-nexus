import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DealPipelineIntelligence {
  pipeline_count: number;
  closed_30d: number;
  active_30d: number;
  conversion_rate: number;
  revenue_30d: number;
  revenue_prev_30d: number;
  pipeline_revenue: number;
  growth_signal: 'STRONG' | 'STABLE' | 'SLOWDOWN';
  growth_ratio: number;
  sparkline_data: { d: string; revenue: number }[];
}

export function useDealPipelineIntelligence(enabled = true) {
  return useQuery({
    queryKey: ['deal-pipeline-intelligence'],
    queryFn: async (): Promise<DealPipelineIntelligence> => {
      const { data, error } = await supabase.rpc('get_deal_pipeline_intelligence');
      if (error) throw error;
      return data as unknown as DealPipelineIntelligence;
    },
    enabled,
    staleTime: 60_000,
    refetchInterval: 120_000,
  });
}
