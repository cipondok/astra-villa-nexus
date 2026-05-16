import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface InquiryTrendPoint {
  month: string;
  inquiries: number;
  saves: number;
  new_listings: number;
}

export interface AreaDemandHeat {
  area: string;
  avg_heat: number;
  listing_count: number;
  avg_price: number;
  signal: 'HIGH_LAUNCH_READINESS' | 'MODERATE_DEMAND' | 'LOW_DEMAND_RISK';
}

export interface ForecastSignal {
  area: string;
  signal: string;
  message: string;
  heat: number;
}

export interface DeveloperDemandData {
  inquiry_trend: InquiryTrendPoint[];
  area_demand_heat: AreaDemandHeat[];
  absorption_speed: {
    avg_days_to_absorb: number;
    speed_rating: 'FAST' | 'MODERATE' | 'SLOW';
    units_absorbed_30d: number;
  };
  investor_budget_distribution: { range: string; count: number; avg_demand: number }[];
  optimal_pricing: { min: number; max: number; sweet_spot: number; sample_size: number };
  competing_projects: { property_type: string; total_listings: number; avg_opportunity_score: number; avg_price: number }[];
  forecast_signals: ForecastSignal[];
  lead_pipeline: {
    total_views: number;
    estimated_inquiries: number;
    estimated_qualified_leads: number;
    estimated_conversions: number;
    conversion_rate: number;
  };
  total_properties_analyzed: number;
  generated_at: string;
}

export function useDeveloperDemandForecast(params?: { city?: string; property_type?: string }) {
  return useQuery({
    queryKey: ['developer-demand-forecast', params?.city, params?.property_type],
    queryFn: async (): Promise<DeveloperDemandData> => {
      const { data, error } = await supabase.functions.invoke('developer-demand-forecast', {
        body: { mode: 'dashboard', city: params?.city || '', property_type: params?.property_type || '' },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data?.data as DeveloperDemandData;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
