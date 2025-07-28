
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BaseProperty } from '@/types/property';
import { formatIDR } from '@/utils/currency';
import { 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  Heart, 
  Share2, 
  ExternalLink,
  Building2,
  Eye
} from 'lucide-react';

interface PropertySearchResultsProps {
  properties: BaseProperty[];
  language: "en" | "id";
  isLoading?: boolean;
  onPropertyClick?: (property: BaseProperty) => void;
  onSaveProperty?: (propertyId: string) => void;
  onShareProperty?: (property: BaseProperty) => void;
  onView3D?: (property: BaseProperty) => void;
  savedPropertyIds?: string[];
}

const PropertySearchResults = ({
  properties,
  language,
  isLoading = false,
  onPropertyClick,
  onSaveProperty,
  onShareProperty,
  onView3D,
  savedPropertyIds = []
}: PropertySearchResultsProps) => {
  const text = {
    en: {
      noResults: "No properties found",
      noResultsDesc: "Try adjusting your search filters to find more properties",
      viewDetails: "View Details",
      save: "Save",
      share: "Share",
      view3D: "3D Tour",
      virtualTour: "Virtual Tour",
      bedrooms: "bedrooms",
      bathrooms: "bathrooms",
      forSale: "For Sale",
      forRent: "For Rent",
      forLease: "For Lease",
      priceOnRequest: "Price on request"
    },
    id: {
      noResults: "Properti tidak ditemukan",
      noResultsDesc: "Coba sesuaikan filter pencarian untuk menemukan lebih banyak properti",
      viewDetails: "Lihat Detail",
      save: "Simpan",
      share: "Bagikan",
      view3D: "Tur 3D",
      virtualTour: "Tur Virtual",
      bedrooms: "kamar tidur",
      bathrooms: "kamar mandi",
      forSale: "Dijual",
      forRent: "Disewa",
      forLease: "Disewakan",
      priceOnRequest: "Harga sesuai permintaan"
    }
  };

  const currentText = text[language];

  const getListingTypeText = (listingType: string) => {
    switch (listingType) {
      case 'sale':
        return currentText.forSale;
      case 'rent':
        return currentText.forRent;
      case 'lease':
        return currentText.forLease;
      default:
        return listingType;
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="h-48 bg-gray-200 rounded-t-lg"></div>
            <CardContent className="p-4">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {currentText.noResults}
        </h3>
        <p className="text-gray-600">
          {currentText.noResultsDesc}
        </p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map((property) => (
        <Card 
          key={property.id} 
          className="group hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 cursor-pointer border-0 bg-card/50 backdrop-blur-sm hover:bg-card/80 animate-fade-in hover-scale"
          onClick={() => onPropertyClick?.(property)}
        >
          <div className="relative">
            {property.images && property.images.length > 0 ? (
              <img
                src={property.images[0]}
                alt={property.title}
                className="w-full h-48 object-cover rounded-t-lg"
              />
            ) : (
              <div className="w-full h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
                <Building2 className="h-12 w-12 text-gray-400" />
              </div>
            )}
            
            {/* Property Type Badge */}
            <Badge 
              variant="secondary" 
              className="absolute top-2 left-2 bg-white/90 text-gray-700"
            >
              {property.property_type}
            </Badge>
            
            {/* Listing Type Badge */}
            <Badge 
              variant="default" 
              className="absolute top-2 right-2"
            >
              {getListingTypeText(property.listing_type)}
            </Badge>

            {/* 3D/VR Icons */}
            <div className="absolute bottom-2 right-2 flex gap-1">
              {property.three_d_model_url && (
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    onView3D?.(property);
                  }}
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              )}
              {property.virtual_tour_url && (
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(property.virtual_tour_url, '_blank');
                  }}
                >
                  <Eye className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>

          <CardContent className="p-4">
            {/* Price */}
            <div className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent mb-2">
              {property.price ? formatIDR(property.price) : currentText.priceOnRequest}
            </div>

            {/* Title */}
            <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
              {property.title}
            </h3>

            {/* Location */}
            <div className="flex items-center text-muted-foreground mb-3">
              <MapPin className="h-4 w-4 mr-1 text-primary" />
              <span className="text-sm line-clamp-1">{property.location}</span>
            </div>

            {/* Property Details */}
            {(property.bedrooms || property.bathrooms || property.area_sqm) && (
              <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                {property.bedrooms && (
                  <div className="flex items-center">
                    <Bed className="h-4 w-4 mr-1" />
                    <span>{property.bedrooms} {currentText.bedrooms}</span>
                  </div>
                )}
                {property.bathrooms && (
                  <div className="flex items-center">
                    <Bath className="h-4 w-4 mr-1" />
                    <span>{property.bathrooms} {currentText.bathrooms}</span>
                  </div>
                )}
                {property.area_sqm && (
                  <div className="flex items-center">
                    <Square className="h-4 w-4 mr-1" />
                    <span>{property.area_sqm}m²</span>
                  </div>
                )}
              </div>
            )}

            {/* Description */}
            {property.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {property.description}
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSaveProperty?.(property.id);
                  }}
                  className={`transition-all duration-200 ${savedPropertyIds.includes(property.id) ? 'bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20' : 'hover:bg-muted'}`}
                >
                  <Heart 
                    className={`h-4 w-4 mr-1 transition-all ${savedPropertyIds.includes(property.id) ? 'fill-current' : ''}`} 
                  />
                  {currentText.save}
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onShareProperty?.(property);
                  }}
                  className="hover:bg-muted transition-colors"
                >
                  <Share2 className="h-4 w-4 mr-1" />
                  {currentText.share}
                </Button>
              </div>

              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onPropertyClick?.(property);
                }}
                className="bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200"
              >
                {currentText.viewDetails}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PropertySearchResults;
