import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Search, MapPin, Home, DollarSign, Filter, X, Bed, Bath, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "@/i18n/useTranslation";

interface SmartSearchPanelProps {
  language: "en" | "id";
  onSearch: (searchData: any) => void;
  onLiveSearch?: (searchTerm: string) => void;
  activeTab?: "buy" | "rent";
}

const SmartSearchPanel = ({ language, onSearch, onLiveSearch, activeTab = "buy" }: SmartSearchPanelProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filters, setFilters] = useState({
    location: '',
    propertyType: '',
    listingType: '',
    priceMin: '',
    priceMax: '',
    priceRange: [100000000, 1000000000] as [number, number],
    bedrooms: [] as number[],
    bathrooms: [] as number[],
    amenities: [] as string[],
    state: '',
    city: '',
    development_status: '',
  });
  
  const filtersRef = useRef<HTMLDivElement>(null);
  const [isClosing, setIsClosing] = useState(false);

  // Load locations from database
  const { data: locations = [] } = useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('locations')
        .select('province_name, city_name, area_name, province_code, city_code')
        .eq('is_active', true)
        .order('province_name, city_name, area_name');
      
      if (error) {
        console.error('Error fetching locations:', error);
        return [];
      }
      return data || [];
    },
    staleTime: 300000, // 5 minutes
  });

  // Group locations by province
  const locationsByProvince = locations.reduce((acc, location) => {
    if (!acc[location.province_name]) {
      acc[location.province_name] = {
        cities: new Set(),
        areas: []
      };
    }
    acc[location.province_name].cities.add(location.city_name);
    acc[location.province_name].areas.push(location);
    return acc;
  }, {} as Record<string, { cities: Set<string>, areas: any[] }>);

  const { t } = useTranslation();

  const currentText = {
    searchPlaceholder: t('smartSearch.searchPlaceholder'),
    location: t('smartSearch.location'),
    propertyType: t('smartSearch.propertyType'),
    listingType: t('smartSearch.listingType'),
    priceRange: t('smartSearch.priceRange'),
    bedrooms: t('smartSearch.bedrooms'),
    bathrooms: t('smartSearch.bathrooms'),
    amenities: t('smartSearch.amenities'),
    search: t('smartSearch.search'),
    advancedFilters: t('smartSearch.advancedFilters'),
    clearAll: t('smartSearch.clearAll'),
    clearSelected: t('smartSearch.clearSelected'),
    from: t('smartSearch.from'),
    to: t('smartSearch.to'),
    any: t('smartSearch.any'),
    forSale: t('smartSearch.forSale'),
    forRent: t('smartSearch.forRent'),
    villa: t('smartSearch.villa'),
    apartment: t('smartSearch.apartment'),
    house: t('smartSearch.house'),
    townhouse: t('smartSearch.townhouse'),
    land: t('smartSearch.land'),
    pool: t('smartSearch.pool'),
    garage: t('smartSearch.garage'),
    garden: t('smartSearch.garden'),
    security: t('smartSearch.security'),
    gym: t('smartSearch.gym'),
    furnished: t('smartSearch.furnished'),
    filtersApplied: t('smartSearch.filtersApplied'),
    developmentStatus: t('smartSearch.developmentStatus'),
    completed: t('smartSearch.completed'),
    preLaunching: t('smartSearch.preLaunching'),
    newProject: t('smartSearch.newProject'),
    ready: t('smartSearch.ready'),
  };

  // Filter Categories
  const filterCategories = {
    basic: {
      title: t('smartSearch.basicFilters'),
      filters: ['propertyType', 'listingType', 'state']
    },
    details: {
      title: t('smartSearch.propertyDetails'),
      filters: ['bedrooms', 'bathrooms', 'developmentStatus']
    },
    price: {
      title: t('smartSearch.priceRange'),
      filters: ['priceRange']
    },
    amenities: {
      title: t('smartSearch.amenitiesFeatures'),
      filters: ['amenities']
    }
  };

  // Property types based on active tab
  const getAllPropertyTypes = () => [
    { value: 'villa', label: currentText.villa, icon: '🏖️' },
    { value: 'apartment', label: currentText.apartment, icon: '🏢' },
    { value: 'house', label: currentText.house, icon: '🏠' },
    { value: 'townhouse', label: currentText.townhouse, icon: '🏘️' },
    { value: 'land', label: currentText.land, icon: '🌿' },
  ];

  const propertyTypes = activeTab === "rent" 
    ? getAllPropertyTypes().filter(type => type.value !== 'land') // No land for rent
    : getAllPropertyTypes();

  const listingTypes = [
    { value: 'sale', label: currentText.forSale, icon: '💰' },
    { value: 'rent', label: currentText.forRent, icon: '🔑' },
  ];

  const developmentStatuses = [
    { value: 'completed', label: currentText.completed, icon: '✅' },
    { value: 'ready', label: currentText.ready, icon: '🏠' },
    { value: 'pre_launching', label: currentText.preLaunching, icon: '🚀' },
    { value: 'new_project', label: currentText.newProject, icon: '🏗️' },
  ];

  // Amenities based on active tab
  const getAllAmenities = () => [
    { value: 'pool', label: currentText.pool, icon: '🏊' },
    { value: 'garage', label: currentText.garage, icon: '🚗' },
    { value: 'garden', label: currentText.garden, icon: '🌳' },
    { value: 'security', label: currentText.security, icon: '🛡️' },
    { value: 'gym', label: currentText.gym, icon: '💪' },
    { value: 'furnished', label: currentText.furnished, icon: '🛋️' },
  ];

  const rentAmenities = [
    { value: 'furnished', label: currentText.furnished, icon: '🛋️' },
    { value: 'wifi', label: language === 'en' ? 'WiFi' : 'WiFi', icon: '📶' },
    { value: 'ac', label: language === 'en' ? 'Air Conditioning' : 'AC', icon: '❄️' },
    { value: 'parking', label: language === 'en' ? 'Parking' : 'Parkir', icon: '🅿️' },
    { value: 'laundry', label: language === 'en' ? 'Laundry' : 'Laundry', icon: '👕' },
    { value: 'kitchen', label: language === 'en' ? 'Kitchen' : 'Dapur', icon: '🍳' },
    { value: 'pets_allowed', label: language === 'en' ? 'Pets Allowed' : 'Hewan Peliharaan Diizinkan', icon: '🐕' },
  ];

  const amenitiesList = activeTab === "rent" ? rentAmenities : getAllAmenities();

  const bedroomOptions = [1, 2, 3, 4, 5, 6];
  const bathroomOptions = [1, 2, 3, 4, 5];

  // Format Indonesian currency
  const formatIDR = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Parse Indonesian currency input
  const parseIDRInput = (value: string): number => {
    return parseInt(value.replace(/[^\d]/g, '')) || 0;
  };

  // Format number for input display
  const formatNumberInput = (num: number): string => {
    return new Intl.NumberFormat('id-ID').format(num);
  };

  // Close filters when clicking outside with delay to prevent errors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filtersRef.current && !filtersRef.current.contains(event.target as Node)) {
        handleCloseFilters();
      }
    };

    if (showAdvanced) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAdvanced]);

  const handleCloseFilters = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowAdvanced(false);
      setIsClosing(false);
    }, 150); // Small delay to prevent selection errors
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (onLiveSearch) {
      onLiveSearch(value);
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    const actualValue = value === "all" ? "" : value;
    const newFilters = { ...filters, [key]: actualValue };
    setFilters(newFilters);
  };

  // Smart selection for bedrooms and bathrooms
  const handleSmartSelection = (type: 'bedrooms' | 'bathrooms', value: number) => {
    const currentSelection = filters[type] as number[];
    let newSelection;
    
    if (currentSelection.includes(value)) {
      // Remove if already selected
      newSelection = currentSelection.filter(v => v !== value);
    } else {
      // Add to selection
      newSelection = [...currentSelection, value].sort((a, b) => a - b);
    }
    
    setFilters(prev => ({ ...prev, [type]: newSelection }));
  };

  const handleAmenityToggle = (amenity: string) => {
    const newAmenities = filters.amenities.includes(amenity)
      ? filters.amenities.filter(a => a !== amenity)
      : [...filters.amenities, amenity];
    handleFilterChange('amenities', newAmenities);
  };

  const handlePriceRangeChange = (values: number[]) => {
    if (values.length === 2) {
      setFilters(prev => ({ 
        ...prev, 
        priceRange: [values[0], values[1]] as [number, number],
        priceMin: values[0].toString(),
        priceMax: values[1].toString()
      }));
    }
  };

  const handleManualPriceChange = (type: 'min' | 'max', value: string) => {
    const numValue = parseIDRInput(value);
    if (type === 'min') {
      const newMin = Math.min(numValue, filters.priceRange[1] - 50000000); // Ensure min is less than max
      setFilters(prev => ({
        ...prev,
        priceMin: newMin.toString(),
        priceRange: [newMin, prev.priceRange[1]] as [number, number]
      }));
    } else {
      const newMax = Math.max(numValue, filters.priceRange[0] + 50000000); // Ensure max is greater than min
      setFilters(prev => ({
        ...prev,
        priceMax: newMax.toString(),
        priceRange: [prev.priceRange[0], newMax] as [number, number]
      }));
    }
  };

  const handleSearch = () => {
    onSearch({
      query: searchQuery,
      ...filters
    });
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setFilters({
      location: '',
      propertyType: '',
      listingType: '',
      priceMin: '',
      priceMax: '',
      priceRange: [100000000, 1000000000],
      bedrooms: [],
      bathrooms: [],
      amenities: [],
      state: '',
      city: '',
      development_status: '',
    });
  };

  // Count active filters
  const activeFiltersCount = Object.entries(filters).reduce((count, [key, value]) => {
    if (key === 'priceRange') {
      const [min, max] = value as [number, number];
      return count + (min !== 100000000 || max !== 1000000000 ? 1 : 0);
    }
    if (Array.isArray(value)) {
      return count + value.length;
    }
    return count + (value !== '' ? 1 : 0);
  }, 0) + (searchQuery !== '' ? 1 : 0);

  return (
    <div ref={filtersRef}>
      <Card className="w-full max-w-4xl mx-auto shadow-2xl 
        bg-card/90 dark:bg-card/85 
        border border-primary/20 dark:border-primary/25 
        backdrop-blur-xl rounded-2xl
        hover:border-primary/30 dark:hover:border-primary/40 
        hover:shadow-[0_8px_40px_hsl(var(--primary)/0.15)] dark:hover:shadow-[0_8px_40px_hsl(var(--primary)/0.2)]
        transition-all duration-300">
        <CardContent className="p-4 lg:p-6">
          <div className="space-y-3">
            {/* Main Search Bar */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary z-10" />
              <Input
                placeholder={currentText.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="relative pl-12 h-12 lg:h-14 text-base lg:text-lg 
                  border-2 border-border 
                  focus:border-primary 
                  focus:ring-2 focus:ring-primary/20
                  bg-background/80 
                  text-foreground 
                  placeholder:text-muted-foreground 
                  rounded-xl shadow-sm transition-all duration-300"
              />
            </div>

            {/* Mobile Filters Toggle Only */}
            <div className="flex md:hidden justify-end">
              <Button
                onClick={() => !isClosing && setShowAdvanced(!showAdvanced)}
                variant="outline"
                className="h-9 px-3 border-border/40 bg-background rounded-lg transition-all duration-200"
                disabled={isClosing}
              >
                <Filter className="h-4 w-4 mr-1" />
                {currentText.advancedFilters}
                {activeFiltersCount > 0 && (
                  <span className="ml-2 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
                <ChevronDown className={`h-4 w-4 ml-1 transition-transform duration-300 ${showAdvanced ? 'rotate-180' : ''}`} />
              </Button>
            </div>

            <div className="hidden md:flex justify-end">
              <Button
                onClick={() => !isClosing && setShowAdvanced(!showAdvanced)}
                variant="outline"
                className="h-10 lg:h-11 border-border/40 bg-background hover:bg-muted rounded-lg transition-all duration-200 relative"
                disabled={isClosing}
              >
                <Filter className="h-4 w-4 mr-2" />
                {currentText.advancedFilters}
                {activeFiltersCount > 0 && (
                  <Badge className="ml-2 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
                    {activeFiltersCount}
                  </Badge>
                )}
                <ChevronDown className={`h-4 w-4 ml-1 transition-transform duration-300 ${showAdvanced ? 'rotate-180' : ''}`} />
              </Button>
            </div>
            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
              showAdvanced && !isClosing
                ? 'max-h-[800px] opacity-100 transform translate-y-0' 
                : 'max-h-0 opacity-0 transform -translate-y-4'
            }`}>
              <div className="space-y-6 pt-4 border-t border-border">
                
                {/* Mobile-only Quick Filters */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Quick Filters
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* State Selection */}
                    <Select value={filters.state || "all"} onValueChange={(value) => handleFilterChange('state', value)}>
                      <SelectTrigger className="h-10 border-border bg-card text-foreground rounded-lg">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-primary" />
                          <SelectValue placeholder={currentText.location} />
                        </div>
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border z-50 max-h-60 overflow-y-auto">
                        <SelectItem value="all" className="text-foreground">{currentText.any}</SelectItem>
                        {Object.keys(locationsByProvince).map((province) => (
                          <SelectItem key={province} value={province} className="text-foreground">
                            📍 {province}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Property Type */}
                    <Select value={filters.propertyType || "all"} onValueChange={(value) => handleFilterChange('propertyType', value)}>
                      <SelectTrigger className="h-10 border-border bg-card text-foreground rounded-lg">
                        <div className="flex items-center gap-2">
                          <Home className="h-4 w-4 text-primary" />
                          <SelectValue placeholder={currentText.propertyType} />
                        </div>
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border z-50">
                        <SelectItem value="all" className="text-foreground">{currentText.any}</SelectItem>
                        {propertyTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value} className="text-foreground">
                            {type.icon} {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Listing Type */}
                    <Select value={filters.listingType || "all"} onValueChange={(value) => handleFilterChange('listingType', value)}>
                      <SelectTrigger className="h-10 border-border bg-card text-foreground rounded-lg">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-primary" />
                          <SelectValue placeholder={currentText.listingType} />
                        </div>
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border z-50">
                        <SelectItem value="all" className="text-foreground">{currentText.any}</SelectItem>
                        {listingTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value} className="text-foreground">
                            {type.icon} {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Basic Filters Category */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    {filterCategories.basic.title}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Select value={filters.development_status || "all"} onValueChange={(value) => handleFilterChange('development_status', value)}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder={currentText.developmentStatus} />
                      </SelectTrigger>
                      <SelectContent className="bg-popover z-50">
                        <SelectItem value="all">{currentText.any}</SelectItem>
                        {developmentStatuses.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.icon} {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Property Details Category */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Bed className="h-4 w-4" />
                    {filterCategories.details.title}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                        <Bed className="h-3 w-3" />
                        {currentText.bedrooms}
                        {filters.bedrooms.length > 0 && (
                          <Badge variant="secondary" className="ml-1 text-xs">
                            {filters.bedrooms.length}
                          </Badge>
                        )}
                      </label>
                      <div className="flex gap-1 flex-wrap">
                        {bedroomOptions.map((option) => (
                          <Button
                            key={option}
                            variant={filters.bedrooms.includes(option) ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleSmartSelection('bedrooms', option)}
                            className="text-xs h-8 transition-all duration-200 hover:scale-105"
                          >
                            {option}+
                          </Button>
                        ))}
                        {filters.bedrooms.length > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setFilters(prev => ({ ...prev, bedrooms: [] }))}
                            className="text-xs h-8 text-destructive hover:text-destructive/80"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                        <Bath className="h-3 w-3" />
                        {currentText.bathrooms}
                        {filters.bathrooms.length > 0 && (
                          <Badge variant="secondary" className="ml-1 text-xs">
                            {filters.bathrooms.length}
                          </Badge>
                        )}
                      </label>
                      <div className="flex gap-1 flex-wrap">
                        {bathroomOptions.map((option) => (
                          <Button
                            key={option}
                            variant={filters.bathrooms.includes(option) ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleSmartSelection('bathrooms', option)}
                            className="text-xs h-8 transition-all duration-200 hover:scale-105"
                          >
                            {option}+
                          </Button>
                        ))}
                        {filters.bathrooms.length > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setFilters(prev => ({ ...prev, bathrooms: [] }))}
                            className="text-xs h-8 text-destructive hover:text-destructive/80"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Price Range Category */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    {filterCategories.price.title}
                  </h3>
                  <div className="space-y-4">
                    {/* Price Range Slider */}
                    <div className="px-2">
                      <div className="flex justify-between text-xs text-muted-foreground mb-2">
                        <span>{formatIDR(filters.priceRange[0])}</span>
                        <span>{formatIDR(filters.priceRange[1])}</span>
                      </div>
                      <Slider
                        value={filters.priceRange}
                        onValueChange={handlePriceRangeChange}
                        min={100000000}
                        max={50000000000}
                        step={50000000}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>100M</span>
                        <span>50B</span>
                      </div>
                    </div>
                    
                    {/* Manual Price Input */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">
                          {currentText.from}
                        </label>
                        <Input
                          placeholder="100,000,000"
                          value={filters.priceMin ? formatNumberInput(parseInt(filters.priceMin)) : ''}
                          onChange={(e) => handleManualPriceChange('min', e.target.value)}
                          className="h-10 border-border bg-input text-foreground rounded-lg transition-all duration-200"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">
                          {currentText.to}
                        </label>
                        <Input
                          placeholder="1,000,000,000"
                          value={filters.priceMax ? formatNumberInput(parseInt(filters.priceMax)) : ''}
                          onChange={(e) => handleManualPriceChange('max', e.target.value)}
                          className="h-10 border-border bg-input text-foreground rounded-lg transition-all duration-200"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Amenities Category */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    ⭐ {filterCategories.amenities.title}
                    {filters.amenities.length > 0 && (
                      <Badge variant="secondary" className="ml-1 text-xs">
                        {filters.amenities.length}
                      </Badge>
                    )}
                  </h3>
                  <div className="flex gap-1.5 flex-wrap">
                    {amenitiesList.map((amenity) => (
                      <Badge
                        key={amenity.value}
                        variant={filters.amenities.includes(amenity.value) ? "default" : "outline"}
                        className="cursor-pointer hover:scale-105 transition-all duration-200 text-xs px-2 py-1"
                        onClick={() => handleAmenityToggle(amenity.value)}
                      >
                        {amenity.icon} {amenity.label}
                        {filters.amenities.includes(amenity.value) && (
                          <X className="h-3 w-3 ml-1" />
                        )}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons with Luxury Styling */}
            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleSearch}
                className="flex-1 h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
              >
                <Search className="h-4 w-4 mr-2" />
                {currentText.search}
              </Button>
              {activeFiltersCount > 0 && (
                <Button
                  onClick={clearAllFilters}
                  variant="outline"
                  className="h-11 px-4 border-border/40 text-muted-foreground hover:bg-muted rounded-lg transition-all duration-200"
                >
                  <X className="h-4 w-4 mr-1" />
                  {currentText.clearAll}
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {activeFiltersCount}
                  </Badge>
                </Button>
              )}
            </div>

            {/* Active Filters Summary */}
            {activeFiltersCount > 0 && (
              <div className="hidden md:block text-xs text-muted-foreground text-center animate-fade-in">
                {activeFiltersCount} {currentText.filtersApplied}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SmartSearchPanel;
