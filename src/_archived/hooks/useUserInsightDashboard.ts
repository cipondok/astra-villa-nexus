import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { throwIfEdgeFunctionReturnedError } from "@/lib/supabaseFunctionErrors";

export interface UserInsightDashboardInput {
  budget: string;
  city: string;
  property_type: string;
  purpose: string;
  views: number;
  saved: number;
  inquiries: number;
}

export interface UserInsightDashboardResult {
  search_behavior_stage: string;
  next_exploration_action: string;
  investment_discovery_angle: string;
  urgency_trigger: string;
  dashboard_headline: string;
}

export interface UserInsightDashboardResponse {
  result: UserInsightDashboardResult;
  input: UserInsightDashboardInput;
}

export function useUserInsightDashboard() {
  return useMutation({
    mutationFn: async (input: UserInsightDashboardInput): Promise<UserInsightDashboardResponse> => {
      const { data, error } = await supabase.functions.invoke("ai-engine", {
        body: { mode: "seo_generate", payload: { action: "user-insight-dashboard", ...input } },
      });
      if (error) throw error;
      throwIfEdgeFunctionReturnedError(data);
      return { result: data.result, input: data.input };
    },
  });
}
