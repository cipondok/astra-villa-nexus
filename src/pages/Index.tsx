
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

  // Fetch featured properties for the homepage
  const { data: featuredProperties = [], isLoading: isFeaturedLoading, refetch: refetchProperties } = useQuery({
    queryKey: ['featured-properties'],
    queryFn: async () => {
      console.log('Fetching featured properties...');
      
      try {
        const { data, error } = await supabase
          .from('properties')
          .select(`
            id,
            title,
            description,
            price,
            property_type,
            location,
            bedrooms,
            bathrooms,
            area_sqm,
            images,
            status,
            created_at,
            state,
            city,
            area,
            listing_type
          `)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(12);

        if (error) {
          console.error('Error fetching featured properties:', error);
          throw error;
        }

        console.log('Featured properties fetched:', data?.length || 0, data);
        return data || [];
      } catch (error) {
        console.error('Failed to fetch properties:', error);
        return [];
      }
    },
    retry: 3,
    retryDelay: 1000,
  });

  const handleSearch = async (searchData: any) => {
    console.log('Search initiated with data:', searchData);
    setIsSearching(true);
    setHasSearched(true);
    
    try {
      let query = supabase
        .from('properties')
        .select(`
          id,
          title,
          description,
          price,
          property_type,
          location,
          bedrooms,
          bathrooms,
          area_sqm,
          images,
          status,
          created_at,
          state,
          city,
          area,
          listing_type
        `)
        .eq('status', 'active');

      // Apply search filters with better logic
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
        .select(`
          id,
          title,
          description,
          price,
          property_type,
          location,
          bedrooms,
          bathrooms,
          area_sqm,
          images,
          status,
          created_at,
          state,
          city,
          area,
          listing_type
        `)
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

  // Use search results if available, otherwise show featured properties
  const displayProperties = hasSearched ? searchResults : featuredProperties;
  const isLoading = hasSearched ? isSearching : isFeaturedLoading;

  // Force refetch if no properties are loaded initially
  useEffect(() => {
    if (!isFeaturedLoading && featuredProperties.length === 0) {
      console.log('No properties found, attempting refetch...');
      setTimeout(() => refetchProperties(), 1000);
    }
  }, [featuredProperties.length, isFeaturedLoading, refetchProperties]);

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
