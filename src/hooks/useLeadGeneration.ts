import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface BuyerLead {
  user_id: string;
  intent_score: number;
  preferred_budget: number | null;
  buyer_type: string;
  intent_level: string;
  property_type_preference: string | null;
  investment_affinity: string | null;
  activity_30d: { views: number; saves: number; inquiries: number };
  last_active_at: string | null;
}

export interface LeadGenerationResult {
  city: string;
  buyer_leads: BuyerLead[];
  total_high_intent: number;
  total_scanned: number;
  avg_intent_score: number;
  budget_range: { min: number; max: number; avg: number } | null;
  matched_agents: Array<{ agent_id: string; name: string; city: string }>;
  generated_at: string;
}

export function useLeadGeneration() {
  return useMutation({
    mutationFn: async (city: string): Promise<LeadGenerationResult> => {
      const { data, error } = await supabase.functions.invoke('core-engine', {
        body: { mode: 'lead_generation', city },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data?.data as LeadGenerationResult;
    },
    onSuccess: (data) => {
      toast.success(`Found ${data.total_high_intent} high-intent leads in ${data.city}`);
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Lead generation failed');
    },
  });
}
