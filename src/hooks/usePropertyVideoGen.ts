import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { throwIfEdgeFunctionReturnedError } from "@/lib/supabaseFunctionErrors";

export interface VideoSegment {
  url: string;
  thumbnail: string;
}

export interface VideoOverlay {
  type: string;
  text: string;
  position: string;
  timing: string;
}

export interface VideoGenResult {
  segments: VideoSegment[];
  overlays: VideoOverlay[];
  theme: string;
  music_style: string;
  total_images: number;
  processed_segments: number;
  status: string;
  message: string;
}

export interface VideoGenParams {
  images: string[];
  theme: string;
  property_info: {
    title?: string;
    price?: string;
    location?: string;
    opportunity_score?: number;
    selling_points?: string[];
  };
  music_style?: string;
}

async function generateVideo(params: VideoGenParams): Promise<VideoGenResult> {
  const { data, error } = await supabase.functions.invoke("property-video-gen", {
    body: params,
  });
  if (error) throw error;
  throwIfEdgeFunctionReturnedError(data);
  return data as VideoGenResult;
}

export function usePropertyVideoGen() {
  return useMutation({ mutationFn: generateVideo });
}
