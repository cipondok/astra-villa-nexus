import { useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, ChevronRight, Eye, Star, Home, Building2, Warehouse, Castle, TreePine, Store, Bed, Bath, Maximize, Key, Tag, Clock, BadgeCheck, ShieldCheck, Crown, ShieldAlert, Gem, Award, Medal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import useAutoHorizontalScroll from "@/hooks/useAutoHorizontalScroll";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

// Get icon for property type
const getPropertyIcon = (type: string) => {
  const lowerType = type?.toLowerCase() || '';
  if (lowerType.includes('house') || lowerType.includes('rumah')) return Home;
  if (lowerType.includes('apartment') || lowerType.includes('apartemen')) return Building2;
  if (lowerType.includes('villa')) return Castle;
  if (lowerType.includes('land') || lowerType.includes('tanah')) return TreePine;
  if (lowerType.includes('warehouse') || lowerType.includes('gudang')) return Warehouse;
  if (lowerType.includes('shop') || lowerType.includes('ruko') || lowerType.includes('commercial')) return Store;
  return Home;
};

// Capitalize first letter
const capitalizeFirst = (str: string) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Get listing type label
const getListingLabel = (type: string | null) => {
  switch (type) {
    case 'rent': return 'Sewa';
    case 'sale': return 'Jual';
    case 'lease': return 'Sewa';
    default: return 'Jual';
  }
};

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
  listing_type: string | null;
  city: string | null;
  state: string | null;
  images: string[] | null;
  thumbnail_url: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  area_sqm: number | null;
  created_at?: string;
  owner_type?: string;
  owner_verified?: boolean;
  agent_verified?: boolean;
  agency_verified?: boolean;
  verification_status?: string;
  user_level?: string;
}

// Get verification info with VIP tiers
const getVerificationInfo = (property: FallbackProperty) => {
  const status = property.verification_status?.toLowerCase() || '';
  const level = property.user_level?.toLowerCase() || '';
  
  // VIP Tiers - Check for specific levels first
  if (level.includes('platinum') || level.includes('diamond')) {
    return { icon: Gem, label: 'Platinum VIP', color: 'text-cyan-400', bg: 'bg-gradient-to-r from-cyan-500/30 to-blue-500/30', glow: 'shadow-[0_0_8px_rgba(34,211,238,0.5)]' };
  }
  if (level.includes('gold')) {
    return { icon: Crown, label: 'Gold VIP', color: 'text-amber-400', bg: 'bg-gradient-to-r from-amber-500/30 to-yellow-500/30', glow: 'shadow-[0_0_8px_rgba(251,191,36,0.5)]' };
  }
  if (level.includes('silver')) {
    return { icon: Award, label: 'Silver VIP', color: 'text-slate-300', bg: 'bg-gradient-to-r from-slate-400/30 to-gray-500/30', glow: 'shadow-[0_0_8px_rgba(148,163,184,0.4)]' };
  }
  if (level.includes('bronze')) {
    return { icon: Medal, label: 'Bronze VIP', color: 'text-orange-400', bg: 'bg-gradient-to-r from-orange-600/30 to-amber-700/30', glow: 'shadow-[0_0_6px_rgba(251,146,60,0.4)]' };
  }
  if (level.includes('vip') || level.includes('premium')) {
    return { icon: Crown, label: 'VIP Member', color: 'text-amber-500', bg: 'bg-amber-500/20', glow: '' };
  }
  
  // Verification statuses
  if (status === 'verified' || property.owner_verified || property.agent_verified || property.agency_verified) {
    return { icon: BadgeCheck, label: 'Verified User', color: 'text-green-500', bg: 'bg-green-500/20', glow: '' };
  }
  if (status === 'trusted') {
    return { icon: ShieldCheck, label: 'Trusted Seller', color: 'text-blue-500', bg: 'bg-blue-500/20', glow: '' };
  }
  return { icon: ShieldAlert, label: 'Unverified', color: 'text-muted-foreground', bg: 'bg-muted/50', glow: '' };
};

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
        .select('id, title, price, property_type, listing_type, city, state, images, thumbnail_url, bedrooms, bathrooms, area_sqm, created_at')
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
    <div className="relative glass-effect rounded-xl md:rounded-2xl p-2 md:p-3 border border-white/30 dark:border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-xl shadow-xl overflow-hidden group">
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
              className="flex-shrink-0 w-[160px] sm:w-[180px] md:w-[220px] cursor-pointer group/card relative rounded-xl overflow-hidden h-48 sm:h-52 md:h-60 hover:scale-[1.02] transition-all duration-200 ring-1 ring-amber-200/50 dark:ring-amber-800/30"
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
                <div className="h-9 w-9 md:h-10 md:w-10 rounded-full bg-white/80 dark:bg-black/70 backdrop-blur-md flex items-center justify-center shadow-lg border border-amber-200/40 dark:border-amber-500/30">
                  <Eye className="h-4 w-4 md:h-5 md:w-5 text-amber-600 dark:text-amber-400" />
                </div>
              </div>

              {/* Top Labels */}
              <div className="absolute top-1.5 left-1.5 right-1.5 md:top-2 md:left-2 md:right-2 flex items-start justify-between gap-1 z-10">
                {/* Left side badges */}
                <div className="flex flex-col gap-1">
                  {/* Featured Badge - Compact icon with glow, text on hover */}
                  <span className="group/badge flex items-center gap-0.5 font-bold px-1.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 text-white shadow-[0_0_10px_rgba(251,191,36,0.5)] transition-all duration-300 hover:shadow-[0_0_16px_rgba(251,191,36,0.7)]">
                    <Star className="h-3 w-3 md:h-3.5 md:w-3.5 fill-white stroke-white drop-shadow-[0_0_3px_rgba(255,255,255,0.7)]" />
                    <span className="text-[9px] sm:text-[10px] md:text-xs max-w-0 overflow-hidden whitespace-nowrap transition-all duration-300 group-hover/badge:max-w-[60px] font-semibold">
                      Featured
                    </span>
                  </span>
                  {/* Listing Type Badge - Jual/Sewa with icon */}
                  <span className={`flex items-center gap-1 text-[9px] sm:text-[10px] md:text-xs font-bold px-2 py-1 rounded-full text-white shadow-md border ${
                    p.listing_type === 'rent' 
                      ? 'bg-blue-600 border-blue-400/50' 
                      : 'bg-emerald-600 border-emerald-400/50'
                  }`}>
                    {p.listing_type === 'rent' ? <Key className="h-3 w-3" /> : <Tag className="h-3 w-3" />}
                    {getListingLabel(p.listing_type)}
                  </span>
                </div>
                {/* Property Type with Icon */}
                {(() => {
                  const PropertyIcon = getPropertyIcon(p.property_type);
                  return (
                    <span className="flex items-center gap-1 text-[9px] sm:text-[10px] md:text-xs font-semibold px-2 py-1 rounded-full bg-white/60 dark:bg-black/60 backdrop-blur-sm text-foreground shadow-lg truncate max-w-[50%]">
                      <PropertyIcon className="h-3 w-3 md:h-3.5 md:w-3.5 flex-shrink-0" />
                      <span className="truncate">{capitalizeFirst(p.property_type)}</span>
                    </span>
                  );
                })()}
                
                {/* Verification Status Badge */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      {(() => {
                        const verification = getVerificationInfo(p);
                        const VerificationIcon = verification.icon;
                        return (
                          <span className={`flex items-center gap-0.5 text-[9px] sm:text-[10px] font-semibold px-1.5 py-1 rounded-full ${verification.bg} backdrop-blur-sm ${verification.glow} cursor-help transition-all duration-300 hover:scale-110`}>
                            <VerificationIcon className={`h-3 w-3 ${verification.color}`} />
                          </span>
                        );
                      })()}
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs font-medium">
                      {getVerificationInfo(p).label}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {/* Bottom Content */}
              <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-2.5 md:p-3 z-10">
              {/* Price Badge - Prominent positioning */}
                <div className="mb-1.5">
                  <span className="inline-flex items-baseline text-xs sm:text-sm md:text-base font-bold px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-xl">
                    <span className="text-[0.7em] font-medium opacity-90">Rp</span>
                    {p.price >= 1000000000 ? (
                      <>
                        <span>{(p.price / 1000000000).toFixed(1)}</span>
                        <span className="text-[0.7em] font-medium opacity-90">M</span>
                      </>
                    ) : (
                      <>
                        <span>{(p.price / 1000000).toFixed(0)}</span>
                        <span className="text-[0.7em] font-medium opacity-90">Jt</span>
                      </>
                    )}
                  </span>
                </div>
                
                {/* Title */}
                <h3 className="text-xs sm:text-sm md:text-base font-bold text-white line-clamp-1 drop-shadow-lg mb-1">
                  {p.title}
                </h3>
                
                {/* Location & Time */}
                <div className="flex items-center gap-2 text-[10px] sm:text-xs text-white/90 mb-1.5">
                  <span className="truncate drop-shadow-md">📍 {p.city || p.state || 'Indonesia'}</span>
                  {p.created_at && (
                    <span className="flex items-center gap-0.5 text-white/70">
                      <Clock className="h-2.5 w-2.5" />
                      {formatDistanceToNow(new Date(p.created_at), { addSuffix: true })}
                    </span>
                  )}
                </div>
                
                {/* Property Stats - Bedroom, Bathroom, Area with bigger icons */}
                <div className="flex items-center gap-3 bg-black/40 rounded-lg px-2 py-1.5 backdrop-blur-sm">
                  {p.bedrooms !== null && p.bedrooms > 0 && (
                    <span className="flex items-center gap-1 text-[10px] sm:text-xs text-white font-medium">
                      <Bed className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      <span>{p.bedrooms}</span>
                    </span>
                  )}
                  {p.bathrooms !== null && p.bathrooms > 0 && (
                    <span className="flex items-center gap-1 text-[10px] sm:text-xs text-white font-medium">
                      <Bath className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      <span>{p.bathrooms}</span>
                    </span>
                  )}
                  {p.area_sqm !== null && p.area_sqm > 0 && (
                    <span className="flex items-center gap-1 text-[10px] sm:text-xs text-white font-medium">
                      <Maximize className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      <span>{p.area_sqm}m²</span>
                    </span>
                  )}
                </div>
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
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-white/60 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center shadow-xl">
                  <Eye className="h-5 w-5 md:h-6 md:w-6 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
              
              {/* Top Badge - Polished icon with glow, text on hover */}
              <div className="absolute top-1.5 left-1.5 md:top-2 md:left-2 z-10">
                <span className="group/badge flex items-center gap-1 font-bold px-2 py-1 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 text-white shadow-[0_0_12px_rgba(251,191,36,0.6)] transition-all duration-300 hover:shadow-[0_0_20px_rgba(251,191,36,0.8)]">
                  <Star className="h-3.5 w-3.5 md:h-4 md:w-4 fill-white stroke-white drop-shadow-[0_0_4px_rgba(255,255,255,0.8)]" />
                  <span className="text-[8px] md:text-[10px] max-w-0 overflow-hidden whitespace-nowrap transition-all duration-300 group-hover/badge:max-w-[70px] font-semibold">
                    Featured
                  </span>
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
