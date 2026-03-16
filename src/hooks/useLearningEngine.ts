import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface WeightConfig {
  factor_name: string;
  current_weight: number;
  min_weight: number;
  max_weight: number;
  adjustment_rate: number;
  last_adjustment: number;
  effectiveness_score: number;
  sample_size: number;
  is_locked: boolean;
  updated_at: string;
}

export interface LearningEvent {
  id: string;
  entity_type: string;
  entity_id: string | null;
  prediction_type: string;
  predicted_value: number | null;
  actual_outcome_value: number | null;
  performance_delta: number | null;
  accuracy_pct: number | null;
  metadata: Record<string, unknown>;
  recorded_at: string;
}

export interface LearningStats {
  total_learning_events: number;
  events_last_7d: number;
  avg_accuracy_7d: number | null;
  avg_accuracy_30d: number | null;
  total_cycles: number;
  last_cycle_at: string | null;
  total_snapshots: number;
  current_weights: Record<string, { weight: number; effectiveness: number; locked: boolean }> | null;
  recommendation_success_rate: number | null;
}

export interface LearningCycleResult {
  cycle_id: string;
  events_analyzed: number;
  weights_before: Record<string, number>;
  weights_after: Record<string, number>;
  model_accuracy: number | null;
  status: string;
}

/** Fetch current weight configuration */
export function useWeightConfig() {
  return useQuery({
    queryKey: ['weight-config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_weight_config')
        .select('*')
        .order('current_weight', { ascending: false });
      if (error) throw error;
      return data as unknown as WeightConfig[];
    },
    staleTime: 30_000,
  });
}

/** Fetch learning system statistics */
export function useLearningStats() {
  return useQuery({
    queryKey: ['learning-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_learning_stats' as any);
      if (error) throw error;
      return data as unknown as LearningStats;
    },
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

/** Fetch recent learning events */
export function useLearningEvents(limit = 30) {
  return useQuery({
    queryKey: ['learning-events', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_learning_events')
        .select('*')
        .order('recorded_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data as unknown as LearningEvent[];
    },
    staleTime: 30_000,
  });
}

/** Fetch learning cycle history */
export function useLearningCycles(limit = 10) {
  return useQuery({
    queryKey: ['learning-cycles', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_learning_cycles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data;
    },
    staleTime: 30_000,
  });
}

/** Trigger learning engine execution */
export function useRunLearningEngine() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (params?: { collect_outcomes?: boolean }) => {
      const { data, error } = await supabase.functions.invoke('learning-engine', {
        body: params ?? {},
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['weight-config'] });
      qc.invalidateQueries({ queryKey: ['learning-stats'] });
      qc.invalidateQueries({ queryKey: ['learning-events'] });
      qc.invalidateQueries({ queryKey: ['learning-cycles'] });
      toast.success(
        `Learning cycle complete: ${data.events_collected} events collected, model accuracy: ${data.cycle_result?.model_accuracy ?? 'N/A'}%`
      );
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Learning engine failed');
    },
  });
}

/** Lock/unlock a weight factor (admin only) */
export function useToggleWeightLock() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ factorName, locked }: { factorName: string; locked: boolean }) => {
      const { error } = await supabase
        .from('ai_weight_config')
        .update({ is_locked: locked, updated_at: new Date().toISOString() })
        .eq('factor_name', factorName);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['weight-config'] });
      toast.success('Weight lock updated');
    },
  });
}

/** Manually override a weight value (admin only) */
export function useOverrideWeight() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ factorName, weight }: { factorName: string; weight: number }) => {
      const { error } = await supabase
        .from('ai_weight_config')
        .update({ current_weight: weight, is_locked: true, updated_at: new Date().toISOString() })
        .eq('factor_name', factorName);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['weight-config'] });
      toast.success('Weight overridden and locked');
    },
  });
}
