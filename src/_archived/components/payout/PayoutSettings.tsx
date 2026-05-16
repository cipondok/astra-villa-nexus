import React, { useState } from 'react';
import { getCurrencyFormatter } from '@/stores/currencyStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Building2, 
  CreditCard, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Shield,
  Wallet
} from 'lucide-react';
import { usePayoutSystem, INDONESIAN_BANKS } from '@/hooks/usePayoutSystem';
import Price from '@/components/ui/Price';
import { toast } from 'sonner';

export const PayoutSettings: React.FC = () => {
  const { 
    payoutSettings, 
    savePayoutSettings, 
    isLoading,
    availableBalance,
    pendingBalance,
    requestPayout,
    isVerified
  } = usePayoutSystem();

  const [formData, setFormData] = useState({
    bank_name: payoutSettings?.bank_name || '',
    bank_code: payoutSettings?.bank_code || '',
    account_number: payoutSettings?.account_number || '',
    account_holder_name: payoutSettings?.account_holder_name || '',
    minimum_payout: payoutSettings?.minimum_payout || 50000,
    auto_payout_enabled: payoutSettings?.auto_payout_enabled ?? true,
    tax_id: payoutSettings?.tax_id || ''
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isRequestingPayout, setIsRequestingPayout] = useState(false);

  const handleSave = async () => {
    if (!formData.bank_name || !formData.account_number || !formData.account_holder_name) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSaving(true);
    await savePayoutSettings(formData);
    setIsSaving(false);
  };

  const handleRequestPayout = async () => {
    if (availableBalance < (formData.minimum_payout || 50000)) {
      toast.error('Insufficient balance for payout');
      return;
    }

    setIsRequestingPayout(true);
    await requestPayout();
    setIsRequestingPayout(false);
  };

  const handleBankChange = (bankCode: string) => {
    const bank = INDONESIAN_BANKS.find(b => b.code === bankCode);
    setFormData(prev => ({
      ...prev,
      bank_code: bankCode,
      bank_name: bank?.name || ''
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Balance Overview */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Available Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              <Price amount={availableBalance} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Ready for withdrawal</p>
            <Button 
              className="w-full mt-3" 
              size="sm"
              disabled={availableBalance < 50000 || isRequestingPayout || !payoutSettings}
              onClick={handleRequestPayout}
            >
              {isRequestingPayout ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Request Payout'
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Pending Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-5">
              <Price amount={pendingBalance} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Processing or held</p>
          </CardContent>
        </Card>
      </div>

      {/* Bank Account Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Bank Account
              </CardTitle>
              <CardDescription>Where your earnings will be sent</CardDescription>
            </div>
            {isVerified ? (
              <Badge className="gap-1" variant="default">
                <CheckCircle2 className="h-3 w-3" />
                Verified
              </Badge>
            ) : (
              <Badge variant="secondary" className="gap-1">
                <AlertCircle className="h-3 w-3" />
                Pending Verification
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Bank / E-Wallet *</Label>
            <Select 
              value={formData.bank_code} 
              onValueChange={handleBankChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your bank" />
              </SelectTrigger>
              <SelectContent>
                {INDONESIAN_BANKS.map(bank => (
                  <SelectItem key={bank.code} value={bank.code}>
                    {bank.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Account Number *</Label>
            <Input
              placeholder="Enter account number"
              value={formData.account_number}
              onChange={(e) => setFormData(prev => ({ ...prev, account_number: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label>Account Holder Name *</Label>
            <Input
              placeholder="Name as shown on account"
              value={formData.account_holder_name}
              onChange={(e) => setFormData(prev => ({ ...prev, account_holder_name: e.target.value }))}
            />
            <p className="text-xs text-muted-foreground">
              Must match exactly with bank records
            </p>
          </div>

          <div className="space-y-2">
            <Label>Tax ID (NPWP) - Optional</Label>
            <Input
              placeholder="XX.XXX.XXX.X-XXX.XXX"
              value={formData.tax_id}
              onChange={(e) => setFormData(prev => ({ ...prev, tax_id: e.target.value }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Payout Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Payout Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Auto Payout</Label>
              <p className="text-sm text-muted-foreground">
                Automatically transfer when balance reaches minimum
              </p>
            </div>
            <Switch
              checked={formData.auto_payout_enabled}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, auto_payout_enabled: checked }))}
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Minimum Payout Amount</Label>
            <Select 
              value={formData.minimum_payout.toString()} 
              onValueChange={(v) => setFormData(prev => ({ ...prev, minimum_payout: parseInt(v) }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="50000">{getCurrencyFormatter()(50000)}</SelectItem>
                <SelectItem value="100000">{getCurrencyFormatter()(100000)}</SelectItem>
                <SelectItem value="250000">{getCurrencyFormatter()(250000)}</SelectItem>
                <SelectItem value="500000">{getCurrencyFormatter()(500000)}</SelectItem>
                <SelectItem value="1000000">{getCurrencyFormatter()(1000000)}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="p-3 bg-muted rounded-lg text-sm">
            <p className="font-medium mb-1">Transfer Fee</p>
            <p className="text-muted-foreground">
              {getCurrencyFormatter()(6500)} per transfer (deducted from payout amount)
            </p>
          </div>
        </CardContent>
      </Card>

      <Button 
        className="w-full" 
        onClick={handleSave}
        disabled={isSaving}
      >
        {isSaving ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Saving...
          </>
        ) : (
          'Save Payout Settings'
        )}
      </Button>
    </div>
  );
};

export default PayoutSettings;
