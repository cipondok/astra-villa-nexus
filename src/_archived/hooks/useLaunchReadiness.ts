import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { throwIfEdgeFunctionReturnedError } from "@/lib/supabaseFunctionErrors";

export interface LaunchReadinessInput {
  listings: number;
  seo_pages: number;
  ai_modules: number;
  speed_score: number;
  lead_test: string;
}

export interface LaunchReadinessResult {
  launch_readiness: "NOT READY" | "CONDITIONALLY READY" | "READY FOR SOFT LAUNCH" | "FULLY READY";
  critical_missing_items: string[];
  recommended_last_actions: string[];
}

export interface LaunchReadinessResponse {
  result: LaunchReadinessResult;
  input: LaunchReadinessInput;
}

export function useLaunchReadiness() {
  return useMutation({
    mutationFn: async (input: LaunchReadinessInput): Promise<LaunchReadinessResponse> => {
      const { data, error } = await supabase.functions.invoke("ai-engine", {
        body: { mode: "seo_generate", payload: { action: "launch-readiness", ...input } },
      });
      if (error) throw error;
      throwIfEdgeFunctionReturnedError(data);
      return { result: data.result, input: data.input };
    },
  });
}
