import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { throwIfEdgeFunctionReturnedError } from "@/lib/supabaseFunctionErrors";

export interface MonetizationStrategyInput {
  agents: number;
  leads: number;
  traffic: number;
}

export interface MonetizationStrategyResult {
  monetization_opportunities: string[];
  premium_feature_launch_plan: string[];
  pricing_activation_strategy: string;
}

export interface MonetizationStrategyResponse {
  result: MonetizationStrategyResult;
  input: MonetizationStrategyInput;
}

export function useMonetizationStrategy() {
  return useMutation({
    mutationFn: async (input: MonetizationStrategyInput): Promise<MonetizationStrategyResponse> => {
      const { data, error } = await supabase.functions.invoke("ai-engine", {
        body: { mode: "seo_generate", payload: { action: "monetization-strategy", ...input } },
      });
      if (error) throw error;
      throwIfEdgeFunctionReturnedError(data);
      return { result: data.result, input: data.input };
    },
  });
}
