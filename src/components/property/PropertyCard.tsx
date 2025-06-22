
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Bed, Bath, Square, Eye } from 'lucide-react';

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
  development_status = 'completed',
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
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
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyCard;
