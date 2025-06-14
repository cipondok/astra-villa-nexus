
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, MapPin, Bed, Bath, Square, Eye, Share2, Car, View as ViewIcon } from 'lucide-react';
import { useState } from 'react';

interface Property {
  id: string;
  title: string;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  area_sqm: number;
  property_type: string;
  listing_type: string;
  image_urls?: string[];
  description?: string;
  property_features?: any;
  three_d_model_url?: string;
  virtual_tour_url?: string;
}

interface EnhancedPropertyCardProps {
  property: Property;
  language: "en" | "id";
  onView?: (id: string) => void;
  onSave?: (id: string) => void;
  onShare?: (id: string) => void;
  isSaved?: boolean;
  onView3D?: (property: any) => void;
}

const EnhancedPropertyCard = ({ 
  property, 
  language, 
  onView, 
  onSave, 
  onShare,
  isSaved = false,
  onView3D
}: EnhancedPropertyCardProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const text = {
    en: {
      view: "View Details",
      save: "Save",
      share: "Share",
      bedrooms: "Bedrooms",
      bathrooms: "Bathrooms",
      area: "Area",
      parking: "Parking",
      forSale: "For Sale",
      forRent: "For Rent",
      forLease: "For Lease",
      view3D: "3D View"
    },
    id: {
      view: "Lihat Detail",
      save: "Simpan",
      share: "Bagikan",
      bedrooms: "Kamar Tidur",
      bathrooms: "Kamar Mandi",
      area: "Luas",
      parking: "Parkir",
      forSale: "Dijual",
      forRent: "Disewa",
      forLease: "Disewakan",
      view3D: "Tampilan 3D"
    }
  };

  const currentText = text[language];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getListingTypeLabel = (type: string) => {
    switch (type) {
      case 'sale': return currentText.forSale;
      case 'rent': return currentText.forRent;
      case 'lease': return currentText.forLease;
      default: return type;
    }
  };

  const handleLikeToggle = () => {
    if (onSave) {
      onSave(property.id);
    }
  };

  const handleImageNavigation = (direction: 'prev' | 'next') => {
    if (!property.image_urls?.length) return;
    
    if (direction === 'next') {
      setCurrentImageIndex((prev) => 
        prev === property.image_urls!.length - 1 ? 0 : prev + 1
      );
    } else {
      setCurrentImageIndex((prev) => 
        prev === 0 ? property.image_urls!.length - 1 : prev - 1
      );
    }
  };

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* Image Section */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={property.image_urls?.[currentImageIndex] || "/placeholder.svg"}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Image Navigation */}
        {property.image_urls && property.image_urls.length > 1 && (
          <>
            <button
              onClick={() => handleImageNavigation('prev')}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
              ←
            </button>
            <button
              onClick={() => handleImageNavigation('next')}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
              →
            </button>
            
            {/* Image Indicators */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
              {property.image_urls.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2 z-10">
          <Badge variant="secondary" className="bg-background/90">
            {getListingTypeLabel(property.listing_type)}
          </Badge>
          <Badge variant="outline" className="bg-background/90 capitalize">
            {property.property_type}
          </Badge>
          {(property.three_d_model_url || property.virtual_tour_url) && (
            <Badge variant="secondary" className="bg-black/70 text-white backdrop-blur-sm border-none flex items-center gap-1">
              <ViewIcon className="h-4 w-4" />
              <span>3D</span>
            </Badge>
          )}
        </div>

        {/* Action Buttons */}
        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <Button
            size="sm"
            variant="outline"
            className="bg-background/90 p-2"
            onClick={handleLikeToggle}
          >
            <Heart className={`h-4 w-4 ${isSaved ? 'fill-red-500 text-red-500' : ''}`} />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="bg-background/90 p-2"
            onClick={() => onShare?.(property.id)}
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content Section */}
      <CardContent className="p-4 space-y-3">
        {/* Price */}
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-primary">
            {formatPrice(property.price)}
          </h3>
          {property.listing_type === 'rent' && (
            <span className="text-sm text-muted-foreground">/month</span>
          )}
        </div>

        {/* Title */}
        <h4 className="font-semibold text-foreground line-clamp-2 min-h-[3rem]">
          {property.title}
        </h4>

        {/* Location */}
        <div className="flex items-center gap-1 text-muted-foreground">
          <MapPin className="h-4 w-4 flex-shrink-0" />
          <span className="text-sm truncate">{property.location}</span>
        </div>

        {/* Property Details */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Bed className="h-4 w-4" />
            <span>{property.bedrooms}</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath className="h-4 w-4" />
            <span>{property.bathrooms}</span>
          </div>
          <div className="flex items-center gap-1">
            <Square className="h-4 w-4" />
            <span>{property.area_sqm} sqm</span>
          </div>
          {property.property_features?.parking && (
            <div className="flex items-center gap-1">
              <Car className="h-4 w-4" />
              <span>{property.property_features.parking}</span>
            </div>
          )}
        </div>

        {/* Features */}
        {property.property_features && (
          <div className="flex flex-wrap gap-1">
            {Object.entries(property.property_features)
              .filter(([key, value]) => value && key !== 'parking')
              .slice(0, 3)
              .map(([key, value]) => (
                <Badge key={key} variant="outline" className="text-xs">
                  {key.replace('_', ' ')}
                </Badge>
              ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex w-full mt-3 gap-2 flex-wrap">
          <Button 
            className="flex-1" 
            onClick={() => onView?.(property.id)}
          >
            <Eye className="h-4 w-4 mr-2" />
            {currentText.view}
          </Button>
          {(property.three_d_model_url || property.virtual_tour_url) && (
            <Button 
               variant="outline"
               className="flex-1"
               onClick={() => onView3D?.(property)}
             >
               <ViewIcon className="h-4 w-4 mr-2" />
               {currentText.view3D}
           </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedPropertyCard;
