import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { throwIfEdgeFunctionReturnedError } from "@/lib/supabaseFunctionErrors";

export interface TenantMatchInput {
  tenant_name?: string;
  budget_min: number;
  budget_max: number;
  preferred_locations: string[];
  property_type_preferences: string[];
  bedrooms_min?: number;
  bathrooms_min?: number;
  must_have_amenities: string[];
  lifestyle_tags: string[];
  move_in_date?: string;
  lease_duration_months?: number;
  pets?: string;
  family_size?: number;
  work_location?: string;
  commute_preference?: string;
  available_properties: {
    id: string;
    title: string;
    location: string;
    property_type: string;
    monthly_rent: number;
    bedrooms: number;
    bathrooms: number;
    amenities: string[];
    land_area_sqm?: number;
    building_area_sqm?: number;
  }[];
}

export interface PropertyMatch {
  property_id: string;
  property_title: string;
  compatibility_score: number;
  budget_fit: number;
  location_fit: number;
  feature_fit: number;
  lifestyle_fit: number;
  match_highlights: string[];
  concerns: string[];
  monthly_rent: number;
  commute_estimate: string;
}

export interface TenantMatchResult {
  matches: PropertyMatch[];
  tenant_summary: string;
  market_advice: string;
  total_properties_analyzed: number;
  strong_matches: number;
  average_compatibility: number;
}

export function useTenantMatching() {
  return useMutation({
    mutationFn: async (input: TenantMatchInput): Promise<TenantMatchResult> => {
      const { data, error } = await supabase.functions.invoke("ai-engine", {
        body: { mode: "tenant_matching", payload: input },
      });
      if (error) throw error;
      throwIfEdgeFunctionReturnedError(data);
      return data as TenantMatchResult;
    },
  });
}
