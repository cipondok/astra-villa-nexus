import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { throwIfEdgeFunctionReturnedError } from "@/lib/supabaseFunctionErrors";

export interface ValuationReportRequest {
  property_type: string;
  city: string;
  district?: string;
  land_area_sqm: number;
  building_area_sqm?: number;
  bedrooms?: number;
  bathrooms?: number;
  certificate_type?: string;
  year_built?: number;
  condition?: string;
  amenities?: string[];
  current_asking_price?: number;
  purpose: "sale" | "rental" | "investment";
}

export interface ComparableSale {
  address: string;
  property_type: string;
  land_area_sqm: number;
  building_area_sqm: number;
  sale_price: number;
  price_per_sqm: number;
  sale_date: string;
  similarity_score: number;
}

export interface ValuationReportResult {
  estimated_market_value: number;
  value_range_low: number;
  value_range_high: number;
  confidence_level: number;
  price_per_sqm_land: number;
  price_per_sqm_building: number;
  valuation_method: string;
  comparable_sales: ComparableSale[];
  market_analysis: {
    area_trend: "appreciating" | "stable" | "declining";
    annual_appreciation_rate: number;
    avg_days_on_market: number;
    supply_demand_ratio: string;
    market_summary: string;
  };
  investment_metrics: {
    estimated_rental_yield: number;
    estimated_monthly_rent: number;
    cap_rate: number;
    payback_period_years: number;
    five_year_projection: number;
    ten_year_projection: number;
  };
  property_strengths: string[];
  property_weaknesses: string[];
  value_adjustments: {
    factor: string;
    adjustment_percent: number;
    reason: string;
  }[];
  recommendations: string[];
  report_date: string;
  disclaimer: string;
}

export function usePropertyValuationReport() {
  return useMutation({
    mutationFn: async (input: ValuationReportRequest): Promise<ValuationReportResult> => {
      const { data, error } = await supabase.functions.invoke("ai-engine", {
        body: { mode: "property_valuation_report", payload: input },
      });
      if (error) throw error;
      throwIfEdgeFunctionReturnedError(data);
      return data as ValuationReportResult;
    },
  });
}
