
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Coins, MapPin, Bed, Bath, Square, AlertTriangle } from 'lucide-react';
import { Property } from '@/services/astraTokenAPI';
import { useAuth } from '@/contexts/AuthContext';
import { useAstraToken } from '@/hooks/useAstraToken';
import { toast } from 'sonner';

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property | null;
  onPurchaseSuccess?: () => void;
}

const PurchaseModal: React.FC<PurchaseModalProps> = ({
  isOpen,
  onClose,
  property,
  onPurchaseSuccess
}) => {
  const { user, isAuthenticated } = useAuth();
  const { balance, purchaseProperty, isLoading } = useAstraToken();
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseComplete, setPurchaseComplete] = useState(false);

  if (!property) return null;

  const canAfford = balance >= property.price_astra;
  const balanceAfterPurchase = balance - property.price_astra;

  const formatAstraPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const handlePurchase = async () => {
    if (!isAuthenticated || !user) {
      toast.error('Please login to purchase properties');
      return;
    }

    if (!canAfford) {
      toast.error('Insufficient ASTRA balance');
      return;
    }

    setIsPurchasing(true);
    try {
      const success = await purchaseProperty(property);
      if (success) {
        setPurchaseComplete(true);
        onPurchaseSuccess?.();
        toast.success('Property purchased successfully!');
      }
    } catch (error) {
      toast.error('Purchase failed. Please try again.');
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleClose = () => {
    setPurchaseComplete(false);
    onClose();
  };

  if (purchaseComplete) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-6 w-6" />
              Purchase Successful!
            </DialogTitle>
            <DialogDescription>
              Congratulations! You have successfully purchased the property.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="font-medium text-green-800 mb-1">{property.title}</div>
              <div className="text-sm text-green-600">
                Purchase Amount: {formatAstraPrice(property.price_astra)} ASTRA
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-orange-500" />
            Purchase Property with ASTRA
          </DialogTitle>
          <DialogDescription>
            Review the property details and confirm your purchase
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

          {/* Purchase Details */}
          <div className="space-y-4">
            <h4 className="font-semibold">Purchase Summary</h4>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>Property Price:</span>
                <span className="font-semibold text-orange-600">
                  {formatAstraPrice(property.price_astra)} ASTRA
                </span>
              </div>
              
              {property.price_usd && (
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <span>USD Equivalent:</span>
                  <span>${property.price_usd.toLocaleString()}</span>
                </div>
              )}
              
              <Separator />
              
              <div className="flex justify-between items-center">
                <span>Your Current Balance:</span>
                <span className="font-medium">
                  {formatAstraPrice(balance)} ASTRA
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span>Balance After Purchase:</span>
                <span className={`font-medium ${balanceAfterPurchase >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatAstraPrice(balanceAfterPurchase)} ASTRA
                </span>
              </div>
            </div>

            {!canAfford && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm font-medium">Insufficient Balance</span>
                </div>
                <p className="text-xs text-red-600 mt-1">
                  You need {formatAstraPrice(property.price_astra - balance)} more ASTRA to purchase this property.
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
              disabled={!isAuthenticated || !canAfford || isPurchasing || isLoading}
              className="flex-1"
            >
              {isPurchasing ? 'Processing...' : `Buy for ${formatAstraPrice(property.price_astra)} ASTRA`}
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

export default PurchaseModal;
