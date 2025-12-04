import { useState, useEffect } from 'react';
import PropertyListingsSection from '@/components/PropertyListingsSection';
import { supabase } from '@/integrations/supabase/client';
import SmartSearchPanel from '@/components/search/SmartSearchPanel';
import { Badge } from '@/components/ui/badge';

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
      try {
        let query = supabase
          .from('properties')
          .select('*')
          .eq('status', 'active')
          .not('title', 'is', null)
          .not('title', 'eq', '')
          .gt('price', 0);

        if (pageType === 'buy') {
          query = query.eq('listing_type', 'sale').in('development_status', ['completed', 'ready']);
        } else if (pageType === 'rent') {
          query = query.eq('listing_type', 'rent').in('development_status', ['completed', 'ready']);
        } else if (pageType === 'new-projects') {
          query = query.eq('development_status', 'new_project');
        } else if (pageType === 'pre-launching') {
          query = query.eq('development_status', 'pre_launching');
        }

        const { data, error } = await query.order('created_at', { ascending: false }).limit(50);

        if (error) {
          setProperties([]);
        } else {
          const validProperties = (data || []).filter(property => 
            property.title && property.title.trim() !== '' && property.price && property.price > 0
          );
          setProperties(validProperties);
        }
      } catch (error) {
        setProperties([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProperties();
  }, [pageType]);

  const handleSearch = async (searchData: any) => {
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

      if (pageType === 'buy') {
        query = query.eq('listing_type', 'sale').in('development_status', ['completed', 'ready']);
      } else if (pageType === 'rent') {
        query = query.eq('listing_type', 'rent').in('development_status', ['completed', 'ready']);
      } else if (pageType === 'new-projects') {
        query = query.eq('development_status', 'new_project');
      } else if (pageType === 'pre-launching') {
        query = query.eq('development_status', 'pre_launching');
      }

      if (searchData.query?.trim()) {
        const searchTerm = searchData.query.toLowerCase().trim();
        query = query.or(`title.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%`);
      }
      if (searchData.state) query = query.eq('state', searchData.state);
      if (searchData.city) query = query.ilike('city', `%${searchData.city}%`);
      if (searchData.propertyType) query = query.eq('property_type', searchData.propertyType);
      if (searchData.priceMin) query = query.gte('price', parseInt(searchData.priceMin));
      if (searchData.priceMax) query = query.lte('price', parseInt(searchData.priceMax));

      const { data, error } = await query.order('created_at', { ascending: false }).limit(30);

      if (error) {
        setSearchResults([]);
      } else {
        const validResults = (data || []).filter(property => 
          property.title && property.title.trim() !== '' && property.price && property.price > 0
        );
        setSearchResults(validResults);
      }
    } catch (error) {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pt-11 md:pt-12 transition-colors duration-300">
      {/* Luxury Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-primary/15 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-accent/15 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-3 md:px-4 pt-1 pb-2 relative">
        {/* Centered Header */}
        <div className="text-center mb-2">
          <h1 className="text-lg md:text-2xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            {title}
          </h1>
          <p className="text-[10px] md:text-xs text-muted-foreground">
            {subtitle}
          </p>
        </div>

        {/* Slim Search Panel */}
        <div className="glass-card p-2 rounded-lg mb-2 border border-primary/20">
          <SmartSearchPanel language={language} onSearch={handleSearch} />
        </div>

        {/* Compact Results Info */}
        <div className="flex items-center justify-between mb-2 text-xs text-muted-foreground">
          <span>{hasSearched ? searchResults.length : properties.length} hasil ditemukan</span>
        </div>

        {/* Property Listings */}
        <PropertyListingsSection
          language={language}
          searchResults={hasSearched ? searchResults : properties}
          hasSearched={hasSearched}
          hideTitle={true}
          isSearching={isSearching || isLoading}
          fallbackResults={properties}
        />
      </div>
    </div>
  );
};

export default PropertyListingPage;
