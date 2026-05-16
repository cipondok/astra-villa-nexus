/**
 * Conversion Optimization Loop
 * Runs analysis on demand (24h cycle triggered by admin).
 * Evaluates drop-offs, weak CTAs, and auto-adjusts.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface OptimizationResult {
  testsEvaluated: number;
  variantsPromoted: number;
  variantsDisabled: number;
  segmentsUpdated: number;
  performanceDelta: number;
}

export function useOptimizationLoop() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<OptimizationResult> => {
      // 1. Evaluate A/B tests
      const { data: variants } = await supabase
        .from('ab_test_variants' as any)
        .select('*')
        .eq('is_active', true);

      const allVariants = (variants || []) as any[];

      // Group by test
      const tests = new Map<string, any[]>();
      for (const v of allVariants) {
        const list = tests.get(v.test_name) || [];
        list.push(v);
        tests.set(v.test_name, list);
      }

      let promoted = 0;
      let disabled = 0;

      for (const [, testVars] of tests) {
        const ready = testVars.filter((v: any) => v.impressions >= 30);
        if (ready.length < 2) continue;

        ready.sort((a: any, b: any) => (b.conversion_rate || 0) - (a.conversion_rate || 0));
        const best = ready[0];

        if (best.conversion_rate > 0) {
          // Promote winner
          if (!best.is_winner) {
            await supabase.from('ab_test_variants' as any)
              .update({ is_winner: true, promoted_at: new Date().toISOString() })
              .eq('id', best.id);
            promoted++;
          }

          // Disable poor performers
          for (const v of ready.slice(1)) {
            if (v.conversion_rate < best.conversion_rate * 0.3 && v.impressions >= 50) {
              await supabase.from('ab_test_variants' as any)
                .update({ is_active: false })
                .eq('id', v.id);
              disabled++;
            }
          }
        }
      }

      // 2. Compute overall conversion rate change
      const { data: recentScores } = await supabase
        .from('conversion_scores' as any)
        .select('score')
        .gte('last_computed_at', new Date(Date.now() - 86400000).toISOString())
        .limit(500);

      const scores = (recentScores || []) as any[];
      const avgScore = scores.length > 0
        ? scores.reduce((s: number, r: any) => s + r.score, 0) / scores.length
        : 50;

      // 3. Log the cycle
      await supabase.from('optimization_logs' as any).insert({
        cycle_type: 'daily',
        tests_evaluated: tests.size,
        variants_promoted: promoted,
        variants_disabled: disabled,
        segments_updated: 0,
        performance_delta: Math.round((avgScore - 50) * 100) / 100,
        metrics_after: { avg_conversion_score: avgScore, total_active_variants: allVariants.length - disabled },
        changes_made: [
          { action: 'evaluate_tests', count: tests.size },
          { action: 'promote_variants', count: promoted },
          { action: 'disable_variants', count: disabled },
        ],
      });

      return {
        testsEvaluated: tests.size,
        variantsPromoted: promoted,
        variantsDisabled: disabled,
        segmentsUpdated: 0,
        performanceDelta: Math.round((avgScore - 50) * 100) / 100,
      };
    },
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ['ab-variants'] });
      qc.invalidateQueries({ queryKey: ['optimization-logs'] });
      toast.success(
        `Optimization complete: ${result.variantsPromoted} promoted, ${result.variantsDisabled} disabled`
      );
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Optimization cycle failed');
    },
  });
}
