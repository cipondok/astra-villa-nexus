import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { throwIfEdgeFunctionReturnedError } from "@/lib/supabaseFunctionErrors";

export interface WeeklyGrowthPlanInput {
  traffic: number;
  listings: number;
  agents: number;
  leads: number;
}

export interface WeeklyGrowthPlanResult {
  weekly_focus: string;
  daily_growth_actions: string[];
  traffic_boost_tactics: string[];
  agent_onboarding_actions: string[];
}

export interface WeeklyGrowthPlanResponse {
  result: WeeklyGrowthPlanResult;
  input: WeeklyGrowthPlanInput;
}

export function useWeeklyGrowthPlan() {
  return useMutation({
    mutationFn: async (input: WeeklyGrowthPlanInput): Promise<WeeklyGrowthPlanResponse> => {
      const { data, error } = await supabase.functions.invoke("ai-engine", {
        body: { mode: "seo_generate", payload: { action: "weekly-growth-plan", ...input } },
      });
      if (error) throw error;
      throwIfEdgeFunctionReturnedError(data);
      return { result: data.result, input: data.input };
    },
  });
}
