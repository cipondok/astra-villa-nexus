import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AiJob {
  id: string;
  job_type: string;
  status: string;
  payload: any;
  progress: number;
  total_tasks: number;
  completed_tasks: number;
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
  created_at: string;
  completed_at: string | null;
}

export function useAiJobs(limit = 20) {
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
    refetchInterval: 5000, // Poll every 5s for live progress
  });
}

export function useAiJobTasks(jobId: string | null) {
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
    refetchInterval: 3000,
  });
}

export function useCreateJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { job_type: string; payload: any }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase.functions.invoke('job-worker', {
        body: {
          action: 'create',
          job_type: params.job_type,
          payload: params.payload,
          created_by: user?.id,
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
