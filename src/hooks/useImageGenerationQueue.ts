import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ImageQueueStats {
  pending: number;
  processing: number;
  done: number;
  failed: number;
  total: number;
}

export interface ImageJob {
  id: string;
  property_id: string;
  status: string;
  priority_score: number;
  retry_count: number;
  error_message: string | null;
  result_image_url: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export function useImageQueueStats() {
  return useQuery({
    queryKey: ["image-queue-stats"],
    queryFn: async (): Promise<ImageQueueStats> => {
      const { data, error } = await supabase.functions.invoke("image-generation-worker", {
        body: { action: "stats" },
      });
      if (error) throw error;
      return data as ImageQueueStats;
    },
    refetchInterval: 5000,
  });
}

export function useRecentImageJobs(limit = 20) {
  return useQuery({
    queryKey: ["image-jobs-recent", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_image_jobs" as any)
        .select("id, property_id, status, priority_score, retry_count, error_message, result_image_url, created_at, updated_at, completed_at")
        .order("updated_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data || []) as unknown as ImageJob[];
    },
    refetchInterval: 5000,
  });
}

export function useEnqueueImages() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (limit: number = 100) => {
      const { data, error } = await supabase.functions.invoke("image-generation-worker", {
        body: { action: "enqueue", limit },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["image-queue-stats"] });
      qc.invalidateQueries({ queryKey: ["image-jobs-recent"] });
    },
  });
}

export function useProcessImages() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (concurrency: number = 3) => {
      const { data, error } = await supabase.functions.invoke("image-generation-worker", {
        body: { action: "process", concurrency },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["image-queue-stats"] });
      qc.invalidateQueries({ queryKey: ["image-jobs-recent"] });
      qc.invalidateQueries({ queryKey: ["bulk-image-stats"] });
    },
  });
}

export function useRetryFailedImages() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("image-generation-worker", {
        body: { action: "retry_failed" },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["image-queue-stats"] });
      qc.invalidateQueries({ queryKey: ["image-jobs-recent"] });
    },
  });
}
