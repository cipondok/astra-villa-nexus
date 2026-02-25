import { useState, useEffect, lazy, Suspense, useRef, useMemo, useCallback } from "react";
import { useUserBehaviorAnalytics } from "@/hooks/useUserBehaviorAnalytics";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import PullToRefreshIndicator from "@/components/ui/PullToRefreshIndicator";
import { SEOHead, seoSchemas } from "@/components/SEOHead";
import { useHeroSliderConfig } from "@/hooks/useHeroSliderConfig";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTranslation } from "@/i18n/useTranslation";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { logSearchError } from "@/utils/errorLogger";
import { useConnectionSpeed } from "@/hooks/useConnectionSpeed";
import { useScrollToSection } from "@/hooks/useHomeBackLink";

import { supabase } from "@/integrations/supabase/client";
import { BaseProperty } from "@/types/property";
import { PropertyFilters } from "@/components/search/AdvancedPropertyFilters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Camera, MessageSquare, ArrowUp, Sparkles, RefreshCw, Star, ChevronDown } from "lucide-react";
import villaBlueDark1 from "@/assets/villa-blue-dark-1.jpg";
import villaBlueDark2 from "@/assets/villa-blue-dark-2.jpg";
import villaBlueDark3 from "@/assets/villa-blue-dark-3.jpg";
import { cn } from "@/lib/utils";
import { SearchErrorBoundary } from "@/components/search/SearchErrorBoundary";
import { SearchPanelSkeleton } from "@/components/search/SearchSkeleton";
import { useRetrySearch } from "@/hooks/useRetrySearch";
import { shareProperty } from "@/utils/shareUtils";
import { ImageSearchButton } from "@/components/search/ImageSearchButton";
import { CommandPalette } from "@/components/ui/CommandPalette";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { NetworkStatusIndicator } from "@/components/NetworkStatusIndicator";
import { UserProfileHeader } from "@/components/user/UserProfileHeader";
import { StickyHeaderSearch } from "@/components/search/StickyHeaderSearch";
import LazyRender from "@/components/LazyRender";


// Lazy load heavy components for better performance
const ResponsiveAIChatWidget = lazy(() => import("@/components/ai/ResponsiveAIChatWidget"));
const PropertyViewModeToggle = lazy(() => import("@/components/search/PropertyViewModeToggle"));
const PropertyListView = lazy(() => import("@/components/search/PropertyListView"));
const PropertyMapView = lazy(() => import("@/components/search/PropertyMapView"));
const PropertyGridView = lazy(() => import("@/components/search/PropertyGridView"));
const ActiveFilterPills = lazy(() => import("@/components/search/ActiveFilterPills").then(m => ({ default: m.ActiveFilterPills })));
const PropertySlideSection = lazy(() => import("@/components/property/PropertySlideSection"));
const PropertiesForSaleSection = lazy(() => import("@/components/property/PropertiesForSaleSection"));
const PropertiesForRentSection = lazy(() => import("@/components/property/PropertiesForRentSection"));
const AstraSearchPanel = lazy(() => import("@/components/AstraSearchPanel"));
const SearchLoadingDialog = lazy(() => import("@/components/SearchLoadingDialog").then(m => ({ default: m.SearchLoadingDialog })));
const WhatsAppInquiryDialog = lazy(() => import("@/components/property/WhatsAppInquiryDialog"));
const AstraVillaFeatures = lazy(() => import("@/components/home/AstraVillaFeatures"));
const AIRecommendedProperties = lazy(() => import("@/components/property/AIRecommendedProperties"));
const FeaturedAdsCarousel = lazy(() => import("@/components/home/FeaturedAdsCarousel"));
const MarketplaceServices = lazy(() => import("@/components/home/MarketplaceServices"));
const PartnerLogosMarquee = lazy(() => import("@/components/home/PartnerLogosMarquee"));
const TrendingSearchesWidget = lazy(() => import("@/components/home/TrendingSearchesWidget").then(m => ({ default: m.TrendingSearchesWidget })));
const InvestorPathSelector = lazy(() => import("@/components/home/InvestorPathSelector"));
const PropertySlideshow = lazy(() => import("@/components/PropertySlideshow"));
const FeaturedPropertiesCarousel = lazy(() => import("@/components/home/FeaturedPropertiesCarousel"));


type ViewMode = 'list' | 'grid' | 'map';

const Index = () => {
  const { t, language } = useTranslation();
  const { user, profile, loading } = useAuth();
  const { trackInteraction } = useUserBehaviorAnalytics();
  const { data: heroConfig } = useHeroSliderConfig();
  const navigate = useNavigate();
  const { isMobile, isTablet, deviceInfo } = useIsMobile();
  const [searchResults, setSearchResults] = useState<BaseProperty[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [quickSearch, setQuickSearch] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filters, setFilters] = useState<PropertyFilters>({
    searchQuery: "",
    priceRange: [0, 50000000000],
    location: "all",
    propertyTypes: [],
    bedrooms: null,
    bathrooms: null,
    minArea: null,
    maxArea: null,
    listingType: "all",
    sortBy: "newest"
  });
  const [whatsappDialogOpen, setWhatsappDialogOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<BaseProperty | null>(null);
  const [imageSearchMode, setImageSearchMode] = useState(false);
  const [uploadedImageBase64, setUploadedImageBase64] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isLoadingPanel, setIsLoadingPanel] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const { speed: connectionSpeed } = useConnectionSpeed();
  const queryClient = useQueryClient();

  // Pull-to-refresh for homepage
  const {
    isPulling, pullDistance, isRefreshing,
    indicatorOpacity, indicatorRotation, threshold,
    handlers: pullHandlers,
  } = usePullToRefresh({
    onRefresh: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['sale-properties'] }),
        queryClient.invalidateQueries({ queryKey: ['rent-properties'] }),
        queryClient.invalidateQueries({ queryKey: ['featured-properties-simple'] }),
      ]);
      toast.success('Properties refreshed!');
    },
  });

  // Wrap search function with retry logic
  const performSearch = async (searchData?: any) => {
    const rawTerm = searchData?.searchQuery ?? quickSearch ?? '';
    const sanitize = (s: string) =>
      String(s)
        .replace(/[(),;]/g, ' ')
        .replace(/%/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 100);
    const searchTerm = sanitize(rawTerm);

    console.log('Search initiated:', searchTerm, 'with filters:', searchData);

    let query = supabase
      .from('properties')
      .select(`
        id,
        title,
        property_type,
        listing_type,
        price,
        discount_percentage,
        location,
        bedrooms,
        bathrooms,
        area_sqm,
        images,
        thumbnail_url,
        state,
        city,
        description,
        three_d_model_url,
        virtual_tour_url
      `)
      .eq('status', 'active')
      .eq('approval_status', 'approved')
      .not('title', 'is', null);

    // Apply text search if present (sanitized)
    if (searchTerm) {
      query = query.or(
        `title.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%,state.ilike.%${searchTerm}%`
      );
    }

    // Apply location filter if present (sanitized)
    if (searchData?.location && searchData.location !== 'all') {
      const safeLoc = sanitize(searchData.location);
      if (safeLoc) {
        query = query.or(`location.ilike.%${safeLoc}%,city.ilike.%${safeLoc}%,state.ilike.%${safeLoc}%`);
      }
    }

    // Apply property type filter
    if (searchData?.propertyType && searchData.propertyType !== 'all') {
      query = query.eq('property_type', searchData.propertyType);
    }

    // Apply listing type filter
    if (searchData?.listingType && searchData.listingType !== 'all' && searchData.listingType !== '') {
      query = query.eq('listing_type', searchData.listingType);
    }

    // Apply price range filter
    if (searchData?.priceRange && searchData.priceRange !== 'all') {
      const priceRangeStr = searchData.priceRange.toString();
      const [min, max] = priceRangeStr.split('-');
      if (priceRangeStr.includes('+')) {
        query = query.gte('price', parseInt(min));
      } else if (min && max) {
        query = query.gte('price', parseInt(min)).lte('price', parseInt(max));
      }
    }

    // Apply bedroom filter
    if (searchData?.bedrooms && searchData.bedrooms !== 'all' && searchData.bedrooms !== '') {
      const bedroomsStr = searchData.bedrooms.toString();
      if (bedroomsStr.includes('+')) {
        query = query.gte('bedrooms', parseInt(bedroomsStr));
      } else {
        query = query.eq('bedrooms', parseInt(bedroomsStr));
      }
    }

    // Apply bathroom filter
    if (searchData?.bathrooms && searchData.bathrooms !== 'all' && searchData.bathrooms !== '') {
      const bathroomsStr = searchData.bathrooms.toString();
      if (bathroomsStr.includes('+')) {
        query = query.gte('bathrooms', parseInt(bathroomsStr));
      } else {
        query = query.eq('bathrooms', parseInt(bathroomsStr));
      }
    }

    // Handle nearby search
    if (searchData?.nearbySearch && searchData?.userLocation) {
      console.warn('Nearby search requested but properties table lacks latitude/longitude columns');
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Search error:', error);
      throw new Error(error.message || 'Search failed');
    }

    // Transform data to match BaseProperty interface
    return (data?.map((property: any) => {
      return {
        ...property,
        listing_type: property.listing_type as "sale" | "rent" | "lease",
        image_urls: property.images || [],
      };
    }) || []) as BaseProperty[];
  };

  const { executeWithRetry, isRetrying, retryCount, lastError } = useRetrySearch(performSearch, {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 5000,
  });

  const handleQuickSearch = async (searchData?: any) => {
    // Prevent search when offline
    if (!isOnline || connectionSpeed === 'offline') {
      toast.error('You are offline. Please check your internet connection.');
      return;
    }

    setIsSearching(true);
    setHasSearched(true);
    setSearchError(null);

    try {
      const results = await executeWithRetry(searchData);
      setSearchResults(results);
      console.log('Search completed. Results:', results.length);
    } catch (error: any) {
      console.error('Search failed after retries:', error);
      const errorMessage = error?.message || 'Search failed. Please try again.';
      setSearchError(errorMessage);
      logSearchError(error, searchData);
      toast.error(errorMessage);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle scroll restoration when returning from other pages
  const location = useLocation();
  const { scrollToSavedSection } = useScrollToSection();
  
  useEffect(() => {
    scrollToSavedSection();
  }, [location]);

  // Simulate panel loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoadingPanel(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // Compute banner images - use admin config or fallback to defaults
  const bannerImages = heroConfig?.bannerImages && heroConfig.bannerImages.length > 0
    ? heroConfig.bannerImages
    : [villaBlueDark1, villaBlueDark2, villaBlueDark3];
  
  const slideInterval = (heroConfig?.autoSlideInterval || 5) * 1000;

  // Preload first hero banner for faster LCP
  useEffect(() => {
    if (bannerImages.length > 0) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = bannerImages[0];
      link.fetchPriority = 'high';
      document.head.appendChild(link);
      return () => { document.head.removeChild(link); };
    }
  }, [bannerImages]);

  // Auto-slide hero banner
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerImages.length);
    }, slideInterval);
    return () => clearInterval(interval);
  }, [bannerImages.length, slideInterval]);
  const [showShortcutsPanel, setShowShortcutsPanel] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Track scroll position for FAB menu
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollButton(window.pageYOffset > 300);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard shortcuts
  const shortcuts = useKeyboardShortcuts({
    shortcuts: [
      {
        key: 'c',
        description: 'Open AI Chat Assistant',
        action: () => {
          setChatOpen(true);
          const event = new CustomEvent('openAIChat');
          window.dispatchEvent(event);
          toast.success('Chat opened! (Press C)', { duration: 1500 });
        }
      },
      {
        key: 'i',
        description: 'Open Image Search',
        action: () => {
          imageInputRef.current?.click();
          toast.success('Image search opened! (Press I)', { duration: 1500 });
        }
      },
      {
        key: 't',
        description: 'Scroll to Top',
        action: () => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          toast.success('Scrolling to top! (Press T)', { duration: 1500 });
        }
      },
      {
        key: '?',
        description: 'Show Keyboard Shortcuts',
        action: () => {
          setShowShortcutsPanel(true);
          const event = new CustomEvent('toggleShortcutsPanel');
          window.dispatchEvent(event);
        }
      }
    ],
    enabled: true
  });

  // Note: Removed hardcoded admin email check for security
  // Users are redirected based on their role stored in the user_roles table

  const backgroundStyle = {
    backgroundImage: `url('https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1920&q=80')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundAttachment: isMobile ? 'scroll' : 'fixed',
  };

  // Generate cache key for search results
  const searchCacheKey = useMemo(() => {
    return ['search-results', quickSearch, filters, JSON.stringify(filters)];
  }, [quickSearch, filters]);

  // Use cached search results when available
  const { data: cachedSearchResults, isFetching: isSearchFetching } = useQuery({
    queryKey: searchCacheKey,
    queryFn: () => performSearch(filters),
    enabled: false, // Manual trigger only
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Simplified featured properties query with better caching
  const { data: featuredProperties = [], isLoading: isFeaturedLoading } = useQuery({
    queryKey: ['featured-properties-simple'],
    queryFn: async () => {
      console.log('Fetching featured properties...');
      
      try {
        const { data, error } = await supabase
          .from('properties')
          .select(`
            id,
            title,
            property_type,
            listing_type,
            price,
            discount_percentage,
            location,
            bedrooms,
            bathrooms,
            area_sqm,
            images,
            thumbnail_url,
            state,
            city,
            development_status,
            description,
            three_d_model_url,
            virtual_tour_url
          `)
          .eq('status', 'active')
          .eq('approval_status', 'approved')
          .not('title', 'is', null)
          .limit(8);

        if (error) {
          console.error('Properties query error:', error);
          return [];
        }

        console.log('Featured properties loaded:', data?.length || 0);
        // Transform data to match BaseProperty interface
        const transformedData = data?.map((property: any) => {
          return {
            ...property,
            listing_type: property.listing_type as "sale" | "rent" | "lease",
            image_urls: property.images || [],
          };
        }) || [];
        return transformedData;
        
      } catch (err) {
        console.error('Featured properties fetch error:', err);
        return [];
      }
    },
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
    gcTime: 30 * 60 * 1000,    // Keep in cache for 30 minutes
  });


  const handlePropertyClick = (property: BaseProperty) => {
    trackInteraction({
      interaction_type: 'click',
      property_id: property.id,
      interaction_data: {
        source: 'homepage',
        property_type: property.property_type,
        listing_type: property.listing_type,
        price: property.price,
        city: property.city,
      }
    });
    navigate(`/properties/${property.id}`);
  };

  const handleFiltersChange = (newFilters: PropertyFilters) => {
    setFilters(newFilters);
    setQuickSearch(newFilters.searchQuery);
  };

  const handleClearFilters = () => {
    setFilters({
      searchQuery: "",
      priceRange: [0, 50000000000],
      location: "all",
      propertyTypes: [],
      bedrooms: null,
      bathrooms: null,
      minArea: null,
      maxArea: null,
      listingType: "all",
      sortBy: "newest"
    });
    setQuickSearch("");
    setSearchResults([]);
    setHasSearched(false);
  };

  const handleRemoveFilter = (key: keyof PropertyFilters, value?: any) => {
    const newFilters = { ...filters };
    
    if (key === 'propertyTypes' && value) {
      newFilters.propertyTypes = newFilters.propertyTypes.filter(t => t !== value);
    } else if (key === 'searchQuery') {
      newFilters.searchQuery = "";
    } else if (key === 'location') {
      newFilters.location = "all";
    } else if (key === 'listingType') {
      newFilters.listingType = "all";
    } else if (key === 'bedrooms') {
      newFilters.bedrooms = null;
    } else if (key === 'bathrooms') {
      newFilters.bathrooms = null;
    } else if (key === 'priceRange') {
      newFilters.priceRange = [0, 50000000000];
    } else if (key === 'minArea') {
      newFilters.minArea = null;
      newFilters.maxArea = null;
    } else if (key === 'sortBy') {
      newFilters.sortBy = "newest";
    }
    
    setFilters(newFilters);
  };

  // Handle sticky header search
  const handleStickySearch = (query: string) => {
    setQuickSearch(query);
    handleQuickSearch({ searchQuery: query });
    // Scroll to results
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Mobile-first responsive layout wrapper
  const content = (
    <div className="min-h-screen w-full overflow-x-hidden text-foreground relative bg-background" {...pullHandlers}>
      <SEOHead
        title={t('seo.home.title')}
        description={t('seo.home.description')}
        keywords="properti Indonesia, villa mewah, apartemen Jakarta, rumah dijual, properti Bali, investasi properti"
        jsonLd={[seoSchemas.organization(), seoSchemas.realEstateAgent(), seoSchemas.searchAction()]}
      />
      {/* Network Status Indicator */}
      <NetworkStatusIndicator onStatusChange={setIsOnline} />
      <PullToRefreshIndicator
        isPulling={isPulling}
        isRefreshing={isRefreshing}
        pullDistance={pullDistance}
        indicatorOpacity={indicatorOpacity}
        indicatorRotation={indicatorRotation}
        threshold={threshold}
      />


      {/* Content Layer - full width edge-to-edge */}
      <div className="relative z-10 min-h-screen pb-20 md:pb-4">
        
        {/* Hero Banner + Search Overlay Section */}
        <section className="relative w-full" id="hero-section">
          {/* Hero Banner Slider */}
          <div
            className="w-full overflow-hidden relative"
            style={{ 
              height: `clamp(${heroConfig?.sliderMinHeight || 400}px, 60vw, ${heroConfig?.sliderMaxHeight || 650}px)` 
            }}
          >
          {bannerImages.map((banner, index) => {
            const isActive = currentSlide === index;
            const isPriority = index === 0;
            // Determine slide direction: active slides in from right, exiting slides out to left
            const isPrev = (currentSlide === 0 ? bannerImages.length - 1 : currentSlide - 1) === index;
            return (
              <div
                key={index}
                className={cn(
                  "absolute inset-0 transition-transform duration-[1200ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] will-change-transform",
                  isActive ? "translate-x-0 z-10" : isPrev ? "-translate-x-full z-[9]" : "translate-x-full z-0"
                )}
              >
                <img 
                  src={banner} 
                  alt={`Astra Villa - Premium Property ${index + 1}`} 
                  loading={isPriority ? 'eager' : 'lazy'}
                  decoding={isPriority ? 'sync' : 'async'}
                  fetchPriority={isPriority ? 'high' : undefined}
                  sizes="100vw"
                  className="w-full h-full object-cover"
                />
              </div>
            );
          })}

            {/* Floating ASTRA Villa Property Branding */}
            <div className="absolute inset-0 z-20 pointer-events-none hidden sm:flex items-start justify-center sm:pt-[6%]">
              <div className="flex flex-col items-center text-center gap-4 sm:gap-5">
                {/* Premium Real Estate Badge */}
                <span 
                  className="inline-block px-6 py-1.5 sm:px-10 sm:py-2 text-[9px] sm:text-[11px] font-semibold uppercase tracking-[0.45em] rounded-full animate-hero-text-reveal border"
                  style={{
                    color: 'hsl(45 80% 72%)',
                    borderColor: 'hsl(45 60% 55% / 0.3)',
                    background: 'linear-gradient(135deg, hsl(45 50% 50% / 0.08), hsl(220 60% 20% / 0.15))',
                    backdropFilter: 'blur(12px)',
                    animationDelay: '0s',
                    opacity: 0,
                    animationFillMode: 'forwards',
                  }}
                >
                  Premium Real Estate
                </span>

                {/* ASTRA Villa Property */}
                <h1 
                  className="font-bold tracking-[0.06em] leading-[1.1] animate-hero-text-reveal"
                  style={{ animationDelay: '0.2s', opacity: 0, animationFillMode: 'forwards' }}
                >
                  <span 
                    className="block text-4xl sm:text-5xl md:text-7xl lg:text-8xl"
                    style={{
                      background: 'linear-gradient(135deg, hsl(45 90% 70%) 0%, hsl(38 85% 60%) 40%, hsl(30 80% 50%) 70%, hsl(45 95% 75%) 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      filter: 'drop-shadow(0 4px 20px hsl(45 80% 50% / 0.35))',
                    }}
                  >
                    ASTRA
                  </span>
                  <span 
                    className="block text-2xl sm:text-3xl md:text-4xl lg:text-5xl mt-1 sm:mt-2 font-light tracking-[0.25em] uppercase"
                    style={{
                      color: 'hsl(0 0% 100% / 0.92)',
                      textShadow: '0 2px 15px hsl(220 80% 15% / 0.6)',
                    }}
                  >
                    Villa Property
                  </span>
                </h1>

                {/* Decorative separator */}
                <div 
                  className="flex items-center justify-center gap-3 sm:gap-4 animate-hero-text-reveal"
                  style={{ animationDelay: '0.4s', opacity: 0, animationFillMode: 'forwards' }}
                >
                  <div className="w-10 sm:w-16 h-px" style={{ background: 'linear-gradient(90deg, transparent, hsl(45 70% 60% / 0.6))' }} />
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'hsl(45 80% 65%)', boxShadow: '0 0 8px hsl(45 80% 50% / 0.5)' }} />
                  <div className="w-10 sm:w-16 h-px" style={{ background: 'linear-gradient(90deg, hsl(45 70% 60% / 0.6), transparent)' }} />
                </div>

                {/* Luxury tagline */}
                <p 
                  className="text-[10px] sm:text-xs tracking-[0.4em] uppercase font-medium animate-hero-text-reveal"
                  style={{ 
                    color: 'hsl(45 40% 75% / 0.8)',
                    animationDelay: '0.5s', 
                    opacity: 0, 
                    animationFillMode: 'forwards',
                    textShadow: '0 1px 8px hsl(220 60% 10% / 0.5)',
                  }}
                >
                  Luxury Living Redefined
                </p>
              </div>
            </div>

            {/* Cinematic overlay — theme-aware gradients */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/10 to-background/80 z-[19] pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/20 via-transparent to-background/10 z-[19] pointer-events-none" />
            {/* Film grain texture */}
            <div className="absolute inset-0 z-[19] pointer-events-none opacity-[0.03] mix-blend-overlay"
              style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")' }}
            />
            {/* Shimmer light effect */}
            <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
              <div className="absolute -inset-full animate-shimmer-slide bg-gradient-to-r from-transparent via-white/[0.04] to-transparent skew-x-12" />
            </div>
            
            {/* Slide indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-2">
              {bannerImages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-500 ease-out",
                    currentSlide === i 
                      ? "bg-gold-primary w-10 shadow-[0_0_8px_hsl(var(--gold-primary)/0.5)]" 
                      : "bg-white/40 w-6 hover:bg-white/60"
                  )}
                />
              ))}
            </div>
          </div>
          
          {/* Search Panel Overlay - positioned at bottom of slider */}
          <div className="absolute inset-x-0 bottom-4 sm:bottom-8 z-30 flex flex-col items-center pointer-events-none max-h-[85vh] overflow-y-auto">
            <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 pointer-events-auto">
              {/* Title */}
              <div className="text-center mb-4 sm:mb-6">
                <div className={cn(
                  "inline-flex items-center gap-2 mb-3",
                  "px-4 py-1.5 sm:px-6 sm:py-2",
                  "bg-white/10 backdrop-blur-md",
                  "rounded-full border border-white/20",
                )}>
                  <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-gold-primary animate-pulse" />
                  <span className="text-[10px] sm:text-xs font-semibold text-white uppercase tracking-[0.2em]">
                    AI-Powered Search
                  </span>
                  <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-gold-primary animate-pulse" />
                </div>
                
                <h2 className="text-2xl sm:text-3xl md:text-5xl font-black leading-[1.1] mb-2 text-white drop-shadow-lg">
                  {t('indexPage.findYour')}
                </h2>
                <p className="flex text-xs sm:text-sm text-white/80 items-center justify-center gap-2 font-medium">
                  <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  {t('indexPage.searchPowered')}
                </p>
              </div>
              
              {/* Search Panel */}
              <Suspense fallback={<SearchPanelSkeleton />}>
                <SearchErrorBoundary>
                  <AstraSearchPanel
                    language={language}
                    onSearch={(searchData) => {
                      setQuickSearch(searchData.searchQuery || "");
                      handleQuickSearch(searchData);
                    }}
                    onLiveSearch={(searchTerm) => setQuickSearch(searchTerm)}
                    resultsCount={hasSearched ? searchResults.length : undefined}
                  />
                </SearchErrorBoundary>
              </Suspense>
            </div>
          </div>

          {/* Scroll Down Indicator */}
          <button
            onClick={() => document.getElementById('featured-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="absolute bottom-2 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-1 text-white/60 hover:text-gold-primary transition-colors duration-300 pointer-events-auto animate-fade-in"
            style={{ animationDelay: '1.2s', opacity: 0, animationFillMode: 'forwards' }}
            aria-label="Scroll to content"
          >
            <span className="text-[9px] uppercase tracking-[0.3em] font-medium">Explore</span>
            <ChevronDown className="h-5 w-5 animate-bounce" />
          </button>
        </section>
            
        {/* Retry Indicator */}
        {isRetrying && (
          <div className="mt-2 bg-gold-primary text-foreground px-3 py-1.5 rounded-lg shadow-lg flex items-center justify-center gap-2 animate-in slide-in-from-bottom-2">
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            <span className="text-xs font-bold">Retrying... ({retryCount}/3)</span>
          </div>
        )}

        {/* Featured Properties Carousel */}
        <div id="featured-section">
        <Suspense fallback={
          <div className="py-6 sm:py-8 max-w-7xl mx-auto px-3 sm:px-4">
            <div className="flex gap-3 overflow-hidden">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex-shrink-0 w-[280px] sm:w-[320px] animate-pulse">
                  <div className="h-48 bg-muted rounded-xl mb-2" />
                  <div className="h-4 bg-muted rounded w-3/4 mb-1" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              ))}
            </div>
          </div>
        }>
          <FeaturedPropertiesCarousel />
        </Suspense>
        </div>

        {/* Error Message - Using Design Tokens */}
        {(searchError || lastError) && (
          <section className="py-2 sm:py-3">
            <div className="max-w-2xl mx-auto px-3 sm:px-4">
              <div className="bg-destructive/10 border border-destructive/30 text-destructive text-center rounded-xl p-3 shadow-sm">
                <p className="text-xs sm:text-sm font-medium">
                  ⚠️ {searchError || lastError?.message}
                </p>
                {retryCount > 0 && (
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                    Attempted {retryCount} {retryCount === 1 ? 'retry' : 'retries'}
                  </p>
                )}
                <div className="flex gap-2 justify-center mt-2">
                  <Button 
                    onClick={() => {
                      setSearchError(null);
                      handleQuickSearch();
                    }}
                    size="sm"
                    className="h-7 px-3 text-xs bg-primary hover:bg-primary/90"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Retry
                  </Button>
                  <Button 
                    onClick={() => {
                      setSearchError(null);
                      setSearchResults([]);
                      setHasSearched(false);
                    }}
                    variant="outline"
                    size="sm"
                    className="h-7 px-3 text-xs"
                  >
                    {t('indexPage.clearError')}
                  </Button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* AI Tools & Features */}
        <div className="px-0 pt-4 sm:pt-6 bg-gradient-to-b from-hero-to via-hero-mid to-hero-end" style={{ contain: 'layout', minHeight: '120px' }}>
          <div className="w-full">
            <LazyRender minHeight="96px" rootMargin="400px" fallback={
              <div className="flex gap-2 justify-center py-3" style={{ minHeight: '96px' }}>
                <div className="flex-shrink-0 w-14 h-12 animate-pulse bg-muted rounded-lg" />
                <div className="flex-shrink-0 w-14 h-12 animate-pulse bg-muted rounded-lg" />
                <div className="flex-shrink-0 w-14 h-12 animate-pulse bg-muted rounded-lg" />
                <div className="flex-shrink-0 w-14 h-12 animate-pulse bg-muted rounded-lg" />
                <div className="flex-shrink-0 w-14 h-12 animate-pulse bg-muted rounded-lg" />
                <div className="flex-shrink-0 w-14 h-12 animate-pulse bg-muted rounded-lg" />
                <div className="flex-shrink-0 w-14 h-12 animate-pulse bg-muted rounded-lg" />
                <div className="flex-shrink-0 w-14 h-12 animate-pulse bg-muted rounded-lg" />
              </div>
            }>
              <AstraVillaFeatures />
            </LazyRender>
          </div>
        </div>

        {/* Global Investment Platform */}
        <div className="px-0 pt-3 sm:pt-4 bg-gradient-to-b from-hero-end to-hero-fade" style={{ contain: 'layout', minHeight: '80px' }}>
          <div className="w-full">
            <LazyRender minHeight="64px" rootMargin="400px" fallback={
              <div className="flex gap-3 justify-center py-3" style={{ minHeight: '64px' }}>
                <div className="animate-pulse h-16 w-36 bg-muted rounded-lg" />
                <div className="animate-pulse h-16 w-36 bg-muted rounded-lg" />
                <div className="animate-pulse h-16 w-36 bg-muted rounded-lg" />
              </div>
            }>
              <InvestorPathSelector />
            </LazyRender>
          </div>
        </div>

        {/* Property Display Section */}
        <div className="px-0 py-4 sm:py-6 space-y-4 bg-gradient-to-b from-hero-fade via-hero-fade/60 to-background">
          <div className="w-full space-y-4">
            {hasSearched ? (
              <section className="bg-primary/10 backdrop-blur-sm rounded-xl shadow-md border border-primary/15 dark:bg-primary/5 dark:border-primary/10">
                <div className="p-3 sm:p-4 md:p-6">
                  {/* Active Filter Pills */}
                  <Suspense fallback={null}>
                    <ActiveFilterPills
                      filters={filters}
                      onRemoveFilter={handleRemoveFilter}
                      onClearAll={handleClearFilters}
                    />
                  </Suspense>
                  
                  <div className="flex items-center justify-between mb-2 sm:mb-4 md:mb-6 mt-1.5 sm:mt-2 md:mt-4">
                    <div>
                      <h2 className="text-sm sm:text-base md:text-2xl font-bold mb-0.5 sm:mb-1 md:mb-2 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
                        {t('indexPage.searchResults')}
                      </h2>
                      <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">
                        {isSearching ? t('indexPage.searching') : `${searchResults.length} ${t('indexPage.propertiesFound')}`}
                        {quickSearch && (
                          <span className="ml-1 sm:ml-2 text-primary font-medium">
                            {t('indexPage.for')} "{quickSearch}"
                          </span>
                        )}
                      </p>
                    </div>
                    <Suspense fallback={<div className="animate-pulse h-8 w-32 bg-muted rounded-lg" />}>
                      <PropertyViewModeToggle 
                        viewMode={viewMode} 
                        onViewModeChange={(mode) => setViewMode(mode)} 
                      />
                    </Suspense>
                  </div>
                  
                  {isSearching && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4 mb-3 md:mb-4">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="animate-pulse bg-muted/50 rounded-lg sm:rounded-xl h-48 sm:h-56 md:h-64 border border-border/40" 
                          style={{ animationDelay: `${i * 100}ms` }} 
                        />
                      ))}
                    </div>
                  )}
                  
                  {viewMode === 'grid' && !isSearching && (
                    <Suspense fallback={<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{[...Array(6)].map((_, i) => <div key={i} className="animate-pulse bg-muted/50 h-64 rounded-lg border border-border/40" />)}</div>}>
                      <PropertyGridView
                        properties={searchResults}
                        onPropertyClick={handlePropertyClick}
                      onView3D={handlePropertyClick}
                      onSave={(property) => console.log('Save property:', property.id)}
                      onShare={async (property) => {
                        const success = await shareProperty({
                          id: property.id,
                          title: property.title,
                          price: property.price || 0,
                          location: property.location || property.city || '',
                          images: property.images
                        });
                        if (success) {
                          toast.success("Property link shared!");
                        }
                      }}
                      onContact={(property) => {
                        setSelectedProperty(property);
                        setWhatsappDialogOpen(true);
                      }}
                    />
                    </Suspense>
                  )}

                  {viewMode === 'list' && !isSearching && (
                    <Suspense fallback={<div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="animate-pulse bg-muted/50 h-32 rounded-lg border border-border/40" />)}</div>}>
                      <PropertyListView
                        properties={searchResults}
                        onPropertyClick={handlePropertyClick}
                      onView3D={handlePropertyClick}
                      onSave={(property) => console.log('Save property:', property.id)}
                      onShare={async (property) => {
                        const success = await shareProperty({
                          id: property.id,
                          title: property.title,
                          price: property.price || 0,
                          location: property.location || property.city || '',
                          images: property.images
                        });
                        if (success) {
                          toast.success("Property link shared!");
                        }
                      }}
                      onContact={(property) => {
                        setSelectedProperty(property);
                        setWhatsappDialogOpen(true);
                      }}
                    />
                    </Suspense>
                  )}

                  {viewMode === 'map' && !isSearching && (
                    <Suspense fallback={<div className="animate-pulse h-96 bg-muted/50 rounded-lg border border-border/40" />}>
                      <PropertyMapView
                        properties={searchResults}
                        onPropertyClick={handlePropertyClick}
                      />
                    </Suspense>
                  )}
                </div>
              </section>
            ) : (
              <>
                {/* AI Recommended Properties */}
                <div className="mb-4">
                  <LazyRender minHeight="320px" fallback={
                    <div className="bg-primary/10 dark:bg-primary/5 rounded-xl shadow-sm border border-primary/15 dark:border-primary/10 p-4" style={{ minHeight: '320px' }}>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-primary/20 rounded-lg animate-pulse" />
                        <div className="flex-1">
                          <div className="h-5 bg-muted rounded w-40 mb-2 animate-pulse" />
                          <div className="h-3 bg-muted rounded w-56 animate-pulse" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="animate-pulse"><div className="bg-muted h-44 rounded-lg mb-2" /><div className="bg-muted h-4 rounded w-3/4 mb-1.5" /></div>
                        <div className="animate-pulse"><div className="bg-muted h-44 rounded-lg mb-2" /><div className="bg-muted h-4 rounded w-3/4 mb-1.5" /></div>
                        <div className="animate-pulse"><div className="bg-muted h-44 rounded-lg mb-2" /><div className="bg-muted h-4 rounded w-3/4 mb-1.5" /></div>
                      </div>
                    </div>
                  }>
                    <AIRecommendedProperties onPropertyClick={handlePropertyClick} />
                  </LazyRender>
                </div>

                {/* Trending Searches */}
                <div className="mb-4">
                  <LazyRender minHeight="192px" fallback={<div className="animate-pulse h-48 bg-muted rounded-xl" />}>
                    <TrendingSearchesWidget 
                      onSearchClick={(trendFilters) => {
                        setFilters(prev => ({ ...prev, ...trendFilters }));
                        setHasSearched(true);
                      }}
                    />
                  </LazyRender>
                </div>

                {/* Properties for Sale */}
                <div id="sale-section" className="mb-4">
                  <LazyRender minHeight="224px" fallback={<div className="animate-pulse h-56 bg-muted rounded-xl" />}>
                    <PropertiesForSaleSection language={language} onPropertyClick={handlePropertyClick} />
                  </LazyRender>
                </div>

                {/* Properties for Rent */}
                <div id="rent-section" className="mb-4">
                  <LazyRender minHeight="224px" fallback={<div className="animate-pulse h-56 bg-muted rounded-xl" />}>
                    <PropertiesForRentSection language={language} onPropertyClick={handlePropertyClick} />
                  </LazyRender>
                </div>

                {/* Marketplace Services */}
                <div id="marketplace-services-section" className="mt-6">
                  <LazyRender minHeight="224px" fallback={<div className="animate-pulse h-56 bg-muted rounded-xl" />}>
                    <MarketplaceServices />
                  </LazyRender>
                </div>

                {/* Partner Logos Marquee */}
                <LazyRender minHeight="80px" fallback={null}>
                  <PartnerLogosMarquee />
                </LazyRender>
              </>
            )}
          </div>
        </div>
        
        {/* AI Search Loading Dialog */}
        <Suspense fallback={null}>
          <SearchLoadingDialog 
            open={isSearching}
          onOpenChange={setIsSearching}
          searchQuery={quickSearch}
        />
        </Suspense>
        
        {/* Command Palette (Cmd+K / Ctrl+K) */}
        <CommandPalette
          onOpenChat={() => {
            setChatOpen(true);
            const event = new CustomEvent('openAIChat');
            window.dispatchEvent(event);
          }}
          onOpenImageSearch={() => {
            imageInputRef.current?.click();
          }}
          onScrollToTop={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onShowShortcuts={() => {
            setShowShortcutsPanel(true);
            const event = new CustomEvent('toggleShortcutsPanel');
            window.dispatchEvent(event);
          }}
        />

        {/* Hidden Image Input for FAB */}
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            
            if (!file.type.startsWith('image/')) {
              toast.error('Please select an image file');
              return;
            }
            
            if (file.size > 5 * 1024 * 1024) {
              toast.error('Image size must be less than 5MB');
              return;
            }
            
            const reader = new FileReader();
            reader.onload = (event) => {
              const result = event.target?.result as string;
              setUploadedImageBase64(result);
              setImageSearchMode(true);
              toast.success('Image uploaded! Searching for similar properties...');
              // TODO: Implement actual image similarity search
            };
            reader.readAsDataURL(file);
          }}
          className="hidden"
        />

        
        {/* WhatsApp Inquiry Dialog */}
        {selectedProperty && (
          <Suspense fallback={null}>
            <WhatsAppInquiryDialog
              open={whatsappDialogOpen}
              onOpenChange={setWhatsappDialogOpen}
              property={selectedProperty}
            />
          </Suspense>
        )}
      </div>
    </div>
  );

  return content;
};

export default Index;