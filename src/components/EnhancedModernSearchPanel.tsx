
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
      clearFilters: "Clear Filters",
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
      clearFilters: "Hapus Filter",
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

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedState("");
    setPropertyType("");
    setBedrooms("");
    setBathrooms("");
    
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
    <div className="w-full max-w-5xl mx-auto px-2 sm:px-4">
      <div className="apple-glass border-2 border-border/30 shadow-lg rounded-2xl">
        <div className="p-4 sm:p-6">
          {/* Active Filters Display */}
          {activeFiltersCount > 0 && (
            <div className="flex items-center justify-between mb-4 p-3 bg-primary/5 rounded-xl border border-primary/20">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">
                  {currentText.activeFilters}: {activeFiltersCount}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
                className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30 hover:border-destructive/50"
              >
                <X className="h-4 w-4 mr-1" />
                {currentText.clearFilters}
              </Button>
            </div>
          )}

          {/* Search Grid */}
          <div className="space-y-3 mb-6">
            {/* Main Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder={currentText.search}
                className="apple-input pl-10 h-12 text-sm font-medium"
                value={searchQuery}
                onChange={(e) => handleInputChange(e.target.value)}
              />
            </div>
            
            {/* Filter Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <Select value={selectedState} onValueChange={setSelectedState}>
                <SelectTrigger className="apple-input h-12">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder={currentText.state} />
                  </div>
                </SelectTrigger>
                <SelectContent className="apple-dropdown">
                  <SelectItem value="all" className="font-semibold text-primary">
                    {currentText.allStates}
                  </SelectItem>
                  {indonesianStates.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={propertyType} onValueChange={setPropertyType}>
                <SelectTrigger className="apple-input h-12">
                  <div className="flex items-center gap-2">
                    <Home className="h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder={currentText.type} />
                  </div>
                </SelectTrigger>
                <SelectContent className="apple-dropdown">
                  <SelectItem value="all" className="font-semibold text-primary">
                    {currentText.allTypes}
                  </SelectItem>
                  {propertyTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={bedrooms} onValueChange={setBedrooms}>
                <SelectTrigger className="apple-input h-12">
                  <div className="flex items-center gap-2">
                    <Bed className="h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder={currentText.bedrooms} />
                  </div>
                </SelectTrigger>
                <SelectContent className="apple-dropdown">
                  <SelectItem value="any" className="font-semibold text-primary">
                    {currentText.anyBedroom}
                  </SelectItem>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="4+">4+</SelectItem>
                </SelectContent>
              </Select>

              <Select value={bathrooms} onValueChange={setBathrooms}>
                <SelectTrigger className="apple-input h-12">
                  <div className="flex items-center gap-2">
                    <Bath className="h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder={currentText.bathrooms} />
                  </div>
                </SelectTrigger>
                <SelectContent className="apple-dropdown">
                  <SelectItem value="any" className="font-semibold text-primary">
                    {currentText.anyBathroom}
                  </SelectItem>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="4+">4+</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Search Button */}
            <Button 
              onClick={handleSearch}
              className="w-full h-12 apple-button-primary text-sm shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl"
            >
              <Search className="h-4 w-4 mr-2" />
              {currentText.searchBtn}
            </Button>
          </div>
          
          {/* Popular Searches */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <p className="text-foreground font-medium text-sm">{currentText.trending}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {trendingSearches.map((term, index) => (
                <button
                  key={index} 
                  className="cursor-pointer hover:bg-primary/10 hover:text-primary hover:border-primary/20 transition-all duration-200 px-3 py-1.5 text-sm font-medium rounded-full bg-secondary/80 text-secondary-foreground border border-border"
                  onClick={() => handleQuickSearch(term)}
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedModernSearchPanel;
