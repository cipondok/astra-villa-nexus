import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface InvestorDNA {
  user_id: string;
  risk_tolerance_score: number;
  investment_horizon_years: number;
  preferred_property_types: string[];
  preferred_cities: string[];
  budget_range_min: number;
  budget_range_max: number;
  rental_income_pref_weight: number;
  capital_growth_pref_weight: number;
  flip_strategy_affinity: number;
  luxury_bias_score: number;
  diversification_score: number;
  probability_next_purchase: number;
  churn_risk_score: number;
  expected_budget_upgrade: number;
  geo_expansion_likelihood: number;
  investor_persona: 'conservative' | 'balanced' | 'aggressive' | 'luxury' | 'flipper';
  last_computed_at: string;
  version: number;
}

export function useInvestorDNA() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['investor-dna', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('investor_dna' as any)
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) {
        console.error('Error fetching investor DNA:', error);
        return null;
      }
      return data as InvestorDNA | null;
    },
    enabled: !!user?.id,
    staleTime: 60 * 1000,
  });
}

export function useComputeInvestorDNA() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Not authenticated');
      const { data, error } = await supabase.functions.invoke('core-engine', {
        body: { mode: 'compute_investor_dna' },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investor-dna'] });
    },
  });
}

// Radar chart data helper
export function getDNARadarData(dna: InvestorDNA) {
  return [
    { dimension: 'Risk Appetite', value: dna.risk_tolerance_score, fullMark: 100 },
    { dimension: 'Yield Focus', value: Math.round(dna.rental_income_pref_weight * 100), fullMark: 100 },
    { dimension: 'Growth Focus', value: Math.round(dna.capital_growth_pref_weight * 100), fullMark: 100 },
    { dimension: 'Flip Affinity', value: Math.round(dna.flip_strategy_affinity), fullMark: 100 },
    { dimension: 'Luxury Bias', value: Math.round(dna.luxury_bias_score), fullMark: 100 },
    { dimension: 'Diversification', value: Math.round(dna.diversification_score), fullMark: 100 },
  ];
}

const PERSONA_META: Record<string, { label: string; description: string; color: string }> = {
  conservative: { label: 'Conservative', description: 'Stability-focused with emphasis on rental yield and low-risk assets', color: 'text-blue-500' },
  balanced: { label: 'Balanced', description: 'Mix of growth and income strategies across diversified markets', color: 'text-emerald-500' },
  aggressive: { label: 'Aggressive', description: 'Growth-oriented with higher risk tolerance and short-term plays', color: 'text-orange-500' },
  luxury: { label: 'Luxury', description: 'Premium property focus with long-term capital appreciation', color: 'text-purple-500' },
  flipper: { label: 'Flipper', description: 'Quick turnaround deals, undervalued properties, and renovation plays', color: 'text-red-500' },
};

export function getPersonaMeta(persona: string) {
  return PERSONA_META[persona] || PERSONA_META.balanced;
}
