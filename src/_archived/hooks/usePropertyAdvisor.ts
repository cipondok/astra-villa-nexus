import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AdvisorRecommendation {
  property_id: string;
  title: string;
  city: string;
  district: string | null;
  price: number;
  property_type: string | null;
  bedrooms: number | null;
  area_sqm: number;
  investment_score: number;
  demand_heat_score: number;
  forecast_growth: number;
  deal_score: number;
  composite_score: number;
  image_url: string | null;
  developer: string | null;
}

export interface AdvisorResult {
  parsed_criteria: {
    city: string;
    property_type: string;
    min_price: number;
    max_price: number;
    investment_goal: string;
    min_bedrooms: number;
    keywords: string[];
  };
  recommendations: AdvisorRecommendation[];
  summary: string;
  total_found: number;
  total_ranked: number;
}

export function usePropertyAdvisor() {
  return useMutation({
    mutationFn: async (userQuery: string): Promise<AdvisorResult> => {
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: { mode: 'property_advisor', payload: { user_query: userQuery } },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data as AdvisorResult;
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Advisor request failed');
    },
  });
}
