import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ImageQueueStats {
  pending: number;
  processing: number;
  done: number;
  failed: number;
  total: number;
  angles: Record<string, { done: number; pending: number }>;
  budget: {
    daily_limit: number;
    used_today: number;
    remaining: number;
  };
  config: {
    auto_enqueue: boolean;
    min_traffic: number;
    max_per_property: number;
    cooldown_hours: number;
    last_reprioritize: string | null;
    extra_angles_min_traffic: number;
    extra_angles_min_price: number;
  };
}

export interface ImageJob {
  id: string;
  property_id: string;
  status: string;
  priority_score: number;
  retry_count: number;
  error_message: string | null;
  result_image_url: string | null;
  traffic_views: number;
  traffic_saves: number;
  traffic_inquiries: number;
  traffic_intent: string;
  angle_type: string;
  generation_stage: number;
  ai_style_profile: string;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export const ANGLE_LABELS: Record<string, { label: string; icon: string }> = {
  main_exterior_front: { label: "Front", icon: "🏠" },
  exterior_angle_side: { label: "Side", icon: "🏡" },
  aerial_drone_view: { label: "Aerial", icon: "🛸" },
  lifestyle_environment_view: { label: "Lifestyle", icon: "🌳" },
  evening_lighting_view: { label: "Evening", icon: "🌅" },
  vision_future_concept: { label: "Vision", icon: "✨" },
  vision_aerial_concept: { label: "Vision Air", icon: "🔮" },
};

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
        .select("id, property_id, status, priority_score, retry_count, error_message, result_image_url, traffic_views, traffic_saves, traffic_inquiries, traffic_intent, angle_type, generation_stage, ai_style_profile, created_at, updated_at, completed_at")
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
    mutationFn: async (params: { limit?: number; minTraffic?: number } = {}) => {
      const { data, error } = await supabase.functions.invoke("image-generation-worker", {
        body: { action: "enqueue", limit: params.limit || 100, min_traffic: params.minTraffic },
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

export function useEnqueueLandVisions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { limit?: number; minTraffic?: number } = {}) => {
      const { data, error } = await supabase.functions.invoke("image-generation-worker", {
        body: { action: "enqueue_land_visions", limit: params.limit || 50, min_traffic: params.minTraffic || 0 },
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
      qc.invalidateQueries({ queryKey: ["bulk-image-property-stats"] });
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

export function useReprioritizeJobs() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("image-generation-worker", {
        body: { action: "reprioritize" },
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

export function useUpdateImageGenConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (config: Record<string, any>) => {
      const { data, error } = await supabase.functions.invoke("image-generation-worker", {
        body: { action: "update_config", ...config },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["image-queue-stats"] });
    },
  });
}
