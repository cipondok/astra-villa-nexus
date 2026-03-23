import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface WalletAccount {
  id: string;
  user_id: string;
  available_balance: number;
  locked_balance: number;
  currency: string;
  wallet_status: string;
  created_at: string;
  updated_at: string;
}

export interface WalletTransaction {
  id: string;
  wallet_id: string;
  user_id: string;
  transaction_type: string;
  amount: number;
  currency: string;
  external_payment_ref: string | null;
  status: string;
  description: string | null;
  metadata: Record<string, any>;
  created_at: string;
}

async function invokeWallet(action: string, params: Record<string, any> = {}) {
  const { data, error } = await supabase.functions.invoke('wallet-topup', {
    body: { action, ...params },
  });
  if (error) throw new Error(error.message || 'Wallet operation failed');
  if (data?.error) throw new Error(data.error);
  return data;
}

export function useWallet() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['wallet', user?.id],
    queryFn: async (): Promise<WalletAccount | null> => {
      if (!user?.id) return null;
      const result = await invokeWallet('get_wallet');
      return result.wallet as WalletAccount;
    },
    enabled: !!user?.id,
    staleTime: 10_000,
    refetchOnMount: true,
  });
}

export function useWalletTransactions(limit = 20) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['wallet-transactions', user?.id, limit],
    queryFn: async () => {
      if (!user?.id) return { transactions: [], total: 0 };
      const result = await invokeWallet('get_transactions', { limit });
      return {
        transactions: result.transactions as WalletTransaction[],
        total: result.total as number,
      };
    },
    enabled: !!user?.id,
    staleTime: 15_000,
  });
}

export function useCreateTopup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { amount: number; currency?: string; payment_type?: string }) => {
      return await invokeWallet('create_topup', params);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['wallet-transactions'] });
      
      // Open Midtrans Snap if token available
      if (data.redirect_url) {
        window.open(data.redirect_url, '_blank');
      }
      toast.success(`Payment session created. Order: ${data.order_id}`);
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useLockEscrow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { amount: number; deal_id?: string; property_id?: string }) => {
      return await invokeWallet('lock_escrow', params);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['wallet-transactions'] });
      toast.success('Funds locked in escrow');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useRequestPayout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { amount: number; payout_method: string; payout_details?: Record<string, any> }) => {
      return await invokeWallet('request_payout', params);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['wallet-transactions'] });
      toast.success('Payout request submitted');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}
