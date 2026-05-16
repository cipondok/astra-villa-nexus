import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { AISystemHealth } from './useAISystemHealth';
import type { LeadIntelligenceSummary } from './useLeadIntelligence';
import type { MarketAnomalyResult } from './useMarketAnomalyDetector';
import type { AgentPerformanceIntelligence } from './useAgentPerformanceIntelligence';
import type { MarketIntelligenceSummary } from './useMarketIntelligence';
import type { DealPipelineIntelligence } from './useDealPipelineIntelligence';
import type { GeoExpansionIntelligence } from './useGeoExpansionIntelligence';
import type { NationalForecastResult } from './useNationalForecast';
import type { BuyerListingMatchResult } from './useBuyerListingMatch';
import type { MarketCyclePrediction } from './useMarketCyclePrediction';
import type { DealTimingResult } from './useDealTimingSignals';
import type { CapitalFlowResult } from './useCapitalFlowIntelligence';

export interface AICommandCenterData {
  systemHealth: AISystemHealth | null;
  leadIntelligence: LeadIntelligenceSummary | null;
  marketAnomalies: MarketAnomalyResult | null;
  agentPerformance: AgentPerformanceIntelligence | null;
  marketIntelligence: MarketIntelligenceSummary | null;
  dealPipeline: DealPipelineIntelligence | null;
  geoExpansion: GeoExpansionIntelligence | null;
  // Tier 3
  nationalForecast: NationalForecastResult | null;
  buyerListingMatch: BuyerListingMatchResult | null;
  marketCycle: MarketCyclePrediction | null;
  dealTiming: DealTimingResult | null;
  capitalFlow: CapitalFlowResult | null;
  fetchedAt: string;
}

/**
 * Batched hook that consolidates all AI intelligence RPCs
 * into a single React Query entry via Promise.allSettled,
 * reducing 12 independent network waterfalls to 1 query key.
 */
export function useAICommandCenterData(enabled = true) {
  return useQuery({
    queryKey: ['ai-command-center-batch'],
    queryFn: async (): Promise<AICommandCenterData> => {
      // Fire all RPCs in parallel — single network burst
      const [
        healthRes, leadRes, anomalyRes, agentRes, marketRes, dealRes, geoRes,
        forecastRes, buyerMatchRes, cycleRes, timingRes, capitalRes,
      ] = await Promise.allSettled([
        supabase.rpc('get_ai_system_health'),
        supabase.rpc('get_lead_intelligence_summary'),
        supabase.rpc('detect_market_anomalies'),
        supabase.rpc('get_agent_performance_intelligence'),
        supabase.rpc('get_market_intelligence_summary'),
        supabase.rpc('get_deal_pipeline_intelligence'),
        supabase.rpc('get_geo_expansion_intelligence'),
        // Tier 3
        supabase.rpc('forecast_national_market', { p_lookback_days: 90 }),
        supabase.rpc('match_buyer_listings', { p_limit: 10 }),
        supabase.rpc('predict_market_cycle_phase', { p_lookback_days: 90 }),
        supabase.rpc('generate_deal_timing_signals', { p_limit: 12 }),
        supabase.rpc('detect_capital_flow_trends', { p_lookback_days: 90 }),
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
        nationalForecast: extract<NationalForecastResult>(forecastRes),
        buyerListingMatch: extract<BuyerListingMatchResult>(buyerMatchRes),
        marketCycle: extract<MarketCyclePrediction>(cycleRes),
        dealTiming: extract<DealTimingResult>(timingRes),
        capitalFlow: extract<CapitalFlowResult>(capitalRes),
        fetchedAt: new Date().toISOString(),
      };
    },
    enabled,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}
