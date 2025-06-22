
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditCard, Plus, Wallet, Building2 } from 'lucide-react';
import { PaymentMethod } from '@/services/astraPaymentAPI';
import { useAstraPayment } from '@/hooks/useAstraPayment';

interface PaymentMethodSelectorProps {
  selectedPaymentMethodId?: string;
  onPaymentMethodSelect: (paymentMethodId: string) => void;
  showAddNew?: boolean;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedPaymentMethodId,
  onPaymentMethodSelect,
  showAddNew = true
}) => {
  const { paymentMethods, addPaymentMethod, isLoading } = useAstraPayment();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newPaymentMethod, setNewPaymentMethod] = useState({
    type: 'card' as const,
    provider: '',
    last_four: '',
  });

  const getPaymentMethodIcon = (type: string) => {
    switch (type) {
      case 'card':
        return <CreditCard className="h-4 w-4" />;
      case 'bank_transfer':
        return <Building2 className="h-4 w-4" />;
      case 'digital_wallet':
        return <Wallet className="h-4 w-4" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  const handleAddPaymentMethod = async () => {
    const success = await addPaymentMethod({
      ...newPaymentMethod,
      is_default: paymentMethods.length === 0,
    });

    if (success) {
      setShowAddDialog(false);
      setNewPaymentMethod({ type: 'card', provider: '', last_four: '' });
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3">
        {paymentMethods.map((method) => (
          <Card 
            key={method.id} 
            className={`cursor-pointer transition-colors ${
              selectedPaymentMethodId === method.id 
                ? 'border-primary bg-primary/5' 
                : 'hover:border-muted-foreground/50'
            }`}
            onClick={() => onPaymentMethodSelect(method.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getPaymentMethodIcon(method.type)}
                  <div>
                    <div className="font-medium">{method.provider}</div>
                    {method.last_four && (
                      <div className="text-sm text-muted-foreground">
                        •••• {method.last_four}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {method.is_default && (
                    <Badge variant="secondary">Default</Badge>
                  )}
                  <Badge variant="outline" className="capitalize">
                    {method.type.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {showAddNew && (
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Payment Method
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Payment Method</DialogTitle>
              <DialogDescription>
                Add a new payment method to your account
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="type">Payment Type</Label>
                <Select 
                  value={newPaymentMethod.type} 
                  onValueChange={(value: 'card' | 'bank_transfer' | 'digital_wallet') => 
                    setNewPaymentMethod(prev => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="card">Credit/Debit Card</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="digital_wallet">Digital Wallet</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="provider">Provider</Label>
                <Input
                  id="provider"
                  placeholder="e.g., Visa, PayPal, Chase Bank"
                  value={newPaymentMethod.provider}
                  onChange={(e) => setNewPaymentMethod(prev => ({ 
                    ...prev, 
                    provider: e.target.value 
                  }))}
                />
              </div>

              {newPaymentMethod.type === 'card' && (
                <div className="space-y-2">
                  <Label htmlFor="last_four">Last 4 Digits</Label>
                  <Input
                    id="last_four"
                    placeholder="1234"
                    maxLength={4}
                    value={newPaymentMethod.last_four}
                    onChange={(e) => setNewPaymentMethod(prev => ({ 
                      ...prev, 
                      last_four: e.target.value 
                    }))}
                  />
                </div>
              )}

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowAddDialog(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddPaymentMethod}
                  disabled={isLoading || !newPaymentMethod.provider}
                  className="flex-1"
                >
                  {isLoading ? 'Adding...' : 'Add Payment Method'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {paymentMethods.length === 0 && !showAddNew && (
        <Card>
          <CardContent className="p-6 text-center">
            <CreditCard className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-medium mb-2">No Payment Methods</h3>
            <p className="text-sm text-muted-foreground">
              Add a payment method to purchase properties
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PaymentMethodSelector;
