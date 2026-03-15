import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { throwIfEdgeFunctionReturnedError } from "@/lib/supabaseFunctionErrors";

export interface UnifiedInsightInput {
  village?: string;
  district?: string;
  city: string;
  province?: string;
  investment_score: number;
  demand_score: number;
  liquidity_score: number;
  growth_score: number;
  price_score: number;
}

export interface UnifiedInsightResult {
  overall_opportunity_score: number;
  opportunity_level: "LOW" | "MODERATE" | "STRONG" | "PRIME";
  key_strengths: string[];
  key_risks: string[];
  strategy_recommendation: string;
}

export interface UnifiedInsightResponse {
  result: UnifiedInsightResult;
  input: UnifiedInsightInput;
}

export function useUnifiedInsight() {
  return useMutation({
    mutationFn: async (input: UnifiedInsightInput): Promise<UnifiedInsightResponse> => {
      const { data, error } = await supabase.functions.invoke("ai-engine", {
        body: { mode: "seo_generate", payload: { action: "unified-insight", ...input } },
      });
      if (error) throw error;
      throwIfEdgeFunctionReturnedError(data);
      return { result: data.result, input: data.input };
    },
  });
}
