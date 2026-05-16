import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const DEAL_STAGES = [
  'inquiry',
  'viewing',
  'offer',
  'negotiation',
  'payment_initiated',
  'legal_verification',
  'closed',
] as const;

export type DealStage = (typeof DEAL_STAGES)[number];

export const DEAL_STAGE_LABELS: Record<DealStage, string> = {
  inquiry: 'Inquiry',
  viewing: 'Viewing',
  offer: 'Offer',
  negotiation: 'Negotiation',
  payment_initiated: 'Payment',
  legal_verification: 'Legal Verification',
  closed: 'Closed',
};

export const useDealLifecycle = () => {
  const queryClient = useQueryClient();

  // Fetch deal stage rules for UI validation
  const rulesQuery = useQuery({
    queryKey: ['deal-stage-rules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deal_stage_rules')
        .select('*')
        .eq('is_active', true);
      if (error) throw error;
      return data || [];
    },
  });

  // Advance deal stage via backend Edge Function
  const advanceDealStage = useMutation({
    mutationFn: async ({ offerId, newStage, flags }: { offerId: string; newStage: DealStage; flags?: Record<string, boolean> }) => {
      const { data, error } = await supabase.functions.invoke('advance-deal-stage', {
        body: {
          offer_id: offerId,
          new_stage: newStage,
          flags: flags || {},
        },
      });
      if (error) throw new Error(error.message || 'Failed to advance deal stage');
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['property-offers'] });
      queryClient.invalidateQueries({ queryKey: ['escrow-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transaction-commissions'] });
      toast.success(`Deal advanced to ${DEAL_STAGE_LABELS[data.deal_stage as DealStage] || data.deal_stage}`);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // Get valid transitions for a given stage
  const getValidTransitions = (currentStage: string, userRole: string) => {
    if (!rulesQuery.data) return [];
    return rulesQuery.data.filter(
      (rule: any) =>
        rule.from_stage === currentStage &&
        rule.allowed_roles?.includes(userRole)
    );
  };

  return {
    advanceDealStage,
    DEAL_STAGES,
    DEAL_STAGE_LABELS,
    rules: rulesQuery.data || [],
    getValidTransitions,
  };
};
