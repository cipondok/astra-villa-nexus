import { useMutation, useQueryClient } from '@tanstack/react-query';
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

  const advanceDealStage = useMutation({
    mutationFn: async ({ offerId, newStage }: { offerId: string; newStage: DealStage }) => {
      const updates: Record<string, any> = {
        deal_stage: newStage,
        updated_at: new Date().toISOString(),
      };
      if (newStage === 'payment_initiated') updates.payment_initiated_at = new Date().toISOString();
      if (newStage === 'legal_verification') updates.legal_verified_at = new Date().toISOString();
      if (newStage === 'closed') updates.deal_closed_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('property_offers')
        .update(updates as any)
        .eq('id', offerId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['property-offers'] });
      toast.success(`Deal advanced to ${DEAL_STAGE_LABELS[vars.newStage]}`);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return { advanceDealStage, DEAL_STAGES, DEAL_STAGE_LABELS };
};
