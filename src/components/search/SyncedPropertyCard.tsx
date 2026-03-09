import { memo, forwardRef } from 'react';
import { MapPin, Bed, Bath, Maximize2, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapProperty } from '@/hooks/useMapProperties';
import { cn } from '@/lib/utils';

const formatPrice = (price: number) => {
  if (price >= 1_000_000_000) return `Rp ${(price / 1_000_000_000).toFixed(1)}M`;
  if (price >= 1_000_000) return `Rp ${(price / 1_000_000).toFixed(0)}jt`;
  if (price >= 1_000) return `Rp ${(price / 1_000).toFixed(0)}rb`;
  return `Rp ${price}`;
};

interface SyncedPropertyCardProps {
  property: MapProperty;
  isHighlighted: boolean;
  onHover: (id: string | null) => void;
  onClick: (property: MapProperty) => void;
  compact?: boolean;
}

const SyncedPropertyCard = memo(forwardRef<HTMLDivElement, SyncedPropertyCardProps>(
  ({ property, isHighlighted, onHover, onClick, compact = false }, ref) => {
    const imageUrl = property.thumbnail_url
      || (property.images?.length > 0 ? property.images[0] : null)
      || (property.image_urls?.length > 0 ? property.image_urls[0] : null)
      || '/placeholder.svg';

    if (compact) {
      return (
        <div
          ref={ref}
          className={cn(
            "flex-shrink-0 w-72 snap-center cursor-pointer transition-all duration-200",
            isHighlighted && "scale-[1.02]"
          )}
          onMouseEnter={() => onHover(property.id)}
          onMouseLeave={() => onHover(null)}
          onClick={() => onClick(property)}
        >
          <Card className={cn(
            "overflow-hidden border transition-all duration-300 h-full",
            isHighlighted
              ? "border-primary shadow-lg shadow-primary/20 ring-2 ring-primary/30"
              : "border-border/60 shadow-md"
          )}>
            <div className="relative h-28">
              <img src={imageUrl} alt={property.title} className="w-full h-full object-cover" loading="lazy"
                onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }} />
              <Badge className="absolute top-1.5 left-1.5 bg-primary text-primary-foreground font-bold text-[10px] shadow">
                {formatPrice(property.price)}
              </Badge>
            </div>
            <CardContent className="p-2.5">
              <h4 className="text-xs font-semibold text-foreground line-clamp-1">{property.title}</h4>
              <p className="text-[10px] text-muted-foreground flex items-center gap-0.5 mt-0.5">
                <MapPin className="h-2.5 w-2.5" /> {property.city || property.location}
              </p>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-1">
                {property.bedrooms > 0 && <span className="flex items-center gap-0.5"><Bed className="h-2.5 w-2.5" />{property.bedrooms}</span>}
                {property.bathrooms > 0 && <span className="flex items-center gap-0.5"><Bath className="h-2.5 w-2.5" />{property.bathrooms}</span>}
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className="cursor-pointer transition-all duration-200"
        onMouseEnter={() => onHover(property.id)}
        onMouseLeave={() => onHover(null)}
        onClick={() => onClick(property)}
      >
        <Card className={cn(
          "overflow-hidden border transition-all duration-300",
          isHighlighted
            ? "border-primary shadow-lg shadow-primary/20 ring-2 ring-primary/30 bg-primary/5"
            : "border-border/60 hover:border-border hover:shadow-md"
        )}>
          <div className="flex gap-0">
            {/* Image */}
            <div className="relative w-32 min-h-[120px] flex-shrink-0">
              <img
                src={imageUrl}
                alt={property.title}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
              />
              {property.investment_score && property.investment_score >= 80 && (
                <Badge className="absolute bottom-1 left-1 bg-chart-3/90 text-primary-foreground text-[9px] px-1 py-0">
                  <TrendingUp className="h-2.5 w-2.5 mr-0.5" />{property.investment_score}
                </Badge>
              )}
            </div>
            {/* Details */}
            <CardContent className="p-3 flex-1 flex flex-col justify-between min-w-0">
              <div>
                <Badge className="bg-primary text-primary-foreground font-bold text-xs mb-1.5 shadow-sm">
                  {formatPrice(property.price)}
                </Badge>
                <h4 className="text-sm font-semibold text-foreground line-clamp-1">{property.title}</h4>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <MapPin className="h-3 w-3 flex-shrink-0" />
                  <span className="line-clamp-1">{property.city || property.location}, {property.state}</span>
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
                {property.bedrooms > 0 && (
                  <span className="flex items-center gap-1"><Bed className="h-3 w-3" />{property.bedrooms}</span>
                )}
                {property.bathrooms > 0 && (
                  <span className="flex items-center gap-1"><Bath className="h-3 w-3" />{property.bathrooms}</span>
                )}
                {property.building_area_sqm && (
                  <span className="flex items-center gap-1"><Maximize2 className="h-3 w-3" />{property.building_area_sqm}m²</span>
                )}
                <Badge variant="outline" className="text-[10px] ml-auto">{property.property_type}</Badge>
              </div>
            </CardContent>
          </div>
        </Card>
      </div>
    );
  }
));

SyncedPropertyCard.displayName = 'SyncedPropertyCard';
export default SyncedPropertyCard;
