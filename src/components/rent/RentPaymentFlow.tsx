
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useAlert } from '@/contexts/AlertContext';
import { 
  CreditCard, 
  DollarSign, 
  Calendar,
  AlertTriangle,
  Coins,
  CheckCircle
} from 'lucide-react';

interface RentPaymentFlowProps {
  propertyId?: string;
  rentAmount?: number;
}

const RentPaymentFlow = ({ propertyId, rentAmount = 0 }: RentPaymentFlowProps) => {
  const { user, isAuthenticated } = useAuth();
  const { showSuccess, showError } = useAlert();
  const [paymentAmount, setPaymentAmount] = useState(rentAmount.toString());
  const [isProcessing, setIsProcessing] = useState(false);

  // Check if ASTRA tokens are enabled
  const { data: tokenSystemEnabled } = useQuery({
    queryKey: ['astra-token-system-enabled'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'astra_tokens_enabled')
        .eq('category', 'tools')
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data?.value === true;
    },
    enabled: isAuthenticated,
  });

  // Get token reward settings
  const { data: tokenRewardSettings } = useQuery({
    queryKey: ['rent-payment-token-rewards'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'rent_payment_rewards')
        .eq('category', 'astra_tokens')
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data?.value;
    },
    enabled: tokenSystemEnabled,
  });

  const handlePayment = async () => {
    if (!isAuthenticated) {
      showError("Authentication Required", "Please sign in to make a payment");
      return;
    }

    setIsProcessing(true);
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Calculate token rewards if enabled
      let tokenReward = 0;
      if (tokenSystemEnabled && tokenRewardSettings && typeof tokenRewardSettings === 'object') {
        const settings = tokenRewardSettings as { enabled?: boolean; percentage?: number };
        if (settings.enabled) {
          const percentage = settings.percentage || 1;
          tokenReward = Math.floor(Number(paymentAmount) * (percentage / 100));
        }
      }

      // Record payment
      const { error } = await supabase
        .from('user_activity_logs')
        .insert({
          user_id: user?.id,
          activity_type: 'rent_payment',
          description: `Rent payment of $${paymentAmount} processed${tokenReward > 0 ? ` - Earned ${tokenReward} ASTRA tokens` : ''}`
        });

      if (error) throw error;

      showSuccess(
        "Payment Successful!",
        `Your rent payment of $${paymentAmount} has been processed.${tokenReward > 0 ? ` You earned ${tokenReward} ASTRA tokens!` : ''}`
      );

      setPaymentAmount('');
    } catch (error) {
      console.error('Payment error:', error);
      showError("Payment Failed", "There was an error processing your payment");
    } finally {
      setIsProcessing(false);
    }
  };

  const getTokenReward = () => {
    if (!tokenSystemEnabled || !tokenRewardSettings || typeof tokenRewardSettings !== 'object') {
      return 0;
    }
    const settings = tokenRewardSettings as { enabled?: boolean; percentage?: number };
    if (!settings.enabled) return 0;
    const percentage = settings.percentage || 1;
    return Math.floor(Number(paymentAmount || 0) * (percentage / 100));
  };

  const tokenReward = getTokenReward();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Rent Payment
          </CardTitle>
          <CardDescription>
            Process your monthly rent payment securely
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isAuthenticated && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Please sign in to access the payment system.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div>
              <Label htmlFor="amount">Payment Amount</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="amount"
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="pl-10"
                  disabled={!isAuthenticated}
                />
              </div>
            </div>

            {tokenSystemEnabled && tokenReward > 0 && (
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Coins className="h-4 w-4 text-purple-600" />
                  <span className="font-medium text-purple-800">Token Reward</span>
                </div>
                <p className="text-sm text-purple-700">
                  You'll earn {tokenReward} ASTRA tokens for this payment
                </p>
              </div>
            )}

            {!tokenSystemEnabled && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  ASTRA Token rewards are currently disabled. Enable them through Admin Tools to earn tokens on payments.
                </AlertDescription>
              </Alert>
            )}

            <Button 
              onClick={handlePayment}
              disabled={!isAuthenticated || isProcessing || !paymentAmount}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing Payment...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Pay ${paymentAmount || '0'}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Payment History
          </CardTitle>
          <CardDescription>
            View your recent rent payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {isAuthenticated 
                ? "No payment history available"
                : "Sign in to view payment history"
              }
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RentPaymentFlow;
