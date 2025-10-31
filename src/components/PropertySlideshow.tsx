
import { useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import useAutoHorizontalScroll from "@/hooks/useAutoHorizontalScroll";

interface Property {
  id: number;
  title: string;
  location: string;
  price: number;
  property_type: string;
  bedrooms: number;
  bathrooms: number;
  area_sqm: number;
  images: string[];
  thumbnail_url?: string;
  city: string;
  state: string;
}

const PropertySlideshow = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch featured properties for slideshow
  const { data: properties = [] } = useQuery({
    queryKey: ['slideshow-properties'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching slideshow properties:', error);
        return [];
      }

      return data || [];
    },
    staleTime: 60000,
  });

  // Use auto-scroll hook
  useAutoHorizontalScroll(containerRef, {
    speed: 1,
    intervalMs: 30,
    direction: 'rtl',
    pauseOnHover: true,
  });

  const formatPrice = (price: number) => {
    if (price >= 1000000000) {
      return `Rp ${(price / 1000000000).toFixed(1)}B`;
    } else if (price >= 1000000) {
      return `Rp ${(price / 1000000).toFixed(1)}M`;
    } else {
      return `Rp ${price.toLocaleString()}`;
    }
  };

  if (properties.length === 0) {
    return (
      <div className="w-full overflow-hidden">
        <div className="flex gap-3 px-4">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="flex-shrink-0 w-[280px] animate-pulse">
              <div className="h-40 bg-muted rounded-lg mb-2"></div>
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded w-3/4"></div>
                <div className="h-2 bg-muted rounded w-1/2"></div>
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
    <div className="w-full overflow-hidden py-4">
      <div 
        ref={containerRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide px-4"
        style={{ scrollBehavior: 'auto' }}
      >
        {displayProperties.map((property, idx) => (
          <div 
            key={`${property.id}-${idx}`}
            className="flex-shrink-0 w-[280px] group cursor-pointer"
          >
            <div className="relative overflow-hidden rounded-lg mb-2">
              <img
                src={property.thumbnail_url || property.images?.[0] || '/placeholder.svg'}
                alt={property.title}
                className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute top-2 right-2">
                <span className="px-2 py-0.5 bg-primary/90 text-primary-foreground text-[10px] font-semibold rounded-full backdrop-blur-sm">
                  {property.property_type}
                </span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            
            <div className="px-1">
              <div className="text-sm font-bold text-foreground mb-0.5">
                {formatPrice(property.price)}
              </div>
              <h3 className="text-xs font-medium text-foreground/90 line-clamp-1 mb-1">
                {property.title}
              </h3>
              <div className="text-[10px] text-muted-foreground mb-2 line-clamp-1">
                {property.city}, {property.state}
              </div>
              <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                <div className="flex items-center gap-1">
                  <i className="fas fa-bed"></i>
                  <span>{property.bedrooms}</span>
                </div>
                <div className="flex items-center gap-1">
                  <i className="fas fa-bath"></i>
                  <span>{property.bathrooms}</span>
                </div>
                <div className="flex items-center gap-1">
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
