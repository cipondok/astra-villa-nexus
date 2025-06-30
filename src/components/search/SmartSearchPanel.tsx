
import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Home, DollarSign, Filter, X, Bed, Bath, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface SmartSearchPanelProps {
  language: "en" | "id";
  onSearch: (searchData: any) => void;
  onLiveSearch?: (searchTerm: string) => void;
}

const SmartSearchPanel = ({ language, onSearch, onLiveSearch }: SmartSearchPanelProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filters, setFilters] = useState({
    location: '',
    propertyType: '',
    listingType: '',
    priceMin: '',
    priceMax: '',
    bedrooms: [] as number[],
    bathrooms: [] as number[],
    amenities: [] as string[],
    state: '',
    city: '',
    development_status: '',
  });
  
  const filtersRef = useRef<HTMLDivElement>(null);

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

  const text = {
    en: {
      searchPlaceholder: "Search by location, property type, or keywords...",
      location: "Location",
      propertyType: "Property Type",
      listingType: "Listing Type",
      priceRange: "Price Range",
      bedrooms: "Bedrooms",
      bathrooms: "Bathrooms",
      amenities: "Amenities",
      search: "Search Properties",
      advancedFilters: "Advanced Filters",
      clearAll: "Clear Filters",
      clearSelected: "Clear",
      from: "Min Price",
      to: "Max Price",
      any: "Any",
      forSale: "For Sale",
      forRent: "For Rent",
      villa: "Villa",
      apartment: "Apartment",
      house: "House",
      townhouse: "Townhouse",
      land: "Land",
      pool: "Swimming Pool",
      garage: "Garage",
      garden: "Garden",
      security: "Security",
      gym: "Gym",
      furnished: "Furnished",
      filtersApplied: "filters applied",
      developmentStatus: "Development Status",
      completed: "Completed",
      preLaunching: "Pre-Launching",
      newProject: "New Project",
      ready: "Ready"
    },
    id: {
      searchPlaceholder: "Cari berdasarkan lokasi, jenis properti, atau kata kunci...",
      location: "Lokasi",
      propertyType: "Jenis Properti",
      listingType: "Tipe Listing",
      priceRange: "Range Harga",
      bedrooms: "Kamar Tidur",
      bathrooms: "Kamar Mandi",
      amenities: "Fasilitas",
      search: "Cari Properti",
      advancedFilters: "Filter Lanjutan",
      clearAll: "Hapus Filter",
      clearSelected: "Hapus",
      from: "Harga Min",
      to: "Harga Max",
      any: "Semua",
      forSale: "Dijual",
      forRent: "Disewa",
      villa: "Villa",
      apartment: "Apartemen",
      house: "Rumah",
      townhouse: "Rumah Teres",
      land: "Tanah",
      pool: "Kolam Renang",
      garage: "Garasi",
      garden: "Taman",
      security: "Keamanan",
      gym: "Gym",
      furnished: "Furnished",
      filtersApplied: "filter diterapkan",
      developmentStatus: "Status Pembangunan",
      completed: "Selesai",
      preLaunching: "Pra-Peluncuran",
      newProject: "Proyek Baru",
      ready: "Siap"
    }
  };

  const currentText = text[language];

  // Filter Categories
  const filterCategories = {
    basic: {
      title: language === 'en' ? 'Basic Filters' : 'Filter Dasar',
      filters: ['propertyType', 'listingType', 'state']
    },
    details: {
      title: language === 'en' ? 'Property Details' : 'Detail Properti',
      filters: ['bedrooms', 'bathrooms', 'developmentStatus']
    },
    price: {
      title: language === 'en' ? 'Price Range' : 'Range Harga',
      filters: ['priceRange']
    },
    amenities: {
      title: language === 'en' ? 'Amenities & Features' : 'Fasilitas & Fitur',
      filters: ['amenities']
    }
  };

  const propertyTypes = [
    { value: 'villa', label: currentText.villa, icon: '🏖️' },
    { value: 'apartment', label: currentText.apartment, icon: '🏢' },
    { value: 'house', label: currentText.house, icon: '🏠' },
    { value: 'townhouse', label: currentText.townhouse, icon: '🏘️' },
    { value: 'land', label: currentText.land, icon: '🌿' },
  ];

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

  const amenitiesList = [
    { value: 'pool', label: currentText.pool, icon: '🏊' },
    { value: 'garage', label: currentText.garage, icon: '🚗' },
    { value: 'garden', label: currentText.garden, icon: '🌳' },
    { value: 'security', label: currentText.security, icon: '🛡️' },
    { value: 'gym', label: currentText.gym, icon: '💪' },
    { value: 'furnished', label: currentText.furnished, icon: '🛋️' },
  ];

  const bedroomOptions = [1, 2, 3, 4, 5, 6];
  const bathroomOptions = [1, 2, 3, 4, 5];

  // Close filters when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filtersRef.current && !filtersRef.current.contains(event.target as Node)) {
        setShowAdvanced(false);
      }
    };

    if (showAdvanced) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAdvanced]);

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
    if (Array.isArray(value)) {
      return count + value.length;
    }
    return count + (value !== '' ? 1 : 0);
  }, 0) + (searchQuery !== '' ? 1 : 0);

  return (
    <div ref={filtersRef}>
      <Card className="w-full max-w-4xl mx-auto shadow-2xl border-0 bg-white/98 dark:bg-gray-900/98 backdrop-blur-xl">
        <CardContent className="p-4 lg:p-6">
          <div className="space-y-3">
            {/* Main Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-600 dark:text-blue-400" />
              <Input
                placeholder={currentText.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-12 h-12 lg:h-14 text-base lg:text-lg border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 rounded-xl shadow-sm transition-all duration-200"
              />
            </div>

            {/* Quick Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-3">
              {/* State Selection */}
              <Select value={filters.state || "all"} onValueChange={(value) => handleFilterChange('state', value)}>
                <SelectTrigger className="h-10 lg:h-11 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg transition-all duration-200">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <SelectValue placeholder={currentText.location} />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 z-50 max-h-60 overflow-y-auto">
                  <SelectItem value="all" className="text-gray-900 dark:text-gray-100">{currentText.any}</SelectItem>
                  {Object.keys(locationsByProvince).map((province) => (
                    <SelectItem key={province} value={province} className="text-gray-900 dark:text-gray-100">
                      📍 {province}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.propertyType || "all"} onValueChange={(value) => handleFilterChange('propertyType', value)}>
                <SelectTrigger className="h-10 lg:h-11 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg transition-all duration-200">
                  <div className="flex items-center gap-2">
                    <Home className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <SelectValue placeholder={currentText.propertyType} />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 z-50">
                  <SelectItem value="all" className="text-gray-900 dark:text-gray-100">{currentText.any}</SelectItem>
                  {propertyTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value} className="text-gray-900 dark:text-gray-100">
                      {type.icon} {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.listingType || "all"} onValueChange={(value) => handleFilterChange('listingType', value)}>
                <SelectTrigger className="h-10 lg:h-11 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg transition-all duration-200">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <SelectValue placeholder={currentText.listingType} />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 z-50">
                  <SelectItem value="all" className="text-gray-900 dark:text-gray-100">{currentText.any}</SelectItem>
                  {listingTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value} className="text-gray-900 dark:text-gray-100">
                      {type.icon} {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                onClick={() => setShowAdvanced(!showAdvanced)}
                variant="outline"
                className="h-10 lg:h-11 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 relative"
              >
                <Filter className="h-4 w-4 mr-2" />
                {currentText.advancedFilters}
                {activeFiltersCount > 0 && (
                  <Badge className="ml-2 bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {activeFiltersCount}
                  </Badge>
                )}
                <ChevronDown className={`h-4 w-4 ml-1 transition-transform duration-300 ${showAdvanced ? 'rotate-180' : ''}`} />
              </Button>
            </div>

            {/* Advanced Filters with Smooth Animation and Categories */}
            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
              showAdvanced 
                ? 'max-h-[800px] opacity-100 transform translate-y-0' 
                : 'max-h-0 opacity-0 transform -translate-y-4'
            }`}>
              <div className="space-y-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                
                {/* Basic Filters Category */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    {filterCategories.basic.title}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Select value={filters.development_status || "all"} onValueChange={(value) => handleFilterChange('development_status', value)}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder={currentText.developmentStatus} />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-800 z-50">
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
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                    <Bed className="h-4 w-4" />
                    {filterCategories.details.title}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
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
                            className="text-xs h-8 text-red-500 hover:text-red-700"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
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
                            className="text-xs h-8 text-red-500 hover:text-red-700"
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
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    {filterCategories.price.title}
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      placeholder={currentText.from}
                      value={filters.priceMin}
                      onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                      className="h-10 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg transition-all duration-200"
                      type="number"
                    />
                    <Input
                      placeholder={currentText.to}
                      value={filters.priceMax}
                      onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                      className="h-10 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg transition-all duration-200"
                      type="number"
                    />
                  </div>
                </div>

                {/* Amenities Category */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
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

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleSearch}
                className="flex-1 h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Search className="h-4 w-4 mr-2" />
                {currentText.search}
              </Button>
              {activeFiltersCount > 0 && (
                <Button
                  onClick={clearAllFilters}
                  variant="outline"
                  className="h-11 px-4 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
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
              <div className="text-xs text-gray-600 dark:text-gray-400 text-center animate-fade-in">
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
