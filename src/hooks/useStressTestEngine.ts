import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useStressTestScan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (pipeline: string = 'full_stress') => {
      const { data, error } = await supabase.functions.invoke('stress-test-engine', {
        body: { pipeline },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stress-test'] });
      toast.success('Black swan stress test completed');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useStressScenarios() {
  return useQuery({
    queryKey: ['stress-test', 'scenarios'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stress_scenarios')
        .select('*')
        .order('severity_score', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useStressProjections(scenarioId?: string) {
  return useQuery({
    queryKey: ['stress-test', 'projections', scenarioId],
    queryFn: async () => {
      let q = supabase.from('stress_portfolio_projections').select('*').order('risk_exposure_rank', { ascending: true });
      if (scenarioId) q = q.eq('scenario_id', scenarioId);
      const { data, error } = await q.limit(100);
      if (error) throw error;
      return data;
    },
  });
}

export function useStressSurvival(scenarioId?: string) {
  return useQuery({
    queryKey: ['stress-test', 'survival', scenarioId],
    queryFn: async () => {
      let q = supabase.from('stress_survival_scores').select('*').order('survival_index', { ascending: true });
      if (scenarioId) q = q.eq('scenario_id', scenarioId);
      const { data, error } = await q.limit(100);
      if (error) throw error;
      return data;
    },
  });
}

export function useStressRecovery(scenarioId?: string) {
  return useQuery({
    queryKey: ['stress-test', 'recovery', scenarioId],
    queryFn: async () => {
      let q = supabase.from('stress_recovery_forecasts').select('*').order('post_crisis_opportunity_rank', { ascending: true });
      if (scenarioId) q = q.eq('scenario_id', scenarioId);
      const { data, error } = await q.limit(100);
      if (error) throw error;
      return data;
    },
  });
}

export function useStressStrategies(scenarioId?: string) {
  return useQuery({
    queryKey: ['stress-test', 'strategies', scenarioId],
    queryFn: async () => {
      let q = supabase.from('stress_crisis_strategies').select('*').order('restructuring_priority', { ascending: true });
      if (scenarioId) q = q.eq('scenario_id', scenarioId);
      const { data, error } = await q.limit(100);
      if (error) throw error;
      return data;
    },
  });
}
