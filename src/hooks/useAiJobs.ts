import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useEffect } from 'react';

export interface AiJob {
  id: string;
  job_type: string;
  status: string;
  payload: any;
  progress: number;
  total_tasks: number;
  completed_tasks: number;
  priority: number;
  created_by: string | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  error_message: string | null;
}

export interface AiJobTask {
  id: string;
  job_id: string;
  task_type: string;
  payload: any;
  status: string;
  result: any;
  retry_count: number;
  created_at: string;
  completed_at: string | null;
}

export interface AiJobLog {
  id: string;
  job_id: string;
  task_id: string | null;
  message: string;
  level: string;
  created_at: string;
}

export function useAiJobs(limit = 20) {
  const qc = useQueryClient();

  // Realtime subscription replaces polling
  useEffect(() => {
    const channel = supabase
      .channel('ai-jobs-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ai_jobs' }, () => {
        qc.invalidateQueries({ queryKey: ['ai-jobs'] });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [qc]);

  return useQuery({
    queryKey: ['ai-jobs', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_jobs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data as AiJob[];
    },
    // Keep a fallback poll at 30s in case realtime drops
    refetchInterval: 30000,
  });
}

export function useAiJobTasks(jobId: string | null) {
  const qc = useQueryClient();

  useEffect(() => {
    if (!jobId) return;
    const channel = supabase
      .channel(`ai-tasks-${jobId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ai_job_tasks', filter: `job_id=eq.${jobId}` }, () => {
        qc.invalidateQueries({ queryKey: ['ai-job-tasks', jobId] });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [jobId, qc]);

  return useQuery({
    queryKey: ['ai-job-tasks', jobId],
    queryFn: async () => {
      if (!jobId) return [];
      const { data, error } = await supabase
        .from('ai_job_tasks')
        .select('*')
        .eq('job_id', jobId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data as AiJobTask[];
    },
    enabled: !!jobId,
    refetchInterval: 30000,
  });
}

export function useAiJobLogs(jobId: string | null) {
  return useQuery({
    queryKey: ['ai-job-logs', jobId],
    queryFn: async () => {
      if (!jobId) return [];
      const { data, error } = await supabase
        .from('ai_job_logs')
        .select('*')
        .eq('job_id', jobId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data as AiJobLog[];
    },
    enabled: !!jobId,
    refetchInterval: 10000,
  });
}

export function useAiJobMetrics() {
  return useQuery({
    queryKey: ['ai-job-metrics'],
    queryFn: async () => {
      // Jobs per day (last 14 days)
      const fourteenDaysAgo = new Date(Date.now() - 14 * 86400000).toISOString();
      const { data: recentJobs } = await supabase
        .from('ai_jobs')
        .select('created_at, status, started_at, completed_at, total_tasks, completed_tasks')
        .gte('created_at', fourteenDaysAgo)
        .order('created_at', { ascending: true });

      const jobs = recentJobs || [];

      // Jobs per day
      const jobsByDay: Record<string, number> = {};
      jobs.forEach(j => {
        const day = j.created_at.slice(0, 10);
        jobsByDay[day] = (jobsByDay[day] || 0) + 1;
      });

      // Average duration (completed jobs)
      const completedJobs = jobs.filter(j => j.status === 'completed' && j.started_at && j.completed_at);
      const avgDuration = completedJobs.length > 0
        ? completedJobs.reduce((sum, j) => sum + (new Date(j.completed_at!).getTime() - new Date(j.started_at!).getTime()), 0) / completedJobs.length / 1000
        : 0;

      // Task failure rate
      const { data: taskStats } = await supabase
        .from('ai_job_tasks')
        .select('status')
        .gte('created_at', fourteenDaysAgo);

      const allTasks = taskStats || [];
      const failedTasks = allTasks.filter(t => t.status === 'failed').length;
      const failureRate = allTasks.length > 0 ? (failedTasks / allTasks.length) * 100 : 0;

      // Status breakdown
      const statusCounts = { completed: 0, failed: 0, cancelled: 0, running: 0, pending: 0 };
      jobs.forEach(j => {
        if (j.status in statusCounts) statusCounts[j.status as keyof typeof statusCounts]++;
      });

      return {
        jobsByDay: Object.entries(jobsByDay).map(([date, count]) => ({ date, count })),
        avgDurationSec: Math.round(avgDuration),
        failureRate: Math.round(failureRate * 10) / 10,
        totalJobs: jobs.length,
        totalTasks: allTasks.length,
        failedTasks,
        statusCounts,
      };
    },
    refetchInterval: 30000,
  });
}

export function useCreateJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { job_type: string; payload: any; priority?: number }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase.functions.invoke('job-worker', {
        body: {
          action: 'create',
          job_type: params.job_type,
          payload: params.payload,
          created_by: user?.id,
          priority: params.priority,
        },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['ai-jobs'] });
      toast.success(`Job created with ${data.tasksCreated} tasks`, {
        description: 'The worker will process it automatically.',
      });
    },
    onError: (e) => toast.error('Failed to create job: ' + e.message),
  });
}

export function useCancelJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (jobId: string) => {
      const { data, error } = await supabase.functions.invoke('job-worker', {
        body: { action: 'cancel', job_id: jobId },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ai-jobs'] });
      toast.success('Job cancelled');
    },
    onError: (e) => toast.error('Cancel failed: ' + e.message),
  });
}
