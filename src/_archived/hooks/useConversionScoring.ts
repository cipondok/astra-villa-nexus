/**
 * Predictive Conversion Scoring Engine
 * Assigns a 0-100 score per user based on behavioral signals.
 */
import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { UserSegment } from './useUserSegmentation';

export interface ConversionScore {
  score: number;
  trend: 'rising' | 'stable' | 'declining';
  riskLevel: 'low' | 'medium' | 'high';
  factors: Record<string, number>;
  recommendedActions: string[];
}

const WEIGHTS = {
  intentScore: 0.30,
  ctaEngagement: 0.20,
  propertyViews: 0.15,
  timeOnSite: 0.10,
  returningBonus: 0.10,
  hesitationPenalty: -0.15,
};

export function useConversionScoring(segment: UserSegment | null) {
  const { user } = useAuth();
  const [conversionScore, setConversionScore] = useState<ConversionScore>({
    score: 50,
    trend: 'stable',
    riskLevel: 'medium',
    factors: {},
    recommendedActions: [],
  });
  const prevScore = useRef(50);
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const computeScore = useCallback((): ConversionScore => {
    if (!segment) return conversionScore;

    const factors: Record<string, number> = {};

    // Intent score contribution
    factors.intent = Math.round(segment.intentScore * WEIGHTS.intentScore);

    // CTA engagement
    const ctaSignal = segment.tags.includes('high_intent') ? 80 : segment.tags.includes('fast_decision') ? 90 : 40;
    factors.ctaEngagement = Math.round(ctaSignal * WEIGHTS.ctaEngagement);

    // Property views signal interest
    const viewSignal = Math.min(100, (segment.tags.includes('investor_ready') ? 80 : 50));
    factors.propertyViews = Math.round(viewSignal * WEIGHTS.propertyViews);

    // Time on site (moderate time is good, too little or too much is bad)
    factors.timeOnSite = Math.round(60 * WEIGHTS.timeOnSite);

    // Returning visitor bonus
    factors.returning = segment.tags.includes('returning_visitor')
      ? Math.round(80 * WEIGHTS.returningBonus)
      : 0;

    // Hesitation penalty
    factors.hesitation = segment.tags.includes('hesitant')
      ? Math.round(70 * WEIGHTS.hesitationPenalty)
      : 0;

    const rawScore = Object.values(factors).reduce((s, v) => s + v, 0);
    const score = Math.max(0, Math.min(100, Math.round(rawScore + 30))); // baseline offset

    // Trend
    const delta = score - prevScore.current;
    const trend = delta > 5 ? 'rising' : delta < -5 ? 'declining' : 'stable';
    prevScore.current = score;

    // Risk level
    const riskLevel = score >= 70 ? 'low' : score >= 40 ? 'medium' : 'high';

    // Recommended actions
    const actions: string[] = [];
    if (score < 30) actions.push('trigger_assistance', 'show_incentive', 'simplify_flow');
    else if (score < 50) actions.push('show_trust_signals', 'offer_guidance');
    else if (score >= 70) actions.push('show_urgency', 'strong_cta');

    if (segment.tags.includes('price_sensitive')) actions.push('show_financing_options');
    if (segment.tags.includes('hesitant')) actions.push('show_escrow_protection');

    return { score, trend, riskLevel, factors, recommendedActions: [...new Set(actions)] };
  }, [segment]);

  // Recompute when segment changes
  useEffect(() => {
    const newScore = computeScore();
    setConversionScore(newScore);
  }, [computeScore]);

  // Sync to DB
  useEffect(() => {
    if (syncTimer.current) clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(async () => {
      if (!user?.id) return;
      try {
        const sessionId = sessionStorage.getItem('astra_segment_session') || '';
        const row = {
          user_id: user.id,
          session_id: sessionId,
          score: conversionScore.score,
          factors: conversionScore.factors,
          trend: conversionScore.trend,
          risk_level: conversionScore.riskLevel,
          recommended_actions: conversionScore.recommendedActions,
          last_computed_at: new Date().toISOString(),
        };

        const { data: existing } = await supabase
          .from('conversion_scores' as any)
          .select('id')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1);

        if (existing && (existing as any[]).length > 0) {
          await supabase.from('conversion_scores' as any).update(row).eq('id', (existing as any[])[0].id);
        } else {
          await supabase.from('conversion_scores' as any).insert(row);
        }
      } catch {
        // Silent
      }
    }, 20_000);

    return () => { if (syncTimer.current) clearTimeout(syncTimer.current); };
  }, [conversionScore, user?.id]);

  return conversionScore;
}
