import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useEffect } from 'react';

export interface ScheduledJob {
  id: string;
  name: string;
  description: string;
  job_type: string;
  payload: Record<string, any>;
  cron_expression: string;
  cron_label: string;
  enabled: boolean;
  priority: number;
  max_retries: number;
  retry_count: number;
  last_error: string | null;
  last_status: string;
  last_run_at: string | null;
  next_run_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

const QUERY_KEY = ['scheduled-jobs'];

export function useScheduledJobs() {
  const qc = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('scheduled-jobs-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ai_scheduled_jobs' }, () => {
        qc.invalidateQueries({ queryKey: QUERY_KEY });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [qc]);

  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('ai_scheduled_jobs')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as ScheduledJob[];
    },
    refetchInterval: 30000,
  });
}

export function useCreateScheduledJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (job: Omit<ScheduledJob, 'id' | 'last_run_at' | 'next_run_at' | 'created_at' | 'updated_at'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await (supabase as any)
        .from('ai_scheduled_jobs')
        .insert({ ...job, created_by: user?.id })
        .select()
        .single();
      if (error) throw error;
      return data as ScheduledJob;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success('Schedule created');
    },
    onError: (e: Error) => toast.error('Failed to create schedule: ' + e.message),
  });
}

export function useUpdateScheduledJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ScheduledJob> & { id: string }) => {
      const { data, error } = await (supabase as any)
        .from('ai_scheduled_jobs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as ScheduledJob;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
    },
    onError: (e: Error) => toast.error('Failed to update schedule: ' + e.message),
  });
}

export function useDeleteScheduledJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from('ai_scheduled_jobs')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success('Schedule deleted');
    },
    onError: (e: Error) => toast.error('Failed to delete schedule: ' + e.message),
  });
}

export function useToggleScheduledJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      const { error } = await (supabase as any)
        .from('ai_scheduled_jobs')
        .update({ enabled })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, { enabled }) => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success(enabled ? 'Schedule enabled' : 'Schedule paused');
    },
    onError: (e: Error) => toast.error('Toggle failed: ' + e.message),
  });
}
