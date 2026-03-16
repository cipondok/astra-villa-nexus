import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { AISystemHealth } from './useAISystemHealth';
import type { LeadIntelligenceSummary } from './useLeadIntelligence';
import type { MarketAnomalyResult } from './useMarketAnomalyDetector';

export interface AICommandCenterData {
  systemHealth: AISystemHealth | null;
  leadIntelligence: LeadIntelligenceSummary | null;
  marketAnomalies: MarketAnomalyResult | null;
  fetchedAt: string;
}

/**
 * Batched hook that consolidates multiple AI intelligence RPCs
 * into a single React Query entry, reducing N+1 query overhead.
 * Individual hooks still exist for standalone usage.
 */
export function useAICommandCenterData(enabled = true) {
  return useQuery({
    queryKey: ['ai-command-center-batch'],
    queryFn: async (): Promise<AICommandCenterData> => {
      // Fire all RPCs in parallel
      const [healthRes, leadRes, anomalyRes] = await Promise.allSettled([
        supabase.rpc('get_ai_system_health'),
        supabase.rpc('get_lead_intelligence_summary'),
        supabase.rpc('detect_market_anomalies'),
      ]);

      return {
        systemHealth: healthRes.status === 'fulfilled' && !healthRes.value.error
          ? (healthRes.value.data as unknown as AISystemHealth)
          : null,
        leadIntelligence: leadRes.status === 'fulfilled' && !leadRes.value.error
          ? (leadRes.value.data as unknown as LeadIntelligenceSummary)
          : null,
        marketAnomalies: anomalyRes.status === 'fulfilled' && !anomalyRes.value.error
          ? (anomalyRes.value.data as unknown as MarketAnomalyResult)
          : null,
        fetchedAt: new Date().toISOString(),
      };
    },
    enabled,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}
