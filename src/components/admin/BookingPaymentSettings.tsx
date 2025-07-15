import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, DollarSign, Receipt, Building2, Calculator, Globe, Percent } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BookingSettings {
  min_booking_duration: number;
  max_booking_duration: number;
  advance_booking_days: number;
  cancellation_policy: string;
  auto_confirm_bookings: boolean;
  require_deposit: boolean;
  deposit_percentage: number;
  booking_buffer_time: number;
}

interface PaymentSettings {
  enabled_payment_methods: string[];
  payment_processing_fee: number;
  late_payment_penalty: number;
  refund_processing_days: number;
  auto_refund_enabled: boolean;
  currency: string;
}

interface IndonesianTaxSettings {
  ppn_rate: number; // PPN (VAT) rate
  pph_rate: number; // PPh (Income Tax) rate
  tax_inclusive_pricing: boolean;
  tax_calculation_method: string;
  tax_registration_number: string;
  tax_invoice_required: boolean;
  service_tax_rate: number;
}

interface AstraVillaCharges {
  platform_commission_rate: number;
  agent_commission_rate: number;
  owner_commission_rate: number;
  marketing_fee_rate: number;
  maintenance_fee: number;
  listing_fee: number;
  premium_listing_fee: number;
  booking_processing_fee: number;
  cancellation_fee: number;
}

const BookingPaymentSettings = () => {
  const [bookingSettings, setBookingSettings] = useState<BookingSettings>({
    min_booking_duration: 1,
    max_booking_duration: 365,
    advance_booking_days: 365,
    cancellation_policy: 'moderate',
    auto_confirm_bookings: false,
    require_deposit: true,
    deposit_percentage: 30,
    booking_buffer_time: 2,
  });

  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    enabled_payment_methods: ['credit_card', 'bank_transfer'],
    payment_processing_fee: 2.9,
    late_payment_penalty: 5.0,
    refund_processing_days: 7,
    auto_refund_enabled: false,
    currency: 'IDR',
  });

  const [taxSettings, setTaxSettings] = useState<IndonesianTaxSettings>({
    ppn_rate: 11.0,
    pph_rate: 2.5,
    tax_inclusive_pricing: true,
    tax_calculation_method: 'inclusive',
    tax_registration_number: '',
    tax_invoice_required: true,
    service_tax_rate: 10.0,
  });

  const [astraCharges, setAstraCharges] = useState<AstraVillaCharges>({
    platform_commission_rate: 5.0,
    agent_commission_rate: 3.0,
    owner_commission_rate: 2.0,
    marketing_fee_rate: 1.0,
    maintenance_fee: 50000,
    listing_fee: 0,
    premium_listing_fee: 100000,
    booking_processing_fee: 5000,
    cancellation_fee: 25000,
  });

  const [loading, setLoading] = useState(false);
  const showSuccess = (message: string) => toast.success(message);
  const showError = (message: string) => toast.error(message);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data: settings } = await supabase
        .from('system_settings')
        .select('*')
        .in('category', ['booking', 'payment', 'tax', 'charges']);

      if (settings) {
        settings.forEach(setting => {
          switch (setting.category) {
            case 'booking':
              if (setting.key === 'booking_settings' && setting.value) {
                setBookingSettings(setting.value as unknown as BookingSettings);
              }
              break;
            case 'payment':
              if (setting.key === 'payment_settings' && setting.value) {
                setPaymentSettings(setting.value as unknown as PaymentSettings);
              }
              break;
            case 'tax':
              if (setting.key === 'indonesian_tax_settings' && setting.value) {
                setTaxSettings(setting.value as unknown as IndonesianTaxSettings);
              }
              break;
            case 'charges':
              if (setting.key === 'astra_villa_charges' && setting.value) {
                setAstraCharges(setting.value as unknown as AstraVillaCharges);
              }
              break;
          }
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      showError('Failed to load settings');
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      const settingsToSave = [
        {
          category: 'booking',
          key: 'booking_settings',
          value: bookingSettings as any,
          description: 'Booking configuration settings'
        },
        {
          category: 'payment',
          key: 'payment_settings',
          value: paymentSettings as any,
          description: 'Payment processing settings'
        },
        {
          category: 'tax',
          key: 'indonesian_tax_settings',
          value: taxSettings as any,
          description: 'Indonesian tax configuration'
        },
        {
          category: 'charges',
          key: 'astra_villa_charges',
          value: astraCharges as any,
          description: 'ASTRA Villa service charges'
        }
      ];

      for (const setting of settingsToSave) {
        await supabase
          .from('system_settings')
          .upsert(setting, { onConflict: 'category,key' });
      }

      showSuccess('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      showError('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Booking & Payment Settings</h1>
          <p className="text-muted-foreground mt-2">
            Configure booking rules, payment processing, Indonesian tax settings, and ASTRA Villa service charges
          </p>
        </div>
        <Button onClick={saveSettings} disabled={loading} className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          {loading ? 'Saving...' : 'Save All Settings'}
        </Button>
      </div>

      <Tabs defaultValue="booking" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="booking" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Booking Settings
          </TabsTrigger>
          <TabsTrigger value="payment" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Payment Settings
          </TabsTrigger>
          <TabsTrigger value="tax" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            Indonesian Tax
          </TabsTrigger>
          <TabsTrigger value="charges" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            ASTRA Villa Charges
          </TabsTrigger>
        </TabsList>

        <TabsContent value="booking" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Booking Configuration
              </CardTitle>
              <CardDescription>
                Configure booking duration limits, advance booking, and policies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="min-duration">Minimum Booking Duration (days)</Label>
                  <Input
                    id="min-duration"
                    type="number"
                    value={bookingSettings.min_booking_duration}
                    onChange={(e) => setBookingSettings(prev => ({
                      ...prev,
                      min_booking_duration: parseInt(e.target.value)
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-duration">Maximum Booking Duration (days)</Label>
                  <Input
                    id="max-duration"
                    type="number"
                    value={bookingSettings.max_booking_duration}
                    onChange={(e) => setBookingSettings(prev => ({
                      ...prev,
                      max_booking_duration: parseInt(e.target.value)
                    }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="advance-days">Advance Booking Days</Label>
                  <Input
                    id="advance-days"
                    type="number"
                    value={bookingSettings.advance_booking_days}
                    onChange={(e) => setBookingSettings(prev => ({
                      ...prev,
                      advance_booking_days: parseInt(e.target.value)
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="buffer-time">Booking Buffer Time (hours)</Label>
                  <Input
                    id="buffer-time"
                    type="number"
                    value={bookingSettings.booking_buffer_time}
                    onChange={(e) => setBookingSettings(prev => ({
                      ...prev,
                      booking_buffer_time: parseInt(e.target.value)
                    }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cancellation-policy">Cancellation Policy</Label>
                <Select
                  value={bookingSettings.cancellation_policy}
                  onValueChange={(value) => setBookingSettings(prev => ({
                    ...prev,
                    cancellation_policy: value
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flexible">Flexible - Free cancellation</SelectItem>
                    <SelectItem value="moderate">Moderate - 5 days before</SelectItem>
                    <SelectItem value="strict">Strict - Non-refundable</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-confirm">Auto-confirm Bookings</Label>
                    <p className="text-sm text-muted-foreground">Automatically approve booking requests</p>
                  </div>
                  <Switch
                    id="auto-confirm"
                    checked={bookingSettings.auto_confirm_bookings}
                    onCheckedChange={(checked) => setBookingSettings(prev => ({
                      ...prev,
                      auto_confirm_bookings: checked
                    }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="require-deposit">Require Deposit</Label>
                    <p className="text-sm text-muted-foreground">Require upfront deposit for bookings</p>
                  </div>
                  <Switch
                    id="require-deposit"
                    checked={bookingSettings.require_deposit}
                    onCheckedChange={(checked) => setBookingSettings(prev => ({
                      ...prev,
                      require_deposit: checked
                    }))}
                  />
                </div>

                {bookingSettings.require_deposit && (
                  <div className="space-y-2">
                    <Label htmlFor="deposit-percentage">Deposit Percentage (%)</Label>
                    <Input
                      id="deposit-percentage"
                      type="number"
                      min="0"
                      max="100"
                      value={bookingSettings.deposit_percentage}
                      onChange={(e) => setBookingSettings(prev => ({
                        ...prev,
                        deposit_percentage: parseInt(e.target.value)
                      }))}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Payment Processing
              </CardTitle>
              <CardDescription>
                Configure payment methods, fees, and processing settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Enabled Payment Methods</Label>
                <div className="flex flex-wrap gap-2">
                  {['credit_card', 'bank_transfer', 'digital_wallet', 'cash'].map((method) => (
                    <Badge
                      key={method}
                      variant={paymentSettings.enabled_payment_methods.includes(method) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        const methods = paymentSettings.enabled_payment_methods.includes(method)
                          ? paymentSettings.enabled_payment_methods.filter(m => m !== method)
                          : [...paymentSettings.enabled_payment_methods, method];
                        setPaymentSettings(prev => ({ ...prev, enabled_payment_methods: methods }));
                      }}
                    >
                      {method.replace('_', ' ').toUpperCase()}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="processing-fee">Payment Processing Fee (%)</Label>
                  <Input
                    id="processing-fee"
                    type="number"
                    step="0.1"
                    value={paymentSettings.payment_processing_fee}
                    onChange={(e) => setPaymentSettings(prev => ({
                      ...prev,
                      payment_processing_fee: parseFloat(e.target.value)
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="late-penalty">Late Payment Penalty (%)</Label>
                  <Input
                    id="late-penalty"
                    type="number"
                    step="0.1"
                    value={paymentSettings.late_payment_penalty}
                    onChange={(e) => setPaymentSettings(prev => ({
                      ...prev,
                      late_payment_penalty: parseFloat(e.target.value)
                    }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="refund-days">Refund Processing Days</Label>
                  <Input
                    id="refund-days"
                    type="number"
                    value={paymentSettings.refund_processing_days}
                    onChange={(e) => setPaymentSettings(prev => ({
                      ...prev,
                      refund_processing_days: parseInt(e.target.value)
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={paymentSettings.currency}
                    onValueChange={(value) => setPaymentSettings(prev => ({
                      ...prev,
                      currency: value
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IDR">Indonesian Rupiah (IDR)</SelectItem>
                      <SelectItem value="USD">US Dollar (USD)</SelectItem>
                      <SelectItem value="EUR">Euro (EUR)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-refund">Auto Refund Enabled</Label>
                  <p className="text-sm text-muted-foreground">Automatically process eligible refunds</p>
                </div>
                <Switch
                  id="auto-refund"
                  checked={paymentSettings.auto_refund_enabled}
                  onCheckedChange={(checked) => setPaymentSettings(prev => ({
                    ...prev,
                    auto_refund_enabled: checked
                  }))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tax" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Indonesian Tax Settings
              </CardTitle>
              <CardDescription>
                Configure PPN, PPh, and other Indonesian tax requirements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ppn-rate">PPN Rate (%)</Label>
                  <Input
                    id="ppn-rate"
                    type="number"
                    step="0.1"
                    value={taxSettings.ppn_rate}
                    onChange={(e) => setTaxSettings(prev => ({
                      ...prev,
                      ppn_rate: parseFloat(e.target.value)
                    }))}
                  />
                  <p className="text-xs text-muted-foreground">Current PPN rate: 11%</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pph-rate">PPh Rate (%)</Label>
                  <Input
                    id="pph-rate"
                    type="number"
                    step="0.1"
                    value={taxSettings.pph_rate}
                    onChange={(e) => setTaxSettings(prev => ({
                      ...prev,
                      pph_rate: parseFloat(e.target.value)
                    }))}
                  />
                  <p className="text-xs text-muted-foreground">Income tax withholding</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="service-tax-rate">Service Tax Rate (%)</Label>
                  <Input
                    id="service-tax-rate"
                    type="number"
                    step="0.1"
                    value={taxSettings.service_tax_rate}
                    onChange={(e) => setTaxSettings(prev => ({
                      ...prev,
                      service_tax_rate: parseFloat(e.target.value)
                    }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tax-registration">Tax Registration Number (NPWP)</Label>
                <Input
                  id="tax-registration"
                  value={taxSettings.tax_registration_number}
                  onChange={(e) => setTaxSettings(prev => ({
                    ...prev,
                    tax_registration_number: e.target.value
                  }))}
                  placeholder="Enter NPWP number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="calculation-method">Tax Calculation Method</Label>
                <Select
                  value={taxSettings.tax_calculation_method}
                  onValueChange={(value) => setTaxSettings(prev => ({
                    ...prev,
                    tax_calculation_method: value
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inclusive">Tax Inclusive</SelectItem>
                    <SelectItem value="exclusive">Tax Exclusive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="tax-inclusive">Tax Inclusive Pricing</Label>
                    <p className="text-sm text-muted-foreground">Display prices with tax included</p>
                  </div>
                  <Switch
                    id="tax-inclusive"
                    checked={taxSettings.tax_inclusive_pricing}
                    onCheckedChange={(checked) => setTaxSettings(prev => ({
                      ...prev,
                      tax_inclusive_pricing: checked
                    }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="tax-invoice">Tax Invoice Required</Label>
                    <p className="text-sm text-muted-foreground">Generate formal tax invoices</p>
                  </div>
                  <Switch
                    id="tax-invoice"
                    checked={taxSettings.tax_invoice_required}
                    onCheckedChange={(checked) => setTaxSettings(prev => ({
                      ...prev,
                      tax_invoice_required: checked
                    }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="charges" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Percent className="h-5 w-5" />
                ASTRA Villa Service Charges
              </CardTitle>
              <CardDescription>
                Configure platform commissions, fees, and service charges
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="platform-commission">Platform Commission Rate (%)</Label>
                  <Input
                    id="platform-commission"
                    type="number"
                    step="0.1"
                    value={astraCharges.platform_commission_rate}
                    onChange={(e) => setAstraCharges(prev => ({
                      ...prev,
                      platform_commission_rate: parseFloat(e.target.value)
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="agent-commission">Agent Commission Rate (%)</Label>
                  <Input
                    id="agent-commission"
                    type="number"
                    step="0.1"
                    value={astraCharges.agent_commission_rate}
                    onChange={(e) => setAstraCharges(prev => ({
                      ...prev,
                      agent_commission_rate: parseFloat(e.target.value)
                    }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="owner-commission">Owner Commission Rate (%)</Label>
                  <Input
                    id="owner-commission"
                    type="number"
                    step="0.1"
                    value={astraCharges.owner_commission_rate}
                    onChange={(e) => setAstraCharges(prev => ({
                      ...prev,
                      owner_commission_rate: parseFloat(e.target.value)
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="marketing-fee">Marketing Fee Rate (%)</Label>
                  <Input
                    id="marketing-fee"
                    type="number"
                    step="0.1"
                    value={astraCharges.marketing_fee_rate}
                    onChange={(e) => setAstraCharges(prev => ({
                      ...prev,
                      marketing_fee_rate: parseFloat(e.target.value)
                    }))}
                  />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maintenance-fee">Monthly Maintenance Fee (IDR)</Label>
                  <Input
                    id="maintenance-fee"
                    type="number"
                    value={astraCharges.maintenance_fee}
                    onChange={(e) => setAstraCharges(prev => ({
                      ...prev,
                      maintenance_fee: parseInt(e.target.value)
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="listing-fee">Basic Listing Fee (IDR)</Label>
                  <Input
                    id="listing-fee"
                    type="number"
                    value={astraCharges.listing_fee}
                    onChange={(e) => setAstraCharges(prev => ({
                      ...prev,
                      listing_fee: parseInt(e.target.value)
                    }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="premium-listing">Premium Listing Fee (IDR)</Label>
                  <Input
                    id="premium-listing"
                    type="number"
                    value={astraCharges.premium_listing_fee}
                    onChange={(e) => setAstraCharges(prev => ({
                      ...prev,
                      premium_listing_fee: parseInt(e.target.value)
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="booking-processing">Booking Processing Fee (IDR)</Label>
                  <Input
                    id="booking-processing"
                    type="number"
                    value={astraCharges.booking_processing_fee}
                    onChange={(e) => setAstraCharges(prev => ({
                      ...prev,
                      booking_processing_fee: parseInt(e.target.value)
                    }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cancellation-fee">Cancellation Fee (IDR)</Label>
                <Input
                  id="cancellation-fee"
                  type="number"
                  value={astraCharges.cancellation_fee}
                  onChange={(e) => setAstraCharges(prev => ({
                    ...prev,
                    cancellation_fee: parseInt(e.target.value)
                  }))}
                />
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">Fee Structure Summary</h4>
                <div className="text-sm space-y-1">
                  <p>Platform Commission: {astraCharges.platform_commission_rate}%</p>
                  <p>Agent Commission: {astraCharges.agent_commission_rate}%</p>
                  <p>Owner Commission: {astraCharges.owner_commission_rate}%</p>
                  <p>Processing Fee: IDR {astraCharges.booking_processing_fee.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BookingPaymentSettings;