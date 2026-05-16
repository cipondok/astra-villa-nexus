import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

async function invokeAUWCP(mode: string, params?: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke('urban-wealth-creation', {
    body: { mode, params: params || {} },
  });
  if (error) throw error;
  return data;
}

/** Full AUWCP dashboard */
export function useAUWCPDashboard() {
  return useQuery({
    queryKey: ['auwcp-dashboard'],
    queryFn: () => invokeAUWCP('dashboard'),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}

/** Urban Opportunity Mapping */
export function useOpportunityMapping() {
  return useQuery({
    queryKey: ['auwcp-opportunity-mapping'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('auwcp_opportunity_mapping')
        .select('*')
        .order('composite_opportunity_score', { ascending: false });
      if (error) throw error;
      return data;
    },
    staleTime: 60_000,
  });
}

/** Investment Sequencing */
export function useInvestmentSequencing() {
  return useQuery({
    queryKey: ['auwcp-investment-sequencing'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('auwcp_investment_sequencing')
        .select('*')
        .order('sequencing_confidence', { ascending: false });
      if (error) throw error;
      return data;
    },
    staleTime: 60_000,
  });
}

/** Wealth Distribution Impact */
export function useWealthImpact() {
  return useQuery({
    queryKey: ['auwcp-wealth-impact'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('auwcp_wealth_impact')
        .select('*')
        .order('prosperity_inclusion_index', { ascending: false });
      if (error) throw error;
      return data;
    },
    staleTime: 60_000,
  });
}

/** Risk Mitigation */
export function useRiskMitigation() {
  return useQuery({
    queryKey: ['auwcp-risk-mitigation'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('auwcp_risk_mitigation')
        .select('*')
        .order('composite_risk_score', { ascending: false });
      if (error) throw error;
      return data;
    },
    staleTime: 60_000,
  });
}

/** Prosperity Feedback */
export function useProsperityFeedback() {
  return useQuery({
    queryKey: ['auwcp-prosperity-feedback'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('auwcp_prosperity_feedback')
        .select('*')
        .order('long_term_viability_score', { ascending: false });
      if (error) throw error;
      return data;
    },
    staleTime: 60_000,
  });
}

/** Mutation: map urban opportunities */
export function useMapOpportunities() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params?: Record<string, unknown>) => invokeAUWCP('map_opportunities', params),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['auwcp-opportunity-mapping'] });
      toast.success(`Mapped ${data?.districts_mapped ?? 0} district opportunities`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

/** Mutation: compute sequencing */
export function useComputeSequencing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params?: Record<string, unknown>) => invokeAUWCP('compute_sequencing', params),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['auwcp-investment-sequencing'] });
      toast.success(`Sequenced ${data?.districts_sequenced ?? 0} districts`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

/** Mutation: measure wealth impact */
export function useMeasureWealthImpact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params?: Record<string, unknown>) => invokeAUWCP('measure_wealth_impact', params),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['auwcp-wealth-impact'] });
      toast.success(`Measured wealth impact for ${data?.districts_measured ?? 0} districts`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

/** Mutation: assess development risk */
export function useAssessRisk() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params?: Record<string, unknown>) => invokeAUWCP('assess_risk', params),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['auwcp-risk-mitigation'] });
      toast.success(`Risk assessed for ${data?.districts_assessed ?? 0} districts`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

/** Mutation: compute prosperity feedback loop */
export function useComputeProsperityLoop() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params?: Record<string, unknown>) => invokeAUWCP('compute_prosperity_loop', params),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['auwcp-prosperity-feedback'] });
      qc.invalidateQueries({ queryKey: ['auwcp-dashboard'] });
      toast.success(`Prosperity loop computed for ${data?.districts_computed ?? 0} districts`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
