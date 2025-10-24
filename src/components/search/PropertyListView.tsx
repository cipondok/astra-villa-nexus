import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Bed, Bath, Square, Heart, Share2, Eye, Phone } from "lucide-react";
import { BaseProperty } from "@/types/property";

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

  if (properties.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground text-lg">No properties found matching your criteria</div>
        <div className="text-sm text-muted-foreground mt-2">Try adjusting your filters</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {properties.map((property) => (
        <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 bg-background rounded-xl border border-border/50">
          <CardContent className="p-0">
            <div className="flex flex-col md:flex-row items-stretch">
              {/* Image Section */}
              <div className="relative md:w-80 h-56 md:h-full overflow-hidden">
                <img
                  src={getImageUrl(property)}
                  alt={property.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                
                {/* Top Left - Sewa/Jual Badge */}
                <div className="absolute top-4 left-4">
                  <Badge 
                    className={`${
                      property.listing_type === 'rent' 
                        ? 'bg-blue-500 hover:bg-blue-600' 
                        : 'bg-green-500 hover:bg-green-600'
                    } text-white backdrop-blur-sm text-xs font-semibold rounded-md px-3 py-1 shadow-lg`}
                  >
                    {property.listing_type === 'rent' ? 'Sewa' : 'Jual'}
                  </Badge>
                </div>

                {/* Property Type Badge - Below Comparison Button */}
                <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                  <Badge 
                    className="bg-primary/90 text-primary-foreground backdrop-blur-sm text-xs font-semibold rounded-full px-3 py-1 shadow-md"
                  >
                    {property.property_type || (property.listing_type === 'sale' ? 'For Sale' : 'For Rent')}
                  </Badge>
                </div>

                {/* Price Overlay - Bottom Left - Responsive with Full Color */}
                <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 md:bottom-4 md:left-4 z-10">
                  <div className="bg-primary rounded-md sm:rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-2.5 lg:px-5 lg:py-3 shadow-lg">
                    <div className="flex items-center gap-2 md:gap-2.5">
                      <div className="font-bold text-sm sm:text-base md:text-xl lg:text-2xl xl:text-3xl text-primary-foreground leading-tight whitespace-nowrap">
                        {formatPrice(property.price)}
                      </div>
                      {property.listing_type === 'rent' && (
                        <span className="bg-primary-foreground/20 text-primary-foreground text-[9px] sm:text-[10px] md:text-xs lg:text-sm font-semibold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">/bln</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Actions Overlay */}
                <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="bg-white/90 hover:bg-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSave?.(property);
                    }}
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="bg-white/90 hover:bg-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      onShare?.(property);
                    }}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Content Section */}
              <div className="flex-1 p-6 flex flex-col justify-between">
                {/* Title - Now at top */}
                <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2">
                  {property.title}
                </h3>
                
                {/* Location */}
                <div className="flex items-center text-muted-foreground mb-4">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span className="text-sm">{property.location}</span>
                </div>

                {/* Property Details */}
                <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
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
                  {property.area_sqm && (
                    <div className="flex items-center gap-1">
                      <Square className="h-4 w-4" />
                      <span>LT: {property.area_sqm}</span>
                    </div>
                  )}
                  {property.area_sqm && (
                    <div className="flex items-center gap-1">
                      <Square className="h-4 w-4" />
                      <span>LB: {Math.round(property.area_sqm * 0.7)}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-auto">
                  <Button 
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      onShare?.(property);
                    }}
                    className="flex-shrink-0"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button 
                    onClick={() => onContact?.(property)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    WhatsApp
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