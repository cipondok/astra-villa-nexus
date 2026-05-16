import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { throwIfEdgeFunctionReturnedError } from "@/lib/supabaseFunctionErrors";

export interface EmergingCityRank {
  city: string;
  score: number;
  region: string;
}

export interface GrowthCatalyst {
  city: string;
  catalyst: string;
}

export interface EmergingCitiesResult {
  emerging_city_ranking: EmergingCityRank[];
  growth_catalysts: GrowthCatalyst[];
  entry_timing_advice: string;
}

export interface EmergingCitiesResponse {
  result: EmergingCitiesResult;
  input: { city_signals: string };
}

export function useEmergingCities() {
  return useMutation({
    mutationFn: async (city_signals: string): Promise<EmergingCitiesResponse> => {
      const { data, error } = await supabase.functions.invoke("ai-engine", {
        body: { mode: "seo_generate", payload: { action: "emerging-cities", city_signals } },
      });
      if (error) throw error;
      throwIfEdgeFunctionReturnedError(data);
      return { result: data.result, input: data.input };
    },
  });
}
