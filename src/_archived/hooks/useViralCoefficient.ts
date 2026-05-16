import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { subDays, format } from 'date-fns';

export interface ViralMetrics {
  kFactor: number;
  avgInvitesPerUser: number;
  referralConversionRate: number;
  totalInvitesSent: number;
  totalConverted: number;
  totalActiveReferrers: number;
  cycleTimeHours: number;
  effectiveGrowthRate: number;
  channelBreakdown: ViralChannel[];
  dailyKTrend: { date: string; k: number; invites: number; conversions: number }[];
  growthInterpretation: 'exponential' | 'stable' | 'needs_optimization';
}

export interface ViralChannel {
  channel: string;
  invites: number;
  conversions: number;
  conversionRate: number;
  contribution: number;
}

export function useViralCoefficient(days = 30) {
  const startDate = format(subDays(new Date(), days), 'yyyy-MM-dd');

  return useQuery<ViralMetrics>({
    queryKey: ['viral-coefficient', days],
    queryFn: async () => {
      // Fetch referral data
      const { data: referrals, error: refErr } = await supabase
        .from('acquisition_referrals')
        .select('referrer_id, referee_id, status, source_channel, created_at, converted_at')
        .gte('created_at', `${startDate}T00:00:00`);

      if (refErr) throw refErr;
      const rows = referrals || [];

      // Fetch active user count from affiliates
      const { count: activeAffiliates } = await supabase
        .from('affiliates')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'active');

      const totalActiveReferrers = activeAffiliates || 1;
      const totalInvitesSent = rows.length;
      const converted = rows.filter(r => r.status === 'converted' || r.status === 'rewarded' || r.referee_id);
      const totalConverted = converted.length;

      const avgInvitesPerUser = totalActiveReferrers > 0 ? totalInvitesSent / totalActiveReferrers : 0;
      const referralConversionRate = totalInvitesSent > 0 ? totalConverted / totalInvitesSent : 0;
      const kFactor = avgInvitesPerUser * referralConversionRate;

      // Cycle time (avg hours between referral sent and conversion)
      const cycleTimes = converted
        .filter(r => r.converted_at && r.created_at)
        .map(r => (new Date(r.converted_at!).getTime() - new Date(r.created_at).getTime()) / 3600000);
      const cycleTimeHours = cycleTimes.length > 0
        ? cycleTimes.reduce((a, b) => a + b, 0) / cycleTimes.length
        : 0;

      // Effective growth rate: K / (1 - K) for K < 1, capped for display
      const effectiveGrowthRate = kFactor >= 1
        ? kFactor * 100
        : kFactor < 0.01 ? 0 : (kFactor / (1 - kFactor)) * 100;

      // Channel breakdown
      const channelMap = new Map<string, { invites: number; conversions: number }>();
      for (const r of rows) {
        const ch = r.source_channel || 'direct';
        const existing = channelMap.get(ch) || { invites: 0, conversions: 0 };
        existing.invites++;
        if (r.status === 'converted' || r.status === 'rewarded' || r.referee_id) existing.conversions++;
        channelMap.set(ch, existing);
      }
      const channelBreakdown: ViralChannel[] = Array.from(channelMap.entries())
        .map(([channel, { invites, conversions }]) => ({
          channel,
          invites,
          conversions,
          conversionRate: invites > 0 ? (conversions / invites) * 100 : 0,
          contribution: totalConverted > 0 ? (conversions / totalConverted) * 100 : 0,
        }))
        .sort((a, b) => b.conversions - a.conversions);

      // Daily K trend
      const dailyMap = new Map<string, { invites: number; conversions: number }>();
      for (const r of rows) {
        const date = r.created_at.slice(0, 10);
        const existing = dailyMap.get(date) || { invites: 0, conversions: 0 };
        existing.invites++;
        if (r.status === 'converted' || r.status === 'rewarded' || r.referee_id) existing.conversions++;
        dailyMap.set(date, existing);
      }
      const dailyKTrend = Array.from(dailyMap.entries())
        .map(([date, { invites, conversions }]) => ({
          date,
          invites,
          conversions,
          k: invites > 0 ? (invites / totalActiveReferrers) * (conversions / invites) : 0,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      const growthInterpretation: ViralMetrics['growthInterpretation'] =
        kFactor > 1 ? 'exponential' : kFactor >= 0.7 ? 'stable' : 'needs_optimization';

      return {
        kFactor,
        avgInvitesPerUser,
        referralConversionRate,
        totalInvitesSent,
        totalConverted,
        totalActiveReferrers,
        cycleTimeHours,
        effectiveGrowthRate,
        channelBreakdown,
        dailyKTrend,
        growthInterpretation,
      };
    },
    staleTime: 5 * 60_000,
  });
}
