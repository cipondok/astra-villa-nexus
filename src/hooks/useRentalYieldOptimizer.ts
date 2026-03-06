import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { throwIfEdgeFunctionReturnedError } from "@/lib/supabaseFunctionErrors";

export interface RentalYieldRequest {
  property_type: string;
  location: string;
  purchase_price: number;
  current_monthly_rent?: number;
  property_area: number;
  bedrooms: number;
  bathrooms: number;
  furnishing: "unfurnished" | "semi_furnished" | "fully_furnished";
  building_age_years?: number;
  amenities?: string[];
  rental_strategy?: "long_term" | "short_term" | "mixed";
}

export interface RentalYieldResult {
  optimal_monthly_rent: number;
  rent_range: { min: number; max: number };
  gross_yield_percent: number;
  net_yield_percent: number;
  annual_expenses_breakdown: {
    category: string;
    amount: number;
    description: string;
  }[];
  occupancy_rate_estimate: number;
  annual_net_income: number;
  payback_period_years: number;
  pricing_strategy: {
    strategy_name: string;
    description: string;
    recommended_price: number;
    expected_occupancy: number;
    expected_annual_income: number;
  }[];
  improvement_suggestions: {
    improvement: string;
    estimated_cost: number;
    rent_increase_potential: number;
    roi_months: number;
  }[];
  market_comparison: {
    metric: string;
    your_property: string;
    area_average: string;
    status: "above" | "below" | "average";
  }[];
  seasonal_trends: string[];
  risk_factors: string[];
  recommendations: string[];
}

export function useRentalYieldOptimizer() {
  return useMutation({
    mutationFn: async (input: RentalYieldRequest): Promise<RentalYieldResult> => {
      const { data, error } = await supabase.functions.invoke("ai-engine", {
        body: { mode: "rental_yield_optimizer", payload: input },
      });
      if (error) throw error;
      throwIfEdgeFunctionReturnedError(data);
      return data as RentalYieldResult;
    },
  });
}
