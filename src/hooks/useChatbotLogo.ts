import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import astraLogoFallback from "@/assets/astra-logo.png";

export const useChatbotLogo = () => {
  const { data: chatbotLogoUrl, isLoading } = useQuery({
    queryKey: ["system-setting", "chatbotLogo"],
    queryFn: async () => {
      // Try "general" category first (where BrandingSettings saves)
      const { data: generalData } = await supabase
        .from("system_settings")
        .select("value")
        .eq("category", "general")
        .eq("key", "chatbotLogo")
        .maybeSingle();
      
      if (generalData?.value && typeof generalData.value === 'string' && generalData.value.trim() !== '') {
        return generalData.value;
      }

      // Fallback to "branding" category for consistency
      const { data: brandingData } = await supabase
        .from("system_settings")
        .select("value")
        .eq("category", "branding")
        .eq("key", "chatbotLogo")
        .maybeSingle();
      
      if (brandingData?.value && typeof brandingData.value === 'string' && brandingData.value.trim() !== '') {
        return brandingData.value;
      }

      return null;
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  return {
    logoUrl: chatbotLogoUrl || astraLogoFallback,
    isLoading,
    isCustomLogo: !!chatbotLogoUrl,
  };
};
