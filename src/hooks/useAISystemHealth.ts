import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AISystemHealth {
  coverage_rate: number;
  total_listings: number;
  scored_listings: number;
  last_analysis_at: string | null;
  hours_since_update: number;
  freshness_state: 'FRESH' | 'AGING' | 'STALE';
  ai_health_status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
}

export function useAISystemHealth(enabled = true) {
  return useQuery({
    queryKey: ['ai-system-health'],
    queryFn: async (): Promise<AISystemHealth> => {
      const { data, error } = await supabase.rpc('get_ai_system_health');
      if (error) throw error;
      return data as unknown as AISystemHealth;
    },
    enabled,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}
