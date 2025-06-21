
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MapPin, Bed, Bath, Square, Coins, ShoppingCart } from 'lucide-react';
import { Property } from '@/services/astraTokenAPI';
import { useAstraToken } from '@/hooks/useAstraToken';
import { useAuth } from '@/contexts/AuthContext';
import AstraBalanceDisplay from './AstraBalanceDisplay';

interface AstraPropertyCardProps {
  property: Property;
}

const AstraPropertyCard: React.FC<AstraPropertyCardProps> = ({ property }) => {
  const { isAuthenticated } = useAuth();
  const { balance, purchaseProperty, isLoading } = useAstraToken();
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);

  const formatAstraPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const formatUSDPrice = (price?: number) => {
    if (!price) return null;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const canAfford = balance >= property.price_astra;
  const isAvailable = property.status === 'available';

  const handlePurchase = async () => {
    setIsPurchasing(true);
    const success = await purchaseProperty(property);
    if (success) {
      setShowPurchaseDialog(false);
    }
    setIsPurchasing(false);
  };

  return (
    <Card className="w-full hover:shadow-lg transition-shadow">
      <div className="relative">
        {property.images && property.images.length > 0 ? (
          <img
            src={property.images[0]}
            alt={property.title}
            className="w-full h-48 object-cover rounded-t-lg"
          />
        ) : (
          <div className="w-full h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
            <span className="text-gray-400">No image available</span>
          </div>
        )}
        
        <div className="absolute top-2 left-2 flex gap-2">
          <Badge variant={isAvailable ? 'default' : 'secondary'}>
            {isAvailable ? 'Available' : 'Sold'}
          </Badge>
          <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
            <Coins className="h-3 w-3 mr-1" />
            ASTRA
          </Badge>
        </div>
      </div>

      <CardHeader>
        <CardTitle className="text-lg">{property.title}</CardTitle>
        <CardDescription className="flex items-center gap-1">
          <MapPin className="h-4 w-4" />
          {property.location}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="text-2xl font-bold text-orange-600 flex items-center gap-2">
            <Coins className="h-5 w-5" />
            {formatAstraPrice(property.price_astra)} ASTRA
          </div>
          {property.price_usd && (
            <div className="text-sm text-gray-500">
              ≈ {formatUSDPrice(property.price_usd)}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-600">
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
          <p className="text-sm text-gray-600 line-clamp-2">{property.description}</p>
        )}

        <div className="space-y-2">
          {isAuthenticated && (
            <div className="flex items-center justify-between text-sm">
              <span>Your balance:</span>
              <AstraBalanceDisplay variant="inline" />
            </div>
          )}

          {isAvailable ? (
            <Dialog open={showPurchaseDialog} onOpenChange={setShowPurchaseDialog}>
              <DialogTrigger asChild>
                <Button 
                  className="w-full" 
                  disabled={!isAuthenticated || !canAfford}
                  variant={canAfford ? "default" : "outline"}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {!isAuthenticated 
                    ? 'Login to Purchase'
                    : !canAfford 
                    ? 'Insufficient Balance'
                    : 'Buy with ASTRA'
                  }
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm Purchase</DialogTitle>
                  <DialogDescription>
                    You are about to purchase "{property.title}" for {formatAstraPrice(property.price_astra)} ASTRA tokens.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Property Price:</span>
                      <span className="font-bold text-orange-600">
                        {formatAstraPrice(property.price_astra)} ASTRA
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span>Your Current Balance:</span>
                      <AstraBalanceDisplay variant="inline" />
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Balance After Purchase:</span>
                      <span className="font-medium">
                        {formatAstraPrice(balance - property.price_astra)} ASTRA
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowPurchaseDialog(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handlePurchase}
                      disabled={isPurchasing || isLoading}
                      className="flex-1"
                    >
                      {isPurchasing ? 'Processing...' : 'Confirm Purchase'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          ) : (
            <Button disabled className="w-full">
              Property Sold
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AstraPropertyCard;
