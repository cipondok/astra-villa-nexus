import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PipelineCandidate {
  city: string;
  province: string;
  demand_score: number | null;
  avg_yield: number | null;
  property_count: number | null;
}

export interface PipelinePreview {
  total_hotspots: number;
  already_generated: number;
  candidates: number;
  cities: PipelineCandidate[];
}

export interface PipelineResult {
  city: string;
  status?: string;
  slug?: string;
  error?: string;
}

export interface BatchResult {
  generated: number;
  total_attempted: number;
  results: PipelineResult[];
}

export interface ContentStatus {
  total_generated: number;
  total_published: number;
  recent: Array<{
    id: string;
    title: string;
    slug: string;
    status: string;
    seo_score: number | null;
    organic_traffic: number | null;
    created_at: string;
    primary_keyword: string;
  }>;
}

export function useSeoContentPipelinePreview() {
  return useQuery({
    queryKey: ["seo-content-pipeline-preview"],
    queryFn: async (): Promise<PipelinePreview> => {
      const { data, error } = await supabase.functions.invoke("seo-content-pipeline", {
        body: { action: "preview" },
      });
      if (error) throw error;
      return data as PipelinePreview;
    },
    staleTime: 60_000,
  });
}

export function useSeoContentPipelineStatus() {
  return useQuery({
    queryKey: ["seo-content-pipeline-status"],
    queryFn: async (): Promise<ContentStatus> => {
      const { data, error } = await supabase.functions.invoke("seo-content-pipeline", {
        body: { action: "status" },
      });
      if (error) throw error;
      return data as ContentStatus;
    },
    staleTime: 30_000,
  });
}

export function useSeoContentPipelineGenerate() {
  return useMutation({
    mutationFn: async (limit: number = 5): Promise<BatchResult> => {
      const { data, error } = await supabase.functions.invoke("seo-content-pipeline", {
        body: { action: "generate_batch", limit },
      });
      if (error) throw error;
      return data as BatchResult;
    },
  });
}
