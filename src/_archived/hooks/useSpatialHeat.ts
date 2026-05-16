import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { throwIfEdgeFunctionReturnedError } from "@/lib/supabaseFunctionErrors";

export interface SpatialHeatInput {
  village: string;
  district: string;
  city: string;
  demand_score: number;
  growth_score: number;
  price_index_score: number;
}

export type HeatZoneLevel = "COOL" | "WARM" | "HOT" | "PRIME HOTSPOT";

export interface SpatialHeatResult {
  heat_score: number;
  heat_zone_level: HeatZoneLevel;
  heat_zone_summary: string;
}

export interface SpatialHeatResponse {
  result: SpatialHeatResult;
  input: SpatialHeatInput;
}

export function useSpatialHeat() {
  return useMutation({
    mutationFn: async (input: SpatialHeatInput): Promise<SpatialHeatResponse> => {
      const { data, error } = await supabase.functions.invoke("ai-engine", {
        body: { mode: "seo_generate", payload: { action: "spatial-heat", ...input } },
      });
      if (error) throw error;
      throwIfEdgeFunctionReturnedError(data);
      return { result: data.result, input: data.input };
    },
  });
}
