import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// ─── Opportunity Scores ──────────────────────────────
export function useFundOpportunityScores(city?: string, tier?: string) {
  return useQuery({
    queryKey: ['fund-opportunity-scores', city, tier],
    queryFn: async () => {
      let query = supabase
        .from('fund_opportunity_scores' as any)
        .select('*')
        .order('opportunity_score', { ascending: false })
        .limit(100);
      if (city) query = query.eq('city', city);
      if (tier) query = query.eq('opportunity_tier', tier);
      const { data, error } = await query;
      if (error) throw error;
      return data as any[];
    },
    staleTime: 30_000,
  });
}

// ─── Liquidity Pools ─────────────────────────────────
export function useFundPools() {
  return useQuery({
    queryKey: ['fund-pools'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fund_liquidity_pools' as any)
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as any[];
    },
    staleTime: 30_000,
  });
}

// ─── Pool Participations ────────────────────────────
export function useMyPoolParticipations() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['fund-participations', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fund_pool_participations' as any)
        .select('*')
        .eq('investor_id', user!.id)
        .order('joined_at', { ascending: false });
      if (error) throw error;
      return data as any[];
    },
    enabled: !!user?.id,
    staleTime: 30_000,
  });
}

// ─── Fund Deployments ────────────────────────────────
export function useFundDeployments(poolId?: string) {
  return useQuery({
    queryKey: ['fund-deployments', poolId],
    queryFn: async () => {
      let query = supabase
        .from('fund_deployments' as any)
        .select('*')
        .order('deployed_at', { ascending: false });
      if (poolId) query = query.eq('pool_id', poolId);
      const { data, error } = await query.limit(100);
      if (error) throw error;
      return data as any[];
    },
    staleTime: 30_000,
  });
}

// ─── Rebalance Signals ───────────────────────────────
export function useFundRebalanceSignals(poolId?: string) {
  return useQuery({
    queryKey: ['fund-rebalance-signals', poolId],
    queryFn: async () => {
      let query = supabase
        .from('fund_rebalance_signals' as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (poolId) query = query.eq('pool_id', poolId);
      const { data, error } = await query;
      if (error) throw error;
      return data as any[];
    },
    staleTime: 15_000,
  });
}

// ─── Performance Snapshots ───────────────────────────
export function useFundPerformance(poolId?: string) {
  return useQuery({
    queryKey: ['fund-performance', poolId],
    queryFn: async () => {
      if (!poolId) return [];
      const { data, error } = await supabase
        .from('fund_performance_snapshots' as any)
        .select('*')
        .eq('pool_id', poolId)
        .order('snapshot_date', { ascending: false })
        .limit(90);
      if (error) throw error;
      return data as any[];
    },
    enabled: !!poolId,
    staleTime: 60_000,
  });
}

// ─── Engine Trigger ──────────────────────────────────
export function useTriggerFundEngine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { mode: string; params?: Record<string, any> }) => {
      const { data, error } = await supabase.functions.invoke('institutional-fund-engine', {
        body: payload,
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (_data, variables) => {
      const m = variables.mode;
      if (m === 'score_opportunities') qc.invalidateQueries({ queryKey: ['fund-opportunity-scores'] });
      if (m === 'optimize_allocation') {
        qc.invalidateQueries({ queryKey: ['fund-deployments'] });
        qc.invalidateQueries({ queryKey: ['fund-pools'] });
      }
      if (m === 'rebalance_portfolio') qc.invalidateQueries({ queryKey: ['fund-rebalance-signals'] });
      if (m === 'compute_performance') qc.invalidateQueries({ queryKey: ['fund-performance'] });
      if (m === 'pool_summary') qc.invalidateQueries({ queryKey: ['fund-pools'] });
      toast.success(`Fund Engine: ${m} completed`);
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

// ─── Compound Dashboard Hook ─────────────────────────
export function useFundDashboard(poolId?: string) {
  const pools = useFundPools();
  const deployments = useFundDeployments(poolId);
  const signals = useFundRebalanceSignals(poolId);
  const performance = useFundPerformance(poolId);
  const participations = useMyPoolParticipations();

  return {
    pools: pools.data || [],
    deployments: deployments.data || [],
    rebalanceSignals: signals.data || [],
    performanceHistory: performance.data || [],
    myParticipations: participations.data || [],
    isLoading: pools.isLoading || deployments.isLoading,
  };
}
