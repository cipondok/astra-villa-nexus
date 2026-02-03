import React, { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Building2, Search, Home, Store, Map, Briefcase, Crown, Trees, ChevronLeft, ChevronRight, Sparkles, SlidersHorizontal, LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import PropertyCard from '@/components/property/PropertyCard';
import useEmblaCarousel from 'embla-carousel-react';
import { motion, AnimatePresence } from 'framer-motion';
import BackToHomeLink from '@/components/common/BackToHomeLink';
import AIToolsTabBar from '@/components/common/AIToolsTabBar';

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

  // Demo projects for display
  const demoProjects = [
    {
      id: 'demo-1',
      title: 'ASTRA Grand Residence',
      price: 2500000000,
      location: 'Sudirman, Jakarta Selatan',
      city: 'Jakarta',
      province: 'DKI Jakarta',
      property_type: 'apartment',
      listing_type: 'sale',
      bedrooms: 3,
      bathrooms: 2,
      area_sqm: 120,
      images: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'],
      development_status: 'new_project',
      status: 'active'
    },
    {
      id: 'demo-2',
      title: 'Villa Bali Paradise',
      price: 4800000000,
      location: 'Seminyak, Denpasar',
      city: 'Denpasar',
      province: 'Bali',
      property_type: 'villa',
      listing_type: 'sale',
      bedrooms: 4,
      bathrooms: 3,
      area_sqm: 350,
      images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'],
      development_status: 'new_project',
      status: 'active'
    },
    {
      id: 'demo-3',
      title: 'Skyline Tower Surabaya',
      price: 1800000000,
      location: 'HR Muhammad, Surabaya',
      city: 'Surabaya',
      province: 'Jawa Timur',
      property_type: 'apartment',
      listing_type: 'sale',
      bedrooms: 2,
      bathrooms: 1,
      area_sqm: 85,
      images: ['https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800'],
      development_status: 'new_project',
      status: 'active'
    },
    {
      id: 'demo-4',
      title: 'Green Valley Residence',
      price: 3200000000,
      location: 'Dago, Bandung',
      city: 'Bandung',
      province: 'Jawa Barat',
      property_type: 'house',
      listing_type: 'sale',
      bedrooms: 5,
      bathrooms: 4,
      area_sqm: 280,
      images: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800'],
      development_status: 'new_project',
      status: 'active'
    },
    {
      id: 'demo-5',
      title: 'Marina Bay Penthouse',
      price: 8500000000,
      location: 'SCBD, Jakarta Selatan',
      city: 'Jakarta',
      province: 'DKI Jakarta',
      property_type: 'penthouse',
      listing_type: 'sale',
      bedrooms: 4,
      bathrooms: 4,
      area_sqm: 450,
      images: ['https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800'],
      development_status: 'new_project',
      status: 'active'
    },
    {
      id: 'demo-6',
      title: 'Commercial Hub Medan',
      location: 'Medan Kota, Medan',
      price: 5600000000,
      city: 'Medan',
      province: 'Sumatera Utara',
      property_type: 'commercial',
      listing_type: 'sale',
      bedrooms: 0,
      bathrooms: 2,
      area_sqm: 500,
      images: ['https://images.unsplash.com/photo-1497366216548-37526070297c?w=800'],
      development_status: 'new_project',
      status: 'active'
    }
  ];

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
      
      // Return demo projects if no real data
      return data && data.length > 0 ? data : demoProjects;
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

  const categories: { name: string; icon: LucideIcon; type: string; count: number; color: string; iconBg: string }[] = [
    { name: 'All Projects', icon: Sparkles, type: 'all', count: Object.values(categoryCounts || {}).reduce((a, b) => a + b, 0), color: 'text-primary', iconBg: 'bg-primary/10 dark:bg-primary/20' },
    { name: 'Apartments', icon: Building2, type: 'apartment', count: categoryCounts?.apartment || 0, color: 'text-blue-600 dark:text-blue-400', iconBg: 'bg-blue-100 dark:bg-blue-900/50' },
    { name: 'Houses', icon: Home, type: 'house', count: categoryCounts?.house || 0, color: 'text-emerald-600 dark:text-emerald-400', iconBg: 'bg-emerald-100 dark:bg-emerald-900/50' },
    { name: 'Commercial', icon: Store, type: 'commercial', count: categoryCounts?.commercial || 0, color: 'text-purple-600 dark:text-purple-400', iconBg: 'bg-purple-100 dark:bg-purple-900/50' },
    { name: 'Plots', icon: Map, type: 'land', count: categoryCounts?.land || 0, color: 'text-amber-600 dark:text-amber-400', iconBg: 'bg-amber-100 dark:bg-amber-900/50' },
    { name: 'Offices', icon: Briefcase, type: 'office', count: 0, color: 'text-cyan-600 dark:text-cyan-400', iconBg: 'bg-cyan-100 dark:bg-cyan-900/50' },
    { name: 'Penthouse', icon: Crown, type: 'penthouse', count: 0, color: 'text-pink-600 dark:text-pink-400', iconBg: 'bg-pink-100 dark:bg-pink-900/50' },
    { name: 'Farm Houses', icon: Trees, type: 'farmhouse', count: 0, color: 'text-green-600 dark:text-green-400', iconBg: 'bg-green-100 dark:bg-green-900/50' },
  ];

  const [emblaRef, emblaApi] = useEmblaCarousel({ align: 'start', slidesToScroll: 1, containScroll: 'trimSnaps' });
  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Clean Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BackToHomeLink sectionId="new-projects-section" className="mb-0" alwaysShow />
              <div>
                <h1 className="text-base sm:text-lg md:text-xl font-bold text-foreground">New Projects</h1>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {properties?.length || 0} projects available
                </p>
              </div>
            </div>
            <Button
              variant={showAdvanced ? "default" : "outline"}
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="h-9 px-4 text-sm font-medium rounded-md"
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-secondary/50 border-b border-border">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex gap-2 sm:gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={filters.projectTitle}
                onChange={(e) => setFilters(prev => ({ ...prev, projectTitle: e.target.value }))}
                className="h-10 sm:h-11 pl-10 text-sm bg-background border-border rounded-md focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <Button className="h-10 sm:h-11 px-6 text-sm font-medium">
              <Search className="h-4 w-4 mr-2" />
              Search
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
                <div className="pt-3 mt-3 border-t border-border grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
                  <Select value={filters.city} onValueChange={(v) => setFilters(prev => ({ ...prev, city: v }))}>
                    <SelectTrigger className="h-10 text-sm bg-background border-border">
                      <SelectValue placeholder="All Cities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Cities</SelectItem>
                      {cities?.map(city => <SelectItem key={city} value={city}>{city}</SelectItem>)}
                    </SelectContent>
                  </Select>

                  <Select value={filters.propertyType} onValueChange={(v) => setFilters(prev => ({ ...prev, propertyType: v }))}>
                    <SelectTrigger className="h-10 text-sm bg-background border-border">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
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
                    className="h-10 text-sm bg-background border-border"
                  />
                  <Input
                    type="number"
                    placeholder="Max Price"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                    className="h-10 text-sm bg-background border-border"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Category Carousel */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-foreground">Browse by Category</span>
            <div className="flex gap-1">
              <Button variant="outline" size="icon" onClick={scrollPrev} className="h-8 w-8 rounded-full">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={scrollNext} className="h-8 w-8 rounded-full">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-2 sm:gap-3">
              {categories.map((cat) => {
                const IconComponent = cat.icon;
                const isActive = filters.propertyType === cat.type;
                return (
                  <button
                    key={cat.type}
                    onClick={() => setFilters(prev => ({ ...prev, propertyType: cat.type }))}
                    className={`flex-[0_0_100px] sm:flex-[0_0_120px] p-3 sm:p-4 rounded-md border transition-all duration-300 flex flex-col items-center text-center ${
                      isActive
                        ? 'bg-primary/10 border-primary shadow-sm'
                        : 'bg-card border-border hover:border-primary/30'
                    }`}
                  >
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-full ${isActive ? 'bg-primary/20' : cat.iconBg} mb-2`}>
                      <IconComponent className={`w-6 h-6 sm:w-7 sm:h-7 ${isActive ? 'text-primary' : cat.color}`} strokeWidth={1.5} />
                    </div>
                    <p className={`text-xs sm:text-sm font-medium leading-tight ${isActive ? 'text-primary' : 'text-foreground'}`}>{cat.name}</p>
                    <p className="text-xs text-muted-foreground">{cat.count}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse rounded-md overflow-hidden bg-muted h-64 sm:h-72"></div>
            ))}
          </div>
        ) : properties && properties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {properties.map((property) => (
              <PropertyCard key={property.id} {...property} />
            ))}
          </div>
        ) : (
          <Card className="p-8 sm:p-12 border-border">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No Projects Found</h3>
              <p className="text-sm text-muted-foreground mb-4">Try adjusting your filters</p>
              <Button 
                variant="outline" 
                className="h-10 px-6"
                onClick={() => setFilters({
                  city: 'all',
                  propertyType: 'all',
                  minPrice: '',
                  maxPrice: '',
                  minArea: '',
                  maxArea: '',
                  projectTitle: '',
                  developer: '',
                  marketedBy: 'all'
                })}
              >
                Reset Filters
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default NewProjects;
