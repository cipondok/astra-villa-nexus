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
      <div className="relative bg-gradient-to-r from-blue-600/10 to-purple-600/10 dark:from-blue-900/20 dark:to-purple-900/20 backdrop-blur-sm rounded-2xl p-6 mb-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4" />
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    );
  }

  const showFallback = (!ads || ads.length === 0) && (fallbackProperties?.length ?? 0) > 0;

  if ((!ads || ads.length === 0) && (!fallbackProperties || fallbackProperties.length === 0)) {
    return null;
  }

  // Duplicate items for seamless infinite scroll
  const displayAds = ads && ads.length > 0 ? [...ads, ...ads] : [];
  const displayProperties = fallbackProperties.length > 0 ? [...fallbackProperties, ...fallbackProperties] : [];

  return (
    <div className="relative bg-gradient-to-r from-blue-600/10 to-purple-600/10 dark:from-blue-900/20 dark:to-purple-900/20 backdrop-blur-sm rounded-xl p-2 md:p-4 overflow-hidden group">
      {/* Header */}
      <div className="mb-2 md:mb-3">
        <h2 className="text-xs md:text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-300 dark:to-purple-300 bg-clip-text text-transparent">
          Featured Properties
        </h2>
        <p className="text-[9px] md:text-xs text-muted-foreground mt-0.5">
          Exclusive opportunities you don't want to miss
        </p>
      </div>

      {/* Navigation Buttons - On Sides */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => scroll('left')}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-2 border-primary/30 hover:bg-primary/10 hover:border-primary shadow-lg transition-all opacity-0 group-hover:opacity-100"
      >
        <ChevronLeft className="h-5 w-5 text-primary" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => scroll('right')}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-2 border-primary/30 hover:bg-primary/10 hover:border-primary shadow-lg transition-all opacity-0 group-hover:opacity-100"
      >
        <ChevronRight className="h-5 w-5 text-primary" />
      </Button>

      {/* Carousel */}
      <div
  ref={scrollRef}
  className="flex gap-2 md:gap-3 overflow-hidden"
  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', scrollBehavior: 'auto' }}
      >
        {showFallback ? (
          displayProperties.map((p, idx) => (
            <div
              key={`${p.id}-${idx}`}
              onClick={() => navigate(`/properties/${p.id}`)}
              className="flex-shrink-0 w-[220px] md:w-[320px] cursor-pointer group"
            >
              <div className="relative overflow-hidden rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-md hover:shadow-xl transition-all duration-300 flex h-[80px] md:h-[100px]">
                {/* Image - Left Side */}
                <div className="relative w-[90px] md:w-[140px] flex-shrink-0">
                  <img
                    src={p.thumbnail_url || p.images?.[0] || '/placeholder.svg'}
                    alt={p.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute top-1 left-1">
                    <span className="px-1 py-0.5 bg-primary/90 text-primary-foreground text-[8px] md:text-[9px] font-semibold rounded-full backdrop-blur-sm shadow-sm">
                      {p.property_type}
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10 group-hover:to-black/20 transition-all duration-300" />
                </div>
                
                {/* Content - Right Side */}
                <div className="flex-1 p-1.5 md:p-3 flex flex-col justify-between">
                  <div>
                    <h3 className="text-[10px] md:text-sm font-semibold text-foreground line-clamp-2 mb-0.5">
                      {p.title}
                    </h3>
                    <div className="text-[8px] md:text-[10px] text-muted-foreground line-clamp-1">
                      {(p.city || p.state) ? `${p.city ?? ''}${p.city && p.state ? ', ' : ''}${p.state ?? ''}` : ''}
                    </div>
                  </div>
                  <div className="text-[10px] md:text-sm font-bold text-primary">
                    Rp {(p.price / 1000000).toFixed(1)}M
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
              className="flex-shrink-0 w-[220px] md:w-[320px] cursor-pointer group"
            >
              <div className="relative overflow-hidden rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-md hover:shadow-xl transition-all duration-300 flex h-[80px] md:h-[100px]">
                {/* Image - Left Side */}
                <div className="relative w-[90px] md:w-[140px] flex-shrink-0">
                  <img
                    src={ad.image_url}
                    alt={ad.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10 group-hover:to-black/20 transition-all duration-300" />
                </div>
                
                {/* Content - Right Side */}
                <div className="flex-1 p-1.5 md:p-3 flex flex-col justify-center">
                  <h3 className="text-[10px] md:text-sm font-bold text-foreground mb-0.5 line-clamp-2">
                    {ad.title}
                  </h3>
                  {ad.subtitle && (
                    <p className="text-[9px] md:text-xs text-muted-foreground line-clamp-2">
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
