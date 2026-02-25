import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Bed, Bath, Square, Heart, Share2, Eye, Phone, Tag, Percent, Key, Building } from "lucide-react";

// Helper to capitalize first letter
const capitalizeFirst = (str: string) => str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : 'Property';
import { BaseProperty } from "@/types/property";
import UserStatusBadge from "@/components/ui/UserStatusBadge";
import { useDefaultPropertyImage } from "@/hooks/useDefaultPropertyImage";
interface PropertyListViewProps {
  properties: BaseProperty[];
  onPropertyClick: (property: BaseProperty) => void;
  onView3D?: (property: BaseProperty) => void;
  onSave?: (property: BaseProperty) => void;
  onShare?: (property: BaseProperty) => void;
  onContact?: (property: BaseProperty) => void;
}

const PropertyListView = ({ 
  properties, 
  onPropertyClick, 
  onView3D, 
  onSave, 
  onShare, 
  onContact 
}: PropertyListViewProps) => {
  const { getPropertyImage } = useDefaultPropertyImage();

  const formatPrice = (price: number) => {
    if (price >= 1000000000) {
      const value = price / 1000000000;
      const numStr = value % 1 === 0 ? value.toFixed(0) : value.toFixed(1);
      return <><span className="text-[0.7em] font-medium opacity-90">Rp</span>{numStr}<span className="text-[0.7em] font-medium opacity-90">M</span></>;
    }
    if (price >= 1000000) {
      const value = price / 1000000;
      const numStr = value % 1 === 0 ? value.toFixed(0) : value.toFixed(1);
      return <><span className="text-[0.7em] font-medium opacity-90">Rp</span>{numStr}<span className="text-[0.7em] font-medium opacity-90">Jt</span></>;
    }
    return <><span className="text-[0.7em] font-medium opacity-90">Rp</span>{price.toLocaleString('id-ID')}</>;
  };

  const getImageUrl = (property: BaseProperty) => {
    return getPropertyImage(property.images, property.thumbnail_url, property.image_urls);
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
    <div className="flex flex-col gap-3 sm:gap-4 md:gap-6">
      {properties.map((property) => (
        <Card 
          key={property.id} 
          className="overflow-hidden hover:shadow-lg transition-all duration-300 bg-background rounded-lg sm:rounded-xl border border-border/50 cursor-pointer active:scale-[0.99]" 
          onClick={() => onPropertyClick(property)}
        >
          <CardContent className="p-0">
            <div className="flex flex-row items-stretch">
              {/* Image Section - compact on mobile, wider on desktop */}
              <div className="relative w-28 sm:w-40 md:w-80 min-h-[120px] sm:min-h-[160px] md:min-h-[220px] overflow-hidden flex-shrink-0">
                <img
                  src={getImageUrl(property)}
                  alt={property.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                
                {/* Listing type badge - smaller on mobile */}
                <div className="absolute top-1.5 left-1.5 sm:top-3 sm:left-3">
                  <Badge 
                    className={`flex items-center gap-0.5 ${
                      property.listing_type === 'rent' 
                        ? 'bg-chart-4 hover:bg-chart-4/90' 
                        : 'bg-chart-1 hover:bg-chart-1/90'
                    } text-primary-foreground backdrop-blur-sm text-[9px] sm:text-[10px] font-semibold rounded px-1.5 py-0.5 sm:px-2 shadow-lg`}
                  >
                    {property.listing_type === 'rent' ? <Key className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> : <Tag className="h-2.5 w-2.5 sm:h-3 sm:w-3" />}
                    <span className="hidden sm:inline">{property.listing_type === 'rent' ? 'Sewa' : 'Jual'}</span>
                  </Badge>
                </div>

                {/* Property type badge - hidden on mobile */}
                <div className="hidden sm:flex absolute top-3 right-3 flex-col gap-2 items-end">
                  <Badge 
                    className="flex items-center gap-1 bg-background/60 backdrop-blur-sm text-foreground text-xs font-semibold rounded-full px-2.5 py-0.5 shadow-md"
                  >
                    <Building className="h-3 w-3" />
                    {capitalizeFirst(property.property_type)}
                  </Badge>
                </div>

                {/* Price overlay - always visible */}
                <div className="absolute bottom-1.5 left-1.5 sm:bottom-3 sm:left-3 z-10">
                  <div className="inline-flex items-center gap-0.5 sm:gap-1 bg-gradient-to-r from-primary via-primary/90 to-primary/80 text-primary-foreground px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded shadow-lg">
                    <Tag className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5" />
                    <span className="font-bold text-[11px] sm:text-sm leading-tight whitespace-nowrap">
                      {formatPrice(property.price)}
                    </span>
                    {property.listing_type === 'rent' && (
                      <span className="text-primary-foreground/80 text-[7px] sm:text-[9px] font-medium">/bln</span>
                    )}
                  </div>
                </div>

                {/* Save button - mobile friendly touch target */}
                <button
                  className="absolute top-1.5 right-1.5 sm:top-3 sm:right-3 h-7 w-7 sm:h-8 sm:w-8 flex items-center justify-center bg-background/80 backdrop-blur-sm hover:bg-background rounded-full shadow-md sm:hidden"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSave?.(property);
                  }}
                >
                  <Heart className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </div>

              {/* Content Section */}
              <div className="flex-1 p-2.5 sm:p-4 md:p-6 flex flex-col justify-between min-w-0">
                {/* Title */}
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-foreground line-clamp-1 sm:line-clamp-2 mb-0.5 sm:mb-1">
                  {property.title}
                </h3>

                {/* Posted by - hidden on mobile */}
                {property.posted_by?.name && (
                  <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <span className="truncate max-w-[300px] md:max-w-[420px]">{property.posted_by.name}</span>
                    <UserStatusBadge status={property.posted_by.verification_status} size="sm" />
                  </div>
                )}
                
                {/* Location */}
                <div className="flex items-center text-muted-foreground mb-1.5 sm:mb-3">
                  <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-0.5 sm:mr-1 flex-shrink-0" />
                  <span className="text-[11px] sm:text-xs md:text-sm truncate">{property.location}</span>
                </div>

                {/* Property Details */}
                <div className="flex items-center gap-2 sm:gap-3 md:gap-4 mb-1.5 sm:mb-3 text-[11px] sm:text-xs md:text-sm text-muted-foreground">
                  {property.bedrooms > 0 && (
                    <div className="flex items-center gap-0.5 sm:gap-1">
                      <Bed className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      <span>{property.bedrooms}</span>
                    </div>
                  )}
                  {property.bathrooms > 0 && (
                    <div className="flex items-center gap-0.5 sm:gap-1">
                      <Bath className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      <span>{property.bathrooms}</span>
                    </div>
                  )}
                  {property.area_sqm > 0 && (
                    <div className="flex items-center gap-0.5 sm:gap-1">
                      <Square className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      <span>{property.area_sqm}m²</span>
                    </div>
                  )}
                  {/* Property type on mobile (since badge is hidden) */}
                  <span className="sm:hidden text-[10px] capitalize bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                    {capitalizeFirst(property.property_type)}
                  </span>
                </div>

                {/* Action Buttons - compact on mobile */}
                <div className="flex gap-1.5 sm:gap-2 mt-auto">
                  {/* Mobile: single CTA button */}
                  <Button 
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPropertyClick(property);
                    }}
                    className="h-8 sm:h-9 text-xs sm:text-sm px-2 sm:px-3 flex-shrink-0"
                  >
                    <Eye className="h-3.5 w-3.5 sm:mr-1.5" />
                    <span className="hidden sm:inline">Details</span>
                  </Button>
                  <Button 
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      onShare?.(property);
                    }}
                    className="h-8 sm:h-9 px-2 sm:px-3 flex-shrink-0 hidden sm:flex"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onContact?.(property);
                    }}
                    className="h-8 sm:h-9 text-xs sm:text-sm flex-1 bg-chart-1 hover:bg-chart-1/90 text-primary-foreground"
                  >
                    <Phone className="h-3.5 w-3.5 sm:mr-1.5" />
                    <span className="hidden xs:inline sm:inline">WhatsApp</span>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PropertyListView;