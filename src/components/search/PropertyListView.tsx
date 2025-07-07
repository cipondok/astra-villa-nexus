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
    <div className="space-y-4">
      {properties.map((property) => (
        <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
          <CardContent className="p-0">
            <div className="flex flex-col md:flex-row">
              {/* Image Section */}
              <div className="relative md:w-80 h-64 md:h-48 overflow-hidden">
                <img
                  src={getImageUrl(property)}
                  alt={property.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Property Type Badge */}
                <div className="absolute top-3 left-3">
                  <Badge 
                    variant={property.listing_type === 'sale' ? 'default' : 'secondary'}
                    className="bg-background/90 backdrop-blur-sm"
                  >
                    {property.listing_type === 'sale' ? 'For Sale' : 'For Rent'}
                  </Badge>
                </div>

                {/* 3D Badge */}
                {(property.three_d_model_url || property.virtual_tour_url) && (
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-blue-600/90 text-white backdrop-blur-sm">
                      3D View
                    </Badge>
                  </div>
                )}

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
              <div className="flex-1 p-6">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-1 line-clamp-2">
                      {property.title}
                    </h3>
                    <div className="flex items-center text-muted-foreground mb-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="text-sm">{property.location}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      {formatPrice(property.price)}
                    </div>
                    {property.listing_type === 'rent' && (
                      <div className="text-sm text-muted-foreground">/month</div>
                    )}
                  </div>
                </div>

                {/* Property Details */}
                <div className="flex items-center gap-6 mb-4 text-sm text-muted-foreground">
                  {property.bedrooms && (
                    <div className="flex items-center gap-1">
                      <Bed className="h-4 w-4" />
                      <span>{property.bedrooms} bed</span>
                    </div>
                  )}
                  {property.bathrooms && (
                    <div className="flex items-center gap-1">
                      <Bath className="h-4 w-4" />
                      <span>{property.bathrooms} bath</span>
                    </div>
                  )}
                  {property.area_sqm && (
                    <div className="flex items-center gap-1">
                      <Square className="h-4 w-4" />
                      <span>{property.area_sqm} sqm</span>
                    </div>
                  )}
                  {property.property_type && (
                    <Badge variant="outline" className="capitalize">
                      {property.property_type}
                    </Badge>
                  )}
                </div>

                {/* Description */}
                {property.description && (
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {property.description}
                  </p>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="default"
                    onClick={() => onPropertyClick(property)}
                    className="flex-1 min-w-fit"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                  {(property.three_d_model_url || property.virtual_tour_url) && (
                    <Button 
                      variant="outline"
                      onClick={() => onView3D?.(property)}
                      className="flex-1 min-w-fit"
                    >
                      3D View
                    </Button>
                  )}
                  <Button 
                    variant="secondary"
                    onClick={() => onContact?.(property)}
                    className="flex-1 min-w-fit"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Contact
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