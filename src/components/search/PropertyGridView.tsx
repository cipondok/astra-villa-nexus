import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Bed, Bath, Square, Heart, Share2, Eye, Phone, Box } from "lucide-react";
import PropertyComparisonButton from "@/components/property/PropertyComparisonButton";
import { BaseProperty } from "@/types/property";
import { useState } from "react";

interface PropertyGridViewProps {
  properties: BaseProperty[];
  onPropertyClick: (property: BaseProperty) => void;
  onView3D?: (property: BaseProperty) => void;
  onSave?: (property: BaseProperty) => void;
  onShare?: (property: BaseProperty) => void;
  onContact?: (property: BaseProperty) => void;
}

const PropertyGridView = ({ 
  properties, 
  onPropertyClick, 
  onView3D, 
  onSave, 
  onShare, 
  onContact 
}: PropertyGridViewProps) => {
  const [savedProperties, setSavedProperties] = useState<Set<string>>(new Set());

  const formatPrice = (price: number) => {
    if (price >= 1000000000) {
      return `IDR ${(price / 1000000000).toFixed(1)}B`;
    }
    if (price >= 1000000) {
      return `IDR ${(price / 1000000).toFixed(1)}M`;
    }
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getImageUrl = (property: BaseProperty) => {
    if (property.images && property.images.length > 0) {
      return property.images[0];
    }
    if (property.image_urls && property.image_urls.length > 0) {
      return property.image_urls[0];
    }
    if (property.thumbnail_url) {
      return property.thumbnail_url;
    }
    return "/placeholder.svg";
  };

  const handleSave = (property: BaseProperty) => {
    const newSaved = new Set(savedProperties);
    if (newSaved.has(property.id)) {
      newSaved.delete(property.id);
    } else {
      newSaved.add(property.id);
    }
    setSavedProperties(newSaved);
    onSave?.(property);
  };


  if (properties.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground text-lg">No properties found matching your criteria</div>
        <div className="text-sm text-muted-foreground mt-2">Try adjusting your filters</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-6">
      {properties.map((property) => (
        <Card 
          key={property.id} 
          className="group overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer h-[520px] flex flex-col"
          onClick={() => onPropertyClick(property)}
        >
          {/* Image Section */}
          <div className="relative aspect-[4/3] overflow-hidden flex-shrink-0">
            <img
              src={getImageUrl(property)}
              alt={property.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            
            {/* Top Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              <Badge 
                variant={property.listing_type === 'sale' ? 'default' : 'secondary'}
                className="bg-background/90 backdrop-blur-sm"
              >
                {property.listing_type === 'sale' ? 'For Sale' : 'For Rent'}
              </Badge>
              {property.property_type && (
                <Badge variant="outline" className="bg-background/90 backdrop-blur-sm capitalize">
                  {property.property_type}
                </Badge>
              )}
              {(property.three_d_model_url || property.virtual_tour_url) && (
                <Badge className="bg-blue-600/90 text-white backdrop-blur-sm flex items-center gap-1">
                  <Box className="h-3 w-3" />
                  3D View Available
                </Badge>
              )}
            </div>

            {/* Quick Actions */}
            <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Button
                size="sm"
                variant="secondary"
                className={`h-8 w-8 p-0 bg-white/90 hover:bg-white ${
                  savedProperties.has(property.id) ? "ring-2 ring-red-400" : ""
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSave(property);
                }}
              >
                <Heart 
                  className={`h-4 w-4 ${
                    savedProperties.has(property.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'
                  }`} 
                />
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                onClick={(e) => {
                  e.stopPropagation();
                  onShare?.(property);
                }}
              >
                <Share2 className="h-4 w-4 text-gray-600" />
              </Button>
            </div>

            {/* Price Overlay */}
            <div className="absolute bottom-3 left-3 right-3">
              <div className="bg-black/70 text-white px-3 py-2 rounded-lg backdrop-blur-sm">
                <div className="font-bold text-lg">
                  {formatPrice(property.price)}
                </div>
                {property.listing_type === 'rent' && (
                  <div className="text-xs opacity-90">/month</div>
                )}
              </div>
            </div>
          </div>

          {/* Content Section */}
          <CardContent className="p-4 space-y-3 flex-1 flex flex-col justify-between">
            <div className="space-y-3 flex-1">
              {/* Title */}
              <h3 className="font-semibold text-foreground line-clamp-2 min-h-[3rem] group-hover:text-primary transition-colors">
                {property.title}
              </h3>

              {/* Location */}
              <div className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm truncate">{property.location}</span>
              </div>

              {/* Property Details */}
              {(property.bedrooms || property.bathrooms || property.area_sqm) && (
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-3">
                    {property.bedrooms && (
                      <div className="flex items-center gap-1">
                        <Bed className="h-4 w-4" />
                        <span>{property.bedrooms}</span>
                      </div>
                    )}
                    {property.bathrooms && (
                      <div className="flex items-center gap-1">
                        <Bath className="h-4 w-4" />
                        <span>{property.bathrooms}</span>
                      </div>
                    )}
                  </div>
                  {property.area_sqm && (
                    <div className="flex items-center gap-1">
                      <Square className="h-4 w-4" />
                      <span>{property.area_sqm}m²</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2 mt-auto">
              <Button 
                variant="default"
                size="sm"
                className="flex-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onPropertyClick(property);
                }}
              >
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
              {(property.three_d_model_url || property.virtual_tour_url) && (
                <Button 
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={(e) => {
                    e.stopPropagation();
                     onView3D?.(property);
                   }}
                 >
                   <Box className="h-4 w-4 mr-1" />
                   3D View
                 </Button>
              )}
              <PropertyComparisonButton 
                property={property} 
                variant="secondary"
                size="sm"
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PropertyGridView;