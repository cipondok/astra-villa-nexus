import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { throwIfEdgeFunctionReturnedError } from "@/lib/supabaseFunctionErrors";

export interface TransactionProbabilityInput {
  property_type: string;
  transaction_type: "sale" | "rent";
  price_position: string;
  demand_level: string;
  liquidity_score: number;
  seo_score: number;
  buyer_activity: string;
}

export interface TransactionProbabilityResult {
  deal_probability_score: number;
  probability_level: "LOW CHANCE" | "MODERATE CHANCE" | "HIGH CHANCE" | "VERY HIGH CLOSING POTENTIAL";
  estimated_time_to_close: string;
  positive_factors: string[];
  risk_factors: string[];
  recommended_action: string;
}

export interface TransactionProbabilityResponse {
  result: TransactionProbabilityResult;
  input: TransactionProbabilityInput;
}

export function useTransactionProbability() {
  return useMutation({
    mutationFn: async (input: TransactionProbabilityInput): Promise<TransactionProbabilityResponse> => {
      const { data, error } = await supabase.functions.invoke("ai-engine", {
        body: { mode: "seo_generate", payload: { action: "transaction-probability", ...input } },
      });
      if (error) throw error;
      throwIfEdgeFunctionReturnedError(data);
      return { result: data.result, input: data.input };
    },
  });
}
