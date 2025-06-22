
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import EnhancedModernSearchPanel from "@/components/EnhancedModernSearchPanel";
import PropertyListingsSection from "@/components/PropertyListingsSection";
import ProfessionalFooter from "@/components/ProfessionalFooter";
import { useLanguage } from "@/contexts/LanguageContext";
import ResponsiveAIChatWidget from "@/components/ai/ResponsiveAIChatWidget";
import { supabase } from "@/integrations/supabase/client";
import RecommendedProperties from "@/components/property/RecommendedProperties";

const Index = () => {
  const { language } = useLanguage();
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Fetch featured properties
  const { data: featuredProperties = [], isLoading: isFeaturedLoading } = useQuery({
    queryKey: ['featured-properties'],
    queryFn: async () => {
      console.log('Fetching featured properties...');
      
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('status', 'active')
        .limit(20);

      if (error) {
        console.error('Query error:', error);
        return [];
      }

      console.log('Featured properties fetched:', data?.length || 0);
      return data || [];
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const handleSearch = async (searchData: any) => {
    console.log('Search initiated:', searchData);
    
    setIsSearching(true);
    setHasSearched(true);
    setSearchError(null);
    
    try {
      let query = supabase
        .from('properties')
        .select('*')
        .eq('status', 'active');

      // Apply search filters
      if (searchData.query && searchData.query.trim()) {
        const searchTerm = searchData.query.toLowerCase().trim();
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%,state.ilike.%${searchTerm}%`);
      }

      if (searchData.state) {
        query = query.eq('state', searchData.state);
      }

      if (searchData.propertyType) {
        query = query.eq('property_type', searchData.propertyType);
      }

      if (searchData.bedrooms) {
        const bedroomCount = searchData.bedrooms === '4+' ? 4 : parseInt(searchData.bedrooms);
        if (searchData.bedrooms === '4+') {
          query = query.gte('bedrooms', bedroomCount);
        } else {
          query = query.eq('bedrooms', bedroomCount);
        }
      }

      if (searchData.bathrooms) {
        const bathroomCount = searchData.bathrooms === '4+' ? 4 : parseInt(searchData.bathrooms);
        if (searchData.bathrooms === '4+') {
          query = query.gte('bathrooms', bathroomCount);
        } else {
          query = query.eq('bathrooms', bathroomCount);
        }
      }

      const { data, error } = await query.limit(50);

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
      setSearchError('Search failed. Please try again.');
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
      
      {/* Hero Section with Search - Mobile Optimized */}
      <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-orange-500 text-white py-8 sm:py-12 lg:py-16 px-2 sm:px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold mb-4 sm:mb-6 animate-fade-in px-2">
            {language === "en" ? "Find Your Dream Property" : "Temukan Properti Impian Anda"}
          </h1>
          <p className="text-base sm:text-lg lg:text-xl mb-6 sm:mb-8 text-blue-100 px-2">
            {language === "en" 
              ? "Discover the perfect home with our advanced search technology" 
              : "Temukan rumah sempurna dengan teknologi pencarian canggih kami"}
          </p>
          
          <div className="max-w-5xl mx-auto">
            <EnhancedModernSearchPanel
              language={language}
              onSearch={handleSearch}
              onLiveSearch={handleLiveSearch}
            />
          </div>
        </div>
      </section>

      {/* Error Message */}
      {searchError && (
        <section className="py-4 bg-red-50">
          <div className="container mx-auto px-4">
            <div className="text-center text-red-600 font-medium">
              {searchError}
            </div>
          </div>
        </section>
      )}

      {/* Property Listings Section - Mobile Responsive */}
      <div className="px-2 sm:px-0">
        <PropertyListingsSection
          language={language}
          searchResults={searchResults}
          isSearching={isSearching}
          hasSearched={hasSearched}
          fallbackResults={featuredProperties}
        />
      </div>

      {/* Recommended Properties Section - only show if we have properties and no search */}
      {!hasSearched && featuredProperties.length > 0 && (
        <section className="py-6 sm:py-8 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-2 sm:px-4">
            <RecommendedProperties
              title={language === "en" ? "AI Recommended For You" : "Rekomendasi AI Untuk Anda"}
              limit={8}
              showAIBadge={true}
            />
          </div>
        </section>
      )}

      {/* AI Chat Widget */}
      <ResponsiveAIChatWidget />

      {/* Footer */}
      <ProfessionalFooter language={language} />
    </div>
  );
};

export default Index;
