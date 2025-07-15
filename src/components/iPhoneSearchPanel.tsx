import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Home, Building, DollarSign, Filter, Bed, Bath, X } from "lucide-react";

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
  const [filters, setFilters] = useState({
    location: '',
    propertyType: '',
    priceRange: '',
    bedrooms: '',
    bathrooms: '',
  });

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
      any: "Any",
      forSale: "For Sale",
      forRent: "For Rent",
      villa: "Villa",
      apartment: "Apartment",
      house: "House",
      townhouse: "Townhouse",
      land: "Land",
      under500k: "Under 500K",
      "500k-1m": "500K - 1M",
      "1m-2m": "1M - 2M",
      "2m-5m": "2M - 5M",
      "5m+": "5M+",
      resultsFound: "properties found",
      filters: "Filters",
      clearFilters: "Clear All",
      advancedFilters: "Advanced Filters",
      selectedFilters: "Selected Filters"
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
      any: "Semua",
      forSale: "Dijual",
      forRent: "Disewa",
      villa: "Villa",
      apartment: "Apartemen",
      house: "Rumah",
      townhouse: "Rumah Teres",
      land: "Tanah",
      under500k: "Dibawah 500K",
      "500k-1m": "500K - 1M",
      "1m-2m": "1M - 2M",
      "2m-5m": "2M - 5M",
      "5m+": "5M+",
      resultsFound: "properti ditemukan",
      filters: "Filter",
      clearFilters: "Hapus Semua",
      advancedFilters: "Filter Lanjutan",
      selectedFilters: "Filter Terpilih"
    }
  };

  const currentText = text[language];

  const propertyTypes = [
    { value: 'villa', label: currentText.villa, icon: Building },
    { value: 'apartment', label: currentText.apartment, icon: Building },
    { value: 'house', label: currentText.house, icon: Home },
    { value: 'townhouse', label: currentText.townhouse, icon: Home },
    { value: 'land', label: currentText.land, icon: MapPin },
  ];

  const listingTypes = [
    { value: 'sale', label: currentText.forSale, icon: DollarSign },
    { value: 'rent', label: currentText.forRent, icon: DollarSign },
  ];

  const priceRanges = [
    { value: '100000000-200000000', label: '100jt - 200jt' },
    { value: '200000000-500000000', label: '200jt - 500jt' },
    { value: '500000000-800000000', label: '500jt - 800jt' },
    { value: '800000000-1000000000', label: '800jt - 1m' },
    { value: '1000000000+', label: '1m+' },
  ];

  const bedroomOptions = ['1', '2', '3', '4', '5+'];
  const bathroomOptions = ['1', '2', '3', '4+'];

  const locations = [
    { value: 'jakarta', label: 'Jakarta' },
    { value: 'bali', label: 'Bali' },
    { value: 'surabaya', label: 'Surabaya' },
    { value: 'bandung', label: 'Bandung' },
    { value: 'medan', label: 'Medan' },
    { value: 'semarang', label: 'Semarang' },
  ];

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

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => value !== '').length;
  };

  const clearAllFilters = () => {
    setFilters({
      location: '',
      propertyType: '',
      priceRange: '',
      bedrooms: '',
      bathrooms: '',
    });
  };

  const getSelectedFiltersDisplay = () => {
    const selected = [];
    if (filters.location) selected.push(filters.location);
    if (filters.propertyType) selected.push(currentText[filters.propertyType as keyof typeof currentText] || filters.propertyType);
    if (filters.priceRange) selected.push(filters.priceRange);
    if (filters.bedrooms) selected.push(`${filters.bedrooms} bed`);
    if (filters.bathrooms) selected.push(`${filters.bathrooms} bath`);
    return selected;
  };

  const handleSearch = () => {
    const listingType = activeTab === 'all' ? '' : activeTab;
    onSearch({
      searchQuery,
      listingType,
      ...filters
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* iPhone-style Glass Container - 40% Transparent */}
      <div className="bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 backdrop-blur-2xl border border-white/30 dark:border-gray-700/30 rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-6 space-y-4">
          
          {/* For Sale/For Rent/All Tabs - Smaller & Centered */}
          <div className="flex justify-center">
            <div className="flex bg-white/20 backdrop-blur-sm rounded-lg p-0.5 border border-white/30">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-md font-medium transition-all duration-300 text-sm ${
                  activeTab === 'all' 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-105' 
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                {currentText.all}
              </button>
              <button
                onClick={() => setActiveTab('sale')}
                className={`px-4 py-2 rounded-md font-medium transition-all duration-300 text-sm ${
                  activeTab === 'sale' 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-105' 
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                {currentText.forSale}
              </button>
              <button
                onClick={() => setActiveTab('rent')}
                className={`px-4 py-2 rounded-md font-medium transition-all duration-300 text-sm ${
                  activeTab === 'rent' 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-105' 
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                {currentText.forRent}
              </button>
            </div>
          </div>
          
          {/* Search Row - Input, Filter Button and Search Button */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-500" />
              <Input
                placeholder={currentText.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 h-10 text-white placeholder:text-white/60 bg-white/10 border-white/20 focus:border-blue-400 focus:bg-white/20 rounded-lg backdrop-blur-sm transition-all duration-300 text-sm"
              />
            </div>
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              className="h-10 w-10 p-0 bg-white/10 border-white/20 hover:bg-white/20 rounded-lg relative"
            >
              <Filter className="h-4 w-4 text-white" />
              {getActiveFiltersCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {getActiveFiltersCount()}
                </span>
              )}
            </Button>
            <Button
              onClick={handleSearch}
              className="h-10 px-6 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-sm"
            >
              <Search className="h-4 w-4 mr-1" />
              {currentText.search}
            </Button>
          </div>

          {/* Results Count */}
          {resultsCount !== undefined && (
            <div className="text-center">
              <p className="text-xs text-white/80 bg-white/10 px-3 py-1 rounded-md backdrop-blur-sm inline-block">
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
                  className="text-xs px-2 py-1 bg-blue-500/20 text-blue-200 rounded-md backdrop-blur-sm border border-blue-400/30"
                >
                  {filter}
                </span>
              ))}
            </div>
          )}

          {/* Basic Filters Row - Smaller */}
          <div className="grid grid-cols-3 gap-2">
            {/* Location Selection - Smaller */}
            <Select value={filters.location || "all"} onValueChange={(value) => handleFilterChange('location', value)}>
              <SelectTrigger className="h-8 bg-white/5 border-white/10 text-white/90 rounded-md hover:bg-white/10 transition-all duration-300 text-xs">
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-blue-400" />
                  <SelectValue placeholder={currentText.location} />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-white/20 rounded-lg">
                <SelectItem value="all" className="text-gray-900 dark:text-gray-100 text-xs">{currentText.any}</SelectItem>
                {locations.map((location) => (
                  <SelectItem key={location.value} value={location.value} className="text-gray-900 dark:text-gray-100 text-xs">
                    {location.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Property Type Selection - Smaller */}
            <Select value={filters.propertyType || "all"} onValueChange={(value) => handleFilterChange('propertyType', value)}>
              <SelectTrigger className="h-8 bg-white/5 border-white/10 text-white/90 rounded-md hover:bg-white/10 transition-all duration-300 text-xs">
                <div className="flex items-center gap-1">
                  <Home className="h-3 w-3 text-purple-400" />
                  <SelectValue placeholder={currentText.propertyType} />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-white/20 rounded-lg">
                <SelectItem value="all" className="text-gray-900 dark:text-gray-100 text-xs">{currentText.any}</SelectItem>
                {propertyTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value} className="text-gray-900 dark:text-gray-100 text-xs">
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Price Range - Smaller with Icon */}
            <Select value={filters.priceRange || "all"} onValueChange={(value) => handleFilterChange('priceRange', value)}>
              <SelectTrigger className="h-8 bg-white/5 border-white/10 text-white/90 rounded-md hover:bg-white/10 transition-all duration-300 text-xs">
                <div className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3 text-green-400" />
                  <SelectValue placeholder={currentText.priceRange} />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-white/20 rounded-lg">
                <SelectItem value="all" className="text-gray-900 dark:text-gray-100 text-xs">{currentText.any}</SelectItem>
                {priceRanges.map((range) => (
                  <SelectItem key={range.value} value={range.value} className="text-gray-900 dark:text-gray-100 text-xs">
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Advanced Filters Modal */}
          {showFilters && (
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-medium text-sm">{currentText.advancedFilters}</h3>
                <Button
                  onClick={clearAllFilters}
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 bg-white/5 border-white/20 text-white/80 hover:bg-white/10 rounded-lg text-xs"
                >
                  <X className="h-3 w-3 mr-1" />
                  {currentText.clearFilters}
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {/* Bedrooms - In Filter Window */}
                <Select value={filters.bedrooms || "all"} onValueChange={(value) => handleFilterChange('bedrooms', value)}>
                  <SelectTrigger className="h-8 bg-white/5 border-white/10 text-white/90 rounded-md hover:bg-white/10 transition-all duration-300 text-xs">
                    <div className="flex items-center gap-1">
                      <Bed className="h-3 w-3 text-indigo-400" />
                      <SelectValue placeholder={currentText.bedrooms} />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-white/20 rounded-lg">
                    <SelectItem value="all" className="text-gray-900 dark:text-gray-100 text-xs">{currentText.any}</SelectItem>
                    {bedroomOptions.map((option) => (
                      <SelectItem key={option} value={option} className="text-gray-900 dark:text-gray-100 text-xs">
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Bathrooms - In Filter Window */}
                <Select value={filters.bathrooms || "all"} onValueChange={(value) => handleFilterChange('bathrooms', value)}>
                  <SelectTrigger className="h-8 bg-white/5 border-white/10 text-white/90 rounded-md hover:bg-white/10 transition-all duration-300 text-xs">
                    <div className="flex items-center gap-1">
                      <Bath className="h-3 w-3 text-cyan-400" />
                      <SelectValue placeholder={currentText.bathrooms} />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-white/20 rounded-lg">
                    <SelectItem value="all" className="text-gray-900 dark:text-gray-100 text-xs">{currentText.any}</SelectItem>
                    {bathroomOptions.map((option) => (
                      <SelectItem key={option} value={option} className="text-gray-900 dark:text-gray-100 text-xs">
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* iPhone-style Glassmorphism Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 via-purple-400/5 to-pink-400/5 pointer-events-none rounded-2xl"></div>
        </div>
      </div>
    </div>
  );
};

export default IPhoneSearchPanel;