import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function useInvestmentPositions() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['investment-positions', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('investment_positions' as any)
        .select('*')
        .eq('investor_user_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user?.id,
  });
}

export function useExitListings(onlyPublic = true) {
  return useQuery({
    queryKey: ['exit-listings', onlyPublic],
    queryFn: async () => {
      let q = supabase
        .from('exit_listings' as any)
        .select('*')
        .eq('listing_status', 'active')
        .order('created_at', { ascending: false });
      if (onlyPublic) q = q.eq('listing_visibility', 'public');
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useCreateExitListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      position_id: string;
      property_id: string;
      asking_price_idr: number;
      ownership_percentage: number;
      min_acceptable_price_idr?: number;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Update position status
      await supabase
        .from('investment_positions' as any)
        .update({ position_status: 'listed_for_exit' })
        .eq('id', params.position_id);

      const { data, error } = await supabase
        .from('exit_listings' as any)
        .insert({
          position_id: params.position_id,
          seller_user_id: user.id,
          property_id: params.property_id,
          asking_price_idr: params.asking_price_idr,
          ownership_percentage: params.ownership_percentage,
          min_acceptable_price_idr: params.min_acceptable_price_idr,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['investment-positions'] });
      qc.invalidateQueries({ queryKey: ['exit-listings'] });
      toast.success('Exit listing created successfully');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useAcquirePosition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      exit_listing_id: string;
      position_id: string;
      property_id: string;
      transfer_amount_idr: number;
      ownership_percentage: number;
      seller_user_id: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('liquidity_transfer_ledger' as any)
        .insert({
          exit_listing_id: params.exit_listing_id,
          position_id: params.position_id,
          property_id: params.property_id,
          seller_user_id: params.seller_user_id,
          buyer_user_id: user.id,
          transfer_amount_idr: params.transfer_amount_idr,
          ownership_percentage: params.ownership_percentage,
          escrow_status: 'pending',
          platform_fee_idr: params.transfer_amount_idr * 0.02, // 2% platform fee
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['exit-listings'] });
      qc.invalidateQueries({ queryKey: ['investment-positions'] });
      toast.success('Acquisition initiated — escrow pending');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useLiquidityTransfers() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['liquidity-transfers', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('liquidity_transfer_ledger' as any)
        .select('*')
        .or(`seller_user_id.eq.${user!.id},buyer_user_id.eq.${user!.id}`)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user?.id,
  });
}

export function useSecondaryMarketMetrics() {
  return useQuery({
    queryKey: ['secondary-market-metrics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('secondary_market_metrics' as any)
        .select('*')
        .order('period_date', { ascending: false })
        .limit(30);
      if (error) throw error;
      return data ?? [];
    },
  });
}
