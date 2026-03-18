import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { differenceInMonths } from 'date-fns';

/* ── Types ── */

export type LTVSegment = 'whale' | 'high_value' | 'moderate' | 'casual' | 'dormant';

export interface InvestorProfile {
  user_id: string;
  total_commission_revenue: number;
  deal_count: number;
  avg_revenue_per_deal: number;
  tenure_months: number;
  deals_per_year: number;
  projected_ltv: number;
  segment: LTVSegment;
}

export interface SegmentStats {
  segment: LTVSegment;
  label: string;
  color: string;
  count: number;
  pct: number;
  avg_ltv: number;
  total_revenue: number;
  avg_deals: number;
  avg_tenure_months: number;
}

export interface LTVDistributionBucket {
  range: string;
  count: number;
}

export interface InvestorLTVData {
  // Aggregate
  platform_avg_ltv: number;
  median_ltv: number;
  total_investor_count: number;
  avg_revenue_per_deal: number;
  avg_deals_per_investor: number;
  avg_tenure_months: number;
  projected_lifecycle_years: number;
  // Segments
  segments: SegmentStats[];
  // Distribution
  distribution: LTVDistributionBucket[];
  // Top investors
  top_investors: InvestorProfile[];
  // Retention insight
  retention_insights: RetentionInsight[];
}

export interface RetentionInsight {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  icon_key: string;
  segment_target: LTVSegment;
}

/* ── Segment classifier ── */

export function classifySegment(ltv: number): LTVSegment {
  if (ltv >= 50_000_000) return 'whale';       // ≥50M IDR
  if (ltv >= 15_000_000) return 'high_value';   // ≥15M IDR
  if (ltv >= 3_000_000) return 'moderate';      // ≥3M IDR
  if (ltv >= 500_000) return 'casual';          // ≥500K IDR
  return 'dormant';
}

export function computeLTV(
  avgRevenuePerDeal: number,
  dealsPerYear: number,
  lifecycleYears: number,
): number {
  return Math.round(avgRevenuePerDeal * dealsPerYear * lifecycleYears);
}

export const SEGMENT_META: Record<LTVSegment, { label: string; color: string; bgColor: string; emoji: string }> = {
  whale:      { label: 'Whale',      color: 'text-chart-4',       bgColor: 'bg-chart-4/10',       emoji: '🐋' },
  high_value: { label: 'High Value', color: 'text-primary',       bgColor: 'bg-primary/10',       emoji: '💎' },
  moderate:   { label: 'Moderate',   color: 'text-chart-2',       bgColor: 'bg-chart-2/10',       emoji: '📈' },
  casual:     { label: 'Casual',     color: 'text-chart-5',       bgColor: 'bg-chart-5/10',       emoji: '👋' },
  dormant:    { label: 'Dormant',    color: 'text-muted-foreground', bgColor: 'bg-muted/30',       emoji: '💤' },
};

/* ── Hook ── */

const PROJECTED_LIFECYCLE_YEARS = 3;

export function useInvestorLTV() {
  return useQuery({
    queryKey: ['investor-ltv'],
    queryFn: async (): Promise<InvestorLTVData> => {
      // Fetch commissions grouped by user, plus profile tenure
      const [commissionsRes, profilesRes] = await Promise.all([
        supabase
          .from('transaction_commissions')
          .select('seller_id, commission_amount, created_at')
          .limit(1000),
        supabase
          .from('profiles')
          .select('id, created_at')
          .limit(1000),
      ]);

      const commissions = commissionsRes.data || [];
      const profiles = profilesRes.data || [];

      // Build per-user commission map
      const userMap = new Map<string, { revenue: number; deals: number; firstDeal: string }>();
      for (const c of commissions) {
        const uid = c.agent_id;
        if (!uid) continue;
        const existing = userMap.get(uid) || { revenue: 0, deals: 0, firstDeal: c.created_at };
        existing.revenue += c.commission_amount || 0;
        existing.deals++;
        if (c.created_at < existing.firstDeal) existing.firstDeal = c.created_at;
        userMap.set(uid, existing);
      }

      // Build tenure map from profiles
      const tenureMap = new Map<string, number>();
      const now = new Date();
      for (const p of profiles) {
        tenureMap.set(p.id, Math.max(1, differenceInMonths(now, new Date(p.created_at))));
      }

      // Compute per-investor LTV
      const investors: InvestorProfile[] = [];
      for (const [uid, data] of userMap) {
        const tenure = tenureMap.get(uid) || 6;
        const avgRevPerDeal = data.deals > 0 ? data.revenue / data.deals : 0;
        const dealsPerYear = tenure > 0 ? (data.deals / tenure) * 12 : data.deals;
        const projected = computeLTV(avgRevPerDeal, dealsPerYear, PROJECTED_LIFECYCLE_YEARS);

        investors.push({
          user_id: uid,
          total_commission_revenue: data.revenue,
          deal_count: data.deals,
          avg_revenue_per_deal: Math.round(avgRevPerDeal),
          tenure_months: tenure,
          deals_per_year: Math.round(dealsPerYear * 10) / 10,
          projected_ltv: projected,
          segment: classifySegment(projected),
        });
      }

      // Include dormant profiles (no deals)
      const activeIds = new Set(userMap.keys());
      for (const p of profiles) {
        if (!activeIds.has(p.id)) {
          const tenure = tenureMap.get(p.id) || 1;
          investors.push({
            user_id: p.id,
            total_commission_revenue: 0,
            deal_count: 0,
            avg_revenue_per_deal: 0,
            tenure_months: tenure,
            deals_per_year: 0,
            projected_ltv: 0,
            segment: 'dormant',
          });
        }
      }

      // Aggregate metrics
      const withDeals = investors.filter(i => i.deal_count > 0);
      const allLTVs = investors.map(i => i.projected_ltv).sort((a, b) => a - b);
      const medianIdx = Math.floor(allLTVs.length / 2);

      const platformAvg = investors.length > 0
        ? Math.round(investors.reduce((s, i) => s + i.projected_ltv, 0) / investors.length)
        : 0;
      const medianLTV = allLTVs.length > 0
        ? allLTVs.length % 2 === 0
          ? Math.round((allLTVs[medianIdx - 1] + allLTVs[medianIdx]) / 2)
          : allLTVs[medianIdx]
        : 0;
      const avgRevPerDeal = withDeals.length > 0
        ? Math.round(withDeals.reduce((s, i) => s + i.avg_revenue_per_deal, 0) / withDeals.length)
        : 0;
      const avgDeals = withDeals.length > 0
        ? Math.round(withDeals.reduce((s, i) => s + i.deal_count, 0) / withDeals.length * 10) / 10
        : 0;
      const avgTenure = investors.length > 0
        ? Math.round(investors.reduce((s, i) => s + i.tenure_months, 0) / investors.length)
        : 0;

      // Segment stats
      const segmentOrder: LTVSegment[] = ['whale', 'high_value', 'moderate', 'casual', 'dormant'];
      const segments: SegmentStats[] = segmentOrder.map(seg => {
        const group = investors.filter(i => i.segment === seg);
        const meta = SEGMENT_META[seg];
        return {
          segment: seg,
          label: meta.label,
          color: meta.color,
          count: group.length,
          pct: investors.length > 0 ? Math.round((group.length / investors.length) * 1000) / 10 : 0,
          avg_ltv: group.length > 0 ? Math.round(group.reduce((s, i) => s + i.projected_ltv, 0) / group.length) : 0,
          total_revenue: Math.round(group.reduce((s, i) => s + i.total_commission_revenue, 0)),
          avg_deals: group.length > 0 ? Math.round(group.reduce((s, i) => s + i.deal_count, 0) / group.length * 10) / 10 : 0,
          avg_tenure_months: group.length > 0 ? Math.round(group.reduce((s, i) => s + i.tenure_months, 0) / group.length) : 0,
        };
      });

      // Distribution buckets
      const buckets = [
        { range: '0', min: 0, max: 0 },
        { range: '< 1M', min: 1, max: 1_000_000 },
        { range: '1-5M', min: 1_000_000, max: 5_000_000 },
        { range: '5-15M', min: 5_000_000, max: 15_000_000 },
        { range: '15-50M', min: 15_000_000, max: 50_000_000 },
        { range: '50M+', min: 50_000_000, max: Infinity },
      ];
      const distribution: LTVDistributionBucket[] = buckets.map(b => ({
        range: b.range,
        count: investors.filter(i =>
          b.max === 0 ? i.projected_ltv === 0 : i.projected_ltv >= b.min && i.projected_ltv < b.max
        ).length,
      }));

      // Top investors by LTV
      const top_investors = [...investors]
        .sort((a, b) => b.projected_ltv - a.projected_ltv)
        .slice(0, 10);

      // Retention insights
      const whaleCount = segments.find(s => s.segment === 'whale')?.count || 0;
      const dormantCount = segments.find(s => s.segment === 'dormant')?.count || 0;
      const casualCount = segments.find(s => s.segment === 'casual')?.count || 0;

      const retention_insights: RetentionInsight[] = [];

      if (whaleCount > 0) {
        retention_insights.push({
          id: 'protect_whales',
          title: 'Protect Whale Investors',
          description: `${whaleCount} whale investors generate disproportionate revenue — assign dedicated relationship managers and priority deal access`,
          impact: 'high',
          icon_key: 'shield',
          segment_target: 'whale',
        });
      }

      if (dormantCount > investors.length * 0.3) {
        retention_insights.push({
          id: 'reactivate_dormant',
          title: 'Reactivate Dormant Investors',
          description: `${dormantCount} dormant users (${Math.round(dormantCount / investors.length * 100)}%) — trigger re-engagement with personalized opportunity alerts`,
          impact: 'high',
          icon_key: 'bell',
          segment_target: 'dormant',
        });
      }

      if (casualCount > 0) {
        retention_insights.push({
          id: 'upgrade_casual',
          title: 'Upgrade Casual to Moderate',
          description: `${casualCount} casual investors show potential — incentivize second transaction with reduced commission or exclusive listings`,
          impact: 'medium',
          icon_key: 'arrow-up',
          segment_target: 'casual',
        });
      }

      retention_insights.push({
        id: 'lifecycle_extension',
        title: 'Extend Investor Lifecycle',
        description: `Avg tenure: ${avgTenure} months — increase through portfolio performance summaries, market intelligence, and milestone rewards`,
        impact: 'medium',
        icon_key: 'clock',
        segment_target: 'moderate',
      });

      return {
        platform_avg_ltv: platformAvg,
        median_ltv: medianLTV,
        total_investor_count: investors.length,
        avg_revenue_per_deal: avgRevPerDeal,
        avg_deals_per_investor: avgDeals,
        avg_tenure_months: avgTenure,
        projected_lifecycle_years: PROJECTED_LIFECYCLE_YEARS,
        segments,
        distribution,
        top_investors,
        retention_insights,
      };
    },
    staleTime: 10 * 60 * 1000,
  });
}
