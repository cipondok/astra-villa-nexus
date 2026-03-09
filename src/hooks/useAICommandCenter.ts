import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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
  };
  seo: {
    weakListings: number;
    avgScore: number;
    recentOptimized: any[];
  };
  roiForecasts: any[];
  searchAnalytics: {
    topQueries: { query: string; count: number }[];
    totalSearches: number;
  };
  recentActions: any[];
}

async function fetchCommandCenterData(): Promise<AICommandCenterData> {
  // Parallel fetches
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
  ] = await Promise.all([
    supabase.from('properties').select('id, investment_score, price', { count: 'exact' }),
    supabase.from('ai_jobs').select('*').eq('status', 'running').limit(10),
    supabase.from('ai_jobs').select('id', { count: 'exact' }).eq('status', 'pending'),
    supabase.from('ai_jobs').select('id', { count: 'exact' }).eq('status', 'failed'),
    supabase.from('ai_jobs').select('id', { count: 'exact' }).eq('status', 'completed'),
    supabase.from('property_seo').select('id, seo_score').not('seo_score', 'is', null),
    supabase.from('property_roi_forecast').select('*').order('last_calculated', { ascending: false }).limit(20),
    supabase.from('ai_property_queries').select('query_text, created_at').order('created_at', { ascending: false }).limit(100),
    supabase.from('ai_job_logs').select('*').order('created_at', { ascending: false }).limit(20),
  ]);

  const properties = propertiesRes.data || [];
  const totalProperties = propertiesRes.count || properties.length;

  const seoProperties = seoRes.data || [];
  const avgSeo = seoProperties.length > 0
    ? seoProperties.reduce((s, p) => s + (p.seo_score || 0), 0) / seoProperties.length
    : 0;
  const weakListings = seoProperties.filter(p => (p.seo_score || 0) < 60).length;

  const avgInvestment = properties.length > 0
    ? properties.reduce((s, p) => s + (p.investment_score || 0), 0) / properties.length
    : 0;

  const avgValue = properties.length > 0
    ? properties.reduce((s, p) => s + (p.price || 0), 0) / properties.length
    : 0;

  const forecasts = roiRes.data || [];
  const avgROI = forecasts.length > 0
    ? forecasts.reduce((s, f) => s + (f.expected_roi || 0), 0) / forecasts.length
    : 0;

  // Search analytics - aggregate top queries
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

  // Recent actions from job logs
  const recentActions = (recentJobLogsRes.data || []).map(log => ({
    id: log.id,
    message: log.message,
    level: log.level,
    created_at: log.created_at,
  }));

  return {
    overview: {
      totalProperties,
      avgSeoScore: Math.round(avgSeo * 10) / 10,
      avgInvestmentScore: Math.round(avgInvestment * 10) / 10,
      avgEstimatedValue: Math.round(avgValue),
      avgPredictedROI: Math.round(avgROI * 10) / 10,
    },
    jobStatus: {
      running: jobsRes.data?.length || 0,
      pending: pendingJobsRes.count || 0,
      completed: completedJobsRes.count || 0,
      failed: failedJobsRes.count || 0,
      recentJobs: jobsRes.data || [],
    },
    seo: {
      weakListings,
      avgScore: Math.round(avgSeo * 10) / 10,
      recentOptimized: [],
    },
    roiForecasts: forecasts,
    searchAnalytics: {
      topQueries,
      totalSearches: searchData.length,
    },
    recentActions,
  };
}

export function useAICommandCenter() {
  return useQuery({
    queryKey: ['ai-command-center'],
    queryFn: fetchCommandCenterData,
    refetchInterval: 30000,
    staleTime: 15000,
  });
}
