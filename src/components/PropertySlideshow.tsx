import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import useAutoHorizontalScroll from "@/hooks/useAutoHorizontalScroll";
import { ChevronLeft, ChevronRight, Bed, Bath, Maximize, Key, Tag, Building, Eye, MapPin, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useDefaultPropertyImage } from "@/hooks/useDefaultPropertyImage";

interface Property {
  id: number | string;
  title: string;
  location: string;
  price: number;
  property_type: string;
  listing_type: string | null;
  bedrooms: number;
  bathrooms: number;
  area_sqm: number;
  images: string[];
  thumbnail_url?: string;
  city: string;
  state: string;
  area?: string;
}

const getListingLabel = (type: string | null, isRent: boolean) => {
  if (isRent) return 'Disewa';
  return 'Dijual';
};

const PropertySlideshow = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const navigate = useNavigate();
  const { getPropertyImage } = useDefaultPropertyImage();

  const handlePropertyClick = (propertyId: number | string) => {
    navigate(`/properties/${propertyId}`);
  };

  const { data: properties = [] } = useQuery({
    queryKey: ['slideshow-properties'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('id, title, location, price, property_type, listing_type, bedrooms, bathrooms, area_sqm, images, thumbnail_url, city, state, area')
        .eq('status', 'active')
        .eq('approval_status', 'approved')
        .not('title', 'is', null)
        .order('created_at', { ascending: false })
        .limit(24);

      if (error) {
        console.error('Error fetching slideshow properties:', error);
        return [];
      }

      return data || [];
    },
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });

  useAutoHorizontalScroll(containerRef, {
    speed: 0.8,
    intervalMs: 16,
    direction: 'rtl',
    pauseOnHover: true,
    loopMode: 'seamless',
  });

  const scrollLeft = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: -260, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: 260, behavior: 'smooth' });
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 1000000000) {
      const value = (price / 1000000000).toFixed(1);
      return { main: `Rp ${value}`, suffix: 'Miliar' };
    } else if (price >= 1000000) {
      const value = (price / 1000000).toFixed(0);
      return { main: `Rp ${value}`, suffix: 'Juta' };
    } else {
      return { main: `Rp ${price.toLocaleString('id-ID')}`, suffix: '' };
    }
  };

  const formatMonthly = (price: number) => {
    const monthly = price * 0.006;
    if (monthly >= 1000000) {
      return `Rp ${(monthly / 1000000).toFixed(1)} Juta/PB`;
    }
    return `Rp ${(monthly / 1000).toFixed(0)} Ribu/PB`;
  };

  const getLocation = (property: Property) => {
    if (property.area && property.city) return `${property.area}, ${property.city}`;
    if (property.city && property.state) return `${property.city}, ${property.state}`;
    return property.location || 'Indonesia';
  };

  if (properties.length === 0) {
    return (
      <div className="w-full overflow-hidden my-4">
        <div className="flex gap-3 px-2">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="flex-shrink-0 w-[220px] md:w-[240px] animate-pulse">
              <div className="h-36 md:h-40 bg-muted rounded-lg mb-2"></div>
              <div className="space-y-1.5 px-1">
                <div className="h-4 bg-muted rounded w-2/3"></div>
                <div className="h-3 bg-muted rounded w-full"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const displayProperties = [...properties, ...properties, ...properties];

  return (
    <div 
      className="w-full overflow-hidden relative py-6 group"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Navigation Arrows */}
      <Button
        variant="outline"
        size="icon"
        onClick={scrollLeft}
        className={cn(
          "absolute left-2 top-1/2 -translate-y-1/2 z-10 h-9 w-9 rounded-full bg-card/95 hover:bg-card backdrop-blur-md shadow-lg border border-border/50 transition-all duration-300",
          isHovering ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
        )}
      >
        <ChevronLeft className="h-4 w-4 text-foreground" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        onClick={scrollRight}
        className={cn(
          "absolute right-2 top-1/2 -translate-y-1/2 z-10 h-9 w-9 rounded-full bg-card/95 hover:bg-card backdrop-blur-md shadow-lg border border-border/50 transition-all duration-300",
          isHovering ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
        )}
      >
        <ChevronRight className="h-4 w-4 text-foreground" />
      </Button>

      <div 
        ref={containerRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide px-4 py-1 relative z-10"
        style={{ scrollBehavior: 'auto' }}
      >
        {displayProperties.map((property, idx) => {
          const priceInfo = formatPrice(property.price);
          const isRent = property.listing_type === 'rent';
          const imageCount = property.images?.length || 1;
          const ListingIcon = isRent ? Key : Tag;

          return (
            <div 
              key={`${property.id}-${idx}`}
              onClick={() => handlePropertyClick(property.id)}
              className="flex-shrink-0 w-[200px] md:w-[220px] lg:w-[240px] group/card cursor-pointer"
            >
              {/* Rumah123-Style Card */}
              <div className="rounded-lg bg-card/70 backdrop-blur-md border border-primary/10 dark:border-primary/15 shadow-[0_2px_12px_rgba(0,0,0,0.05)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.1)] hover:border-primary/25 transition-all duration-300 overflow-hidden">
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                  <img
                    src={getPropertyImage(property.images, property.thumbnail_url)}
                    alt={property.title}
                    className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  
                  {/* Top Badges */}
                  <div className="absolute top-2 left-2 right-2 flex items-center justify-between">
                    <Badge className={cn(
                      "flex items-center gap-1 px-2 py-1 text-[10px] font-semibold rounded-md shadow-sm",
                      isRent ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground"
                    )}>
                      <ListingIcon className="h-2.5 w-2.5" />
                      {getListingLabel(property.listing_type, isRent)}
                    </Badge>
                    
                    <Badge className="flex items-center gap-0.5 bg-card/90 backdrop-blur-sm text-foreground text-[10px] px-1.5 py-0.5 rounded-md shadow-sm border border-border/50">
                      <Building className="h-2.5 w-2.5" />
                      {property.property_type ? property.property_type.charAt(0).toUpperCase() + property.property_type.slice(1).toLowerCase() : 'Property'}
                    </Badge>
                  </div>

                  {/* Image Count */}
                  {imageCount > 1 && (
                    <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm text-white text-[9px] px-1.5 py-0.5 rounded">
                      <Camera className="h-2.5 w-2.5" />
                      <span>{imageCount}</span>
                    </div>
                  )}

                  {/* Hover Eye */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 bg-black/10 dark:bg-black/20">
                    <div className="h-8 w-8 rounded-full bg-card/95 backdrop-blur-sm flex items-center justify-center shadow-lg">
                      <Eye className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-2.5 space-y-1.5">
                  {/* Price */}
                  <div className="border border-primary/15 bg-primary/5 dark:bg-primary/10 rounded-md px-2 py-1">
                    <div className="flex items-baseline gap-1 flex-nowrap overflow-hidden whitespace-nowrap">
                      <span className="text-sm font-black text-primary tracking-tight">{priceInfo.main}</span>
                      {priceInfo.suffix && (
                        <span className="text-xs font-extrabold text-primary/70">{priceInfo.suffix}</span>
                      )}
                      {isRent && (
                        <span className="text-[9px] text-primary/60 font-bold">/bln</span>
                      )}
                      {!isRent && (
                        <span className="text-[9px] text-muted-foreground/60 font-medium bg-muted/40 rounded-full px-1.5 py-px">≈ {formatMonthly(property.price)}</span>
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-[11px] font-semibold text-foreground line-clamp-1 leading-snug group-hover/card:text-primary transition-colors">
                    {property.title}
                  </h3>

                  {/* Location */}
                  <div className="flex items-center gap-1 bg-primary/5 dark:bg-primary/10 rounded px-1.5 py-0.5">
                    <MapPin className="h-2.5 w-2.5 flex-shrink-0 text-primary/70" />
                    <span className="text-[10px] text-foreground/70 font-medium line-clamp-1">{getLocation(property)}</span>
                  </div>

                  {/* Specs */}
                  <div className="flex items-center gap-2 pt-1.5 border-t border-primary/10">
                    {property.bedrooms > 0 && (
                      <div className="flex items-center gap-0.5 border border-primary/15 bg-primary/5 dark:bg-primary/10 rounded px-1.5 py-0.5">
                        <Bed className="h-3 w-3 text-primary/60" />
                        <span className="text-[10px] text-foreground/80 font-bold">{property.bedrooms}</span>
                        <span className="text-[8px] text-muted-foreground/70 font-semibold">KT</span>
                      </div>
                    )}
                    {property.bathrooms > 0 && (
                      <div className="flex items-center gap-0.5 border border-primary/15 bg-primary/5 dark:bg-primary/10 rounded px-1.5 py-0.5">
                        <Bath className="h-3 w-3 text-primary/60" />
                        <span className="text-[10px] text-foreground/80 font-bold">{property.bathrooms}</span>
                        <span className="text-[8px] text-muted-foreground/70 font-semibold">KM</span>
                      </div>
                    )}
                    {property.area_sqm > 0 && (
                      <div className="flex items-center gap-0.5 border border-primary/15 bg-primary/5 dark:bg-primary/10 rounded px-1.5 py-0.5">
                        <span className="text-[8px] text-primary/60 font-bold">LB</span>
                        <span className="text-[10px] text-foreground/80 font-bold">{property.area_sqm}m²</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PropertySlideshow;
