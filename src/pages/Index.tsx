import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import EnhancedModernSearchPanel from "@/components/EnhancedModernSearchPanel";
import PropertyListingsSection from "@/components/PropertyListingsSection";
import ProfessionalFooter from "@/components/ProfessionalFooter";
import PropertySlideshow from "@/components/PropertySlideshow";
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

      // Apply search filters
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
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section with WWDC 2025 Styling */}
      <section className="relative py-32 px-4 bg-gradient-to-b from-background to-secondary/20">
        <div className="container mx-auto text-center">
          <div className="mb-16 wwdc-fade-in">
            <h1 className="wwdc-title mb-6 animate-wwdc-float">
              Find Your Perfect Property
              <span className="block text-3xl md:text-4xl wwdc-text-gradient font-medium mt-4">
                AI-Powered Real Estate Platform
              </span>
            </h1>
            <p className="wwdc-subtitle max-w-2xl mx-auto animate-wwdc-pulse">
              Discover amazing properties with our advanced AI search platform powered by cutting-edge technology
            </p>
          </div>
          
          <div className="max-w-5xl mx-auto wwdc-scale-in">
            <EnhancedModernSearchPanel
              language={language}
              onSearch={handleSearch}
              onLiveSearch={handleLiveSearch}
            />
          </div>
        </div>
      </section>

      {/* Quick Action Buttons with WWDC Styling */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-6">
            <Button 
              onClick={() => handleSearch({ listingType: 'buy' })}
              className="wwdc-button-primary flex items-center gap-3 px-8 py-4 text-lg hover:scale-105 transition-all duration-300 animate-wwdc-glow"
            >
              <i className="fas fa-home text-xl"></i>
              💰 Buy Properties
            </Button>
            <Button 
              onClick={() => handleSearch({ listingType: 'rent' })}
              className="wwdc-button-secondary flex items-center gap-3 px-8 py-4 text-lg hover:scale-105 transition-all duration-300"
            >
              <i className="fas fa-key text-xl"></i>
              🏠 Rent Properties
            </Button>
            <Button 
              onClick={() => handleSearch({ development_status: 'pre_launching' })}
              className="wwdc-button-secondary flex items-center gap-3 px-8 py-4 text-lg hover:scale-105 transition-all duration-300"
            >
              <i className="fas fa-rocket text-xl"></i>
              🚀 Pre-Launch
            </Button>
            <Button 
              onClick={() => handleSearch({ development_status: 'new_project' })}
              className="wwdc-button-secondary flex items-center gap-3 px-8 py-4 text-lg hover:scale-105 transition-all duration-300"
            >
              <i className="fas fa-building text-xl"></i>
              🏗️ New Projects
            </Button>
          </div>
        </div>
      </section>

      {/* Property Slideshow with WWDC 2025 Design */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 wwdc-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 wwdc-text-gradient">
              Featured Properties
            </h2>
            <p className="wwdc-subtitle text-xl">
              Discover our handpicked selection of premium properties
            </p>
          </div>
          <PropertySlideshow />
        </div>
      </section>

      {/* Error Message with WWDC Styling */}
      {searchError && (
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="wwdc-glass border border-red-500/40 text-red-500 text-center p-8 rounded-2xl max-w-2xl mx-auto">
              <i className="fas fa-exclamation-triangle text-2xl mb-4"></i>
              <p className="text-lg font-medium">⚠️ {searchError}</p>
            </div>
          </div>
        </section>
      )}

      {/* Property Listings */}
      <div className="px-4 bg-secondary/10">
        <PropertyListingsSection
          language={language}
          searchResults={hasSearched ? searchResults : featuredProperties}
          isSearching={isSearching}
          hasSearched={hasSearched}
          fallbackResults={featuredProperties}
        />
      </div>

      {/* AI Chat Widget */}
      <ResponsiveAIChatWidget />

      {/* Footer */}
      <ProfessionalFooter language={language} />
    </div>
  );
};

export default Index;
