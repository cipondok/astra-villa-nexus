import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useEscrowTransactions = (offerId?: string) => {
  const queryClient = useQueryClient();

  const escrowQuery = useQuery({
    queryKey: ['escrow-transactions', offerId],
    queryFn: async () => {
      let query = supabase.from('escrow_transactions').select('*').order('created_at', { ascending: false });
      if (offerId) query = query.eq('offer_id', offerId);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!offerId || true,
  });

  const initiateEscrow = useMutation({
    mutationFn: async (escrow: { offer_id: string; property_id: string; buyer_id: string; seller_id?: string; agent_id?: string; escrow_amount: number }) => {
      const { data, error } = await supabase.from('escrow_transactions').insert(escrow as any).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['escrow-transactions'] });
      toast.success('Escrow initiated');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return { escrow: escrowQuery.data || [], isLoading: escrowQuery.isLoading, initiateEscrow };
};
