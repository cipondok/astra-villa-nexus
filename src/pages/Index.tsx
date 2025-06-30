
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import PropertyListingsSection from "@/components/PropertyListingsSection";
import ProfessionalFooter from "@/components/ProfessionalFooter";
import { useLanguage } from "@/contexts/LanguageContext";
import ResponsiveAIChatWidget from "@/components/ai/ResponsiveAIChatWidget";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import SmartSearchPanel from "@/components/search/SmartSearchPanel";
import PropertySlideSection from "@/components/property/PropertySlideSection";

const Index = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Background wallpaper - optimized for performance
  const backgroundStyle = {
    backgroundImage: `url('https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1920&q=80')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundAttachment: 'fixed',
  };

  // Optimized featured properties query with better filtering
  const { data: featuredProperties = [], isLoading: isFeaturedLoading } = useQuery({
    queryKey: ['featured-properties-fast'],
    queryFn: async () => {
      console.log('Fetching featured properties...');
      
      try {
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Featured properties timeout')), 2000);
        });

        const queryPromise = supabase
          .from('properties')
          .select('id, title, property_type, listing_type, price, location, bedrooms, bathrooms, area_sqm, images, thumbnail_url, state, city, development_status')
          .eq('status', 'active')
          .not('title', 'is', null)
          .not('title', 'eq', '')
          .order('created_at', { ascending: false })
          .limit(8);

        const { data, error } = await Promise.race([queryPromise, timeoutPromise]);

        if (error) {
          console.error('Properties query error:', error);
          return [];
        }

        // Filter out properties with empty or invalid data
        const filteredData = (data || []).filter(property => 
          property.title && 
          property.title.trim() !== '' &&
          property.price && 
          property.price > 0 &&
          (property.images?.length > 0 || property.thumbnail_url)
        );

        console.log('Featured properties loaded:', filteredData.length);
        return filteredData;
        
      } catch (err) {
        console.error('Featured properties fetch error:', err);
        return [];
      }
    },
    retry: 1,
    retryDelay: 500,
    refetchOnWindowFocus: false,
    staleTime: 30000,
    gcTime: 60000,
  });

  const handleSearch = async (searchData: any) => {
    console.log('Search initiated:', searchData);
    
    setIsSearching(true);
    setHasSearched(true);
    setSearchError(null);
    
    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Search timeout')), 3000);
      });

      let query = supabase
        .from('properties')
        .select('id, title, property_type, listing_type, price, location, bedrooms, bathrooms, area_sqm, images, thumbnail_url, state, city')
        .eq('status', 'active')
        .not('title', 'is', null)
        .not('title', 'eq', '');

      if (searchData.query && searchData.query.trim()) {
        const searchTerm = searchData.query.toLowerCase().trim();
        query = query.or(`title.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%,state.ilike.%${searchTerm}%`);
      }

      if (searchData.state) {
        query = query.eq('state', searchData.state);
      }

      if (searchData.city) {
        query = query.ilike('city', `%${searchData.city}%`);
      }

      if (searchData.propertyType) {
        query = query.eq('property_type', searchData.propertyType);
      }

      if (searchData.listingType) {
        query = query.eq('listing_type', searchData.listingType);
      }

      if (searchData.development_status) {
        query = query.eq('development_status', searchData.development_status);
      }

      const queryWithTimeout = Promise.race([
        query.order('created_at', { ascending: false }).limit(20),
        timeoutPromise
      ]);

      const { data, error } = await queryWithTimeout;

      if (error) {
        console.error('Search error:', error);
        setSearchError('Search failed. Please try again.');
        setSearchResults([]);
      } else {
        const filteredResults = (data || []).filter(property => 
          property.title && 
          property.title.trim() !== '' &&
          property.price && 
          property.price > 0
        );
        console.log('Search results:', filteredResults.length);
        setSearchResults(filteredResults);
        setSearchError(null);
      }
    } catch (error) {
      console.error('Search error:', error);
      if (error instanceof Error && error.message.includes('timeout')) {
        setSearchError('Search is taking too long. Please try with more specific filters.');
      } else {
        setSearchError('Search failed. Please check your connection and try again.');
      }
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleLiveSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      setSearchError(null);
      return;
    }
    
    console.log('Live search:', searchTerm);
    await handleSearch({ query: searchTerm });
  };

  // Functional button handlers
  const handleBuyProperties = () => {
    navigate('/buy');
  };

  const handleRentProperties = () => {
    navigate('/rent');
  };

  const handlePreLaunch = () => {
    navigate('/pre-launching');
  };

  const handleNewProjects = () => {
    navigate('/new-projects');
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
        
        {/* Hero Section - More Compact */}
        <section className="relative py-2 lg:py-3 px-4">
          <div className="max-w-[1800px] mx-auto text-center">
            <div className="mb-2 lg:mb-3 animate-fade-in">
              <h1 className="text-base md:text-lg lg:text-xl xl:text-2xl font-bold mb-1 leading-tight">
                <span className="inline-block bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 dark:from-blue-300 dark:via-purple-400 dark:to-cyan-300 bg-clip-text text-transparent animate-gradient bg-[length:300%_300%] font-extrabold tracking-tight">
                  Find Your Perfect
                </span>
                <br />
                <span className="inline-block bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 dark:from-purple-300 dark:via-pink-400 dark:to-orange-300 bg-clip-text text-transparent animate-gradient bg-[length:300%_300%] font-extrabold tracking-tight">
                  Property
                </span>
              </h1>
              
              <div className="relative mb-1">
                <h2 className="text-xs md:text-sm font-semibold text-white dark:text-white drop-shadow-lg">
                  <span className="inline-block px-2 py-0.5 lg:px-2 lg:py-1 bg-gradient-to-r from-blue-500/90 to-purple-600/90 dark:from-blue-400/90 dark:to-purple-500/90 rounded-lg backdrop-blur-sm border border-white/20 shadow-lg">
                    AI-Powered Real Estate Platform
                  </span>
                </h2>
              </div>
              
              <p className="text-xs md:text-xs lg:text-xs max-w-2xl mx-auto leading-relaxed">
                <span className="inline-block px-1.5 py-0.5 lg:px-2 lg:py-0.5 bg-gray-100/95 dark:bg-slate-800/95 text-slate-800 dark:text-slate-100 rounded-md backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-md font-medium">
                  Discover premium properties with advanced AI search technology
                </span>
              </p>
            </div>
            
            <div className="animate-scale-in">
              <SmartSearchPanel
                language={language}
                onSearch={handleSearch}
                onLiveSearch={handleLiveSearch}
              />
            </div>
          </div>
        </section>

        {/* Quick Actions - More Compact */}
        <section className="py-2 lg:py-3 bg-gray-50/50 dark:bg-gray-900/30">
          <div className="max-w-[1800px] mx-auto px-6 lg:px-8">
            <div className="flex flex-wrap justify-center gap-1.5 lg:gap-2">
              <Button 
                onClick={handleBuyProperties}
                className="apple-button-primary flex items-center gap-1.5 px-2 py-1 lg:px-2.5 lg:py-1.5 text-xs font-semibold hover:scale-105 transition-all duration-200 rounded-lg shadow-md"
              >
                🏠 Buy Properties
              </Button>
              <Button 
                onClick={handleRentProperties}
                className="apple-button-secondary flex items-center gap-1.5 px-2 py-1 lg:px-2.5 lg:py-1.5 text-xs font-semibold hover:scale-105 transition-all duration-200 rounded-lg shadow-md"
              >
                🔑 Rent Properties
              </Button>
              <Button 
                onClick={handlePreLaunch}
                className="apple-button-secondary flex items-center gap-1.5 px-2 py-1 lg:px-2.5 lg:py-1.5 text-xs font-semibold hover:scale-105 transition-all duration-200 rounded-lg shadow-md"
              >
                🚀 Pre-Launch
              </Button>
              <Button 
                onClick={handleNewProjects}
                className="apple-button-secondary flex items-center gap-1.5 px-2 py-1 lg:px-2.5 lg:py-1.5 text-xs font-semibold hover:scale-105 transition-all duration-200 rounded-lg shadow-md"
              >
                🏗️ New Projects
              </Button>
            </div>
          </div>
        </section>

        {/* Error Message - Compact */}
        {searchError && (
          <section className="py-1">
            <div className="max-w-[1800px] mx-auto px-6 lg:px-8">
              <div className="apple-glass border border-destructive/40 text-destructive text-center p-2 rounded-xl max-w-xl mx-auto shadow-md">
                <p className="font-medium text-xs lg:text-sm">⚠️ {searchError}</p>
                <Button 
                  onClick={() => {
                    setSearchError(null);
                    setSearchResults([]);
                    setHasSearched(false);
                  }}
                  variant="outline"
                  size="sm"
                  className="mt-1 text-xs"
                >
                  Clear Error
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* Property Sections with Slides */}
        <div className="px-6 lg:px-8 space-y-12 py-8">
          <div className="max-w-[1800px] mx-auto space-y-12">
            {/* Search Results or Featured Properties */}
            {hasSearched ? (
              <PropertyListingsSection
                language={language}
                searchResults={searchResults}
                isSearching={isSearching}
                hasSearched={hasSearched}
                fallbackResults={[]}
              />
            ) : (
              <>
                {/* Featured Properties Slide */}
                <PropertySlideSection
                  title="Featured Properties"
                  subtitle="Handpicked premium properties for you"
                  type="featured"
                  language={language}
                  limit={12}
                />

                {/* Buy Properties Slide */}
                <PropertySlideSection
                  title="Properties for Sale"
                  subtitle="Find your dream home to purchase"
                  type="buy"
                  language={language}
                  limit={8}
                />

                {/* Rent Properties Slide */}
                <PropertySlideSection
                  title="Properties for Rent"
                  subtitle="Discover rental properties in prime locations"
                  type="rent"
                  language={language}
                  limit={8}
                />

                {/* Pre-Launch Properties Slide */}
                <PropertySlideSection
                  title="Pre-Launch Offers"
                  subtitle="Exclusive early access to upcoming properties"
                  type="pre-launch"
                  language={language}
                  limit={6}
                />

                {/* New Projects Slide */}
                <PropertySlideSection
                  title="New Projects"
                  subtitle="Latest development projects and opportunities"
                  type="new-projects"
                  language={language}
                  limit={6}
                />

                {/* Vendor Services Slide */}
                <PropertySlideSection
                  title="Vendor Services"
                  subtitle="Professional real estate services and solutions"
                  type="vendor-services"
                  language={language}
                  limit={6}
                />
              </>
            )}
          </div>
        </div>

        {/* AI Chat Widget */}
        <ResponsiveAIChatWidget />

        {/* Footer */}
        <ProfessionalFooter language={language} />
      </div>
    </div>
  );
};

export default Index;
