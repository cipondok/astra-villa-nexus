import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { throwIfEdgeFunctionReturnedError } from "@/lib/supabaseFunctionErrors";

export interface BuyerPropertyMatchInput {
  budget: string;
  city: string;
  property_type: string;
  purpose: "investment" | "own stay" | "rental income";
  lifestyle: string;
  price_level: string;
  location_score: number;
  investment_score: number;
  demand_level: string;
}

export interface BuyerPropertyMatchResult {
  match_score: number;
  match_level: "LOW MATCH" | "MODERATE MATCH" | "STRONG MATCH" | "PERFECT MATCH";
  compatibility_factors: string[];
  mismatch_risks: string[];
  engagement_hook: string;
}

export interface BuyerPropertyMatchResponse {
  result: BuyerPropertyMatchResult;
  input: BuyerPropertyMatchInput;
}

export function useBuyerPropertyMatch() {
  return useMutation({
    mutationFn: async (input: BuyerPropertyMatchInput): Promise<BuyerPropertyMatchResponse> => {
      const { data, error } = await supabase.functions.invoke("ai-engine", {
        body: { mode: "seo_generate", payload: { action: "buyer-property-match", ...input } },
      });
      if (error) throw error;
      throwIfEdgeFunctionReturnedError(data);
      return { result: data.result, input: data.input };
    },
  });
}
