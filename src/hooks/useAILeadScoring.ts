import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { throwIfEdgeFunctionReturnedError } from "@/lib/supabaseFunctionErrors";

export interface LeadForScoring {
  id: string;
  lead_name: string;
  lead_email?: string | null;
  lead_phone?: string | null;
  lead_source: string;
  status: string;
  property_id?: string | null;
  notes?: string | null;
  last_contacted_at?: string | null;
  created_at?: string;
}

export interface ScoredLead {
  lead_id: string;
  ai_score: number;
  temperature: "hot" | "warm" | "cold";
  conversion_probability: number;
  score_breakdown?: {
    contact_completeness?: number;
    source_quality?: number;
    engagement?: number;
    behavioral?: number;
    timing?: number;
    intent?: number;
  };
  insights: string[];
  recommended_action: string;
  best_contact_time?: string;
  risk_factors?: string[];
  buyer_type?: "investor" | "end_user" | "first_time_buyer" | "upgrader" | "relocator" | "unknown";
}

export interface LeadScoringResult {
  scored_leads: ScoredLead[];
  summary: {
    total_leads: number;
    hot_count: number;
    warm_count: number;
    cold_count: number;
    avg_score: number;
    avg_conversion_probability?: number;
    top_recommendations: string[];
    pipeline_health: "excellent" | "good" | "needs_attention" | "critical";
  };
}

export function useAILeadScoring() {
  return useMutation({
    mutationFn: async (input: { leads: LeadForScoring[]; agent_id?: string }): Promise<LeadScoringResult> => {
      const { data, error } = await supabase.functions.invoke("ai-engine", {
        body: { mode: "lead_scoring", payload: input },
      });
      if (error) throw error;
      throwIfEdgeFunctionReturnedError(data);
      return data as LeadScoringResult;
    },
  });
}
