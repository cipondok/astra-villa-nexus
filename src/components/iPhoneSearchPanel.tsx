import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Search, MapPin, Home, Building, DollarSign, Filter, Bed, Bath, X, Bot, Sparkles, Zap, Square, Star, Calendar, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface IPhoneSearchPanelProps {
  language: "en" | "id";
  onSearch: (searchData: any) => void;
  onLiveSearch?: (searchTerm: string) => void;
  resultsCount?: number;
}

const IPhoneSearchPanel = ({ language, onSearch, onLiveSearch, resultsCount }: IPhoneSearchPanelProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<'all' | 'sale' | 'rent'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [areaRange, setAreaRange] = useState([0, 1000]);
  const [filters, setFilters] = useState({
    location: '',
    propertyType: '',
    priceRange: '',
    bedrooms: '',
    bathrooms: '',
    minArea: '',
    maxArea: '',
    features: [] as string[],
    yearBuilt: '',
    condition: '',
    sortBy: 'newest'
  });

  // Dynamic data from database
  const [dynamicLocations, setDynamicLocations] = useState<{value: string, label: string}[]>([]);
  const [dynamicPropertyTypes, setDynamicPropertyTypes] = useState<{value: string, label: string}[]>([]);

  // Fetch dynamic data on component mount
  useEffect(() => {
    const fetchDynamicData = async () => {
      try {
        // Fetch unique cities and locations
        const { data: locationData } = await supabase
          .from('properties')
          .select('city, location')
          .not('city', 'is', null);

        // Fetch unique property types
        const { data: typeData } = await supabase
          .from('properties')
          .select('property_type')
          .not('property_type', 'is', null);

        if (locationData) {
          const uniqueLocations = [...new Set([
            ...locationData.map(item => item.city),
            ...locationData.map(item => item.location)
          ])].filter(Boolean).map(loc => ({
            value: loc.toLowerCase(),
            label: loc
          }));
          setDynamicLocations(uniqueLocations);
        }

        if (typeData) {
          const uniqueTypes = [...new Set(typeData.map(item => item.property_type))]
            .filter(Boolean)
            .map(type => ({
              value: type,
              label: type.charAt(0).toUpperCase() + type.slice(1)
            }));
          setDynamicPropertyTypes(uniqueTypes);
        }
      } catch (error) {
        console.error('Error fetching dynamic data:', error);
      }
    };

    fetchDynamicData();
  }, []);

  const text = {
    en: {
      searchPlaceholder: "Search properties, locations, or keywords...",
      search: "Search",
      all: "All",
      location: "Location",
      propertyType: "Property Type",
      listingType: "Listing Type",
      priceRange: "Price Range",
      bedrooms: "Bedrooms",
      bathrooms: "Bathrooms",
      area: "Area (m²)",
      features: "Features",
      yearBuilt: "Year Built",
      condition: "Condition",
      sortBy: "Sort By",
      any: "Any",
      forSale: "For Sale",
      forRent: "For Rent",
      villa: "Villa",
      apartment: "Apartment",
      house: "House",
      townhouse: "Townhouse",
      land: "Land",
      condo: "Condo",
      office: "Office",
      under500k: "Under 500K",
      "500k-1m": "500K - 1M",
      "1m-2m": "1M - 2M",
      "2m-5m": "2M - 5M",
      "5m+": "5M+",
      resultsFound: "properties found",
      filters: "Filters",
      clearFilters: "Clear All",
      advancedFilters: "Advanced Filters",
      selectedFilters: "Selected Filters",
      newest: "Newest",
      priceLow: "Price: Low to High",
      priceHigh: "Price: High to Low",
      areaLarge: "Area: Largest",
      parking: "Parking",
      pool: "Swimming Pool",
      gym: "Gym",
      garden: "Garden",
      security: "24h Security",
      furnished: "Furnished"
    },
    id: {
      searchPlaceholder: "Cari properti, lokasi, atau kata kunci...",
      search: "Cari",
      all: "Semua",
      location: "Lokasi",
      propertyType: "Jenis Properti",
      listingType: "Tipe Listing",
      priceRange: "Range Harga",
      bedrooms: "Kamar Tidur",
      bathrooms: "Kamar Mandi",
      area: "Luas (m²)",
      features: "Fasilitas",
      yearBuilt: "Tahun Dibangun",
      condition: "Kondisi",
      sortBy: "Urutkan",
      any: "Semua",
      forSale: "Dijual",
      forRent: "Disewa",
      villa: "Villa",
      apartment: "Apartemen",
      house: "Rumah",
      townhouse: "Rumah Teres",
      land: "Tanah",
      condo: "Kondominium",
      office: "Kantor",
      under500k: "Dibawah 500K",
      "500k-1m": "500K - 1M",
      "1m-2m": "1M - 2M",
      "2m-5m": "2M - 5M",
      "5m+": "5M+",
      resultsFound: "properti ditemukan",
      filters: "Filter",
      clearFilters: "Hapus Semua",
      advancedFilters: "Filter Lanjutan",
      selectedFilters: "Filter Terpilih",
      newest: "Terbaru",
      priceLow: "Harga: Rendah ke Tinggi",
      priceHigh: "Harga: Tinggi ke Rendah",
      areaLarge: "Luas: Terbesar",
      parking: "Parkir",
      pool: "Kolam Renang",
      gym: "Gym",
      garden: "Taman",
      security: "Keamanan 24j",
      furnished: "Furnished"
    }
  };

  const currentText = text[language];

  const staticPropertyTypes = [
    { value: 'villa', label: currentText.villa, icon: Building },
    { value: 'apartment', label: currentText.apartment, icon: Building },
    { value: 'house', label: currentText.house, icon: Home },
    { value: 'townhouse', label: currentText.townhouse, icon: Home },
    { value: 'condo', label: currentText.condo, icon: Building },
    { value: 'land', label: currentText.land, icon: MapPin },
    { value: 'office', label: currentText.office, icon: Building },
  ];

  const propertyFeatures = [
    { id: 'parking', label: currentText.parking, icon: '🚗' },
    { id: 'swimming_pool', label: currentText.pool, icon: '🏊' },
    { id: 'gym', label: currentText.gym, icon: '💪' },
    { id: 'garden', label: currentText.garden, icon: '🌿' },
    { id: 'security', label: currentText.security, icon: '🔒' },
    { id: 'furnished', label: currentText.furnished, icon: '🛋️' },
  ];

  // Use dynamic data if available, fallback to static
  const locationOptions = dynamicLocations.length > 0 ? dynamicLocations : [
    { value: 'jakarta', label: 'Jakarta' },
    { value: 'bali', label: 'Bali' },
    { value: 'surabaya', label: 'Surabaya' },
    { value: 'bandung', label: 'Bandung' },
    { value: 'medan', label: 'Medan' },
    { value: 'semarang', label: 'Semarang' },
  ];

  const propertyTypeOptions = dynamicPropertyTypes.length > 0 ? 
    dynamicPropertyTypes.map(type => ({
      ...type,
      icon: staticPropertyTypes.find(st => st.value === type.value)?.icon || Building
    })) : staticPropertyTypes;

  // Different filters based on active tab
  const getSaleFilters = () => ({
    priceRanges: [
      { value: '500000000-1000000000', label: '500jt - 1M' },
      { value: '1000000000-2000000000', label: '1M - 2M' },
      { value: '2000000000-5000000000', label: '2M - 5M' },
      { value: '5000000000-10000000000', label: '5M - 10M' },
      { value: '10000000000+', label: '10M+' },
    ],
    propertyTypes: propertyTypeOptions.filter(type => 
      ['villa', 'house', 'townhouse', 'apartment', 'condo', 'land'].includes(type.value)
    ),
    features: [
      { id: 'parking', label: currentText.parking, icon: '🚗' },
      { id: 'swimming_pool', label: currentText.pool, icon: '🏊' },
      { id: 'gym', label: currentText.gym, icon: '💪' },
      { id: 'garden', label: currentText.garden, icon: '🌿' },
      { id: 'security', label: currentText.security, icon: '🔒' },
    ],
    maxPrice: 20000,
    priceStep: 500
  });

  const getRentFilters = () => ({
    priceRanges: [
      { value: '1000000-3000000', label: '1jt - 3jt/month' },
      { value: '3000000-5000000', label: '3jt - 5jt/month' },
      { value: '5000000-10000000', label: '5jt - 10jt/month' },
      { value: '10000000-20000000', label: '10jt - 20jt/month' },
      { value: '20000000+', label: '20jt+/month' },
    ],
    propertyTypes: propertyTypeOptions.filter(type => 
      ['apartment', 'condo', 'villa', 'house', 'townhouse', 'office'].includes(type.value)
    ),
    features: [
      { id: 'furnished', label: currentText.furnished, icon: '🛋️' },
      { id: 'parking', label: currentText.parking, icon: '🚗' },
      { id: 'swimming_pool', label: currentText.pool, icon: '🏊' },
      { id: 'gym', label: currentText.gym, icon: '💪' },
      { id: 'security', label: currentText.security, icon: '🔒' },
    ],
    maxPrice: 100,
    priceStep: 5
  });

  const getAllFilters = () => ({
    priceRanges: [
      { value: '100000000-500000000', label: '100jt - 500jt' },
      { value: '500000000-1000000000', label: '500jt - 1M' },
      { value: '1000000000-5000000000', label: '1M - 5M' },
      { value: '5000000000+', label: '5M+' },
    ],
    propertyTypes: propertyTypeOptions,
    features: propertyFeatures,
    maxPrice: 15000,
    priceStep: 100
  });

  // Get current filters based on active tab
  const getCurrentFilters = () => {
    switch (activeTab) {
      case 'sale': return getSaleFilters();
      case 'rent': return getRentFilters();
      default: return getAllFilters();
    }
  };

  const currentFilters = getCurrentFilters();

  const sortOptions = [
    { value: 'newest', label: currentText.newest },
    { value: 'price_low', label: currentText.priceLow },
    { value: 'price_high', label: currentText.priceHigh },
    { value: 'area_large', label: currentText.areaLarge },
  ];

  const yearOptions = [
    { value: '2024', label: '2024' },
    { value: '2023', label: '2023' },
    { value: '2022', label: '2022' },
    { value: '2021', label: '2021' },
    { value: '2020', label: '2020' },
    { value: '2015-2019', label: '2015-2019' },
    { value: '2010-2014', label: '2010-2014' },
    { value: 'below-2010', label: 'Before 2010' },
  ];

  const conditionOptions = [
    { value: 'new', label: 'New/Unoccupied' },
    { value: 'excellent', label: 'Excellent' },
    { value: 'good', label: 'Good' },
    { value: 'needs_renovation', label: 'Needs Renovation' },
  ];

  const bedroomOptions = ['1', '2', '3', '4', '5+'];
  const bathroomOptions = ['1', '2', '3', '4+'];

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

  const handleFeatureToggle = (featureId: string) => {
    setFilters(prev => ({
      ...prev,
      features: prev.features.includes(featureId)
        ? prev.features.filter(f => f !== featureId)
        : [...prev.features, featureId]
    }));
  };

  const getActiveFiltersCount = () => {
    return Object.entries(filters).filter(([key, value]) => {
      if (key === 'features') return Array.isArray(value) && value.length > 0;
      return value !== '' && value !== 'newest';
    }).length;
  };

  const clearAllFilters = () => {
    setFilters({
      location: '',
      propertyType: '',
      priceRange: '',
      bedrooms: '',
      bathrooms: '',
      minArea: '',
      maxArea: '',
      features: [],
      yearBuilt: '',
      condition: '',
      sortBy: 'newest'
    });
    setPriceRange([0, 10000]);
    setAreaRange([0, 1000]);
  };

  const formatPrice = (price: number) => {
    if (price >= 1000) return `${price / 1000} M`;
    return `${price} Jt`;
  };

  const getSelectedFiltersDisplay = () => {
    const selected = [];
    if (filters.location) selected.push(filters.location);
    if (filters.propertyType) selected.push(currentText[filters.propertyType as keyof typeof currentText] || filters.propertyType);
    if (filters.priceRange) selected.push(filters.priceRange);
    if (filters.bedrooms) selected.push(`${filters.bedrooms} bed`);
    if (filters.bathrooms) selected.push(`${filters.bathrooms} bath`);
    if (filters.features.length > 0) selected.push(`${filters.features.length} features`);
    if (filters.yearBuilt) selected.push(filters.yearBuilt);
    if (filters.condition) selected.push(filters.condition);
    return selected;
  };

  const handleSearch = () => {
    const listingType = activeTab === 'all' ? '' : activeTab;
    onSearch({
      searchQuery,
      listingType,
      ...filters,
      minPrice: priceRange[0] * 1000000,
      maxPrice: priceRange[1] * 1000000,
      minArea: areaRange[0],
      maxArea: areaRange[1]
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* iPhone-style Glass Container */}
      <div className="professional-card border-0 bg-gradient-to-br from-background/40 via-muted/40 to-background/40 backdrop-blur-2xl shadow-2xl overflow-hidden">
        <div className="p-6 space-y-4">
          
          {/* For Sale/For Rent/All Tabs */}
          <div className="flex justify-center">
            <div className="flex bg-muted/40 backdrop-blur-sm rounded-lg p-0.5 border border-border/50">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-md font-medium text-sm transition-all ${
                  activeTab === 'all' 
                    ? 'btn-primary text-primary-foreground shadow-lg transform scale-105' 
                    : 'text-foreground hover:text-foreground hover:bg-muted/20'
                }`}
              >
                {currentText.all}
              </button>
              <button
                onClick={() => setActiveTab('sale')}
                className={`px-4 py-2 rounded-md font-medium text-sm transition-all ${
                  activeTab === 'sale' 
                    ? 'btn-primary text-primary-foreground shadow-lg transform scale-105' 
                    : 'text-foreground hover:text-foreground hover:bg-muted/20'
                }`}
              >
                {currentText.forSale}
              </button>
              <button
                onClick={() => setActiveTab('rent')}
                className={`px-4 py-2 rounded-md font-medium text-sm transition-all ${
                  activeTab === 'rent' 
                    ? 'btn-primary text-primary-foreground shadow-lg transform scale-105' 
                    : 'text-foreground hover:text-foreground hover:bg-muted/20'
                }`}
              >
                {currentText.forRent}
              </button>
            </div>
          </div>
          
          {/* Search Row */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-primary" />
              <Input
                placeholder={currentText.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 h-10 text-sm"
              />
            </div>
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              className="h-10 w-10 p-0 relative"
            >
              <Filter className="h-4 w-4" />
              {getActiveFiltersCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {getActiveFiltersCount()}
                </span>
              )}
            </Button>
            <Button
              onClick={handleSearch}
              className="btn-primary h-10 px-6 font-medium text-sm relative overflow-hidden group"
            >
              <div className="flex items-center gap-2 relative z-10">
                <div className="relative">
                  <Bot className="h-4 w-4 transition-all duration-300 group-hover:scale-110" />
                  <Zap className="h-3 w-3 absolute -top-0.5 -right-0.5 text-yellow-300 animate-pulse opacity-80" />
                </div>
                <span className="relative">
                  {currentText.search}
                  <Sparkles className="h-2.5 w-2.5 absolute -top-1 -right-1 text-yellow-300 animate-bounce" />
                </span>
              </div>
            </Button>
          </div>

          {/* Results Count */}
          {resultsCount !== undefined && (
            <div className="text-center">
              <p className="text-xs text-muted-foreground bg-muted/30 px-3 py-1 rounded-md backdrop-blur-sm inline-block">
                {resultsCount} {currentText.resultsFound}
              </p>
            </div>
          )}

          {/* Selected Filters Display */}
          {getSelectedFiltersDisplay().length > 0 && (
            <div className="flex flex-wrap gap-1 justify-center">
              {getSelectedFiltersDisplay().map((filter, index) => (
                <span
                  key={index}
                  className="text-xs px-2 py-1 bg-primary/20 text-primary rounded-md backdrop-blur-sm border border-primary/30"
                >
                  {filter}
                </span>
              ))}
            </div>
          )}

          {/* Basic Filters Row */}
          <div className="grid grid-cols-3 gap-2">
            {/* Location Selection */}
            <Select value={filters.location || "all"} onValueChange={(value) => handleFilterChange('location', value)}>
              <SelectTrigger className="h-8 text-xs">
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-primary" />
                  <SelectValue placeholder={currentText.location} />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">{currentText.any}</SelectItem>
                {locationOptions.map((location) => (
                  <SelectItem key={location.value} value={location.value} className="text-xs">
                    {location.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Property Type Selection */}
            <Select value={filters.propertyType || "all"} onValueChange={(value) => handleFilterChange('propertyType', value)}>
              <SelectTrigger className="h-8 text-xs">
                <div className="flex items-center gap-1">
                  <Home className="h-3 w-3 text-primary" />
                  <SelectValue placeholder={currentText.propertyType} />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">{currentText.any}</SelectItem>
                {currentFilters.propertyTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value} className="text-xs">
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Price Range */}
            <Select value={filters.priceRange || "all"} onValueChange={(value) => handleFilterChange('priceRange', value)}>
              <SelectTrigger className="h-8 text-xs">
                <div className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3 text-primary" />
                  <SelectValue placeholder={currentText.priceRange} />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">{currentText.any}</SelectItem>
                {currentFilters.priceRanges.map((range) => (
                  <SelectItem key={range.value} value={range.value} className="text-xs">
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Advanced Filters Modal */}
          {showFilters && (
            <div className="bg-card/40 backdrop-blur-xl border border-border rounded-xl p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-foreground font-medium text-sm">{currentText.advancedFilters}</h3>
                <Button
                  onClick={clearAllFilters}
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 text-xs"
                >
                  <X className="h-3 w-3 mr-1" />
                  {currentText.clearFilters}
                </Button>
              </div>
              
              {/* Bedrooms & Bathrooms */}
              <div className="grid grid-cols-2 gap-3">
                <Select value={filters.bedrooms || "all"} onValueChange={(value) => handleFilterChange('bedrooms', value)}>
                  <SelectTrigger className="h-8 text-xs">
                    <div className="flex items-center gap-1">
                      <Bed className="h-3 w-3 text-primary" />
                      <SelectValue placeholder={currentText.bedrooms} />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-xs">{currentText.any}</SelectItem>
                    {bedroomOptions.map((option) => (
                      <SelectItem key={option} value={option} className="text-xs">
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filters.bathrooms || "all"} onValueChange={(value) => handleFilterChange('bathrooms', value)}>
                  <SelectTrigger className="h-8 text-xs">
                    <div className="flex items-center gap-1">
                      <Bath className="h-3 w-3 text-primary" />
                      <SelectValue placeholder={currentText.bathrooms} />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-xs">{currentText.any}</SelectItem>
                    {bathroomOptions.map((option) => (
                      <SelectItem key={option} value={option} className="text-xs">
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range Slider */}
              <div>
                <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  {currentText.priceRange}: Rp {formatPrice(priceRange[0])} - Rp {formatPrice(priceRange[1])}
                </Label>
                <div className="mt-3">
                  <Slider
                    value={priceRange}
                    onValueChange={(value) => {
                      setPriceRange(value);
                      handleFilterChange('minPrice', value[0] * (currentFilters.priceStep * 1000000));
                      handleFilterChange('maxPrice', value[1] * (currentFilters.priceStep * 1000000));
                    }}
                    max={currentFilters.maxPrice}
                    min={0}
                    step={currentFilters.priceStep}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Rp 0</span>
                    <span>Rp {currentFilters.maxPrice >= 1000 ? `${currentFilters.maxPrice/1000}M+` : `${currentFilters.maxPrice}jt+`}</span>
                  </div>
                </div>
              </div>

              {/* Area Range Slider */}
              <div>
                <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Square className="h-4 w-4" />
                  {currentText.area}: {areaRange[0]} - {areaRange[1]} m²
                </Label>
                <div className="mt-3">
                  <Slider
                    value={areaRange}
                    onValueChange={(value) => {
                      setAreaRange(value);
                      handleFilterChange('minArea', value[0]);
                      handleFilterChange('maxArea', value[1]);
                    }}
                    max={1000}
                    min={0}
                    step={10}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>0 m²</span>
                    <span>1000+ m²</span>
                  </div>
                </div>
              </div>

              {/* Property Features */}
              <div>
                <Label className="text-sm font-medium text-foreground flex items-center gap-2 mb-3">
                  <Star className="h-4 w-4" />
                  {currentText.features}
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  {currentFilters.features.map((feature) => (
                    <div key={feature.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={feature.id}
                        checked={filters.features.includes(feature.id)}
                        onCheckedChange={() => handleFeatureToggle(feature.id)}
                      />
                      <Label
                        htmlFor={feature.id}
                        className="text-sm font-normal cursor-pointer flex items-center gap-1"
                      >
                        <span>{feature.icon}</span>
                        {feature.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Year Built & Condition */}
              <div className="grid grid-cols-2 gap-3">
                <Select value={filters.yearBuilt || "all"} onValueChange={(value) => handleFilterChange('yearBuilt', value)}>
                  <SelectTrigger className="h-8 text-xs">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-primary" />
                      <SelectValue placeholder={currentText.yearBuilt} />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-xs">{currentText.any}</SelectItem>
                    {yearOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="text-xs">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filters.condition || "all"} onValueChange={(value) => handleFilterChange('condition', value)}>
                  <SelectTrigger className="h-8 text-xs">
                    <div className="flex items-center gap-1">
                      <Settings className="h-3 w-3 text-primary" />
                      <SelectValue placeholder={currentText.condition} />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-xs">{currentText.any}</SelectItem>
                    {conditionOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="text-xs">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sort By */}
              <div>
                <Label className="text-sm font-medium text-foreground mb-2 block">{currentText.sortBy}</Label>
                <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange('sortBy', value)}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder={currentText.sortBy} />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="text-xs">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IPhoneSearchPanel;