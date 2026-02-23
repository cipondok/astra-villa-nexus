import React, { useState, useEffect, useRef } from 'react';
import { SEOHead } from '@/components/SEOHead';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, Filter, MapPin, Home, Building2 } from 'lucide-react';
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
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import AIToolsTabBar from '@/components/common/AIToolsTabBar';
import BackToHomeLink from '@/components/common/BackToHomeLink';

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
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [selectedType, setSelectedType] = useState(searchParams.get('type') || 'all');
  const [selectedLocation, setSelectedLocation] = useState(searchParams.get('location') || 'all');
  
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
    price: `Rp ${prop.price?.toLocaleString('id-ID') || '0'}`,
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
      className="min-h-screen bg-background pt-11 md:pt-12"
      {...pullHandlers}
    >
      <SEOHead
        title="Cari Properti"
        description="Cari properti impian Anda di Indonesia. Filter berdasarkan lokasi, tipe properti, harga, dan jumlah kamar untuk hasil pencarian terbaik."
        keywords="cari properti indonesia, search properti, filter properti, properti dijual disewa"
      />
      {/* Luxury Background - matches home page */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-accent/10 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Pull-to-Refresh Indicator */}
      <PullToRefreshIndicator
        isPulling={isPulling}
        isRefreshing={isRefreshing}
        pullDistance={pullDistance}
        indicatorOpacity={indicatorOpacity}
        indicatorRotation={indicatorRotation}
        threshold={threshold}
      />

      <div className="container mx-auto px-2 md:px-3 py-2">
        {/* Back Link */}
        <BackToHomeLink sectionId="ai-tools-section" alwaysShow />
        
        {/* AI Tools Tab Bar */}
        <AIToolsTabBar className="mb-3" />

        {/* Header - Slim, centered */}
        <div className="text-center mb-3">
          <div className="flex items-center justify-center gap-2 mb-1">
            <SearchIcon className="h-4 w-4 md:h-5 md:w-5 text-primary" />
          </div>
          <h1 className="text-sm md:text-lg font-bold text-foreground">Property Search</h1>
          <p className="text-[10px] md:text-xs text-muted-foreground">Find your perfect property</p>
        </div>
      </div>

      {/* Slim Search Header */}
      <div className="bg-background/95 backdrop-blur-2xl border-b border-border/30 sticky top-11 md:top-12 z-40 shadow-sm shadow-black/5 dark:shadow-black/20">
        <div className="container mx-auto px-2 md:px-3 py-2">
          <div className="space-y-2">
            {/* Search Input */}
            <div className="relative">
              <SearchIcon className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search properties, locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-8 h-9 text-xs bg-muted/30 dark:bg-muted/20 border-border/40 rounded-lg focus:bg-background focus:border-primary/40 transition-colors"
              />
            </div>

            {/* Compact Filters */}
            <div className="flex flex-wrap gap-1.5 items-center">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="h-7 text-[10px] md:text-xs w-24 md:w-28 rounded-lg border-border/40 bg-muted/20">
                  <Home className="h-3 w-3 text-muted-foreground mr-1 shrink-0" />
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border z-50">
                  <SelectItem value="all" className="text-xs">All Types</SelectItem>
                  <SelectItem value="villa" className="text-xs">Villa</SelectItem>
                  <SelectItem value="apartment" className="text-xs">Apartment</SelectItem>
                  <SelectItem value="house" className="text-xs">House</SelectItem>
                  <SelectItem value="office" className="text-xs">Office</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="h-7 text-[10px] md:text-xs w-24 md:w-28 rounded-lg border-border/40 bg-muted/20">
                  <MapPin className="h-3 w-3 text-muted-foreground mr-1 shrink-0" />
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border z-50">
                  <SelectItem value="all" className="text-xs">All Locations</SelectItem>
                  <SelectItem value="jakarta" className="text-xs">Jakarta</SelectItem>
                  <SelectItem value="bali" className="text-xs">Bali</SelectItem>
                  <SelectItem value="bandung" className="text-xs">Bandung</SelectItem>
                  <SelectItem value="surabaya" className="text-xs">Surabaya</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                onClick={handleSearch} 
                size="sm"
                className="h-7 text-[10px] md:text-xs px-3 gap-1 rounded-lg"
              >
                <SearchIcon className="h-3 w-3" />
                Search
              </Button>
              
              {(searchTerm || selectedType !== 'all' || selectedLocation !== 'all') && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={clearFilters}
                  className="h-7 text-[10px] md:text-xs px-2 text-muted-foreground hover:text-foreground"
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Slim Results */}
      <div className="container mx-auto px-2 md:px-3 py-3">
        {/* Active Filters */}
        {(searchTerm || selectedType !== 'all' || selectedLocation !== 'all') && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1 mb-1">
              {searchTerm && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">
                  <SearchIcon className="h-2.5 w-2.5 mr-0.5" />
                  "{searchTerm}"
                </Badge>
              )}
              {selectedType !== 'all' && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">
                  <Building2 className="h-2.5 w-2.5 mr-0.5" />
                  {selectedType}
                </Badge>
              )}
              {selectedLocation !== 'all' && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">
                  <MapPin className="h-2.5 w-2.5 mr-0.5" />
                  {selectedLocation}
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground text-[10px] md:text-xs">
              {properties.length} properties found
            </p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse rounded-xl overflow-hidden border border-border/30">
                <div className="bg-muted aspect-[4/3]" />
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-muted rounded-md w-3/4" />
                  <div className="h-3 bg-muted rounded-md w-1/2" />
                  <div className="flex gap-2 pt-1">
                    <div className="h-3 bg-muted rounded-md w-10" />
                    <div className="h-3 bg-muted rounded-md w-10" />
                    <div className="h-3 bg-muted rounded-md w-12" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Compact Results Grid */}
        {!isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
            {properties.map((property) => {
              const isNew = newPropertyIds.has(property.id);
              
              return (
                <motion.div
                  key={property.id}
                  initial={isNew ? { scale: 0.95, opacity: 0 } : false}
                  animate={
                    isNew 
                      ? {
                          scale: [0.95, 1.02, 1],
                          opacity: [0, 1, 1],
                        }
                      : {}
                  }
                  transition={{
                    duration: 0.5,
                    ease: "easeOut"
                  }}
                  className={isNew ? "relative" : ""}
                >
                  {isNew && (
                    <>
                      {/* Pulse Ring Animation */}
                      <motion.div
                        className="absolute inset-0 rounded-lg border-2 border-primary pointer-events-none z-10"
                        initial={{ opacity: 0.8, scale: 1 }}
                        animate={{
                          opacity: [0.8, 0.3, 0],
                          scale: [1, 1.05, 1.1],
                        }}
                        transition={{
                          duration: 2,
                          repeat: 2,
                          ease: "easeOut"
                        }}
                      />
                      
                      {/* "NEW" Badge */}
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="absolute top-1 right-1 z-20 bg-primary text-primary-foreground px-1.5 py-0.5 rounded text-[9px] font-bold shadow"
                      >
                        NEW
                      </motion.div>
                    </>
                  )}
                  
                  <PropertyCard 
                    property={{
                      ...property,
                      id: parseInt(property.id)
                    }}
                  />
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Compact No Results */}
        {!isLoading && properties.length === 0 && (searchTerm || selectedType !== 'all' || selectedLocation !== 'all') && (
          <div className="text-center py-8">
            <SearchIcon className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
            <h3 className="text-sm md:text-base font-semibold mb-1">
              No properties found
            </h3>
            <p className="text-muted-foreground text-[10px] md:text-xs mb-3">
              Try adjusting your search criteria
            </p>
            <Button onClick={clearFilters} variant="outline" size="sm" className="h-7 text-xs">
              Clear filters
            </Button>
          </div>
        )}

        {/* Compact Default State */}
        {!isLoading && properties.length === 0 && !searchTerm && selectedType === 'all' && selectedLocation === 'all' && (
          <div className="text-center py-8">
            <Home className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
            <h3 className="text-sm md:text-base font-semibold mb-1">
              Start your property search
            </h3>
            <p className="text-muted-foreground text-[10px] md:text-xs">
              Enter a location, property type, or keyword to find your perfect property
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;