import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/** Generic placeholder shown when no logo is configured in Branding Settings */
export const LOGO_PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 48' fill='none'%3E%3Crect width='120' height='48' rx='8' fill='%23e2e8f0'/%3E%3Ctext x='60' y='30' text-anchor='middle' font-family='sans-serif' font-size='14' font-weight='600' fill='%2394a3b8'%3ELOGO%3C/text%3E%3C/svg%3E";

// All known branding keys — fetched in a single batch query
const BRANDING_KEYS = [
  'headerLogo',
  'footerLogo',
  'welcomeScreenLogo',
  'loadingPageLogo',
  'pwaLogo',
  'chatbotLogo',
  'defaultPropertyImage',
  'emailLogoUrl',
  'mobileAppIcon',
  'faviconUrl',
] as const;

type LogoKey = (typeof BRANDING_KEYS)[number] | string;

/**
 * Single batch query that fetches ALL branding settings at once.
 * Every useBrandingLogo / useChatbotLogo / useDefaultPropertyImage call shares this cache.
 */
export const useAllBrandingLogos = () => {
  return useQuery({
    queryKey: ["branding-logos-all"],
    queryFn: async () => {
      const { data } = await supabase
        .from("system_settings")
        .select("key, value, category")
        .in("category", ["general", "branding"])
        .in("key", BRANDING_KEYS as unknown as string[]);

      const logoMap: Record<string, string> = {};
      if (data) {
        // "general" category takes priority (where BrandingSettings saves)
        // Process branding first, then general overwrites
        const branding = data.filter((d) => d.category === "branding");
        const general = data.filter((d) => d.category === "general");

        for (const row of branding) {
          if (row.value && typeof row.value === "string" && row.value.trim()) {
            logoMap[row.key] = row.value;
          }
        }
        for (const row of general) {
          if (row.value && typeof row.value === "string" && row.value.trim()) {
            logoMap[row.key] = row.value;
          }
        }
      }
      return logoMap;
    },
    staleTime: 30 * 60 * 1000, // 30 min
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

/**
 * Fetches a branding logo from system_settings.
 * Uses a shared batch query — no extra network requests per logo key.
 */
export const useBrandingLogo = (logoKey: LogoKey, fallbackUrl: string = LOGO_PLACEHOLDER) => {
  const { data: allLogos, isLoading } = useAllBrandingLogos();

  const logoUrl = allLogos?.[logoKey] || null;

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
  const { data: allLogos, isLoading } = useAllBrandingLogos();

  const welcomeUrl = allLogos?.welcomeScreenLogo || null;
  const headerUrl = allLogos?.headerLogo || null;

  return {
    logoUrl: welcomeUrl || headerUrl || LOGO_PLACEHOLDER,
    isLoading,
    hasCustomLogo: !!welcomeUrl || !!headerUrl,
  };
};

/**
 * Fetches loading page logo with fallback hierarchy
 */
export const useLoadingPageLogo = () => {
  const { data: allLogos, isLoading } = useAllBrandingLogos();

  const loadingUrl = allLogos?.loadingPageLogo || null;
  const welcomeUrl = allLogos?.welcomeScreenLogo || null;
  const headerUrl = allLogos?.headerLogo || null;

  return {
    logoUrl: loadingUrl || welcomeUrl || headerUrl || LOGO_PLACEHOLDER,
    isLoading,
    hasCustomLogo: !!loadingUrl || !!welcomeUrl || !!headerUrl,
  };
};

export default useBrandingLogo;
