import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

async function invokePMNE(mode: string, params?: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke('public-market-narrative', {
    body: { mode, params: params || {} },
  });
  if (error) throw error;
  return data;
}

// -- Queries --

export function usePMNEDashboard() {
  return useQuery({
    queryKey: ['pmne-dashboard'],
    queryFn: () => invokePMNE('dashboard'),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}

export function useCategoryNarrative() {
  return useQuery({
    queryKey: ['pmne-category-narrative'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pmne_category_narrative')
        .select('*')
        .order('clarity_score', { ascending: false });
      if (error) throw error;
      return data;
    },
    staleTime: 120_000,
  });
}

export function useGrowthSignals() {
  return useQuery({
    queryKey: ['pmne-growth-signals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pmne_growth_signals')
        .select('*')
        .order('investor_impact_score', { ascending: false });
      if (error) throw error;
      return data;
    },
    staleTime: 60_000,
  });
}

export function useLeadershipPerception() {
  return useQuery({
    queryKey: ['pmne-leadership-perception'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pmne_leadership_perception')
        .select('*')
        .order('perception_strength', { ascending: false });
      if (error) throw error;
      return data;
    },
    staleTime: 120_000,
  });
}

export function useFinancialStory() {
  return useQuery({
    queryKey: ['pmne-financial-story'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pmne_financial_story')
        .select('*')
        .order('credibility_score', { ascending: false });
      if (error) throw error;
      return data;
    },
    staleTime: 120_000,
  });
}

export function useConfidenceLoop() {
  return useQuery({
    queryKey: ['pmne-confidence-loop'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pmne_confidence_loop')
        .select('*')
        .order('confidence_impact', { ascending: false });
      if (error) throw error;
      return data;
    },
    staleTime: 120_000,
  });
}

// -- Mutations --

export function useConstructNarrative() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params?: Record<string, unknown>) => invokePMNE('construct_narrative', params),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['pmne-category-narrative'] });
      qc.invalidateQueries({ queryKey: ['pmne-dashboard'] });
      toast.success(`Constructed ${data?.narratives_constructed ?? 0} narratives, ${data?.dominant ?? 0} dominant`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useAmplifyGrowth() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params?: Record<string, unknown>) => invokePMNE('amplify_growth', params),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['pmne-growth-signals'] });
      toast.success(`Amplified ${data?.signals_amplified ?? 0} signals, ${data?.flagship ?? 0} flagship`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useMeasurePerception() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params?: Record<string, unknown>) => invokePMNE('measure_perception', params),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['pmne-leadership-perception'] });
      toast.success(`Measured ${data?.dimensions_measured ?? 0} dimensions, ${data?.strengthening ?? 0} strengthening`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useArchitectFinancialStory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params?: Record<string, unknown>) => invokePMNE('architect_financial_story', params),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['pmne-financial-story'] });
      toast.success(`Architected ${data?.stories_architected ?? 0} stories, avg credibility: ${data?.avg_credibility ?? 0}%`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useSyncConfidence() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params?: Record<string, unknown>) => invokePMNE('sync_confidence', params),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['pmne-confidence-loop'] });
      toast.success(`Synced ${data?.loops_synced ?? 0} loops, ${data?.high_impact ?? 0} high-impact`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
