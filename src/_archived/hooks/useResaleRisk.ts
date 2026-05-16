import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { throwIfEdgeFunctionReturnedError } from "@/lib/supabaseFunctionErrors";

export interface ResaleRiskInput {
  property_type: string;
  village?: string;
  district?: string;
  city: string;
  nearby_facilities?: string;
}

export interface ResaleRiskResult {
  resale_risk_level: "LOW" | "MEDIUM" | "HIGH";
  risk_factors: string[];
  risk_summary: string;
}

export interface ResaleRiskResponse {
  result: ResaleRiskResult;
  input: ResaleRiskInput;
}

export function useResaleRisk() {
  return useMutation({
    mutationFn: async (input: ResaleRiskInput): Promise<ResaleRiskResponse> => {
      const { data, error } = await supabase.functions.invoke("ai-engine", {
        body: { mode: "seo_generate", payload: { action: "resale-risk", ...input } },
      });
      if (error) throw error;
      throwIfEdgeFunctionReturnedError(data);
      return { result: data.result, input: data.input };
    },
  });
}
