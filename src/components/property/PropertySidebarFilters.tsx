import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  ChevronDown, 
  ChevronUp, 
  MapPin, 
  Home, 
  DollarSign, 
  Bed, 
  Bath, 
  Square, 
  Settings,
  X,
  Filter,
  SlidersHorizontal
} from 'lucide-react';

interface SearchFilters {
  searchTerm: string;
  propertyType: string;
  city: string;
  area: string;
  minPrice: number;
  maxPrice: number;
  bedrooms: string;
  bathrooms: string;
  minArea: number;
  maxArea: number;
  yearBuilt: string;
  condition: string;
  features: string[];
  sortBy: string;
}

interface PropertySidebarFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onSearch: () => void;
  propertyTypes: string[];
  cities: string[];
  areas: string[];
  isOpen: boolean;
  onToggle: () => void;
}

const PropertySidebarFilters: React.FC<PropertySidebarFiltersProps> = ({
  filters,
  onFiltersChange,
  onSearch,
  propertyTypes,
  cities,
  areas,
  isOpen,
  onToggle
}) => {
  const filterRef = useRef<HTMLDivElement>(null);
  const [openSections, setOpenSections] = useState({
    search: true,
    location: false,
    price: false,
    rooms: false,
    area: false,
    features: false,
    sort: false
  });

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      // Check if click is outside filter panel
      if (filterRef.current && !filterRef.current.contains(target)) {
        // Check if click is on a Select dropdown (which renders in portal)
        const selectContent = document.querySelector('[data-radix-select-content]');
        const selectTrigger = document.querySelector('[data-radix-select-trigger]');
        
        // Don't close if clicking on Select dropdown content or trigger
        if (selectContent && selectContent.contains(target)) return;
        if (selectTrigger && selectTrigger.contains(target)) return;
        
        // Don't close if clicking on any element with data-radix attribute (Radix components)
        const radixElement = (target as Element).closest?.('[data-radix-popper-content-wrapper]');
        if (radixElement) return;
        
        onToggle();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onToggle]);

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const formatPrice = (price: number) => {
    if (price >= 1000000000) {
      return `${(price / 1000000000).toFixed(1)}M`;
    } else if (price >= 1000000) {
      return `${(price / 1000000).toFixed(0)}Jt`;
    }
    return price.toString();
  };

  const clearAllFilters = () => {
    onFiltersChange({
      searchTerm: '',
      propertyType: 'all',
      city: 'all',
      area: 'all',
      minPrice: 0,
      maxPrice: 10000000000,
      bedrooms: 'all',
      bathrooms: 'all',
      minArea: 0,
      maxArea: 1000,
      yearBuilt: '',
      condition: '',
      features: [],
      sortBy: 'newest'
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.searchTerm) count++;
    if (filters.propertyType && filters.propertyType !== 'all') count++;
    if (filters.city && filters.city !== 'all') count++;
    if (filters.area && filters.area !== 'all') count++;
    if (filters.minPrice > 0 || filters.maxPrice < 10000000000) count++;
    if (filters.bedrooms && filters.bedrooms !== 'all') count++;
    if (filters.bathrooms && filters.bathrooms !== 'all') count++;
    if (filters.minArea > 0 || filters.maxArea < 1000) count++;
    if (filters.features.length > 0) count++;
    return count;
  };

  const getSectionActiveCount = (section: string) => {
    switch (section) {
      case 'search':
        return (filters.searchTerm ? 1 : 0) + (filters.propertyType && filters.propertyType !== 'all' ? 1 : 0);
      case 'location':
        return (filters.city && filters.city !== 'all' ? 1 : 0) + (filters.area && filters.area !== 'all' ? 1 : 0);
      case 'price':
        return (filters.minPrice > 0 || filters.maxPrice < 10000000000) ? 1 : 0;
      case 'rooms':
        return (filters.bedrooms && filters.bedrooms !== 'all' ? 1 : 0) + (filters.bathrooms && filters.bathrooms !== 'all' ? 1 : 0);
      case 'area':
        return (filters.minArea > 0 || filters.maxArea < 1000) ? 1 : 0;
      case 'features':
        return filters.features.length;
      default:
        return 0;
    }
  };

  const clearSectionFilters = (section: string) => {
    switch (section) {
      case 'search':
        onFiltersChange({ ...filters, searchTerm: '', propertyType: 'all' });
        break;
      case 'location':
        onFiltersChange({ ...filters, city: 'all', area: 'all' });
        break;
      case 'price':
        onFiltersChange({ ...filters, minPrice: 0, maxPrice: 10000000000 });
        break;
      case 'rooms':
        onFiltersChange({ ...filters, bedrooms: 'all', bathrooms: 'all' });
        break;
      case 'area':
        onFiltersChange({ ...filters, minArea: 0, maxArea: 1000 });
        break;
      case 'features':
        onFiltersChange({ ...filters, features: [] });
        break;
    }
  };

  const propertyFeatures = [
    { id: 'parking', label: 'Parkir' },
    { id: 'security', label: 'Security 24 Jam' },
    { id: 'furnished', label: 'Furnished' },
    { id: 'pool', label: 'Kolam Renang' },
    { id: 'gym', label: 'Gym' },
    { id: 'elevator', label: 'Lift' }
  ];

  return (
    <>
      {/* Filter Toggle Button */}
      <Button
        onClick={onToggle}
        variant="outline"
        className="flex items-center gap-2 bg-card border-border hover:bg-muted transition-colors"
      >
        <SlidersHorizontal className="h-4 w-4" />
        Filter Properti
        {getActiveFiltersCount() > 0 && (
          <Badge variant="secondary" className="bg-primary text-primary-foreground ml-1">
            {getActiveFiltersCount()}
          </Badge>
        )}
      </Button>

      {/* Filter Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
          
          {/* Filter Panel */}
          <div 
            ref={filterRef}
            className="relative w-96 h-full bg-card border-r border-border shadow-2xl overflow-y-auto animate-in slide-in-from-left duration-300"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm border-b border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Filter className="h-5 w-5 text-primary" />
                  Filter Properti
                </h2>
                <div className="flex items-center gap-2">
                  {getActiveFiltersCount() > 0 && (
                    <Badge variant="secondary" className="bg-primary text-primary-foreground">
                      {getActiveFiltersCount()}
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onToggle}
                    className="h-8 w-8 p-0 hover:bg-muted"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {getActiveFiltersCount() > 0 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={clearAllFilters}
                  className="w-full"
                >
                  <X className="h-4 w-4 mr-2" />
                  Hapus Semua Filter
                </Button>
              )}
            </div>

            {/* Filter Content */}
            <div className="p-4 space-y-4">
              {/* Search Section */}
              <Collapsible open={openSections.search} onOpenChange={() => toggleSection('search')}>
                <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors border border-border/50">
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-primary" />
                    <span className="font-medium">Pencarian</span>
                    {getSectionActiveCount('search') > 0 && (
                      <Badge variant="secondary" className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 min-w-[20px] h-5">
                        {getSectionActiveCount('search')}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {getSectionActiveCount('search') > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          clearSectionFilters('search');
                        }}
                        className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                    {openSections.search ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-3 space-y-3">
                  <Input
                    placeholder="Cari properti, lokasi, atau kata kunci..."
                    value={filters.searchTerm}
                    onChange={(e) => updateFilter('searchTerm', e.target.value)}
                    className="w-full"
                  />
                  <Select value={filters.propertyType} onValueChange={(value) => updateFilter('propertyType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tipe Properti" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Tipe</SelectItem>
                      {propertyTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CollapsibleContent>
              </Collapsible>

              {/* Location Section */}
              <Collapsible open={openSections.location} onOpenChange={() => toggleSection('location')}>
                <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors border border-border/50">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="font-medium">Lokasi</span>
                    {getSectionActiveCount('location') > 0 && (
                      <Badge variant="secondary" className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 min-w-[20px] h-5">
                        {getSectionActiveCount('location')}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {getSectionActiveCount('location') > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          clearSectionFilters('location');
                        }}
                        className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                    {openSections.location ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-3 space-y-3">
                  <Select value={filters.city} onValueChange={(value) => updateFilter('city', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Kota" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Kota</SelectItem>
                      {cities.map((city) => (
                        <SelectItem key={city} value={city}>{city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filters.area} onValueChange={(value) => updateFilter('area', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Area" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Area</SelectItem>
                      {areas.map((area) => (
                        <SelectItem key={area} value={area}>{area}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CollapsibleContent>
              </Collapsible>

              {/* Price Section */}
              <Collapsible open={openSections.price} onOpenChange={() => toggleSection('price')}>
                <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors border border-border/50">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-primary" />
                    <span className="font-medium">Harga</span>
                    {getSectionActiveCount('price') > 0 && (
                      <Badge variant="secondary" className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 min-w-[20px] h-5">
                        {getSectionActiveCount('price')}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {getSectionActiveCount('price') > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          clearSectionFilters('price');
                        }}
                        className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                    {openSections.price ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-3 space-y-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Range Harga (Rp)</label>
                    <div className="px-2">
                      <Slider
                        value={[filters.minPrice, filters.maxPrice]}
                        onValueChange={([min, max]) => {
                          updateFilter('minPrice', min);
                          updateFilter('maxPrice', max);
                        }}
                        max={10000000000}
                        min={0}
                        step={100000000}
                        className="w-full"
                      />
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Rp {formatPrice(filters.minPrice)}</span>
                      <span>Rp {formatPrice(filters.maxPrice)}</span>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Rooms Section */}
              <Collapsible open={openSections.rooms} onOpenChange={() => toggleSection('rooms')}>
                <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors border border-border/50">
                  <div className="flex items-center gap-2">
                    <Bed className="h-4 w-4 text-primary" />
                    <span className="font-medium">Kamar</span>
                    {getSectionActiveCount('rooms') > 0 && (
                      <Badge variant="secondary" className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 min-w-[20px] h-5">
                        {getSectionActiveCount('rooms')}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {getSectionActiveCount('rooms') > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          clearSectionFilters('rooms');
                        }}
                        className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                    {openSections.rooms ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-3 space-y-3">
                  <Select value={filters.bedrooms} onValueChange={(value) => updateFilter('bedrooms', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Kamar Tidur" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua</SelectItem>
                      <SelectItem value="1">1 Kamar</SelectItem>
                      <SelectItem value="2">2 Kamar</SelectItem>
                      <SelectItem value="3">3 Kamar</SelectItem>
                      <SelectItem value="4">4 Kamar</SelectItem>
                      <SelectItem value="5+">5+ Kamar</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filters.bathrooms} onValueChange={(value) => updateFilter('bathrooms', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Kamar Mandi" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua</SelectItem>
                      <SelectItem value="1">1 Kamar Mandi</SelectItem>
                      <SelectItem value="2">2 Kamar Mandi</SelectItem>
                      <SelectItem value="3">3 Kamar Mandi</SelectItem>
                      <SelectItem value="4+">4+ Kamar Mandi</SelectItem>
                    </SelectContent>
                  </Select>
                </CollapsibleContent>
              </Collapsible>

              {/* Area Section */}
              <Collapsible open={openSections.area} onOpenChange={() => toggleSection('area')}>
                <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors border border-border/50">
                  <div className="flex items-center gap-2">
                    <Square className="h-4 w-4 text-primary" />
                    <span className="font-medium">Luas Area</span>
                    {getSectionActiveCount('area') > 0 && (
                      <Badge variant="secondary" className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 min-w-[20px] h-5">
                        {getSectionActiveCount('area')}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {getSectionActiveCount('area') > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          clearSectionFilters('area');
                        }}
                        className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                    {openSections.area ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-3 space-y-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Luas Area (m²)</label>
                    <div className="px-2">
                      <Slider
                        value={[filters.minArea, filters.maxArea]}
                        onValueChange={([min, max]) => {
                          updateFilter('minArea', min);
                          updateFilter('maxArea', max);
                        }}
                        max={1000}
                        min={0}
                        step={10}
                        className="w-full"
                      />
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{filters.minArea} m²</span>
                      <span>{filters.maxArea} m²</span>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Features Section */}
              <Collapsible open={openSections.features} onOpenChange={() => toggleSection('features')}>
                <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors border border-border/50">
                  <div className="flex items-center gap-2">
                    <Home className="h-4 w-4 text-primary" />
                    <span className="font-medium">Fasilitas</span>
                    {getSectionActiveCount('features') > 0 && (
                      <Badge variant="secondary" className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 min-w-[20px] h-5">
                        {getSectionActiveCount('features')}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {getSectionActiveCount('features') > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          clearSectionFilters('features');
                        }}
                        className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                    {openSections.features ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-3 space-y-3">
                  <div className="space-y-3">
                    {propertyFeatures.map((feature) => (
                      <div key={feature.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={feature.id}
                          checked={filters.features.includes(feature.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              updateFilter('features', [...filters.features, feature.id]);
                            } else {
                              updateFilter('features', filters.features.filter(f => f !== feature.id));
                            }
                          }}
                        />
                        <label
                          htmlFor={feature.id}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {feature.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Sort Section */}
              <Collapsible open={openSections.sort} onOpenChange={() => toggleSection('sort')}>
                <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors border border-border/50">
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-primary" />
                    <span className="font-medium">Urutkan</span>
                  </div>
                  {openSections.sort ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-3 space-y-3">
                  <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Urutkan berdasarkan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Terbaru</SelectItem>
                      <SelectItem value="price_low">Harga Terendah</SelectItem>
                      <SelectItem value="price_high">Harga Tertinggi</SelectItem>
                      <SelectItem value="area_large">Luas Terbesar</SelectItem>
                    </SelectContent>
                  </Select>
                </CollapsibleContent>
              </Collapsible>
            </div>

            {/* Apply Button - Sticky Bottom */}
            <div className="sticky bottom-0 bg-card/95 backdrop-blur-sm border-t border-border p-4">
              <Button onClick={onSearch} className="w-full bg-primary hover:bg-primary/90">
                Terapkan Filter
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PropertySidebarFilters;