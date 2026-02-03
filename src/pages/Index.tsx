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
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { SearchErrorBoundary } from "@/components/search/SearchErrorBoundary";
import { SearchPanelSkeleton } from "@/components/search/SearchSkeleton";
import { useRetrySearch } from "@/hooks/useRetrySearch";
import { shareProperty } from "@/utils/shareUtils";
import { CommandPalette } from "@/components/ui/CommandPalette";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { NetworkStatusIndicator } from "@/components/NetworkStatusIndicator";
import { StickyHeaderSearch } from "@/components/search/StickyHeaderSearch";

// New Rumah123-style components
import QuickActionBar from "@/components/home/QuickActionBar";
import LocationShortcuts from "@/components/home/LocationShortcuts";
import CategoryChips from "@/components/home/CategoryChips";

// Lazy load heavy components for better performance
const ResponsiveAIChatWidget = lazy(() => import("@/components/ai/ResponsiveAIChatWidget"));
const PropertyViewModeToggle = lazy(() => import("@/components/search/PropertyViewModeToggle"));
const PropertyListView = lazy(() => import("@/components/search/PropertyListView"));
const PropertyMapView = lazy(() => import("@/components/search/PropertyMapView"));
const PropertyGridView = lazy(() => import("@/components/search/PropertyGridView"));
const ActiveFilterPills = lazy(() => import("@/components/search/ActiveFilterPills").then(m => ({ default: m.ActiveFilterPills })));
const AstraSearchPanel = lazy(() => import("@/components/AstraSearchPanel"));
const SearchLoadingDialog = lazy(() => import("@/components/SearchLoadingDialog").then(m => ({ default: m.SearchLoadingDialog })));
const WhatsAppInquiryDialog = lazy(() => import("@/components/property/WhatsAppInquiryDialog"));
const AIRecommendedProperties = lazy(() => import("@/components/property/AIRecommendedProperties"));
const PropertiesForSaleSection = lazy(() => import("@/components/property/PropertiesForSaleSection"));
const PropertiesForRentSection = lazy(() => import("@/components/property/PropertiesForRentSection"));
const MarketplaceServices = lazy(() => import("@/components/home/MarketplaceServices"));

type ViewMode = 'list' | 'grid' | 'map';

const Index = () => {
  const { language } = useLanguage();
  const copy = {
    en: {
      heroTitle: "Buy, Sell & Rent Property Made Easy",
      heroSubtitle: "Find your dream property with AI-powered search",
      searchResults: "Search Results",
      searching: "Searching...",
      propertiesFound: "properties found",
      for: "for",
      clearError: "Clear Error",
      recommendedTitle: "Recommended For You",
      forSaleTitle: "Properties for Sale",
      forRentTitle: "Properties for Rent",
    },
    id: {
      heroTitle: "Jual Beli dan Sewa Properti Jadi Mudah",
      heroSubtitle: "Temukan properti impian dengan pencarian AI",
      searchResults: "Hasil Pencarian",
      searching: "Mencari...",
      propertiesFound: "properti ditemukan",
      for: "untuk",
      clearError: "Hapus Kesalahan",
      recommendedTitle: "Rekomendasi Sesuai Pencarianmu",
      forSaleTitle: "Properti Dijual",
      forRentTitle: "Properti Disewa",
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
  const [chatOpen, setChatOpen] = useState(false);
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

    if (searchTerm) {
      query = query.or(
        `title.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%,state.ilike.%${searchTerm}%`
      );
    }

    if (searchData?.location && searchData.location !== 'all') {
      const safeLoc = sanitize(searchData.location);
      if (safeLoc) {
        query = query.or(`location.ilike.%${safeLoc}%,city.ilike.%${safeLoc}%,state.ilike.%${safeLoc}%`);
      }
    }

    if (searchData?.propertyType && searchData.propertyType !== 'all') {
      query = query.eq('property_type', searchData.propertyType);
    }

    if (searchData?.listingType && searchData.listingType !== 'all' && searchData.listingType !== '') {
      query = query.eq('listing_type', searchData.listingType);
    }

    if (searchData?.priceRange && searchData.priceRange !== 'all') {
      const priceRangeStr = searchData.priceRange.toString();
      const [min, max] = priceRangeStr.split('-');
      if (priceRangeStr.includes('+')) {
        query = query.gte('price', parseInt(min));
      } else if (min && max) {
        query = query.gte('price', parseInt(min)).lte('price', parseInt(max));
      }
    }

    if (searchData?.bedrooms && searchData.bedrooms !== 'all' && searchData.bedrooms !== '') {
      const bedroomsStr = searchData.bedrooms.toString();
      if (bedroomsStr.includes('+')) {
        query = query.gte('bedrooms', parseInt(bedroomsStr));
      } else {
        query = query.eq('bedrooms', parseInt(bedroomsStr));
      }
    }

    if (searchData?.bathrooms && searchData.bathrooms !== 'all' && searchData.bathrooms !== '') {
      const bathroomsStr = searchData.bathrooms.toString();
      if (bathroomsStr.includes('+')) {
        query = query.gte('bathrooms', parseInt(bathroomsStr));
      } else {
        query = query.eq('bathrooms', parseInt(bathroomsStr));
      }
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Search error:', error);
      throw new Error(error.message || 'Search failed');
    }

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

  const location = useLocation();
  const { scrollToSavedSection } = useScrollToSection();
  
  useEffect(() => {
    scrollToSavedSection();
  }, [location]);

  const [showShortcutsPanel, setShowShortcutsPanel] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

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
        }
      }
    ],
    enabled: true
  });

  const searchCacheKey = useMemo(() => {
    return ['search-results', quickSearch, filters, JSON.stringify(filters)];
  }, [quickSearch, filters]);

  const { data: cachedSearchResults, isFetching: isSearchFetching } = useQuery({
    queryKey: searchCacheKey,
    queryFn: () => performSearch(filters),
    enabled: false,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
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

  const handleStickySearch = (query: string) => {
    setQuickSearch(query);
    handleQuickSearch({ searchQuery: query });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-background">
      {/* Network Status Indicator */}
      <NetworkStatusIndicator onStatusChange={setIsOnline} />

      {/* Sticky Header Search - appears on scroll */}
      <StickyHeaderSearch 
        onSearch={handleStickySearch}
        initialQuery={quickSearch}
      />

      {/* ===== HERO SECTION - Rumah123 Style ===== */}
      <section className="relative w-full bg-primary">
        {/* Hero Background - Blue gradient like Rumah123 */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-blue-700" />
        
        {/* Optional decorative pattern */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />

        <div className="relative z-10 w-full max-w-5xl mx-auto px-3 sm:px-4 pt-8 sm:pt-12 md:pt-16 pb-6 sm:pb-8">
          {/* Hero Title */}
          <div className="text-center mb-4 sm:mb-6">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-1 sm:mb-2">
              {t.heroTitle}
            </h1>
            <p className="text-sm sm:text-base text-white/80">
              {t.heroSubtitle}
            </p>
          </div>

          {/* Search Panel - Glassmorphic Card */}
          <div className="bg-card/95 backdrop-blur-md rounded-xl sm:rounded-2xl shadow-2xl border border-border/30 p-3 sm:p-4 md:p-5">
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
        </div>
      </section>

      {/* ===== QUICK ACTION BAR - Rumah123 Style ===== */}
      <section className="w-full bg-background border-b border-border/40 py-3 sm:py-4">
        <div className="max-w-7xl mx-auto px-3 sm:px-4">
          <QuickActionBar language={language} />
        </div>
      </section>

      {/* ===== ERROR MESSAGE ===== */}
      {(searchError || lastError) && (
        <section className="py-3 sm:py-4 bg-destructive/5">
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
                  className="h-7 px-3 text-xs"
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

      {/* ===== MAIN CONTENT ===== */}
      <main className="w-full">
        {hasSearched ? (
          /* ===== SEARCH RESULTS ===== */
          <section className="py-4 sm:py-6">
            <div className="max-w-7xl mx-auto px-3 sm:px-4">
              <div className="bg-card rounded-xl shadow-sm border border-border p-3 sm:p-4 md:p-6">
                {/* Active Filter Pills */}
                <Suspense fallback={null}>
                  <ActiveFilterPills
                    filters={filters}
                    onRemoveFilter={handleRemoveFilter}
                    onClearAll={handleClearFilters}
                  />
                </Suspense>
                
                <div className="flex items-center justify-between mb-3 sm:mb-4 mt-2">
                  <div>
                    <h2 className="text-base sm:text-lg md:text-xl font-bold text-foreground">
                      {t.searchResults}
                    </h2>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {isSearching ? t.searching : `${searchResults.length} ${t.propertiesFound}`}
                      {quickSearch && (
                        <span className="ml-1 text-primary font-medium">
                          {t.for} "{quickSearch}"
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="animate-pulse bg-muted/50 rounded-xl h-52 sm:h-60 border border-border/40" 
                        style={{ animationDelay: `${i * 100}ms` }} 
                      />
                    ))}
                  </div>
                )}
                
                {viewMode === 'grid' && !isSearching && (
                  <Suspense fallback={<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{[...Array(6)].map((_, i) => <div key={i} className="animate-pulse bg-muted/50 h-64 rounded-lg" />)}</div>}>
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
                        if (success) toast.success("Property link shared!");
                      }}
                      onContact={(property) => {
                        setSelectedProperty(property);
                        setWhatsappDialogOpen(true);
                      }}
                    />
                  </Suspense>
                )}

                {viewMode === 'list' && !isSearching && (
                  <Suspense fallback={<div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="animate-pulse bg-muted/50 h-32 rounded-lg" />)}</div>}>
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
                        if (success) toast.success("Property link shared!");
                      }}
                      onContact={(property) => {
                        setSelectedProperty(property);
                        setWhatsappDialogOpen(true);
                      }}
                    />
                  </Suspense>
                )}

                {viewMode === 'map' && !isSearching && (
                  <Suspense fallback={<div className="animate-pulse h-96 bg-muted/50 rounded-lg" />}>
                    <PropertyMapView
                      properties={searchResults}
                      onPropertyClick={handlePropertyClick}
                    />
                  </Suspense>
                )}
              </div>
            </div>
          </section>
        ) : (
          /* ===== HOME CONTENT SECTIONS ===== */
          <>
            {/* Category Chips */}
            <section className="py-4 sm:py-6 bg-muted/30">
              <div className="max-w-7xl mx-auto px-3 sm:px-4">
                <CategoryChips language={language} />
              </div>
            </section>

            {/* Location Shortcuts */}
            <LocationShortcuts language={language} />

            {/* AI Recommended Properties */}
            <section className="py-4 sm:py-6">
              <div className="max-w-7xl mx-auto px-3 sm:px-4">
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
            </section>

            {/* Properties for Sale */}
            <section id="sale-section" className="py-4 sm:py-6 bg-muted/20">
              <div className="max-w-7xl mx-auto px-3 sm:px-4">
                <Suspense fallback={<div className="animate-pulse h-56 bg-muted rounded-xl" />}>
                  <PropertiesForSaleSection language={language} onPropertyClick={handlePropertyClick} />
                </Suspense>
              </div>
            </section>

            {/* Properties for Rent */}
            <section id="rent-section" className="py-4 sm:py-6">
              <div className="max-w-7xl mx-auto px-3 sm:px-4">
                <Suspense fallback={<div className="animate-pulse h-56 bg-muted rounded-xl" />}>
                  <PropertiesForRentSection language={language} onPropertyClick={handlePropertyClick} />
                </Suspense>
              </div>
            </section>

            {/* Marketplace Services */}
            <section id="marketplace-services-section" className="py-6 sm:py-8 bg-muted/30">
              <div className="max-w-7xl mx-auto px-3 sm:px-4">
                <Suspense fallback={<div className="animate-pulse h-56 bg-muted rounded-xl" />}>
                  <MarketplaceServices />
                </Suspense>
              </div>
            </section>
          </>
        )}
      </main>

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
        onOpenImageSearch={() => imageInputRef.current?.click()}
      />

      {/* WhatsApp Dialog */}
      <Suspense fallback={null}>
        <WhatsAppInquiryDialog
          open={whatsappDialogOpen}
          onOpenChange={setWhatsappDialogOpen}
          property={selectedProperty}
        />
      </Suspense>

      {/* AI Chat Widget */}
      <Suspense fallback={null}>
        <ResponsiveAIChatWidget />
      </Suspense>
    </div>
  );
};

export default Index;
