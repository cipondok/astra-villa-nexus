import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAlert } from '@/contexts/AlertContext';
import { useAuth } from '@/contexts/AuthContext';

interface TokenBalance {
  total_tokens: number;
  available_tokens: number;
  locked_tokens: number;
  lifetime_earned: number;
}

interface CheckinStatus {
  hasCheckedInToday: boolean;
  currentStreak: number;
  todayCheckin?: {
    tokens_earned: number;
    bonus_multiplier: number;
  };
}

interface TokenTransaction {
  id: string;
  transaction_type: string;
  amount: number;
  description: string;
  created_at: string;
  status: string;
  reference_type?: string;
}

export const useAstraToken = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  // Fetch token balance
  const {
    data: balance,
    isLoading: loadingBalance,
    refetch: refetchBalance
  } = useQuery({
    queryKey: ['astra-balance', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data } = await supabase.functions.invoke('astra-token-hub', {
        body: { action: 'get_balance', userId: user.id }
      });
      
      return data?.balance as TokenBalance;
    },
    enabled: !!user?.id,
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Fetch checkin status
  const {
    data: checkinStatus,
    isLoading: loadingCheckin,
    refetch: refetchCheckin
  } = useQuery({
    queryKey: ['astra-checkin-status', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data } = await supabase.functions.invoke('astra-token-hub', {
        body: { action: 'get_checkin_status', userId: user.id }
      });
      
      return data as CheckinStatus;
    },
    enabled: !!user?.id,
    refetchInterval: 60000 // Refresh every minute
  });

  // Fetch transactions
  const {
    data: transactions,
    isLoading: loadingTransactions,
    refetch: refetchTransactions
  } = useQuery({
    queryKey: ['astra-transactions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data } = await supabase.functions.invoke('astra-token-hub', {
        body: { action: 'get_transactions', userId: user.id }
      });
      
      return data?.transactions as TokenTransaction[];
    },
    enabled: !!user?.id
  });

  // Fetch transfers
  const {
    data: transfers,
    isLoading: loadingTransfers,
    refetch: refetchTransfers
  } = useQuery({
    queryKey: ['astra-transfers', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data } = await supabase.functions.invoke('astra-token-hub', {
        body: { action: 'get_transfers', userId: user.id }
      });
      
      return data?.transfers || [];
    },
    enabled: !!user?.id
  });

  // Daily checkin mutation
  const checkinMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase.functions.invoke('astra-token-hub', {
        body: { action: 'daily_checkin', userId: user.id }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['astra-balance'] });
      queryClient.invalidateQueries({ queryKey: ['astra-checkin-status'] });
      queryClient.invalidateQueries({ queryKey: ['astra-transactions'] });
      
      if (data.success) {
        showSuccess('Daily Check-in Complete!', data.message);
      } else {
        showError('Check-in Failed', data.message);
      }
    },
    onError: (error) => {
      showError('Error', `Failed to check in: ${error.message}`);
    }
  });

  // Transaction bonus function
  const triggerTransactionBonus = async (amount: number, transactionType = 'purchase', description?: string) => {
    if (!user?.id) return null;
    
    try {
      const { data } = await supabase.functions.invoke('astra-token-hub', {
        body: { 
          action: 'transaction_reward', 
          userId: user.id, 
          amount,
          referenceType: transactionType,
          description: description || `Transaction bonus for ${transactionType}`
        }
      });
      
      if (data?.success) {
        showSuccess('Transaction Bonus!', `Earned ${data.tokensAwarded} ASTRA tokens!`);
        queryClient.invalidateQueries({ queryKey: ['astra-balance'] });
        queryClient.invalidateQueries({ queryKey: ['astra-transactions'] });
        return data.tokensAwarded;
      }
    } catch (error) {
      console.error('Transaction bonus error:', error);
    }
    return 0;
  };

  // Award tokens function (admin use)
  const awardTokens = async (amount: number, transactionType: string, description?: string) => {
    if (!user?.id) return null;
    
    try {
      const { data } = await supabase.functions.invoke('astra-token-hub', {
        body: { 
          action: 'award_tokens', 
          userId: user.id, 
          amount,
          transactionType,
          description: description || `Tokens awarded: ${transactionType}`
        }
      });
      
      if (data?.success) {
        showSuccess('Tokens Awarded!', `Received ${amount} ASTRA tokens!`);
        queryClient.invalidateQueries({ queryKey: ['astra-balance'] });
        queryClient.invalidateQueries({ queryKey: ['astra-transactions'] });
        return amount;
      }
    } catch (error) {
      console.error('Award tokens error:', error);
    }
    return 0;
  };

  // Welcome bonus function
  const claimWelcomeBonus = async () => {
    if (!user?.id) return null;
    
    try {
      const { data } = await supabase.functions.invoke('astra-token-hub', {
        body: { action: 'welcome_bonus', userId: user.id }
      });
      
      if (data?.success) {
        showSuccess('Welcome Bonus Claimed!', data.message);
        queryClient.invalidateQueries({ queryKey: ['astra-balance'] });
        queryClient.invalidateQueries({ queryKey: ['astra-transactions'] });
        return true;
      } else {
        showError('Bonus Already Claimed', data.message);
        return false;
      }
    } catch (error) {
      console.error('Welcome bonus error:', error);
      showError('Error', `Failed to claim welcome bonus: ${error.message}`);
      return false;
    }
  };

  // Transfer tokens function
  const transferTokens = async (recipientId: string, amount: number, message?: string) => {
    if (!user?.id) return null;
    
    try {
      const { data } = await supabase.functions.invoke('astra-token-hub', {
        body: { 
          action: 'transfer_tokens', 
          userId: user.id, 
          recipientId,
          amount,
          message
        }
      });
      
      if (data?.success) {
        showSuccess('Transfer Successful!', data.message);
        queryClient.invalidateQueries({ queryKey: ['astra-balance'] });
        queryClient.invalidateQueries({ queryKey: ['astra-transactions'] });
        queryClient.invalidateQueries({ queryKey: ['astra-transfers'] });
        return data;
      } else {
        showError('Transfer Failed', data.message);
        return null;
      }
    } catch (error) {
      console.error('Transfer error:', error);
      showError('Error', `Failed to transfer tokens: ${error.message}`);
      return null;
    }
  };

  // Format token amount
  const formatTokenAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return {
    // Data
    balance,
    checkinStatus,
    transactions,
    transfers,
    
    // Loading states
    loadingBalance,
    loadingCheckin,
    loadingTransactions,
    loadingTransfers,
    
    // Actions
    performCheckin: checkinMutation.mutate,
    isCheckingIn: checkinMutation.isPending,
    triggerTransactionBonus,
    awardTokens,
    claimWelcomeBonus,
    transferTokens,
    
    // Utilities
    formatTokenAmount,
    refetchBalance,
    refetchCheckin,
    refetchTransactions,
    refetchTransfers,
    
    // User info
    user
  };
};

export default useAstraToken;