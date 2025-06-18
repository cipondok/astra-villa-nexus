import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, SlidersHorizontal, X, Home, Building, MapPin, Bath } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";
import { useDebounce } from "@/hooks/useDebounce";
import SearchSuggestions from "@/components/search/SearchSuggestions";

interface SearchData {
  query: string;
  listingType: string; // Buy or Rent
  propertyType: string;
  state: string;
  city: string;
  area: string;
  priceRange: string;
  bedrooms: string;
  bathrooms: string;
  furnishing: string;
  has3D: boolean;
}

interface EnhancedModernSearchPanelProps {
  language: string;
  onSearch: (searchData: SearchData) => void;
  onLiveSearch: (searchTerm: string) => void;
}

const EnhancedModernSearchPanel = ({ language, onSearch, onLiveSearch }: EnhancedModernSearchPanelProps) => {
  const [searchData, setSearchData] = useState<SearchData>({
    query: "",
    listingType: "buy", // Default to buy
    propertyType: "",
    state: "",
    city: "",
    area: "",
    priceRange: "",
    bedrooms: "",
    bathrooms: "",
    furnishing: "",
    has3D: false
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeFilters, setActiveFilters] = useState(0);
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [availableAreas, setAvailableAreas] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  // Debounce search query for suggestions
  const debouncedQuery = useDebounce(searchData.query, 300);

  // Indonesian provinces data
  const indonesianProvinces = [
    "Aceh", "Sumatera Utara", "Sumatera Barat", "Riau", "Kepulauan Riau", "Jambi", 
    "Sumatera Selatan", "Bangka Belitung", "Bengkulu", "Lampung",
    "DKI Jakarta", "Jawa Barat", "Banten", "Jawa Tengah", "DI Yogyakarta", "Jawa Timur",
    "Bali", "Nusa Tenggara Barat", "Nusa Tenggara Timur",
    "Kalimantan Barat", "Kalimantan Tengah", "Kalimantan Selatan", "Kalimantan Timur", "Kalimantan Utara",
    "Sulawesi Utara", "Gorontalo", "Sulawesi Tengah", "Sulawesi Barat", "Sulawesi Selatan", "Sulawesi Tenggara",
    "Maluku", "Maluku Utara", "Papua Barat", "Papua"
  ];

  // Cities data for major provinces
  const citiesData: Record<string, string[]> = {
    "DKI Jakarta": ["Jakarta Pusat", "Jakarta Utara", "Jakarta Barat", "Jakarta Selatan", "Jakarta Timur", "Kepulauan Seribu"],
    "Jawa Barat": ["Bandung", "Bekasi", "Bogor", "Depok", "Cirebon", "Sukabumi", "Tasikmalaya", "Karawang", "Purwakarta", "Subang"],
    "Jawa Tengah": ["Semarang", "Solo", "Magelang", "Salatiga", "Pekalongan", "Tegal", "Surakarta", "Klaten", "Boyolali"],
    "Jawa Timur": ["Surabaya", "Malang", "Kediri", "Blitar", "Madiun", "Mojokerto", "Pasuruan", "Probolinggo", "Jember"],
    "Banten": ["Tangerang", "Tangerang Selatan", "Serang", "Cilegon", "Lebak", "Pandeglang"],
    "Bali": ["Denpasar", "Badung", "Gianyar", "Tabanan", "Klungkung", "Bangli", "Karangasem", "Buleleng"],
    "Sumatera Utara": ["Medan", "Binjai", "Tebing Tinggi", "Pematangsiantar", "Tanjung Balai", "Sibolga"],
    "Sumatera Barat": ["Padang", "Bukittinggi", "Padang Panjang", "Payakumbuh", "Sawahlunto", "Solok"],
  };

  // Areas data for major cities
  const areasData: Record<string, string[]> = {
    "Jakarta Pusat": ["Menteng", "Gambir", "Tanah Abang", "Senen", "Cempaka Putih", "Johar Baru", "Kemayoran"],
    "Jakarta Selatan": ["Kebayoran Baru", "Kebayoran Lama", "Pesanggrahan", "Cilandak", "Pasar Minggu", "Jagakarsa"],
    "Jakarta Barat": ["Kebon Jeruk", "Palmerah", "Grogol Petamburan", "Tambora", "Taman Sari", "Cengkareng"],
    "Jakarta Utara": ["Penjaringan", "Pademangan", "Tanjung Priok", "Koja", "Kelapa Gading", "Cilincing"],
    "Jakarta Timur": ["Matraman", "Pulogadung", "Jatinegara", "Cakung", "Duren Sawit", "Kramat Jati"],
    "Bandung": ["Coblong", "Bandung Wetan", "Sumur Bandung", "Andir", "Cicendo", "Cidadap", "Sukajadi"],
    "Surabaya": ["Wonokromo", "Gubeng", "Tegalsari", "Genteng", "Bubutan", "Simokerto", "Pabean Cantian"],
    "Bekasi": ["Bekasi Timur", "Bekasi Barat", "Bekasi Utara", "Bekasi Selatan", "Medan Satria", "Bantargebang"],
    "Tangerang": ["Tangerang Kota", "Karawaci", "Lippo Village", "Gading Serpong", "BSD City", "Alam Sutera"],
  };

  // Update cities when state changes
  useEffect(() => {
    if (searchData.state) {
      const cities = citiesData[searchData.state] || [];
      setAvailableCities(cities);
      if (!cities.includes(searchData.city)) {
        setSearchData(prev => ({ ...prev, city: "", area: "" }));
      }
    } else {
      setAvailableCities([]);
      setSearchData(prev => ({ ...prev, city: "", area: "" }));
    }
  }, [searchData.state]);

  // Update areas when city changes
  useEffect(() => {
    if (searchData.city) {
      const areas = areasData[searchData.city] || [];
      setAvailableAreas(areas);
      if (!areas.includes(searchData.area)) {
        setSearchData(prev => ({ ...prev, area: "" }));
      }
    } else {
      setAvailableAreas([]);
      setSearchData(prev => ({ ...prev, area: "" }));
    }
  }, [searchData.city]);

  // Enhanced click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowFilters(false);
        setShowSuggestions(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowFilters(false);
        setShowSuggestions(false);
      }
    };

    if (showFilters) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
      if (isMobile) {
        document.body.style.overflow = 'hidden';
      }
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [showFilters, isMobile]);

  // Auto-close filters on route change or page refresh
  useEffect(() => {
    const handleBeforeUnload = () => {
      setShowFilters(false);
      setShowSuggestions(false);
    };
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setShowFilters(false);
        setShowSuggestions(false);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Count active filters - Fixed to properly count non-empty values and 3D checkbox
  useEffect(() => {
    let count = 0;
    
    // Check each filter and count non-empty values
    Object.entries(searchData).forEach(([key, value]) => {
      if (key === 'query' || key === 'listingType') return; // Don't count query as a filter
      
      if (key === 'has3D') {
        if (value === true) count++;
      } else {
        if (value && String(value).trim() !== "") count++;
      }
    });

    console.log("🔢 ACTIVE FILTERS COUNT:", count, "Filter data:", searchData);
    setActiveFilters(count);
  }, [searchData]);

  const handleInputChange = (field: keyof SearchData, value: string | boolean) => {
    console.log(`🔄 FILTER CHANGE - ${field}:`, value);
    
    // Update search data immediately
    setSearchData(prev => {
      const newData = { ...prev, [field]: value };
      console.log("📊 NEW SEARCH DATA:", newData);
      return newData;
    });
    
    // Handle query input for suggestions
    if (field === 'query' && typeof value === 'string') {
      setShowSuggestions(value.length >= 2);
      console.log("📝 Query updated - showing suggestions:", value.length >= 2);
    }
  };

  const handleSearch = () => {
    console.log("🔍 ENHANCED SEARCH PANEL - Sending search data:", searchData);
    setShowSuggestions(false);
    
    // Convert to the expected format for the backend
    const searchDataForBackend = {
      ...searchData,
      location: searchData.area ? `${searchData.area}, ${searchData.city}, ${searchData.state}` : 
                searchData.city ? `${searchData.city}, ${searchData.state}` : 
                searchData.state || ""
    };
    
    onSearch(searchDataForBackend);
    if (isMobile) {
      setShowFilters(false);
    }
  };

  const handleSuggestionSelect = (suggestion: any) => {
    console.log("💡 SUGGESTION SELECTED:", suggestion);
    setSearchData(prev => ({ ...prev, query: suggestion.value }));
    setShowSuggestions(false);
    if (searchInputRef.current) {
      searchInputRef.current.blur();
    }
  };

  const clearFilter = (field: keyof SearchData) => {
    console.log(`🧹 CLEARING FILTER: ${field}`);
    handleInputChange(field, field === 'has3D' ? false : "");
  };

  const clearAllFilters = () => {
    console.log("🧹 CLEARING ALL FILTERS");
    setSearchData({
      query: searchData.query, // Keep search query
      listingType: searchData.listingType, // Keep listing type
      propertyType: "",
      state: "",
      city: "",
      area: "",
      priceRange: "",
      bedrooms: "",
      bathrooms: "",
      furnishing: "",
      has3D: false
    });
  };

  // Updated options for bedrooms and bathrooms (1-10 only)
  const propertyTypes = [
    { value: "apartment", label: language === "en" ? "Apartment" : "Apartemen" },
    { value: "house", label: language === "en" ? "House" : "Rumah" },
    { value: "villa", label: language === "en" ? "Villa" : "Villa" },
    { value: "condo", label: language === "en" ? "Condo" : "Kondominium" },
    { value: "townhouse", label: language === "en" ? "Townhouse" : "Ruko" }
  ];

  const priceRanges = [
    { value: "0-1b", label: language === "en" ? "Under Rp 1B" : "Di bawah Rp 1M" },
    { value: "1b-5b", label: language === "en" ? "Rp 1B - 5B" : "Rp 1M - 5M" },
    { value: "5b+", label: language === "en" ? "Rp 5B+" : "Rp 5M+" }
  ];

  const furnishingOptions = [
    { value: "furnished", label: language === "en" ? "Furnished" : "Berperabotan" },
    { value: "unfurnished", label: language === "en" ? "Unfurnished" : "Tidak Berperabotan" },
    { value: "partial", label: language === "en" ? "Partially Furnished" : "Sebagian Berperabotan" }
  ];

  const bedroomOptions = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
  const bathroomOptions = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

  return (
    <div className="w-full max-w-6xl mx-auto" ref={containerRef}>
      {/* Backdrop for mobile */}
      {showFilters && isMobile && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setShowFilters(false)}
        />
      )}

      {/* Main Search Bar */}
      <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-0 overflow-visible">
        <CardContent className="p-3 sm:p-4 lg:p-6">
          {/* Buy/Rent Tabs */}
          <div className="mb-4">
            <Tabs value={searchData.listingType} onValueChange={(value) => handleInputChange('listingType', value)}>
              <TabsList className="grid w-full grid-cols-2 max-w-md">
                <TabsTrigger value="buy">{language === "en" ? "Buy" : "Beli"}</TabsTrigger>
                <TabsTrigger value="rent">{language === "en" ? "Rent" : "Sewa"}</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Search Input Row */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 z-10" />
              <Input
                ref={searchInputRef}
                placeholder={language === "en" ? "Search properties, locations..." : "Cari properti, lokasi..."}
                value={searchData.query}
                onChange={(e) => handleInputChange('query', e.target.value)}
                onFocus={() => setShowSuggestions(searchData.query.length >= 2)}
                className="pl-10 h-12 border-0 bg-gray-50 focus:bg-white text-base"
              />
              
              {/* Search Suggestions */}
              <SearchSuggestions
                query={debouncedQuery}
                onSelect={handleSuggestionSelect}
                isVisible={showSuggestions}
                language={language}
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant={showFilters ? "default" : "outline"}
                onClick={() => setShowFilters(!showFilters)}
                className={`h-12 px-4 relative ${showFilters ? 'bg-primary text-primary-foreground' : ''}`}
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                {language === "en" ? "Filters" : "Filter"}
                {activeFilters > 0 && (
                  <Badge variant="secondary" className="ml-2 bg-red-500 text-white">
                    {activeFilters}
                  </Badge>
                )}
              </Button>

              <Button onClick={handleSearch} className="h-12 px-6 bg-primary hover:bg-primary/90">
                <Search className="h-4 w-4 mr-2" />
                {language === "en" ? "Search" : "Cari"}
              </Button>
            </div>
          </div>

          {/* Location Selection Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            {/* State Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {language === "en" ? "State" : "Provinsi"}
              </label>
              <Select
                value={searchData.state}
                onValueChange={(value) => handleInputChange('state', value)}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder={language === "en" ? "Select state" : "Pilih provinsi"} />
                </SelectTrigger>
                <SelectContent>
                  {indonesianProvinces.map((province) => (
                    <SelectItem key={province} value={province}>
                      {province}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* City Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {language === "en" ? "City" : "Kota"}
              </label>
              <Select
                value={searchData.city}
                onValueChange={(value) => handleInputChange('city', value)}
                disabled={!searchData.state}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder={language === "en" ? "Select city" : "Pilih kota"} />
                </SelectTrigger>
                <SelectContent>
                  {availableCities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Area Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {language === "en" ? "Area" : "Area"}
              </label>
              <Select
                value={searchData.area}
                onValueChange={(value) => handleInputChange('area', value)}
                disabled={!searchData.city}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder={language === "en" ? "Select area" : "Pilih area"} />
                </SelectTrigger>
                <SelectContent>
                  {availableAreas.map((area) => (
                    <SelectItem key={area} value={area}>
                      {area}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Property Type, Bedrooms, Bathrooms Row - Modified grid for smaller bedroom/bathroom dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-6 space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Home className="h-4 w-4" />
                {language === "en" ? "Property Type" : "Tipe Properti"}
              </label>
              <Select
                value={searchData.propertyType}
                onValueChange={(value) => handleInputChange('propertyType', value)}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder={language === "en" ? "Any type" : "Semua tipe"} />
                </SelectTrigger>
                <SelectContent>
                  {propertyTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="sm:col-span-3 space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Building className="h-4 w-4" />
              </label>
              <Select
                value={searchData.bedrooms}
                onValueChange={(value) => handleInputChange('bedrooms', value)}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder={language === "en" ? "Bedrooms" : "Kamar Tidur"} />
                </SelectTrigger>
                <SelectContent>
                  {bedroomOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="sm:col-span-3 space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Bath className="h-4 w-4" />
              </label>
              <Select
                value={searchData.bathrooms}
                onValueChange={(value) => handleInputChange('bathrooms', value)}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder={language === "en" ? "Bathrooms" : "Kamar Mandi"} />
                </SelectTrigger>
                <SelectContent>
                  {bathroomOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filters Display */}
          {activeFilters > 0 && (
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t">
              {searchData.propertyType && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Home className="h-3 w-3" />
                  {propertyTypes.find(t => t.value === searchData.propertyType)?.label}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => clearFilter('propertyType')} />
                </Badge>
              )}
              {searchData.state && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {searchData.area ? `${searchData.area}, ${searchData.city}` : searchData.city ? `${searchData.city}, ${searchData.state}` : searchData.state}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => clearFilter('state')} />
                </Badge>
              )}
              {searchData.priceRange && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {priceRanges.find(p => p.value === searchData.priceRange)?.label}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => clearFilter('priceRange')} />
                </Badge>
              )}
              {searchData.bedrooms && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Building className="h-3 w-3" />
                  {searchData.bedrooms}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => clearFilter('bedrooms')} />
                </Badge>
              )}
              {searchData.bathrooms && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Bath className="h-3 w-3" />
                  {searchData.bathrooms}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => clearFilter('bathrooms')} />
                </Badge>
              )}
              {searchData.furnishing && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {furnishingOptions.find(f => f.value === searchData.furnishing)?.label}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => clearFilter('furnishing')} />
                </Badge>
              )}
              {searchData.has3D && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {language === "en" ? "3D View" : "Tampilan 3D"}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => clearFilter('has3D')} />
                </Badge>
              )}
              <Button variant="ghost" size="sm" onClick={clearAllFilters} className="h-6 text-xs">
                {language === "en" ? "Clear all" : "Hapus semua"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <Card className={`mt-4 bg-white/98 backdrop-blur-sm shadow-xl border-0 animate-fade-in ${isMobile ? 'fixed inset-x-2 top-32 z-50 max-h-[70vh] overflow-y-auto' : ''}`}>
          <CardContent className="p-4 sm:p-6">
            {isMobile && (
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">{language === "en" ? "Filters" : "Filter"}</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Price Range */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {language === "en" ? "Price Range" : "Range Harga"}
                </label>
                <Select
                  value={searchData.priceRange}
                  onValueChange={(value) => handleInputChange('priceRange', value)}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder={language === "en" ? "Any price" : "Semua harga"} />
                  </SelectTrigger>
                  <SelectContent>
                    {priceRanges.map((range) => (
                      <SelectItem key={range.value} value={range.value}>
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Furnishing */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {language === "en" ? "Furnishing" : "Perabotan"}
                </label>
                <Select
                  value={searchData.furnishing}
                  onValueChange={(value) => handleInputChange('furnishing', value)}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder={language === "en" ? "Any" : "Semua"} />
                  </SelectTrigger>
                  <SelectContent>
                    {furnishingOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="has3D"
                  checked={searchData.has3D}
                  onChange={(e) => handleInputChange('has3D', e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="has3D" className="text-sm font-medium">
                  {language === "en" ? "3D Virtual Tour Available" : "Tersedia Tur Virtual 3D"}
                </label>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={clearAllFilters} className="flex-1 sm:flex-none">
                  {language === "en" ? "Reset" : "Reset"}
                </Button>
                <Button onClick={handleSearch} className="flex-1 sm:flex-none">
                  {language === "en" ? "Apply Filters" : "Terapkan Filter"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedModernSearchPanel;
