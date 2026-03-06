import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SmartPricingInput {
  property_id?: string;
  title?: string;
  location: string;
  property_type: string;
  current_price: number;
  listing_type?: string;
  land_area_sqm?: number;
  building_area_sqm?: number;
  bedrooms?: number;
  bathrooms?: number;
  amenities?: string[];
  occupancy_rate?: number;
  nearby_properties?: {
    title: string;
    property_type: string;
    location: string;
    price: number;
    land_area_sqm?: number;
    building_area_sqm?: number;
    bedrooms?: number;
    bathrooms?: number;
  }[];
}

export interface PricingFactor {
  factor: string;
  impact: "negative" | "neutral" | "positive";
  weight: number;
  explanation: string;
}

export interface PricingStrategy {
  name: string;
  price: number;
  timeline: string;
  pros: string[];
  cons: string[];
}

export interface SmartPricingResult {
  fair_market_value: number;
  optimal_price: number;
  quick_sale_price: number;
  premium_price: number;
  price_positioning: "underpriced" | "fair" | "slightly_overpriced" | "overpriced";
  confidence_score: number;
  price_per_sqm: number;
  demand_level: "low" | "moderate" | "high" | "very_high";
  seasonality_impact: "negative" | "neutral" | "positive" | "strong_positive";
  estimated_days_on_market: number;
  price_trend: "declining" | "stable" | "rising" | "rapidly_rising";
  pricing_factors: PricingFactor[];
  strategies: PricingStrategy[];
  market_summary: string;
  recommendation: string;
}

export function useSmartPricing() {
  return useMutation({
    mutationFn: async (input: SmartPricingInput): Promise<SmartPricingResult> => {
      const { data, error } = await supabase.functions.invoke("ai-engine", {
        body: { mode: "smart_pricing", payload: input },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data as SmartPricingResult;
    },
  });
}
