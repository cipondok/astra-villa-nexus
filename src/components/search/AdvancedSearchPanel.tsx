import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Search, MapPin, Home, DollarSign, Filter, X, Bed, Bath, 
  ChevronDown, Calendar as CalendarIcon, Tag, Building2, SlidersHorizontal 
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

interface AdvancedSearchPanelProps {
  language: "en" | "id";
  onSearch: (searchData: any) => void;
  onLiveSearch?: (searchTerm: string) => void;
  activeTab?: "buy" | "rent";
}

interface DateRange {
  from?: Date;
  to?: Date;
}

const AdvancedSearchPanel = ({ language, onSearch, onLiveSearch, activeTab = "buy" }: AdvancedSearchPanelProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState<DateRange>({});
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
    tags: [] as string[],
    state: '',
    city: '',
    development_status: '',
  });

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
    staleTime: 300000,
  });

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
      tags: "Tags",
      dateRange: "Listing Date",
      search: "Search Properties",
      advancedFilters: "Advanced Filters",
      clearAll: "Clear All",
      clearSelected: "Clear",
      from: "Min Price",
      to: "Max Price",
      dateFrom: "From Date",
      dateTo: "To Date",
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
      ready: "Ready",
      categories: "Categories",
      propertyDetails: "Property Details",
      priceAndBudget: "Price & Budget",
      amenitiesFeatures: "Amenities & Features",
      dateFilters: "Date Filters",
      popularTags: "Popular Tags",
      luxury: "Luxury",
      beachfront: "Beachfront",
      mountainView: "Mountain View",
      cityCenter: "City Center",
      newListing: "New Listing",
      reduced: "Reduced Price",
      investment: "Investment",
      familyFriendly: "Family Friendly"
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
      tags: "Tag",
      dateRange: "Tanggal Listing",
      search: "Cari Properti",
      advancedFilters: "Filter Lanjutan",
      clearAll: "Hapus Semua",
      clearSelected: "Hapus",
      from: "Harga Min",
      to: "Harga Max",
      dateFrom: "Dari Tanggal",
      dateTo: "Sampai Tanggal",
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
      ready: "Siap",
      categories: "Kategori",
      propertyDetails: "Detail Properti",
      priceAndBudget: "Harga & Anggaran",
      amenitiesFeatures: "Fasilitas & Fitur",
      dateFilters: "Filter Tanggal",
      popularTags: "Tag Populer",
      luxury: "Mewah",
      beachfront: "Tepi Pantai",
      mountainView: "Pemandangan Gunung",
      cityCenter: "Pusat Kota",
      newListing: "Listing Baru",
      reduced: "Harga Turun",
      investment: "Investasi",
      familyFriendly: "Ramah Keluarga"
    }
  };

  const currentText = text[language];

  const propertyTypes = [
    { value: 'villa', label: currentText.villa, icon: '🏖️' },
    { value: 'apartment', label: currentText.apartment, icon: '🏢' },
    { value: 'house', label: currentText.house, icon: '🏠' },
    { value: 'townhouse', label: currentText.townhouse, icon: '🏘️' },
    ...(activeTab !== "rent" ? [{ value: 'land', label: currentText.land, icon: '🌿' }] : []),
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

  const amenitiesList = activeTab === "rent" 
    ? [
        { value: 'furnished', label: currentText.furnished, icon: '🛋️' },
        { value: 'wifi', label: 'WiFi', icon: '📶' },
        { value: 'ac', label: language === 'en' ? 'Air Conditioning' : 'AC', icon: '❄️' },
        { value: 'parking', label: language === 'en' ? 'Parking' : 'Parkir', icon: '🅿️' },
        { value: 'laundry', label: language === 'en' ? 'Laundry' : 'Laundry', icon: '👕' },
        { value: 'kitchen', label: language === 'en' ? 'Kitchen' : 'Dapur', icon: '🍳' },
      ]
    : [
        { value: 'pool', label: currentText.pool, icon: '🏊' },
        { value: 'garage', label: currentText.garage, icon: '🚗' },
        { value: 'garden', label: currentText.garden, icon: '🌳' },
        { value: 'security', label: currentText.security, icon: '🛡️' },
        { value: 'gym', label: currentText.gym, icon: '💪' },
        { value: 'furnished', label: currentText.furnished, icon: '🛋️' },
      ];

  const popularTags = [
    { value: 'luxury', label: currentText.luxury, icon: '💎' },
    { value: 'beachfront', label: currentText.beachfront, icon: '🏖️' },
    { value: 'mountain_view', label: currentText.mountainView, icon: '⛰️' },
    { value: 'city_center', label: currentText.cityCenter, icon: '🏙️' },
    { value: 'new_listing', label: currentText.newListing, icon: '🆕' },
    { value: 'reduced', label: currentText.reduced, icon: '📉' },
    { value: 'investment', label: currentText.investment, icon: '💼' },
    { value: 'family_friendly', label: currentText.familyFriendly, icon: '👨‍👩‍👧‍👦' },
  ];

  const bedroomOptions = [1, 2, 3, 4, 5, 6];
  const bathroomOptions = [1, 2, 3, 4, 5];

  const formatIDR = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const parseIDRInput = (value: string): number => {
    return parseInt(value.replace(/[^\d]/g, '')) || 0;
  };

  const formatNumberInput = (num: number): string => {
    return new Intl.NumberFormat('id-ID').format(num);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (onLiveSearch) {
      onLiveSearch(value);
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    const actualValue = value === "all" ? "" : value;
    setFilters(prev => ({ ...prev, [key]: actualValue }));
  };

  const handleSmartSelection = (type: 'bedrooms' | 'bathrooms', value: number) => {
    const currentSelection = filters[type] as number[];
    let newSelection;
    
    if (currentSelection.includes(value)) {
      newSelection = currentSelection.filter(v => v !== value);
    } else {
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

  const handleTagToggle = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag];
    setFilters(prev => ({ ...prev, tags: newTags }));
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
      const newMin = Math.min(numValue, filters.priceRange[1] - 50000000);
      setFilters(prev => ({
        ...prev,
        priceMin: newMin.toString(),
        priceRange: [newMin, prev.priceRange[1]] as [number, number]
      }));
    } else {
      const newMax = Math.max(numValue, filters.priceRange[0] + 50000000);
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
      dateFrom: dateRange.from,
      dateTo: dateRange.to,
      ...filters
    });
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setDateRange({});
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
      tags: [],
      state: '',
      city: '',
      development_status: '',
    });
  };

  const activeFiltersCount = Object.entries(filters).reduce((count, [key, value]) => {
    if (key === 'priceRange') {
      const [min, max] = value as [number, number];
      return count + (min !== 100000000 || max !== 1000000000 ? 1 : 0);
    }
    if (Array.isArray(value)) {
      return count + value.length;
    }
    return count + (value !== '' ? 1 : 0);
  }, 0) + (searchQuery !== '' ? 1 : 0) + (dateRange.from || dateRange.to ? 1 : 0);

  return (
    <SidebarProvider>
      <div className="flex w-full min-h-[600px] relative">
        {/* Filter Sidebar */}
        <FilterSidebar
          currentText={currentText}
          filters={filters}
          dateRange={dateRange}
          setDateRange={setDateRange}
          locationsByProvince={locationsByProvince}
          propertyTypes={propertyTypes}
          listingTypes={listingTypes}
          developmentStatuses={developmentStatuses}
          bedroomOptions={bedroomOptions}
          bathroomOptions={bathroomOptions}
          amenitiesList={amenitiesList}
          popularTags={popularTags}
          handleFilterChange={handleFilterChange}
          handleSmartSelection={handleSmartSelection}
          handleAmenityToggle={handleAmenityToggle}
          handleTagToggle={handleTagToggle}
          handlePriceRangeChange={handlePriceRangeChange}
          handleManualPriceChange={handleManualPriceChange}
          formatIDR={formatIDR}
          formatNumberInput={formatNumberInput}
          clearAllFilters={clearAllFilters}
          activeFiltersCount={activeFiltersCount}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4">
          <Card className="w-full shadow-lg border-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md">
            <CardContent className="p-4 lg:p-6">
              <div className="space-y-4">
                {/* Header with Trigger */}
                <div className="flex items-center gap-3">
                  <SidebarTrigger className="lg:hidden" />
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {currentText.search}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {activeFiltersCount > 0 && `${activeFiltersCount} ${currentText.filtersApplied}`}
                    </p>
                  </div>
                  <SidebarTrigger className="hidden lg:flex" />
                </div>

                {/* Main Search Bar */}
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary" />
                  <Input
                    placeholder={currentText.searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-12 h-12 lg:h-14 text-base border-2 focus:border-primary rounded-xl"
                  />
                </div>

                {/* Quick Filters (visible on desktop) */}
                <div className="hidden lg:grid grid-cols-3 gap-3">
                  <Select value={filters.state || "all"} onValueChange={(value) => handleFilterChange('state', value)}>
                    <SelectTrigger className="h-11">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        <SelectValue placeholder={currentText.location} />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="z-50 max-h-60">
                      <SelectItem value="all">{currentText.any}</SelectItem>
                      {Object.keys(locationsByProvince).map((province) => (
                        <SelectItem key={province} value={province}>
                          📍 {province}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={filters.propertyType || "all"} onValueChange={(value) => handleFilterChange('propertyType', value)}>
                    <SelectTrigger className="h-11">
                      <div className="flex items-center gap-2">
                        <Home className="h-4 w-4 text-primary" />
                        <SelectValue placeholder={currentText.propertyType} />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="z-50">
                      <SelectItem value="all">{currentText.any}</SelectItem>
                      {propertyTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.icon} {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={filters.listingType || "all"} onValueChange={(value) => handleFilterChange('listingType', value)}>
                    <SelectTrigger className="h-11">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-primary" />
                        <SelectValue placeholder={currentText.listingType} />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="z-50">
                      <SelectItem value="all">{currentText.any}</SelectItem>
                      {listingTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.icon} {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Active Tags Display */}
                {filters.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {filters.tags.map((tag) => {
                      const tagInfo = popularTags.find(t => t.value === tag);
                      return (
                        <Badge key={tag} variant="secondary" className="px-3 py-1">
                          {tagInfo?.icon} {tagInfo?.label}
                          <X 
                            className="h-3 w-3 ml-2 cursor-pointer" 
                            onClick={() => handleTagToggle(tag)}
                          />
                        </Badge>
                      );
                    })}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={handleSearch}
                    className="flex-1 h-12 bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 font-semibold rounded-xl shadow-lg transition-all"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    {currentText.search}
                  </Button>
                  {activeFiltersCount > 0 && (
                    <Button
                      onClick={clearAllFilters}
                      variant="outline"
                      className="h-12 px-6 rounded-xl"
                    >
                      <X className="h-4 w-4 mr-2" />
                      {currentText.clearAll}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </SidebarProvider>
  );
};

// Sidebar Component
function FilterSidebar({
  currentText,
  filters,
  dateRange,
  setDateRange,
  locationsByProvince,
  propertyTypes,
  listingTypes,
  developmentStatuses,
  bedroomOptions,
  bathroomOptions,
  amenitiesList,
  popularTags,
  handleFilterChange,
  handleSmartSelection,
  handleAmenityToggle,
  handleTagToggle,
  handlePriceRangeChange,
  handleManualPriceChange,
  formatIDR,
  formatNumberInput,
  clearAllFilters,
  activeFiltersCount,
}: any) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar className={cn(
      "border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      isCollapsed ? "w-0" : "w-80"
    )}>
      <SidebarContent className="overflow-y-auto">
        {/* Categories Group */}
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2 text-base font-semibold">
            <Building2 className="h-4 w-4" />
            {currentText.categories}
          </SidebarGroupLabel>
          <SidebarGroupContent className="space-y-4 px-3">
            {/* Location */}
            <div className="space-y-2">
              <label className="text-xs font-medium flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {currentText.location}
              </label>
              <Select value={filters.state || "all"} onValueChange={(value) => handleFilterChange('state', value)}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder={currentText.location} />
                </SelectTrigger>
                <SelectContent className="z-50 max-h-48">
                  <SelectItem value="all">{currentText.any}</SelectItem>
                  {Object.keys(locationsByProvince).map((province) => (
                    <SelectItem key={province} value={province}>
                      📍 {province}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Property Type */}
            <div className="space-y-2">
              <label className="text-xs font-medium flex items-center gap-1">
                <Home className="h-3 w-3" />
                {currentText.propertyType}
              </label>
              <Select value={filters.propertyType || "all"} onValueChange={(value) => handleFilterChange('propertyType', value)}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder={currentText.propertyType} />
                </SelectTrigger>
                <SelectContent className="z-50">
                  <SelectItem value="all">{currentText.any}</SelectItem>
                  {propertyTypes.map((type: any) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Listing Type */}
            <div className="space-y-2">
              <label className="text-xs font-medium flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                {currentText.listingType}
              </label>
              <Select value={filters.listingType || "all"} onValueChange={(value) => handleFilterChange('listingType', value)}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder={currentText.listingType} />
                </SelectTrigger>
                <SelectContent className="z-50">
                  <SelectItem value="all">{currentText.any}</SelectItem>
                  {listingTypes.map((type: any) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Development Status */}
            <div className="space-y-2">
              <label className="text-xs font-medium">{currentText.developmentStatus}</label>
              <Select value={filters.development_status || "all"} onValueChange={(value) => handleFilterChange('development_status', value)}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder={currentText.developmentStatus} />
                </SelectTrigger>
                <SelectContent className="z-50">
                  <SelectItem value="all">{currentText.any}</SelectItem>
                  {developmentStatuses.map((status: any) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.icon} {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator />

        {/* Property Details Group */}
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2 text-base font-semibold">
            <Bed className="h-4 w-4" />
            {currentText.propertyDetails}
          </SidebarGroupLabel>
          <SidebarGroupContent className="space-y-4 px-3">
            {/* Bedrooms */}
            <div className="space-y-2">
              <label className="text-xs font-medium flex items-center gap-1">
                <Bed className="h-3 w-3" />
                {currentText.bedrooms}
                {filters.bedrooms.length > 0 && (
                  <Badge variant="secondary" className="ml-1 text-[10px] px-1">
                    {filters.bedrooms.length}
                  </Badge>
                )}
              </label>
              <div className="flex gap-1 flex-wrap">
                {bedroomOptions.map((option: number) => (
                  <Button
                    key={option}
                    variant={filters.bedrooms.includes(option) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleSmartSelection('bedrooms', option)}
                    className="text-xs h-7 px-2"
                  >
                    {option}+
                  </Button>
                ))}
              </div>
            </div>

            {/* Bathrooms */}
            <div className="space-y-2">
              <label className="text-xs font-medium flex items-center gap-1">
                <Bath className="h-3 w-3" />
                {currentText.bathrooms}
                {filters.bathrooms.length > 0 && (
                  <Badge variant="secondary" className="ml-1 text-[10px] px-1">
                    {filters.bathrooms.length}
                  </Badge>
                )}
              </label>
              <div className="flex gap-1 flex-wrap">
                {bathroomOptions.map((option: number) => (
                  <Button
                    key={option}
                    variant={filters.bathrooms.includes(option) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleSmartSelection('bathrooms', option)}
                    className="text-xs h-7 px-2"
                  >
                    {option}+
                  </Button>
                ))}
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator />

        {/* Price Range Group */}
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2 text-base font-semibold">
            <DollarSign className="h-4 w-4" />
            {currentText.priceAndBudget}
          </SidebarGroupLabel>
          <SidebarGroupContent className="space-y-3 px-3">
            <div className="space-y-3">
              <div className="flex justify-between text-xs text-muted-foreground">
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
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-medium text-muted-foreground">
                    {currentText.from}
                  </label>
                  <Input
                    placeholder="100,000,000"
                    value={filters.priceMin ? formatNumberInput(parseInt(filters.priceMin)) : ''}
                    onChange={(e) => handleManualPriceChange('min', e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-medium text-muted-foreground">
                    {currentText.to}
                  </label>
                  <Input
                    placeholder="1,000,000,000"
                    value={filters.priceMax ? formatNumberInput(parseInt(filters.priceMax)) : ''}
                    onChange={(e) => handleManualPriceChange('max', e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator />

        {/* Date Range Group */}
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2 text-base font-semibold">
            <CalendarIcon className="h-4 w-4" />
            {currentText.dateFilters}
          </SidebarGroupLabel>
          <SidebarGroupContent className="space-y-3 px-3">
            <div className="space-y-2">
              <label className="text-xs font-medium">{currentText.dateFrom}</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal h-9 text-xs",
                      !dateRange.from && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-3 w-3" />
                    {dateRange.from ? format(dateRange.from, "PPP") : <span>{currentText.dateFrom}</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-50" align="start">
                  <Calendar
                    mode="single"
                    selected={dateRange.from}
                    onSelect={(date) => setDateRange(prev => ({ ...prev, from: date }))}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium">{currentText.dateTo}</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal h-9 text-xs",
                      !dateRange.to && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-3 w-3" />
                    {dateRange.to ? format(dateRange.to, "PPP") : <span>{currentText.dateTo}</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-50" align="start">
                  <Calendar
                    mode="single"
                    selected={dateRange.to}
                    onSelect={(date) => setDateRange(prev => ({ ...prev, to: date }))}
                    disabled={(date) => dateRange.from ? date < dateRange.from : false}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {(dateRange.from || dateRange.to) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDateRange({})}
                className="w-full h-8 text-xs text-destructive"
              >
                <X className="h-3 w-3 mr-1" />
                Clear Dates
              </Button>
            )}
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator />

        {/* Amenities Group */}
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2 text-base font-semibold">
            ⭐ {currentText.amenitiesFeatures}
            {filters.amenities.length > 0 && (
              <Badge variant="secondary" className="ml-1 text-[10px] px-1">
                {filters.amenities.length}
              </Badge>
            )}
          </SidebarGroupLabel>
          <SidebarGroupContent className="px-3">
            <div className="flex gap-1.5 flex-wrap">
              {amenitiesList.map((amenity: any) => (
                <Badge
                  key={amenity.value}
                  variant={filters.amenities.includes(amenity.value) ? "default" : "outline"}
                  className="cursor-pointer transition-all text-[10px] px-2 py-0.5"
                  onClick={() => handleAmenityToggle(amenity.value)}
                >
                  {amenity.icon} {amenity.label}
                </Badge>
              ))}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator />

        {/* Tags Group */}
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2 text-base font-semibold">
            <Tag className="h-4 w-4" />
            {currentText.popularTags}
            {filters.tags.length > 0 && (
              <Badge variant="secondary" className="ml-1 text-[10px] px-1">
                {filters.tags.length}
              </Badge>
            )}
          </SidebarGroupLabel>
          <SidebarGroupContent className="px-3">
            <div className="flex gap-1.5 flex-wrap">
              {popularTags.map((tag: any) => (
                <Badge
                  key={tag.value}
                  variant={filters.tags.includes(tag.value) ? "default" : "outline"}
                  className="cursor-pointer transition-all text-[10px] px-2 py-0.5"
                  onClick={() => handleTagToggle(tag.value)}
                >
                  {tag.icon} {tag.label}
                </Badge>
              ))}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Clear All Button */}
        {activeFiltersCount > 0 && (
          <div className="px-3 pb-4">
            <Button
              onClick={clearAllFilters}
              variant="outline"
              className="w-full h-9 text-xs text-destructive hover:bg-destructive/10"
            >
              <X className="h-3 w-3 mr-2" />
              {currentText.clearAll} ({activeFiltersCount})
            </Button>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}

export default AdvancedSearchPanel;
