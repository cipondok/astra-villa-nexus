import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type TaskCategory = 'listings' | 'seo' | 'marketing' | 'agents' | 'investors' | 'referral' | 'monetization' | 'performance';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'blocked';
export type WeekStatus = 'not_started' | 'in_progress' | 'completed';

export interface GrowthWeek {
  id: string;
  phase_number: number;
  phase_name: string;
  week_number: number;
  week_label: string;
  focus_area: string;
  target_kpi: string | null;
  status: WeekStatus;
}

export interface GrowthTask {
  id: string;
  week_id: string;
  task_title: string;
  task_description: string | null;
  category: TaskCategory;
  priority: string;
  status: TaskStatus;
  sort_order: number;
  completed_at: string | null;
}

export interface GrowthWeekWithTasks extends GrowthWeek {
  tasks: GrowthTask[];
  completedCount: number;
  totalCount: number;
  progressPct: number;
}

export interface PhaseGroup {
  phase_number: number;
  phase_name: string;
  weeks: GrowthWeekWithTasks[];
  totalTasks: number;
  completedTasks: number;
  progressPct: number;
}

export function useGrowthExecutionPlan(enabled = true) {
  return useQuery({
    queryKey: ['growth-execution-plan'],
    queryFn: async (): Promise<PhaseGroup[]> => {
      const [weeksRes, tasksRes] = await Promise.all([
        supabase.from('growth_execution_weeks').select('*').order('week_number'),
        supabase.from('growth_execution_tasks').select('*').order('sort_order'),
      ]);
      if (weeksRes.error) throw weeksRes.error;
      if (tasksRes.error) throw tasksRes.error;

      const weeks = (weeksRes.data || []) as unknown as GrowthWeek[];
      const tasks = (tasksRes.data || []) as unknown as GrowthTask[];

      const weeksWithTasks: GrowthWeekWithTasks[] = weeks.map((w) => {
        const wTasks = tasks.filter((t) => t.week_id === w.id);
        const completed = wTasks.filter((t) => t.status === 'completed').length;
        return {
          ...w,
          tasks: wTasks,
          completedCount: completed,
          totalCount: wTasks.length,
          progressPct: wTasks.length > 0 ? Math.round((completed / wTasks.length) * 100) : 0,
        };
      });

      const phaseMap = new Map<number, PhaseGroup>();
      for (const w of weeksWithTasks) {
        if (!phaseMap.has(w.phase_number)) {
          phaseMap.set(w.phase_number, {
            phase_number: w.phase_number,
            phase_name: w.phase_name,
            weeks: [],
            totalTasks: 0,
            completedTasks: 0,
            progressPct: 0,
          });
        }
        const phase = phaseMap.get(w.phase_number)!;
        phase.weeks.push(w);
        phase.totalTasks += w.totalCount;
        phase.completedTasks += w.completedCount;
      }

      const phases = Array.from(phaseMap.values());
      for (const p of phases) {
        p.progressPct = p.totalTasks > 0 ? Math.round((p.completedTasks / p.totalTasks) * 100) : 0;
      }
      return phases;
    },
    enabled,
    staleTime: 30_000,
  });
}

export function useUpdateGrowthTaskStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: TaskStatus }) => {
      const update: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
      if (status === 'completed') update.completed_at = new Date().toISOString();
      else update.completed_at = null;
      const { error } = await supabase.from('growth_execution_tasks').update(update).eq('id', taskId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['growth-execution-plan'] }),
  });
}

export function useUpdateGrowthWeekStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ weekId, status }: { weekId: string; status: WeekStatus }) => {
      const { error } = await supabase
        .from('growth_execution_weeks')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', weekId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['growth-execution-plan'] }),
  });
}
