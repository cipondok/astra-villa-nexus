import { useAllBrandingLogos } from "@/hooks/useBrandingLogo";

const FALLBACK_IMAGE = "/placeholder.svg";

export const useDefaultPropertyImage = () => {
  const { data: allLogos, isLoading } = useAllBrandingLogos();

  const defaultImageUrl = allLogos?.defaultPropertyImage || null;

  const getPropertyImage = (
    images?: string[] | null,
    thumbnailUrl?: string | null,
    imageUrls?: string[] | null
  ): string => {
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
