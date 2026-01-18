import { useState, useEffect, lazy, Suspense, useRef, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLanguage } from "@/contexts/LanguageContext";
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
import { Search, Camera, MessageSquare, ArrowUp, Sparkles, RefreshCw } from "lucide-react";
import { SearchPanelBackgroundSlider } from "@/components/search/SearchPanelBackgroundSlider";
import { cn } from "@/lib/utils";
import { SearchErrorBoundary } from "@/components/search/SearchErrorBoundary";
import { SearchPanelSkeleton } from "@/components/search/SearchSkeleton";
import { useRetrySearch } from "@/hooks/useRetrySearch";
import HomeIntroSlider from "@/components/home/HomeIntroSlider";
import { shareProperty } from "@/utils/shareUtils";
import { ImageSearchButton } from "@/components/search/ImageSearchButton";
import { CommandPalette } from "@/components/ui/CommandPalette";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { NetworkStatusIndicator } from "@/components/NetworkStatusIndicator";
import { UserProfileHeader } from "@/components/user/UserProfileHeader";
import { StickyHeaderSearch } from "@/components/search/StickyHeaderSearch";

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
const TrendingSearchesWidget = lazy(() => import("@/components/home/TrendingSearchesWidget").then(m => ({ default: m.TrendingSearchesWidget })));


type ViewMode = 'list' | 'grid' | 'map';

const Index = () => {
  const { language } = useLanguage();
  const copy = {
    en: {
      findYour: "Find Your Dream Property",
      searchPowered: "Enhanced search & filtering powered by AI",
      searchResults: "Search Results",
      searching: "Searching...",
      propertiesFound: "properties found",
      for: "for",
      clearError: "Clear Error",
      featuredProperties: "Featured Properties",
      premiumProperties: "Premium properties with enhanced display"
    },
    id: {
      findYour: "Temukan Properti Impian Anda",
      searchPowered: "Pencarian & penyaringan canggih dengan AI",
      searchResults: "Hasil Pencarian",
      searching: "Mencari...",
      propertiesFound: "properti ditemukan",
      for: "untuk",
      clearError: "Hapus Kesalahan",
      featuredProperties: "Properti Unggulan",
      premiumProperties: "Properti premium dengan tampilan lebih baik"
    }
  } as const;
  const t = copy[language];
  const { user, profile, loading } = useAuth();
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
  const { speed: connectionSpeed } = useConnectionSpeed();

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
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });


  const handlePropertyClick = (property: BaseProperty) => {
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
    <div className="min-h-screen w-full overflow-x-hidden text-foreground relative bg-background">
      {/* Network Status Indicator */}
      <NetworkStatusIndicator onStatusChange={setIsOnline} />

      {/* Sticky Header Search - appears on scroll */}
      <StickyHeaderSearch 
        onSearch={handleStickySearch}
        initialQuery={quickSearch}
      />

      {/* ASTRA Development Style Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5 pointer-events-none" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
      
      {/* Content Layer with mobile-first responsive backdrop */}
      <div className={cn(
        "relative z-10 min-h-stable md:min-h-screen",
        "safe-area-mobile",
        // Mobile-specific padding
        "px-0 md:px-2",
        "pb-20 md:pb-4" // Extra bottom padding for mobile footer
      )}>
        
        {/* Hero Search Section with Background Image Slider */}
        <section className="relative w-full overflow-hidden" id="hero-section">
          {/* Background Image Slider - Full section background */}
          <SearchPanelBackgroundSlider 
            className="absolute inset-0 z-0"
            interval={6000}
          />
          
          {/* Content overlay - Enhanced mobile responsiveness */}
          <div className={cn(
            "relative z-10 w-full max-w-7xl mx-auto",
            // Mobile: compact padding, tablet/desktop: more generous
            "px-3 py-3 sm:px-4 sm:py-5 md:px-6 md:py-8 lg:px-8"
          )}>
            {/* Enhanced Header - Better mobile scaling */}
            <div className="mb-2 sm:mb-3 md:mb-5 text-center animate-in fade-in-50 slide-in-from-top-3 duration-500">
              {/* AI Badge - Responsive sizing */}
              <div className={cn(
                "inline-flex items-center gap-1 sm:gap-1.5 mb-1 sm:mb-1.5 md:mb-2",
                "px-2 py-0.5 sm:px-2.5 sm:py-0.5 md:px-4 md:py-1.5",
                "bg-white/20 backdrop-blur-md",
                "rounded-full border border-white/30"
              )}>
                <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4 text-white animate-pulse" />
                <span className="text-[8px] sm:text-[10px] md:text-xs font-semibold text-white drop-shadow-md">AI-Powered Search</span>
              </div>
              
              {/* Title - Optimized for mobile readability */}
              <h1 className="text-lg sm:text-xl md:text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight text-white drop-shadow-lg mb-0.5 sm:mb-1 md:mb-2">
                {t.findYour}
              </h1>
              <p className="flex text-[9px] sm:text-[11px] md:text-sm lg:text-base text-white/90 items-center justify-center gap-1 sm:gap-1.5 drop-shadow-md">
                <Search className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4" />
                {t.searchPowered}
              </p>
            </div>
            
            {/* Search Panel Container - Mobile optimized */}
            <div
              className={cn(
                "relative mx-auto w-full max-w-4xl",
                // Premium glassy background with better mobile radius
                "bg-white/10 dark:bg-black/20 backdrop-blur-2xl",
                "rounded-xl sm:rounded-2xl md:rounded-3xl",
                "shadow-xl sm:shadow-2xl shadow-black/20 sm:shadow-black/30",
                "border border-white/20 sm:border-white/30 dark:border-white/10",
                "overflow-hidden",
                "before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/20 before:via-transparent before:to-white/5 before:rounded-xl sm:before:rounded-2xl md:before:rounded-3xl before:pointer-events-none"
              )}
            >
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
              
              {/* Retry Indicator - Mobile friendly positioning */}
              {isRetrying && (
                <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 bg-primary/90 text-primary-foreground px-2 py-1 sm:px-4 sm:py-2 rounded-lg shadow-lg flex items-center gap-1.5 sm:gap-2 animate-in slide-in-from-bottom-2 duration-300">
                  <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                  <span className="text-xs sm:text-sm font-medium">
                    Retrying... ({retryCount}/3)
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Error Message - Compact */}
        {(searchError || lastError) && (
          <section className={cn(isMobile ? "py-0.5" : "py-2")}>
            <div className={cn(
              isMobile ? "max-w-sm px-2" : "max-w-[1800px] px-4",
              "mx-auto"
            )}>
              <div className={cn(
                "apple-glass border border-destructive/40 text-destructive text-center rounded-xl shadow-md",
                isMobile ? "p-2 max-w-xs mx-auto" : "p-3 max-w-xl mx-auto"
              )}>
                <p className={cn(
                  "font-medium",
                  isMobile ? "text-xs" : "text-sm"
                )}>
                  ⚠️ {searchError || lastError?.message}
                </p>
                {retryCount > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Attempted {retryCount} {retryCount === 1 ? 'retry' : 'retries'}
                  </p>
                )}
                <div className="flex gap-2 justify-center mt-2">
                  <button 
                    onClick={() => {
                      setSearchError(null);
                      handleQuickSearch();
                    }}
                    className={cn(
                      "bg-primary hover:bg-primary/90 text-primary-foreground rounded-md transition-colors flex items-center gap-1",
                      isMobile ? "px-2 py-0.5 text-xs" : "px-4 py-1 text-sm"
                    )}
                  >
                    <RefreshCw className="h-3 w-3" />
                    Retry
                  </button>
                  <button 
                    onClick={() => {
                      setSearchError(null);
                      setSearchResults([]);
                      setHasSearched(false);
                    }}
                    className={cn(
                      "bg-muted hover:bg-muted/80 text-foreground rounded-md transition-colors",
                      isMobile ? "px-2 py-0.5 text-xs" : "px-4 py-1 text-sm"
                    )}
                  >
                    {t.clearError}
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Property Display Section - Glass Effect Background */}
        <div className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 md:py-4 space-y-2 sm:space-y-3 md:space-y-4">
          <div className="w-full max-w-7xl mx-auto space-y-2 sm:space-y-3 md:space-y-4">
            {hasSearched ? (
              <section className="bg-background/60 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-md sm:shadow-lg border border-border/40 hover:border-primary/30 transition-all duration-300">
                <div className="p-2 sm:p-3 md:p-4 lg:p-6">
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
                        {t.searchResults}
                      </h2>
                      <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">
                        {isSearching ? t.searching : `${searchResults.length} ${t.propertiesFound}`}
                        {quickSearch && (
                          <span className="ml-1 sm:ml-2 text-primary font-medium">
                            {t.for} "{quickSearch}"
                          </span>
                        )}
                      </p>
                    </div>
                    <Suspense fallback={<div className="animate-pulse h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg" />}>
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
                {/* Featured Ads Carousel - Auto-sliding */}
                <div className="w-full max-w-full mx-auto">
                  <Suspense fallback={
                    <div className="bg-background/50 backdrop-blur-sm rounded-2xl p-6 border border-border/40">
                      <div className="animate-pulse">
                        <div className="h-8 bg-muted/50 rounded w-48 mb-4" />
                        <div className="h-32 bg-muted/50 rounded" />
                      </div>
                    </div>
                  }>
                    <FeaturedAdsCarousel />
                  </Suspense>
                </div>

                {/* AI Recommended Properties - Lazy Loaded */}
                <div className="section-compact mb-3 md:mb-6">
                  <Suspense fallback={
                    <div className="bg-background/50 backdrop-blur-sm rounded-2xl shadow-lg border border-border/40 hover:border-primary/30 transition-all duration-300 p-3 md:p-6">
                      <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-primary to-primary/80 rounded-lg animate-pulse" />
                        <div className="flex-1">
                          <div className="h-5 md:h-6 bg-muted/50 rounded w-32 md:w-48 mb-1.5 md:mb-2 animate-pulse" />
                          <div className="h-3 md:h-4 bg-muted/50 rounded w-48 md:w-64 animate-pulse" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="animate-pulse">
                            <div className="bg-muted/50 h-40 md:h-48 rounded-lg mb-2 border border-border/40" />
                            <div className="bg-muted/50 h-3 md:h-4 rounded w-3/4 mb-1.5 md:mb-2" />
                            <div className="bg-muted/50 h-3 md:h-4 rounded w-1/2" />
                          </div>
                        ))}
                      </div>
                    </div>
                  }>
                    <AIRecommendedProperties onPropertyClick={handlePropertyClick} />
                  </Suspense>
                </div>

                {/* Trending Searches Widget */}
                <div className="section-compact mb-3 md:mb-6">
                  <Suspense fallback={<div className="animate-pulse h-48 md:h-64 bg-muted/50 rounded-lg border border-border/40" />}>
                    <TrendingSearchesWidget 
                      onSearchClick={(trendFilters) => {
                        setFilters(prev => ({ ...prev, ...trendFilters }));
                        setHasSearched(true);
                      }}
                    />
                  </Suspense>
                </div>

                {/* ASTRA Villa Features Section */}
                <div className="w-full max-w-full mx-auto mb-3 md:mb-6">
                  <Suspense fallback={<div className="animate-pulse h-24 md:h-32 bg-muted/50 rounded-lg border border-border/40" />}>
                    <AstraVillaFeatures />
                  </Suspense>
                </div>

                {/* Featured Properties - Modern Auto-Scrolling Carousel */}

                {/* Properties for Sale Section - Compact */}
                <div id="sale-section" className="section-compact">
                  <Suspense fallback={<div className="animate-pulse h-64 bg-muted/50 rounded-lg border border-border/40" />}>
                    <PropertiesForSaleSection language={language} onPropertyClick={handlePropertyClick} />
                  </Suspense>
                </div>

                {/* Properties for Rent Section - Compact */}
                <div id="rent-section" className="section-compact">
                  <Suspense fallback={<div className="animate-pulse h-64 bg-muted/50 rounded-lg border border-border/40" />}>
                    <PropertiesForRentSection language={language} onPropertyClick={handlePropertyClick} />
                  </Suspense>
                </div>

                {/* Marketplace Services Section */}
                <div id="marketplace-services-section" className="section-compact mt-8">
                  <Suspense fallback={<div className="animate-pulse h-64 bg-muted/50 rounded-lg border border-border/40" />}>
                    <MarketplaceServices />
                  </Suspense>
                </div>

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