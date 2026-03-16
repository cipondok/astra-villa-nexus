import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Bed, Bath, Maximize, Heart, Share2, Eye, Phone, Box, Tag, Percent, Key, Building, Camera } from "lucide-react";
import { cn } from "@/lib/utils";
import PropertyComparisonButton from "@/components/property/PropertyComparisonButton";
import SocialShareDialog from "@/components/property/SocialShareDialog";
import InvestmentScoreBadge from "@/components/property/InvestmentScoreBadge";
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
      <div className="text-center py-16">
        <div className="text-muted-foreground text-base font-medium">No properties found</div>
        <div className="text-sm text-muted-foreground mt-1">Try adjusting your search or filters</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
      {properties.map((property) => {
        const priceInfo = formatPrice(property.price);
        const isRent = property.listing_type === 'rent';
        const imageCount = property.images?.length || property.image_urls?.length || 1;
        const ListingIcon = isRent ? Key : Tag;
        const investmentScore = (property as any).investment_score || 0;
        const isHighOpportunity = investmentScore >= 75;

        return (
          <Card 
            key={property.id} 
            className={cn(
              "group cursor-pointer bg-card rounded-xl border shadow-sm overflow-hidden will-change-transform",
              "hover:shadow-[0_12px_28px_-8px_hsl(var(--primary)/0.12)] hover:-translate-y-1 transition-all duration-300 ease-out",
              isHighOpportunity
                ? "border-primary/30 ring-1 ring-primary/10"
                : "border-border hover:border-primary/25"
            )}
            onClick={() => onPropertyClick(property)}
          >
            {/* Image — 16:10 ratio for premium readability */}
            <div className="relative aspect-[16/10] overflow-hidden bg-muted">
              <img
                src={getImageUrl(property)}
                alt={property.title}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
              />
              
              {/* Top row: listing type + property type */}
              <div className="absolute top-2.5 left-2.5 right-2.5 flex items-start justify-between">
                <Badge className={cn(
                  "flex items-center gap-1 px-2 py-1 text-[10px] font-semibold rounded-md shadow-sm",
                  isRent ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground"
                )}>
                  <ListingIcon className="h-2.5 w-2.5" />
                  {isRent ? 'Disewa' : 'Dijual'}
                </Badge>

                <div className="flex items-center gap-1.5">
                  <Button size="icon" variant="ghost"
                    className={cn(
                      "h-8 w-8 rounded-full bg-card/90 backdrop-blur-sm shadow-sm border border-border/50 min-h-[32px]",
                      savedProperties.has(property.id) && "bg-destructive/10 border-destructive/30"
                    )}
                    onClick={(e) => { e.stopPropagation(); handleSave(property); }}>
                    <Heart className={cn("h-3.5 w-3.5", savedProperties.has(property.id) ? 'fill-destructive text-destructive' : 'text-muted-foreground')} />
                  </Button>
                </div>
              </div>

              {/* AI Investment Score — prominent badge for high scores */}
              {investmentScore > 0 && (
                <div className="absolute bottom-2.5 left-2.5 z-10">
                  <InvestmentScoreBadge score={investmentScore} compact className={cn("shadow-md", isHighOpportunity && "ring-1 ring-gold-primary/40")} />
                </div>
              )}

              {/* Image count */}
              {imageCount > 1 && (
                <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1 bg-background/70 backdrop-blur-sm text-foreground text-[10px] px-2 py-1 rounded-md">
                  <Camera className="h-2.5 w-2.5" />
                  <span className="font-medium">{imageCount}</span>
                </div>
              )}
            </div>

            {/* Content */}
            <CardContent className="p-3.5 sm:p-4 space-y-2.5">
              {/* Price block */}
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="text-lg sm:text-xl font-black text-primary tracking-tight leading-none drop-shadow-sm">{priceInfo.main}</span>
                {isRent && <span className="text-[11px] text-muted-foreground font-semibold">/bln</span>}
                {!isRent && (
                  <span className="text-[10px] text-muted-foreground font-medium">≈ {formatMonthlyPayment(property.price)}</span>
                )}
              </div>

              {/* Title */}
              <h3 className="text-sm font-semibold text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                {property.title}
              </h3>

              {/* Location */}
              <div className="flex items-center gap-1.5" title={getLocation(property)}>
                <MapPin className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
                <span className="text-xs text-muted-foreground font-medium truncate">{getLocation(property)}</span>
              </div>

              {/* Specs row */}
              <div className="flex items-center gap-3 pt-2 border-t border-border/50 text-xs text-muted-foreground">
                {property.bedrooms && property.bedrooms > 0 && (
                  <div className="flex items-center gap-1">
                    <Bed className="h-3.5 w-3.5" />
                    <span className="font-semibold text-foreground">{property.bedrooms}</span>
                    <span>KT</span>
                  </div>
                )}
                {property.bathrooms && property.bathrooms > 0 && (
                  <div className="flex items-center gap-1">
                    <Bath className="h-3.5 w-3.5" />
                    <span className="font-semibold text-foreground">{property.bathrooms}</span>
                    <span>KM</span>
                  </div>
                )}
                {property.area_sqm && (
                  <div className="flex items-center gap-1">
                    <Maximize className="h-3.5 w-3.5" />
                    <span className="font-semibold text-foreground">{property.area_sqm}</span>
                    <span>m²</span>
                  </div>
                )}
              </div>

              {/* CTA row */}
              <div className="flex gap-2 pt-1">
                <Button size="sm" variant="outline"
                  className="h-9 w-9 p-0 flex-shrink-0 min-w-[36px] min-h-[36px]"
                  onClick={(e) => { e.stopPropagation(); handleShare(property); }}>
                  <Share2 className="h-3.5 w-3.5" />
                </Button>
                <Button size="sm"
                  className="flex-1 h-9 text-[11px] sm:text-xs font-semibold bg-chart-1 hover:bg-chart-1/90 text-chart-1-foreground min-h-[36px]"
                  onClick={(e) => { e.stopPropagation(); onContact?.(property); }}>
                  <Phone className="h-3.5 w-3.5 mr-1.5" />
                  WhatsApp
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
      
      {selectedProperty && (
        <SocialShareDialog open={shareDialogOpen} onOpenChange={setShareDialogOpen} property={selectedProperty} />
      )}
    </div>
  );
};

export default PropertyGridView;