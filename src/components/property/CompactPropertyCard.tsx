
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, MapPin, Bed, Bath, Square, Star, Eye, Box } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface Property {
  id: string;
  title: string;
  location?: string;
  price: string | number;
  property_type?: string;
  listing_type?: string;
  bedrooms: number;
  bathrooms: number;
  area_sqm: number;
  images?: string[] | string;
  status?: string;
  created_at?: string;
  state?: string;
  city?: string;
  area?: string;
}

interface CompactPropertyCardProps {
  property: Property;
  language: "en" | "id";
  isSaved?: boolean;
  onSave?: () => void;
  onView?: () => void;
  onView3D?: (property: Property) => void;
}

const CompactPropertyCard = ({ 
  property, 
  language, 
  isSaved = false, 
  onSave, 
  onView, 
  onView3D 
}: CompactPropertyCardProps) => {
  const navigate = useNavigate();

  const text = {
    en: {
      viewDetails: "View Details",
      forSale: "For Sale",
      forRent: "For Rent",
      bedrooms: "bed",
      bathrooms: "bath",
      area: "sqm",
      view3D: "3D View"
    },
    id: {
      viewDetails: "Lihat Detail",
      forSale: "Dijual",
      forRent: "Disewa",
      bedrooms: "kmr",
      bathrooms: "km",
      area: "m²",
      view3D: "Tampilan 3D"
    }
  };

  const currentText = text[language];

  // Handle different image formats
  const getPropertyImage = () => {
    if (!property.images) {
      return "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop";
    }
    
    if (Array.isArray(property.images)) {
      return property.images[0] || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop";
    }
    
    if (typeof property.images === 'string') {
      try {
        const parsed = JSON.parse(property.images);
        return Array.isArray(parsed) ? parsed[0] : property.images;
      } catch {
        return property.images;
      }
    }
    
    return "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop";
  };

  const getTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'sale':
      case 'buy':
        return 'bg-green-500 text-white';
      case 'rent':
        return 'bg-blue-500 text-white';
      case 'new-project':
        return 'bg-orange-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'sale':
      case 'buy':
        return currentText.forSale;
      case 'rent':
        return currentText.forRent;
      default:
        return type || 'Property';
    }
  };

  const formatPrice = (price: string | number) => {
    if (typeof price === 'number') {
      return `Rp ${price.toLocaleString('id-ID')}`;
    }
    return price || 'Contact for price';
  };

  const handleViewDetails = () => {
    if (onView) {
      onView();
    } else {
      navigate(`/property/${property.id}`);
    }
  };

  const displayLocation = property.location || `${property.city || ''}, ${property.state || ''}`.trim().replace(/^,|,$/, '') || 'Location not specified';

  return (
    <Card 
      className="group overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] border border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 cursor-pointer"
      onClick={handleViewDetails}
    >
      <div className="relative overflow-hidden">
        <img
          src={getPropertyImage()}
          alt={property.title}
          className="w-full h-32 sm:h-36 object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.currentTarget.src = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop";
          }}
        />
        
        {/* Compact Badges */}
        <div className="absolute top-2 left-2">
          <Badge className={`${getTypeColor(property.listing_type || property.property_type || '')} text-xs px-2 py-1 rounded-full`}>
            {getTypeLabel(property.listing_type || property.property_type || '')}
          </Badge>
        </div>

        {/* Action Buttons */}
        <div className="absolute top-2 right-2 flex gap-1">
          {onSave && (
            <Button
              variant="ghost"
              size="sm"
              className={`h-7 w-7 rounded-full bg-white/90 hover:bg-white transition-all duration-300 ${
                isSaved ? 'text-red-500 scale-110' : 'text-gray-600'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                onSave();
              }}
            >
              <Heart className={`h-3 w-3 transition-all duration-300 ${isSaved ? 'fill-current' : ''}`} />
            </Button>
          )}
          
          {onView3D && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 rounded-full bg-white/90 hover:bg-white text-blue-500 transition-all duration-300"
              onClick={(e) => {
                e.stopPropagation();
                onView3D(property);
              }}
            >
              <Box className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Rating Badge */}
        <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded-lg flex items-center gap-1 backdrop-blur-sm">
          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
          <span className="text-xs font-medium">{(Math.random() * 2 + 3).toFixed(1)}</span>
        </div>
      </div>

      <CardContent className="p-3">
        <h3 className="text-sm font-semibold mb-1 group-hover:text-blue-600 transition-colors duration-300 line-clamp-1">
          {property.title}
        </h3>
        
        <div className="flex items-center text-gray-500 dark:text-gray-400 mb-2">
          <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
          <span className="text-xs line-clamp-1">{displayLocation}</span>
        </div>

        <div className="text-lg font-bold text-blue-600 mb-2 line-clamp-1">
          {formatPrice(property.price)}
        </div>

        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-3">
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
              <span>{property.area_sqm || 0}m²</span>
            </div>
          </div>
        </div>

        <Button 
          size="sm"
          className="w-full h-8 bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 text-white font-medium transition-all duration-300 text-xs rounded-xl"
          onClick={(e) => {
            e.stopPropagation();
            handleViewDetails();
          }}
        >
          <Eye className="h-3 w-3 mr-1" />
          {currentText.viewDetails}
        </Button>
      </CardContent>
    </Card>
  );
};

export default CompactPropertyCard;
