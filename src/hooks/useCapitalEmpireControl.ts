import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const invoke = async (mode: string, extra?: Record<string, unknown>) => {
  const { data, error } = await supabase.functions.invoke('capital-empire-control', {
    body: { mode, ...extra },
  });
  if (error) throw error;
  return data;
};

export function useACECMDashboard() {
  return useQuery({
    queryKey: ['acecm-dashboard'],
    queryFn: () => invoke('dashboard'),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export function useCapitalSignals(city?: string) {
  return useQuery({
    queryKey: ['acecm-signals', city],
    queryFn: async () => {
      let q = supabase.from('acecm_capital_signals' as any).select('*').order('computed_at', { ascending: false }).limit(50);
      if (city) q = q.eq('city', city);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
    staleTime: 20_000,
  });
}

export function useOpportunityGravity() {
  return useQuery({
    queryKey: ['acecm-gravity'],
    queryFn: async () => {
      const { data, error } = await supabase.from('acecm_opportunity_gravity' as any).select('*').order('gravity_score', { ascending: false }).limit(30);
      if (error) throw error;
      return data;
    },
    staleTime: 20_000,
  });
}

export function useInstitutionalInfluence() {
  return useQuery({
    queryKey: ['acecm-influence'],
    queryFn: async () => {
      const { data, error } = await supabase.from('acecm_institutional_influence' as any).select('*').order('decision_influence_index', { ascending: false }).limit(30);
      if (error) throw error;
      return data;
    },
    staleTime: 20_000,
  });
}

export function useCapitalFeedbackLoops() {
  return useQuery({
    queryKey: ['acecm-feedback'],
    queryFn: async () => {
      const { data, error } = await supabase.from('acecm_capital_feedback_loop' as any).select('*').order('computed_at', { ascending: false }).limit(30);
      if (error) throw error;
      return data;
    },
    staleTime: 20_000,
  });
}

export function useGovernanceRisk() {
  return useQuery({
    queryKey: ['acecm-governance'],
    queryFn: async () => {
      const { data, error } = await supabase.from('acecm_governance_risk' as any).select('*').order('assessed_at', { ascending: false }).limit(20);
      if (error) throw error;
      return data;
    },
    staleTime: 30_000,
  });
}

function useMutationHelper(mode: string, label: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params?: Record<string, unknown>) => invoke(mode, params),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['acecm-dashboard'] });
      qc.invalidateQueries({ queryKey: [`acecm-${mode}`] });
      toast.success(`${label} computed successfully`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export const useComputeCapitalSignals = () => useMutationHelper('signals', 'Capital Signals');
export const useComputeOpportunityGravity = () => useMutationHelper('gravity', 'Opportunity Gravity');
export const useComputeInstitutionalInfluence = () => useMutationHelper('influence', 'Institutional Influence');
export const useComputeCapitalFeedback = () => useMutationHelper('feedback', 'Capital Feedback Loops');
export const useComputeGovernanceRisk = () => useMutationHelper('governance', 'Governance Risk');
