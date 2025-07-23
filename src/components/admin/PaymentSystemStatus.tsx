import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, XCircle, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PaymentSystemCheck {
  name: string;
  status: 'success' | 'warning' | 'error';
  message: string;
  action?: () => void;
}

const PaymentSystemStatus = () => {
  const [checks, setChecks] = useState<PaymentSystemCheck[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const runPaymentSystemChecks = async () => {
    setIsLoading(true);
    const newChecks: PaymentSystemCheck[] = [];

    try {
      // Check Stripe configuration
      const { data: stripeTest, error: stripeError } = await supabase.functions.invoke('create-payment-session', {
        body: {
          bookingId: 'test-booking',
          amount: 1000,
          currency: 'idr',
          bookingType: 'rental',
          test: true
        }
      });

      if (stripeError || !stripeTest) {
        newChecks.push({
          name: 'Stripe Configuration',
          status: 'error',
          message: 'Stripe secret key not configured or invalid'
        });
      } else {
        newChecks.push({
          name: 'Stripe Configuration',
          status: 'success',
          message: 'Stripe is properly configured'
        });
      }

      // Check payment logs table
      const { data: paymentLogs, error: logsError } = await supabase
        .from('payment_logs')
        .select('count')
        .limit(1);

      if (logsError) {
        newChecks.push({
          name: 'Payment Logs Table',
          status: 'error',
          message: 'Payment logs table not accessible'
        });
      } else {
        newChecks.push({
          name: 'Payment Logs Table',
          status: 'success',
          message: 'Payment logs table is accessible'
        });
      }

      // Check booking payments table
      const { data: bookingPayments, error: paymentsError } = await supabase
        .from('booking_payments')
        .select('count')
        .limit(1);

      if (paymentsError) {
        newChecks.push({
          name: 'Booking Payments Table',
          status: 'error',
          message: 'Booking payments table not accessible'
        });
      } else {
        newChecks.push({
          name: 'Booking Payments Table',
          status: 'success',
          message: 'Booking payments table is accessible'
        });
      }

      // Check invoices table
      const { data: invoices, error: invoicesError } = await supabase
        .from('invoices')
        .select('count')
        .limit(1);

      if (invoicesError) {
        newChecks.push({
          name: 'Invoices Table',
          status: 'error',
          message: 'Invoices table not accessible'
        });
      } else {
        newChecks.push({
          name: 'Invoices Table',
          status: 'success',
          message: 'Invoices table is accessible'
        });
      }

      // Check edge functions
      const functions = ['create-payment-session', 'verify-payment', 'create-booking-payment', 'generate-invoice'];
      for (const func of functions) {
        try {
          const { error } = await supabase.functions.invoke(func, { body: { test: true } });
          newChecks.push({
            name: `${func} Function`,
            status: error ? 'warning' : 'success',
            message: error ? `Function exists but returned error: ${error.message}` : 'Function is accessible'
          });
        } catch (error) {
          newChecks.push({
            name: `${func} Function`,
            status: 'error',
            message: 'Function not accessible or does not exist'
          });
        }
      }

    } catch (error) {
      console.error('Error running payment system checks:', error);
      toast.error('Failed to run payment system checks');
    } finally {
      setIsLoading(false);
    }

    setChecks(newChecks);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-100 text-green-800">OK</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return null;
    }
  };

  useEffect(() => {
    runPaymentSystemChecks();
  }, []);

  const hasErrors = checks.some(check => check.status === 'error');
  const hasWarnings = checks.some(check => check.status === 'warning');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Payment System Status</span>
          <Button
            onClick={runPaymentSystemChecks}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Status */}
        <div className="flex items-center gap-2 p-3 rounded-lg border">
          {hasErrors ? (
            <>
              <XCircle className="h-5 w-5 text-red-500" />
              <span className="font-medium text-red-700">Critical Issues Found</span>
              <Badge variant="destructive">Needs Attention</Badge>
            </>
          ) : hasWarnings ? (
            <>
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <span className="font-medium text-yellow-700">Minor Issues Found</span>
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Review Required</Badge>
            </>
          ) : (
            <>
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="font-medium text-green-700">All Systems Operational</span>
              <Badge variant="default" className="bg-green-100 text-green-800">Healthy</Badge>
            </>
          )}
        </div>

        {/* Detailed Checks */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-muted-foreground">System Components</h4>
          {checks.map((check, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 rounded border"
            >
              <div className="flex items-center gap-2">
                {getStatusIcon(check.status)}
                <span className="font-medium text-sm">{check.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground max-w-xs truncate">
                  {check.message}
                </span>
                {getStatusBadge(check.status)}
              </div>
            </div>
          ))}
        </div>

        {/* Action Items */}
        {hasErrors && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200">
            <h4 className="font-medium text-red-800 mb-2">Required Actions:</h4>
            <ul className="text-sm text-red-700 space-y-1">
              {checks
                .filter(check => check.status === 'error')
                .map((check, index) => (
                  <li key={index}>• {check.name}: {check.message}</li>
                ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentSystemStatus;