import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { throwIfEdgeFunctionReturnedError } from "@/lib/supabaseFunctionErrors";

export interface DealProbabilityInput {
  demand_level: string;
  price_position: string;
  liquidity_level: string;
  buyer_intent_score: number;
}

export interface DealProbabilityResult {
  deal_success_probability: string;
  expected_closing_time: string;
  deal_strategy_tip: string;
}

export interface DealProbabilityResponse {
  result: DealProbabilityResult;
  input: DealProbabilityInput;
}

export function useDealProbability() {
  return useMutation({
    mutationFn: async (input: DealProbabilityInput): Promise<DealProbabilityResponse> => {
      const { data, error } = await supabase.functions.invoke("ai-engine", {
        body: { mode: "seo_generate", payload: { action: "deal-probability", ...input } },
      });
      if (error) throw error;
      throwIfEdgeFunctionReturnedError(data);
      return { result: data.result, input: data.input };
    },
  });
}
