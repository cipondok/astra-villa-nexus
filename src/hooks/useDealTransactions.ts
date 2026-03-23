import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const DEAL_STATES = [
  'inquiry_submitted', 'negotiation_active', 'reservation_pending_payment',
  'deposit_secured_escrow', 'legal_due_diligence', 'final_payment_processing',
  'completed', 'cancelled', 'dispute_open',
] as const;

export type DealState = (typeof DEAL_STATES)[number];

export const DEAL_STATE_LABELS: Record<DealState, string> = {
  inquiry_submitted: 'Inquiry Submitted',
  negotiation_active: 'Negotiation Active',
  reservation_pending_payment: 'Reservation Pending',
  deposit_secured_escrow: 'Deposit Secured',
  legal_due_diligence: 'Legal Due Diligence',
  final_payment_processing: 'Final Payment',
  completed: 'Completed',
  cancelled: 'Cancelled',
  dispute_open: 'Dispute Open',
};

export const DEAL_STATE_COLORS: Record<DealState, string> = {
  inquiry_submitted: 'bg-blue-500/20 text-blue-400',
  negotiation_active: 'bg-amber-500/20 text-amber-400',
  reservation_pending_payment: 'bg-orange-500/20 text-orange-400',
  deposit_secured_escrow: 'bg-emerald-500/20 text-emerald-400',
  legal_due_diligence: 'bg-purple-500/20 text-purple-400',
  final_payment_processing: 'bg-cyan-500/20 text-cyan-400',
  completed: 'bg-green-500/20 text-green-400',
  cancelled: 'bg-red-500/20 text-red-400',
  dispute_open: 'bg-rose-500/20 text-rose-400',
};

export const useDealTransactions = (role: 'buyer' | 'seller' | 'agent' = 'buyer') => {
  const qc = useQueryClient();

  const dealsQuery = useQuery({
    queryKey: ['deal-transactions', role],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('deal-engine', {
        body: { action: 'list_deals', role },
      });
      if (error) throw error;
      return data || [];
    },
  });

  const createDeal = useMutation({
    mutationFn: async (params: {
      property_id: string;
      offer_id?: string;
      seller_user_id?: string;
      agent_id?: string;
      agreed_price?: number;
      deposit_amount?: number;
      currency?: string;
      country_origin?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('deal-engine', {
        body: { action: 'create_deal', ...params },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['deal-transactions'] });
      toast.success('Deal created successfully');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const transitionDeal = useMutation({
    mutationFn: async (params: { deal_id: string; target_state: DealState; reason?: string }) => {
      const { data, error } = await supabase.functions.invoke('deal-engine', {
        body: { action: 'transition', ...params },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['deal-transactions'] });
      toast.success(`Deal moved to ${DEAL_STATE_LABELS[data.deal_status as DealState] || data.deal_status}`);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const raiseDispute = useMutation({
    mutationFn: async (params: { deal_id: string; dispute_type?: string; description?: string; evidence_urls?: string[] }) => {
      const { data, error } = await supabase.functions.invoke('deal-engine', {
        body: { action: 'raise_dispute', ...params },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['deal-transactions'] });
      toast.success('Dispute raised — escrow frozen');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return {
    deals: dealsQuery.data || [],
    isLoading: dealsQuery.isLoading,
    createDeal,
    transitionDeal,
    raiseDispute,
  };
};
