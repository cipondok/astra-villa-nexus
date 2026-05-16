import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { throwIfEdgeFunctionReturnedError } from "@/lib/supabaseFunctionErrors";

export interface DiscoveryThemesInput {
  budget: string;
  city: string;
  purpose: string;
}

export interface DiscoveryThemesResult {
  discovery_themes: string[];
  emotional_angles: string[];
  urgency_triggers: string[];
}

export interface DiscoveryThemesResponse {
  result: DiscoveryThemesResult;
  input: DiscoveryThemesInput;
}

export function useDiscoveryThemes() {
  return useMutation({
    mutationFn: async (input: DiscoveryThemesInput): Promise<DiscoveryThemesResponse> => {
      const { data, error } = await supabase.functions.invoke("ai-engine", {
        body: { mode: "seo_generate", payload: { action: "discovery-themes", ...input } },
      });
      if (error) throw error;
      throwIfEdgeFunctionReturnedError(data);
      return { result: data.result, input: data.input };
    },
  });
}
