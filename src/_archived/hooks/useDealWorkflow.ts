import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const DEAL_STAGES = [
  'inquiry',
  'viewing_scheduled',
  'offer_submitted',
  'negotiation',
  'payment_initiated',
  'legal_verification',
  'closed',
] as const;

export type DealStage = (typeof DEAL_STAGES)[number];

export const STAGE_LABELS: Record<DealStage, string> = {
  inquiry: 'Inquiry',
  viewing_scheduled: 'Viewing Scheduled',
  offer_submitted: 'Offer Submitted',
  negotiation: 'Negotiation',
  payment_initiated: 'Payment Initiated',
  legal_verification: 'Legal Verification',
  closed: 'Closed',
};

/** Advance a deal to the next stage */
export function useAdvanceDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      deal_id: string;
      target_stage: DealStage;
      force_override?: boolean;
      notes?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('deal-state-engine', {
        body: params,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['deal-workflow'] });
      qc.invalidateQueries({ queryKey: ['deal-stalls'] });
      toast.success(`Deal moved to ${STAGE_LABELS[data.current_stage as DealStage]}`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

/** Detect stalled deals */
export function useStalledDeals(stallHours = 48) {
  return useQuery({
    queryKey: ['deal-stalls', stallHours],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('deal-state-engine', {
        body: { mode: 'stall_check', stall_hours: stallHours },
      });
      if (error) throw error;
      return data as {
        stalled_deals: number;
        deals: Array<{
          deal_id: string;
          current_stage: string;
          last_updated: string;
          stall_hours: number;
          responsible: string;
        }>;
      };
    },
    staleTime: 60_000,
    refetchInterval: 120_000,
  });
}
