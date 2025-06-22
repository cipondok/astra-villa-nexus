
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Bed, Bath, Square, CreditCard, ShoppingCart } from 'lucide-react';
import { Property } from '@/services/astraPaymentAPI';
import { useAuth } from '@/contexts/AuthContext';
import PaymentPurchaseModal from '@/components/modals/PaymentPurchaseModal';

interface AstraPaymentPropertyCardProps {
  property: Property;
}

const AstraPaymentPropertyCard: React.FC<AstraPaymentPropertyCardProps> = ({ property }) => {
  const { isAuthenticated } = useAuth();
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  const isAvailable = property.status === 'available';

  return (
    <>
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
              {property.status.replace('_', ' ').toUpperCase()}
            </Badge>
            <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
              <CreditCard className="h-3 w-3 mr-1" />
              Payment
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
            <div className="text-2xl font-bold text-blue-600 flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              {formatPrice(property.price, property.currency)}
            </div>
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
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Accepts:</span>
              {property.payment_methods_accepted.slice(0, 3).map((method) => (
                <Badge key={method} variant="outline" className="text-xs">
                  {method}
                </Badge>
              ))}
              {property.payment_methods_accepted.length > 3 && (
                <span className="text-xs">+{property.payment_methods_accepted.length - 3} more</span>
              )}
            </div>

            {isAvailable ? (
              <Button 
                className="w-full" 
                disabled={!isAuthenticated}
                onClick={() => setShowPurchaseModal(true)}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                {!isAuthenticated ? 'Login to Purchase' : 'Purchase Property'}
              </Button>
            ) : (
              <Button disabled className="w-full">
                {property.status === 'sold' ? 'Property Sold' : 'Reserved'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <PaymentPurchaseModal
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        property={property}
        onPurchaseSuccess={() => {
          setShowPurchaseModal(false);
          // Optionally refresh properties list
        }}
      />
    </>
  );
};

export default AstraPaymentPropertyCard;
