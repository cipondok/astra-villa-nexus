import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import EnhancedModernSearchPanel from "@/components/EnhancedModernSearchPanel";
import PropertyListingsSection from "@/components/PropertyListingsSection";
import ProfessionalFooter from "@/components/ProfessionalFooter";
import { useLanguage } from "@/contexts/LanguageContext";
import ResponsiveAIChatWidget from "@/components/ai/ResponsiveAIChatWidget";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  console.log('=== INDEX PAGE DEBUG START ===');
  console.log('1. Index page component rendering...');
  
  const { language } = useLanguage();
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  console.log('2. State initialized, language:', language);

  // Simple featured properties query with better error handling
  const { data: featuredProperties = [], isLoading: isFeaturedLoading, error: featuredError } = useQuery({
    queryKey: ['featured-properties'],
    queryFn: async () => {
      console.log('3. Fetching featured properties...');
      
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('id, title, property_type, listing_type, price, location, bedrooms, bathrooms, area_sqm, images, thumbnail_url, state, city')
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(12);

        if (error) {
          console.error('Properties query error:', error);
          return [];
        }

        console.log('4. Featured properties loaded:', data?.length || 0);
        return data || [];
        
      } catch (err) {
        console.error('Featured properties fetch error:', err);
        return [];
      }
    },
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: 60000,
  });

  console.log('5. Query setup complete');

  const handleSearch = async (searchData: any) => {
    console.log('6. Search initiated:', searchData);
    
    setIsSearching(true);
    setHasSearched(true);
    setSearchError(null);
    
    try {
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

      if (searchData.priceRange) {
        const [minPrice, maxPrice] = searchData.priceRange.split('-').map(Number);
        if (minPrice) {
          query = query.gte('price', minPrice);
        }
        if (maxPrice && maxPrice < 999999999999) {
          query = query.lte('price', maxPrice);
        }
      }

      const { data, error } = await query.order('created_at', { ascending: false }).limit(24);

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

  console.log('7. About to render Index page UI...');

  if (featuredError) {
    console.error('Featured properties error:', featuredError);
  }

  try {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <section className="relative bg-gradient-to-br from-blue-600 via-blue-500 to-orange-400 text-white py-8 sm:py-12 lg:py-16 px-2 sm:px-4">
          <div className="absolute inset-0 bg-gradient-to-t from-cream-100/10 to-transparent"></div>
          <div className="container mx-auto text-center relative z-10">
            <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold mb-4 sm:mb-6 animate-fade-in px-2">
              {language === "en" ? "Find Your Dream Property" : "Temukan Properti Impian Anda"}
            </h1>
            <p className="text-base sm:text-lg lg:text-xl mb-6 sm:mb-8 text-white/90 px-2">
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

        {searchError && (
          <section className="py-4 bg-red-50">
            <div className="container mx-auto px-4">
              <div className="text-center text-red-600 font-medium">
                {searchError}
              </div>
            </div>
          </section>
        )}

        <div className="px-2 sm:px-0">
          <PropertyListingsSection
            language={language}
            searchResults={searchResults}
            isSearching={isSearching}
            hasSearched={hasSearched}
            fallbackResults={featuredProperties}
          />
        </div>

        <ResponsiveAIChatWidget />
        <ProfessionalFooter language={language} />
      </div>
    );
  } catch (error) {
    console.error('❌ Error rendering Index page:', error);
    console.error('Error stack:', error.stack);
    
    return (
      <div style={{ 
        padding: '20px', 
        background: 'orange', 
        color: 'white', 
        fontSize: '18px',
        minHeight: '100vh'
      }}>
        <h1>ERROR IN INDEX PAGE</h1>
        <p>Check the console for details</p>
        <pre>{error.toString()}</pre>
      </div>
    );
  }
};

console.log('8. Index component defined');
console.log('=== INDEX PAGE DEBUG END ===');

export default Index;
