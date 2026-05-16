import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AgentStrategy {
  name: string;
  description: string;
  properties: {
    id: string;
    title: string;
    price: number;
    city: string;
    state: string;
    property_type: string;
    bedrooms: number;
    bathrooms: number;
    building_area: number;
    thumbnail_url: string | null;
    investment_score: number;
    demand_heat_score: number;
    rental_yield: number;
    risk_factor: number;
    annual_growth_rate: number;
    projected_value_5y: number;
    roi_5y: number;
    deal_quality: string;
  }[];
  total_investment: number;
  projected_roi: number;
  projected_value_5y: number;
  avg_risk_factor: number;
  diversification: {
    cities: string[];
    property_count: number;
  };
}

export interface AgentIntent {
  investment_goal: string;
  budget_min: number;
  budget_max: number;
  location: string;
  risk_tolerance: string;
  property_types: string[];
  bedrooms_min: number;
  strategy_preference: string;
}

export interface AgentResult {
  intent: AgentIntent;
  total_candidates: number;
  strategies: AgentStrategy[];
  summary: string;
  generated_at: string;
}

export interface AgentInput {
  user_query?: string;
  user_budget?: number;
  preferred_location?: string;
  risk_tolerance?: 'low' | 'medium' | 'high';
}

export const useAutonomousAgent = () => {
  return useMutation({
    mutationFn: async (input: AgentInput): Promise<AgentResult> => {
      const { data, error } = await supabase.functions.invoke('core-engine', {
        body: {
          mode: 'autonomous_agent',
          user_query: input.user_query,
          user_budget: input.user_budget,
          preferred_location: input.preferred_location,
          risk_tolerance: input.risk_tolerance,
        },
      });
      if (error) throw new Error(error.message);
      return data?.data;
    },
  });
};
