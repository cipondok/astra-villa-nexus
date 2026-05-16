import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface VendorSupplyInsightSummary {
  total_districts_analyzed: number;
  critical_shortages: number;
  high_pressure_districts: number;
  avg_supply_pressure: number;
  total_revenue_at_risk: number;
  active_campaigns: number;
  queued_expansions: number;
}

export interface DistrictSupplyInsight {
  district: string;
  supply_pressure_score: number;
  priority_categories: string[];
  recruitment_urgency: 'critical' | 'high' | 'moderate' | 'low';
  recommended_incentive: string;
  estimated_revenue_impact: number;
  campaign_recommendation: string;
}

export interface CategoryPressure {
  category: string;
  total_gap_pressure: number;
}

export interface VendorSupplyOptimizationResult {
  summary: VendorSupplyInsightSummary;
  top_categories_needing_supply: CategoryPressure[];
  district_insights: DistrictSupplyInsight[];
  active_campaigns: {
    id: string;
    name: string;
    district: string;
    category: string;
    target: number;
    acquired: number;
    urgency: number;
    status: string;
  }[];
  expansion_queue: {
    district: string;
    category: string;
    rank: number;
    composite_score: number;
  }[];
  generated_at: string;
}

export const useVendorSupplyInsights = (cityFilter?: string) => {
  return useQuery({
    queryKey: ['vendor-supply-insights', cityFilter],
    queryFn: async (): Promise<VendorSupplyOptimizationResult> => {
      const { data, error } = await supabase.functions.invoke('vendor-supply-optimizer', {
        body: { city_filter: cityFilter || null },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      return data.data;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};
