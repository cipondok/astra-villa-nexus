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
import PropertiesForSaleSection from "@/components/property/PropertiesForSaleSection";
import PropertiesForRentSection from "@/components/property/PropertiesForRentSection";
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

  // Full-screen layout for all devices
  const content = (
    <div className="min-h-screen w-full m-0 p-0">
      <div className="w-full m-0 p-0">
        {/* Navigation for all screens */}
        <Navigation />
        
        {/* Hero Section - Full width */}
        <section className="w-full m-0 p-0">
          <div className="w-full text-center m-0 p-0">
            {/* Ultra Compact Hero Section */}
            <div className="animate-fade-in flex flex-col items-center gap-1 mb-2">
              {/* Compact Title + Badge in One Line */}
              <div className="flex flex-wrap items-center justify-center gap-2">
                <h1 className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 dark:from-blue-300 dark:via-purple-400 dark:to-cyan-300 bg-clip-text text-transparent font-bold tracking-tight text-lg md:text-xl">
                  Find Your Perfect Property
                </h1>
                
                <span className="bg-gradient-to-r from-blue-500/90 to-purple-600/90 dark:from-blue-400/90 dark:to-purple-500/90 rounded-full px-3 py-0.5 text-white text-sm font-medium border border-white/20 shadow-sm">
                  ✨ AI-Powered
                </span>
              </div>
              
              {/* Compact Description */}
              <p className="bg-white/90 dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 rounded-full px-4 py-0.5 text-sm font-medium border border-slate-200/50 dark:border-slate-700/50 shadow-sm backdrop-blur-sm">
                🔍 Enhanced search & filtering
              </p>
            </div>
            
            {/* iPhone-style Search Panel - Compact */}
            <div className="animate-scale-in max-w-4xl mx-auto">
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

        {/* Advanced Filters */}
        {filtersOpen && (
          <section className="p-4">
            <div className="max-w-screen-2xl mx-auto">
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
            <div className="max-w-screen-2xl mx-auto px-4">
              <div className="apple-glass border border-destructive/40 text-destructive text-center rounded-xl shadow-md p-3 max-w-xl mx-auto">
                <p className="font-medium text-sm">⚠️ {searchError}</p>
                <button 
                  onClick={() => {
                    setSearchError(null);
                    setSearchResults([]);
                    setHasSearched(false);
                  }}
                  className="bg-red-100 hover:bg-red-200 text-red-700 rounded-md transition-colors mt-2 px-4 py-1 text-sm"
                >
                  Clear Error
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Property Display Section - Full width */}
        <div className="w-full p-4">
          <div className="max-w-screen-2xl mx-auto">
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
                    />
                  )}
                  
                  {viewMode === 'list' && (
                    <PropertyListView
                      properties={searchResults}
                      onPropertyClick={handlePropertyClick}
                      onView3D={handlePropertyClick}
                      onSave={(property) => console.log('Save property:', property.id)}
                    />
                  )}
                </div>
              </section>
            ) : (
              <>
                {/* Property Slide Section - Full width */}
                <PropertySlideSection 
                  title="Featured Properties"
                  type="featured"
                  language={language}
                />
                
                {/* Properties for Sale Section - Full width */}
                <PropertiesForSaleSection 
                  language={language}
                  onPropertyClick={handlePropertyClick}
                />
                
                {/* Properties for Rent Section - Full width */}
                <PropertiesForRentSection 
                  language={language}
                  onPropertyClick={handlePropertyClick}
                />
              </>
            )}
          </div>
        </div>

        {/* Professional Footer - Full width */}
        <ProfessionalFooter language={language} />
      </div>

      {/* AI Chat Widget */}
      <ResponsiveAIChatWidget />
      
      {/* Scroll to Top Button */}
      <ScrollToTopButton />
      
      {/* Search Loading Dialog */}
      <SearchLoadingDialog 
        open={isSearching}
        onOpenChange={() => setIsSearching(false)}
      />
    </div>
  );

  return content;
};

export default Index;