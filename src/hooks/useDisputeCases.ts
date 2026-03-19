import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useDisputeCases = () => {
  const queryClient = useQueryClient();

  const disputesQuery = useQuery({
    queryKey: ['dispute-cases'],
    queryFn: async () => {
      const { data, error } = await supabase.from('dispute_cases').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const createDispute = useMutation({
    mutationFn: async (dispute: { complainant_id: string; subject: string; description?: string; dispute_type?: string; related_offer_id?: string; related_property_id?: string }) => {
      const { data, error } = await supabase.from('dispute_cases').insert(dispute as any).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dispute-cases'] });
      toast.success('Dispute case created');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return { disputes: disputesQuery.data || [], isLoading: disputesQuery.isLoading, createDispute };
};
