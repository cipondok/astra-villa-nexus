
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useAlert } from '@/contexts/AlertContext';

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
  const { user } = useAuth();
  const { showSuccess, showError } = useAlert();
  const [state, setState] = useState<RentPaymentState>({
    isProcessing: false,
    transactionHash: null,
    error: null,
  });

  const processRentPayment = async (paymentData: RentPaymentData) => {
    if (!user) {
      showError('Authentication Required', 'Please sign in and connect your wallet');
      return;
    }

    setState(prev => ({ ...prev, isProcessing: true, error: null }));

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Record payment activity
      const { error: dbError } = await supabase
        .from('user_activity_logs')
        .insert({
          user_id: user.id,
          activity_type: 'rent_payment',
          description: `Rent payment of ${paymentData.tokenAmount} tokens processed for property ${paymentData.propertyId}`
        });

      if (dbError) throw dbError;

      setState(prev => ({ 
        ...prev, 
        transactionHash: 'simulated_tx_hash'
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

  const updateTransactionStatus = async (txHash: string, status: 'confirmed' | 'failed') => {
    if (!txHash) return;

    try {
      const { error } = await supabase
        .from('user_activity_logs')
        .insert({
          user_id: user?.id,
          activity_type: 'rent_payment_status_update',
          description: `Rent payment transaction ${txHash} status updated to ${status}`
        });

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
    isProcessing: state.isProcessing,
    transactionHash: state.transactionHash,
    error: state.error,
    isSuccess: !!state.transactionHash,
  };
};
