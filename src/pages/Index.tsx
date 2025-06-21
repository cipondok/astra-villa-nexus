
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
  const { language } = useLanguage();
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Fetch featured properties with comprehensive error handling
  const { data: featuredProperties = [], isLoading: isFeaturedLoading, error } = useQuery({
    queryKey: ['featured-properties'],
    queryFn: async () => {
      console.log('=== STARTING PROPERTY FETCH ===');
      
      try {
        // Test basic connection first
        console.log('Testing Supabase connection...');
        const { data: testData, error: testError } = await supabase
          .from('properties')
          .select('count', { count: 'exact', head: true });

        if (testError) {
          console.error('Connection test failed:', testError);
          throw testError;
        }
        
        console.log('Connection successful. Total properties in DB:', testData);

        // Now try to fetch actual data with minimal query
        console.log('Fetching properties...');
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .limit(20);

        if (error) {
          console.error('Query error:', error);
          throw error;
        }

        console.log('Raw query result:', data);
        console.log('Properties found:', data?.length || 0);

        // If we got properties, return them
        if (data && data.length > 0) {
          console.log('Returning actual properties:', data.length);
          return data;
        }

        // If no properties in database, create test data
        console.log('No properties found, creating test data...');
        const testProperties = [
          {
            id: 'test-1',
            title: 'Beautiful Modern Villa',
            description: 'A stunning 4-bedroom villa with ocean views',
            location: 'Bali, Indonesia',
            price: 5000000000,
            bedrooms: 4,
            bathrooms: 3,
            area_sqm: 300,
            property_type: 'villa',
            listing_type: 'sale',
            images: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&h=400&fit=crop'],
            state: 'Bali',
            city: 'Denpasar',
            area: 'Sanur',
            status: 'active',
            created_at: new Date().toISOString()
          },
          {
            id: 'test-2',
            title: 'Luxury Apartment Downtown',
            description: 'Premium apartment in the heart of the city',
            location: 'Jakarta, Indonesia',
            price: 3500000000,
            bedrooms: 2,
            bathrooms: 2,
            area_sqm: 120,
            property_type: 'apartment',
            listing_type: 'rent',
            images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&h=400&fit=crop'],
            state: 'DKI Jakarta',
            city: 'Jakarta',
            area: 'Central Jakarta',
            status: 'active',
            created_at: new Date().toISOString()
          },
          {
            id: 'test-3',
            title: 'Family House with Garden',
            description: 'Comfortable family home with beautiful garden',
            location: 'Surabaya, Indonesia',
            price: 2500000000,
            bedrooms: 3,
            bathrooms: 2,
            area_sqm: 200,
            property_type: 'house',
            listing_type: 'sale',
            images: ['https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&h=400&fit=crop'],
            state: 'East Java',
            city: 'Surabaya',
            area: 'Surabaya Timur',
            status: 'active',
            created_at: new Date().toISOString()
          }
        ];

        console.log('Returning test properties:', testProperties.length);
        return testProperties;

      } catch (error) {
        console.error('Complete fetch failed:', error);
        
        // Return minimal fallback data even on complete failure
        const fallbackProperties = [
          {
            id: 'fallback-1',
            title: 'Sample Property (Fallback)',
            description: 'This is sample data displayed due to connection issues',
            location: 'Indonesia',
            price: 1000000000,
            bedrooms: 2,
            bathrooms: 1,
            area_sqm: 100,
            property_type: 'house',
            listing_type: 'sale',
            images: ['https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=400&fit=crop'],
            state: 'Sample State',
            city: 'Sample City',
            area: 'Sample Area',
            status: 'active',
            created_at: new Date().toISOString()
          }
        ];
        
        console.log('Returning fallback properties due to error');
        return fallbackProperties;
      }
    },
    retry: false, // Don't retry to see errors immediately
    refetchOnWindowFocus: false,
  });

  const handleSearch = async (searchData: any) => {
    console.log('=== SEARCH INITIATED ===');
    console.log('Search data:', searchData);
    
    setIsSearching(true);
    setHasSearched(true);
    
    try {
      // For now, just filter the featured properties
      const filtered = featuredProperties.filter(property => {
        if (!searchData.query) return true;
        
        const searchTerm = searchData.query.toLowerCase();
        return (
          property.title?.toLowerCase().includes(searchTerm) ||
          property.location?.toLowerCase().includes(searchTerm) ||
          property.city?.toLowerCase().includes(searchTerm) ||
          property.state?.toLowerCase().includes(searchTerm)
        );
      });
      
      console.log('Filtered results:', filtered.length);
      setSearchResults(filtered);
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

      {/* AI Chat Widget */}
      <ResponsiveAIChatWidget />

      {/* Footer */}
      <ProfessionalFooter language={language} />
    </div>
  );
};

export default Index;
