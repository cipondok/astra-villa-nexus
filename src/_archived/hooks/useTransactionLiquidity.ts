import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { subDays } from 'date-fns';

export type LiquidityHealth = 'high_liquidity' | 'balanced' | 'supply_heavy' | 'demand_heavy' | 'illiquid';

export interface LiquidityMetrics {
  total_listings: number;
  active_investors: number;
  supply_demand_ratio: number; // listings per active investor
  new_listings_7d: number;
  new_inquiries_7d: number;
  inquiry_conversion_rate: number; // % inquiries → converted
  avg_days_to_first_inquiry: number;
  high_opportunity_listings: number; // score >= 80
  high_opportunity_share: number; // % of total
  trending_zone_count: number;
  pricing_quality_score: number; // 0-100 based on valuation gap
  liquidity_score: number; // 0-100 composite
  health: LiquidityHealth;
  velocity_trend: 'accelerating' | 'stable' | 'decelerating';
}

export interface LiquidityAction {
  id: string;
  type: 'demand_activation' | 'supply_quality' | 'promotion' | 'pricing' | 'zone_highlight';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  icon_key: string;
}

export interface LiquidityInsight {
  metrics: LiquidityMetrics;
  actions: LiquidityAction[];
  supply_demand_daily: { date: string; listings: number; inquiries: number }[];
}

function classifyHealth(ratio: number, convRate: number): LiquidityHealth {
  if (ratio > 5 && convRate < 5) return 'illiquid';
  if (ratio > 3) return 'supply_heavy';
  if (ratio < 0.5) return 'demand_heavy';
  if (convRate > 15 && ratio >= 0.5 && ratio <= 3) return 'high_liquidity';
  return 'balanced';
}

function buildActions(m: LiquidityMetrics): LiquidityAction[] {
  const actions: LiquidityAction[] = [];

  if (m.supply_demand_ratio > 3) {
    actions.push({
      id: 'activate_demand',
      type: 'demand_activation',
      title: 'Activate Dormant Investors',
      description: `Supply/demand ratio ${m.supply_demand_ratio.toFixed(1)}x — trigger targeted alerts for investors with matching DNA profiles`,
      impact: 'high',
      icon_key: 'users',
    });
  }

  if (m.high_opportunity_share < 20) {
    actions.push({
      id: 'promote_elite',
      type: 'promotion',
      title: 'Boost Elite Listing Visibility',
      description: `Only ${m.high_opportunity_share.toFixed(0)}% of listings are high-opportunity — prioritize promotion of top-scored properties`,
      impact: 'high',
      icon_key: 'sparkles',
    });
  }

  if (m.pricing_quality_score < 60) {
    actions.push({
      id: 'pricing_guidance',
      type: 'pricing',
      title: 'Improve Pricing Accuracy',
      description: `Pricing quality score ${m.pricing_quality_score}/100 — encourage realistic pricing via AI valuation guidance`,
      impact: 'medium',
      icon_key: 'dollar-sign',
    });
  }

  if (m.avg_days_to_first_inquiry > 5) {
    actions.push({
      id: 'reduce_inquiry_time',
      type: 'demand_activation',
      title: 'Reduce Time-to-First-Inquiry',
      description: `Avg ${m.avg_days_to_first_inquiry.toFixed(1)} days to first inquiry — highlight new listings to matched investors immediately`,
      impact: 'high',
      icon_key: 'clock',
    });
  }

  if (m.trending_zone_count > 0) {
    actions.push({
      id: 'zone_highlight',
      type: 'zone_highlight',
      title: 'Highlight Trending Zones',
      description: `${m.trending_zone_count} trending investment zones — surface zone intelligence to drive discovery`,
      impact: 'medium',
      icon_key: 'map-pin',
    });
  }

  if (m.inquiry_conversion_rate < 10) {
    actions.push({
      id: 'supply_fundamentals',
      type: 'supply_quality',
      title: 'Strengthen Listing Fundamentals',
      description: `${m.inquiry_conversion_rate.toFixed(1)}% conversion rate — promote listings with strong investment metrics`,
      impact: 'medium',
      icon_key: 'bar-chart',
    });
  }

  return actions.sort((a, b) => {
    const p = { high: 0, medium: 1, low: 2 };
    return p[a.impact] - p[b.impact];
  });
}

export function useTransactionLiquidity(period = 30) {
  return useQuery({
    queryKey: ['transaction-liquidity', period],
    queryFn: async (): Promise<LiquidityInsight> => {
      const now = new Date();
      const d7 = subDays(now, 7).toISOString();
      const d14 = subDays(now, 14).toISOString();
      const dPeriod = subDays(now, period).toISOString();

      const [
        totalListingsRes,
        activeInvestorsRes,
        newListings7dRes,
        newListings14dRes,
        inquiries7dRes,
        inquiries14dRes,
        convertedInquiriesRes,
        eliteListingsRes,
        dailyListingsRes,
        dailyInquiriesRes,
        trendingZonesRes,
      ] = await Promise.all([
        supabase.from('properties').select('id', { count: 'exact', head: true }),
        supabase.from('investor_profiles').select('id', { count: 'exact', head: true }),
        supabase.from('properties').select('id', { count: 'exact', head: true }).gte('created_at', d7),
        supabase.from('properties').select('id', { count: 'exact', head: true }).gte('created_at', d14).lt('created_at', d7),
        supabase.from('inquiries').select('id', { count: 'exact', head: true }).gte('created_at', d7),
        supabase.from('inquiries').select('id', { count: 'exact', head: true }).gte('created_at', d14).lt('created_at', d7),
        supabase.from('inquiries').select('id', { count: 'exact', head: true }).gte('created_at', d7).eq('status', 'converted'),
        supabase.from('properties').select('id', { count: 'exact', head: true }).gte('opportunity_score', 80),
        supabase.from('properties').select('created_at').gte('created_at', dPeriod).order('created_at').limit(500),
        supabase.from('inquiries').select('created_at').gte('created_at', dPeriod).order('created_at').limit(500),
        supabase.from('market_clusters' as any).select('id', { count: 'exact', head: true }).gte('market_heat_score', 70),
      ]);

      const totalListings = totalListingsRes.count || 0;
      const activeInvestors = activeInvestorsRes.count || 1; // avoid /0
      const newListings7d = newListings7dRes.count || 0;
      const newListings14d = newListings14dRes.count || 0;
      const inquiries7d = inquiries7dRes.count || 0;
      const inquiries14d = inquiries14dRes.count || 0;
      const convertedInquiries = convertedInquiriesRes.count || 0;
      const eliteListings = eliteListingsRes.count || 0;

      const supplyDemandRatio = totalListings / Math.max(activeInvestors, 1);
      const convRate = inquiries7d > 0 ? (convertedInquiries / inquiries7d) * 100 : 0;
      const eliteShare = totalListings > 0 ? (eliteListings / totalListings) * 100 : 0;

      // Estimate avg days to first inquiry (simplified)
      const avgDaysToInquiry = newListings7d > 0 && inquiries7d > 0
        ? Math.max(1, 7 * (newListings7d / Math.max(inquiries7d, 1)))
        : 7;

      // Pricing quality: approximate via elite listing share + conversion rate
      const pricingQuality = Math.min(100, Math.round(eliteShare * 2 + convRate * 2 + 20));

      // Liquidity score: weighted composite
      const ratioScore = Math.max(0, 100 - Math.abs(supplyDemandRatio - 1.5) * 20);
      const convScore = Math.min(convRate * 3, 30);
      const velocityScore = Math.min((inquiries7d / Math.max(newListings7d, 1)) * 20, 30);
      const liquidityScore = Math.min(100, Math.round(ratioScore * 0.4 + convScore + velocityScore));

      const health = classifyHealth(supplyDemandRatio, convRate);

      // Velocity trend
      const velocityTrend: 'accelerating' | 'stable' | 'decelerating' =
        inquiries7d > inquiries14d * 1.15 ? 'accelerating' :
        inquiries7d < inquiries14d * 0.85 ? 'decelerating' : 'stable';

      // Build daily chart data
      const dailyMap = new Map<string, { listings: number; inquiries: number }>();
      for (let i = 0; i < period; i++) {
        const d = subDays(now, period - 1 - i);
        const key = d.toISOString().slice(0, 10);
        dailyMap.set(key, { listings: 0, inquiries: 0 });
      }
      (dailyListingsRes.data || []).forEach(r => {
        const key = r.created_at.slice(0, 10);
        const entry = dailyMap.get(key);
        if (entry) entry.listings++;
      });
      (dailyInquiriesRes.data || []).forEach(r => {
        const key = r.created_at.slice(0, 10);
        const entry = dailyMap.get(key);
        if (entry) entry.inquiries++;
      });
      const supplyDemandDaily = Array.from(dailyMap.entries()).map(([date, v]) => ({
        date,
        listings: v.listings,
        inquiries: v.inquiries,
      }));

      const metrics: LiquidityMetrics = {
        total_listings: totalListings,
        active_investors: activeInvestors,
        supply_demand_ratio: Math.round(supplyDemandRatio * 10) / 10,
        new_listings_7d: newListings7d,
        new_inquiries_7d: inquiries7d,
        inquiry_conversion_rate: Math.round(convRate * 10) / 10,
        avg_days_to_first_inquiry: Math.round(avgDaysToInquiry * 10) / 10,
        high_opportunity_listings: eliteListings,
        high_opportunity_share: Math.round(eliteShare * 10) / 10,
        trending_zone_count: trendingZonesRes.count || 0,
        pricing_quality_score: pricingQuality,
        liquidity_score: liquidityScore,
        health,
        velocity_trend: velocityTrend,
      };

      return {
        metrics,
        actions: buildActions(metrics),
        supply_demand_daily: supplyDemandDaily,
      };
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export const LIQUIDITY_HEALTH_META: Record<LiquidityHealth, { label: string; color: string; bgColor: string; description: string }> = {
  high_liquidity: { label: 'High Liquidity', color: 'text-chart-2', bgColor: 'bg-chart-2/10', description: 'Active supply-demand matching with fast deal closures' },
  balanced: { label: 'Balanced', color: 'text-primary', bgColor: 'bg-primary/10', description: 'Healthy marketplace equilibrium' },
  supply_heavy: { label: 'Supply Heavy', color: 'text-chart-4', bgColor: 'bg-chart-4/10', description: 'More listings than active demand — activate investors' },
  demand_heavy: { label: 'Demand Heavy', color: 'text-chart-5', bgColor: 'bg-chart-5/10', description: 'More demand than supply — accelerate listing acquisition' },
  illiquid: { label: 'Illiquid', color: 'text-destructive', bgColor: 'bg-destructive/10', description: 'Low matching efficiency — marketplace needs intervention' },
};
