import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

async function invokeGIPD(mode: string, params?: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke('investor-psychology-domination', {
    body: { mode, params: params || {} },
  });
  if (error) throw error;
  return data;
}

// ── Queries ──

export function useGIPDDashboard() {
  return useQuery({
    queryKey: ['gipd-dashboard'],
    queryFn: () => invokeGIPD('dashboard'),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}

export function useMotivationMapping(region?: string) {
  return useQuery({
    queryKey: ['gipd-motivations', region],
    queryFn: async () => {
      let q = supabase.from('gipd_motivation_mapping').select('*').order('computed_at', { ascending: false });
      if (region) q = q.eq('market_region', region);
      const { data, error } = await (q as any).limit(15);
      if (error) throw error;
      return data;
    },
    staleTime: 30_000,
  });
}

export function useTrustAcceleration() {
  return useQuery({
    queryKey: ['gipd-trust'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gipd_trust_acceleration')
        .select('*')
        .order('computed_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
    staleTime: 30_000,
  });
}

export function useOpportunityPerception(region?: string) {
  return useQuery({
    queryKey: ['gipd-perception', region],
    queryFn: async () => {
      let q = supabase.from('gipd_opportunity_perception').select('*').order('computed_at', { ascending: false });
      if (region) q = q.eq('market_region', region);
      const { data, error } = await (q as any).limit(15);
      if (error) throw error;
      return data;
    },
    staleTime: 30_000,
  });
}

export function useBehavioralSegmentation() {
  return useQuery({
    queryKey: ['gipd-segments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gipd_behavioral_segmentation')
        .select('*')
        .order('computed_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
    staleTime: 30_000,
  });
}

export function useCapitalActivation() {
  return useQuery({
    queryKey: ['gipd-activation'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gipd_capital_activation')
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

export function useMapMotivations() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p?: Record<string, unknown>) => invokeGIPD('map_motivations', p),
    onSuccess: (d) => { qc.invalidateQueries({ queryKey: ['gipd-motivations'] }); toast.success(`Mapped motivations across ${d?.regions_mapped ?? 0} markets`); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useAccelerateTrust() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p?: Record<string, unknown>) => invokeGIPD('accelerate_trust', p),
    onSuccess: (d) => { qc.invalidateQueries({ queryKey: ['gipd-trust'] }); toast.success(`Accelerated ${d?.trust_dimensions_accelerated ?? 0} trust dimensions`); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useAmplifyPerception() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p?: Record<string, unknown>) => invokeGIPD('amplify_perception', p),
    onSuccess: (d) => { qc.invalidateQueries({ queryKey: ['gipd-perception'] }); toast.success(`Amplified perception in ${d?.regions_amplified ?? 0} markets`); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useSegmentBehavior() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p?: Record<string, unknown>) => invokeGIPD('segment_behavior', p),
    onSuccess: (d) => { qc.invalidateQueries({ queryKey: ['gipd-segments'] }); toast.success(`Defined ${d?.segments_defined ?? 0} behavioral segments`); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useActivateCapital() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p?: Record<string, unknown>) => invokeGIPD('activate_capital', p),
    onSuccess: (d) => { qc.invalidateQueries({ queryKey: ['gipd-activation'] }); qc.invalidateQueries({ queryKey: ['gipd-dashboard'] }); toast.success(`Activated ${d?.funnel_stages_activated ?? 0} capital flywheel stages`); },
    onError: (e: Error) => toast.error(e.message),
  });
}
