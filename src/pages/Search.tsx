import React, { useState, useEffect, useRef } from 'react';
import { SEOHead } from '@/components/SEOHead';
import { useTranslation } from '@/i18n/useTranslation';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, Filter, MapPin, Home, Building2, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import PullToRefreshIndicator from '@/components/ui/PullToRefreshIndicator';
import ProfessionalFooter from '@/components/ProfessionalFooter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import PropertyCard from '@/components/PropertyCard';
import { supabase } from '@/integrations/supabase/client';
import { getCurrencyFormatter } from '@/stores/currencyStore';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import AIToolsTabBar from '@/components/common/AIToolsTabBar';
import BackToHomeLink from '@/components/common/BackToHomeLink';
import NLPSearchBar from '@/components/search/NLPSearchBar';

interface Property {
  id: string;
  title: string;
  location: string;
  price: string;
  type: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  image: string;
  rating?: number;
  featured?: boolean;
  description?: string;
  three_d_model_url?: string;
  virtual_tour_url?: string;
}

const Search = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [selectedType, setSelectedType] = useState(searchParams.get('type') || 'all');
  const [selectedLocation, setSelectedLocation] = useState(searchParams.get('location') || 'all');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 28;
  
  // Pull-to-refresh state
  const [newPropertyIds, setNewPropertyIds] = useState<Set<string>>(new Set());
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const previousCountRef = useRef<number>(0);
  const previousPropertyIdsRef = useRef<Set<string>>(new Set());

  const { data: dbProperties = [], isLoading, refetch } = useQuery({
    queryKey: ['search-properties', searchTerm, selectedType, selectedLocation],
    queryFn: async () => {
      let query = supabase.from('properties').select('*');
      
      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%`);
      }
      
      if (selectedType !== 'all') {
        query = query.eq('property_type', selectedType);
      }
      
      if (selectedLocation !== 'all') {
        query = query.ilike('city', `%${selectedLocation}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  // Transform database properties to match the Property interface
  const properties: Property[] = dbProperties.map(prop => ({
    id: prop.id,
    title: prop.title,
    location: prop.location,
    price: getCurrencyFormatter()(prop.price || 0),
    type: prop.property_type || 'unknown',
    bedrooms: prop.bedrooms || 0,
    bathrooms: prop.bathrooms || 0,
    area: prop.area_sqm || 0,
    image: prop.image_urls?.[0] || '/placeholder.svg',
    rating: 4.5,
    featured: false,
    description: prop.description,
    three_d_model_url: prop.three_d_model_url,
    virtual_tour_url: prop.virtual_tour_url,
  }));

  // Pagination
  const totalPages = Math.ceil(properties.length / ITEMS_PER_PAGE);
  const paginatedProperties = properties.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // Reset page when filters change
  useEffect(() => { setCurrentPage(1); }, [searchTerm, selectedType, selectedLocation]);

  // Pull-to-refresh
  const {
    isPulling, pullDistance, isRefreshing,
    indicatorOpacity, indicatorRotation, threshold,
    handlers: pullHandlers,
  } = usePullToRefresh({
    onRefresh: async () => {
      try {
        const result = await refetch();
        const newCount = result.data?.length || 0;
        const previousCount = previousCountRef.current;
        
        const currentPropertyIds = new Set((result.data || []).map((p: any) => p.id));
        const newIds = new Set<string>();
        currentPropertyIds.forEach(id => {
          if (!previousPropertyIdsRef.current.has(id)) {
            newIds.add(id);
          }
        });

        if (newIds.size > 0) {
          setNewPropertyIds(newIds);
        }

        const difference = newCount - previousCount;
        if (difference > 0) {
          toast({
            title: "Search Refreshed",
            description: `Found ${difference} new ${difference === 1 ? 'property' : 'properties'}! Total: ${newCount}`,
          });
        } else if (difference < 0) {
          toast({
            title: "Search Refreshed",
            description: `${Math.abs(difference)} ${Math.abs(difference) === 1 ? 'property' : 'properties'} removed. Total: ${newCount}`,
          });
        } else if (newCount === 0) {
          toast({
            title: "Search Refreshed",
            description: "No properties found matching your criteria",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Search Refreshed",
            description: `${newCount} ${newCount === 1 ? 'property' : 'properties'} found`,
          });
        }
      } catch (error) {
        toast({
          title: "Refresh Failed",
          description: "Unable to refresh search results. Please try again.",
          variant: "destructive"
        });
        throw error;
      }
    },
    threshold: 80,
  });

  // Track property count for refresh notifications
  useEffect(() => {
    if (!isRefreshing && properties.length > 0) {
      previousCountRef.current = properties.length;
      previousPropertyIdsRef.current = new Set(properties.map(p => p.id));
    }
  }, [properties.length, isRefreshing]);

  // Clear new property highlights after 5 seconds
  useEffect(() => {
    if (newPropertyIds.size > 0) {
      const timer = setTimeout(() => {
        setNewPropertyIds(new Set());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [newPropertyIds]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('q', searchTerm);
    if (selectedType !== 'all') params.set('type', selectedType);
    if (selectedLocation !== 'all') params.set('location', selectedLocation);
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedType('all');
    setSelectedLocation('all');
    setSearchParams({});
  };

  return (
    <div 
      ref={scrollContainerRef}
      className="min-h-screen bg-background"
      {...pullHandlers}
    >
      <SEOHead
        title={t('seo.search.title')}
        description={t('seo.search.description')}
        keywords="cari properti indonesia, search properti, filter properti, properti dijual disewa"
      />

      {/* Pull-to-Refresh Indicator */}
      <PullToRefreshIndicator
        isPulling={isPulling}
        isRefreshing={isRefreshing}
        pullDistance={pullDistance}
        indicatorOpacity={indicatorOpacity}
        indicatorRotation={indicatorRotation}
        threshold={threshold}
      />

      {/* Branded Hero Header */}
      <div className="bg-gradient-to-r from-primary via-primary/90 to-chart-1 dark:from-[#0a1628] dark:via-[#0d1f3c] dark:to-[#081225] pt-14 md:pt-16 pb-5 sm:pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-3">
            <BackToHomeLink sectionId="ai-tools-section" alwaysShow />
          </div>
          <h1 className="font-playfair text-xl sm:text-2xl lg:text-3xl font-bold text-primary-foreground mb-1">
            Property Search
          </h1>
          <p className="text-primary-foreground/70 text-xs sm:text-sm">
            Discover your perfect property across Indonesia
          </p>
        </div>
      </div>

      {/* AI Tools + NLP Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <AIToolsTabBar className="mb-3" />
        <NLPSearchBar
          onApplyFilters={(params) => {
            if (params.state) setSelectedLocation(params.state.toLowerCase());
            if (params.propertyType) setSelectedType(params.propertyType);
            if (params.query) setSearchTerm(params.query);
            const urlParams = new URLSearchParams();
            if (params.state) urlParams.set('location', params.state.toLowerCase());
            if (params.propertyType) urlParams.set('type', params.propertyType);
            setSearchParams(urlParams);
          }}
          className="mb-3"
        />
      </div>

      {/* Sticky Search & Filter Bar */}
      <div className="bg-card/95 backdrop-blur-xl border-y border-border/40 sticky top-11 md:top-12 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[180px] max-w-md">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search properties, locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-9 h-10 text-sm bg-muted/30 border-border/40 rounded-xl focus:bg-background focus:border-primary/50 transition-colors"
              />
            </div>

            {/* Type Filter */}
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="h-10 text-xs sm:text-sm w-28 sm:w-32 rounded-xl border-border/40 bg-muted/20">
                <Home className="h-3.5 w-3.5 text-muted-foreground mr-1.5 shrink-0" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border z-50">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="villa">Villa</SelectItem>
                <SelectItem value="apartment">Apartment</SelectItem>
                <SelectItem value="house">House</SelectItem>
                <SelectItem value="office">Office</SelectItem>
              </SelectContent>
            </Select>

            {/* Location Filter */}
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger className="h-10 text-xs sm:text-sm w-28 sm:w-32 rounded-xl border-border/40 bg-muted/20">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground mr-1.5 shrink-0" />
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border z-50">
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="jakarta">Jakarta</SelectItem>
                <SelectItem value="bali">Bali</SelectItem>
                <SelectItem value="bandung">Bandung</SelectItem>
                <SelectItem value="surabaya">Surabaya</SelectItem>
              </SelectContent>
            </Select>

            {/* Search Button */}
            <Button 
              onClick={handleSearch} 
              className="h-10 px-5 gap-1.5 rounded-xl bg-primary hover:bg-primary/90 text-sm font-semibold"
            >
              <SearchIcon className="h-4 w-4" />
              Search
            </Button>
            
            {(searchTerm || selectedType !== 'all' || selectedLocation !== 'all') && (
              <Button 
                variant="ghost" 
                onClick={clearFilters}
                className="h-10 px-3 text-sm text-muted-foreground hover:text-foreground"
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Results Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
        {/* Active Filters & Count */}
        {(searchTerm || selectedType !== 'all' || selectedLocation !== 'all') && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {searchTerm && (
              <Badge variant="secondary" className="text-xs px-2.5 py-1 rounded-lg gap-1">
                <SearchIcon className="h-3 w-3" />
                "{searchTerm}"
              </Badge>
            )}
            {selectedType !== 'all' && (
              <Badge variant="secondary" className="text-xs px-2.5 py-1 rounded-lg gap-1">
                <Building2 className="h-3 w-3" />
                {selectedType}
              </Badge>
            )}
            {selectedLocation !== 'all' && (
              <Badge variant="secondary" className="text-xs px-2.5 py-1 rounded-lg gap-1">
                <MapPin className="h-3 w-3" />
                {selectedLocation}
              </Badge>
            )}
            <span className="text-muted-foreground text-xs ml-auto">
              {properties.length} properties found
            </span>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl overflow-hidden border border-border/30 bg-card">
                <div className="bg-muted aspect-[4/3]" />
                <div className="p-4 space-y-2.5">
                  <div className="h-4 bg-muted rounded-md w-3/4" />
                  <div className="h-3 bg-muted rounded-md w-1/2" />
                  <div className="flex gap-2 pt-1">
                    <div className="h-3 bg-muted rounded-md w-12" />
                    <div className="h-3 bg-muted rounded-md w-12" />
                    <div className="h-3 bg-muted rounded-md w-14" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Results Grid */}
        {!isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {paginatedProperties.map((property) => {
              const isNew = newPropertyIds.has(property.id);
              
              return (
                <motion.div
                  key={property.id}
                  initial={isNew ? { scale: 0.95, opacity: 0 } : false}
                  animate={isNew ? { scale: [0.95, 1.02, 1], opacity: [0, 1, 1] } : {}}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className={isNew ? "relative" : ""}
                >
                  {isNew && (
                    <>
                      <motion.div
                        className="absolute inset-0 rounded-2xl border-2 border-primary pointer-events-none z-10"
                        initial={{ opacity: 0.8, scale: 1 }}
                        animate={{ opacity: [0.8, 0.3, 0], scale: [1, 1.05, 1.1] }}
                        transition={{ duration: 2, repeat: 2, ease: "easeOut" }}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="absolute top-2 right-2 z-20 bg-primary text-primary-foreground px-2 py-0.5 rounded-lg text-[10px] font-bold shadow-lg"
                      >
                        NEW
                      </motion.div>
                    </>
                  )}
                  
                  <PropertyCard 
                    property={{ ...property, id: parseInt(property.id) }}
                  />
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              disabled={currentPage === 1}
              className="h-9 px-3 rounded-xl gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </Button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
              .reduce((acc: (number | string)[], page, idx, arr) => {
                if (idx > 0 && typeof arr[idx - 1] === 'number' && page - (arr[idx - 1] as number) > 1) {
                  acc.push('...');
                }
                acc.push(page);
                return acc;
              }, [])
              .map((item, idx) => 
                item === '...' ? (
                  <span key={`dot-${idx}`} className="px-1 text-muted-foreground text-sm">…</span>
                ) : (
                  <Button
                    key={item}
                    variant={currentPage === item ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => { setCurrentPage(item as number); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className={`h-9 w-9 rounded-xl text-sm ${currentPage === item ? 'bg-primary text-primary-foreground' : ''}`}
                  >
                    {item}
                  </Button>
                )
              )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setCurrentPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              disabled={currentPage === totalPages}
              className="h-9 px-3 rounded-xl gap-1"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
            
            <span className="text-xs text-muted-foreground ml-2">
              {properties.length} total
            </span>
          </div>
        )}

        {/* No Results */}
        {!isLoading && properties.length === 0 && (searchTerm || selectedType !== 'all' || selectedLocation !== 'all') && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <SearchIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1">
              No properties found
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              Try adjusting your search criteria
            </p>
            <Button onClick={clearFilters} variant="outline" className="rounded-xl">
              Clear filters
            </Button>
          </div>
        )}

        {/* Default State */}
        {!isLoading && properties.length === 0 && !searchTerm && selectedType === 'all' && selectedLocation === 'all' && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Home className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1">
              Start your property search
            </h3>
            <p className="text-muted-foreground text-sm">
              Enter a location, property type, or keyword to find your perfect property
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;