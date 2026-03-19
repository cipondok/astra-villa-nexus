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
  });

  // Initiate escrow via backend Edge Function (with validation + listing lock)
  const initiateEscrow = useMutation({
    mutationFn: async (params: {
      offer_id: string;
      payment_gateway?: string;
      payment_method?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('initiate-escrow', {
        body: params,
      });
      if (error) throw new Error(error.message || 'Failed to initiate escrow');
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['escrow-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['property-offers'] });
      toast.success(`Escrow initiated. Reference: ${data.payment_reference}`);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return { escrow: escrowQuery.data || [], isLoading: escrowQuery.isLoading, initiateEscrow };
};
