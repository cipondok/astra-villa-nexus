import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  CreditCard, 
  Banknote, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  ArrowUpRight,
  Plus,
  Wallet,
  Building
} from 'lucide-react';
import { toast } from 'sonner';

interface BankDetails {
  bank_name: string;
  account_number: string;
  account_holder: string;
  swift_code?: string;
}

const VendorPaymentIntegration = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedPayoutMethod, setSelectedPayoutMethod] = useState('bank_transfer');
  const [bankDetails, setBankDetails] = useState<BankDetails>({
    bank_name: '',
    account_number: '',
    account_holder: '',
    swift_code: ''
  });

  // Mock earnings data until database is set up
  const mockEarnings = [
    {
      id: '1',
      amount: 500000,
      commission_rate: 15,
      commission_amount: 75000,
      net_amount: 425000,
      currency: 'IDR',
      status: 'paid' as const,
      created_at: '2024-01-15',
      payment_reference: 'PAY001'
    },
    {
      id: '2', 
      amount: 750000,
      commission_rate: 15,
      commission_amount: 112500,
      net_amount: 637500,
      currency: 'IDR',
      status: 'pending' as const,
      created_at: '2024-01-20'
    }
  ];

  const earnings = mockEarnings;
  const earningsLoading = false;

  // Fetch payout settings
  const { data: payoutSettings } = useQuery({
    queryKey: ['payout-settings', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('vendor_business_profiles')
        .select('*')
        .eq('vendor_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user?.id
  });

  // Update payout settings
  const updatePayoutMutation = useMutation({
    mutationFn: async (settings: { payout_method: string; bank_details: BankDetails }) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('vendor_business_profiles')
        .upsert({
          vendor_id: user.id,
          business_name: payoutSettings?.business_name || 'Default Business',
          business_type: payoutSettings?.business_type || 'service',
          ...settings,
          updated_at: new Date().toISOString()
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Payout settings updated successfully');
      queryClient.invalidateQueries({ queryKey: ['payout-settings'] });
    },
    onError: (error) => {
      console.error('Payout settings error:', error);
      toast.error('Failed to update payout settings');
    }
  });

  // Request payout - mock implementation
  const requestPayoutMutation = useMutation({
    mutationFn: async (amount: number) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (amount < 100000) {
        throw new Error('Minimum payout amount is Rp 100,000');
      }
    },
    onSuccess: () => {
      toast.success('Payout request submitted successfully');
      toast.success('Your payout request is being processed');
    },
    onError: (error) => {
      console.error('Payout request error:', error);
      toast.error('Failed to submit payout request');
    }
  });

  const calculateTotalEarnings = () => {
    return earnings.reduce((total, earning) => total + earning.net_amount, 0) || 0;
  };

  const calculatePendingPayouts = () => {
    return earnings.filter(e => e.status === 'pending').reduce((total, earning) => total + earning.net_amount, 0) || 0;
  };

  const formatCurrency = (amount: number, currency = 'IDR') => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
      pending: { variant: "secondary", icon: <Clock className="h-3 w-3" /> },
      approved: { variant: "default", icon: <CheckCircle className="h-3 w-3" /> },
      paid: { variant: "outline", icon: <CheckCircle className="h-3 w-3" /> },
      disputed: { variant: "destructive", icon: <AlertTriangle className="h-3 w-3" /> }
    };
    
    const { variant, icon } = variants[status] || variants.pending;
    
    return (
      <Badge variant={variant} className="flex items-center gap-1">
        {icon}
        {status.toUpperCase()}
      </Badge>
    );
  };

  if (earningsLoading) {
    return <div className="flex justify-center p-8">Loading payment information...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Payment Integration</h2>
          <p className="text-muted-foreground">Manage your earnings and payout settings</p>
        </div>
      </div>

      {/* Earnings Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Earnings</p>
                <p className="text-2xl font-bold">{formatCurrency(calculateTotalEarnings())}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Payouts</p>
                <p className="text-2xl font-bold">{formatCurrency(calculatePendingPayouts())}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Commission Rate</p>
                <p className="text-2xl font-bold">15%</p>
              </div>
              <Banknote className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="earnings" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="earnings">Earnings History</TabsTrigger>
          <TabsTrigger value="payout-settings">Payout Settings</TabsTrigger>
          <TabsTrigger value="request-payout">Request Payout</TabsTrigger>
        </TabsList>

        <TabsContent value="earnings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Earnings History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {earnings.length > 0 ? (
                <div className="space-y-4">
                  {earnings.map((earning) => (
                    <div key={earning.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <ArrowUpRight className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{formatCurrency(earning.net_amount)}</p>
                          <p className="text-sm text-muted-foreground">
                            Commission: {formatCurrency(earning.commission_amount)} ({earning.commission_rate}%)
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(earning.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(earning.status)}
                        {earning.payment_reference && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Ref: {earning.payment_reference}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No earnings yet</p>
                  <p className="text-sm text-muted-foreground">Complete bookings to start earning</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payout-settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payout Settings
              </CardTitle>
              <CardDescription>Configure how you want to receive payments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="payout-method">Payout Method</Label>
                <Select value={selectedPayoutMethod} onValueChange={setSelectedPayoutMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payout method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="e_wallet">E-Wallet</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedPayoutMethod === 'bank_transfer' && (
                <>
                  <div>
                    <Label htmlFor="bank-name">Bank Name</Label>
                    <Input
                      id="bank-name"
                      value={bankDetails.bank_name}
                      onChange={(e) => setBankDetails(prev => ({ ...prev, bank_name: e.target.value }))}
                      placeholder="e.g. Bank Central Asia (BCA)"
                    />
                  </div>
                  <div>
                    <Label htmlFor="account-number">Account Number</Label>
                    <Input
                      id="account-number"
                      value={bankDetails.account_number}
                      onChange={(e) => setBankDetails(prev => ({ ...prev, account_number: e.target.value }))}
                      placeholder="Enter your account number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="account-holder">Account Holder Name</Label>
                    <Input
                      id="account-holder"
                      value={bankDetails.account_holder}
                      onChange={(e) => setBankDetails(prev => ({ ...prev, account_holder: e.target.value }))}
                      placeholder="Full name as per bank records"
                    />
                  </div>
                  <div>
                    <Label htmlFor="swift-code">SWIFT Code (Optional)</Label>
                    <Input
                      id="swift-code"
                      value={bankDetails.swift_code}
                      onChange={(e) => setBankDetails(prev => ({ ...prev, swift_code: e.target.value }))}
                      placeholder="For international transfers"
                    />
                  </div>
                </>
              )}

              <Button 
                onClick={() => updatePayoutMutation.mutate({ 
                  payout_method: selectedPayoutMethod, 
                  bank_details: bankDetails 
                })}
                disabled={updatePayoutMutation.isPending}
                className="w-full"
              >
                {updatePayoutMutation.isPending ? 'Updating...' : 'Save Payout Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="request-payout" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Request Payout
              </CardTitle>
              <CardDescription>Submit a payout request for your earnings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Minimum payout amount is {formatCurrency(100000)}. 
                  Payouts are processed within 3-5 business days.
                </AlertDescription>
              </Alert>

              <div>
                <Label htmlFor="payout-amount">Payout Amount</Label>
                <Input
                  id="payout-amount"
                  type="number"
                  placeholder="Enter amount to withdraw"
                  min="100000"
                />
              </div>

              <Button 
                onClick={() => {
                  const amountInput = document.getElementById('payout-amount') as HTMLInputElement;
                  const amount = parseFloat(amountInput?.value || '0');
                  if (amount >= 100000) {
                    requestPayoutMutation.mutate(amount);
                  } else {
                    toast.error('Minimum payout amount is Rp 100,000');
                  }
                }}
                disabled={requestPayoutMutation.isPending}
                className="w-full"
              >
                {requestPayoutMutation.isPending ? 'Processing...' : 'Request Payout'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VendorPaymentIntegration;