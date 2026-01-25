import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const FALLBACK_IMAGE = "/placeholder.svg";

export const useDefaultPropertyImage = () => {
  const { data: defaultImageUrl, isLoading } = useQuery({
    queryKey: ["system-setting", "defaultPropertyImage"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("system_settings")
        .select("value")
        .eq("category", "general")
        .eq("key", "defaultPropertyImage")
        .maybeSingle();
      if (error) return null;
      return (data?.value as string) || null;
    },
    staleTime: 60_000, // Cache for 1 minute
    refetchOnMount: false,
  });

  const getPropertyImage = (
    images?: string[] | null,
    thumbnailUrl?: string | null,
    imageUrls?: string[] | null
  ): string => {
    // Priority: images array -> image_urls array -> thumbnail_url -> branding default -> placeholder
    if (images && images.length > 0) return images[0];
    if (imageUrls && imageUrls.length > 0) return imageUrls[0];
    if (thumbnailUrl) return thumbnailUrl;
    return defaultImageUrl || FALLBACK_IMAGE;
  };

  return {
    defaultImage: defaultImageUrl || FALLBACK_IMAGE,
    isLoading,
    hasCustomDefault: !!defaultImageUrl,
    getPropertyImage,
  };
};
