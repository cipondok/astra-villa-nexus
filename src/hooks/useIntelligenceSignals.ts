import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

/**
 * Background intelligence signal monitor.
 * - Refreshes opportunity scores periodically via batch RPC
 * - Watches for new elite opportunities (opportunity_score >= 85)
 * - Detects significant deal score changes
 * - Monitors demand surges
 * - Integrates deal hunter signal detection
 */
export function useIntelligenceSignals(enabled = true) {
  const queryClient = useQueryClient();
  const prevEliteCountRef = useRef<number | null>(null);
  const prevDealCountRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const checkSignals = useCallback(async () => {
    try {
      // Check for elite opportunities
      const { count: eliteCount } = await (supabase as any)
        .from('properties')
        .select('id', { count: 'exact', head: true })
        .gte('opportunity_score', 85)
        .eq('status', 'active');

      if (prevEliteCountRef.current !== null && eliteCount !== null && eliteCount > prevEliteCountRef.current) {
        const diff = eliteCount - prevEliteCountRef.current;
        toast({
          title: '🏆 New Elite Opportunity',
          description: `${diff} new property${diff > 1 ? 'ies' : ''} reached elite score (85+)`,
          duration: 6000,
        });
        queryClient.invalidateQueries({ queryKey: ['properties'] });
        queryClient.invalidateQueries({ queryKey: ['investment-leaderboard'] });
        queryClient.invalidateQueries({ queryKey: ['market-heat-zones'] });
      }
      if (eliteCount !== null) prevEliteCountRef.current = eliteCount;

      // Check for new hot deals from deal hunter
      const { count: dealCount } = await (supabase as any)
        .from('deal_hunter_opportunities')
        .select('id', { count: 'exact', head: true })
        .in('deal_classification', ['hot_deal', 'silent_opportunity'])
        .gte('deal_opportunity_signal_score', 70);

      if (prevDealCountRef.current !== null && dealCount !== null && dealCount > prevDealCountRef.current) {
        const diff = dealCount - prevDealCountRef.current;
        toast({
          title: '🎯 Deal Hunter Alert',
          description: `${diff} new high-signal deal${diff > 1 ? 's' : ''} detected`,
          duration: 5000,
        });
        queryClient.invalidateQueries({ queryKey: ['deal-hunter-feed'] });
        queryClient.invalidateQueries({ queryKey: ['deal-hunter-hero'] });
      }
      if (dealCount !== null) prevDealCountRef.current = dealCount;

      // Check for demand surges
      const { count: hotCount } = await (supabase as any)
        .from('properties')
        .select('id', { count: 'exact', head: true })
        .eq('demand_trend', 'hot')
        .eq('status', 'active');

      if (hotCount && hotCount > 20) {
        const surgeKey = `demand-surge-${new Date().toDateString()}`;
        if (!sessionStorage.getItem(surgeKey)) {
          sessionStorage.setItem(surgeKey, '1');
          toast({
            title: '🔥 Market Demand Surge',
            description: `${hotCount} properties showing hot demand signals`,
            duration: 5000,
          });
        }
      }
    } catch (err) {
      console.debug('[Intelligence] Signal check failed:', err);
    }
  }, [queryClient]);

  // Batch refresh opportunity scores in background
  const refreshScores = useCallback(async () => {
    try {
      await supabase.rpc('batch_refresh_opportunity_scores' as any, { p_limit: 50 });
      queryClient.invalidateQueries({ queryKey: ['investment-leaderboard'] });
    } catch {
      // Silent — background task
    }
  }, [queryClient]);

  useEffect(() => {
    if (!enabled) return;

    const timeout = setTimeout(checkSignals, 5000);
    intervalRef.current = setInterval(checkSignals, 3 * 60 * 1000);

    return () => {
      clearTimeout(timeout);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [enabled, checkSignals]);

  // Score refresh every 10 minutes
  useEffect(() => {
    if (!enabled) return;
    const scoreRefresh = setInterval(refreshScores, 10 * 60 * 1000);
    // Initial refresh after 15s
    const init = setTimeout(refreshScores, 15000);
    return () => {
      clearInterval(scoreRefresh);
      clearTimeout(init);
    };
  }, [enabled, refreshScores]);

  // Deal cache refresh every 5 minutes
  useEffect(() => {
    if (!enabled) return;
    const dealRefresh = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['deal-analysis'] });
      queryClient.invalidateQueries({ queryKey: ['top-deals'] });
      queryClient.invalidateQueries({ queryKey: ['deal-finder'] });
    }, 5 * 60 * 1000);
    return () => clearInterval(dealRefresh);
  }, [enabled, queryClient]);
}
