import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { throwIfEdgeFunctionReturnedError } from "@/lib/supabaseFunctionErrors";

export interface LocationHeatInput {
  name: string;
  demand_score: number;
  growth_score: number;
  price_index_score: number;
}

export interface SpatialRankingInput {
  city: string;
  location_heat_list: LocationHeatInput[];
}

export interface HeatRankingItem {
  rank: number;
  location: string;
  heat_score: number;
}

export interface SpatialRankingResult {
  heat_ranking: HeatRankingItem[];
  emerging_hotspot: string;
  stable_zone: string;
}

export interface SpatialRankingResponse {
  result: SpatialRankingResult;
  input: { city: string; location_count: number };
}

export function useSpatialRanking() {
  return useMutation({
    mutationFn: async (input: SpatialRankingInput): Promise<SpatialRankingResponse> => {
      const { data, error } = await supabase.functions.invoke("ai-engine", {
        body: { mode: "seo_generate", payload: { action: "spatial-ranking", ...input } },
      });
      if (error) throw error;
      throwIfEdgeFunctionReturnedError(data);
      return { result: data.result, input: data.input };
    },
  });
}
