import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { throwIfEdgeFunctionReturnedError } from '@/lib/supabaseFunctionErrors';
import { toast } from 'sonner';

async function invokePESA(mode: string, params?: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke('planetary-stability', {
    body: { mode, params: params || {} },
  });
  if (error) throw error;
  throwIfEdgeFunctionReturnedError(data);
  return data;
}

// ── Queries ──

export function usePESADashboard(enabled = true) {
  return useQuery({
    queryKey: ['pesa-dashboard'],
    queryFn: () => invokePESA('dashboard'),
    enabled,
    refetchInterval: 120_000,
    staleTime: 60_000,
  });
}

export function useVolatilitySignals(enabled = true) {
  return useQuery({
    queryKey: ['pesa-volatility-signals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pesa_volatility_signals' as any)
        .select('*')
        .order('computed_at', { ascending: false })
        .limit(40);
      if (error) throw error;
      return data;
    },
    enabled,
    staleTime: 30_000,
  });
}

export function useInvestmentFlows(enabled = true) {
  return useQuery({
    queryKey: ['pesa-investment-flows'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pesa_investment_flow' as any)
        .select('*')
        .order('coordination_effectiveness', { ascending: false })
        .limit(30);
      if (error) throw error;
      return data;
    },
    enabled,
    staleTime: 60_000,
  });
}

export function useCrisisResilience(enabled = true) {
  return useQuery({
    queryKey: ['pesa-crisis-resilience'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pesa_crisis_resilience' as any)
        .select('*')
        .order('resilience_composite', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
    enabled,
    staleTime: 60_000,
  });
}

export function useInclusiveGrowth(enabled = true) {
  return useQuery({
    queryKey: ['pesa-inclusive-growth'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pesa_inclusive_growth' as any)
        .select('*')
        .order('inclusivity_composite', { ascending: false })
        .limit(40);
      if (error) throw error;
      return data;
    },
    enabled,
    staleTime: 60_000,
  });
}

export function useStabilityGovernance(enabled = true) {
  return useQuery({
    queryKey: ['pesa-stability-governance'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pesa_stability_governance' as any)
        .select('*')
        .order('governance_composite', { ascending: false })
        .limit(25);
      if (error) throw error;
      return data;
    },
    enabled,
    staleTime: 60_000,
  });
}

// ── Mutations ──

export function useDetectVolatility() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p?: Record<string, unknown>) => invokePESA('detect_volatility', p),
    onSuccess: (d) => {
      qc.invalidateQueries({ queryKey: ['pesa-volatility-signals'] });
      qc.invalidateQueries({ queryKey: ['pesa-dashboard'] });
      toast.success(`Scanned ${d?.cities_scanned ?? 0} cities for ${d?.signal_types ?? 0} volatility types`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useCoordinateFlows() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p?: Record<string, unknown>) => invokePESA('coordinate_flows', p),
    onSuccess: (d) => {
      qc.invalidateQueries({ queryKey: ['pesa-investment-flows'] });
      toast.success(`Mapped ${d?.corridors_mapped ?? 0} investment corridors`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useAssessResilience() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p?: Record<string, unknown>) => invokePESA('assess_resilience', p),
    onSuccess: (d) => {
      qc.invalidateQueries({ queryKey: ['pesa-crisis-resilience'] });
      toast.success(`Assessed ${d?.scenarios_assessed ?? 0} crisis scenarios`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useAlignInclusiveGrowth() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p?: Record<string, unknown>) => invokePESA('align_inclusive_growth', p),
    onSuccess: (d) => {
      qc.invalidateQueries({ queryKey: ['pesa-inclusive-growth'] });
      toast.success(`Aligned inclusive growth for ${d?.cities_aligned ?? 0} cities`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useGovernStability() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p?: Record<string, unknown>) => invokePESA('govern_stability', p),
    onSuccess: (d) => {
      qc.invalidateQueries({ queryKey: ['pesa-stability-governance'] });
      qc.invalidateQueries({ queryKey: ['pesa-dashboard'] });
      toast.success(`Governed ${d?.domains_governed ?? 0} stability domains`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
