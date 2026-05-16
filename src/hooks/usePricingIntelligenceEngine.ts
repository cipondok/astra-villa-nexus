import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PriceInefficiencyIndex {
  id: string;
  property_id: string;
  district: string | null;
  current_price: number;
  estimated_fmv: number;
  fmv_ratio: number;
  undervaluation_score: number;
  overpricing_score: number;
  speculative_appreciation_score: number;
  stagnation_risk_score: number;
  pricing_inefficiency_score: number;
  inefficiency_type: string;
  days_on_market: number;
  total_views: number;
  total_inquiries: number;
  scoring_inputs: Record<string, unknown>;
  last_computed_at: string;
}

export interface DynamicPricingGuidance {
  id: string;
  property_id: string;
  district: string | null;
  recommended_price_low: number;
  recommended_price_mid: number;
  recommended_price_high: number;
  liquidity_optimal_price: number;
  urgency_discount_pct: number;
  view_to_offer_rate: number;
  pricing_grade: string;
  pricing_zone: string;
  adjustment_direction: string;
  suggested_adjustment_pct: number;
  guidance_narrative: string | null;
  last_computed_at: string;
}

export interface DistrictPriceStabilization {
  id: string;
  district: string;
  segment_type: string | null;
  median_price: number;
  avg_price: number;
  price_volatility_30d: number;
  price_volatility_90d: number;
  price_trend_direction: string;
  price_smoothing_coefficient: number;
  volatility_guardrail_upper: number;
  volatility_guardrail_lower: number;
  bubble_cascade_risk: number;
  panic_discount_risk: number;
  stabilization_mode: string;
  active_interventions: string[];
  last_computed_at: string;
}

export interface NegotiationIntelligence {
  id: string;
  property_id: string;
  district: string | null;
  buyer_urgency_index: number;
  seller_flexibility_index: number;
  deal_close_price_low: number;
  deal_close_price_mid: number;
  deal_close_price_high: number;
  close_probability_at_asking: number;
  close_probability_at_5pct_discount: number;
  close_probability_at_10pct_discount: number;
  optimal_opening_offer_pct: number;
  predicted_final_discount_pct: number;
  negotiation_power: string;
  insight_narrative: string | null;
  last_computed_at: string;
}

export interface PricingInfluenceSignal {
  id: string;
  property_id: string | null;
  district: string | null;
  target_role: string;
  signal_type: string;
  headline: string;
  message: string | null;
  suggested_action: string | null;
  urgency_score: number;
  status: string;
  created_at: string;
}

/** Price inefficiency scores */
export function usePriceInefficiencyIndex(limit = 50) {
  return useQuery({
    queryKey: ['price-inefficiency-index', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('price_inefficiency_index')
        .select('*')
        .order('pricing_inefficiency_score', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data || []) as unknown as PriceInefficiencyIndex[];
    },
    staleTime: 60_000,
    refetchInterval: 120_000,
  });
}

/** Dynamic pricing guidance */
export function useDynamicPricingGuidance(propertyId?: string) {
  return useQuery({
    queryKey: ['dynamic-pricing-guidance', propertyId],
    queryFn: async () => {
      let query = supabase.from('dynamic_pricing_guidance').select('*');
      if (propertyId) query = query.eq('property_id', propertyId);
      else query = query.order('pricing_grade').limit(50);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as DynamicPricingGuidance[];
    },
    staleTime: 60_000,
  });
}

/** District price stabilization */
export function useDistrictPriceStabilization() {
  return useQuery({
    queryKey: ['district-price-stabilization'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('district_price_stabilization')
        .select('*')
        .order('price_volatility_30d', { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as DistrictPriceStabilization[];
    },
    staleTime: 120_000,
  });
}

/** Negotiation intelligence */
export function useNegotiationIntelligence(propertyId?: string) {
  return useQuery({
    queryKey: ['negotiation-intelligence', propertyId],
    queryFn: async () => {
      let query = supabase.from('negotiation_intelligence').select('*');
      if (propertyId) query = query.eq('property_id', propertyId);
      else query = query.order('buyer_urgency_index', { ascending: false }).limit(50);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as NegotiationIntelligence[];
    },
    staleTime: 60_000,
  });
}

/** Pricing influence signals */
export function usePricingInfluenceSignals(role?: string, status = 'pending') {
  return useQuery({
    queryKey: ['pricing-influence-signals', role, status],
    queryFn: async () => {
      let query = supabase
        .from('pricing_influence_signals')
        .select('*')
        .eq('status', status)
        .order('urgency_score', { ascending: false })
        .limit(30);
      if (role) query = query.eq('target_role', role);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as PricingInfluenceSignal[];
    },
    refetchInterval: 60_000,
  });
}

/** Trigger pricing intelligence engine cycle */
export function useTriggerPricingEngine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (mode?: string) => {
      const { data, error } = await supabase.functions.invoke('pricing-intelligence-engine', {
        body: { mode: mode || 'full' },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['price-inefficiency-index'] });
      qc.invalidateQueries({ queryKey: ['dynamic-pricing-guidance'] });
      qc.invalidateQueries({ queryKey: ['district-price-stabilization'] });
      qc.invalidateQueries({ queryKey: ['negotiation-intelligence'] });
      qc.invalidateQueries({ queryKey: ['pricing-influence-signals'] });
      toast.success(
        `Pricing Engine: ${data?.inefficiency_scored ?? 0} scored, ${data?.guidance_generated ?? 0} guided, ${data?.stabilization_computed ?? 0} stabilized, ${data?.negotiation_computed ?? 0} negotiation, ${data?.influence_signals_created ?? 0} signals`
      );
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
