import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PortfolioBuilderInput {
  budget: number;
  risk_level: 'low' | 'medium' | 'high';
  investment_horizon: number;
}

export interface PortfolioItem {
  property_id: string;
  title: string;
  price: number;
  city: string;
  state: string | null;
  property_type: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  building_area: number | null;
  thumbnail_url: string | null;
  investment_score: number;
  demand_heat_score: number;
  composite_score: number;
  allocation_amount: number;
  allocation_percent: number;
  estimated_yield: number;
  estimated_growth: number;
  projected_value: number;
  total_rental_income: number;
  total_roi: number;
  annualized_return: number;
}

export interface PortfolioBuilderResult {
  portfolio: PortfolioItem[];
  total_allocated: number;
  remaining_budget: number;
  projected_roi: number;
  projected_value: number;
  weighted_yield: number;
  risk_level: string;
  diversification: {
    cities: string[];
    types: string[];
    count: number;
    score: number;
  };
  candidates_scanned: number;
  investment_horizon: number;
  recommendation: string;
  generated_at: string;
}

export function usePortfolioBuilder() {
  return useMutation({
    mutationFn: async (input: PortfolioBuilderInput): Promise<PortfolioBuilderResult> => {
      const { data, error } = await supabase.functions.invoke('core-engine', {
        body: { mode: 'portfolio_builder', ...input },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data?.data as PortfolioBuilderResult;
    },
    onSuccess: (data) => {
      toast.success(`Portfolio dihasilkan: ${data.portfolio.length} properti dari ${data.candidates_scanned} kandidat`);
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Gagal menghasilkan portfolio');
    },
  });
}
