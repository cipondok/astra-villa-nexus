/**
 * A/B Testing Engine
 * Manages CTA variants, tracks performance, and auto-promotes winners.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { SegmentTag } from './useUserSegmentation';

export interface ABVariant {
  id: string;
  test_name: string;
  variant_key: string;
  variant_text: string;
  variant_style: Record<string, unknown>;
  target_segment: string[];
  impressions: number;
  clicks: number;
  conversions: number;
  click_rate: number;
  conversion_rate: number;
  is_active: boolean;
  is_winner: boolean;
}

const IMPRESSION_BATCH: Map<string, number> = new Map();
const CLICK_BATCH: Map<string, number> = new Map();
let flushTimer: ReturnType<typeof setTimeout> | null = null;

async function flushCounters() {
  const impressions = new Map(IMPRESSION_BATCH);
  const clicks = new Map(CLICK_BATCH);
  IMPRESSION_BATCH.clear();
  CLICK_BATCH.clear();

  for (const [id, count] of impressions) {
    const { data } = await supabase.from('ab_test_variants' as any).select('impressions, clicks').eq('id', id).single();
    if (data) {
      const newImpressions = ((data as any).impressions || 0) + count;
      const newClicks = ((data as any).clicks || 0) + (clicks.get(id) || 0);
      const clickRate = newImpressions > 0 ? newClicks / newImpressions : 0;
      await supabase.from('ab_test_variants' as any).update({
        impressions: newImpressions,
        clicks: newClicks,
        click_rate: Math.round(clickRate * 10000) / 10000,
      }).eq('id', id);
    }
  }

  for (const [id, count] of clicks) {
    if (impressions.has(id)) continue; // Already handled above
    const { data } = await supabase.from('ab_test_variants' as any).select('impressions, clicks').eq('id', id).single();
    if (data) {
      const newClicks = ((data as any).clicks || 0) + count;
      const clickRate = (data as any).impressions > 0 ? newClicks / (data as any).impressions : 0;
      await supabase.from('ab_test_variants' as any).update({
        clicks: newClicks,
        click_rate: Math.round(clickRate * 10000) / 10000,
      }).eq('id', id);
    }
  }
}

function scheduleFlush() {
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    flushCounters();
  }, 10_000);
}

/**
 * Hook to get a variant for a specific test, filtered by user segment.
 */
export function useABVariant(testName: string, userTags: SegmentTag[] = []) {
  const [selectedVariant, setSelectedVariant] = useState<ABVariant | null>(null);
  const impressionTracked = useRef(false);

  const { data: variants } = useQuery({
    queryKey: ['ab-variants', testName],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ab_test_variants' as any)
        .select('*')
        .eq('test_name', testName)
        .eq('is_active', true);
      if (error) throw error;
      return data as unknown as ABVariant[];
    },
    staleTime: 60_000,
  });

  // Select variant: prefer winner, then segment-targeted, then random weighted
  useEffect(() => {
    if (!variants || variants.length === 0) return;

    // Check for winner first
    const winner = variants.find(v => v.is_winner);
    if (winner) { setSelectedVariant(winner); return; }

    // Filter by segment match
    const segmentMatches = variants.filter(v => {
      if (!v.target_segment || v.target_segment.length === 0) return true;
      return v.target_segment.some(s => userTags.includes(s as SegmentTag));
    });

    const pool = segmentMatches.length > 0 ? segmentMatches : variants;

    // Weighted random: higher conversion rate = higher weight
    const totalWeight = pool.reduce((s, v) => s + Math.max(0.1, v.conversion_rate || 0.1), 0);
    let rand = Math.random() * totalWeight;
    for (const v of pool) {
      rand -= Math.max(0.1, v.conversion_rate || 0.1);
      if (rand <= 0) { setSelectedVariant(v); return; }
    }
    setSelectedVariant(pool[0]);
  }, [variants, userTags]);

  // Track impression (once per mount)
  useEffect(() => {
    if (selectedVariant && !impressionTracked.current) {
      impressionTracked.current = true;
      IMPRESSION_BATCH.set(selectedVariant.id, (IMPRESSION_BATCH.get(selectedVariant.id) || 0) + 1);
      scheduleFlush();
    }
  }, [selectedVariant]);

  const trackClick = useCallback(() => {
    if (!selectedVariant) return;
    CLICK_BATCH.set(selectedVariant.id, (CLICK_BATCH.get(selectedVariant.id) || 0) + 1);
    scheduleFlush();
  }, [selectedVariant]);

  const trackConversion = useCallback(async () => {
    if (!selectedVariant) return;
    const { data } = await supabase
      .from('ab_test_variants' as any)
      .select('conversions, impressions')
      .eq('id', selectedVariant.id)
      .single();
    if (data) {
      const newConversions = ((data as any).conversions || 0) + 1;
      const convRate = (data as any).impressions > 0 ? newConversions / (data as any).impressions : 0;
      await supabase.from('ab_test_variants' as any).update({
        conversions: newConversions,
        conversion_rate: Math.round(convRate * 10000) / 10000,
      }).eq('id', selectedVariant.id);
    }
  }, [selectedVariant]);

  return { variant: selectedVariant, trackClick, trackConversion };
}

/**
 * Auto-promotion: evaluate tests and promote the best variant.
 * Should be called by admin or on a schedule.
 */
export function usePromoteWinners() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data: variants } = await supabase
        .from('ab_test_variants' as any)
        .select('*')
        .eq('is_active', true)
        .order('test_name');

      if (!variants) return { promoted: 0, disabled: 0 };

      // Group by test_name
      const tests = new Map<string, ABVariant[]>();
      for (const v of variants as unknown as ABVariant[]) {
        const list = tests.get(v.test_name) || [];
        list.push(v);
        tests.set(v.test_name, list);
      }

      let promoted = 0;
      let disabled = 0;

      for (const [, testVariants] of tests) {
        // Need minimum impressions to decide
        const ready = testVariants.filter(v => v.impressions >= 50);
        if (ready.length < 2) continue;

        // Find best by conversion rate
        ready.sort((a, b) => (b.conversion_rate || 0) - (a.conversion_rate || 0));
        const best = ready[0];
        const worst = ready[ready.length - 1];

        // Statistical significance check (simple: >2x better with >50 impressions)
        if (best.conversion_rate > 0 && best.conversion_rate >= worst.conversion_rate * 1.5) {
          await supabase.from('ab_test_variants' as any)
            .update({ is_winner: true, promoted_at: new Date().toISOString() })
            .eq('id', best.id);
          promoted++;

          // Disable significantly worse variants
          for (const v of ready.slice(1)) {
            if (v.conversion_rate < best.conversion_rate * 0.5) {
              await supabase.from('ab_test_variants' as any)
                .update({ is_active: false })
                .eq('id', v.id);
              disabled++;
            }
          }
        }
      }

      // Log optimization
      await supabase.from('optimization_logs' as any).insert({
        cycle_type: 'manual',
        tests_evaluated: tests.size,
        variants_promoted: promoted,
        variants_disabled: disabled,
        changes_made: [{ action: 'promote_winners', promoted, disabled }],
      });

      return { promoted, disabled };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ab-variants'] });
    },
  });
}
