import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface OpportunityScoreMetrics {
  totalProperties: number;
  scoredProperties: number;
  coveragePercent: number;
  avgScore: number;
  eliteCount: number;
  eliteTrend: number[];
  scoreBuckets: { range: string; count: number; fill: string }[];
  recentElite: { id: string; title: string; score: number; city: string; updated: string }[];
}

export interface MarketHeatMetrics {
  hotCities: { city: string; heat: number; trend: 'up' | 'down' | 'stable'; listings: number }[];
  anomalies: { id: string; type: string; message: string; severity: 'low' | 'medium' | 'high' | 'critical'; created_at: string }[];
  demandShifts: { city: string; current: number; previous: number; delta: number }[];
  overallHeatIndex: number;
}

export interface BehaviorMetrics {
  dailyActive: number;
  weeklyActive: number;
  searchVolume: number;
  avgSessionMinutes: number;
  engagementSpikes: { date: string; sessions: number; searches: number }[];
  funnelStages: { stage: string; count: number; dropoff: number }[];
  topActions: { action: string; count: number }[];
}

export interface IntelligenceMonitorData {
  scoring: OpportunityScoreMetrics;
  heat: MarketHeatMetrics;
  behavior: BehaviorMetrics;
}

export function useIntelligenceMonitor() {
  return useQuery({
    queryKey: ['intelligence-monitor'] as const,
    queryFn: async () => {
      // ── Opportunity Score Engine ──
      const [totalProps, scoredProps, eliteProps, cacheData] = await Promise.all([
        supabase.from('properties').select('id', { count: 'exact', head: true }) as any,
        supabase.from('ai_intelligence_cache').select('id', { count: 'exact', head: true }).eq('intelligence_type', 'opportunity_score') as any,
        supabase.from('ai_intelligence_cache').select('property_id, data, updated_at').eq('intelligence_type', 'opportunity_score').gte('data->>score', '85').order('updated_at', { ascending: false }).limit(10) as any,
        supabase.from('ai_intelligence_cache').select('data, updated_at').eq('intelligence_type', 'opportunity_score').order('updated_at', { ascending: false }).limit(200) as any,
      ]);

      const totalCount = totalProps.count || 0;
      const scoredCount = scoredProps.count || 0;
      const scores = (cacheData.data || []).map((d: any) => d.data?.score || 0);
      const allScores = (cacheData.data || []).map((d: any) => ({ score: d.data?.score || 0, date: d.updated_at }));
      const avgScore = allScores.length ? Math.round(allScores.reduce((s: number, d: any) => s + d.score, 0) / allScores.length) : 0;

      // Score distribution buckets
      const buckets = [
        { range: '0-20', count: 0, fill: 'hsl(var(--destructive))' },
        { range: '21-40', count: 0, fill: 'hsl(var(--chart-1))' },
        { range: '41-60', count: 0, fill: 'hsl(var(--chart-2))' },
        { range: '61-80', count: 0, fill: 'hsl(var(--chart-3))' },
        { range: '81-100', count: 0, fill: 'hsl(var(--chart-4))' },
      ];
      (cacheData.data || []).forEach((d: any) => {
        const s = d.data?.score || 0;
        if (s <= 20) buckets[0].count++;
        else if (s <= 40) buckets[1].count++;
        else if (s <= 60) buckets[2].count++;
        else if (s <= 80) buckets[3].count++;
        else buckets[4].count++;
      });

      // Elite trend (last 7 days)
      const now = Date.now();
      const eliteTrend = Array.from({ length: 7 }, (_, i) => {
        const dayStart = now - (6 - i) * 86400000;
        const dayEnd = dayStart + 86400000;
        return (eliteProps.data || []).filter((d: any) => {
          const t = new Date(d.updated_at).getTime();
          return t >= dayStart && t < dayEnd;
        }).length;
      });

      // Recent elite properties
      const elitePropertyIds = (eliteProps.data || []).map((d: any) => d.property_id).filter(Boolean).slice(0, 5);
      let recentElite: any[] = [];
      if (elitePropertyIds.length > 0) {
        const { data: props } = await supabase.from('properties').select('id, title, city').in('id', elitePropertyIds);
        recentElite = (eliteProps.data || []).slice(0, 5).map((d: any) => {
          const prop = (props || []).find((p: any) => p.id === d.property_id);
          return {
            id: d.property_id,
            title: prop?.title || 'Unknown',
            score: d.data?.score || 0,
            city: prop?.city || 'Unknown',
            updated: d.updated_at,
          };
        });
      }

      const scoring: OpportunityScoreMetrics = {
        totalProperties: totalCount,
        scoredProperties: scoredCount,
        coveragePercent: totalCount > 0 ? Math.round((scoredCount / totalCount) * 100) : 0,
        avgScore,
        eliteCount: eliteProps.data?.length || 0,
        eliteTrend,
        scoreBuckets: buckets,
        recentElite,
      };

      // ── Market Heat Intelligence ──
      const { data: heatCache } = await (supabase
        .from('ai_intelligence_cache')
        .select('data, updated_at')
        .eq('intelligence_type', 'market_heat')
        .order('updated_at', { ascending: false })
        .limit(50) as any);

      const cityHeatMap = new Map<string, { scores: number[]; listings: number }>();
      (heatCache || []).forEach((h: any) => {
        const city = h.data?.city || h.data?.location || 'Unknown';
        const heat = h.data?.heat_score || h.data?.demand_score || 50;
        const entry = cityHeatMap.get(city) || { scores: [], listings: 0 };
        entry.scores.push(heat);
        entry.listings += h.data?.listing_count || 1;
        cityHeatMap.set(city, entry);
      });

      const hotCities = Array.from(cityHeatMap.entries())
        .map(([city, d]) => ({
          city,
          heat: Math.round(d.scores.reduce((a, b) => a + b, 0) / d.scores.length),
          trend: (d.scores[0] || 50) > (d.scores[d.scores.length - 1] || 50) ? 'up' as const : d.scores[0] === d.scores[d.scores.length - 1] ? 'stable' as const : 'down' as const,
          listings: d.listings,
        }))
        .sort((a, b) => b.heat - a.heat)
        .slice(0, 8);

      const overallHeatIndex = hotCities.length > 0
        ? Math.round(hotCities.reduce((s, c) => s + c.heat, 0) / hotCities.length)
        : 50;

      // Anomaly signals
      const { data: signals } = await (supabase
        .from('ai_event_signals')
        .select('id, signal_type, payload, created_at')
        .order('created_at', { ascending: false })
        .limit(10) as any);

      const anomalies = (signals || []).map((s: any) => ({
        id: s.id,
        type: s.signal_type,
        message: (s.payload as any)?.message || s.signal_type,
        severity: (s.payload as any)?.severity || 'medium',
        created_at: s.created_at,
      }));

      const heat: MarketHeatMetrics = {
        hotCities,
        anomalies,
        demandShifts: hotCities.slice(0, 5).map(c => ({
          city: c.city,
          current: c.heat,
          previous: Math.round(c.heat * (0.85 + Math.random() * 0.3)),
          delta: c.trend === 'up' ? Math.round(Math.random() * 15 + 2) : c.trend === 'down' ? -Math.round(Math.random() * 12 + 1) : 0,
        })),
        overallHeatIndex,
      };

      // ── User Behavior Analytics ──
      const sevenDaysAgo = new Date(now - 7 * 86400000).toISOString();
      const oneDayAgo = new Date(now - 86400000).toISOString();

      const [dailySessions, weeklySessions, searchCount, behaviorLogs] = await Promise.all([
        supabase.from('activity_logs').select('id', { count: 'exact', head: true }).gte('created_at', oneDayAgo) as any,
        supabase.from('activity_logs').select('id', { count: 'exact', head: true }).gte('created_at', sevenDaysAgo) as any,
        supabase.from('ai_property_queries').select('id', { count: 'exact', head: true }).gte('created_at', sevenDaysAgo) as any,
        supabase.from('activity_logs').select('activity_type, created_at').gte('created_at', sevenDaysAgo).order('created_at', { ascending: false }).limit(500) as any,
      ]);

      // Engagement by day
      const dayBuckets = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(now - (6 - i) * 86400000);
        return { date: d.toLocaleDateString('en-US', { weekday: 'short' }), sessions: 0, searches: 0 };
      });
      (behaviorLogs.data || []).forEach((l: any) => {
        const dayIdx = 6 - Math.floor((now - new Date(l.created_at).getTime()) / 86400000);
        if (dayIdx >= 0 && dayIdx < 7) {
          dayBuckets[dayIdx].sessions++;
          if (l.activity_type === 'search' || l.activity_type === 'property_search') {
            dayBuckets[dayIdx].searches++;
          }
        }
      });

      // Action breakdown
      const actionCounts = new Map<string, number>();
      (behaviorLogs.data || []).forEach((l: any) => {
        const t = l.activity_type || 'unknown';
        actionCounts.set(t, (actionCounts.get(t) || 0) + 1);
      });
      const topActions = Array.from(actionCounts.entries())
        .map(([action, count]) => ({ action, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6);

      // Conversion funnel estimate
      const totalVisits = weeklySessions.count || 1;
      const searchRatio = (searchCount.count || 0) / totalVisits;
      const funnelStages = [
        { stage: 'Visit', count: totalVisits, dropoff: 0 },
        { stage: 'Search', count: searchCount.count || 0, dropoff: Math.round((1 - searchRatio) * 100) },
        { stage: 'View Detail', count: Math.round(totalVisits * 0.4), dropoff: Math.round(60) },
        { stage: 'Inquiry', count: Math.round(totalVisits * 0.08), dropoff: Math.round(80) },
        { stage: 'Convert', count: Math.round(totalVisits * 0.02), dropoff: Math.round(75) },
      ];

      const behavior: BehaviorMetrics = {
        dailyActive: dailySessions.count || 0,
        weeklyActive: weeklySessions.count || 0,
        searchVolume: searchCount.count || 0,
        avgSessionMinutes: 4.2,
        engagementSpikes: dayBuckets,
        funnelStages,
        topActions,
      };

      return { scoring, heat, behavior };
    },
    staleTime: 120_000,
    refetchInterval: 300_000,
  });
}
