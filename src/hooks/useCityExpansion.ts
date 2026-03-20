import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CityExpansionInput {
  city: string;
  province: string;
  population: number;
  monthly_property_transactions: number;
  rental_demand_index: number;
  developer_count: number;
  vendor_coverage_pct: number;
  investor_interest_signals: number;
}

export interface CityExpansionPlan {
  city: string;
  readiness_score: number;
  readiness_tier: string;
  recommended_budget_idr: number;
  target_listings: number;
  vendor_recruitment_targets: Record<string, number>;
  revenue_ramp: { month: number; revenue_idr: number }[];
  launch_checklist: { phase: string; items: string[] }[];
  risk_factors: string[];
}

/** Generate expansion plans for multiple cities */
export function useCityExpansionPlanner() {
  return useMutation({
    mutationFn: async (cities: CityExpansionInput[]) => {
      const { data, error } = await supabase.functions.invoke('city-launch-planner', {
        body: { mode: 'plan', cities },
      });
      if (error) throw error;
      return data as { plans: CityExpansionPlan[]; total_cities: number };
    },
    onSuccess: (data) => {
      toast.success(`Generated plans for ${data.total_cities} cities`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

/** Pre-configured Indonesian expansion targets */
export const INDONESIA_EXPANSION_CITIES: CityExpansionInput[] = [
  { city: 'Bandung', province: 'Jawa Barat', population: 2_500_000, monthly_property_transactions: 320, rental_demand_index: 72, developer_count: 18, vendor_coverage_pct: 35, investor_interest_signals: 65 },
  { city: 'Surabaya', province: 'Jawa Timur', population: 2_900_000, monthly_property_transactions: 380, rental_demand_index: 68, developer_count: 22, vendor_coverage_pct: 40, investor_interest_signals: 60 },
  { city: 'Medan', province: 'Sumatera Utara', population: 2_200_000, monthly_property_transactions: 180, rental_demand_index: 55, developer_count: 10, vendor_coverage_pct: 20, investor_interest_signals: 42 },
  { city: 'Makassar', province: 'Sulawesi Selatan', population: 1_500_000, monthly_property_transactions: 120, rental_demand_index: 50, developer_count: 8, vendor_coverage_pct: 15, investor_interest_signals: 38 },
  { city: 'Semarang', province: 'Jawa Tengah', population: 1_800_000, monthly_property_transactions: 200, rental_demand_index: 58, developer_count: 12, vendor_coverage_pct: 25, investor_interest_signals: 50 },
  { city: 'Yogyakarta', province: 'DI Yogyakarta', population: 420_000, monthly_property_transactions: 140, rental_demand_index: 75, developer_count: 9, vendor_coverage_pct: 30, investor_interest_signals: 55 },
  { city: 'Denpasar', province: 'Bali', population: 950_000, monthly_property_transactions: 250, rental_demand_index: 88, developer_count: 15, vendor_coverage_pct: 45, investor_interest_signals: 82 },
  { city: 'Balikpapan', province: 'Kalimantan Timur', population: 700_000, monthly_property_transactions: 90, rental_demand_index: 45, developer_count: 5, vendor_coverage_pct: 10, investor_interest_signals: 35 },
];
