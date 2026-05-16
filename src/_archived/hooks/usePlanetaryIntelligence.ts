import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface GlobalPropertySignal {
  id: string;
  country: string;
  region: string;
  city: string;
  urban_growth_score: number;
  infrastructure_development_score: number;
  population_mobility_index: number;
  capital_inflow_intensity: number;
  housing_supply_pressure: number;
  affordability_stress_index: number;
  rental_yield_trend: number;
  liquidity_velocity_score: number;
  market_cycle_phase: string;
  confidence_level: number;
  signal_timestamp: string;
}

export interface CapitalFlowEdge {
  id: string;
  source_city: string;
  target_city: string;
  capital_movement_probability: number;
  investment_migration_score: number;
  portfolio_diversification_flow: number;
}

export interface GlobalLiquidityBalance {
  id: string;
  region: string;
  balance_index: number;
  systemic_status: string;
  capital_concentration_risk: number;
  inventory_risk_score: number;
  affordability_stress: number;
}

export function useGlobalPropertySignals(limit = 50) {
  return useQuery({
    queryKey: ['global-property-signals', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('global_property_signals')
        .select('*')
        .order('signal_timestamp', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data as unknown as GlobalPropertySignal[];
    },
    staleTime: 5 * 60_000,
    refetchInterval: 15 * 60_000,
  });
}

export function useCapitalFlowNetwork(limit = 30) {
  return useQuery({
    queryKey: ['capital-flow-network', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('capital_flow_network')
        .select('*')
        .order('capital_movement_probability', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data as unknown as CapitalFlowEdge[];
    },
    staleTime: 5 * 60_000,
  });
}

export function useGlobalLiquidityBalance() {
  return useQuery({
    queryKey: ['global-liquidity-balance'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('global_liquidity_balance')
        .select('*')
        .order('computed_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data as unknown as GlobalLiquidityBalance[];
    },
    staleTime: 5 * 60_000,
  });
}
