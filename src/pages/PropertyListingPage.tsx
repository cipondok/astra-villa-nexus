import { useState, useEffect } from 'react';
import PropertyListingsSection from '@/components/PropertyListingsSection';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, SlidersHorizontal, MapPin, Home, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import BackToHomeLink from '@/components/common/BackToHomeLink';

interface PropertyListingPageProps {
  pageType: 'buy' | 'rent' | 'new-projects' | 'pre-launching';
  title: string;
  subtitle: string;
}

// Demo projects for pre-launching offers
const demoPreLaunchingProjects = [
  {
    id: 'demo-pl-1',
    title: 'ASTRA Luxury Residence - Phase 1',
    price: 1850000000,
    location: 'Kemang, Jakarta Selatan',
    city: 'Jakarta Selatan',
    province: 'DKI Jakarta',
    property_type: 'apartment',
    listing_type: 'sale',
    bedrooms: 2,
    bathrooms: 2,
    area_sqm: 95,
    images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800'],
    development_status: 'pre_launching',
    status: 'active'
  },
  {
    id: 'demo-pl-2',
    title: 'Sunset Villa Collection',
    price: 5200000000,
    location: 'Seminyak, Bali',
    city: 'Seminyak',
    province: 'Bali',
    property_type: 'villa',
    listing_type: 'sale',
    bedrooms: 4,
    bathrooms: 4,
    area_sqm: 380,
    images: ['https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800'],
    development_status: 'pre_launching',
    status: 'active'
  },
  {
    id: 'demo-pl-3',
    title: 'Emerald Business Park',
    price: 3800000000,
    location: 'BSD City, Tangerang',
    city: 'Tangerang',
    province: 'Banten',
    property_type: 'commercial',
    listing_type: 'sale',
    bedrooms: 0,
    bathrooms: 4,
    area_sqm: 600,
    images: ['https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800'],
    development_status: 'pre_launching',
    status: 'active'
  },
  {
    id: 'demo-pl-4',
    title: 'Highland Garden Homes',
    price: 2400000000,
    location: 'Lembang, Bandung',
    city: 'Bandung',
    province: 'Jawa Barat',
    property_type: 'house',
    listing_type: 'sale',
    bedrooms: 3,
    bathrooms: 3,
    area_sqm: 180,
    images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800'],
    development_status: 'pre_launching',
    status: 'active'
  },
  {
    id: 'demo-pl-5',
    title: 'Ocean View Penthouse',
    price: 9500000000,
    location: 'Nusa Dua, Bali',
    city: 'Nusa Dua',
    province: 'Bali',
    property_type: 'penthouse',
    listing_type: 'sale',
    bedrooms: 5,
    bathrooms: 5,
    area_sqm: 520,
    images: ['https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800'],
    development_status: 'pre_launching',
    status: 'active'
  },
  {
    id: 'demo-pl-6',
    title: 'Prime Land Investment',
    price: 1200000000,
    location: 'Puncak, Bogor',
    city: 'Bogor',
    province: 'Jawa Barat',
    property_type: 'land',
    listing_type: 'sale',
    bedrooms: 0,
    bathrooms: 0,
    area_sqm: 1000,
    images: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800'],
    development_status: 'pre_launching',
    status: 'active'
  }
];

const PropertyListingPage = ({ pageType, title, subtitle }: PropertyListingPageProps) => {
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    propertyType: 'all',
    city: 'all',
    priceRange: 'all'
  });
  const language = 'en';

  useEffect(() => {
    fetchProperties();
  }, [pageType]);

  const fetchProperties = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('properties')
        .select('*')
        .eq('status', 'active')
        .not('title', 'is', null)
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
      if (!error) {
        const realData = (data || []).filter(p => p.title?.trim() && p.price > 0);
        // Use demo data for pre-launching if no real data
        if (realData.length === 0 && pageType === 'pre-launching') {
          setProperties(demoPreLaunchingProjects);
        } else {
          setProperties(realData);
        }
      }
    } catch (e) {
      // Fallback to demo data for pre-launching
      if (pageType === 'pre-launching') {
        setProperties(demoPreLaunchingProjects);
      } else {
        setProperties([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    setIsSearching(true);
    setHasSearched(true);
    
    try {
      let query = supabase
        .from('properties')
        .select('*')
        .eq('status', 'active')
        .not('title', 'is', null)
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

      if (searchQuery.trim()) {
        query = query.or(`title.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%`);
      }
      if (filters.propertyType !== 'all') query = query.eq('property_type', filters.propertyType);
      if (filters.city !== 'all') query = query.ilike('city', `%${filters.city}%`);

      const { data } = await query.order('created_at', { ascending: false }).limit(30);
      setSearchResults((data || []).filter(p => p.title?.trim() && p.price > 0));
    } catch (e) {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const activeFiltersCount = [
    filters.propertyType !== 'all',
    filters.city !== 'all',
    filters.priceRange !== 'all'
  ].filter(Boolean).length;

  const clearFilters = () => {
    setFilters({ propertyType: 'all', city: 'all', priceRange: 'all' });
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-background text-foreground pt-11 md:pt-12 transition-colors duration-300">
      {/* Luxury Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-primary/15 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-accent/15 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-3 md:px-4 pt-1 pb-4 relative">
        {/* Back Link */}
        <BackToHomeLink sectionId={`${pageType}-section`} />

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
        <div className="glass-card p-2 rounded-lg mb-3 border border-primary/20">
          <div className="flex gap-2 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search properties..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-8 h-9 text-sm bg-input border-primary/20 focus:border-primary focus:ring-primary/30"
              />
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={`h-9 px-3 border-primary/30 ${showFilters ? 'bg-primary/10 text-primary' : ''}`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              {activeFiltersCount > 0 && (
                <span className="ml-1.5 h-5 w-5 flex items-center justify-center text-[10px] bg-primary text-primary-foreground rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </Button>

            <Button 
              onClick={handleSearch}
              size="sm"
              className="h-9 px-4 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground"
              disabled={isSearching}
            >
              <Search className="h-4 w-4 mr-1.5" />
              {isSearching ? '...' : 'Search'}
            </Button>
          </div>

          {/* Collapsible Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="pt-2 mt-2 border-t border-primary/10 space-y-2">
                  {activeFiltersCount > 0 && (
                    <div className="flex justify-end">
                      <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 text-xs text-destructive">
                        <X className="h-3 w-3 mr-1" />
                        Clear
                      </Button>
                    </div>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    <Select value={filters.propertyType} onValueChange={(v) => setFilters(p => ({ ...p, propertyType: v }))}>
                      <SelectTrigger className="h-8 text-xs bg-popover border-border">
                        <Home className="h-3 w-3 mr-1.5" />
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border z-50">
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="apartment">Apartment</SelectItem>
                        <SelectItem value="house">House</SelectItem>
                        <SelectItem value="villa">Villa</SelectItem>
                        <SelectItem value="land">Land</SelectItem>
                        <SelectItem value="commercial">Commercial</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={filters.city} onValueChange={(v) => setFilters(p => ({ ...p, city: v }))}>
                      <SelectTrigger className="h-8 text-xs bg-popover border-border">
                        <MapPin className="h-3 w-3 mr-1.5" />
                        <SelectValue placeholder="City" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border z-50">
                        <SelectItem value="all">All Cities</SelectItem>
                        <SelectItem value="Jakarta">Jakarta</SelectItem>
                        <SelectItem value="Bali">Bali</SelectItem>
                        <SelectItem value="Surabaya">Surabaya</SelectItem>
                        <SelectItem value="Bandung">Bandung</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={filters.priceRange} onValueChange={(v) => setFilters(p => ({ ...p, priceRange: v }))}>
                      <SelectTrigger className="h-8 text-xs bg-popover border-border">
                        <SelectValue placeholder="Price" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border z-50">
                        <SelectItem value="all">Any Price</SelectItem>
                        <SelectItem value="0-500m">&lt; 500 Jt</SelectItem>
                        <SelectItem value="500m-1b">500 Jt - 1 M</SelectItem>
                        <SelectItem value="1b-5b">1 - 5 M</SelectItem>
                        <SelectItem value="5b+">5 M+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-2 text-xs text-muted-foreground">
          <span>{hasSearched ? searchResults.length : properties.length} properties found</span>
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
