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
import { useUserAiProfile } from "@/hooks/useUserAiProfile";
import { generatePersonalizedHeadline } from "@/utils/generatePersonalizedHeadline";

import { supabase } from "@/integrations/supabase/client";
import { BaseProperty } from "@/types/property";
import { PropertyFilters } from "@/components/search/AdvancedPropertyFilters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Camera, MessageSquare, ArrowUp, Sparkles, RefreshCw, Star, ChevronDown } from "lucide-react";
import slideHero1 from "@/assets/home/slide-hero-1.png";
import slideHero2 from "@/assets/home/slide-hero-2.png";
import slideHero3 from "@/assets/home/slide-hero-3.png";
import slideHero4 from "@/assets/home/slide-hero-4.png";
import slideHero5 from "@/assets/home/slide-hero-5.png";
import slideHero6 from "@/assets/home/slide-hero-6.png";
import slideHero7 from "@/assets/home/slide-hero-7.png";
import { cn } from "@/lib/utils";
import { Calculator, Crosshair, BarChart3 } from "lucide-react";
import { SearchErrorBoundary } from "@/components/search/SearchErrorBoundary";
import { SearchPanelSkeleton } from "@/components/search/SearchSkeleton";
import { useRetrySearch } from "@/hooks/useRetrySearch";
import { shareProperty } from "@/utils/shareUtils";
const GoldSparkleEffect = lazy(() => import("@/components/home/GoldSparkleEffect"));
import { ImageSearchButton } from "@/components/search/ImageSearchButton";
import { CommandPalette } from "@/components/ui/CommandPalette";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { NetworkStatusIndicator } from "@/components/NetworkStatusIndicator";
import { UserProfileHeader } from "@/components/user/UserProfileHeader";
import { StickyHeaderSearch } from "@/components/search/StickyHeaderSearch";
import LazyRender from "@/components/LazyRender";
import ScrollReveal from "@/components/ui/ScrollReveal";
import SectionErrorBoundary from "@/components/ui/SectionErrorBoundary";


// Lazy load heavy components for better performance
const ResponsiveAIChatWidget = lazy(() => import("@/components/ai/ResponsiveAIChatWidget"));
const PropertyViewModeToggle = lazy(() => import("@/components/search/PropertyViewModeToggle"));
const PropertyListView = lazy(() => import("@/components/search/PropertyListView"));
const SearchPagination = lazy(() => import("@/components/search/SearchPagination"));
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
const SmartAIFeed = lazy(() => import("@/components/home/SmartAIFeed"));
const SmartRecommendations = lazy(() => import("@/components/ai/SmartRecommendations"));
const BehaviorPatternBanner = lazy(() => import("@/components/ai/BehaviorPatternBanner"));
const DealHunterHero = lazy(() => import("@/components/home/DealHunterHero"));
const FeaturedAdsCarousel = lazy(() => import("@/components/home/FeaturedAdsCarousel"));
const MarketplaceServices = lazy(() => import("@/components/home/MarketplaceServices"));
const PartnerLogosMarquee = lazy(() => import("@/components/home/PartnerLogosMarquee"));
const TrendingSearchesWidget = lazy(() => import("@/components/home/TrendingSearchesWidget").then(m => ({ default: m.TrendingSearchesWidget })));
const InvestorPathSelector = lazy(() => import("@/components/home/InvestorPathSelector"));
const PropertySlideshow = lazy(() => import("@/components/PropertySlideshow"));
const FeaturedPropertiesCarousel = lazy(() => import("@/components/home/FeaturedPropertiesCarousel"));
const SmartCollectionsShowcase = lazy(() => import("@/components/home/SmartCollectionsV2"));
const TrendingROIDeals = lazy(() => import("@/components/home/TrendingROIDeals"));
const AIPriceEstimatorCTA = lazy(() => import("@/components/home/AIPriceEstimatorCTA"));
const MarketIntelligenceCTA = lazy(() => import("@/components/home/MarketIntelligenceCTA"));
const EarlyInvestmentCTA = lazy(() => import("@/components/home/EarlyInvestmentCTA"));
const SocialProofStrip = lazy(() => import("@/components/home/SocialProofStrip"));
const SectionDividerCTA = lazy(() => import("@/components/home/SectionDividerCTA"));

type ViewMode = 'list' | 'grid' | 'map';

const Index = () => {
  const { t, language } = useTranslation();
  const { user, profile, loading } = useAuth();
  const { trackInteraction } = useUserBehaviorAnalytics();
  const { data: heroConfig } = useHeroSliderConfig();
  const { data: userAiProfile } = useUserAiProfile();
  const personalizedHeadline = useMemo(() => userAiProfile ? generatePersonalizedHeadline(userAiProfile) : null, [userAiProfile]);
  const navigate = useNavigate();
  const { isMobile, isTablet } = useIsMobile();
  const [searchResults, setSearchResults] = useState<BaseProperty[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [quickSearch, setQuickSearch] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const RESULTS_PER_PAGE = 15;
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
  const [parallaxOffset, setParallaxOffset] = useState(0);
  const prefersReducedMotion = useMemo(() => 
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches, 
  []);
  const parallaxEnabled = !isMobile && !isTablet && !prefersReducedMotion;
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

    // Search initiated with filters

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
    setCurrentPage(1);
    setSearchError(null);

    try {
      const results = await executeWithRetry(searchData);
      setSearchResults(results);
      // Search completed
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
    : [slideHero1, slideHero2, slideHero3, slideHero4, slideHero5, slideHero6, slideHero7];
  
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
      if (parallaxEnabled) setParallaxOffset(window.scrollY);
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
      // Fetching featured properties
      
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

        // Featured properties loaded
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

  const totalPages = Math.ceil(searchResults.length / RESULTS_PER_PAGE);
  const paginatedResults = useMemo(() => {
    const start = (currentPage - 1) * RESULTS_PER_PAGE;
    return searchResults.slice(start, start + RESULTS_PER_PAGE);
  }, [searchResults, currentPage, RESULTS_PER_PAGE]);


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
    setCurrentPage(1);
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
        
        {/* Hero Section — Single image, left-aligned layout */}
        <SectionErrorBoundary sectionName="Hero" fallbackMinHeight="400px">
        <section className="relative w-full overflow-hidden" id="hero-section"
          style={{ height: 'clamp(500px, 80vh, 820px)', contain: 'layout' }}
        >
          {/* Single premium background image with slow zoom */}
          <div className="absolute inset-0 z-0">
            <img
              src={bannerImages[0]}
              alt="Premium property — ASTRAVILLA intelligent real estate"
              width={1920}
              height={1080}
              fetchPriority="high"
              loading="eager"
              decoding="sync"
              sizes="100vw"
              className="w-full h-[115%] object-cover will-change-transform animate-[heroZoom_25s_ease-in-out_infinite_alternate]"
            />
          </div>

          {/* Cinematic gradient overlays — lighter for image vibrancy */}
          <div className="absolute inset-0 z-[1] pointer-events-none bg-gradient-to-r from-background/85 via-background/40 to-transparent" />
          <div className="absolute inset-0 z-[1] pointer-events-none bg-gradient-to-t from-background/80 via-transparent to-background/30" />

          {/* Left-aligned content */}
          <div className="relative z-10 h-full flex items-center">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-2xl space-y-6 sm:space-y-8">

                {/* AI badge — subtle, single instance */}
                <div
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gold-primary/20 bg-background/30 backdrop-blur-sm animate-fade-in"
                  style={{ animationDelay: '0.2s', animationFillMode: 'both' }}
                >
                  <Sparkles className="h-3 w-3 text-gold-primary" />
                  <span className="text-[10px] sm:text-xs font-semibold text-foreground/90 uppercase tracking-[0.15em]">
                    {t('indexPage.aiPoweredSearch')}
                  </span>
                </div>

                {/* Headline — strong Playfair hierarchy */}
                <div className="space-y-3 animate-fade-in" style={{ animationDelay: '0.35s', animationFillMode: 'both' }}>
                  <h1 className="font-playfair text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.08] text-foreground drop-shadow-sm">
                    {personalizedHeadline?.headline || t('indexPage.findYour')}
                  </h1>
                  <p className="text-sm sm:text-base text-muted-foreground font-medium max-w-lg leading-relaxed">
                    {personalizedHeadline?.subtitle || t('indexPage.searchPowered')}
                  </p>
                </div>

                {/* Search Panel — dominant, left-aligned */}
                <div className="animate-fade-in" style={{ animationDelay: '0.5s', animationFillMode: 'both' }}>
                  <SectionErrorBoundary sectionName="Search" fallbackMinHeight="120px">
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
                  </SectionErrorBoundary>
                </div>

                {/* Inline trust metrics — subtle credibility cues */}
                <div
                  className="flex items-center gap-4 sm:gap-6 flex-wrap text-muted-foreground animate-fade-in"
                  style={{ animationDelay: '0.7s', animationFillMode: 'both' }}
                >
                  <Suspense fallback={null}>
                    <SocialProofStrip />
                  </Suspense>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll indicator — below content, gentle pulse */}
          <button
            onClick={() => document.getElementById('featured-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="hidden sm:flex absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex-col items-center gap-1 text-muted-foreground/50 hover:text-gold-primary transition-colors duration-300 animate-fade-in"
            style={{ animationDelay: '1s', animationFillMode: 'both' }}
            aria-label="Scroll to content"
          >
            <span className="text-[10px] uppercase tracking-[0.3em] font-medium">{t('indexPage.explore')}</span>
            <ChevronDown className="h-4 w-4 animate-[pulse_2.5s_ease-in-out_infinite]" />
          </button>
        </section>
        </SectionErrorBoundary>
            
        {/* Retry Indicator */}
        {isRetrying && (
          <div className="mt-2 bg-gold-primary text-foreground px-3 py-1.5 rounded-lg shadow-lg flex items-center justify-center gap-2 animate-in slide-in-from-bottom-2">
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            <span className="text-xs font-bold">{t('indexPage.retrying')} ({retryCount}/3)</span>
          </div>
        )}

        {/* Gold gradient divider between hero and content */}
        <div className="relative h-12 sm:h-16 -mt-1 overflow-hidden" aria-hidden="true">
          <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background to-background" />
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-gradient-to-r from-transparent via-gold-primary/20 to-transparent" />
        </div>

        {/* Featured Properties Carousel */}
        <ScrollReveal direction="left" delay={100}>
        <div id="featured-section">
        <Suspense fallback={
          <div className="py-6 sm:py-8 max-w-7xl mx-auto px-3 sm:px-4">
            <div className="flex gap-3 overflow-hidden">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex-shrink-0 w-[280px] sm:w-[320px]">
                  <div className="relative overflow-hidden h-48 bg-muted rounded-xl mb-2">
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-gold-primary/15 to-transparent" />
                  </div>
                  <div className="relative overflow-hidden h-4 bg-muted rounded w-3/4 mb-1">
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-gold-primary/15 to-transparent" />
                  </div>
                  <div className="relative overflow-hidden h-3 bg-muted rounded w-1/2">
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-gold-primary/15 to-transparent" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        }>
          <FeaturedPropertiesCarousel />
        </Suspense>
        </div>
        </ScrollReveal>

        {/* AI Smart Collections */}
        <ScrollReveal direction="right" delay={0}>
        <LazyRender minHeight="300px" rootMargin="400px" fallback={<div className="animate-pulse h-72 bg-muted rounded-xl max-w-7xl mx-auto mx-3 sm:mx-4" />}>
          <Suspense fallback={<div className="animate-pulse h-72 bg-muted rounded-xl max-w-7xl mx-auto mx-3 sm:mx-4" />}>
            <SmartCollectionsShowcase />
          </Suspense>
        </LazyRender>
        </ScrollReveal>

        {/* AI Price Estimator CTA */}
        <ScrollReveal direction="up" delay={50}>
          <Suspense fallback={<div className="animate-pulse h-48 bg-muted rounded-xl max-w-5xl mx-auto mx-3 sm:mx-4" />}>
            <AIPriceEstimatorCTA />
          </Suspense>
        </ScrollReveal>

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
                    {t('indexPage.attempted')} {retryCount} {retryCount === 1 ? t('indexPage.retryWord') : t('indexPage.retriesWord')}
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
                    {t('indexPage.retry')}
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
        <ScrollReveal direction="right" delay={0}>
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
        </ScrollReveal>

        {/* Global Investment Platform */}
        <ScrollReveal direction="left" delay={100}>
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
        </ScrollReveal>

        {/* Property Display Section */}
        <SectionErrorBoundary sectionName="Properties" fallbackMinHeight="300px">
        <div className="px-0 py-6 sm:py-8 space-y-6 bg-gradient-to-b from-hero-fade via-hero-fade/60 to-background">
          <div className="w-full space-y-6">
            {hasSearched ? (
              <section id="search-results-section" className="bg-primary/10 backdrop-blur-sm rounded-xl shadow-md border border-primary/15 dark:bg-primary/5 dark:border-primary/10">
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
                      <p className="text-xs sm:text-xs md:text-sm text-muted-foreground">
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
                        properties={paginatedResults}
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
                        properties={paginatedResults}
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

                  {/* Pagination */}
                  {!isSearching && searchResults.length > RESULTS_PER_PAGE && (
                    <Suspense fallback={null}>
                      <SearchPagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalCount={searchResults.length}
                        pageSize={RESULTS_PER_PAGE}
                        onPageChange={(page) => {
                          setCurrentPage(page);
                          document.getElementById('search-results-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }}
                      />
                    </Suspense>
                  )}
                </div>
              </section>
            ) : (
              <>
                {/* AI Behavior Pattern Banner */}
                <Suspense fallback={null}>
                  <div className="mb-2 px-1">
                    <BehaviorPatternBanner />
                  </div>
                </Suspense>

                {/* Smart AI Feed - Recommended / Trending */}
                <ScrollReveal direction="right" delay={0}>
                <div className="mb-6">
                  <LazyRender minHeight="280px" fallback={
                    <div className="space-y-3 p-4" style={{ minHeight: '280px' }}>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-muted rounded-lg animate-pulse" />
                        <div className="flex-1">
                          <div className="h-4 bg-muted rounded w-40 mb-1.5 animate-pulse" />
                          <div className="h-2.5 bg-muted rounded w-56 animate-pulse" />
                        </div>
                      </div>
                      <div className="flex gap-3 overflow-hidden">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="flex-shrink-0 w-[200px]">
                            <div className="animate-pulse bg-muted h-36 rounded-xl mb-2" />
                            <div className="animate-pulse bg-muted h-3 rounded w-3/4 mb-1" />
                            <div className="animate-pulse bg-muted h-2.5 rounded w-1/2" />
                          </div>
                        ))}
                      </div>
                    </div>
                  }>
                    <SmartAIFeed onPropertyClick={handlePropertyClick} />
                  </LazyRender>
                </div>
                </ScrollReveal>

                {/* AI Deal Hunter — Hot deals & silent opportunities */}
                <ScrollReveal direction="up" delay={0}>
                <div className="mb-6">
                  <Suspense fallback={<div className="h-40 bg-muted/30 rounded-xl animate-pulse" />}>
                    <DealHunterHero />
                  </Suspense>
                </div>
                </ScrollReveal>

                {/* Removed: Duplicate SectionDividerCTA for AI Pricing — AIPriceEstimatorCTA already covers this */}

                {/* Smart Recommendations - Personalized Picks */}
                <ScrollReveal direction="left" delay={0}>
                <div className="mb-6">
                  <Suspense fallback={<div className="h-48 bg-muted/30 rounded-xl animate-pulse" />}>
                    <SmartRecommendations limit={6} className="shadow-sm" />
                  </Suspense>
                </div>
                </ScrollReveal>

                {/* Trending & ROI Deals */}
                <ScrollReveal direction="right" delay={0}>
                <div className="mb-6">
                  <Suspense fallback={<div className="h-48 bg-muted/30 rounded-xl animate-pulse" />}>
                    <TrendingROIDeals onPropertyClick={handlePropertyClick} />
                  </Suspense>
                </div>
                </ScrollReveal>

                {/* Mid-page CTA: Deal Finder */}
                <Suspense fallback={null}>
                  <SectionDividerCTA
                    icon={Crosshair}
                    headline="Find Undervalued Deals"
                    description="AI detects properties priced below fair market value"
                    ctaText="Hunt Deals"
                    ctaRoute="/deal-finder"
                  />
                </Suspense>

                {/* Removed: Legacy AIRecommendedProperties — SmartAIFeed + SmartRecommendations already provide AI recommendations */}

                {/* Trending Searches */}
                <ScrollReveal direction="left" delay={100}>
                <div>
                  <LazyRender minHeight="0px" fallback={<div className="animate-pulse h-48 bg-muted rounded-xl" />}>
                    <TrendingSearchesWidget 
                      onSearchClick={(trendFilters) => {
                        setFilters(prev => ({ ...prev, ...trendFilters }));
                        setHasSearched(true);
                      }}
                    />
                  </LazyRender>
                </div>
                </ScrollReveal>

                {/* Properties for Sale */}
                <ScrollReveal direction="right" delay={0}>
                <div id="sale-section" className="mb-6">
                  <LazyRender minHeight="224px" fallback={<div className="animate-pulse h-56 bg-muted rounded-xl" />}>
                    <PropertiesForSaleSection language={language} onPropertyClick={handlePropertyClick} />
                  </LazyRender>
                </div>
                </ScrollReveal>

                {/* Properties for Rent */}
                <ScrollReveal direction="left" delay={100}>
                <div id="rent-section" className="mb-6">
                  <LazyRender minHeight="224px" fallback={<div className="animate-pulse h-56 bg-muted rounded-xl" />}>
                    <PropertiesForRentSection language={language} onPropertyClick={handlePropertyClick} />
                  </LazyRender>
                </div>
                </ScrollReveal>

                {/* Mid-page CTA: Market Intelligence */}
                <Suspense fallback={null}>
                  <SectionDividerCTA
                    icon={BarChart3}
                    headline="Track Market Trends"
                    description="Real-time price indices and investment analytics"
                    ctaText="View Insights"
                    ctaRoute="/analytics"
                    variant="accent"
                  />
                </Suspense>

                {/* Early Investment CTA */}
                <ScrollReveal direction="up" delay={50}>
                  <Suspense fallback={<div className="animate-pulse h-40 bg-muted rounded-xl max-w-5xl mx-auto" />}>
                    <EarlyInvestmentCTA />
                  </Suspense>
                </ScrollReveal>

                {/* Removed: Duplicate MarketIntelligenceCTA — SectionDividerCTA (Market Intelligence) already covers this */}

                {/* Marketplace Services */}
                <ScrollReveal direction="right" delay={0}>
                <div id="marketplace-services-section" className="mt-8">
                  <LazyRender minHeight="224px" fallback={<div className="animate-pulse h-56 bg-muted rounded-xl" />}>
                    <MarketplaceServices />
                  </LazyRender>
                </div>
                </ScrollReveal>

                {/* Partner Logos Marquee */}
                <ScrollReveal direction="left" delay={100}>
                <LazyRender minHeight="80px" fallback={null}>
                  <PartnerLogosMarquee />
                </LazyRender>
                </ScrollReveal>
              </>
            )}
          </div>
        </div>
        </SectionErrorBoundary>
        
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