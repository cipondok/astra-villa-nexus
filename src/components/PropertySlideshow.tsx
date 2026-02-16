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
      return `Rp ${(monthly / 1000000).toFixed(0)} Jutaan/bulan`;
    }
    return `Rp ${(monthly / 1000).toFixed(0)} Ribuan/bulan`;
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
      {/* Property-themed background wallpaper */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/25 via-primary/10 to-primary/25 dark:from-primary/15 dark:via-primary/5 dark:to-primary/15" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-transparent to-background/60" />
        <div 
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 10 L45 25 L45 45 L15 45 L15 25 Z' fill='none' stroke='currentColor' stroke-width='1'/%3E%3Cpath d='M25 45 L25 35 L35 35 L35 45' fill='none' stroke='currentColor' stroke-width='1'/%3E%3Cpath d='M30 10 L30 5 L35 5 L35 15' fill='none' stroke='currentColor' stroke-width='1'/%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>
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
              <div className="rounded-lg border border-border/50 hover:border-primary/30 transition-all duration-300 overflow-hidden">
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
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 bg-black/10">
                    <div className="h-8 w-8 rounded-full bg-card/95 backdrop-blur-sm flex items-center justify-center shadow-lg">
                      <Eye className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                </div>

                {/* Content - Rumah123 Style */}
                <div className="p-2.5 space-y-1.5">
                  {/* Price */}
                  <div className="space-y-0">
                    <div className="flex items-baseline gap-0.5">
                      <span className="text-sm font-bold text-primary">{priceInfo.main}</span>
                      {priceInfo.suffix && (
                        <span className="text-xs font-medium text-primary/80">{priceInfo.suffix}</span>
                      )}
                    </div>
                    {!isRent && (
                      <p className="text-[9px] text-muted-foreground">{formatMonthly(property.price)}</p>
                    )}
                    {isRent && (
                      <p className="text-[9px] text-muted-foreground">per bulan</p>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-[11px] font-medium text-foreground line-clamp-1 leading-snug group-hover/card:text-primary transition-colors truncate">
                    {property.title}
                  </h3>

                  {/* Location */}
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="h-2.5 w-2.5 flex-shrink-0 text-primary/70" />
                    <span className="text-[10px] line-clamp-1">{getLocation(property)}</span>
                  </div>

                  {/* Specs - Rumah123 Style */}
                  <div className="flex items-center gap-2 pt-1 border-t border-border/50">
                    {property.bedrooms > 0 && (
                      <div className="flex items-center gap-0.5">
                        <Bed className="h-3 w-3 text-muted-foreground" />
                        <span className="text-[10px] text-foreground font-medium">{property.bedrooms}</span>
                      </div>
                    )}
                    {property.bathrooms > 0 && (
                      <div className="flex items-center gap-0.5">
                        <Bath className="h-3 w-3 text-muted-foreground" />
                        <span className="text-[10px] text-foreground font-medium">{property.bathrooms}</span>
                      </div>
                    )}
                    {property.area_sqm > 0 && (
                      <div className="flex items-center gap-0.5">
                        <Maximize className="h-3 w-3 text-muted-foreground" />
                        <span className="text-[10px] text-foreground font-medium">{property.area_sqm}m²</span>
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
