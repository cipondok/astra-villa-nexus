import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AgentPerformanceIntelligence {
  top_agent_name: string;
  top_agent_sales: number;
  top_close_rate: number;
  avg_response_hrs: number;
  total_agents: number;
  highly_active: number;
  moderate_active: number;
  low_activity_risk: number;
  engagement_level: 'HIGHLY_ACTIVE' | 'MODERATELY_ACTIVE' | 'LOW_ACTIVITY_RISK' | 'NO_DATA';
  distribution_coeff: number;
  distribution_status: 'BALANCED' | 'MODERATE_SKEW' | 'HIGHLY_SKEWED';
}

export function useAgentPerformanceIntelligence(enabled = true) {
  return useQuery({
    queryKey: ['agent-performance-intelligence'],
    queryFn: async (): Promise<AgentPerformanceIntelligence> => {
      const { data, error } = await supabase.rpc('get_agent_performance_intelligence');
      if (error) throw error;
      return data as unknown as AgentPerformanceIntelligence;
    },
    enabled,
    staleTime: 60_000,
    refetchInterval: 120_000,
  });
}
