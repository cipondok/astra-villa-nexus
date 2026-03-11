import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

export interface PeriodComparison {
  current: number;
  previous: number;
  delta: number; // percentage change
  direction: 'up' | 'down' | 'neutral';
  sparkline?: number[]; // daily values for the current period
}

export interface HistoricalKPIs {
  wow: { // week-over-week
    newProperties: PeriodComparison;
    jobsCompleted: PeriodComparison;
    jobsFailed: PeriodComparison;
    searches: PeriodComparison;
  };
  mom: { // month-over-month
    newProperties: PeriodComparison;
    jobsCompleted: PeriodComparison;
    jobsFailed: PeriodComparison;
    searches: PeriodComparison;
    avgPrice: PeriodComparison;
  };
}

export interface AICommandCenterData {
  overview: {
    totalProperties: number;
    avgSeoScore: number;
    avgInvestmentScore: number;
    avgEstimatedValue: number;
    avgPredictedROI: number;
  };
  jobStatus: {
    running: number;
    pending: number;
    completed: number;
    failed: number;
    recentJobs: any[];
    throughput: { date: string; completed: number; failed: number }[];
    avgDurationSec: number;
    totalProcessed: number;
    jobTypeBreakdown: { type: string; count: number; fill: string }[];
  };
  seo: {
    weakListings: number;
    avgScore: number;
    totalAnalyzed: number;
    coveragePercent: number;
    recentAnalyses: any[];
    scoreBuckets: { range: string; count: number; fill: string }[];
    subScores: { metric: string; avg: number }[];
    ratingBreakdown: { rating: string; count: number; fill: string }[];
  };
  roiForecasts: any[];
  searchAnalytics: {
    topQueries: { query: string; count: number }[];
    totalSearches: number;
    conversionRate: number;
    volumeByDay: { date: string; searches: number }[];
    categoryBreakdown: { category: string; count: number; fill: string }[];
  };
  priceTrends: { month: string; avgPrice: number; count: number }[];
  recentActions: any[];
  systemHealth: {
    edgeFunctions: { name: string; status: 'ok' | 'error' | 'unknown'; latencyMs: number }[];
    dbHealth: 'ok' | 'error' | 'unknown';
    dbLatencyMs: number;
    schedulerHealth: 'ok' | 'warning' | 'error';
    lastJobRun: string | null;
    stalledJobs: number;
  };
  historicalKPIs: HistoricalKPIs;
  valuations: {
    totalValuations: number;
    avgConfidence: number;
    coveragePercent: number;
    recentValuations: any[];
    confidenceBuckets: { range: string; count: number; fill: string }[];
    roiForecastCount: number;
    valuationsThisWeek: number;
    valuationsLastWeek: number;
    avgEstimatedValue: number;
    trendDirection: 'up' | 'down' | 'neutral';
  };
}

async function checkEdgeFunctionHealth(name: string): Promise<{ status: 'ok' | 'error'; latencyMs: number }> {
  const start = Date.now();
  try {
    const { error } = await supabase.functions.invoke(name, { body: { mode: 'system_health_check', healthCheck: true } });
    const latencyMs = Date.now() - start;
    // A 400 "Invalid mode" still means the function is reachable
    return { status: error?.message?.includes('not found') ? 'error' : 'ok', latencyMs };
  } catch {
    return { status: 'error', latencyMs: Date.now() - start };
  }
}

async function checkDbHealth(): Promise<{ status: 'ok' | 'error'; latencyMs: number }> {
  const start = Date.now();
  try {
    const { error } = await supabase.from('profiles').select('id').limit(1);
    return { status: error ? 'error' : 'ok', latencyMs: Date.now() - start };
  } catch {
    return { status: 'error', latencyMs: Date.now() - start };
  }
}

function makePeriodComparison(current: number, previous: number, sparkline?: number[]): PeriodComparison {
  const delta = previous > 0 ? Math.round(((current - previous) / previous) * 1000) / 10 : (current > 0 ? 100 : 0);
  return { current, previous, delta, direction: delta > 0 ? 'up' : delta < 0 ? 'down' : 'neutral', sparkline };
}

function groupByDay(rows: any[], dateCol: string, startIso: string, days: number): number[] {
  const start = new Date(startIso).getTime();
  const buckets = new Array(days).fill(0);
  for (const r of rows) {
    const d = new Date(r[dateCol]).getTime();
    const idx = Math.floor((d - start) / 86400000);
    if (idx >= 0 && idx < days) buckets[idx]++;
  }
  return buckets;
}

async function fetchCommandCenterData(): Promise<AICommandCenterData> {
  const now = new Date();
  const thisWeekStart = new Date(now.getTime() - 7 * 86400000).toISOString();
  const lastWeekStart = new Date(now.getTime() - 14 * 86400000).toISOString();
  const thisMonthStart = new Date(now.getTime() - 30 * 86400000).toISOString();
  const lastMonthStart = new Date(now.getTime() - 60 * 86400000).toISOString();

  const [
    propertiesRes,
    jobsRes,
    pendingJobsRes,
    failedJobsRes,
    completedJobsRes,
    seoRes,
    roiRes,
    searchRes,
    recentJobLogsRes,
    stalledJobsRes,
    lastCompletedJobRes,
    priceTrendRes,
    // Historical period queries
    propsThisWeek, propsLastWeek, propsThisMonth, propsLastMonth,
    jobsCompThisWeek, jobsCompLastWeek, jobsCompThisMonth, jobsCompLastMonth,
    jobsFailThisWeek, jobsFailLastWeek, jobsFailThisMonth, jobsFailLastMonth,
    searchThisWeek, searchLastWeek, searchThisMonth, searchLastMonth,
    // Sparkline raw data
    sparkPropsRaw, sparkJobsCompRaw, sparkJobsFailRaw, sparkSearchRaw,
    // Valuation data
    valuationsRes,
    valuationsThisWeekRes,
    valuationsLastWeekRes,
    roiForecastCountRes,
    // Job throughput (14 days of completed+failed jobs with timestamps)
    jobThroughputRes,
    // Search volume (14 days)
    searchVolumeRes,
  ] = await Promise.all([
    supabase.from('properties').select('id, investment_score, price, created_at', { count: 'exact' }),
    supabase.from('ai_jobs').select('*').eq('status', 'running').limit(10),
    supabase.from('ai_jobs').select('id', { count: 'exact' }).eq('status', 'pending'),
    supabase.from('ai_jobs').select('id', { count: 'exact' }).eq('status', 'failed'),
    supabase.from('ai_jobs').select('id', { count: 'exact' }).eq('status', 'completed'),
    supabase.from('property_seo_analysis').select('id, seo_score, title_score, description_score, keyword_score, image_score, location_score, hashtag_score, seo_rating, property_id, last_analyzed_at, ranking_difficulty').not('seo_score', 'is', null).order('last_analyzed_at', { ascending: false }).limit(200),
    supabase.from('property_roi_forecast').select('*').order('last_calculated', { ascending: false }).limit(20),
    supabase.from('ai_property_queries').select('query_text, created_at').order('created_at', { ascending: false }).limit(500),
    supabase.from('ai_job_logs').select('*').order('created_at', { ascending: false }).limit(20),
    supabase.from('ai_jobs').select('id', { count: 'exact' }).eq('status', 'running').lt('started_at', new Date(Date.now() - 30 * 60000).toISOString()),
    supabase.from('ai_jobs').select('completed_at').eq('status', 'completed').order('completed_at', { ascending: false }).limit(1),
    supabase.from('properties').select('price, created_at').not('price', 'is', null).order('created_at', { ascending: true }).limit(500),
    // Properties by period
    supabase.from('properties').select('id', { count: 'exact' }).gte('created_at', thisWeekStart),
    supabase.from('properties').select('id', { count: 'exact' }).gte('created_at', lastWeekStart).lt('created_at', thisWeekStart),
    supabase.from('properties').select('id', { count: 'exact' }).gte('created_at', thisMonthStart),
    supabase.from('properties').select('id', { count: 'exact' }).gte('created_at', lastMonthStart).lt('created_at', thisMonthStart),
    // Jobs completed by period
    supabase.from('ai_jobs').select('id', { count: 'exact' }).eq('status', 'completed').gte('completed_at', thisWeekStart),
    supabase.from('ai_jobs').select('id', { count: 'exact' }).eq('status', 'completed').gte('completed_at', lastWeekStart).lt('completed_at', thisWeekStart),
    supabase.from('ai_jobs').select('id', { count: 'exact' }).eq('status', 'completed').gte('completed_at', thisMonthStart),
    supabase.from('ai_jobs').select('id', { count: 'exact' }).eq('status', 'completed').gte('completed_at', lastMonthStart).lt('completed_at', thisMonthStart),
    // Jobs failed by period
    supabase.from('ai_jobs').select('id', { count: 'exact' }).eq('status', 'failed').gte('created_at', thisWeekStart),
    supabase.from('ai_jobs').select('id', { count: 'exact' }).eq('status', 'failed').gte('created_at', lastWeekStart).lt('created_at', thisWeekStart),
    supabase.from('ai_jobs').select('id', { count: 'exact' }).eq('status', 'failed').gte('created_at', thisMonthStart),
    supabase.from('ai_jobs').select('id', { count: 'exact' }).eq('status', 'failed').gte('created_at', lastMonthStart).lt('created_at', thisMonthStart),
    // Searches by period
    supabase.from('ai_property_queries').select('id', { count: 'exact' }).gte('created_at', thisWeekStart),
    supabase.from('ai_property_queries').select('id', { count: 'exact' }).gte('created_at', lastWeekStart).lt('created_at', thisWeekStart),
    supabase.from('ai_property_queries').select('id', { count: 'exact' }).gte('created_at', thisMonthStart),
    supabase.from('ai_property_queries').select('id', { count: 'exact' }).gte('created_at', lastMonthStart).lt('created_at', thisMonthStart),
    // Sparkline raw data (current week)
    supabase.from('properties').select('created_at').gte('created_at', thisWeekStart).order('created_at', { ascending: true }),
    supabase.from('ai_jobs').select('created_at').eq('status', 'completed').gte('completed_at', thisWeekStart).order('created_at', { ascending: true }),
    supabase.from('ai_jobs').select('created_at').eq('status', 'failed').gte('created_at', thisWeekStart).order('created_at', { ascending: true }),
    supabase.from('ai_property_queries').select('created_at').gte('created_at', thisWeekStart).order('created_at', { ascending: true }),
    // Valuation queries
    supabase.from('property_valuations').select('id, confidence_score, estimated_value, market_trend, created_at, property_id', { count: 'exact' }).order('created_at', { ascending: false }).limit(50),
    supabase.from('property_valuations').select('id', { count: 'exact' }).gte('created_at', thisWeekStart),
    supabase.from('property_valuations').select('id', { count: 'exact' }).gte('created_at', lastWeekStart).lt('created_at', thisWeekStart),
    supabase.from('property_roi_forecast').select('id', { count: 'exact' }),
    // Job throughput (14 days — completed & failed with dates)
    supabase.from('ai_jobs').select('status, job_type, completed_at, started_at, created_at').in('status', ['completed', 'failed']).gte('created_at', lastWeekStart).order('created_at', { ascending: true }).limit(500),
    // Search volume (14 days)
    supabase.from('ai_property_queries').select('query_text, created_at').gte('created_at', lastWeekStart).order('created_at', { ascending: true }).limit(1000),
  ]);

  // Run health checks in parallel
  const [coreHealth, jobWorkerHealth, dbHealth] = await Promise.all([
    checkEdgeFunctionHealth('core-engine'),
    checkEdgeFunctionHealth('job-worker'),
    checkDbHealth(),
  ]);

  const properties = (propertiesRes.data || []) as any[];
  const totalProperties = propertiesRes.count || properties.length;

  const seoProperties = (seoRes.data || []) as any[];
  const avgSeo = seoProperties.length > 0
    ? seoProperties.reduce((s: number, p: any) => s + (p.seo_score || 0), 0) / seoProperties.length
    : 0;
  const weakListings = seoProperties.filter((p: any) => (p.seo_score || 0) < 60).length;

  const avgInvestment = properties.length > 0
    ? properties.reduce((s: number, p: any) => s + (p.investment_score || 0), 0) / properties.length
    : 0;

  const avgValue = properties.length > 0
    ? properties.reduce((s: number, p: any) => s + (p.price || 0), 0) / properties.length
    : 0;

  const forecasts = roiRes.data || [];
  const avgROI = forecasts.length > 0
    ? forecasts.reduce((s, f) => s + (f.expected_roi || 0), 0) / forecasts.length
    : 0;

  // Search analytics
  const searchData = searchRes.data || [];
  const queryCounts: Record<string, number> = {};
  searchData.forEach(s => {
    const q = (s.query_text || '').toLowerCase().trim();
    if (q) queryCounts[q] = (queryCounts[q] || 0) + 1;
  });
  const topQueries = Object.entries(queryCounts)
    .map(([query, count]) => ({ query, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Search conversion rate (queries with property-related terms / total)
  const conversionTerms = ['buy', 'invest', 'villa', 'house', 'apartment', 'land', 'beli', 'rumah'];
  const convertedSearches = searchData.filter(s => {
    const q = (s.query_text || '').toLowerCase();
    return conversionTerms.some(t => q.includes(t));
  }).length;
  const conversionRate = searchData.length > 0 ? (convertedSearches / searchData.length) * 100 : 0;

  // Price trends by month
  const priceData = priceTrendRes.data || [];
  const monthlyPrices: Record<string, { total: number; count: number }> = {};
  priceData.forEach((p: any) => {
    if (!p.price || !p.created_at) return;
    const month = p.created_at.slice(0, 7); // YYYY-MM
    if (!monthlyPrices[month]) monthlyPrices[month] = { total: 0, count: 0 };
    monthlyPrices[month].total += p.price;
    monthlyPrices[month].count += 1;
  });
  const priceTrends = Object.entries(monthlyPrices)
    .map(([month, d]) => ({ month, avgPrice: Math.round(d.total / d.count), count: d.count }))
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-12);

  // Recent actions from job logs
  const recentActions = (recentJobLogsRes.data || []).map(log => ({
    id: log.id,
    message: log.message,
    level: log.level,
    created_at: log.created_at,
  }));

  // System health
  const stalledJobs = stalledJobsRes.count || 0;
  const lastJobCompleted = lastCompletedJobRes.data?.[0]?.completed_at || null;
  const pendingCount = pendingJobsRes.count || 0;
  const schedulerHealth: 'ok' | 'warning' | 'error' =
    stalledJobs > 0 ? 'error' :
    pendingCount > 50 ? 'warning' : 'ok';

  // Historical KPI comparisons
  // Avg price MoM from priceTrends
  const sortedTrends = [...priceTrends];
  const currMonthPrice = sortedTrends.length > 0 ? sortedTrends[sortedTrends.length - 1].avgPrice : 0;
  const prevMonthPrice = sortedTrends.length > 1 ? sortedTrends[sortedTrends.length - 2].avgPrice : 0;

  // Build sparklines (7 days for WoW)
  const sparkProps = groupByDay(sparkPropsRaw.data || [], 'created_at', thisWeekStart, 7);
  const sparkJobsComp = groupByDay(sparkJobsCompRaw.data || [], 'created_at', thisWeekStart, 7);
  const sparkJobsFail = groupByDay(sparkJobsFailRaw.data || [], 'created_at', thisWeekStart, 7);
  const sparkSearch = groupByDay(sparkSearchRaw.data || [], 'created_at', thisWeekStart, 7);

  const historicalKPIs: HistoricalKPIs = {
    wow: {
      newProperties: makePeriodComparison(propsThisWeek.count || 0, propsLastWeek.count || 0, sparkProps),
      jobsCompleted: makePeriodComparison(jobsCompThisWeek.count || 0, jobsCompLastWeek.count || 0, sparkJobsComp),
      jobsFailed: makePeriodComparison(jobsFailThisWeek.count || 0, jobsFailLastWeek.count || 0, sparkJobsFail),
      searches: makePeriodComparison(searchThisWeek.count || 0, searchLastWeek.count || 0, sparkSearch),
    },
    mom: {
      newProperties: makePeriodComparison(propsThisMonth.count || 0, propsLastMonth.count || 0),
      jobsCompleted: makePeriodComparison(jobsCompThisMonth.count || 0, jobsCompLastMonth.count || 0),
      jobsFailed: makePeriodComparison(jobsFailThisMonth.count || 0, jobsFailLastMonth.count || 0),
      searches: makePeriodComparison(searchThisMonth.count || 0, searchLastMonth.count || 0),
      avgPrice: makePeriodComparison(currMonthPrice, prevMonthPrice),
    },
  };

  return {
    overview: {
      totalProperties,
      avgSeoScore: Math.round(avgSeo * 10) / 10,
      avgInvestmentScore: Math.round(avgInvestment * 10) / 10,
      avgEstimatedValue: Math.round(avgValue),
      avgPredictedROI: Math.round(avgROI * 10) / 10,
    },
    jobStatus: (() => {
      const throughputJobs = jobThroughputRes.data || [];
      // Build throughput by day (14 days)
      const throughputByDay: Record<string, { completed: number; failed: number }> = {};
      for (let i = 0; i < 14; i++) {
        const d = new Date(now.getTime() - (13 - i) * 86400000);
        throughputByDay[d.toISOString().slice(0, 10)] = { completed: 0, failed: 0 };
      }
      let totalDuration = 0;
      let durationCount = 0;
      const typeCounts: Record<string, number> = {};

      throughputJobs.forEach((j: any) => {
        const day = (j.completed_at || j.created_at)?.slice(0, 10);
        if (day && throughputByDay[day]) {
          if (j.status === 'completed') throughputByDay[day].completed++;
          else throughputByDay[day].failed++;
        }
        if (j.status === 'completed' && j.started_at && j.completed_at) {
          totalDuration += new Date(j.completed_at).getTime() - new Date(j.started_at).getTime();
          durationCount++;
        }
        const t = j.job_type || 'unknown';
        typeCounts[t] = (typeCounts[t] || 0) + 1;
      });

      const typeColors = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--primary))'];
      const jobTypeBreakdown = Object.entries(typeCounts)
        .map(([type, count], i) => ({ type: type.replace(/_/g, ' '), count, fill: typeColors[i % typeColors.length] }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6);

      return {
        running: jobsRes.data?.length || 0,
        pending: pendingCount,
        completed: completedJobsRes.count || 0,
        failed: failedJobsRes.count || 0,
        recentJobs: jobsRes.data || [],
        throughput: Object.entries(throughputByDay).map(([date, d]) => ({ date: date.slice(5), ...d })),
        avgDurationSec: durationCount > 0 ? Math.round(totalDuration / durationCount / 1000) : 0,
        totalProcessed: throughputJobs.length,
        jobTypeBreakdown,
      };
    })(),
    seo: (() => {
      const scoreBuckets = [
        { range: '0-20', count: 0, fill: 'hsl(var(--destructive))' },
        { range: '20-40', count: 0, fill: 'hsl(var(--chart-3))' },
        { range: '40-60', count: 0, fill: 'hsl(var(--chart-2))' },
        { range: '60-80', count: 0, fill: 'hsl(var(--chart-4))' },
        { range: '80-100', count: 0, fill: 'hsl(var(--chart-1))' },
      ];

      const subTotals = { title: 0, description: 0, keyword: 0, image: 0, location: 0, hashtag: 0 };
      const ratingCounts: Record<string, number> = {};

      seoProperties.forEach((p: any) => {
        const s = p.seo_score || 0;
        if (s < 20) scoreBuckets[0].count++;
        else if (s < 40) scoreBuckets[1].count++;
        else if (s < 60) scoreBuckets[2].count++;
        else if (s < 80) scoreBuckets[3].count++;
        else scoreBuckets[4].count++;

        subTotals.title += p.title_score || 0;
        subTotals.description += p.description_score || 0;
        subTotals.keyword += p.keyword_score || 0;
        subTotals.image += p.image_score || 0;
        subTotals.location += p.location_score || 0;
        subTotals.hashtag += p.hashtag_score || 0;

        const rating = p.seo_rating || 'unrated';
        ratingCounts[rating] = (ratingCounts[rating] || 0) + 1;
      });

      const n = seoProperties.length || 1;
      const subScores = [
        { metric: 'Title', avg: Math.round(subTotals.title / n) },
        { metric: 'Description', avg: Math.round(subTotals.description / n) },
        { metric: 'Keywords', avg: Math.round(subTotals.keyword / n) },
        { metric: 'Images', avg: Math.round(subTotals.image / n) },
        { metric: 'Location', avg: Math.round(subTotals.location / n) },
        { metric: 'Hashtags', avg: Math.round(subTotals.hashtag / n) },
      ];

      const ratingColors: Record<string, string> = {
        excellent: 'hsl(var(--chart-1))', good: 'hsl(var(--chart-2))',
        average: 'hsl(var(--chart-3))', poor: 'hsl(var(--destructive))',
        unrated: 'hsl(var(--muted-foreground))',
      };
      const ratingBreakdown = Object.entries(ratingCounts)
        .map(([rating, count]) => ({ rating, count, fill: ratingColors[rating] || 'hsl(var(--muted-foreground))' }))
        .sort((a, b) => b.count - a.count);

      return {
        weakListings,
        avgScore: Math.round(avgSeo * 10) / 10,
        totalAnalyzed: seoProperties.length,
        coveragePercent: totalProperties > 0 ? Math.round((seoProperties.length / totalProperties) * 100) : 0,
        recentAnalyses: seoProperties.slice(0, 15),
        scoreBuckets,
        subScores,
        ratingBreakdown,
      };
    })(),
    roiForecasts: forecasts,
    searchAnalytics: (() => {
      // Volume by day (14 days)
      const searchVolData = searchVolumeRes.data || [];
      const volumeByDayMap: Record<string, number> = {};
      for (let i = 0; i < 14; i++) {
        const d = new Date(now.getTime() - (13 - i) * 86400000);
        volumeByDayMap[d.toISOString().slice(0, 10)] = 0;
      }
      searchVolData.forEach((s: any) => {
        const day = s.created_at?.slice(0, 10);
        if (day && volumeByDayMap[day] !== undefined) volumeByDayMap[day]++;
      });
      const volumeByDay = Object.entries(volumeByDayMap).map(([date, searches]) => ({ date: date.slice(5), searches }));

      // Category breakdown
      const categories: Record<string, number> = { buy: 0, rent: 0, invest: 0, location: 0, other: 0 };
      const catColors: Record<string, string> = {
        buy: 'hsl(var(--chart-1))', rent: 'hsl(var(--chart-2))',
        invest: 'hsl(var(--chart-3))', location: 'hsl(var(--chart-4))',
        other: 'hsl(var(--muted-foreground))',
      };
      searchData.forEach(s => {
        const q = (s.query_text || '').toLowerCase();
        if (/buy|beli|purchase|rumah|house|villa|apartment/.test(q)) categories.buy++;
        else if (/rent|sewa|kost|lease/.test(q)) categories.rent++;
        else if (/invest|roi|yield|return/.test(q)) categories.invest++;
        else if (/bali|jakarta|bandung|surabaya|location|area|city/.test(q)) categories.location++;
        else categories.other++;
      });
      const categoryBreakdown = Object.entries(categories)
        .filter(([, count]) => count > 0)
        .map(([category, count]) => ({ category: category.charAt(0).toUpperCase() + category.slice(1), count, fill: catColors[category] }));

      return {
        topQueries,
        totalSearches: searchData.length,
        conversionRate: Math.round(conversionRate * 10) / 10,
        volumeByDay,
        categoryBreakdown,
      };
    })(),
    priceTrends,
    recentActions,
    systemHealth: {
      edgeFunctions: [
        { name: 'core-engine', ...coreHealth },
        { name: 'job-worker', ...jobWorkerHealth },
      ],
      dbHealth: dbHealth.status,
      dbLatencyMs: dbHealth.latencyMs,
      schedulerHealth,
      lastJobRun: lastJobCompleted,
      stalledJobs,
    },
    historicalKPIs,
    valuations: (() => {
      const valData = valuationsRes.data || [];
      const totalValuations = valuationsRes.count || 0;
      const avgConfidence = valData.length > 0
        ? Math.round(valData.reduce((s: number, v: any) => s + (v.confidence_score || 0), 0) / valData.length)
        : 0;
      const coveragePercent = totalProperties > 0 ? Math.round((totalValuations / totalProperties) * 100) : 0;
      const avgEstVal = valData.length > 0
        ? Math.round(valData.reduce((s: number, v: any) => s + (v.estimated_value || 0), 0) / valData.length)
        : 0;
      const vThisWeek = valuationsThisWeekRes.count || 0;
      const vLastWeek = valuationsLastWeekRes.count || 0;

      const confidenceBuckets = [
        { range: '0-40', count: 0, fill: 'hsl(var(--destructive))' },
        { range: '40-60', count: 0, fill: 'hsl(var(--chart-3))' },
        { range: '60-80', count: 0, fill: 'hsl(var(--chart-2))' },
        { range: '80-100', count: 0, fill: 'hsl(var(--chart-1))' },
      ];
      valData.forEach((v: any) => {
        const c = v.confidence_score || 0;
        if (c < 40) confidenceBuckets[0].count++;
        else if (c < 60) confidenceBuckets[1].count++;
        else if (c < 80) confidenceBuckets[2].count++;
        else confidenceBuckets[3].count++;
      });

      return {
        totalValuations,
        avgConfidence,
        coveragePercent,
        recentValuations: valData.slice(0, 10),
        confidenceBuckets,
        roiForecastCount: roiForecastCountRes.count || 0,
        valuationsThisWeek: vThisWeek,
        valuationsLastWeek: vLastWeek,
        avgEstimatedValue: avgEstVal,
        trendDirection: vThisWeek > vLastWeek ? 'up' as const : vThisWeek < vLastWeek ? 'down' as const : 'neutral' as const,
      };
    })(),
  };
}

export function useAICommandCenter() {
  const qc = useQueryClient();

  // Realtime subscriptions for live updates
  useEffect(() => {
    const jobChannel = supabase
      .channel('cmd-center-jobs')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ai_jobs' }, () => {
        qc.invalidateQueries({ queryKey: ['ai-command-center'] });
      })
      .subscribe();

    const logChannel = supabase
      .channel('cmd-center-logs')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ai_job_logs' }, () => {
        qc.invalidateQueries({ queryKey: ['ai-command-center'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(jobChannel);
      supabase.removeChannel(logChannel);
    };
  }, [qc]);

  return useQuery({
    queryKey: ['ai-command-center'],
    queryFn: fetchCommandCenterData,
    refetchInterval: 30000,
    staleTime: 10000,
  });
}
