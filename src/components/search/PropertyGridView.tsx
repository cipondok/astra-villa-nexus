import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Bed, Bath, Square, Heart, Share2, Eye, Phone, Box, Scale } from "lucide-react";
import PropertyComparisonButton from "@/components/property/PropertyComparisonButton";
import SocialShareDialog from "@/components/property/SocialShareDialog";
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
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<BaseProperty | null>(null);

  const formatPrice = (price: number) => {
    if (price >= 1000000000) {
      const value = price / 1000000000;
      return `IDR ${value % 1 === 0 ? value.toFixed(0) : value.toFixed(1)} Miliar`;
    }
    if (price >= 1000000) {
      const value = price / 1000000;
      return `IDR ${value % 1 === 0 ? value.toFixed(0) : value.toFixed(1)} Jt`;
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

  const handleShare = (property: BaseProperty) => {
    setSelectedProperty(property);
    setShareDialogOpen(true);
    onShare?.(property);
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
      {properties.map((property) => (
        <Card 
          key={property.id} 
          className="group cursor-pointer flex flex-col bg-background hover:shadow-lg transition-all duration-300 rounded-md md:rounded-xl overflow-hidden border border-border/50"
          onClick={() => onPropertyClick(property)}
        >
          {/* Image Section */}
          <div className="relative aspect-[16/9] overflow-hidden flex-shrink-0">
            <img
              src={getImageUrl(property)}
              alt={property.title}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            
            {/* Top Badge */}
            <div className="absolute top-1.5 right-1.5 md:top-3 md:right-3 z-10">
              <Badge 
                className="bg-primary/90 text-primary-foreground text-[9px] md:text-xs font-semibold rounded-full backdrop-blur-sm px-1.5 py-0.5 md:px-3 md:py-1"
              >
                {property.property_type || (property.listing_type === 'sale' ? 'For Sale' : 'For Rent')}
              </Badge>
            </div>

            {/* Top Right Compare Icon */}
            <div className="absolute top-2 right-2 z-10">
              <PropertyComparisonButton 
                property={property} 
                variant="secondary"
                size="sm"
              />
            </div>

            {/* Center Action Icons - Only on Hover */}
            <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
              <Button
                size="sm"
                variant="secondary"
                className="h-10 w-10 p-0 glass-ios rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  onPropertyClick(property);
                }}
              >
                <Eye className="h-5 w-5 text-foreground" />
              </Button>
              {(property.three_d_model_url || property.virtual_tour_url) && (
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-10 w-10 p-0 glass-ios rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    onView3D?.(property);
                  }}
                >
                  <Box className="h-5 w-5 text-foreground" />
                </Button>
              )}
            </div>

            {/* Bottom Left Price Overlay - Responsive */}
            <div className="absolute bottom-2 left-2 sm:bottom-2.5 sm:left-2.5 md:bottom-3 md:left-3 lg:bottom-4 lg:left-4 z-10">
              <div className="glass-effect rounded-md sm:rounded-lg px-2 py-1 sm:px-2.5 sm:py-1.5 md:px-3 md:py-2 lg:px-4 lg:py-2.5">
                <div className="font-bold text-xs sm:text-sm md:text-lg lg:text-xl xl:text-2xl gradient-text leading-tight whitespace-nowrap">
                  {formatPrice(property.price)}
                </div>
                {property.listing_type === 'rent' && (
                  <div className="text-[8px] sm:text-[9px] md:text-xs lg:text-sm text-muted-foreground leading-tight font-medium">/month</div>
                )}
              </div>
            </div>

            {/* Bottom Right Quick Actions - Only on Hover */}
            <div className="absolute bottom-1 right-1 md:bottom-2 md:right-2 flex gap-0.5 md:gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
              <Button
                size="sm"
                variant="secondary"
                className={`h-6 w-6 md:h-7 md:w-7 p-0 glass-ios rounded-full ${
                  savedProperties.has(property.id) ? "ring-1 ring-destructive" : ""
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSave(property);
                }}
              >
                <Heart 
                  className={`h-2.5 w-2.5 md:h-3 md:w-3 ${
                    savedProperties.has(property.id) ? 'fill-destructive text-destructive' : 'text-muted-foreground'
                  }`} 
                />
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="h-6 w-6 md:h-7 md:w-7 p-0 glass-ios rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  handleShare(property);
                }}
              >
                <Share2 className="h-2.5 w-2.5 md:h-3 md:w-3 text-muted-foreground" />
              </Button>
            </div>
          </div>

          {/* Content Section */}
          <CardContent className="p-2.5 md:p-4 flex flex-col flex-1">
            {/* Title - Now at top */}
            <h3 className="font-semibold text-foreground line-clamp-2 text-xs md:text-base mb-1.5 md:mb-2 group-hover:text-primary transition-colors">
              {property.title}
            </h3>

            {/* Location */}
            <div className="flex items-center gap-1 text-muted-foreground mb-1.5 md:mb-3">
              <MapPin className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
              <span className="text-[10px] md:text-sm truncate">{property.city || property.location}</span>
            </div>

            {/* Property Details */}
            <div className="flex items-center gap-1.5 md:gap-3 text-[10px] md:text-sm text-muted-foreground mb-2 md:mb-4">
              {property.bedrooms && (
                <div className="flex items-center gap-0.5 md:gap-1">
                  <Bed className="h-3 w-3 md:h-4 md:w-4" />
                  <span>{property.bedrooms}</span>
                </div>
              )}
              {property.bathrooms && (
                <div className="flex items-center gap-0.5 md:gap-1">
                  <Bath className="h-3 w-3 md:h-4 md:w-4" />
                  <span>{property.bathrooms}</span>
                </div>
              )}
              {property.area_sqm && (
                <>
                  <div className="flex items-center gap-0.5 md:gap-1">
                    <Scale className="h-3 w-3 md:h-4 md:w-4" />
                    <span className="hidden md:inline">LT: {property.area_sqm}</span>
                    <span className="md:hidden">{property.area_sqm}m²</span>
                  </div>
                  <div className="flex items-center gap-1 hidden md:flex">
                    <Square className="h-4 w-4" />
                    <span>LB: {Math.round(property.area_sqm * 0.7)}</span>
                  </div>
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-1 md:gap-2 mt-auto">
              <Button
                size="sm"
                variant="outline"
                className="flex-shrink-0 h-6 w-6 p-0 md:h-9 md:w-auto md:px-3"
                onClick={(e) => {
                  e.stopPropagation();
                  handleShare(property);
                }}
              >
                <Share2 className="h-2.5 w-2.5 md:h-4 md:w-4" />
              </Button>
              <Button
                size="sm"
                className="flex-1 bg-green-600 hover:bg-green-700 text-white h-6 text-[9px] md:h-9 md:text-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onContact?.(property);
                }}
              >
                <Phone className="h-2.5 w-2.5 md:h-4 md:w-4 md:mr-1" />
                <span className="hidden md:inline">WhatsApp</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {/* Social Share Dialog */}
      {selectedProperty && (
        <SocialShareDialog
          open={shareDialogOpen}
          onOpenChange={setShareDialogOpen}
          property={selectedProperty}
        />
      )}
    </div>
  );
};

export default PropertyGridView;