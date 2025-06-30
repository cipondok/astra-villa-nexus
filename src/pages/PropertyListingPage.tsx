
import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import ProfessionalFooter from '@/components/ProfessionalFooter';
import PropertyListingsSection from '@/components/PropertyListingsSection';
import SearchFilters from '@/components/SearchFilters';
import { supabase } from '@/integrations/supabase/client';

interface PropertyListingPageProps {
  pageType: 'buy' | 'rent' | 'new-projects' | 'pre-launching';
  title: string;
  subtitle: string;
}

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
        if (minPrice) query = query.gte('price', minPrice);
        if (maxPrice && maxPrice < 999999999999) query = query.lte('price', maxPrice);
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
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <main className="container mx-auto px-4 py-6 pt-20">
        <h1 className="text-4xl font-bold mb-2">{title}</h1>
        <p className="text-muted-foreground mb-6">{subtitle}</p>
        
        {/* Search Filters */}
        <div className="mb-8">
          <SearchFilters
            language={language}
            onSearch={handleSearch}
          />
        </div>

        {/* Property Listings */}
        <div className="mt-6">
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
      <ProfessionalFooter language="en" />
    </div>
  );
};

export default PropertyListingPage;
