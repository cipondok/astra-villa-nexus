import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, Filter, MapPin, Home, Building2, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [newPropertyIds, setNewPropertyIds] = useState<Set<string>>(new Set());
  const touchStartY = useRef(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const previousCountRef = useRef<number>(0);
  const previousPropertyIdsRef = useRef<Set<string>>(new Set());
  const PULL_THRESHOLD = 80; // Pixels to pull before triggering refresh

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

  // Track property count for refresh notifications
  useEffect(() => {
    if (!isRefreshing && properties.length > 0) {
      previousCountRef.current = properties.length;
      // Store current property IDs for comparison on next refresh
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

  // Pull-to-refresh handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    // Only enable pull-to-refresh at the top of the page
    if (window.scrollY === 0) {
      touchStartY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling || window.scrollY > 0) return;

    const currentY = e.touches[0].clientY;
    const distance = currentY - touchStartY.current;

    // Only track downward pulls
    if (distance > 0) {
      // Add resistance - the further you pull, the harder it gets
      const resistedDistance = Math.min(distance * 0.5, PULL_THRESHOLD * 1.5);
      setPullDistance(resistedDistance);

      // Prevent default scrolling when pulling
      if (distance > 10) {
        e.preventDefault();
      }
    }
  };

  const handleTouchEnd = async () => {
    if (!isPulling) return;

    setIsPulling(false);

    // Trigger refresh if pulled past threshold
    if (pullDistance >= PULL_THRESHOLD) {
      setIsRefreshing(true);
      
      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }

      try {
        const result = await refetch();
        const newCount = result.data?.length || 0;
        const previousCount = previousCountRef.current;
        
        // Identify new properties
        const currentPropertyIds = new Set((result.data || []).map((p: any) => p.id));
        const newIds = new Set<string>();
        
        currentPropertyIds.forEach(id => {
          if (!previousPropertyIdsRef.current.has(id)) {
            newIds.add(id);
          }
        });
        
        // Show success feedback
        setTimeout(() => {
          setIsRefreshing(false);
          setPullDistance(0);
          
          // Success haptic
          if ('vibrate' in navigator) {
            navigator.vibrate([30, 20, 30]);
          }

          // Highlight new properties
          if (newIds.size > 0) {
            setNewPropertyIds(newIds);
          }

          // Show toast with results
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
        }, 500);
      } catch (error) {
        console.error('Refresh failed:', error);
        setIsRefreshing(false);
        setPullDistance(0);
        
        toast({
          title: "Refresh Failed",
          description: "Unable to refresh search results. Please try again.",
          variant: "destructive"
        });
      }
    } else {
      // Didn't pull enough - reset
      setPullDistance(0);
    }
  };

  // Calculate refresh indicator opacity and rotation
  const indicatorOpacity = Math.min(pullDistance / PULL_THRESHOLD, 1);
  const indicatorRotation = (pullDistance / PULL_THRESHOLD) * 360;

  return (
    <div 
      ref={scrollContainerRef}
      className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background pt-11 md:pt-12"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull-to-Refresh Indicator */}
      <AnimatePresence>
        {(isPulling || isRefreshing) && (
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ 
              opacity: isRefreshing ? 1 : indicatorOpacity,
              y: isRefreshing ? 0 : Math.min(pullDistance - 40, 0)
            }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.2 }}
            className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-primary text-primary-foreground px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5"
          >
            <motion.div
              animate={{ 
                rotate: isRefreshing ? 360 : indicatorRotation
              }}
              transition={{
                duration: isRefreshing ? 1 : 0,
                repeat: isRefreshing ? Infinity : 0,
                ease: "linear"
              }}
            >
              <RefreshCw className="h-3 w-3" />
            </motion.div>
            <span className="text-xs font-medium">
              {isRefreshing 
                ? 'Refreshing...' 
                : pullDistance >= PULL_THRESHOLD 
                  ? 'Release to refresh' 
                  : 'Pull to refresh'
              }
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Tools Tab Bar */}
      <div className="container mx-auto px-2 md:px-3 py-2">
        <BackToHomeLink sectionId="ai-tools-section" />
        <AIToolsTabBar className="mb-2" />
      </div>

      {/* Slim Search Header */}
      <div className="bg-background/95 backdrop-blur-sm border-b sticky top-11 md:top-12 z-40">
        <div className="container mx-auto px-2 md:px-3 py-2">
          <div className="space-y-2">
            {/* Search Input */}
            <div className="relative">
              <SearchIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
              <Input
                placeholder="Search properties, locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-7 h-8 text-xs"
              />
            </div>

            {/* Compact Filters */}
            <div className="flex flex-wrap gap-1.5 items-center">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="h-7 text-[10px] md:text-xs w-24 md:w-28">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs">All Types</SelectItem>
                  <SelectItem value="villa" className="text-xs">Villa</SelectItem>
                  <SelectItem value="apartment" className="text-xs">Apartment</SelectItem>
                  <SelectItem value="house" className="text-xs">House</SelectItem>
                  <SelectItem value="office" className="text-xs">Office</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="h-7 text-[10px] md:text-xs w-24 md:w-28">
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
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
                className="h-7 text-[10px] md:text-xs px-2 gap-1"
              >
                <SearchIcon className="h-3 w-3" />
                Search
              </Button>
              
              {(searchTerm || selectedType !== 'all' || selectedLocation !== 'all') && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={clearFilters}
                  className="h-7 text-[10px] md:text-xs px-2"
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-muted rounded-lg h-40 md:h-48"></div>
              </div>
            ))}
          </div>
        )}

        {/* Compact Results Grid */}
        {!isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
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