import React, { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Building2, Search, Home, Store, Map, Building, Warehouse, Factory, Trees, MapPinned, Briefcase, Crown, ChevronLeft, ChevronRight, Sparkles, SlidersHorizontal } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import PropertyCard from '@/components/property/PropertyCard';
import useEmblaCarousel from 'embla-carousel-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchFilters {
  city: string;
  propertyType: string;
  minPrice: string;
  maxPrice: string;
  minArea: string;
  maxArea: string;
  projectTitle: string;
  developer: string;
  marketedBy: string;
}

const NewProjects = () => {
  const [filters, setFilters] = useState<SearchFilters>({
    city: 'all',
    propertyType: 'all',
    minPrice: '',
    maxPrice: '',
    minArea: '',
    maxArea: '',
    projectTitle: '',
    developer: '',
    marketedBy: 'all'
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  const { data: cities } = useQuery({
    queryKey: ['cities'],
    queryFn: async () => {
      const { data } = await supabase
        .from('locations')
        .select('city_name')
        .eq('is_active', true)
        .order('city_name');
      return [...new Set(data?.map(l => l.city_name))];
    }
  });

  const { data: properties, isLoading } = useQuery({
    queryKey: ['new-projects', filters],
    queryFn: async () => {
      let query = supabase
        .from('properties')
        .select('*')
        .eq('status', 'active')
        .eq('approval_status', 'approved')
        .eq('development_status', 'new_project');

      if (filters.city && filters.city !== 'all') query = query.ilike('city', `%${filters.city}%`);
      if (filters.propertyType && filters.propertyType !== 'all') query = query.eq('property_type', filters.propertyType);
      if (filters.minPrice) query = query.gte('price', parseFloat(filters.minPrice));
      if (filters.maxPrice) query = query.lte('price', parseFloat(filters.maxPrice));
      if (filters.minArea) query = query.gte('area_sqm', parseInt(filters.minArea));
      if (filters.maxArea) query = query.lte('area_sqm', parseInt(filters.maxArea));
      if (filters.projectTitle) query = query.ilike('title', `%${filters.projectTitle}%`);
      if (filters.marketedBy && filters.marketedBy !== 'all') query = query.ilike('marketed_by', `%${filters.marketedBy}%`);

      const { data, error } = await query.order('created_at', { ascending: false }).limit(50);
      if (error) throw error;
      return data;
    }
  });

  const { data: categoryCounts } = useQuery({
    queryKey: ['new-projects-counts'],
    queryFn: async () => {
      const types = ['apartment', 'house', 'land', 'commercial'];
      const counts: Record<string, number> = {};
      for (const type of types) {
        const { count } = await supabase
          .from('properties')
          .select('*', { count: 'exact', head: true })
          .eq('development_status', 'new_project')
          .eq('property_type', type)
          .eq('status', 'active');
        counts[type] = count || 0;
      }
      return counts;
    }
  });

  const categories = [
    { name: 'All Projects', icon: Sparkles, type: 'all', count: Object.values(categoryCounts || {}).reduce((a, b) => a + b, 0) },
    { name: 'Apartments', icon: Building2, type: 'apartment', count: categoryCounts?.apartment || 0 },
    { name: 'Houses', icon: Home, type: 'house', count: categoryCounts?.house || 0 },
    { name: 'Commercial', icon: Store, type: 'commercial', count: categoryCounts?.commercial || 0 },
    { name: 'Plots', icon: Map, type: 'land', count: categoryCounts?.land || 0 },
    { name: 'Offices', icon: Briefcase, type: 'office', count: 0 },
    { name: 'Penthouse', icon: Crown, type: 'penthouse', count: 0 },
    { name: 'Farm Houses', icon: Trees, type: 'farmhouse', count: 0 },
  ];

  const [emblaRef, emblaApi] = useEmblaCarousel({ align: 'start', slidesToScroll: 1, containScroll: 'trimSnaps' });
  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <div className="min-h-screen bg-background text-foreground pt-11 md:pt-12 transition-colors duration-300">
      {/* Luxury Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-primary/15 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-accent/15 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-3 md:px-4 pt-1 pb-4 relative">
        {/* Centered Header */}
        <div className="text-center mb-2">
          <h1 className="text-lg md:text-2xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            New Projects
          </h1>
          <p className="text-[10px] md:text-xs text-muted-foreground">
            Discover exciting new real estate developments
          </p>
        </div>

        {/* Slim Search Panel */}
        <div className="glass-card p-2 rounded-lg mb-3 border border-primary/20">
          <div className="flex gap-2 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={filters.projectTitle}
                onChange={(e) => setFilters(prev => ({ ...prev, projectTitle: e.target.value }))}
                className="pl-8 h-9 text-sm bg-input border-primary/20 focus:border-primary"
              />
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`h-9 px-3 border-primary/30 ${showAdvanced ? 'bg-primary/10 text-primary' : ''}`}
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>

            <Button size="sm" className="h-9 px-4 bg-gradient-to-r from-primary to-accent text-primary-foreground">
              <Search className="h-4 w-4" />
            </Button>
          </div>

          {/* Collapsible Filters */}
          <AnimatePresence>
            {showAdvanced && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="pt-2 mt-2 border-t border-primary/10 grid grid-cols-2 md:grid-cols-4 gap-2">
                  <Select value={filters.city} onValueChange={(v) => setFilters(prev => ({ ...prev, city: v }))}>
                    <SelectTrigger className="h-8 text-xs bg-popover border-border">
                      <SelectValue placeholder="City" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border z-50">
                      <SelectItem value="all">All Cities</SelectItem>
                      {cities?.map(city => <SelectItem key={city} value={city}>{city}</SelectItem>)}
                    </SelectContent>
                  </Select>

                  <Select value={filters.propertyType} onValueChange={(v) => setFilters(prev => ({ ...prev, propertyType: v }))}>
                    <SelectTrigger className="h-8 text-xs bg-popover border-border">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border z-50">
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="apartment">Apartment</SelectItem>
                      <SelectItem value="house">House</SelectItem>
                      <SelectItem value="villa">Villa</SelectItem>
                      <SelectItem value="land">Land</SelectItem>
                    </SelectContent>
                  </Select>

                  <Input
                    type="number"
                    placeholder="Min Price"
                    value={filters.minPrice}
                    onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                    className="h-8 text-xs bg-input border-border"
                  />
                  <Input
                    type="number"
                    placeholder="Max Price"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                    className="h-8 text-xs bg-input border-border"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Category Carousel */}
        <div className="mb-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium text-muted-foreground">Browse by Category</span>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={scrollPrev} className="h-6 w-6">
                <ChevronLeft className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="icon" onClick={scrollNext} className="h-6 w-6">
                <ChevronRight className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.type}
                  onClick={() => setFilters(prev => ({ ...prev, propertyType: cat.type }))}
                  className={`flex-[0_0_90px] p-2 rounded-lg border transition-all ${
                    filters.propertyType === cat.type
                      ? 'bg-primary/10 border-primary/40 text-primary'
                      : 'bg-card/50 border-border hover:border-primary/30'
                  }`}
                >
                  <cat.icon className="h-4 w-4 mx-auto mb-1" />
                  <p className="text-[10px] font-medium truncate">{cat.name}</p>
                  <p className="text-[9px] text-muted-foreground">{cat.count}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="flex items-center justify-between mb-2 text-xs text-muted-foreground">
          <span>{properties?.length || 0} projects found</span>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="mt-2 text-xs text-muted-foreground">Loading...</p>
          </div>
        ) : properties && properties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {properties.map((property) => (
              <PropertyCard key={property.id} {...property} />
            ))}
          </div>
        ) : (
          <Card className="glass-card p-8 text-center border border-primary/20">
            <Building2 className="w-12 h-12 mx-auto mb-3 text-primary/50" />
            <h3 className="text-base font-semibold text-foreground mb-1">No Projects Found</h3>
            <p className="text-xs text-muted-foreground">Try adjusting your filters</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default NewProjects;
