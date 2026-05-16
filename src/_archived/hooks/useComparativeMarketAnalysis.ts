import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { throwIfEdgeFunctionReturnedError } from "@/lib/supabaseFunctionErrors";

export interface CMAInput {
  property_title?: string;
  city: string;
  district?: string;
  property_type: string;
  listing_price: number;
  land_area_sqm?: number;
  building_area_sqm?: number;
  bedrooms?: number;
  bathrooms?: number;
  year_built?: number;
  condition?: string;
  amenities?: string[];
  legal_status?: string;
}

export interface ComparableSummary {
  title: string;
  price: number;
  price_per_sqm?: number;
  similarity_score: number;
  key_differences: string[];
  advantage: "subject" | "comparable" | "neutral";
}

export interface CMAResult {
  estimated_market_value: number;
  value_range: { low: number; high: number };
  price_positioning: string;
  price_deviation_percent: number;
  price_per_sqm?: number;
  market_avg_price_per_sqm?: number;
  comparables_summary: ComparableSummary[];
  market_conditions: {
    demand_level: string;
    supply_level: string;
    market_trend: string;
    avg_days_on_market: number;
    predicted_days_to_sell: number;
    absorption_rate?: string;
  };
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  pricing_recommendations: {
    optimal_listing_price: number;
    quick_sale_price: number;
    premium_price: number;
    reasoning: string;
  };
  investment_outlook: {
    annual_appreciation_estimate: number;
    rental_yield_estimate: number;
    five_year_projection: number;
    investment_grade: string;
    recommendation: string;
  };
  executive_summary: string;
  total_comparables_found: number;
}

export function useComparativeMarketAnalysis() {
  return useMutation({
    mutationFn: async (input: CMAInput): Promise<CMAResult> => {
      const { data, error } = await supabase.functions.invoke("ai-engine", {
        body: { mode: "comparative_market_analysis", payload: input },
      });
      if (error) throw error;
      throwIfEdgeFunctionReturnedError(data);
      return data as CMAResult;
    },
  });
}
