import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { throwIfEdgeFunctionReturnedError } from "@/lib/supabaseFunctionErrors";

export interface VirtualStagingResult {
  staged_image_url: string;
  description: string;
  room_type: string;
  style: string;
}

async function generateStaging(
  imageUrl: string,
  roomType: string,
  style: string
): Promise<VirtualStagingResult> {
  const { data, error } = await supabase.functions.invoke("ai-engine", {
    body: {
      mode: "virtual_staging",
      payload: { image_url: imageUrl, room_type: roomType, style },
    },
  });
  if (error) throw error;
  throwIfEdgeFunctionReturnedError(data);
  return data as VirtualStagingResult;
}

export function useVirtualStaging() {
  return useMutation({
    mutationFn: ({
      imageUrl,
      roomType,
      style,
    }: {
      imageUrl: string;
      roomType: string;
      style: string;
    }) => generateStaging(imageUrl, roomType, style),
  });
}
