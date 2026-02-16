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
import { Search, Camera, MessageSquare, ArrowUp, Sparkles, RefreshCw, Star } from "lucide-react";
import modernVillaCommunityBlue from "@/assets/modern-villa-community-blue.jpg";
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
const InvestorPathSelector = lazy(() => import("@/components/home/InvestorPathSelector"));
const PropertySlideshow = lazy(() => import("@/components/PropertySlideshow"));


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

      {/* Content Layer - full width edge-to-edge */}
      <div className="relative z-10 min-h-screen pb-20 md:pb-4">
        
          {/* Hero Search Section - Modern Clean Design */}
        <section className="relative w-full min-h-[380px] sm:min-h-[440px] md:min-h-[500px] lg:h-screen lg:min-h-[580px]" id="hero-section">
            {/* Sky Blue Gradient Background */}
          <div className="absolute inset-0 z-0">
            {/* Light mode: vibrant sky blue gradient / Dark mode: deep ocean gradient */}
            <div className="w-full h-full bg-gradient-to-b from-[hsl(200,100%,55%)] via-[hsl(195,95%,60%)] to-[hsl(200,100%,70%)] dark:from-[hsl(210,55%,12%)] dark:via-[hsl(200,50%,18%)] dark:to-[hsl(210,55%,10%)]" />
            {/* Decorative wave shapes */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
            {/* Subtle cloud-like overlay */}
            <div className="absolute inset-0 opacity-20 dark:opacity-10" style={{ backgroundImage: 'radial-gradient(ellipse at 20% 50%, white 0%, transparent 50%), radial-gradient(ellipse at 80% 30%, white 0%, transparent 50%)' }} />
            {/* Dark mode accent glow */}
            <div className="hidden dark:block absolute inset-0 opacity-15" style={{ backgroundImage: 'radial-gradient(ellipse at 50% 60%, hsl(200,100%,50%) 0%, transparent 60%)' }} />
            {/* Sparkle/star decorations */}
            <div className="absolute top-[15%] left-[10%] w-2 h-2 bg-white rounded-full animate-pulse opacity-60 dark:opacity-30" />
            <div className="absolute top-[25%] right-[15%] w-1.5 h-1.5 bg-white rounded-full animate-pulse opacity-40 dark:opacity-20" style={{ animationDelay: '0.5s' }} />
            <div className="absolute top-[10%] right-[30%] w-1 h-1 bg-white rounded-full animate-pulse opacity-50 dark:opacity-25" style={{ animationDelay: '1s' }} />
          </div>
          
          {/* Content */}
          <div className={cn(
            "relative z-10 w-full h-full flex flex-col items-center",
            "pt-12 sm:pt-20 md:pt-28 lg:pt-36",
            "px-3 pb-4 sm:px-4 sm:pb-6 md:px-6 md:pb-8"
          )}>
            {/* Simplified Header */}
            <div className="mb-3 sm:mb-4 md:mb-6 text-center animate-in fade-in-50 duration-500">
              {/* AI Badge - Using Design Tokens */}
              <div className={cn(
                "inline-flex items-center gap-1.5 mb-2 sm:mb-3",
                "px-3 py-1 sm:px-4 sm:py-1.5",
                "bg-[hsl(48,100%,52%)] dark:bg-[hsl(48,100%,50%)]/90 backdrop-blur-md",
                "rounded-full border border-[hsl(48,100%,60%)]/40 dark:border-[hsl(48,100%,55%)]/30",
                "shadow-lg shadow-[hsl(48,100%,52%)]/30 dark:shadow-[hsl(48,100%,50%)]/20"
              )}>
                <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-[hsl(210,60%,12%)]" />
                <span className="text-[10px] sm:text-xs font-bold text-[hsl(210,60%,12%)] uppercase tracking-wide">
                  AI-Powered Search
                </span>
              </div>
              
              {/* Title - Bold Typography */}
              <h1 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-extrabold leading-tight mb-1 sm:mb-2">
                <span className="text-white drop-shadow-lg">
                  {t.findYour}
                </span>
              </h1>
              <p className="flex text-xs sm:text-sm md:text-base text-white/90 items-center justify-center gap-1.5 font-medium">
                <Search className="h-3 w-3 sm:h-4 sm:w-4" />
                {t.searchPowered}
              </p>
            </div>
            
            {/* Search Panel */}
            <div className="w-full max-w-5xl mx-auto">
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
              
              {/* Retry Indicator */}
              {isRetrying && (
                <div className="absolute bottom-2 right-2 bg-primary text-primary-foreground px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-bottom-2">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span className="text-xs font-medium">Retrying... ({retryCount}/3)</span>
                </div>
              )}
            </div>

            {/* Featured Properties Slideshow */}
            <div className="w-full max-w-[2400px] mx-auto mt-4 md:mt-8">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Star className="h-3 w-3 md:h-4 md:w-4 text-[hsl(48,100%,52%)] fill-[hsl(48,100%,52%)]/50" />
                <h2 className="text-xs md:text-sm font-semibold text-white/90">
                  {t.featuredProperties}
                </h2>
                <Star className="h-3 w-3 md:h-4 md:w-4 text-[hsl(48,100%,52%)] fill-[hsl(48,100%,52%)]/50" />
              </div>
              <Suspense fallback={
                <div className="flex gap-2 px-3 overflow-hidden justify-center">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex-shrink-0 w-[130px] md:w-[160px] animate-pulse">
                      <div className="h-16 md:h-24 bg-white/10 rounded-lg mb-1" />
                      <div className="h-2 bg-white/10 rounded w-3/4" />
                    </div>
                  ))}
                </div>
              }>
                <PropertySlideshow />
              </Suspense>
            </div>
          </div>

          {/* Scroll indicator - desktop only */}
          <div className="hidden lg:flex absolute bottom-4 left-1/2 -translate-x-1/2 z-20 animate-bounce">
            <div className="w-5 h-8 rounded-full border-2 border-white/30 flex items-start justify-center p-1">
              <div className="w-1 h-2 bg-white/50 rounded-full" />
            </div>
          </div>
        </section>

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
                    {t.clearError}
                  </Button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* AI Tools & Features */}
        <div className="px-3 sm:px-4 pt-4 sm:pt-6">
          <div className="w-full max-w-7xl mx-auto">
            <Suspense fallback={
              <div className="flex gap-2 justify-center py-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex-shrink-0 w-14 md:w-18 animate-pulse">
                    <div className="h-10 md:h-14 bg-muted rounded-lg mb-1" />
                    <div className="h-2 bg-muted rounded w-full" />
                  </div>
                ))}
              </div>
            }>
              <AstraVillaFeatures />
            </Suspense>
          </div>
        </div>

        {/* Global Investment Platform */}
        <div className="px-3 sm:px-4 pt-3 sm:pt-4">
          <div className="w-full max-w-7xl mx-auto">
            <Suspense fallback={
              <div className="flex gap-3 justify-center py-3">
                <div className="animate-pulse h-16 w-36 bg-muted rounded-lg" />
                <div className="animate-pulse h-16 w-36 bg-muted rounded-lg" />
                <div className="animate-pulse h-16 w-36 bg-muted rounded-lg" />
              </div>
            }>
              <InvestorPathSelector />
            </Suspense>
          </div>
        </div>

        {/* Property Display Section */}
        <div className="px-3 sm:px-4 py-4 sm:py-6 space-y-4">
          <div className="w-full max-w-7xl mx-auto space-y-4">
            {hasSearched ? (
              <section className="bg-card/80 backdrop-blur-sm rounded-xl shadow-md border border-border">
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
                {/* AI Recommended Properties */}
                <div className="mb-4">
                  <Suspense fallback={
                    <div className="bg-card rounded-xl shadow-sm border border-border p-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-primary/20 rounded-lg animate-pulse" />
                        <div className="flex-1">
                          <div className="h-5 bg-muted rounded w-40 mb-2 animate-pulse" />
                          <div className="h-3 bg-muted rounded w-56 animate-pulse" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="animate-pulse">
                            <div className="bg-muted h-44 rounded-lg mb-2" />
                            <div className="bg-muted h-4 rounded w-3/4 mb-1.5" />
                            <div className="bg-muted h-3 rounded w-1/2" />
                          </div>
                        ))}
                      </div>
                    </div>
                  }>
                    <AIRecommendedProperties onPropertyClick={handlePropertyClick} />
                  </Suspense>
                </div>

                {/* Trending Searches */}
                <div className="mb-4">
                  <Suspense fallback={<div className="animate-pulse h-48 bg-muted rounded-xl" />}>
                    <TrendingSearchesWidget 
                      onSearchClick={(trendFilters) => {
                        setFilters(prev => ({ ...prev, ...trendFilters }));
                        setHasSearched(true);
                      }}
                    />
                  </Suspense>
                </div>

                {/* Properties for Sale */}
                <div id="sale-section" className="mb-4">
                  <Suspense fallback={<div className="animate-pulse h-56 bg-muted rounded-xl" />}>
                    <PropertiesForSaleSection language={language} onPropertyClick={handlePropertyClick} />
                  </Suspense>
                </div>

                {/* Properties for Rent */}
                <div id="rent-section" className="mb-4">
                  <Suspense fallback={<div className="animate-pulse h-56 bg-muted rounded-xl" />}>
                    <PropertiesForRentSection language={language} onPropertyClick={handlePropertyClick} />
                  </Suspense>
                </div>

                {/* Marketplace Services */}
                <div id="marketplace-services-section" className="mt-6">
                  <Suspense fallback={<div className="animate-pulse h-56 bg-muted rounded-xl" />}>
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