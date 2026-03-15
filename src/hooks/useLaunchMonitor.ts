import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { throwIfEdgeFunctionReturnedError } from "@/lib/supabaseFunctionErrors";

export interface LaunchMonitorInput {
  visitors: number;
  new_listings: number;
  agent_signups: number;
  leads: number;
}

export interface LaunchMonitorResult {
  launch_momentum: "COLD" | "SLOW" | "MODERATE" | "STRONG" | "VIRAL";
  positive_signals: string[];
  risk_alerts: string[];
  immediate_fix_suggestions: string[];
}

export interface LaunchMonitorResponse {
  result: LaunchMonitorResult;
  input: LaunchMonitorInput;
}

export function useLaunchMonitor() {
  return useMutation({
    mutationFn: async (input: LaunchMonitorInput): Promise<LaunchMonitorResponse> => {
      const { data, error } = await supabase.functions.invoke("ai-engine", {
        body: { mode: "seo_generate", payload: { action: "launch-monitor", ...input } },
      });
      if (error) throw error;
      throwIfEdgeFunctionReturnedError(data);
      return { result: data.result, input: data.input };
    },
  });
}
