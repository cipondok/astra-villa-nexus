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
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4">
      <div className="titanium-glass border-2 border-border/30 shadow-2xl rounded-2xl">
        <div className="p-3 sm:p-6 lg:p-8">
          {/* Header with Active Filters Count & Clear Button */}
          {activeFiltersCount > 0 && (
            <div className="flex items-center justify-between mb-4 sm:mb-6 p-3 sm:p-4 bg-primary/5 rounded-xl sm:rounded-2xl border border-primary/20 shadow-sm">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-1 sm:gap-2">
                  <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  <span className="text-xs sm:text-sm font-semibold text-primary">
                    {currentText.activeFilters}
                  </span>
                  <span className="bg-primary/10 text-primary border-primary/20 font-medium px-2 py-1 text-xs sm:text-sm rounded-full border">
                    {activeFiltersCount}
                  </span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
                className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30 hover:border-destructive/50 font-medium transition-all duration-200 text-xs sm:text-sm px-2 sm:px-3"
              >
                <X className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">{currentText.clearFilters}</span>
                <span className="sm:hidden">Clear</span>
              </Button>
            </div>
          )}

          {/* Mobile-First Search Grid */}
          <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
            {/* Search Input - Full Width on Mobile */}
            <div className="w-full">
              <div className="relative group">
                <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 sm:h-5 sm:w-5 group-focus-within:text-primary transition-colors duration-200" />
                <Input
                  placeholder={currentText.search}
                  className="pl-10 sm:pl-12 h-12 sm:h-14 border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/20 rounded-xl sm:rounded-2xl bg-card/90 backdrop-blur-sm text-sm sm:text-base font-medium placeholder:text-muted-foreground shadow-sm hover:shadow-md transition-all duration-200"
                  value={searchQuery}
                  onChange={(e) => handleInputChange(e.target.value)}
                />
              </div>
            </div>
            
            {/* Mobile: 2x2 Grid for Filters, Desktop: 4 columns */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
              {/* Location Selector */}
              <div className="relative">
                <Select value={selectedState} onValueChange={setSelectedState}>
                  <SelectTrigger className="h-12 sm:h-14 border-2 border-border focus:border-primary rounded-xl sm:rounded-2xl bg-card/90 backdrop-blur-sm font-medium shadow-sm hover:shadow-md transition-all duration-200">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                      <SelectValue placeholder={currentText.state} className="text-xs sm:text-sm truncate" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="titanium-glass border border-border shadow-xl rounded-xl sm:rounded-2xl z-50">
                    <SelectItem value="all" className="font-semibold text-primary hover:bg-primary/10">
                      <div className="flex items-center gap-2">
                        <Home className="h-4 w-4" />
                        {currentText.allStates}
                      </div>
                    </SelectItem>
                    {indonesianStates.map((state) => (
                      <SelectItem key={state} value={state} className="hover:bg-secondary/50">
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Property Type */}
              <div className="relative">
                <Select value={propertyType} onValueChange={setPropertyType}>
                  <SelectTrigger className="h-12 sm:h-14 border-2 border-border focus:border-primary rounded-xl sm:rounded-2xl bg-card/90 backdrop-blur-sm font-medium shadow-sm hover:shadow-md transition-all duration-200">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Home className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                      <SelectValue placeholder={currentText.type} className="text-xs sm:text-sm truncate" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="titanium-glass border border-border shadow-xl rounded-xl sm:rounded-2xl z-50">
                    <SelectItem value="all" className="font-semibold text-primary hover:bg-primary/10">
                      <div className="flex items-center gap-2">
                        <Home className="h-4 w-4" />
                        {currentText.allTypes}
                      </div>
                    </SelectItem>
                    {propertyTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value} className="hover:bg-secondary/50">
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Bedrooms */}
              <div className="relative">
                <Select value={bedrooms} onValueChange={setBedrooms}>
                  <SelectTrigger className="h-12 sm:h-14 border-2 border-border focus:border-primary rounded-xl sm:rounded-2xl bg-card/90 backdrop-blur-sm font-medium shadow-sm hover:shadow-md transition-all duration-200">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Bed className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                      <SelectValue placeholder={currentText.bedrooms} className="text-xs sm:text-sm truncate" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="titanium-glass border border-border shadow-xl rounded-xl sm:rounded-2xl z-50">
                    <SelectItem value="any" className="font-semibold text-primary hover:bg-primary/10">
                      <div className="flex items-center gap-2">
                        <Bed className="h-4 w-4" />
                        {currentText.anyBedroom}
                      </div>
                    </SelectItem>
                    <SelectItem value="1" className="hover:bg-secondary/50">1</SelectItem>
                    <SelectItem value="2" className="hover:bg-secondary/50">2</SelectItem>
                    <SelectItem value="3" className="hover:bg-secondary/50">3</SelectItem>
                    <SelectItem value="4+" className="hover:bg-secondary/50">4+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Bathrooms */}
              <div className="relative">
                <Select value={bathrooms} onValueChange={setBathrooms}>
                  <SelectTrigger className="h-12 sm:h-14 border-2 border-border focus:border-primary rounded-xl sm:rounded-2xl bg-card/90 backdrop-blur-sm font-medium shadow-sm hover:shadow-md transition-all duration-200">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Bath className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                      <SelectValue placeholder={currentText.bathrooms} className="text-xs sm:text-sm truncate" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="titanium-glass border border-border shadow-xl rounded-xl sm:rounded-2xl z-50">
                    <SelectItem value="any" className="font-semibold text-primary hover:bg-primary/10">
                      <div className="flex items-center gap-2">
                        <Bath className="h-4 w-4" />
                        {currentText.anyBathroom}
                      </div>
                    </SelectItem>
                    <SelectItem value="1" className="hover:bg-secondary/50">1</SelectItem>
                    <SelectItem value="2" className="hover:bg-secondary/50">2</SelectItem>
                    <SelectItem value="3" className="hover:bg-secondary/50">3</SelectItem>
                    <SelectItem value="4+" className="hover:bg-secondary/50">4+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Search Button - Full Width on Mobile */}
            <Button 
              onClick={handleSearch}
              className="w-full h-12 sm:h-14 titanium-button-primary text-sm sm:text-base shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl sm:rounded-2xl"
            >
              <Search className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3" />
              {currentText.searchBtn}
            </Button>
          </div>
          
          {/* Trending Searches */}
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              <p className="text-foreground font-semibold text-sm sm:text-base">{currentText.trending}</p>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {trendingSearches.map((term, index) => (
                <span
                  key={index} 
                  className="cursor-pointer hover:bg-primary/10 hover:text-primary hover:border-primary/20 transition-all duration-200 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-full shadow-sm hover:shadow-md bg-secondary/80 text-secondary-foreground border border-border"
                  onClick={() => handleQuickSearch(term)}
                >
                  {term}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedModernSearchPanel;
