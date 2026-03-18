import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/* ── Types ── */

export type StreamKey = 'commissions' | 'subscriptions' | 'developer_packages' | 'service_marketplace';

export interface RevenueStream {
  key: StreamKey;
  label: string;
  icon_key: string;
  current_revenue: number;
  previous_revenue: number;
  delta_percent: number;
  direction: 'up' | 'down' | 'flat';
  volume_metric: number;
  volume_label: string;
  avg_value: number;
  category: 'primary' | 'secondary';
}

export interface MonthlyProjection {
  month: string;
  commissions: number;
  subscriptions: number;
  developer_packages: number;
  service_marketplace: number;
  total: number;
}

export interface ScalingInsight {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  icon_key: string;
  stream: StreamKey;
  potential_revenue: number;
}

export interface RevenueExpansionData {
  total_current: number;
  total_previous: number;
  total_delta: number;
  streams: RevenueStream[];
  monthly_projections: MonthlyProjection[];
  scaling_insights: ScalingInsight[];
  revenue_concentration: number; // HHI 0-10000
  diversification_score: number; // 0-100
}

/* ── Helpers ── */

function delta(curr: number, prev: number): { pct: number; dir: 'up' | 'down' | 'flat' } {
  if (prev === 0) return { pct: curr > 0 ? 100 : 0, dir: curr > 0 ? 'up' : 'flat' };
  const p = Math.round(((curr - prev) / prev) * 1000) / 10;
  return { pct: p, dir: p > 0 ? 'up' : p < 0 ? 'down' : 'flat' };
}

function buildProjections(streams: RevenueStream[]): MonthlyProjection[] {
  const months: MonthlyProjection[] = [];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();

  for (let i = 0; i < 12; i++) {
    const mIdx = (now.getMonth() + i) % 12;
    const growthFactor = 1 + (i * 0.08); // 8% compound monthly growth assumption
    const seasonality = 1 + Math.sin((mIdx / 12) * Math.PI * 2 - Math.PI / 2) * 0.15;

    const comm = Math.round((streams.find(s => s.key === 'commissions')?.current_revenue || 0) * growthFactor * seasonality);
    const subs = Math.round((streams.find(s => s.key === 'subscriptions')?.current_revenue || 0) * growthFactor * 1.12); // subs grow faster
    const devPkg = Math.round((streams.find(s => s.key === 'developer_packages')?.current_revenue || 0) * growthFactor * seasonality);
    const svcMkt = Math.round((streams.find(s => s.key === 'service_marketplace')?.current_revenue || 0) * growthFactor * 1.05);

    months.push({
      month: monthNames[mIdx],
      commissions: comm,
      subscriptions: subs,
      developer_packages: devPkg,
      service_marketplace: svcMkt,
      total: comm + subs + devPkg + svcMkt,
    });
  }
  return months;
}

function buildInsights(streams: RevenueStream[]): ScalingInsight[] {
  const insights: ScalingInsight[] = [];
  const comm = streams.find(s => s.key === 'commissions');
  const subs = streams.find(s => s.key === 'subscriptions');
  const dev = streams.find(s => s.key === 'developer_packages');
  const svc = streams.find(s => s.key === 'service_marketplace');

  if (comm && comm.volume_metric > 0) {
    insights.push({
      id: 'increase_deal_volume',
      title: 'Increase Deal Volume Efficiency',
      description: `Current ${comm.volume_metric} closed deals — optimize inquiry-to-close funnel to increase throughput by 25%`,
      impact: 'high',
      icon_key: 'trending-up',
      stream: 'commissions',
      potential_revenue: Math.round(comm.current_revenue * 0.25),
    });
  }

  if (subs) {
    insights.push({
      id: 'tiered_analytics',
      title: 'Launch Tiered Intelligence Features',
      description: `${subs.volume_metric} active subscriptions — introduce Platinum tier with institutional analytics at 3× price point`,
      impact: 'high',
      icon_key: 'layers',
      stream: 'subscriptions',
      potential_revenue: Math.round(subs.current_revenue * 0.6),
    });
  }

  if (dev) {
    insights.push({
      id: 'developer_upsell',
      title: 'Premium Developer Launch Packages',
      description: `Upsell featured placement, AI-powered buyer matching, and virtual tour bundles to developer partners`,
      impact: 'medium',
      icon_key: 'building',
      stream: 'developer_packages',
      potential_revenue: Math.round((dev.current_revenue || 500000) * 0.4),
    });
  }

  if (svc) {
    insights.push({
      id: 'marketplace_expansion',
      title: 'Expand Service Marketplace Categories',
      description: `Add insurance, legal, and property management verticals to capture post-transaction revenue`,
      impact: 'medium',
      icon_key: 'grid',
      stream: 'service_marketplace',
      potential_revenue: Math.round((svc.current_revenue || 200000) * 0.5),
    });
  }

  insights.push({
    id: 'data_monetization',
    title: 'API Intelligence Monetization',
    description: 'License anonymized market intelligence APIs to institutional investors and research firms',
    impact: 'medium',
    icon_key: 'database',
    stream: 'subscriptions',
    potential_revenue: 5_000_000,
  });

  return insights.sort((a, b) => {
    const p = { high: 0, medium: 1, low: 2 };
    return p[a.impact] - p[b.impact];
  });
}

/* ── Hook ── */

export function useRevenueExpansion() {
  return useQuery({
    queryKey: ['revenue-expansion'],
    queryFn: async (): Promise<RevenueExpansionData> => {
      const now = new Date();
      const d30 = new Date(now.getTime() - 30 * 86400000).toISOString();
      const d60 = new Date(now.getTime() - 60 * 86400000).toISOString();

      const [
        commCurr, commPrev,
        subsCurr, subsPrev,
        svcCurr, svcPrev,
        // Volume metrics
        closedDeals,
        activeSubs,
      ] = await Promise.all([
        // Commission revenue
        supabase.from('transaction_commissions').select('commission_amount').gte('created_at', d30),
        supabase.from('transaction_commissions').select('commission_amount').gte('created_at', d60).lt('created_at', d30),
        // Subscription revenue (proxy: count active subs × avg price)
        supabase.from('user_subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('user_subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'active'), // simplified
        // Service marketplace (vendor service requests as proxy)
        supabase.from('vendor_services').select('id', { count: 'exact', head: true }).gte('created_at', d30),
        supabase.from('vendor_services').select('id', { count: 'exact', head: true }).gte('created_at', d60).lt('created_at', d30),
        // Volume
        supabase.from('property_offers').select('id', { count: 'exact', head: true })
          .gte('created_at', d30).in('status', ['accepted', 'completed']),
        supabase.from('user_subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      ]);

      const commRevCurr = (commCurr.data || []).reduce((s, r) => s + (r.commission_amount || 0), 0);
      const commRevPrev = (commPrev.data || []).reduce((s, r) => s + (r.commission_amount || 0), 0);

      const subsCount = subsCurr.count || 0;
      const avgSubPrice = 500_000; // IDR 500K avg subscription price
      const subsRevCurr = subsCount * avgSubPrice;
      const subsRevPrev = (subsPrev.count || 0) * avgSubPrice;

      const svcCountCurr = svcCurr.count || 0;
      const svcCountPrev = svcPrev.count || 0;
      const avgSvcCommission = 150_000; // IDR 150K avg service commission
      const svcRevCurr = svcCountCurr * avgSvcCommission;
      const svcRevPrev = svcCountPrev * avgSvcCommission;

      // Developer packages (estimate from properties with type=development)
      const devRevCurr = Math.round(commRevCurr * 0.15); // ~15% of commission as dev packages
      const devRevPrev = Math.round(commRevPrev * 0.15);

      const commDelta = delta(commRevCurr, commRevPrev);
      const subsDelta = delta(subsRevCurr, subsRevPrev);
      const devDelta = delta(devRevCurr, devRevPrev);
      const svcDelta = delta(svcRevCurr, svcRevPrev);

      const streams: RevenueStream[] = [
        {
          key: 'commissions',
          label: 'Transaction Commissions',
          icon_key: 'percent',
          current_revenue: commRevCurr,
          previous_revenue: commRevPrev,
          delta_percent: commDelta.pct,
          direction: commDelta.dir,
          volume_metric: closedDeals.count || 0,
          volume_label: 'Closed Deals',
          avg_value: (closedDeals.count || 0) > 0 ? Math.round(commRevCurr / (closedDeals.count || 1)) : 0,
          category: 'primary',
        },
        {
          key: 'developer_packages',
          label: 'Developer Promotion Packages',
          icon_key: 'building',
          current_revenue: devRevCurr,
          previous_revenue: devRevPrev,
          delta_percent: devDelta.pct,
          direction: devDelta.dir,
          volume_metric: Math.round((closedDeals.count || 0) * 0.1),
          volume_label: 'Active Packages',
          avg_value: devRevCurr > 0 ? Math.round(devRevCurr / Math.max(1, Math.round((closedDeals.count || 1) * 0.1))) : 0,
          category: 'primary',
        },
        {
          key: 'subscriptions',
          label: 'Premium Analytics Subscriptions',
          icon_key: 'crown',
          current_revenue: subsRevCurr,
          previous_revenue: subsRevPrev,
          delta_percent: subsDelta.pct,
          direction: subsDelta.dir,
          volume_metric: activeSubs.count || 0,
          volume_label: 'Active Subscribers',
          avg_value: avgSubPrice,
          category: 'secondary',
        },
        {
          key: 'service_marketplace',
          label: 'Service Marketplace Commissions',
          icon_key: 'store',
          current_revenue: svcRevCurr,
          previous_revenue: svcRevPrev,
          delta_percent: svcDelta.pct,
          direction: svcDelta.dir,
          volume_metric: svcCountCurr,
          volume_label: 'Service Requests',
          avg_value: avgSvcCommission,
          category: 'secondary',
        },
      ];

      const totalCurr = streams.reduce((s, r) => s + r.current_revenue, 0);
      const totalPrev = streams.reduce((s, r) => s + r.previous_revenue, 0);
      const totalDelta = delta(totalCurr, totalPrev);

      // Revenue concentration (HHI)
      const shares = totalCurr > 0
        ? streams.map(s => (s.current_revenue / totalCurr) * 100)
        : [25, 25, 25, 25];
      const hhi = Math.round(shares.reduce((s, sh) => s + sh * sh, 0));
      const diversificationScore = Math.round(Math.max(0, Math.min(100, 100 - (hhi - 2500) / 75)));

      return {
        total_current: totalCurr,
        total_previous: totalPrev,
        total_delta: totalDelta.pct,
        streams,
        monthly_projections: buildProjections(streams),
        scaling_insights: buildInsights(streams),
        revenue_concentration: hhi,
        diversification_score: diversificationScore,
      };
    },
    staleTime: 10 * 60 * 1000,
  });
}

export const STREAM_META: Record<StreamKey, { color: string; chartColor: string }> = {
  commissions:          { color: 'text-chart-4',            chartColor: 'hsl(var(--chart-4))' },
  subscriptions:        { color: 'text-primary',            chartColor: 'hsl(var(--primary))' },
  developer_packages:   { color: 'text-chart-2',            chartColor: 'hsl(var(--chart-2))' },
  service_marketplace:  { color: 'text-chart-5',            chartColor: 'hsl(var(--chart-5))' },
};
