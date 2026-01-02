import { useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, ChevronRight, Eye, Star } from "lucide-react";
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
    <div className="relative glass-card rounded-xl md:rounded-2xl p-2 md:p-3 border border-white/20 dark:border-white/10 bg-gradient-to-br from-amber-50/80 via-white/60 to-orange-50/40 dark:from-amber-950/40 dark:via-gray-900/60 dark:to-orange-950/30 backdrop-blur-xl shadow-lg overflow-hidden group">
      {/* Compact Header */}
      <div className="flex items-center justify-center gap-1.5 md:gap-2 mb-1.5 md:mb-2">
        <Star className="h-3 w-3 md:h-4 md:w-4 text-amber-500 dark:text-amber-400" />
        <h2 className="text-[10px] md:text-xs font-semibold text-foreground">Featured Properties</h2>
      </div>

      {/* Navigation Buttons */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => scroll('left')}
        className="absolute left-1 top-1/2 -translate-y-1/2 z-10 h-8 w-8 md:h-10 md:w-10 rounded-full bg-white/90 dark:bg-black/80 border-amber-200/50 dark:border-amber-800/30 hover:bg-amber-50 dark:hover:bg-amber-900/30 shadow-lg transition-all opacity-0 group-hover:opacity-100"
      >
        <ChevronLeft className="h-4 w-4 md:h-5 md:w-5 text-amber-600 dark:text-amber-400" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => scroll('right')}
        className="absolute right-1 top-1/2 -translate-y-1/2 z-10 h-8 w-8 md:h-10 md:w-10 rounded-full bg-white/90 dark:bg-black/80 border-amber-200/50 dark:border-amber-800/30 hover:bg-amber-50 dark:hover:bg-amber-900/30 shadow-lg transition-all opacity-0 group-hover:opacity-100"
      >
        <ChevronRight className="h-4 w-4 md:h-5 md:w-5 text-amber-600 dark:text-amber-400" />
      </Button>

      {/* Carousel - Image cards matching sale/rent style */}
      <div
        ref={scrollRef}
        className="flex gap-2 md:gap-3 overflow-hidden px-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', scrollBehavior: 'auto' }}
      >
        {showFallback ? (
          displayProperties.map((p, idx) => (
            <div
              key={`${p.id}-${idx}`}
              onClick={() => navigate(`/properties/${p.id}`)}
              className="flex-shrink-0 w-[128px] sm:w-[140px] md:w-[180px] cursor-pointer group/card relative rounded-xl overflow-hidden h-28 sm:h-32 md:h-40 hover:scale-[1.02] transition-all duration-200 ring-1 ring-amber-200/50 dark:ring-amber-800/30"
            >
              {/* Full Image Background */}
              <img
                src={p.thumbnail_url || p.images?.[0] || '/placeholder.svg'}
                alt={p.title}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-500"
              />

              {/* Gradient Overlay - Amber tint */}
              <div className="absolute inset-0 bg-gradient-to-t from-amber-900/90 via-black/40 to-transparent" />

              {/* View Icon - Center on hover */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 z-20">
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-white/90 dark:bg-black/80 flex items-center justify-center shadow-xl">
                  <Eye className="h-5 w-5 md:h-6 md:w-6 text-amber-600 dark:text-amber-400" />
                </div>
              </div>

              {/* Top Labels */}
              <div className="absolute top-1.5 left-1.5 right-1.5 md:top-2 md:left-2 md:right-2 flex items-start justify-between gap-1">
                {/* Featured Badge */}
                <span className="text-[8px] md:text-[10px] font-bold px-2 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg">
                  ⭐ Featured
                </span>
                {/* Property Type (hide on very small screens to avoid overlap) */}
                <span className="hidden sm:inline-flex text-[7px] md:text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-white/95 dark:bg-black/80 text-foreground shadow-lg truncate max-w-[48%]">
                  {p.property_type}
                </span>
              </div>

              {/* Bottom Content (includes price to avoid mid-overlay collisions on mobile) */}
              <div className="absolute bottom-0 left-0 right-0 p-1.5 sm:p-2 md:p-2.5">
                <div className="flex items-end justify-between gap-1">
                  <span className="text-[9px] sm:text-[10px] md:text-xs font-bold px-1.5 py-0.5 rounded-md bg-gradient-to-r from-amber-600 to-orange-700 text-white shadow-xl">
                    IDR {(p.price / 1000000).toFixed(0)}Jt
                  </span>
                  <span className="text-[7px] sm:text-[8px] md:text-[10px] text-white/90 truncate max-w-[55%] drop-shadow-md">
                    {p.city || p.state || 'Indonesia'}
                  </span>
                </div>
                <h3 className="mt-0.5 text-[10px] sm:text-[11px] md:text-xs font-bold text-white line-clamp-1 drop-shadow-lg">
                  {p.title}
                </h3>
              </div>
            </div>
          ))
        ) : (
          displayAds.map((ad, idx) => (
            <div
              key={`${ad.id}-${idx}`}
              onClick={() => handleAdClick(ad)}
              className="flex-shrink-0 w-[140px] md:w-[180px] cursor-pointer group/card relative rounded-xl overflow-hidden h-32 md:h-40 hover:scale-[1.02] transition-all duration-200 ring-1 ring-amber-200/50 dark:ring-amber-800/30"
            >
              {/* Full Image Background */}
              <img
                src={ad.image_url}
                alt={ad.title}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-500"
              />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-amber-900/90 via-black/40 to-transparent" />
              
              {/* View Icon - Center on hover */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 z-20">
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-white/90 dark:bg-black/80 flex items-center justify-center shadow-xl">
                  <Eye className="h-5 w-5 md:h-6 md:w-6 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
              
              {/* Top Badge */}
              <div className="absolute top-1.5 left-1.5 md:top-2 md:left-2">
                <span className="text-[8px] md:text-[10px] font-bold px-2 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg">
                  ⭐ Featured
                </span>
              </div>
              
              {/* Bottom Content */}
              <div className="absolute bottom-0 left-0 right-0 p-2 md:p-2.5">
                <h3 className="text-[10px] md:text-xs font-bold text-white line-clamp-1 drop-shadow-lg">
                  {ad.title}
                </h3>
                {ad.subtitle && (
                  <p className="text-[8px] md:text-[10px] text-white/95 line-clamp-1 drop-shadow-md mt-0.5">
                    {ad.subtitle}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
