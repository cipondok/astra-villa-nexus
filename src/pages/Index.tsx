
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

  // Fetch featured properties with better error handling
  const { data: featuredProperties = [], isLoading: isFeaturedLoading, error } = useQuery({
    queryKey: ['featured-properties'],
    queryFn: async () => {
      console.log('=== STARTING PROPERTY FETCH ===');
      
      try {
        console.log('Fetching properties from database...');
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('status', 'active')
          .limit(20);

        if (error) {
          console.error('Query error:', error);
          throw error;
        }

        console.log('Properties fetched from database:', data?.length || 0);
        
        if (data && data.length > 0) {
          console.log('Returning database properties:', data.length);
          return data;
        }

        // If no properties in database, return empty array instead of test data
        console.log('No properties found in database, returning empty array');
        return [];

      } catch (error) {
        console.error('Property fetch failed:', error);
        // Return empty array on error instead of fallback data
        return [];
      }
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const handleSearch = async (searchData: any) => {
    console.log('=== SEARCH INITIATED ===');
    console.log('Search data:', searchData);
    
    setIsSearching(true);
    setHasSearched(true);
    
    try {
      // Search in database
      let query = supabase
        .from('properties')
        .select('*')
        .eq('status', 'active');

      if (searchData.query) {
        const searchTerm = searchData.query.toLowerCase();
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%,state.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query.limit(50);

      if (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } else {
        console.log('Search results found:', data?.length || 0);
        setSearchResults(data || []);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleLiveSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }
    
    console.log('Live search:', searchTerm);
    handleSearch({ query: searchTerm });
  };

  // Debug logging
  useEffect(() => {
    console.log('=== INDEX STATE DEBUG ===');
    console.log('Featured properties:', featuredProperties?.length || 0);
    console.log('Search results:', searchResults?.length || 0);
    console.log('Has searched:', hasSearched);
    console.log('Is searching:', isSearching);
    console.log('Is loading:', isFeaturedLoading);
    console.log('Error:', error);
    console.log('=== END DEBUG ===');
  }, [featuredProperties, searchResults, hasSearched, isSearching, isFeaturedLoading, error]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section with Search */}
      <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-orange-500 text-white py-16 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-3xl lg:text-5xl font-bold mb-6 animate-fade-in">
            {language === "en" ? "Find Your Dream Property" : "Temukan Properti Impian Anda"}
          </h1>
          <p className="text-lg lg:text-xl mb-8 text-blue-100">
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

      {/* Property Listings Section */}
      <PropertyListingsSection
        language={language}
        searchResults={searchResults}
        isSearching={isSearching}
        hasSearched={hasSearched}
        fallbackResults={featuredProperties}
      />

      {/* Recommended Properties Section - only show if we have properties */}
      {featuredProperties.length > 0 && (
        <section className="py-8 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4">
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
