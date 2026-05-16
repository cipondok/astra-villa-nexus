import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { throwIfEdgeFunctionReturnedError } from "@/lib/supabaseFunctionErrors";

export interface AgentBadgeInput {
  agent_score: number;
  deals: number;
}

export type AgentBadgeLabel =
  | "TOP CLOSER"
  | "HIGH VISIBILITY AGENT"
  | "FAST GROWING AGENT"
  | "RISING STAR"
  | "NEW AGENT"
  | "LOW ACTIVITY";

export interface AgentBadgeResponse {
  result: { badge: AgentBadgeLabel };
  input: AgentBadgeInput;
}

export function useAgentBadge() {
  return useMutation({
    mutationFn: async (input: AgentBadgeInput): Promise<AgentBadgeResponse> => {
      const { data, error } = await supabase.functions.invoke("ai-engine", {
        body: { mode: "seo_generate", payload: { action: "agent-badge", ...input } },
      });
      if (error) throw error;
      throwIfEdgeFunctionReturnedError(data);
      return { result: data.result, input: data.input };
    },
  });
}
