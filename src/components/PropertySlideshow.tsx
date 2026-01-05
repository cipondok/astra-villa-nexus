
import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import useAutoHorizontalScroll from "@/hooks/useAutoHorizontalScroll";
import { ChevronLeft, ChevronRight, Bed, Bath, Maximize, Key, Tag, Building } from "lucide-react";

// Helper to capitalize first letter
const capitalizeFirst = (str: string) => str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : 'Property';
import { Button } from "@/components/ui/button";

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
        .limit(20);

      if (error) {
        console.error('Error fetching slideshow properties:', error);
        return [];
      }

      return data || [];
    },
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });

  // Use auto-scroll hook with right-to-left direction
  useAutoHorizontalScroll(containerRef, {
    speed: 1.5,
    intervalMs: 25,
    direction: 'rtl',
    pauseOnHover: true,
  });

  const scrollLeft = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 1000000000) {
      return `Rp${(price / 1000000000).toFixed(1)}M`;
    } else if (price >= 1000000) {
      return `Rp${(price / 1000000).toFixed(0)}Jt`;
    } else {
      return `Rp${price.toLocaleString()}`;
    }
  };

  if (properties.length === 0) {
    return (
      <div className="w-full overflow-hidden my-8">
        <div className="flex gap-4 px-4">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="flex-shrink-0 w-[300px] animate-pulse">
              <div className="h-48 bg-muted rounded-xl mb-2"></div>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Duplicate items for seamless loop
  const displayProperties = [...properties, ...properties];

  return (
    <div 
      className="w-full overflow-hidden relative my-12 group"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Modern Navigation Arrows */}
      <Button
        variant="outline"
        size="icon"
        onClick={scrollLeft}
        className={`absolute left-4 top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full bg-white/90 dark:bg-gray-900/90 hover:bg-white dark:hover:bg-gray-900 backdrop-blur-md shadow-xl border-2 border-primary/20 transition-all duration-300 ${isHovering ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}
      >
        <ChevronLeft className="h-6 w-6 text-primary" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        onClick={scrollRight}
        className={`absolute right-4 top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full bg-white/90 dark:bg-gray-900/90 hover:bg-white dark:hover:bg-gray-900 backdrop-blur-md shadow-xl border-2 border-primary/20 transition-all duration-300 ${isHovering ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}
      >
        <ChevronRight className="h-6 w-6 text-primary" />
      </Button>

      <div 
        ref={containerRef}
        className="flex gap-6 overflow-x-auto scrollbar-hide px-4 py-4"
        style={{ scrollBehavior: 'auto' }}
      >
        {displayProperties.map((property, idx) => (
          <div 
            key={`${property.id}-${idx}`}
            className="flex-shrink-0 w-[300px] group cursor-pointer transition-all duration-300 hover:scale-105"
          >
            <div className="relative overflow-hidden rounded-2xl mb-3 shadow-lg">
              <img
                src={property.thumbnail_url || property.images?.[0] || '/placeholder.svg'}
                alt={property.title}
                className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute top-3 left-3">
                <span className={`flex items-center gap-0.5 px-2 py-1 text-white text-[10px] font-semibold rounded-full backdrop-blur-sm shadow-md ${
                  property.listing_type === 'rent' ? 'bg-blue-500' : 'bg-green-500'
                }`}>
                  {property.listing_type === 'rent' ? <Key className="h-3 w-3" /> : <Tag className="h-3 w-3" />}
                  {getListingLabel(property.listing_type)}
                </span>
              </div>
              <div className="absolute top-3 right-3">
                <span className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-xs font-semibold rounded-full backdrop-blur-sm shadow-md">
                  <Building className="h-3 w-3" />
                  {capitalizeFirst(property.property_type)}
                </span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            
            <div className="px-2">
              <div className="text-sm font-bold text-foreground mb-1 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                {formatPrice(property.price)}
              </div>
              <h3 className="text-sm font-semibold text-foreground line-clamp-1 mb-2">
                {property.title}
              </h3>
              <div className="text-xs text-muted-foreground mb-3 line-clamp-1 flex items-center gap-1">
                <i className="fas fa-map-marker-alt"></i>
                {property.city}, {property.state}
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground bg-muted/80 rounded-lg px-2 py-1.5 backdrop-blur-sm">
                <div className="flex items-center gap-1.5">
                  <Bed className="h-3.5 w-3.5" />
                  <span>{property.bedrooms}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Bath className="h-3.5 w-3.5" />
                  <span>{property.bathrooms}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Maximize className="h-3.5 w-3.5" />
                  <span>{property.area_sqm}m²</span>
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
