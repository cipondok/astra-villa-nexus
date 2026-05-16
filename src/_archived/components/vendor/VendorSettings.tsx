
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAlert } from "@/contexts/AlertContext";
import { 
  Settings, 
  Bell, 
  Shield, 
  Globe, 
  Clock, 
  DollarSign,
  Save,
  RefreshCw
} from "lucide-react";

const VendorSettings = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailBookings: true,
    emailPayments: true,
    emailReviews: true,
    smsBookings: false,
    smsPayments: true,
    pushNotifications: true
  });

  const [businessSettings, setBusinessSettings] = useState({
    autoAcceptBookings: false,
    bookingLeadTime: 24,
    maxAdvanceBooking: 30,
    cancellationPolicy: "24_hours"
  });

  const [paymentSettings, setPaymentSettings] = useState({
    preferredCurrency: "IDR",
    paymentMethods: {
      cash: true,
      bankTransfer: true,
      digitalWallet: true,
      creditCard: false
    },
    taxRate: 0
  });

  // Fetch current settings
  const { data: vendorSettings, isLoading } = useQuery({
    queryKey: ['vendor-settings', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('No user');
      
      const { data, error } = await supabase
        .from('vendor_settings' as any)
        .select('*')
        .eq('vendor_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
  });

  // Save settings mutation
  const saveSettingsMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('vendor_settings' as any)
        .upsert({
          vendor_id: user?.id,
          notification_settings: notificationSettings,
          business_settings: businessSettings,
          payment_settings: paymentSettings,
          updated_at: new Date().toISOString()
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Settings Saved", "Your vendor settings have been updated successfully.");
      queryClient.invalidateQueries({ queryKey: ['vendor-settings'] });
    },
    onError: () => {
      showError("Error", "Failed to save settings. Please try again.");
    }
  });

  const handleSaveSettings = () => {
    saveSettingsMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Vendor Settings</h2>
          <p className="text-muted-foreground">Configure your business preferences and notifications</p>
        </div>
        <Button onClick={handleSaveSettings} disabled={saveSettingsMutation.isPending}>
          <Save className="h-4 w-4 mr-2" />
          {saveSettingsMutation.isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>Choose how you want to be notified about business activities</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-bookings">Email for new bookings</Label>
              <Switch
                id="email-bookings"
                checked={notificationSettings.emailBookings}
                onCheckedChange={(checked) => 
                  setNotificationSettings(prev => ({ ...prev, emailBookings: checked }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="email-payments">Email for payments</Label>
              <Switch
                id="email-payments"
                checked={notificationSettings.emailPayments}
                onCheckedChange={(checked) => 
                  setNotificationSettings(prev => ({ ...prev, emailPayments: checked }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="sms-bookings">SMS for urgent bookings</Label>
              <Switch
                id="sms-bookings"
                checked={notificationSettings.smsBookings}
                onCheckedChange={(checked) => 
                  setNotificationSettings(prev => ({ ...prev, smsBookings: checked }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="push-notifications">Push notifications</Label>
              <Switch
                id="push-notifications"
                checked={notificationSettings.pushNotifications}
                onCheckedChange={(checked) => 
                  setNotificationSettings(prev => ({ ...prev, pushNotifications: checked }))
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Business & Booking Settings
          </CardTitle>
          <CardDescription>Configure your availability and booking policies</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label>Auto-accept bookings</Label>
              <p className="text-sm text-muted-foreground">Automatically accept new booking requests</p>
            </div>
            <Switch
              checked={businessSettings.autoAcceptBookings}
              onCheckedChange={(checked) => 
                setBusinessSettings(prev => ({ ...prev, autoAcceptBookings: checked }))
              }
            />
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Minimum lead time (hours)</Label>
              <Input
                type="number"
                value={businessSettings.bookingLeadTime}
                onChange={(e) => 
                  setBusinessSettings(prev => ({ ...prev, bookingLeadTime: parseInt(e.target.value) }))
                }
              />
            </div>
            <div>
              <Label>Maximum advance booking (days)</Label>
              <Input
                type="number"
                value={businessSettings.maxAdvanceBooking}
                onChange={(e) => 
                  setBusinessSettings(prev => ({ ...prev, maxAdvanceBooking: parseInt(e.target.value) }))
                }
              />
            </div>
          </div>

          <div>
            <Label>Cancellation Policy</Label>
            <Select 
              value={businessSettings.cancellationPolicy} 
              onValueChange={(value) => 
                setBusinessSettings(prev => ({ ...prev, cancellationPolicy: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="flexible">Flexible - Free cancellation up to 1 hour before</SelectItem>
                <SelectItem value="moderate">Moderate - Free cancellation up to 24 hours before</SelectItem>
                <SelectItem value="strict">Strict - 50% refund up to 48 hours before</SelectItem>
                <SelectItem value="super_strict">Super Strict - Non-refundable</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Payment Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Payment & Billing Settings
          </CardTitle>
          <CardDescription>Configure payment methods and billing preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Preferred Currency</Label>
              <Select 
                value={paymentSettings.preferredCurrency}
                onValueChange={(value) => 
                  setPaymentSettings(prev => ({ ...prev, preferredCurrency: value }))
                }
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
            <div>
              <Label>Tax Rate (%)</Label>
              <Input
                type="number"
                step="0.1"
                value={paymentSettings.taxRate}
                onChange={(e) => 
                  setPaymentSettings(prev => ({ ...prev, taxRate: parseFloat(e.target.value) }))
                }
              />
            </div>
          </div>

          <div>
            <Label className="text-base font-medium">Accepted Payment Methods</Label>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="cash">Cash Payment</Label>
                <Switch
                  id="cash"
                  checked={paymentSettings.paymentMethods.cash}
                  onCheckedChange={(checked) => 
                    setPaymentSettings(prev => ({ 
                      ...prev, 
                      paymentMethods: { ...prev.paymentMethods, cash: checked }
                    }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="bank-transfer">Bank Transfer</Label>
                <Switch
                  id="bank-transfer"
                  checked={paymentSettings.paymentMethods.bankTransfer}
                  onCheckedChange={(checked) => 
                    setPaymentSettings(prev => ({ 
                      ...prev, 
                      paymentMethods: { ...prev.paymentMethods, bankTransfer: checked }
                    }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="digital-wallet">Digital Wallet</Label>
                <Switch
                  id="digital-wallet"
                  checked={paymentSettings.paymentMethods.digitalWallet}
                  onCheckedChange={(checked) => 
                    setPaymentSettings(prev => ({ 
                      ...prev, 
                      paymentMethods: { ...prev.paymentMethods, digitalWallet: checked }
                    }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="credit-card">Credit Card</Label>
                <Switch
                  id="credit-card"
                  checked={paymentSettings.paymentMethods.creditCard}
                  onCheckedChange={(checked) => 
                    setPaymentSettings(prev => ({ 
                      ...prev, 
                      paymentMethods: { ...prev.paymentMethods, creditCard: checked }
                    }))
                  }
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security & Privacy
          </CardTitle>
          <CardDescription>Manage your account security and privacy settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full">
            <Shield className="h-4 w-4 mr-2" />
            Change Password
          </Button>
          <Button variant="outline" className="w-full">
            <Globe className="h-4 w-4 mr-2" />
            Two-Factor Authentication
          </Button>
          <Button variant="outline" className="w-full">
            <RefreshCw className="h-4 w-4 mr-2" />
            Download Account Data
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorSettings;
