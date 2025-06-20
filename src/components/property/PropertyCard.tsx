
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { MapPin, Bed, Bath, Square, Eye, Calendar } from 'lucide-react';
import PremiumListing from '@/components/token-gated/PremiumListing';
import RentPaymentFlow from '@/components/rent/RentPaymentFlow';

interface PropertyCardProps {
  id: string;
  title: string;
  description?: string;
  location: string;
  price: number;
  bedrooms?: number;
  bathrooms?: number;
  area_sqm?: number;
  listing_type: string;
  images?: string[];
  is_premium?: boolean;
  required_token_balance?: number;
  development_status?: string;
}

const PropertyCard: React.FC<PropertyCardProps> = ({
  id,
  title,
  description,
  location,
  price,
  bedrooms,
  bathrooms,
  area_sqm,
  listing_type,
  images,
  is_premium = false,
  required_token_balance = 0,
  development_status = 'completed',
}) => {
  const [showRentFlow, setShowRentFlow] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const dailyRateInTokens = "50"; // This would be calculated based on property price and token exchange rate
  const contractAddress = "0x742d35Cc6638C0532CDE2d4C2deDFc54Ae8c0a9F"; // Example contract address

  const PropertyContent = () => (
    <Card className="w-full hover:shadow-lg transition-shadow">
      <div className="relative">
        {images && images.length > 0 ? (
          <img
            src={images[0]}
            alt={title}
            className="w-full h-48 object-cover rounded-t-lg"
          />
        ) : (
          <div className="w-full h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
            <span className="text-gray-400">No image available</span>
          </div>
        )}
        
        <div className="absolute top-2 left-2 flex gap-2">
          <Badge variant={listing_type === 'sale' ? 'default' : 'secondary'}>
            {listing_type === 'sale' ? 'For Sale' : 'For Rent'}
          </Badge>
          {is_premium && (
            <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
              Premium
            </Badge>
          )}
        </div>

        {development_status !== 'completed' && (
          <div className="absolute top-2 right-2">
            <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
              {development_status === 'new_project' ? 'New Project' : 'Pre-Launch'}
            </Badge>
          </div>
        )}
      </div>

      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription className="flex items-center gap-1">
          <MapPin className="h-4 w-4" />
          {location}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="text-2xl font-bold text-green-600">
          {formatPrice(price)}
          {listing_type === 'rent' && <span className="text-sm font-normal text-gray-500">/month</span>}
        </div>

        {(bedrooms || bathrooms || area_sqm) && (
          <div className="flex items-center gap-4 text-sm text-gray-600">
            {bedrooms && (
              <div className="flex items-center gap-1">
                <Bed className="h-4 w-4" />
                {bedrooms} bed
              </div>
            )}
            {bathrooms && (
              <div className="flex items-center gap-1">
                <Bath className="h-4 w-4" />
                {bathrooms} bath
              </div>
            )}
            {area_sqm && (
              <div className="flex items-center gap-1">
                <Square className="h-4 w-4" />
                {area_sqm} sqm
              </div>
            )}
          </div>
        )}

        {description && (
          <p className="text-sm text-gray-600 line-clamp-2">{description}</p>
        )}

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1">
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
          
          {listing_type === 'rent' && (
            <Dialog open={showRentFlow} onOpenChange={setShowRentFlow}>
              <DialogTrigger asChild>
                <Button className="flex-1">
                  <Calendar className="h-4 w-4 mr-2" />
                  Rent Now
                </Button>
              </DialogTrigger>
              <DialogContent>
                <RentPaymentFlow
                  propertyId={id}
                  propertyTitle={title}
                  dailyRate={dailyRateInTokens}
                  contractAddress={contractAddress}
                  onClose={() => setShowRentFlow(false)}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardContent>
    </Card>
  );

  // Wrap premium properties with token gate
  if (is_premium && required_token_balance > 0) {
    return (
      <PremiumListing
        requiredTokens={required_token_balance.toString()}
        propertyTitle={title}
        fallbackMessage={`This premium property requires ${required_token_balance} ASTRA tokens to view`}
      >
        <PropertyContent />
      </PremiumListing>
    );
  }

  return <PropertyContent />;
};

export default PropertyCard;
