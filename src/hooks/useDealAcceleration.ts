import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { throwIfEdgeFunctionReturnedError } from "@/lib/supabaseFunctionErrors";

export interface DealAccelerationInput {
  probability_level: string;
  demand_level: string;
  price_position: string;
}

export interface DealAccelerationResult {
  marketing_action: string;
  pricing_tactic: string;
  urgency_strategy: string;
  agent_followup_tip: string;
}

export interface DealAccelerationResponse {
  result: DealAccelerationResult;
  input: DealAccelerationInput;
}

export function useDealAcceleration() {
  return useMutation({
    mutationFn: async (input: DealAccelerationInput): Promise<DealAccelerationResponse> => {
      const { data, error } = await supabase.functions.invoke("ai-engine", {
        body: { mode: "seo_generate", payload: { action: "deal-acceleration", ...input } },
      });
      if (error) throw error;
      throwIfEdgeFunctionReturnedError(data);
      return { result: data.result, input: data.input };
    },
  });
}
