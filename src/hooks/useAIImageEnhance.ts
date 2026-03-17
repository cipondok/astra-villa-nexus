import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { throwIfEdgeFunctionReturnedError } from "@/lib/supabaseFunctionErrors";

export interface EnhanceResult {
  enhanced_image_url: string;
  mode: string;
  enhancement_type: string;
  description: string;
}

type EnhanceParams = {
  image_url: string;
  mode: "enhance" | "virtual_staging" | "sky_replacement" | "declutter";
  enhancement_type?: string;
  staging_style?: string;
  room_type?: string;
};

async function enhanceImage(params: EnhanceParams): Promise<EnhanceResult> {
  const { data, error } = await supabase.functions.invoke("ai-image-enhance", {
    body: params,
  });
  if (error) throw error;
  throwIfEdgeFunctionReturnedError(data);
  return data as EnhanceResult;
}

export function useAIImageEnhance() {
  return useMutation({ mutationFn: enhanceImage });
}
