import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { throwIfEdgeFunctionReturnedError } from "@/lib/supabaseFunctionErrors";

export interface NegotiationTacticsInput {
  property_type: string;
  transaction_type: string;
  price: number;
  village?: string;
  district?: string;
  city: string;
  demand_level?: string;
  price_position?: string;
  liquidity_score?: number;
}

export interface NegotiationTacticsResult {
  buyer_negotiation_power: "LOW" | "MODERATE" | "STRONG";
  safe_discount_range: string;
  closing_tactics: string[];
  value_justification_points: string[];
  negotiation_strategy_summary: string;
}

export interface NegotiationTacticsResponse {
  result: NegotiationTacticsResult;
  input: NegotiationTacticsInput;
}

export function useNegotiationTactics() {
  return useMutation({
    mutationFn: async (input: NegotiationTacticsInput): Promise<NegotiationTacticsResponse> => {
      const { data, error } = await supabase.functions.invoke("ai-engine", {
        body: { mode: "seo_generate", payload: { action: "negotiation-tactics", ...input } },
      });
      if (error) throw error;
      throwIfEdgeFunctionReturnedError(data);
      return { result: data.result, input: data.input };
    },
  });
}
