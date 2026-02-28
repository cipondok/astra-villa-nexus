import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Bed, Bath, Maximize, Heart, Share2, Eye, Phone, Box, Tag, Percent, Key, Building, Camera } from "lucide-react";
import { cn } from "@/lib/utils";
import PropertyComparisonButton from "@/components/property/PropertyComparisonButton";
import SocialShareDialog from "@/components/property/SocialShareDialog";
import { BaseProperty } from "@/types/property";
import { useState } from "react";
import { useDefaultPropertyImage } from "@/hooks/useDefaultPropertyImage";
import { getCurrencyFormatterShort, getCurrencyFormatter } from "@/stores/currencyStore";

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
  const { getPropertyImage } = useDefaultPropertyImage();

  const formatPrice = (price: number) => {
    const formatted = getCurrencyFormatterShort()(price);
    // Split into main + suffix for styling
    return { main: formatted, suffix: '' };
  };

  const formatMonthlyPayment = (price: number) => {
    const monthlyEstimate = price * 0.006;
    return getCurrencyFormatterShort()(monthlyEstimate) + '/PB';
  };

  const getImageUrl = (property: BaseProperty) => {
    return getPropertyImage(property.images, property.thumbnail_url, property.image_urls);
  };

  const getLocation = (property: BaseProperty) => {
    if (property.city && property.state) return `${property.city}, ${property.state}`;
    return property.city || property.location || 'Indonesia';
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
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
      {properties.map((property) => {
        const priceInfo = formatPrice(property.price);
        const isRent = property.listing_type === 'rent';
        const imageCount = property.images?.length || property.image_urls?.length || 1;
        const ListingIcon = isRent ? Key : Tag;

        return (
          <Card 
            key={property.id} 
            className="group cursor-pointer bg-card/70 backdrop-blur-md rounded-lg border border-primary/10 dark:border-primary/15 shadow-[0_2px_12px_rgba(0,0,0,0.05)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.1)] hover:border-primary/25 transition-all duration-300 overflow-hidden"
            onClick={() => onPropertyClick(property)}
          >
            {/* Image Section - Rumah123 Style */}
            <div className="relative aspect-[4/3] overflow-hidden bg-muted">
              <img
                src={getImageUrl(property)}
                alt={property.title}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              
              {/* Top Badges */}
              <div className="absolute top-2 left-2 right-2 flex items-center justify-between">
                <Badge className={cn(
                  "flex items-center gap-1 px-2 py-1 text-[10px] font-semibold rounded-md shadow-sm",
                  isRent ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground"
                )}>
                  <ListingIcon className="h-2.5 w-2.5" />
                  {isRent ? 'Disewa' : 'Dijual'}
                </Badge>
                
                <Badge className="flex items-center gap-0.5 bg-card/90 backdrop-blur-sm text-foreground text-[10px] px-1.5 py-0.5 rounded-md shadow-sm border border-border/50">
                  <Building className="h-2.5 w-2.5" />
                  {property.property_type ? property.property_type.charAt(0).toUpperCase() + property.property_type.slice(1).toLowerCase() : 'Property'}
                </Badge>
              </div>

              {/* Heart & Compare Buttons */}
              <div className="absolute top-10 right-2 flex flex-col gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  className={cn(
                    "h-7 w-7 rounded-full bg-card/90 backdrop-blur-sm hover:bg-card shadow-sm border border-border/50",
                    savedProperties.has(property.id) && "bg-destructive/10 border-destructive/30"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSave(property);
                  }}
                >
                  <Heart className={cn(
                    "h-3.5 w-3.5",
                    savedProperties.has(property.id) ? 'fill-destructive text-destructive' : 'text-muted-foreground'
                  )} />
                </Button>
                <PropertyComparisonButton property={property} variant="secondary" size="sm" />
              </div>

              {/* Image Count */}
              {imageCount > 1 && (
                <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-background/60 backdrop-blur-sm text-foreground text-[9px] px-1.5 py-0.5 rounded">
                  <Camera className="h-2.5 w-2.5" />
                  <span>{imageCount}</span>
                </div>
              )}

              {/* View Icon on Hover */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-background/10">
                <div className="h-10 w-10 rounded-full bg-card/95 backdrop-blur-sm flex items-center justify-center shadow-lg">
                  <Eye className="h-5 w-5 text-primary" />
                </div>
              </div>
            </div>

            {/* Content Section - Rumah123 Style */}
            <CardContent className="p-2.5 sm:p-3 space-y-1.5">
              {/* Price */}
              <div className="border border-primary/15 bg-primary/5 dark:bg-primary/10 rounded-lg px-2.5 py-1.5">
                <div className="flex items-baseline gap-1 flex-wrap">
                  <span className="text-base sm:text-lg font-black text-primary tracking-tight leading-none">{priceInfo.main}</span>
                  {priceInfo.suffix && (
                    <span className="text-[11px] sm:text-sm font-extrabold text-primary/70">{priceInfo.suffix}</span>
                  )}
                  {isRent && <span className="text-[10px] text-primary/50 font-bold">/bln</span>}
                  {!isRent && (
                    <span className="text-[9px] sm:text-[10px] text-muted-foreground/60 font-medium bg-muted/40 rounded-full px-1.5 py-px">≈ {formatMonthlyPayment(property.price)}</span>
                  )}
                </div>
              </div>

              {/* Title */}
              <h3 className="text-[11px] sm:text-xs font-medium text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                {property.title}
              </h3>

              {/* Location */}
              <div className="flex items-center gap-1 bg-primary/5 dark:bg-primary/10 rounded px-1.5 py-0.5" title={getLocation(property)}>
                <MapPin className="h-3 w-3 flex-shrink-0 text-primary/70" />
                <span className="text-[10px] text-foreground/70 font-medium truncate">{getLocation(property)}</span>
              </div>

              {/* Specs */}
              <div className="flex items-center gap-1 pt-1.5 border-t border-primary/10">
                {property.bedrooms && property.bedrooms > 0 && (
                  <div className="flex items-center gap-0.5 border border-primary/15 bg-primary/5 dark:bg-primary/10 rounded px-1.5 py-0.5">
                    <Bed className="h-3 w-3 text-primary/60" />
                    <span className="text-[11px] text-foreground/80 font-bold">{property.bedrooms}</span>
                    <span className="text-[9px] text-muted-foreground/70 font-semibold">KT</span>
                  </div>
                )}
                {property.bathrooms && property.bathrooms > 0 && (
                  <div className="flex items-center gap-0.5 border border-primary/15 bg-primary/5 dark:bg-primary/10 rounded px-1.5 py-0.5">
                    <Bath className="h-3 w-3 text-primary/60" />
                    <span className="text-[11px] text-foreground/80 font-bold">{property.bathrooms}</span>
                    <span className="text-[9px] text-muted-foreground/70 font-semibold">KM</span>
                  </div>
                )}
                {property.area_sqm && (
                  <div className="flex items-center gap-0.5 border border-primary/15 bg-primary/5 dark:bg-primary/10 rounded px-1.5 py-0.5">
                    <span className="text-[9px] text-primary/60 font-bold">LB</span>
                    <span className="text-[11px] text-foreground/80 font-bold">{property.area_sqm}m²</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-1.5 pt-1">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 w-7 p-0 flex-shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShare(property);
                  }}
                >
                  <Share2 className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  className="flex-1 h-7 text-[10px] bg-chart-1 hover:bg-chart-1/90 text-chart-1-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    onContact?.(property);
                  }}
                >
                  <Phone className="h-3 w-3 mr-1" />
                  WhatsApp
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
      
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