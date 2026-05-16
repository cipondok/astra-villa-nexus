import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { throwIfEdgeFunctionReturnedError } from "@/lib/supabaseFunctionErrors";

export interface ConversionOptimizerInput {
  traffic: number;
  listings: number;
  leads: number;
  conversion_rate: number;
}

export interface ConversionOptimizerResult {
  conversion_weak_points: string[];
  ui_improvement_suggestions: string[];
  lead_generation_tactics: string[];
}

export interface ConversionOptimizerResponse {
  result: ConversionOptimizerResult;
  input: ConversionOptimizerInput;
}

export function useConversionOptimizer() {
  return useMutation({
    mutationFn: async (input: ConversionOptimizerInput): Promise<ConversionOptimizerResponse> => {
      const { data, error } = await supabase.functions.invoke("ai-engine", {
        body: { mode: "seo_generate", payload: { action: "conversion-optimizer", ...input } },
      });
      if (error) throw error;
      throwIfEdgeFunctionReturnedError(data);
      return { result: data.result, input: data.input };
    },
  });
}
