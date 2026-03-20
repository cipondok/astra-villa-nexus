import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

async function invokeCCNE(mode: string, params?: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke('category-creator-narrative', {
    body: { mode, params: params || {} },
  });
  if (error) throw error;
  return data;
}

// ── Queries ──

export function useCCNEDashboard() {
  return useQuery({
    queryKey: ['ccne-dashboard'],
    queryFn: () => invokeCCNE('dashboard'),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}

export function useCategoryDefinitions() {
  return useQuery({
    queryKey: ['ccne-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ccne_category_definition')
        .select('*')
        .order('computed_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
    staleTime: 30_000,
  });
}

export function useProblemAmplification() {
  return useQuery({
    queryKey: ['ccne-problems'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ccne_problem_amplification')
        .select('*')
        .order('computed_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
    staleTime: 30_000,
  });
}

export function useVisionProjections() {
  return useQuery({
    queryKey: ['ccne-visions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ccne_vision_projection')
        .select('*')
        .order('computed_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
    staleTime: 30_000,
  });
}

export function useFounderMythology() {
  return useQuery({
    queryKey: ['ccne-mythology'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ccne_founder_mythology')
        .select('*')
        .order('computed_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
    staleTime: 30_000,
  });
}

export function useEducationFlywheel() {
  return useQuery({
    queryKey: ['ccne-flywheel'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ccne_education_flywheel')
        .select('*')
        .order('computed_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
    staleTime: 30_000,
  });
}

// ── Mutations ──

export function useDefineCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p?: Record<string, unknown>) => invokeCCNE('define_category', p),
    onSuccess: (d) => { qc.invalidateQueries({ queryKey: ['ccne-categories'] }); toast.success(`Defined ${d?.categories_defined ?? 0} category positions`); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useAmplifyProblems() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p?: Record<string, unknown>) => invokeCCNE('amplify_problems', p),
    onSuccess: (d) => { qc.invalidateQueries({ queryKey: ['ccne-problems'] }); toast.success(`Amplified ${d?.problems_amplified ?? 0} market problems`); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useProjectVision() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p?: Record<string, unknown>) => invokeCCNE('project_vision', p),
    onSuccess: (d) => { qc.invalidateQueries({ queryKey: ['ccne-visions'] }); toast.success(`Projected ${d?.visions_projected ?? 0} future narratives`); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useBuildMythology() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p?: Record<string, unknown>) => invokeCCNE('build_mythology', p),
    onSuccess: (d) => { qc.invalidateQueries({ queryKey: ['ccne-mythology'] }); toast.success(`Built ${d?.mythology_elements_built ?? 0} mythology elements`); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useSpinEducationFlywheel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p?: Record<string, unknown>) => invokeCCNE('spin_flywheel', p),
    onSuccess: (d) => { qc.invalidateQueries({ queryKey: ['ccne-flywheel'] }); qc.invalidateQueries({ queryKey: ['ccne-dashboard'] }); toast.success(`Spun ${d?.flywheel_pillars_spun ?? 0} education flywheel pillars`); },
    onError: (e: Error) => toast.error(e.message),
  });
}
