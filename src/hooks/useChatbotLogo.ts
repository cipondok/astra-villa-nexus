import { useAllBrandingLogos, LOGO_PLACEHOLDER } from "@/hooks/useBrandingLogo";

export const useChatbotLogo = () => {
  const { data: allLogos, isLoading } = useAllBrandingLogos();

  const chatbotLogoUrl = allLogos?.chatbotLogo || null;

  return {
    logoUrl: chatbotLogoUrl || LOGO_PLACEHOLDER,
    isLoading,
    isCustomLogo: !!chatbotLogoUrl,
  };
};
