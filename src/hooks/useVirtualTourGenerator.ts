import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { throwIfEdgeFunctionReturnedError } from "@/lib/supabaseFunctionErrors";

export interface TourImage {
  url: string;
  label?: string;
}

export interface TourHotspot {
  label: string;
  description: string;
  x_percent: number;
  y_percent: number;
  category: "feature" | "material" | "amenity" | "view" | "dimension";
}

export interface TourStop {
  image_index: number;
  room_type: string;
  room_name: string;
  narration: string;
  hotspots: TourHotspot[];
  key_features: string[];
  mood: string;
  transition_text?: string;
}

export interface VirtualTourResult {
  tour_title: string;
  tour_introduction: string;
  estimated_duration_minutes: number;
  stops: TourStop[];
  tour_conclusion: string;
  property_highlights: string[];
  suggested_flow: number[];
  images: TourImage[];
}

export function useVirtualTourGenerator() {
  return useMutation({
    mutationFn: async (params: {
      images: TourImage[];
      property_title?: string;
      property_type?: string;
      location?: string;
    }): Promise<VirtualTourResult> => {
      const { data, error } = await supabase.functions.invoke("ai-engine", {
        body: { mode: "virtual_tour_generate", payload: params },
      });
      if (error) throw error;
      throwIfEdgeFunctionReturnedError(data);
      return data as VirtualTourResult;
    },
  });
}
