import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Midtrans Client Key (publishable - safe to expose)
const MIDTRANS_CLIENT_KEY = import.meta.env.VITE_MIDTRANS_CLIENT_KEY || '';
const MIDTRANS_IS_PRODUCTION = import.meta.env.VITE_MIDTRANS_IS_PRODUCTION === 'true';

export type PaymentMethod = 
  | 'gopay' 
  | 'shopeepay' 
  | 'dana' 
  | 'ovo' 
  | 'qris'
  | 'bank_transfer_bca'
  | 'bank_transfer_bni'
  | 'bank_transfer_bri'
  | 'bank_transfer_mandiri'
  | 'cstore_indomaret'
  | 'cstore_alfamart';

interface CustomerDetails {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
}

interface PaymentParams {
  orderId: string;
  amount: number;
  bookingId?: string;
  customerDetails?: CustomerDetails;
  itemDetails?: Array<{
    id: string;
    price: number;
    quantity: number;
    name: string;
  }>;
  paymentType?: PaymentMethod;
}

interface MidtransResult {
  status_code: string;
  status_message: string;
  transaction_id?: string;
  order_id: string;
  payment_type?: string;
  transaction_status?: string;
}

declare global {
  interface Window {
    snap?: {
      pay: (token: string, options: {
        onSuccess: (result: MidtransResult) => void;
        onPending: (result: MidtransResult) => void;
        onError: (result: MidtransResult) => void;
        onClose: () => void;
      }) => void;
    };
  }
}

export function useMidtransPayment() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSnapLoaded, setIsSnapLoaded] = useState(false);

  // Load Midtrans Snap script
  const loadSnapScript = useCallback(() => {
    return new Promise<void>((resolve, reject) => {
      if (window.snap) {
        setIsSnapLoaded(true);
        resolve();
        return;
      }

      const existingScript = document.getElementById('midtrans-snap');
      if (existingScript) {
        existingScript.addEventListener('load', () => {
          setIsSnapLoaded(true);
          resolve();
        });
        return;
      }

      const script = document.createElement('script');
      script.id = 'midtrans-snap';
      script.src = MIDTRANS_IS_PRODUCTION 
        ? 'https://app.midtrans.com/snap/snap.js'
        : 'https://app.sandbox.midtrans.com/snap/snap.js';
      script.setAttribute('data-client-key', MIDTRANS_CLIENT_KEY);
      
      script.onload = () => {
        setIsSnapLoaded(true);
        resolve();
      };
      script.onerror = () => reject(new Error('Failed to load Midtrans Snap'));
      
      document.body.appendChild(script);
    });
  }, []);

  // Create payment and open Snap popup
  const createPayment = useCallback(async (params: PaymentParams): Promise<MidtransResult | null> => {
    setIsLoading(true);
    
    try {
      // Load Snap if not loaded
      await loadSnapScript();

      // Create transaction via edge function
      const { data, error } = await supabase.functions.invoke('midtrans-payment', {
        body: {
          action: 'create_transaction',
          order_id: params.orderId,
          gross_amount: params.amount,
          booking_id: params.bookingId,
          customer_details: params.customerDetails,
          item_details: params.itemDetails,
          payment_type: params.paymentType,
        },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Failed to create payment');

      // Open Snap popup
      return new Promise((resolve, reject) => {
        if (!window.snap) {
          reject(new Error('Midtrans Snap not loaded'));
          return;
        }

        window.snap.pay(data.token, {
          onSuccess: (result) => {
            toast.success('Pembayaran berhasil!');
            resolve(result);
          },
          onPending: (result) => {
            toast.info('Menunggu pembayaran...');
            resolve(result);
          },
          onError: (result) => {
            toast.error('Pembayaran gagal');
            reject(new Error(result.status_message));
          },
          onClose: () => {
            toast.info('Pembayaran dibatalkan');
            resolve(null);
          },
        });
      });
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Terjadi kesalahan pembayaran');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [loadSnapScript]);

  // Check transaction status
  const checkStatus = useCallback(async (orderId: string) => {
    const { data, error } = await supabase.functions.invoke('midtrans-payment', {
      body: {
        action: 'check_status',
        order_id: orderId,
      },
    });

    if (error) throw error;
    return data;
  }, []);

  // Process refund
  const refund = useCallback(async (orderId: string, amount?: number, reason?: string) => {
    const { data, error } = await supabase.functions.invoke('midtrans-payment', {
      body: {
        action: 'refund',
        order_id: orderId,
        amount,
        reason,
      },
    });

    if (error) throw error;
    if (!data.success) throw new Error(data.error || 'Refund failed');
    
    toast.success('Refund berhasil diproses');
    return data;
  }, []);

  // Cancel transaction
  const cancel = useCallback(async (orderId: string) => {
    const { data, error } = await supabase.functions.invoke('midtrans-payment', {
      body: {
        action: 'cancel',
        order_id: orderId,
      },
    });

    if (error) throw error;
    toast.success('Transaksi dibatalkan');
    return data;
  }, []);

  return {
    isLoading,
    isSnapLoaded,
    loadSnapScript,
    createPayment,
    checkStatus,
    refund,
    cancel,
  };
}
