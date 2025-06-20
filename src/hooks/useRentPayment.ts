
import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useAlert } from '@/contexts/AlertContext';
import { ASTRA_TOKEN_ABI } from '@/lib/web3';

interface RentPaymentData {
  propertyId: string;
  tokenAmount: string;
  durationDays: number;
  contractAddress: string;
}

interface RentPaymentState {
  isProcessing: boolean;
  transactionHash: string | null;
  error: string | null;
}

export const useRentPayment = () => {
  const { address } = useAccount();
  const { user } = useAuth();
  const { showSuccess, showError } = useAlert();
  const [state, setState] = useState<RentPaymentState>({
    isProcessing: false,
    transactionHash: null,
    error: null,
  });

  const { writeContract, data: hash, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const processRentPayment = async (paymentData: RentPaymentData) => {
    if (!user || !address) {
      showError('Authentication Required', 'Please sign in and connect your wallet');
      return;
    }

    setState(prev => ({ ...prev, isProcessing: true, error: null }));

    try {
      // 1. Parse token amount to proper units (assuming 18 decimals)
      const tokenAmountWei = parseUnits(paymentData.tokenAmount, 18);

      // 2. Trigger smart contract interaction (token transfer)
      writeContract({
        address: paymentData.contractAddress as `0x${string}`,
        abi: ASTRA_TOKEN_ABI,
        functionName: 'transfer',
        args: [paymentData.contractAddress, tokenAmountWei],
      });

      // 3. Create pending record in Supabase
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + paymentData.durationDays);

      const { data: rentPayment, error: dbError } = await supabase
        .from('rent_payments')
        .insert({
          user_id: user.id,
          property_id: paymentData.propertyId,
          wallet_address: address.toLowerCase(),
          transaction_hash: hash || 'pending',
          token_amount: paymentData.tokenAmount,
          rental_duration_days: paymentData.durationDays,
          rental_start_date: startDate.toISOString(),
          rental_end_date: endDate.toISOString(),
          contract_address: paymentData.contractAddress,
          status: 'pending',
        })
        .select()
        .single();

      if (dbError) throw dbError;

      setState(prev => ({ 
        ...prev, 
        transactionHash: hash || null 
      }));

      showSuccess(
        'Payment Initiated', 
        'Your rental payment is being processed. You will receive a confirmation shortly.'
      );

    } catch (error) {
      console.error('Rent payment error:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Payment failed' 
      }));
      showError('Payment Failed', 'Failed to process rent payment');
    } finally {
      setState(prev => ({ ...prev, isProcessing: false }));
    }
  };

  // Update transaction status when confirmed
  const updateTransactionStatus = async (txHash: string, status: 'confirmed' | 'failed') => {
    if (!txHash) return;

    try {
      const { error } = await supabase
        .from('rent_payments')
        .update({ 
          status,
          transaction_hash: txHash,
        })
        .eq('transaction_hash', txHash);

      if (error) throw error;

      if (status === 'confirmed') {
        showSuccess('Payment Confirmed', 'Your rental payment has been confirmed on the blockchain');
      }
    } catch (error) {
      console.error('Error updating transaction status:', error);
    }
  };

  return {
    processRentPayment,
    updateTransactionStatus,
    isProcessing: state.isProcessing || isConfirming,
    transactionHash: state.transactionHash,
    error: state.error || writeError?.message,
    isSuccess,
  };
};
