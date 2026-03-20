import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useInvestorDNA } from '@/hooks/useInvestorDNA';
import {
  computeInvestorScore,
  DEFAULT_WEIGHTS,
  type BehavioralSignals,
  type InvestorScoreResult,
  type ScoringWeights,
} from '@/utils/investorScoringEngine';

/**
 * Zero-latency investor scoring hook.
 * Fetches behavioral signals + DNA, then computes scores client-side.
 */
export function useInvestorScore(overrideWeights?: Partial<ScoringWeights>) {
  const { user } = useAuth();
  const { data: dna } = useInvestorDNA();

  const weights: ScoringWeights = { ...DEFAULT_WEIGHTS, ...overrideWeights };

  return useQuery<InvestorScoreResult | null>({
    queryKey: ['investor-score', user?.id, JSON.stringify(overrideWeights)],
    queryFn: async () => {
      if (!user?.id) return null;

      // Fetch behavioral signals from last 90 days
      const since = new Date();
      since.setDate(since.getDate() - 90);
      const sinceStr = since.toISOString();

      const { data: events } = await supabase
        .from('behavioral_events' as any)
        .select('event_type, created_at')
        .eq('user_id', user.id)
        .gte('created_at', sinceStr);

      const evts = (events ?? []) as { event_type: string; created_at: string }[];

      // Count by type
      const countType = (t: string) => evts.filter(e => e.event_type === t).length;

      // Days since last activity
      const lastEvent = evts.length > 0
        ? new Date(evts.reduce((latest, e) => e.created_at > latest ? e.created_at : latest, evts[0].created_at))
        : null;
      const daysSinceLastActivity = lastEvent
        ? Math.floor((Date.now() - lastEvent.getTime()) / 86_400_000)
        : 999;

      // Fetch past transactions (inquiries with status closed)
      const { count: closedDeals } = await supabase
        .from('inquiries')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'closed');

      const behavior: BehavioralSignals = {
        searchCount: countType('search') + countType('filter'),
        savedCount: countType('save'),
        viewingBookings: countType('inquiry'), // viewing requests
        inquiryCount: countType('inquiry') + countType('contact_agent'),
        pastTransactions: closedDeals ?? 0,
        avgSessionDurationSec: 0, // Could be enriched later
        daysSinceLastActivity,
        compareUsage: countType('compare'),
        mapExploreCount: countType('map_pan'),
        alertResponseRate: 0.5, // Default until alert system tracks this
      };

      return computeInvestorScore(behavior, dna ?? null, weights);
    },
    enabled: !!user?.id,
    staleTime: 60_000,
  });
}

/**
 * Admin hook: fetch all investor scores for leaderboard.
 */
export function useInvestorScoreLeaderboard(limit = 50) {
  return useQuery({
    queryKey: ['investor-score-leaderboard', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('investor_scores' as any)
        .select('*, profiles:user_id(full_name, email, avatar_url)')
        .order('capital_readiness_score', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 30_000,
  });
}
