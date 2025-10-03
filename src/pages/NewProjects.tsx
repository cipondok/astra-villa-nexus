import React, { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Building2, Search, Home, Store, Map, Building, Warehouse, Factory, Trees, MapPinned, Briefcase, Crown, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import PropertyCard from '@/components/property/PropertyCard';
import useEmblaCarousel from 'embla-carousel-react';

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

  // Fetch cities from locations table
  const { data: cities } = useQuery({
    queryKey: ['cities'],
    queryFn: async () => {
      const { data } = await supabase
        .from('locations')
        .select('city_name')
        .eq('is_active', true)
        .order('city_name');
      
      const uniqueCities = [...new Set(data?.map(l => l.city_name))];
      return uniqueCities;
    }
  });

  // Fetch properties with filters
  const { data: properties, isLoading } = useQuery({
    queryKey: ['new-projects', filters],
    queryFn: async () => {
      let query = supabase
        .from('properties')
        .select('*')
        .eq('status', 'active')
        .eq('approval_status', 'approved')
        .eq('development_status', 'new_project');

      if (filters.city && filters.city !== 'all') {
        query = query.ilike('city', `%${filters.city}%`);
      }

      if (filters.propertyType && filters.propertyType !== 'all') {
        query = query.eq('property_type', filters.propertyType);
      }

      if (filters.minPrice) {
        query = query.gte('price', parseFloat(filters.minPrice));
      }

      if (filters.maxPrice) {
        query = query.lte('price', parseFloat(filters.maxPrice));
      }

      if (filters.minArea) {
        query = query.gte('area_sqm', parseInt(filters.minArea));
      }

      if (filters.maxArea) {
        query = query.lte('area_sqm', parseInt(filters.maxArea));
      }

      if (filters.projectTitle) {
        query = query.ilike('title', `%${filters.projectTitle}%`);
      }

      if (filters.marketedBy && filters.marketedBy !== 'all') {
        query = query.ilike('marketed_by', `%${filters.marketedBy}%`);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    }
  });

  // Get property counts by type
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
    {
      name: 'Discover New Projects',
      icon: Sparkles,
      type: 'all',
      count: Object.values(categoryCounts || {}).reduce((a, b) => a + b, 0),
      color: 'from-violet-400 to-fuchsia-600',
      bgColor: 'bg-gradient-to-br from-violet-50 to-fuchsia-50 dark:from-violet-950/30 dark:to-fuchsia-950/30'
    },
    {
      name: 'Apartments',
      icon: Building2,
      type: 'apartment',
      count: categoryCounts?.apartment || 0,
      color: 'from-blue-400 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30'
    },
    {
      name: 'Houses',
      icon: Home,
      type: 'house',
      count: categoryCounts?.house || 0,
      color: 'from-emerald-400 to-emerald-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/30'
    },
    {
      name: 'Commercial',
      icon: Store,
      type: 'commercial',
      count: categoryCounts?.commercial || 0,
      color: 'from-purple-400 to-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950/30'
    },
    {
      name: 'Plots',
      icon: Map,
      type: 'land',
      count: categoryCounts?.land || 0,
      color: 'from-amber-400 to-amber-600',
      bgColor: 'bg-amber-50 dark:bg-amber-950/30'
    },
    {
      name: 'Offices',
      icon: Briefcase,
      type: 'office',
      count: 0,
      color: 'from-cyan-400 to-cyan-600',
      bgColor: 'bg-cyan-50 dark:bg-cyan-950/30'
    },
    {
      name: 'Penthouse',
      icon: Crown,
      type: 'penthouse',
      count: 0,
      color: 'from-rose-400 to-rose-600',
      bgColor: 'bg-rose-50 dark:bg-rose-950/30'
    },
    {
      name: 'Farm Houses',
      icon: Trees,
      type: 'farmhouse',
      count: 0,
      color: 'from-green-400 to-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950/30'
    },
    {
      name: 'Buildings',
      icon: Building,
      type: 'building',
      count: 0,
      color: 'from-slate-400 to-slate-600',
      bgColor: 'bg-slate-50 dark:bg-slate-950/30'
    },
    {
      name: 'Warehouses',
      icon: Warehouse,
      type: 'warehouse',
      count: 0,
      color: 'from-orange-400 to-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-950/30'
    },
    {
      name: 'Industrial Land',
      icon: Factory,
      type: 'industrial',
      count: 0,
      color: 'from-red-400 to-red-600',
      bgColor: 'bg-red-50 dark:bg-red-950/30'
    },
    {
      name: 'Agricultural Land',
      icon: MapPinned,
      type: 'agricultural',
      count: 0,
      color: 'from-lime-400 to-lime-600',
      bgColor: 'bg-lime-50 dark:bg-lime-950/30'
    }
  ];

  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    align: 'start',
    slidesToScroll: 1,
    containScroll: 'trimSnaps'
  });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const handleCategoryClick = (type: string) => {
    setFilters(prev => ({ ...prev, propertyType: type }));
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div 
        className="relative bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white py-20 md:py-28"
        style={{
          backgroundImage: 'linear-gradient(rgba(30, 58, 138, 0.9), rgba(30, 64, 175, 0.85)), url("https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&h=600&fit=crop")',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 animate-fade-in">
              Find New Projects in Indonesia
            </h1>
            <p className="text-lg md:text-xl text-blue-100 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              Find exciting new real estate projects and investment opportunities
            </p>
          </div>

          {/* Search Filter Bar */}
          <Card className="max-w-6xl mx-auto shadow-2xl animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="text-sm font-semibold text-foreground mb-2 block">City</label>
                  <Select value={filters.city} onValueChange={(value) => setFilters(prev => ({ ...prev, city: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Cities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Cities</SelectItem>
                      {cities?.map(city => (
                        <SelectItem key={city} value={city}>{city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-semibold text-foreground mb-2 block">Property Type</label>
                  <Select value={filters.propertyType} onValueChange={(value) => setFilters(prev => ({ ...prev, propertyType: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="apartment">Apartment</SelectItem>
                      <SelectItem value="house">House</SelectItem>
                      <SelectItem value="villa">Villa</SelectItem>
                      <SelectItem value="townhouse">Townhouse</SelectItem>
                      <SelectItem value="land">Land/Plot</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-semibold text-foreground mb-2 block">Budget Range</label>
                  <div className="flex gap-2">
                    <Input 
                      type="number" 
                      placeholder="Min" 
                      value={filters.minPrice}
                      onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                      className="w-full"
                    />
                    <Input 
                      type="number" 
                      placeholder="Max" 
                      value={filters.maxPrice}
                      onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                      className="w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-foreground mb-2 block">Area Range (sqm)</label>
                  <div className="flex gap-2">
                    <Input 
                      type="number" 
                      placeholder="Min" 
                      value={filters.minArea}
                      onChange={(e) => setFilters(prev => ({ ...prev, minArea: e.target.value }))}
                      className="w-full"
                    />
                    <Input 
                      type="number" 
                      placeholder="Max" 
                      value={filters.maxArea}
                      onChange={(e) => setFilters(prev => ({ ...prev, maxArea: e.target.value }))}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-sm"
                >
                  {showAdvanced ? 'See Less ▲' : 'More Filters ▼'}
                </Button>

                <Button size="lg" className="px-8">
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </div>

              {showAdvanced && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t animate-fade-in">
                  <div>
                    <label className="text-sm font-semibold text-foreground mb-2 block">Project Title</label>
                    <Input 
                      placeholder="Search by project name" 
                      value={filters.projectTitle}
                      onChange={(e) => setFilters(prev => ({ ...prev, projectTitle: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-foreground mb-2 block">Developer</label>
                    <Input 
                      placeholder="Search by developer" 
                      value={filters.developer}
                      onChange={(e) => setFilters(prev => ({ ...prev, developer: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-foreground mb-2 block">Marketed By</label>
                    <Select value={filters.marketedBy} onValueChange={(value) => setFilters(prev => ({ ...prev, marketedBy: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Marketers" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Marketers</SelectItem>
                        <SelectItem value="ASTRA Villa">ASTRA Villa Developer</SelectItem>
                        <SelectItem value="Independent">Independent Developer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Browse by Category Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl md:text-2xl font-bold">Browse Projects by Category</h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={scrollPrev}
              className="h-10 w-10 rounded-full"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={scrollNext}
              className="h-10 w-10 rounded-full"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-3">
            {categories.map((category, index) => {
              const Icon = category.icon;
              return (
                <Card 
                  key={category.type}
                  className="flex-[0_0_140px] md:flex-[0_0_160px] cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                  onClick={() => handleCategoryClick(category.type)}
                >
                  <CardContent className="p-4">
                    <div className={`w-12 h-12 rounded-lg ${category.bgColor} flex items-center justify-center mb-3`}>
                      <Icon className={`w-6 h-6 bg-gradient-to-br ${category.color} bg-clip-text text-transparent`} strokeWidth={2} />
                    </div>
                    <h3 className="text-sm font-bold mb-1 line-clamp-2">{category.name}</h3>
                    <p className="text-xs text-muted-foreground">{category.count} Projects</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-12">

        {/* Results Section */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              {properties?.length || 0} New Projects Found
            </h2>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-muted-foreground">Loading projects...</p>
            </div>
          ) : properties && properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <PropertyCard key={property.id} {...property} />
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Building2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No Projects Found</h3>
              <p className="text-muted-foreground">
                Try adjusting your filters to see more results
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewProjects;
