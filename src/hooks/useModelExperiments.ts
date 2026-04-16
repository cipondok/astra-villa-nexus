/**
 * Model A/B Experimentation System
 * Assigns users to model variants and tracks conversion outcomes.
 */
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCallback, useMemo } from 'react';

interface ModelExperiment {
  id: string;
  experiment_name: string;
  status: string;
  champion_version: string;
  challenger_version: string;
  champion_conversions: number;
  challenger_conversions: number;
  champion_impressions: number;
  challenger_impressions: number;
  champion_avg_roi: number;
  challenger_avg_roi: number;
  traffic_split: number;
  winner: string | null;
  started_at: string;
}

interface Assignment {
  experiment_id: string;
  variant: 'champion' | 'challenger';
  model_version: string;
}

export function useModelExperiments() {
  const { user } = useAuth();

  const experiments = useQuery({
    queryKey: ['model-experiments'],
    queryFn: async (): Promise<ModelExperiment[]> => {
      const { data, error } = await supabase
        .from('model_experiments' as any)
        .select('*')
        .eq('status', 'active');
      if (error) throw error;
      return (data as any[]) || [];
    },
    staleTime: 10 * 60_000,
  });

  const assignments = useQuery({
    queryKey: ['model-assignments', user?.id],
    enabled: !!user?.id && (experiments.data?.length ?? 0) > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('model_experiment_assignments' as any)
        .select('*')
        .eq('user_id', user!.id);
      if (error) throw error;
      return (data as any[]) || [];
    },
  });

  // Deterministic assignment based on user ID hash
  const getAssignment = useCallback((experiment: ModelExperiment): Assignment => {
    const existing = assignments.data?.find((a: any) => a.experiment_id === experiment.id);
    if (existing) {
      return {
        experiment_id: experiment.id,
        variant: existing.variant,
        model_version: existing.variant === 'champion' ? experiment.champion_version : experiment.challenger_version,
      };
    }

    // Hash-based deterministic split
    const hash = (user?.id || '').split('').reduce((h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0, 0);
    const normalized = Math.abs(hash) / 2147483647;
    const variant = normalized < experiment.traffic_split ? 'champion' : 'challenger';

    return {
      experiment_id: experiment.id,
      variant,
      model_version: variant === 'champion' ? experiment.champion_version : experiment.challenger_version,
    };
  }, [user?.id, assignments.data]);

  const activeModelVersion = useMemo(() => {
    const active = experiments.data?.[0];
    if (!active) return 'v1.0';
    return getAssignment(active).model_version;
  }, [experiments.data, getAssignment]);

  const recordImpression = useMutation({
    mutationFn: async (experimentId: string) => {
      if (!user?.id) return;
      const exp = experiments.data?.find(e => e.id === experimentId);
      if (!exp) return;
      const assignment = getAssignment(exp);

      // Persist assignment
      await supabase.from('model_experiment_assignments' as any).upsert({
        experiment_id: experimentId,
        user_id: user.id,
        variant: assignment.variant,
      }, { onConflict: 'experiment_id,user_id' });
    },
  });

  return { experiments: experiments.data ?? [], activeModelVersion, getAssignment, recordImpression };
}
