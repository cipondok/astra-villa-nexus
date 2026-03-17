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
import { cn } from "@/lib/utils";
import { Calculator, Crosshair, BarChart3 } from "lucide-react";
import { SearchErrorBoundary } from "@/components/search/SearchErrorBoundary";
import { SearchPanelSkeleton } from "@/components/search/SearchSkeleton";
import { useRetrySearch } from "@/hooks/useRetrySearch";
import { shareProperty } from "@/utils/shareUtils";
// GoldSparkleEffect removed from hero — single-image layout
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
const SearchResultsToolbar = lazy(() => import("@/components/search/SearchResultsToolbar"));
const PropertyListView = lazy(() => import("@/components/search/PropertyListView"));
const SearchPagination = lazy(() => import("@/components/search/SearchPagination"));
const PropertyMapView = lazy(() => import("@/components/search/PropertyMapView"));
const PropertyGridView = lazy(() => import("@/components/search/PropertyGridView"));
const ActiveFilterPills = lazy(() => import("@/components/search/ActiveFilterPills").then(m => ({ default: m.ActiveFilterPills })));
// PropertySlideSection removed — not used in restructured flow
const PropertiesForSaleSection = lazy(() => import("@/components/property/PropertiesForSaleSection"));
const PropertiesForRentSection = lazy(() => import("@/components/property/PropertiesForRentSection"));
const AstraSearchPanel = lazy(() => import("@/components/AstraSearchPanel"));
const SearchLoadingDialog = lazy(() => import("@/components/SearchLoadingDialog").then(m => ({ default: m.SearchLoadingDialog })));
const WhatsAppInquiryDialog = lazy(() => import("@/components/property/WhatsAppInquiryDialog"));
const AstraVillaFeatures = lazy(() => import("@/components/home/AstraVillaFeatures"));
// AIRecommendedProperties removed — merged into AI Opportunity Zone via SmartAIFeed + SmartRecommendations
const SmartAIFeed = lazy(() => import("@/components/home/SmartAIFeed"));
const AIInvestmentFeed = lazy(() => import("@/components/home/AIInvestmentFeed"));
const SmartRecommendations = lazy(() => import("@/components/ai/SmartRecommendations"));
const BehaviorPatternBanner = lazy(() => import("@/components/ai/BehaviorPatternBanner"));
const DealHunterHero = lazy(() => import("@/components/home/DealHunterHero"));
// FeaturedAdsCarousel removed — not used in restructured flow
const MarketplaceServices = lazy(() => import("@/components/home/MarketplaceServices"));
const PartnerLogosMarquee = lazy(() => import("@/components/home/PartnerLogosMarquee"));
const TrendingSearchesWidget = lazy(() => import("@/components/home/TrendingSearchesWidget").then(m => ({ default: m.TrendingSearchesWidget })));
const InvestorPathSelector = lazy(() => import("@/components/home/InvestorPathSelector"));
// PropertySlideshow removed — not used in restructured flow
const FeaturedPropertiesCarousel = lazy(() => import("@/components/home/FeaturedPropertiesCarousel"));
const SmartCollectionsShowcase = lazy(() => import("@/components/home/SmartCollectionsV2"));
const TrendingROIDeals = lazy(() => import("@/components/home/TrendingROIDeals"));
const AIPriceEstimatorCTA = lazy(() => import("@/components/home/AIPriceEstimatorCTA"));
// MarketIntelligenceCTA removed — replaced by SectionDividerCTA inline
const EarlyInvestmentCTA = lazy(() => import("@/components/home/EarlyInvestmentCTA"));
const SocialProofStrip = lazy(() => import("@/components/home/SocialProofStrip"));
const SectionDividerCTA = lazy(() => import("@/components/home/SectionDividerCTA"));
const MobileFloatingCTA = lazy(() => import("@/components/home/MobileFloatingCTA"));
const TrustFooterStrip = lazy(() => import("@/components/home/TrustFooterStrip"));
const LiveActivityTicker = lazy(() => import("@/components/home/LiveActivityTicker"));
const WelcomeBackStrip = lazy(() => import("@/components/home/WelcomeBackStrip"));
const RecentlyViewedStrip = lazy(() => import("@/components/home/RecentlyViewedStrip"));
const ReferralInviteStrip = lazy(() => import("@/components/home/ReferralInviteStrip"));
const HotspotAlertBanner = lazy(() => import("@/components/ai/HotspotAlertBanner"));
const DiscoveryTrigger = lazy(() => import("@/components/ai/DiscoveryTrigger"));
const PredictiveSearchCanvas = lazy(() => import("@/components/ai/PredictiveSearchCanvas"));
const OpportunityRadar = lazy(() => import("@/components/ai/OpportunityRadar"));
const AIJourneyGuide = lazy(() => import("@/components/ai/AIJourneyGuide"));
const OpportunityStreakCards = lazy(() => import("@/components/home/OpportunityStreakCards"));
const PWAInstallPrompt = lazy(() => import("@/components/pwa/PWAInstallPrompt"));
const ExitIntentPopup = lazy(() => import("@/components/home/ExitIntentPopup"));
const UrgencyTimerStrip = lazy(() => import("@/components/home/UrgencyTimerStrip"));
const AstraProjectShowcase = lazy(() => import("@/components/home/AstraProjectShowcase"));

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
  const { speed: connectionSpeed } = useConnectionSpeed();
  const queryClient = useQueryClient();

  // Auto-refetch all queries when coming back online
  useEffect(() => {
    const onOnline = () => {
      queryClient.invalidateQueries();
    };
    window.addEventListener('online', onOnline);
    return () => window.removeEventListener('online', onOnline);
  }, [queryClient]);

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

  // Hero background image — admin config or default
  const heroImage = heroConfig?.bannerImages?.[0] || slideHero1;

  // Preload hero image for faster LCP
  useEffect(() => {
    if (heroImage) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = heroImage;
      link.fetchPriority = 'high';
      document.head.appendChild(link);
      return () => { document.head.removeChild(link); };
    }
  }, [heroImage]);

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
      {/* Skip to content link for screen readers */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-2 focus:left-2 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md">
        Skip to main content
      </a>
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
      <main id="main-content" className="relative z-10 min-h-screen pb-20 md:pb-4">
        
        {/* Hero Section — Single image, left-aligned layout */}
        <SectionErrorBoundary sectionName="Hero" fallbackMinHeight="400px">
        <section className="relative w-full overflow-hidden" id="hero-section"
          style={{ height: 'clamp(500px, 80vh, 820px)', contain: 'layout' }}
        >
          {/* Single premium background image with slow zoom */}
          <div className="absolute inset-0 z-0 overflow-hidden" style={{ contain: 'strict' }}>
            <img
              src={heroImage}
              alt="Premium property — ASTRAVILLA intelligent real estate"
              width={1920}
              height={1080}
              fetchPriority="high"
              loading="eager"
              decoding="sync"
              sizes="100vw"
              className="w-full h-full object-cover animate-[heroZoom_25s_ease-in-out_infinite_alternate]"
              style={{ willChange: 'transform' }}
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

        {/* ═══════════════════════════════════════════════════════
            SECTION 1: Live Activity Ticker + Gold Divider
        ═══════════════════════════════════════════════════════ */}
        <Suspense fallback={null}>
          <LiveActivityTicker />
        </Suspense>
        <div className="relative h-8 sm:h-12 -mt-1 overflow-hidden" aria-hidden="true">
          <div className="absolute inset-0 bg-gradient-to-b from-background/0 to-background" />
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold-primary/20 to-transparent" />
        </div>

        {/* Error State — always accessible */}
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
                  <Button onClick={() => { setSearchError(null); handleQuickSearch(); }} size="sm" className="h-7 px-3 text-xs bg-primary hover:bg-primary/90">
                    <RefreshCw className="h-3 w-3 mr-1" />{t('indexPage.retry')}
                  </Button>
                  <Button onClick={() => { setSearchError(null); setSearchResults([]); setHasSearched(false); }} variant="outline" size="sm" className="h-7 px-3 text-xs">
                    {t('indexPage.clearError')}
                  </Button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════════
            MAIN CONTENT: Search Results or Discovery Flow
        ═══════════════════════════════════════════════════════ */}
        <SectionErrorBoundary sectionName="Properties" fallbackMinHeight="300px">
        <div className="w-full">
          {hasSearched ? (
            /* ── SEARCH RESULTS MODE ── */
            <section id="search-results-section" className="py-4 sm:py-6 px-3 sm:px-4">
              <div className="max-w-7xl mx-auto">
                {/* Filter pills */}
                <Suspense fallback={null}>
                  <ActiveFilterPills filters={filters} onRemoveFilter={handleRemoveFilter} onClearAll={handleClearFilters} />
                </Suspense>

                {/* Sticky toolbar: sort + view + count */}
                <Suspense fallback={<div className="h-12 bg-muted/30 rounded-lg animate-pulse mt-2" />}>
                  <SearchResultsToolbar
                    viewMode={viewMode}
                    onViewModeChange={(mode) => setViewMode(mode)}
                    sortBy={filters.sortBy}
                    onSortChange={(sort) => setFilters(prev => ({ ...prev, sortBy: sort }))}
                    totalResults={searchResults.length}
                    isSearching={isSearching}
                    searchQuery={quickSearch}
                  />
                </Suspense>

                {/* Results grid */}
                <div className="mt-4 sm:mt-6">
                  {isSearching && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="animate-pulse rounded-xl overflow-hidden border border-border/40">
                          <div className="aspect-[16/10] bg-muted" />
                          <div className="p-4 space-y-3">
                            <div className="h-5 bg-muted rounded w-2/3" />
                            <div className="h-4 bg-muted rounded w-full" />
                            <div className="h-3 bg-muted rounded w-1/2" />
                            <div className="flex gap-2 pt-2">
                              <div className="h-9 bg-muted rounded flex-1" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {viewMode === 'grid' && !isSearching && (
                    <Suspense fallback={<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">{[...Array(6)].map((_, i) => <div key={i} className="animate-pulse bg-muted/50 h-80 rounded-xl border border-border/40" />)}</div>}>
                      <PropertyGridView properties={paginatedResults} onPropertyClick={handlePropertyClick} onView3D={handlePropertyClick}
                        onSave={(property) => console.log('Save property:', property.id)}
                        onShare={async (property) => { const success = await shareProperty({ id: property.id, title: property.title, price: property.price || 0, location: property.location || property.city || '', images: property.images }); if (success) toast.success("Property link shared!"); }}
                        onContact={(property) => { setSelectedProperty(property); setWhatsappDialogOpen(true); }} />
                    </Suspense>
                  )}
                  {viewMode === 'list' && !isSearching && (
                    <Suspense fallback={<div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="animate-pulse bg-muted/50 h-32 rounded-lg border border-border/40" />)}</div>}>
                      <PropertyListView properties={paginatedResults} onPropertyClick={handlePropertyClick} onView3D={handlePropertyClick}
                        onSave={(property) => console.log('Save property:', property.id)}
                        onShare={async (property) => { const success = await shareProperty({ id: property.id, title: property.title, price: property.price || 0, location: property.location || property.city || '', images: property.images }); if (success) toast.success("Property link shared!"); }}
                        onContact={(property) => { setSelectedProperty(property); setWhatsappDialogOpen(true); }} />
                    </Suspense>
                  )}
                  {viewMode === 'map' && !isSearching && (
                    <Suspense fallback={<div className="animate-pulse h-96 bg-muted/50 rounded-xl border border-border/40" />}>
                      <PropertyMapView properties={searchResults} onPropertyClick={handlePropertyClick} />
                    </Suspense>
                  )}
                </div>

                {/* Pagination */}
                {!isSearching && searchResults.length > RESULTS_PER_PAGE && (
                  <div className="mt-6 sm:mt-8">
                    <Suspense fallback={null}>
                      <SearchPagination currentPage={currentPage} totalPages={totalPages} totalCount={searchResults.length} pageSize={RESULTS_PER_PAGE}
                        onPageChange={(page) => { setCurrentPage(page); document.getElementById('search-results-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }} />
                    </Suspense>
                  </div>
                )}
              </div>
            </section>
          ) : (
            /* ══════════════════════════════════════════════════
               DISCOVERY FLOW — Structured scroll journey
            ══════════════════════════════════════════════════ */
            <>
              {/* ── SECTION 2: Featured Properties ── */}
              <section id="featured-section" className="py-5 sm:py-8">
                <ScrollReveal direction="up" delay={0}>
                  <Suspense fallback={
                    <div className="py-6 max-w-7xl mx-auto px-3 sm:px-4">
                      <div className="flex gap-3 overflow-hidden">
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className="flex-shrink-0 w-[280px] sm:w-[320px]">
                            <div className="relative overflow-hidden h-48 bg-muted rounded-xl mb-2">
                              <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-gold-primary/15 to-transparent" />
                            </div>
                            <div className="h-4 bg-muted rounded w-3/4 mb-1" />
                            <div className="h-3 bg-muted rounded w-1/2" />
                          </div>
                        ))}
                      </div>
                    </div>
                  }>
                    <FeaturedPropertiesCarousel />
                  </Suspense>
                </ScrollReveal>

                {/* Contextual CTA: Discovery excitement */}
                <Suspense fallback={null}>
                  <SectionDividerCTA
                    icon={Search}
                    headline="Discover More Properties"
                    description="Browse thousands of verified listings across Indonesia"
                    ctaText="Explore All"
                    ctaRoute="/properties"
                    variant="primary"
                    secondaryText="List Yours"
                    secondaryRoute="/post-property"
                  />
                </Suspense>
              </section>

              {/* ── Welcome Back + Recently Viewed (returning users) ── */}
              <Suspense fallback={null}>
                <WelcomeBackStrip />
              </Suspense>
              <Suspense fallback={null}>
                <RecentlyViewedStrip />
              </Suspense>

              {/* ── Hotspot Alert ── */}
              <Suspense fallback={null}>
                <HotspotAlertBanner />
              </Suspense>

              {/* ── Urgency Timer ── */}
              <Suspense fallback={null}>
                <UrgencyTimerStrip />
              </Suspense>

              {/* ── SECTION 3: AI Opportunity Zone (merged intelligence modules) ── */}
              <section className="py-6 sm:py-10 bg-muted/30" id="ai-opportunity-zone" style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 800px' }}>
                <div className="max-w-7xl mx-auto px-3 sm:px-4">
                  {/* Zone header */}
                  <ScrollReveal direction="up" delay={0}>
                    <div className="text-center mb-5 sm:mb-7">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gold-primary/15 bg-gold-primary/5 mb-3">
                        <Sparkles className="h-3 w-3 text-gold-primary" />
                        <span className="text-[10px] sm:text-xs font-semibold text-gold-primary uppercase tracking-[0.15em]">AI Intelligence</span>
                      </div>
                      <h2 className="font-playfair text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-2">
                        Opportunity Discovery
                      </h2>
                      <p className="text-sm text-muted-foreground max-w-md mx-auto">
                        AI-curated deals, trending opportunities, and personalized picks — all in one view
                      </p>
                    </div>
                  </ScrollReveal>

                  {/* Predictive Search Canvas */}
                  <ScrollReveal direction="up" delay={0}>
                    <div className="mb-8">
                      <Suspense fallback={null}>
                        <PredictiveSearchCanvas />
                      </Suspense>
                    </div>
                  </ScrollReveal>

                  {/* AI Behavior Pattern Banner */}
                  <Suspense fallback={null}>
                    <div className="mb-6">
                      <BehaviorPatternBanner />
                    </div>
                  </Suspense>

                  {/* AI Investment Intelligence Feed */}
                  <ScrollReveal direction="up" delay={50}>
                    <div className="mb-8">
                      <LazyRender minHeight="320px" fallback={<div className="animate-pulse h-80 bg-muted rounded-xl" />}>
                        <AIInvestmentFeed onPropertyClick={handlePropertyClick} />
                      </LazyRender>
                    </div>
                  </ScrollReveal>

                  {/* Opportunity Streak — Time-limited deals */}
                  <ScrollReveal direction="up" delay={30}>
                    <div className="mb-8">
                      <Suspense fallback={null}>
                        <OpportunityStreakCards />
                      </Suspense>
                    </div>
                  </ScrollReveal>

                  {/* Deal Hunter + Trending ROI — side by side on desktop, stacked on mobile */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <ScrollReveal direction="up" delay={0}>
                      <Suspense fallback={<div className="h-48 bg-muted/30 rounded-xl animate-pulse" />}>
                        <DealHunterHero />
                      </Suspense>
                    </ScrollReveal>
                    <ScrollReveal direction="up" delay={100}>
                      <Suspense fallback={<div className="h-48 bg-muted/30 rounded-xl animate-pulse" />}>
                        <TrendingROIDeals onPropertyClick={handlePropertyClick} />
                      </Suspense>
                    </ScrollReveal>
                  </div>

                  {/* Opportunity Radar + AI Journey Guide — side by side */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <ScrollReveal direction="up" delay={0}>
                      <Suspense fallback={<div className="h-64 bg-muted/30 rounded-xl animate-pulse" />}>
                        <OpportunityRadar />
                      </Suspense>
                    </ScrollReveal>
                    <ScrollReveal direction="up" delay={100}>
                      <Suspense fallback={<div className="h-64 bg-muted/30 rounded-xl animate-pulse" />}>
                        <AIJourneyGuide />
                      </Suspense>
                    </ScrollReveal>
                  </div>

                  {/* Smart Recommendations — Personalized Picks */}
                  <ScrollReveal direction="up" delay={0}>
                    <Suspense fallback={<div className="h-48 bg-muted/30 rounded-xl animate-pulse" />}>
                      <SmartRecommendations limit={6} className="shadow-sm" />
                    </Suspense>
                  </ScrollReveal>
                  {/* Continuous discovery trigger */}
                  <Suspense fallback={null}>
                    <DiscoveryTrigger className="mt-4" />
                  </Suspense>
                </div>

                {/* Contextual CTA after AI zone */}
                <div className="mt-10">
                  <Suspense fallback={null}>
                    <SectionDividerCTA icon={Crosshair} headline="Find Undervalued Deals" description="AI detects properties priced below fair market value" ctaText="Hunt Deals" ctaRoute="/deal-finder" variant="accent" />
                  </Suspense>
                </div>
              </section>

              {/* ── SECTION 4: Smart Collections ── */}
              <section className="py-6 sm:py-10" style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 400px' }}>
                <ScrollReveal direction="up" delay={0}>
                  <LazyRender minHeight="280px" rootMargin="400px" fallback={<div className="animate-pulse h-72 bg-muted rounded-xl max-w-7xl mx-auto px-3 sm:px-4" />}>
                    <Suspense fallback={<div className="animate-pulse h-72 bg-muted rounded-xl max-w-7xl mx-auto px-3 sm:px-4" />}>
                      <SmartCollectionsShowcase />
                    </Suspense>
                  </LazyRender>
                </ScrollReveal>

                {/* Contextual CTA: Collection confidence */}
                <Suspense fallback={null}>
                  <SectionDividerCTA
                    icon={Star}
                    headline="Curated for Investors"
                    description="Handpicked collections based on ROI potential and market timing"
                    ctaText="View Collections"
                    ctaRoute="/collections"
                  />
                </Suspense>
              </section>

              {/* ── SECTION 5: Investor Path Selector ── */}
              <section className="py-5 sm:py-8 bg-muted/20">
                <ScrollReveal direction="up" delay={0}>
                  <LazyRender minHeight="64px" rootMargin="400px" fallback={
                    <div className="flex gap-3 justify-center py-3"><div className="animate-pulse h-16 w-36 bg-muted rounded-lg" /><div className="animate-pulse h-16 w-36 bg-muted rounded-lg" /><div className="animate-pulse h-16 w-36 bg-muted rounded-lg" /></div>
                  }>
                    <InvestorPathSelector />
                  </LazyRender>
                </ScrollReveal>
              </section>

              {/* ── SECTION 6: AI Tools Preview ── */}
              <section className="py-5 sm:py-8">
                <ScrollReveal direction="up" delay={0}>
                  <div className="max-w-7xl mx-auto">
                    <LazyRender minHeight="96px" rootMargin="400px" fallback={
                      <div className="flex gap-2 justify-center py-3" style={{ minHeight: '96px' }}>
                        {[...Array(6)].map((_, i) => <div key={i} className="flex-shrink-0 w-14 h-12 animate-pulse bg-muted rounded-lg" />)}
                      </div>
                    }>
                      <AstraVillaFeatures />
                    </LazyRender>
                  </div>
                </ScrollReveal>

                {/* AI Price Estimator CTA */}
                <div className="mt-8">
                  <ScrollReveal direction="up" delay={50}>
                    <Suspense fallback={<div className="animate-pulse h-48 bg-muted rounded-xl max-w-5xl mx-auto px-3 sm:px-4" />}>
                      <AIPriceEstimatorCTA />
                    </Suspense>
                  </ScrollReveal>
                </div>
              </section>

              {/* ── Visual breather ── */}
              <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mx-auto max-w-5xl" aria-hidden="true" />

              {/* ── SECTION 7: Properties for Sale & Rent ── */}
              <section className="py-6 sm:py-10 bg-muted/20" style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 600px' }}>
                <div className="space-y-8">
                  <ScrollReveal direction="up" delay={0}>
                    <div id="sale-section">
                      <LazyRender minHeight="224px" fallback={<div className="animate-pulse h-56 bg-muted rounded-xl" />}>
                        <PropertiesForSaleSection language={language} onPropertyClick={handlePropertyClick} />
                      </LazyRender>
                    </div>
                  </ScrollReveal>

                  <ScrollReveal direction="up" delay={50}>
                    <div id="rent-section">
                      <LazyRender minHeight="224px" fallback={<div className="animate-pulse h-56 bg-muted rounded-xl" />}>
                        <PropertiesForRentSection language={language} onPropertyClick={handlePropertyClick} />
                      </LazyRender>
                    </div>
                  </ScrollReveal>

                  {/* Trending Searches — contextual discovery after listings */}
                  <ScrollReveal direction="up" delay={0}>
                    <LazyRender minHeight="0px" fallback={<div className="animate-pulse h-48 bg-muted rounded-xl" />}>
                      <TrendingSearchesWidget onSearchClick={(trendFilters) => { setFilters(prev => ({ ...prev, ...trendFilters })); setHasSearched(true); }} />
                    </LazyRender>
                  </ScrollReveal>
                </div>

                {/* Market Intelligence CTA */}
                <div className="mt-8">
                  <Suspense fallback={null}>
                    <SectionDividerCTA icon={BarChart3} headline="Track Market Trends" description="Real-time price indices and investment analytics" ctaText="View Insights" ctaRoute="/analytics" variant="accent" />
                  </Suspense>
                </div>
              </section>

              {/* ── SECTION 8: Marketplace Services ── */}
              <section className="py-6 sm:py-10" id="marketplace-services-section" style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 300px' }}>
                <ScrollReveal direction="up" delay={0}>
                  <LazyRender minHeight="224px" fallback={<div className="animate-pulse h-56 bg-muted rounded-xl" />}>
                    <MarketplaceServices />
                  </LazyRender>
                </ScrollReveal>
              </section>

              {/* ── Referral Invite Strip ── */}
              <Suspense fallback={null}>
                <ReferralInviteStrip />
              </Suspense>

              {/* ── SECTION 9: Partner & Social Proof ── */}
              <section className="py-6 sm:py-8 bg-muted/20">
                <ScrollReveal direction="up" delay={0}>
                  <LazyRender minHeight="80px" fallback={null}>
                    <PartnerLogosMarquee />
                  </LazyRender>
                </ScrollReveal>
              </section>

              {/* ── Trust governance strip ── */}
              <Suspense fallback={null}>
                <TrustFooterStrip />
              </Suspense>

              {/* ── SECTION 10: Final Conversion CTA ── */}
              <section className="py-6 sm:py-10">
                <ScrollReveal direction="up" delay={0}>
                  <Suspense fallback={<div className="animate-pulse h-40 bg-muted rounded-xl max-w-5xl mx-auto" />}>
                    <EarlyInvestmentCTA />
                  </Suspense>
                </ScrollReveal>
              </section>
            </>
          )}
        </div>
        </SectionErrorBoundary>

        {/* Mobile floating CTA bar */}
        <Suspense fallback={null}>
          <MobileFloatingCTA />
        </Suspense>

        {/* PWA install prompt */}
        <Suspense fallback={null}>
          <PWAInstallPrompt />
        </Suspense>

        {/* Exit Intent Popup (desktop only, non-logged-in) */}
        <Suspense fallback={null}>
          <ExitIntentPopup />
        </Suspense>
        
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
      </main>
    </div>
  );

  return content;
};

export default Index;