import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { throwIfEdgeFunctionReturnedError } from "@/lib/supabaseFunctionErrors";

export interface AgentPerformanceData {
  name: string;
  coverage_area: string;
  closing_rate: number;
  response_time: string;
  active_listings: number;
  rating: number;
}

export interface LeadDistributionInput {
  location: string;
  property_type: string;
  intent_score: number;
  agent_performance_data: AgentPerformanceData[];
}

export interface LeadDistributionResult {
  assigned_agent: string;
  assignment_confidence: number;
  assignment_reason: string;
  backup_strategy: string;
}

export interface LeadDistributionResponse {
  result: LeadDistributionResult;
  input: { location: string; property_type: string; intent_score: number; agent_count: number };
}

export function useLeadDistribution() {
  return useMutation({
    mutationFn: async (input: LeadDistributionInput): Promise<LeadDistributionResponse> => {
      const { data, error } = await supabase.functions.invoke("ai-engine", {
        body: { mode: "seo_generate", payload: { action: "lead-distribution", ...input } },
      });
      if (error) throw error;
      throwIfEdgeFunctionReturnedError(data);
      return { result: data.result, input: data.input };
    },
  });
}
