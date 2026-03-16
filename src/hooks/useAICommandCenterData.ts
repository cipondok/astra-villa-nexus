import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { AISystemHealth } from './useAISystemHealth';
import type { LeadIntelligenceSummary } from './useLeadIntelligence';
import type { MarketAnomalyResult } from './useMarketAnomalyDetector';
import type { AgentPerformanceIntelligence } from './useAgentPerformanceIntelligence';
import type { MarketIntelligenceSummary } from './useMarketIntelligence';
import type { DealPipelineIntelligence } from './useDealPipelineIntelligence';
import type { GeoExpansionIntelligence } from './useGeoExpansionIntelligence';

export interface AICommandCenterData {
  systemHealth: AISystemHealth | null;
  leadIntelligence: LeadIntelligenceSummary | null;
  marketAnomalies: MarketAnomalyResult | null;
  agentPerformance: AgentPerformanceIntelligence | null;
  marketIntelligence: MarketIntelligenceSummary | null;
  dealPipeline: DealPipelineIntelligence | null;
  geoExpansion: GeoExpansionIntelligence | null;
  fetchedAt: string;
}

/**
 * Batched hook that consolidates all AI intelligence RPCs
 * into a single React Query entry via Promise.allSettled,
 * reducing 7 independent network waterfalls to 1 query key.
 */
export function useAICommandCenterData(enabled = true) {
  return useQuery({
    queryKey: ['ai-command-center-batch'],
    queryFn: async (): Promise<AICommandCenterData> => {
      // Fire all RPCs in parallel — single network burst
      const [healthRes, leadRes, anomalyRes, agentRes, marketRes, dealRes, geoRes] = await Promise.allSettled([
        supabase.rpc('get_ai_system_health'),
        supabase.rpc('get_lead_intelligence_summary'),
        supabase.rpc('detect_market_anomalies'),
        supabase.rpc('get_agent_performance_intelligence'),
        supabase.rpc('get_market_intelligence_summary'),
        supabase.rpc('get_deal_pipeline_intelligence'),
        supabase.rpc('get_geo_expansion_intelligence'),
      ]);

      const extract = <T,>(res: PromiseSettledResult<{ data: unknown; error: unknown }>): T | null => {
        if (res.status === 'fulfilled' && !res.value.error) {
          return res.value.data as unknown as T;
        }
        return null;
      };

      return {
        systemHealth: extract<AISystemHealth>(healthRes),
        leadIntelligence: extract<LeadIntelligenceSummary>(leadRes),
        marketAnomalies: extract<MarketAnomalyResult>(anomalyRes),
        agentPerformance: extract<AgentPerformanceIntelligence>(agentRes),
        marketIntelligence: extract<MarketIntelligenceSummary>(marketRes),
        dealPipeline: extract<DealPipelineIntelligence>(dealRes),
        geoExpansion: extract<GeoExpansionIntelligence>(geoRes),
        fetchedAt: new Date().toISOString(),
      };
    },
    enabled,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}
