import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ImageAnalysisResult {
  index: number;
  url: string;
  quality_score: number;
  resolution_quality?: string;
  lighting?: { score: number; issues: string[]; suggestions: string[] };
  composition?: { score: number; issues: string[]; suggestions: string[] };
  staging?: { score: number; is_staged: boolean; suggestions: string[] };
  room_type?: string;
  appeal_score?: number;
  issues?: string[];
  improvements?: string[];
  hero_potential?: boolean;
  tags?: string[];
  error?: string;
}

export interface ImageQualitySummary {
  total_analyzed: number;
  average_quality: number;
  hero_image_index: number;
  suggested_order: number[];
  needs_improvement: number;
}

export interface ImageQualityResult {
  images: ImageAnalysisResult[];
  summary: ImageQualitySummary;
}

async function analyzeImages(imageUrls: string[]): Promise<ImageQualityResult> {
  const { data, error } = await supabase.functions.invoke("ai-engine", {
    body: { mode: "image_quality_analyze", payload: { image_urls: imageUrls } },
  });
  if (error) throw error;
  return data.data as ImageQualityResult;
}

export function useImageQualityAnalyzer() {
  return useMutation({
    mutationFn: (imageUrls: string[]) => analyzeImages(imageUrls),
  });
}
