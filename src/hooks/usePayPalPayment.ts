import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PayPalOrderParams {
  orderId: string;
  amount: number;
  currency?: 'USD' | 'IDR';
  bookingId?: string;
  description?: string;
  returnUrl?: string;
  cancelUrl?: string;
}

interface PayPalOrder {
  id: string;
  status: string;
  approval_url: string;
}

export function usePayPalPayment() {
  const [isLoading, setIsLoading] = useState(false);

  // Create PayPal order
  const createOrder = useCallback(async (params: PayPalOrderParams): Promise<PayPalOrder | null> => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('paypal-payment', {
        body: {
          action: 'create_order',
          order_id: params.orderId,
          amount: params.amount,
          currency: params.currency || 'USD',
          booking_id: params.bookingId,
          description: params.description || 'Payment',
          return_url: params.returnUrl || `${window.location.origin}/payment/success`,
          cancel_url: params.cancelUrl || `${window.location.origin}/payment/cancel`,
        },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Failed to create PayPal order');

      // Redirect to PayPal approval URL
      if (data.approval_url) {
        window.location.href = data.approval_url;
      }

      return data;
    } catch (error: any) {
      console.error('PayPal order creation error:', error);
      toast.error(error.message || 'Failed to create PayPal order');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Capture PayPal order after approval
  const captureOrder = useCallback(async (paypalOrderId: string) => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('paypal-payment', {
        body: {
          action: 'capture_order',
          paypal_order_id: paypalOrderId,
        },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Failed to capture PayPal payment');

      toast.success('Payment successful!');
      return data;
    } catch (error: any) {
      console.error('PayPal capture error:', error);
      toast.error(error.message || 'Failed to capture payment');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check order status
  const checkStatus = useCallback(async (paypalOrderId: string) => {
    const { data, error } = await supabase.functions.invoke('paypal-payment', {
      body: {
        action: 'check_status',
        paypal_order_id: paypalOrderId,
      },
    });

    if (error) throw error;
    return data;
  }, []);

  // Refund payment
  const refund = useCallback(async (captureId: string, amount?: number, reason?: string) => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('paypal-payment', {
        body: {
          action: 'refund',
          capture_id: captureId,
          amount,
          reason,
        },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Refund failed');

      toast.success('Refund processed successfully');
      return data;
    } catch (error: any) {
      console.error('PayPal refund error:', error);
      toast.error(error.message || 'Failed to process refund');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    createOrder,
    captureOrder,
    checkStatus,
    refund,
  };
}
