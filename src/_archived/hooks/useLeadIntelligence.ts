import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface LeadIntelligenceSummary {
  hot_leads: number;
  total_active_leads: number;
  avg_intent_score: number;
  avg_response_hrs: number;
  response_risk: 'LOW' | 'MEDIUM' | 'HIGH';
  demand_momentum: 'STRONG' | 'STABLE' | 'WEAK';
  leads_7d: number;
  leads_prev_7d: number;
}

export function useLeadIntelligence(enabled = true) {
  return useQuery({
    queryKey: ['lead-intelligence-summary'],
    queryFn: async (): Promise<LeadIntelligenceSummary> => {
      const { data, error } = await supabase.rpc('get_lead_intelligence_summary');
      if (error) throw error;
      return data as unknown as LeadIntelligenceSummary;
    },
    enabled,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}
