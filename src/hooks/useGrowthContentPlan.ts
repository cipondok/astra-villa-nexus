import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { throwIfEdgeFunctionReturnedError } from "@/lib/supabaseFunctionErrors";

export interface GrowthContentPlanInput {
  city: string;
  target_user: string;
}

export interface GrowthContentPlanResult {
  seo_content_ideas: string[];
  social_content_themes: string[];
  video_topics: string[];
  agent_outreach_strategies: string[];
  lead_magnet_ideas: string[];
}

export interface GrowthContentPlanResponse {
  result: GrowthContentPlanResult;
  input: GrowthContentPlanInput;
}

export function useGrowthContentPlan() {
  return useMutation({
    mutationFn: async (input: GrowthContentPlanInput): Promise<GrowthContentPlanResponse> => {
      const { data, error } = await supabase.functions.invoke("ai-engine", {
        body: { mode: "seo_generate", payload: { action: "growth-content-plan", ...input } },
      });
      if (error) throw error;
      throwIfEdgeFunctionReturnedError(data);
      return { result: data.result, input: data.input };
    },
  });
}
