import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// ─── Types ───────────────────────────────────────────────────────────
export interface TrainingPair {
  id: string;
  intent_category: string;
  question: string;
  answer: string;
  variations: string[];
  is_active: boolean;
  priority: number;
  language: string;
  tags: string[];
  usage_count: number;
  last_matched_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ResponseTemplate {
  id: string;
  template_name: string;
  category: string;
  template_content: string;
  variables: string[];
  tone: string;
  language: string;
  is_active: boolean;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export interface ChatbotSetting {
  id: string;
  setting_key: string;
  setting_value: Record<string, any>;
  updated_at: string;
}

// ─── Training Pairs ─────────────────────────────────────────────────
export function useTrainingPairs() {
  return useQuery({
    queryKey: ["chatbot-training-pairs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chatbot_training_pairs")
        .select("*")
        .order("priority", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as TrainingPair[];
    },
  });
}

export function useCreateTrainingPair() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<TrainingPair>) => {
      const { data, error } = await supabase
        .from("chatbot_training_pairs")
        .insert(input as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["chatbot-training-pairs"] });
      toast.success("Training pair created");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateTrainingPair() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...update }: Partial<TrainingPair> & { id: string }) => {
      const { error } = await supabase
        .from("chatbot_training_pairs")
        .update({ ...update, updated_at: new Date().toISOString() } as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["chatbot-training-pairs"] });
      toast.success("Training pair updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteTrainingPair() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("chatbot_training_pairs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["chatbot-training-pairs"] });
      toast.success("Training pair deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ─── Response Templates ─────────────────────────────────────────────
export function useResponseTemplates() {
  return useQuery({
    queryKey: ["chatbot-response-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chatbot_response_templates")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as ResponseTemplate[];
    },
  });
}

export function useCreateResponseTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<ResponseTemplate>) => {
      const { data, error } = await supabase
        .from("chatbot_response_templates")
        .insert(input as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["chatbot-response-templates"] });
      toast.success("Template created");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateResponseTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...update }: Partial<ResponseTemplate> & { id: string }) => {
      const { error } = await supabase
        .from("chatbot_response_templates")
        .update({ ...update, updated_at: new Date().toISOString() } as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["chatbot-response-templates"] });
      toast.success("Template updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteResponseTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("chatbot_response_templates").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["chatbot-response-templates"] });
      toast.success("Template deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ─── Settings ────────────────────────────────────────────────────────
export function useChatbotSettings() {
  return useQuery({
    queryKey: ["chatbot-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chatbot_settings")
        .select("*");
      if (error) throw error;
      return (data as ChatbotSetting[]).reduce((acc, s) => {
        acc[s.setting_key] = s.setting_value;
        return acc;
      }, {} as Record<string, Record<string, any>>);
    },
  });
}

export function useUpdateChatbotSetting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: Record<string, any> }) => {
      const { error } = await supabase
        .from("chatbot_settings")
        .update({ setting_value: value as any, updated_at: new Date().toISOString() } as any)
        .eq("setting_key", key);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["chatbot-settings"] });
      toast.success("Settings saved");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ─── AI Test Playground ──────────────────────────────────────────────
export function useTestChatbotResponse() {
  return useMutation({
    mutationFn: async (testMessage: string) => {
      const { data, error } = await supabase.functions.invoke("ai-engine", {
        body: { mode: "property_chatbot", payload: { property_id: null, message: testMessage, conversation_history: [] } },
      });
      if (error) throw error;
      return data;
    },
  });
}
