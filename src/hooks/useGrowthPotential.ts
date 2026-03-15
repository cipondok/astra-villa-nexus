import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { throwIfEdgeFunctionReturnedError } from "@/lib/supabaseFunctionErrors";

export interface GrowthPotentialInput {
  village?: string;
  district?: string;
  city: string;
  province?: string;
  area_signals?: string;
}

export interface GrowthPotentialResult {
  growth_score: number;
  growth_level: "LOW" | "MODERATE" | "HIGH" | "FUTURE HOTSPOT";
  growth_time_horizon: string;
  key_growth_drivers: string[];
  growth_risk_factors: string[];
  growth_summary: string;
}

export interface GrowthPotentialResponse {
  result: GrowthPotentialResult;
  input: GrowthPotentialInput;
}

export function useGrowthPotential() {
  return useMutation({
    mutationFn: async (input: GrowthPotentialInput): Promise<GrowthPotentialResponse> => {
      const { data, error } = await supabase.functions.invoke("ai-engine", {
        body: { mode: "seo_generate", payload: { action: "growth-potential", ...input } },
      });
      if (error) throw error;
      throwIfEdgeFunctionReturnedError(data);
      return { result: data.result, input: data.input };
    },
  });
}
