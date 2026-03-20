import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  computeFlywheelHealth,
  computeExperimentConfidence,
  type RevenueSnapshot,
  type RevenueExperiment,
  type FlywheelHealth,
} from '@/utils/revenueOptimizationEngine';

// ─── Revenue Snapshots ───────────────────────────────────────────────────

export function useRevenueSnapshots(days = 30) {
  return useQuery({
    queryKey: ['revenue-snapshots', days],
    queryFn: async () => {
      const since = new Date();
      since.setDate(since.getDate() - days);
      const { data, error } = await supabase
        .from('revenue_daily_snapshots')
        .select('*')
        .gte('snapshot_date', since.toISOString().split('T')[0])
        .order('snapshot_date', { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as RevenueSnapshot[];
    },
    staleTime: 60_000,
  });
}

// ─── Revenue Experiments ─────────────────────────────────────────────────

export function useRevenueExperiments(status?: string) {
  return useQuery({
    queryKey: ['revenue-experiments', status],
    queryFn: async () => {
      let query = supabase
        .from('revenue_experiments')
        .select('*')
        .order('created_at', { ascending: false });
      if (status) query = query.eq('status', status);
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as unknown as RevenueExperiment[];
    },
  });
}

export function useCreateExperiment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<RevenueExperiment>) => {
      const { error } = await supabase
        .from('revenue_experiments')
        .insert(input as any);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['revenue-experiments'] });
      toast.success('Experiment created');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateExperiment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<RevenueExperiment>) => {
      const { error } = await supabase
        .from('revenue_experiments')
        .update({ ...updates, updated_at: new Date().toISOString() } as any)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['revenue-experiments'] });
      toast.success('Experiment updated');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ─── Subscription Plans ──────────────────────────────────────────────────

export function useSubscriptionPlans() {
  return useQuery({
    queryKey: ['subscription-plans-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useUpdatePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; [key: string]: any }) => {
      const { error } = await supabase
        .from('subscription_plans')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['subscription-plans-admin'] });
      toast.success('Plan updated');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ─── Computed Flywheel Health ─────────────────────────────────────────────

export function useFlywheelHealth() {
  const { data: snapshots } = useRevenueSnapshots(30);
  const { data: experiments } = useRevenueExperiments('active');

  return useQuery({
    queryKey: ['flywheel-health', snapshots?.length, experiments?.length],
    queryFn: async (): Promise<FlywheelHealth> => {
      // Get live stats for upsell signal computation
      const latest = snapshots?.slice(-1)[0];
      const activeVendors = latest?.active_vendors ?? 0;
      const activeSubscribers = latest?.active_subscribers ?? 0;
      const avgDealValue = latest && latest.deal_count > 0
        ? latest.transaction_revenue / latest.deal_count
        : 1_800_000_000; // default Rp 1.8B
      const convRate = latest && latest.deal_count > 0 ? 0.064 : 0.03; // from KPIs

      return computeFlywheelHealth(
        snapshots ?? [],
        activeVendors,
        activeSubscribers,
        avgDealValue,
        convRate,
        experiments?.length ?? 0,
      );
    },
    enabled: !!snapshots,
    staleTime: 30_000,
  });
}

export { computeExperimentConfidence };
