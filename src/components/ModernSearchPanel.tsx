import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Filter, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

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
  const [has3D, setHas3D] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Refs to track previous values and prevent duplicate searches
  const lastSearchRef = useRef("");
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  const text = useMemo(() => ({
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
      clearFilters: "Clear all",
      has3D: "With 3D View"
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
      clearFilters: "Hapus semua",
      has3D: "Dengan Tampilan 3D"
    }
  }), [language]);

  const currentText = text[language];

  const popularSearches = useMemo(() => 
    language === "en" 
      ? ["Apartment Jakarta", "Villa Bali", "House Surabaya", "Boarding Bandung"]
      : ["Apartemen Jakarta", "Villa Bali", "Rumah Surabaya", "Kost Bandung"]
  , [language]);

  // Improved debounced live search with duplicate prevention
  const debouncedLiveSearch = useCallback((searchTerm: string) => {
    if (!onLiveSearch) return;
    
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Prevent duplicate searches
    if (lastSearchRef.current === searchTerm) {
      console.log("🔍 PANEL - Skipping duplicate search for:", searchTerm);
      return;
    }

    searchTimeoutRef.current = setTimeout(() => {
      if (searchTerm.trim().length >= 3) {
        console.log("🔍 PANEL - Live search triggered for:", searchTerm);
        lastSearchRef.current = searchTerm;
        onLiveSearch(searchTerm);
      } else if (searchTerm.trim().length === 0) {
        console.log("🔍 PANEL - Clearing search");
        lastSearchRef.current = "";
        onLiveSearch("");
      }
    }, 2000); // Increased debounce time to prevent rapid firing
  }, [onLiveSearch]);

  // Effect for handling search input changes
  useEffect(() => {
    debouncedLiveSearch(searchQuery);
    
    // Cleanup timeout on unmount
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, debouncedLiveSearch]);

  const handleManualSearch = useCallback(() => {
    const searchData = {
      query: searchQuery.trim(),
      propertyType: propertyType || "",
      bedrooms: bedrooms || "",
      bathrooms: bathrooms || "",
      location: location || "",
      has3D,
    };
    
    console.log("🔍 PANEL - Manual search triggered with:", searchData);
    lastSearchRef.current = searchQuery.trim();
    onSearch(searchData);
  }, [searchQuery, propertyType, bedrooms, bathrooms, location, has3D, onSearch]);

  const handleClearFilters = useCallback(() => {
    console.log("🧹 PANEL - Clearing all filters");
    setSearchQuery("");
    setPropertyType("");
    setBedrooms("");
    setBathrooms("");
    setLocation("");
    setHas3D(false);
    lastSearchRef.current = "";
    if (onLiveSearch) {
      onLiveSearch("");
    }
  }, [onLiveSearch]);

  const handlePopularSearch = useCallback((term: string) => {
    console.log("🔥 PANEL - Popular search clicked:", term);
    setSearchQuery(term);
    setPropertyType("");
    setBedrooms("");
    setBathrooms("");
    setLocation("");
    setHas3D(false);
    lastSearchRef.current = term;
    const searchData = {
      query: term,
      propertyType: "",
      bedrooms: "",  
      bathrooms: "",
      location: "",
      has3D: false
    };
    onSearch(searchData);
  }, [onSearch]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleManualSearch();
    }
  }, [handleManualSearch]);

  const handleSearchInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log("🔤 PANEL - Search input changed:", value);
    setSearchQuery(value);
  }, []);

  const hasActiveFilters = searchQuery || propertyType || bedrooms || bathrooms || location || has3D;

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
                onChange={handleSearchInputChange}
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
            className="h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
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
          
          {hasActiveFilters && (
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
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
            <div className="flex items-center space-x-2 justify-center pt-2">
              <Checkbox id="has3D" checked={has3D} onCheckedChange={(checked) => setHas3D(!!checked)} />
              <Label htmlFor="has3D" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                {currentText.has3D}
              </Label>
            </div>
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
