import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

/**
 * Background intelligence signal monitor.
 * - Refreshes deal scores periodically
 * - Watches for new elite opportunities (opportunity_score >= 85)
 * - Detects significant deal score changes
 * - Monitors demand surges
 */
export function useIntelligenceSignals(enabled = true) {
  const queryClient = useQueryClient();
  const prevEliteCountRef = useRef<number | null>(null);
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
        // Invalidate property queries so UI updates
        queryClient.invalidateQueries({ queryKey: ['properties'] });
        queryClient.invalidateQueries({ queryKey: ['investment-leaderboard'] });
      }
      if (eliteCount !== null) prevEliteCountRef.current = eliteCount;

      // Check for demand surges (properties trending "hot")
      const { count: hotCount } = await supabase
        .from('properties')
        .select('id', { count: 'exact', head: true })
        .eq('demand_trend' as any, 'hot')
        .eq('status', 'active');

      if (hotCount && hotCount > 20) {
        // Only toast once per session
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
      // Silently fail — background task
      console.debug('[Intelligence] Signal check failed:', err);
    }
  }, [queryClient]);

  useEffect(() => {
    if (!enabled) return;

    // Initial check after 5s
    const timeout = setTimeout(checkSignals, 5000);

    // Periodic refresh every 3 minutes
    intervalRef.current = setInterval(checkSignals, 3 * 60 * 1000);

    return () => {
      clearTimeout(timeout);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [enabled, checkSignals]);

  // Also refresh deal-related caches periodically
  useEffect(() => {
    if (!enabled) return;

    const dealRefresh = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['deal-analysis'] });
      queryClient.invalidateQueries({ queryKey: ['top-deals'] });
      queryClient.invalidateQueries({ queryKey: ['deal-finder'] });
    }, 5 * 60 * 1000); // Every 5 minutes

    return () => clearInterval(dealRefresh);
  }, [enabled, queryClient]);
}
