import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const invoke = async (mode: string, extra?: Record<string, unknown>) => {
  const { data, error } = await supabase.functions.invoke('proptech-legacy-architecture', { body: { mode, ...extra } });
  if (error) throw error;
  return data;
};

export const useGPLADashboard = () => useQuery({ queryKey: ['gpla-dashboard'], queryFn: () => invoke('dashboard'), staleTime: 30_000, refetchInterval: 60_000 });

export const useInfrastructurePermanence = () => useQuery({
  queryKey: ['gpla-infrastructure'],
  queryFn: async () => { const { data, error } = await supabase.from('gpla_infrastructure_permanence' as any).select('*').order('assessed_at', { ascending: false }).limit(30); if (error) throw error; return data; },
  staleTime: 20_000,
});

export const useGenerationalContinuity = () => useQuery({
  queryKey: ['gpla-continuity'],
  queryFn: async () => { const { data, error } = await supabase.from('gpla_generational_continuity' as any).select('*').order('computed_at', { ascending: false }).limit(20); if (error) throw error; return data; },
  staleTime: 20_000,
});

export const useTrustCompounding = () => useQuery({
  queryKey: ['gpla-trust'],
  queryFn: async () => { const { data, error } = await supabase.from('gpla_trust_compounding' as any).select('*').order('measured_at', { ascending: false }).limit(25); if (error) throw error; return data; },
  staleTime: 20_000,
});

export const useReferenceStandard = () => useQuery({
  queryKey: ['gpla-reference'],
  queryFn: async () => { const { data, error } = await supabase.from('gpla_reference_standard' as any).select('*').order('assessed_at', { ascending: false }).limit(20); if (error) throw error; return data; },
  staleTime: 20_000,
});

export const useLegacyGovernance = () => useQuery({
  queryKey: ['gpla-governance'],
  queryFn: async () => { const { data, error } = await supabase.from('gpla_legacy_governance' as any).select('*').order('assessed_at', { ascending: false }).limit(15); if (error) throw error; return data; },
  staleTime: 20_000,
});

function useMut(mode: string, label: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p?: Record<string, unknown>) => invoke(mode, p),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['gpla-dashboard'] }); toast.success(`${label} computed`); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export const useAssessInfrastructure = () => useMut('infrastructure', 'Infrastructure Permanence');
export const useModelContinuity = () => useMut('continuity', 'Generational Continuity');
export const useCompoundTrust = () => useMut('trust', 'Trust Compounding');
export const useAssessReference = () => useMut('reference', 'Reference Standards');
export const useAssessGovernance = () => useMut('governance', 'Legacy Governance');
