import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface RiskEvent {
  id: string;
  entity_type: string;
  entity_id: string;
  risk_signal_type: string;
  risk_signal_value: number;
  severity_level: string;
  source_system: string;
  metadata_json: Record<string, unknown>;
  is_processed: boolean;
  created_at: string;
}

export interface RiskCase {
  id: string;
  related_entity_type: string;
  related_entity_id: string;
  risk_reason: string;
  risk_score: number;
  status: string;
  admin_notes: string | null;
  created_at: string;
}

export interface DashboardStats {
  events_24h: number;
  events_7d: number;
  open_cases: number;
  high_risk_users: number;
  recent_critical: RiskEvent[];
  signal_distribution: Record<string, number>;
}

export const useRiskDashboardStats = () =>
  useQuery({
    queryKey: ['risk-dashboard-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('risk-score-engine', {
        body: { action: 'dashboard_stats' },
      });
      if (error) throw error;
      return data.data as DashboardStats;
    },
    refetchInterval: 30000,
  });

export const useRiskEvents = (limit = 50) =>
  useQuery({
    queryKey: ['risk-events', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('risk_events' as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data || []) as unknown as RiskEvent[];
    },
    refetchInterval: 15000,
  });

export const useRiskCases = (status?: string) =>
  useQuery({
    queryKey: ['risk-cases', status],
    queryFn: async () => {
      let q = supabase
        .from('risk_cases' as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (status) q = q.eq('status', status);
      const { data, error } = await q;
      if (error) throw error;
      return (data || []) as unknown as RiskCase[];
    },
  });

export const useHighRiskUsers = () =>
  useQuery({
    queryKey: ['high-risk-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url, risk_score, risk_level, last_risk_evaluated_at')
        .gte('risk_score', 30)
        .order('risk_score', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
  });

export const useEmitRiskEvent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (evt: {
      entity_type: string;
      entity_id: string;
      risk_signal_type: string;
      severity_level?: string;
      source_system?: string;
      metadata_json?: Record<string, unknown>;
    }) => {
      const { data, error } = await supabase.functions.invoke('risk-score-engine', {
        body: { action: 'emit_risk_event', ...evt },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['risk-dashboard-stats'] });
      qc.invalidateQueries({ queryKey: ['risk-events'] });
    },
  });
};

export const useCheckTransactionRisk = () =>
  useMutation({
    mutationFn: async (body: { buyer_id: string; seller_id: string; deal_id: string }) => {
      const { data, error } = await supabase.functions.invoke('risk-score-engine', {
        body: { action: 'check_transaction_risk', ...body },
      });
      if (error) throw error;
      return data.data;
    },
  });

export const useUpdateRiskCase = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ caseId, updates }: { caseId: string; updates: Partial<RiskCase> }) => {
      const { error } = await supabase
        .from('risk_cases' as any)
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', caseId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['risk-cases'] }),
  });
};
