
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Home, DollarSign, Filter, X, Bed, Bath } from "lucide-react";

interface EnhancedModernSearchPanelProps {
  language: "en" | "id";
  onSearch: (searchData: any) => void;
  onLiveSearch?: (searchTerm: string) => void;
}

const EnhancedModernSearchPanel = ({ language, onSearch, onLiveSearch }: EnhancedModernSearchPanelProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filters, setFilters] = useState({
    location: '',
    propertyType: '',
    listingType: '',
    priceMin: '',
    priceMax: '',
    bedrooms: '',
    bathrooms: '',
    amenities: [] as string[],
  });

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
      advancedFilters: "More Filters",
      clearAll: "Clear",
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
      pool: "Pool",
      garage: "Garage",
      garden: "Garden",
      security: "Security",
      gym: "Gym",
      furnished: "Furnished"
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
      advancedFilters: "Filter Lanjut",
      clearAll: "Hapus",
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
      pool: "Kolam",
      garage: "Garasi",
      garden: "Taman",
      security: "Keamanan",
      gym: "Gym",
      furnished: "Furnished"
    }
  };

  const currentText = text[language];

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

  const amenitiesList = [
    { value: 'pool', label: currentText.pool, icon: '🏊' },
    { value: 'garage', label: currentText.garage, icon: '🚗' },
    { value: 'garden', label: currentText.garden, icon: '🌳' },
    { value: 'security', label: currentText.security, icon: '🛡️' },
    { value: 'gym', label: currentText.gym, icon: '💪' },
    { value: 'furnished', label: currentText.furnished, icon: '🛋️' },
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
    // Convert "all" back to empty string for backend compatibility
    const actualValue = value === "all" ? "" : value;
    const newFilters = { ...filters, [key]: actualValue };
    setFilters(newFilters);
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
      bedrooms: '',
      bathrooms: '',
      amenities: [],
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    Array.isArray(value) ? value.length > 0 : value !== ''
  ) || searchQuery !== '';

  return (
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
              className="pl-12 h-12 lg:h-14 text-base lg:text-lg border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 rounded-xl shadow-sm"
            />
          </div>

          {/* Quick Filters - Mobile Optimized */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-3">
            <Select value={filters.propertyType || "all"} onValueChange={(value) => handleFilterChange('propertyType', value)}>
              <SelectTrigger className="h-10 lg:h-11 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg">
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
              <SelectTrigger className="h-10 lg:h-11 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg">
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

            <Select value={filters.location || "all"} onValueChange={(value) => handleFilterChange('location', value)}>
              <SelectTrigger className="h-10 lg:h-11 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <SelectValue placeholder={currentText.location} />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 z-50">
                <SelectItem value="all" className="text-gray-900 dark:text-gray-100">{currentText.any}</SelectItem>
                <SelectItem value="jakarta" className="text-gray-900 dark:text-gray-100">Jakarta</SelectItem>
                <SelectItem value="bali" className="text-gray-900 dark:text-gray-100">Bali</SelectItem>
                <SelectItem value="surabaya" className="text-gray-900 dark:text-gray-100">Surabaya</SelectItem>
                <SelectItem value="bandung" className="text-gray-900 dark:text-gray-100">Bandung</SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={() => setShowAdvanced(!showAdvanced)}
              variant="outline"
              className="h-10 lg:h-11 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"
            >
              <Filter className="h-4 w-4 mr-2" />
              {currentText.advancedFilters}
            </Button>
          </div>

          {/* Advanced Filters */}
          {showAdvanced && (
            <div className="space-y-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              {/* Price Range */}
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder={currentText.from}
                  value={filters.priceMin}
                  onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                  className="h-10 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg"
                />
                <Input
                  placeholder={currentText.to}
                  value={filters.priceMax}
                  onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                  className="h-10 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg"
                />
              </div>

              {/* Bedrooms & Bathrooms */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                    <Bed className="h-3 w-3" />
                    {currentText.bedrooms}
                  </label>
                  <div className="flex gap-1 flex-wrap">
                    <Button
                      variant={filters.bedrooms === '' ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleFilterChange('bedrooms', '')}
                      className="text-xs h-8"
                    >
                      {currentText.any}
                    </Button>
                    {bedroomOptions.map((option) => (
                      <Button
                        key={option}
                        variant={filters.bedrooms === option ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleFilterChange('bedrooms', option)}
                        className="text-xs h-8"
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                    <Bath className="h-3 w-3" />
                    {currentText.bathrooms}
                  </label>
                  <div className="flex gap-1 flex-wrap">
                    <Button
                      variant={filters.bathrooms === '' ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleFilterChange('bathrooms', '')}
                      className="text-xs h-8"
                    >
                      {currentText.any}
                    </Button>
                    {bathroomOptions.map((option) => (
                      <Button
                        key={option}
                        variant={filters.bathrooms === option ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleFilterChange('bathrooms', option)}
                        className="text-xs h-8"
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">{currentText.amenities}</label>
                <div className="flex gap-1.5 flex-wrap">
                  {amenitiesList.map((amenity) => (
                    <Badge
                      key={amenity.value}
                      variant={filters.amenities.includes(amenity.value) ? "default" : "outline"}
                      className="cursor-pointer hover:scale-105 transition-transform text-xs px-2 py-1"
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
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleSearch}
              className="flex-1 h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Search className="h-4 w-4 mr-2" />
              {currentText.search}
            </Button>
            {hasActiveFilters && (
              <Button
                onClick={clearAllFilters}
                variant="outline"
                className="h-11 px-4 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="h-4 w-4 mr-1" />
                {currentText.clearAll}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedModernSearchPanel;
