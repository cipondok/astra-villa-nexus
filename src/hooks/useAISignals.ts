import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AISignal {
  id: string;
  signal_type: string;
  entity_type: string;
  entity_id: string;
  confidence_score: number;
  predicted_value: Record<string, unknown>;
  severity: string;
  is_resolved: boolean;
  resolved_at: string | null;
  created_at: string;
}

export interface AITask {
  id: string;
  signal_id: string | null;
  task_title: string;
  task_description: string | null;
  task_priority: string;
  recommended_action: string | null;
  automation_possible: boolean;
  status: string;
  impact_score: number;
  impact_description: string | null;
  created_at: string;
}

export const useAISignals = (unresolvedOnly = true) => {
  return useQuery({
    queryKey: ['ai-signals', unresolvedOnly],
    queryFn: async () => {
      let query = supabase
        .from('ai_signals')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (unresolvedOnly) {
        query = query.eq('is_resolved', false);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as AISignal[];
    },
    staleTime: 30_000,
    refetchInterval: 30_000,
  });
};

export const useAITasks = (status?: string) => {
  return useQuery({
    queryKey: ['ai-tasks', status],
    queryFn: async () => {
      let query = supabase
        .from('ai_tasks')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as AITask[];
    },
    staleTime: 30_000,
  });
};

export const useResolveSignal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (signalId: string) => {
      const { error } = await supabase
        .from('ai_signals')
        .update({ is_resolved: true, resolved_at: new Date().toISOString() })
        .eq('id', signalId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-signals'] });
    },
  });
};

export const useUpdateTaskStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: string }) => {
      const updates: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
      if (status === 'executed') updates.executed_at = new Date().toISOString();

      const { error } = await supabase
        .from('ai_tasks')
        .update(updates)
        .eq('id', taskId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-tasks'] });
    },
  });
};
