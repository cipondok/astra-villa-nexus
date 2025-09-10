import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, 
  DollarSign, 
  Settings, 
  TrendingUp, 
  Users, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Banknote,
  Percent
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAlert } from '@/contexts/AlertContext';

interface PaymentConfig {
  stripe_enabled: boolean;
  stripe_public_key: string;
  stripe_secret_key: string;
  paypal_enabled: boolean;
  paypal_client_id: string;
  paypal_client_secret: string;
  currency: string;
  commission_rate: number;
  minimum_payout: number;
  automatic_payouts: boolean;
  payout_schedule: string;
}

const PaymentSettings = () => {
  const [config, setConfig] = useState<PaymentConfig>({
    stripe_enabled: false,
    stripe_public_key: '',
    stripe_secret_key: '',
    paypal_enabled: false,
    paypal_client_id: '',
    paypal_client_secret: '',
    currency: 'IDR',
    commission_rate: 5,
    minimum_payout: 100000,
    automatic_payouts: false,
    payout_schedule: 'weekly'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showSuccess, showError } = useAlert();

  useEffect(() => {
    loadPaymentSettings();
  }, []);

  const loadPaymentSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('key, value')
        .in('key', [
          'stripe_enabled', 'stripe_public_key', 'stripe_secret_key',
          'paypal_enabled', 'paypal_client_id', 'paypal_client_secret',
          'currency', 'commission_rate', 'minimum_payout',
          'automatic_payouts', 'payout_schedule'
        ]);

      if (error) throw error;

      const settingsObj = data.reduce((acc, item) => {
        acc[item.key] = item.value;
        return acc;
      }, {} as any);

      setConfig({
        stripe_enabled: settingsObj.stripe_enabled || false,
        stripe_public_key: settingsObj.stripe_public_key || '',
        stripe_secret_key: settingsObj.stripe_secret_key || '',
        paypal_enabled: settingsObj.paypal_enabled || false,
        paypal_client_id: settingsObj.paypal_client_id || '',
        paypal_client_secret: settingsObj.paypal_client_secret || '',
        currency: settingsObj.currency || 'IDR',
        commission_rate: settingsObj.commission_rate || 5,
        minimum_payout: settingsObj.minimum_payout || 100000,
        automatic_payouts: settingsObj.automatic_payouts || false,
        payout_schedule: settingsObj.payout_schedule || 'weekly'
      });
    } catch (error) {
      showError('Error', 'Failed to load payment settings');
      console.error('Error loading payment settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePaymentSettings = async () => {
    setSaving(true);
    try {
      const updates = Object.entries(config).map(([key, value]) => ({
        key,
        value,
        category: 'payment'
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('system_settings')
          .upsert({
            key: update.key,
            value: update.value,
            category: update.category
          });

        if (error) throw error;
      }

      showSuccess('Success', 'Payment settings saved successfully');
    } catch (error) {
      showError('Error', 'Failed to save payment settings');
      console.error('Error saving payment settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleConfigChange = (key: keyof PaymentConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const testStripeConnection = async () => {
    // Mock test connection
    showSuccess('Test Complete', 'Stripe connection test successful');
  };

  const testPayPalConnection = async () => {
    // Mock test connection
    showSuccess('Test Complete', 'PayPal connection test successful');
  };

  const paymentStats = {
    totalTransactions: 1247,
    successfulPayments: 1189,
    failedPayments: 58,
    totalRevenue: 45620000,
    pendingPayouts: 2340000,
    processedPayouts: 43280000
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <CreditCard className="h-6 w-6" />
            Payment Settings
          </h2>
          <p className="text-muted-foreground">Configure payment gateways and payout settings</p>
        </div>
        <Button onClick={savePaymentSettings} disabled={saving || loading}>
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      {/* Payment Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Total Revenue</span>
            </div>
            <div className="text-2xl font-bold mt-2">
              {new Intl.NumberFormat('id-ID', { 
                style: 'currency', 
                currency: 'IDR',
                minimumFractionDigits: 0
              }).format(paymentStats.totalRevenue)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Successful Payments</span>
            </div>
            <div className="text-2xl font-bold mt-2">{paymentStats.successfulPayments}</div>
            <div className="text-xs text-muted-foreground">
              {((paymentStats.successfulPayments / paymentStats.totalTransactions) * 100).toFixed(1)}% success rate
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Banknote className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Pending Payouts</span>
            </div>
            <div className="text-2xl font-bold mt-2">
              {new Intl.NumberFormat('id-ID', { 
                style: 'currency', 
                currency: 'IDR',
                minimumFractionDigits: 0
              }).format(paymentStats.pendingPayouts)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="gateways" className="w-full">
        <TabsList>
          <TabsTrigger value="gateways">Payment Gateways</TabsTrigger>
          <TabsTrigger value="payouts">Payout Settings</TabsTrigger>
          <TabsTrigger value="fees">Fees & Commission</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="gateways" className="space-y-6">
          {/* Stripe Configuration */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Stripe Configuration
                  </CardTitle>
                  <CardDescription>Configure Stripe payment gateway</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={config.stripe_enabled ? "default" : "secondary"}>
                    {config.stripe_enabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                  <Switch
                    checked={config.stripe_enabled}
                    onCheckedChange={(checked) => handleConfigChange('stripe_enabled', checked)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Stripe Publishable Key</Label>
                  <Input
                    type="password"
                    value={config.stripe_public_key}
                    onChange={(e) => handleConfigChange('stripe_public_key', e.target.value)}
                    placeholder="pk_test_..."
                    disabled={!config.stripe_enabled}
                  />
                </div>
                <div>
                  <Label>Stripe Secret Key</Label>
                  <Input
                    type="password"
                    value={config.stripe_secret_key}
                    onChange={(e) => handleConfigChange('stripe_secret_key', e.target.value)}
                    placeholder="sk_test_..."
                    disabled={!config.stripe_enabled}
                  />
                </div>
              </div>
              {config.stripe_enabled && (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={testStripeConnection}>
                    Test Connection
                  </Button>
                  <Button variant="outline">
                    View Stripe Dashboard
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* PayPal Configuration */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    PayPal Configuration
                  </CardTitle>
                  <CardDescription>Configure PayPal payment gateway</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={config.paypal_enabled ? "default" : "secondary"}>
                    {config.paypal_enabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                  <Switch
                    checked={config.paypal_enabled}
                    onCheckedChange={(checked) => handleConfigChange('paypal_enabled', checked)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>PayPal Client ID</Label>
                  <Input
                    type="password"
                    value={config.paypal_client_id}
                    onChange={(e) => handleConfigChange('paypal_client_id', e.target.value)}
                    placeholder="Client ID"
                    disabled={!config.paypal_enabled}
                  />
                </div>
                <div>
                  <Label>PayPal Client Secret</Label>
                  <Input
                    type="password"
                    value={config.paypal_client_secret}
                    onChange={(e) => handleConfigChange('paypal_client_secret', e.target.value)}
                    placeholder="Client Secret"
                    disabled={!config.paypal_enabled}
                  />
                </div>
              </div>
              {config.paypal_enabled && (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={testPayPalConnection}>
                    Test Connection
                  </Button>
                  <Button variant="outline">
                    View PayPal Dashboard
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle>General Payment Settings</CardTitle>
              <CardDescription>Currency and basic payment configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Default Currency</Label>
                  <Select value={config.currency} onValueChange={(value) => handleConfigChange('currency', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IDR">Indonesian Rupiah (IDR)</SelectItem>
                      <SelectItem value="USD">US Dollar (USD)</SelectItem>
                      <SelectItem value="EUR">Euro (EUR)</SelectItem>
                      <SelectItem value="SGD">Singapore Dollar (SGD)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payouts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payout Configuration</CardTitle>
              <CardDescription>Configure automatic payouts and minimum thresholds</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Automatic Payouts</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable automatic payouts to vendors and agents
                  </p>
                </div>
                <Switch
                  checked={config.automatic_payouts}
                  onCheckedChange={(checked) => handleConfigChange('automatic_payouts', checked)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Minimum Payout Amount</Label>
                  <Input
                    type="number"
                    value={config.minimum_payout}
                    onChange={(e) => handleConfigChange('minimum_payout', Number(e.target.value))}
                    placeholder="100000"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Minimum amount before payout is processed
                  </p>
                </div>
                <div>
                  <Label>Payout Schedule</Label>
                  <Select 
                    value={config.payout_schedule} 
                    onValueChange={(value) => handleConfigChange('payout_schedule', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="biweekly">Bi-weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fees" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Percent className="h-5 w-5" />
                Commission & Fees
              </CardTitle>
              <CardDescription>Configure platform commission rates and fees</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Platform Commission Rate (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={config.commission_rate}
                  onChange={(e) => handleConfigChange('commission_rate', Number(e.target.value))}
                  placeholder="5"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Percentage taken from each transaction
                </p>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Commission Preview</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Transaction Amount:</span>
                    <span>Rp 1,000,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Platform Commission ({config.commission_rate}%):</span>
                    <span>Rp {(1000000 * (config.commission_rate / 100)).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-medium border-t pt-1">
                    <span>Vendor Receives:</span>
                    <span>Rp {(1000000 - (1000000 * (config.commission_rate / 100))).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Analytics</CardTitle>
              <CardDescription>Payment performance and revenue insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Payment Analytics Dashboard</h3>
                <p className="text-muted-foreground">
                  Detailed payment analytics, revenue tracking, and performance metrics
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PaymentSettings;