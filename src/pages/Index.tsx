import { useState, useEffect, lazy, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import ResponsiveAIChatWidget from "@/components/ai/ResponsiveAIChatWidget";
import ScrollToTopButton from "@/components/ui/ScrollToTopButton";
import { supabase } from "@/integrations/supabase/client";
import PropertyViewModeToggle from "@/components/search/PropertyViewModeToggle";
import PropertyListView from "@/components/search/PropertyListView";
import PropertyMapView from "@/components/search/PropertyMapView";
import PropertyGridView from "@/components/search/PropertyGridView";
import AdvancedPropertyFilters, { PropertyFilters } from "@/components/search/AdvancedPropertyFilters";
import { BaseProperty } from "@/types/property";
import PropertySlideSection from "@/components/property/PropertySlideSection";
import PropertiesForSaleSection from "@/components/property/PropertiesForSaleSection";
import PropertiesForRentSection from "@/components/property/PropertiesForRentSection";
import IPhoneSearchPanel from "@/components/iPhoneSearchPanel";
import { SearchLoadingDialog } from "@/components/SearchLoadingDialog";
import WhatsAppInquiryDialog from "@/components/property/WhatsAppInquiryDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import HomeIntroSlider from "@/components/home/HomeIntroSlider";
import AstraVillaFeatures from "@/components/home/AstraVillaFeatures";
import { shareProperty } from "@/utils/shareUtils";

// Lazy load AI Recommendations for better performance
const AIRecommendedProperties = lazy(() => import("@/components/property/AIRecommendedProperties"));

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

  // Redirect authenticated users to their dashboard (only on initial load, not on navigation)
  // TEMPORARILY DISABLED - Redirect logic commented out to debug 404 issue
  // useEffect(() => {
  //   if (!loading && user && profile && !window.location.search.includes('stay')) {
  //     // Only redirect on initial app load, not when user navigates to home
  //     const hasVisitedBefore = sessionStorage.getItem('hasVisitedHome');
  //     const isDirectNavigation = window.location.search.includes('from=admin') || document.referrer.includes('/admin');
      
  //     if (!hasVisitedBefore && !isDirectNavigation) {
  //       // Redirect customer service users to dashboard
  //       if (profile.role === 'customer_service') {
  //         navigate('/dashboard');
  //         return;
  //       }
  //       // Redirect admin users to admin panel  
  //       else if (profile.role === 'admin' || user.email === 'mycode103@gmail.com') {
  //         navigate('/admin');
  //         return;
  //       }
  //     }
      
  //     // Mark that user has visited home page
  //     sessionStorage.setItem('hasVisitedHome', 'true');
  //   }
  // }, [user, profile, loading, navigate]);

  // Background wallpaper - optimized for performance
  const backgroundStyle = {
    backgroundImage: `url('https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1920&q=80')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundAttachment: 'fixed',
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
          .limit(6);

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
    const searchTerm = searchData?.searchQuery || quickSearch;
    
    // Check if we have active filters
    const hasFilters = searchData && (
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

      // Apply text search if present
      if (searchTerm?.trim()) {
        query = query.or(`title.ilike.%${searchTerm.trim()}%,location.ilike.%${searchTerm.trim()}%,city.ilike.%${searchTerm.trim()}%,state.ilike.%${searchTerm.trim()}%`);
      }

      // Apply location filter if present
      if (searchData?.location && searchData.location !== 'all') {
        query = query.or(`location.ilike.%${searchData.location}%,city.ilike.%${searchData.location}%,state.ilike.%${searchData.location}%`);
      }

      // Apply property type filter
      if (searchData?.propertyType && searchData.propertyType !== 'all') {
        console.log('Applying property type filter:', searchData.propertyType);
        query = query.eq('property_type', searchData.propertyType);
      }

      // Apply listing type filter
      if (searchData?.listingType && searchData.listingType !== 'all') {
        console.log('Applying listing type filter:', searchData.listingType);
        query = query.eq('listing_type', searchData.listingType);
      }

      // Apply price range filter
      if (searchData?.priceRange && searchData.priceRange !== 'all') {
        const [min, max] = searchData.priceRange.split('-');
        if (searchData.priceRange.includes('+')) {
          query = query.gte('price', parseInt(min));
        } else {
          query = query.gte('price', parseInt(min)).lte('price', parseInt(max));
        }
      }

      // Apply bedroom filter
      if (searchData?.bedrooms && searchData.bedrooms !== 'all') {
        if (searchData.bedrooms.includes('+')) {
          query = query.gte('bedrooms', parseInt(searchData.bedrooms));
        } else {
          query = query.eq('bedrooms', parseInt(searchData.bedrooms));
        }
      }

      // Apply bathroom filter
      if (searchData?.bathrooms && searchData.bathrooms !== 'all') {
        if (searchData.bathrooms.includes('+')) {
          query = query.gte('bathrooms', parseInt(searchData.bathrooms));
        } else {
          query = query.eq('bathrooms', parseInt(searchData.bathrooms));
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
        console.error('Search error:', error);
        setSearchError('Search failed. Please try again.');
        setSearchResults([]);
      } else {
        console.log('Search results:', data?.length || 0);
        // Transform data to match BaseProperty interface
        const transformedResults = data?.map(property => ({
          ...property,
          listing_type: property.listing_type as "sale" | "rent" | "lease",
          image_urls: property.images || []
        })) || [];
        setSearchResults(transformedResults);
        setSearchError(null);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchError('Search failed. Please check your connection and try again.');
      setSearchResults([]);
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
        className="fixed inset-0 z-0 opacity-30 dark:opacity-20"
        style={backgroundStyle}
      />
      
      {/* Content Layer with mobile-first responsive backdrop */}
      <div className="relative z-10 min-h-screen bg-white/90 dark:bg-black/90 backdrop-blur-sm safe-area-mobile"
      >
        
        {/* Hero Intro Slider Section with Integrated Search - Mobile optimized */}
        <section className="relative w-full">
          <HomeIntroSlider language={language} className="h-[70vh] md:h-[75vh] lg:h-[80vh] model-container-mobile">
            {/* Search Panel - No Background */}
            <div className="p-4 md:p-6 w-full">
              <div className="mb-4 text-center">
                <h2 className="text-lg md:text-2xl font-bold text-foreground mb-2">
                  {t.findYour}
                </h2>
                <p className="text-xs md:text-sm text-muted-foreground">
                  🔍 {t.searchPowered}
                </p>
              </div>
              
              <IPhoneSearchPanel
                language={language}
                onSearch={(searchData) => {
                  setQuickSearch(searchData.searchQuery || "");
                  handleQuickSearch(searchData);
                }}
                onLiveSearch={(searchTerm) => setQuickSearch(searchTerm)}
                resultsCount={hasSearched ? searchResults.length : undefined}
              />
            </div>
          </HomeIntroSlider>
        </section>

        {/* Advanced Filters - Minimal Space */}
        {filtersOpen && (
          <section className={cn(
            isMobile ? "px-2 py-1" : "px-4 py-1"
          )}>
            <div className={cn(
              "mx-auto",
              isMobile ? "max-w-sm" : "max-w-[1800px]"
            )}>
              <AdvancedPropertyFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onClearFilters={handleClearFilters}
                isOpen={filtersOpen}
                onToggle={() => setFiltersOpen(!filtersOpen)}
              />
            </div>
          </section>
        )}

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
        <div className="px-4 py-4 space-y-4">
          <div className="w-full mx-auto space-y-4">
            {hasSearched ? (
              <section className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/20">
                <div className="p-6">
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
                    <PropertyViewModeToggle 
                      viewMode={viewMode} 
                      onViewModeChange={(mode) => setViewMode(mode)} 
                    />
                  </div>
                  
                  {viewMode === 'grid' && (
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
                  )}

                  {viewMode === 'list' && (
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
                  )}

                  {viewMode === 'map' && (
                    <PropertyMapView
                      properties={searchResults}
                      onPropertyClick={handlePropertyClick}
                    />
                  )}
                </div>
              </section>
            ) : (
              <>
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
                  <AstraVillaFeatures />
                </div>

                {/* Featured Properties - Zero-waste Compact Layout */}
                <section className={cn(
                  "bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/20",
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
                  </div>
                </section>

                {/* Properties for Sale Section - Compact */}
                <div className="section-compact">
                  <PropertiesForSaleSection language={language} onPropertyClick={handlePropertyClick} />
                </div>

                {/* Properties for Rent Section - Compact */}
                <div className="section-compact">
                  <PropertiesForRentSection language={language} onPropertyClick={handlePropertyClick} />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Scroll to Top Button */}
        <ScrollToTopButton />

        
        {/* AI Search Loading Dialog */}
        <SearchLoadingDialog 
          open={isSearching} 
          onOpenChange={setIsSearching}
          searchQuery={quickSearch}
        />
        
        {/* Customer AI Chat Widget - Fixed position on right */}
        <ResponsiveAIChatWidget />
        
        {/* WhatsApp Inquiry Dialog */}
        {selectedProperty && (
          <WhatsAppInquiryDialog
            open={whatsappDialogOpen}
            onOpenChange={setWhatsappDialogOpen}
            property={selectedProperty}
          />
        )}
      </div>
    </div>
  );

  return content;
};

export default Index;