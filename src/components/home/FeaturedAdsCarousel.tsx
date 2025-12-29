import { useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import useAutoHorizontalScroll from "@/hooks/useAutoHorizontalScroll";
import { useNavigate } from "react-router-dom";

interface FeaturedAd {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string;
  link_url: string | null;
  property_id: string | null;
  display_order: number;
}

interface FallbackProperty {
  id: string;
  title: string;
  price: number;
  property_type: string;
  city: string | null;
  state: string | null;
  images: string[] | null;
  thumbnail_url: string | null;
  owner_type?: string;
  owner_verified?: boolean;
  agent_verified?: boolean;
  agency_verified?: boolean;
}

export default function FeaturedAdsCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Fetch carousel settings from admin
  const { data: carouselSettings } = useQuery({
    queryKey: ['carousel-settings-featured'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('carousel_settings')
        .select('*')
        .eq('carousel_name', 'featured_properties')
        .single();
      
      if (error) {
        console.warn('No carousel settings found, using defaults');
        return null;
      }
      return data;
    },
    staleTime: 30 * 1000, // Cache for 30 seconds
  });

  // Fetch active featured ads
  const { data: ads, isLoading } = useQuery({
    queryKey: ['featured-ads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('featured_ads')
        .select('*')
        .eq('is_active', true)
        .order('display_order')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as FeaturedAd[];
    },
  });

  // Fallback: load recent approved properties when no featured ads
  const { data: fallbackProperties = [] } = useQuery({
    queryKey: ['featured-ads-fallback-properties'],
    enabled: !!ads && ads.length === 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('id, title, price, property_type, city, state, images, thumbnail_url, created_at')
        .eq('status', 'active')
        .eq('approval_status', 'approved')
        .not('title', 'is', null)
        .order('created_at', { ascending: false })
        .limit(16);
      
      if (error) throw error;
      return data as FallbackProperty[];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Auto-scroll configuration from admin settings (seamless loop by default)
  useAutoHorizontalScroll(scrollRef, {
    speed: carouselSettings?.auto_scroll === false ? 0 : (carouselSettings?.scroll_speed || 1.5),
    intervalMs: carouselSettings?.interval_ms || 25,
    direction: (carouselSettings?.scroll_direction as 'ltr' | 'rtl') || 'rtl',
    pauseOnHover: carouselSettings?.pause_on_hover ?? true,
    loopMode: (carouselSettings?.loop_mode as 'stop' | 'loop' | 'seamless') || 'seamless' // Always loop seamlessly
  });

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.8;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleAdClick = (ad: FeaturedAd) => {
    if (ad.property_id) {
      navigate(`/properties/${ad.property_id}`);
    } else if (ad.link_url) {
      window.open(ad.link_url, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="relative glass-card rounded-lg p-2 md:p-3 mb-2 md:mb-3">
        <div className="animate-pulse">
          <div className="h-4 md:h-5 bg-muted rounded w-32 md:w-40 mb-2" />
          <div className="h-14 md:h-16 bg-muted rounded" />
        </div>
      </div>
    );
  }

  const showFallback = (!ads || ads.length === 0) && (fallbackProperties?.length ?? 0) > 0;

  if ((!ads || ads.length === 0) && (!fallbackProperties || fallbackProperties.length === 0)) {
    return null;
  }

  // Triple items for seamless infinite scroll (ensures enough content)
  const displayAds = ads && ads.length > 0 ? [...ads, ...ads, ...ads] : [];
  const displayProperties = fallbackProperties.length > 0 ? [...fallbackProperties, ...fallbackProperties, ...fallbackProperties] : [];

  return (
    <div className="relative glass-card rounded-lg p-1.5 md:p-2 overflow-hidden group">
      {/* Compact Header */}
      <div className="flex items-center justify-between mb-1 md:mb-1.5 px-1">
        <div className="flex items-center gap-2">
          <h2 className="text-[10px] md:text-sm font-bold gradient-text">Featured Properties</h2>
          <span className="text-[8px] md:text-[10px] text-muted-foreground hidden sm:inline">• Exclusive picks</span>
        </div>
      </div>

      {/* Navigation Buttons */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => scroll('left')}
        className="absolute left-1 top-1/2 -translate-y-1/2 z-10 h-6 w-6 md:h-7 md:w-7 rounded-full glass-effect border border-border/50 hover:bg-primary/10 hover:border-primary shadow-md transition-all opacity-0 group-hover:opacity-100"
      >
        <ChevronLeft className="h-3 w-3 md:h-4 md:w-4 text-primary" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => scroll('right')}
        className="absolute right-1 top-1/2 -translate-y-1/2 z-10 h-6 w-6 md:h-7 md:w-7 rounded-full glass-effect border border-border/50 hover:bg-primary/10 hover:border-primary shadow-md transition-all opacity-0 group-hover:opacity-100"
      >
        <ChevronRight className="h-3 w-3 md:h-4 md:w-4 text-primary" />
      </Button>

      {/* Carousel - Slim cards */}
      <div
        ref={scrollRef}
        className="flex gap-1.5 md:gap-2 overflow-hidden px-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', scrollBehavior: 'auto' }}
      >
        {showFallback ? (
          displayProperties.map((p, idx) => (
            <div
              key={`${p.id}-${idx}`}
              onClick={() => navigate(`/properties/${p.id}`)}
              className="flex-shrink-0 w-[160px] md:w-[200px] cursor-pointer group/card"
            >
              <div className="relative overflow-hidden rounded-md glass-effect shadow-sm hover:shadow-md transition-all duration-300 flex h-[56px] md:h-[64px]">
                {/* Image */}
                <div className="relative w-[56px] md:w-[64px] flex-shrink-0">
                  <img
                    src={p.thumbnail_url || p.images?.[0] || '/placeholder.svg'}
                    alt={p.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover/card:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10" />
                </div>
                
                {/* Content */}
                <div className="flex-1 p-1.5 flex flex-col justify-between min-w-0">
                  <div className="min-w-0">
                    <span className="inline-block px-1 py-0.5 bg-primary/20 text-primary text-[7px] md:text-[8px] font-medium rounded mb-0.5 truncate max-w-full">
                      {p.property_type}
                    </span>
                    <h3 className="text-[9px] md:text-[10px] font-medium text-foreground line-clamp-1">
                      {p.title}
                    </h3>
                  </div>
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[8px] md:text-[9px] text-muted-foreground truncate">
                      {p.city || p.state || ''}
                    </span>
                    <span className="text-[9px] md:text-[10px] font-bold text-primary whitespace-nowrap">
                      {(p.price / 1000000).toFixed(1)}M
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          displayAds.map((ad, idx) => (
            <div
              key={`${ad.id}-${idx}`}
              onClick={() => handleAdClick(ad)}
              className="flex-shrink-0 w-[160px] md:w-[200px] cursor-pointer group/card"
            >
              <div className="relative overflow-hidden rounded-md glass-effect shadow-sm hover:shadow-md transition-all duration-300 flex h-[56px] md:h-[64px]">
                {/* Image */}
                <div className="relative w-[56px] md:w-[64px] flex-shrink-0">
                  <img
                    src={ad.image_url}
                    alt={ad.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover/card:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10" />
                </div>
                
                {/* Content */}
                <div className="flex-1 p-1.5 flex flex-col justify-center min-w-0">
                  <h3 className="text-[9px] md:text-[10px] font-semibold text-foreground line-clamp-1 mb-0.5">
                    {ad.title}
                  </h3>
                  {ad.subtitle && (
                    <p className="text-[8px] md:text-[9px] text-muted-foreground line-clamp-1">
                      {ad.subtitle}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
