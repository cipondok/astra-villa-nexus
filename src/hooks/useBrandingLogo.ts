import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import astraLogoFallback from "@/assets/astra-logo.svg";

/**
 * Fetches a branding logo from system_settings
 * Checks both "general" and "branding" categories for compatibility
 */
export const useBrandingLogo = (logoKey: string, fallbackUrl: string = astraLogoFallback) => {
  const { data: logoUrl, isLoading } = useQuery({
    queryKey: ["branding-logo", logoKey],
    queryFn: async () => {
      // Try "general" category first (where BrandingSettings saves)
      const { data: generalData } = await supabase
        .from("system_settings")
        .select("value")
        .eq("category", "general")
        .eq("key", logoKey)
        .maybeSingle();
      
      if (generalData?.value && typeof generalData.value === 'string' && generalData.value.trim() !== '') {
        return generalData.value;
      }

      // Fallback to "branding" category
      const { data: brandingData } = await supabase
        .from("system_settings")
        .select("value")
        .eq("category", "branding")
        .eq("key", logoKey)
        .maybeSingle();
      
      if (brandingData?.value && typeof brandingData.value === 'string' && brandingData.value.trim() !== '') {
        return brandingData.value;
      }

      return null;
    },
    staleTime: 30 * 60 * 1000,  // 30 min - logo almost never changes
    gcTime: 60 * 60 * 1000,      // 1 hour in memory
    refetchOnWindowFocus: false,
  });

  return {
    logoUrl: logoUrl || fallbackUrl,
    isLoading,
    hasCustomLogo: !!logoUrl,
  };
};

/**
 * Fetches header logo with fallback hierarchy
 */
export const useHeaderLogo = () => {
  return useBrandingLogo('headerLogo');
};

/**
 * Fetches welcome screen logo with fallback to headerLogo
 */
export const useWelcomeScreenLogo = () => {
  const welcomeLogo = useBrandingLogo('welcomeScreenLogo');
  const headerLogo = useBrandingLogo('headerLogo');
  
  return {
    logoUrl: welcomeLogo.hasCustomLogo ? welcomeLogo.logoUrl : headerLogo.logoUrl,
    isLoading: welcomeLogo.isLoading || headerLogo.isLoading,
    hasCustomLogo: welcomeLogo.hasCustomLogo || headerLogo.hasCustomLogo,
  };
};

/**
 * Fetches loading page logo with fallback hierarchy
 */
export const useLoadingPageLogo = () => {
  const loadingLogo = useBrandingLogo('loadingPageLogo');
  const welcomeLogo = useBrandingLogo('welcomeScreenLogo');
  const headerLogo = useBrandingLogo('headerLogo');
  
  return {
    logoUrl: loadingLogo.hasCustomLogo 
      ? loadingLogo.logoUrl 
      : welcomeLogo.hasCustomLogo 
        ? welcomeLogo.logoUrl 
        : headerLogo.logoUrl,
    isLoading: loadingLogo.isLoading || welcomeLogo.isLoading || headerLogo.isLoading,
    hasCustomLogo: loadingLogo.hasCustomLogo || welcomeLogo.hasCustomLogo || headerLogo.hasCustomLogo,
  };
};

export default useBrandingLogo;
