import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import ProfessionalFooter from "@/components/ProfessionalFooter";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

import ResponsiveAIChatWidget from "@/components/ai/ResponsiveAIChatWidget";
import ScrollToTopButton from "@/components/ui/ScrollToTopButton";
import { supabase } from "@/integrations/supabase/client";
import PropertyViewModeToggle from "@/components/search/PropertyViewModeToggle";
import PropertyListView from "@/components/search/PropertyListView";
import PropertyGridView from "@/components/search/PropertyGridView";
import AdvancedPropertyFilters, { PropertyFilters } from "@/components/search/AdvancedPropertyFilters";
import { BaseProperty } from "@/types/property";
import PropertySlideSection from "@/components/property/PropertySlideSection";
import IPhoneSearchPanel from "@/components/iPhoneSearchPanel";
import { SearchLoadingDialog } from "@/components/SearchLoadingDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

type ViewMode = 'list' | 'grid' | 'map';

const Index = () => {
  const { language } = useLanguage();
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
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

  // Simplified featured properties query
  const { data: featuredProperties = [], isLoading: isFeaturedLoading } = useQuery({
    queryKey: ['featured-properties-simple'],
    queryFn: async () => {
      console.log('Fetching featured properties...');
      
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('id, title, property_type, listing_type, price, location, bedrooms, bathrooms, area_sqm, images, thumbnail_url, state, city, development_status, description, three_d_model_url, virtual_tour_url')
          .eq('status', 'active')
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
    staleTime: 60000,
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

  // Mobile layout wrapper
  const content = (
    <div className="min-h-screen text-foreground relative" style={{ zoom: isMobile ? '100%' : '90%' }}>
      {/* Background Wallpaper Layer */}
      <div 
        className="fixed inset-0 z-0 opacity-30 dark:opacity-20"
        style={backgroundStyle}
      />
      
      {/* Content Layer with backdrop */}
      <div className="relative z-10 bg-white/90 dark:bg-black/90 backdrop-blur-sm min-h-screen">
        {/* Desktop Navigation Only */}
        {!isMobile && <Navigation />}
        
        {/* Hero Section - Mobile Optimized */}
        <section className={cn(
          "relative px-3 py-3", 
          isMobile ? "py-2" : "py-4 lg:py-6 px-4"
        )}>
          <div className={cn(
            "mx-auto text-center",
            isMobile ? "max-w-sm" : "max-w-[1800px]"
          )}>
            <div className={cn(
              "animate-fade-in",
              isMobile ? "mb-3" : "mb-6 lg:mb-8"
            )}>
              {/* Main Hero Title - Mobile Optimized */}
              <div className={cn(
                "relative",
                isMobile ? "mb-3" : "mb-6"
              )}>
                <h1 className={cn(
                  "font-bold leading-tight text-center",
                  isMobile 
                    ? "text-lg mb-2" 
                    : "text-xl md:text-2xl lg:text-3xl xl:text-4xl mb-4"
                )}>
                  <span className="inline-block bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 dark:from-blue-300 dark:via-purple-400 dark:to-cyan-300 bg-clip-text text-transparent animate-gradient bg-[length:300%_300%] font-extrabold tracking-tight drop-shadow-sm">
                    Find Your Perfect
                  </span>
                  <br />
                  <span className="inline-block bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 dark:from-purple-300 dark:via-pink-400 dark:to-orange-300 bg-clip-text text-transparent animate-gradient bg-[length:300%_300%] font-extrabold tracking-tight drop-shadow-sm">
                    Property
                  </span>
                </h1>
                
                {/* Decorative elements - Mobile Scaled */}
                {!isMobile && (
                  <>
                    <div className="absolute -top-2 -left-2 w-6 h-6 bg-blue-500/20 rounded-full blur-sm animate-pulse"></div>
                    <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-purple-500/20 rounded-full blur-sm animate-pulse delay-1000"></div>
                  </>
                )}
              </div>
              
              {/* Subtitle - Mobile Optimized */}
              <div className={cn(
                "relative",
                isMobile ? "mb-2" : "mb-4"
              )}>
                <h2 className={cn(
                  "font-semibold text-center",
                  isMobile ? "text-xs" : "text-sm md:text-base lg:text-lg"
                )}>
                  <span className={cn(
                    "inline-block bg-gradient-to-r from-blue-500/90 to-purple-600/90 dark:from-blue-400/90 dark:to-purple-500/90 rounded-lg backdrop-blur-sm border border-white/30 shadow-lg text-white font-bold tracking-wide",
                    isMobile ? "px-2 py-1 text-xs" : "px-3 py-1.5 lg:px-4 lg:py-2"
                  )}>
                    ✨ AI-Powered Real Estate Platform ✨
                  </span>
                </h2>
              </div>
              
              {/* Description - Mobile Optimized */}
              <div className="relative">
                <p className={cn(
                  "mx-auto leading-relaxed text-center",
                  isMobile 
                    ? "text-xs max-w-xs" 
                    : "text-xs md:text-sm lg:text-base max-w-2xl"
                )}>
                  <span className={cn(
                    "inline-block bg-white/95 dark:bg-slate-800/95 text-slate-800 dark:text-slate-100 rounded-lg backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-xl font-medium macos-smooth-hover",
                    isMobile ? "px-2 py-1 text-xs" : "px-3 py-1.5 lg:px-4 lg:py-2"
                  )}>
                    🔍 Discover premium properties with enhanced search and filtering
                  </span>
                </p>
                
                {/* Subtle glow effect - Hidden on mobile */}
                {!isMobile && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-lg blur-xl -z-10"></div>
                )}
              </div>
            </div>
            
            {/* iPhone-style Search Panel - Mobile Optimized */}
            <div className={cn(
              "animate-scale-in",
              isMobile ? "max-w-sm mx-auto" : "max-w-4xl mx-auto"
            )}>
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
          </div>
        </section>

        {/* Advanced Filters - Mobile Optimized */}
        {filtersOpen && (
          <section className={cn(
            "py-2",
            isMobile ? "px-2" : "px-4"
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

        {/* Error Message - Mobile Optimized */}
        {searchError && (
          <section className="py-2">
            <div className={cn(
              isMobile ? "max-w-sm px-2" : "max-w-[1800px] px-6 lg:px-8",
              "mx-auto"
            )}>
              <div className={cn(
                "apple-glass border border-destructive/40 text-destructive text-center rounded-xl shadow-md",
                isMobile ? "p-2 max-w-xs mx-auto" : "p-3 max-w-xl mx-auto"
              )}>
                <p className={cn(
                  "font-medium",
                  isMobile ? "text-xs" : "text-sm lg:text-base"
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
                  Clear Error
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Property Display Section - Mobile Optimized */}
        <div className={cn(
          "space-y-8 py-8",
          isMobile ? "px-2 py-4 space-y-4" : "px-6 lg:px-8"
        )}>
          <div className={cn(
            "mx-auto space-y-8",
            isMobile ? "max-w-sm space-y-4" : "max-w-[1800px]"
          )}>
            {hasSearched ? (
              <section className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/20">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-300 dark:to-purple-300 bg-clip-text text-transparent">
                        Search Results
                      </h2>
                      <p className="text-muted-foreground">
                        {isSearching ? "Searching..." : `${searchResults.length} properties found`}
                        {quickSearch && (
                          <span className="ml-2 text-primary font-medium">
                            for "{quickSearch}"
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
                      onShare={(property) => console.log('Share property:', property.id)}
                      onContact={(property) => console.log('Contact for property:', property.id)}
                    />
                  )}

                  {viewMode === 'list' && (
                    <PropertyListView
                      properties={searchResults}
                      onPropertyClick={handlePropertyClick}
                      onView3D={handlePropertyClick}
                      onSave={(property) => console.log('Save property:', property.id)}
                      onShare={(property) => console.log('Share property:', property.id)}
                      onContact={(property) => console.log('Contact for property:', property.id)}
                    />
                  )}
                </div>
              </section>
            ) : (
              <>
                {/* Featured Properties with Enhanced Display */}
                <section className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 dark:border-gray-700/20">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl lg:text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-300 dark:to-purple-300 bg-clip-text text-transparent">
                      Featured Properties
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300">
                      Premium properties with enhanced display and 3D tours
                    </p>
                  </div>
                  
                  <PropertyGridView
                    properties={featuredProperties}
                    onPropertyClick={handlePropertyClick}
                    onView3D={handlePropertyClick}
                    onSave={(property) => console.log('Save property:', property.id)}
                    onShare={(property) => console.log('Share property:', property.id)}
                    onContact={(property) => console.log('Contact for property:', property.id)}
                  />
                </section>

                {/* Additional Property Sections */}
                <PropertySlideSection
                  title="Properties for Sale"
                  subtitle="Find your dream home to purchase"
                  type="buy"
                  language={language}
                  limit={6}
                />

                <PropertySlideSection
                  title="Properties for Rent"
                  subtitle="Discover rental properties in prime locations"
                  type="rent"
                  language={language}
                  limit={6}
                />
              </>
            )}
          </div>
        </div>

        {/* Scroll to Top Button */}
        <ScrollToTopButton />

        {/* Footer */}
        {!isMobile && <ProfessionalFooter language={language} />}
        
        {/* AI Search Loading Dialog */}
        <SearchLoadingDialog 
          open={isSearching} 
          onOpenChange={setIsSearching}
          searchQuery={quickSearch}
        />
        
        {/* Customer AI Chat Widget - Positioned Right Center */}
        <ResponsiveAIChatWidget />
      </div>
    </div>
  );

  return content;
};

export default Index;