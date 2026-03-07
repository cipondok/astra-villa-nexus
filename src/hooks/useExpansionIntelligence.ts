import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { throwIfEdgeFunctionReturnedError } from '@/lib/supabaseFunctionErrors';

export interface ExpansionTarget {
  country: string;
  region: string;
  flag: string;
  total_score: number;
  readiness: 'Ready' | 'High Potential' | 'Emerging' | 'Watch';
  market_growth: number;
  investor_interest: number;
  tourism_demand: number;
  economic_stability: number;
  metrics: {
    gdp_growth: number;
    property_growth: number;
    tourism_arrivals_m: number;
    fdi_inflow_b: number;
    rental_yield_avg: number;
    population_m: number;
    urbanization: number;
    ease_of_business: number;
    currency_stability: number;
    digital_adoption: number;
    foreign_ownership: string;
  };
  reasons: string[];
}

export interface ExpansionData {
  expansion_targets: ExpansionTarget[];
  summary: {
    total_markets_analyzed: number;
    top_target: string;
    ready_markets: number;
    high_potential_markets: number;
    avg_score: number;
  };
  generated_at: string;
}

export const useExpansionIntelligence = () => {
  return useQuery({
    queryKey: ['expansion-intelligence'],
    queryFn: async (): Promise<ExpansionData> => {
      const { data, error } = await supabase.functions.invoke('core-engine', {
        body: { mode: 'expansion_intelligence' },
      });
      if (error) throw error;
      throwIfEdgeFunctionReturnedError(data);
      return data?.data;
    },
    staleTime: 30 * 60 * 1000,
  });
};
