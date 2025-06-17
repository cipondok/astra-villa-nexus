
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, MapPin, Bed, Bath, Square, Eye, View as ViewIcon } from 'lucide-react';
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

interface CompactPropertyCardProps {
  property: Property;
  language: "en" | "id";
  onView?: (id: string) => void;
  onSave?: (id: string) => void;
  onShare?: (id: string) => void;
  isSaved?: boolean;
  onView3D?: (property: any) => void;
}

const CompactPropertyCard = ({ 
  property, 
  language, 
  onView, 
  onSave, 
  onShare,
  isSaved = false,
  onView3D
}: CompactPropertyCardProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const text = {
    en: {
      view: "View",
      save: "Save",
      share: "Share",
      bedrooms: "bed",
      bathrooms: "bath",
      area: "sqm",
      parking: "Parking",
      forSale: "For Sale",
      forRent: "For Rent",
      forLease: "For Lease",
      view3D: "3D",
      perMonth: "/mo"
    },
    id: {
      view: "Lihat",
      save: "Simpan",
      share: "Bagikan",
      bedrooms: "kt",
      bathrooms: "km",
      area: "m²",
      parking: "Parkir",
      forSale: "Dijual",
      forRent: "Disewa",
      forLease: "Disewakan",
      view3D: "3D",
      perMonth: "/bln"
    }
  };

  const currentText = text[language];

  const formatPrice = (price: number) => {
    if (!price) return "Contact for price";
    
    if (price >= 1000000000) {
      return `${(price / 1000000000).toFixed(1)}B`;
    } else if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)}M`;
    } else if (price >= 1000) {
      return `${(price / 1000).toFixed(0)}K`;
    }
    return price.toString();
  };

  const getListingTypeLabel = (type: string) => {
    switch (type) {
      case 'sale': return currentText.forSale;
      case 'rent': return currentText.forRent;
      case 'lease': return currentText.forLease;
      default: return type;
    }
  };

  const handleImageNavigation = (direction: 'prev' | 'next', e: React.MouseEvent) => {
    e.stopPropagation();
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

  // Use first image or placeholder
  const currentImage = property.image_urls?.[currentImageIndex] || "/placeholder.svg";

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer border-0 shadow-md bg-white">
      {/* Compact Image Section */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={currentImage}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onClick={() => onView?.(property.id)}
        />

        {/* Image Navigation - Smaller */}
        {property.image_urls && property.image_urls.length > 1 && (
          <>
            <button
              onClick={(e) => handleImageNavigation('prev', e)}
              className="absolute left-1 top-1/2 -translate-y-1/2 bg-black/60 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-xs w-6 h-6 flex items-center justify-center"
            >
              ‹
            </button>
            <button
              onClick={(e) => handleImageNavigation('next', e)}
              className="absolute right-1 top-1/2 -translate-y-1/2 bg-black/60 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-xs w-6 h-6 flex items-center justify-center"
            >
              ›
            </button>
            {/* Compact Indicators */}
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
              {property.image_urls.map((_, index) => (
                <div
                  key={index}
                  className={`w-1.5 h-1.5 rounded-full ${
                    index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* Compact Top Badges */}
        <div className="absolute top-2 left-2 flex gap-1">
          <Badge variant="secondary" className="bg-black/70 text-white text-xs px-2 py-0.5 backdrop-blur-sm border-none">
            {getListingTypeLabel(property.listing_type)}
          </Badge>
          {(property.three_d_model_url || property.virtual_tour_url) && (
            <Badge variant="secondary" className="bg-blue-500/80 text-white text-xs px-1.5 py-0.5 backdrop-blur-sm border-none">
              3D
            </Badge>
          )}
        </div>

        {/* Compact Action Buttons */}
        <div className="absolute top-2 right-2 flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            className="w-7 h-7 p-0 bg-white/90 hover:bg-white"
            onClick={(e) => {
              e.stopPropagation();
              onSave?.(property.id);
            }}
          >
            <Heart className={`h-3 w-3 ${isSaved ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
          </Button>
          {(property.three_d_model_url || property.virtual_tour_url) && (
            <Button
              size="sm"
              variant="ghost"
              className="w-7 h-7 p-0 bg-white/90 hover:bg-white"
              onClick={(e) => {
                e.stopPropagation();
                onView3D?.(property);
              }}
            >
              <ViewIcon className="h-3 w-3 text-blue-600" />
            </Button>
          )}
        </div>
      </div>

      {/* Compact Content */}
      <CardContent className="p-3 space-y-2">
        {/* Price - More prominent */}
        <div className="flex items-start justify-between">
          <div>
            <div className="text-lg font-bold text-primary">
              IDR {formatPrice(property.price)}
              {property.listing_type === 'rent' && (
                <span className="text-xs text-muted-foreground font-normal">{currentText.perMonth}</span>
              )}
            </div>
            <div className="text-xs text-muted-foreground capitalize">
              {property.property_type}
            </div>
          </div>
        </div>

        {/* Compact Title */}
        <h4 className="font-medium text-sm text-foreground line-clamp-2 leading-tight">
          {property.title}
        </h4>

        {/* Compact Location */}
        <div className="flex items-center gap-1 text-muted-foreground">
          <MapPin className="h-3 w-3 flex-shrink-0" />
          <span className="text-xs truncate">{property.location}</span>
        </div>

        {/* Compact Property Details */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Bed className="h-3 w-3" />
              <span>{property.bedrooms || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <Bath className="h-3 w-3" />
              <span>{property.bathrooms || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <Square className="h-3 w-3" />
              <span>{property.area_sqm || 0}</span>
            </div>
          </div>
        </div>

        {/* Compact Action Button */}
        <Button 
          className="w-full h-8 text-xs"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            onView?.(property.id);
          }}
        >
          <Eye className="h-3 w-3 mr-1" />
          {currentText.view}
        </Button>
      </CardContent>
    </Card>
  );
};

export default CompactPropertyCard;
