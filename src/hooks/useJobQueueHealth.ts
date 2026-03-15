import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface JobQueueHealth {
  health_status: 'healthy' | 'degraded' | 'critical';
  stalled_reset: number;
  stalled_failed: number;
  pending_count: number;
  running_count: number;
  failed_last_hour: number;
  completed_last_hour: number;
  queue_delayed: boolean;
  oldest_pending_age_seconds: number;
  checked_at: string;
}

export function useJobQueueHealth(enabled = true) {
  return useQuery({
    queryKey: ['job-queue-health'],
    queryFn: async (): Promise<JobQueueHealth> => {
      // Read-only health snapshot (don't run the watchdog from frontend — it mutates)
      const [
        { count: pendingCount },
        { count: runningCount },
        { count: failedLastHour },
        { count: completedLastHour },
        { data: oldestPending },
        { count: stalledCount },
      ] = await Promise.all([
        supabase.from('ai_jobs').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('ai_jobs').select('id', { count: 'exact', head: true }).eq('status', 'running'),
        supabase.from('ai_jobs').select('id', { count: 'exact', head: true }).eq('status', 'failed').gte('completed_at', new Date(Date.now() - 3600000).toISOString()),
        supabase.from('ai_jobs').select('id', { count: 'exact', head: true }).eq('status', 'completed').gte('completed_at', new Date(Date.now() - 3600000).toISOString()),
        supabase.from('ai_jobs').select('created_at').eq('status', 'pending').order('created_at', { ascending: true }).limit(1),
        supabase.from('ai_jobs').select('id', { count: 'exact', head: true }).eq('status', 'running').lt('started_at', new Date(Date.now() - 15 * 60000).toISOString()),
      ]);

      const oldestAge = oldestPending?.[0]?.created_at
        ? Math.round((Date.now() - new Date(oldestPending[0].created_at).getTime()) / 1000)
        : 0;
      const queueDelayed = oldestAge > 600; // > 10 minutes
      const pc = pendingCount || 0;
      const fc = failedLastHour || 0;
      const sc = stalledCount || 0;

      let health_status: 'healthy' | 'degraded' | 'critical' = 'healthy';
      if (sc > 0 || fc >= 5 || (queueDelayed && pc > 10)) health_status = 'critical';
      else if (fc >= 2 || queueDelayed) health_status = 'degraded';

      return {
        health_status,
        stalled_reset: 0, // only known after watchdog runs server-side
        stalled_failed: sc,
        pending_count: pc,
        running_count: runningCount || 0,
        failed_last_hour: fc,
        completed_last_hour: completedLastHour || 0,
        queue_delayed: queueDelayed,
        oldest_pending_age_seconds: oldestAge,
        checked_at: new Date().toISOString(),
      };
    },
    enabled,
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
}
