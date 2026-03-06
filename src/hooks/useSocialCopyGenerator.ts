import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { throwIfEdgeFunctionReturnedError } from "@/lib/supabaseFunctionErrors";

export interface SocialCopyRequest {
  platform: "instagram" | "tiktok" | "facebook" | "twitter" | "linkedin";
  property_title: string;
  property_type: string;
  location: string;
  price: number;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  key_features?: string[];
  tone: "professional" | "casual" | "luxury" | "urgent" | "storytelling";
  language: "id" | "en" | "bilingual";
  include_hashtags?: boolean;
  include_cta?: boolean;
  target_audience?: string;
}

export interface SocialCopyVariant {
  caption: string;
  hashtags: string[];
  cta: string;
  hook_line: string;
  estimated_engagement: "low" | "medium" | "high";
  best_posting_time: string;
  content_tips: string[];
}

export interface SocialCopyResult {
  platform: string;
  variants: SocialCopyVariant[];
  carousel_ideas?: string[];
  video_script?: string;
  story_sequence?: string[];
  seo_keywords: string[];
  competitor_differentiation: string;
}

export function useSocialCopyGenerator() {
  return useMutation({
    mutationFn: async (input: SocialCopyRequest): Promise<SocialCopyResult> => {
      const { data, error } = await supabase.functions.invoke("ai-engine", {
        body: { mode: "social_media_copy", payload: input },
      });
      if (error) throw error;
      throwIfEdgeFunctionReturnedError(data);
      return data as SocialCopyResult;
    },
  });
}
