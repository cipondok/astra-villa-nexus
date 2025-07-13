
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
    <Card className="w-full max-w-7xl mx-auto shadow-2xl border-0 bg-white/98 dark:bg-gray-900/98 backdrop-blur-xl xl:min-h-[600px] 2xl:min-h-[700px]">
      <CardContent className="p-6 lg:p-8 xl:p-10 2xl:p-12">
        <div className="space-y-4 lg:space-y-6 xl:space-y-8">
          {/* Main Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 xl:h-7 xl:w-7 text-blue-600 dark:text-blue-400" />
            <Input
              placeholder={currentText.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-14 xl:pl-16 h-14 lg:h-16 xl:h-20 2xl:h-24 text-base lg:text-lg xl:text-xl 2xl:text-2xl border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 rounded-xl shadow-sm"
            />
          </div>

          {/* Quick Filters - Widescreen Optimized */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 xl:gap-6">
            <Select value={filters.propertyType || "all"} onValueChange={(value) => handleFilterChange('propertyType', value)}>
              <SelectTrigger className="h-12 lg:h-14 xl:h-16 2xl:h-20 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg text-base xl:text-lg 2xl:text-xl">
                <div className="flex items-center gap-2 xl:gap-3">
                  <Home className="h-5 w-5 xl:h-6 xl:w-6 2xl:h-7 2xl:w-7 text-blue-600 dark:text-blue-400" />
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
              <SelectTrigger className="h-12 lg:h-14 xl:h-16 2xl:h-20 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg text-base xl:text-lg 2xl:text-xl">
                <div className="flex items-center gap-2 xl:gap-3">
                  <DollarSign className="h-5 w-5 xl:h-6 xl:w-6 2xl:h-7 2xl:w-7 text-blue-600 dark:text-blue-400" />
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
              <SelectTrigger className="h-12 lg:h-14 xl:h-16 2xl:h-20 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg text-base xl:text-lg 2xl:text-xl">
                <div className="flex items-center gap-2 xl:gap-3">
                  <MapPin className="h-5 w-5 xl:h-6 xl:w-6 2xl:h-7 2xl:w-7 text-blue-600 dark:text-blue-400" />
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
              className="h-12 lg:h-14 xl:h-16 2xl:h-20 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg text-base xl:text-lg 2xl:text-xl px-4 xl:px-6"
            >
              <Filter className="h-5 w-5 xl:h-6 xl:w-6 2xl:h-7 2xl:w-7 mr-2 xl:mr-3" />
              {currentText.advancedFilters}
            </Button>
          </div>

          {/* Advanced Filters */}
          {showAdvanced && (
            <div className="space-y-4 lg:space-y-6 xl:space-y-8 pt-4 lg:pt-6 xl:pt-8 border-t border-gray-200 dark:border-gray-700">
              {/* Price Range */}
              <div className="grid grid-cols-2 gap-4 lg:gap-6">
                <Input
                  placeholder={currentText.from}
                  value={filters.priceMin}
                  onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                  className="h-12 lg:h-14 xl:h-16 2xl:h-20 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg text-base xl:text-lg 2xl:text-xl px-4 xl:px-6"
                />
                <Input
                  placeholder={currentText.to}
                  value={filters.priceMax}
                  onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                  className="h-12 lg:h-14 xl:h-16 2xl:h-20 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg text-base xl:text-lg 2xl:text-xl px-4 xl:px-6"
                />
              </div>

              {/* Bedrooms & Bathrooms */}
              <div className="grid grid-cols-2 gap-4 lg:gap-6">
                <div className="space-y-3 lg:space-y-4">
                  <label className="text-sm lg:text-base xl:text-lg font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Bed className="h-4 w-4 xl:h-5 xl:w-5" />
                    {currentText.bedrooms}
                  </label>
                  <div className="flex gap-2 lg:gap-3 flex-wrap">
                    <Button
                      variant={filters.bedrooms === '' ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleFilterChange('bedrooms', '')}
                      className="text-sm lg:text-base xl:text-lg h-10 lg:h-12 xl:h-14 px-3 xl:px-4"
                    >
                      {currentText.any}
                    </Button>
                    {bedroomOptions.map((option) => (
                      <Button
                        key={option}
                        variant={filters.bedrooms === option ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleFilterChange('bedrooms', option)}
                        className="text-sm lg:text-base xl:text-lg h-10 lg:h-12 xl:h-14 px-3 xl:px-4"
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 lg:space-y-4">
                  <label className="text-sm lg:text-base xl:text-lg font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Bath className="h-4 w-4 xl:h-5 xl:w-5" />
                    {currentText.bathrooms}
                  </label>
                  <div className="flex gap-2 lg:gap-3 flex-wrap">
                    <Button
                      variant={filters.bathrooms === '' ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleFilterChange('bathrooms', '')}
                      className="text-sm lg:text-base xl:text-lg h-10 lg:h-12 xl:h-14 px-3 xl:px-4"
                    >
                      {currentText.any}
                    </Button>
                    {bathroomOptions.map((option) => (
                      <Button
                        key={option}
                        variant={filters.bathrooms === option ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleFilterChange('bathrooms', option)}
                        className="text-sm lg:text-base xl:text-lg h-10 lg:h-12 xl:h-14 px-3 xl:px-4"
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div className="space-y-3 lg:space-y-4">
                <label className="text-sm lg:text-base xl:text-lg font-medium text-gray-700 dark:text-gray-300">{currentText.amenities}</label>
                <div className="flex gap-2 lg:gap-3 flex-wrap">
                  {amenitiesList.map((amenity) => (
                    <Badge
                      key={amenity.value}
                      variant={filters.amenities.includes(amenity.value) ? "default" : "outline"}
                      className="cursor-pointer hover:scale-105 transition-transform text-sm lg:text-base xl:text-lg px-3 lg:px-4 py-2 lg:py-3 h-10 lg:h-12 xl:h-14 rounded-lg"
                      onClick={() => handleAmenityToggle(amenity.value)}
                    >
                      {amenity.icon} {amenity.label}
                      {filters.amenities.includes(amenity.value) && (
                        <X className="h-4 w-4 xl:h-5 xl:w-5 ml-2" />
                      )}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 lg:gap-4 pt-4 lg:pt-6">
            <Button
              onClick={handleSearch}
              className="flex-1 h-14 lg:h-16 xl:h-20 2xl:h-24 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 text-base lg:text-lg xl:text-xl 2xl:text-2xl"
            >
              <Search className="h-5 w-5 xl:h-6 xl:w-6 2xl:h-7 2xl:w-7 mr-2 xl:mr-3" />
              {currentText.search}
            </Button>
            {hasActiveFilters && (
              <Button
                onClick={clearAllFilters}
                variant="outline"
                className="h-14 lg:h-16 xl:h-20 2xl:h-24 px-6 xl:px-8 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg text-base lg:text-lg xl:text-xl 2xl:text-2xl"
              >
                <X className="h-5 w-5 xl:h-6 xl:w-6 2xl:h-7 2xl:w-7 mr-2 xl:mr-3" />
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
