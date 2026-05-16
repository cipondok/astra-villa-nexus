import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface LiquidityScoreResult {
  propertyId: string;
  liquidityScore: number;
  liquidityGrade: string;
  timeToSellDays: number;
  demandClusterRank: number;
  visibilityBoost: 'none' | 'low' | 'medium' | 'high' | 'urgent';
  urgencyAlert: boolean;
  signals: {
    viewingVelocity: number;
    offerMomentum: number;
    inquiryIntensity: number;
    priceCompetitiveness: number;
    daysOnMarket: number;
  };
  lastRecalculated: string;
}

function deriveVisibilityBoost(score: number, dom: number): LiquidityScoreResult['visibilityBoost'] {
  if (score >= 85) return 'none'; // already high liquidity
  if (score >= 70) return 'low';
  if (score >= 50) return 'medium';
  if (dom > 60 && score < 40) return 'urgent';
  return 'high';
}

function deriveUrgency(score: number, dom: number): boolean {
  return score < 30 && dom > 45;
}

function deriveDemandRank(score: number): number {
  if (score >= 90) return 1;
  if (score >= 75) return 2;
  if (score >= 55) return 3;
  if (score >= 35) return 4;
  return 5;
}

/**
 * Fetch per-property liquidity score with derived intelligence outputs.
 * Reads from `property_liquidity_scores` table (populated by recompute-liquidity edge function).
 */
export function useLiquidityScore(propertyId?: string) {
  return useQuery<LiquidityScoreResult | null>({
    queryKey: ['liquidity-score', propertyId],
    queryFn: async () => {
      if (!propertyId) return null;

      const { data, error } = await supabase
        .from('property_liquidity_scores')
        .select('*')
        .eq('property_id', propertyId)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      const score = data.liquidity_score ?? 0;
      const dom = data.days_on_market ?? 0;

      // Time-to-sell prediction: inverse relationship with liquidity score
      // High score → fast sell, low score → slow sell
      const baseTimeToSell = Math.max(7, Math.round(120 - score * 1.1));
      const timeToSellDays = dom > 0 ? Math.max(baseTimeToSell, Math.round(dom * 0.6)) : baseTimeToSell;

      return {
        propertyId,
        liquidityScore: score,
        liquidityGrade: data.liquidity_grade || 'C',
        timeToSellDays,
        demandClusterRank: deriveDemandRank(score),
        visibilityBoost: deriveVisibilityBoost(score, dom),
        urgencyAlert: deriveUrgency(score, dom),
        signals: {
          viewingVelocity: data.viewing_velocity ?? 0,
          offerMomentum: data.offer_momentum ?? 0,
          inquiryIntensity: data.inquiry_intensity ?? 0,
          priceCompetitiveness: data.price_competitiveness ?? 0,
          daysOnMarket: dom,
        },
        lastRecalculated: data.last_recalculated_at,
      };
    },
    enabled: !!propertyId,
    staleTime: 60_000,
  });
}

/** Trigger single-property liquidity recompute */
export function useRecomputeLiquidity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (propertyId: string) => {
      const { data, error } = await supabase.functions.invoke('recompute-liquidity', {
        body: { mode: 'property', property_id: propertyId },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, propertyId) => {
      qc.invalidateQueries({ queryKey: ['liquidity-score', propertyId] });
      qc.invalidateQueries({ queryKey: ['property-liquidity'] });
    },
  });
}

/** Fetch all property liquidity scores for admin overview */
export function useAllLiquidityScores(limit = 100) {
  return useQuery<LiquidityScoreResult[]>({
    queryKey: ['all-liquidity-scores', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('property_liquidity_scores')
        .select('*')
        .order('liquidity_score', { ascending: true })
        .limit(limit);

      if (error) throw error;

      return (data || []).map((d) => {
        const score = d.liquidity_score ?? 0;
        const dom = d.days_on_market ?? 0;
        const baseTimeToSell = Math.max(7, Math.round(120 - score * 1.1));

        return {
          propertyId: d.property_id,
          liquidityScore: score,
          liquidityGrade: d.liquidity_grade || 'C',
          timeToSellDays: dom > 0 ? Math.max(baseTimeToSell, Math.round(dom * 0.6)) : baseTimeToSell,
          demandClusterRank: deriveDemandRank(score),
          visibilityBoost: deriveVisibilityBoost(score, dom),
          urgencyAlert: deriveUrgency(score, dom),
          signals: {
            viewingVelocity: d.viewing_velocity ?? 0,
            offerMomentum: d.offer_momentum ?? 0,
            inquiryIntensity: d.inquiry_intensity ?? 0,
            priceCompetitiveness: d.price_competitiveness ?? 0,
            daysOnMarket: dom,
          },
          lastRecalculated: d.last_recalculated_at,
        };
      });
    },
    staleTime: 30_000,
  });
}
