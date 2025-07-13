import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import ProfessionalFooter from "@/components/ProfessionalFooter";
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
import SlimEnhancedSearchPanel from "@/components/SlimEnhancedSearchPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

type ViewMode = 'list' | 'grid' | 'map';

const Index = () => {
  const { language } = useLanguage();
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
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
  useEffect(() => {
    if (!loading && user && profile && !window.location.search.includes('stay')) {
      // Only redirect on initial app load, not when user navigates to home
      const hasVisitedBefore = sessionStorage.getItem('hasVisitedHome');
      const isDirectNavigation = window.location.search.includes('from=admin') || document.referrer.includes('/admin');
      
      if (!hasVisitedBefore && !isDirectNavigation) {
        // Redirect customer service users to dashboard
        if (profile.role === 'customer_service') {
          navigate('/dashboard');
          return;
        }
        // Redirect admin users to admin panel  
        else if (profile.role === 'admin' || user.email === 'mycode103@gmail.com') {
          navigate('/admin');
          return;
        }
      }
      
      // Mark that user has visited home page
      sessionStorage.setItem('hasVisitedHome', 'true');
    }
  }, [user, profile, loading, navigate]);

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
    
    setIsSearching(true);
    setHasSearched(true);
    setSearchError(null);
    
    try {
      let query = supabase
        .from('properties')
        .select('id, title, property_type, listing_type, price, location, bedrooms, bathrooms, area_sqm, images, thumbnail_url, state, city, description, three_d_model_url, virtual_tour_url')
        .eq('status', 'active')
        .not('title', 'is', null);

      // Apply text search only if there's a search term
      if (searchTerm?.trim()) {
        query = query.or(`title.ilike.%${searchTerm.trim()}%,location.ilike.%${searchTerm.trim()}%,city.ilike.%${searchTerm.trim()}%,state.ilike.%${searchTerm.trim()}%`);
      }

      // Apply filters if provided
      if (searchData?.location && searchData.location !== 'all') {
        query = query.or(`location.ilike.%${searchData.location}%,city.ilike.%${searchData.location}%`);
      }

      if (searchData?.propertyType && searchData.propertyType !== 'all') {
        query = query.eq('property_type', searchData.propertyType);
      }

      if (searchData?.listingType && searchData.listingType !== 'all') {
        query = query.eq('listing_type', searchData.listingType);
      }

      // Apply advanced filters
      if (searchData?.priceRange && searchData.priceRange !== 'all') {
        const [min, max] = searchData.priceRange.split('-');
        if (searchData.priceRange.includes('+')) {
          query = query.gte('price', parseInt(min));
        } else {
          query = query.gte('price', parseInt(min)).lte('price', parseInt(max));
        }
      }

      if (searchData?.bedrooms && searchData.bedrooms !== 'all') {
        if (searchData.bedrooms.includes('+')) {
          query = query.gte('bedrooms', parseInt(searchData.bedrooms));
        } else {
          query = query.eq('bedrooms', parseInt(searchData.bedrooms));
        }
      }

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

  return (
    <div className="min-h-screen text-foreground relative">
      {/* Background Wallpaper Layer */}
      <div 
        className="fixed inset-0 z-0 opacity-30 dark:opacity-20"
        style={backgroundStyle}
      />
      
      {/* Content Layer with backdrop */}
      <div className="relative z-10 bg-white/90 dark:bg-black/90 backdrop-blur-sm min-h-screen">
        <Navigation />
        
        {/* Hero Section */}
        <section className="relative py-4 lg:py-6 px-4">
          <div className="max-w-[1800px] mx-auto text-center">
            <div className="mb-4 lg:mb-6 animate-fade-in">
              <h1 className="text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold mb-2 leading-tight">
                <span className="inline-block bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 dark:from-blue-300 dark:via-purple-400 dark:to-cyan-300 bg-clip-text text-transparent animate-gradient bg-[length:300%_300%] font-extrabold tracking-tight">
                  Find Your Perfect
                </span>
                <br />
                <span className="inline-block bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 dark:from-purple-300 dark:via-pink-400 dark:to-orange-300 bg-clip-text text-transparent animate-gradient bg-[length:300%_300%] font-extrabold tracking-tight">
                  Property
                </span>
              </h1>
              
              <div className="relative mb-2">
                <h2 className="text-sm md:text-base font-semibold text-white dark:text-white drop-shadow-lg">
                  <span className="inline-block px-3 py-1 lg:px-4 lg:py-2 bg-gradient-to-r from-blue-500/90 to-purple-600/90 dark:from-blue-400/90 dark:to-purple-500/90 rounded-lg backdrop-blur-sm border border-white/20 shadow-lg">
                    AI-Powered Real Estate Platform
                  </span>
                </h2>
              </div>
              
              <p className="text-sm md:text-sm lg:text-base max-w-2xl mx-auto leading-relaxed">
                <span className="inline-block px-2 py-1 lg:px-3 lg:py-1 bg-gray-100/95 dark:bg-slate-800/95 text-slate-800 dark:text-slate-100 rounded-md backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-md font-medium">
                  Discover premium properties with enhanced search and filtering
                </span>
              </p>
            </div>
            
            {/* Enhanced Search Panel */}
            <div className="animate-scale-in max-w-6xl mx-auto">
              <SlimEnhancedSearchPanel
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

        {/* Advanced Filters */}
        {filtersOpen && (
          <section className="px-4 py-2">
            <div className="max-w-[1800px] mx-auto">
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

        {/* Error Message */}
        {searchError && (
          <section className="py-2">
            <div className="max-w-[1800px] mx-auto px-6 lg:px-8">
              <div className="apple-glass border border-destructive/40 text-destructive text-center p-3 rounded-xl max-w-xl mx-auto shadow-md">
                <p className="font-medium text-sm lg:text-base">⚠️ {searchError}</p>
                <button 
                  onClick={() => {
                    setSearchError(null);
                    setSearchResults([]);
                    setHasSearched(false);
                  }}
                  className="mt-2 px-4 py-1 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded-md transition-colors"
                >
                  Clear Error
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Property Display Section */}
        <div className="px-6 lg:px-8 space-y-8 py-8">
          <div className="max-w-[1800px] mx-auto space-y-8">
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

        {/* AI Chat Widget */}
        <ResponsiveAIChatWidget />
        
        {/* Scroll to Top Button */}
        <ScrollToTopButton />

        {/* Footer */}
        <ProfessionalFooter language={language} />
      </div>
    </div>
  );
};

export default Index;