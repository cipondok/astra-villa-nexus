import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { throwIfEdgeFunctionReturnedError } from '@/lib/supabaseFunctionErrors';
import { toast } from 'sonner';

async function invokeDMEM(mode: string, params?: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke('decade-monopoly-expansion', {
    body: { mode, params: params || {} },
  });
  if (error) throw error;
  throwIfEdgeFunctionReturnedError(data);
  return data;
}

// ── Queries ──

export function useDMEMDashboard(enabled = true) {
  return useQuery({
    queryKey: ['dmem-dashboard'],
    queryFn: () => invokeDMEM('dashboard'),
    enabled,
    refetchInterval: 120_000,
    staleTime: 60_000,
  });
}

export function useLiquidityLeadership(enabled = true) {
  return useQuery({
    queryKey: ['dmem-liquidity-leadership'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dmem_liquidity_leadership' as any)
        .select('*')
        .order('target_year')
        .order('target_quarter')
        .limit(20);
      if (error) throw error;
      return data;
    },
    enabled,
    staleTime: 60_000,
  });
}

export function useMarketplaceGravity(enabled = true) {
  return useQuery({
    queryKey: ['dmem-marketplace-gravity'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dmem_marketplace_gravity' as any)
        .select('*')
        .order('gravity_pull_strength', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
    enabled,
    staleTime: 120_000,
  });
}

export function useEcosystemLockin(enabled = true) {
  return useQuery({
    queryKey: ['dmem-ecosystem-lockin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dmem_ecosystem_lockin' as any)
        .select('*')
        .order('lock_in_strength', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
    enabled,
    staleTime: 120_000,
  });
}

export function useCapitalFlowControl(enabled = true) {
  return useQuery({
    queryKey: ['dmem-capital-flow'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dmem_capital_flow_control' as any)
        .select('*')
        .order('dominance_score', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
    enabled,
    staleTime: 120_000,
  });
}

export function useGlobalInfrastructure(enabled = true) {
  return useQuery({
    queryKey: ['dmem-global-infrastructure'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dmem_global_infrastructure' as any)
        .select('*')
        .order('irreversibility_score', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
    enabled,
    staleTime: 120_000,
  });
}

// ── Mutations ──

export function usePlanLiquidityLeadership() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => invokeDMEM('plan_liquidity_leadership'),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['dmem-liquidity-leadership'] });
      qc.invalidateQueries({ queryKey: ['dmem-dashboard'] });
      toast.success(`${data?.milestones_planned} milestones planned, ${data?.achieved} achieved, ${data?.in_progress} in progress`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useComputeMarketplaceGravity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => invokeDMEM('compute_marketplace_gravity'),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['dmem-marketplace-gravity'] });
      toast.success(`${data?.stakeholders_modeled} stakeholders, strongest gravity: ${data?.strongest}`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDesignEcosystemLockin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => invokeDMEM('design_ecosystem_lockin'),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['dmem-ecosystem-lockin'] });
      toast.success(`${data?.services_designed} services, avg lock-in: ${data?.avg_lock_in}, total RPU: $${data?.total_rpu}`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useModelCapitalFlow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => invokeDMEM('model_capital_flow'),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['dmem-capital-flow'] });
      toast.success(`${data?.domains_modeled} domains, $${(data?.total_capital_volume / 1e6)?.toFixed(0)}M total volume`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useProjectGlobalInfrastructure() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => invokeDMEM('project_global_infrastructure'),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['dmem-global-infrastructure'] });
      qc.invalidateQueries({ queryKey: ['dmem-dashboard'] });
      toast.success(`${data?.irreversible} irreversible dimensions, ${data?.total_cities} cities embedded`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
