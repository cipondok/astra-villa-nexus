import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import astraLogoFallback from "@/assets/astra-logo.png";

export const useChatbotLogo = () => {
  const { data: chatbotLogoUrl, isLoading } = useQuery({
    queryKey: ["system-setting", "chatbotLogo"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("system_settings")
        .select("value")
        .eq("category", "general")
        .eq("key", "chatbotLogo")
        .maybeSingle();
      if (error) return null;
      return (data?.value as string) || null;
    },
    staleTime: 5_000,
    refetchOnMount: "always",
  });

  return {
    logoUrl: chatbotLogoUrl || astraLogoFallback,
    isLoading,
    isCustomLogo: !!chatbotLogoUrl,
  };
};
