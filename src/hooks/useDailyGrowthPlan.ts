import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { throwIfEdgeFunctionReturnedError } from "@/lib/supabaseFunctionErrors";

export interface DailyGrowthPlanInput {
  traffic: number;
  agents: number;
  listings: number;
  leads: number;
}

export interface DailyGrowthPlanResult {
  next_day_priority_actions: string[];
  traffic_growth_ideas: string[];
  agent_activation_ideas: string[];
}

export interface DailyGrowthPlanResponse {
  result: DailyGrowthPlanResult;
  input: DailyGrowthPlanInput;
}

export function useDailyGrowthPlan() {
  return useMutation({
    mutationFn: async (input: DailyGrowthPlanInput): Promise<DailyGrowthPlanResponse> => {
      const { data, error } = await supabase.functions.invoke("ai-engine", {
        body: { mode: "seo_generate", payload: { action: "daily-growth-plan", ...input } },
      });
      if (error) throw error;
      throwIfEdgeFunctionReturnedError(data);
      return { result: data.result, input: data.input };
    },
  });
}
