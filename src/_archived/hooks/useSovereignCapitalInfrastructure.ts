import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

async function invokeEngine(mode: string, params?: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke('sovereign-capital-infrastructure', {
    body: { mode, params: params || {} },
  });
  if (error) throw error;
  return data;
}

/** Full ASCI dashboard */
export function useASCIDashboard() {
  return useQuery({
    queryKey: ['asci-dashboard'],
    queryFn: () => invokeEngine('dashboard'),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}

/** Capital intake / onboarded institutions */
export function useCapitalIntake() {
  return useQuery({
    queryKey: ['asci-intake'],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from('asci_capital_intake' as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(15) as any);
      if (error) throw error;
      return data;
    },
  });
}

/** Macro allocation recommendations */
export function useMacroAllocations() {
  return useQuery({
    queryKey: ['asci-allocations'],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from('asci_macro_allocation' as any)
        .select('*')
        .order('allocation_weight_pct', { ascending: false })
        .limit(20) as any);
      if (error) throw error;
      return data;
    },
  });
}

/** Risk stabilization assessments */
export function useRiskStabilization() {
  return useQuery({
    queryKey: ['asci-risks'],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from('asci_risk_stabilization' as any)
        .select('*')
        .order('severity', { ascending: false })
        .limit(15) as any);
      if (error) throw error;
      return data;
    },
  });
}

/** Cross-border deployments */
export function useCrossBorderDeployments() {
  return useQuery({
    queryKey: ['asci-deployments'],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from('asci_crossborder_deployment' as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(15) as any);
      if (error) throw error;
      return data;
    },
  });
}

/** Trust & transparency reports */
export function useTrustTransparency(institutionId?: string) {
  return useQuery({
    queryKey: ['asci-transparency', institutionId],
    queryFn: async () => {
      let q = (supabase.from('asci_trust_transparency' as any).select('*') as any)
        .order('report_generated_at', { ascending: false });
      if (institutionId) q = q.eq('institution_id', institutionId);
      const { data, error } = await q.limit(10);
      if (error) throw error;
      return data;
    },
  });
}

// ── Mutations ──

export function useOnboardCapital() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: Record<string, unknown>) => invokeEngine('onboard_capital', params),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['asci-intake'] }),
  });
}

export function useComputeAllocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: Record<string, unknown>) => invokeEngine('compute_allocation', params),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['asci-allocations'] }),
  });
}

export function useSimulateRisk() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: Record<string, unknown>) => invokeEngine('simulate_risk', params),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['asci-risks'] }),
  });
}

export function useOrchestrateDeployment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: Record<string, unknown>) => invokeEngine('orchestrate_deployment', params),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['asci-deployments'] }),
  });
}

export function useGenerateTransparency() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: Record<string, unknown>) => invokeEngine('generate_transparency', params),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['asci-transparency'] });
      qc.invalidateQueries({ queryKey: ['asci-dashboard'] });
    },
  });
}
