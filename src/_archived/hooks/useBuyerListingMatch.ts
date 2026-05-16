import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// ── Types ──

export type MatchConfidence = 'STRONG_MATCH' | 'MODERATE_MATCH' | 'LOW_MATCH';
export type EngagementAction = 'IMMEDIATE_VIEWING' | 'FOLLOWUP_NURTURING' | 'ALTERNATIVE_LISTING';
export type MismatchRisk = 'BUDGET_MISMATCH' | 'LOCATION_CONFLICT' | 'TYPE_MISMATCH';

export interface BuyerListingMatch {
  buyer_id: string;
  buyer_name: string;
  buyer_intent_score: number;
  buyer_status: string;
  listing_id: string;
  listing_title: string;
  listing_city: string;
  listing_price: number;
  match_score: number;
  match_confidence: MatchConfidence;
  mismatch_risks: MismatchRisk[];
  engagement_recommendation: EngagementAction;
  metrics: {
    budget_fit: number;
    location_fit: number;
    type_fit: number;
    deal_boost: number;
    deal_score: number;
  };
}

export interface BuyerListingMatchResult {
  matches: BuyerListingMatch[];
  total: number;
  strong_count: number;
  moderate_count: number;
  low_count: number;
  matched_at: string;
}

// ── Pure classifiers ──

export function classifyConfidence(score: number, hasMismatch: boolean): MatchConfidence {
  if (score >= 75 && !hasMismatch) return 'STRONG_MATCH';
  if (score >= 50) return 'MODERATE_MATCH';
  return 'LOW_MATCH';
}

export function classifyEngagement(confidence: MatchConfidence, intentScore: number): EngagementAction {
  if (confidence === 'STRONG_MATCH' && intentScore >= 60) return 'IMMEDIATE_VIEWING';
  if (confidence === 'MODERATE_MATCH') return 'FOLLOWUP_NURTURING';
  return 'ALTERNATIVE_LISTING';
}

export function detectMismatchRisks(
  budgetFitPct: number,
  locationMatch: boolean,
  typeMatch: boolean,
): MismatchRisk[] {
  const risks: MismatchRisk[] = [];
  if (budgetFitPct < 50) risks.push('BUDGET_MISMATCH');
  if (!locationMatch) risks.push('LOCATION_CONFLICT');
  if (!typeMatch) risks.push('TYPE_MISMATCH');
  return risks;
}

// ── React hook ──

export function useBuyerListingMatch(limit = 15, enabled = true) {
  return useQuery({
    queryKey: ['buyer-listing-match', limit],
    queryFn: async (): Promise<BuyerListingMatchResult> => {
      const { data, error } = await supabase.rpc('match_buyer_listings', { p_limit: limit });
      if (error) throw error;
      return data as unknown as BuyerListingMatchResult;
    },
    enabled,
    staleTime: 60_000,
    refetchInterval: 120_000,
  });
}
