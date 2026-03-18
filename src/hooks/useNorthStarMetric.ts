import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { subDays, startOfWeek, format } from 'date-fns';

/* ── Types ── */

export interface QualifiedAction {
  type: 'inquiry' | 'offer' | 'watchlist_engaged';
  count: number;
  icon_key: string;
  label: string;
  weight: number; // contribution weight to North Star
}

export interface WeeklyTrendPoint {
  week: string;        // ISO week start
  weekLabel: string;   // display label
  total: number;
  inquiries: number;
  offers: number;
  watchlist: number;
}

export interface SupportingMetric {
  key: string;
  label: string;
  value: number | string;
  change: number;  // % vs previous period
  direction: 'up' | 'down' | 'flat';
  icon_key: string;
}

export type NorthStarHealth = 'accelerating' | 'on_track' | 'at_risk' | 'declining';

export interface NorthStarData {
  // Core metric
  qualified_actions_current: number;
  qualified_actions_previous: number;
  delta_percent: number;
  direction: 'up' | 'down' | 'flat';
  health: NorthStarHealth;
  // Breakdown
  actions: QualifiedAction[];
  // Trend (last 8 weeks)
  weekly_trend: WeeklyTrendPoint[];
  // Supporting inputs
  supporting: SupportingMetric[];
  // Targets
  monthly_target: number;
  target_progress: number; // 0-100
}

/* ── Classifiers ── */

function classifyHealth(delta: number, progress: number): NorthStarHealth {
  if (delta >= 15 && progress >= 70) return 'accelerating';
  if (delta >= 0 && progress >= 40) return 'on_track';
  if (delta >= -10) return 'at_risk';
  return 'declining';
}

/* ── Hook ── */

export function useNorthStarMetric(monthlyTarget = 500) {
  return useQuery({
    queryKey: ['north-star-metric', monthlyTarget],
    queryFn: async (): Promise<NorthStarData> => {
      const now = new Date();
      const d30 = subDays(now, 30).toISOString();
      const d60 = subDays(now, 60).toISOString();
      const d56 = subDays(now, 56).toISOString(); // 8 weeks back for trend

      // Current period (last 30d)
      const [
        inquiriesCurr, inquiriesPrev,
        offersCurr, offersPrev,
        watchlistCurr, watchlistPrev,
        // Supporting metrics
        activeInvestors, prevActiveInvestors,
        discoveryDepth,
        // Trend raw data
        trendInquiries, trendOffers, trendWatchlist,
      ] = await Promise.all([
        // Inquiries
        supabase.from('inquiries').select('id', { count: 'exact', head: true }).gte('created_at', d30),
        supabase.from('inquiries').select('id', { count: 'exact', head: true }).gte('created_at', d60).lt('created_at', d30),
        // Offers
        supabase.from('property_offers').select('id', { count: 'exact', head: true }).gte('created_at', d30),
        supabase.from('property_offers').select('id', { count: 'exact', head: true }).gte('created_at', d60).lt('created_at', d30),
        // Watchlist with repeat engagement (items added + user came back)
        supabase.from('investor_watchlist_items').select('id', { count: 'exact', head: true }).gte('created_at', d30),
        supabase.from('investor_watchlist_items').select('id', { count: 'exact', head: true }).gte('created_at', d60).lt('created_at', d30),
        // Active investors (distinct users with activity)
        supabase.from('activity_logs').select('user_id', { count: 'exact', head: true }).gte('created_at', d30),
        supabase.from('activity_logs').select('user_id', { count: 'exact', head: true }).gte('created_at', d60).lt('created_at', d30),
        // Discovery depth (searches + property views)
        supabase.from('search_analytics').select('id', { count: 'exact', head: true }).gte('created_at', d30),
        // Weekly trend data
        supabase.from('inquiries').select('created_at').gte('created_at', d56).order('created_at', { ascending: true }).limit(1000),
        supabase.from('property_offers').select('created_at').gte('created_at', d56).order('created_at', { ascending: true }).limit(1000),
        supabase.from('investor_watchlist_items').select('created_at').gte('created_at', d56).order('created_at', { ascending: true }).limit(1000),
      ]);

      const inqCount = inquiriesCurr.count ?? 0;
      const offerCount = offersCurr.count ?? 0;
      const wlCount = watchlistCurr.count ?? 0;
      const inqPrev = inquiriesPrev.count ?? 0;
      const offerPrev = offersPrev.count ?? 0;
      const wlPrev = watchlistPrev.count ?? 0;

      // Weighted qualified actions: inquiries(1x) + offers(3x) + watchlist(0.5x)
      const WEIGHTS = { inquiry: 1, offer: 3, watchlist: 0.5 };
      const currentTotal = Math.round(inqCount * WEIGHTS.inquiry + offerCount * WEIGHTS.offer + wlCount * WEIGHTS.watchlist);
      const previousTotal = Math.round(inqPrev * WEIGHTS.inquiry + offerPrev * WEIGHTS.offer + wlPrev * WEIGHTS.watchlist);

      const delta = previousTotal > 0
        ? Math.round(((currentTotal - previousTotal) / previousTotal) * 1000) / 10
        : currentTotal > 0 ? 100 : 0;

      const targetProgress = Math.min(100, Math.round((currentTotal / monthlyTarget) * 100));

      const actions: QualifiedAction[] = [
        { type: 'inquiry', count: inqCount, icon_key: 'message-square', label: 'Inquiry Submissions', weight: WEIGHTS.inquiry },
        { type: 'offer', count: offerCount, icon_key: 'file-text', label: 'Offer Initiations', weight: WEIGHTS.offer },
        { type: 'watchlist_engaged', count: wlCount, icon_key: 'bookmark', label: 'Engaged Watchlist Adds', weight: WEIGHTS.watchlist },
      ];

      // Weekly trend (8 weeks)
      const weeklyMap = new Map<string, WeeklyTrendPoint>();
      for (let w = 0; w < 8; w++) {
        const ws = startOfWeek(subDays(now, (7 - w) * 7), { weekStartsOn: 1 });
        const key = format(ws, 'yyyy-MM-dd');
        weeklyMap.set(key, {
          week: key,
          weekLabel: format(ws, 'MMM d'),
          total: 0,
          inquiries: 0,
          offers: 0,
          watchlist: 0,
        });
      }

      const bucketize = (rows: any[], field: 'inquiries' | 'offers' | 'watchlist', weight: number) => {
        for (const r of rows) {
          const ws = startOfWeek(new Date(r.created_at), { weekStartsOn: 1 });
          const key = format(ws, 'yyyy-MM-dd');
          const entry = weeklyMap.get(key);
          if (entry) {
            entry[field]++;
            entry.total += weight;
          }
        }
      };

      bucketize(trendInquiries.data || [], 'inquiries', WEIGHTS.inquiry);
      bucketize(trendOffers.data || [], 'offers', WEIGHTS.offer);
      bucketize(trendWatchlist.data || [], 'watchlist', WEIGHTS.watchlist);

      const weekly_trend = Array.from(weeklyMap.values()).map(w => ({
        ...w,
        total: Math.round(w.total),
      }));

      // Supporting metrics
      const activeCount = activeInvestors.count ?? 0;
      const prevActive = prevActiveInvestors.count ?? 0;
      const activeDelta = prevActive > 0 ? Math.round(((activeCount - prevActive) / prevActive) * 100) : 0;

      const discoveryCount = discoveryDepth.count ?? 0;

      const supporting: SupportingMetric[] = [
        {
          key: 'active_investors',
          label: 'Active Investors',
          value: activeCount,
          change: activeDelta,
          direction: activeDelta > 0 ? 'up' : activeDelta < 0 ? 'down' : 'flat',
          icon_key: 'users',
        },
        {
          key: 'discovery_depth',
          label: 'Discovery Interactions',
          value: discoveryCount,
          change: 0,
          direction: 'flat',
          icon_key: 'search',
        },
        {
          key: 'deal_velocity',
          label: 'Offers per Inquiry',
          value: inqCount > 0 ? `${(offerCount / inqCount * 100).toFixed(1)}%` : '0%',
          change: 0,
          direction: inqCount > 0 && offerCount > 0 ? 'up' : 'flat',
          icon_key: 'trending-up',
        },
      ];

      return {
        qualified_actions_current: currentTotal,
        qualified_actions_previous: previousTotal,
        delta_percent: delta,
        direction: delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat',
        health: classifyHealth(delta, targetProgress),
        actions,
        weekly_trend,
        supporting,
        monthly_target: monthlyTarget,
        target_progress: targetProgress,
      };
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
  });
}

export const NORTH_STAR_HEALTH_META: Record<NorthStarHealth, { label: string; color: string; bgColor: string; emoji: string }> = {
  accelerating: { label: 'Accelerating', color: 'text-chart-2', bgColor: 'bg-chart-2/10', emoji: '🚀' },
  on_track: { label: 'On Track', color: 'text-primary', bgColor: 'bg-primary/10', emoji: '✅' },
  at_risk: { label: 'At Risk', color: 'text-chart-4', bgColor: 'bg-chart-4/10', emoji: '⚠️' },
  declining: { label: 'Declining', color: 'text-destructive', bgColor: 'bg-destructive/10', emoji: '🔻' },
};
