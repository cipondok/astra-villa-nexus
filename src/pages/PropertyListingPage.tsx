import { useState, useEffect } from 'react';
import PropertyListingsSection from '@/components/PropertyListingsSection';
import { supabase } from '@/integrations/supabase/client';

interface PropertyListingPageProps {
  pageType: 'buy' | 'rent' | 'new-projects' | 'pre-launching';
  title: string;
  subtitle: string;
}

import SmartSearchPanel from '@/components/search/SmartSearchPanel';

const PropertyListingPage = ({ pageType, title, subtitle }: PropertyListingPageProps) => {
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const language = 'en';

  useEffect(() => {
    const fetchProperties = async () => {
      setIsLoading(true);
      console.log(`Fetching ${pageType} properties from database...`);
      
      try {
        let query = supabase
          .from('properties')
          .select('*')
          .eq('status', 'active')
          .not('title', 'is', null)
          .not('title', 'eq', '')
          .gt('price', 0);

        // Apply filters based on page type
        if (pageType === 'buy') {
          query = query
            .eq('listing_type', 'sale')
            .in('development_status', ['completed', 'ready']);
        } else if (pageType === 'rent') {
          query = query
            .eq('listing_type', 'rent')
            .in('development_status', ['completed', 'ready']);
        } else if (pageType === 'new-projects') {
          query = query.eq('development_status', 'new_project');
        } else if (pageType === 'pre-launching') {
          query = query.eq('development_status', 'pre_launching');
        }

        const { data, error } = await query
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) {
          console.error(`Database error for ${pageType}:`, error);
          setProperties([]);
        } else {
          console.log(`Found ${data?.length || 0} ${pageType} properties in database`);
          const validProperties = (data || []).filter(property => 
            property.title && 
            property.title.trim() !== '' &&
            property.price && 
            property.price > 0
          );
          setProperties(validProperties);
        }

      } catch (error) {
        console.error(`Error fetching ${pageType} properties:`, error);
        setProperties([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperties();
  }, [pageType]);

  const handleSearch = async (searchData: any) => {
    console.log('Search initiated:', searchData);
    
    setIsSearching(true);
    setHasSearched(true);
    
    try {
      let query = supabase
        .from('properties')
        .select('*')
        .eq('status', 'active')
        .not('title', 'is', null)
        .not('title', 'eq', '')
        .gt('price', 0);

      // Apply page type filters
      if (pageType === 'buy') {
        query = query
          .eq('listing_type', 'sale')
          .in('development_status', ['completed', 'ready']);
      } else if (pageType === 'rent') {
        query = query
          .eq('listing_type', 'rent')
          .in('development_status', ['completed', 'ready']);
      } else if (pageType === 'new-projects') {
        query = query.eq('development_status', 'new_project');
      } else if (pageType === 'pre-launching') {
        query = query.eq('development_status', 'pre_launching');
      }

      // Apply search filters
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

      // Smart bedroom filtering
      if (searchData.bedrooms && searchData.bedrooms.length > 0) {
        const bedroomConditions = searchData.bedrooms.map((count: number) => `bedrooms.gte.${count}`);
        if (bedroomConditions.length === 1) {
          query = query.gte('bedrooms', searchData.bedrooms[0]);
        } else {
          query = query.or(bedroomConditions.join(','));
        }
      }

      // Smart bathroom filtering
      if (searchData.bathrooms && searchData.bathrooms.length > 0) {
        const bathroomConditions = searchData.bathrooms.map((count: number) => `bathrooms.gte.${count}`);
        if (bathroomConditions.length === 1) {
          query = query.gte('bathrooms', searchData.bathrooms[0]);
        } else {
          query = query.or(bathroomConditions.join(','));
        }
      }

      if (searchData.priceMin) {
        query = query.gte('price', parseInt(searchData.priceMin));
      }

      if (searchData.priceMax) {
        query = query.lte('price', parseInt(searchData.priceMax));
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(30);

      if (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } else {
        const validResults = (data || []).filter(property => 
          property.title && 
          property.title.trim() !== '' &&
          property.price && 
          property.price > 0
        );
        console.log('Search results:', validResults.length);
        setSearchResults(validResults);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-[hsl(45,30%,97%)] dark:bg-[hsl(0,0%,8%)] text-[hsl(0,0%,12%)] dark:text-[hsl(0,0%,92%)] pt-12 md:pt-14 lg:pt-16 transition-colors duration-300">
      {/* Hero Header Section */}
      <div className="relative overflow-hidden">
        {/* Luxury Background Effects - Light Mode */}
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(48,95%,45%)]/10 via-transparent to-[hsl(42,85%,55%)]/10 dark:from-[hsl(48,100%,50%)]/15 dark:via-transparent dark:to-[hsl(45,90%,60%)]/15" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-[hsl(48,95%,45%)]/20 dark:from-[hsl(48,100%,50%)]/25 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-[hsl(42,85%,55%)]/20 dark:from-[hsl(45,90%,60%)]/25 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[hsl(48,95%,45%)]/5 dark:bg-[hsl(48,100%,50%)]/10 rounded-full blur-2xl" />
        
        <main className="relative w-full py-4 md:py-6">
          {/* Page Title with Luxury Styling */}
          <div className="px-4 mb-4 md:mb-6">
            <div className="inline-block">
              <h1 className="text-2xl md:text-4xl font-bold mb-1 md:mb-2 bg-gradient-to-r from-[hsl(48,95%,45%)] to-[hsl(42,85%,55%)] dark:from-[hsl(48,100%,50%)] dark:to-[hsl(45,90%,60%)] bg-clip-text text-transparent">
                {title}
              </h1>
              <div className="h-0.5 w-full bg-gradient-to-r from-[hsl(48,95%,45%)] via-[hsl(42,85%,55%)] to-[hsl(48,95%,45%)]/50 dark:from-[hsl(48,100%,50%)] dark:via-[hsl(45,90%,60%)] dark:to-[hsl(48,100%,50%)]/50 rounded-full" />
            </div>
            <p className="text-xs md:text-base text-[hsl(0,0%,40%)] dark:text-[hsl(0,0%,70%)] mt-2">
              {subtitle}
            </p>
          </div>
          
          {/* Search Filters with Glass Effect */}
          <div className="mb-4 md:mb-8 px-2 md:px-4">
            <SmartSearchPanel
              language={language}
              onSearch={handleSearch}
            />
          </div>

          {/* Results Count Badge with Luxury Styling */}
          {!isLoading && !isSearching && (
            <div className="px-4 mb-3">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold 
                bg-[rgba(255,253,248,0.85)] dark:bg-[rgba(25,25,25,0.8)] 
                border border-[hsl(48,95%,45%)]/30 dark:border-[hsl(48,100%,50%)]/30 
                shadow-lg shadow-[hsl(48,95%,45%)]/10 dark:shadow-[hsl(48,100%,50%)]/20
                backdrop-blur-xl">
                <span className="w-2 h-2 rounded-full bg-gradient-to-r from-[hsl(48,95%,45%)] to-[hsl(42,85%,55%)] dark:from-[hsl(48,100%,50%)] dark:to-[hsl(45,90%,60%)] animate-pulse" />
                <span className="text-[hsl(0,0%,12%)] dark:text-[hsl(0,0%,92%)]">
                  {hasSearched ? searchResults.length : properties.length} properties found
                </span>
              </span>
            </div>
          )}

          {/* Property Listings */}
          <div className="mt-4 md:mt-6">
            <PropertyListingsSection
              language={language}
              searchResults={hasSearched ? searchResults : properties}
              hasSearched={hasSearched}
              hideTitle={false}
              isSearching={isSearching || isLoading}
              fallbackResults={properties}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default PropertyListingPage;
