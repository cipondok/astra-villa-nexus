import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// ── Types ──

export type PhaseStatus = 'not_started' | 'in_progress' | 'completed';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'blocked';
export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';

export interface RoadmapPhase {
  id: string;
  phase_key: string;
  phase_name: string;
  phase_order: number;
  target_start_date: string | null;
  target_end_date: string | null;
  status: PhaseStatus;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface RoadmapTask {
  id: string;
  phase_id: string;
  task_title: string;
  task_description: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  assigned_to: string | null;
  completed_at: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface PhaseWithTasks extends RoadmapPhase {
  tasks: RoadmapTask[];
  completedCount: number;
  totalCount: number;
  progressPct: number;
}

// ── Hooks ──

export function useLaunchRoadmap(enabled = true) {
  return useQuery({
    queryKey: ['launch-roadmap'],
    queryFn: async (): Promise<PhaseWithTasks[]> => {
      const [phasesRes, tasksRes] = await Promise.all([
        supabase.from('launch_roadmap_phases').select('*').order('phase_order'),
        supabase.from('launch_roadmap_tasks').select('*').order('sort_order'),
      ]);
      if (phasesRes.error) throw phasesRes.error;
      if (tasksRes.error) throw tasksRes.error;

      const phases = (phasesRes.data || []) as unknown as RoadmapPhase[];
      const tasks = (tasksRes.data || []) as unknown as RoadmapTask[];

      return phases.map((p) => {
        const pTasks = tasks.filter((t) => t.phase_id === p.id);
        const completed = pTasks.filter((t) => t.status === 'completed').length;
        return {
          ...p,
          tasks: pTasks,
          completedCount: completed,
          totalCount: pTasks.length,
          progressPct: pTasks.length > 0 ? Math.round((completed / pTasks.length) * 100) : 0,
        };
      });
    },
    enabled,
    staleTime: 30_000,
  });
}

export function useUpdateTaskStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: TaskStatus }) => {
      const update: Record<string, unknown> = {
        status,
        updated_at: new Date().toISOString(),
      };
      if (status === 'completed') update.completed_at = new Date().toISOString();
      else update.completed_at = null;

      const { error } = await supabase.from('launch_roadmap_tasks').update(update).eq('id', taskId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['launch-roadmap'] }),
  });
}

export function useUpdatePhaseStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ phaseId, status }: { phaseId: string; status: PhaseStatus }) => {
      const { error } = await supabase
        .from('launch_roadmap_phases')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', phaseId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['launch-roadmap'] }),
  });
}
