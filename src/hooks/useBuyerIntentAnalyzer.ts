import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { throwIfEdgeFunctionReturnedError } from "@/lib/supabaseFunctionErrors";

export interface BuyerIntentInput {
  message: string;
  property_type?: string;
  transaction_type?: string;
  city?: string;
}

export interface BuyerIntentResult {
  buyer_intent_score: number;
  intent_level: "LOW" | "MEDIUM" | "HIGH" | "HOT";
  detected_signals: string[];
  recommended_agent_action: string;
}

export interface BuyerIntentResponse {
  result: BuyerIntentResult;
  input: BuyerIntentInput;
}

export function useBuyerIntentAnalyzer() {
  return useMutation({
    mutationFn: async (input: BuyerIntentInput): Promise<BuyerIntentResponse> => {
      const { data, error } = await supabase.functions.invoke("ai-engine", {
        body: { mode: "seo_generate", payload: { action: "buyer-intent", ...input } },
      });
      if (error) throw error;
      throwIfEdgeFunctionReturnedError(data);
      return { result: data.result, input: data.input };
    },
  });
}
