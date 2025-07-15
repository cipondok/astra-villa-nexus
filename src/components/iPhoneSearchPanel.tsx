import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Home, Building, DollarSign, Filter, Bed, Bath } from "lucide-react";

interface IPhoneSearchPanelProps {
  language: "en" | "id";
  onSearch: (searchData: any) => void;
  onLiveSearch?: (searchTerm: string) => void;
  resultsCount?: number;
}

const IPhoneSearchPanel = ({ language, onSearch, onLiveSearch, resultsCount }: IPhoneSearchPanelProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    location: '',
    propertyType: '',
    listingType: '',
    priceRange: '',
    bedrooms: '',
    bathrooms: '',
  });

  const text = {
    en: {
      searchPlaceholder: "Search properties, locations, or keywords...",
      search: "Search",
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
      resultsFound: "properties found"
    },
    id: {
      searchPlaceholder: "Cari properti, lokasi, atau kata kunci...",
      search: "Cari",
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
      resultsFound: "properti ditemukan"
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
    { value: '0-500000', label: currentText.under500k },
    { value: '500000-1000000', label: currentText["500k-1m"] },
    { value: '1000000-2000000', label: currentText["1m-2m"] },
    { value: '2000000-5000000', label: currentText["2m-5m"] },
    { value: '5000000+', label: currentText["5m+"] },
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

  const handleSearch = () => {
    onSearch({
      searchQuery,
      ...filters
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* iPhone-style Glass Container */}
      <div className="bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-2xl border border-white/20 dark:border-gray-700/20 rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-6 space-y-6">
          
          {/* Search Row - Input and Button */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-500" />
              <Input
                placeholder={currentText.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-12 h-12 text-white placeholder:text-white/60 bg-white/10 border-white/20 focus:border-blue-400 focus:bg-white/20 rounded-xl backdrop-blur-sm transition-all duration-300"
              />
            </div>
            <Button
              onClick={handleSearch}
              className="h-12 px-8 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <Search className="h-4 w-4 mr-2" />
              {currentText.search}
            </Button>
          </div>

          {/* Results Count */}
          {resultsCount !== undefined && (
            <div className="text-center">
              <p className="text-sm text-white/80 bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm inline-block">
                {resultsCount} {currentText.resultsFound}
              </p>
            </div>
          )}

          {/* Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Location Selection */}
            <Select value={filters.location || "all"} onValueChange={(value) => handleFilterChange('location', value)}>
              <SelectTrigger className="h-12 bg-white/10 border-white/20 text-white rounded-xl hover:bg-white/20 transition-all duration-300">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-400" />
                  <SelectValue placeholder={currentText.location} />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-white/20 rounded-xl">
                <SelectItem value="all" className="text-gray-900 dark:text-gray-100">{currentText.any}</SelectItem>
                {locations.map((location) => (
                  <SelectItem key={location.value} value={location.value} className="text-gray-900 dark:text-gray-100">
                    {location.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Property Type Selection */}
            <Select value={filters.propertyType || "all"} onValueChange={(value) => handleFilterChange('propertyType', value)}>
              <SelectTrigger className="h-12 bg-white/10 border-white/20 text-white rounded-xl hover:bg-white/20 transition-all duration-300">
                <div className="flex items-center gap-2">
                  <Home className="h-4 w-4 text-purple-400" />
                  <SelectValue placeholder={currentText.propertyType} />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-white/20 rounded-xl">
                <SelectItem value="all" className="text-gray-900 dark:text-gray-100">{currentText.any}</SelectItem>
                {propertyTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value} className="text-gray-900 dark:text-gray-100">
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Listing Type Selection */}
            <Select value={filters.listingType || "all"} onValueChange={(value) => handleFilterChange('listingType', value)}>
              <SelectTrigger className="h-12 bg-white/10 border-white/20 text-white rounded-xl hover:bg-white/20 transition-all duration-300">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-400" />
                  <SelectValue placeholder={currentText.listingType} />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-white/20 rounded-xl">
                <SelectItem value="all" className="text-gray-900 dark:text-gray-100">{currentText.any}</SelectItem>
                {listingTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value} className="text-gray-900 dark:text-gray-100">
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Additional Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Price Range */}
            <Select value={filters.priceRange || "all"} onValueChange={(value) => handleFilterChange('priceRange', value)}>
              <SelectTrigger className="h-12 bg-white/10 border-white/20 text-white rounded-xl hover:bg-white/20 transition-all duration-300">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-yellow-400" />
                  <SelectValue placeholder={currentText.priceRange} />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-white/20 rounded-xl">
                <SelectItem value="all" className="text-gray-900 dark:text-gray-100">{currentText.any}</SelectItem>
                {priceRanges.map((range) => (
                  <SelectItem key={range.value} value={range.value} className="text-gray-900 dark:text-gray-100">
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Bedrooms */}
            <Select value={filters.bedrooms || "all"} onValueChange={(value) => handleFilterChange('bedrooms', value)}>
              <SelectTrigger className="h-12 bg-white/10 border-white/20 text-white rounded-xl hover:bg-white/20 transition-all duration-300">
                <div className="flex items-center gap-2">
                  <Bed className="h-4 w-4 text-indigo-400" />
                  <SelectValue placeholder={currentText.bedrooms} />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-white/20 rounded-xl">
                <SelectItem value="all" className="text-gray-900 dark:text-gray-100">{currentText.any}</SelectItem>
                {bedroomOptions.map((option) => (
                  <SelectItem key={option} value={option} className="text-gray-900 dark:text-gray-100">
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Bathrooms */}
            <Select value={filters.bathrooms || "all"} onValueChange={(value) => handleFilterChange('bathrooms', value)}>
              <SelectTrigger className="h-12 bg-white/10 border-white/20 text-white rounded-xl hover:bg-white/20 transition-all duration-300">
                <div className="flex items-center gap-2">
                  <Bath className="h-4 w-4 text-cyan-400" />
                  <SelectValue placeholder={currentText.bathrooms} />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-white/20 rounded-xl">
                <SelectItem value="all" className="text-gray-900 dark:text-gray-100">{currentText.any}</SelectItem>
                {bathroomOptions.map((option) => (
                  <SelectItem key={option} value={option} className="text-gray-900 dark:text-gray-100">
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* iPhone-style Glassmorphism Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 via-purple-400/5 to-pink-400/5 pointer-events-none rounded-2xl"></div>
        </div>
      </div>
    </div>
  );
};

export default IPhoneSearchPanel;