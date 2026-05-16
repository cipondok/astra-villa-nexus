import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { throwIfEdgeFunctionReturnedError } from "@/lib/supabaseFunctionErrors";

export interface DealHealthInput {
  avg_deal_score: number;
  active_listings: number;
  leads: number;
}

export interface DealHealthResult {
  deal_health_stage: "THRIVING" | "HEALTHY" | "UNDERPERFORMING" | "CRITICAL";
  conversion_bottleneck: string;
  platform_action_recommendation: string;
}

export interface DealHealthResponse {
  result: DealHealthResult;
  input: DealHealthInput & { lead_to_listing_ratio: number };
}

export function useDealHealth() {
  return useMutation({
    mutationFn: async (input: DealHealthInput): Promise<DealHealthResponse> => {
      const { data, error } = await supabase.functions.invoke("ai-engine", {
        body: { mode: "seo_generate", payload: { action: "deal-health", ...input } },
      });
      if (error) throw error;
      throwIfEdgeFunctionReturnedError(data);
      return { result: data.result, input: data.input };
    },
  });
}
