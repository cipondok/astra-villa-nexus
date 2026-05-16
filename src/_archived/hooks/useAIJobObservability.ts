import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface RunningJob {
  id: string;
  job_type: string;
  progress: number;
  started_at: string;
}

export interface FailedJob {
  id: string;
  job_type: string;
  error_message: string | null;
  completed_at: string;
}

export interface AIJobObservability {
  running_jobs: RunningJob[];
  pending_count: number;
  failed_recent: FailedJob[];
  throughput_status: 'high' | 'normal' | 'bottleneck';
  completed_1h: number;
  failed_1h: number;
  coverage_percent: number;
  total_listings: number;
  scored_listings: number;
}

export function useAIJobObservability(enabled = true) {
  return useQuery({
    queryKey: ['ai-job-observability'],
    queryFn: async (): Promise<AIJobObservability> => {
      const oneHourAgo = new Date(Date.now() - 3600000).toISOString();

      const [
        { data: running },
        { count: pendingCount },
        { data: failedRecent },
        { count: completed1h },
        { count: failed1h },
        { count: totalListings },
        { count: scoredListings },
      ] = await Promise.all([
        supabase.from('ai_jobs').select('id, job_type, progress, started_at').eq('status', 'running').order('started_at', { ascending: false }).limit(5),
        supabase.from('ai_jobs').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('ai_jobs').select('id, job_type, error_message, completed_at').eq('status', 'failed').order('completed_at', { ascending: false }).limit(3),
        supabase.from('ai_jobs').select('id', { count: 'exact', head: true }).eq('status', 'completed').gte('completed_at', oneHourAgo),
        supabase.from('ai_jobs').select('id', { count: 'exact', head: true }).eq('status', 'failed').gte('completed_at', oneHourAgo),
        supabase.from('properties').select('id', { count: 'exact', head: true }).eq('status', 'available'),
        supabase.from('properties').select('id', { count: 'exact', head: true }).eq('status', 'available').not('investment_score', 'is', null),
      ]);

      const c1h = completed1h || 0;
      const f1h = failed1h || 0;
      const pc = pendingCount || 0;
      const total = totalListings || 0;
      const scored = scoredListings || 0;

      let throughput_status: 'high' | 'normal' | 'bottleneck' = 'normal';
      if (c1h >= 10) throughput_status = 'high';
      else if (pc > 5 && c1h < 2) throughput_status = 'bottleneck';

      return {
        running_jobs: (running || []) as RunningJob[],
        pending_count: pc,
        failed_recent: (failedRecent || []) as FailedJob[],
        throughput_status,
        completed_1h: c1h,
        failed_1h: f1h,
        coverage_percent: total > 0 ? Math.round((scored / total) * 100) : 0,
        total_listings: total,
        scored_listings: scored,
      };
    },
    enabled,
    staleTime: 10_000,
    refetchInterval: 15_000,
  });
}
