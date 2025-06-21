
import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, MapPin, Home, Bed, Bath, Filter, X } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";

interface SearchFilters {
  query: string;
  state: string;
  city: string;
  propertyType: string;
  bedrooms: string;
  bathrooms: string;
  priceRange: string;
}

interface EnhancedModernSearchPanelProps {
  language: "en" | "id";
  onSearch: (searchData: SearchFilters) => void;
  onLiveSearch?: (searchTerm: string) => void;
}

const EnhancedModernSearchPanel = ({ 
  language, 
  onSearch, 
  onLiveSearch 
}: EnhancedModernSearchPanelProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const text = {
    en: {
      search: "Search properties, location, or area...",
      state: "Select State",
      city: "Select City",
      type: "Property Type",
      bedrooms: "Bedrooms",
      bathrooms: "Bathrooms",
      priceRange: "Price Range",
      searchBtn: "Search Properties",
      advancedFilters: "Advanced Filters",
      hideFilters: "Hide Filters",
      clearFilters: "Clear All",
      trending: "Popular Searches",
      allTypes: "All Types",
      buy: "Buy",
      rent: "Rent",
      newProject: "New Project",
      anyBedroom: "Any",
      anyBathroom: "Any",
      anyPrice: "Any Price"
    },
    id: {
      search: "Cari properti, lokasi, atau area...",
      state: "Pilih Provinsi",
      city: "Pilih Kota",
      type: "Jenis Properti",
      bedrooms: "Kamar Tidur",
      bathrooms: "Kamar Mandi",
      priceRange: "Range Harga",
      searchBtn: "Cari Properti",
      advancedFilters: "Filter Lanjutan",
      hideFilters: "Sembunyikan Filter",
      clearFilters: "Hapus Semua",
      trending: "Pencarian Populer",
      allTypes: "Semua Jenis",
      buy: "Beli",
      rent: "Sewa",
      newProject: "Proyek Baru",
      anyBedroom: "Semua",
      anyBathroom: "Semua",
      anyPrice: "Semua Harga"
    }
  };

  const currentText = text[language];

  const indonesianStates = [
    "DKI Jakarta", "West Java", "East Java", "Central Java", "Bali", 
    "North Sumatra", "South Sumatra", "West Sumatra", "Riau", 
    "South Kalimantan", "East Kalimantan", "North Sulawesi", 
    "South Sulawesi", "West Nusa Tenggara", "East Nusa Tenggara"
  ];

  const trendingSearches = language === "en" 
    ? ["Jakarta Apartment", "Bali Villa", "Surabaya House", "Bandung Boarding House"]
    : ["Apartemen Jakarta", "Villa Bali", "Rumah Surabaya", "Kost Bandung"];

  // Live search effect
  useEffect(() => {
    if (debouncedSearchQuery && onLiveSearch) {
      onLiveSearch(debouncedSearchQuery);
    }
  }, [debouncedSearchQuery, onLiveSearch]);

  const handleSearch = useCallback(() => {
    const searchData: SearchFilters = {
      query: searchQuery,
      state: selectedState,
      city: selectedCity,
      propertyType,
      bedrooms,
      bathrooms,
      priceRange
    };
    
    console.log('Search initiated with filters:', searchData);
    onSearch(searchData);
  }, [searchQuery, selectedState, selectedCity, propertyType, bedrooms, bathrooms, priceRange, onSearch]);

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedState("");
    setSelectedCity("");
    setPropertyType("");
    setBedrooms("");
    setBathrooms("");
    setPriceRange("");
  };

  const hasActiveFilters = searchQuery || selectedState || selectedCity || propertyType || bedrooms || bathrooms || priceRange;

  return (
    <Card className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-2xl border-0">
      <CardContent className="p-4 sm:p-6">
        {/* Main Search Row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-4">
          {/* Search Input */}
          <div className="md:col-span-5">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                placeholder={currentText.search}
                className="pl-10 h-12 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          {/* State Selector */}
          <div className="md:col-span-2">
            <Select value={selectedState} onValueChange={setSelectedState}>
              <SelectTrigger className="h-12 bg-white dark:bg-gray-800">
                <SelectValue placeholder={currentText.state} />
              </SelectTrigger>
              <SelectContent>
                {indonesianStates.map((state) => (
                  <SelectItem key={state} value={state}>{state}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Property Type */}
          <div className="md:col-span-2">
            <Select value={propertyType} onValueChange={setPropertyType}>
              <SelectTrigger className="h-12 bg-white dark:bg-gray-800">
                <SelectValue placeholder={currentText.type} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{currentText.allTypes}</SelectItem>
                <SelectItem value="buy">{currentText.buy}</SelectItem>
                <SelectItem value="rent">{currentText.rent}</SelectItem>
                <SelectItem value="new-project">{currentText.newProject}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Search Button */}
          <div className="md:col-span-2">
            <Button 
              onClick={handleSearch}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 text-white font-semibold transition-all duration-300"
            >
              <Search className="h-4 w-4 mr-2" />
              {currentText.searchBtn}
            </Button>
          </div>
          
          {/* Advanced Filter Toggle */}
          <div className="md:col-span-1">
            <Button
              variant="outline"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full h-12"
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="border-t pt-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4">
              {/* Bedrooms */}
              <Select value={bedrooms} onValueChange={setBedrooms}>
                <SelectTrigger className="h-10 bg-white dark:bg-gray-800">
                  <SelectValue placeholder={currentText.bedrooms} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">{currentText.anyBedroom}</SelectItem>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="4+">4+</SelectItem>
                </SelectContent>
              </Select>

              {/* Bathrooms */}
              <Select value={bathrooms} onValueChange={setBathrooms}>
                <SelectTrigger className="h-10 bg-white dark:bg-gray-800">
                  <SelectValue placeholder={currentText.bathrooms} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">{currentText.anyBathroom}</SelectItem>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="4+">4+</SelectItem>
                </SelectContent>
              </Select>

              {/* Price Range */}
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger className="h-10 bg-white dark:bg-gray-800">
                  <SelectValue placeholder={currentText.priceRange} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">{currentText.anyPrice}</SelectItem>
                  <SelectItem value="0-1b">Under Rp 1B</SelectItem>
                  <SelectItem value="1b-5b">Rp 1B - 5B</SelectItem>
                  <SelectItem value="5b+">Rp 5B+</SelectItem>
                </SelectContent>
              </Select>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  onClick={clearAllFilters}
                  className="h-10"
                >
                  <X className="h-4 w-4 mr-2" />
                  {currentText.clearFilters}
                </Button>
              )}
            </div>
          </div>
        )}
        
        {/* Trending Searches */}
        <div className="text-left">
          <p className="text-gray-600 dark:text-gray-400 mb-3 font-medium text-sm">
            {currentText.trending}:
          </p>
          <div className="flex flex-wrap gap-2">
            {trendingSearches.map((term, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors text-xs"
                onClick={() => setSearchQuery(term)}
              >
                {term}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedModernSearchPanel;
