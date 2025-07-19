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
    <div className="flex flex-wrap gap-4 justify-start">
      {properties.map((property) => (
        <Card 
          key={property.id} 
          className="group professional-card card-hover cursor-pointer h-[420px] flex flex-col min-w-[260px] max-w-[300px] flex-1"
          onClick={() => onPropertyClick(property)}
          style={{ flexBasis: 'calc(25% - 1rem)' }}
        >
          {/* Image Section */}
          <div className="relative aspect-[3/2] overflow-hidden flex-shrink-0">
            <img
              src={getImageUrl(property)}
              alt={property.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            
            {/* Top Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              <Badge 
                variant={property.listing_type === 'sale' ? 'default' : 'secondary'}
                className="badge-primary"
              >
                {property.listing_type === 'sale' ? 'For Sale' : 'For Rent'}
              </Badge>
              {property.property_type && (
                <Badge variant="outline" className="badge-secondary capitalize">
                  {property.property_type}
                </Badge>
              )}
            </div>

            {/* Center Action Icons */}
            <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Button
                size="lg"
                variant="secondary"
                className="h-12 w-12 p-0 glass-ios rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  onPropertyClick(property);
                }}
              >
                <Eye className="h-6 w-6 text-foreground" />
              </Button>
              {(property.three_d_model_url || property.virtual_tour_url) && (
                <Button
                  size="lg"
                  variant="secondary"
                  className="h-12 w-12 p-0 glass-ios rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    onView3D?.(property);
                  }}
                >
                  <Box className="h-6 w-6 text-foreground" />
                </Button>
              )}
            </div>

            {/* Top Right 3D Icon */}
            {(property.three_d_model_url || property.virtual_tour_url) && (
              <div className="absolute top-3 right-3">
                <Badge className="status-success p-1.5">
                  <Box className="h-4 w-4" />
                </Badge>
              </div>
            )}

            {/* Quick Actions - Heart and Share */}
            <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Button
                size="sm"
                variant="secondary"
                className={`h-8 w-8 p-0 glass-ios ${
                  savedProperties.has(property.id) ? "ring-2 ring-destructive" : ""
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSave(property);
                }}
              >
                <Heart 
                  className={`h-4 w-4 ${
                    savedProperties.has(property.id) ? 'fill-destructive text-destructive' : 'text-muted-foreground'
                  }`} 
                />
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="h-8 w-8 p-0 glass-ios"
                onClick={(e) => {
                  e.stopPropagation();
                  onShare?.(property);
                }}
              >
                <Share2 className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>

            {/* Price Overlay */}
            <div className="absolute bottom-3 left-3">
              <div className="glass-effect rounded-lg px-2 py-1 inline-block">
                <div className="font-bold text-lg gradient-text leading-tight">
                  {formatPrice(property.price)}
                </div>
                {property.listing_type === 'rent' && (
                  <div className="text-xs text-muted-foreground leading-tight">/month</div>
                )}
              </div>
            </div>
          </div>

          {/* Content Section */}
          <CardContent className="p-3 space-y-2 flex-1 flex flex-col justify-between">
            <div className="space-y-2 flex-1">
              {/* Title */}
              <h3 className="font-semibold text-foreground line-clamp-2 text-sm leading-tight group-hover:text-primary transition-colors">
                {property.title}
              </h3>

              {/* Location */}
              <div className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="h-3 w-3 flex-shrink-0" />
                <span className="text-xs truncate">{property.location}</span>
              </div>

              {/* Property Details */}
              {(property.bedrooms || property.bathrooms || property.area_sqm) && (
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    {property.bedrooms && (
                      <div className="flex items-center gap-1">
                        <Bed className="h-3 w-3" />
                        <span>{property.bedrooms}</span>
                      </div>
                    )}
                    {property.bathrooms && (
                      <div className="flex items-center gap-1">
                        <Bath className="h-3 w-3" />
                        <span>{property.bathrooms}</span>
                      </div>
                    )}
                  </div>
                  {property.area_sqm && (
                    <div className="flex items-center gap-1">
                      <Square className="h-3 w-3" />
                      <span>{property.area_sqm}m²</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center pt-1 mt-auto">
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