import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import EnhancedModernSearchPanel from "@/components/EnhancedModernSearchPanel";
import PropertyListingsSection from "@/components/PropertyListingsSection";
import ProfessionalFooter from "@/components/ProfessionalFooter";
import { useLanguage } from "@/contexts/LanguageContext";
import ResponsiveAIChatWidget from "@/components/ai/ResponsiveAIChatWidget";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const Index = () => {
  const { language } = useLanguage();
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Optimized featured properties query
  const { data: featuredProperties = [], isLoading: isFeaturedLoading } = useQuery({
    queryKey: ['featured-properties-fast'],
    queryFn: async () => {
      console.log('Fetching featured properties...');
      
      try {
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Query timeout')), 3000);
        });

        const queryPromise = supabase
          .from('properties')
          .select('id, title, property_type, listing_type, price, location, bedrooms, bathrooms, area_sqm, images, thumbnail_url, state, city, development_status')
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(12);

        const { data, error } = await Promise.race([queryPromise, timeoutPromise]);

        if (error) {
          console.error('Properties query error:', error);
          return [];
        }

        console.log('Featured properties loaded:', data?.length || 0);
        return data || [];
        
      } catch (err) {
        console.error('Featured properties fetch error:', err);
        return [];
      }
    },
    retry: 1,
    retryDelay: 1000,
    refetchOnWindowFocus: false,
    staleTime: 60000,
    gcTime: 300000,
  });

  const handleSearch = async (searchData: any) => {
    console.log('Search initiated:', searchData);
    
    setIsSearching(true);
    setHasSearched(true);
    setSearchError(null);
    
    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Search timeout')), 5000);
      });

      let query = supabase
        .from('properties')
        .select('id, title, property_type, listing_type, price, location, bedrooms, bathrooms, area_sqm, images, thumbnail_url, state, city')
        .eq('status', 'active');

      if (searchData.query && searchData.query.trim()) {
        const searchTerm = searchData.query.toLowerCase().trim();
        query = query.or(`title.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%`);
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

      const queryWithTimeout = Promise.race([
        query.order('created_at', { ascending: false }).limit(24),
        timeoutPromise
      ]);

      const { data, error } = await queryWithTimeout;

      if (error) {
        console.error('Search error:', error);
        setSearchError('Search failed. Please try again.');
        setSearchResults([]);
      } else {
        console.log('Search results:', data?.length || 0);
        setSearchResults(data || []);
        setSearchError(null);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchError('Search timeout. Please try again.');
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

  return (
    <div className="min-h-screen bg-white dark:bg-black text-foreground">
      <Navigation />
      
      {/* Hero Section - Much More Compact */}
      <section className="relative py-4 lg:py-6 px-4 bg-white dark:bg-black">
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
              <h2 className="text-xs md:text-sm lg:text-base font-semibold text-white dark:text-white drop-shadow-lg">
                <span className="inline-block px-2 py-1 lg:px-3 lg:py-1.5 bg-gradient-to-r from-blue-500/90 to-purple-600/90 dark:from-blue-400/90 dark:to-purple-500/90 rounded-lg backdrop-blur-sm border border-white/20 shadow-lg">
                  AI-Powered Real Estate Platform
                </span>
              </h2>
            </div>
            
            <p className="text-xs md:text-xs lg:text-sm max-w-2xl mx-auto leading-relaxed">
              <span className="inline-block px-2 py-1 lg:px-3 lg:py-1 bg-gray-100/95 dark:bg-slate-800/95 text-slate-800 dark:text-slate-100 rounded-md backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-md font-medium">
                Discover premium properties with advanced AI search technology
              </span>
            </p>
          </div>
          
          <div className="animate-scale-in">
            <EnhancedModernSearchPanel
              language={language}
              onSearch={handleSearch}
              onLiveSearch={handleLiveSearch}
            />
          </div>
        </div>
      </section>

      {/* Quick Actions - Compact */}
      <section className="py-3 lg:py-4 bg-gray-50/50 dark:bg-gray-900/30">
        <div className="max-w-[1800px] mx-auto px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-2 lg:gap-3">
            <Button 
              onClick={() => handleSearch({ listingType: 'buy' })}
              className="apple-button-primary flex items-center gap-2 px-2 py-1.5 lg:px-3 lg:py-1.5 text-xs lg:text-xs font-semibold hover:scale-105 transition-all duration-200 rounded-lg shadow-md"
            >
              🏠 Buy Properties
            </Button>
            <Button 
              onClick={() => handleSearch({ listingType: 'rent' })}
              className="apple-button-secondary flex items-center gap-2 px-2 py-1.5 lg:px-3 lg:py-1.5 text-xs lg:text-xs font-semibold hover:scale-105 transition-all duration-200 rounded-lg shadow-md"
            >
              🔑 Rent Properties
            </Button>
            <Button 
              onClick={() => handleSearch({ development_status: 'pre_launching' })}
              className="apple-button-secondary flex items-center gap-2 px-2 py-1.5 lg:px-3 lg:py-1.5 text-xs lg:text-xs font-semibold hover:scale-105 transition-all duration-200 rounded-lg shadow-md"
            >
              🚀 Pre-Launch
            </Button>
            <Button 
              onClick={() => handleSearch({ development_status: 'new_project' })}
              className="apple-button-secondary flex items-center gap-2 px-2 py-1.5 lg:px-3 lg:py-1.5 text-xs lg:text-xs font-semibold hover:scale-105 transition-all duration-200 rounded-lg shadow-md"
            >
              🏗️ New Projects
            </Button>
          </div>
        </div>
      </section>

      {/* Error Message - Compact */}
      {searchError && (
        <section className="py-2">
          <div className="max-w-[1800px] mx-auto px-6 lg:px-8">
            <div className="apple-glass border border-destructive/40 text-destructive text-center p-3 rounded-xl max-w-xl mx-auto shadow-md">
              <p className="font-medium text-xs lg:text-sm">⚠️ {searchError}</p>
            </div>
          </div>
        </section>
      )}

      {/* Property Listings - Full Wide Screen Container */}
      <div className="px-6 lg:px-8 bg-white dark:bg-black">
        <div className="max-w-[1800px] mx-auto">
          <PropertyListingsSection
            language={language}
            searchResults={hasSearched ? searchResults : featuredProperties}
            isSearching={isSearching}
            hasSearched={hasSearched}
            fallbackResults={featuredProperties}
          />
        </div>
      </div>

      {/* AI Chat Widget */}
      <ResponsiveAIChatWidget />

      {/* Footer */}
      <ProfessionalFooter language={language} />
    </div>
  );
};

export default Index;
