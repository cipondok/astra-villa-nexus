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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 dark:from-neutral-950 dark:via-neutral-900 dark:to-primary/10 text-foreground pt-12 md:pt-14 lg:pt-16">
      {/* Hero Header Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-amber-500/10 dark:from-primary/20 dark:to-amber-500/20" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-amber-400/20 to-transparent rounded-full blur-3xl dark:from-amber-500/30" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-primary/20 to-transparent rounded-full blur-2xl dark:from-primary/30" />
        
        <main className="relative w-full py-4 md:py-6">
          {/* Page Title */}
          <div className="px-4 mb-4 md:mb-6">
            <h1 className="text-2xl md:text-4xl font-bold mb-1 md:mb-2 bg-gradient-to-r from-foreground via-foreground to-primary/80 dark:from-white dark:via-white dark:to-amber-400 bg-clip-text text-transparent">
              {title}
            </h1>
            <p className="text-xs md:text-base text-muted-foreground dark:text-neutral-400">
              {subtitle}
            </p>
          </div>
          
          {/* Search Filters */}
          <div className="mb-4 md:mb-8">
            <SmartSearchPanel
              language={language}
              onSearch={handleSearch}
            />
          </div>

          {/* Results Count Badge */}
          {!isLoading && !isSearching && (
            <div className="px-4 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-primary/20 to-amber-500/20 dark:from-primary/30 dark:to-amber-500/30 text-foreground dark:text-white border border-primary/20 dark:border-amber-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-primary to-amber-500 animate-pulse" />
                {hasSearched ? searchResults.length : properties.length} properties found
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
