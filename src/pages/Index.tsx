import { useState, useEffect, lazy, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { logSearchError } from "@/utils/errorLogger";

import ScrollToTopButton from "@/components/ui/ScrollToTopButton";
import { supabase } from "@/integrations/supabase/client";
import { BaseProperty } from "@/types/property";
import { PropertyFilters } from "@/components/search/AdvancedPropertyFilters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import HomeIntroSlider from "@/components/home/HomeIntroSlider";
import { shareProperty } from "@/utils/shareUtils";

// Lazy load heavy components for better performance
const ResponsiveAIChatWidget = lazy(() => import("@/components/ai/ResponsiveAIChatWidget"));
const PropertyViewModeToggle = lazy(() => import("@/components/search/PropertyViewModeToggle"));
const PropertyListView = lazy(() => import("@/components/search/PropertyListView"));
const PropertyMapView = lazy(() => import("@/components/search/PropertyMapView"));
const PropertyGridView = lazy(() => import("@/components/search/PropertyGridView"));
const AdvancedPropertyFilters = lazy(() => import("@/components/search/AdvancedPropertyFilters"));
const PropertySlideSection = lazy(() => import("@/components/property/PropertySlideSection"));
const PropertiesForSaleSection = lazy(() => import("@/components/property/PropertiesForSaleSection"));
const PropertiesForRentSection = lazy(() => import("@/components/property/PropertiesForRentSection"));
const IPhoneSearchPanel = lazy(() => import("@/components/iPhoneSearchPanel"));
const SearchLoadingDialog = lazy(() => import("@/components/SearchLoadingDialog").then(m => ({ default: m.SearchLoadingDialog })));
const WhatsAppInquiryDialog = lazy(() => import("@/components/property/WhatsAppInquiryDialog"));
const AstraVillaFeatures = lazy(() => import("@/components/home/AstraVillaFeatures"));
const AIRecommendedProperties = lazy(() => import("@/components/property/AIRecommendedProperties"));
const FeaturedAdsCarousel = lazy(() => import("@/components/home/FeaturedAdsCarousel"));

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
  const [filtersOpen, setFiltersOpen] = useState(false);
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

  // Note: Removed hardcoded admin email check for security
  // Users are redirected based on their role stored in the user_roles table

  const backgroundStyle = {
    backgroundImage: `url('https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1920&q=80')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundAttachment: isMobile ? 'scroll' : 'fixed',
  };

  // Simplified featured properties query with better caching
  const { data: featuredProperties = [], isLoading: isFeaturedLoading } = useQuery({
    queryKey: ['featured-properties-simple'],
    queryFn: async () => {
      console.log('Fetching featured properties...');
      
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('id, title, property_type, listing_type, price, location, bedrooms, bathrooms, area_sqm, images, thumbnail_url, state, city, development_status, description, three_d_model_url, virtual_tour_url')
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
        const transformedData = data?.map(property => ({
          ...property,
          listing_type: property.listing_type as "sale" | "rent" | "lease",
          image_urls: property.images || []
        })) || [];
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

  const handleQuickSearch = async (searchData?: any) => {
    const rawTerm = searchData?.searchQuery ?? quickSearch ?? '';
    const sanitize = (s: string) =>
      String(s)
        .replace(/[(),;]/g, ' ') // prevent PostgREST or() parsing issues
        .replace(/%/g, '') // avoid wildcard injection
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 100);
    const searchTerm = sanitize(rawTerm);

    // Check if we have active filters
    const hasFilters = !!searchData && (
      (searchData.location && searchData.location !== 'all') ||
      (searchData.propertyType && searchData.propertyType !== 'all') ||
      (searchData.listingType && searchData.listingType !== 'all') ||
      (searchData.priceRange && searchData.priceRange !== 'all') ||
      (searchData.bedrooms && searchData.bedrooms !== 'all') ||
      (searchData.bathrooms && searchData.bathrooms !== 'all')
    );

    // Empty search term means show all results (no early return)

    console.log('Quick search initiated:', searchTerm, 'with filters:', searchData);
    console.log('Active filters:', {
      location: searchData?.location !== 'all' ? searchData?.location : null,
      propertyType: searchData?.propertyType !== 'all' ? searchData?.propertyType : null,
      listingType: searchData?.listingType !== 'all' ? searchData?.listingType : null
    });

    setIsSearching(true);
    setHasSearched(true);
    setSearchError(null);

    try {
      let query = supabase
        .from('properties')
        .select('id, title, property_type, listing_type, price, location, bedrooms, bathrooms, area_sqm, images, thumbnail_url, state, city, description, three_d_model_url, virtual_tour_url')
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
        console.log('Applying property type filter:', searchData.propertyType);
        query = query.eq('property_type', searchData.propertyType);
      }

      // Apply listing type filter
      if (searchData?.listingType && searchData.listingType !== 'all' && searchData.listingType !== '') {
        console.log('Applying listing type filter:', searchData.listingType);
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

      // Handle nearby search (requires lat/lng columns in properties table)
      if (searchData?.nearbySearch && searchData?.userLocation) {
        console.warn('Nearby search requested but properties table lacks latitude/longitude columns');
        // TODO: Add latitude, longitude columns to properties table for distance-based search
        // For now, show message to user
        setSearchError('Nearby search requires property GPS coordinates. Showing all results instead.');
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('❌ Search error:', error);
        toast.error('Search failed. Please try again.');
        setSearchError(error.message || 'Search failed. Please try again.');
        setSearchResults([]);
        
        // Log error to admin panel
        await logSearchError(error, searchData);
      } else {
        console.log('✅ Search results:', data?.length || 0);
        // Transform data to match BaseProperty interface
        const transformedResults = data?.map(property => ({
          ...property,
          listing_type: property.listing_type as "sale" | "rent" | "lease",
          image_urls: property.images || []
        })) || [];
        setSearchResults(transformedResults);
        setSearchError(null);
        
        if (transformedResults.length === 0) {
          toast.info('No properties found matching your criteria');
        } else {
          toast.success(`Found ${transformedResults.length} properties`);
        }
      }
    } catch (error) {
      console.error('❌ Search error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Search failed. Please check your connection and try again.';
      toast.error(errorMessage);
      setSearchError(errorMessage);
      setSearchResults([]);
      
      // Log error to admin panel
      await logSearchError(error, searchData);
    } finally {
      setIsSearching(false);
    }
  };

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

  // Mobile-first responsive layout wrapper
  const content = (
    <div className="min-h-screen w-full overflow-x-hidden text-foreground relative container-responsive"
    >
      {/* Background Wallpaper Layer */}
      	<div 
      	  className={cn(isMobile ? "absolute" : "fixed", "inset-0 z-0 opacity-30 dark:opacity-20 pointer-events-none")}
      	  style={backgroundStyle}
      	/>
      
      {/* Content Layer with mobile-first responsive backdrop */}
      <div className="relative z-10 min-h-stable md:min-h-screen bg-white/90 dark:bg-black/90 backdrop-blur-sm safe-area-mobile px-0 md:px-2">
        
        
        {/* Hero Intro Slider Section with Integrated Search - Mobile optimized */}
        <section className="relative w-full pt-2 md:pt-0">
          <HomeIntroSlider language={language} className="h-[50vh] sm:h-[225px] md:h-[250px] lg:h-[275px]">
            {/* Search Panel - No Background */}
            <div className="p-1 md:p-3 w-full px-0 md:px-3">
              <div className="mb-1.5 md:mb-2 text-center">
                <h2 className="text-sm md:text-xl font-bold text-foreground mb-0.5 md:mb-1">
                  {t.findYour}
                </h2>
                <p className="text-[10px] md:text-sm text-muted-foreground">
                  🔍 {t.searchPowered}
                </p>
              </div>
              
              <Suspense fallback={<div className="animate-pulse h-32 bg-gray-200 dark:bg-gray-700 rounded-lg" />}>
                <IPhoneSearchPanel
                  language={language}
                  onSearch={(searchData) => {
                    setQuickSearch(searchData.searchQuery || "");
                    handleQuickSearch(searchData);
                  }}
                  onLiveSearch={(searchTerm) => setQuickSearch(searchTerm)}
                  resultsCount={hasSearched ? searchResults.length : undefined}
                />
              </Suspense>
              
              {/* Advanced Filters - Compact inline */}
              <div className="mt-2 flex justify-end">
                <Suspense fallback={<div className="animate-pulse h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded-lg" />}>
                  <AdvancedPropertyFilters
                    filters={filters}
                    onFiltersChange={handleFiltersChange}
                    onClearFilters={handleClearFilters}
                    isOpen={filtersOpen}
                    onToggle={() => setFiltersOpen(!filtersOpen)}
                  />
                </Suspense>
              </div>
            </div>
          </HomeIntroSlider>
        </section>

        {/* Error Message - Compact */}
        {searchError && (
          <section className={cn(isMobile ? "py-1" : "py-2")}>
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
                )}>⚠️ {searchError}</p>
                <button 
                  onClick={() => {
                    setSearchError(null);
                    setSearchResults([]);
                    setHasSearched(false);
                  }}
                  className={cn(
                    "bg-red-100 hover:bg-red-200 text-red-700 rounded-md transition-colors",
                    isMobile ? "mt-1 px-2 py-0.5 text-xs" : "mt-2 px-4 py-1 text-sm"
                  )}
                >
                  {t.clearError}
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Property Display Section - Space Optimized */}
        <div className="px-2 py-4 space-y-4">
          <div className="w-full max-w-full mx-auto space-y-4">
            {hasSearched ? (
              <section className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-lg border-0">
                <div className="p-3 md:p-4 lg:p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-300 dark:to-purple-300 bg-clip-text text-transparent">
                        {t.searchResults}
                      </h2>
                      <p className="text-muted-foreground">
                        {isSearching ? t.searching : `${searchResults.length} ${t.propertiesFound}`}
                        {quickSearch && (
                          <span className="ml-2 text-primary font-medium">
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
                  
                  {viewMode === 'grid' && (
                    <Suspense fallback={<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{[...Array(6)].map((_, i) => <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 h-64 rounded-lg" />)}</div>}>
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

                  {viewMode === 'list' && (
                    <Suspense fallback={<div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 h-32 rounded-lg" />)}</div>}>
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

                  {viewMode === 'map' && (
                    <Suspense fallback={<div className="animate-pulse h-96 bg-gray-200 dark:bg-gray-700 rounded-lg" />}>
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
                <div className="w-full max-w-full mx-auto px-2 py-2">
                  <Suspense fallback={
                    <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 dark:from-blue-900/20 dark:to-purple-900/20 backdrop-blur-sm rounded-2xl p-6 mb-6">
                      <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4" />
                        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded" />
                      </div>
                    </div>
                  }>
                    <FeaturedAdsCarousel />
                  </Suspense>
                </div>

                {/* AI Recommended Properties - Lazy Loaded */}
                <div className="section-compact mb-6">
                  <Suspense fallback={
                    <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/20 p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg animate-pulse" />
                        <div className="flex-1">
                          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2 animate-pulse" />
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64 animate-pulse" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="animate-pulse">
                            <div className="bg-gray-200 dark:bg-gray-700 h-48 rounded-lg mb-2" />
                            <div className="bg-gray-200 dark:bg-gray-700 h-4 rounded w-3/4 mb-2" />
                            <div className="bg-gray-200 dark:bg-gray-700 h-4 rounded w-1/2" />
                          </div>
                        ))}
                      </div>
                    </div>
                  }>
                    <AIRecommendedProperties onPropertyClick={handlePropertyClick} />
                  </Suspense>
                </div>

                {/* ASTRA Villa Features Section */}
                <div className="section-compact mb-6">
                  <Suspense fallback={<div className="animate-pulse h-40 bg-gray-200 dark:bg-gray-700 rounded-lg" />}>
                    <AstraVillaFeatures />
                  </Suspense>
                </div>

                {/* Featured Properties - Zero-waste Compact Layout */}
                <section className={cn(
                  "bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-lg border-0",
                  isMobile ? "p-3" : "p-4 lg:p-6"
                )}>
                  <div className={cn(
                    "text-center no-space-waste",
                    isMobile ? "mb-3" : "mb-4"
                  )}>
                    <h2 className={cn(
                      "font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-300 dark:to-purple-300 bg-clip-text text-transparent",
                      isMobile ? "text-lg mb-1" : "text-xl lg:text-2xl mb-2"
                    )}>
                      {t.featuredProperties}
                    </h2>
                    <p className={cn(
                      "text-gray-600 dark:text-gray-300",
                      isMobile ? "text-xs" : "text-sm lg:text-base"
                    )}>
                      {t.premiumProperties}
                    </p>
                  </div>
                  
                  <div className="container-compact">
                    <Suspense fallback={<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{[...Array(6)].map((_, i) => <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 h-64 rounded-lg" />)}</div>}>
                      <PropertyGridView
                        properties={featuredProperties}
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
                  </div>
                </section>

                {/* Properties for Sale Section - Compact */}
                <div className="section-compact">
                  <Suspense fallback={<div className="animate-pulse h-64 bg-gray-200 dark:bg-gray-700 rounded-lg" />}>
                    <PropertiesForSaleSection language={language} onPropertyClick={handlePropertyClick} />
                  </Suspense>
                </div>

                {/* Properties for Rent Section - Compact */}
                <div className="section-compact">
                  <Suspense fallback={<div className="animate-pulse h-64 bg-gray-200 dark:bg-gray-700 rounded-lg" />}>
                    <PropertiesForRentSection language={language} onPropertyClick={handlePropertyClick} />
                  </Suspense>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Scroll to Top Button */}
        <ScrollToTopButton />

        
        {/* AI Search Loading Dialog */}
        <Suspense fallback={null}>
          <SearchLoadingDialog 
            open={isSearching}
          onOpenChange={setIsSearching}
          searchQuery={quickSearch}
        />
        </Suspense>
        
        {/* Customer AI Chat Widget - Fixed position on right */}
        <Suspense fallback={null}>
          <ResponsiveAIChatWidget />
        </Suspense>
        
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