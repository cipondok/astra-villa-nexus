
import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import useAutoHorizontalScroll from "@/hooks/useAutoHorizontalScroll";
import { ChevronLeft, ChevronRight, Bed, Bath, Maximize, Key, Tag, Building, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

// Helper to capitalize first letter
const capitalizeFirst = (str: string) => str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : 'Property';

interface Property {
  id: number;
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
  owner_type?: string;
  owner_verified?: boolean;
  agent_verified?: boolean;
  agency_verified?: boolean;
}

// Get listing type label
const getListingLabel = (type: string | null) => {
  switch (type) {
    case 'rent': return 'Sewa';
    case 'sale': return 'Jual';
    case 'lease': return 'Sewa';
    default: return 'Jual';
  }
};

const PropertySlideshow = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const navigate = useNavigate();

  const handlePropertyClick = (propertyId: number | string) => {
    navigate(`/properties/${propertyId}`);
  };

  // Fetch featured properties for slideshow
  const { data: properties = [] } = useQuery({
    queryKey: ['slideshow-properties'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('id, title, location, price, property_type, listing_type, bedrooms, bathrooms, area_sqm, images, thumbnail_url, city, state')
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

  // Use auto-scroll hook with seamless loop mode for wide screens
  useAutoHorizontalScroll(containerRef, {
    speed: 0.8,
    intervalMs: 16,
    direction: 'rtl',
    pauseOnHover: true,
    loopMode: 'seamless',
  });

  const scrollLeft = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: -220, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: 220, behavior: 'smooth' });
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 1000000000) {
      const value = (price / 1000000000).toFixed(1);
      return <><span className="text-[0.65em] font-medium opacity-80">Rp</span>{value}<span className="text-[0.65em] font-medium opacity-80">M</span></>;
    } else if (price >= 1000000) {
      const value = (price / 1000000).toFixed(0);
      return <><span className="text-[0.65em] font-medium opacity-80">Rp</span>{value}<span className="text-[0.65em] font-medium opacity-80">Jt</span></>;
    } else {
      return <><span className="text-[0.65em] font-medium opacity-80">Rp</span>{price.toLocaleString()}</>;
    }
  };

  if (properties.length === 0) {
    return (
      <div className="w-full overflow-hidden my-4">
        <div className="flex gap-2 px-2">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="flex-shrink-0 w-[180px] md:w-[200px] animate-pulse">
              <div className="h-28 md:h-32 bg-muted rounded-lg mb-1.5"></div>
              <div className="space-y-1">
                <div className="h-3 bg-muted rounded w-3/4"></div>
                <div className="h-2 bg-muted rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Triple items for seamless infinite loop on wide screens
  const displayProperties = [...properties, ...properties, ...properties];

  return (
    <div 
      className="w-full overflow-hidden relative py-3 group"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Compact Navigation Arrows */}
      <Button
        variant="outline"
        size="icon"
        onClick={scrollLeft}
        className={`absolute left-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-background/90 hover:bg-background backdrop-blur-md shadow-lg border border-border/50 transition-all duration-300 ${isHovering ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}
      >
        <ChevronLeft className="h-4 w-4 text-foreground" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        onClick={scrollRight}
        className={`absolute right-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-background/90 hover:bg-background backdrop-blur-md shadow-lg border border-border/50 transition-all duration-300 ${isHovering ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}
      >
        <ChevronRight className="h-4 w-4 text-foreground" />
      </Button>

      <div 
        ref={containerRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide px-2 py-1"
        style={{ scrollBehavior: 'auto' }}
      >
        {displayProperties.map((property, idx) => (
          <div 
            key={`${property.id}-${idx}`}
            onClick={() => handlePropertyClick(property.id)}
            className="flex-shrink-0 w-[140px] md:w-[160px] lg:w-[180px] xl:w-[200px] group/card cursor-pointer transition-transform duration-300 hover:scale-[1.02]"
          >
            {/* Slim Card - All info on image */}
            <div className="relative overflow-hidden rounded-lg shadow-md">
              <img
                src={property.thumbnail_url || property.images?.[0] || '/placeholder.svg'}
                alt={property.title}
                className="w-full h-28 md:h-32 lg:h-36 object-cover transition-transform duration-500 group-hover/card:scale-110"
                loading="lazy"
              />
              
              {/* Top Row - Listing Type & Property Type */}
              <div className="absolute top-1 left-1 right-1 flex items-center justify-between">
                <span className={`flex items-center gap-0.5 px-1.5 py-0.5 text-white text-[7px] font-semibold rounded backdrop-blur-sm shadow ${
                  property.listing_type === 'rent' ? 'bg-blue-500/90' : 'bg-emerald-500/90'
                }`}>
                  {property.listing_type === 'rent' ? <Key className="h-2 w-2" /> : <Tag className="h-2 w-2" />}
                  {getListingLabel(property.listing_type)}
                </span>
                <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-black/60 backdrop-blur-sm text-white text-[7px] font-medium rounded shadow">
                  <Building className="h-2 w-2" />
                  {capitalizeFirst(property.property_type)}
                </span>
              </div>

              {/* Bottom Gradient Overlay with all info */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent pt-6 pb-1.5 px-1.5">
                {/* Price */}
                <div className="text-[10px] md:text-[11px] font-bold text-white mb-0.5">
                  {formatPrice(property.price)}
                </div>
                
                {/* Title */}
                <h3 className="text-[9px] md:text-[10px] font-medium text-white/95 line-clamp-1 mb-0.5">
                  {property.title}
                </h3>
                
                {/* Location */}
                <div className="text-[8px] text-white/70 line-clamp-1 mb-1">
                  {property.city}, {property.state}
                </div>
                
                {/* Stats Row */}
                <div className="flex items-center gap-1.5 text-[8px] text-white/80">
                  <div className="flex items-center gap-0.5">
                    <Bed className="h-2 w-2" />
                    <span>{property.bedrooms}</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <Bath className="h-2 w-2" />
                    <span>{property.bathrooms}</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <Maximize className="h-2 w-2" />
                    <span>{property.area_sqm}m²</span>
                  </div>
                </div>
              </div>

              {/* Hover View Icon */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 z-20">
                <div className="h-6 w-6 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
                  <Eye className="h-3 w-3 text-primary" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PropertySlideshow;
