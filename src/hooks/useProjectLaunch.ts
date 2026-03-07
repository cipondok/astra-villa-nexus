import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ProjectLaunchInput {
  project_name: string;
  city: string;
  district?: string;
  property_type?: string;
  total_units?: number;
  price_per_unit: number;
  building_area_avg?: number;
  land_area_avg?: number;
  amenities?: string;
  completion_date?: string;
  developer_name?: string;
}

export interface ProjectLaunchResult {
  project_name: string;
  developer_name: string | null;
  city: string;
  district: string | null;
  property_type: string;
  total_units: number;
  price_per_unit: number;
  total_project_value: number;
  area_sqm: number;
  price_per_sqm: number;
  market_avg_price_per_sqm: number;
  market_price_estimate: number;
  undervalue_percent: number;
  project_score: number;
  grade: string;
  demand_heat_score: number;
  demand_level: string;
  rental_yield: number;
  est_monthly_rent: number;
  est_annual_rent: number;
  price_growth_rate: number;
  projected_price_3y: number;
  projected_price_5y: number;
  roi_estimate: number;
  annualized_roi: number;
  capital_gain_5y: number;
  total_rental_income_5y: number;
  comparables_count: number;
  project_description: string;
  investment_summary: string;
  generated_at: string;
}

export function useProjectLaunch() {
  return useMutation({
    mutationFn: async (input: ProjectLaunchInput): Promise<ProjectLaunchResult> => {
      const { data, error } = await supabase.functions.invoke('core-engine', {
        body: { mode: 'developer_project_launch', ...input },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data?.data as ProjectLaunchResult;
    },
    onSuccess: () => {
      toast.success('Analisis proyek berhasil dibuat!');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Gagal menganalisis proyek');
    },
  });
}
