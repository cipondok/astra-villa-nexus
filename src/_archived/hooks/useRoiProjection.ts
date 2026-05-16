import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { throwIfEdgeFunctionReturnedError } from "@/lib/supabaseFunctionErrors";

export interface RoiProjectionInput {
  property_type: string;
  transaction_type: string;
  price: number;
  village?: string;
  district?: string;
  city: string;
  province?: string;
  growth_score?: number;
  demand_score?: number;
  liquidity_score?: number;
}

export interface RoiProjectionResult {
  annual_appreciation_estimate: string;
  projected_value_3yr: string;
  projected_value_5yr: string;
  estimated_total_roi_percent: string;
  roi_grade: "LOW" | "MODERATE" | "STRONG" | "EXCELLENT";
  roi_strategy_summary: string;
}

export interface RoiProjectionResponse {
  result: RoiProjectionResult;
  input: RoiProjectionInput;
}

export function useRoiProjection() {
  return useMutation({
    mutationFn: async (input: RoiProjectionInput): Promise<RoiProjectionResponse> => {
      const { data, error } = await supabase.functions.invoke("ai-engine", {
        body: { mode: "seo_generate", payload: { action: "roi-projection", ...input } },
      });
      if (error) throw error;
      throwIfEdgeFunctionReturnedError(data);
      return { result: data.result, input: data.input };
    },
  });
}
