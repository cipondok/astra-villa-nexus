import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// ── Types ──

export interface PriceTrendCity {
  city: string;
  current_ppsqm: number;
  ytd_growth: number;
  bubble_risk: number;
  cycle_phase: string;
  trajectory: string;
  quarterly_data: {
    period: string;
    avg_price_per_sqm: number;
    price_change_pct: number;
    transaction_volume: number;
    bubble_risk_score: number;
    growth_trajectory: string;
  }[];
}

export interface MacroTrendsResult {
  trends: PriceTrendCity[];
  cities_analyzed: number;
  period: string;
  generated_at: string;
}

export interface MicroValuation {
  city: string;
  district: string;
  current_price_per_sqm: number;
  predicted_price_per_sqm_1y: number;
  predicted_price_per_sqm_3y: number;
  predicted_price_per_sqm_5y: number;
  appreciation_pct_1y: number;
  appreciation_pct_3y: number;
  appreciation_pct_5y: number;
  demand_heat_score: number;
  transport_proximity_score: number;
  lifestyle_infra_score: number;
  commercial_emergence_score: number;
  tourism_value_spike: number;
  liquidity_forecast: number;
  investment_desirability: number;
}

export interface MicroValuationsResult {
  city: string;
  valuations: MicroValuation[];
  top_district: MicroValuation;
  generated_at: string;
}

export interface GrowthZone {
  city: string;
  district: string;
  zone_type: string;
  growth_confidence: number;
  current_avg_price: number;
  projected_price_3y: number;
  projected_appreciation_pct: number;
  entry_timing: string;
  capital_appreciation_horizon: string;
  gentrification_signals: string[];
  developer_activity_score: number;
  undervaluation_pct: number;
}

export interface GrowthZonesResult {
  growth_zones: GrowthZone[];
  total_zones_detected: number;
  top_zone: GrowthZone | null;
  cities_scanned: number;
  generated_at: string;
}

export interface CycleClassification {
  city: string;
  current_phase: string;
  phase_confidence: number;
  phase_duration_months: number;
  transition_probability: Record<string, number>;
  recommended_strategy: string;
  risk_adjusted_roi: number;
  cycle_position_pct: number;
  price_momentum: number;
  volume_momentum: number;
  sentiment_score: number;
  leading_indicators: Record<string, string | number>;
}

export interface MarketCyclesResult {
  classifications: CycleClassification[];
  cities_analyzed: number;
  global_sentiment: number;
  generated_at: string;
}

export interface PriceShockAlert {
  id?: string;
  alert_type: string;
  severity: string;
  affected_cities: string[];
  shock_description: string;
  price_impact_pct: number;
  direction: string;
  confidence: number;
  recommendations: { action: string; detail: string }[];
  triggered_at?: string;
}

export interface PriceShocksResult {
  active_alerts: PriceShockAlert[];
  critical_count: number;
  high_count: number;
  net_market_direction: string;
  generated_at: string;
}

// ── Hooks ──

export function useMacroPriceTrends() {
  return useMutation({
    mutationFn: async (params?: { city?: string }): Promise<MacroTrendsResult> => {
      const { data, error } = await supabase.functions.invoke('price-intelligence', {
        body: { pipeline: 'macro_trends', city: params?.city || 'all' },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data?.data;
    },
    onSuccess: (d) => toast.success(`Analyzed price trends for ${d.cities_analyzed} cities`),
    onError: (e: Error) => toast.error(e.message || 'Macro trend analysis failed'),
  });
}

export function useMicroValuations() {
  return useMutation({
    mutationFn: async (params: { city: string }): Promise<MicroValuationsResult> => {
      const { data, error } = await supabase.functions.invoke('price-intelligence', {
        body: { pipeline: 'micro_valuations', city: params.city },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data?.data;
    },
    onSuccess: (d) => toast.success(`${d.valuations.length} districts analyzed for ${d.city}`),
    onError: (e: Error) => toast.error(e.message || 'Micro valuation failed'),
  });
}

export function useGrowthZones() {
  return useMutation({
    mutationFn: async (params?: { city?: string }): Promise<GrowthZonesResult> => {
      const { data, error } = await supabase.functions.invoke('price-intelligence', {
        body: { pipeline: 'growth_zones', city: params?.city || 'all' },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data?.data;
    },
    onSuccess: (d) => toast.success(`${d.total_zones_detected} growth zones detected`),
    onError: (e: Error) => toast.error(e.message || 'Growth zone detection failed'),
  });
}

export function useMarketCycles() {
  return useMutation({
    mutationFn: async (params?: { city?: string }): Promise<MarketCyclesResult> => {
      const { data, error } = await supabase.functions.invoke('price-intelligence', {
        body: { pipeline: 'market_cycles', city: params?.city || 'all' },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data?.data;
    },
    onSuccess: (d) => toast.success(`Market cycles classified for ${d.cities_analyzed} cities`),
    onError: (e: Error) => toast.error(e.message || 'Cycle classification failed'),
  });
}

export function usePriceShocks() {
  return useMutation({
    mutationFn: async (): Promise<PriceShocksResult> => {
      const { data, error } = await supabase.functions.invoke('price-intelligence', {
        body: { pipeline: 'price_shocks' },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data?.data;
    },
    onSuccess: (d) => {
      if (d.critical_count > 0) toast.error(`${d.critical_count} critical price shock alerts!`);
      else toast.success(`${d.active_alerts.length} active market alerts monitored`);
    },
    onError: (e: Error) => toast.error(e.message || 'Price shock monitor failed'),
  });
}

export function useFullPriceSweep() {
  return useMutation({
    mutationFn: async (params?: { city?: string }) => {
      const { data, error } = await supabase.functions.invoke('price-intelligence', {
        body: { pipeline: 'full_sweep', city: params?.city || 'all' },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data?.data;
    },
    onSuccess: () => toast.success('Full price intelligence sweep complete'),
    onError: (e: Error) => toast.error(e.message || 'Intelligence sweep failed'),
  });
}
