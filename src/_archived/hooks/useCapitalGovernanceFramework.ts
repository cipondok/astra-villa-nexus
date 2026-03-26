import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// ── Types ──

export interface TransparencyFlow {
  id: string;
  source_country: string;
  target_country: string;
  sector: string;
  flow_volume_usd: number;
  flow_direction: string;
  sector_concentration_hhi: number;
  geographic_concentration_risk: number;
  infra_funding_gap_usd: number;
  infra_gap_severity: string;
  transparency_score: number;
  aml_compliance_score: number;
  data_quality_grade: string;
  computed_at: string;
}

export interface AllocationCouncil {
  id: string;
  council_name: string;
  council_type: string;
  region: string;
  institutional_members: number;
  public_sector_members: number;
  ai_advisor_weight: number;
  total_capital_governed_usd: number;
  decisions_made: number;
  ai_recommendation_acceptance_pct: number;
  portfolio_return_pct: number;
  alignment_with_prosperity_goals_pct: number;
  voting_mechanism: string;
  transparency_level: string;
  is_active: boolean;
}

export interface CrisisProtocol {
  id: string;
  crisis_type: string;
  affected_region: string;
  severity_level: string;
  detection_confidence: number;
  leading_indicators: Array<{ indicator: string; value: number }>;
  trigger_threshold_breached: boolean;
  recommended_redistribution: Record<string, unknown>;
  capital_protection_actions: string[];
  liquidity_injection_needed_usd: number;
  financial_resilience_score: number;
  contagion_risk_pct: number;
  protocol_status: string;
  computed_at: string;
}

export interface InclusiveParticipation {
  id: string;
  country: string;
  region: string;
  emerging_market_readiness_score: number;
  regulatory_barrier_index: number;
  digital_access_pct: number;
  financial_literacy_index: number;
  micro_ownership_enabled: boolean;
  min_investment_threshold_usd: number;
  active_micro_investors: number;
  cross_border_participation_pct: number;
  wealth_gini_impact: number;
  inclusion_composite_score: number;
  inclusion_tier: string;
  computed_at: string;
}

export interface EthicalAllocation {
  id: string;
  country: string;
  city: string | null;
  regional_development_balance_score: number;
  capital_flow_fairness_index: number;
  environmental_impact_score: number;
  green_building_adoption_pct: number;
  intergenerational_fairness_score: number;
  youth_wealth_access_score: number;
  ethical_composite_score: number;
  ethical_tier: string;
  violations_detected: number;
  violation_details: Array<{ type: string; severity: string }>;
  remediation_actions: string[];
  computed_at: string;
}

export interface GCCFDashboard {
  summary: {
    capital_corridors_mapped: number;
    avg_transparency_score: number;
    active_councils: number;
    total_capital_governed_usd: number;
    active_crises: number;
    avg_inclusion_score: number;
    avg_ethics_score: number;
    total_violations: number;
  };
  transparency: TransparencyFlow[];
  councils: AllocationCouncil[];
  crisis_protocols: CrisisProtocol[];
  inclusion: InclusiveParticipation[];
  ethical_allocation: EthicalAllocation[];
}

// ── Hooks ──

export function useGCCFDashboard(enabled = true) {
  return useQuery({
    queryKey: ['gccf-dashboard'],
    queryFn: async (): Promise<GCCFDashboard> => {
      const { data, error } = await supabase.functions.invoke('capital-governance-framework', {
        body: { mode: 'dashboard' },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data?.data;
    },
    enabled,
    staleTime: 60_000,
    refetchInterval: 120_000,
  });
}

export function useCrisisProtocols(enabled = true) {
  return useQuery({
    queryKey: ['gccf-crisis-protocols'],
    queryFn: async (): Promise<CrisisProtocol[]> => {
      const { data, error } = await supabase
        .from('gccf_crisis_protocol')
        .select('*')
        .order('computed_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data ?? []) as unknown as CrisisProtocol[];
    },
    enabled,
    staleTime: 30_000,
  });
}

export function useInclusiveParticipation(enabled = true) {
  return useQuery({
    queryKey: ['gccf-inclusive-participation'],
    queryFn: async (): Promise<InclusiveParticipation[]> => {
      const { data, error } = await supabase
        .from('gccf_inclusive_participation')
        .select('*')
        .order('inclusion_composite_score', { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data ?? []) as unknown as InclusiveParticipation[];
    },
    enabled,
    staleTime: 60_000,
  });
}

export function useEthicalAllocation(enabled = true) {
  return useQuery({
    queryKey: ['gccf-ethical-allocation'],
    queryFn: async (): Promise<EthicalAllocation[]> => {
      const { data, error } = await supabase
        .from('gccf_ethical_allocation')
        .select('*')
        .order('ethical_composite_score', { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data ?? []) as unknown as EthicalAllocation[];
    },
    enabled,
    staleTime: 60_000,
  });
}

export function useTriggerGCCFEngine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { mode: string; params?: Record<string, unknown> }) => {
      const { data, error } = await supabase.functions.invoke('capital-governance-framework', {
        body: params,
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['gccf-dashboard'] });
      qc.invalidateQueries({ queryKey: ['gccf-crisis-protocols'] });
      qc.invalidateQueries({ queryKey: ['gccf-inclusive-participation'] });
      qc.invalidateQueries({ queryKey: ['gccf-ethical-allocation'] });
      toast.success(`GCCF engine completed: ${variables.mode}`);
    },
    onError: (err: Error) => {
      toast.error(err.message || 'GCCF engine failed');
    },
  });
}
