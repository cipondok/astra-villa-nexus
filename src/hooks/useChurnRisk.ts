import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { throwIfEdgeFunctionReturnedError } from "@/lib/supabaseFunctionErrors";

export interface ChurnRiskInput {
  last_post_days: number;
  leads: number;
  login_freq: number;
}

export type ChurnRiskLevel = "CRITICAL" | "HIGH" | "MODERATE" | "LOW";

export interface ChurnRiskResult {
  activity_risk_level: ChurnRiskLevel;
  risk_reason: string;
  retention_action: string;
}

export interface ChurnRiskResponse {
  result: ChurnRiskResult;
  input: ChurnRiskInput;
}

export function useChurnRisk() {
  return useMutation({
    mutationFn: async (input: ChurnRiskInput): Promise<ChurnRiskResponse> => {
      const { data, error } = await supabase.functions.invoke("ai-engine", {
        body: { mode: "seo_generate", payload: { action: "churn-risk", ...input } },
      });
      if (error) throw error;
      throwIfEdgeFunctionReturnedError(data);
      return { result: data.result, input: data.input };
    },
  });
}
