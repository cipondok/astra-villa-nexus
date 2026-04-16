/**
 * User Segmentation Engine
 * Dynamically tags users based on behavior, location, budget, and intent.
 * Persists segments to Supabase for analytics.
 */
import { useEffect, useRef, useCallback, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useHesitationDetector } from './useHesitationDetector';

export type SegmentTag =
  | 'high_intent'
  | 'hesitant'
  | 'price_sensitive'
  | 'investor_ready'
  | 'returning_visitor'
  | 'first_time'
  | 'international'
  | 'local'
  | 'fast_decision'
  | 'browser';

export type BudgetTier = 'low' | 'mid' | 'high' | 'ultra';
export type BehaviorType = 'fast_decision' | 'hesitant' | 'returning' | 'first_time' | 'browser';
export type LocationType = 'local' | 'international';

export interface UserSegment {
  tags: SegmentTag[];
  behaviorType: BehaviorType;
  budgetTier: BudgetTier;
  locationType: LocationType;
  intentScore: number;
  confidence: number;
}

const SESSION_KEY = 'astra_segment_session';
const VISIT_COUNT_KEY = 'astra_visit_count';

function getSessionId(): string {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

function getVisitCount(): number {
  const raw = localStorage.getItem(VISIT_COUNT_KEY);
  const count = (raw ? parseInt(raw, 10) : 0) + 1;
  localStorage.setItem(VISIT_COUNT_KEY, String(count));
  return count;
}

function detectLocation(): LocationType {
  const lang = navigator.language?.toLowerCase() || '';
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone?.toLowerCase() || '';
  if (lang.startsWith('id') || tz.includes('jakarta') || tz.includes('asia/')) {
    return 'local';
  }
  return 'international';
}

function inferBudgetTier(propertiesViewed: { price?: number }[]): BudgetTier {
  if (propertiesViewed.length === 0) return 'mid';
  const avgPrice = propertiesViewed.reduce((s, p) => s + (p.price || 0), 0) / propertiesViewed.length;
  if (avgPrice > 10_000_000_000) return 'ultra'; // > 10B IDR
  if (avgPrice > 3_000_000_000) return 'high';   // > 3B IDR
  if (avgPrice > 500_000_000) return 'mid';       // > 500M IDR
  return 'low';
}

export function useUserSegmentation() {
  const { user } = useAuth();
  const location = useLocation();
  const hesitation = useHesitationDetector();
  const pageViews = useRef(0);
  const ctaClicks = useRef(0);
  const propertiesViewed = useRef<{ price?: number }[]>([]);
  const startTime = useRef(Date.now());
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const visitCount = useRef(getVisitCount());

  const [segment, setSegment] = useState<UserSegment>({
    tags: [],
    behaviorType: 'first_time',
    budgetTier: 'mid',
    locationType: detectLocation(),
    intentScore: 50,
    confidence: 0.3,
  });

  // Track page views
  useEffect(() => {
    pageViews.current++;
  }, [location.pathname]);

  // Compute segment from signals
  const computeSegment = useCallback((): UserSegment => {
    const tags: SegmentTag[] = [];
    const elapsed = (Date.now() - startTime.current) / 1000;
    const locType = detectLocation();
    const budgetTier = inferBudgetTier(propertiesViewed.current);
    let intentScore = 50;
    let confidence = 0.3;

    // Location tags
    tags.push(locType === 'local' ? 'local' : 'international');

    // Visit history
    if (visitCount.current > 2) {
      tags.push('returning_visitor');
    } else {
      tags.push('first_time');
    }

    // Behavior classification
    let behaviorType: BehaviorType = 'browser';

    if (hesitation.isHesitating && hesitation.signals.length >= 2) {
      tags.push('hesitant');
      behaviorType = 'hesitant';
      intentScore -= 15;
    }

    if (ctaClicks.current >= 2 && elapsed < 120) {
      tags.push('fast_decision');
      tags.push('high_intent');
      behaviorType = 'fast_decision';
      intentScore += 25;
    }

    if (ctaClicks.current >= 1 || propertiesViewed.current.length >= 3) {
      tags.push('high_intent');
      intentScore += 15;
    }

    if (budgetTier === 'low') {
      tags.push('price_sensitive');
      intentScore -= 5;
    }

    if (budgetTier === 'high' || budgetTier === 'ultra') {
      tags.push('investor_ready');
      intentScore += 10;
    }

    if (visitCount.current > 2) {
      behaviorType = 'returning';
      intentScore += 10;
    }

    // Clamp
    intentScore = Math.max(0, Math.min(100, intentScore));
    confidence = Math.min(1, 0.3 + (pageViews.current * 0.05) + (ctaClicks.current * 0.1));

    // Deduplicate tags
    const uniqueTags = [...new Set(tags)] as SegmentTag[];

    return { tags: uniqueTags, behaviorType, budgetTier, locationType: locType, intentScore, confidence };
  }, [hesitation.isHesitating, hesitation.signals]);

  // Recompute periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setSegment(computeSegment());
    }, 10_000);
    return () => clearInterval(interval);
  }, [computeSegment]);

  // Sync to Supabase (debounced)
  useEffect(() => {
    if (syncTimer.current) clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(async () => {
      try {
        const sessionId = getSessionId();
        const elapsed = Math.round((Date.now() - startTime.current) / 1000);
        const row = {
          user_id: user?.id || null,
          session_id: sessionId,
          segment_tags: segment.tags,
          behavior_type: segment.behaviorType,
          budget_tier: segment.budgetTier,
          location_type: segment.locationType,
          intent_score: segment.intentScore,
          confidence: segment.confidence,
          page_views: pageViews.current,
          total_time_seconds: elapsed,
          properties_viewed: propertiesViewed.current.length,
          ctas_clicked: ctaClicks.current,
          last_activity_at: new Date().toISOString(),
        };

        if (user?.id) {
          const { data: existing } = await supabase
            .from('user_segments' as any)
            .select('id')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1);

          if (existing && (existing as any[]).length > 0) {
            await supabase.from('user_segments' as any).update(row).eq('id', (existing as any[])[0].id);
          } else {
            await supabase.from('user_segments' as any).insert(row);
          }
        } else {
          await supabase.from('user_segments' as any).insert(row);
        }
      } catch {
        // Silent — segmentation should never break UX
      }
    }, 15_000);

    return () => { if (syncTimer.current) clearTimeout(syncTimer.current); };
  }, [segment, user?.id]);

  const trackPropertyView = useCallback((price?: number) => {
    propertiesViewed.current.push({ price });
    setSegment(computeSegment());
  }, [computeSegment]);

  const trackCTAClick = useCallback(() => {
    ctaClicks.current++;
    setSegment(computeSegment());
  }, [computeSegment]);

  return {
    segment,
    trackPropertyView,
    trackCTAClick,
    hasTag: (tag: SegmentTag) => segment.tags.includes(tag),
  };
}
