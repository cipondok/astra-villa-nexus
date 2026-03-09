import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SubsystemHealth {
  name: string;
  status: 'operational' | 'degraded' | 'down' | 'unknown';
  metric: string;
  detail: string;
}

export interface PlatformHealthSummary {
  overall: 'healthy' | 'warning' | 'critical';
  subsystems: SubsystemHealth[];
  dbResponseMs: number;
  totalProperties: number;
  totalJobs: number;
  jobFailureRate: number;
  avgSeoScore: number;
  totalValuations: number;
  lastChecked: string;
}

export function usePlatformHealth(enabled = true) {
  return useQuery({
    queryKey: ['platform-health-summary'],
    queryFn: async (): Promise<PlatformHealthSummary> => {
      const start = Date.now();

      const [
        propsRes, jobsRes, failedJobsRes, seoRes, valuationsRes, errorsRes,
      ] = await Promise.all([
        supabase.from('properties').select('id', { count: 'exact', head: true }).eq('status', 'available'),
        supabase.from('ai_jobs').select('id', { count: 'exact', head: true }),
        supabase.from('ai_jobs').select('id', { count: 'exact', head: true }).eq('status', 'failed'),
        supabase.from('property_seo_analysis').select('seo_score').not('seo_score', 'is', null).limit(200),
        supabase.from('property_valuations').select('id', { count: 'exact', head: true }),
        supabase.from('database_error_tracking').select('id', { count: 'exact', head: true }).eq('is_resolved', false),
      ]);

      const dbResponseMs = Date.now() - start;
      const totalJobs = jobsRes.count || 0;
      const failedJobs = failedJobsRes.count || 0;
      const jobFailureRate = totalJobs > 0 ? (failedJobs / totalJobs) * 100 : 0;
      const seoScores = (seoRes.data || []) as any[];
      const avgSeoScore = seoScores.length > 0
        ? Math.round(seoScores.reduce((s, p) => s + (p.seo_score || 0), 0) / seoScores.length)
        : 0;
      const totalValuations = valuationsRes.count || 0;
      const dbErrors = errorsRes.count || 0;
      const totalProperties = propsRes.count || 0;

      const subsystems: SubsystemHealth[] = [
        {
          name: 'Database',
          status: dbErrors === 0 && dbResponseMs < 3000 ? 'operational' : dbResponseMs > 5000 ? 'down' : 'degraded',
          metric: `${dbResponseMs}ms`,
          detail: `${dbErrors} unresolved errors`,
        },
        {
          name: 'AI Job Queue',
          status: jobFailureRate < 10 ? 'operational' : jobFailureRate < 30 ? 'degraded' : 'down',
          metric: `${Math.round(jobFailureRate)}% fail`,
          detail: `${totalJobs} total jobs`,
        },
        {
          name: 'SEO Engine',
          status: avgSeoScore >= 50 ? 'operational' : avgSeoScore > 0 ? 'degraded' : 'unknown',
          metric: `${avgSeoScore}% avg`,
          detail: `${seoScores.length} analyzed`,
        },
        {
          name: 'Valuations',
          status: totalValuations > 0 ? 'operational' : 'unknown',
          metric: `${totalValuations}`,
          detail: 'total valuations',
        },
      ];

      const hasDown = subsystems.some(s => s.status === 'down');
      const hasDegraded = subsystems.some(s => s.status === 'degraded');
      const overall = hasDown ? 'critical' : hasDegraded ? 'warning' : 'healthy';

      return {
        overall,
        subsystems,
        dbResponseMs,
        totalProperties,
        totalJobs,
        jobFailureRate: Math.round(jobFailureRate * 10) / 10,
        avgSeoScore,
        totalValuations,
        lastChecked: new Date().toISOString(),
      };
    },
    enabled,
    staleTime: 2 * 60 * 1000,
    refetchInterval: 60_000,
  });
}
