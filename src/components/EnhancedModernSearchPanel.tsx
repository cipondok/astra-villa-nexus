
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, MapPin, Home, Bed, Bath, X, Sparkles } from "lucide-react";

interface SearchPanelProps {
  language: "en" | "id";
  onSearch: (searchData: any) => void;
  onLiveSearch?: (searchTerm: string) => void;
}

const EnhancedModernSearchPanel = ({ language, onSearch, onLiveSearch }: SearchPanelProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");

  const text = {
    en: {
      search: "Search properties, location, or area...",
      state: "Select State",
      type: "Property Type",
      bedrooms: "Bedrooms",
      bathrooms: "Bathrooms",
      searchBtn: "Search",
      trending: "Popular Searches",
      allStates: "All Locations",
      allTypes: "All Types",
      anyBedroom: "Any",
      anyBathroom: "Any",
      apartment: "Apartment",
      house: "House",
      villa: "Villa",
      condo: "Condo",
      clearFilters: "Clear All Filters",
      activeFilters: "Active Filters"
    },
    id: {
      search: "Cari properti, lokasi, atau area...",
      state: "Pilih Provinsi",
      type: "Jenis Properti",
      bedrooms: "Kamar Tidur",
      bathrooms: "Kamar Mandi",
      searchBtn: "Cari",
      trending: "Pencarian Populer",
      allStates: "Semua Lokasi",
      allTypes: "Semua Jenis",
      anyBedroom: "Semua",
      anyBathroom: "Semua",
      apartment: "Apartemen",
      house: "Rumah",
      villa: "Villa",
      condo: "Kondominium",
      clearFilters: "Hapus Semua Filter",
      activeFilters: "Filter Aktif"
    }
  };

  const currentText = text[language];

  const indonesianStates = [
    "DKI Jakarta", "West Java", "East Java", "Central Java", "Bali", 
    "North Sumatra", "South Sumatra", "West Sumatra", "Riau"
  ];

  const propertyTypes = [
    { value: "apartment", label: currentText.apartment },
    { value: "house", label: currentText.house },
    { value: "villa", label: currentText.villa },
    { value: "condo", label: currentText.condo }
  ];

  const trendingSearches = language === "en" 
    ? ["Jakarta Apartment", "Bali Villa", "Surabaya House", "Modern Condo"]
    : ["Apartemen Jakarta", "Villa Bali", "Rumah Surabaya", "Kondo Modern"];

  // Count active filters
  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchQuery.trim()) count++;
    if (selectedState && selectedState !== "all") count++;
    if (propertyType && propertyType !== "all") count++;
    if (bedrooms && bedrooms !== "any") count++;
    if (bathrooms && bathrooms !== "any") count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  // Clear all filters
  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedState("");
    setPropertyType("");
    setBedrooms("");
    setBathrooms("");
    
    // Trigger search with empty filters
    if (onLiveSearch) {
      onLiveSearch("");
    }
    onSearch({
      query: "",
      state: "",
      propertyType: "",
      bedrooms: "",
      bathrooms: ""
    });
  };

  const handleSearch = () => {
    const searchData = {
      query: searchQuery,
      state: selectedState === "all" ? "" : selectedState,
      propertyType: propertyType === "all" ? "" : propertyType,
      bedrooms: bedrooms === "any" ? "" : bedrooms,
      bathrooms: bathrooms === "any" ? "" : bathrooms
    };
    
    console.log('Search data:', searchData);
    onSearch(searchData);
  };

  const handleInputChange = (value: string) => {
    setSearchQuery(value);
    if (onLiveSearch && value.length >= 2) {
      onLiveSearch(value);
    } else if (onLiveSearch && value.length === 0) {
      onLiveSearch("");
    }
  };

  const handleQuickSearch = (term: string) => {
    setSearchQuery(term);
    onSearch({ query: term });
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      <Card className="bg-gradient-to-br from-white/98 via-white/95 to-blue-50/80 backdrop-blur-xl shadow-2xl border-0 ring-1 ring-white/20">
        <CardContent className="p-8">
          {/* Header with Active Filters Count & Clear Button */}
          {activeFiltersCount > 0 && (
            <div className="flex items-center justify-between mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100/50 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-semibold text-blue-800">
                    {currentText.activeFilters}
                  </span>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200 font-medium px-3 py-1">
                    {activeFiltersCount}
                  </Badge>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300 font-medium transition-all duration-200"
              >
                <X className="h-4 w-4 mr-2" />
                {currentText.clearFilters}
              </Button>
            </div>
          )}

          {/* Main Search Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
            {/* Search Input */}
            <div className="lg:col-span-2">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 group-focus-within:text-blue-500 transition-colors duration-200" />
                <Input
                  placeholder={currentText.search}
                  className="pl-12 h-14 border-2 border-gray-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 rounded-2xl bg-white/90 backdrop-blur-sm text-base font-medium placeholder:text-gray-400 shadow-sm hover:shadow-md transition-all duration-200"
                  value={searchQuery}
                  onChange={(e) => handleInputChange(e.target.value)}
                />
              </div>
            </div>
            
            {/* Location Selector */}
            <div className="relative">
              <Select value={selectedState} onValueChange={setSelectedState}>
                <SelectTrigger className="h-14 border-2 border-gray-200 focus:border-blue-400 rounded-2xl bg-white/90 backdrop-blur-sm font-medium shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <SelectValue placeholder={currentText.state} />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-white/95 backdrop-blur-xl border border-gray-200 shadow-xl rounded-2xl">
                  <SelectItem value="all" className="font-semibold text-blue-600 hover:bg-blue-50">
                    <div className="flex items-center gap-2">
                      <Home className="h-4 w-4" />
                      {currentText.allStates}
                    </div>
                  </SelectItem>
                  {indonesianStates.map((state) => (
                    <SelectItem key={state} value={state} className="hover:bg-gray-50">
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Property Type */}
            <div className="relative">
              <Select value={propertyType} onValueChange={setPropertyType}>
                <SelectTrigger className="h-14 border-2 border-gray-200 focus:border-blue-400 rounded-2xl bg-white/90 backdrop-blur-sm font-medium shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="flex items-center gap-2">
                    <Home className="h-4 w-4 text-gray-500" />
                    <SelectValue placeholder={currentText.type} />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-white/95 backdrop-blur-xl border border-gray-200 shadow-xl rounded-2xl">
                  <SelectItem value="all" className="font-semibold text-blue-600 hover:bg-blue-50">
                    <div className="flex items-center gap-2">
                      <Home className="h-4 w-4" />
                      {currentText.allTypes}
                    </div>
                  </SelectItem>
                  {propertyTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value} className="hover:bg-gray-50">
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Bedrooms */}
            <div className="relative">
              <Select value={bedrooms} onValueChange={setBedrooms}>
                <SelectTrigger className="h-14 border-2 border-gray-200 focus:border-blue-400 rounded-2xl bg-white/90 backdrop-blur-sm font-medium shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="flex items-center gap-2">
                    <Bed className="h-4 w-4 text-gray-500" />
                    <SelectValue placeholder={currentText.bedrooms} />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-white/95 backdrop-blur-xl border border-gray-200 shadow-xl rounded-2xl">
                  <SelectItem value="any" className="font-semibold text-blue-600 hover:bg-blue-50">
                    <div className="flex items-center gap-2">
                      <Bed className="h-4 w-4" />
                      {currentText.anyBedroom}
                    </div>
                  </SelectItem>
                  <SelectItem value="1" className="hover:bg-gray-50">1</SelectItem>
                  <SelectItem value="2" className="hover:bg-gray-50">2</SelectItem>
                  <SelectItem value="3" className="hover:bg-gray-50">3</SelectItem>
                  <SelectItem value="4+" className="hover:bg-gray-50">4+</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Search Button */}
            <Button 
              onClick={handleSearch}
              className="h-14 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-700 text-white font-bold text-base shadow-lg hover:shadow-xl transition-all duration-200 rounded-2xl border-0 ring-2 ring-blue-200 hover:ring-blue-300"
            >
              <Search className="h-5 w-5 mr-3" />
              {currentText.searchBtn}
            </Button>
          </div>
          
          {/* Trending Searches */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              <p className="text-gray-700 font-semibold text-base">{currentText.trending}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {trendingSearches.map((term, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 hover:border-blue-200 transition-all duration-200 px-4 py-2 text-sm font-medium rounded-full shadow-sm hover:shadow-md"
                  onClick={() => handleQuickSearch(term)}
                >
                  {term}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedModernSearchPanel;
