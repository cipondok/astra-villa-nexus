import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// ── Types ──

export type SignalDomain = 'dynamic_pricing' | 'cost_efficiency' | 'revenue_opportunity' | 'risk_control';
export type ExecutionStatus = 'pending' | 'approved' | 'executing' | 'completed' | 'rolled_back' | 'rejected';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface ProfitSignal {
  id: string;
  signal_domain: SignalDomain;
  signal_type: string;
  signal_strength: number;
  confidence_score: number;
  current_value: number;
  recommended_value: number | null;
  projected_impact_pct: number;
  projected_revenue_impact: number;
  risk_level: RiskLevel;
  auto_executable: boolean;
  requires_approval: boolean;
  execution_status: ExecutionStatus;
  rollback_reason: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface ProfitExperiment {
  id: string;
  experiment_name: string;
  target_domain: string;
  hypothesis: string | null;
  status: string;
  current_confidence: number;
  confidence_threshold: number;
  control_revenue: number;
  variant_revenue: number;
  revenue_impact: number;
  partner_retention_impact: number;
  auto_scale_enabled: boolean;
  created_at: string;
}

export interface ProfitDashboardData {
  signals: {
    total: number;
    pending: number;
    executed: number;
    rolled_back: number;
    avg_confidence: number;
    by_domain: Record<SignalDomain, number>;
  };
  experiments: {
    total: number;
    active: number;
    completed: number;
    positive_rate: number;
    total_revenue_impact: number;
  };
  daily_trend: Array<{
    summary_date: string;
    total_revenue: number;
    total_costs: number;
    net_profit: number;
    margin_pct: number;
    cost_efficiency_score: number;
    partner_retention_rate: number;
  }>;
  recent_audit: Array<{
    action_type: string;
    decision: string;
    confidence_at_decision: number;
    revenue_before: number | null;
    revenue_after: number | null;
    risk_assessment: string | null;
    decided_by: string;
    admin_override: boolean;
    created_at: string;
  }>;
}

// ── Pure classifiers (testable) ──

export function classifyDomainPriority(signals: { signal_domain: string; signal_strength: number }[]): SignalDomain {
  const domainScores: Record<string, number> = {};
  for (const s of signals) {
    domainScores[s.signal_domain] = (domainScores[s.signal_domain] || 0) + s.signal_strength;
  }
  const sorted = Object.entries(domainScores).sort(([, a], [, b]) => b - a);
  return (sorted[0]?.[0] as SignalDomain) || 'revenue_opportunity';
}

export function computeMetabolicEfficiency(revenue: number, costs: number): number {
  if (revenue <= 0) return 0;
  return Math.round(((revenue - costs) / revenue) * 1000) / 10;
}

export function classifyHealthStatus(
  margin: number,
  retention: number,
  confidence: number,
): 'thriving' | 'healthy' | 'caution' | 'critical' {
  if (margin >= 30 && retention >= 95 && confidence >= 70) return 'thriving';
  if (margin >= 15 && retention >= 85 && confidence >= 50) return 'healthy';
  if (margin >= 5 && retention >= 75) return 'caution';
  return 'critical';
}

// ── Dashboard data hook ──

export function useProfitDashboard() {
  return useQuery({
    queryKey: ['profit-optimization-dashboard'],
    queryFn: async (): Promise<ProfitDashboardData> => {
      const { data, error } = await supabase.rpc('get_profit_optimization_dashboard');
      if (error) throw error;
      return data as unknown as ProfitDashboardData;
    },
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

// ── Active signals hook ──

export function useProfitSignals(domain?: SignalDomain) {
  return useQuery({
    queryKey: ['profit-signals', domain],
    queryFn: async () => {
      let query = supabase
        .from('profit_optimization_signals')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (domain) query = query.eq('signal_domain', domain);
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as unknown as ProfitSignal[];
    },
  });
}

// ── Active experiments hook ──

export function useProfitExperiments(status?: string) {
  return useQuery({
    queryKey: ['profit-experiments', status],
    queryFn: async () => {
      let query = supabase
        .from('profit_experiments')
        .select('*')
        .order('created_at', { ascending: false });
      if (status) query = query.eq('status', status);
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as unknown as ProfitExperiment[];
    },
  });
}

// ── Trigger scan mutation ──

export function useTriggerProfitScan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('profit-optimizer-ai', {
        body: { mode: 'scan' },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['profit-signals'] });
      qc.invalidateQueries({ queryKey: ['profit-optimization-dashboard'] });
      toast.success(`Generated ${data?.signals_generated ?? 0} optimization signals`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ── Approve signal mutation ──

export function useApproveSignal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (signalId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase.functions.invoke('profit-optimizer-ai', {
        body: { mode: 'approve_signal', signal_id: signalId, user_id: user?.id },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profit-signals'] });
      toast.success('Signal approved for execution');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ── Rollback signal mutation ──

export function useRollbackSignal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ signalId, reason }: { signalId: string; reason: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase.functions.invoke('profit-optimizer-ai', {
        body: { mode: 'rollback_signal', signal_id: signalId, reason, user_id: user?.id },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profit-signals'] });
      toast.success('Signal rolled back');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
