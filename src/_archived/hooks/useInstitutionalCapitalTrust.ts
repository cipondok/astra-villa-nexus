import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

async function invokeICTA(mode: string, params?: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke('institutional-capital-trust', {
    body: { mode, params: params || {} },
  });
  if (error) throw error;
  return data;
}

// -- Queries --

export function useICTADashboard() {
  return useQuery({
    queryKey: ['icta-dashboard'],
    queryFn: () => invokeICTA('dashboard'),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}

export function useTransparencyIntelligence() {
  return useQuery({
    queryKey: ['icta-transparency'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('icta_transparency')
        .select('*')
        .order('transparency_grade')
        .limit(30);
      if (error) throw error;
      return data;
    },
    staleTime: 120_000,
  });
}

export function useGovernanceConfidence() {
  return useQuery({
    queryKey: ['icta-governance'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('icta_governance')
        .select('*')
        .order('credibility_index', { ascending: false });
      if (error) throw error;
      return data;
    },
    staleTime: 120_000,
  });
}

export function useCapitalDeployment() {
  return useQuery({
    queryKey: ['icta-capital-deployment'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('icta_capital_deployment')
        .select('*')
        .order('mandate_fit_score', { ascending: false });
      if (error) throw error;
      return data;
    },
    staleTime: 120_000,
  });
}

export function useStrategicPartnerships() {
  return useQuery({
    queryKey: ['icta-partnerships'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('icta_partnerships')
        .select('*')
        .order('trust_score', { ascending: false });
      if (error) throw error;
      return data;
    },
    staleTime: 120_000,
  });
}

export function useTrustFlywheel() {
  return useQuery({
    queryKey: ['icta-trust-flywheel'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('icta_trust_flywheel')
        .select('*')
        .order('flywheel_momentum', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
    staleTime: 60_000,
  });
}

// -- Mutations --

export function useAssessTransparency() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: Record<string, unknown>) => invokeICTA('assess_transparency', params),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['icta-transparency'] });
      qc.invalidateQueries({ queryKey: ['icta-dashboard'] });
      toast.success(`Assessed ${data?.districts_assessed ?? 0} districts, ${data?.aaa_count ?? 0} AAA-rated`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useEvaluateGovernance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params?: Record<string, unknown>) => invokeICTA('evaluate_governance', params),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['icta-governance'] });
      toast.success(`Evaluated ${data?.dimensions_evaluated ?? 0} dimensions, ${data?.optimized ?? 0} optimized`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useOptimizeDeployment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params?: Record<string, unknown>) => invokeICTA('optimize_deployment', params),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['icta-capital-deployment'] });
      toast.success(`Optimized ${data?.mandates_optimized ?? 0} mandates, ${data?.deploying ?? 0} deploying`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useEnablePartnerships() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params?: Record<string, unknown>) => invokeICTA('enable_partnerships', params),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['icta-partnerships'] });
      toast.success(`Enabled ${data?.partners_enabled ?? 0} partners, ${data?.anchor ?? 0} anchor`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useCompoundTrust() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params?: Record<string, unknown>) => invokeICTA('compound_trust', params),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['icta-trust-flywheel'] });
      qc.invalidateQueries({ queryKey: ['icta-dashboard'] });
      toast.success(`Trust flywheel: ${data?.phase}, momentum ${data?.momentum}, confidence ${data?.confidence}`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
