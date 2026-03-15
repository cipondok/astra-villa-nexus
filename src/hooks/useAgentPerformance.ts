import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { throwIfEdgeFunctionReturnedError } from "@/lib/supabaseFunctionErrors";

export interface AgentPerformanceInput {
  listings: number;
  active_listings: number;
  leads: number;
  deals: number;
  seo_score: number;
}

export interface AgentPerformanceResult {
  agent_score: number;
  performance_level: "LOW" | "AVERAGE" | "STRONG" | "TOP AGENT";
  strengths: string[];
  improvement_areas: string[];
  productivity_tips: string[];
}

export interface AgentPerformanceResponse {
  result: AgentPerformanceResult;
  input: AgentPerformanceInput;
}

export function useAgentPerformance() {
  return useMutation({
    mutationFn: async (input: AgentPerformanceInput): Promise<AgentPerformanceResponse> => {
      const { data, error } = await supabase.functions.invoke("ai-engine", {
        body: { mode: "seo_generate", payload: { action: "agent-performance", ...input } },
      });
      if (error) throw error;
      throwIfEdgeFunctionReturnedError(data);
      return { result: data.result, input: data.input };
    },
  });
}
