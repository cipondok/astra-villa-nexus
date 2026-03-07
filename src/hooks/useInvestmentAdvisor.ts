import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type InvestmentGoal = 'rental' | 'flip' | 'long_term';

export interface InvestmentRecommendation {
  property_id: string;
  title: string;
  city: string;
  district: string | null;
  price: number;
  property_type: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  thumbnail_url: string | null;
  listing_type: string | null;
  investment_rating: number;
  roi: number;
  rental_yield: number;
  investment_score: number;
  demand_heat_score: number;
  price_fairness: number;
  liquidity_score: number;
  predicted_days_to_sell: number;
  area_sqm: number;
  explanation: string;
}

export interface InvestmentAdvisorResult {
  recommendations: InvestmentRecommendation[];
  input: {
    budget: number;
    preferred_location: string;
    investment_goal: InvestmentGoal;
  };
  candidates_scanned: number;
  generated_at: string;
}

export const useInvestmentAdvisor = () => {
  const mutation = useMutation({
    mutationFn: async (params: {
      budget: number;
      preferred_location?: string;
      investment_goal?: InvestmentGoal;
      limit?: number;
    }): Promise<InvestmentAdvisorResult> => {
      const { data, error } = await supabase.functions.invoke('core-engine', {
        body: {
          mode: 'investment_advisor',
          budget: params.budget,
          preferred_location: params.preferred_location || '',
          investment_goal: params.investment_goal || 'long_term',
          limit: params.limit || 10,
        },
      });
      if (error) throw error;
      if (data?.data?.error) throw new Error(data.data.error);
      return data.data;
    },
    onSuccess: (data) => {
      toast.success(`Found ${data.recommendations.length} investment opportunities`);
    },
    onError: () => {
      toast.error('Investment analysis failed');
    },
  });

  return {
    getAdvice: mutation.mutate,
    getAdviceAsync: mutation.mutateAsync,
    recommendations: mutation.data?.recommendations || [],
    result: mutation.data,
    isLoading: mutation.isPending,
    reset: mutation.reset,
  };
};
