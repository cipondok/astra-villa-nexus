import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Loader2, ArrowLeft, Receipt } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PaymentResult {
  success: boolean;
  paymentStatus: string;
  bookingId: string;
  message: string;
  error?: string;
}

const PaymentStatusChecker: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(true);
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (sessionId) {
      verifyPayment(sessionId);
    } else {
      setIsVerifying(false);
      toast.error('No payment session found');
    }
  }, [sessionId]);

  const verifyPayment = async (sessionId: string) => {
    try {
      setIsVerifying(true);

      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: { sessionId }
      });

      if (error) {
        throw new Error(error.message || 'Payment verification failed');
      }

      setPaymentResult(data);

      if (data.success) {
        toast.success('Payment completed successfully!');
      } else {
        toast.error(data.message || 'Payment verification failed');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment verification failed';
      console.error('Payment verification error:', error);
      
      setPaymentResult({
        success: false,
        paymentStatus: 'failed',
        bookingId: '',
        message: errorMessage,
        error: errorMessage
      });
      
      toast.error(errorMessage);
    } finally {
      setIsVerifying(false);
    }
  };

  const getStatusIcon = () => {
    if (isVerifying) {
      return <Loader2 className="h-8 w-8 animate-spin text-blue-500" />;
    }
    
    if (paymentResult?.success) {
      return <CheckCircle className="h-8 w-8 text-green-500" />;
    }
    
    return <XCircle className="h-8 w-8 text-red-500" />;
  };

  const getStatusColor = () => {
    if (isVerifying) return 'bg-blue-50 border-blue-200';
    if (paymentResult?.success) return 'bg-green-50 border-green-200';
    return 'bg-red-50 border-red-200';
  };

  const handleGoToBooking = () => {
    if (paymentResult?.bookingId) {
      navigate(`/booking/${paymentResult.bookingId}`);
    }
  };

  const handleGoHome = () => {
    navigate('/');
  };

  if (!sessionId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <CardTitle>Invalid Payment Session</CardTitle>
            <CardDescription>
              No payment session ID found. Please try again.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleGoHome} className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className={`w-full max-w-md ${getStatusColor()}`}>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {getStatusIcon()}
          </div>
          
          <CardTitle>
            {isVerifying ? 'Verifying Payment...' : 
             paymentResult?.success ? 'Payment Successful!' : 'Payment Failed'}
          </CardTitle>
          
          <CardDescription>
            {isVerifying ? 'Please wait while we verify your payment...' :
             paymentResult?.message || 'Unknown error occurred'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Payment Status */}
          {paymentResult && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge variant={paymentResult.success ? "default" : "destructive"}>
                  {paymentResult.paymentStatus}
                </Badge>
              </div>
              
              {paymentResult.bookingId && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Booking ID</span>
                  <Badge variant="outline" className="font-mono text-xs">
                    {paymentResult.bookingId.slice(0, 8)}...
                  </Badge>
                </div>
              )}
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Session ID</span>
                <Badge variant="outline" className="font-mono text-xs">
                  {sessionId.slice(0, 8)}...
                </Badge>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2">
            {paymentResult?.success && paymentResult.bookingId && (
              <Button onClick={handleGoToBooking} className="w-full">
                <Receipt className="mr-2 h-4 w-4" />
                View Booking Details
              </Button>
            )}
            
            <Button 
              onClick={handleGoHome} 
              variant={paymentResult?.success ? "outline" : "default"}
              className="w-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {paymentResult?.success ? 'Continue Browsing' : 'Back to Home'}
            </Button>
          </div>

          {/* Additional Information */}
          {paymentResult?.success && (
            <div className="mt-4 p-3 bg-green-100 rounded-lg border border-green-200">
              <p className="text-sm text-green-800">
                ✅ Your booking has been confirmed and an invoice will be generated shortly.
              </p>
            </div>
          )}
          
          {paymentResult && !paymentResult.success && (
            <div className="mt-4 p-3 bg-red-100 rounded-lg border border-red-200">
              <p className="text-sm text-red-800">
                ❌ If money was deducted, it will be refunded within 3-5 business days.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentStatusChecker;