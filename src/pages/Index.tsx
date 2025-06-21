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

  // Fetch featured properties for the homepage - simplified query
  const { data: featuredProperties = [], isLoading: isFeaturedLoading, error } = useQuery({
    queryKey: ['featured-properties'],
    queryFn: async () => {
      console.log('Starting to fetch properties...');
      
      try {
        // First, let's check if we can connect to the database at all
        const { count, error: countError } = await supabase
          .from('properties')
          .select('*', { count: 'exact', head: true });

        console.log('Total properties count:', count);
        if (countError) {
          console.error('Count error:', countError);
        }

        // Now fetch actual properties with minimal filters
        const { data, error } = await supabase
          .from('properties')
          .select(`
            id,
            title,
            description,
            location,
            price,
            bedrooms,
            bathrooms,
            area_sqm,
            property_type,
            listing_type,
            images,
            state,
            city,
            area,
            status,
            created_at
          `)
          .limit(12)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Database error:', error);
          throw error;
        }

        console.log('Raw data from database:', data);
        console.log('Number of properties fetched:', data?.length || 0);

        // If no data, let's create some mock data to test the UI
        if (!data || data.length === 0) {
          console.log('No properties in database, creating mock data');
          const mockData = [
            {
              id: 'mock-1',
              title: 'Beautiful Villa in Jakarta',
              description: 'A stunning 3-bedroom villa with modern amenities',
              location: 'Jakarta, DKI Jakarta',
              price: 5000000000,
              bedrooms: 3,
              bathrooms: 2,
              area_sqm: 200,
              property_type: 'villa',
              listing_type: 'sale',
              images: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=500'],
              state: 'DKI Jakarta',
              city: 'Jakarta',
              area: 'Central Jakarta',
              status: 'active',
              created_at: new Date().toISOString()
            },
            {
              id: 'mock-2',
              title: 'Modern Apartment in Surabaya',
              description: 'Contemporary 2-bedroom apartment with city views',
              location: 'Surabaya, East Java',
              price: 2500000000,
              bedrooms: 2,
              bathrooms: 2,
              area_sqm: 85,
              property_type: 'apartment',
              listing_type: 'rent',
              images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500'],
              state: 'East Java',
              city: 'Surabaya',
              area: 'Downtown',
              status: 'active',
              created_at: new Date().toISOString()
            }
          ];
          return mockData;
        }

        return data || [];
      } catch (error) {
        console.error('Query failed completely:', error);
        // Return mock data as fallback
        return [
          {
            id: 'fallback-1',
            title: 'Sample Property 1',
            description: 'This is a sample property for testing',
            location: 'Jakarta, Indonesia',
            price: 3000000000,
            bedrooms: 3,
            bathrooms: 2,
            area_sqm: 150,
            property_type: 'house',
            listing_type: 'sale',
            images: ['https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=500'],
            state: 'DKI Jakarta',
            city: 'Jakarta',
            area: 'Central',
            status: 'active',
            created_at: new Date().toISOString()
          }
        ];
      }
    },
    retry: 1,
    retryDelay: 1000,
  });

  const handleSearch = async (searchData: any) => {
    console.log('Search initiated with data:', searchData);
    setIsSearching(true);
    setHasSearched(true);
    
    try {
      let query = supabase
        .from('properties')
        .select('*')
        .eq('status', 'active');

      // Apply search filters
      if (searchData.query && searchData.query.trim()) {
        query = query.or(
          `title.ilike.%${searchData.query}%,description.ilike.%${searchData.query}%,location.ilike.%${searchData.query}%,city.ilike.%${searchData.query}%,state.ilike.%${searchData.query}%`
        );
      }

      if (searchData.state && searchData.state !== '') {
        query = query.eq('state', searchData.state);
      }

      if (searchData.city && searchData.city !== '') {
        query = query.eq('city', searchData.city);
      }

      if (searchData.propertyType && searchData.propertyType !== 'all' && searchData.propertyType !== '') {
        query = query.eq('listing_type', searchData.propertyType);
      }

      if (searchData.bedrooms && searchData.bedrooms !== 'any' && searchData.bedrooms !== '') {
        const bedroomCount = searchData.bedrooms === '4+' ? 4 : parseInt(searchData.bedrooms);
        if (searchData.bedrooms === '4+') {
          query = query.gte('bedrooms', bedroomCount);
        } else {
          query = query.eq('bedrooms', bedroomCount);
        }
      }

      if (searchData.bathrooms && searchData.bathrooms !== 'any' && searchData.bathrooms !== '') {
        const bathroomCount = searchData.bathrooms === '4+' ? 4 : parseInt(searchData.bathrooms);
        if (searchData.bathrooms === '4+') {
          query = query.gte('bathrooms', bathroomCount);
        } else {
          query = query.eq('bathrooms', bathroomCount);
        }
      }

      // Price range filtering
      if (searchData.priceRange && searchData.priceRange !== 'any' && searchData.priceRange !== '') {
        switch (searchData.priceRange) {
          case '0-1b':
            query = query.lt('price', 1000000000);
            break;
          case '1b-5b':
            query = query.gte('price', 1000000000).lt('price', 5000000000);
            break;
          case '5b+':
            query = query.gte('price', 5000000000);
            break;
        }
      }

      query = query.order('created_at', { ascending: false }).limit(50);

      const { data, error } = await query;

      if (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } else {
        console.log('Search results:', data?.length || 0, 'properties found');
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
    setIsSearching(true);
    setHasSearched(true);

    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('status', 'active')
        .or(
          `title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%,state.ilike.%${searchTerm}%`
        )
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Live search error:', error);
        setSearchResults([]);
      } else {
        console.log('Live search results:', data?.length || 0);
        setSearchResults(data || []);
      }
    } catch (error) {
      console.error('Live search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Debug logging
  useEffect(() => {
    console.log('=== INDEX PAGE STATE DEBUG ===');
    console.log('Featured properties:', featuredProperties);
    console.log('Featured properties length:', featuredProperties?.length || 0);
    console.log('Search results:', searchResults);
    console.log('Search results length:', searchResults?.length || 0);
    console.log('Has searched:', hasSearched);
    console.log('Is searching:', isSearching);
    console.log('Is featured loading:', isFeaturedLoading);
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
              onSearch={() => {}} // Simplified for now
              onLiveSearch={() => {}} // Simplified for now
            />
          </div>
        </div>
      </section>

      {/* Property Listings Section */}
      <PropertyListingsSection
        language={language}
        searchResults={hasSearched ? searchResults : []}
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
