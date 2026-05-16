import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { subDays, differenceInDays } from 'date-fns';

export interface ExecutiveKPI {
  key: string;
  label: string;
  value: number;
  prev: number;
  delta: number;
  unit: string;
  status: 'excellent' | 'good' | 'caution' | 'critical';
  insight: string;
  trend: { date: string; value: number }[];
}

export interface ExecutiveKPIData {
  liquidity_index: ExecutiveKPI;
  deal_velocity: ExecutiveKPI;
  retention_score: ExecutiveKPI;
  revenue_momentum: ExecutiveKPI;
  scaling_readiness: number;
  priority_areas: string[];
}

function classify(value: number, thresholds: [number, number, number]): ExecutiveKPI['status'] {
  if (value >= thresholds[0]) return 'excellent';
  if (value >= thresholds[1]) return 'good';
  if (value >= thresholds[2]) return 'caution';
  return 'critical';
}

function pctDelta(curr: number, prev: number): number {
  if (prev === 0) return curr > 0 ? 100 : 0;
  return Math.round(((curr - prev) / prev) * 1000) / 10;
}

export function useExecutiveKPIs() {
  return useQuery({
    queryKey: ['executive-kpis'],
    queryFn: async (): Promise<ExecutiveKPIData> => {
      const now = new Date();
      const d30 = subDays(now, 30).toISOString();
      const d60 = subDays(now, 60).toISOString();
      const d7 = subDays(now, 7).toISOString();

      const [
        activeListings,
        activeInvestors30,
        activeInvestors60,
        inquiries30,
        inquiries60,
        completedDeals30,
        completedDeals60,
        returningUsers,
        totalUsers,
        commCurr,
        commPrev,
        activeSubs,
        weeklyTrend,
      ] = await Promise.all([
        supabase.from('properties').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('activity_logs').select('user_id', { count: 'exact', head: true }).gte('created_at', d30),
        supabase.from('activity_logs').select('user_id', { count: 'exact', head: true }).gte('created_at', d60).lt('created_at', d30),
        supabase.from('inquiries').select('created_at').gte('created_at', d30).limit(500),
        supabase.from('inquiries').select('id', { count: 'exact', head: true }).gte('created_at', d60).lt('created_at', d30),
        supabase.from('property_offers').select('created_at, completed_at').gte('created_at', d30).in('status', ['completed', 'accepted']).limit(300),
        supabase.from('property_offers').select('created_at, completed_at').gte('created_at', d60).lt('created_at', d30).in('status', ['completed', 'accepted']).limit(300),
        // Users active in both current and prev period (returning)
        supabase.from('activity_logs').select('user_id').gte('created_at', d30).limit(500),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('transaction_commissions').select('commission_amount').gte('created_at', d30),
        supabase.from('transaction_commissions').select('commission_amount').gte('created_at', d60).lt('created_at', d30),
        supabase.from('user_subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        // Weekly snapshots for trends
        supabase.from('activity_logs').select('created_at').gte('created_at', d30).order('created_at').limit(500),
      ]);

      // ── 1. Marketplace Liquidity Index ──
      const listings = activeListings.count || 1;
      const investors = activeInvestors30.count || 0;
      const investorsPrev = activeInvestors60.count || 0;
      const liquidityRatio = Math.round((investors / listings) * 100) / 100;
      const liquidityPrev = investorsPrev > 0 ? Math.round((investorsPrev / listings) * 100) / 100 : 0;
      const liquidityScore = Math.min(100, Math.round(liquidityRatio * 25));
      const liquidityPrevScore = Math.min(100, Math.round(liquidityPrev * 25));

      // ── 2. Deal Velocity ──
      const deals = completedDeals30.data || [];
      const dealsPrev = completedDeals60.data || [];
      const avgCycleDays = deals.length > 0
        ? Math.round(deals.reduce((s, d) => {
            const end = d.completed_at || d.created_at;
            return s + differenceInDays(new Date(end), new Date(d.created_at));
          }, 0) / deals.length)
        : 0;
      const avgCyclePrev = dealsPrev.length > 0
        ? Math.round(dealsPrev.reduce((s, d) => {
            const end = d.completed_at || d.created_at;
            return s + differenceInDays(new Date(end), new Date(d.created_at));
          }, 0) / dealsPrev.length)
        : 0;
      // Lower is better for velocity, invert for scoring
      const velocityScore = Math.max(0, Math.min(100, 100 - avgCycleDays * 1.5));
      const velocityPrevScore = Math.max(0, Math.min(100, 100 - avgCyclePrev * 1.5));

      // ── 3. Investor Retention Score ──
      const total = totalUsers.count || 1;
      const activeUserIds = new Set((returningUsers.data || []).map(r => r.user_id));
      const retentionPct = Math.round((activeUserIds.size / total) * 1000) / 10;
      // Estimate previous retention
      const retentionPrev = total > 0 ? Math.round((investorsPrev / total) * 1000) / 10 : 0;

      // ── 4. Revenue Growth Momentum ──
      const revCurr = (commCurr.data || []).reduce((s, r) => s + (r.commission_amount || 0), 0) + (activeSubs.count || 0) * 500_000;
      const revPrev = (commPrev.data || []).reduce((s, r) => s + (r.commission_amount || 0), 0);
      const revMoM = pctDelta(revCurr, revPrev);

      // ── Weekly trend builder ──
      const buildWeeklyTrend = (rows: any[]): { date: string; value: number }[] => {
        const weeks: { date: string; value: number }[] = [];
        for (let i = 3; i >= 0; i--) {
          const start = subDays(now, (i + 1) * 7);
          const end = subDays(now, i * 7);
          const count = rows.filter(r => {
            const d = new Date(r.created_at);
            return d >= start && d < end;
          }).length;
          weeks.push({ date: `W-${i}`, value: count });
        }
        return weeks;
      };

      const activityTrend = buildWeeklyTrend(weeklyTrend.data || []);
      const inquiryTrend = buildWeeklyTrend(inquiries30.data || []);

      // ── Scaling Readiness ──
      const scores = [liquidityScore, velocityScore, Math.min(100, retentionPct * 1.5), Math.min(100, Math.max(0, revMoM + 50))];
      const scalingReadiness = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

      // ── Priority Areas ──
      const priorities: string[] = [];
      if (liquidityScore < 40) priorities.push('Increase investor acquisition to improve marketplace liquidity');
      if (velocityScore < 50) priorities.push('Streamline deal process to accelerate transaction velocity');
      if (retentionPct < 20) priorities.push('Invest in retention programs to reduce investor churn');
      if (revMoM < 10) priorities.push('Diversify revenue streams to sustain growth momentum');
      if (priorities.length === 0) priorities.push('All executive KPIs are within healthy ranges — focus on scaling');

      return {
        liquidity_index: {
          key: 'liquidity_index',
          label: 'Marketplace Liquidity Index',
          value: liquidityScore,
          prev: liquidityPrevScore,
          delta: pctDelta(liquidityScore, liquidityPrevScore),
          unit: `${liquidityRatio}:1 ratio`,
          status: classify(liquidityScore, [70, 45, 25]),
          insight: liquidityScore >= 50
            ? 'Healthy demand-supply balance driving efficient matching'
            : 'Demand acceleration needed to improve marketplace efficiency',
          trend: activityTrend,
        },
        deal_velocity: {
          key: 'deal_velocity',
          label: 'Deal Velocity Indicator',
          value: velocityScore,
          prev: velocityPrevScore,
          delta: pctDelta(velocityScore, velocityPrevScore),
          unit: `${avgCycleDays}d avg cycle`,
          status: classify(velocityScore, [75, 55, 35]),
          insight: avgCycleDays <= 21
            ? 'Fast deal cycles indicating strong market efficiency'
            : 'Process optimization needed to reduce closing friction',
          trend: inquiryTrend,
        },
        retention_score: {
          key: 'retention_score',
          label: 'Investor Retention Score',
          value: Math.min(100, Math.round(retentionPct)),
          prev: Math.min(100, Math.round(retentionPrev)),
          delta: pctDelta(retentionPct, retentionPrev),
          unit: `${retentionPct}% monthly return`,
          status: classify(retentionPct, [60, 35, 15]),
          insight: retentionPct >= 40
            ? 'Strong investor loyalty — platform stickiness is high'
            : 'Retention programs needed to improve investor lifetime value',
          trend: activityTrend,
        },
        revenue_momentum: {
          key: 'revenue_momentum',
          label: 'Revenue Growth Momentum',
          value: Math.min(100, Math.max(0, Math.round(revMoM + 50))),
          prev: 50,
          delta: revMoM,
          unit: `${revMoM > 0 ? '+' : ''}${revMoM}% MoM`,
          status: classify(revMoM, [20, 10, 0]),
          insight: revMoM >= 15
            ? 'Strong revenue acceleration supporting scale-up thesis'
            : 'Revenue diversification needed to sustain growth trajectory',
          trend: activityTrend,
        },
        scaling_readiness: scalingReadiness,
        priority_areas: priorities,
      };
    },
    staleTime: 3 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}
