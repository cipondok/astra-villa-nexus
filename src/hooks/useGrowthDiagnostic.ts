import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { throwIfEdgeFunctionReturnedError } from "@/lib/supabaseFunctionErrors";

export interface GrowthDiagnosticInput {
  traffic: number;
  listings: number;
  agents: number;
  leads: number;
}

export interface GrowthDiagnosticResult {
  growth_stage: string;
  priority_action: string;
  traffic_strategy: string;
  revenue_readiness: string;
}

export interface GrowthDiagnosticResponse {
  result: GrowthDiagnosticResult;
  input: GrowthDiagnosticInput;
}

export function useGrowthDiagnostic() {
  return useMutation({
    mutationFn: async (input: GrowthDiagnosticInput): Promise<GrowthDiagnosticResponse> => {
      const { data, error } = await supabase.functions.invoke("ai-engine", {
        body: { mode: "seo_generate", payload: { action: "growth-diagnostic", ...input } },
      });
      if (error) throw error;
      throwIfEdgeFunctionReturnedError(data);
      return { result: data.result, input: data.input };
    },
  });
}
