
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Filter, X } from "lucide-react";

interface ModernSearchPanelProps {
  language: "en" | "id";
  onSearch: (filters: any) => void;
  onLiveSearch?: (searchTerm: string) => void;
}

const ModernSearchPanel = ({ language, onSearch, onLiveSearch }: ModernSearchPanelProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [location, setLocation] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Controlled live search with proper debouncing
  useEffect(() => {
    if (!onLiveSearch) return;
    
    const timeoutId = setTimeout(() => {
      console.log("🔍 Live search debounce triggered for:", searchQuery);
      onLiveSearch(searchQuery);
    }, 600); // Reduced frequency
    
    return () => clearTimeout(timeoutId);
  }, [searchQuery, onLiveSearch]);

  const text = {
    en: {
      search: "Search properties, location, or area...",
      propertyType: "Property Type",
      bedrooms: "Bedrooms",
      bathrooms: "Bathrooms",
      location: "Location",
      searchBtn: "Search Properties",
      advancedFilters: "Advanced Filters",
      hideFilters: "Hide Filters",
      allTypes: "All Types",
      apartment: "Apartment",
      house: "House",
      villa: "Villa",
      townhouse: "Townhouse",
      any: "Any",
      onebed: "1",
      twobed: "2",
      threebed: "3",
      fourbed: "4+",
      jakarta: "Jakarta",
      bali: "Bali",
      surabaya: "Surabaya",
      bandung: "Bandung",
      popular: "Popular searches:",
      clearFilters: "Clear all"
    },
    id: {
      search: "Cari properti, lokasi, atau area...",
      propertyType: "Jenis Properti",
      bedrooms: "Kamar Tidur",
      bathrooms: "Kamar Mandi",
      location: "Lokasi",
      searchBtn: "Cari Properti",
      advancedFilters: "Filter Lanjutan",
      hideFilters: "Sembunyikan Filter",
      allTypes: "Semua Jenis",
      apartment: "Apartemen",
      house: "Rumah",
      villa: "Villa",
      townhouse: "Rumah Kota",
      any: "Semua",
      onebed: "1",
      twobed: "2",
      threebed: "3",
      fourbed: "4+",
      jakarta: "Jakarta",
      bali: "Bali",
      surabaya: "Surabaya",
      bandung: "Bandung",
      popular: "Pencarian populer:",
      clearFilters: "Hapus semua"
    }
  };

  const currentText = text[language];

  const popularSearches = language === "en" 
    ? ["Apartment Jakarta", "Villa Bali", "House Surabaya", "Boarding Bandung"]
    : ["Apartemen Jakarta", "Villa Bali", "Rumah Surabaya", "Kost Bandung"];

  const handleManualSearch = () => {
    const searchData = {
      query: searchQuery.trim(),
      propertyType: propertyType || undefined,
      bedrooms: bedrooms || undefined,
      bathrooms: bathrooms || undefined,
      location: location || undefined
    };
    
    console.log("🔍 Manual search triggered with:", searchData);
    onSearch(searchData);
  };

  const handleClearFilters = () => {
    console.log("🧹 Clearing all filters");
    setSearchQuery("");
    setPropertyType("");
    setBedrooms("");
    setBathrooms("");
    setLocation("");
    if (onLiveSearch) {
      onLiveSearch("");
    }
  };

  const handlePopularSearch = (term: string) => {
    console.log("🔥 Popular search clicked:", term);
    setSearchQuery(term);
    const searchData = {
      query: term,
      propertyType: undefined,
      bedrooms: undefined,  
      bathrooms: undefined,
      location: undefined
    };
    onSearch(searchData);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleManualSearch();
    }
  };

  return (
    <Card className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-2xl max-w-6xl mx-auto">
      <CardContent className="p-6">
        {/* Main Search Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                placeholder={currentText.search}
                className="pl-10 h-12 text-gray-700 dark:text-gray-200"
                value={searchQuery}
                onChange={(e) => {
                  console.log("🔤 Search input changed:", e.target.value);
                  setSearchQuery(e.target.value);
                }}
                onKeyDown={handleKeyPress}
              />
            </div>
          </div>
          
          <Select value={propertyType} onValueChange={setPropertyType}>
            <SelectTrigger className="h-12">
              <SelectValue placeholder={currentText.propertyType} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="apartment">{currentText.apartment}</SelectItem>
              <SelectItem value="house">{currentText.house}</SelectItem>
              <SelectItem value="villa">{currentText.villa}</SelectItem>
              <SelectItem value="townhouse">{currentText.townhouse}</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            onClick={handleManualSearch}
            className="h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all duration-300"
          >
            <Search className="h-4 w-4 mr-2" />
            {currentText.searchBtn}
          </Button>
        </div>

        {/* Advanced Filters Toggle */}
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-gray-600 hover:text-gray-800"
          >
            <Filter className="h-4 w-4 mr-2" />
            {showAdvanced ? currentText.hideFilters : currentText.advancedFilters}
          </Button>
          
          {(searchQuery || propertyType || bedrooms || bathrooms || location) && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearFilters}
              className="text-gray-600 hover:text-gray-800"
            >
              <X className="h-4 w-4 mr-1" />
              {currentText.clearFilters}
            </Button>
          )}
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Select value={bedrooms} onValueChange={setBedrooms}>
              <SelectTrigger>
                <SelectValue placeholder={currentText.bedrooms} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">{currentText.onebed}</SelectItem>
                <SelectItem value="2">{currentText.twobed}</SelectItem>
                <SelectItem value="3">{currentText.threebed}</SelectItem>
                <SelectItem value="4+">{currentText.fourbed}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={bathrooms} onValueChange={setBathrooms}>
              <SelectTrigger>
                <SelectValue placeholder={currentText.bathrooms} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">{currentText.onebed}</SelectItem>
                <SelectItem value="2">{currentText.twobed}</SelectItem>
                <SelectItem value="3">{currentText.threebed}</SelectItem>
                <SelectItem value="4+">{currentText.fourbed}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger>
                <SelectValue placeholder={currentText.location} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="jakarta">{currentText.jakarta}</SelectItem>
                <SelectItem value="bali">{currentText.bali}</SelectItem>
                <SelectItem value="surabaya">{currentText.surabaya}</SelectItem>
                <SelectItem value="bandung">{currentText.bandung}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        
        {/* Popular Searches */}
        <div className="text-left">
          <p className="text-gray-600 dark:text-gray-400 mb-3 font-medium">{currentText.popular}</p>
          <div className="flex flex-wrap gap-2">
            {popularSearches.map((term, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
                onClick={() => handlePopularSearch(term)}
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

export default ModernSearchPanel;
