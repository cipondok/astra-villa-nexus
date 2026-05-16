import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { throwIfEdgeFunctionReturnedError } from "@/lib/supabaseFunctionErrors";

export interface SeoPlatformHealth {
  average_seo_score: number;
  high_rank_listings: number;
  low_rank_listings: number;
  common_issues: string[];
  seo_opportunity_locations: string[];
  recommended_actions: string[];
  dimension_insights: string;
  priority_focus: string;
}

export interface SeoPlatformHealthResponse {
  health: SeoPlatformHealth;
  raw_stats: {
    total_analyzed: number;
    avg_score: number;
    high_count: number;
    low_count: number;
    score_dimensions: Record<string, number>;
    locations: Record<string, { total: number; weak: number; avgScore: number }>;
  };
}

export function useSeoHealthInsights() {
  return useMutation({
    mutationFn: async (limit?: number): Promise<SeoPlatformHealthResponse> => {
      const { data, error } = await supabase.functions.invoke("ai-engine", {
        body: { mode: "seo_generate", payload: { action: "seo-platform-health", limit: limit || 200 } },
      });
      if (error) throw error;
      throwIfEdgeFunctionReturnedError(data);
      return { health: data.health, raw_stats: data.raw_stats };
    },
  });
}
