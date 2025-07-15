import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PaymentProcessorProps {
  bookingId: string;
  amount: number;
  currency?: string;
  bookingType: 'rental' | 'service';
  bookingDetails?: {
    title?: string;
    description?: string;
    dates?: string;
  };
  onPaymentSuccess?: (sessionId: string) => void;
  onPaymentError?: (error: string) => void;
}

const PaymentProcessor: React.FC<PaymentProcessorProps> = ({
  bookingId,
  amount,
  currency = 'IDR',
  bookingType,
  bookingDetails,
  onPaymentSuccess,
  onPaymentError
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');

  const formatAmount = (amount: number, currency: string) => {
    if (currency === 'IDR') {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
      }).format(amount);
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    setPaymentStatus('processing');

    try {
      // Create payment session
      const { data, error } = await supabase.functions.invoke('create-payment-session', {
        body: {
          bookingId,
          amount,
          currency: currency.toLowerCase(),
          bookingType,
          successUrl: `${window.location.origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/payment-cancelled`
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to create payment session');
      }

      if (!data.success || !data.url) {
        throw new Error('Invalid payment session response');
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment processing failed';
      console.error('Payment error:', error);
      
      setPaymentStatus('error');
      toast.error(errorMessage);
      onPaymentError?.(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case 'processing':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <CreditCard className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusText = () => {
    switch (paymentStatus) {
      case 'processing':
        return 'Redirecting to payment...';
      case 'success':
        return 'Payment completed successfully';
      case 'error':
        return 'Payment failed';
      default:
        return 'Ready to pay';
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          Payment Details
        </CardTitle>
        <CardDescription>
          {bookingType === 'rental' ? 'Property Rental' : 'Service Booking'} Payment
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Booking Details */}
        {bookingDetails && (
          <div className="space-y-2">
            {bookingDetails.title && (
              <div>
                <p className="font-medium">{bookingDetails.title}</p>
                {bookingDetails.description && (
                  <p className="text-sm text-muted-foreground">{bookingDetails.description}</p>
                )}
              </div>
            )}
            {bookingDetails.dates && (
              <p className="text-sm text-muted-foreground">{bookingDetails.dates}</p>
            )}
          </div>
        )}

        <Separator />

        {/* Payment Summary */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Booking ID</span>
            <Badge variant="outline" className="font-mono text-xs">
              {bookingId.slice(0, 8)}...
            </Badge>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Currency</span>
            <Badge variant="secondary">{currency.toUpperCase()}</Badge>
          </div>

          <div className="flex justify-between items-center text-lg font-semibold">
            <span>Total Amount</span>
            <span className="text-primary">{formatAmount(amount, currency)}</span>
          </div>
        </div>

        <Separator />

        {/* Payment Status */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            {getStatusIcon()}
            <span>{getStatusText()}</span>
          </div>
        </div>

        {/* Payment Button */}
        <Button 
          onClick={handlePayment}
          disabled={isProcessing || paymentStatus === 'success'}
          className="w-full"
          size="lg"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : paymentStatus === 'success' ? (
            'Payment Completed'
          ) : (
            <>
              <CreditCard className="mr-2 h-4 w-4" />
              Pay {formatAmount(amount, currency)}
            </>
          )}
        </Button>

        {/* Payment Methods Info */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Secure payment powered by Stripe
          </p>
          <div className="flex justify-center gap-1 mt-1">
            <Badge variant="outline" className="text-xs">Visa</Badge>
            <Badge variant="outline" className="text-xs">Mastercard</Badge>
            <Badge variant="outline" className="text-xs">Bank Transfer</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentProcessor;