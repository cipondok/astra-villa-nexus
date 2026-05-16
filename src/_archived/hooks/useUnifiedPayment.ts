import { useState, useCallback } from 'react';
import { useMidtransPayment, PaymentMethod as MidtransPaymentMethod } from './useMidtransPayment';
import { usePayPalPayment } from './usePayPalPayment';
import { PaymentGateway, PaymentMethodType } from '@/components/payment/UnifiedPaymentSelector';

interface UnifiedPaymentParams {
  orderId: string;
  amount: number;
  currency?: 'IDR' | 'USD';
  bookingId?: string;
  description?: string;
  customerDetails?: {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
  };
}

export function useUnifiedPayment() {
  const midtrans = useMidtransPayment();
  const paypal = usePayPalPayment();
  const [isLoading, setIsLoading] = useState(false);

  const processPayment = useCallback(async (
    method: PaymentMethodType,
    gateway: PaymentGateway,
    params: UnifiedPaymentParams
  ) => {
    setIsLoading(true);

    try {
      if (gateway === 'midtrans') {
        // Convert to Midtrans payment type
        const midtransMethod = method as MidtransPaymentMethod;
        
        return await midtrans.createPayment({
          orderId: params.orderId,
          amount: params.amount,
          bookingId: params.bookingId,
          customerDetails: params.customerDetails,
          paymentType: midtransMethod,
          itemDetails: params.description ? [{
            id: params.orderId,
            price: params.amount,
            quantity: 1,
            name: params.description,
          }] : undefined,
        });
      } else if (gateway === 'paypal') {
        return await paypal.createOrder({
          orderId: params.orderId,
          amount: params.amount,
          currency: params.currency || 'USD',
          bookingId: params.bookingId,
          description: params.description,
        });
      }

      throw new Error('Unknown payment gateway');
    } finally {
      setIsLoading(false);
    }
  }, [midtrans, paypal]);

  const checkStatus = useCallback(async (orderId: string, gateway: PaymentGateway) => {
    if (gateway === 'midtrans') {
      return await midtrans.checkStatus(orderId);
    } else if (gateway === 'paypal') {
      return await paypal.checkStatus(orderId);
    }
    throw new Error('Unknown payment gateway');
  }, [midtrans, paypal]);

  return {
    isLoading: isLoading || midtrans.isLoading || paypal.isLoading,
    processPayment,
    checkStatus,
    midtrans,
    paypal,
  };
}
