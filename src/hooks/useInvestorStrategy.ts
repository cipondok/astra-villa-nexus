import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface StrategyProperty {
  id: string;
  title: string;
  city: string;
  district: string | null;
  price: number;
  property_type: string | null;
  bedrooms: number | null;
  area_sqm: number;
  investment_score: number;
  heat_score: number;
  rental_yield: number;
  forecast_growth: number;
  risk_factor: number;
  roi_estimate: number;
  image_url: string | null;
}

export interface InvestmentStrategy {
  name: string;
  properties: StrategyProperty[];
  total_investment: number;
  portfolio_roi: number;
  avg_risk: number;
  diversification_score: number;
  strategy_summary: string;
}

export interface StrategyResult {
  strategies: InvestmentStrategy[];
  input: {
    budget: number;
    location: string;
    risk_level: string;
    investment_goal: string;
  };
  candidates_scanned: number;
  eligible_after_risk_filter: number;
  generated_at: string;
}

export interface StrategyInput {
  budget: number;
  location: string;
  risk_level: 'low' | 'medium' | 'high';
  investment_goal: 'capital_growth' | 'rental_yield' | 'both';
}

export function useInvestorStrategy() {
  return useMutation({
    mutationFn: async (input: StrategyInput): Promise<StrategyResult> => {
      const { data, error } = await supabase.functions.invoke('core-engine', {
        body: { mode: 'investor_strategy', ...input },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data?.data as StrategyResult;
    },
    onSuccess: (data) => {
      toast.success(`Generated ${data.strategies.length} investment strategies from ${data.candidates_scanned} properties`);
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Strategy generation failed');
    },
  });
}
