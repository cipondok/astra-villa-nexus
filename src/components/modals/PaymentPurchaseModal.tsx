
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, CreditCard, MapPin, Bed, Bath, Square, AlertTriangle } from 'lucide-react';
import { Property } from '@/services/astraPaymentAPI';
import { useAuth } from '@/contexts/AuthContext';
import { useAstraPayment } from '@/hooks/useAstraPayment';
import PaymentMethodSelector from '@/components/payment/PaymentMethodSelector';
import { toast } from 'sonner';

interface PaymentPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property | null;
  onPurchaseSuccess?: () => void;
}

const PaymentPurchaseModal: React.FC<PaymentPurchaseModalProps> = ({
  isOpen,
  onClose,
  property,
  onPurchaseSuccess
}) => {
  const { user, isAuthenticated } = useAuth();
  const { paymentMethods, purchaseProperty, isLoading } = useAstraPayment();
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string>('');
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseComplete, setPurchaseComplete] = useState(false);

  if (!property) return null;

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  const handlePurchase = async () => {
    if (!isAuthenticated || !user) {
      toast.error('Please login to purchase properties');
      return;
    }

    if (!selectedPaymentMethodId) {
      toast.error('Please select a payment method');
      return;
    }

    setIsPurchasing(true);
    try {
      const success = await purchaseProperty(property, selectedPaymentMethodId);
      if (success) {
        setPurchaseComplete(true);
        onPurchaseSuccess?.();
      }
    } catch (error) {
      toast.error('Purchase failed. Please try again.');
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleClose = () => {
    setPurchaseComplete(false);
    setSelectedPaymentMethodId('');
    onClose();
  };

  if (purchaseComplete) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-6 w-6" />
              Payment Initiated!
            </DialogTitle>
            <DialogDescription>
              Your payment has been initiated. Please complete the payment process in the new tab.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="font-medium text-green-800 mb-1">{property.title}</div>
              <div className="text-sm text-green-600">
                Amount: {formatPrice(property.price, property.currency)}
              </div>
            </div>
            
            <div className="text-center">
              <Button onClick={handleClose} className="w-full">
                Continue Browsing
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-blue-500" />
            Purchase Property
          </DialogTitle>
          <DialogDescription>
            Select a payment method and complete your purchase
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Property Details */}
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg">{property.title}</h3>
              <div className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {property.location}
              </div>
            </div>

            {property.images && property.images.length > 0 && (
              <div className="aspect-video rounded-lg overflow-hidden">
                <img
                  src={property.images[0]}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Bed className="h-4 w-4" />
                {property.bedrooms} bed
              </div>
              <div className="flex items-center gap-1">
                <Bath className="h-4 w-4" />
                {property.bathrooms} bath
              </div>
              <div className="flex items-center gap-1">
                <Square className="h-4 w-4" />
                {property.square_feet} sqft
              </div>
            </div>

            {property.description && (
              <p className="text-sm text-muted-foreground">{property.description}</p>
            )}
          </div>

          <Separator />

          {/* Payment Method Selection */}
          <div className="space-y-4">
            <h4 className="font-semibold">Select Payment Method</h4>
            <PaymentMethodSelector
              selectedPaymentMethodId={selectedPaymentMethodId}
              onPaymentMethodSelect={setSelectedPaymentMethodId}
            />
          </div>

          <Separator />

          {/* Purchase Summary */}
          <div className="space-y-4">
            <h4 className="font-semibold">Purchase Summary</h4>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>Property Price:</span>
                <span className="font-semibold text-blue-600">
                  {formatPrice(property.price, property.currency)}
                </span>
              </div>
              
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>Payment Methods Accepted:</span>
                <div className="flex gap-1">
                  {property.payment_methods_accepted.map((method) => (
                    <Badge key={method} variant="outline" className="text-xs">
                      {method}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {!selectedPaymentMethodId && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-700">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm font-medium">Payment Method Required</span>
                </div>
                <p className="text-xs text-yellow-600 mt-1">
                  Please select a payment method to proceed with the purchase.
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handlePurchase}
              disabled={!isAuthenticated || !selectedPaymentMethodId || isPurchasing || isLoading}
              className="flex-1"
            >
              {isPurchasing ? 'Processing...' : `Pay ${formatPrice(property.price, property.currency)}`}
            </Button>
          </div>

          {!isAuthenticated && (
            <div className="text-center text-sm text-muted-foreground">
              Please login to purchase this property
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentPurchaseModal;
