import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type ClosingWindow = 'FAST_CLOSE' | 'MODERATE_CLOSE' | 'SLOW_CLOSE';
export type NegotiationIntensity = 'COMPETITIVE_BUYER_MARKET' | 'BALANCED_NEGOTIATION' | 'PRICE_RESISTANCE_RISK';
export type UrgencySignal = 'IMMEDIATE_FOLLOWUP' | 'STRATEGIC_NURTURING' | 'LONG_TERM_LISTING';

export interface ClosingPrediction {
  listing_id: string;
  title: string;
  city: string;
  price: number;
  closing_window_prediction: ClosingWindow;
  estimated_days: number;
  negotiation_intensity: NegotiationIntensity;
  urgency_signal: UrgencySignal;
  strategy_note: string;
  composite_score: number;
  metrics: {
    deal_score: number;
    demand_signal: number;
    liquidity_prob: number;
    inquiries: number;
    views: number;
    saves: number;
    days_active: number;
  };
}

export interface ClosingTimelineResult {
  predictions: ClosingPrediction[];
  total: number;
  fast_close_count: number;
  moderate_close_count: number;
  slow_close_count: number;
  scanned_at: string;
}

export function useDealClosingTimeline(limit = 15, enabled = true) {
  return useQuery({
    queryKey: ['deal-closing-timeline', limit],
    queryFn: async (): Promise<ClosingTimelineResult> => {
      const { data, error } = await supabase.rpc('predict_deal_closing_timeline', { p_limit: limit });
      if (error) throw error;
      return data as unknown as ClosingTimelineResult;
    },
    enabled,
    staleTime: 60_000,
    refetchInterval: 180_000,
  });
}

// ── Pure client-side classification helpers (for unit testing) ──

export function classifyClosingWindow(compositeScore: number): ClosingWindow {
  if (compositeScore >= 65) return 'FAST_CLOSE';
  if (compositeScore >= 40) return 'MODERATE_CLOSE';
  return 'SLOW_CLOSE';
}

export function classifyNegotiationIntensity(demandSignal: number, dealScore: number, inquiries: number): NegotiationIntensity {
  if (demandSignal >= 65 && inquiries >= 3) return 'COMPETITIVE_BUYER_MARKET';
  if (demandSignal >= 35 && dealScore >= 35) return 'BALANCED_NEGOTIATION';
  return 'PRICE_RESISTANCE_RISK';
}

export function classifyUrgencySignal(closingWindow: ClosingWindow, inquiries: number, daysActive: number): UrgencySignal {
  if (closingWindow === 'FAST_CLOSE' && inquiries >= 2) return 'IMMEDIATE_FOLLOWUP';
  if (closingWindow === 'MODERATE_CLOSE' || (daysActive >= 14 && daysActive <= 60)) return 'STRATEGIC_NURTURING';
  return 'LONG_TERM_LISTING';
}
